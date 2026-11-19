# Turn System — V2.1 Specification

## Status and Precedence

This document specifies the target behavior requested in the V2.1 brief, not a completed implementation. The diagnosis refers to the initial code reading; other agents modified `src`/`tests` during this task, requiring post-integration reconciliation. Inspection found individual activations with manual choice before the first action already implemented in `TurnSystem` and `GameEngine`. The older note stating that the whole team still acted together was outdated.

`AGENTS.md` and `game-design.md` refer to the current baseline as V2.2 and describe free selection and corpses for both teams. The V2.1 brief requires fixed order and visual disappearance of enemies. For this migration, the requirements below are the explicit target; numbering does not indicate implementation status. Other documents were not altered outside scope.

## Fixed Pre-Match Order

The default sequence is defined in configuration before starting/resetting a battle, never by click order, speed, proximity, or re-sorting after deaths:

| Slot | Unit | ID |
|---|---|---|
| 1 | Knight | `knight-1` |
| 2 | Goblin Scout | `goblin-scout-1` |
| 3 | Archer | `archer-1` |
| 4 | Melee Skeleton 1 | `melee-skeleton-1` |
| 5 | Mage | `mage-1` |
| 6 | Melee Skeleton 2 | `melee-skeleton-2` |
| 7 | Cleric | `cleric-1` |
| 8 | Armored Skeleton | `armored-skeleton-1` |
| 9 | Skeleton Archer | `skeleton-archer-1` |
| 10 | Cultist Mage | `cultist-mage-1` |

Interleaved does not mean strict team alternation: slots 8–10 are consecutive enemies. Do not use the raw order of `INITIAL_UNITS`, which groups all four heroes before enemies. Keep the sequence in `gameConfig.ts` as the single source of truth, with a coordinator-approved contract.

## TurnScheduler Structure (proposed, not currently exported)

| Field | Type | Invariant |
|---|---|---|
| `turnOrder` | `string[]` | Copy of the initial order, stable throughout the match |
| `currentIndex` | `number` | Index into the original list, not into a filtered living-only list |
| `round` | `number` | Starts at 1; increments once per full traversal |
| `activeUnitId` | `string \| null` | Living ID at `turnOrder[currentIndex]`, or `null` in terminal states |
| `hasMoved` | `boolean` | Movement consumed by the active unit |
| `hasAttacked` | `boolean` | Basic attack OR skill consumed by the active unit |

`TurnScheduler` is a responsibility model; it can be implemented inside `TurnSystem` without requiring an extra file/class. Flags already exist on `UnitState`: do not create two writable sources of truth. Scheduler fields should reflect the active unit's state via derived accessors, or be atomically synchronized under a single approved authority. `hasActivatedThisRound` remains useful for the HUD and tests, but it does not pick the next ID.

### Start, Commands, and Selection

1. Validate unique IDs, entry existence, and full coverage of scenario units. Test scenarios with custom IDs need their own order defined before start; do not assume the ten default IDs.
2. Initialize round 1 and locate the first living entry; check for battle end before scheduling if a team is missing.
3. Lock `activeUnitId` immediately before the first action and emit `activationStarted` once. Allies enter `player_unit_active`; enemies enter `enemy_activation`. There is no playable `awaiting_player_choice` window.
4. Every move/attack/skill command must validate active unit identity inside the engine, not merely in mouse or HUD code. `selectedUnitId` does not grant action authority.
5. In the minimal option, `selectUnit` rejects other allies and `null` during an activation. Inspecting another ally is optional and can remain local HUD focus; it must never alter `activeUnitId`, index, flags, events, or command authority. If shared inspection selection is introduced, review the contract before implementing.
6. `endPlayerTurn()` ends only the current allied activation, even with no actions taken. Outside the allied phase it is rejected.
7. Invalid actions leave state unchanged, consume no flags, and emit no events.

`activationLocked` must hold from the very start of an allied activation, not only after the first action. `phase` and `activationTeam` derive from the scheduled unit; terminal states have `activeUnitId = null`.

## Automatic End of Activation: Scenarios A–E

