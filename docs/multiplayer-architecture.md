# Rune Tactics V5 — Multiplayer Architecture (PvP 3v3 & MCP-Ready Core)

## 1. Goals and Scope

Rune Tactics V5 extends the V4 tactical foundation (**Quick Battle** and **The Ashen Campaign**) with **online 3v3 PvP multiplayer** powered by Colyseus (`colyseus@0.18.12`, `@colyseus/schema@5.0.49`, `@colyseus/sdk@0.18.10`) while structuring the core so **V6 MCP agents** can play through the same authoritative `MatchService` without implementing the MCP server in V5.

Core architectural goals:
1. **Single tactical truth**: combat, attributes, line of sight, BFS pathfinding, smart actions, undo rules, skills, and turn order remain exclusively in `src/game/` (`AGENTS.md` layer boundaries).
2. **Server-authoritative PvP**: the server validates every command, enforces turn ownership and the 60s turn clock, resolves deterministic outcomes, and broadcasts facts (`PvPGameplayEvent[]`) + state revisions.
3. **Transport-agnostic `MatchService`**: `MatchService` has zero knowledge of Colyseus, WebSockets, HTTP, DOM, or Three.js. Both the Colyseus adapter (`PvPRoom`) and future V6 MCP adapter sit above `MatchService`.
4. **Full PvE preservation**: `quick-battle` and `campaign` (`CampaignSystem`, `SaveSystem`, `GameEngine`) continue running locally with zero network dependency and all existing 179 tests intact.
5. **Strict layer separation**: `src/rendering/`, `src/input/`, and `src/ui/` never import `src/game/` or `@colyseus/sdk`; they interact exclusively with `IGameEngine` and callbacks injected by `src/main.ts`.

---

## 2. High-Level Architecture

```text
                       ┌──────────────────────────────────────┐
                       │      Pure Tactical Rules Core        │
                       │  src/shared/   src/config/   src/game/│
                       │  - GridSystem, CombatSystem          │
                       │  - AttributeSystem, UnitFactory      │
                       │  - TacticalBattleCore / TurnSystem   │
                       │  - PvPMatchEngine + MatchService     │
                       └──────────────────▲───────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │ (Direct in-process TS)    │ (Headless TS API)         │ (Local PvE)
              │                           │                           │
┌─────────────┴──────────────┐ ┌──────────┴───────────────┐ ┌─────────┴─────────────┐
│   Colyseus Server Adapter  │ │  Future V6 MCP Adapter   │ │   Local PvE Engine    │
│   server/src/              │ │  (Not implemented in V5) │ │   src/game/           │
│   - PvPRoom (colyseus)     │ │  - get_match_state       │ │   - GameEngine        │
│   - PvPRoomState (@schema) │ │  - get_legal_actions     │ │   - CampaignSystem    │
│   - SessionTokenService    │ │  - submit_action         │ │   - SaveSystem        │
│   - 60s clock + 90s grace  │ │  - ActorContext ('mcp')  │ │   (localStorage)      │
└─────────────▲──────────────┘ └──────────────────────────┘ └─────────▲─────────────┘
              │ WebSocket (WSS) + @colyseus/schema                    │
              │ Commands / Events / LegalActions                      │
┌─────────────┴──────────────┐                                        │
│   Browser PvP Adapter      │                                        │
│   src/network/             │                                        │
│   - ColyseusMatchClient    │                                        │
│   - PvPClientEngine ───────┼────────────────────────────────────────┤
│     (implements IGameEngine│                                        │
│      with myTeam->'player' │                                        │
│      perspective mapping)  │                                        │
└─────────────▲──────────────┘                                        │
              │                                                       │
              └───────────────────────┬───────────────────────────────┘
                                      │ engineProxy: IGameEngine
                         ┌────────────┴────────────┐
                         │    Composition Root     │
                         │       src/main.ts       │
                         └────────────┬────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  src/rendering/                src/input/                  src/ui/
  - SceneManager (180° Seat B)  - InputManager              - HudManager
  - CameraController            - pickResolver              - PvPLobbyOverlay
  - BoardRenderer               (zero src/game/ imports)    (zero src/game/ imports)
  - UnitRenderer (team-relative)
```

---

## 3. Layer Breakdown and Responsibilities

