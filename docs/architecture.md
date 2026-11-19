# Current Architecture and V2.1 Migration

## Scope and Status

Diagnosis based on reading the source files at the start of the task and running typecheck/tests. Other agents modified code and tests concurrently during documentation; references to baseline behavior below describe the initial code reading and must be revalidated after integration. V2.1 in this brief is a corrective specification: fixed turn order, team-differentiated visual death, and basic attack range cells. It is not a claim that those changes already exist.

The baseline identifies itself as V2.2 in `AGENTS.md` and `game-design.md`, yet still allows manual ally selection and persistent corpses for both teams. Those behaviors conflict with the brief; the migration follows the explicit request without introducing V3/V4 features. `turn-system.md` details the target; `implementation-plan.md` organizes its implementation. The older note stating that the engine still acted per whole team was incorrect: individual activations are already implemented.

## Layers and Dependencies

| Layer | Responsibility | Allowed Dependencies |
|---|---|---|
| `src/shared/` | Types, snapshots, commands, and events | No runtime dependencies |
| `src/config/` | Grid, obstacles, stats, skills, spawns, and future fixed order | `shared` |
| `src/game/` | Synchronous rules without DOM/Three.js | `shared`, `config` |
| `src/rendering/` | Three.js scene, animations, units, and board highlights | `shared`, Three.js; approved visual config |
| `src/input/` | Raycasting, mouse handling, and interaction modes | `shared`, `rendering`, Three.js |
| `src/ui/` | HUD, buttons, portraits, and feedback | `shared`, `config`, `input` |
| `src/main.ts` | Composition, event consumption, and AI step pacing | All layers |

Rendering, input, and UI must not import `src/game/`; they receive only `IGameEngine`. Damage, movement, range, LoS, cooldowns, and turn scheduling belong to the engine. Match numbers live in `gameConfig.ts`, with no copies in the HUD.

### Existing Modules

- `GameEngine.ts`: facade, validation, snapshot copying, selection, and event queue.
- `turns/TurnSystem.ts`: eligibility, alternating individual activations, rounds, cooldowns, and battle end; does not yet have a fixed-order cursor.
- `grid/GridSystem.ts`: bounds, obstacles, living-unit occupancy, Manhattan distance, BFS, and LoS.
- `combat/CombatSystem.ts`: attacks, skill targets/areas, healing, and death.
- `ai/EnemyAI.ts`: single-step decision without mutating state.
- `entities/UnitFactory.ts`: constructs units from config.
- `BoardRenderer.ts`: board and highlight layers.
- `UnitRenderer.ts`: models, HP bars, animations, and living/dead sync.
- `HudManager.ts` and `InputManager.ts`: selection, commands, and presentation.

## Preserved Action Flow

1. Input/HUD requests an action on `IGameEngine`.
2. The engine validates before mutating. A rejected action returns `{ ok: false, reason }` with no events.
3. An accepted action mutates state immediately and appends facts to `GameEvent[]`.
4. `main.ts` consumes the events, enqueues animations, and syncs the snapshot; the UI locks controls during animations.
5. The UI drives AI via `executeNextEnemyAction()` while `turnState === 'enemy_activation'`, not by relying on the returned boolean alone.

The snapshot is a copy; events do not drive rules. `path` includes origin and destination. `obstacleDefs` carries type/LoS; `obstacles` mirrors positions for compatibility. Coordinates are column `x`, row `y`, both `0` through `gridSize - 1`; only rendering converts to 3D.

## Evidence-Based Diagnosis

### 1. Manual Ally Selection and Unfixed Order

- `TurnSystem.ts:8` and `:31–50`: starts/resets in `awaiting_player_choice`, active unit null until first action.
- `GameEngine.ts:67–82`: `selectUnit` accepts any living ally when unlocked.
- `GameEngine.ts:273–276`: lock begins on first valid action, not at start of turn.
- `TurnSystem.ts:70–90`: next team is chosen by eligibility; no `turnOrder/currentIndex` exists.
- `GameEngine.ts:190–192`: enemy chosen is the first eligible entry in the unit list.
- `gameConfig.ts:224–235`: spawns group all heroes before enemies; not the required interleaved order.
- `InputManager.ts:168–171`, `:244–248`, and `HudManager.ts:193–195`: allow switching allies before locking, following the old contract.

This is not merely a visual bug: engine, contract, and UI agree with one another, just not with the V2.1 target. The fix must lock the active unit before the first click and validate active identity on every operational command/query. The current `canUnitActNow` check (`GameEngine.ts:254–259`) validates eligibility and lock, but not phase/team when unlocked; also review queries taking an explicit `unitId` during enemy turns and terminal states.

### 2. Death Without Team Differentiation

- `UnitRenderer.ts:126–141`: sync sets `root.visible = true` and lays every dead unit flat, regardless of team.
- `UnitRenderer.ts:239–245`: `unitDied` plays the same `die` animation for any unit.
- `HudManager.ts:200–206`: current labels are `Fallen`, `Active`, `Acted`, `Ready`; not the four requested states.

Visible dead enemies are explicit baseline behavior, not evidence of an incorrect `alive` flag in the engine. Dead allies already lie flat and lose their ring/HP bar; do not claim they always look identical to living units. The confirmed issue is the lack of a team-based visual policy and divergent activation naming/status labels. Readability under the real camera still requires visual QA.

