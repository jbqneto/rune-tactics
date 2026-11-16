import { GRID_SIZE, INITIAL_UNITS, MAPS, OBSTACLES, type MapConfig, type UnitSpawn } from '../config/gameConfig';
import type {
  ActionResult,
  GameEvent,
  GameStateSnapshot,
  GridCoord,
  IGameEngine,
  ObstacleDef,
  SmartActionPlan,
  UnitState,
} from '../shared/types';
import { nextEnemyAction } from './ai/EnemyAI';
import {
  canAttack,
  canReach,
  getSkill,
  getSkillAreaCells,
  getSkillTargetCells,
  isValidSkillTarget,
  resolveAttack,
  resolveSkill,
} from './combat/CombatSystem';
import { createUnits } from './entities/UnitFactory';
import { GridSystem, manhattan, sameCell } from './grid/GridSystem';
import { createRng, pickMap, randomizeUnitSpawns } from './maps/MapSystem';
import { TurnSystem } from './turns/TurnSystem';

/** Cenário da partida. O padrão usa `MAPS` e `INITIAL_UNITS`; os testes podem passar overrides. */
export interface GameSetup {
  gridSize?: number;
  obstacles?: ObstacleDef[];
  units?: UnitSpawn[];
  seed?: number;
  mapId?: string;
  randomizeSpawns?: boolean;
}

interface UndoSnapshot {
  unitId: string;
  prevPos: GridCoord;
  used: boolean;
}

const OK: ActionResult = { ok: true };
const fail = (reason: string): ActionResult => ({ ok: false, reason });
const copyUnit = (unit: UnitState): UnitState => ({ ...unit, pos: { ...unit.pos } });

export class GameEngine implements IGameEngine {
  private readonly setup: GameSetup;
  private grid!: GridSystem;
  private readonly turns = new TurnSystem();
  private units: UnitState[] = [];
  private selectedUnitId: string | null = null;
  private events: GameEvent[] = [];
  private undoSnapshot: UndoSnapshot | null = null;

  private currentMapId = 'ruins';
  private currentMapName = 'Ruínas Atuais';
  private currentSeed = 0;
  private lastMapId: string | null = null;
  private matchCount = 0;

  constructor(setup: GameSetup = {}) {
    this.setup = setup;
    this.start();
  }

  getState(): GameStateSnapshot {
    return {
      mapId: this.currentMapId,
      mapName: this.currentMapName,
      seed: this.currentSeed,
      gridSize: this.grid.size,
      obstacles: this.grid.obstacles.map((o) => ({ ...o.pos })),
      obstacleDefs: this.grid.obstacles.map((o) => ({ ...o, pos: { ...o.pos } })),
      units: this.units.map(copyUnit),
      phase: this.turns.phase,
      turnState: this.turns.turnState,
      turnOrder: [...this.turns.turnOrder],
      turnIndex: this.turns.turnIndex,
      round: this.turns.round,
      activeUnitId: this.turns.activeUnitId,
      activationLocked: this.turns.activationLocked,
      activationTeam: this.turns.activationTeam,
      selectedUnitId: this.selectedUnitId,
      canUndoMove: this.canUndoMoveNow(),
      winner: this.turns.winner,
    };
  }

  selectUnit(unitId: string | null): ActionResult {
    if (this.turns.turnState !== 'player_unit_active' || unitId !== this.turns.activeUnitId) {
      return fail('Não é possível alterar a unidade ativa.');
    }
    return OK;
  }

  getReachableCells(unitId?: string): GridCoord[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    if (!unit || !this.canUnitActNow(unit) || unit.hasMoved) return [];
    return this.grid.getReachableCells(unit.pos, unit.moveRange, this.units);
  }

  getPath(from: GridCoord, to: GridCoord): GridCoord[] | null {
    return this.grid.getPath(from, to, this.units);
  }

  getAttackableTargets(unitId?: string): UnitState[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    if (!unit || !this.canUnitActNow(unit)) return [];
    return this.units.filter((target) => canAttack(unit, target, this.grid)).map(copyUnit);
  }

  hasLineOfSight(from: GridCoord, to: GridCoord): boolean {
    return this.grid.hasLineOfSight(from, to);
  }

