import './config/env.js';
import express from 'express';
import { Server, WebSocketTransport } from 'colyseus';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { MatchService } from '../../src/game/pvp/MatchService.js';
import { SessionTokenService } from './auth/SessionTokenService.js';
import { configurePvPRoom, createPrivatePvPRoom, PvPRoom } from './rooms/PvPRoom.js';
import { originPolicyFromEnv } from './http/originPolicy.js';

export function createGameServer(options: { tokens?: SessionTokenService; matches?: MatchService } = {}) {
  const tokens = options.tokens ?? new SessionTokenService();
  const matches = options.matches ?? new MatchService();
  configurePvPRoom({ tokens, matches });
  const isOriginAllowed = originPolicyFromEnv();
  const gameServer = new Server({
    transport: new WebSocketTransport({
      pingInterval: 15_000,
      pingMaxRetries: 4,
      beforeUpgrade: (request) => {
        const origin = request.headers.get('origin');
        const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? undefined;
        return origin && !isOriginAllowed(origin, host) ? new Response(null, { status: 403 }) : undefined;
      },
    }),
    express: (app) => {
      app.set('trust proxy', true);
      app.use(express.json({ limit: '16kb' }));
      app.use((req, res, next) => {
        const origin = req.header('origin');
        const host = req.header('x-forwarded-host') ?? req.header('host');
        if (origin && !isOriginAllowed(origin, host)) { res.sendStatus(403); return; }
        if (origin) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Vary', 'Origin');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        }
        if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
        next();
      });
      app.get('/healthz', (_req, res) => res.json({ ok: true }));
      app.post('/api/pvp/session', (req, res) => {
        if (req.body?.actorType !== undefined && req.body.actorType !== 'human' && req.body.actorType !== 'mcp-agent') { res.status(400).json({ error: 'Invalid actorType' }); return; }
        res.status(201).json(tokens.createSession(req.body?.displayName, req.body?.actorType));
      });
      app.post('/api/pvp/rooms', async (req, res) => {
        const identity = tokens.verifyToken(req.body?.sessionToken);
        if (!identity) { res.status(401).json({ error: 'Invalid or expired session token' }); return; }
        try {
          const inviteCode = tokens.generateInviteCode();
          const { roomId } = await createPrivatePvPRoom(inviteCode);
          tokens.registerRoom(inviteCode, { roomId, phase: 'WAITING_FOR_PLAYER', playersCount: 0 });
          res.status(201).json({ roomId, inviteCode });
        } catch (error) {
          res.status(500).json({ error: error instanceof Error ? error.message : 'Could not create room' });
        }
      });
      app.get('/api/pvp/rooms/:inviteCode', (req, res) => {
        const authorization = req.header('authorization') ?? '';
        const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] ?? req.query.sessionToken;
        if (!tokens.verifyToken(token)) { res.status(401).json({ error: 'Invalid or expired session token' }); return; }
        const room = tokens.lookupRoom(req.params.inviteCode);
        if (!room) { res.status(404).json({ error: 'Room not found' }); return; }
        res.json(room);
      });
      const frontendDist =
        process.env.FRONTEND_DIST ??
        (existsSync(resolve(process.cwd(), 'dist', 'index.html'))
          ? resolve(process.cwd(), 'dist')
          : resolve(process.cwd(), '../dist'));
      if (existsSync(resolve(frontendDist, 'index.html'))) {
        const staticFiles = express.static(frontendDist, { index: false });
        app.use((req, res, next) => {
          if (req.path.startsWith('/api/') || req.path === '/healthz' || req.path.startsWith('/matchmake') || req.path.startsWith('/colyseus')) { next(); return; }
          staticFiles(req, res, next);
        });
        app.get('*', (req, res, next) => {
          if (req.path === '/api' || req.path.startsWith('/api/') || req.path === '/healthz' || req.path.startsWith('/matchmake') || req.path.startsWith('/colyseus') || !req.accepts('html')) { next(); return; }
          res.sendFile(resolve(frontendDist, 'index.html'));
        });
      }
    },
  });
  gameServer.define('pvp_room', PvPRoom);
  return { server: gameServer, tokens, matches };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const { server } = createGameServer();
  const port = Number(process.env.PORT ?? 2567);
  void server.listen(port, '0.0.0.0').then(() => console.log(`Rune Tactics PvP server listening on ${port}`));
}
