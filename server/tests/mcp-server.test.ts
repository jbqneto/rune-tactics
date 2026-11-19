import { afterEach, describe, expect, it } from 'vitest';
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client as ColyseusClient } from '@colyseus/sdk';
import { createGameServer } from '../src/index.js';
import { MatchService } from '../../src/game/pvp/MatchService.js';
import { runHeadlessMatch } from '../src/mcp/AgentMatchRunner.js';
import { RuneTacticsMcpServer } from '../src/mcp/RuneTacticsMcpServer.js';
import { PvPRoomState } from '../src/schema/PvPRoomState.js';
import { SessionTokenService } from '../src/auth/SessionTokenService.js';
import type { GameCommand, ObservableMatchState } from '../../src/shared/pvpTypes.js';
import type { AddressInfo } from 'node:net';

const apps: Array<ReturnType<typeof createGameServer>> = [];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function until<T>(read: () => T | null | undefined, label: string, timeout = 8000): Promise<T> { const end = Date.now() + timeout; while (Date.now() < end) { const value = read(); if (value != null) return value; await wait(25); } throw new Error(`Timed out waiting for ${label}`); }
function json<T>(result: any): T { const text = result.content.find((part: any) => part.type === 'text')?.text; if (!text) throw new Error(JSON.stringify(result)); return JSON.parse(text) as T; }
async function setup(server?: RuneTacticsMcpServer) {
  const instance = server ?? new RuneTacticsMcpServer({ matches: new MatchService() });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new McpClient({ name: 'test-agent', version: '1.0' });
  await Promise.all([client.connect(clientTransport), instance.connect(serverTransport)]);
  return { client, server: instance, close: async () => { await client.close(); await instance.close(); } };
}
afterEach(async () => { for (const app of apps.splice(0)) await app.server.gracefullyShutdown(false); });

