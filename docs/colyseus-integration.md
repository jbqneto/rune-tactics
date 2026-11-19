# Rune Tactics V5 — Colyseus Integration (`0.18.12`)

## 1. Versions and Packages

- **Server**: `colyseus` (`0.18.12`), `@colyseus/schema` (`5.0.49`), `@colyseus/ws-transport` (matching `0.18.x`), Node.js (`>= 20 LTS`) + TypeScript.
- **Client SDK**: `@colyseus/sdk` (`0.18.10`) in Vite + TypeScript frontend (`src/network/`).
- **Rule Isolation**: `server/` imports `MatchService` from `src/game/pvp/MatchService.ts`, `gameConfig.ts`, and `src/shared/pvpTypes.ts`. `src/game/` NEVER imports `colyseus` or `@colyseus/schema`.

---

## 2. Authentication (`onAuth`) and Temporary Session Tokens

Because V5 has no permanent account database yet, players authenticate via lightweight server-issued ephemeral session tokens:

1. **Issue Session (`POST /api/pvp/session`)**:
   - Body: `{ displayName?: string }` (sanitized 2–20 chars, fallback `'Commander'`).
   - `SessionTokenService` generates `{ actorId: crypto.randomUUID(), displayName, issuedAt, expiresAt }` (TTL e.g. 12 hours), signed with HMAC-SHA256 (`PVP_SESSION_SECRET` env var, automatically loaded from repository root `.env` across both Colyseus server and MCP CLI regardless of execution `cwd`, or provided via host environment secrets. In production `NODE_ENV=production`, `PVP_SESSION_SECRET` is strictly required).
   - Returns `{ sessionToken, actorId, displayName, expiresAt }`. Client stores in `sessionStorage`.
2. **Create / Resolve Private Room**:
   - `POST /api/pvp/rooms` (requires valid `sessionToken`): generates a unique public Room ID (`RT-XXXXXXXX`, 8 random characters after the prefix), reserves/creates a private `pvp_room` via `matchMaker.createRoom('pvp_room', { inviteCode })`, and returns `{ roomId, inviteCode }`. The internal Colyseus `roomId` stays an implementation detail; players share only the public Room ID.
   - `GET /api/pvp/rooms/:inviteCode` (requires a session token generated automatically for the player): accepts the public Room ID, resolves active private room metadata, and returns `{ roomId, phase, playersCount }`.
   - Client connects via `client.joinById(roomId, { sessionToken, inviteCode })`.
3. **Colyseus `onAuth(client, options, context)`**:
   - Extracts `sessionToken` from `options.sessionToken` (or `context.token`).
   - Verifies HMAC signature and expiration via `SessionTokenService.verifyToken(token)`. Rejects invalid/missing tokens with `new ServerError(4001, 'Invalid or expired session token')`.
   - Checks room capacity & seat binding:
     - If `actorId` already owns Seat A or Seat B (e.g., reconnect or second tab takeover), authorizes return to that seat.
     - If 2 distinct `actorId`s already occupy Seat A and Seat B, throws `new ServerError(4003, 'Match room is full')`.
   - Returns `auth = { actorId, displayName }` assigned to `client.auth`.
   - **Invariant**: Client payloads NEVER determine `actorId`, `seat`, or `team`; `PvPRoom` derives `ActorContext` exclusively from `client.auth` + seat table.

---

## 3. Public Room ID Generation (`RT-XXXXXXXX`)

- Format: `RT-` followed by 8 uppercase unambiguous characters from alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (omits `0/O/1/I/L` for readability).
- Generated with `crypto.randomInt` on the server (`SessionTokenService`), checking the active-room map to avoid collisions. This is unique among active rooms in the single POC server process; no database or distributed ID service is involved.
- The public Room ID is the only room locator the human or MCP agent needs to provide. The client's session token is issued automatically by the backend and is not another user-entered code.
- `PvPRoom` calls `this.setPrivate(true)` and `this.setMetadata({ inviteCode, phase })` so private rooms do not appear in open public listings unless explicitly queried by public Room ID.

---

## 4. `PvPRoom` State Machine