### 3.1 `src/shared/` — Runtime-Free Contracts
- **`src/shared/types.ts`**: Existing PvE contracts (`GridCoord`, `Team = 'player' | 'enemy'`, `UnitState`, `GameEvent`, `GameStateSnapshot`, `IGameEngine`, `Campaign*`, `StorageAdapter`), extended minimally with `GameMode = 'quick-battle' | 'campaign' | 'pvp'`.
- **`src/shared/pvpTypes.ts`**: Canonical PvP and `MatchService` contracts (`PlayerSeat = 'A' | 'B'`, `PvPTeam = 'teamA' | 'teamB'`, `ActorContext`, `GameCommand`, `CommandEnvelope`, `CommandResult`, `PvPGameplayEvent`, `LegalActionsSnapshot`, `ObservableMatchState`, `PvPRoomPhase`, `RematchState`). Imports zero runtime dependencies.

### 3.2 `src/config/gameConfig.ts` — Single Source of Truth
Retains all V4 constants, `MAPS`, `SKILLS`, `UNIT_STATS`, and `CAMPAIGN_STAGES`, adding only PvP configuration constants:
- `PVP_DEFAULT_MAP_ID = 'forgotten-swamp'`
- `PVP_TEAM_SIZE = 3`
- `PVP_HERO_CLASSES: readonly PvPHeroClass[] = ['knight', 'archer', 'mage', 'cleric']`
- `PVP_TURN_DURATION_MS = 60_000`
- `PVP_RECONNECT_GRACE_SECONDS = 90`
- `PVP_INVITE_CODE_LENGTH = 6`

### 3.3 `src/game/` — Headless Pure Tactical Core
Currently, `CombatSystem.ts`, `GridSystem.ts`, and `AttributeSystem.ts` are already team-agnostic, while `TurnSystem.ts` and `GameEngine.ts` hardcode `'player'` (human) vs `'enemy'` (AI) in 17 places.

To eliminate rule duplication while preserving PvE:
1. **Shared Tactical Helpers / `TacticalBattleCore`**: Extract or parameterize the shared tactical execution and queries (reachable cells, attack range, skill range/targets/area, smart plans, movement, undo snapshot, basic attack, skill resolution, defend stance, pending attack cancellation/resolution, round wrapping, cooldown tick-down).
2. **`GameEngine` (PvE)**: Keeps its exact public `IGameEngine` contract for `quick-battle` and `campaign`, preserving all 179 existing tests.
3. **`PvPMatchEngine` (`src/game/pvp/PvPMatchEngine.ts`)**: Runs a canonical `'teamA'` vs `'teamB'` 3v3 battle:
   - Accepts 3 unique hero classes per team in selection order `[A1, A2, A3]` and `[B1, B2, B3]`.
   - Builds fixed interleaved `turnOrder`: `[A1, B1, A2, B2, A3, B3]` (optionally alternating starting team on rematch).
   - Computes 180°-mirrored seeded spawns (`createRng(seed)` on rows `[0, 1]` for Team A, mirrored `(11 - x, 11 - y)` on rows `[10, 11]` for Team B).
   - Never runs `EnemyAI` (`executeNextEnemyAction`).
   - Exposes `getLegalActions(team)`, `getObservableState()`, and deterministic command application returning `PvPGameplayEvent[]`.
4. **`MatchService` (`src/game/pvp/MatchService.ts`)**: Authoritative, headless match lifecycle manager (create match, inspect state, query legal actions, submit commands with `commandId` idempotency and `expectedRevision` optimistic concurrency, seat/team authorization, 60s timeout handling, forfeit, and rematch).

### 3.4 `server/` — Colyseus Node Adapter
- Uses `colyseus@0.18.12`, `@colyseus/schema@5.0.49`, and Node HTTP/WebSocket transport.
- Imports `MatchService`, `gameConfig.ts`, and `src/shared/pvpTypes.ts` directly.
- Implements:
  - `SessionTokenService` (temporary signed tokens for `onAuth`) + unique public Room ID generation/lookup (`RT-XXXXXXXX`, 8 characters after the prefix).
  - `PvPRoom` (`Room<PvPRoomState>`) managing the 7-state room lifecycle, serialized command queue, `this.clock` 60s turn timer, `onDrop` + `allowReconnection(client, 90)`, `@colyseus/schema` synchronization, unicast `LegalActionsSnapshot`, and broadcast `PvPGameplayEvent[]`.
  - Serves the built Vite frontend (`dist/`) + `/healthz` + `/api/pvp/*` + Colyseus WebSocket endpoint on a single HTTP server for zero-CORS Coolify deployment.

