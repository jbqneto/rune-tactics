import type { AttackKind, GridCoord, ObstacleDef, PendingAttack, SkillId, UnitAttributes, UnitType } from './types';

export type PlayerSeat = 'A' | 'B';
export type PvPTeam = 'teamA' | 'teamB';
export type PvPHeroClass = 'knight' | 'archer' | 'mage' | 'cleric';
export type ActorType = 'human' | 'mcp-agent' | 'system';
export interface ActorContext { actorId: string; seat: PlayerSeat; team: PvPTeam; type: ActorType }
export const seatToTeam = (seat: PlayerSeat): PvPTeam => seat === 'A' ? 'teamA' : 'teamB';
export const teamToSeat = (team: PvPTeam): PlayerSeat => team === 'teamA' ? 'A' : 'B';
export type PvPRoomPhase = 'WAITING_FOR_PLAYER' | 'CHARACTER_SELECTION' | 'WAITING_FOR_READY' | 'STARTING' | 'IN_PROGRESS' | 'PAUSED_DISCONNECTED' | 'FINISHED';
export type MatchFinishReason = 'elimination' | 'disconnect_timeout' | 'forfeit' | 'aborted';
export type GameCommand =
  | { type: 'Move'; unitId: string; to: GridCoord } | { type: 'Attack'; unitId: string; targetId: string }
  | { type: 'UseSkill'; unitId: string; targetCell: GridCoord } | { type: 'Defend'; unitId: string }
  | { type: 'UndoMove'; unitId: string } | { type: 'SmartAttack'; unitId: string; targetId: string }
  | { type: 'SmartUseSkill'; unitId: string; targetCell: GridCoord } | { type: 'EndTurn'; unitId: string };
export interface CommandEnvelope { commandId: string; matchId: string; expectedRevision: number; issuedAtMs: number; command: GameCommand }
export type PvPGameplayEvent =
  | { type: 'unitMoved'; unitId: string; path: GridCoord[] } | { type: 'moveUndone'; unitId: string; path: GridCoord[] }
  | { type: 'unitAttacked'; attackerId: string; targetId: string; damage: number; targetHpRemaining: number; wasGuarded?: boolean; isRanged?: boolean; skillId?: SkillId; pendingAttackId?: string }
  | { type: 'unitGuarded'; unitId: string }
  | { type: 'skillUsed'; casterId: string; skillId: SkillId; targetCell: GridCoord; affectedUnitIds: string[] }
  | { type: 'unitHealed'; casterId: string; targetId: string; amount: number; targetHpAfter: number }
  | { type: 'attackPrepared'; pendingAttack: PendingAttack }
  | { type: 'pendingAttackResolved'; pendingAttackId: string; casterId: string; skillName: string; targetCells: GridCoord[]; affectedUnitIds: string[] }
  | { type: 'attackCancelled'; pendingAttackId: string; casterId: string; reason: 'caster_died' }
  | { type: 'unitDied'; unitId: string }
  | { type: 'activationStarted'; unitId: string; team: PvPTeam; round: number }
  | { type: 'activationEnded'; unitId: string; reason: 'completed' | 'manual' | 'timeout' | 'died' }
  | { type: 'roundStarted'; round: number } | { type: 'turnChanged'; activeTeam: PvPTeam; round: number }
  | { type: 'turnTimedOut'; unitId: string; team: PvPTeam; round: number }
  | { type: 'battleEnded'; winnerTeam: PvPTeam; winnerSeat: PlayerSeat; reason: MatchFinishReason };