```text
  [Room Created: host joins Seat A]
                 │
                 ▼
        WAITING_FOR_PLAYER
                 │ (Seat B joins)
                 ▼
        CHARACTER_SELECTION ◄──────────────────────────┐
                 │ (Both seats have 3 unique classes)  │
                 ▼                                     │ (Both players vote Rematch;
         WAITING_FOR_READY                             │  alternates startingTeam)
                 │ (Both seats ready === true)         │
                 ▼                                     │
             STARTING ──► MatchService.createMatch()   │
                 │                                     │
                 ▼                                     │
            IN_PROGRESS ◄───(reconnect <= 90s)──┐      │
                 │                              │      │
                 ├──(onDrop: unconsented)───────┴──► PAUSED_DISCONNECTED
                 │                                     │
                 ├──(90s timeout -> forfeitMatch)──────┤
                 ├──(elimination / consented forfeit)──▼
                 └────────────────────────────────► FINISHED
```

### Phase Transitions
- `WAITING_FOR_PLAYER`: `maxClients = 2`. Host (`Seat A`) waits with copyable public Room ID `RT-XXXXXXXX`. If host leaves cleanly before Seat B arrives, room disposes.
- `CHARACTER_SELECTION`: Both seats pick 3 unique classes from `PVP_HERO_CLASSES` (`knight`, `archer`, `mage`, `cleric`) in desired turn slot order `[0, 1, 2]` via `selectClasses` message.
- `WAITING_FOR_READY`: Activated as soon as both seats have 3 valid classes (players can still adjust classes/order and toggle `setReady(true/false)`; toggling unready returns to `CHARACTER_SELECTION` or toggles `ready` bit). When both `seatA.ready && seatB.ready`:
  - Transitions through `STARTING` -> creates match in `MatchService` with `seed = crypto.randomInt(0, 0x7fffffff)` and `mapId = PVP_DEFAULT_MAP_ID` (`'forgotten-swamp'`) -> sends unicast `matchInit` + `legalActions` to each seat -> enters `IN_PROGRESS` and starts the 60s `this.clock` turn timer.
- `IN_PROGRESS`: Accepts `command` (`CommandEnvelope`) and `forfeit` messages. Turn timer runs via `this.clock`.
- `PAUSED_DISCONNECTED`: Entered via `onDrop` when a connected player drops during `IN_PROGRESS`. Calls `MatchService.pauseMatch(matchId)`, pauses turn clock (`pausedRemainingTurnMs`), and sets `reconnectDeadlineMs = Date.now() + 90_000`.
- `FINISHED`: Entered on elimination, disconnect timeout (after 90s), or voluntary forfeit. Allows `requestRematch` / `cancelRematch` or leaving to menu.

---

## 5. Reconnection (`allowReconnection(client, 90)`) — Colyseus `0.18` Lifecycle

Colyseus `0.18` separates unexpected network drops (`onDrop`) from permanent departure (`onLeave`) and recovery (`onReconnect`):

1. **Client side (`@colyseus/sdk@0.18.10`)**:
   - On `joinById`, save `room.reconnectionToken` in `sessionStorage` (`rune_tactics_pvp_reconnect`).
   - Configure `room.reconnection.maxRetries = 10`, `room.reconnection.maxDelay = 5000`.
   - On `room.onDrop(...)`: display `"Connection lost — reconnecting..."` non-destructive overlay.
   - On `room.onReconnect(...)`: hide overlay and wait for server `matchInit` sync.
   - On full browser reload during active match: startup checks `sessionStorage` for `reconnectionToken` and attempts `client.reconnect(token)` before clearing stale tokens on failure.
