# Rune Tactics

A browser-based turn-based tactical RPG built with TypeScript and Three.js.

Rune Tactics features four distinct game modes:
1. **AI Agent Matches & MCP Adapter** (New in V6): Play with or against autonomous AI agents via the Model Context Protocol (MCP), run headless sparring simulations against `HeuristicBot`, or connect external LLM agents to live 3D PvP rooms.
2. **Multiplayer PvP (3v3)** (V5): Online 2-player tactical battles powered by Colyseus with draft selection, 180° mirrored camera angles, a 60s authoritative turn clock, and 90s reconnection grace.
3. **The Ashen Campaign** (V4): A sequential 5-stage campaign with attribute progression (`STR`, `DEX`, `INT`, `FORT`), camp screen between stages, stage checkpoints, and `localStorage` persistence.
4. **Quick Battle**: Standalone PvE skirmishes against AI with seeded randomized maps and spawn positions.

---

## What's New in V6 — MCP Adapter & AI Agent Matches

### Model Context Protocol (MCP) Server over Stdio
- **Official MCP SDK**: Built on `@modelcontextprotocol/sdk` (`1.32.2`) with Zod schema validation in `server/src/mcp/`.
- **Stdio Transport**: The entrypoint (`server/src/mcp/cli.ts`) operates via `StdioServerTransport`. Operational logs are directed strictly to `stderr`, keeping `stdout` reserved for clean JSON-RPC 2.0 frames.
- **Run via Stdio**:
  ```bash
  npm run mcp             # Run MCP server using tsx
  npm run build:mcp       # Bundle MCP server to server/dist/mcp/cli.js
  ```

### Available MCP Tools

| Tool | Description |
|---|---|
| `create_practice_match` | Starts an instant headless in-memory match on `forgotten-swamp`. Binds the caller to Seat A (`'teamA'`) with Seat B driven automatically by `HeuristicBot`. |
| `join_pvp_room` | Connects to a live Colyseus PvP server (local or remote) with `actorType: 'mcp-agent'`. Supports creating a room (returning a public Room ID `RT-XXXXXXXX`) or joining an existing Room ID. |
| `get_match_state` | Returns the current `ObservableMatchState` enriched with viewer metadata (`myTeam`, `opponentTeam`, `isMyTurn`). |
| `get_legal_actions` | Returns the exact `LegalActionsSnapshot` containing pre-calculated paths, ranges, smart attack/skill plans, damage estimates, and `wouldKill` flags. |
| `submit_action` | Submits a command (`Move`, `Attack`, `UseSkill`, `Defend`, `SmartAttack`, `SmartUseSkill`, `UndoMove`, `EndTurn`) with `expectedRevision` and `commandId` idempotency. |
| `wait_for_turn` | Asynchronously waits until it is the agent's turn or the match concludes, handling lobby transitions and timeouts cleanly. |

### How to Play: Human vs MCP Agent
1. **Host on Browser**:
   - Launch frontend (`npm run dev`) and server (`npm run dev:server`).
   - In the browser menu, click **Multiplayer PvP (3v3)** -> **Create Match**.
   - Note the room code (e.g. `RT-K9M2W7`).
2. **Connect MCP Agent**:
   - The AI agent calls `join_pvp_room({ inviteCode: 'RT-K9M2W7', displayName: 'ClaudeBot' })`.
3. **Draft & Battle**:
   - Both players draft 3 unique heroes. The MCP agent displays a discrete `[MCP]` badge in the lobby and battle HUD.
   - The match executes in real-time 3D with synchronized 60-second turn clocks.

### How to Run: Headless Agent vs Bot Matches
- **Headless Practice Mode**:
  - The MCP tool `create_practice_match({ opponentBot: true })` instantiates an isolated `MatchService` match where Seat B is piloted deterministically by `HeuristicBot`.
- **Deterministic Match Runner (`AgentMatchRunner`)**:
  - `runHeadlessMatch({ seed, classesA, classesB, botA, botB })` runs complete headless simulations with zero timers, producing bit-for-bit reproducible results and full step-by-step replay logs.