export type CommandErrorCode = 'MATCH_NOT_FOUND' | 'MATCH_NOT_ACTIVE' | 'MATCH_PAUSED' | 'UNAUTHORIZED_ACTOR' | 'NOT_YOUR_TURN' | 'UNIT_NOT_ACTIVE' | 'STALE_REVISION' | 'COMMAND_CONFLICT' | 'ILLEGAL_ACTION' | 'INVALID_COMMAND';
export interface PvPUnitState { id: string; name: string; type: PvPHeroClass; team: PvPTeam; seat: PlayerSeat; slot: 0 | 1 | 2; pos: GridCoord; hp: number; maxHp: number; attributes: UnitAttributes; baseHp: number; baseArmor: number; basePower: number; attackKind: AttackKind; damage: number; armor: number; moveRange: number; attackRange: number; alive: boolean; hasMoved: boolean; hasAttacked: boolean; hasActivatedThisRound: boolean; skillId: SkillId | null; skillName: string | null; skillCooldown: number; isGuarding: boolean; portraitPath?: string }
export interface PvPSeatInfo { seat: PlayerSeat; team: PvPTeam; actorId: string | null; displayName: string; connected: boolean; ready: boolean; selectedClasses: PvPHeroClass[]; rematchRequested: boolean; actorType?: ActorType }
export interface ObservableMatchState { matchId: string; revision: number; phase: PvPRoomPhase; mapId: string; mapName: string; seed: number; gridSize: number; obstacles: GridCoord[]; obstacleDefs: ObstacleDef[]; bridgeCells: GridCoord[]; seats: { A: PvPSeatInfo; B: PvPSeatInfo }; units: PvPUnitState[]; turnOrder: string[]; turnIndex: number; round: number; activeTeam: PvPTeam | null; activeSeat: PlayerSeat | null; activeUnitId: string | null; canUndoMove: boolean; pendingAttacks: PendingAttack[]; turnDeadlineMs: number | null; pausedRemainingTurnMs: number | null; winnerTeam: PvPTeam | null; winnerSeat: PlayerSeat | null; finishReason: MatchFinishReason | null; viewer?: { seat: PlayerSeat; myTeam: PvPTeam; opponentTeam: PvPTeam; isMyTurn: boolean } }
export interface MoveLegalOption { to: GridCoord; path: GridCoord[]; steps: number; command: Extract<GameCommand, { type: 'Move' }> }
export interface AttackLegalOption { targetId: string; targetPos: GridCoord; targetType: UnitType; estimatedDamage: number; targetHp: number; wouldKill: boolean; command: Extract<GameCommand, { type: 'Attack' }> }
export interface SmartAttackLegalOption { targetId: string; targetPos: GridCoord; path: GridCoord[]; steps: number; estimatedDamage: number; wouldKill: boolean; command: Extract<GameCommand, { type: 'SmartAttack' }> }
export interface SkillLegalOption { targetCell: GridCoord; skillId: SkillId; areaCells: GridCoord[]; affectedUnitIds: string[]; command: Extract<GameCommand, { type: 'UseSkill' }> }
export interface SmartSkillLegalOption { targetCell: GridCoord; skillId: SkillId; path: GridCoord[]; steps: number; areaCells: GridCoord[]; affectedUnitIds: string[]; command: Extract<GameCommand, { type: 'SmartUseSkill' }> }
export interface LegalActionsSnapshot { matchId: string; revision: number; actorSeat: PlayerSeat; actorTeam: PvPTeam; isYourTurn: boolean; activeUnitId: string | null; canMove: boolean; canAttack: boolean; canUseSkill: boolean; canDefend: boolean; canUndoMove: boolean; canEndTurn: boolean; attackRangeCells: GridCoord[]; skillRangeCells: GridCoord[]; moves: MoveLegalOption[]; attacks: AttackLegalOption[]; smartAttacks: SmartAttackLegalOption[]; skills: SkillLegalOption[]; smartSkills: SmartSkillLegalOption[]; defendCommand: Extract<GameCommand, { type: 'Defend' }> | null; undoMoveCommand: Extract<GameCommand, { type: 'UndoMove' }> | null; endTurnCommand: Extract<GameCommand, { type: 'EndTurn' }> | null }
export type CommandResult = { ok: true; commandId: string; matchId: string; revision: number; idempotentReplay: boolean; events: PvPGameplayEvent[]; state: ObservableMatchState } | { ok: false; commandId: string; matchId: string; code: CommandErrorCode; message: string; currentRevision: number; idempotentReplay: boolean };
