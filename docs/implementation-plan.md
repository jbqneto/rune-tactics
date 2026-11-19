# Implementation Plan — V2.1

## Status and Boundaries

Proposed plan based on the inspected baseline; nothing here declares new code completed. The brief requests edits only to `turn-system.md`, `architecture.md`, and this plan at this stage. The codebase uses the V2.2 label while keeping manual hero choice and corpses on both teams: the intended fix is described in `turn-system.md`. No V3/V4 scope.

Initial baseline: `npm run typecheck` and `npm test` passed (113 tests across 4 files). On final verification during concurrent edits by other agents in `src`/`tests`, typecheck passed and the suite returned 101 passed and 12 failures in `engine.test.ts` (old expectations for free choice, null active unit, and event timing). That result is transient, does not validate integration, and does not constitute a final diagnosis of concurrent changes. Initial tests reflect the baseline read, not compliance with the proposal.

## Owners and Ownership

| Agent | Responsibility | Boundaries |
|---|---|---|
| t16 — Codex | Reasoning, contract and invariant review, logic integration, and final review | Coordinator approval required before modifying shared contracts |
| t18 — Engine + Tests | Order config, scheduler, actions, range queries, and engine/regression tests | No visual changes; coordinates `types.ts` with t16/t1b |
| t1b — Rendering + UI + QA | Input, `main.ts`, board, units, HUD, visual QA, and interaction | Consumes `IGameEngine`; implements no rules in renderer |
| t1c — Docs/Support | Documentation, dependency clarification, review support, and post-QA reconciliation | In this step, only the three requested documents |

`src/shared/types.ts` has a single editor once the contract is approved (proposed: t18); t1b does not edit it in parallel. t1b is sole owner of `src/main.ts` and visual files. On scope conflict, stop and coordinate rather than overwriting another agent's work. Do not edit `AGENTS.md` or `game-design.md` without additional authorization, despite naming/rule discrepancies.

## Sequence, Dependencies, and Acceptance Criteria

### 0. Contract Decision — t16 + coordinator; support t18/t1b/t1c

- [ ] Approve exact default order and explicit order model for custom test scenarios, ensuring unique existing IDs.
- [ ] Approve semantics of `activeUnitId`, `selectedUnitId`, `activationLocked`, and potential removal of `awaiting_player_choice`.
- [ ] Approve `getAttackRangeCells`, including LoS, obstacle cells, occupancy, no-action state, and separation from `getAttackableTargets`.
- [ ] Approve `GRID_HIGHLIGHTS` (Three.js-free visual config), overlap priority, and whether order/index belong in snapshot.
- [ ] Define initial/reset activation events, handling of empty/invalid setups, and test/consumer compatibility.

Acceptance: contracts documented in `architecture.md`/`turn-system.md` and agreed upon before implementing. Version discrepancies with out-of-scope docs are recorded, not hidden.

### 1. Turn Core — t18; review t16

Depends on 0. TDD: write fixed-order tests first, observe expected failures, then implement minimally.

- [ ] Introduce a single source of truth for order in config and `TurnScheduler` or equivalent responsibility in `TurnSystem`, without duplicating writable flags.
- [ ] Schedule living ID immediately at start and after each activation, traversing the original list without re-sorting, including three consecutive enemies.
- [ ] Validate that only the active unit can execute actions; reject operational selection swaps/clearing. If inspection exists, isolate it from acting identity.
- [ ] Auto-end only after spending both move and attack, and manually on pass; preserve victory/defeat precedence.
- [ ] Skip dead units without removing them from the list; start a new round only after full traversal, ticking cooldowns once per round.
- [ ] Adjust AI steps, events, and reset; guarantee bounded search and avoid stalling when an enemy has no action.
- [ ] Adapt existing free-choice tests to test rejection while preserving remaining coverage.

Acceptance: two rounds follow the defined IDs, dead units are skipped without altering order, no unit acts twice per round, event sequence is accurate, and scenarios A–E pass. Custom and terminal setups are deterministic and never loop infinitely.

### 2. Range and Contract — t18; review t16

Depends on 0; may proceed in parallel with 1 provided a single editor integrates `GameEngine.ts` and `types.ts`.

- [ ] Implement pure `getAttackRangeCells` query per agreed rules; keep `getAttackableTargets` for valid targets.
- [ ] Review existing explicit-ID queries as well: phase, active unit, death, and consumption must align with the approved operational contract.
- [ ] Write tests for board edges, Manhattan distance, LoS, tall/low obstacles, empty/occupied cells, missing targets, spent attacks, and terminal snapshots.

Acceptance: highlightable grid does not depend on having a target; a highlighted cell does not turn an ally/corpse into a legal target. Attacks and skills keep using engine validation with zero rule math in the UI.

### 3. Interface, Rendering, and QA — t1b

Depends on contract from 0; final integration depends on 1 and 2. Visual prep can proceed in parallel with engine without inventing APIs.

- [ ] Adapt board and roster clicks: clicking another ally does not switch active unit; inspection, if present, is read-only and never redirects commands.
- [ ] Update HUD to `ACTING`, `WAITING`, `DONE`, `DEFEATED` derived from snapshot; lock actions by phase, active unit, and animation.
- [ ] Unify colors/opacities in `GRID_HIGHLIGHTS`, add a basic attack range layer distinct from attackable target, and wire the query via `main.ts`.
- [ ] Death: allies lie down and remain; enemies vanish after animation, including after subsequent `syncUnits`; both lose operational hitboxes. Reset restores visuals.
- [ ] Verify mode switching, hover, animation queues, round changes, victory/defeat, resize, and reset with no leftover highlights or poses.

Acceptance: range shows on empty cells in the agreed mode and never replaces valid target indicators; dead enemies never reappear after sync; dead allies remain lying down; roster/controls track the true active unit. Visual before/after evidence and reproduction steps for each case.

### 4. Review and Integration — t16; all

Depends on 1–3. Review layer boundaries, flag authority, stable IDs/indices, API and events, animation/snapshot races, cleanup/reset, and test quality. t1c updates documentation based on verified evidence and flags remaining discrepancies to the coordinator.

Acceptance: no contract/doc claims unimplemented behavior; no rule logic in UI; no known open regressions unrecorded. Coordinator decides reconciliation of `game-design.md` and `AGENTS.md` outside this brief.

## Regression Test Strategy

1. **Turn unit tests:** 10-ID sequence across 2 rounds; death before/after turn, consecutive deaths, and last slot dead; round/cooldown progression; events and terminal state; reset; bounded search.
2. **Engine:** scenarios A–E, skill instead of attack, clicks/selecting another ally before and after first action, invalid commands with zero mutation/events, AI with no moves, three consecutive enemies, immediate victory/defeat.
3. **Range:** expected cell sets, LoS, and boundaries; compare valid targets against region without treating the whole region as targets. Test invalid IDs, non-active units, and already-spent actions.
4. **Existing regressions:** `grid.test.ts`, `combat-turns.test.ts`, `engine.test.ts`, `ai.test.ts`: preserve tests for damage, healing, cooldowns, area, pathing, occupancy, LoS, and AI decisions. Change only assumptions incompatible with fixed order, with equivalent replacements.
5. **Browser visual/interaction:** record method and evidence for clicking another ally before first action, range on empty cells/behind cover, death for each team, reset during/after animation, and consecutive enemy activations. Validate HUD and absence of stale hitboxes.
6. **Gates:** `npm run typecheck`, `npm test`, `npm run build`, and manual QA. Record commands, totals, and actual failures; do not infer visual pass from Node tests. If automated visual tests exist, run them alongside manual QA without adding unapproved dependencies.

