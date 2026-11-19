import { MAPS, PVP_DEFAULT_MAP_ID, PVP_TURN_DURATION_MS } from '../../config/gameConfig';
import type { GameEvent, UnitState } from '../../shared/types';
import { seatToTeam, teamToSeat } from '../../shared/pvpTypes';
import type { ActorContext, ActorType, CommandEnvelope, CommandErrorCode, CommandResult, GameCommand, LegalActionsSnapshot, MatchFinishReason, ObservableMatchState, PlayerSeat, PvPGameplayEvent, PvPHeroClass, PvPTeam, PvPUnitState } from '../../shared/pvpTypes';
import { PvPMatchEngine } from './PvPMatchEngine';

export type ClockFn = () => number;
export interface CreateMatchInput {
  matchId: string; seed: number; mapId?: string; startingTeam?: PvPTeam;
  seatA: { actorId: string; displayName: string; classes: [PvPHeroClass, PvPHeroClass, PvPHeroClass]; actorType?: ActorType };
  seatB: { actorId: string; displayName: string; classes: [PvPHeroClass, PvPHeroClass, PvPHeroClass]; actorType?: ActorType };
}
interface SeatRecord { actorId: string; displayName: string; classes: [string, string, string]; connected: boolean; ready: boolean; rematchRequested: boolean; actorType: ActorType }
interface CachedCommand { fingerprint: string; result: Extract<CommandResult, { ok: true }> }
interface MatchRecord {
  engine: PvPMatchEngine; revision: number; phase: ObservableMatchState['phase']; seats: Record<PlayerSeat, SeatRecord>;
  turnDeadlineMs: number | null; pausedRemainingTurnMs: number | null; winnerTeam: PvPTeam | null; finishReason: MatchFinishReason | null;
  cache: Map<string, CachedCommand>;
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class MatchService {
  private readonly matches = new Map<string, MatchRecord>();
  constructor(private readonly clock: ClockFn = () => Date.now()) {}

  createMatch(input: CreateMatchInput): ObservableMatchState {
    if (this.matches.has(input.matchId)) throw new Error(`Match already exists: ${input.matchId}`);
    const mapId = input.mapId ?? PVP_DEFAULT_MAP_ID;
    if (!MAPS.some((map) => map.id === mapId)) throw new Error(`Unknown PvP map: ${mapId}`);
    const engine = new PvPMatchEngine({ matchId: input.matchId, seed: input.seed, mapId, startingTeam: input.startingTeam, teamA: input.seatA.classes, teamB: input.seatB.classes });
    const record: MatchRecord = {
      engine, revision: 0, phase: 'IN_PROGRESS',
      seats: {
        A: { actorId: input.seatA.actorId, displayName: input.seatA.displayName, classes: [...input.seatA.classes], connected: true, ready: true, rematchRequested: false, actorType: input.seatA.actorType ?? 'human' },
        B: { actorId: input.seatB.actorId, displayName: input.seatB.displayName, classes: [...input.seatB.classes], connected: true, ready: true, rematchRequested: false, actorType: input.seatB.actorType ?? 'human' },
      },
      turnDeadlineMs: this.clock() + PVP_TURN_DURATION_MS, pausedRemainingTurnMs: null, winnerTeam: null, finishReason: null, cache: new Map(),
    };
    this.matches.set(input.matchId, record);
    return this.project(input.matchId, record);
  }

  getMatchState(matchId: string, actor?: ActorContext): ObservableMatchState | null {
    const record = this.matches.get(matchId);
    if (!record) return null;
    const state = this.project(matchId, record);
    if (actor) {
      if (!this.isAuthorized(record, actor)) return null;
      const myTeam = seatToTeam(actor.seat);
      state.viewer = { seat: actor.seat, myTeam, opponentTeam: myTeam === 'teamA' ? 'teamB' : 'teamA', isMyTurn: state.phase === 'IN_PROGRESS' && state.activeTeam === myTeam };
    }
    return clone(state);
  }

  getLegalActions(matchId: string, actor: ActorContext): LegalActionsSnapshot | null {
    const record = this.matches.get(matchId);
    if (!record || !this.isAuthorized(record, actor)) return null;
    const state = this.project(matchId, record);
    const legal = record.engine.getLegalActions(actor.team);
    legal.revision = record.revision;
    legal.isYourTurn = state.phase === 'IN_PROGRESS' && state.activeTeam === actor.team;
    if (!legal.isYourTurn) {
      const none = record.engine.getLegalActions(actor.team);
      return { ...none, revision: record.revision, isYourTurn: false, activeUnitId: null, canMove: false, canAttack: false, canUseSkill: false, canDefend: false, canUndoMove: false, canEndTurn: false, attackRangeCells: [], skillRangeCells: [], moves: [], attacks: [], smartAttacks: [], skills: [], smartSkills: [], defendCommand: null, undoMoveCommand: null, endTurnCommand: null };
    }
    return clone(legal);
  }

  submitAction(matchId: string, actor: ActorContext, envelope: CommandEnvelope): CommandResult {
    const record = this.matches.get(matchId);
    if (!record) return this.failure(envelope, 'MATCH_NOT_FOUND', 'Match not found.', 0);
    if (!this.isAuthorized(record, actor)) return this.failure(envelope, 'UNAUTHORIZED_ACTOR', 'Actor is not authorized for this match.', record.revision);
    const key = `${actor.actorId}:${envelope.commandId}`;
    const fingerprint = JSON.stringify([envelope.expectedRevision, envelope.command]);
    const cached = record.cache.get(key);
    if (cached) {
      if (cached.fingerprint !== fingerprint) return this.failure(envelope, 'COMMAND_CONFLICT', 'commandId was already used with a different payload.', record.revision);
      return { ...clone(cached.result), idempotentReplay: true };
    }
    if (record.phase === 'PAUSED_DISCONNECTED') return this.failure(envelope, 'MATCH_PAUSED', 'Match is paused.', record.revision);
    if (record.phase !== 'IN_PROGRESS') return this.failure(envelope, 'MATCH_NOT_ACTIVE', 'Match is not active.', record.revision);
    const before = this.project(matchId, record);
    if (actor.team !== before.activeTeam) return this.failure(envelope, 'NOT_YOUR_TURN', 'It is not your turn.', record.revision);
    if (envelope.command.unitId !== before.activeUnitId) return this.failure(envelope, 'UNIT_NOT_ACTIVE', 'Command unit is not active.', record.revision);
    if (envelope.expectedRevision !== record.revision) return this.failure(envelope, 'STALE_REVISION', 'Revision is stale.', record.revision);
    if (envelope.matchId !== matchId) return this.failure(envelope, 'INVALID_COMMAND', 'Envelope matchId does not match.', record.revision);

    const action = this.execute(record.engine, envelope.command);
    if (!action.ok) return this.failure(envelope, 'ILLEGAL_ACTION', action.reason, record.revision);
    const events = this.toPvPEvents(record.engine.consumeEvents(), record);
    const after = record.engine.getState();
    record.revision += 1;
    if (after.winner) {
      record.phase = 'FINISHED';
      record.winnerTeam = after.winner === 'player' ? 'teamA' : 'teamB';
      record.finishReason = 'elimination';
      record.turnDeadlineMs = null;
    } else if (after.activeUnitId !== before.activeUnitId) {
      record.turnDeadlineMs = this.clock() + PVP_TURN_DURATION_MS;
    }
    const state = this.project(matchId, record);
    const result: Extract<CommandResult, { ok: true }> = { ok: true, commandId: envelope.commandId, matchId, revision: record.revision, idempotentReplay: false, events, state };
    record.cache.set(key, { fingerprint, result: clone(result) });
    return clone(result);
  }

  pauseMatch(matchId: string): ObservableMatchState | null {
    const record = this.matches.get(matchId);
    if (!record) return null;
    if (record.phase === 'IN_PROGRESS') {
      record.pausedRemainingTurnMs = Math.max(0, (record.turnDeadlineMs ?? this.clock()) - this.clock());
      record.turnDeadlineMs = null;
      record.phase = 'PAUSED_DISCONNECTED';
      record.revision += 1;
    }
    return this.project(matchId, record);
  }

  resumeMatch(matchId: string): ObservableMatchState | null {
    const record = this.matches.get(matchId);
    if (!record) return null;
    if (record.phase === 'PAUSED_DISCONNECTED') {
      record.phase = 'IN_PROGRESS';
      record.turnDeadlineMs = this.clock() + Math.max(1000, record.pausedRemainingTurnMs ?? 0);
      record.pausedRemainingTurnMs = null;
      record.revision += 1;
    }
    return this.project(matchId, record);
  }

  handleTurnTimeout(matchId: string, nowMs = this.clock()): CommandResult | null {
    const record = this.matches.get(matchId);
    if (!record || record.phase !== 'IN_PROGRESS' || record.turnDeadlineMs === null || nowMs < record.turnDeadlineMs) return null;
    const before = this.project(matchId, record);
    if (!before.activeUnitId || !before.activeTeam) return null;
    const unitId = before.activeUnitId;
    const round = before.round;
    const result = record.engine.endTurn();
    if (!result.ok) return null;
    const events = this.toPvPEvents(record.engine.consumeEvents(), record);
    events.unshift({ type: 'turnTimedOut', unitId, team: before.activeTeam, round });
    const ended = events.find((event) => event.type === 'activationEnded');
    if (ended?.type === 'activationEnded') ended.reason = 'timeout';
    const after = record.engine.getState();
    record.revision += 1;
    if (after.winner) {
      record.phase = 'FINISHED'; record.winnerTeam = after.winner === 'player' ? 'teamA' : 'teamB'; record.finishReason = 'elimination'; record.turnDeadlineMs = null;
    } else record.turnDeadlineMs = this.clock() + PVP_TURN_DURATION_MS;
    const envelope: CommandEnvelope = { commandId: `timeout-${record.revision}`, matchId, expectedRevision: record.revision - 1, issuedAtMs: nowMs, command: { type: 'EndTurn', unitId } };
    return { ok: true, commandId: envelope.commandId, matchId, revision: record.revision, idempotentReplay: false, events, state: this.project(matchId, record) };
  }

  forfeitMatch(matchId: string, losingSeat: PlayerSeat, reason: 'forfeit' | 'disconnect_timeout'): PvPGameplayEvent[] {
    const record = this.matches.get(matchId);
    if (!record || record.phase === 'FINISHED') return [];
    const winnerSeat = losingSeat === 'A' ? 'B' : 'A';
    const winnerTeam = seatToTeam(winnerSeat);
    record.phase = 'FINISHED'; record.winnerTeam = winnerTeam; record.finishReason = reason; record.turnDeadlineMs = null; record.pausedRemainingTurnMs = null; record.revision += 1;
    return [{ type: 'battleEnded', winnerTeam, winnerSeat, reason }];
  }

  deleteMatch(matchId: string): void { this.matches.delete(matchId); }

  private execute(engine: PvPMatchEngine, command: GameCommand) {
    switch (command.type) {
      case 'Move': return engine.move(command.to);
      case 'Attack': return engine.attack(command.targetId);
      case 'UseSkill': return engine.useSkill(command.targetCell);
      case 'Defend': return engine.defend();
      case 'UndoMove': return engine.undoMove();
      case 'SmartAttack': return engine.smartAttack(command.targetId);
      case 'SmartUseSkill': return engine.smartUseSkill(command.targetCell);
      case 'EndTurn': return engine.endTurn();
    }
  }

  private isAuthorized(record: MatchRecord, actor: ActorContext): boolean {
    const seat = record.seats[actor.seat];
    return !!seat && seat.actorId === actor.actorId && actor.team === seatToTeam(actor.seat) && actor.type === seat.actorType;
  }

  private failure(envelope: CommandEnvelope, code: CommandErrorCode, message: string, currentRevision: number): CommandResult {
    return { ok: false, commandId: envelope.commandId, matchId: envelope.matchId, code, message, currentRevision, idempotentReplay: false };
  }

  private project(matchId: string, record: MatchRecord): ObservableMatchState {
    const state = record.engine.getState();
    const teamOf = (unit: UnitState): PvPTeam => unit.team === 'player' ? 'teamA' : 'teamB';
    const active = state.units.find((unit) => unit.id === state.activeUnitId);
    const winnerTeam = record.winnerTeam ?? (state.winner ? (state.winner === 'player' ? 'teamA' : 'teamB') : null);
    const seatInfo: ObservableMatchState['seats'] = { A: this.projectSeat('A', record.seats.A), B: this.projectSeat('B', record.seats.B) };
    const units: PvPUnitState[] = state.units.map((unit) => ({ ...clone(unit), type: unit.type as PvPUnitState['type'], team: teamOf(unit), seat: teamToSeat(teamOf(unit)), slot: Number(unit.id.slice(1)) - 1 as 0 | 1 | 2 }));
    const map = MAPS.find((entry) => entry.id === state.mapId)!;
    return { matchId, revision: record.revision, phase: record.phase, mapId: state.mapId, mapName: state.mapName, seed: state.seed, gridSize: state.gridSize, obstacles: clone(state.obstacles), obstacleDefs: clone(state.obstacleDefs), bridgeCells: clone(map.bridgeCells ?? []), seats: seatInfo, units, turnOrder: [...state.turnOrder], turnIndex: state.turnIndex, round: state.round, activeTeam: active ? teamOf(active) : null, activeSeat: active ? teamToSeat(teamOf(active)) : null, activeUnitId: state.activeUnitId, canUndoMove: state.canUndoMove, pendingAttacks: clone(state.pendingAttacks), turnDeadlineMs: record.turnDeadlineMs, pausedRemainingTurnMs: record.pausedRemainingTurnMs, winnerTeam, winnerSeat: winnerTeam ? teamToSeat(winnerTeam) : null, finishReason: record.finishReason };
  }

  private toPvPEvents(events: GameEvent[], record: MatchRecord): PvPGameplayEvent[] {
    const team = (id: string): PvPTeam => id.startsWith('A') ? 'teamA' : 'teamB';
    return events.flatMap((event): PvPGameplayEvent[] => {
      switch (event.type) {
        case 'unitMoved': case 'moveUndone': return [{ ...event, path: clone(event.path) }];
        case 'unitAttacked': case 'unitGuarded': case 'skillUsed': case 'unitHealed': case 'attackPrepared': case 'pendingAttackResolved': case 'attackCancelled': case 'unitDied': return [clone(event) as PvPGameplayEvent];
        case 'activationStarted': return [{ ...event, team: team(event.unitId) }];
        case 'activationEnded': return [{ type: 'activationEnded', unitId: event.unitId, reason: 'completed' }];
        case 'roundStarted': return [clone(event)];
        case 'turnChanged': {
          const s = record.engine.getState(); const active = s.units.find((u) => u.id === s.activeUnitId);
          return active ? [{ type: 'turnChanged', activeTeam: active.team === 'player' ? 'teamA' : 'teamB', round: event.round }] : [];
        }
        case 'battleEnded': {
          const winnerTeam = event.winner === 'player' ? 'teamA' : 'teamB';
          return [{ type: 'battleEnded', winnerTeam, winnerSeat: teamToSeat(winnerTeam), reason: 'elimination' }];
        }
        case 'bossPhaseChanged': case 'gameReset': return [];
      }
    });
  }

  private projectSeat(seat: PlayerSeat, info: SeatRecord): ObservableMatchState['seats'][PlayerSeat] {
    return { seat, team: seatToTeam(seat), actorId: info.actorId, displayName: info.displayName, connected: info.connected, ready: info.ready, selectedClasses: [...info.classes] as PvPHeroClass[], rematchRequested: info.rematchRequested, actorType: info.actorType };
  }
}
