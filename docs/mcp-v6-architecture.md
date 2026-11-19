# Rune Tactics V6 — MCP Adapter & AI Agent Matches Architecture

## 1. V6 Scope

Rune Tactics V6 adds an official **Model Context Protocol (MCP)** adapter and deterministic headless agent runner on top of the V5 `MatchService` and Colyseus `PvPRoom` infrastructure—enabling AI agents (`claude`, `codex`, custom LLM or heuristic bots) to play **Headless Practice / Sparring** matches locally and **Live 3D PvP** matches against human players or other MCP agents without duplicating any tactical rules.

### 1.1 Runtime, Packages, and Entrypoints
- **MCP SDK**: Official `@modelcontextprotocol/sdk` (`1.32.2`) with `zod` (`^4.1.12`) schema validation (`McpServer` + `StdioServerTransport`).
- **Colyseus Client in Server**: Promote `@colyseus/sdk` (`^0.18.10`) from `devDependencies` to `dependencies` in `server/package.json` so `server/src/mcp/` can connect to live `PvPRoom` instances in production.
- **Primary Files**:
  - `server/src/mcp/RuneTacticsMcpServer.ts` — registers the 6 MCP tools with Zod schemas and routes `matchId` / `roomId` calls to a unified `McpMatchBackend` registry.
  - `server/src/mcp/PracticeBackend.ts` — in-memory `MatchService` backend for Seat A (`mcp-agent`) vs Seat B (optional `HeuristicBot`).
  - `server/src/mcp/ColyseusRoomBackend.ts` — `@colyseus/sdk` room client backend for live `PvPRoom` matches (`actorType: 'mcp-agent'`).
  - `server/src/mcp/HeuristicBot.ts` — pure tactical policy consuming `(ObservableMatchState, LegalActionsSnapshot)`.
  - `server/src/mcp/AgentMatchRunner.ts` — deterministic `runHeadlessMatch` simulation driver and replay logger.
  - `server/src/mcp/cli.ts` — stdio transport entrypoint (`StdioServerTransport`), writing logs strictly to `stderr` so `stdout` carries only JSON-RPC 2.0 frames.
- **NPM Scripts**:
  - Root `package.json`: `"mcp": "npm --prefix server run mcp"` (and `"build:mcp"` / `"start:mcp"` via `server/package.json`).
  - `server/package.json`: `"mcp": "tsx src/mcp/cli.ts"`, `"build:mcp": "esbuild src/mcp/cli.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/mcp/cli.js"`, `"start:mcp": "node dist/mcp/cli.js"`.

### 1.2 Architecture & Dual-Backend Flow

```text
  MCP Client (Claude / Codex / Custom Agent)
       │ JSON-RPC 2.0 over stdio
       ▼
  server/src/mcp/cli.ts -> RuneTacticsMcpServer
       │ (unified backend registry keyed by matchId / roomId)
       ├─── create_practice_match ──► PracticeBackend ──► in-memory MatchService
       │                                    │                ▲
       │                                    └── Seat B ──────┴── HeuristicBot (optional)
       │
       └─── join_pvp_room ──────────► ColyseusRoomBackend (@colyseus/sdk)
                                            │ HTTP /api/pvp/* + WebSocket
                                            ▼
                                      PvPRoom (actorType: 'mcp-agent')
                                            │
                                            ├──► Server MatchService
                                            └──► Opponent (Human in 3D Browser OR 2nd MCP Agent)
```

- **Headless Practice / Sparring Mode (`PracticeBackend`)**:
  - Runs an isolated in-memory `MatchService` on `forgotten-swamp` (`PVP_DEFAULT_MAP_ID`).
  - Binds the MCP caller to **Seat A** (`teamA`, `actorType: 'mcp-agent'`).
  - When `opponentBot` is `true` (default), Seat B is driven automatically by `HeuristicBot` whenever it is Seat B's turn (`activeSeat === 'B'` and `phase === 'IN_PROGRESS'`), stepping through `MatchService.submitAction` until it is Seat A's turn again or `phase === 'FINISHED'`.
  - When `opponentBot` is `false`, Seat B does not auto-act (useful for testing `NOT_YOUR_TURN`, `wait_for_turn` timeouts, or external Seat B harnesses).