  getAttackRangeCells(unitId?: string): GridCoord[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    if (!unit || !this.canUnitActNow(unit) || unit.hasAttacked) return [];

    const cells: GridCoord[] = [];
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const cell = { x, y };
        const dist = manhattan(unit.pos, cell);
        if (
          dist >= 1 &&
          dist <= unit.attackRange &&
          !this.grid.isObstacle(cell) &&
          canReach(unit.pos, cell, unit.attackRange, this.grid)
        ) {
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  getSkillRangeCells(unitId?: string): GridCoord[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    if (!unit || !this.canUnitActNow(unit) || unit.hasAttacked || unit.skillCooldown > 0) return [];
    const skill = getSkill(unit);
    if (!skill) return [];

    const cells: GridCoord[] = [];
    for (let y = 0; y < this.grid.size; y++) {
      for (let x = 0; x < this.grid.size; x++) {
        const cell = { x, y };
        const dist = manhattan(unit.pos, cell);
        if (skill.targetTeam === 'ally') {
          if (
            dist <= skill.range &&
            !this.grid.isObstacle(cell) &&
            canReach(unit.pos, cell, skill.range, this.grid)
          ) {
            cells.push(cell);
          }
        } else if (
          dist >= 1 &&
          dist <= skill.range &&
          !this.grid.isObstacle(cell) &&
          canReach(unit.pos, cell, skill.range, this.grid)
        ) {
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  getSkillTargetCells(unitId?: string): GridCoord[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    if (!unit || !this.canUnitActNow(unit)) return [];
    return getSkillTargetCells(unit, this.units, this.grid);
  }

  getSkillAreaCells(targetCell: GridCoord, unitId?: string): GridCoord[] {
    const unit = this.findUnit(unitId ?? this.selectedUnitId);
    const skill = unit && getSkill(unit);
    return skill ? getSkillAreaCells(skill, targetCell, this.grid) : [];
  }

  moveSelectedUnit(to: GridCoord): ActionResult {
    const unit = this.activePlayerUnit();
    if (typeof unit === 'string') return fail(unit);
    if (unit.hasMoved) return fail('A unidade já se moveu nesta ativação.');
    if (!this.getReachableCells(unit.id).some((c) => sameCell(c, to))) return fail('Célula fora do alcance.');

    const prevPos = { x: unit.pos.x, y: unit.pos.y };
    const path = this.grid.getPath(unit.pos, to, this.units)!;
    unit.pos = { x: to.x, y: to.y };
    unit.hasMoved = true;

    if (!this.undoSnapshot || this.undoSnapshot.unitId !== unit.id) {
      this.undoSnapshot = { unitId: unit.id, prevPos, used: false };
    }

    this.events.push({ type: 'unitMoved', unitId: unit.id, path });
    this.postActionCheck(unit);
    return OK;
  }

  undoMove(): ActionResult {
    if (!this.canUndoMoveNow()) {
      return fail('Não é possível desfazer o movimento agora.');
    }
    const unit = this.findUnit(this.turns.activeUnitId)!;
    const currentPos = { x: unit.pos.x, y: unit.pos.y };
    const prevPos = { x: this.undoSnapshot!.prevPos.x, y: this.undoSnapshot!.prevPos.y };

    unit.pos = prevPos;
    unit.hasMoved = false;
    this.undoSnapshot!.used = true;

    this.events.push({ type: 'moveUndone', unitId: unit.id, path: [currentPos, prevPos] });
    return OK;
  }

  attackTarget(targetId: string): ActionResult {
    const unit = this.activePlayerUnit();
    if (typeof unit === 'string') return fail(unit);
    if (unit.hasAttacked) return fail('A unidade já atacou nesta ativação.');
    const target = this.findUnit(targetId);
    if (!target) return fail('Alvo não encontrado.');
    if (!target.alive) return fail('O alvo está morto.');
    if (target.team === unit.team) return fail('O alvo não é inimigo.');
    if (manhattan(unit.pos, target.pos) > unit.attackRange) return fail('Alvo fora do alcance.');
    if (!canAttack(unit, target, this.grid)) return fail('Sem linha de visão até o alvo.');

    this.undoSnapshot = null;
    this.events.push(...resolveAttack(unit, target));
    this.postActionCheck(unit);
    return OK;
  }

  useSkill(targetCell: GridCoord): ActionResult {
    const unit = this.activePlayerUnit();
    if (typeof unit === 'string') return fail(unit);
    const skill = getSkill(unit);
    if (!skill) return fail('A unidade não tem habilidade.');
    if (unit.hasAttacked) return fail('A unidade já atacou nesta ativação.');
    if (unit.skillCooldown > 0) return fail(`${skill.name} em recarga: faltam ${unit.skillCooldown} rodada(s).`);
    if (!isValidSkillTarget(unit, skill, targetCell, this.units, this.grid)) {
      return fail(`Célula inválida para ${skill.name}.`);
    }

    this.undoSnapshot = null;
    this.events.push(...resolveSkill(unit, skill, targetCell, this.units, this.grid));
    this.postActionCheck(unit);
    return OK;
  }

  getSmartAttackPlan(targetId: string): SmartActionPlan | null {
    if (this.turns.isOver || this.turns.turnState !== 'player_unit_active') return null;
    const unit = this.findUnit(this.turns.activeUnitId);
    if (!unit || !unit.alive || unit.team !== 'player' || unit.hasAttacked) return null;

    const target = this.findUnit(targetId);
    if (!target || !target.alive || target.team === unit.team) return null;

    if (canAttack(unit, target, this.grid)) {
      return { path: [{ ...unit.pos }] };
    }
    if (unit.hasMoved) return null;

    const candidates: { path: GridCoord[]; steps: number; dist: number; cell: GridCoord }[] = [];
    for (const cell of this.getReachableCells(unit.id)) {
      const virtualUnit: UnitState = { ...unit, pos: cell };
      if (!canAttack(virtualUnit, target, this.grid)) continue;
      const path = this.grid.getPath(unit.pos, cell, this.units);
      if (!path) continue;
      candidates.push({
        path,
        steps: path.length - 1,
        dist: manhattan(cell, target.pos),
        cell,
      });
    }

    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) =>
        a.steps - b.steps ||
        a.dist - b.dist ||
        a.cell.y - b.cell.y ||
        a.cell.x - b.cell.x
    );
    return { path: candidates[0].path };
  }

  smartAttack(targetId: string): ActionResult {
    const plan = this.getSmartAttackPlan(targetId);
    if (!plan) return fail('Ataque inteligente indisponível para este alvo.');

    const unit = this.findUnit(this.turns.activeUnitId)!;
    const target = this.findUnit(targetId)!;
    this.undoSnapshot = null;

    if (plan.path.length > 1) {
      const dest = plan.path[plan.path.length - 1];
      unit.pos = { x: dest.x, y: dest.y };
      unit.hasMoved = true;
      this.events.push({ type: 'unitMoved', unitId: unit.id, path: plan.path });
    }

    this.events.push(...resolveAttack(unit, target));
    this.postActionCheck(unit);
    return OK;
  }

  getSmartSkillPlan(targetCell: GridCoord): SmartActionPlan | null {
    if (this.turns.isOver || this.turns.turnState !== 'player_unit_active') return null;
    const unit = this.findUnit(this.turns.activeUnitId);
    if (!unit || !unit.alive || unit.team !== 'player' || unit.hasAttacked || unit.skillCooldown > 0) {
      return null;
    }
    const skill = getSkill(unit);
    if (!skill) return null;

    if (isValidSkillTarget(unit, skill, targetCell, this.units, this.grid)) {
      return { path: [{ ...unit.pos }] };
    }
    if (unit.hasMoved) return null;

    const candidates: { path: GridCoord[]; steps: number; dist: number; cell: GridCoord }[] = [];
    for (const cell of this.getReachableCells(unit.id)) {
      const virtualUnit: UnitState = { ...unit, pos: cell };
      if (!isValidSkillTarget(virtualUnit, skill, targetCell, this.units, this.grid)) continue;
      const path = this.grid.getPath(unit.pos, cell, this.units);
      if (!path) continue;
      candidates.push({
        path,
        steps: path.length - 1,
        dist: manhattan(cell, targetCell),
        cell,
      });
    }

    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) =>
        a.steps - b.steps ||
        a.dist - b.dist ||
        a.cell.y - b.cell.y ||
        a.cell.x - b.cell.x
    );
    return { path: candidates[0].path };
  }

  smartUseSkill(targetCell: GridCoord): ActionResult {
    const plan = this.getSmartSkillPlan(targetCell);
    if (!plan) return fail('Habilidade inteligente indisponível para esta célula.');

    const unit = this.findUnit(this.turns.activeUnitId)!;
    const skill = getSkill(unit)!;
    this.undoSnapshot = null;

    if (plan.path.length > 1) {
      const dest = plan.path[plan.path.length - 1];
      unit.pos = { x: dest.x, y: dest.y };
      unit.hasMoved = true;
      this.events.push({ type: 'unitMoved', unitId: unit.id, path: plan.path });
    }

    this.events.push(...resolveSkill(unit, skill, targetCell, this.units, this.grid));
    this.postActionCheck(unit);
    return OK;
  }

  endPlayerTurn(): ActionResult {
    const unit = this.activePlayerUnit();
    if (typeof unit === 'string') return fail(unit);

    this.undoSnapshot = null;
    this.events.push(...this.turns.advanceTurn(unit, this.units));
    this.syncSelection();
    return OK;
  }

  executeNextEnemyAction(): boolean {
    if (this.turns.turnState !== 'enemy_activation') return false;

    const enemy = this.findUnit(this.turns.activeUnitId);
    if (!enemy || !enemy.alive) return false;

    const action = nextEnemyAction(enemy, this.units, this.grid);
    if (!action) {
      this.events.push(...this.turns.advanceTurn(enemy, this.units));
      this.syncSelection();
      return false;
    }

    if (action.type === 'attack') {
      this.events.push(...resolveAttack(enemy, action.target));
    } else {
      enemy.pos = { ...action.path[action.path.length - 1] };
      enemy.hasMoved = true;
      this.events.push({ type: 'unitMoved', unitId: enemy.id, path: action.path });
    }

    this.postActionCheck(enemy);
    return true;
  }

  reset(): void {
    this.start();
    this.events.push({ type: 'gameReset' });
  }

  consumeEvents(): GameEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  private start(): void {
    this.matchCount += 1;
    if (this.setup.seed !== undefined) {
      this.currentSeed = (this.setup.seed + (this.matchCount - 1)) >>> 0;
    } else {
      this.currentSeed = Math.floor(Math.random() * 0xffffffff) >>> 0;
    }

    const rng = createRng(this.currentSeed);

    const hasCustomObstaclesOrSize =
      (this.setup.obstacles !== undefined || this.setup.gridSize !== undefined) &&
      this.setup.mapId === undefined;

    let selectedMap: MapConfig;
    if (hasCustomObstaclesOrSize) {
      selectedMap = {
        id: 'custom',
        name: 'Custom',
        gridSize: this.setup.gridSize ?? GRID_SIZE,
        obstacles: this.setup.obstacles ?? OBSTACLES,
        playerSpawnRows: [0, 1],
        enemySpawnRows: [10, 11],
      };
    } else {
      selectedMap = pickMap(MAPS, rng, this.lastMapId, this.setup.mapId);
    }

    this.currentMapId = selectedMap.id;
    this.currentMapName = selectedMap.name;
    this.lastMapId = selectedMap.id;

    this.grid = new GridSystem(selectedMap.gridSize, selectedMap.obstacles);

    const baseSpawns = this.setup.units ?? INITIAL_UNITS;
    const shouldRandomize =
      this.setup.randomizeSpawns !== undefined
        ? this.setup.randomizeSpawns
        : this.setup.units === undefined;

    const resolvedSpawns = shouldRandomize
      ? randomizeUnitSpawns(
          baseSpawns,
          selectedMap.gridSize,
          selectedMap.obstacles,
          selectedMap.playerSpawnRows,
          selectedMap.enemySpawnRows,
          rng
        )
      : baseSpawns;

    this.units = createUnits(resolvedSpawns);
    this.turns.reset(this.units);
    this.events = [];
    this.undoSnapshot = null;
    this.syncSelection();
  }

  private syncSelection(): void {
    this.selectedUnitId =
      this.turns.turnState === 'player_unit_active' ? this.turns.activeUnitId : null;
  }

  private findUnit(unitId: string | null): UnitState | undefined {
    return this.units.find((u) => u.id === unitId);
  }

  private canUnitActNow(unit: UnitState): boolean {
    return (
      !this.turns.isOver &&
      unit.alive &&
      !unit.hasActivatedThisRound &&
      unit.id === this.turns.activeUnitId
    );
  }

  private canUndoMoveNow(): boolean {
    if (this.turns.isOver || this.turns.turnState !== 'player_unit_active') return false;
    const unit = this.findUnit(this.turns.activeUnitId);
    if (!unit || !unit.alive || unit.team !== 'player') return false;
    if (!unit.hasMoved || unit.hasAttacked) return false;
    if (!this.undoSnapshot || this.undoSnapshot.unitId !== unit.id || this.undoSnapshot.used) {
      return false;
    }
    return !this.grid.isBlocked(this.undoSnapshot.prevPos, this.units);
  }

  private activePlayerUnit(): UnitState | string {
    if (this.turns.isOver) return 'A batalha já terminou.';
    if (this.turns.turnState !== 'player_unit_active') return 'Não é a vez do jogador.';
    const unit = this.findUnit(this.turns.activeUnitId);
    if (!unit || !unit.alive || unit.team !== 'player') return 'Nenhuma unidade ativa válida.';
    return unit;
  }

  private postActionCheck(activeUnit: UnitState): void {
    const battleEvents = this.turns.checkBattleEnd(this.units);
    if (this.turns.isOver) {
      this.events.push(...battleEvents);
      this.undoSnapshot = null;
      this.selectedUnitId = null;
      return;
    }

    if (!activeUnit.alive || (activeUnit.hasMoved && activeUnit.hasAttacked)) {
      this.undoSnapshot = null;
      this.events.push(...this.turns.advanceTurn(activeUnit, this.units));
      this.syncSelection();
    }
  }
}