Target: dead allies remain lying at their fall position without HP bar/ring/clickable hitbox; dead enemies disappear upon finishing the death animation and stay invisible on subsequent `syncUnits` calls. Both remain in `units` and in the original turn order for logical integrity, without blocking movement/LoS or receiving healing/attacks. Do not filter dead enemies out of engine state to solve presentation. Reset must restore pose, scale, visibility, HP, and hitboxes; initial sync of an already-dead snapshot must apply the same policy without depending on a recent `unitDied` event.

### 3. Missing Basic Attack Range Squares on Empty Cells

- `types.ts:168–172` and `GameEngine.ts:95–99`: `getAttackableTargets` returns units, not a region.
- `main.ts:113–127`: feeds `attackable` solely with existing targets' positions.
- `BoardRenderer.ts:4–11` and `:373–379`: draws that list; neither computes nor receives full range.

Hence the red material already exists; what is missing is the cell query and wiring that query to rendering. Do not solve this by duplicating Manhattan/LoS checks in the renderer.

## Target Contracts to Approve Before Coding

`shared/types.ts` is shared: t16 reviews and the coordinator approves; t18 integrates engine contract changes, t1b consumes them. Names below are explicit proposals, not already-available APIs.

### Scheduling and Selection

- Fixed order in configuration; `TurnScheduler` with `turnOrder`, `currentIndex`, `round`, `activeUnitId`, `hasMoved`, `hasAttacked`, per `turn-system.md`.
- Snapshot may expose copies of `turnOrder/currentIndex` if the UI needs them; never expose internal mutable arrays. Do not make that extension mandatory without approved need.
- `activeUnitId` is set from the opening of the activation. `activationLocked` is `true` throughout every allied activation. `awaiting_player_choice` ceases to be an operational state; removing it or keeping it only for compatibility requires coordinated updates to comments and consumers.
- `selectedUnitId` tracks the active unit for commands. Optional inspection must stay separate and never authorize actions for the inspected unit.
- `activationStarted` now fires at turn start, including match start/reset, rather than on the first action. Avoid duplicate emissions in `endPlayerTurn` and `ensurePlayerActivationStarted`.

### Range Queries and `GRID_HIGHLIGHTS`

Proposal: `getAttackRangeCells(unitId?: string): GridCoord[]` on `IGameEngine`, separate from `getAttackableTargets`.

Recommended contract for approval:

- Pure operational query, no mutation/events; omitted ID uses the active ally. Returns empty for nonexistent ID, dead unit, non-active unit, non-allied/terminal phase, or already-spent attack.
- Returns in-bounds cells distinct from origin with Manhattan distance 1 through `attackRange` and LoS when range > 1.
- Excludes obstacle cells, including low obstacles; low obstacles do not prevent highlighting cells beyond them. Does not require empty cells: allies, enemies, and corpses may occupy cells in the region without automatically becoming valid targets.
- `getAttackableTargets` continues filtering attackable living enemies. Preserve the distinction between informative region and attack authorization.
- Skills continue using `getSkillTargetCells` and `getSkillAreaCells`; do not replace their semantics with basic attack range.

`GRID_HIGHLIGHTS` does not yet exist in the baseline: it is a proposed centralized visual config in `gameConfig.ts` holding colors/opacities for movement, attack range, attackable target, skill, heal, area, and hover. Do not store Three.js/DOM objects in config. `BoardHighlights` should receive a range-cell field separate from `attackable`; `main.ts` queries the engine and passes both. Visual proposal: subtle range beneath attackable target, skill/area, and hover with explicit priority and no Z-fighting; final colors are t1b's responsibility.

When switching modes, active unit, round, reset, or finishing animations, clear stale highlights and recompute via query. Never let the previous unit's region enable clicks.

### UI States

Derive from snapshot in this exact priority, with no new writable HUD state:

| Status | Rule |
|---|---|
| `DEFEATED` | `!unit.alive`, regardless of prior flags |
| `ACTING` | Living unit whose ID is `activeUnitId` |
| `DONE` | Living, not active, and `hasActivatedThisRound` |
| `WAITING` | Living, not active, and not yet processed this round |

Apply to heroes and the enemy list where pertinent. Battle end state is separate from these labels. Buttons depend on active unit, flags, cooldown, phase, and animation lock, never solely on selection/eligibility. Clicking another ally never changes who acts.

### Preserved Events

Keep `unitMoved`, `skillUsed`, `unitAttacked`, `unitHealed`, `unitDied`, `activationStarted`, `activationEnded`, `roundStarted`, `turnChanged`, `battleEnded`, `gameReset`. Fatal damage emits attack then death; the killing blow ends in `battleEnded` before any turn advance. Skipped dead units emit no activation. Consecutive enemies need `activationStarted` even without a `phase` change.

## Migration and Verification

1. Approve contract differences and custom scenario policy without inferring turn order from clicks.
2. t18 implements config/scheduler and tests, then range queries and their validation.
3. t1b adapts input, HUD, visual death, `BoardHighlights`, and composition in `main.ts`; `main.ts` integration has a single owner.
4. t16 reviews active identity, sources of truth, events, layer boundaries, and death/wrap edge cases.
5. t1c reconciles documentation with verified delivery, including version discrepancies in out-of-scope files with authorization.

