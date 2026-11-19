import { Room, ServerError, type Client } from 'colyseus';
import { matchMaker } from 'colyseus';
import { randomInt } from 'node:crypto';
import { PVP_DEFAULT_MAP_ID, PVP_HERO_CLASSES, PVP_RECONNECT_GRACE_SECONDS } from '../../../src/config/gameConfig.js';
import type { ActorContext, CommandEnvelope, PlayerSeat, PvPHeroClass, PvPTeam } from '../../../src/shared/pvpTypes.js';
import { seatToTeam } from '../../../src/shared/pvpTypes.js';
import { MatchService } from '../../../src/game/pvp/MatchService.js';
import { SessionTokenService, sessionTokens, type SessionIdentity } from '../auth/SessionTokenService.js';
import { PvPRoomState, PvPUnitSchema, SeatSchema } from '../schema/PvPRoomState.js';

const matchService = new MatchService();
export interface RoomServices { tokens?: SessionTokenService; matches?: MatchService }
let configured: RoomServices = {};
export function configurePvPRoom(services: RoomServices): void { configured = services; }

interface SeatRecord extends SessionIdentity { seat: PlayerSeat; connected: boolean; selectedClasses: PvPHeroClass[]; ready: boolean; rematchRequested: boolean; sessionId: string | null }
type RoomClient = Client & { auth?: SessionIdentity };

export class PvPRoom extends Room<any> {
  static roomIndex = new Map<string, { roomId: string; phase: string; playersCount: number }>();
  private readonly seats = new Map<PlayerSeat, SeatRecord>();
  private readonly pendingSeatByActor = new Map<string, PlayerSeat>();
  private readonly clientSeat = new Map<string, PlayerSeat>();
  private readonly tokens = configured.tokens ?? sessionTokens;
  private readonly matches = configured.matches ?? matchService;
  private opQueue: Promise<void> = Promise.resolve();
  private matchId: string | null = null;
  private matchIndex = 0;
  private startingTeam: PvPTeam = 'teamA';
  private turnTimer: { clear(): void } | null = null;
  private reconnectTimer: { clear(): void } | null = null;
  private reconnectDeadlineMs = 0;

  static async onAuth(token: string, options: any): Promise<SessionIdentity> {
    const identity = (configured.tokens ?? sessionTokens).verifyToken(options?.sessionToken ?? token);
    if (!identity) throw new ServerError(4001, 'Invalid or expired session token');
    const inviteCode = typeof options?.inviteCode === 'string' ? options.inviteCode.toUpperCase() : '';
    const indexed = PvPRoom.roomIndex.get(inviteCode);
    if (!indexed) throw new ServerError(4004, 'Unknown invite code');
    const room = matchMaker.getLocalRoomById(indexed.roomId) as PvPRoom | undefined;
    if (!room || room.state.inviteCode !== inviteCode) throw new ServerError(4004, 'Room is unavailable');
    room.reserveIdentity(identity);
    return identity;
  }

  async onCreate(options: { inviteCode: string }): Promise<void> {
    this.maxClients = 2;
    this.autoDispose = false;
    await this.setPrivate(true);
    this.setState(new PvPRoomState());
    this.state.roomPhase = 'WAITING_FOR_PLAYER';
    this.state.inviteCode = options.inviteCode;
    this.state.mapId = PVP_DEFAULT_MAP_ID;
    this.state.startingTeam = this.startingTeam;
    this.state.seats.set('A', this.newSeatSchema('A'));
    this.state.seats.set('B', this.newSeatSchema('B'));
    await this.setMetadata({ inviteCode: options.inviteCode, phase: this.state.roomPhase });
    this.tokens.registerRoom(options.inviteCode, { roomId: this.roomId, phase: this.state.roomPhase, playersCount: 0 });
    PvPRoom.roomIndex.set(options.inviteCode, { roomId: this.roomId, phase: this.state.roomPhase, playersCount: 0 });
    this.installMessageHandlers();
  }