2. **Server side (`PvPRoom` in `colyseus@0.18.12`)**:
   - **`async onDrop(client, code)`**:
     - Look up seat for `client.sessionId`. Mark `seat.connected = false`.
     - If `roomPhase === 'IN_PROGRESS'`: transition to `PAUSED_DISCONNECTED`, call `MatchService.pauseMatch(matchId)`, clear active turn timer, set `reconnectDeadlineMs = Date.now() + 90_000`.
     - Call `await this.allowReconnection(client, 90)` (keeps seat reserved for 90 seconds).
     - Note: in `colyseus@0.18`, if `allowReconnection` resolves, `onReconnect(client)` runs; if 90s expires or client permanently leaves, `onLeave(client, code)` executes.
   - **`onReconnect(client)`**:
     - Update seat `connected = true`, `reconnectDeadlineMs = 0`.
     - If both seats connected and `roomPhase === 'PAUSED_DISCONNECTED'`: call `MatchService.resumeMatch(matchId)`, reschedule 60s remaining turn clock via `this.clock`, restore `roomPhase = 'IN_PROGRESS'`.
     - Unicast fresh `matchInit` (`ObservableMatchState` + `mySeat` + `LegalActionsSnapshot`) to reconnected client so UI, `BoardRenderer`, and `UnitRenderer` reconcile immediately.
   - **`onLeave(client, code)`**:
     - Invoked on consented leave (`room.leave()`), timeout of `allowReconnection(90)`, or terminal drop.
     - If `roomPhase === 'IN_PROGRESS'` or `'PAUSED_DISCONNECTED'`: enqueue `MatchService.forfeitMatch(matchId, seat, code === 1000 ? 'forfeit' : 'disconnect_timeout')`, broadcast `matchEvents` (`battleEnded`), update schema to `FINISHED`.
     - If `roomPhase === 'FINISHED'`: abort rematch offer and notify remaining player.

---

## 6. `@colyseus/schema@5.0.49` State Separation

`@colyseus/schema@5.0.49` uses the functional `schema({ ... }, "Name")` and `t.*` builder syntax (no TypeScript experimental decorators) and client-side `getStateCallbacks(room)`.

We explicitly separate state into **four tiers** to keep delta patches small and deterministic:

1. **Static Config (NOT in Schema)**:
   - `MAPS` (`forgotten-swamp` obstacles, `bridgeCells`, `gridSize = 12`), `UNIT_STATS`, `SKILLS`, `portraitPath`, `icon`. Both client and server read `src/config/gameConfig.ts` by `mapId` / `UnitType`.
2. **Stable Room & Seat Schema (`PvPRoomState` & `SeatSchema`)**:
   - Changes rarely (join, draft pick, ready, disconnect, rematch):
   - `SeatSchema`: `seat` (`t.string()`), `displayName` (`t.string()`), `connected` (`t.boolean()`), `ready` (`t.boolean()`), `rematchRequested` (`t.boolean()`), `selectedClasses` (`t.array(t.string())`), `reconnectDeadlineMs` (`t.float64()`).
   - Root fields: `roomPhase` (`t.string()`), `inviteCode` (`t.string()`), `matchId` (`t.string()`), `matchIndex` (`t.uint16()`), `mapId` (`t.string()`), `seed` (`t.uint32()`), `startingTeam` (`t.string()`), `seats` (`t.map(SeatSchema)`).
3. **Dynamic Tactical Match Schema (`MatchDynamicSchema` inside `PvPRoomState`)**:
   - Changes per command/turn; mirrors `MatchService` state for automatic reconnect hydration & HUD timers:
   - `revision` (`t.uint32()`), `round` (`t.uint16()`), `turnIndex` (`t.uint8()`), `activeTeam` (`t.string()`), `activeUnitId` (`t.string()`), `canUndoMove` (`t.boolean()`), `turnDeadlineMs` (`t.float64()`), `pausedRemainingTurnMs` (`t.float64()`), `winnerSeat` (`t.string()`), `finishReason` (`t.string()`), `turnOrder` (`t.array(t.string())`).
   - `PvPUnitSchema` inside `units: t.map(PvPUnitSchema)`: `id` (`t.string()`), `type` (`t.string()`), `team` (`t.string()`), `slot` (`t.uint8()`), `x` (`t.int8()`), `y` (`t.int8()`), `hp` (`t.int16()`), `maxHp` (`t.int16()`), `alive` (`t.boolean()`), `hasMoved` (`t.boolean()`), `hasAttacked` (`t.boolean()`), `hasActivatedThisRound` (`t.boolean()`), `skillCooldown` (`t.uint8()`), `isGuarding` (`t.boolean()`).