## Integration Risks

- Shared contract or `main.ts` edited by two agents: enforce single ownership and diff review.
- Scheduling before first click shifts timing of `activationStarted`; tests and event consumers must migrate together.
- Re-initializing visuals after death event may make dead enemies reappear: policy must hold on both sync and animation completion.
- Current spawn order is not the desired turn order: configure explicitly and validate test scenarios.
- Duplicated flags between unit and scheduler drift apart: keep one canonical source.
- The inspected directory has no `.git`; before any commit/diff, confirm repository location with coordinator without initializing Git or altering history.

# Implementation Plan — V2.2 (Interface)

## Status and Boundaries

Proposed plan; nothing here is implemented yet. Diagnosis and design for each goal are in `architecture.md`, under "V2.2 (Interface)".

The three goals are: (1) 360° horizontal camera rotation with right-click + drag, (2) selection of free cells occluded by characters without passing through solid obstacles, (3) automatic ally orientation toward the nearest living enemy after moving.

None of them alter `src/game/`, `src/shared/types.ts`, or `src/config/`. If any task appears to require that, stop and notify the coordinator.

## Owners

Roles follow the V2.1 table above. Assignment below is proposed for coordinator confirmation.

| Agent | Responsibility in V2.2 |
|---|---|
| t1b — Rendering + UI + QA | Implements all three goals in `src/rendering/`, `src/input/`, and `src/main.ts`, and runs browser QA |
| t18 — Engine + Tests | Writes Node tests for the three pure modules; verifies the engine suite remains intact |
| t16 — Codex | Reviews layer boundaries, selection resolver, and coexistence of drag and right-click |
| t19 — Architecture | Diagnosis and design (this delivery); answers design questions during implementation |
| t1c — Docs | Reconciles `architecture.md`, `game-design.md`, and `README.md` with delivered work |

`src/main.ts` and `src/input/InputManager.ts` are touched by Goals 1 and 2. They have a single editor (t1b), and tasks modifying them run sequentially.

## Order and Dependencies

```text
A1 ─┬─> A2 ──> A3 ──> A4
    │
B1 ─┴─> B2 ──────────────┐
                         ├──> D1 ──> D2
C1 ───> C2 ──────────────┘
```

- Pure modules (A1, B1, C1) are independent and can be built in parallel, each with its tests.
- Goal 3 (C1, C2) touches only `UnitRenderer.ts` and can run in parallel with the other two.
- B2 comes after A3 because both modify `InputManager.ts`.
- QA for Goal 2 depends on Goal 1: selection must be verified with the camera rotated.

## Tasks

### Goal 1: Camera

**A1. Pure orbit module** (`src/rendering/cameraOrbit.ts`) — t1b, tests t18

- [ ] Normalize angle to `[0, 2π)`.
- [ ] Compute camera position from azimuth, radius, and height.
- [ ] Convert horizontal pixel delta to radians.
- [ ] Decide click vs. drag from accumulated displacement and threshold.

Acceptance: azimuth `π/4` returns current position `(17, 18.5, 17)`; a full revolution returns to start; negative and `>= 2π` angles normalize cleanly; module does not import Three.js.

**A2. Orbit in `SceneManager`** — t1b. Depends on A1.

- [ ] Store `azimuth`, expose `rotateAzimuth(deltaRad)` and getter.
- [ ] Reposition camera, reapply `lookAt`, and update world matrix.

Acceptance: with zero rotation, view is identical to current; `resize` keeps working at any azimuth; entire board fits on screen at 0°, 45°, 90°, and 180°.

**A3. Gesture in `InputManager` and wiring in `main.ts`** — t1b. Depends on A2.

- [ ] Right-button drag emits `onRotateCamera(deltaRad)` with pointer capture.
- [ ] Stationary right-click continues canceling attack or skill mode; cancellation moves from `contextmenu` to `pointerup`.
- [ ] Rotation works during enemy turns and animations.
- [ ] Hover and click are suspended during drag.

Acceptance: dragging orbits both ways smoothly without limits or jumps; browser context menu never opens over canvas; releasing outside canvas or over HUD ends rotation; a drag never cancels mode, and a stationary right-click does.

**A4. Camera-aware perimeter** (`BoardRenderer.setCameraAzimuth`) — t1b. Depends on A2.

- [ ] Hide tall walls and posts on the camera side; show those on the far side.

Acceptance: at no azimuth does a perimeter piece cover a board cell; at 45° the scene matches current output.

### Goal 2: Selection

**B1. Pure resolver** (`src/input/pickResolver.ts`) — t1b, tests t18

- [ ] Accept classified hits (`unit`, `tile`, `obstacle`) sorted by distance and mode context.
- [ ] Apply the preference table from `architecture.md`.

Acceptance, one test per case:

- reachable cell behind an ally is picked;
- reachable cell behind a non-target enemy is picked;
- attackable enemy beats the cell behind it;
- nothing behind an obstacle is picked, whether tile or unit;
- two units in a line: front unit wins as candidate;
- ray hitting nothing returns empty;
- `skill` mode: target cell behind a unit is picked;
- `attack` mode: ground cell is never picked.

**B2. Integration in `InputManager` and tags in `BoardRenderer`/`UnitRenderer`** — t1b. Depends on B1 and A3.

- [ ] Tag hitboxes, tiles, and obstacle meshes in `userData`.
- [ ] Convert ray intersections into resolver input and share the exact same path for hover and click.

Acceptance: hover highlight always matches click result; existing working clicks (attacking visible unit, moving to uncovered cell) behave identically; crates, barrels, walls, and pillars block selection behind them.

### Goal 3: Facing

**C1. Pure facing module** (`src/rendering/facing.ts`) — t1b, tests t18

- [ ] Pick nearest living enemy: Manhattan distance, then Euclidean distance, then list order.
- [ ] Compute angle from cell delta.
- [ ] Compute shortest arc between two angles.

Acceptance: dead enemies ignored; ties deterministic; no living enemy returns null; four cardinal directions yield expected angles; shortest arc never exceeds 180°.

**C2. Facing in `UnitRenderer`** — t1b. Depends on C1.

- [ ] `UnitVisual.facingY`, applied in `syncUnits` instead of resetting rotation to zero.
- [ ] Store `facingY` in move, attack, and skill animations.
- [ ] At end of an ally's move, turn toward nearest living enemy.
- [ ] `gameReset` restores initial facing; corpses preserve current pose.

Acceptance: after moving, ally ends facing nearest living enemy; after attacking, unit keeps facing target; no unit snaps back to default pose between actions; enemies keep last step's direction; facing does not change when camera rotates.

### Integration

**D1. Review** — t16. Depends on A4, B2, and C2.

- [ ] Zero imports from `src/game/` in rendering, input, or ui.
- [ ] Zero range, path, or LoS math outside the engine.
- [ ] All three pure modules free of Three.js and DOM.
- [ ] Pointer listeners removed in `dispose()`.

**D2. Browser QA and documentation** — t1b and t1c. Depends on D1.

- [ ] QA script below, with evidence for each item.
- [ ] `architecture.md` updated to describe delivered behavior rather than plan.

