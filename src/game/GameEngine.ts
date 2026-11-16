import { GRID_SIZE, INITIAL_UNITS, OBSTACLES, type UnitSpawn } from '../config/gameConfig';
import type {
  ActionResult,
  GameEvent,
  GameStateSnapshot,
  GridCoord,
  IGameEngine,
  ObstacleDef,
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
import { TurnSystem } from './turns/TurnSystem';

/** Cenário da partida. O padrão é o de `gameConfig.ts`; os testes passam outros. */
export interface GameSetup {
  gridSize: number;
  obstacles: ObstacleDef[];
  units: UnitSpawn[];
}

const OK: ActionResult = { ok: true };
const fail = (reason: string): ActionResult => ({ ok: false, reason });
const copyUnit = (unit: UnitState): UnitState => ({ ...unit, pos: { ...unit.pos } });

export class GameEngine implements IGameEngine {
  private readonly setup: GameSetup;
  private readonly grid: GridSystem;
  private readonly turns = new TurnSystem();
  private units: UnitState[] = [];
  private selectedUnitId: string | null = null;
  private events: GameEvent[] = [];

  constructor(setup: Partial<GameSetup> = {}) {
    this.setup = { gridSize: GRID_SIZE, obstacles: OBSTACLES, units: INITIAL_UNITS, ...setup };
    this.grid = new GridSystem(this.setup.gridSize, this.setup.obstacles);
    this.start();
  }

  getState(): GameStateSnapshot {
    return {
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

    const path = this.grid.getPath(unit.pos, to, this.units)!;
    unit.pos = { x: to.x, y: to.y };
    unit.hasMoved = true;
    this.events.push({ type: 'unitMoved', unitId: unit.id, path });
    this.postActionCheck(unit);
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

    this.events.push(...resolveSkill(unit, skill, targetCell, this.units, this.grid));
    this.postActionCheck(unit);
    return OK;
  }

  endPlayerTurn(): ActionResult {
    const unit = this.activePlayerUnit();
    if (typeof unit === 'string') return fail(unit);

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
    this.units = createUnits(this.setup.units);
    this.turns.reset(this.units);
    this.events = [];
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
      this.selectedUnitId = null;
      return;
    }

    if (!activeUnit.alive || (activeUnit.hasMoved && activeUnit.hasAttacked)) {
      this.events.push(...this.turns.advanceTurn(activeUnit, this.units));
      this.syncSelection();
    }
  }
}