| Scenario | Sequence | Flags after action | Result |
|---|---|---|---|
| A | move → attack | true / true | Automatically ends after the attack |
| B | attack → move | false / true, then true / true | Keeps same active unit after attack; ends after move |
| C | move only | true / false | Remains active until attack/skill or manual end |
| D | attack only | false / true | Remains active until move or manual end |
| E | no action → end | false / false | Valid pass; advances one eligible slot |

Skills, including `Healing Light`, consume `hasAttacked`. Do not auto-end on lack of attack targets or move destinations for the player: require manual end. AI with no valid actions ends its own activation to prevent deadlocks.

### Post-Action Checks and Events

1. Apply the action and its events (`unitMoved`, or `unitAttacked`/`unitDied`, or `skillUsed` and its effects).
2. Check victory/defeat first. The killing blow ends in `battleEnded`, with no new activation or round.
3. If the active unit died or `hasMoved && hasAttacked`, finish its activation once. Otherwise, keep ID and index.
4. On completion: mark `hasActivatedThisRound`, emit `activationEnded`, advance cursor, and skip dead units.
5. If traversal wrapped past the end of the list: increment round, reset actions/activation flags, and reduce living units' cooldowns by 1 (floor 0); emit `roundStarted` once.
6. Set next living unit and emit `activationStarted`. Keep `turnChanged` for team or round changes; it does not replace `activationStarted` across consecutive enemies.

The UI animates already-applied facts. The engine remains synchronous; animations block external commands without delaying logical state.

## Deaths and Round Wrap

A dead unit stays in `units` with `alive: false`, `hp: 0`, and its fall position. It also retains its original slot in `turnOrder`: never remove, compact, sort, or rebuild the list.

The cursor skips dead entries without emitting `activationStarted` for them. Dying before one's turn simply skips that entry; dying after acting grants no extra activations. Enemies disappear in presentation only; allies remain lying on the ground. Corpses never block movement or line of sight, nor can they be attacked, operationally selected, or healed.

One round corresponds to a traversal of the entire original order, processing each living unit at most once. Dead entries at the end of the list must also be traversed before wrapping. The next round begins at the first living entry in the same list, even if the Knight has died. Never increment the round merely because teams changed or an animation finished.

## Edge Cases and Safeguards

- Dead at start, middle, and end: preserve relative order of survivors and original indices.
- Last enemy/ally killed: immediate terminal state, with no cursor advance or empty loop.
- Both teams absent in artificial scenarios: define explicit precedence on review; the current baseline prioritizes defeat. Do not invent a draw outside the contract.
- Active unit dead: conclude and advance to next after checking battle end; currently there is no counter-attack or terrain damage.
- All slots dead or invalid IDs: search bounded by list length; never loop infinitely. Reject invalid setup before match start.
- Duplicate commands: do not assume a second pass is always rejected; after a round wrap there may be another consecutive living ally. UI locks during animations and the engine validates the active unit. Activation tokens would be a contract extension, not an implicit implementation.
- Reset during animation: cancel queues/VFX, restore flags/visibility, cursor, and round; re-establish the first active unit. Review the current contract that emits only `gameReset` to include/sync initial activation without duplication.
- `executeNextEnemyAction()` outside `enemy_activation` does nothing. `false` means no step executed, not necessarily end of phase: enemies can act consecutively.

## Test Strategy

- Scheduler table: exact order of all ten IDs across two rounds, including the three final enemy activations; verify uniqueness and cursor position.
- Scenarios A–E and variants with skill/healing; only `true / true` flags trigger normal auto-end.
- Clicks/`selectUnit` before and after first action, clearing selection, and attempting to command non-active units: never change the active unit or unlock another unit.
- Deaths in every slot, multiple consecutive dead units, and last slot dead; cooldown ticks down only on round wrap, never per skipped slot.
- Event ordering, invalid actions with no side effects, pass, reset, blocked AI, and killing blow.
- Invariants in bounded simulations: no dead active unit, no duplicate activations per round, finite progress, isolated snapshots, and stable lists.
- Preserve regressions for grid, LoS, damage, healing, skills, and AI; update expectations from free selection rather than deleting tests without replacement.

Integration plan and owners: [implementation-plan.md](implementation-plan.md). Baseline diagnosis: [architecture.md](architecture.md).
