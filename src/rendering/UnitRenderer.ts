import * as THREE from 'three';
import type { GameEvent, GridCoord, SkillId, UnitState, UnitType } from '../shared/types';
import type { BoardRenderer } from './BoardRenderer';
import { computeWorldYaw, findNearestLivingEnemy, shortestAngleDelta } from './orientation';

interface UnitVisual {
  id: string;
  type: UnitType;
  team: 'player' | 'enemy';
  root: THREE.Group;
  bodyGroup: THREE.Group;
  weaponPivot: THREE.Group;
  weaponRestRotX: number;
  baseRing: THREE.Mesh;
  hitbox: THREE.Mesh;
  flashMaterials: THREE.MeshStandardMaterial[];
  hpBarEl: HTMLDivElement;
  hpFillEl: HTMLDivElement;
  hpTextEl: HTMLSpanElement;
  alive: boolean;
  hp: number;
  maxHp: number;
  facingYaw: number;
  targetYaw: number;
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
      vfxGroup: THREE.Group | null;
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
      targetHpAfter: number;
      hpApplied: boolean;
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
  private latestTurnOrder: string[] = [];

  constructor(scene: THREE.Scene, board: BoardRenderer, hpContainer: HTMLElement) {
    this.scene = scene;
    this.board = board;
    this.hpContainer = hpContainer;
  }

  get isAnimating(): boolean {
    return this.currentAnim !== null || this.queue.length > 0;
  }