## Verification

1. **Node tests** for the three pure modules, in the same Vitest suite.
2. **Regression:** `npm run typecheck`, `npm test`, and `npm run build`. Engine suite must remain unchanged because engine is untouched.
3. **Browser QA script**, repeated with camera at 45° (initial view), 135°, 225°, and 315°:
   - move to an uncovered cell and to a cell behind an ally;
   - attack a visible enemy and an enemy partially occluded by another;
   - cast an area skill with target cell behind a unit;
   - attempt to select a cell behind wall, pillar, crate, and barrel;
   - confirm HP bars track units properly;
   - confirm no perimeter piece covers the board;
   - rotate during enemy turn and during an animation;
   - stationary right-click in attack mode and skill mode;
   - move each hero and confirm facing direction; repeat after killing the nearest enemy;
   - restart match and confirm camera retains azimuth while units reset initial facing.

Node tests do not validate screen appearance. Only the script above closes visual criteria.

## Decisions for Coordinator

- **Initial facing.** Do allies spawn facing the nearest enemy or only turn after their first move? Recommendation: spawn already facing.
- **Attackable unit in front of reachable cell.** In default mode, the unit wins and the player orbits the camera to pick the cell. Confirm whether acceptable or if hit-height disambiguation belongs in this delivery.
- **Rotation sensitivity.** Initial proposal: dragging across full canvas width equals one full revolution. Final value tuned in QA.

## Risks

- **Right-click with two meanings.** Mode cancel and camera orbit share the button. Drag threshold separates them; too large feels stiff, too small turns jittery clicks into rotations.
- **Perimeter and torches in front of camera.** Without A4, orbiting obscures part of the board and clicks pass through walls.
- **Concurrent edits to `InputManager.ts` and `main.ts`.** Goals 1 and 2 touch both files; hence A3 before B2 and single editor ownership.
- **Divergent hover and click.** If only one uses the resolver, highlights mislead the player.
- **Facing and animation queue.** End-of-move rotation reads the latest snapshot. A queued action right after might overwrite orientation mid-turn; attack animation should start from stored facing.
- **Input without right button.** Trackpads and touchscreens lack the gesture. Out of scope here, but rotation must not be the sole way to reach a cell: Goal 2 covers normal cases without orbiting.
- **Browser gestures.** Some extensions/browsers intercept right-drag. `preventDefault` on `contextmenu` and pointer capture mitigate this, requiring QA verification.

# Implementation Plan — V2.3

## Status and Boundaries

Proposed plan. Only the contracts in `src/shared/types.ts` have been updated; the rest remains to be done. Diagnosis and design for each improvement are in `architecture.md`, under "V2.3", and rules in `game-design.md`.

Until the engine implements the new contracts, `npm run typecheck` fails in `GameEngine.ts` and `main.ts`. Task M0 below gets the project out of that broken state right away.

The seven improvements: (1) Arcane Burst single projectile and explosion, (2) `E` shortcut, (3) active unit opacity, (4) smart attack, (5) undo move, (6) seeded randomized starting positions, (7) three non-repeating randomized maps.

## Owners

Proposed for coordinator confirmation with the same roles as prior deliveries.

| Agent | Responsibility in V2.3 |
|---|---|
| t18 — Engine + Tests | Config, engine, and tests for improvements 4–7; Node tests for pure UI modules |
| t1b — Rendering + UI + QA | Improvements 1–3; UI portion of improvements 4, 5, and 7; browser QA |
| t16 — Codex | Reviews contracts, determinism, and layer boundaries |
| t19 — Architecture | Contracts and design (this delivery); design questions during implementation |
| t1c — Docs | Reconciles docs with delivered code |

`src/shared/types.ts` and `src/config/gameConfig.ts` have a single editor (t18). `src/main.ts`, `InputManager.ts`, `HudManager.ts`, and `UnitRenderer.ts` have a single editor (t1b).

## Order and Dependencies

```text
M0 ──> M1 ──> M2 ──────────────> I4 (maps in UI)
  ├──> M3 ─────────────────────> I5 (undo in UI)
  └──> M4 ─────────────────────> I6 (smart attack in UI)

I1 (Arcane Burst)   I2 (E shortcut)   I3 (opacity)      engine-independent

                    all ──> R1 (review) ──> R2 (QA & docs)
```

- M0 goes first and is short: restores green `typecheck`.
- I1, I2, and I3 do not depend on the engine and can start immediately.
- I3, I5, and I1 touch `UnitRenderer.ts`; I4, I5, and I6 touch `main.ts`. They share an editor and run sequentially.

## Engine Tasks (t18)

**M0. Stubbed contracts**

- [ ] `GameEngine` adds the new methods and fields without final logic yet: `mapId`, `mapName`, `seed`, and `canUndoMove` on snapshot; `undoMove`, `smartAttack`, `smartUseSkill`, and plan queries rejecting or returning `null`.

Acceptance: `npm run typecheck` and `npm test` pass with zero behavior changes.

**M1. Seeded PRNG and randomized spawns** (improvement 6). Depends on M0.

- [ ] Seeded generator module in `src/game/`, zero external dependencies.
- [ ] Positionless unit list in config; spawn rows per map.
- [ ] Consumption order defined in `architecture.md`.
- [ ] Scenarios with explicit positions skip randomization.

Acceptance:

- same seed produces identical initial state twice in a row;
- different seeds yield different positions across test runs;
- all heroes spawn on southern rows and all enemies on northern rows;
- no unit spawns on an obstacle or another unit across many seeds;
- existing engine tests pass without changing expectations.

**M2. Three maps and non-repeating roll** (improvement 7). Depends on M1.

- [ ] `MAPS` in config matching layouts in `game-design.md`.
- [ ] Roll map on engine creation and on each `reset()`, excluding previous map.
- [ ] `mapId` and `mapName` on snapshot.

Acceptance:

- each map passes constraints: 12×12, obstacle-free spawn rows, all free cells connected, no duplicate obstacles;
- across a long sequence of resets, no map appears twice consecutively and all three appear;
- with a fixed seed, map sequence repeats deterministically;
- snapshot after `reset()` reflects the new map's obstacles.

**M3. Undo move** (improvement 5). Depends on M0.

- [ ] Last manual move record; `undoMove()`; `canUndoMove`; `moveUndone` event.

Acceptance, one test per case:

- move then undo restores position and `hasMoved = false`, event includes return path;
- after undo, unit moves again and a second undo is rejected;
- rejected with no move made, after attack, after skill, on enemy turn, and after battle end;
- rejected after `smartAttack` with movement;
- `canUndoMove` tracks each of those cases;
- undo neither ends activation nor spends attack;
- record never leaks into next activation or survives `reset()`.

**M4. Smart attack and smart skill** (improvement 4). Depends on M0.

- [ ] Skill target validation accepting caster position parameter.
- [ ] `getSmartAttackPlan`, `smartAttack`, `getSmartSkillPlan`, `smartUseSkill`.

Acceptance, one test per case:

- target already in range: attacks without moving and `hasMoved` stays `false`;
- target out of range: moves to lowest-cost cell and attacks; activation auto-ends;
- tie-breaking by distance to target and then `(y, x)`, with dedicated test setups per tie level;
- archer lacking LoS moves to a cell with LoS rather than a closer cell without LoS;
- no valid cell in move range: rejected, zero events and zero state change;
- unit already moved and target out of range: rejected;
- killing blow after move: victory, no enemy turn;
- plan returned by query matches exact path executed by action;
- `smartUseSkill` with single-target, area, and heal skills, including self-heal without moving;
- plan queries never mutate state or emit events.