  reserveIdentity(identity: SessionIdentity): void {
    const existing = [...this.seats.values()].find((seat) => seat.actorId === identity.actorId);
    if (existing) { this.pendingSeatByActor.set(identity.actorId, existing.seat); return; }
    const occupied = new Set([...this.seats.values()].map((seat) => seat.seat).concat([...this.pendingSeatByActor.values()]));
    const seat: PlayerSeat | undefined = !occupied.has('A') ? 'A' : !occupied.has('B') ? 'B' : undefined;
    if (!seat) throw new ServerError(4003, 'Match room is full');
    this.pendingSeatByActor.set(identity.actorId, seat);
  }

  async onJoin(client: RoomClient): Promise<void> {
    await this.enqueue(async () => {
      const identity = client.auth;
      if (!identity) throw new Error('Authenticated session missing from client');
      let seat = [...this.seats.values()].find((entry) => entry.actorId === identity.actorId)?.seat;
      seat ??= this.pendingSeatByActor.get(identity.actorId);
      if (!seat) throw new Error('No reserved player seat');
      this.pendingSeatByActor.delete(identity.actorId);
      const previous = this.seats.get(seat);
      const entry: SeatRecord = previous ?? { ...identity, seat, connected: true, selectedClasses: [], ready: false, rematchRequested: false, sessionId: null };
      entry.connected = true;
      entry.sessionId = client.sessionId;
      this.seats.set(seat, entry);
      this.clientSeat.set(client.sessionId, seat);
      this.syncSeat(seat);
      if (seat === 'B' && this.state.roomPhase === 'WAITING_FOR_PLAYER') await this.setPhase('CHARACTER_SELECTION');
      else await this.updateRegistry();
      this.broadcastDraftState();
    });
  }

  async onDrop(client: RoomClient, _code?: number): Promise<void> {
    await this.enqueue(async () => {
      const seat = this.clientSeat.get(client.sessionId);
      const record = seat && this.seats.get(seat);
      if (!seat || !record) return;
      record.connected = false;
      this.syncSeat(seat);
      if (this.state.roomPhase === 'IN_PROGRESS' && this.matchId) {
        this.matches.pauseMatch(this.matchId);
        this.clearTurnTimer();
        this.reconnectDeadlineMs = Date.now() + PVP_RECONNECT_GRACE_SECONDS * 1000;
        this.state.roomPhase = 'PAUSED_DISCONNECTED';
        this.state.pausedRemainingTurnMs = this.matches.getMatchState(this.matchId)?.pausedRemainingTurnMs ?? 0;
        this.state.turnDeadlineMs = 0;
        this.syncMatchState();
        await this.updateRegistry();
        this.reconnectTimer = this.clock.setTimeout(() => { void this.enqueue(() => this.disconnectExpired(seat)); }, PVP_RECONNECT_GRACE_SECONDS * 1000);
      }
    });
    try { await this.allowReconnection(client, PVP_RECONNECT_GRACE_SECONDS); }
    catch { /* onLeave finalizes the disconnected seat. */ }
  }

  async onReconnect(client: RoomClient): Promise<void> {
    await this.enqueue(async () => {
      const seat = this.clientSeat.get(client.sessionId) ?? [...this.seats.values()].find((entry) => entry.actorId === client.auth?.actorId)?.seat;
      if (!seat) return;
      const record = this.seats.get(seat)!;
      record.connected = true;
      record.sessionId = client.sessionId;
      this.clientSeat.set(client.sessionId, seat);
      this.syncSeat(seat);
      this.reconnectTimer?.clear(); this.reconnectTimer = null; this.reconnectDeadlineMs = 0;
      if ([...this.seats.values()].every((entry) => entry.connected) && this.state.roomPhase === 'PAUSED_DISCONNECTED' && this.matchId) {
        this.matches.resumeMatch(this.matchId);
        this.state.roomPhase = 'IN_PROGRESS';
        this.syncMatchState();
        this.scheduleTurnTimer();
        await this.updateRegistry();
      }
      this.clock.setTimeout(() => { void this.enqueue(() => this.sendMatchInit(client, seat)); }, 50);
    });
  }

