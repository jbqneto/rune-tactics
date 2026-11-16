import * as THREE from 'three';
import { SKILLS } from '../config/gameConfig';
import type { BoardRenderer } from '../rendering/BoardRenderer';
import type { CameraController } from '../rendering/CameraController';
import type { UnitRenderer } from '../rendering/UnitRenderer';
import type { GridCoord, IGameEngine, UnitState } from '../shared/types';

export type InteractionMode = 'default' | 'attack' | 'skill';

export interface InputCallbacks {
  getMode: () => InteractionMode;
  setMode: (mode: InteractionMode) => void;
  onHoverChange: (
    hoverCell: GridCoord | null,
    path: GridCoord[] | null,
    skillArea: GridCoord[]
  ) => void;
  onActionExecuted: () => void;
  onFeedback?: (message: string) => void;
}

export interface PickHit {
  distance: number;
  userData?: {
    unitId?: string;
    gridCoord?: GridCoord;
  };
}

export interface RaycastHits {
  unitHits: readonly PickHit[];
  obstacleHits: readonly PickHit[];
  tileHits: readonly PickHit[];
}

export interface PickContext {
  mode: InteractionMode;
  canBasicAttack: boolean;
  attackableIds: ReadonlySet<string>;
  skillTargetUnitIds?: ReadonlySet<string>;
  healTargetUnitIds?: ReadonlySet<string>;
}

export interface PickResult {
  unitId: string | null;
  cell: GridCoord | null;
}