- **Live Colyseus `PvPRoom` Mode (`ColyseusRoomBackend`)**:
  - Connects to any running Rune Tactics PvP server (`http://localhost:2567` by default, or remote HTTPS/WSS deployment) via `@colyseus/sdk` using `actorType: 'mcp-agent'`.
  - Supports both **creating a room** (`createRoom: true`, returning a public Room ID such as `RT-K9M2W7P4` to paste into the 3D browser client or share with another agent) and **joining an existing room** by that ID, enabling **Human vs MCP Agent** and **MCP Agent vs MCP Agent** in real-time 3D with full spectator/HUD rendering. The MCP obtains its session token automatically from the backend; providers do not need `PVP_SESSION_SECRET`.

---

## 2. Auth & Schema Extensions

V5 already defines `ActorType = 'human' | 'mcp-agent' | 'system'` and `ActorContext.type` in `src/shared/pvpTypes.ts`, while `SessionTokenService` and `PvPRoom` currently hardcode `'human'`. V6 completes end-to-end propagation with backward-compatible, additive changes:

### 2.1 `SessionTokenService` & `POST /api/pvp/session`
- **`server/src/auth/SessionTokenService.ts`**:
  - Define `export type SessionActorType = 'human' | 'mcp-agent';` (callers may **never** self-issue `'system'`).
  - Extend `SessionIdentity`:
    ```ts
    export interface SessionIdentity {
      actorId: string;
      displayName: string;
      actorType: SessionActorType;
      issuedAt: number;
      expiresAt: number;
    }
    ```
  - Update `createSession(displayName?: unknown, actorType?: unknown, now = Date.now())`:
    - Accepts `actorType` `'human' | 'mcp-agent'`, defaulting to `'human'` when omitted.
    - Returns `{ sessionToken, actorId, displayName, actorType, expiresAt }`.
  - Update `verifyToken(token, now)`: validates `identity.actorType === 'human' || identity.actorType === 'mcp-agent'` (rejecting tampered or `'system'` tokens).
- **`server/src/index.ts`**:
  - `POST /api/pvp/session` accepts `{ displayName?: string, actorType?: 'human' | 'mcp-agent' }`.
  - If `req.body?.actorType !== undefined` and is not `'human'` or `'mcp-agent'`, respond `400 Bad Request` (`{ error: 'Invalid actorType' }`).
  - Otherwise call `tokens.createSession(req.body?.displayName, req.body?.actorType)` and return `201`.

### 2.2 `PvPRoomState` & `PvPRoom` Propagation
- **`server/src/schema/PvPRoomState.ts`**:
  - Add `actorType: t.string()` to `SeatSchema`:
    ```ts
    export const SeatSchema = schema({
      seat: t.string(),
      displayName: t.string(),
      actorType: t.string(),
      connected: t.boolean(),
      ready: t.boolean(),
      rematchRequested: t.boolean(),
      selectedClasses: t.array('string'),
      reconnectDeadlineMs: t.float64(),
    }, 'SeatSchema');
    ```
- **`src/shared/pvpTypes.ts` & `src/game/pvp/MatchService.ts`**:
  - Add optional `actorType?: ActorType` to `PvPSeatInfo` and `CreateMatchInput['seatA' | 'seatB']` (defaulting to `'human'` when omitted so existing V5 callers remain unchanged).
  - `MatchService.projectSeat` copies `info.actorType` onto `PvPSeatInfo`.
- **`server/src/rooms/PvPRoom.ts`**:
  - `PvPRoom.onAuth` verifies `SessionIdentity` (which carries `actorType`) and attaches it to `client.auth`.
  - `SeatRecord` (extends `SessionIdentity`) retains `actorType`.
  - `newSeatSchema(seat)` initializes `actorType: ''`; `syncSeat(seat)` stamps `target.actorType = source.actorType`.
  - `seatPayload(seat)` includes `actorType: s?.actorType ?? ''` in `lobbyState` broadcasts so the browser lobby can badge `'mcp-agent'` opponents.
  - `actor(record)` returns `{ actorId: record.actorId, seat: record.seat, team: seatToTeam(record.seat), type: record.actorType }` instead of hardcoded `'human'`.
  - `startMatch()` passes `actorType: a.actorType` / `actorType: b.actorType` to `MatchService.createMatch(...)`.

---

## 3. MCP Tool Contracts (Zod Schemas)

All 6 tools live in `server/src/mcp/RuneTacticsMcpServer.ts`. Every input is validated with Zod before touching a backend; domain rejections from `MatchService` return structured `CommandResult` (`ok: false`) payloads rather than crashing the MCP session.