Baseline run during this analysis: `npm run typecheck` passed; `npm test` passed with 113 tests across 4 files. That validates the baseline, not the new requirements: current tests even assert free selection (`tests/engine.test.ts:83`) and must be migrated to fixed-order equivalents. On final verification, with concurrent edits in `src`/`tests`, typecheck passed, while the suite returned 101 passed and 12 failures in `engine.test.ts` involving old expectations for initial state, selection, and events. Those files themselves changed during execution; fresh integrated validation by t18/t16 is required once stabilized. This agent edited only the three documents. No browser QA was run in this documentation task. The directory is not a Git repository, so no local Git diff/status is available.

Assets remain in `public/assets/`, referenced via portraits/icons in config. No new assets are required for this migration; art rules remain in `art-direction.md` and logs in `asset-generation.md`.

# V2.2 (Interface): Orbital Camera, Selection Under Characters, and Facing

## Scope and Status

This section is a diagnosis and technical design; none of it is implemented yet. It was written from reading `SceneManager.ts`, `InputManager.ts`, `UnitRenderer.ts`, `BoardRenderer.ts`, and `main.ts`, without running the game in a browser. Cited line numbers apply to the files at read time.

All three goals are interface-only. The engine (`src/game/`), contracts (`src/shared/types.ts`), and config do not change, so engine tests are unaffected. The task plan is in `implementation-plan.md`.

| Goal | Affected Files |
|---|---|
| 1. 360° horizontal camera rotation via right-click + drag | `SceneManager.ts`, `InputManager.ts`, `BoardRenderer.ts`, `main.ts` |
| 2. Select free cells occluded by characters without passing through solid obstacles | `InputManager.ts`, `BoardRenderer.ts` |
| 3. Allies face the nearest living enemy after moving | `UnitRenderer.ts` |

## Goal 1: Camera Rotation

### Diagnosis

- **The camera is fixed.** `SceneManager.ts:33-34` places the orthographic camera at `(17, 18.5, 17)` looking at `(0, 0.25, 0)` and never moves it again. That equals a 45° azimuth, ~37° elevation, and horizontal distance `17·√2 ≈ 24`. No orbit state exists.
- **Right-click already has a binding.** `InputManager.ts:59-66` handles `contextmenu` as "cancel attack or skill mode". `onPointerDown` ignores any button other than left-click (`:184`). Currently, a right-click drag triggers cancellation on release.
- **Scenery was built for a single angle.** `BoardRenderer.ts:233-246` builds perimeter walls up to height 1.8 on the `-x` and `-z` sides, with a comment saying they sit "behind the board". When the camera moves to the opposite side, they move in front and cover the front rows. Torch posts (`:252-275`, height 1.35) have the same issue at corners.
- **The perimeter is excluded from raycasting.** `pickTarget` (`InputManager.ts:89-93`) only checks unit hitboxes, internal obstacles, and tiles. A perimeter wall covering the board would let clicks pass straight through it.
- **What already follows the camera unchanged:** HP bars re-project every frame (`UnitRenderer.ts:717-742`); raycasting uses the passed camera; lights, shadows, highlights, paths, and animations live in world space. The orthographic frustum (`frustumSize = 17.5`) fits the board at any azimuth because the widest span is the 12-cell diagonal, ~17.

### Design

- **Orbit state in `SceneManager`.** Store `azimuth` in radians and derive position: `x = R·sin(azimuth)`, `z = R·cos(azimuth)`, `y = 18.5`, with `R = 17·√2`, followed by `lookAt` on the same target. Initial value `π/4` reproduces the current view. Elevation and distance stay constant: rotation is horizontal only.
- **API:** `rotateAzimuth(deltaRad)` and `get azimuth`. The angle normalizes into `[0, 2π)` without clamping, giving continuous 360° orbit. After moving the camera, call `camera.updateMatrixWorld()` so any raycast before the next frame never uses a stale matrix.
- **Gesture in `InputManager`.** Right button down starts a drag candidate. Once past a few-pixel threshold, it becomes rotation: each `pointermove` converts horizontal delta into an angle and invokes a new callback, `onRotateCamera(deltaRad)`. Releasing without exceeding the threshold preserves the current mode-cancel behavior. `contextmenu` keeps `preventDefault`, but stops canceling the mode: mode cancellation moves to `pointerup` on a stationary click.
- **Pointer capture.** Use `setPointerCapture` on drag start and release on `pointerup`, `pointercancel`, and `lostpointercapture` so rotation never gets stuck when the cursor crosses the HUD or leaves the window.
- **Rotation is turn-independent.** It is purely visual, so it works during enemy turns and animations. Drag handling runs before `isInputBlocked()`. While dragging, hover and click are suspended and hover highlights clear.
- **Who moves the camera.** `InputManager` never mutates the camera: it emits the callback, and `main.ts` wires it to `sceneManager.rotateAzimuth`. The camera continues to be passed to `InputManager` solely for raycasting.
- **Perimeter.** `BoardRenderer` gains `setCameraAzimuth(azimuth)`, hiding tall perimeter pieces (walls and posts) on the camera's side and showing those on the far side. Thus they never cover the board and need not enter raycasting. `main.ts` calls this after each rotation and once at startup.
- **View state, not game state.** Azimuth never enters the engine or snapshot, and `reset()` does not alter it.

### Pure and Testable Logic

Orbit math (angle normalization, position from azimuth, pixels to radians) and the "click vs. drag" decision need neither Three.js nor the DOM. They belong in a dedicated module without those imports, e.g., `src/rendering/cameraOrbit.ts`, tested in Node.

## Goal 2: Selecting Occluded Cells

### Diagnosis