  async onLeave(client: RoomClient, code?: number): Promise<void> {
    await this.enqueue(async () => {
      const seat = this.clientSeat.get(client.sessionId);
      if (!seat) return;
      const record = this.seats.get(seat);
      if (this.state.roomPhase === 'IN_PROGRESS' || this.state.roomPhase === 'PAUSED_DISCONNECTED') {
        const reason = code === 1000 ? 'forfeit' : 'disconnect_timeout';
        const events = this.matchId ? this.matches.forfeitMatch(this.matchId, seat, reason) : [];
        this.state.roomPhase = 'FINISHED';
        this.clearTurnTimer(); this.reconnectTimer?.clear();
        this.state.winnerSeat = seat === 'A' ? 'B' : 'A'; this.state.finishReason = reason;
        this.syncMatchState();
        if (events.length) this.broadcast('matchEvents', { revision: this.state.revision, events, state: this.matches.getMatchState(this.matchId!) });
      } else if (this.state.roomPhase === 'FINISHED') {
        if (record) record.rematchRequested = false;
        this.broadcastDraftState();
      } else if (seat === 'A' && this.state.roomPhase === 'WAITING_FOR_PLAYER') {
        this.autoDispose = true;
      }
      this.clientSeat.delete(client.sessionId);
      if (record) { record.connected = false; record.sessionId = null; this.syncSeat(seat); }
      await this.updateRegistry();
    });
  }

  onDispose(): void {
    this.clearTurnTimer(); this.reconnectTimer?.clear();
    this.tokens.removeRoom(this.state.inviteCode);
    PvPRoom.roomIndex.delete(this.state.inviteCode);
    if (this.matchId) this.matches.deleteMatch(this.matchId);
  }

  private installMessageHandlers(): void {
    this.onMessage('selectClasses', (client: RoomClient, message: unknown) => this.enqueue(() => this.selectClasses(client, message)));
    this.onMessage('setReady', (client: RoomClient, message: unknown) => this.enqueue(() => this.setReady(client, message)));
    this.onMessage('command', (client: RoomClient, message: CommandEnvelope) => this.enqueue(() => this.submitCommand(client, message)));
    this.onMessage('forfeit', (client: RoomClient) => this.enqueue(() => this.forfeit(client)));
    this.onMessage('requestRematch', (client: RoomClient) => this.enqueue(() => this.requestRematch(client)));
    this.onMessage('cancelRematch', (client: RoomClient) => this.enqueue(() => this.cancelRematch(client)));
  }

  private async selectClasses(client: RoomClient, input: unknown): Promise<void> {
    if (this.state.roomPhase !== 'CHARACTER_SELECTION' && this.state.roomPhase !== 'WAITING_FOR_READY') return;
    const seat = this.getSeat(client); const record = seat && this.seats.get(seat);
    if (!seat || !record || !Array.isArray(input) || input.length !== 3 || new Set(input).size !== 3 || input.some((item) => !PVP_HERO_CLASSES.includes(item))) return;
    record.selectedClasses = [...input] as PvPHeroClass[]; record.ready = false;
    for (const entry of this.seats.values()) entry.ready = false;
    this.syncSeat(seat);
    const allDrafted = ['A', 'B'].every((key) => (this.seats.get(key as PlayerSeat)?.selectedClasses.length ?? 0) === 3);
    await this.setPhase(allDrafted ? 'WAITING_FOR_READY' : 'CHARACTER_SELECTION');
    this.broadcastDraftState();
  }

