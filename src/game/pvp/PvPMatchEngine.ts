import { MAPS, PVP_DEFAULT_MAP_ID, PVP_TEAM_SIZE, PVP_HERO_CLASSES, type UnitSpawn } from '../../config/gameConfig';
import type { GridCoord } from '../../shared/types';
import type { LegalActionsSnapshot, PlayerSeat, PvPTeam, PvPHeroClass } from '../../shared/pvpTypes';
import { teamToSeat } from '../../shared/pvpTypes';
import { GameEngine } from '../GameEngine';
import { computeDamage, getSkill, getSkillAreaCells } from '../combat/CombatSystem';
import { GridSystem, sameCell } from '../grid/GridSystem';
import { createRng } from '../maps/MapSystem';

export interface PvPMatchSetup { matchId?: string; seed: number; teamA: readonly PvPHeroClass[]; teamB: readonly PvPHeroClass[]; startingTeam?: PvPTeam; mapId?: string }

export class PvPMatchEngine {
  readonly matchId: string;
  readonly seed: number;
  private readonly engine: GameEngine;
  private readonly startingTeam: PvPTeam;

  constructor(setup: PvPMatchSetup) {
    this.matchId = setup.matchId ?? 'local-pvp';
    this.seed = setup.seed >>> 0;
    this.startingTeam = setup.startingTeam ?? 'teamA';
    for (const picks of [setup.teamA, setup.teamB]) {
      if (picks.length !== PVP_TEAM_SIZE || new Set(picks).size !== PVP_TEAM_SIZE || picks.some((c) => !(PVP_HERO_CLASSES as readonly string[]).includes(c))) {
        throw new Error('Each PvP team must select three unique hero classes.');
      }
    }
    const map = MAPS.find((m) => m.id === (setup.mapId ?? PVP_DEFAULT_MAP_ID));
    if (!map) throw new Error(`Unknown PvP map: ${setup.mapId}`);
    const rng = createRng(this.seed);
    const free = map.playerSpawnRows.flatMap((y) => Array.from({ length: map.gridSize }, (_, x) => ({ x, y })))
      .filter((p) => !map.obstacles.some((o) => sameCell(o.pos, p)));
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
    const sideA = setup.teamA.map((type, slot): UnitSpawn => ({ id: `A${slot + 1}`, type, team: 'player', pos: free[slot] }));
    const sideB = setup.teamB.map((type, slot): UnitSpawn => ({ id: `B${slot + 1}`, type, team: 'enemy', pos: { x: 11 - free[slot].x, y: 11 - free[slot].y } }));
    this.engine = new GameEngine({ seed: this.seed, mapId: map.id, units: [...sideA, ...sideB], randomizeSpawns: false, mode: 'pvp', allowEnemyActions: true, startingTeam: this.startingTeam === 'teamA' ? 'player' : 'enemy' });
  }

