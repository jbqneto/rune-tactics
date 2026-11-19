import * as THREE from 'three';
import type { GameEvent, GridCoord, SkillId, UnitState, UnitType } from '../shared/types';
import type { BoardRenderer } from './BoardRenderer';
import { CharacterVisualController } from './CharacterVisualController';
import { computeWorldYaw, findNearestLivingEnemy, shortestAngleDelta } from './orientation';

const ACTIVE_UNIT_OPACITY = 1.0;
const INACTIVE_UNIT_OPACITY = 0.75;

interface SkillHitTarget {
  targetId: string;
  targetHpRemaining: number;
  hpApplied: boolean;
}

interface UnitVisual {
  id: string;
  type: UnitType;
  team: 'player' | 'enemy';
  root: THREE.Group;
  bodyGroup: THREE.Group;
  proceduralGroup: THREE.Group;
  controller: CharacterVisualController;
  weaponPivot: THREE.Group;
  weaponRestRotX: number;
  baseRing: THREE.Mesh;
  contactShadow: THREE.Mesh;
  shieldAura: THREE.Mesh;
  bossEmberAura: THREE.Mesh | null;
  hitbox: THREE.Mesh;
  flashMaterials: THREE.MeshStandardMaterial[];
  unitMaterials: THREE.MeshStandardMaterial[];
  hpBarEl: HTMLDivElement;
  hpFillEl: HTMLDivElement;
  hpTextEl: HTMLSpanElement;
  shieldBadgeEl: HTMLSpanElement;
  alive: boolean;
  hp: number;
  maxHp: number;
  isGuarding: boolean;
  bossPhase?: 1 | 2;
  facingYaw: number;
  targetYaw: number;
  lastOpacity: number;
  deathClipPlayed: boolean;
}

type ActiveAnimation =
  | {
      kind: 'move';
      unitId: string;
      path: THREE.Vector3[];
      segmentIndex: number;
      segmentProgress: number;
      stepDuration: number;
    }
  | {
      kind: 'meleeAttack';
      attackerId: string;
      targetId: string;
      damage: number;
      wasGuarded: boolean;
      targetHpRemaining: number;
      hpApplied: boolean;
      origin: THREE.Vector3;
      targetPos: THREE.Vector3;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'rangedAttack';
      attackerId: string;
      targetId: string;
      damage: number;
      wasGuarded: boolean;
      targetHpRemaining: number;
      hpApplied: boolean;
      origin: THREE.Vector3;
      targetPos: THREE.Vector3;
      projectile: THREE.Mesh | null;
      color: number;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'skillVfx';
      casterId: string;
      skillId: SkillId;
      origin: THREE.Vector3;
      targetPos: THREE.Vector3;
      projectile: THREE.Mesh | null;
      vfxGroup: THREE.Group | null;
      hits: SkillHitTarget[];
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'die';
      unitId: string;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'heal';
      casterId: string;
      targetId: string;
      amount: number;
      targetHpAfter: number;
      isDarkMend?: boolean;
      hpApplied: boolean;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'guard';
      unitId: string;
      vfxGroup: THREE.Group | null;
      textShown: boolean;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'prepareAttack';
      casterId: string;
      skillName: string;
      targetCells: THREE.Vector3[];
      vfxGroup: THREE.Group | null;
      textShown: boolean;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'resolvePendingAttack';
      pendingAttackId: string;
      casterId: string;
      targetCells: THREE.Vector3[];
      vfxGroup: THREE.Group | null;
      hits: Array<{
        targetId: string;
        damage: number;
        wasGuarded: boolean;
        targetHpRemaining: number;
        hpApplied: boolean;
      }>;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'cancelAttack';
      casterId: string;
      vfxGroup: THREE.Group | null;
      elapsed: number;
      duration: number;
    }
  | {
      kind: 'bossPhase';
      unitId: string;
      vfxGroup: THREE.Group | null;
      textShown: boolean;
      elapsed: number;
      duration: number;
    };

export class UnitRenderer {
  private readonly scene: THREE.Scene;
  private readonly board: BoardRenderer;
  private readonly hpContainer: HTMLElement;
  private readonly visuals = new Map<string, UnitVisual>();
  private readonly queue: ActiveAnimation[] = [];
  private currentAnim: ActiveAnimation | null = null;
  private latestUnits: UnitState[] = [];
  private latestSelectedId: string | null = null;
  private latestActiveUnitId: string | null = null;
  private latestTurnOrder: string[] = [];
  private isPvP = false;
  private isBattleActive = false;
  private needsInitialFacing = false;
  private latestCamera: THREE.Camera | null = null;
  private animClock = 0;
  private readonly activeTurnCursor: THREE.Group;

  constructor(scene: THREE.Scene, board: BoardRenderer, hpContainer: HTMLElement) {
    this.scene = scene;
    this.board = board;
    this.hpContainer = hpContainer;
    this.activeTurnCursor = this.createActiveTurnCursor();
    this.activeTurnCursor.visible = false;
    this.scene.add(this.activeTurnCursor);
  }

  get isAnimating(): boolean {
    return this.currentAnim !== null || this.queue.length > 0;
  }

  /** Clears all unit visuals, HP bars, and active/queued animations. */
  clear(): void {
    this.cleanupActiveVfx();
    this.currentAnim = null;
    this.queue.length = 0;
    this.latestActiveUnitId = null;
    this.activeTurnCursor.visible = false;
    this.syncUnits([], null, [], null);
  }

  setPvPMode(isPvP: boolean, isBattleActive = true): void {
    this.isPvP = isPvP;
    this.isBattleActive = isBattleActive;
  }

  syncUnits(
    units: UnitState[],
    selectedUnitId: string | null,
    turnOrder?: string[],
    activeUnitId?: string | null,
    isPvP?: boolean,
    isBattleActive?: boolean
  ): void {
    if (isPvP !== undefined) {
      this.isPvP = isPvP;
    }
    if (isBattleActive !== undefined) {
      this.isBattleActive = isBattleActive;
    }
    this.latestUnits = units;
    this.latestSelectedId = selectedUnitId;
    if (activeUnitId !== undefined) {
      this.latestActiveUnitId = activeUnitId;
    }
    if (turnOrder) {
      this.latestTurnOrder = turnOrder;
    }
    const highlightActiveId =
      activeUnitId !== undefined ? activeUnitId : (this.latestActiveUnitId ?? selectedUnitId);
    const incomingIds = new Set(units.map((u) => u.id));
    for (const [id, oldVisual] of this.visuals) {
      if (!incomingIds.has(id)) {
        oldVisual.controller.dispose();
        this.disposeObjectGroup(oldVisual.root);
        oldVisual.hpBarEl.remove();
        this.visuals.delete(id);
      }
    }

    for (const unit of units) {
      let visual = this.visuals.get(unit.id);
      if (!visual) {
        visual = this.createUnitVisual(unit);
        this.visuals.set(unit.id, visual);
        this.scene.add(visual.root);
        this.hpContainer.appendChild(visual.hpBarEl);
      } else if (this.needsInitialFacing && unit.alive) {
        const yaw = this.computeInitialYaw(unit, units, this.latestTurnOrder);
        visual.facingYaw = yaw;
        visual.targetYaw = yaw;
      }

      visual.maxHp = unit.maxHp;
      visual.alive = unit.alive;
      visual.isGuarding = unit.isGuarding;
      visual.bossPhase = unit.bossPhase;
      visual.shieldAura.visible = unit.alive && unit.isGuarding;
      if (visual.bossEmberAura) {
        visual.bossEmberAura.visible = unit.alive && unit.bossPhase === 2;
      }

      if (!this.isPendingAttackTarget(unit.id)) {
        this.applyHpBar(visual, unit.hp, unit.maxHp, unit.isGuarding);
      }

      const isSelected = unit.id === selectedUnitId && unit.alive;
      this.updateBaseRing(visual, isSelected);

      if (unit.alive) {
        visual.deathClipPlayed = false;
        let targetOpacity: number;
        if (this.isPvP) {
          if (this.isBattleActive) {
            targetOpacity = unit.id === highlightActiveId ? ACTIVE_UNIT_OPACITY : INACTIVE_UNIT_OPACITY;
          } else {
            targetOpacity = ACTIVE_UNIT_OPACITY;
          }
        } else {
          targetOpacity =
            unit.team === 'enemy' || unit.id === highlightActiveId
              ? ACTIVE_UNIT_OPACITY
              : INACTIVE_UNIT_OPACITY;
        }
        this.setUnitOpacity(visual, targetOpacity);
      } else if (unit.team === 'player') {
        this.setUnitOpacity(visual, INACTIVE_UNIT_OPACITY);
      }

      if (!this.isUnitInAnimation(unit.id)) {
        const worldPos = this.board.gridToWorld(unit.pos, 0);
        visual.root.position.copy(worldPos);
        visual.root.visible = unit.alive || unit.team === 'player';
        visual.bodyGroup.scale.set(1, 1, 1);
        visual.weaponPivot.rotation.x = visual.weaponRestRotX;
        if (unit.alive) {
          visual.bodyGroup.rotation.set(0, visual.facingYaw, 0);
          visual.bodyGroup.position.set(0, 0, 0);
          visual.baseRing.visible = true;
          visual.contactShadow.visible = true;
          visual.hpBarEl.style.display = 'flex';
        } else {
          if (visual.controller.hasGlb) {
            visual.bodyGroup.rotation.set(0, visual.facingYaw, 0);
            visual.bodyGroup.position.set(0, 0, 0);
            if (!visual.deathClipPlayed) {
              visual.deathClipPlayed = true;
              visual.controller.playClip('Death_A', false, 1);
              visual.controller.update(10);
            }
          } else {
            visual.bodyGroup.rotation.set(Math.PI / 2, visual.facingYaw, 0);
            visual.bodyGroup.position.set(0, 0.22, 0);
          }
          visual.baseRing.visible = false;
          visual.contactShadow.visible = false;
          visual.hpBarEl.style.display = 'none';
        }
      }
    }
    this.needsInitialFacing = false;
  }