  private async setReady(client: RoomClient, payload: unknown): Promise<void> {
    if (this.state.roomPhase !== 'CHARACTER_SELECTION' && this.state.roomPhase !== 'WAITING_FOR_READY') return;
    const seat = this.getSeat(client); const record = seat && this.seats.get(seat);
    if (!record || typeof payload !== 'boolean' || record.selectedClasses.length !== 3) return;
    record.ready = payload;
    this.syncSeat(seat!);
    if (!payload) { await this.setPhase('CHARACTER_SELECTION'); this.broadcastDraftState(); return; }
    if ([...this.seats.values()].every((entry) => entry.selectedClasses.length === 3)) await this.setPhase('WAITING_FOR_READY');
    this.broadcastDraftState();
    if ([...this.seats.values()].length === 2 && [...this.seats.values()].every((entry) => entry.ready)) await this.startMatch();
  }

  private async startMatch(): Promise<void> {
    const a = this.seats.get('A'); const b = this.seats.get('B');
    if (!a || !b) return;
    await this.setPhase('STARTING');
    this.matchIndex += 1;
    this.matchId = `${this.roomId}-${this.matchIndex}`;
    const seed = randomSeed();
    this.state.seed = seed;
    this.state.mapId = PVP_DEFAULT_MAP_ID;
    const state = this.matches.createMatch({ matchId: this.matchId, seed, startingTeam: this.startingTeam, seatA: { actorId: a.actorId, displayName: a.displayName, actorType: a.actorType, classes: a.selectedClasses as [PvPHeroClass, PvPHeroClass, PvPHeroClass] }, seatB: { actorId: b.actorId, displayName: b.displayName, actorType: b.actorType, classes: b.selectedClasses as [PvPHeroClass, PvPHeroClass, PvPHeroClass] } });
    this.state.matchId = this.matchId;
    this.state.roomPhase = 'IN_PROGRESS';
    this.applyState(state);
    for (const entry of this.seats.values()) if (entry.sessionId) { const client = this.clients.find((c) => c.sessionId === entry.sessionId); if (client) this.sendMatchInit(client, entry.seat); }
    this.broadcastLegalActions();
    await this.updateRegistry();
    this.scheduleTurnTimer();
  }

  private async submitCommand(client: RoomClient, envelope: CommandEnvelope): Promise<void> {
    const seat = this.getSeat(client); const record = seat && this.seats.get(seat);
    if (!record || !this.matchId) return;
    const result = this.matches.submitAction(this.matchId, this.actor(record), envelope);
    client.send('commandResult', result);
    if (!result.ok) return;
    this.applyState(result.state);
    this.broadcast('matchEvents', { revision: result.revision, events: result.events, state: result.state });
    this.broadcastLegalActions();
    if (result.state.phase === 'FINISHED') { await this.setPhase('FINISHED'); this.clearTurnTimer(); }
    else this.scheduleTurnTimer();
    await this.updateRegistry();
  }

  private async forfeit(client: RoomClient): Promise<void> {
    const seat = this.getSeat(client);
    if (!seat || !this.matchId) return;
    const events = this.matches.forfeitMatch(this.matchId, seat, 'forfeit');
    if (!events.length) return;
    await this.setPhase('FINISHED'); this.clearTurnTimer(); this.syncMatchState();
    const state = this.matches.getMatchState(this.matchId)!;
    this.broadcast('matchEvents', { revision: state.revision, events, state });
    this.broadcastLegalActions();
  }

  private async requestRematch(client: RoomClient): Promise<void> {
    if (this.state.roomPhase !== 'FINISHED') return;
    const seat = this.getSeat(client); const record = seat && this.seats.get(seat);
    if (!record) return;
    record.rematchRequested = true; this.syncSeat(seat!); this.broadcastDraftState();
    if ([...this.seats.values()].every((entry) => entry.rematchRequested)) {
      if (this.matchId) this.matches.deleteMatch(this.matchId);
      this.matchId = null; this.state.matchId = ''; this.startingTeam = this.startingTeam === 'teamA' ? 'teamB' : 'teamA';
      this.state.startingTeam = this.startingTeam; this.state.revision = 0; this.state.units.clear(); this.state.turnOrder.clear();
      this.state.seed = 0; this.state.round = 0; this.state.turnIndex = 0; this.state.activeTeam = ''; this.state.activeUnitId = ''; this.state.canUndoMove = false;
      this.state.turnDeadlineMs = 0; this.state.pausedRemainingTurnMs = 0; this.state.winnerSeat = ''; this.state.finishReason = '';
      for (const entry of this.seats.values()) { entry.selectedClasses = []; entry.ready = false; entry.rematchRequested = false; this.syncSeat(entry.seat); }
      await this.setPhase('CHARACTER_SELECTION'); this.broadcastDraftState();
    }
  }