4. **Transient Event & Legal-Action Messages (via `room.send` / `room.broadcast`, NOT in Schema)**:
   - `matchInit` (unicast on start & reconnect): `{ mySeat, state: ObservableMatchState, legalActions: LegalActionsSnapshot }`
   - `matchEvents` (broadcast per accepted action/timeout/forfeit): `{ revision, events: PvPGameplayEvent[], state: ObservableMatchState }`
   - `commandResult` (unicast to sender): `CommandResult`
   - `legalActions` (unicast to each seat after every state transition): `LegalActionsSnapshot`

> **Why events are messages rather than Schema arrays**: `UnitRenderer` needs contiguous chronological batches (`skillUsed` -> `unitAttacked[]` -> `unitDied`) to play composite VFX and animations once per transition without replaying historical events on reconnect.

---

## 7. Serialized Command Processing

Inside `PvPRoom`, incoming WebSocket messages (`command`, `selectClasses`, `setReady`, `forfeit`, `requestRematch`) and server `clock` callbacks (`turnTimeout`, `disconnectForfeit`) are funneled through a **per-room FIFO async mutex queue**:

```ts
private opQueue: Promise<void> = Promise.resolve();

private enqueue(task: () => Promise<void> | void): Promise<void> {
  const next = this.opQueue.then(task, task);
  this.opQueue = next.catch((err) => {
    console.error('[PvPRoom] Serialized task error:', err);
  });
  return next;
}
```

Guarantees:
- Two concurrent commands (e.g., Seat A sends `EndTurn` at `t = 59.999s` while the 60s timeout fires at `t = 60.000s`) NEVER race or interleave mutations on `MatchService` or `PvPRoomState`.
- Whichever enters the queue first updates `revision` (or ends the turn); the second sees the updated `revision`/`turnDeadlineMs` and is cleanly rejected (`STALE_REVISION`) or becomes a no-op!

---

## 8. Docker, Coolify, and HTTPS/WSS Deployment Notes

- **Single-Origin Recommended Topology**:
  - Multi-stage `Dockerfile` builds:
    1. Frontend Vite bundle (`npm run build` -> `dist/`).
    2. Colyseus Node server (`server/dist/index.js`).
  - In production, the Node HTTP server (`server/src/index.ts`) mounts Colyseus `WebSocketTransport`, `/api/pvp/*` REST endpoints, `/healthz` healthcheck, and serves static assets from `dist/` (with SPA fallback).
  - **Result**: Browser loads `https://play.yourdomain.com`, fetches `/api/pvp/*` over HTTPS, and connects WebSockets to `wss://play.yourdomain.com` (same origin -> zero CORS friction!).
- **Coolify / Reverse Proxy (Traefik / Caddy / Nginx)**:
  - Expose single container port (e.g., `PORT=2567`).
  - Terminate TLS (HTTPS + WSS) at Coolify's reverse proxy; forward HTTP/1.1 with `Upgrade: websocket` and `Connection: Upgrade` headers to container port `2567`.
  - Set `proxy_read_timeout` >= `120s` (Colyseus WebSocket heartbeat handles keepalive pings; `allowReconnection(client, 90)` covers transient proxy drops).
  - Environment variables:
    - `PORT=2567`
    - `NODE_ENV=production`
    - `PVP_SESSION_SECRET=<random-32+-byte-hex>`
    - `ALLOWED_ORIGINS` (optional; outside production an empty value already allows loopback dev clients such as Vite `:5173` talking to `:2567`; production trusts only same-origin plus this list).
  - Client endpoint resolution in `ColyseusMatchClient.ts`:
    - Configurable via `VITE_PVP_SERVER_URL` (e.g. `http://localhost:2567` / `ws://localhost:2567` in local dev) and defaults in production to `window.location.origin` (converting `https:` -> `wss:`, `http:` -> `ws:`).
  - Note on horizontal scaling: V5 uses a single Colyseus instance with in-memory `MatchService` + `@colyseus/ws-transport` (sticky single instance in Coolify). Redis presence/driver can be added in V6+ if multi-node scaling is needed.