### 3.5 `src/network/` — Browser PvP Adapter
- **`ColyseusMatchClient.ts`**: Uses `@colyseus/sdk@0.18.10` (`Client`, `Room`, `getStateCallbacks`) to handle session acquisition, room creation/joining by invite code, `reconnectionToken` persistence, automatic `onDrop`/`onReconnect` recovery, and manual `client.reconnect()`.
- **`PvPClientEngine.ts`**: Implements `IGameEngine` for PvP mode in the browser:
  - **Perspective Projection**: Maps canonical server `'teamA'` / `'teamB'` into client-local `'player'` (`myTeam`) and `'enemy'` (`opponentTeam`) inside `GameStateSnapshot` and projected `GameEvent[]`.
  - **Zero Client Rule Math**: Answers all synchronous `IGameEngine` queries (`getReachableCells`, `getPath`, `getAttackableTargets`, `getAttackRangeCells`, `getSkillRangeCells`, `getSkillTargetCells`, `getSkillAreaCells`, `getSmartAttackPlan`, `getSmartSkillPlan`) strictly from the latest server-sent `LegalActionsSnapshot`.
  - **Command Dispatch**: Translates `InputManager` / HUD method calls into `CommandEnvelope` messages sent over Colyseus, gating duplicate inputs with a local `inFlightCommandId` lock until `CommandResult` arrives.

### 3.6 `src/rendering/`, `src/input/`, `src/ui/`, `src/main.ts` — Presentation & Composition
- **`SceneManager` & `CameraController`**: Support `setAzimuth(rad, immediate)` so **Player A** starts at `π/4` (45°, facing rows `0, 1` in foreground) and **Player B** starts at `5π/4` (225°, rotated 180°, facing rows `10, 11` in foreground). Azimuth remains freely orbitable 360° via right-click drag.
- **`UnitRenderer`**: Keeps team-relative death visuals (`'player'`/`myTeam` leaves lying corpse; `'enemy'`/`opponentTeam` fades/shrinks out) and updates PvP inactive-unit opacity so non-active living units on both teams render at `INACTIVE_UNIT_OPACITY` (`0.75`) during an active match and `1.0` after battle end.
- **`HudManager` & `PvPLobbyOverlay`**: Add Main Menu **"Multiplayer PvP"** entry, Invite Code lobby, 3v3 Class Selection & Order screen, PvP turn/timer/disconnect/rematch HUD overlays, and clean return to PvE modes.

---

## 4. Layer Boundary Matrix

| Directory | Allowed Imports | Forbidden Imports |
|---|---|---|
| `src/shared/` | None (pure types) | `game/`, `config/`, `rendering/`, `input/`, `ui/`, `network/`, `server/`, `three`, `colyseus`, DOM |
| `src/config/` | `src/shared/` | `game/`, `rendering/`, `input/`, `ui/`, `network/`, `server/`, `three`, `colyseus`, DOM |
| `src/game/` | `src/shared/`, `src/config/` | `rendering/`, `input/`, `ui/`, `network/`, `server/`, `three`, `colyseus`, `window`/`document`/`localStorage` |
| `src/rendering/` | `src/shared/`, `three` (plus existing config/constants pattern) | `src/game/`, `src/network/`, `server/`, `colyseus` |
| `src/input/` | `src/shared/`, `src/config/`, `src/rendering/`, `three` | `src/game/`, `src/network/`, `server/`, `colyseus` |
| `src/ui/` | `src/shared/`, `src/config/`, `src/input/` (types) | `src/game/`, `src/network/`, `server/`, `colyseus`, `three` |
| `src/network/` | `src/shared/`, `src/config/`, `@colyseus/sdk` | `src/game/`, `src/rendering/`, `src/ui/`, `server/`, `three` |
| `src/main.ts` | `src/shared/`, `src/config/`, `src/game/` (PvE only), `src/network/`, `src/rendering/`, `src/input/`, `src/ui/` | `server/`, `colyseus` (server) |
| `server/` | `src/shared/`, `src/config/`, `src/game/pvp/`, `colyseus`, `@colyseus/schema`, Node stdlib | `src/rendering/`, `src/input/`, `src/ui/`, `src/network/`, `three`, DOM |

---

## 5. Headless Execution & PvE Preservation Guarantees

- **Headless execution**: `MatchService` + `PvPMatchEngine` take an injected `Clock` (`() => number`) and integer `seed`, executing complete 3v3 PvP matches in Node/Vitest at thousands of turns per second with zero WebSockets, DOM, or timers.
- **PvE isolation**:
  - `quick-battle` never touches `CampaignState`, `SaveSystem`, or `ColyseusMatchClient`.
  - `campaign` (`CAMPAIGN_SAVE_KEY = 'rune_tactics_v4_save'`, `version: 4`) continues using `GameEngine` and `CampaignSystem` unchanged.
  - Entering PvP never reads, modifies, or deletes the PvE campaign save.