  private async cancelRematch(client: RoomClient): Promise<void> {
    const seat = this.getSeat(client); const record = seat && this.seats.get(seat);
    if (!record || this.state.roomPhase !== 'FINISHED') return;
    record.rematchRequested = false; this.syncSeat(seat!); this.broadcastDraftState();
  }

  private async disconnectExpired(seat: PlayerSeat): Promise<void> {
    if (this.state.roomPhase !== 'PAUSED_DISCONNECTED' || Date.now() < this.reconnectDeadlineMs || !this.matchId) return;
    const events = this.matches.forfeitMatch(this.matchId, seat, 'disconnect_timeout');
    if (!events.length) return;
    await this.setPhase('FINISHED'); this.state.winnerSeat = seat === 'A' ? 'B' : 'A'; this.state.finishReason = 'disconnect_timeout'; this.syncMatchState();
    this.broadcast('matchEvents', { revision: this.state.revision, events, state: this.matches.getMatchState(this.matchId) });
  }

  private scheduleTurnTimer(): void {
    this.clearTurnTimer();
    if (!this.matchId || this.state.roomPhase !== 'IN_PROGRESS') return;
    const deadline = this.matches.getMatchState(this.matchId)?.turnDeadlineMs;
    if (deadline == null) return;
    this.turnTimer = this.clock.setTimeout(() => { void this.enqueue(async () => {
      if (!this.matchId) return;
      const result = this.matches.handleTurnTimeout(this.matchId, Date.now());
      if (!result?.ok) return;
      this.applyState(result.state);
      this.broadcast('matchEvents', { revision: result.revision, events: result.events, state: result.state });
      this.broadcastLegalActions();
      if (result.state.phase === 'FINISHED') await this.setPhase('FINISHED'); else this.scheduleTurnTimer();
      await this.updateRegistry();
    }); }, Math.max(0, deadline - Date.now()));
  }

