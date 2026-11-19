import '../config/env.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { Client } from '@colyseus/sdk';
import { MatchService } from '../../../src/game/pvp/MatchService.js';
import type { ActorContext, CommandEnvelope, GameCommand, LegalActionsSnapshot, ObservableMatchState, PvPHeroClass, PlayerSeat } from '../../../src/shared/pvpTypes.js';
import { GRID_SIZE, PVP_HERO_CLASSES, PVP_INVITE_CODE_LENGTH, PVP_TEAM_SIZE } from '../../../src/config/gameConfig.js';
import { HeuristicBot } from './HeuristicBot.js';
import { PvPRoomState } from '../schema/PvPRoomState.js';

const PUBLIC_ROOM_ID_REGEX = new RegExp(`^RT-[A-HJ-NP-Z2-9]{${PVP_INVITE_CODE_LENGTH}}$`, 'i');

type Practice = { matches: MatchService; matchId: string; actor: ActorContext; opponent: ActorContext; opponentBot: boolean; bot: HeuristicBot };
type Live = { room: any; seat: PlayerSeat; inviteCode: string; phase: string; state: ObservableMatchState | null; legal: LegalActionsSnapshot | null; classes: PvPHeroClass[] };
type Backend = { practice: Practice } | { live: Live };
const classes = z.array(z.enum(PVP_HERO_CLASSES)).length(PVP_TEAM_SIZE).refine((list) => new Set(list).size === PVP_TEAM_SIZE);
const coord = z.object({ x: z.number().int().min(0).max(GRID_SIZE - 1), y: z.number().int().min(0).max(GRID_SIZE - 1) });
const command = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Move'), unitId: z.string().min(1), to: coord }), z.object({ type: z.literal('Attack'), unitId: z.string().min(1), targetId: z.string().min(1) }), z.object({ type: z.literal('UseSkill'), unitId: z.string().min(1), targetCell: coord }), z.object({ type: z.literal('Defend'), unitId: z.string().min(1) }), z.object({ type: z.literal('UndoMove'), unitId: z.string().min(1) }), z.object({ type: z.literal('SmartAttack'), unitId: z.string().min(1), targetId: z.string().min(1) }), z.object({ type: z.literal('SmartUseSkill'), unitId: z.string().min(1), targetCell: coord }), z.object({ type: z.literal('EndTurn'), unitId: z.string().min(1) }),
]);
const shapeState = (backend: Backend, id: string): ObservableMatchState | null => 'practice' in backend ? backend.practice.matches.getMatchState(id, backend.practice.actor) : backend.live.state;
const shapeLegal = (backend: Backend, id: string): LegalActionsSnapshot | null => 'practice' in backend ? backend.practice.matches.getLegalActions(id, backend.practice.actor) : backend.live.legal;

export class RuneTacticsMcpServer {
  readonly server = new McpServer({ name: 'rune-tactics', version: '6.0.0' });
  private readonly backends = new Map<string, Backend>();
  constructor(private readonly options: { matches?: MatchService; defaultServerUrl?: string } = {}) { this.registerTools(); }
  async connect(transport: Parameters<McpServer['connect']>[0]) { await this.server.connect(transport); }
  async close() { await this.server.close(); for (const backend of this.backends.values()) if ('live' in backend) backend.live.room.leave(); }
  private backendFor(id: string): Backend | undefined { const direct = this.backends.get(id); if (direct) return direct; for (const backend of this.backends.values()) if ('live' in backend && (backend.live.state?.matchId === id || backend.live.room.roomId === id || backend.live.inviteCode === id.trim().toUpperCase())) return backend; return undefined; }