- **The first hit decides everything.** `pickTarget` casts a ray against hitboxes, obstacles, and tiles and reads only `hits[0]` (`InputManager.ts:94-99`). If the first hit is a hitbox, the result is that unit and its cell (`:101-107`).
- **Hitboxes cover cells behind them.** Each hitbox is `0.75 × 1.25 × 0.75` (`UnitRenderer.ts:768-772`). With a 37° camera elevation, a 1.25-tall box covers roughly 1.6 floor cells behind the unit on screen. Those cells cannot be picked as move targets, and the problem worsens as units cluster.
- **Obstacles already block clicks, but by omission.** Obstacle meshes are in the target list (`BoardRenderer.ts:374`) without `userData`. When one is the first hit, `pickTarget` finds neither unit nor cell and returns null (`:114`). The behavior is right, only it relies on an absent field.
- **Corpses don't interfere.** `getUnitHitboxes` only returns living, visible units (`UnitRenderer.ts:376-384`).

### Design

The raycaster already returns all intersections sorted by distance. The change is iterating the list instead of stopping at the first item:

1. Walk hits from nearest to farthest.
2. The first hitbox encountered becomes the **candidate unit**. Subsequent hitboxes are ignored.
3. The first tile encountered becomes the **ground cell** and stops the walk.
4. Any obstacle immediately stops the walk. Everything behind it is unselectable.

The output is a `(candidateUnit, groundCell)` pair, either of which may be absent. Choosing between them depends on mode and uses only the queries `InputManager` already makes on the engine:

| Mode | Preference |
|---|---|
| `attack` | Candidate unit if attackable target; otherwise nothing |
| `skill` | Candidate unit's cell if valid skill target; else ground cell if valid target |
| `default` | Candidate unit if attackable target; else ground cell if reachable; else candidate unit for hover/inspection |

Additional rules:

- **Hover and click share the same resolver.** The cursor highlight always matches what clicking will choose.
- **Every internal obstacle blocks selection**, including crates and barrels: they are visually solid even if they don't block rule LoS. Meshes receive an explicit `userData` tag (e.g., `kind: 'obstacle'`), with equivalent tags on hitboxes and tiles.
- **Known ambiguity.** In `default` mode, if the unit under the cursor is attackable and the cell behind it is reachable, the unit wins. To pick the cell, the player orbits the camera (Goal 1). If QA shows this feels awkward, the refinement is deciding by hit height on the hitbox; that is outside this delivery.
- **No game rules in UI.** The resolver compares IDs and cells against engine lists (`getAttackableTargets`, `getReachableCells`, `getSkillTargetCells`). It never calculates range, paths, or line of sight.

### Pure and Testable Logic

The resolver takes an already-classified list of hits (`unit`, `tile`, `obstacle`) and mode context, and returns the pick. It needs no Three.js: converting `THREE.Intersection` into that list stays in `InputManager`, and the resolver moves to a dedicated module, e.g., `src/input/pickResolver.ts`, tested in Node.

## Goal 3: Ally Facing

### Diagnosis

- **No facing state exists.** Neither `UnitState` nor `UnitVisual` stores where a unit is looking.
- **Facing only exists during animations.** Movement rotates the body along each step (`UnitRenderer.ts:417`) and attacks rotate the attacker toward its target (`:428`, `:472`, `:520`).
- **Every sync wipes it.** `syncUnits` resets rotation on every non-animating living unit (`UnitRenderer.ts:133`), and is called after every action and at the end of every animation queue (`:631-635`). Thus units always snap back to the default pose.
- **The default pose faces `+Z`**, which is the south side of the board. Heroes spawn in the south, so they start with their backs to the enemies.

### Design

- **Facing is presentation.** No rule depends on it (no backstab mechanic), so it lives in the renderer: `UnitVisual` gains `facingY`. The engine contract does not change.
- **`syncUnits` applies `facingY`** instead of resetting rotation to zero. This fixes orientation loss for all units.
- **Every body-turning animation updates `facingY`.** That way units keep facing where they walked or who they attacked.
- **After moving, an ally turns to face the nearest living enemy.** At the end of a player unit's move animation, the renderer computes the target from the latest snapshot and rotates the body along the shortest arc in a short transition.
- **"Nearest" criteria:** grid Manhattan distance, matching rules; on ties, shortest Euclidean distance; if still tied, unit list order. The result is deterministic.
- **Angle:** with `dx = target.x - unit.x` and `dy = target.y - unit.y` in cells, `facingY = atan2(dx, -dy)`. The sign of `dy` is inverted because grid rows increase along `-Z` (`BoardRenderer.gridToWorld`).
- **With no living enemy**, current facing is preserved.
- **Enemies** do not auto-reorient: they keep the direction of their last step or attack, which naturally follows from storing `facingY`.
- **Corpses** keep their current lying pose. **`gameReset`** resets `facingY` to its initial value.
- **Camera-independent.** Facing is in world coordinates and does not change with azimuth.

### Open Decision

The request covers facing after moving. It is up to the coordinator whether allies also spawn facing the nearest enemy; without that, they start battle facing away until their first move. Recommendation: apply the same helper during visual creation.

### Pure and Testable Logic

Picking the nearest enemy and computing the angle use only `UnitState` and arithmetic. They belong in a Three.js-free module, e.g., `src/rendering/facing.ts`, tested in Node.

## Layer Boundaries in V2.2