  syncUnits(units: UnitState[], selectedUnitId: string | null, turnOrder?: string[]): void {
    this.latestUnits = units;
    this.latestSelectedId = selectedUnitId;
    if (turnOrder) {
      this.latestTurnOrder = turnOrder;
    }

    for (const unit of units) {
      let visual = this.visuals.get(unit.id);
      if (!visual) {
        visual = this.createUnitVisual(unit);
        this.visuals.set(unit.id, visual);
        this.scene.add(visual.root);
        this.hpContainer.appendChild(visual.hpBarEl);
      }

      visual.maxHp = unit.maxHp;
      visual.alive = unit.alive;

      if (!this.isPendingAttackTarget(unit.id)) {
        this.applyHpBar(visual, unit.hp, unit.maxHp);
      }

      const isSelected = unit.id === selectedUnitId && unit.alive;
      this.updateBaseRing(visual, isSelected);

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
          visual.hpBarEl.style.display = 'flex';
        } else {
          visual.bodyGroup.rotation.set(Math.PI / 2, visual.facingYaw, 0);
          visual.bodyGroup.position.set(0, 0.22, 0);
          visual.baseRing.visible = false;
          visual.hpBarEl.style.display = 'none';
        }
      }
    }
  }

  enqueueEvents(events: GameEvent[]): void {
    for (const ev of events) {
      if (ev.type === 'gameReset') {
        this.cleanupActiveVfx();
        this.queue.length = 0;
        this.currentAnim = null;
        for (const visual of this.visuals.values()) {
          visual.root.visible = true;
          visual.baseRing.visible = true;
          visual.facingYaw = 0;
          visual.targetYaw = 0;
          visual.bodyGroup.rotation.set(0, 0, 0);
          visual.bodyGroup.scale.set(1, 1, 1);
          visual.bodyGroup.position.set(0, 0, 0);
          visual.weaponPivot.rotation.x = visual.weaponRestRotX;
          this.setFlash(visual, 0);
        }
        continue;
      }

      if (ev.type === 'unitMoved' && ev.path.length >= 2) {
        const worldPath = ev.path.map((c: GridCoord) => this.board.gridToWorld(c, 0));
        this.queue.push({
          kind: 'move',
          unitId: ev.unitId,
          path: worldPath,
          segmentIndex: 0,
          segmentProgress: 0,
          stepDuration: 0.12,
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
            vfxGroup: null,
            elapsed: 0,
            duration: ev.skillId === 'arcane-burst' ? 0.42 : 0.3,
          });
        }
      } else if (ev.type === 'unitAttacked') {
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
              targetHpRemaining: ev.targetHpRemaining,
              hpApplied: false,
              origin: attacker.root.position.clone(),
              targetPos: target.root.position.clone(),
              elapsed: 0,
              duration: 0.34,
            });
          }
        }
      } else if (ev.type === 'unitHealed') {
        this.queue.push({
          kind: 'heal',
          casterId: ev.casterId,
          targetId: ev.targetId,
          targetHpAfter: ev.targetHpAfter,
          hpApplied: false,
          elapsed: 0,
          duration: 0.42,
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
    if (!this.currentAnim && this.queue.length > 0) {
      this.currentAnim = this.queue.shift() ?? null;
      this.initAnimation(this.currentAnim);
    }

    if (this.currentAnim) {
      this.stepAnimation(this.currentAnim, dt);
    }

    for (const visual of this.visuals.values()) {
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

    if (anim.kind === 'meleeAttack' || anim.kind === 'rangedAttack') {
      const attacker = this.visuals.get(anim.attackerId);
      const target = this.visuals.get(anim.targetId);
      if (attacker && target) {
        anim.origin.copy(attacker.root.position);
        anim.targetPos.copy(target.root.position);
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
      }
      anim.vfxGroup = this.createSkillVfxGroup(anim.skillId, anim.targetPos);
      this.scene.add(anim.vfxGroup);
    }
  }

  private createSkillVfxGroup(skillId: SkillId, targetPos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(targetPos);

    if (skillId === 'arcane-burst') {
      // Cross AoE ring + central arcane orb
      const ringGeo = new THREE.RingGeometry(0.25, 0.45, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.08;

      const orbGeo = new THREE.SphereGeometry(0.28, 12, 12);
      const orbMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.85,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 0.45;

      group.add(ring, orb);
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

      if (anim.vfxGroup) {
        const maxScale = anim.skillId === 'arcane-burst' ? 3.2 : 1.6;
        const scale = 0.5 + progress * maxScale;
        anim.vfxGroup.scale.setScalar(scale);
        anim.vfxGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = Math.max(0, 1 - progress);
          }
        });
      }

      if (progress >= 1) {
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
        target.bodyGroup.position.set(0, 0, 0);
        target.bodyGroup.rotation.x = 0;
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
        target.bodyGroup.position.set(0, 0, 0);
        target.bodyGroup.rotation.x = 0;
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
        this.applyHpBar(target, anim.targetHpAfter, target.maxHp);
      }

      const glow = Math.sin(progress * Math.PI);
      target.bodyGroup.position.y = glow * 0.08;
      this.setFlash(target, glow, progress < 0.5 ? 0x4ade80 : 0xfacc15);

      if (progress >= 1) {
        target.bodyGroup.position.y = 0;
        this.setFlash(target, 0);
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

      visual.bodyGroup.rotation.x = progress * (Math.PI / 2);
      if (visual.team === 'player') {
        visual.bodyGroup.position.y = progress * 0.22;
      } else {
        const scale = Math.max(0.05, 1 - progress * 0.85);
        visual.bodyGroup.scale.setScalar(scale);
      }

      if (progress >= 1) {
        visual.root.visible = visual.team === 'player';
        visual.baseRing.visible = false;
        visual.hpBarEl.style.display = 'none';
        this.finishCurrentAnimation();
      }
    }
  }

  private applyTargetHitReaction(
    anim: { targetHpRemaining: number; hpApplied: boolean },
    target: UnitVisual,
    progress: number,
    dirX: number,
    dirZ: number,
    impactStart: number
  ): void {
    if (progress < impactStart) return;

    if (!anim.hpApplied) {
      anim.hpApplied = true;
      this.applyHpBar(target, anim.targetHpRemaining, target.maxHp);
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
      if (a.kind === 'move' || a.kind === 'die') return a.unitId === unitId;
      if (a.kind === 'skillVfx') return a.casterId === unitId;
      if (a.kind === 'heal') return a.casterId === unitId || a.targetId === unitId;
      return a.attackerId === unitId || a.targetId === unitId;
    };
    return check(this.currentAnim) || this.queue.some(check);
  }

  private isPendingAttackTarget(unitId: string): boolean {
    const check = (a: ActiveAnimation | null): boolean =>
      a !== null &&
      (a.kind === 'meleeAttack' || a.kind === 'rangedAttack' || a.kind === 'heal') &&
      a.targetId === unitId &&
      !a.hpApplied;
    return check(this.currentAnim) || this.queue.some(check);
  }

  private applyHpBar(visual: UnitVisual, hp: number, maxHp: number): void {
    visual.hp = hp;
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    visual.hpFillEl.style.width = `${pct}%`;
    visual.hpTextEl.textContent = `${hp}/${maxHp}`;
  }

  private setFlash(visual: UnitVisual, intensity: number, colorHex = 0xffffff): void {
    for (const mat of visual.flashMaterials) {
      mat.emissive.setHex(intensity > 0 ? colorHex : 0x000000);
      mat.emissiveIntensity = intensity * 0.75;
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

  private createUnitVisual(unit: UnitState): UnitVisual {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
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

    const weaponPivot = this.buildModelByType(unit.type, bodyGroup, flashMaterials);
    const weaponRestRotX = weaponPivot.rotation.x;

    const hitboxGeo = new THREE.BoxGeometry(0.75, 1.25, 0.75);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.position.y = 0.62;
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

    hpBarEl.appendChild(track);
    hpBarEl.appendChild(hpTextEl);

    return {
      id: unit.id,
      type: unit.type,
      team: unit.team,
      root,
      bodyGroup,
      weaponPivot,
      weaponRestRotX,
      baseRing,
      hitbox,
      flashMaterials,
      hpBarEl,
      hpFillEl,
      hpTextEl,
      alive: unit.alive,
      hp: unit.hp,
      maxHp: unit.maxHp,
      facingYaw: 0,
      targetYaw: 0,
    };
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
      case 'armored-skeleton':
        return this.buildArmoredSkeleton(bodyGroup, flashMaterials);
      case 'goblin-scout':
        return this.buildGoblinScout(bodyGroup, flashMaterials);
      case 'cultist-mage':
        return this.buildCultistMage(bodyGroup, flashMaterials);
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
}
