import { afterEach, describe, expect, it } from 'vitest';
import { Client } from '@colyseus/sdk';
import { matchMaker } from 'colyseus';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createGameServer } from '../src/index.js';
import { MatchService } from '../../src/game/pvp/MatchService.js';
import { SessionTokenService } from '../src/auth/SessionTokenService.js';
import { PvPRoomState } from '../src/schema/PvPRoomState.js';

const running: Array<ReturnType<typeof createGameServer>> = [];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function until<T>(read: () => T | null | undefined, label: string, timeoutMs = 5000): Promise<T> {
  const untilAt = Date.now() + timeoutMs;
  while (Date.now() < untilAt) { const value = read(); if (value != null) return value; await wait(20); }
  throw new Error(`Timed out waiting for ${label}`);
}
function message<T>(room: any, type: string, predicate: (value: T) => boolean = () => true, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${type}`)), timeoutMs);
    const off = room.onMessage(type, (value: T) => { if (predicate(value)) { clearTimeout(timeout); off(); resolve(value); } });
  });
}
async function start(matches = new MatchService()) {
  const services = createGameServer({ tokens: new SessionTokenService('integration-test-secret'), matches });
  running.push(services);
  await services.server.listen(0, '127.0.0.1');
  const address = services.server.transport.server?.address() as AddressInfo;
  const base = `http://127.0.0.1:${address.port}`;
  const ws = `ws://127.0.0.1:${address.port}`;
  return { ...services, base, clientA: new Client(ws), clientB: new Client(ws) };
}
async function issue(base: string, displayName: string) {
  const response = await fetch(`${base}/api/pvp/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ displayName }) });
  expect(response.status).toBe(201);
  return response.json() as Promise<{ sessionToken: string; actorId: string }>;
}

afterEach(async () => {
  for (const service of running.splice(0)) await service.server.gracefullyShutdown(false);
});

describe('Colyseus PvP room integration', () => {
  it('creates and looks up RT invite rooms, drafts, readies, sends commands and returns to draft on rematch', async () => {
    const app = await start();
    expect((await fetch(`${app.base}/healthz`)).status).toBe(200);
    const a = await issue(app.base, 'Captain A'); const b = await issue(app.base, 'Captain B');
    const createdResponse = await fetch(`${app.base}/api/pvp/rooms`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionToken: a.sessionToken }) });
    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json() as { roomId: string; inviteCode: string };
    expect(created.inviteCode).toMatch(/^RT-[A-HJ-NP-Z2-9]{8}$/);
    const secondRoomResponse = await fetch(`${app.base}/api/pvp/rooms`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionToken: a.sessionToken }) });
    const secondRoom = await secondRoomResponse.json() as { roomId: string; inviteCode: string };
    expect(secondRoomResponse.status).toBe(201);
    expect(secondRoom.inviteCode).not.toBe(created.inviteCode);
    const lookupResponse = await fetch(`${app.base}/api/pvp/rooms/${created.inviteCode}`, { headers: { authorization: `Bearer ${b.sessionToken}` } });
    expect(await lookupResponse.json()).toMatchObject({ roomId: created.roomId, phase: 'WAITING_FOR_PLAYER' });
    const roomA = await app.clientA.joinById(created.roomId, { sessionToken: a.sessionToken, inviteCode: created.inviteCode }, PvPRoomState);
    const roomB = await app.clientB.joinById(created.roomId, { sessionToken: b.sessionToken, inviteCode: created.inviteCode }, PvPRoomState);
    roomA.onMessage('*', () => {}); roomB.onMessage('*', () => {});
    await until(() => roomB.state.roomPhase === 'CHARACTER_SELECTION' ? true : null, 'character selection');
    const lobbyUpdate = message<any>(roomA, 'lobbyState', (value) => value.phase === 'WAITING_FOR_READY');
    roomA.send('selectClasses', ['knight', 'archer', 'mage']);
    roomB.send('selectClasses', ['cleric', 'knight', 'archer']);
    await lobbyUpdate;
    const initA = message<any>(roomA, 'matchInit'); const initB = message<any>(roomB, 'matchInit');
    roomA.send('setReady', true); roomB.send('setReady', true);
    const [stateA, stateB] = await Promise.all([initA, initB]);
    expect(stateA.mySeat).toBe('A'); expect(stateB.mySeat).toBe('B');
    expect(stateA.state.turnOrder).toEqual(['A1', 'B1', 'A2', 'B2', 'A3', 'B3']);
    const activeRoom = stateA.state.activeSeat === 'A' ? roomA : roomB;
    const activeState = stateA.state;
    const commandResult = message<any>(activeRoom, 'commandResult', (value) => value.commandId === 'room-command');
    activeRoom.send('command', { commandId: 'room-command', matchId: activeState.matchId, expectedRevision: activeState.revision, issuedAtMs: Date.now(), command: { type: 'EndTurn', unitId: activeState.activeUnitId } });
    expect(await commandResult).toMatchObject({ ok: true, revision: 1 });
    const eventsA = message<any>(roomA, 'matchEvents', (value) => value.events.some((event: any) => event.type === 'battleEnded'));
    roomA.send('forfeit');
    await eventsA;
    const rematchLobby = message<any>(roomA, 'lobbyState', (value) => value.phase === 'CHARACTER_SELECTION');
    roomA.send('requestRematch'); roomB.send('requestRematch');
    await rematchLobby;
    await until(() => roomA.state.startingTeam === 'teamB' ? true : null, 'alternating starting team');
    expect(roomA.state.startingTeam).toBe('teamB');
  }, 20000);

  it('pauses on an unexpected disconnect and restores the same seat on reconnection within the grace window', async () => {
    const app = await start();
    const a = await issue(app.base, 'A'); const b = await issue(app.base, 'B');
    const { roomId, inviteCode } = await (await fetch(`${app.base}/api/pvp/rooms`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionToken: a.sessionToken }) })).json() as { roomId: string; inviteCode: string };
    const roomA = await app.clientA.joinById(roomId, { sessionToken: a.sessionToken, inviteCode }, PvPRoomState);
    const roomB = await app.clientB.joinById(roomId, { sessionToken: b.sessionToken, inviteCode }, PvPRoomState);
    roomA.onMessage('*', () => {}); roomB.onMessage('*', () => {});
    const startedA = message<any>(roomA, 'matchInit'); const startedB = message<any>(roomB, 'matchInit');
    const readyPhase = message<any>(roomA, 'lobbyState', (value) => value.phase === 'WAITING_FOR_READY');
    roomA.send('selectClasses', ['knight', 'archer', 'mage']); roomB.send('selectClasses', ['cleric', 'knight', 'archer']);
    await readyPhase;
    roomA.send('setReady', true); roomB.send('setReady', true); await Promise.all([startedA, startedB]);
    const reconnectToken = roomA.reconnectionToken;
    roomA.reconnection.enabled = false;
    const paused = until(() => roomB.state.roomPhase === 'PAUSED_DISCONNECTED' ? true : null, 'disconnect pause');
    await roomA.leave(false);
    await paused;
    const roomA2 = await app.clientA.reconnect(reconnectToken, PvPRoomState);
    const matchInit = await message<any>(roomA2, 'matchInit');
    expect(matchInit.mySeat).toBe('A');
    await until(() => roomA2.state.roomPhase === 'IN_PROGRESS' ? true : null, 'reconnected match');
    expect(roomA2.state.seats.get('A')?.seat).toBe('A');
    await until(() => roomB.state.roomPhase === 'IN_PROGRESS' ? true : null, 'opponent resume patch');
    expect(roomB.state.roomPhase).toBe('IN_PROGRESS');
    roomB.reconnection.enabled = false;
    const pausedAgain = until(() => roomA2.state.roomPhase === 'PAUSED_DISCONNECTED' ? true : null, 'second disconnect pause');
    await roomB.leave(false);
    await pausedAgain;
    const serverRoom = matchMaker.getLocalRoomById(roomId) as any;
    serverRoom.reconnectDeadlineMs = 0;
    await serverRoom.enqueue(() => serverRoom.disconnectExpired('B'));
    await until(() => roomA2.state.roomPhase === 'FINISHED' ? true : null, 'disconnect-timeout finish');
    expect(roomA2.state.winnerSeat).toBe('A');
    expect(roomA2.state.finishReason).toBe('disconnect_timeout');
  }, 20000);

  it('advances an expired turn through MatchService and records disconnect timeout forfeits', async () => {
    let now = 10_000;
    const tokens = new SessionTokenService('clock-test');
    const matches = new MatchService(() => now);
    // Exercise the server-owned timeout and disconnect-forfeit outcomes without wall-clock delays.
    const state = matches.createMatch({ matchId: 'clock-match', seed: 5, seatA: { actorId: 'a', displayName: 'A', classes: ['knight', 'archer', 'mage'] }, seatB: { actorId: 'b', displayName: 'B', classes: ['cleric', 'knight', 'archer'] } });
    now = state.turnDeadlineMs!;
    const result = matches.handleTurnTimeout('clock-match', now);
    expect(result).toMatchObject({ ok: true, revision: 1 });
    expect(result?.ok && result.events[0]).toMatchObject({ type: 'turnTimedOut', unitId: 'A1' });
    expect(matches.forfeitMatch('clock-match', 'A', 'disconnect_timeout')).toEqual([{ type: 'battleEnded', winnerTeam: 'teamB', winnerSeat: 'B', reason: 'disconnect_timeout' }]);
    expect(matches.getMatchState('clock-match')?.phase).toBe('FINISHED');
    expect(tokens.verifyToken('invalid')).toBeNull();
  });

  it('fires the serialized room timeout callback and broadcasts its event batch', async () => {
    const matches = new MatchService();
    const getMatchState = matches.getMatchState.bind(matches);
    const handleTurnTimeout = matches.handleTurnTimeout.bind(matches);
    let accelerateClockCallback = false;
    matches.getMatchState = (matchId, actor) => {
      const state = getMatchState(matchId, actor);
      return accelerateClockCallback && state ? { ...state, turnDeadlineMs: Date.now() + 30 } : state;
    };
    matches.handleTurnTimeout = (matchId, now) => handleTurnTimeout(matchId, Math.max(now ?? Date.now(), Number.MAX_SAFE_INTEGER));
    const app = await start(matches);
    const a = await issue(app.base, 'A'); const b = await issue(app.base, 'B');
    const { roomId, inviteCode } = await (await fetch(`${app.base}/api/pvp/rooms`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionToken: a.sessionToken }) })).json() as { roomId: string; inviteCode: string };
    const roomA = await app.clientA.joinById(roomId, { sessionToken: a.sessionToken, inviteCode }, PvPRoomState);
    const roomB = await app.clientB.joinById(roomId, { sessionToken: b.sessionToken, inviteCode }, PvPRoomState);
    roomA.onMessage('*', () => {}); roomB.onMessage('*', () => {});
    await until(() => roomB.state.roomPhase === 'CHARACTER_SELECTION' ? true : null, 'draft start');
    const drafted = message<any>(roomA, 'lobbyState', (value) => value.phase === 'WAITING_FOR_READY');
    roomA.send('selectClasses', ['knight', 'archer', 'mage']); roomB.send('selectClasses', ['cleric', 'knight', 'archer']);
    await drafted;
    const initA = message<any>(roomA, 'matchInit'); const initB = message<any>(roomB, 'matchInit');
    const timerResult = message<any>(roomB, 'matchEvents', (value) => value.events.some((event: any) => event.type === 'turnTimedOut'), 120_000);
    accelerateClockCallback = true;
    roomA.send('setReady', true); roomB.send('setReady', true);
    await Promise.all([initA, initB]);
    const batch = await timerResult;
    expect(batch.events[0]).toMatchObject({ type: 'turnTimedOut', unitId: 'A1' });
    expect(batch.state.activeUnitId).toBe('B1');
  }, 20000);

  it('serves frontend SPA paths and enforces configured HTTP CORS origins', async () => {
    const frontendDist = mkdtempSync(join(tmpdir(), 'rune-tactics-front-'));
    writeFileSync(join(frontendDist, 'index.html'), '<main>deployment frontend</main>');
    const previousDist = process.env.FRONTEND_DIST;
    const previousOrigins = process.env.ALLOWED_ORIGINS;
    process.env.FRONTEND_DIST = frontendDist;
    process.env.ALLOWED_ORIGINS = 'https://allowed.example';
    try {
      const app = await start();
      const root = await fetch(`${app.base}/`, { headers: { origin: 'https://allowed.example', accept: 'text/html' } });
      expect(root.headers.get('access-control-allow-origin')).toBe('https://allowed.example');
      expect(await root.text()).toContain('deployment frontend');
      const sameOrigin = await fetch(`${app.base}/healthz`, { headers: { origin: app.base } });
      expect(sameOrigin.headers.get('access-control-allow-origin')).toBe(app.base);
      const deepLink = await fetch(`${app.base}/campaign/stage-2`, { headers: { accept: 'text/html' } });
      expect(await deepLink.text()).toContain('deployment frontend');
      const health = await fetch(`${app.base}/healthz`, { headers: { origin: 'https://blocked.example' } });
      expect(health.status).toBe(403);
      const reserved = await fetch(`${app.base}/matchmake/not-a-route`, { headers: { accept: 'text/html' } });
      expect(await reserved.text()).not.toContain('deployment frontend');
      const apiFallback = await fetch(`${app.base}/api/unknown`, { headers: { accept: 'text/html' } });
      expect(await apiFallback.text()).not.toContain('deployment frontend');
    } finally {
      if (previousDist === undefined) delete process.env.FRONTEND_DIST; else process.env.FRONTEND_DIST = previousDist;
      if (previousOrigins === undefined) delete process.env.ALLOWED_ORIGINS; else process.env.ALLOWED_ORIGINS = previousOrigins;
      rmSync(frontendDist, { recursive: true, force: true });
    }
  });
});