  private registerTools() {
    this.server.tool('create_practice_match', 'Create an isolated PvP practice match.', { seed: z.number().int().min(0).max(0x7fffffff).optional(), classesA: classes.optional(), classesB: classes.optional(), opponentBot: z.boolean().default(true) }, async ({ seed, classesA, classesB, opponentBot }) => {
      const id = `practice-${randomUUID()}`, actor = { actorId: `mcp-${randomUUID()}`, seat: 'A' as const, team: 'teamA' as const, type: 'mcp-agent' as const }, opponent = { actorId: `bot-${id}`, seat: 'B' as const, team: 'teamB' as const, type: 'system' as const };
      const matches = this.options.matches ?? new MatchService(); matches.createMatch({ matchId: id, seed: seed ?? 1, startingTeam: 'teamA', seatA: { actorId: actor.actorId, displayName: 'MCP Agent', actorType: 'mcp-agent', classes: (classesA ?? ['knight', 'archer', 'mage']) as [PvPHeroClass, PvPHeroClass, PvPHeroClass] }, seatB: { actorId: opponent.actorId, displayName: 'Heuristic Bot', actorType: 'system', classes: (classesB ?? ['knight', 'archer', 'cleric']) as [PvPHeroClass, PvPHeroClass, PvPHeroClass] } });
      const practice = { matches, matchId: id, actor, opponent, opponentBot, bot: new HeuristicBot() }; const backend: Backend = { practice }; this.backends.set(id, backend);
      return this.output({ matchId: id, seat: 'A', team: 'teamA', state: shapeState(backend, id), legalActions: shapeLegal(backend, id) });
    });
    this.server.tool('join_pvp_room', 'Join or create a live Rune Tactics PvP room using its public Room ID (RT-XXXXXXXX).', { serverUrl: z.string().url().optional(), roomId: z.string().regex(PUBLIC_ROOM_ID_REGEX).optional(), inviteCode: z.string().regex(PUBLIC_ROOM_ID_REGEX).optional(), createRoom: z.boolean().default(false), displayName: z.string().min(2).max(20).default('MCP Agent'), classes: classes.default(['knight', 'archer', 'mage']) }, async ({ serverUrl, roomId, inviteCode, createRoom, displayName, classes: heroClasses }) => this.joinRoom(serverUrl, roomId ?? inviteCode, createRoom, displayName, heroClasses as PvPHeroClass[]));
    this.server.tool('get_match_state', 'Read the current match state.', { matchId: z.string().min(1) }, async ({ matchId }) => {
      const backend = this.backendFor(matchId); if (!backend) return this.outputError('Match not found or not joined.'); const state = shapeState(backend, matchId); if (!state) return this.outputError(`Room is in ${'live' in backend ? backend.live.phase : 'unknown'} phase.`); return this.output(state);
    });
    this.server.tool('get_legal_actions', 'Read legal actions for the bound actor.', { matchId: z.string().min(1) }, async ({ matchId }) => { const backend = this.backendFor(matchId); return backend ? this.output(shapeLegal(backend, matchId)) : this.outputError('Match not found or not joined.'); });
    this.server.tool('submit_action', 'Submit a tactical command.', { matchId: z.string().min(1), commandId: z.string().min(1).max(128), expectedRevision: z.number().int().min(0), command }, async ({ matchId, commandId, expectedRevision, command: cmd }) => {
      const backend = this.backendFor(matchId); if (!backend) return this.outputError('Match not found or not joined.');
      if ('practice' in backend) {
        const practice = backend.practice; const envelope: CommandEnvelope = { commandId, matchId, expectedRevision, issuedAtMs: Date.now(), command: cmd as GameCommand }; const result = practice.matches.submitAction(matchId, practice.actor, envelope);
        const returned = JSON.parse(JSON.stringify(result));
        if (result.ok && practice.opponentBot && result.state.activeSeat === 'B' && result.state.phase === 'IN_PROGRESS') this.runPracticeBot(practice);
        return this.output(returned);
      }
      return this.liveCommand(backend.live, matchId, commandId, expectedRevision, cmd as GameCommand);
    });
    this.server.tool('wait_for_turn', 'Wait until your turn, match end, or timeout.', { matchId: z.string().min(1), timeoutMs: z.number().int().min(100).max(300000).default(30000) }, async ({ matchId, timeoutMs }) => {
      const backend = this.backendFor(matchId); if (!backend) return this.outputError('Match not found or not joined.'); const until = Date.now() + timeoutMs;
      while (Date.now() < until) { const state = shapeState(backend, matchId), legal = shapeLegal(backend, matchId); if (state && legal && (legal.isYourTurn || state.phase === 'FINISHED')) return this.output({ isYourTurn: legal.isYourTurn, phase: state.phase, state, legalActions: legal }); await new Promise((resolve) => setTimeout(resolve, 50)); }
      const state = shapeState(backend, matchId); return this.output({ isYourTurn: false, phase: state?.phase ?? ('live' in backend ? backend.live.phase : 'IN_PROGRESS'), state, legalActions: shapeLegal(backend, matchId) });
    });
  }

  private runPracticeBot(p: Practice) {
    while (true) { const state = p.matches.getMatchState(p.matchId); if (!state || state.phase !== 'IN_PROGRESS' || state.activeSeat !== 'B') break; const legal = p.matches.getLegalActions(p.matchId, p.opponent); if (!legal) break; const cmd = p.bot.selectCommand(state, legal); const result = p.matches.submitAction(p.matchId, p.opponent, { commandId: `bot-${state.revision}`, matchId: p.matchId, expectedRevision: state.revision, issuedAtMs: Date.now(), command: cmd }); if (!result.ok) break; }
  }