  private clearTurnTimer(): void { this.turnTimer?.clear(); this.turnTimer = null; }
  private async setPhase(phase: string): Promise<void> { this.state.roomPhase = phase; await this.setMetadata({ ...this.metadata, inviteCode: this.state.inviteCode, phase }); await this.updateRegistry(); }
  private async updateRegistry(): Promise<void> {
    const entry = { roomId: this.roomId, phase: this.state.roomPhase, playersCount: [...this.seats.values()].filter((seat) => seat.connected).length };
    this.tokens.updateRoom(this.state.inviteCode, entry); PvPRoom.roomIndex.set(this.state.inviteCode, entry);
  }
  private getSeat(client: RoomClient): PlayerSeat | undefined { return this.clientSeat.get(client.sessionId); }
  private actor(record: SeatRecord): ActorContext { return { actorId: record.actorId, seat: record.seat, team: seatToTeam(record.seat), type: record.actorType }; }
  private syncSeat(seat: PlayerSeat): void {
    const source = this.seats.get(seat); if (!source) return;
    let target = this.state.seats.get(seat); if (!target) { target = this.newSeatSchema(seat); this.state.seats.set(seat, target); }
    target.displayName = source.displayName; target.actorType = source.actorType; target.connected = source.connected; target.ready = source.ready; target.rematchRequested = source.rematchRequested; target.selectedClasses.splice(0, target.selectedClasses.length, ...source.selectedClasses); target.reconnectDeadlineMs = this.reconnectDeadlineMs;
  }
  private newSeatSchema(seat: PlayerSeat): InstanceType<typeof SeatSchema> { return new SeatSchema({ seat, displayName: '', actorType: '', connected: false, ready: false, rematchRequested: false, selectedClasses: [], reconnectDeadlineMs: 0 }); }
  private applyState(state: ReturnType<MatchService['getMatchState']> & {}): void {
    if (!state) return;
    this.state.revision = state.revision; this.state.round = state.round; this.state.turnIndex = state.turnIndex; this.state.activeTeam = state.activeTeam ?? ''; this.state.activeUnitId = state.activeUnitId ?? ''; this.state.canUndoMove = state.canUndoMove; this.state.turnDeadlineMs = state.turnDeadlineMs ?? 0; this.state.pausedRemainingTurnMs = state.pausedRemainingTurnMs ?? 0; this.state.winnerSeat = state.winnerSeat ?? ''; this.state.finishReason = state.finishReason ?? ''; this.state.seed = state.seed; this.state.mapId = state.mapId; this.state.turnOrder.splice(0, this.state.turnOrder.length, ...state.turnOrder);
    const desired = new Set(state.units.map((u) => u.id)); for (const id of [...this.state.units.keys()]) if (!desired.has(id)) this.state.units.delete(id);
    for (const unit of state.units) { let row = this.state.units.get(unit.id); if (!row) { row = new PvPUnitSchema(); this.state.units.set(unit.id, row); } Object.assign(row, { id: unit.id, type: unit.type, team: unit.team, slot: unit.slot, x: unit.pos.x, y: unit.pos.y, hp: unit.hp, maxHp: unit.maxHp, alive: unit.alive, hasMoved: unit.hasMoved, hasAttacked: unit.hasAttacked, hasActivatedThisRound: unit.hasActivatedThisRound, skillCooldown: unit.skillCooldown, isGuarding: unit.isGuarding }); }
    for (const seat of ['A', 'B'] as PlayerSeat[]) this.syncSeat(seat);
  }
  private syncMatchState(): void { if (this.matchId) { const state = this.matches.getMatchState(this.matchId); if (state) this.applyState(state); } }
  private broadcastDraftState(): void { this.broadcast('lobbyState', { phase: this.state.roomPhase, seats: { A: this.seatPayload('A'), B: this.seatPayload('B') }, startingTeam: this.startingTeam }); }
  private seatPayload(seat: PlayerSeat) { const s = this.seats.get(seat); return { seat, connected: s?.connected ?? false, ready: s?.ready ?? false, selectedClasses: s?.selectedClasses ?? [], rematchRequested: s?.rematchRequested ?? false, displayName: s?.displayName ?? '', actorType: s?.actorType ?? '' }; }
  private broadcastLegalActions(): void { if (this.matchId) for (const entry of this.seats.values()) if (entry.sessionId) { const client = this.clients.find((c) => c.sessionId === entry.sessionId); if (client) client.send('legalActions', this.matches.getLegalActions(this.matchId, this.actor(entry))); } }
  private sendMatchInit(client: RoomClient, seat: PlayerSeat): void { if (!this.matchId) return; const actor = this.seats.get(seat); if (actor) client.send('matchInit', { mySeat: seat, state: this.matches.getMatchState(this.matchId, this.actor(actor)), legalActions: this.matches.getLegalActions(this.matchId, this.actor(actor)) }); }
  private enqueue(task: () => Promise<void> | void): Promise<void> { const next = this.opQueue.then(task, task); this.opQueue = next.catch((error) => { console.error('[PvPRoom] Serialized task error:', error); }); return next; }
}

export async function createPrivatePvPRoom(inviteCode: string): Promise<{ roomId: string }> {
  const room = await matchMaker.createRoom('pvp_room', { inviteCode });
  return { roomId: room.roomId };
}
function randomSeed(): number { return randomInt(0, 0x7fffffff); }