### 3.1 Shared Zod Schemas
```ts
const HeroClassSchema = z.enum(PVP_HERO_CLASSES); // 'knight' | 'archer' | 'mage' | 'cleric'

const TeamClassesSchema = z
  .array(HeroClassSchema)
  .length(PVP_TEAM_SIZE)
  .refine((arr) => new Set(arr).size === PVP_TEAM_SIZE, {
    message: 'Must select 3 unique hero classes.',
  });

const GridCoordSchema = z.object({
  x: z.number().int().min(0).max(GRID_SIZE - 1),
  y: z.number().int().min(0).max(GRID_SIZE - 1),
});

const GameCommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Move'), unitId: z.string().min(1), to: GridCoordSchema }),
  z.object({ type: z.literal('Attack'), unitId: z.string().min(1), targetId: z.string().min(1) }),
  z.object({ type: z.literal('UseSkill'), unitId: z.string().min(1), targetCell: GridCoordSchema }),
  z.object({ type: z.literal('Defend'), unitId: z.string().min(1) }),
  z.object({ type: z.literal('UndoMove'), unitId: z.string().min(1) }),
  z.object({ type: z.literal('SmartAttack'), unitId: z.string().min(1), targetId: z.string().min(1) }),
  z.object({ type: z.literal('SmartUseSkill'), unitId: z.string().min(1), targetCell: GridCoordSchema }),
  z.object({ type: z.literal('EndTurn'), unitId: z.string().min(1) }),
]);
```

### 3.2 Tool Definitions

| Tool | Input Schema | Output Shape | Backend Behavior |
|---|---|---|---|
| `create_practice_match` | `{ seed?: int (0..0x7fffffff), classesA?: TeamClasses, classesB?: TeamClasses, opponentBot?: boolean (default true) }` | `{ matchId, seat, team, state, legalActions }` | Creates an in-memory `MatchService` match (`startingTeam: 'teamA'`, default classes `['knight', 'archer', 'mage']` vs `['knight', 'archer', 'cleric']`). Binds MCP caller to Seat A (`'teamA'`). |
| `join_pvp_room` | `{ serverUrl?: url, roomId?: /^RT-[A-HJ-NP-Z2-9]{8}$/i, inviteCode?: same (legacy alias), createRoom?: boolean, displayName?: string (2..20), classes?: TeamClasses }` | `{ roomId: ColyseusRoomId, inviteCode: public Room ID, matchId?, seat, phase }` | Acquires `actorType: 'mcp-agent'` session via `POST /api/pvp/session` (so the MCP process does not sign tokens or need `PVP_SESSION_SECRET`). Creates (`POST /api/pvp/rooms`) or looks up the public Room ID, joins via `@colyseus/sdk`, auto-sends `selectClasses` (`PvPHeroClass[]`) + `setReady(true)` once in draft/ready phases. Registers backend under the internal Colyseus `roomId` and aliases `state.matchId` upon `matchInit`. |
| `get_match_state` | `{ matchId: string }` | `ObservableMatchState` | Returns latest `ObservableMatchState` with `viewer: { seat, myTeam, opponentTeam, isMyTurn }` stamped for the bound seat. If called on a pre-match `roomId` before `matchInit`, returns an MCP tool error reporting current lobby `phase`. |
| `get_legal_actions` | `{ matchId: string }` | `LegalActionsSnapshot` | Returns exact pre-computed `moves`, `attacks`, `smartAttacks`, `skills`, `smartSkills`, `defendCommand`, `undoMoveCommand`, `endTurnCommand`, and `isYourTurn`. |
| `submit_action` | `{ matchId: string, commandId: string (1..128), expectedRevision: int >= 0, command: GameCommand }` | `CommandResult` | Constructs `CommandEnvelope` and submits through `MatchService.submitAction` (practice) or `room.send('command', envelope)` awaiting matching `commandResult` (live). In practice mode with `opponentBot: true`, steps Seat B's `HeuristicBot` after returning/cloning Seat A's `CommandResult` whenever `activeSeat === 'B'`. |
| `wait_for_turn` | `{ matchId: string, timeoutMs?: int (100..300000, default 30000) }` | `{ isYourTurn, phase, state, legalActions }` | Resolves immediately if `legalActions.isYourTurn === true` or `phase === 'FINISHED'`. Otherwise blocks asynchronously until own turn starts (including waiting through `WAITING_FOR_PLAYER` -> `matchInit` when passed a `roomId`), match finishes, or `timeoutMs` elapses (returning `isYourTurn: false` without throwing so the caller can re-wait). |