  private async joinRoom(serverUrl: string | undefined, inviteCode: string | undefined, createRoom: boolean, displayName: string, heroClasses: PvPHeroClass[]) {
    const base = serverUrl ?? this.options.defaultServerUrl ?? 'http://localhost:2567'; const url = new URL(base); if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return this.outputError('Unsupported server URL protocol.');
    const allowed = (process.env.MCP_ALLOWED_SERVER_URLS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
    if (allowed.length && !allowed.some((entry) => { try { const candidate = new URL(entry); return candidate.origin === url.origin; } catch { return false; } })) return this.outputError('Server URL is not allowed.');
    const http = `${url.protocol === 'ws:' ? 'http:' : url.protocol === 'wss:' ? 'https:' : url.protocol}//${url.host}`;
    const api = async (path: string, init?: RequestInit) => { const response = await fetch(`${http}${path}`, init); if (!response.ok) throw new Error(`PvP server returned ${response.status}`); return response.json() as Promise<any>; };
    const session = await api('/api/pvp/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName, actorType: 'mcp-agent' }) });
    const normalizedPublicId = inviteCode?.trim().toUpperCase();
    let roomInfo: any;
    if (createRoom) roomInfo = await api('/api/pvp/rooms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionToken: session.sessionToken }) });
    else { if (!normalizedPublicId) return this.outputError('roomId (RT-XXXXXXXX) is required unless createRoom is true.'); roomInfo = await api(`/api/pvp/rooms/${normalizedPublicId}`, { headers: { authorization: `Bearer ${session.sessionToken}` } }); }
    const publicRoomId = (roomInfo.inviteCode ?? normalizedPublicId) as string;
    const client = new Client(http); const room = await client.joinById(roomInfo.roomId, { sessionToken: session.sessionToken, inviteCode: publicRoomId }, PvPRoomState);
    const live: Live = { room, seat: createRoom || roomInfo.playersCount === 0 ? 'A' : 'B', inviteCode: publicRoomId, phase: roomInfo.phase ?? 'WAITING_FOR_PLAYER', state: null, legal: null, classes: heroClasses };
    let lastDraftAction = '';
    const updateDraft = (phase: string, own: any) => { live.phase = phase; if (!['CHARACTER_SELECTION', 'WAITING_FOR_READY'].includes(phase) || !own) return; if (own.ready) { lastDraftAction = ''; return; } const action = own.selectedClasses?.length !== PVP_TEAM_SIZE ? `select:${phase}` : `ready:${phase}:${own.selectedClasses.join(',')}`; if (action !== lastDraftAction) { lastDraftAction = action; if (action.startsWith('select:')) room.send('selectClasses', heroClasses); else room.send('setReady', true); } };
    room.onMessage('lobbyState', (lobby: any) => updateDraft(lobby.phase, lobby.seats?.[live.seat]));
    room.onStateChange((state: any) => { const phase = state.roomPhase; const own = state.seats?.get?.(live.seat); updateDraft(phase, own); });
    updateDraft(room.state.roomPhase, room.state.seats?.get?.(live.seat));
    const draftTimer = setInterval(() => updateDraft(room.state.roomPhase, room.state.seats?.get?.(live.seat)), 100);
    room.onMessage('matchInit', (init: any) => { clearInterval(draftTimer); live.seat = init.mySeat; live.state = init.state; live.legal = init.legalActions; this.backends.set(init.state.matchId, { live }); });
    room.onMessage('legalActions', (actions: LegalActionsSnapshot) => { live.legal = actions; });
    room.onMessage('matchEvents', (batch: any) => { live.state = batch.state; live.legal = null; });
    const roomId = room.roomId; this.backends.set(roomId, { live }); return this.output({ roomId, inviteCode: live.inviteCode, seat: live.seat, phase: live.phase });
  }

  private liveCommand(live: Live, matchId: string, commandId: string, expectedRevision: number, cmd: GameCommand): Promise<any> {
    return new Promise((resolve) => { const timeout = setTimeout(() => resolve(this.outputError('Timed out waiting for command result.')), 10000); const off = live.room.onMessage('commandResult', (result: any) => { if (result.commandId === commandId) { clearTimeout(timeout); off(); resolve(this.output(result)); } }); live.room.send('command', { commandId, matchId, expectedRevision, issuedAtMs: Date.now(), command: cmd }); });
  }
  private output(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] }; }
  private outputError(message: string) { return { content: [{ type: 'text' as const, text: message }], isError: true }; }
}