function sameCoord(a: GridCoord, b: GridCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Resolve o alvo do cursor a partir dos hits separados por camada,
 * permitindo selecionar células livres encobertas por modelos de unidades
 * enquanto obstáculos sólidos bloqueiam qualquer clique atrás deles.
 */
export function resolvePickTarget(
  hits: RaycastHits,
  units: readonly UnitState[],
  ctx: PickContext
): PickResult {
  const closestObstacleDist = hits.obstacleHits[0]?.distance ?? Infinity;
  const closestTile = hits.tileHits[0];
  const closestTileDist = closestTile?.distance ?? Infinity;

  const findUnitHit = (allowedIds: ReadonlySet<string>): UnitState | null => {
    for (const hit of hits.unitHits) {
      if (hit.distance >= closestObstacleDist) break;
      const unitId = hit.userData?.unitId;
      if (!unitId || !allowedIds.has(unitId)) continue;
      const unit = units.find((u) => u.id === unitId && u.alive);
      if (unit) return unit;
    }
    return null;
  };

  if (ctx.mode === 'attack') {
    const hitEnemy = findUnitHit(ctx.attackableIds);
    if (hitEnemy) {
      return { unitId: hitEnemy.id, cell: hitEnemy.pos };
    }
    if (closestTile && closestTileDist < closestObstacleDist) {
      const cell = closestTile.userData?.gridCoord;
      if (cell) {
        const enemyOnTile = units.find(
          (u) => u.alive && ctx.attackableIds.has(u.id) && sameCoord(u.pos, cell)
        );
        if (enemyOnTile) {
          return { unitId: enemyOnTile.id, cell: enemyOnTile.pos };
        }
      }
    }
    return { unitId: null, cell: null };
  }

  if (ctx.mode === 'skill') {
    if (ctx.healTargetUnitIds) {
      const hitAlly = findUnitHit(ctx.healTargetUnitIds);
      if (hitAlly) {
        return { unitId: hitAlly.id, cell: hitAlly.pos };
      }
    } else if (ctx.skillTargetUnitIds && ctx.skillTargetUnitIds.size > 0) {
      const hitTarget = findUnitHit(ctx.skillTargetUnitIds);
      if (hitTarget) {
        return { unitId: hitTarget.id, cell: hitTarget.pos };
      }
    }

    if (closestTile && closestTileDist < closestObstacleDist) {
      const cell = closestTile.userData?.gridCoord ?? null;
      return { unitId: null, cell };
    }
    return { unitId: null, cell: null };
  }

  // Modo 'default': ataca inimigo atacável clicado diretamente (se disponível);
  // caso contrário ignora unitHits para nunca bloquear células livres atrás de unidades.
  if (ctx.canBasicAttack) {
    const hitEnemy = findUnitHit(ctx.attackableIds);
    if (hitEnemy) {
      return { unitId: hitEnemy.id, cell: hitEnemy.pos };
    }
  }

  if (closestTile && closestTileDist < closestObstacleDist) {
    const cell = closestTile.userData?.gridCoord ?? null;
    return { unitId: null, cell };
  }
  return { unitId: null, cell: null };
}

function toPickHits(intersections: THREE.Intersection[]): PickHit[] {
  return intersections.map((hit) => ({
    distance: hit.distance,
    userData: hit.object.userData as PickHit['userData'],
  }));
}

export class InputManager {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.Camera;
  private readonly engine: IGameEngine;
  private readonly board: BoardRenderer;
  private readonly unitRenderer: UnitRenderer;
  private readonly callbacks: InputCallbacks;
  private readonly cameraController: CameraController | null;

  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private lastHoverKey: string | null = null;
  private lastMode: InteractionMode = 'default';

  private readonly handlePointerMoveBound: (e: PointerEvent) => void;
  private readonly handlePointerDownBound: (e: PointerEvent) => void;
  private readonly handlePointerLeaveBound: () => void;
  private readonly handleContextMenuBound: (e: MouseEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    engine: IGameEngine,
    board: BoardRenderer,
    unitRenderer: UnitRenderer,
    callbacks: InputCallbacks,
    cameraController: CameraController | null = null
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.engine = engine;
    this.board = board;
    this.unitRenderer = unitRenderer;
    this.callbacks = callbacks;
    this.cameraController = cameraController;

    this.handlePointerMoveBound = (e) => this.onPointerMove(e);
    this.handlePointerDownBound = (e) => this.onPointerDown(e);
    this.handlePointerLeaveBound = () => this.onPointerLeave();
    this.handleContextMenuBound = (e) => {
      e.preventDefault();
      // Arraste com botão direito orbita a câmera; apenas clique direito parado cancela o modo.
      if (this.cameraController?.consumeRightDrag()) {
        return;
      }
      if (this.callbacks.getMode() !== 'default') {
        this.callbacks.setMode('default');
        this.lastHoverKey = null;
        this.callbacks.onHoverChange(null, null, []);
      }
    };

    this.canvas.addEventListener('pointermove', this.handlePointerMoveBound);
    this.canvas.addEventListener('pointerdown', this.handlePointerDownBound);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeaveBound);
    this.canvas.addEventListener('contextmenu', this.handleContextMenuBound);
  }

  private isInputBlocked(): boolean {
    const state = this.engine.getState();
    return state.phase !== 'player' || this.unitRenderer.isAnimating;
  }

  private updateRaycaster(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, this.camera);
  }

  private buildPickContext(mode: InteractionMode): {
    context: PickContext;
    units: UnitState[];
  } {
    const state = this.engine.getState();
    const selectedUnit = state.selectedUnitId
      ? state.units.find((u) => u.id === state.selectedUnitId && u.alive) ?? null
      : null;

    const attackable = selectedUnit ? this.engine.getAttackableTargets() : [];
    const attackableIds = new Set(attackable.map((u) => u.id));

    let skillTargetUnitIds: Set<string> | undefined;
    let healTargetUnitIds: Set<string> | undefined;

    if (mode === 'skill' && selectedUnit?.skillId) {
      const skill = SKILLS[selectedUnit.skillId];
      const skillCells = this.engine.getSkillTargetCells();
      if (skill.targetTeam === 'ally') {
        healTargetUnitIds = new Set(
          state.units
            .filter((u) => u.alive && u.team === 'player' && skillCells.some((c) => sameCoord(c, u.pos)))
            .map((u) => u.id)
        );
      } else if (skill.area === 'single') {
        skillTargetUnitIds = new Set(
          state.units
            .filter((u) => u.alive && u.team === 'enemy' && skillCells.some((c) => sameCoord(c, u.pos)))
            .map((u) => u.id)
        );
      }
    }

    return {
      units: state.units,
      context: {
        mode,
        canBasicAttack: Boolean(selectedUnit && !selectedUnit.hasAttacked),
        attackableIds,
        skillTargetUnitIds,
        healTargetUnitIds,
      },
    };
  }

  private pickTarget(e: PointerEvent, mode: InteractionMode): PickResult {
    this.updateRaycaster(e);
    const { context, units } = this.buildPickContext(mode);

    const hits: RaycastHits = {
      unitHits: toPickHits(this.raycaster.intersectObjects(this.unitRenderer.getUnitHitboxes(), false)),
      obstacleHits: toPickHits(this.raycaster.intersectObjects(this.board.getObstacleMeshes(), false)),
      tileHits: toPickHits(this.raycaster.intersectObjects(this.board.getTileMeshes(), false)),
    };

    return resolvePickTarget(hits, units, context);
  }

  private onPointerMove(e: PointerEvent): void {
    if (this.cameraController?.isDragging) {
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (this.isInputBlocked()) {
      if (this.lastHoverKey !== null) {
        this.lastHoverKey = null;
        this.callbacks.onHoverChange(null, null, []);
      }
      this.canvas.style.cursor = 'default';
      return;
    }

    const mode = this.callbacks.getMode();
    const { unitId, cell } = this.pickTarget(e, mode);
    const key = cell ? `${cell.x},${cell.y}` : null;

    const state = this.engine.getState();
    const selectedUnit = state.selectedUnitId
      ? state.units.find((u) => u.id === state.selectedUnitId && u.alive) ?? null
      : null;

    if (mode === 'skill') {
      const skillTargets = selectedUnit ? this.engine.getSkillTargetCells() : [];
      const isDirectSkillTarget = cell ? skillTargets.some((c) => sameCoord(c, cell)) : false;
      const smartPlan =
        cell && selectedUnit && !isDirectSkillTarget ? this.engine.getSmartSkillPlan(cell) : null;
      const isSkillTarget = isDirectSkillTarget || smartPlan !== null;
      this.canvas.style.cursor = isSkillTarget ? 'pointer' : 'default';

      if (key === this.lastHoverKey && mode === this.lastMode) return;
      this.lastHoverKey = key;
      this.lastMode = mode;

      const skillArea =
        cell && isSkillTarget ? this.engine.getSkillAreaCells(cell) : [];
      this.callbacks.onHoverChange(
        isSkillTarget ? cell : null,
        smartPlan && smartPlan.path.length >= 2 ? smartPlan.path : null,
        skillArea
      );
      return;
    }

    const hoveredEnemy =
      selectedUnit && (unitId || cell)
        ? state.units.find(
            (u) =>
              u.team === 'enemy' &&
              u.alive &&
              ((unitId && u.id === unitId) || (cell && sameCoord(u.pos, cell)))
          ) ?? null
        : null;
    const smartAttackPlan = hoveredEnemy ? this.engine.getSmartAttackPlan(hoveredEnemy.id) : null;

    if (mode === 'attack') {
      this.canvas.style.cursor = hoveredEnemy ? 'pointer' : 'default';
      if (key === this.lastHoverKey && mode === this.lastMode) return;
      this.lastHoverKey = key;
      this.lastMode = mode;
      this.callbacks.onHoverChange(
        hoveredEnemy ? hoveredEnemy.pos : null,
        smartAttackPlan && smartAttackPlan.path.length >= 2 ? smartAttackPlan.path : null,
        []
      );
      return;
    }

    const reachable = selectedUnit ? this.engine.getReachableCells() : [];
    const isReachable = cell ? reachable.some((c) => sameCoord(c, cell)) : false;

    this.canvas.style.cursor = isReachable || smartAttackPlan !== null ? 'pointer' : 'default';

    if (key === this.lastHoverKey && mode === this.lastMode) return;
    this.lastHoverKey = key;
    this.lastMode = mode;

    let path: GridCoord[] | null = null;
    if (smartAttackPlan && smartAttackPlan.path.length >= 2) {
      path = smartAttackPlan.path;
    } else if (cell && selectedUnit && isReachable) {
      path = this.engine.getPath(selectedUnit.pos, cell);
    }

    this.callbacks.onHoverChange(cell, path, []);
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0 || this.isInputBlocked()) return;

    const mode = this.callbacks.getMode();
    const { unitId, cell } = this.pickTarget(e, mode);
    const state = this.engine.getState();

    if (mode === 'skill' && state.selectedUnitId && cell) {
      const res = this.engine.smartUseSkill(cell);
      if (res.ok) {
        this.callbacks.setMode('default');
        this.lastHoverKey = null;
        this.callbacks.onActionExecuted();
        return;
      }
      this.callbacks.onFeedback?.(res.reason);
      return;
    }

    if (state.selectedUnitId) {
      const clickedEnemy = state.units.find(
        (u) =>
          u.team === 'enemy' &&
          u.alive &&
          ((unitId && u.id === unitId) || (cell && sameCoord(u.pos, cell)))
      );
      if (clickedEnemy) {
        const res = this.engine.smartAttack(clickedEnemy.id);
        if (res.ok) {
          this.callbacks.setMode('default');
          this.lastHoverKey = null;
          this.callbacks.onActionExecuted();
        } else {
          this.callbacks.onFeedback?.(res.reason);
        }
        return;
      }
      if (mode === 'attack') {
        this.callbacks.setMode('default');
        this.lastHoverKey = null;
        this.callbacks.onActionExecuted();
        return;
      }
    }

    if (cell && state.selectedUnitId) {
      const reachable = this.engine.getReachableCells();
      if (reachable.some((c) => sameCoord(c, cell))) {
        const res = this.engine.moveSelectedUnit(cell);
        if (res.ok) {
          this.callbacks.setMode('default');
          this.lastHoverKey = null;
          this.callbacks.onActionExecuted();
        }
        return;
      }
    }
  }

  private onPointerLeave(): void {
    if (this.lastHoverKey !== null) {
      this.lastHoverKey = null;
      this.callbacks.onHoverChange(null, null, []);
    }
    this.canvas.style.cursor = 'default';
  }

  dispose(): void {
    this.canvas.removeEventListener('pointermove', this.handlePointerMoveBound);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDownBound);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeaveBound);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenuBound);
  }
}