  enqueueEvents(events: GameEvent[]): void {
    for (const ev of events) {
      if (ev.type === 'gameReset') {
        this.cleanupActiveVfx();
        this.queue.length = 0;
        this.currentAnim = null;
        this.latestActiveUnitId = null;
        this.activeTurnCursor.visible = false;
        this.needsInitialFacing = true;
        for (const visual of this.visuals.values()) {
          visual.root.visible = true;
          visual.baseRing.visible = true;
          visual.contactShadow.visible = true;
          visual.isGuarding = false;
          visual.shieldAura.visible = false;
          visual.bossPhase = undefined;
          if (visual.bossEmberAura) {
            visual.bossEmberAura.visible = false;
          }
          visual.deathClipPlayed = false;
          visual.facingYaw = 0;
          visual.targetYaw = 0;
          visual.bodyGroup.rotation.set(0, 0, 0);
          visual.bodyGroup.scale.set(1, 1, 1);
          visual.bodyGroup.position.set(0, 0, 0);
          visual.weaponPivot.rotation.x = visual.weaponRestRotX;
          visual.controller.resetToIdle();
          this.setFlash(visual, 0);
          this.setUnitOpacity(visual, ACTIVE_UNIT_OPACITY);
        }
        continue;
      }

      if ((ev.type === 'unitMoved' || ev.type === 'moveUndone') && ev.path.length >= 2) {
        const worldPath = ev.path.map((c: GridCoord) => this.board.gridToWorld(c, 0));
        this.queue.push({
          kind: 'move',
          unitId: ev.unitId,
          path: worldPath,
          segmentIndex: 0,
          segmentProgress: 0,
          stepDuration: ev.type === 'moveUndone' ? 0.09 : 0.12,
        });
      } else if (ev.type === 'skillUsed') {
        const caster = this.visuals.get(ev.casterId);
        if (caster) {
          this.queue.push({
            kind: 'skillVfx',
            casterId: ev.casterId,
            skillId: ev.skillId,
            origin: caster.root.position.clone(),
            targetPos: this.board.gridToWorld(ev.targetCell, 0),
            projectile: null,
            vfxGroup: null,
            hits: [],
            elapsed: 0,
            duration: ev.skillId === 'arcane-burst' ? 0.62 : 0.32,
          });
        }
      } else if (ev.type === 'unitAttacked') {
        if (ev.pendingAttackId !== undefined) {
          const pendingResolve = [...this.queue]
            .reverse()
            .find(
              (a): a is Extract<ActiveAnimation, { kind: 'resolvePendingAttack' }> =>
                a.kind === 'resolvePendingAttack' && a.pendingAttackId === ev.pendingAttackId
            );
          if (pendingResolve) {
            pendingResolve.hits.push({
              targetId: ev.targetId,
              damage: ev.damage,
              wasGuarded: ev.wasGuarded ?? false,
              targetHpRemaining: ev.targetHpRemaining,
              hpApplied: false,
            });
          }
          continue;
        }
        if (ev.skillId !== undefined) {
          // Skill already has its own skillVfx: do not enqueue a second projectile.
          const pendingSkill = [...this.queue]
            .reverse()
            .find((a): a is Extract<ActiveAnimation, { kind: 'skillVfx' }> => a.kind === 'skillVfx' && a.skillId === ev.skillId);
          if (pendingSkill) {
            pendingSkill.hits.push({
              targetId: ev.targetId,
              targetHpRemaining: ev.targetHpRemaining,
              hpApplied: false,
            });
          }
          continue;
        }
        const attacker = this.visuals.get(ev.attackerId);
        const target = this.visuals.get(ev.targetId);
        if (attacker && target) {
          if (ev.isRanged) {
            const color =
              attacker.type === 'mage'
                ? 0xc084fc
                : ev.skillId === 'marked-shot'
                  ? 0x4ade80
                  : attacker.team === 'player'
                    ? 0xfacc15
                    : 0xf87171;
            this.queue.push({
              kind: 'rangedAttack',
              attackerId: ev.attackerId,
              targetId: ev.targetId,
              damage: ev.damage,
              wasGuarded: ev.wasGuarded ?? false,
              targetHpRemaining: ev.targetHpRemaining,
              hpApplied: false,
              origin: attacker.root.position.clone(),
              targetPos: target.root.position.clone(),
              projectile: null,
              color,
              elapsed: 0,
              duration: 0.34,
            });
          } else {
            this.queue.push({
              kind: 'meleeAttack',
              attackerId: ev.attackerId,
              targetId: ev.targetId,
              damage: ev.damage,
              wasGuarded: ev.wasGuarded ?? false,
              targetHpRemaining: ev.targetHpRemaining,
              hpApplied: false,
              origin: attacker.root.position.clone(),
              targetPos: target.root.position.clone(),
              elapsed: 0,
              duration: 0.34,
            });
          }
        }
      } else if (ev.type === 'unitGuarded') {
        this.queue.push({
          kind: 'guard',
          unitId: ev.unitId,
          vfxGroup: null,
          textShown: false,
          elapsed: 0,
          duration: 0.45,
        });
      } else if (ev.type === 'unitHealed') {
        const caster = this.visuals.get(ev.casterId);
        this.queue.push({
          kind: 'heal',
          casterId: ev.casterId,
          targetId: ev.targetId,
          amount: ev.amount,
          targetHpAfter: ev.targetHpAfter,
          isDarkMend: caster?.type === 'necromancer-acolyte',
          hpApplied: false,
          elapsed: 0,
          duration: 0.42,
        });
      } else if (ev.type === 'attackPrepared') {
        this.queue.push({
          kind: 'prepareAttack',
          casterId: ev.pendingAttack.casterId,
          skillName: ev.pendingAttack.skillName,
          targetCells: ev.pendingAttack.targetCells.map((c) => this.board.gridToWorld(c, 0)),
          vfxGroup: null,
          textShown: false,
          elapsed: 0,
          duration: 0.46,
        });
      } else if (ev.type === 'pendingAttackResolved') {
        this.queue.push({
          kind: 'resolvePendingAttack',
          pendingAttackId: ev.pendingAttackId,
          casterId: ev.casterId,
          targetCells: ev.targetCells.map((c) => this.board.gridToWorld(c, 0)),
          vfxGroup: null,
          hits: [],
          elapsed: 0,
          duration: 0.58,
        });
      } else if (ev.type === 'attackCancelled') {
        this.queue.push({
          kind: 'cancelAttack',
          casterId: ev.casterId,
          vfxGroup: null,
          elapsed: 0,
          duration: 0.28,
        });
      } else if (ev.type === 'bossPhaseChanged') {
        this.queue.push({
          kind: 'bossPhase',
          unitId: ev.unitId,
          vfxGroup: null,
          textShown: false,
          elapsed: 0,
          duration: 0.65,
        });
      } else if (ev.type === 'unitDied') {
        this.queue.push({
          kind: 'die',
          unitId: ev.unitId,
          elapsed: 0,
          duration: 0.32,
        });
      }
    }
  }

  update(dt: number, camera: THREE.Camera): void {
    this.latestCamera = camera;
    this.animClock += dt;

    if (!this.currentAnim && this.queue.length > 0) {
      this.currentAnim = this.queue.shift() ?? null;
      this.initAnimation(this.currentAnim);
    }

    if (this.currentAnim) {
      this.stepAnimation(this.currentAnim, dt);
    }

    const pulse = 0.5 + 0.5 * Math.sin(this.animClock * 4.2);

    const activeVisual = this.latestActiveUnitId
      ? this.visuals.get(this.latestActiveUnitId)
      : undefined;
    if (activeVisual && activeVisual.alive && activeVisual.root.visible) {
      const baseHeight = activeVisual.type === 'ashen-guardian' ? 2.25 : 1.85;
      const bob = Math.sin(this.animClock * 3.5) * 0.08;
      this.activeTurnCursor.position.set(
        activeVisual.root.position.x,
        activeVisual.root.position.y + baseHeight + bob,
        activeVisual.root.position.z
      );
      this.activeTurnCursor.rotation.y = this.animClock * 1.6;
      this.activeTurnCursor.visible = true;
    } else {
      this.activeTurnCursor.visible = false;
    }

    for (const visual of this.visuals.values()) {
      visual.controller.update(dt);
      if (visual.alive && visual.id === this.latestActiveUnitId && visual.baseRing.visible) {
        const ringScale = 1 + pulse * 0.12;
        visual.baseRing.scale.set(ringScale, 1, ringScale);
        const ringMat = visual.baseRing.material as THREE.MeshBasicMaterial;
        ringMat.opacity = 0.72 + pulse * 0.28;
      } else {
        visual.baseRing.scale.set(1, 1, 1);
      }
      if (visual.shieldAura.visible) {
        const auraScale = 1 + pulse * 0.08;
        visual.shieldAura.scale.set(auraScale, 1, auraScale);
        const auraMat = visual.shieldAura.material as THREE.MeshBasicMaterial;
        auraMat.opacity = 0.45 + pulse * 0.35;
      }
      if (visual.bossEmberAura && visual.bossEmberAura.visible) {
        const emberScale = 1 + pulse * 0.12;
        visual.bossEmberAura.scale.set(emberScale, 1, emberScale);
        const emberMat = visual.bossEmberAura.material as THREE.MeshBasicMaterial;
        emberMat.opacity = 0.4 + pulse * 0.35;
      }
      if (visual.alive && visual.bossPhase === 2 && !this.isUnitInAnimation(visual.id)) {
        for (const mat of visual.controller.getMaterials()) {
          mat.emissive.setHex(0x991b1b);
          mat.emissiveIntensity = 0.18 + pulse * 0.16;
        }
      }
      if (!visual.alive || this.isUnitInAnimation(visual.id)) continue;
      const delta = shortestAngleDelta(visual.facingYaw, visual.targetYaw);
      if (Math.abs(delta) > 0.001) {
        visual.facingYaw += delta * Math.min(1, 10 * dt);
      } else {
        visual.facingYaw = visual.targetYaw;
      }
      visual.bodyGroup.rotation.y = visual.facingYaw;
    }

    this.updateHealthBarPositions(camera);
  }