describe('Rune Tactics MCP adapter', () => {
  it('creates a practice match and supports state, legal actions, command revisions and replay', async () => {
    const mcp = await setup();
    try {
      const created = json<any>(await mcp.client.callTool({ name: 'create_practice_match', arguments: { seed: 24, opponentBot: false } }));
      expect(created.seat).toBe('A');
      const matchId = created.matchId as string;
      const state = json<ObservableMatchState>(await mcp.client.callTool({ name: 'get_match_state', arguments: { matchId } }));
      const legal = json<any>(await mcp.client.callTool({ name: 'get_legal_actions', arguments: { matchId } }));
      expect(legal.isYourTurn).toBe(true);
      const action: GameCommand = legal.endTurnCommand;
      const payload = { matchId, commandId: 'same-command', expectedRevision: state.revision, command: action };
      expect(json<any>(await mcp.client.callTool({ name: 'submit_action', arguments: { ...payload, commandId: 'stale', expectedRevision: state.revision + 1 } }))).toMatchObject({ ok: false, code: 'STALE_REVISION' });
      const first = json<any>(await mcp.client.callTool({ name: 'submit_action', arguments: payload }));
      const replay = json<any>(await mcp.client.callTool({ name: 'submit_action', arguments: payload }));
      expect(first).toMatchObject({ ok: true, revision: 1 }); expect(replay.idempotentReplay).toBe(true);
      expect(json<any>(await mcp.client.callTool({ name: 'submit_action', arguments: { ...payload, command: { type: 'Defend', unitId: state.activeUnitId } } }))).toMatchObject({ ok: false, code: 'COMMAND_CONFLICT' });
    } finally { await mcp.close(); }
  });

  it('runs two deterministic agents through elimination and emits a replay log', () => {
    const a = runHeadlessMatch({ seed: 5, maxCommands: 1000 }); const b = runHeadlessMatch({ seed: 5, maxCommands: 1000 });
    expect(a.winnerTeam).toMatch(/teamA|teamB/); expect(a.totalCommands).toBeGreaterThan(0); expect(a).toEqual(b);
  }, 20000);

  it('connects one human and one MCP agent in the same live PvP room without local secret on MCP', async () => {
    const tokens = new SessionTokenService('mcp-room-test-backend-only'); const app = createGameServer({ tokens }); apps.push(app);
    await app.server.listen(0, '127.0.0.1'); const address = app.server.transport.server?.address() as AddressInfo;
    const http = `http://127.0.0.1:${address.port}`; const ws = `ws://127.0.0.1:${address.port}`;
    const mcp = await setup(new RuneTacticsMcpServer({ defaultServerUrl: http }));
    const humanSession = tokens.createSession('Human');
    let human: any;
    try {
      expect(tokens.verifyToken(tokens.createSession('Agent', 'mcp-agent').sessionToken)?.actorType).toBe('mcp-agent');
      expect(() => tokens.createSession('Invalid', 'system')).toThrow('Invalid actorType');
      expect((await fetch(`${http}/api/pvp/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ actorType: 'system' }) })).status).toBe(400);
      const joined = json<any>(await mcp.client.callTool({ name: 'join_pvp_room', arguments: { serverUrl: http, createRoom: true, displayName: 'MCP Opponent' } }));
      expect(joined.inviteCode).toMatch(/^RT-[A-HJ-NP-Z2-9]{8}$/); expect(joined.seat).toBe('A');
      const lookup = tokens.lookupRoom(joined.inviteCode);
      human = await new ColyseusClient(ws).joinById(lookup!.roomId, { sessionToken: humanSession.sessionToken, inviteCode: joined.inviteCode }, PvPRoomState);
      human.onMessage('*', () => {});
      human.send('selectClasses', ['cleric', 'knight', 'archer']);
      await until(() => human.state.roomPhase === 'WAITING_FOR_READY' ? true : null, 'both draft selections');
      const init = new Promise<any>((resolve) => human.onMessage('matchInit', resolve));
      human.send('setReady', true);
      const matchInit = await init;
      expect(matchInit.state.seats.A.actorType).toBe('mcp-agent'); expect(matchInit.state.seats.B.actorType).toBe('human');
      await wait(100);
      const state = matchInit.state as ObservableMatchState; const actions = json<any>(await mcp.client.callTool({ name: 'get_legal_actions', arguments: { matchId: state.matchId } }));
      const own = state.activeSeat === 'A';
      if (own) {
        const cmd: GameCommand = actions.endTurnCommand;
        const response = json<any>(await mcp.client.callTool({ name: 'submit_action', arguments: { matchId: state.matchId, commandId: 'mcp-live-turn', expectedRevision: state.revision, command: cmd } }));
        expect(response.ok).toBe(true);
      } else {
        const response = new Promise<any>((resolve) => human.onMessage('commandResult', resolve));
        human.send('command', { matchId: state.matchId, commandId: 'human-live-turn', expectedRevision: state.revision, issuedAtMs: Date.now(), command: actions.endTurnCommand });
        expect(await response).toMatchObject({ ok: true });
      }
    } finally { if (human) await human.leave(); await mcp.close(); }
  }, 20000);

  it('allows MCP agent to join an existing room using only the 8-char public Room ID', async () => {
    const tokens = new SessionTokenService('backend-only-secret-for-join-test');
    const app = createGameServer({ tokens });
    apps.push(app);
    await app.server.listen(0, '127.0.0.1');
    const address = app.server.transport.server?.address() as AddressInfo;
    const http = `http://127.0.0.1:${address.port}`;
    const ws = `ws://127.0.0.1:${address.port}`;

    const humanSession = await (await fetch(`${http}/api/pvp/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: 'Host Human' }),
    })).json() as { sessionToken: string };
    const created = await (await fetch(`${http}/api/pvp/rooms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionToken: humanSession.sessionToken }),
    })).json() as { roomId: string; inviteCode: string };

    expect(created.inviteCode).toMatch(/^RT-[A-HJ-NP-Z2-9]{8}$/);
    const human = await new ColyseusClient(ws).joinById(created.roomId, {
      sessionToken: humanSession.sessionToken,
      inviteCode: created.inviteCode,
    }, PvPRoomState);
    human.onMessage('*', () => {});

    const mcp = await setup(new RuneTacticsMcpServer({ defaultServerUrl: http }));
    try {
      const joined = json<any>(await mcp.client.callTool({
        name: 'join_pvp_room',
        arguments: { serverUrl: http, roomId: created.inviteCode, displayName: 'Joiner MCP' },
      }));
      expect(joined.inviteCode).toBe(created.inviteCode);
      expect(joined.seat).toBe('B');
      await until(() => human.state.roomPhase === 'CHARACTER_SELECTION' ? true : null, 'character selection');
    } finally {
      await human.leave();
      await mcp.close();
    }
  }, 20000);
});
