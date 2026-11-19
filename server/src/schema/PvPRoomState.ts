import { schema, t, type SchemaType } from '@colyseus/schema';

export const SeatSchema = schema({
  seat: t.string(), displayName: t.string(), actorType: t.string(), connected: t.boolean(), ready: t.boolean(), rematchRequested: t.boolean(),
  selectedClasses: t.array('string'), reconnectDeadlineMs: t.float64(),
}, 'SeatSchema');
export type SeatSchema = SchemaType<typeof SeatSchema>;

export const PvPUnitSchema = schema({
  id: t.string(), type: t.string(), team: t.string(), slot: t.uint8(), x: t.int8(), y: t.int8(), hp: t.int16(), maxHp: t.int16(), alive: t.boolean(),
  hasMoved: t.boolean(), hasAttacked: t.boolean(), hasActivatedThisRound: t.boolean(), skillCooldown: t.uint8(), isGuarding: t.boolean(),
}, 'PvPUnitSchema');
export type PvPUnitSchema = SchemaType<typeof PvPUnitSchema>;

export const PvPRoomState = schema({
  // Stable lobby and map identity. Terrain remains client/server config keyed by mapId.
  roomPhase: t.string(), inviteCode: t.string(), matchId: t.string(), matchIndex: t.uint16(), mapId: t.string(), seed: t.uint32(), startingTeam: t.string(),
  seats: t.map(SeatSchema),
  // Dynamic tactical state.
  revision: t.uint32(), round: t.uint16(), turnIndex: t.uint8(), activeTeam: t.string(), activeUnitId: t.string(), canUndoMove: t.boolean(),
  turnDeadlineMs: t.float64(), pausedRemainingTurnMs: t.float64(), winnerSeat: t.string(), finishReason: t.string(), turnOrder: t.array('string'), units: t.map(PvPUnitSchema),
}, 'PvPRoomState');
export type PvPRoomState = SchemaType<typeof PvPRoomState>;