## Interface Tasks (t1b)

**I1. Arcane Burst** (improvement 1)

- [ ] Pure skill event grouping module, with Node tests (t18).
- [ ] Composite animation in `UnitRenderer`: projectile to target cell, VFX on impact, simultaneous damage.

Acceptance: with three enemies in area, one projectile flies from mage to center; explosion starts at impact; all three HP bars drop together; deaths play afterward; Runic Strike unchanged; Marked Shot shows arrow before reticle.

**I2. `E` shortcut** (improvement 2)

- [ ] Keyboard listener in `HudManager` calling same handler as button; label `"End Turn (E)"`.

Acceptance: `E` ends activation when button is enabled; does nothing on enemy turn, during animation, or with result modal open; holding key does not end multiple activations; `Ctrl+E` ignored.

**I3. Opacity** (improvement 3)

- [ ] `syncUnits` receives `activeUnitId`; per-unit body materials; named constants for both values.

Acceptance: active unit is 1.0 and other living units are 0.75 on both teams; updates on every activation change, including consecutive enemies; on battle end all living units return to 1.0; corpses and HP bars unchanged; reset restores all.

**I4. Maps in UI** (improvement 7). Depends on M2.

- [ ] Rebuild board on `gameReset`, disposing old geometries and materials.
- [ ] Display `mapName` in HUD.

Acceptance: after reset, screen obstacles match snapshot; click selection respects new obstacles; GPU memory does not grow across repeated resets; camera preserves angle.

**I5. Undo in UI** (improvement 5). Depends on M3.

- [ ] "Undo Move" button wired to `canUndoMove`; `moveUndone` animation.

Acceptance: button enabled only when engine allows undo and no animation plays; unit walks back along path; highlights recalculate for origin cell.

**I6. Smart attack in UI** (improvement 4). Depends on M4.

- [ ] Clicking an enemy calls `smartAttack`; clicking a cell in skill mode calls `smartUseSkill`.
- [ ] Hover preview with path and destination cell from plan queries.
- [ ] Distinct highlight for enemies only attackable after moving.

Acceptance: hover preview matches path taken on click; attacking an in-range enemy spends no movement; zero range or path calculations added outside the engine.

## Integration

**R1. Review** — t16

- [ ] Zero `Math.random` in rules; all rolls via seeded PRNG.
- [ ] Atomic smart actions; rejections emit no events and alter no state.
- [ ] Zero new rules in rendering, input, or ui.
- [ ] `types.ts` contracts and comments match implementation.

**R2. Browser QA and documentation** — t1b and t1c

- [ ] QA script below, with evidence for each item.
- [ ] Docs updated to reflect delivered behavior.

## Verification

1. **Node tests:** engine (M1 to M4) and event-grouping module (I1).
2. **Regression:** `npm run typecheck`, `npm test`, and `npm run build`.
3. **Seeded simulated matches:** automated player using `smartAttack` runs multiple seeds; every match ends in victory or defeat across all three maps.
4. **Browser QA script:**
   - Arcane Burst with one, two, and three enemies in area, and with a kill;
   - `E` in every turn state;
   - opacity across a full round and after battle end;
   - melee and ranged smart attack, comparing preview against execution;
   - undo in every allowed and rejected case;
   - ten consecutive resets: map always differs from previous, spawns stay in spawn rows, board and obstacles match.

## Decisions for Coordinator

- **Additions beyond request in contract:** `seed` on snapshot, `SmartActionPlan`, and both plan queries. Without queries, smart-attack preview cannot work without rules in UI.
- **Whether `smartUseSkill` ships or not.** Contract includes it. Most useful for Runic Strike and Healing Light; for Arcane Burst per-cell preview is harder to read. Can ship smart attack alone and keep `useSkill`.
- **Smart attack in default mode.** One click can move and attack with no undo. Alternative is restricting it to attack mode only.
- **Map repetition across page reloads.** Engine only guarantees non-repetition within a session. Storing last map in browser storage is optional.
- **Undo shortcut.** Request defines no key. Suggestion: `Z`.

## Risks

- **`typecheck` broken until M0.** Any agent running checks earlier sees errors outside their scope.
- **One-click move-and-attack without undo.** Without preview, smart attack sends units somewhere unexpected and movement cannot be undone.
- **Balance with randomized spawns.** Mage or Cleric might spawn forward and Archer without LoS. Multi-seed simulations measure winability; if needed, restrict spawn columns by class.
- **Maps stalling AI.** Narrow chokepoints with ten units may leave enemies pathless. Simulation across all three maps covers this.
- **Opacity.** Translucent materials alter draw sorting and show model interiors; only browser testing shows whether visuals are acceptable.
- **Memory leak on board rebuild.** `buildBoard` currently removes meshes without disposing geometries and materials.
- **Tests relying on default positions.** Tests using default battle without explicit setups now depend on seed and must pin it.
- **Out-of-order skill events.** Animation grouping assumes skill events arrive contiguously together. If engine changes this, animations break silently; hence the guarantee is part of the contract and tested.

---

# Implementation Plan — V4 (The Ashen Campaign)

## Status and Boundaries

**Delivery 1 (Architecture & Balance)** defines V4's technical specifications in `attribute-system.md`, `combat-system.md`, `campaign-design.md`, `enemy-design.md`, `balance-config.md`, and the V4 section of `architecture.md`. No code in `src/` was altered in Delivery 1.

Deliveries below (**Deliveries 2 to 7**) proceed incrementally: each delivery must leave `npm run typecheck`, `npm test`, and `npm run build` green before moving to the next.

## Order and Dependencies

```text
Delivery 2 (Attributes + Damage + Defend)
   │
   ├──▶ Delivery 3 (New Enemies + AI + PendingAttack + 2-Phase Boss)
   │       │
   │       └──▶ Delivery 5 (V4 3D Rendering: Models, Water/Bridges, Telegraphs, Aura)
   │               │
   └──▶ Delivery 4 (New Maps + 5-Stage Campaign + Checkpoint + SaveSystem)
                   │
                   └──▶ Delivery 6 (Campaign HUD + Camp/Evolution + main.ts)
                           │
                           └──▶ Delivery 7 (End-to-End QA, Simulation & Reconciliation)
```