- `SceneManager` is the only class that moves the camera. `InputManager` detects the gesture and emits a callback.
- `InputManager` does not import `src/game/`. Selection compares ray hits against engine responses.
- The "nearest enemy" criterion for facing is cosmetic and may stay in the renderer. If any future rule depends on facing, it moves into the engine and contract.
- The three new pure modules neither import Three.js nor access the DOM so they can be tested in Node alongside the engine.

# V2.3: Seven Combat, UI, and Map Improvements

## Scope and Status

This section is diagnosis and design. Only the contracts in `src/shared/types.ts` have been updated so far; `src/game/`, `src/rendering/`, `src/ui/`, `src/input/`, `src/config/`, and `tests/` have not. Consequently `npm run typecheck` currently reports that `GameEngine` does not implement the new methods and fields; that error disappears once the engine is updated. Diagnosis is from code reading without running in a browser.

| # | Improvement | Layers |
|---|---|---|
| 1 | Arcane Burst with single projectile and central explosion | rendering |
| 2 | `E` shortcut to end turn | HUD |
| 3 | 1.0 opacity on active unit and 0.75 on other living units | rendering, `main.ts` |
| 4 | Smart attack with shortest move | contract, engine, input, highlights |
| 5 | Undo move, once per activation | contract, engine, HUD, rendering |
| 6 | Seeded randomized starting positions in first two rows | contract, config, engine |
| 7 | Three maps, picked without repeating the previous one | contract, config, engine, `main.ts`, HUD |

## Added Contracts

Everything is in `src/shared/types.ts`, with details in each item's doc comments.

| Item | What It Is |
|---|---|
| `MapConfig` | `id`, `name`, `gridSize`, `obstacles`, `playerSpawnRows`, `enemySpawnRows` |
| `SmartActionPlan` | `{ path }`: what smart attack or smart skill would do right now |
| `GameStateSnapshot.mapId`, `mapName` | Map picked for the battle |
| `GameStateSnapshot.seed` | Seed that generated the map and starting positions |
| `GameStateSnapshot.canUndoMove` | Whether `undoMove()` would be accepted right now |
| `moveUndone` event | `{ unitId, path }`, with `path` from current cell back to origin |
| `undoMove()` | Undoes the activation's movement |
| `smartAttack(targetId)` | Attacks; if needed, walks first along the shortest path |
| `smartUseSkill(targetCell)` | Same for skill |
| `getSmartAttackPlan(targetId)`, `getSmartSkillPlan(targetCell)` | Pure queries for the UI to preview the plan before clicking |

Three items go beyond the original request and await coordinator confirmation: `seed` on snapshot, `SmartActionPlan`, and the two plan queries. Without the queries, the UI would have to recalculate range and paths to draw previews, which layer rules forbid.

The `reset()` comment also changed: it now rolls another map, so the UI must rebuild the board.

## 1. Arcane Burst: One Projectile and One Explosion

### Diagnosis

The engine is correct. `resolveSkill` (`CombatSystem.ts:109`) emits one `skillUsed` with the target cell, followed by one `unitAttacked` per hit enemy, each with `isRanged: true` and `skillId: 'arcane-burst'`.

The bug is in `UnitRenderer.enqueueEvents`, which turns every event into a standalone animation in arrival order:

- **`skillUsed` becomes the explosion, and it plays first** (`UnitRenderer.ts:184-197`). The `skillVfx` animation draws the ring and orb on the target cell before any projectile leaves the mage.
- **Each `unitAttacked` becomes its own projectile** (`:198-222`). Because the event has `isRanged`, a `rangedAttack` from mage to that enemy gets queued. `skillId` is only used to pick color.
- **The queue plays one animation at a time.** With three enemies in the area, the player sees the explosion at center and then three sequential projectiles, each applying damage to its target.

Expected behavior is the reverse: one projectile from mage to center, explosion on impact, and damage applied to all hit targets simultaneously. Marked Shot suffers the same inversion to a lesser degree: the reticle appears on the target before the arrow leaves.

### Design

- **Group skill events before queuing.** Upon seeing `skillUsed`, the renderer consumes following `unitAttacked` events matching `skillId` and `attackerId === casterId`, building one composite animation.
- **Composite animation for ranged skills:** projectile from caster to `targetCell`; on impact, skill VFX (Arcane Burst cross explosion, Marked Shot reticle); at that exact instant, hit reactions and HP bar updates for all affected targets.
- **Melee skills** (Runic Strike, `isRanged` false) keep the current melee strike animation.
- **Deaths come afterward.** Interleaved `unitDied` events enter the queue only after the composite animation, in received order.
- **HP bars.** `isPendingAttackTarget` must recognize the composite animation so hit targets' HP bars do not drop before impact.
- **Engine guarantee relied upon:** events of a skill are contiguous and arrive in the same `consumeEvents()` batch. This already holds because `useSkill` is synchronous, and becomes part of the contract.

Grouping needs no Three.js: it takes `GameEvent[]` and returns animation descriptors. It goes into a dedicated module, e.g., `src/rendering/eventGrouping.ts`, tested in Node.

## 2. `E` Shortcut

- **Current state:** the button says "End Turn" (`HudManager.ts:107`) and only listens for clicks (`:150`). There is no keyboard listener in the project.
- **Design:** `HudManager` registers a `keydown` listener on `window` and invokes the same `callbacks.onEndTurn()` as clicking. Existing locks still apply: animation lock in `main.ts:45-46` and engine rejection outside the player's turn.
- **When ignored:** button disabled, result modal open, `event.repeat`, Ctrl/Alt/Meta held, or focus in a text input.
- **Key:** compare `event.key.toLowerCase()` against `'e'` to respect keyboard layouts.
- **Label:** `"End Turn (E)"` with `aria-keyshortcuts="E"`. Remove the listener in `dispose()`.

