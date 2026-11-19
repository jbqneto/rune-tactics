# Rune Tactics V5 — MCP Readiness (Preparation for V6)

## 1. Scope

**V5 does NOT implement an MCP server.** Instead, V5 designs `src/game/pvp/` and `src/shared/pvpTypes.ts` so that a **V6 MCP Adapter** can expose Rune Tactics matches to LLM/AI agents (`claude`, `codex`, custom bots) purely by wrapping `MatchService`—with **zero refactoring** of combat, pathfinding, LoS, turn scheduling, or Colyseus rooms.

---

## 2. How V5 Prepares Every Requirement for V6 MCP Agents

### 2.1 Transport-Agnostic `MatchService` Entrypoints
A future V6 MCP server needs only four operations, all exposed synchronously and headlessly by `MatchService` (`src/game/pvp/MatchService.ts`):
1. `MatchService.createMatch(input)` — starts a deterministic match (`seed`, `mapId`, `seatA`, `seatB`).
2. `MatchService.getMatchState(matchId, actorContext)` — returns `ObservableMatchState`.
3. `MatchService.getLegalActions(matchId, actorContext)` — returns `LegalActionsSnapshot`.
4. `MatchService.submitAction(matchId, actorContext, envelope)` — validates and applies `CommandEnvelope`, returning `CommandResult`.

In V6, MCP tools (`get_match_state`, `get_legal_actions`, `submit_action`, `create_practice_match`) will simply translate JSON-RPC tool arguments into those four `MatchService` calls (or send `CommandEnvelope` into `PvPRoom` on behalf of an authenticated `mcp-agent` seat!).

### 2.2 `ObservableMatchState` (Complete, Self-Contained Perception)
An MCP agent has no Three.js viewport or DOM HUD. `ObservableMatchState` provides everything needed for tactical reasoning in a single JSON payload:
- Full `12×12` layout (`gridSize`, `obstacleDefs` including `kind` and `blocksLos`, `bridgeCells`).
- All 6 `PvPUnitState` objects (`id`, `type`, `team`, `seat`, `pos`, `hp`, `maxHp`, `damage`, `armor`, `moveRange`, `attackRange`, `attackKind`, `alive`, `hasMoved`, `hasAttacked`, `hasActivatedThisRound`, `skillId`, `skillCooldown`, `isGuarding`).
- Full turn state (`revision`, `round`, `turnOrder`, `turnIndex`, `activeUnitId`, `activeTeam`, `canUndoMove`, `turnDeadlineMs`, `winnerTeam`).
- Perspective block `viewer: { seat, myTeam, opponentTeam, isMyTurn }` stamped automatically when `actorContext` is supplied.

### 2.3 `getLegalActions` (Zero Rule Duplication in Agents)
LLM agents notoriously hallucinate invalid grid coordinates, illegal diagonals, or blocked LoS shots if asked to compute pathfinding themselves. `MatchService.getLegalActions(matchId, actorContext)` eliminates this by returning **exact, pre-validated discrete commands**:
- `moves[]`: every reachable `{ to, path, steps, command }`.
- `attacks[]` & `smartAttacks[]`: every legal target `{ targetId, targetPos, path, steps, estimatedDamage, wouldKill, command }`.
- `skills[]` & `smartSkills[]`: every valid cast `{ targetCell, skillId, path, areaCells, affectedUnitIds, command }`.
- `defendCommand`, `undoMoveCommand`, `endTurnCommand`: ready-to-submit `GameCommand` objects or `null`.
- Exact `revision` and `isYourTurn` flag so an agent immediately knows whether it should act or wait.

### 2.4 `ActorContext` Authorization & Agent Identity
`ActorContext` (`{ actorId, seat, team, type: 'human' | 'mcp-agent' | 'system' }`) is a first-class parameter on every `MatchService` call:
- In V5, `PvPRoom` constructs `ActorContext` with `type: 'human'` from `client.auth` (`onAuth`).
- In V6, an MCP bridge constructs `ActorContext` with `type: 'mcp-agent'` from a scoped MCP bearer token bound to a specific `matchId` and `seat`.
- `MatchService` enforces identical turn ownership, `command.unitId === activeUnitId`, optimistic `expectedRevision`, and `commandId` idempotency regardless of whether the actor is `'human'` or `'mcp-agent'`.
- Result: **Human vs Human**, **Human vs MCP Agent**, and **MCP Agent vs MCP Agent** matches run through the exact same `MatchService` pipeline!

### 2.5 Headless Execution & Deterministic Seeded RNG
- `MatchService` + `PvPMatchEngine` have **zero** dependencies on Three.js, DOM, `localStorage`, Colyseus, or `setTimeout`.
- Time is injected via `ClockFn`; randomness uses `createRng(seed)` (`Mulberry32` in `src/game/maps/MapSystem.ts`) with zero `Math.random` calls in rules.
- This enables V6 MCP evaluation harnesses, deterministic replay logs (`seed` + ordered `CommandEnvelope[]`), and fast headless agent-vs-agent tournament simulations in Node.