*(Note: Deliveries 3 and 4 depend on Delivery 2's types/formulas and can proceed in short sequence or with single-editor coordination on `src/shared/types.ts` and `src/config/gameConfig.ts`.)*

---

## Delivery 2 — Attribute Core, Damage Formula, and Defend Unification

**Allowed scope**: `src/shared/types.ts`, `src/config/gameConfig.ts`, `src/game/attributes/AttributeSystem.ts` (new), `src/game/combat/CombatSystem.ts`, `src/game/entities/UnitFactory.ts`, `src/game/turns/TurnSystem.ts`, `src/game/GameEngine.ts`, and tests in `tests/`. *(Minimal adjustment in `HudManager.ts`, `UnitRenderer.ts`, and `main.ts` only if removing `shield` breaks `typecheck`, or keep temporary declared compatibility until Delivery 5/6.)*

### Tasks
- [x] **2.1 Contracts and config**: add `AttributeKey`, `UnitAttributes`, `AttackKind`, `MIN_ATTRIBUTE = 1`, `MAX_ATTRIBUTE = 12`, `attributes`, `baseHp`, `baseArmor`, `basePower`, `attackKind`, and `armor` to `UnitState` and `UNIT_STATS`, per `docs/balance-config.md`. Update `SKILLS` with explicit `attackKind` and V4 values (`runic-strike: 4`, `marked-shot: 3`, `arcane-burst: 2`, `healing-light: 3`).
- [x] **2.2 `AttributeSystem.ts`**: implement `offensiveBonus`, `calcMaxHp`, `fortitudeResistance`, `getAttributeForAttack`, and `applyAttributePoint` (including exact `FORT` upgrade rule without healing prior damage).
- [x] **2.3 Damage and healing formula in `CombatSystem.ts`**: implement centralized `computeDamage` (`attackPower - totalDefense` floor 1, reduced by `Math.ceil(damageBeforeGuard * 0.5)` when `isGuarding`), and update `resolveSkill` healing to `skill.heal + offensiveBonus(caster.attributes.int)`.
- [x] **2.4 Unify `defend()`**: remove `GUARD_SHIELD` / `SHIELD_WALL_BONUS` / numeric shield, making `defend()` set `isGuarding = true` with 50% mitigation until the start of the unit's next activation (working before or after moving).
- [x] **2.5 Update tests**: create `tests/attributes.test.ts` (formulas, bounds, `FORT` rule), update `tests/defend.test.ts` for the 50% stance, and validate `tests/combat-turns.test.ts` against new initial stats.

### Acceptance Criteria
- `npm run typecheck` and `npm test` 100% green.
- All damage (basic and skill) and healing calculations flow through `AttributeSystem` + `CombatSystem` with zero duplication.
- `defend()` halves damage rounded up with floor 1, lasts until the unit's own next activation, and works before or after moving.

---

## Delivery 3 — New Enemies, Deterministic AI, Telegraphed Attacks, and Boss

**Allowed scope**: `src/shared/types.ts`, `src/config/gameConfig.ts`, `src/game/combat/CombatSystem.ts`, `src/game/turns/TurnSystem.ts`, `src/game/ai/EnemyAI.ts`, `src/game/entities/UnitFactory.ts`, `src/game/GameEngine.ts`, `tests/`.

### Tasks
- [x] **3.1 New types and skills**: add `goblin-stalker`, `skeleton-shieldbearer`, `necromancer-acolyte`, `ashen-guardian`, and skill `dark-mend` in `types.ts` and `gameConfig.ts` following `docs/balance-config.md`.
- [x] **3.2 `PendingAttack` and engine lifecycle**: add `pendingAttacks` to `GameStateSnapshot`, events `attackPrepared`, `pendingAttackResolved`, and `attackCancelled`, immediate cancellation on caster death, and automatic resolution at the start of the living caster's next activation before `checkBattleEnd`.
- [x] **3.3 Boss `ashen-guardian` (2 Phases)**: add `bossPhase: 1 | 2`, irreversible trigger at `hp <= Math.floor(maxHp * 0.5)` without restoring HP, `+1 moveRange` (`2 -> 3`), and `bossPhaseChanged` event.
- [x] **3.4 Deterministic AI (`EnemyAI.ts`)**: implement deterministic trees for `goblin-stalker`, `skeleton-shieldbearer` (including `defend`), `necromancer-acolyte` (`dark-mend` heal + ranged magic), and `ashen-guardian` (cross `Ashen Slam` in Phase 1 and 3×3 `Ashen Eruption` in Phase 2 + melee strikes).
- [x] **3.5 Tests in `tests/`**: cover AI for the 3 new enemies, `PendingAttack` preparation/cancellation/resolution, `Defend` mitigation against `PendingAttack`, and boss Phase 1 → Phase 2 transition without restoring HP.

### Acceptance Criteria
- `npm run typecheck` and `npm test` 100% green.
- `PendingAttack` whose caster dies before its turn is cancelled without dealing damage; if alive, resolves at start of its next activation and respects `isGuarding`.
- Boss enters Phase 2 immediately upon reaching `<= 50%` HP, restores zero HP, and expands its telegraphed attack to `3×3`.

---

## Delivery 4 — New Maps, 5-Stage Campaign, Checkpoints, and `SaveSystem`

**Allowed scope**: `src/shared/types.ts`, `src/config/gameConfig.ts`, `src/game/maps/MapSystem.ts`, `src/game/GameEngine.ts`, `src/game/campaign/CampaignSystem.ts` (new), `src/game/campaign/SaveSystem.ts` (new), `tests/`.

### Tasks
- [x] **4.1 Maps `forgotten-swamp` and `corrupted-sanctuary`**: add `ObstacleKind` `'water'` (`blocksLos: false`), visual `bridgeCells`, and both maps in `MAPS`, updating `GameSetup` to accept campaign attribute/HP overrides and `mode` / `stageNumber` / `stageName`.
- [x] **4.2 `CAMPAIGN_STAGES`**: register the exact 5 stages from `docs/campaign-design.md` in `gameConfig.ts`.
- [x] **4.3 `CampaignSystem.ts`**: implement new campaign startup, per-stage `GameSetup` generation, post-victory recovery (`+35%` living ceil / `25%` revive ceil), `+1` point per hero, attribute allocation (`FORT` without healing prior damage), stage-start checkpoint, and stage restart via checkpoint.
- [x] **4.4 `SaveSystem.ts`**: implement persistence on `StorageAdapter` under key `'rune_tactics_v4_save'` (`version: 4`), with strict validation and safe recovery from invalid/corrupted saves.
- [x] **4.5 Tests in `tests/`**: validate BFS connectivity and spawns for all maps (`MAPS`), 5-stage sequence, recovery/revive, checkpoint/restart on defeat, `FORT` allocation, and `SaveSystem` serialization/validation with an in-memory `StorageAdapter`. Preserve all Quick Battle tests.

### Acceptance Criteria
- `npm run typecheck` and `npm test` 100% green.
- Full 5-stage campaign simulation and Quick Battle mode running in DOM-free Node tests.

---

## Delivery 5 — V4 3D Rendering

**Allowed scope**: `src/rendering/CharacterVisualController.ts`, `src/rendering/UnitRenderer.ts`, `src/rendering/BoardRenderer.ts`, `public/assets/portraits/` (portraits for the 4 new enemies if applicable).

### Tasks
- [x] **5.1 KayKit models and fallback**: register `goblin-stalker`, `skeleton-shieldbearer`, `necromancer-acolyte`, and `ashen-guardian` in `MODEL_SPECS` with the `.glb`, `targetHeight`, and `tintHex`/`tintStrength` from `docs/enemy-design.md`, plus matching procedural fallback and visual highlight for boss Phase 2 (`bossPhase === 2`).
- [x] **5.2 New map terrain**: render `'water'` obstacles (translucent swamp water) and `bridgeCells` (wooden planks) in `forgotten-swamp`, and dark/ember theme in `corrupted-sanctuary` (with proper `dispose` in `buildBoard`).
- [x] **5.3 `PendingAttack` telegraphs and Defend**: add visual danger-cell layer (`dangerCells`) in `BoardRenderer`, composite animation in `UnitRenderer` for `pendingAttackResolved` (ashen explosion in cross/3×3), `dark-mend` VFX, and defense aura driven by `unit.isGuarding`.

### Acceptance Criteria
- `npm run typecheck`, `npm test`, and `npm run build` green.
- All new enemies, ~1.4x-scale boss, bridges over water, defense aura, and danger cells clearly legible under 360° camera orbit.

---

## Delivery 6 — Campaign HUD, Evolution Screen, and `main.ts` Integration

**Allowed scope**: `src/ui/`, `src/style.css`, `src/main.ts` (without importing `src/game/` in `src/ui/`, only via contracts/callbacks injected by `main.ts`!).

### Tasks
- [x] **6.1 Mode Selector**: initial screen/overlay offering **New Campaign**, **Continue Campaign** (enabled if `SaveSystem` finds a valid save), and **Quick Battle**, plus clean mode switching.
- [x] **6.2 V4 Battle HUD**: show `Stage X/5 — Name` in match panel, attributes (`STR`, `DEX`, `INT`, `FORT`, `DEF`) and `Defending (-50%)` badge on unit card, boss phase indicator (`Phase 2: Ashen Fury`), combat feedback for `attackPrepared`, `pendingAttackResolved`, `attackCancelled`, `bossPhaseChanged`, and unified defensive stance.
- [x] **6.3 Camp / Evolution Screen**: between-stage overlay showing healed/revived HP, unspent points per hero, `+` buttons on all 4 attributes with clear effect preview (`+ATK`, `+MaxHP`, `+DEF`), and **"Start Stage N+1"** button.
- [x] **6.4 Defeat, Checkpoint, and Final Victory**: on Campaign defeat, offer **"Restart Stage (Checkpoint)"** and **"New Campaign"**; on Stage 5 victory, display **Campaign Victory** modal.
- [x] **6.5 Wiring in `main.ts`**: connect `CampaignSystem`, `SaveSystem` (`window.localStorage`), `GameEngine`, `BoardRenderer`, `UnitRenderer`, and `HudManager`.

### Acceptance Criteria
- `npm run typecheck`, `npm test`, and `npm run build` green.
- Zero layer violations (`src/ui/`, `src/rendering/`, `src/input/` free of `src/game/` imports).

---

## Delivery 7 — Integrated QA, Simulation, and Doc Reconciliation

**Allowed scope**: `tests/`, browser visual inspection, and final updates to `docs/` to reflect delivered work.

### Tasks
- [ ] **7.1 Automated gates**: run `npm run typecheck`, `npm test`, and `npm run build` ensuring zero errors or skipped tests.
- [ ] **7.2 Manual browser QA**: validate full Campaign flow (Stages 1 → 5, including defeat + Restart Stage via checkpoint, page reload in `in_stage` and `between_stages`, `FORT` upgrade, boss Phase 2, and `PendingAttack`) and Quick Battle (map/spawn randomization without touching campaign save).
- [ ] **7.3 Reconciliation**: confirm docs in `docs/` accurately reflect delivered code and record any final balance adjustments.

---

# Implementation Plan — V5 (Multiplayer PvP 3v3 & MCP-Ready Core)

## Status and Boundaries

**Entrega 1 (Arquitetura Definitiva)** establishes the complete V5 technical specification across:
- [multiplayer-architecture.md](multiplayer-architecture.md)
- [colyseus-integration.md](colyseus-integration.md)
- [game-command-contracts.md](game-command-contracts.md)
- [match-service.md](match-service.md)
- [pvp-game-design.md](pvp-game-design.md)
- [mcp-readiness.md](mcp-readiness.md)

No source code in `src/` or `server/` was altered during Entrega 1. V4 PvE (`quick-battle` and `campaign`) remains untouched and all existing 179 tests stay green throughout V5.

## Ownership Split (Zero File Conflicts)

| Stream | Owner | Exclusive Owned Files / Directories |
|---|---|---|
| **Backend / Core** | **Codex** | `src/shared/types.ts` *(minimal additive)*, `src/shared/pvpTypes.ts`, `src/config/gameConfig.ts` *(PvP constants)*, `src/game/**`, `server/**`, `Dockerfile`, `.dockerignore`, `tests/pvp-engine.test.ts`, `tests/match-service.test.ts`, `server/tests/colyseus-room.test.ts` |
| **Frontend / UI** | **Antigravity** | `package.json` *(`@colyseus/sdk@0.18.10`)*, `src/network/**`, `src/rendering/**`, `src/ui/**`, `src/style.css`, `index.html`, `src/main.ts`, `tests/pvp-client-projection.test.ts` |

> **Rule**: Codex never edits `src/network/`, `src/rendering/`, `src/input/`, `src/ui/`, `src/main.ts`, or `src/style.css`. Antigravity never edits `src/shared/`, `src/config/`, `src/game/`, or `server/`. Once Entrega 2 locks `src/shared/pvpTypes.ts` and `src/config/gameConfig.ts`, Backend (Entregas 3–4) and Frontend (Entregas 5–6) can execute in parallel with **zero merge conflicts**.

## Dependency Graph

```text
Entrega 1 (Docs — Done)
   │
   ▼
Entrega 2 (Shared Contracts + Config + Decoupled PvP Engine Core) [Codex]
   │
   ├──────────────────────────────────────────┐
   ▼                                          ▼
Entrega 3 (MatchService + Clock + Tests)   Entrega 5 (Browser Adapter: ColyseusMatchClient + PvPClientEngine)
   [Codex]                                    [Antigravity]
   │                                          │
   ▼                                          ▼
Entrega 4 (Colyseus Server: PvPRoom +      Entrega 6 (180° Camera + Team-Relative Death/HUD + Lobby/Draft + main.ts)
   Schema 5.0 + Auth + Reconnect 90s)         [Antigravity]
   [Codex]                                    │
   │                                          │
   ▼                                          │
Entrega 7 (Docker / Coolify / WSS Packaging)  │
   [Codex]                                    │
   │                                          │
   └──────────────────┬───────────────────────┘
                      ▼
Entrega 8 (E2E Integration, Dual-Browser QA & Doc Reconciliation) [Codex + Antigravity]
```

---

## Entrega 2 — Shared Contracts, Config, and Decoupled PvP Tactical Core (**Codex**)

**Scope**: `src/shared/types.ts`, `src/shared/pvpTypes.ts` (new), `src/config/gameConfig.ts`, `src/game/turns/TurnSystem.ts`, `src/game/GameEngine.ts`, `src/game/pvp/PvPMatchEngine.ts` (new), `tests/pvp-engine.test.ts` (new).

### Tasks
- [x] **2.1 Shared contracts**:
  - Extend `GameMode` in `src/shared/types.ts` to `'quick-battle' | 'campaign' | 'pvp'` and add optional `pvp` perspective metadata on `GameStateSnapshot`.
  - Create `src/shared/pvpTypes.ts` with all contracts from `docs/game-command-contracts.md` (`PlayerSeat`, `PvPTeam`, `PvPHeroClass`, `ActorContext`, `GameCommand`, `CommandEnvelope`, `CommandResult`, `PvPGameplayEvent`, `LegalActionsSnapshot`, `ObservableMatchState`, `PvPRoomPhase`, `MatchFinishReason`).
- [x] **2.2 Config constants**: Add `PVP_DEFAULT_MAP_ID = 'forgotten-swamp'`, `PVP_TEAM_SIZE = 3`, `PVP_HERO_CLASSES`, `PVP_TURN_DURATION_MS = 60_000`, `PVP_RECONNECT_GRACE_SECONDS = 90`, `PVP_INVITE_CODE_LENGTH = 6` to `src/config/gameConfig.ts`.
- [x] **2.3 Share tactical rules without breaking PvE**:
  - Extract or parameterize common tactical logic (reachable cells, attack/skill range & targets, smart plans, move/undo, attack/skill/defend resolution, pending attack lifecycle, round/cooldown wrap) so `GameEngine` (PvE) and `PvPMatchEngine` (PvP `'teamA' | 'teamB'`) share 100% of rules with zero duplication.
- [x] **2.4 `PvPMatchEngine.ts`**:
  - Enforce 3 unique hero classes per team in selection order `[A1, A2, A3]` / `[B1, B2, B3]`.
  - Build fixed interleaved `turnOrder` (`[A1, B1, A2, B2, A3, B3]`, or `[B1, A1, ...]` when `startingTeam === 'teamB'`).
  - Place Team A via `createRng(seed)` on `playerSpawnRows` (`[0, 1]`) and Team B at exact 180° mirrors `(11 - x, 11 - y)` on `enemySpawnRows` (`[10, 11]`) on `forgotten-swamp`.
  - Implement `getLegalActions(team)` returning complete `LegalActionsSnapshot` (paths, smart attack/skill plans, range cells, damage estimates, `wouldKill`, area cells).
- [x] **2.5 Unit tests (`tests/pvp-engine.test.ts`)**: Verify mirrored spawns, 3v3 interleaved turn order, smart actions, undo rules, `Defend` 50% mitigation, `Arcane Burst`, `Healing Light`, corpse skipping, `getLegalActions` accuracy, and zero regression on all 179 existing PvE tests.

### Acceptance Criteria
- `npm run typecheck` and `npm test` pass 100% with zero skipped tests and zero PvE regressions.
- `src/game/` has zero Three.js, DOM, `localStorage`, or Colyseus imports.

---

## Entrega 3 — Authoritative `MatchService` & Deterministic Turn Clock (**Codex**)

**Scope**: `src/game/pvp/MatchService.ts` (new), `tests/match-service.test.ts` (new).

### Tasks
- [x] **3.1 `MatchService.ts`**:
  - Implement `createMatch`, `getMatchState`, `getLegalActions`, `submitAction`, `pauseMatch`, `resumeMatch`, `handleTurnTimeout`, `forfeitMatch`, and `deleteMatch` per `docs/match-service.md`.
  - Accept injectable `ClockFn` (`() => number`) for deterministic timeout testing.
  - Enforce strict pipeline order: match lookup -> `ActorContext` seat authorization -> `(actorId, commandId)` idempotency cache -> match phase (`PAUSED_DISCONNECTED` / `IN_PROGRESS`) -> turn ownership & `command.unitId === activeUnitId` -> `expectedRevision` check -> `PvPMatchEngine` execution -> revision bump & `turnDeadlineMs` update.
- [x] **3.2 Tests (`tests/match-service.test.ts`)**:
  - Test full headless 3v3 match simulation to elimination.
  - Test `commandId` idempotency replay after revision already incremented, plus `COMMAND_CONFLICT` on payload mismatch.
  - Test `STALE_REVISION`, `NOT_YOUR_TURN`, `UNIT_NOT_ACTIVE`, `UNAUTHORIZED_ACTOR`, and `MATCH_PAUSED` rejections leaving state & revision untouched.
  - Test 60s timeout via mock `ClockFn`, ensuring same-unit partial moves do NOT reset the turn clock and disconnect pause preserves remaining turn ms.

### Acceptance Criteria
- Headless matches run deterministically in Node/Vitest with zero timers or network dependencies.
- `npm run typecheck` and `npm test` green.

---

## Entrega 4 — Colyseus Server (`server/`): `PvPRoom`, Schema 5.0, Auth & Reconnect (**Codex**)

**Scope**: `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/src/auth/SessionTokenService.ts`, `server/src/schema/PvPRoomState.ts`, `server/src/rooms/PvPRoom.ts`, `server/tests/colyseus-room.test.ts`.

### Tasks
- [x] **4.1 Server package setup**: Pin `colyseus@0.18.12`, `@colyseus/schema@5.0.49`, and matching `@colyseus/ws-transport@0.18.x` in `server/package.json` with dedicated `server/tsconfig.json` and build/test scripts.
- [x] **4.2 Auth & Invite Registry (`SessionTokenService.ts`)**:
  - Implement HMAC-signed ephemeral `sessionToken` creation/verification (`POST /api/pvp/session`), public Room ID generation (`RT-XXXXXXXX`, `POST /api/pvp/rooms`), and Room ID lookup (`GET /api/pvp/rooms/:inviteCode`).
- [x] **4.3 `@colyseus/schema@5.0.49` state (`PvPRoomState.ts`)**:
  - Define `SeatSchema`, `PvPUnitSchema`, and `PvPRoomState` using functional `schema({...})` + `t.*` definitions, separating stable lobby/seat state from dynamic tactical fields and omitting static `gameConfig` terrain.
- [x] **4.4 `PvPRoom.ts`**:
  - Implement `static onAuth` / `onAuth` validating `sessionToken` and binding `actorId` to Seat A or Seat B (`maxClients = 2`, private metadata `{ inviteCode, phase }`).
  - Implement full 7-state room lifecycle (`WAITING_FOR_PLAYER` -> `CHARACTER_SELECTION` -> `WAITING_FOR_READY` -> `STARTING` -> `IN_PROGRESS` <-> `PAUSED_DISCONNECTED` -> `FINISHED`).
  - Serialize all room messages and `this.clock` timeout callbacks through a per-room FIFO async queue.
  - Implement `onDrop(client, code)` -> `MatchService.pauseMatch` + `await this.allowReconnection(client, 90)`, `onReconnect(client)` -> `resumeMatch` + unicast `matchInit`, and `onLeave(client, code)` -> `forfeitMatch` (`disconnect_timeout` or `forfeit`).
  - Handle `requestRematch` / `cancelRematch`, alternating `startingTeam` on mutual acceptance.
- [x] **4.5 Integration tests**: Test two simulated clients through join by public Room ID `RT-XXXXXXXX`, draft, ready, command submission, turn timeout, disconnect/reconnect within 90s, timeout forfeit, and rematch.

### Acceptance Criteria
- Server compiles cleanly and Colyseus room integration tests pass.
- No Colyseus code enters `src/game/`.

---

## Entrega 5 — Browser PvP Adapter & Client Perspective Projection (**Antigravity**)

**Scope**: `package.json` (`@colyseus/sdk@0.18.10`), `src/network/ColyseusMatchClient.ts` (new), `src/network/PvPClientEngine.ts` (new), `tests/pvp-client-projection.test.ts` (new).

### Tasks
- [x] **5.1 Client SDK**: Add `@colyseus/sdk@0.18.10` to root `package.json`.
- [x] **5.2 `ColyseusMatchClient.ts`**:
  - Implement HTTP session acquisition (`/api/pvp/session`), room creation (`/api/pvp/rooms`), invite lookup (`/api/pvp/rooms/:inviteCode`), `client.joinById(...)`, `reconnectionToken` persistence in `sessionStorage`, `client.reconnect(...)` recovery, `getStateCallbacks(room)` schema bindings, and command/draft/ready/rematch/forfeit senders.
  - Resolve server URL from `VITE_PVP_SERVER_URL` in dev or `window.location.origin` in production.
- [x] **5.3 `PvPClientEngine.ts` (implements `IGameEngine`)**:
  - Project server `ObservableMatchState` and `PvPGameplayEvent[]` into viewer-relative `GameStateSnapshot` (`myTeam -> 'player'`, `opponentTeam -> 'enemy'`, `myTurn -> 'player' / 'player_unit_active'`, `opponentTurn -> 'enemy' / 'enemy_activation'`, `winnerSeat === mySeat -> 'victory'`).
  - Answer all synchronous `IGameEngine` queries (`getReachableCells`, `getPath`, `getAttackableTargets`, `getAttackRangeCells`, `getSkillRangeCells`, `getSkillTargetCells`, `getSkillAreaCells`, `getSmartAttackPlan`, `getSmartSkillPlan`) strictly from `LegalActionsSnapshot` (zero local rule recalculation).
  - Gate duplicate UI commands with `inFlightCommandId` until server `CommandResult` arrives; surface server errors via feedback callback.
- [x] **5.4 Pure tests (`tests/pvp-client-projection.test.ts`)**: Verify Seat A vs Seat B perspective projection (`team`, `phase`, `turnState`, `winner`, projected events) and `LegalActionsSnapshot`-backed `IGameEngine` queries in Node.

### Acceptance Criteria
- `npm run typecheck`, `npm test`, and `npm run build` pass.
- `src/network/` does not import `src/game/`, `src/rendering/`, `src/ui/`, or Three.js.

---

## Entrega 6 — 180° Camera, Team-Relative Visuals, PvP Lobby/HUD & `main.ts` (**Antigravity**)

**Scope**: `src/rendering/CameraController.ts`, `src/rendering/SceneManager.ts`, `src/rendering/UnitRenderer.ts`, `src/ui/PvPLobbyOverlay.ts` (new), `src/ui/HudManager.ts`, `src/style.css`, `index.html`, `src/main.ts`.

### Tasks
- [x] **6.1 180° Initial Camera Perspective**:
  - Add `setAzimuth(azimuthRad: number, immediate = true)` to `CameraController` and `SceneManager` (only `SceneManager` moves the camera).
  - Wire Seat `'A'` -> `Math.PI / 4` (45°) and Seat `'B'` -> `(5 * Math.PI) / 4` (225°) on PvP match start; restore `Math.PI / 4` when entering PvE modes; preserve azimuth on rematch and `reset()`.
- [x] **6.2 Team-Relative Visuals in `UnitRenderer.ts`**:
  - Verify team-relative death policy works seamlessly under `PvPClientEngine` projection (`myTeam` lies down as persistent corpse; `opponentTeam` shrinks/vanishes).
  - Add PvP inactive-unit opacity handling so non-active living units on **both** teams dim to `INACTIVE_UNIT_OPACITY` (`0.75`) during an active PvP match and restore to `1.0` when battle ends.
- [x] **6.3 PvP Lobby, 3v3 Draft/Order & In-Match HUD (`PvPLobbyOverlay.ts`, `HudManager.ts`, `style.css`)**:
  - Add **"Multiplayer PvP (3v3)"** button on Main Mode Menu.
  - Build PvP Lobby modal: Display Name input, Create Room (shows copyable public Room ID `RT-XXXXXXXX`), Join by Room ID, and Reconnect prompt if `sessionStorage` holds an active `reconnectionToken`.
  - Build 3v3 Class Draft & Order screen: pick 3 unique classes from Knight/Archer/Mage/Cleric, reorder slots `[1, 2, 3]` (showing `[A1, B1, A2, B2, A3, B3]` preview), Ready toggle, and opponent connection/ready indicator.
  - Adapt battle HUD for `state.mode === 'pvp'`: `'Your Turn'` / `'Opponent Turn'` phase labels, `'Opponent'` panel header, server-synced 60s countdown active on both players' turns, `'Forfeit'` instead of `'Restart'`, disconnect pause banner (`90s` countdown), connection-drop reconnecting banner, and Result modal with **Rematch** voting + **Back to Menu** (no chat).
- [x] **6.4 Composition in `src/main.ts`**:
  - Wire `ColyseusMatchClient` and `PvPClientEngine` behind `engineProxy` without altering `InputManager` or `BoardRenderer` contracts.
  - Disable client-side local auto-`endPlayerTurn()` timer in PvP mode (server owns the 60s turn clock).

### Acceptance Criteria
- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Zero layer violations (`src/ui/`, `src/rendering/`, `src/input/` remain free of `src/game/` and `@colyseus/sdk` imports).

---

## Entrega 7 — Docker, Coolify, and HTTPS/WSS Deployment (**Codex**)

**Scope**: `Dockerfile` (new), `.dockerignore` (new), `server/src/index.ts`, `.env.example`.

### Tasks
- [x] **7.1 Multi-stage `Dockerfile`**: Build Vite frontend (`dist/`) and TypeScript Colyseus server (`server/dist/`), running only production Node dependencies in final image.
- [x] **7.2 Single-origin Node server**: Serve static `dist/`, `/healthz`, `/api/pvp/*`, and Colyseus WebSocket transport on `PORT` (default `2567`) with proxy-friendly `trust proxy` and WebSocket keepalive.
- [x] **7.3 Configuration docs/examples**: Document `PORT`, `PVP_SESSION_SECRET`, `ALLOWED_ORIGINS`, and `VITE_PVP_SERVER_URL` in `.env.example`.

### Acceptance Criteria
- `docker build` succeeds cleanly and container serves both frontend and WebSocket room endpoints on a single port behind HTTPS/WSS reverse proxy.

---

## Entrega 8 — Integrated E2E QA and Documentation Reconciliation (**Codex + Antigravity**)

**Scope**: `tests/`, live dual-browser verification, `docs/` reconciliation.

### Tasks
- [x] **8.1 Automated test gates**: Run `npm run typecheck`, `npm test`, `npm run build`, and server test/build scripts with 0 failures or skipped tests.
- [x] **8.2 Dual-browser PvP QA checklist**:
  - Create match on Browser A (`RT-XXXXXXXX`) and join on Browser B using only the public Room ID.
  - Verify 3v3 unique draft + slot ordering determines `[A1, B1, A2, B2, A3, B3]`.
  - Verify `forgotten-swamp` loads symmetrically; Player A camera starts at `45°`, Player B camera starts at `225°` (`180°` opposite), and `SwampScenario` perimeter occluders hide cleanly on both angles.
  - Verify team-relative death visuals on both screens (`myTeam` leaves lying corpse, `opponentTeam` vanishes).
  - Verify `SmartAttack`, `SmartUseSkill`, `UndoMove`, `Defend`, and `E`/`G` shortcuts sync identically across both browsers.
  - Verify 60s server timeout advances turn automatically and updates both HUDs.
  - Verify page reload / network drop on Browser B pauses match, preserves remaining turn time, and recovers within 90s; verify >90s drop awards disconnect-timeout victory to Browser A.
  - Verify Rematch returns to `CHARACTER_SELECTION` and swaps `startingTeam`.
  - Verify Quick Battle and Campaign (`localStorage` save) remain 100% isolated and unaffected.
- [x] **8.3 Doc reconciliation**: Update any final file paths/signatures in `docs/` if adjusted during implementation.

