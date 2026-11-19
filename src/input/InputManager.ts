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

/** Max finger travel (px) for a touch to still count as a tap rather than a camera drag. */
export const TOUCH_TAP_SLOP_PX = 10;

export interface TouchTapInput {
  /** `${mode}:${x},${y}` of the target previewed by the previous tap, if any. */
  previewToken: string | null;
  tapToken: string | null;
  /** Whether the tapped target would trigger an action (move, attack, skill). */
  actionable: boolean;
}

export interface TouchTapDecision {
  action: 'preview' | 'commit' | 'clear';
  previewToken: string | null;
}

/**
 * Touch screens have no hover, so the first tap previews the path/target and a
 * second tap on the same target (same mode) confirms it. Prevents fat-finger moves.
 */
export function resolveTouchTap({ previewToken, tapToken, actionable }: TouchTapInput): TouchTapDecision {
  if (!actionable || tapToken === null) return { action: 'clear', previewToken: null };
  if (tapToken === previewToken) return { action: 'commit', previewToken: null };
  return { action: 'preview', previewToken: tapToken };
}

/**
 * Resolves the cursor target from layer-separated raycast hits,
 * allowing free cells occluded by unit models to be selected
 * while solid obstacles block any click behind them.
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

  // 'default' mode: directly attack a clicked attackable enemy (if available);
  // otherwise ignore unitHits so free cells behind units are never blocked.
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
  private touchPreviewToken: string | null = null;
  private touchStart: { id: number; x: number; y: number } | null = null;

  private readonly handlePointerMoveBound: (e: PointerEvent) => void;
  private readonly handlePointerDownBound: (e: PointerEvent) => void;
  private readonly handlePointerUpBound: (e: PointerEvent) => void;
  private readonly handlePointerCancelBound: () => void;
  private readonly handlePointerLeaveBound: (e: PointerEvent) => void;
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

    this.handlePointerMoveBound = (e) => {
      // Touch has no hover: previews come from taps (see onTouchTap).
      if (e.pointerType !== 'touch') this.onPointerMove(e);
    };
    this.handlePointerDownBound = (e) => this.onPointerDown(e);
    this.handlePointerUpBound = (e) => this.onPointerUp(e);
    this.handlePointerCancelBound = () => {
      this.touchStart = null;
    };
    this.handlePointerLeaveBound = (e) => {
      // Lifting a finger fires pointerleave; keep the tap preview visible.
      if (e.pointerType !== 'touch') this.onPointerLeave();
    };
    this.handleContextMenuBound = (e) => {
      e.preventDefault();
      // Right-click drag orbits the camera; only a stationary right-click cancels the current mode.
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
    this.canvas.addEventListener('pointerup', this.handlePointerUpBound);
    this.canvas.addEventListener('pointercancel', this.handlePointerCancelBound);
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

  /** Updates hover feedback; returns whether the target under the pointer is actionable. */
  private onPointerMove(e: PointerEvent): boolean {
    if (this.cameraController?.isDragging) {
      this.canvas.style.cursor = 'grabbing';
      return false;
    }

    if (this.isInputBlocked()) {
      if (this.lastHoverKey !== null) {
        this.lastHoverKey = null;
        this.callbacks.onHoverChange(null, null, []);
      }
      this.canvas.style.cursor = 'default';
      return false;
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

      if (key === this.lastHoverKey && mode === this.lastMode) return isSkillTarget;
      this.lastHoverKey = key;
      this.lastMode = mode;

      const skillArea =
        cell && isSkillTarget ? this.engine.getSkillAreaCells(cell) : [];
      this.callbacks.onHoverChange(
        isSkillTarget ? cell : null,
        smartPlan && smartPlan.path.length >= 2 ? smartPlan.path : null,
        skillArea
      );
      return isSkillTarget;
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
      if (key === this.lastHoverKey && mode === this.lastMode) return hoveredEnemy !== null;
      this.lastHoverKey = key;
      this.lastMode = mode;
      this.callbacks.onHoverChange(
        hoveredEnemy ? hoveredEnemy.pos : null,
        smartAttackPlan && smartAttackPlan.path.length >= 2 ? smartAttackPlan.path : null,
        []
      );
      return hoveredEnemy !== null;
    }

    const reachable = selectedUnit ? this.engine.getReachableCells() : [];
    const isReachable = cell ? reachable.some((c) => sameCoord(c, cell)) : false;
    const actionable = isReachable || smartAttackPlan !== null;

    this.canvas.style.cursor = actionable ? 'pointer' : 'default';

    if (key === this.lastHoverKey && mode === this.lastMode) return actionable;
    this.lastHoverKey = key;
    this.lastMode = mode;

    let path: GridCoord[] | null = null;
    if (smartAttackPlan && smartAttackPlan.path.length >= 2) {
      path = smartAttackPlan.path;
    } else if (cell && selectedUnit && isReachable) {
      path = this.engine.getPath(selectedUnit.pos, cell);
    }

    this.callbacks.onHoverChange(cell, path, []);
    return actionable;
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.pointerType === 'touch') {
      // Act on release, once we know it was a tap and not a camera drag.
      this.touchStart = e.isPrimary === false ? null : { id: e.pointerId, x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button !== 0 || this.isInputBlocked()) return;
    this.executeAt(e);
  }

  private onPointerUp(e: PointerEvent): void {
    const start = this.touchStart;
    if (e.pointerType !== 'touch' || !start || start.id !== e.pointerId) return;
    this.touchStart = null;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TOUCH_TAP_SLOP_PX) return;
    this.onTouchTap(e);
  }

  private onTouchTap(e: PointerEvent): void {
    if (this.isInputBlocked()) return;
    const mode = this.callbacks.getMode();
    this.lastHoverKey = null; // force a fresh preview for this tap
    const actionable = this.onPointerMove(e);
    const tapToken = this.lastHoverKey !== null ? `${mode}:${this.lastHoverKey}` : null;
    const decision = resolveTouchTap({ previewToken: this.touchPreviewToken, tapToken, actionable });
    this.touchPreviewToken = decision.previewToken;

    if (decision.action === 'commit') {
      this.executeAt(e);
    } else if (decision.action === 'preview') {
      this.callbacks.onFeedback?.('Tap again to confirm');
    } else {
      this.lastHoverKey = null;
      this.callbacks.onHoverChange(null, null, []);
    }
  }

  /** Performs the move / attack / skill for the target under the pointer. */
  private executeAt(e: PointerEvent): void {
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
    this.canvas.removeEventListener('pointerup', this.handlePointerUpBound);
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancelBound);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeaveBound);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenuBound);
  }
}
