# Agent Instructions

Rune Tactics is a browser-based turn-based tactical game built in TypeScript with Three.js. Read `docs/architecture.md`, `docs/game-design.md`, and the V4 specification documents (`docs/attribute-system.md`, `docs/combat-system.md`, `docs/campaign-design.md`, `docs/enemy-design.md`, `docs/balance-config.md`) before writing code. For V5/V6 PvP multiplayer and MCP work, also read `docs/multiplayer-architecture.md`, `docs/colyseus-integration.md`, `docs/game-command-contracts.md`, `docs/pvp-game-design.md`, and `docs/mcp-v6-architecture.md`.

## Scope

**V6 — MCP Adapter & AI Agent Matches** extends the V5/V4/V2 tactical foundation with official Model Context Protocol (MCP) agent support:
- **Tactical base (V2.2 / V2.3)**: alternating individual unit activations (`docs/turn-system.md`), persistent corpses on the board, four hero classes (`knight`, `archer`, `mage`, `cleric`), line of sight, 360° orbital camera, selection of cells occluded by characters, automatic ally facing, area-of-effect `Arcane Burst` with a single projectile, `E` shortcut, active unit opacity, `smartAttack` / `smartUseSkill`, `undoMove`, seeded deterministic RNG, and `MAPS` in `gameConfig.ts` (currently 8 maps of size 12×12).
- **V4 systems**:
  - Attribute system (`STR`, `DEX`, `INT`, `FORT`) with `MAX_ATTRIBUTE = 12` cap and centralized damage/healing (`AttributeSystem` + `CombatSystem`);
  - Unified defensive stance (`defend()`, `G` shortcut, 50% damage mitigation until the unit's next activation);
  - Four new enemies (`goblin-stalker`, `skeleton-shieldbearer`, `necromancer-acolyte`, two-phase boss `ashen-guardian`) and enemy skill `dark-mend`;
  - Telegraphed area attacks (`PendingAttack`) with visual danger indicators (`dangerCells`), cancellation on caster death, and resolution at the start of the caster's next activation;
  - 5-stage campaign (`CAMPAIGN_STAGES`), new maps `forgotten-swamp` (`water` obstacles with `blocksLos: false` and `bridgeCells`) and `corrupted-sanctuary`, Camp & Evolution screen, stage checkpoints, and versioned persistence (`CampaignSystem` + `SaveSystem`), isolated from **Quick Battle** (`quick-battle`).
- **V5 systems (PvP 3v3)**:
  - Online 3v3 PvP (`'teamA'` vs `'teamB'`) on `forgotten-swamp` with 180°-mirrored symmetric spawns;
  - 3-hero draft: 3 unique classes among Knight, Archer, Mage, Cleric with custom slot ordering `[1, 2, 3]` and interleaved activation order (`[A1, B1, A2, B2, A3, B3]`);
  - Authoritative headless `MatchService` (`src/game/pvp/MatchService.ts`) with optimistic concurrency (`expectedRevision`), `commandId` idempotency, 60s turn timer, and disconnect pause/forfeit;
  - Dedicated Colyseus server (`server/`) with `colyseus@0.18.12`, `@colyseus/schema@5.0.49`, `PvPRoom`, HMAC session tokens, public Room IDs (`RT-XXXXXXXX`), and 90s reconnect grace;
  - Browser PvP adapter (`src/network/`): `ColyseusMatchClient` + `PvPClientEngine` projecting spectator perspective (`myTeam` -> `'player'`, `opponentTeam` -> `'enemy'`), answering `IGameEngine` queries from `LegalActionsSnapshot` without client recalculation;
  - 180° camera flip (Seat A at 45°, Seat B at 225°), team-relative death visuals, and PvP lobby/HUD overlays.
- **V6 systems (MCP Adapter & AI Agent Matches)**:
  - Official MCP Server (`server/src/mcp/`) over stdio via `@modelcontextprotocol/sdk` (`1.32.2`) with 6 tools: `create_practice_match`, `join_pvp_room`, `get_match_state`, `get_legal_actions`, `submit_action`, `wait_for_turn`;
  - Headless Practice / Sparring Mode (`PracticeBackend`) and live Colyseus room client (`ColyseusRoomBackend`);
  - Pure deterministic `HeuristicBot` and `AgentMatchRunner` driver with zero tactical rule duplication;
  - Full `actorType: 'mcp-agent'` propagation with visual `[MCP]` badges in Lobby/Draft and in-match HUD headers, plus MCP code sharing tips in room waiting modals.

New work consists of fixes, adjustments, or balancing within this scope, unless the coordinator explicitly requests otherwise.

## Layer Boundaries

- `src/shared/`, `src/config/`, and `src/game/` must NEVER import Three.js, `@colyseus/sdk`, `colyseus`, `@colyseus/schema`, or access `window`, `document`, `localStorage`, or any DOM API.
- `src/rendering/`, `src/input/`, and `src/ui/` must NEVER import anything from `src/game/` or `@colyseus/sdk`. They communicate with the engine strictly through the `IGameEngine` interface and receive campaign/PvP callbacks/state injected by `src/main.ts`.
- `src/network/` must NEVER import `src/game/`, `src/rendering/`, `src/ui/`, or Three.js. It implements `IGameEngine` via `PvPClientEngine` by projecting server state and answering queries purely from `LegalActionsSnapshot`.
- `server/` is an isolated Node application with its own `package.json` and `tsconfig.json`. It imports `MatchService` from `src/game/pvp/MatchService.ts`, `gameConfig.ts`, and `src/shared/pvpTypes.ts`. It must NEVER import `src/rendering/`, `src/ui/`, `src/input/`, or Three.js.
- `server/src/mcp/` is an MCP adapter layer on top of `MatchService` and `PvPRoom`. It imports `@modelcontextprotocol/sdk`, `zod`, `@colyseus/sdk`, `src/shared/pvpTypes.ts`, `src/config/gameConfig.ts`, and `src/game/pvp/MatchService.ts`. It must NEVER import `src/rendering/`, `src/ui/`, `src/input/`, `src/network/`, `three`, or DOM APIs. `HeuristicBot` never imports `src/game/` (all reachability and damage estimations come strictly from `LegalActionsSnapshot`).
- Game rules (damage, attributes, range, line of sight, pathfinding, cooldowns, turn order, AI, campaign state, save validation, PvP match validation) live exclusively in `src/game/`. The UI queries the engine/campaign/PvP client; it never recalculates rules.
- Match numbers (grid size, obstacles, class base stats, starting attributes, skills, enemies, campaign stages, evolution/save constants, PvP timings and team size) live exclusively in `src/config/gameConfig.ts`. Do not duplicate them elsewhere.

## Contracts

`src/shared/types.ts` is the contract between the engine and the interface. Implementers on either side must not alter it unilaterally: if the contract does not cover a requirement, stop and notify the coordinator, because changes affect the other side.

## Camera, Selection, and Orientation

- Only `SceneManager` moves the camera. `InputManager` detects the gesture and emits a callback; `main.ts` wires them together.
- Camera azimuth is view state. It does not go into the engine or snapshot, and `reset()` must not change it.
- Camera rotation works in any turn state and during animations. Board hover and click remain locked outside the player's turn.
- A stationary right-click cancels attack or skill mode; right-click drag rotates the camera. Any new gesture must not break either behavior.
- Hover and click use the same selection resolver so the highlight always reflects what clicking will select.
- Every internal obstacle blocks selection of what lies behind it, including crates and barrels. Characters do not block selection of ground cells behind them.
- Raycastable objects must carry an explicit marker in `userData`. Do not rely on the absence of a field to classify a hit.
- Nothing in the scene may assume the initial camera angle: tall scenery props outside the board must be hidden when they sit between the camera and board cells.
- Unit orientation is presentation-only and lives in the renderer (`facingY`). `syncUnits` must not reset rotation. If any rule ever depends on orientation, it must move into the engine and contract.
- Interface logic that does not require Three.js or the DOM (orbit math, selection resolver, orientation) lives in its own module without those imports, with tests in `tests/`.

## V2.3 Rules (Quick Battle and Engine)

- **Seeded randomness only.** The engine never uses `Math.random` in rules. Map and initial spawn positions come from the seeded generator in `src/game/maps/MapSystem.ts`, and the same seed reproduces the exact battle.
- **Tests using the default battle fix the seed.** Rule tests set up scenarios with explicit positions (`randomizeSpawns` is automatically disabled when `units` is provided), bypassing random spawns.
- **Maps live in `MAPS` in `gameConfig.ts`.** Every map is 12×12, has no obstacles on spawn rows, and has all free cells connected (verified by BFS). Any new map must include tests for these constraints. `'water'` obstacles have `blocksLos: false`.
- **Smart actions are atomic and live in the engine.** `smartAttack` and `smartUseSkill` both move and act, or do nothing. The UI does not choose the destination cell or compute paths: it renders previews from `getSmartAttackPlan` and `getSmartSkillPlan`.
- **Every one-click move-and-act action has a hover preview** matching what the click will execute.
- **Undo is an engine decision.** The UI enables the button via `canUndoMove` and never tracks previous positions on its own.
- **Events from a skill or telegraphed attack are contiguous and arrive in the same batch**: `skillUsed` (or `pendingAttackResolved`), followed by `unitAttacked` or `unitHealed` for each affected target, and then `unitDied`/`bossPhaseChanged`. The renderer groups these events into a single animation; do not split each event into a separate animation.
- **Keyboard shortcuts follow the exact same path as buttons.** Do not duplicate player-turn or animation locks.
- **`reset()` may change the map.** Handlers for `gameReset` or stage transitions rebuild the board from the snapshot and dispose old geometries and materials.
- **The active unit comes from `activeUnitId`**, not `selectedUnitId` (which is `null` during enemy turns).

## V4 Rules

- **`AttributeSystem` (`src/game/attributes/AttributeSystem.ts`)**: single source of truth for pure formulas (`offensiveBonus`, `calcMaxHp`, `fortitudeResistance`, `getAttributeForAttack`, `computeUnitDamage`, `computeUnitArmor`, `applyAttributePoint`). Damage and healing scaling always come from the explicit `attackKind` (`'melee' -> str`, `'ranged' -> dex`, `'magic' -> int`, healing -> `int`) — never infer it from `attackRange`. When upgrading `fort`, add only the positive `maxHp` increment to current `hp` (never heal prior damage). Enforce `[MIN_ATTRIBUTE, MAX_ATTRIBUTE]` (`1..12`).
- **Centralized damage and unified `defend()` (`src/game/combat/CombatSystem.ts`)**: all damage (basic attacks, skills, and `PendingAttack`) goes through `computeDamage` (`max(1, attackPower - totalDefense)`, reduced via `Math.ceil(damageBeforeGuard * 0.5)` when `isGuarding`), preserving a minimum floor of `1`. `defend()` only sets `isGuarding = true` (no numeric shield), consumes `hasAttacked`, works before or after moving, and expires at the start of the unit's own next activation.
- **`PendingAttack` and Boss (`ashen-guardian`)**: `prepareAttack` creates a `PendingAttack` with fixed `targetCells` and emits `attackPrepared`. If the caster dies before its next activation, the engine removes its pending attacks and emits `attackCancelled` (`reason: 'caster_died'`) immediately after `unitDied`. If alive at the start of its next activation, `GameEngine` resolves its `PendingAttack` entries (against living opposing targets) before `checkBattleEnd` and before new turn actions. `ashen-guardian` transitions irreversibly to Phase 2 upon reaching `hp <= Math.floor(maxHp * 0.5)` without restoring HP, gains `+1 moveRange`, and emits `bossPhaseChanged`.
- **`CampaignSystem` (`src/game/campaign/CampaignSystem.ts`)**: manages the 5 stages of `CAMPAIGN_STAGES` while keeping `quick-battle` isolated. Post-victory (Stages 1–4) applies recovery (`+35%` ceil for living heroes, revives fallen heroes at `25%` ceil) and awards `+1` point per hero before Camp; `advanceToNextStage()` requires `unspentPoints === 0` (except for heroes with all attributes at `MAX_ATTRIBUTE`) and records a new `checkpoint`. `restartCurrentStage()` restores `checkpoint.heroes` verbatim.
- **`SaveSystem` (`src/game/campaign/SaveSystem.ts`)**: always uses an injected `StorageAdapter` (in the browser, `src/main.ts` injects `window.localStorage`; Node tests inject an in-memory adapter). Persists under `CAMPAIGN_SAVE_KEY` (`'rune_tactics_v4_save'`) with `version: 4` and strict validation (`validateCampaignState`), returning `null` for invalid/corrupted saves without crashing startup. `quick-battle` never reads, modifies, or deletes the campaign save.

## V5 Rules (PvP 3v3 and Server Architecture)

- **Pure Tactical Core (`PvPMatchEngine` in `src/game/pvp/PvPMatchEngine.ts`)**:
  - Implements canonical `'teamA'` vs `'teamB'` 3v3 matches on `forgotten-swamp`.
  - Enforces 3 unique hero classes per team; generates interleaved turn order `[A1, B1, A2, B2, A3, B3]` (or `[B1, A1, ...]` on rematch).
  - Positions Team A on rows `[0, 1]` via seeded RNG (`createRng(seed)`) and Team B at exact 180° mirrors `(11 - x, 11 - y)` on rows `[10, 11]`.
  - Exposes `getLegalActions(team)` returning complete `LegalActionsSnapshot` (reachable paths, range cells, smart plans, damage estimates, `wouldKill`).
  - No enemy AI is executed in PvP mode.
- **Authoritative `MatchService` (`src/game/pvp/MatchService.ts`)**:
  - Pure, headless, timer-free lifecycle coordinator.
  - Pipeline: `ActorContext` seat validation -> `(actorId, commandId)` idempotency -> phase check -> turn ownership -> `expectedRevision` -> `PvPMatchEngine` command execution -> bump revision and update `turnDeadlineMs`.
  - Disconnect pause retains remaining turn time (`pausedRemainingTurnMs`); 90s grace expiration or voluntary forfeit triggers `forfeitMatch`.
- **Colyseus Server (`server/`)**:
  - Runs `PvPRoom` using `@colyseus/schema@5.0.49` functional builders (`schema()`, `t.*`) and `colyseus@0.18.12`.
  - Generates HMAC-signed session tokens (`POST /api/pvp/session`) and public Room IDs (`RT-XXXXXXXX`).
  - Single-queue serialization (`this.enqueue`) prevents race conditions between player commands and timeout callbacks.
  - Handles reconnection via `allowReconnection(client, 90)`; unicasts fresh `matchInit` on recovery.
- **Client Perspective Projection (`PvPClientEngine` in `src/network/PvPClientEngine.ts`)**:
  - Implements `IGameEngine` for `src/main.ts` and `HudManager`.
  - Projects `myTeam` -> `'player'`, `opponentTeam` -> `'enemy'`, local turn -> `'player' / 'player_unit_active'`, opponent turn -> `'enemy' / 'enemy_activation'`, winner -> `'victory' / 'defeat'`.
  - Answers all queries (`getReachableCells`, `getPath`, `getSmartAttackPlan`, etc.) strictly from `LegalActionsSnapshot` with zero local rule execution.
  - Locks duplicate submissions with `inFlightCommandId` until `CommandResult` returns.
- **180° Camera and Visuals**:
  - Seat A camera azimuth starts at $\pi / 4$ (45°); Seat B starts at $5\pi / 4$ (225°).
  - Only `SceneManager` updates camera azimuth; azimuth is preserved across rematch and reset.
  - Non-active living units of both teams dim to opacity 0.75 during active PvP battle.
- **Server Test Command**:
  - Server tests run via `npm run test:server` (or `cd server && npm test`), executing Vitest with `--pool=threads --poolOptions.threads.singleThread` to isolate Colyseus WebSocket servers.
  - Root client tests run via `npm test` (targeting `tests/**/*.test.ts`).
  - Full suite check: `npm run typecheck:all && npm run test:all && npm run build:all`.
- **References**:
  - `docs/multiplayer-architecture.md` (overall architecture and V6 MCP readiness)
  - `docs/colyseus-integration.md` (Colyseus 0.18 lifecycle, room schema, reconnection)
  - `docs/game-command-contracts.md` (command envelopes, results, events, snapshots)
  - `docs/pvp-game-design.md` (game design rules, draft, timing, and UI flows)

## V6 Rules (MCP Adapter and Agent Matches)

- **Official MCP Server (`server/src/mcp/`)**:
  - Exposes 6 canonical tools (`create_practice_match`, `join_pvp_room`, `get_match_state`, `get_legal_actions`, `submit_action`, `wait_for_turn`) via `@modelcontextprotocol/sdk` (`1.32.2`) with Zod schema validation.
  - CLI entrypoint in `server/src/mcp/cli.ts` uses `StdioServerTransport` and logs strictly to `process.stderr` so `stdout` remains pure JSON-RPC 2.0 frames.
- **Dual Backends**:
  - **Headless Practice (`PracticeBackend`)**: In-memory `MatchService` binding the caller to Seat A with optional `HeuristicBot` on Seat B.
  - **Live Colyseus (`ColyseusRoomBackend`)**: Connects to `PvPRoom` via `@colyseus/sdk` with `actorType: 'mcp-agent'`, supporting both room creation (generating `RT-XXXXXXXX`) and joining existing Room IDs.
- **Pure `HeuristicBot` & Deterministic Runner**:
  - `HeuristicBot` (`server/src/mcp/HeuristicBot.ts`) consumes `(ObservableMatchState, LegalActionsSnapshot)` without importing any rules from `src/game/`.
  - `AgentMatchRunner` (`server/src/mcp/AgentMatchRunner.ts`) runs reproducible headless bot matches with step-by-step replay logs.
- **Actor Type Badging**:
  - When `actorType === 'mcp-agent'`, the UI displays a subtle `[MCP]` badge next to player and opponent names (Lobby/Draft and Opponent HUD header).
  - The room waiting modal displays a tip noting that the `RT-XXXXXXXX` Room ID can be joined by AI agents via `join_pvp_room`.
- **MCP Test and Run Commands**:
  - Run MCP server via stdio: `npm run mcp` (root or `server/`).
  - Build MCP server: `npm --prefix server run build:mcp`.
  - Server & MCP test suite: `npm run test:server` (Vitest single-thread).
  - Reference: `docs/mcp-v6-architecture.md`.

## Assets

- Asset files live in `public/assets/`, under `portraits/`, `icons/`, `models/`, and `textures/`, and are referenced from the site root (`/assets/...`).
- Each class/enemy portrait and skill icon path is declared in `gameConfig.ts` (`portraitPath` and `icon`). The UI reads those fields instead of constructing paths dynamically.
- Any new asset follows `docs/art-direction.md` and is logged in `docs/asset-generation.md`.

## Conventions

- Coordinates: `x` is the column and `y` is the row, both from `0` to `gridSize - 1` (`0` to `11`).
- The engine is synchronous and timer-free. Animations and delays belong in rendering.
- An invalid action returns `{ ok: false, reason }`, leaves state unchanged, and emits no events.
- Any engine rule change requires tests in `tests/`. Run `npm run typecheck`, `npm test`, and `npm run build` before delivering.
- Each agent only creates and edits files belonging to its assigned task.