## 3. Active Unit Opacity

- **Current state:** body materials are opaque. Each unit creates its own (`UnitRenderer.ts`, `build*` functions), so opacity can vary per unit. `syncUnits` receives the selected unit, not the active one; during enemy turns selection is null.
- **Rule:**

| Situation | Body Opacity |
|---|---|
| Living unit with open activation (`activeUnitId`) | 1.0 |
| Other living units on both teams | 0.75 |
| Battle ended, no active unit | 1.0 for all living units |
| Corpses | Unchanged |

- **Design:** `syncUnits` now takes `activeUnitId`. Each `UnitVisual` stores its list of body materials collected at creation. When setting opacity, update `transparent` and `opacity`, and flag `needsUpdate` whenever `transparent` changes. Base ring and HP bar do not change.
- **Both values live in named constants** in one place.
- **Visual risk:** translucent materials reveal the floor and interior model parts and enter transparent draw sorting. Keeping `depthWrite` enabled mitigates this, but it needs browser verification across multiple camera angles.

## 4. Smart Attack

### Rule, Implemented Solely in the Engine

1. All `attackTarget` rejections apply: not player's turn, unit already attacked, target missing, dead, or allied.
2. If the target is already attackable from the unit's current cell, attack. Movement is not spent.
3. Else, if the unit has already moved, reject.
4. Else, among reachable cells in this activation, keep those from which the attack is valid: within range and, for range > 1, with line of sight.
5. Pick the one with lowest movement cost. On ties, lowest Manhattan distance to target. If still tied, lowest `y` then lowest `x`.
6. No candidate: reject. With candidate: unit moves and attacks: `unitMoved`, `unitAttacked`, and if applicable `unitDied`.
7. Post-action check runs once at the end. With both move and attack spent, the activation auto-ends unless the blow wins the battle.

The action is atomic: either both move and attack happen, or nothing changes and zero events emit. Movement cost equals shortest path step count since every step costs 1.

`smartUseSkill` follows the exact same sequence, replacing "attack is valid" with "`targetCell` is a valid skill target from that cell" and measuring distance to `targetCell`. To support this, skill target validation in `CombatSystem` must accept a caster position parameter rather than reading `caster.pos`.

### Interface

- **Click.** In default and attack modes, clicking an enemy calls `smartAttack`. In skill mode, clicking a cell calls `smartUseSkill`.
- **Mandatory preview.** Smart attack moves and attacks in one click, with no take-backs. On hover, the UI queries `getSmartAttackPlan` or `getSmartSkillPlan` and draws the path and destination cell before clicking.
- **Highlight.** An enemy only attackable after moving gets a distinct highlight from one attackable in place. That list comes from calling `getSmartAttackPlan` for each living enemy.
- **No rules in UI.** `InputManager` never chooses the cell or computes paths.

## 5. Undo Move

- **The engine stores the last manual move** of the activation: unit, origin cell, and path. This record clears on attack, skill use, activation end, and `reset()`.
- **`undoMove()`** returns the unit to origin, sets `hasMoved` to `false`, and emits `moveUndone` with the return path. It does not end the activation or alter anything else.
- **Once per activation.** After undoing, the unit can move again, but that second move is final.
- **When disallowed:** outside player's turn; no move made; after attacking or using a skill; when movement came from `smartAttack` or `smartUseSkill`; when undo was already used. `canUndoMove` on snapshot summarizes these conditions.
- **Why it is safe:** moving reveals no hidden information, triggers no RNG, and provokes no enemy reaction, so taking a step back grants no unfair edge.
- **Attacking then moving** ends the activation immediately, so there is nothing to undo in that order.
- **UI:** an "Undo Move" button, enabled when `canUndoMove` is true and no animation is playing. `moveUndone` animates as a walk along the returned path, and the unit reorients afterward just like after any move.

## 6. Seeded Randomized Starting Positions

- **Current state:** `INITIAL_UNITS` in `gameConfig.ts` hardcodes every unit's position.
- **Design:** the unit list carries only id, type, and team. Each map declares `playerSpawnRows` and `enemySpawnRows`: the two southern rows for heroes and two northern rows for enemies.
- **Rolling:** for each unit in list order, the engine picks a random free cell from its team's rows. Free means no obstacle and not already taken.
- **Seed.** All engine randomness comes from a seeded PRNG in a dedicated `src/game/` module. The same seed yields the same map and positions. When no seed is provided, the engine generates one; that is the sole point using a non-deterministic source.
- **PRNG consumption order:** map first, then heroes in list order, then enemies in list order. Changing this order changes the output of a seed, so it is part of the contract.
- **Reset.** The PRNG continues from where it left off. A fixed initial seed always yields the same sequence of battles, which tests rely on.
- **Test scenarios.** A scenario passing explicit positions bypasses random spawns. Existing tests setting up exact board states keep working.
- **Turn order does not change:** it depends on unit IDs, not positions.

## 7. Three Maps