  private initAnimation(anim: ActiveAnimation | null): void {
    if (!anim) return;

    if (anim.kind === 'move') {
      const visual = this.visuals.get(anim.unitId);
      visual?.controller.playClip('Walking_A', true, 1.4);
      return;
    }

    if (anim.kind === 'die') {
      const visual = this.visuals.get(anim.unitId);
      if (visual) {
        visual.deathClipPlayed = true;
        visual.controller.playClip('Death_A', false, 1.8);
      }
      return;
    }

    if (anim.kind === 'guard') {
      const visual = this.visuals.get(anim.unitId);
      if (visual) {
        visual.controller.playClip('Block', false, 1.4);
        const vfxGroup = new THREE.Group();
        const addPulseRing = (pos: THREE.Vector3, colorHex: number, radius: number) => {
          const geo = new THREE.RingGeometry(radius * 0.72, radius, 24);
          geo.rotateX(-Math.PI / 2);
          const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const ring = new THREE.Mesh(geo, mat);
          ring.position.set(pos.x, 0.1, pos.z);
          vfxGroup.add(ring);
        };
        addPulseRing(visual.root.position, 0x38bdf8, 0.48);
        this.scene.add(vfxGroup);
        anim.vfxGroup = vfxGroup;
      }
      return;
    }

    if (anim.kind === 'prepareAttack') {
      const caster = this.visuals.get(anim.casterId);
      if (caster) {
        caster.controller.playClip('Spellcast_Shoot', false, 1.2);
      }
      const vfxGroup = new THREE.Group();
      for (const cellPos of anim.targetCells) {
        const ringGeo = new THREE.RingGeometry(0.28, 0.44, 4);
        ringGeo.rotateZ(Math.PI / 4);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(cellPos.x, 0.08, cellPos.z);
        vfxGroup.add(ring);
      }
      if (caster) {
        const auraGeo = new THREE.RingGeometry(0.4, 0.58, 24);
        auraGeo.rotateX(-Math.PI / 2);
        const auraMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.position.set(caster.root.position.x, 0.1, caster.root.position.z);
        vfxGroup.add(aura);
      }
      this.scene.add(vfxGroup);
      anim.vfxGroup = vfxGroup;
      return;
    }

    if (anim.kind === 'resolvePendingAttack') {
      const caster = this.visuals.get(anim.casterId);
      if (caster) {
        caster.controller.playClip('1H_Melee_Attack_Slice_Diagonal', false, 1.5);
      }
      const vfxGroup = new THREE.Group();
      for (const cellPos of anim.targetCells) {
        const ringGeo = new THREE.RingGeometry(0.22, 0.46, 20);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(cellPos.x, 0.09, cellPos.z);

        const burstGeo = new THREE.SphereGeometry(0.24, 10, 10);
        const burstMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.9,
        });
        const burst = new THREE.Mesh(burstGeo, burstMat);
        burst.position.set(cellPos.x, 0.32, cellPos.z);

        vfxGroup.add(ring, burst);
      }
      this.scene.add(vfxGroup);
      anim.vfxGroup = vfxGroup;
      return;
    }

    if (anim.kind === 'cancelAttack') {
      const caster = this.visuals.get(anim.casterId);
      if (caster) {
        const vfxGroup = new THREE.Group();
        const puffGeo = new THREE.RingGeometry(0.26, 0.48, 16);
        puffGeo.rotateX(-Math.PI / 2);
        const puffMat = new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const puff = new THREE.Mesh(puffGeo, puffMat);
        puff.position.set(caster.root.position.x, 0.12, caster.root.position.z);
        vfxGroup.add(puff);
        this.scene.add(vfxGroup);
        anim.vfxGroup = vfxGroup;
      }
      return;
    }

    if (anim.kind === 'bossPhase') {
      const boss = this.visuals.get(anim.unitId);
      if (boss) {
        boss.bossPhase = 2;
        if (boss.bossEmberAura) {
          boss.bossEmberAura.visible = true;
        }
        boss.controller.playClip('Spellcast_Shoot', false, 1.3);
        const vfxGroup = new THREE.Group();
        const waveGeo = new THREE.RingGeometry(0.35, 0.65, 28);
        waveGeo.rotateX(-Math.PI / 2);
        const waveMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.position.set(boss.root.position.x, 0.12, boss.root.position.z);
        vfxGroup.add(wave);
        this.scene.add(vfxGroup);
        anim.vfxGroup = vfxGroup;
      }
      return;
    }

    if (anim.kind === 'meleeAttack' || anim.kind === 'rangedAttack') {
      const attacker = this.visuals.get(anim.attackerId);
      const target = this.visuals.get(anim.targetId);
      if (attacker && target) {
        anim.origin.copy(attacker.root.position);
        anim.targetPos.copy(target.root.position);
        if (anim.kind === 'meleeAttack') {
          attacker.controller.playClip('1H_Melee_Attack_Slice_Diagonal', false, 1.8);
        } else {
          const isCaster = attacker.type === 'mage' || attacker.type === 'cultist-mage';
          attacker.controller.playClip(
            isCaster ? 'Spellcast_Shoot' : '2H_Ranged_Shoot',
            false,
            1.8
          );
        }
      }
      if (anim.kind === 'rangedAttack') {
        const projGeo = new THREE.SphereGeometry(0.11, 8, 8);
        const projMat = new THREE.MeshBasicMaterial({ color: anim.color });
        anim.projectile = new THREE.Mesh(projGeo, projMat);
        anim.projectile.position.copy(anim.origin).setY(0.65);
        this.scene.add(anim.projectile);
      }
    } else if (anim.kind === 'skillVfx') {
      const caster = this.visuals.get(anim.casterId);
      if (caster) {
        anim.origin.copy(caster.root.position);
        const clip =
          anim.skillId === 'runic-strike'
            ? '1H_Melee_Attack_Slice_Diagonal'
            : anim.skillId === 'marked-shot'
              ? '2H_Ranged_Shoot'
              : 'Spellcast_Shoot';
        caster.controller.playClip(clip, false, 1.6);
      }
      if (anim.skillId === 'arcane-burst') {
        const projGeo = new THREE.SphereGeometry(0.15, 10, 10);
        const projMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
        anim.projectile = new THREE.Mesh(projGeo, projMat);
        anim.projectile.position.copy(anim.origin).setY(0.65);
        this.scene.add(anim.projectile);
      }
      anim.vfxGroup = this.createSkillVfxGroup(anim.skillId, anim.targetPos);
      if (anim.skillId === 'arcane-burst') {
        anim.vfxGroup.visible = false;
      }
      this.scene.add(anim.vfxGroup);
    }
  }

  private createSkillVfxGroup(skillId: SkillId, targetPos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(targetPos);

    if (skillId === 'arcane-burst') {
      // Expanding circular shockwave + radial particles + central flash
      const ringGeo = new THREE.RingGeometry(0.28, 0.52, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;

      const flashGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const flashMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.9,
      });
      const flash = new THREE.Mesh(flashGeo, flashMat);
      flash.position.y = 0.45;

      group.add(ring, flash);

      const sparkGeo = new THREE.OctahedronGeometry(0.08, 0);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const sparkMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x22d3ee : 0xc084fc,
          transparent: true,
          opacity: 0.95,
        });
        const spark = new THREE.Mesh(sparkGeo.clone(), sparkMat);
        spark.position.set(Math.cos(angle) * 0.25, 0.38, Math.sin(angle) * 0.25);
        spark.userData = { radialDir: new THREE.Vector3(Math.cos(angle), 0.25, Math.sin(angle)) };
        group.add(spark);
      }
      sparkGeo.dispose();
    } else if (skillId === 'runic-strike') {
      const arcGeo = new THREE.RingGeometry(0.3, 0.55, 16);
      arcGeo.rotateX(-Math.PI / 2);
      const arcMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.position.y = 0.45;
      group.add(arc);
    } else if (skillId === 'healing-light') {
      const ringGeo = new THREE.RingGeometry(0.24, 0.46, 20);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;

      const haloGeo = new THREE.RingGeometry(0.18, 0.34, 16);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 0.48;
      group.add(ring, halo);
    } else if (skillId === 'dark-mend') {
      const ringGeo = new THREE.RingGeometry(0.24, 0.48, 20);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;

      const haloGeo = new THREE.RingGeometry(0.18, 0.36, 16);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x9333ea,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 0.46;
      group.add(ring, halo);
    } else {
      // marked-shot target reticle burst
      const reticleGeo = new THREE.RingGeometry(0.22, 0.36, 4);
      reticleGeo.rotateZ(Math.PI / 4);
      reticleGeo.rotateX(-Math.PI / 2);
      const reticleMat = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const reticle = new THREE.Mesh(reticleGeo, reticleMat);
      reticle.position.y = 0.08;
      group.add(reticle);
    }

    return group;
  }

  getUnitHitboxes(): THREE.Object3D[] {
    const result: THREE.Object3D[] = [];
    for (const visual of this.visuals.values()) {
      if (visual.alive && visual.root.visible) {
        result.push(visual.hitbox);
      }
    }
    return result;
  }

  private stepAnimation(anim: ActiveAnimation, dt: number): void {
    if (anim.kind === 'move') {
      const visual = this.visuals.get(anim.unitId);
      if (!visual) {
        this.finishCurrentAnimation();
        return;
      }

      anim.segmentProgress += dt / anim.stepDuration;
      while (anim.segmentProgress >= 1 && anim.segmentIndex < anim.path.length - 1) {
        anim.segmentProgress -= 1;
        anim.segmentIndex++;
      }

      if (anim.segmentIndex >= anim.path.length - 1) {
        visual.root.position.copy(anim.path[anim.path.length - 1]);
        visual.bodyGroup.position.y = 0;
        visual.controller.resetToIdle();

        if (visual.team === 'player') {
          const unitState = this.latestUnits.find((u) => u.id === anim.unitId);
          if (unitState) {
            const nearest = findNearestLivingEnemy(
              unitState,
              this.latestUnits,
              this.latestTurnOrder
            );
            if (nearest) {
              const enemyWorld = this.board.gridToWorld(nearest.pos, 0);
              visual.targetYaw = computeWorldYaw(visual.root.position, enemyWorld);
            }
          }
        }

        this.finishCurrentAnimation();
        return;
      }

      const from = anim.path[anim.segmentIndex];
      const to = anim.path[anim.segmentIndex + 1];
      const t = Math.min(1, anim.segmentProgress);

      visual.root.position.lerpVectors(from, to, t);
      visual.bodyGroup.position.y = Math.sin(t * Math.PI) * 0.14;

      const dx = to.x - from.x;
      const dz = to.z - from.z;
      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        const yaw = Math.atan2(dx, dz);
        visual.facingYaw = yaw;
        visual.targetYaw = yaw;
        visual.bodyGroup.rotation.y = yaw;
      }
      return;
    }

    if (anim.kind === 'skillVfx') {
      const caster = this.visuals.get(anim.casterId);
      if (caster) {
        const dx = anim.targetPos.x - anim.origin.x;
        const dz = anim.targetPos.z - anim.origin.z;
        if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
          const yaw = Math.atan2(dx, dz);
          caster.facingYaw = yaw;
          caster.targetYaw = yaw;
          caster.bodyGroup.rotation.y = yaw;
        }
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);
      const isBurst = anim.skillId === 'arcane-burst';
      const impactAt = isBurst ? 0.45 : 0.25;

      if (isBurst && progress <= impactAt) {
        if (anim.projectile) {
          const flightT = progress / impactAt;
          anim.projectile.position.lerpVectors(anim.origin, anim.targetPos, flightT);
          anim.projectile.position.y = 0.65 + Math.sin(flightT * Math.PI) * 0.35 - flightT * 0.2;
        }
      } else {
        if (anim.projectile) {
          this.disposeMesh(anim.projectile);
          anim.projectile = null;
        }
        const burstT = isBurst ? (progress - impactAt) / (1 - impactAt) : progress;
        if (anim.vfxGroup) {
          anim.vfxGroup.visible = true;
          const maxScale = isBurst ? 2.8 : 1.6;
          anim.vfxGroup.scale.setScalar(0.5 + burstT * maxScale);
          anim.vfxGroup.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              const radial = child.userData?.radialDir as THREE.Vector3 | undefined;
              if (radial) {
                child.position.set(
                  radial.x * (0.25 + burstT * 0.85),
                  0.38 + radial.y * burstT * 0.5,
                  radial.z * (0.25 + burstT * 0.85)
                );
              }
              if (child.material instanceof THREE.MeshBasicMaterial) {
                child.material.opacity = Math.max(0, 1 - burstT);
              }
            }
          });
        }

        const flashIntensity = Math.sin(Math.min(1, burstT * 1.4) * Math.PI);
        for (const hit of anim.hits) {
          const targetVisual = this.visuals.get(hit.targetId);
          if (!targetVisual) continue;
          if (!hit.hpApplied) {
            hit.hpApplied = true;
            this.applyHpBar(targetVisual, hit.targetHpRemaining, targetVisual.maxHp);
            targetVisual.controller.playClip('Hit_A', false, 1.8);
          }
          this.setFlash(targetVisual, flashIntensity);
        }
      }

      if (progress >= 1) {
        const caster = this.visuals.get(anim.casterId);
        caster?.controller.resetToIdle();
        for (const hit of anim.hits) {
          const targetVisual = this.visuals.get(hit.targetId);
          if (targetVisual) {
            this.setFlash(targetVisual, 0);
            if (targetVisual.alive) targetVisual.controller.resetToIdle();
          }
        }
        this.disposeMesh(anim.projectile);
        anim.projectile = null;
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'meleeAttack') {
      const attacker = this.visuals.get(anim.attackerId);
      const target = this.visuals.get(anim.targetId);
      if (!attacker || !target) {
        this.finishCurrentAnimation();
        return;
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      const dx = anim.targetPos.x - anim.origin.x;
      const dz = anim.targetPos.z - anim.origin.z;
      const dist = Math.hypot(dx, dz) || 1;
      const dirX = dx / dist;
      const dirZ = dz / dist;

      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        const yaw = Math.atan2(dx, dz);
        attacker.facingYaw = yaw;
        attacker.targetYaw = yaw;
        attacker.bodyGroup.rotation.y = yaw;
      }

      const lunge = progress < 0.45 ? progress / 0.45 : (1 - progress) / 0.55;
      attacker.root.position.lerpVectors(anim.origin, anim.targetPos, lunge * 0.42);

      const restRot = attacker.weaponRestRotX;
      if (progress < 0.25) {
        attacker.weaponPivot.rotation.x = restRot - (progress / 0.25) * 0.65;
      } else if (progress < 0.55) {
        attacker.weaponPivot.rotation.x = restRot - 0.65 + ((progress - 0.25) / 0.3) * 1.9;
      } else {
        attacker.weaponPivot.rotation.x = restRot + 1.25 * (1 - (progress - 0.55) / 0.45);
      }

      this.applyTargetHitReaction(anim, target, progress, dirX, dirZ, 0.42);

      if (progress >= 1) {
        attacker.root.position.copy(anim.origin);
        attacker.weaponPivot.rotation.x = restRot;
        attacker.controller.resetToIdle();
        target.bodyGroup.position.set(0, 0, 0);
        target.bodyGroup.rotation.x = 0;
        if (target.alive) target.controller.resetToIdle();
        this.setFlash(target, 0);
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'rangedAttack') {
      const attacker = this.visuals.get(anim.attackerId);
      const target = this.visuals.get(anim.targetId);
      if (!attacker || !target) {
        this.disposeMesh(anim.projectile);
        anim.projectile = null;
        this.finishCurrentAnimation();
        return;
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      const dx = anim.targetPos.x - anim.origin.x;
      const dz = anim.targetPos.z - anim.origin.z;
      const dist = Math.hypot(dx, dz) || 1;
      const dirX = dx / dist;
      const dirZ = dz / dist;

      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        const yaw = Math.atan2(dx, dz);
        attacker.facingYaw = yaw;
        attacker.targetYaw = yaw;
        attacker.bodyGroup.rotation.y = yaw;
      }

      // Projectile flight in [0..0.6]
      if (anim.projectile) {
        if (progress <= 0.6) {
          const flightT = progress / 0.6;
          anim.projectile.position.lerpVectors(anim.origin, anim.targetPos, flightT);
          anim.projectile.position.y = 0.65 + Math.sin(flightT * Math.PI) * 0.35;
        } else {
          this.disposeMesh(anim.projectile);
          anim.projectile = null;
        }
      }

      this.applyTargetHitReaction(anim, target, progress, dirX, dirZ, 0.58);

      if (progress >= 1) {
        this.disposeMesh(anim.projectile);
        anim.projectile = null;
        attacker.controller.resetToIdle();
        target.bodyGroup.position.set(0, 0, 0);
        target.bodyGroup.rotation.x = 0;
        if (target.alive) target.controller.resetToIdle();
        this.setFlash(target, 0);
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'heal') {
      const target = this.visuals.get(anim.targetId);
      if (!target) {
        this.finishCurrentAnimation();
        return;
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (!anim.hpApplied && progress >= 0.25) {
        anim.hpApplied = true;
        this.applyHpBar(target, anim.targetHpAfter, target.maxHp, target.isGuarding);
        if (anim.amount > 0) {
          this.spawnFloatingText(target.root.position, `+${anim.amount}`, 'heal');
        }
      }

      const glow = Math.sin(progress * Math.PI);
      target.bodyGroup.position.y = glow * 0.08;
      const healColor = anim.isDarkMend
        ? progress < 0.5
          ? 0x10b981
          : 0x9333ea
        : progress < 0.5
          ? 0x4ade80
          : 0xfacc15;
      this.setFlash(target, glow, healColor);

      if (progress >= 1) {
        target.bodyGroup.position.y = 0;
        this.setFlash(target, 0);
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'guard') {
      const visual = this.visuals.get(anim.unitId);
      if (!visual) {
        this.disposeObjectGroup(anim.vfxGroup);
        this.finishCurrentAnimation();
        return;
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (!anim.textShown && progress >= 0.2) {
        anim.textShown = true;
        visual.isGuarding = true;
        visual.shieldAura.visible = true;
        this.spawnFloatingText(visual.root.position, '🛡️ Defesa -50%', 'shield');
      }

      const glow = Math.sin(progress * Math.PI);
      this.setFlash(visual, glow * 0.65, 0x38bdf8);

      if (anim.vfxGroup) {
        for (const child of anim.vfxGroup.children) {
          if (child instanceof THREE.Mesh) {
            const s = 0.8 + progress * 0.75;
            child.scale.set(s, 1, s);
            (child.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.85;
          }
        }
      }

      if (progress >= 1) {
        this.setFlash(visual, 0);
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'prepareAttack') {
      const caster = this.visuals.get(anim.casterId);
      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (!anim.textShown && progress >= 0.15 && caster) {
        anim.textShown = true;
        this.spawnFloatingText(caster.root.position, `⚠ ${anim.skillName}`, 'damage');
      }

      if (caster) {
        const pulse = Math.sin(progress * Math.PI);
        this.setFlash(caster, pulse * 0.65, 0xf97316);
      }

      if (anim.vfxGroup) {
        const s = 0.85 + Math.sin(progress * Math.PI) * 0.25;
        for (const child of anim.vfxGroup.children) {
          if (child instanceof THREE.Mesh) {
            child.scale.set(s, 1, s);
            (child.material as THREE.MeshBasicMaterial).opacity = (1 - progress * 0.45) * 0.85;
          }
        }
      }

      if (progress >= 1) {
        if (caster) {
          this.setFlash(caster, 0);
          if (caster.alive) caster.controller.resetToIdle();
        }
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'resolvePendingAttack') {
      const caster = this.visuals.get(anim.casterId);
      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (caster) {
        const pulse = Math.sin(progress * Math.PI);
        this.setFlash(caster, pulse * 0.5, 0xef4444);
      }

      if (anim.vfxGroup) {
        for (const child of anim.vfxGroup.children) {
          if (child instanceof THREE.Mesh) {
            const isSphere = child.geometry instanceof THREE.SphereGeometry;
            const s = isSphere ? 0.5 + progress * 1.6 : 0.7 + progress * 1.4;
            child.scale.setScalar(s);
            (child.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progress);
          }
        }
      }

      const flashIntensity = Math.sin(Math.min(1, progress * 1.4) * Math.PI);
      for (const hit of anim.hits) {
        const target = this.visuals.get(hit.targetId);
        if (!target) continue;
        if (!hit.hpApplied && progress >= 0.28) {
          hit.hpApplied = true;
          this.applyHpBar(target, hit.targetHpRemaining, target.maxHp, target.isGuarding);
          target.controller.playClip('Hit_A', false, 1.8);
          this.spawnFloatingText(
            target.root.position,
            hit.wasGuarded ? `-${hit.damage} 🛡` : `-${hit.damage}`,
            'damage'
          );
        }
        this.setFlash(target, flashIntensity, 0xef4444);
      }

      if (progress >= 1) {
        if (caster) {
          this.setFlash(caster, 0);
          if (caster.alive) caster.controller.resetToIdle();
        }
        for (const hit of anim.hits) {
          const target = this.visuals.get(hit.targetId);
          if (target) {
            this.setFlash(target, 0);
            if (target.alive) target.controller.resetToIdle();
          }
        }
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'cancelAttack') {
      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);
      if (anim.vfxGroup) {
        for (const child of anim.vfxGroup.children) {
          if (child instanceof THREE.Mesh) {
            const s = 1 + progress * 0.5;
            child.scale.set(s, 1, s);
            (child.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.75;
          }
        }
      }
      if (progress >= 1) {
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'bossPhase') {
      const boss = this.visuals.get(anim.unitId);
      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (!anim.textShown && progress >= 0.15 && boss) {
        anim.textShown = true;
        this.spawnFloatingText(boss.root.position, '🔥 Ashen Fury!', 'damage');
      }

      if (boss) {
        const pulse = Math.sin(progress * Math.PI);
        boss.bodyGroup.scale.setScalar(1 + pulse * 0.14);
        this.setFlash(boss, pulse * 0.85, 0xf97316);
      }

      if (anim.vfxGroup) {
        for (const child of anim.vfxGroup.children) {
          if (child instanceof THREE.Mesh) {
            const s = 0.8 + progress * 2.2;
            child.scale.set(s, 1, s);
            (child.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.9;
          }
        }
      }

      if (progress >= 1) {
        if (boss) {
          boss.bodyGroup.scale.setScalar(1);
          this.setFlash(boss, 0);
          if (boss.alive) boss.controller.resetToIdle();
        }
        this.disposeObjectGroup(anim.vfxGroup);
        anim.vfxGroup = null;
        this.finishCurrentAnimation();
      }
      return;
    }

    if (anim.kind === 'die') {
      const visual = this.visuals.get(anim.unitId);
      if (!visual) {
        this.finishCurrentAnimation();
        return;
      }

      anim.elapsed += dt;
      const progress = Math.min(1, anim.elapsed / anim.duration);

      if (visual.controller.hasGlb) {
        if (visual.team === 'enemy' && progress > 0.65) {
          const shrinkT = (progress - 0.65) / 0.35;
          visual.bodyGroup.scale.setScalar(Math.max(0.05, 1 - shrinkT * 0.95));
        }
      } else {
        visual.bodyGroup.rotation.x = progress * (Math.PI / 2);
        if (visual.team === 'player') {
          visual.bodyGroup.position.y = progress * 0.22;
        } else {
          const scale = Math.max(0.05, 1 - progress * 0.85);
          visual.bodyGroup.scale.setScalar(scale);
        }
      }

      if (progress >= 1) {
        visual.root.visible = visual.team === 'player';
        if (visual.team === 'player') {
          this.setUnitOpacity(visual, INACTIVE_UNIT_OPACITY);
        }
        visual.baseRing.visible = false;
        visual.contactShadow.visible = false;
        visual.hpBarEl.style.display = 'none';
        this.finishCurrentAnimation();
      }
    }
  }

  private applyTargetHitReaction(
    anim: { targetHpRemaining: number; hpApplied: boolean; damage?: number; wasGuarded?: boolean },
    target: UnitVisual,
    progress: number,
    dirX: number,
    dirZ: number,
    impactStart: number
  ): void {
    if (progress < impactStart) return;

    if (!anim.hpApplied) {
      anim.hpApplied = true;
      this.applyHpBar(target, anim.targetHpRemaining, target.maxHp, target.isGuarding);
      if (anim.wasGuarded) {
        target.controller.playClip('Block_Hit', false, 1.5);
        if (anim.damage !== undefined && anim.damage > 0) {
          this.spawnFloatingText(target.root.position, `-${anim.damage} (🛡️ -50%)`, 'damage');
        }
      } else {
        target.controller.playClip('Hit_A', false, 1.8);
        if (anim.damage !== undefined && anim.damage > 0) {
          this.spawnFloatingText(target.root.position, `-${anim.damage}`, 'damage');
        }
      }
    }

    const span = 1 - impactStart;
    const localT = Math.min(1, (progress - impactStart) / (span * 0.9));
    if (localT < 1) {
      const hitT = Math.sin(localT * Math.PI);
      target.bodyGroup.position.set(dirX * hitT * 0.16, hitT * 0.06, dirZ * hitT * 0.16);
      target.bodyGroup.rotation.x = -hitT * 0.25;
      this.setFlash(target, hitT);
    } else {
      target.bodyGroup.position.set(0, 0, 0);
      target.bodyGroup.rotation.x = 0;
      this.setFlash(target, 0);
    }
  }

  private finishCurrentAnimation(): void {
    this.currentAnim = null;
    if (this.queue.length === 0) {
      this.syncUnits(this.latestUnits, this.latestSelectedId);
    }
  }

  private cleanupActiveVfx(): void {
    if (this.currentAnim?.kind === 'rangedAttack') {
      this.disposeMesh(this.currentAnim.projectile);
    } else if (this.currentAnim?.kind === 'skillVfx') {
      this.disposeMesh(this.currentAnim.projectile);
      this.disposeObjectGroup(this.currentAnim.vfxGroup);
    } else if (this.currentAnim?.kind === 'guard') {
      this.disposeObjectGroup(this.currentAnim.vfxGroup);
    }
  }

  private disposeMesh(mesh: THREE.Mesh | null): void {
    if (!mesh) return;
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m) => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }

  private disposeObjectGroup(group: THREE.Group | null): void {
    if (!group) return;
    this.scene.remove(group);
    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  private isUnitInAnimation(unitId: string): boolean {
    const check = (a: ActiveAnimation | null): boolean => {
      if (!a) return false;
      if (a.kind === 'move' || a.kind === 'die' || a.kind === 'guard' || a.kind === 'bossPhase') {
        return a.unitId === unitId;
      }
      if (a.kind === 'skillVfx' || a.kind === 'prepareAttack' || a.kind === 'cancelAttack') {
        return a.casterId === unitId;
      }
      if (a.kind === 'resolvePendingAttack') {
        return a.casterId === unitId || a.hits.some((h) => h.targetId === unitId);
      }
      if (a.kind === 'heal') return a.casterId === unitId || a.targetId === unitId;
      return a.attackerId === unitId || a.targetId === unitId;
    };
    return check(this.currentAnim) || this.queue.some(check);
  }

  private isPendingAttackTarget(unitId: string): boolean {
    const check = (a: ActiveAnimation | null): boolean => {
      if (!a) return false;
      if (a.kind === 'skillVfx' || a.kind === 'resolvePendingAttack') {
        return a.hits.some((h) => h.targetId === unitId && !h.hpApplied);
      }
      return (
        (a.kind === 'meleeAttack' || a.kind === 'rangedAttack' || a.kind === 'heal') &&
        a.targetId === unitId &&
        !a.hpApplied
      );
    };
    return check(this.currentAnim) || this.queue.some(check);
  }

  private applyHpBar(visual: UnitVisual, hp: number, maxHp: number, isGuarding = visual.isGuarding): void {
    visual.hp = hp;
    visual.isGuarding = isGuarding;
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    visual.hpFillEl.style.width = `${pct}%`;
    visual.hpTextEl.textContent = `${hp}/${maxHp}`;
    if (isGuarding) {
      visual.shieldBadgeEl.textContent = '🛡 -50%';
      visual.shieldBadgeEl.classList.remove('hidden');
    } else {
      visual.shieldBadgeEl.textContent = '';
      visual.shieldBadgeEl.classList.add('hidden');
    }
  }

  private spawnFloatingText(
    worldPos: THREE.Vector3,
    text: string,
    variant: 'damage' | 'heal' | 'shield'
  ): void {
    if (!this.latestCamera) return;
    const temp = worldPos.clone();
    temp.y += 1.45;
    temp.project(this.latestCamera);
    if (temp.z > 1) return;

    const sx = (temp.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-temp.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.createElement('div');
    el.className = `floating-combat-text floating-combat-text--${variant}`;
    el.textContent = text;
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
    el.addEventListener('animationend', () => el.remove(), { once: true });
    this.hpContainer.appendChild(el);
    window.setTimeout(() => {
      if (el.isConnected) el.remove();
    }, 1100);
  }

  private setUnitOpacity(visual: UnitVisual, opacity: number): void {
    visual.lastOpacity = opacity;
    const isTransparent = opacity < 1.0;
    for (const mat of visual.controller.getMaterials()) {
      mat.opacity = opacity;
      mat.transparent = isTransparent;
      mat.depthWrite = !isTransparent;
      mat.needsUpdate = true;
    }
  }

  private setFlash(visual: UnitVisual, intensity: number, colorHex = 0xffffff): void {
    const keepBossEmber = intensity <= 0 && visual.alive && visual.bossPhase === 2;
    for (const mat of visual.controller.getMaterials()) {
      if (keepBossEmber) {
        mat.emissive.setHex(0x991b1b);
        mat.emissiveIntensity = 0.22;
      } else {
        mat.emissive.setHex(intensity > 0 ? colorHex : 0x000000);
        mat.emissiveIntensity = intensity * 0.75;
      }
    }
  }

  private updateBaseRing(visual: UnitVisual, isSelected: boolean): void {
    const mat = visual.baseRing.material as THREE.MeshBasicMaterial;
    if (visual.team === 'player') {
      mat.color.setHex(isSelected ? 0xfacc15 : 0x3b82f6);
      mat.opacity = isSelected ? 0.95 : 0.65;
    } else {
      mat.color.setHex(0xef4444);
      mat.opacity = 0.75;
    }
  }

  private updateHealthBarPositions(camera: THREE.Camera): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const temp = new THREE.Vector3();

    for (const visual of this.visuals.values()) {
      if (!visual.root.visible || (!visual.alive && !this.isUnitInAnimation(visual.id))) {
        visual.hpBarEl.style.display = 'none';
        continue;
      }

      temp.copy(visual.root.position);
      temp.y += visual.type === 'armored-skeleton' ? 1.5 : 1.28;
      temp.project(camera);

      if (temp.z > 1) {
        visual.hpBarEl.style.display = 'none';
        continue;
      }

      const sx = (temp.x * 0.5 + 0.5) * width;
      const sy = (-temp.y * 0.5 + 0.5) * height;
      visual.hpBarEl.style.display = 'flex';
      visual.hpBarEl.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
    }
  }

  private createActiveTurnCursor(): THREE.Group {
    const group = new THREE.Group();
    group.raycast = () => {};

    const chevronGeo = new THREE.ConeGeometry(0.14, 0.26, 4);
    chevronGeo.rotateX(Math.PI);
    const chevronMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.65,
    });
    const chevron = new THREE.Mesh(chevronGeo, chevronMat);
    chevron.castShadow = false;
    chevron.receiveShadow = false;
    chevron.raycast = () => {};
    group.add(chevron);

    const haloGeo = new THREE.RingGeometry(0.18, 0.23, 24);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.08;
    halo.castShadow = false;
    halo.receiveShadow = false;
    halo.raycast = () => {};
    group.add(halo);

    return group;
  }

  private createUnitVisual(unit: UnitState): UnitVisual {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const proceduralGroup = new THREE.Group();
    bodyGroup.add(proceduralGroup);
    root.add(bodyGroup);

    const flashMaterials: THREE.MeshStandardMaterial[] = [];

    const ringGeo = new THREE.RingGeometry(0.32, 0.42, 4);
    ringGeo.rotateZ(Math.PI / 4);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: unit.team === 'player' ? 0x3b82f6 : 0xef4444,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const baseRing = new THREE.Mesh(ringGeo, ringMat);
    baseRing.position.y = 0.024;
    root.add(baseRing);

    const shadowGeo = new THREE.CircleGeometry(0.36, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.position.y = 0.012;
    contactShadow.raycast = () => {};
    contactShadow.visible = unit.alive;
    root.add(contactShadow);

    const shieldGeo = new THREE.RingGeometry(0.41, 0.49, 24);
    shieldGeo.rotateX(-Math.PI / 2);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shieldAura = new THREE.Mesh(shieldGeo, shieldMat);
    shieldAura.position.y = 0.036;
    shieldAura.visible = unit.isGuarding;
    root.add(shieldAura);

    let bossEmberAura: THREE.Mesh | null = null;
    if (unit.type === 'ashen-guardian') {
      const emberGeo = new THREE.RingGeometry(0.45, 0.56, 24);
      emberGeo.rotateX(-Math.PI / 2);
      const emberMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      bossEmberAura = new THREE.Mesh(emberGeo, emberMat);
      bossEmberAura.position.y = 0.042;
      bossEmberAura.visible = unit.alive && unit.bossPhase === 2;
      root.add(bossEmberAura);
    }

    const weaponPivot = this.buildModelByType(unit.type, proceduralGroup, flashMaterials);
    const weaponRestRotX = weaponPivot.rotation.x;

    const isBoss = unit.type === 'ashen-guardian';
    const hitboxGeo = isBoss
      ? new THREE.BoxGeometry(0.85, 1.55, 0.85)
      : new THREE.BoxGeometry(0.75, 1.25, 0.75);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.position.y = isBoss ? 0.78 : 0.62;
    hitbox.userData = { unitId: unit.id };
    root.add(hitbox);

    const hpBarEl = document.createElement('div');
    hpBarEl.className = `unit-hp-bar unit-hp-bar--${unit.team}`;

    const track = document.createElement('div');
    track.className = 'unit-hp-track';

    const hpFillEl = document.createElement('div');
    hpFillEl.className = 'unit-hp-fill';
    track.appendChild(hpFillEl);

    const hpTextEl = document.createElement('span');
    hpTextEl.className = 'unit-hp-text';

    const shieldBadgeEl = document.createElement('span');
    shieldBadgeEl.className = 'unit-shield-badge hidden';

    hpBarEl.appendChild(track);
    hpBarEl.appendChild(hpTextEl);
    hpBarEl.appendChild(shieldBadgeEl);

    const unitMaterials: THREE.MeshStandardMaterial[] = [];
    const seenMaterials = new Set<THREE.Material>();
    proceduralGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
        if (!seenMaterials.has(obj.material)) {
          seenMaterials.add(obj.material);
          unitMaterials.push(obj.material);
        }
      }
    });

    let visual!: UnitVisual;
    const controller = new CharacterVisualController(unit.type, bodyGroup, proceduralGroup, () => {
      if (!visual) return;
      this.setUnitOpacity(visual, visual.lastOpacity);
      if (!visual.alive && visual.team === 'player') {
        visual.bodyGroup.rotation.set(0, visual.facingYaw, 0);
        visual.bodyGroup.position.set(0, 0, 0);
        visual.deathClipPlayed = true;
        visual.controller.playClip('Death_A', false, 1);
        visual.controller.update(10);
      }
    });

    const initialYaw = this.computeInitialYaw(unit, this.latestUnits, this.latestTurnOrder);
    bodyGroup.rotation.y = initialYaw;

    visual = {
      id: unit.id,
      type: unit.type,
      team: unit.team,
      root,
      bodyGroup,
      proceduralGroup,
      controller,
      weaponPivot,
      weaponRestRotX,
      baseRing,
      contactShadow,
      shieldAura,
      bossEmberAura,
      hitbox,
      flashMaterials,
      unitMaterials,
      hpBarEl,
      hpFillEl,
      hpTextEl,
      shieldBadgeEl,
      alive: unit.alive,
      hp: unit.hp,
      maxHp: unit.maxHp,
      isGuarding: unit.isGuarding,
      bossPhase: unit.bossPhase,
      facingYaw: initialYaw,
      targetYaw: initialYaw,
      lastOpacity: ACTIVE_UNIT_OPACITY,
      deathClipPlayed: false,
    };
    return visual;
  }

  private computeInitialYaw(
    unit: UnitState,
    units: readonly UnitState[],
    turnOrder?: readonly string[]
  ): number {
    let opponent: UnitState | null = null;

    if (unit.team === 'player') {
      opponent = findNearestLivingEnemy(unit, units, turnOrder);
    } else {
      const orderIndex = turnOrder
        ? new Map<string, number>(turnOrder.map((id, idx) => [id, idx]))
        : null;
      let bestDist = Infinity;
      let bestOrder = Infinity;
      for (let i = 0; i < units.length; i++) {
        const candidate = units[i];
        if (candidate.team !== 'player' || !candidate.alive) continue;
        const dist =
          Math.abs(candidate.pos.x - unit.pos.x) +
          Math.abs(candidate.pos.y - unit.pos.y);
        const order = orderIndex ? (orderIndex.get(candidate.id) ?? Infinity) : i;
        if (dist < bestDist || (dist === bestDist && order < bestOrder)) {
          opponent = candidate;
          bestDist = dist;
          bestOrder = order;
        }
      }
    }

    if (!opponent) return 0;
    const fromWorld = this.board.gridToWorld(unit.pos, 0);
    const toWorld = this.board.gridToWorld(opponent.pos, 0);
    return computeWorldYaw(fromWorld, toWorld);
  }

  private buildModelByType(
    type: UnitType,
    bodyGroup: THREE.Group,
    flashMaterials: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    switch (type) {
      case 'knight':
        return this.buildKnight(bodyGroup, flashMaterials);
      case 'archer':
        return this.buildArcher(bodyGroup, flashMaterials);
      case 'mage':
        return this.buildMage(bodyGroup, flashMaterials);
      case 'cleric':
        return this.buildCleric(bodyGroup, flashMaterials);
      case 'melee-skeleton':
        return this.buildMeleeSkeleton(bodyGroup, flashMaterials);
      case 'skeleton-archer':
        return this.buildSkeletonArcher(bodyGroup, flashMaterials);
      case 'goblin-scout':
        return this.buildGoblinScout(bodyGroup, flashMaterials);
      case 'goblin-stalker':
        return this.buildGoblinStalker(bodyGroup, flashMaterials);
      case 'armored-skeleton':
        return this.buildArmoredSkeleton(bodyGroup, flashMaterials);
      case 'skeleton-shieldbearer':
        return this.buildSkeletonShieldbearer(bodyGroup, flashMaterials);
      case 'ashen-guardian':
        return this.buildAshenGuardian(bodyGroup, flashMaterials);
      case 'cultist-mage':
        return this.buildCultistMage(bodyGroup, flashMaterials);
      case 'necromancer-acolyte':
        return this.buildNecromancerAcolyte(bodyGroup, flashMaterials);
    }
  }

  private buildKnight(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const steel = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4, metalness: 0.45 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.6 });
    const visor = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    flash.push(steel, blue, gold);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.14, 0.24, 0.16);
    const lLeg = new THREE.Mesh(legGeo, steel);
    lLeg.position.set(-0.1, 0.12, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, steel);
    rLeg.position.set(0.1, 0.12, 0);
    rLeg.castShadow = true;

    // Torso & Cape
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.26), steel);
    torso.position.set(0, 0.43, 0);
    torso.castShadow = true;
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.06), blue);
    cape.position.set(0, 0.4, -0.15);
    cape.castShadow = true;

    // Helmet
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.3), steel);
    helm.position.set(0, 0.78, 0);
    helm.castShadow = true;
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), visor);
    slit.position.set(0, 0.78, 0.15);
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.24), blue);
    crest.position.set(0, 0.96, 0);

    // Shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.3), blue);
    shield.position.set(-0.27, 0.44, 0.06);
    shield.castShadow = true;
    const shieldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.14), gold);
    shieldTrim.position.set(-0.27, 0.44, 0.06);

    // Sword
    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.27, 0.44, 0.08);
    weaponPivot.rotation.x = Math.PI / 5;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.09), steel);
    blade.position.y = 0.24;
    blade.castShadow = true;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.12), gold);
    guard.position.y = 0.03;
    weaponPivot.add(blade, guard);

    bodyGroup.add(lLeg, rLeg, torso, cape, helm, slit, crest, shield, shieldTrim, weaponPivot);
    return weaponPivot;
  }

  private buildArcher(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const green = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });
    const leather = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.7 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
    flash.push(green, leather, wood);

    const legGeo = new THREE.BoxGeometry(0.12, 0.24, 0.13);
    const lLeg = new THREE.Mesh(legGeo, leather);
    lLeg.position.set(-0.09, 0.12, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, leather);
    rLeg.position.set(0.09, 0.12, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.2), green);
    torso.position.set(0, 0.42, 0);
    torso.castShadow = true;

    // Quiver on back
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.34, 6), leather);
    quiver.position.set(-0.08, 0.48, -0.14);
    quiver.rotation.z = -0.25;

    // Head + Green Hood
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), skin);
    head.position.set(0, 0.73, 0.02);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.28), green);
    hood.position.set(0, 0.76, -0.02);
    hood.castShadow = true;

    // Bow
    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.22, 0.46, 0.14);
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 12, Math.PI), wood);
    bowArc.rotation.z = -Math.PI / 2;
    bowArc.castShadow = true;
    weaponPivot.add(bowArc);

    bodyGroup.add(lLeg, rLeg, torso, quiver, head, hood, weaponPivot);
    return weaponPivot;
  }

  private buildMage(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const purple = new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.6 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.55 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x5c3a1b, roughness: 0.75 });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xa855f7,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    flash.push(purple, gold);

    // Robe skirt
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.58, 8), purple);
    robe.position.set(0, 0.29, 0);
    robe.castShadow = true;

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.3), gold);
    sash.position.set(0, 0.34, 0.02);

    // Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), purple);
    hood.position.set(0, 0.74, 0);
    hood.castShadow = true;
    const faceShadow = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b })
    );
    faceShadow.position.set(0, 0.73, 0.14);

    // Staff with glowing crystal
    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.24, 0.42, 0.1);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.9, 6), wood);
    staff.position.y = 0.25;
    staff.castShadow = true;
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), crystalMat);
    crystal.position.y = 0.75;
    weaponPivot.add(staff, crystal);

    bodyGroup.add(robe, sash, hood, faceShadow, weaponPivot);
    return weaponPivot;
  }

  private buildMeleeSkeleton(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const bone = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.65 });
    const iron = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.5 });
    const red = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    const eye = new THREE.MeshStandardMaterial({ color: 0x1e0909, roughness: 0.9 });
    flash.push(bone, iron, red);

    const legGeo = new THREE.BoxGeometry(0.1, 0.26, 0.1);
    const lLeg = new THREE.Mesh(legGeo, bone);
    lLeg.position.set(-0.09, 0.13, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, bone);
    rLeg.position.set(0.09, 0.13, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.18), bone);
    torso.position.set(0, 0.43, 0);
    torso.castShadow = true;

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.2), red);
    sash.position.set(0, 0.3, 0);

    const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.2), iron);
    pauldron.position.set(-0.18, 0.54, 0);
    pauldron.castShadow = true;

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), bone);
    skull.position.set(0, 0.75, 0);
    skull.castShadow = true;

    const eyeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.03);
    const lEye = new THREE.Mesh(eyeGeo, eye);
    lEye.position.set(-0.06, 0.76, 0.13);
    const rEye = new THREE.Mesh(eyeGeo, eye);
    rEye.position.set(0.06, 0.76, 0.13);

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.22, 0.42, 0.08);
    weaponPivot.rotation.x = Math.PI / 4;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.08), iron);
    blade.position.y = 0.22;
    blade.castShadow = true;
    weaponPivot.add(blade);

    bodyGroup.add(lLeg, rLeg, torso, sash, pauldron, skull, lEye, rEye, weaponPivot);
    return weaponPivot;
  }

  private buildSkeletonArcher(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const bone = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.65 });
    const redHood = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    flash.push(bone, redHood, wood);

    const legGeo = new THREE.BoxGeometry(0.09, 0.26, 0.09);
    const lLeg = new THREE.Mesh(legGeo, bone);
    lLeg.position.set(-0.08, 0.13, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, bone);
    rLeg.position.set(0.08, 0.13, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.16), bone);
    torso.position.set(0, 0.43, 0);
    torso.castShadow = true;

    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 6), wood);
    quiver.position.set(-0.08, 0.48, -0.12);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), redHood);
    hood.position.set(0, 0.75, -0.01);
    hood.castShadow = true;
    const skullFace = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.06), bone);
    skullFace.position.set(0, 0.73, 0.12);

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.2, 0.45, 0.12);
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.028, 6, 12, Math.PI), wood);
    bowArc.rotation.z = -Math.PI / 2;
    bowArc.castShadow = true;
    weaponPivot.add(bowArc);

    bodyGroup.add(lLeg, rLeg, torso, quiver, hood, skullFace, weaponPivot);
    return weaponPivot;
  }

  private buildArmoredSkeleton(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const darkArmor = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.55 });
    const bone = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.65 });
    const redCape = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4, metalness: 0.3 });
    flash.push(darkArmor, bone, redCape);

    bodyGroup.scale.setScalar(1.18);

    const legGeo = new THREE.BoxGeometry(0.14, 0.24, 0.15);
    const lLeg = new THREE.Mesh(legGeo, darkArmor);
    lLeg.position.set(-0.11, 0.12, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, darkArmor);
    rLeg.position.set(0.11, 0.12, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.26), darkArmor);
    torso.position.set(0, 0.44, 0);
    torso.castShadow = true;

    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.06), redCape);
    cape.position.set(0, 0.42, -0.16);
    cape.castShadow = true;

    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.28), darkArmor);
    helm.position.set(0, 0.78, 0);
    helm.castShadow = true;

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.05, 0.2, 5);
    const lHorn = new THREE.Mesh(hornGeo, hornMat);
    lHorn.position.set(-0.18, 0.9, 0);
    lHorn.rotation.z = 0.5;
    const rHorn = new THREE.Mesh(hornGeo, hornMat);
    rHorn.position.set(0.18, 0.9, 0);
    rHorn.rotation.z = -0.5;

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.38, 0.3), darkArmor);
    shield.position.set(-0.28, 0.44, 0.06);
    shield.castShadow = true;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.28, 0.44, 0.08);
    weaponPivot.rotation.x = Math.PI / 5;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.07), darkArmor);
    shaft.position.y = 0.24;
    shaft.castShadow = true;
    const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.22), bone);
    axeHead.position.set(0, 0.42, 0.08);
    weaponPivot.add(shaft, axeHead);

    bodyGroup.add(lLeg, rLeg, torso, cape, helm, lHorn, rHorn, shield, weaponPivot);
    return weaponPivot;
  }

  private buildCleric(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const teal = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.65 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.6 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.75 });
    flash.push(white, teal, gold, skin);

    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.62, 8), white);
    robe.position.y = 0.31;
    robe.castShadow = true;

    const stole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.34), teal);
    stole.position.y = 0.4;
    stole.castShadow = true;

    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.26), gold);
    shoulders.position.y = 0.6;
    shoulders.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), skin);
    head.position.y = 0.78;
    head.castShadow = true;

    const circlet = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8), gold);
    circlet.position.y = 0.88;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.27, 0.44, 0.08);
    weaponPivot.rotation.x = Math.PI / 6;

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.76, 6), teal);
    shaft.position.y = 0.32;
    shaft.castShadow = true;

    const maceHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), gold);
    maceHead.position.y = 0.74;
    maceHead.castShadow = true;
    weaponPivot.add(shaft, maceHead);

    bodyGroup.add(robe, stole, shoulders, head, circlet, weaponPivot);
    return weaponPivot;
  }

  private buildGoblinScout(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const moss = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });
    const leather = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.55 });
    flash.push(moss, leather, bladeMat);

    const legGeo = new THREE.BoxGeometry(0.1, 0.22, 0.1);
    const lLeg = new THREE.Mesh(legGeo, moss);
    lLeg.position.set(-0.08, 0.11, 0);
    const rLeg = new THREE.Mesh(legGeo, moss);
    rLeg.position.set(0.08, 0.11, 0);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.2), leather);
    torso.position.y = 0.36;
    torso.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), moss);
    head.position.y = 0.6;
    head.castShadow = true;

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 6), leather);
    hood.position.set(0, 0.72, -0.02);
    hood.rotation.x = -0.2;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.2, 0.34, 0.1);
    weaponPivot.rotation.x = Math.PI / 4;

    const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.07), bladeMat);
    dagger.position.y = 0.14;
    dagger.castShadow = true;
    weaponPivot.add(dagger);

    bodyGroup.add(lLeg, rLeg, torso, head, hood, weaponPivot);
    return weaponPivot;
  }

  private buildCultistMage(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const darkBurgundy = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.85 });
    const crimsonTrim = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.7 });
    const staffWood = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
    const redCrystal = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    flash.push(darkBurgundy, crimsonTrim, staffWood, redCrystal);

    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.68, 8), darkBurgundy);
    robe.position.y = 0.34;
    robe.castShadow = true;

    const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.16, 8), crimsonTrim);
    mantle.position.y = 0.58;
    mantle.castShadow = true;

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.3, 6), darkBurgundy);
    hood.position.y = 0.79;
    hood.castShadow = true;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.26, 0.42, 0.08);
    weaponPivot.rotation.x = Math.PI / 8;

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.82, 6), staffWood);
    staff.position.y = 0.34;
    staff.castShadow = true;

    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), redCrystal);
    crystal.position.y = 0.8;
    weaponPivot.add(staff, crystal);

    bodyGroup.add(robe, mantle, hood, weaponPivot);
    return weaponPivot;
  }

  private buildGoblinStalker(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const darkMoss = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.8 });
    const cloakMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.88 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.6 });
    flash.push(darkMoss, cloakMat, bladeMat);

    bodyGroup.scale.setScalar(0.95);

    const legGeo = new THREE.BoxGeometry(0.1, 0.22, 0.1);
    const lLeg = new THREE.Mesh(legGeo, darkMoss);
    lLeg.position.set(-0.08, 0.11, 0);
    const rLeg = new THREE.Mesh(legGeo, darkMoss);
    rLeg.position.set(0.08, 0.11, 0);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.2), cloakMat);
    torso.position.y = 0.36;
    torso.castShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), darkMoss);
    head.position.y = 0.6;
    head.castShadow = true;

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.28, 6), cloakMat);
    hood.position.set(0, 0.74, -0.02);
    hood.rotation.x = -0.25;
    hood.castShadow = true;

    const offhandDagger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.06), bladeMat);
    offhandDagger.position.set(-0.2, 0.36, 0.12);
    offhandDagger.rotation.x = Math.PI / 3;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.2, 0.34, 0.1);
    weaponPivot.rotation.x = Math.PI / 4;
    const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.07), bladeMat);
    dagger.position.y = 0.16;
    dagger.castShadow = true;
    weaponPivot.add(dagger);

    bodyGroup.add(lLeg, rLeg, torso, head, hood, offhandDagger, weaponPivot);
    return weaponPivot;
  }

  private buildSkeletonShieldbearer(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const slateArmor = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.55 });
    const steelTrim = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.65 });
    const bone = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.65 });
    flash.push(slateArmor, steelTrim, bone);

    bodyGroup.scale.setScalar(1.06);

    const legGeo = new THREE.BoxGeometry(0.12, 0.24, 0.13);
    const lLeg = new THREE.Mesh(legGeo, slateArmor);
    lLeg.position.set(-0.1, 0.12, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, slateArmor);
    rLeg.position.set(0.1, 0.12, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.22), slateArmor);
    torso.position.y = 0.43;
    torso.castShadow = true;

    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.24), slateArmor);
    helm.position.y = 0.76;
    helm.castShadow = true;

    // Prominent front shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.54, 0.42), slateArmor);
    shield.position.set(-0.24, 0.42, 0.14);
    shield.castShadow = true;
    const shieldBoss = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.16), steelTrim);
    shieldBoss.position.set(-0.24, 0.42, 0.14);

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.24, 0.42, 0.08);
    weaponPivot.rotation.x = Math.PI / 5;
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.08), steelTrim);
    sword.position.y = 0.23;
    sword.castShadow = true;
    weaponPivot.add(sword);

    bodyGroup.add(lLeg, rLeg, torso, helm, shield, shieldBoss, weaponPivot);
    return weaponPivot;
  }

  private buildNecromancerAcolyte(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const darkTeal = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 });
    const emeraldTrim = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    const staffWood = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
    const emeraldCrystal = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    });
    flash.push(darkTeal, emeraldTrim, staffWood, emeraldCrystal);

    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.66, 8), darkTeal);
    robe.position.y = 0.33;
    robe.castShadow = true;

    const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 0.16, 8), emeraldTrim);
    mantle.position.y = 0.56;
    mantle.castShadow = true;

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.28, 6), darkTeal);
    hood.position.y = 0.77;
    hood.castShadow = true;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.25, 0.42, 0.08);
    weaponPivot.rotation.x = Math.PI / 8;

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), staffWood);
    staff.position.y = 0.33;
    staff.castShadow = true;

    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), emeraldCrystal);
    crystal.position.y = 0.78;
    weaponPivot.add(staff, crystal);

    bodyGroup.add(robe, mantle, hood, weaponPivot);
    return weaponPivot;
  }

  private buildAshenGuardian(
    bodyGroup: THREE.Group,
    flash: THREE.MeshStandardMaterial[]
  ): THREE.Group {
    const charcoalArmor = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45, metalness: 0.6 });
    const crimsonArmor = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5, metalness: 0.45 });
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    flash.push(charcoalArmor, crimsonArmor, emberMat);

    // ~1.4x larger than standard units
    bodyGroup.scale.setScalar(1.4);

    const legGeo = new THREE.BoxGeometry(0.15, 0.26, 0.16);
    const lLeg = new THREE.Mesh(legGeo, charcoalArmor);
    lLeg.position.set(-0.12, 0.13, 0);
    lLeg.castShadow = true;
    const rLeg = new THREE.Mesh(legGeo, charcoalArmor);
    rLeg.position.set(0.12, 0.13, 0);
    rLeg.castShadow = true;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.28), charcoalArmor);
    torso.position.y = 0.48;
    torso.castShadow = true;

    const chestEmber = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), emberMat);
    chestEmber.position.set(0, 0.5, 0.15);

    const lPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.26), crimsonArmor);
    lPauldron.position.set(-0.3, 0.66, 0);
    lPauldron.castShadow = true;
    const rPauldron = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.26), crimsonArmor);
    rPauldron.position.set(0.3, 0.66, 0);
    rPauldron.castShadow = true;

    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.28), charcoalArmor);
    helm.position.y = 0.84;
    helm.castShadow = true;

    // Coroa de brasas
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 6), emberMat);
    crown.position.y = 1.04;

    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.32, 0.48, 0.1);
    weaponPivot.rotation.x = Math.PI / 5;
    const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.68, 0.12), crimsonArmor);
    greatsword.position.y = 0.34;
    greatsword.castShadow = true;
    const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 0.04), emberMat);
    bladeEdge.position.set(0, 0.42, 0.07);
    weaponPivot.add(greatsword, bladeEdge);

    bodyGroup.add(
      lLeg,
      rLeg,
      torso,
      chestEmber,
      lPauldron,
      rPauldron,
      helm,
      crown,
      weaponPivot
    );
    return weaponPivot;
  }
}