  getState() { return this.engine.getState(); }
  consumeEvents() { return this.engine.consumeEvents(); }
  getLegalActions(team: PvPTeam): LegalActionsSnapshot {
    const s = this.engine.getState();
    const active = s.activeUnitId ? s.units.find((u) => u.id === s.activeUnitId) : undefined;
    const yourTurn = !!active && ((team === 'teamA') === (active.team === 'player')) && !s.winner;
    const actorSeat: PlayerSeat = teamToSeat(team);
    const empty: LegalActionsSnapshot = { matchId: this.matchId, revision: 0, actorSeat, actorTeam: team, isYourTurn: yourTurn, activeUnitId: yourTurn ? active!.id : null, canMove: false, canAttack: false, canUseSkill: false, canDefend: false, canUndoMove: false, canEndTurn: false, attackRangeCells: [], skillRangeCells: [], moves: [], attacks: [], smartAttacks: [], skills: [], smartSkills: [], defendCommand: null, undoMoveCommand: null, endTurnCommand: null };
    if (!yourTurn) return empty;
    const id = active!.id;
    const reachable = this.engine.getReachableCells(id);
    const moves = reachable.flatMap((to) => { const path = this.engine.getPath(active!.pos, to); return path ? [{ to, path, steps: path.length - 1, command: { type: 'Move' as const, unitId: id, to } }] : []; });
    const targets = this.engine.getAttackableTargets(id);
    const attacks = targets.map((u) => { const damage = computeDamage(active!, u, active!.basePower, active!.attackKind); return { targetId: u.id, targetPos: u.pos, targetType: u.type, estimatedDamage: damage, targetHp: u.hp, wouldKill: damage >= u.hp, command: { type: 'Attack' as const, unitId: id, targetId: u.id } }; });
    const smartAttacks = s.units.filter((u) => u.alive && u.team !== active!.team).flatMap((u) => { const plan = this.engine.getSmartAttackPlan(u.id); if (!plan) return []; const damage = computeDamage(active!, u, active!.basePower, active!.attackKind); return [{ targetId: u.id, targetPos: u.pos, path: plan.path, steps: plan.path.length - 1, estimatedDamage: damage, wouldKill: damage >= u.hp, command: { type: 'SmartAttack' as const, unitId: id, targetId: u.id } }]; });
    const skillId = active!.skillId; const skill = getSkill(active!); const skillCells = this.engine.getSkillTargetCells(id);
    const skills = skill && skillId ? skillCells.map((targetCell) => { const areaCells = getSkillAreaCells(skill, targetCell, new GridSystem(s.gridSize, s.obstacleDefs)); const affectedUnitIds = s.units.filter((u) => u.alive && (skill.targetTeam === 'ally' ? u.team === active!.team && u.hp < u.maxHp : u.team !== active!.team) && areaCells.some((c) => sameCell(c, u.pos))).map((u) => u.id); return { targetCell, skillId, areaCells, affectedUnitIds, command: { type: 'UseSkill' as const, unitId: id, targetCell } }; }) : [];
    const smartSkills = skill && skillId ? Array.from({ length: s.gridSize * s.gridSize }, (_, i) => ({ x: i % s.gridSize, y: Math.floor(i / s.gridSize) })).flatMap((targetCell) => { const plan = this.engine.getSmartSkillPlan(targetCell); if (!plan) return []; const areaCells = getSkillAreaCells(skill, targetCell, new GridSystem(s.gridSize, s.obstacleDefs)); const affectedUnitIds = s.units.filter((u) => u.alive && (skill.targetTeam === 'ally' ? u.team === active!.team && u.hp < u.maxHp : u.team !== active!.team) && areaCells.some((c) => sameCell(c, u.pos))).map((u) => u.id); return [{ targetCell, skillId: skillId!, path: plan.path, steps: plan.path.length - 1, areaCells, affectedUnitIds, command: { type: 'SmartUseSkill' as const, unitId: id, targetCell } }]; }) : [];
    const canMove = !active!.hasMoved, canAct = !active!.hasAttacked;
    return { ...empty, canMove, canAttack: canAct && attacks.length > 0, canUseSkill: canAct && skills.length > 0, canDefend: canAct, canUndoMove: s.canUndoMove, canEndTurn: true, attackRangeCells: canAct ? this.engine.getAttackRangeCells(id) : [], skillRangeCells: canAct ? this.engine.getSkillRangeCells(id) : [], moves: canMove ? moves : [], attacks: canAct ? attacks : [], smartAttacks: canAct ? smartAttacks : [], skills: canAct ? skills : [], smartSkills: canAct ? smartSkills : [], defendCommand: canAct ? { type: 'Defend', unitId: id } : null, undoMoveCommand: s.canUndoMove ? { type: 'UndoMove', unitId: id } : null, endTurnCommand: { type: 'EndTurn', unitId: id } };
  }
  move(to: GridCoord) { return this.engine.moveSelectedUnit(to); }
  undoMove() { return this.engine.undoMove(); }
  attack(targetId: string) { return this.engine.attackTarget(targetId); }
  smartAttack(targetId: string) { return this.engine.smartAttack(targetId); }
  useSkill(cell: GridCoord) { return this.engine.useSkill(cell); }
  smartUseSkill(cell: GridCoord) { return this.engine.smartUseSkill(cell); }
  defend() { return this.engine.defend(); }
  endTurn() { return this.engine.endPlayerTurn(); }
}