- **Config:** `MAPS: MapConfig[]` in `gameConfig.ts`, containing "Current Ruins" (today's obstacles), "Abandoned Fortress", and "Ruined Courtyard". Proposed layouts are in `game-design.md`.
- **Constraints on every map**, verified by test: 12×12 grid; obstacle-free spawn rows; all free cells connected; no duplicate obstacles.
- **Grid stays 12×12 across all three.** Camera framing, torches, and perimeter in `SceneManager` and `BoardRenderer` were sized for 12×12. `MapConfig.gridSize` exists for future expansion.
- **Non-repeating roll:** on each new battle, the engine rolls among maps different from the previous one. On the first battle, any map works.
- **Across page reloads**, the engine forgets the previous map. If the coordinator wants that guarantee across reloads too, `main.ts` stores the last `mapId` in browser storage and passes it on engine creation. Left as an open decision.
- **UI:** `main.ts` currently builds the board once (`main.ts:203`) and never rebuilds on reset (`main.ts:55-60`). With randomized maps, it must call `buildBoard` again on `gameReset`. `buildBoard` already removes old meshes, but does not dispose geometries and materials; that must be fixed to avoid leaking memory on every reset.
- **HUD:** displays `mapName`.

## Layer Boundaries in V2.3

- Choosing the smart-attack cell, undo validity, map selection, and spawn rolling are rules: they live in `src/game/`.
- The engine never uses `Math.random` in rules. All rolls go through the seeded PRNG.
- The UI renders previews from plan queries. It never computes range, paths, or line of sight.
- Skill event grouping and opacity rules are presentation: they live in the renderer.
- Keyboard shortcuts invoke the same path as buttons, preventing duplicate locks.

---

# V4: Campaign, Attributes, Defend, and New Enemies

## Scope and Architectural Guidelines

V4 (*The Ashen Campaign*) builds on the stable V3 base while fully preserving:
- Strict layer separation (`src/shared/`, `src/config/`, `src/game/` never import Three.js or access the DOM; `src/rendering/`, `src/input/`, `src/ui/` communicate solely via `IGameEngine` and `src/shared/types.ts` contracts).
- Fixed interleaved activation order (`TurnSystem`), 12×12 grid, line of sight (`GridSystem`), `smartAttack`, `smartUseSkill`, `undoMove`, orbital camera, and V3 visual identity.
- Single source of truth for match numbers in `src/config/gameConfig.ts`.

Detailed rule specifications live in the companion documents:
- [attribute-system.md](attribute-system.md)
- [combat-system.md](combat-system.md)
- [campaign-design.md](campaign-design.md)
- [enemy-design.md](enemy-design.md)
- [balance-config.md](balance-config.md)

## New Modules in `src/game/`

All new modules remain pure (no Three.js, no `window`/`document`), directly testable in Node via Vitest:

| Module | Responsibility |
|---|---|
| `src/game/attributes/AttributeSystem.ts` | Pure attribute functions: `offensiveBonus`, `calcMaxHp`, `fortitudeResistance`, `getAttributeForAttack`, `applyAttributePoint` (including `fort` upgrade rule), and validation against `MAX_ATTRIBUTE`. |
| `src/game/campaign/CampaignSystem.ts` | 5-stage campaign state machine: campaign initialization, per-stage `GameSetup` generation (including persisted hero HP/attributes), post-victory capture, recovery (`+35%` living / `25%` revive), point granting and allocation, checkpoint restoration, and stage advancement. |
| `src/game/campaign/SaveSystem.ts` | Serialization, deserialization, versioned schema validation (`version: 4`, key `'rune_tactics_v4_save'`), and persistence via an injectable `StorageAdapter` (no direct DOM access in `src/game/`). |

> **Separation between battle and campaign**: `GameEngine` remains solely responsible for a single tactical battle (`IGameEngine`), receiving stage context (`mode`, `stageNumber`, `stageName`, `mapId`, hero/attribute/HP overrides, and `enemies`) via `GameSetup`. `CampaignSystem` orchestrates the 5-stage journey and instantiates/resets `GameEngine` for each stage. `src/main.ts` wires `window.localStorage` into the `StorageAdapter` passed to `SaveSystem`.

## Contracts in `src/shared/types.ts`

### 1. Basic Types and Unions

```ts
export type AttributeKey = 'str' | 'dex' | 'int' | 'fort';
export type UnitAttributes = Record<AttributeKey, number>;
export type AttackKind = 'melee' | 'ranged' | 'magic';
export type GameMode = 'quick-battle' | 'campaign';

export type UnitType =
  | 'knight'
  | 'archer'
  | 'mage'
  | 'cleric'
  | 'melee-skeleton'
  | 'skeleton-archer'
  | 'armored-skeleton'
  | 'goblin-scout'
  | 'cultist-mage'
  | 'goblin-stalker'
  | 'skeleton-shieldbearer'
  | 'necromancer-acolyte'
  | 'ashen-guardian';

export type SkillId =
  | 'runic-strike'
  | 'marked-shot'
  | 'arcane-burst'
  | 'healing-light'
  | 'dark-mend';

export type ObstacleKind = 'wall' | 'pillar' | 'crate' | 'barrel' | 'water';
```

- `water` has `blocksLos: false` (blocks movement, does not block line of sight).
- `MapConfig` adds purely visual optional fields: `theme?: 'ruins' | 'swamp' | 'fortress' | 'catacombs' | 'sanctuary'` and `bridgeCells?: GridCoord[]`.

### 2. `UnitState` Extensions

Added/unified fields on `UnitState`:

```ts
export interface UnitState {
  // ...preserved V2.3/V3 fields...
  attributes: UnitAttributes;
  baseHp: number;
  baseArmor: number;
  basePower: number;
  attackKind: AttackKind;
  /** Effective basic attack power (`basePower + offensiveBonus(mainAttr)`), derived for HUD/queries. */
  damage: number;
  /** Effective defense (`baseArmor + fortitudeResistance(attributes.fort)`), derived for HUD/queries. */
  armor: number;
  /** Defensive stance providing 50% mitigation until the unit's next activation. */
  isGuarding: boolean;
  /** Current phase for multi-phase boss units (`1` > 50% HP, `2` <= 50% HP irreversible). */
  bossPhase?: 1 | 2;
}
```

- **Unifying `defend()`**: legacy `shield: number` and `shieldAbsorbed?: number` are removed (along with `GUARD_SHIELD` and `SHIELD_WALL_BONUS` in `gameConfig.ts`). Defensive stance is represented solely by `isGuarding: boolean`, and `unitGuarded` simplifies to `{ type: 'unitGuarded'; unitId: string }`. `unitAttacked` receives optional `wasGuarded?: boolean` and `pendingAttackId?: string`.

### 3. Telegraphed Attacks (`PendingAttack`) and Snapshot

```ts
export interface PendingAttack {
  id: string;
  casterId: string;
  skillName: string;
  targetCells: GridCoord[];
  basePower: number;
  attackKind: AttackKind;
  preparedRound: number;
}
```

`GameStateSnapshot` now includes:
- `mode: GameMode`
- `stageNumber?: number`
- `stageName?: string`
- `pendingAttacks: PendingAttack[]` (deep copy of arrays/coordinates)

### 4. New `GameEvent` Variants

```ts
| { type: 'unitGuarded'; unitId: string }
| { type: 'attackPrepared'; pendingAttack: PendingAttack }
| {
    type: 'pendingAttackResolved';
    pendingAttackId: string;
    casterId: string;
    skillName: string;
    targetCells: GridCoord[];
    affectedUnitIds: string[];
  }
| { type: 'attackCancelled'; pendingAttackId: string; casterId: string; reason: 'caster_died' }
| { type: 'bossPhaseChanged'; unitId: string; phase: 2; newMoveRange: number }
```

V4 event invariants:
- Upon starting `nextUnit`'s activation in `TurnSystem.advanceTurn` (or immediately afterward in `GameEngine`), `nextUnit.isGuarding` is cleared before emitting `activationStarted`, and any `PendingAttack` belonging to `nextUnit.id` resolves immediately if `nextUnit.alive === true`, emitting `pendingAttackResolved` → `unitAttacked[]` → `unitDied[]` contiguously in the same batch before `checkBattleEnd`.
- If a unit with a `PendingAttack` dies before its next activation, the engine cancels its pending attacks immediately after `unitDied`, emitting `attackCancelled`.
- The boss transition to `bossPhase = 2` emits `bossPhaseChanged` at most once per battle and restores zero HP.

### 5. Campaign and Persistence Contracts (`src/shared/types.ts`)

```ts
export interface StageUnitSpawn {
  id: string;
  type: UnitType;
  pos: GridCoord;
}

export interface StageConfig {
  stageNumber: number;
  id: string;
  name: string;
  subtitle: string;
  mapId: string;
  isBossStage: boolean;
  heroSpawns: StageUnitSpawn[];
  enemies: StageUnitSpawn[];
}

export interface CampaignHeroProgress {
  id: string;
  type: 'knight' | 'archer' | 'mage' | 'cleric';
  attributes: UnitAttributes;
  hp: number;
  maxHp: number;
  unspentPoints: number;
}

export interface CampaignCheckpoint {
  stageNumber: number;
  heroes: CampaignHeroProgress[];
}

export type CampaignStatus = 'in_stage' | 'between_stages' | 'completed';

export interface CampaignState {
  version: 4;
  status: CampaignStatus;
  currentStage: number; // 1..5
  heroes: CampaignHeroProgress[];
  checkpoint: CampaignCheckpoint;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

## Impact on Presentation Layers

- **`BoardRenderer.ts`**:
  - New `'water'` obstacle (recessed translucent swamp plane) and optional rendering of `bridgeCells` (wooden bridge planks) for `forgotten-swamp`.
  - Dark/ember atmosphere for `corrupted-sanctuary`.
  - New `dangerCells` highlight layer (`pendingAttacks`) in pulsing red/amber on the board, indicating cells threatened by telegraphed attacks.
- **`CharacterVisualController.ts` & `UnitRenderer.ts`**:
  - Added the 4 new `UnitType` values to `MODEL_SPECS` reusing KayKit `.glb` models with distinct `targetHeight` and `tintHex`/`tintStrength` (per `docs/enemy-design.md`).
  - Defensive aura tied to `unit.alive && unit.isGuarding` (replacing `unit.shield > 0`).
  - Visual grouping for `pendingAttackResolved` (ashen explosion covering all `targetCells` simultaneously) and ember aura VFX on `bossPhaseChanged`.
- **`HudManager.ts` & `main.ts`**:
  - Start screen / mode selector (**Campaign** — New / Continue — vs. **Quick Battle**).
  - Attribute readout (`STR`, `DEX`, `INT`, `FORT`, `DEF`) on the unit card, stage indicator (`Stage X/5 — Name`), and `Defending (-50%)` badge.
  - **Camp & Evolution** modal/screen between stages (recovery + point allocation with impact preview).
  - **Defeat** modal with **"Restart Stage (Checkpoint)"** and **"New Campaign"** buttons in Campaign mode, keeping **"Play Again"** in Quick Battle.