- **Pure Heuristic Policy**:
  - `HeuristicBot` (`server/src/mcp/HeuristicBot.ts`) bases decisions strictly on `LegalActionsSnapshot` and `ObservableMatchState` with zero tactical rule duplication.

---

## What's New in V5 — Online PvP Multiplayer (3v3)

### Server-Authoritative Online Battles (Colyseus 0.18)
- **Dedicated Colyseus Server (`server/`)**: Powered by `colyseus@0.18.12` and `@colyseus/schema@5.0.49`, the server validates every action, enforces turn ownership and a 60-second turn timer, and broadcasts state revisions to both players.
- **Headless `MatchService`**: Transport-agnostic match engine in `src/game/pvp/MatchService.ts` providing optimistic concurrency (`expectedRevision`), `commandId` idempotency, and deterministic outcomes with zero client-side rule recalculation.
- **Single-Queue Serialization**: Room messages and server timeout callbacks are serialized via an asynchronous FIFO queue, eliminating race conditions.

### Room Creation, Public Room ID, and Direct Links
- **Public Room ID (`RT-XXXXXXXX`)**: Creating a match generates an unambiguous 8-character Room ID (e.g., `RT-K9M2W7P4`).
- **Shareable Links**: Direct URL support via `?pvp=RT-XXXXXXXX`. Opening the link automatically populates the Room ID and opens the room join modal.
- **Session Tokens**: Lightweight HMAC-SHA256 ephemeral tokens (`POST /api/pvp/session`) securely bind player identity and seats without requiring permanent account registration.

### 3-Hero Draft & Custom Slot Order
- **Unique Class Selection**: Each player chooses 3 unique hero classes from **Knight**, **Archer**, **Mage**, and **Cleric**.
- **Slot Reordering**: Players reorder their slots `[1, 2, 3]` to customize their activation sequence. The lobby displays a real-time interleaved order preview: `[A1, B1, A2, B2, A3, B3]`.
- **Readiness Sync**: Both players lock in their roster with the "Ready" toggle. Once both are ready, the match launches simultaneously.

### 180° Camera Perspective & Team-Relative Visuals
- **Dynamic 180° Azimuth**:
  - **Seat A** (Host) views the battlefield at `45°` ($\pi / 4$).
  - **Seat B** (Guest) views the battlefield at `225°` ($5\pi / 4$, 180° opposite).
- **Team-Relative Perspectives**:
  - The client adapter (`PvPClientEngine`) projects the spectator perspective so that local units always display as `'player'` (blue) and opponent units display as `'enemy'` (red).
  - **Relative Death Visuals**: Friendly fallen units remain on the battlefield as persistent corpses, while defeated opponent units shrink and vanish.
  - Non-active living units of both teams dim to opacity `0.75` during active PvP battle.

### Reconnection and Disconnect Grace
- **90-Second Grace Window**: If a player's connection drops, the server pauses the match, saves the remaining turn time, and displays a 90-second countdown banner to both players.
- **Seamless Recovery**: Reconnecting within 90s restores match state via Colyseus `allowReconnection(client, 90)` and unicast `matchInit`.
- **Forfeit & Timeout**: If 90 seconds expire, the disconnected player forfeits. Players may also voluntarily forfeit at any time.
- **Rematch Voting**: Upon match conclusion, players can vote for a rematch (which returns to the draft screen and alternates starting team) or return to the main menu.

## What's New in V4