### 3.3 `ColyseusRoomBackend` Draft & Sync Notes
- **Ready-reset handling**: `PvPRoom.selectClasses` clears `ready = false` on **both** seats whenever either player submits or updates their class selection (`PvPRoom.ts`). `ColyseusRoomBackend` listens to `lobbyState` and automatically re-sends `room.send('setReady', true)` if its `selectedClasses` (`3` unique classes) are set and `ready === false` while `roomPhase` is `'CHARACTER_SELECTION'` or `'WAITING_FOR_READY'`.
- **Wire payload alignment**: Sends raw `PvPHeroClass[]` for `'selectClasses'` and raw `boolean` (`true`) for `'setReady'`, matching `PvPRoom` message handlers verbatim.
- **Reconnection**: Preserves `room.reconnection` defaults (`allowReconnection(client, 90)` on the server) and refreshes cached `ObservableMatchState` + `LegalActionsSnapshot` on `matchInit` after reconnect.

---

## 4. Headless `HeuristicBot` & `AgentMatchRunner`

### 4.1 `HeuristicBot` (`server/src/mcp/HeuristicBot.ts`)
- **Pure Consumer Contract**:
  ```ts
  export interface BotPolicy {
    readonly name: string;
    selectCommand(state: ObservableMatchState, legal: LegalActionsSnapshot): GameCommand;
  }
  ```
- **Zero Rule Duplication**: `HeuristicBot` imports **nothing** from `src/game/` (`GridSystem`, `CombatSystem`, `AttributeSystem`, `EnemyAI`). All reachability, LoS, damage (`estimatedDamage`, `wouldKill`), and skill AoE (`affectedUnitIds`) come exclusively from `LegalActionsSnapshot` + `ObservableMatchState`.
- **Deterministic Decision Priority** (no `Math.random`; ties broken deterministically by score, distance, coordinate `(y, x)`, and `unitId` lexicographic order):
  1. **Lethal Finish**: If `attacks` or `smartAttacks` has `wouldKill === true`, pick the kill maximizing target priority (threat / lowest `targetHp`) with minimal `steps`.
  2. **High-Value Skill**:
     - For `cleric` (`healing-light`): pick `skills` / `smartSkills` maximizing total missing HP restored (`sum(maxHp - hp)` across `affectedUnitIds`), prioritizing critically wounded allies (`hp <= maxHp * 0.5`).
     - For offensive skills (`runic-strike`, `marked-shot`, `arcane-burst`): prefer casts hitting multiple living enemies or finishing wounded targets (`skills` before `smartSkills` at equal value).
  3. **Optimal Basic Attack**: Pick the highest-scoring entry across `attacks` and `smartAttacks` (`estimatedDamage`, bonus for weakening low-HP enemies, penalty for `steps` when `attackRange > 1` exposes a ranged unit).
  4. **Tactical Advance (`moves`)**: If no attack/skill is available and `canMove`, score reachable cells by closing Manhattan distance to the nearest living opponent (preferring `bridgeCells` on `forgotten-swamp` to cross the central moat, while keeping `attackRange >= 2` heroes at max range rather than stepping into melee).
  5. **Defend / End Turn**: If `canDefend` is true (`defendCommand !== null`) and no attack/skill was taken, issue `Defend`; otherwise if `hasAttacked` is already spent (e.g., after a 0-step `SmartAttack` or `Attack`) and no beneficial defensive kite move applies, issue `endTurnCommand` (`EndTurn`) so activations always terminate cleanly.

### 4.2 `AgentMatchRunner` (`server/src/mcp/AgentMatchRunner.ts`)
- Drives two `BotPolicy` instances (`botA`, `botB`, defaulting to `HeuristicBot`) through an isolated `MatchService` using a deterministic injected `ClockFn` (no wall-clock timers or `Date.now()`).
- **Signature & Return Type**:
  ```ts
  export interface RunHeadlessMatchInput {
    matchId?: string;
    seed: number;
    mapId?: string;
    startingTeam?: PvPTeam;
    classesA?: [PvPHeroClass, PvPHeroClass, PvPHeroClass];
    classesB?: [PvPHeroClass, PvPHeroClass, PvPHeroClass];
    botA?: BotPolicy;
    botB?: BotPolicy;
    maxCommands?: number; // Safety circuit breaker (default 1000)
  }

  export interface ReplayLogEntry {
    step: number;
    commandId: string;
    seat: PlayerSeat;
    team: PvPTeam;
    revision: number;
    command: GameCommand;
    events: PvPGameplayEvent[];
  }

  export interface HeadlessMatchResult {
    winnerTeam: PvPTeam;
    rounds: number;
    totalCommands: number;
    replayLog: ReplayLogEntry[];
  }

  export function runHeadlessMatch(input: RunHeadlessMatchInput): HeadlessMatchResult;
  ```
- **Determinism Guarantee**: Given identical `(seed, mapId, startingTeam, classesA, classesB, botA, botB)`, `runHeadlessMatch` produces bit-for-bit identical `winnerTeam`, `rounds`, `totalCommands`, and `replayLog`, enabling fast CI balance suites and reproducible replay verification.

---

## 5. Security & Layer Boundaries

### 5.1 Layer Isolation Matrix (V6 Additions)

| Directory | Allowed Imports | Forbidden Imports |
|---|---|---|
| `src/game/` | `src/shared/`, `src/config/` | `@modelcontextprotocol/sdk`, `zod`, `colyseus`, `@colyseus/sdk`, `@colyseus/schema`, `three`, DOM |
| `src/shared/` | None (pure types) | Any runtime or layer package |
| `server/src/mcp/` | `@modelcontextprotocol/sdk`, `zod`, `@colyseus/sdk`, `src/shared/pvpTypes.ts`, `src/config/gameConfig.ts`, `src/game/pvp/MatchService.ts` | `src/rendering/`, `src/input/`, `src/ui/`, `src/network/`, `three`, DOM |
| `server/src/mcp/HeuristicBot.ts` | `src/shared/pvpTypes.ts`, `src/config/gameConfig.ts` | `src/game/` (zero rule/engine imports), `colyseus`, `@modelcontextprotocol/sdk`, `three`, DOM |

### 5.2 Authorization, Concurrency, and Transport Safety
1. **Immutable Seat Binding**: No MCP tool accepts `actorId`, `seat`, or `team`.
   - In **Practice Mode**, `PracticeBackend` binds the MCP session strictly to its created `ActorContext` (`seat: 'A', team: 'teamA', type: 'mcp-agent'`); Seat B uses a separate internal `ActorContext`.
   - In **Colyseus Mode**, `PvPRoom.onAuth` verifies the HMAC-signed `SessionIdentity`, reserves one seat, and builds `ActorContext` exclusively server-side (`client.auth` + seat record).
   - Clients can never mint `actorType: 'system'` via `POST /api/pvp/session`.
2. **Unified `MatchService` Enforcement**: Every MCP command passes through `MatchService.submitAction`, enforcing:
   - `UNAUTHORIZED_ACTOR` if the actor does not own the match seat,
   - `NOT_YOUR_TURN` if `actor.team !== activeTeam`,
   - `UNIT_NOT_ACTIVE` if `command.unitId !== activeUnitId`,
   - `STALE_REVISION` if `expectedRevision !== currentRevision`,
   - `(actorId, commandId)` idempotency (`idempotentReplay: true`) and payload mismatch rejection (`COMMAND_CONFLICT`),
   - Identical turn timer, pause/resume, and rule validation as human players.
3. **Shared Session Secret (`PVP_SESSION_SECRET`) & Root `.env` Loading**:
   - Both the Colyseus server and the MCP stdio CLI automatically load the repository root `.env` via `server/src/config/env.ts` regardless of the process working directory (`cwd`).
   - When connecting to a live PvP room via `join_pvp_room`, the MCP client signs session tokens locally with `PVP_SESSION_SECRET`, which the Colyseus backend validates. Both processes must share the exact same secret to avoid `401 Unauthorized`.
   - In production (`NODE_ENV=production`), `PVP_SESSION_SECRET` must be provided via host environment variables (fails fast if omitted).
   - In development, a fallback development secret ensures Colyseus and MCP agree even if `.env` is unconfigured.
   - Secrets are never exposed via `VITE_` prefixes and never logged to stdout/stderr.
4. **Network & Stdio Hygiene**:
   - `join_pvp_room` validates `serverUrl` as `http:` / `https:` / `ws:` / `wss:` (optionally restricted by `MCP_ALLOWED_SERVER_URLS` env var when hosted).
   - `cli.ts` never calls `console.log` to `stdout`; all operational logging goes to `process.stderr` so MCP JSON-RPC framing stays uncorrupted.