### Attribute System (`STR`, `DEX`, `INT`, `FORT`) and Centralized Damage
- Every unit has four integer attributes (minimum `1`, cap `12`):
  - **`STR` (Strength)**: scales basic attacks and melee skills (`melee`, such as `Runic Strike` and the Cleric's basic strike).
  - **`DEX` (Dexterity)**: scales physical ranged attacks and skills (`ranged`, such as `Marked Shot`).
  - **`INT` (Intellect)**: scales magic attacks (`magic`, such as `Arcane Burst`) and healing potency (`Healing Light` / `Dark Mend`).
  - **`FORT` (Fortitude)**: increases maximum HP (`+2` per point above 4, without healing prior damage when upgraded) and grants passive defense resistance (`+1 DEF` for every 4 points above 4).
- All damage (basic attacks, skills, or telegraphed attacks) goes through a single formula with a **minimum damage floor of 1**: `max(1, attackPower - totalDefense)`.

### Unified Defensive Stance (`Defend`)
- The **Defend (`G`)** action replaces the unit's attack/skill for that activation (usable before or after moving) and activates a defensive stance until the start of that unit's next activation.
- Reduces all incoming damage by **50%** (rounded up, keeping a minimum of `1` damage), including against **Telegraphed Attacks (`PendingAttack`)**.

### 5-Stage Campaign, Camp, and Save Persistence
1. **Stage 1 — Outpost Ruins** (`ruins`): 2 Goblin Scouts + 1 Melee Skeleton.
2. **Stage 2 — Forgotten Swamp** (`forgotten-swamp`): marshy terrain with water obstacles (`water`, blocks movement without blocking line of sight) and 3 narrow bridges; 2 Goblin Stalkers, 2 Goblin Scouts, and 1 Skeleton Archer.
3. **Stage 3 — Fortress of Bones** (`fortress`): 2 Skeleton Shieldbearers, 2 Melee Skeletons, 1 Armored Skeleton, and 1 Skeleton Archer.
4. **Stage 4 — Arcane Catacombs** (`catacombs`): 2 Armored Skeletons, 2 Cultist Mages, and 2 Necromancer Acolytes.
5. **Stage 5 — Corrupted Sanctuary** (`corrupted-sanctuary`): **Ashen Guardian** (Boss), 1 Skeleton Shieldbearer, and 1 Necromancer Acolyte.

- **Recovery and Progression Between Stages (Stages 1–4)**: surviving heroes recover `+35%` of `maxHp` (ceil), fallen heroes revive with `25%` of `maxHp` (ceil), and each hero receives `+1` attribute point to spend in the **Camp & Evolution** screen.
- **Checkpoints and Persistence**: campaign progress is saved automatically to `localStorage` under the key `rune_tactics_v4_save` (version `4`). On defeat or manual restart in Campaign mode, the **Restart Stage (Checkpoint)** button restores the exact state from the start of the current stage.
- **Quick Battle**: picks one of the 8 maps from `MAPS` without consecutive repetition and generates seeded initial positions (`seed`), without reading or modifying the campaign save.

### New Enemies and Two-Phase Boss
- **Goblin Stalker (`goblin-stalker`)**: high mobility (`4` tiles), prioritizes finishing off the most fragile heroes.
- **Skeleton Shieldbearer (`skeleton-shieldbearer`)**: defensive unit that enters the **Defend (`-50%` damage)** stance when surrounded or at `<= 50%` HP.
- **Necromancer Acolyte (`necromancer-acolyte`)**: ranged caster with `Dark Mend` (heals wounded allies, prioritizing the boss).
- **Ashen Guardian (`ashen-guardian`)**: boss with `28 HP`, `5 ATK`, and `2 DEF` that uses **Telegraphed Attacks (`PendingAttack`)** with danger cell indicators on the board:
  - **Phase 1**: prepares `Ashen Slam` (cross pattern, base power `4`), resolved at the start of its next activation (or cancelled immediately if the boss dies before then).
  - **Phase 2 (`<= 50%` HP — Ashen Fury)**: irreversible transition without restoring HP, gains `+1` movement (`2 -> 3`), and begins preparing `Ashen Eruption` (`3×3` area, base power `5`).

## How to Play & Controls

- **Mode Selector**: on launch, choose **New Campaign**, **Continue Campaign** (when a valid save exists), or **Quick Battle**.
- **Mode Selector**: On launch, choose **Multiplayer PvP (3v3)**, **New Campaign**, **Continue Campaign** (when a valid save exists), or **Quick Battle**.
- **PvP Lobby & Room Creation**:
  - Click **Multiplayer PvP (3v3)** to open the PvP modal.
  - Enter a display name.
  - Click **Create Room** to get an `RT-XXXXXXXX` Room ID and a button to copy the direct URL (`http://<host>/?pvp=RT-XXXXXXXX`).
  - To join, enter the public Room ID (`RT-` plus 8 characters) under **Join by Room ID**, or open its direct link in your browser. The browser obtains its session automatically.
  - Draft 3 unique classes (Knight, Archer, Mage, Cleric), reorder your slots, and toggle **Ready**.
- **Alternating Activation Order**: Each living unit acts once per round, alternating between teams according to the fixed queue shown at the top of the HUD.
- **Left Click**:
  - In default mode: click a reachable cell to move, or click an enemy for **smart attack** (automatically moves into the best valid range and attacks).
  - In attack/skill mode: click a valid target or cell (with path and area preview on hover).
- **Right-Click + Drag**: Orbit the camera 360° around the arena.
- **Right Click (stationary click)**: Cancel attack or skill targeting mode.
- **Shortcut `G` or `Defend (G)` button**: Enter defensive stance (`-50%` incoming damage until next activation).
- **Shortcut `E` or `End Turn (E)` button**: End the current activation.
- **`Undo Move` button**: Undoes the last manual movement in the current activation before attacking, defending, or using a skill.
- **`Forfeit` (PvP) / `Restart` (PvE)**: In PvP, forfeit voluntarily ends the match in favor of the opponent. In PvE, restarts from checkpoint or rolls a new map.

Full rules are documented in [docs/game-design.md](docs/game-design.md), [docs/pvp-game-design.md](docs/pvp-game-design.md), [docs/campaign-design.md](docs/campaign-design.md), and [docs/turn-system.md](docs/turn-system.md).

## Status

- **V5 — Online PvP Multiplayer (3v3)** is fully implemented with Colyseus WebSocket server, 3v3 draft, 180° camera, reconnection grace, and client perspective projection.
- **V4 — The Ashen Campaign** and **Quick Battle** are 100% operational and isolated with zero regressions.

## Commands

### Frontend & Client Commands

```bash
npm install
npm run dev           # Start Vite frontend development server (http://localhost:5173)
npm run typecheck     # TypeScript type checking for client
npm test              # Run client unit tests (202 tests via Vitest)
npm run build         # Build production frontend bundle (dist/)
```

### Server, MCP & Full-Stack Commands

```bash
npm run dev:server    # Start Colyseus server in watch mode (tsx)
npm run start:server  # Run built production server
npm run mcp           # Run official MCP server over stdio (tsx)
npm run build:mcp     # Build production MCP server bundle (server/dist/mcp/cli.js)
npm run test:server   # Run Colyseus and MCP server integration tests
npm run test:all      # Run both client and server test suites
npm run typecheck:all # Type check both client and server projects
npm run build:server  # Build production server bundle (server/dist/index.js)
npm run build:all     # Build frontend, server, and MCP bundles for production
```

### Environment Configuration

The repository root `.env` is automatically loaded by both the Colyseus server (`server/src/index.ts`) and the MCP stdio CLI (`server/src/mcp/cli.ts`) regardless of the working directory (`cwd`) from which each process is launched.

Copy `.env.example` to `.env` for local development:

```env
# Colyseus HTTP and WebSocket listener port (default 2567)
PORT=2567

# Shared HMAC-SHA256 secret for PvP player and MCP agent session authentication.
# CRITICAL: Colyseus server and MCP stdio processes MUST share the exact same secret
# to authenticate agent sessions (avoiding 401 Unauthorized on join_pvp_room).
# In production (NODE_ENV=production or ENVIRONMENT=production), server startup fails if omitted.
PVP_SESSION_SECRET=rt-pvp-local-session-secret-shared-v6

# Optional comma-separated CORS origins (e.g. http://localhost:5173).
# Empty outside production: same-origin plus localhost/127.0.0.1 dev clients are allowed.
# Production: only same-origin plus this explicit list.
ALLOWED_ORIGINS=

# Optional frontend override for development (leave empty in production)
VITE_PVP_SERVER_URL=http://localhost:2567
```

> **Security Note**: Never prefix `PVP_SESSION_SECRET` with `VITE_` (to prevent exposing server secrets in the client bundle), never log secret values, and keep `.env` out of Git. In production, supply `PVP_SESSION_SECRET` via host/container environment secrets (e.g., Docker/Coolify secrets).

## Project Structure

```text
server/                          Colyseus 0.18 authoritative server & MCP adapter
  src/index.ts                   Node HTTP/WebSocket server, static dist/ hosting, /api/pvp/*
  src/rooms/PvPRoom.ts           Colyseus room lifecycle, opQueue serialization, reconnect logic
  src/schema/PvPRoomState.ts     Functional @colyseus/schema 5.0 definitions
  src/auth/SessionTokenService.ts HMAC token creation, validation, RT-XXXXXXXX Room ID registry
  src/mcp/                       Model Context Protocol (MCP) server & AI bot adapters
    RuneTacticsMcpServer.ts      MCP tool registry with Zod validation (6 tools)
    PracticeBackend.ts           In-memory MatchService backend with optional HeuristicBot
    ColyseusRoomBackend.ts       Live PvPRoom connector via @colyseus/sdk (actorType: 'mcp-agent')
    HeuristicBot.ts              Pure tactical bot consuming LegalActionsSnapshot
    AgentMatchRunner.ts          Deterministic headless match runner with replay logs
    cli.ts                       Stdio transport entrypoint (StdioServerTransport)
  tests/colyseus-room.test.ts    Room lifecycle and integration tests
src/shared/                      Runtime-free shared contracts
  types.ts                       Core contracts, IGameEngine interface, snapshot models
  pvpTypes.ts                    PvP commands, envelopes, results, events, snapshots
src/config/gameConfig.ts         Constants, maps, attributes, skills, enemies, and PvP timings
src/game/                        Pure tactical core (shared by PvE, PvP, and MCP)
  pvp/PvPMatchEngine.ts          Deterministic 3v3 match rules, mirrored spawns, turn order
  pvp/MatchService.ts            Authoritative match lifecycle, idempotency, 60s turn clock
  attributes/                    Attribute scaling and formulas (AttributeSystem)
  campaign/                      Campaign state machine and persistence (CampaignSystem, SaveSystem)
  combat/                        Centralized damage, healing, Defend, and PendingAttack logic
  ai/                            Deterministic enemy AI and boss behavior (PvE only)
src/network/                     Browser PvP adapter
  ColyseusMatchClient.ts         REST session/room acquisition and WebSocket room client
  PvPClientEngine.ts             Perspective projection (myTeam -> 'player') implementing IGameEngine
src/rendering/                   Three.js scene: arena, 180° camera, corpses, animations
src/input/                       Mouse picking, 3D raycasting, and action modes
src/ui/                          Lobby overlay, 3v3 draft modal, battle HUD, [MCP] badges
tests/                           Client unit tests (16 test files, 203 tests)
docs/                            Architecture, design, and protocol documentation
```

## Documentation

- [MCP V6 Architecture](docs/mcp-v6-architecture.md): Model Context Protocol, HeuristicBot, and AgentMatchRunner
- [Multiplayer Architecture](docs/multiplayer-architecture.md): layers, authoritative `MatchService`, and V6 MCP readiness
- [Colyseus Integration](docs/colyseus-integration.md): Colyseus 0.18 lifecycle, room schema, and reconnection
- [Game Command Contracts](docs/game-command-contracts.md): command envelopes, results, events, and snapshots
- [PvP Game Design](docs/pvp-game-design.md): 3v3 draft, 60s turn clock, 180° camera, and match flows
- [Game Design](docs/game-design.md): general tactical rules, classes, skills, and enemies
- [Attribute System](docs/attribute-system.md): `STR`, `DEX`, `INT`, `FORT`, and formulas
- [Combat System](docs/combat-system.md): centralized damage, `Defend`, and `PendingAttack`
- [Campaign Design](docs/campaign-design.md): 5 stages, maps, recovery, and `SaveSystem`
- [Enemy Design](docs/enemy-design.md): deterministic AI behavior and the `Ashen Guardian` boss
- [Balance Config](docs/balance-config.md): base parameters and progression curve
- [Architecture](docs/architecture.md): layers, contracts, and event flow
- [Art Direction](docs/art-direction.md) and [Asset Generation](docs/asset-generation.md)
- [Agent Instructions](AGENTS.md)
