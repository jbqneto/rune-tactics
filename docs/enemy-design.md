# Enemy Design, Boss, and 3D Model Reuse — Rune Tactics V4

This document defines the attribute/armor templates, deterministic AI profiles (`src/game/ai/EnemyAI.ts`) for all V4 enemies (5 existing + 3 new + boss `ashen-guardian`), and the exact reuse mapping of existing KayKit CC0 `.glb` models in `public/assets/models/`.

---

## 1. General AI Rules (`EnemyAI.ts`)

- All AI decision-making remains **100% deterministic** (no `Math.random`), executed step-by-step via `executeNextEnemyAction()` (1 move or 1 tactical action per call).
- The `minBy(items, score)` helper breaks ties strictly by list order (and `GridSystem` cells preserve fixed `STEPS` BFS order), ensuring reproducible results in Node tests.
- Starting in V4, `EnemyAI` returns five possible actions (`EnemyAction`):
  ```ts
  export type EnemyAction =
    | { type: 'attack'; target: UnitState }
    | { type: 'move'; path: GridCoord[] }
    | { type: 'defend' }
    | { type: 'skill'; skillId: SkillId; targetCell: GridCoord }
    | { type: 'prepareAttack'; skillName: string; targetCells: GridCoord[]; basePower: number; attackKind: AttackKind; cooldown: number };
  ```
- **AI damage note**: to evaluate lethal kills (`canKill`), the AI queries the pure `computeDamage(...)` function in `CombatSystem` rather than reading raw `attacker.damage` — properly accounting for target armor, Fortitude, and defensive stance (`isGuarding`)!

---

## 2. Existing Enemies (Adapted to V4 Attributes)

The five classic enemy types keep their V2.2 tactical identity, now parameterized with V4 attributes, `baseArmor`, `basePower`, and `attackKind`:

| Type (`UnitType`) | In-game Name | `attackKind` | Preserved Deterministic Behavior |
|---|---|---|---|
| `melee-skeleton` | Melee Skeleton | `melee` (`str`) | Attacks the in-range hero with the lowest `hp` (tie-breaker: lowest Manhattan distance); when out of range, takes the shortest path to the nearest attack cell. |
| `skeleton-archer` | Skeleton Archer | `ranged` (`dex`) | Attacks the in-range hero with LoS and lowest `hp`; when moving, seeks a cell with LoS preferring distance `>= 2` (`RANGED_SAFE_DISTANCE`) from any hero. |
| `armored-skeleton` | Armored Skeleton | `melee` (`str`) | Attacks the nearest hero (tie-breaker: lowest `hp`); when moving, among shortest-path attack cells, chooses the one adjacent to the most heroes. |
| `goblin-scout` | Goblin Scout | `melee` (`str`) | High mobility (`moveRange: 4`). Prioritizes reaching and attacking the living hero with the lowest current `hp`. |
| `cultist-mage` | Cultist Mage | `magic` (`int`) | Fires magic (`attackRange: 3`, LoS) at the lowest-`hp` hero; when moving, seeks a cell with LoS while keeping distance `>= 2`. |

---

## 3. New V4 Enemies

### 3.1 `goblin-stalker` — Goblin Stalker (Lethal Flanker)

- **Identity**: Aggressive, deadlier cousin of the Goblin Scout. Uses neither shield nor defensive stance; built to punish poorly protected backlines (Mage and Archer) by crossing bridges or flanking.
- **Attributes / Profile**: `moveRange: 4`, `attackRange: 1`, `attackKind: 'melee'` (`str: 7`, granting `+1` offensive bonus -> `attackPower = 3`, `baseArmor: 0`).
- **Deterministic AI**:
  1. **Priority target** (`stalkerScore(target)`): ranks living heroes by lowest current `hp`; on ties, lowest `totalDefense` (`baseArmor + fortitudeResistance(fort)`); on ties, lowest Manhattan distance; on ties, list order.
  2. **If heroes are already in range (`inRange.length > 0`)**: attacks the one with lowest `stalkerScore` (if any hit is lethal according to `computeDamage`, picks the killable target with highest potential `attackPower` first).
  3. **If out of range and `!hasMoved`**: searches all reachable cells with an available attack (`firingCells`, within `moveRange` if possible, otherwise all reachable via BFS) for the one attacking the hero with lowest `stalkerScore`, breaking ties by fewest steps and then by cells with **fewer other adjacent heroes** (tends to avoid getting surrounded by Knight+Cleric when flanking room exists). If no attack cell is reachable on the map, moves closer to the hero with lowest `stalkerScore`.

### 3.2 `skeleton-shieldbearer` — Skeleton Shieldbearer (Defensive Tank)

- **Identity**: Disciplined vanguard that holds chokepoints (`fortress`, `corrupted-sanctuary`) using the **Defend (`-50%` damage)** stance to shield archers, acolytes, and the boss behind it.
- **Attributes / Profile**: `moveRange: 2`, `attackRange: 1`, `attackKind: 'melee'`, `baseArmor: 1`, `fort: 6` (`maxHp: 11`), `basePower: 2`.
- **Deterministic AI**:
  1. **When a hero is adjacent (`inRange.length > 0`)**:
     - If any basic attack kills an adjacent target (`computeDamage >= target.hp`), **attacks** that target immediately (`{ type: 'attack', target }`).
     - Else, if `!enemy.isGuarding` **AND** (`enemy.hp <= Math.floor(enemy.maxHp * 0.5)` **OR** `inRange.length >= 2`), uses **Defend** (`{ type: 'defend' }`).
     - Otherwise, **attacks** the nearest adjacent hero (tie-breaker: lowest `hp`).
  2. **When no hero is adjacent (`inRange.length === 0`)**:
     - If `!enemy.hasMoved`: advances up to `moveRange` seeking attack cells that engage as many heroes as possible (like `armored-skeleton`, preferring to stand between heroes and allied ranged units on ties).
     - If `!enemy.hasMoved` has no path or it has already moved (`enemy.hasMoved === true`) and still has no adjacent target: if any living hero is within Manhattan distance `<= 4` and `!enemy.isGuarding`, uses **Defend** (`{ type: 'defend' }`) to soak Archer/Mage shots next turn; otherwise returns `null`.

### 3.3 `necromancer-acolyte` — Necromancer Acolyte (Dark Support & Magic)

- **Identity**: Backline dark caster that sustains the undead frontline with **`dark-mend`** (`int`-scaled magical heal) and fires dark arcane bolts when no ally needs healing.
- **Attributes / Profile**: `moveRange: 2`, `attackRange: 3`, `attackKind: 'magic'`, `int: 7` (`+1` bonus), `basePower: 2` (`attackPower = 3`), `skillId: 'dark-mend'` (`heal: 2` → total heal `2 + 1 = 3 HP`, `range: 3`, `cooldown: 2`, `targetTeam: 'ally'`).
- **Deterministic AI**:
  1. **Priority 1 — Heal (`dark-mend`)**:
     - Only considers healing if `enemy.skillCooldown === 0` and there is a living allied enemy with `hp < maxHp` and `hp <= Math.floor(maxHp * 0.75)` (or the boss `ashen-guardian` below `maxHp`).
     - Ranks healing candidates by: (a) boss (`ashen-guardian`) before all others; (b) lowest `hp / maxHp` ratio; (c) shortest distance to the acolyte; (d) list order.
     - If the priority target is within `range 3` and has LoS from the current position, returns `{ type: 'skill', skillId: 'dark-mend', targetCell: ally.pos }`.
     - If `!enemy.hasMoved` and there is a cell within `moveRange` from which the heal reaches the wounded ally (preferring the cell farthest from heroes `distanceToNearest >= 2`), moves there.
  2. **Priority 2 — Basic Magic Attack**:
     - If there is no eligible healing target (or `skillCooldown > 0`), behaves like `cultist-mage`: fires magic (`attackRange: 3`, LoS) at the lowest-`hp` hero in range; if out of range and `!hasMoved`, seeks a cell with LoS keeping safe distance `>= 2`.

---

## 4. Stage 5 Boss: `ashen-guardian` — Ashen Guardian

### 4.1 Concept and Two-Phase Mechanics

- **Identity**: Corrupted lord of the Sanctuary, imposing and methodical. Combines devastating melee strikes with telegraphed area attacks (`PendingAttack`), forcing the player's squad to alternate repositioning, focused damage, and `Defend`.
- **Phase State (`bossPhase: 1 | 2`)**:
  - Starts the battle with `bossPhase = 1`.
  - **Phase 2 Trigger**: immediately when its HP drops to **`<= Math.floor(maxHp * 0.5)`** (`<= 14 HP` out of `28` max HP) while still alive (`alive === true`).
  - **Mandatory rule**: **restores zero HP on transition**.
  - The transition is an **irreversible one-way latch**: `bossPhase` changes from `1` to `2`, `moveRange` increases from `2` to `3`, and the engine emits `{ type: 'bossPhaseChanged', unitId: boss.id, phase: 2, newMoveRange: 3 }`. Even if `necromancer-acolyte` heals the boss back above 50% later, the boss **stays** in Phase 2 and the event never fires again.
  - A `PendingAttack` already prepared during Phase 1 **keeps** its original `targetCells` until resolved or the boss dies.

### 4.2 Boss Phase Comparison Table

| Aspect | Phase 1 (`hp > 50% maxHp`) | Phase 2 — Ashen Fury (`hp <= 50% maxHp`) |
|---|---|---|
| `moveRange` | `2` | **`3`** (`+1`) |
| Basic attack | `melee` (`str: 7`, `basePower: 4` → **`5` ATK**) | Same (`melee`, `5` ATK) |
| Telegraphed Attack | **`Ashen Slam`** | **`Ashen Eruption`** |
| Shape of `targetCells` | **5-cell cross** (center + 4 orthogonal cells in bounds) | **`3×3` area (up to 9 cells)** (center + 8 orthogonal and diagonal neighbors in bounds) |
| Center cast range | Up to `3` cells (Manhattan) from boss | Up to `3` cells (Manhattan) from boss |
| Power / Type | `basePower: 4`, `attackKind: 'magic'` (`int: 7` → **`5` ATK**) | `basePower: 5`, `attackKind: 'magic'` (`int: 7` → **`6` ATK**) |
| Cooldown | `2` rounds | `2` rounds |

### 4.3 Boss Deterministic Decision Tree

On each call to `executeNextEnemyAction()` during `ashen-guardian`'s activation (noting that any `PendingAttack` prepared on the previous turn has already been resolved at the start of the current activation):

1. **If it has not acted yet (`!hasAttacked`) and `skillCooldown === 0`**:
   - Evaluates all valid grid cells (`isInBounds`, free or occupied) within Manhattan distance `<= 3` of the boss's current position (centering on obstacle-free cells that hit **at least 1 living hero**).
   - For each candidate center cell `c`: computes `area = getBossAttackArea(c, bossPhase)` (`cross` in Phase 1, `3×3` in Phase 2) and counts `hits = livingHeroes.filter(h => area.some(a => sameCell(a, h.pos)))`.
   - If at least one cell has `hits.length >= 1`:
     - Picks the cell maximizing `hits.length`; on ties, lowest sum of hit heroes' HP; on ties, shortest Manhattan distance to the boss; on ties, smallest `y`, then smallest `x`.
     - Returns `{ type: 'prepareAttack', skillName, targetCells: area, basePower, attackKind: 'magic', cooldown: 2 }`.
     - *(Note: since `prepareAttack` consumes `hasAttacked = true`, to avoid the boss awkwardly walking away after telegraphing, the rule in `EnemyAI` is: if a hero is adjacent (`manhattan === 1`) OR preparing hits `>= 1` hero from where it stands, it prepares without needing to move first; on the second `executeNextEnemyAction()` call, if the boss has already prepared a `PendingAttack` this turn, it does not need to flee — it returns `null` and ends its activation!)*
2. **If `skillCooldown > 0` (or no hero is within preparation range)**:
   - If a hero is adjacent (`attackRange: 1`), returns `{ type: 'attack', target }` targeting the adjacent hero with lowest `hp` (tie-breaker: killable via `computeDamage`, then list order).
   - Otherwise, if `!hasMoved`, moves up to `moveRange` (`2` in Phase 1, `3` in Phase 2) along the shortest path toward the nearest living hero (or into range `3` when `skillCooldown === 0` so it can immediately prepare the telegraphed attack next!).

---

## 5. Reuse of Existing KayKit CC0 `.glb` Models

Below is the complete mapping in `src/rendering/CharacterVisualController.ts` (`MODEL_SPECS`) and `src/rendering/UnitRenderer.ts`, using exclusively the 8 `.glb` files already in `public/assets/models/`:

### Existing Units (Preserved)

| `UnitType` | `.glb` File | `targetHeight` | Tint (`tintHex` / `tintStrength`) |
|---|---|---|---|
| `knight` | `Knight.glb` | `1.02` | — |
| `archer` | `Rogue_Hooded.glb` | `0.98` | — |
| `mage` | `Mage.glb` | `1.05` | — |
| `cleric` | `Rogue.glb` | `0.96` | `0xfef08a` / `0.38` |
| `melee-skeleton` | `Skeleton_Minion.glb` | `0.96` | — |
| `skeleton-archer` | `Skeleton_Rogue.glb` | `0.96` | — |
| `armored-skeleton` | `Skeleton_Warrior.glb` | `1.16` | — |
| `cultist-mage` | `Skeleton_Mage.glb` | `1.02` | — |
| `goblin-scout` | `Rogue.glb` | `0.82` | `0x6b8e23` / `0.55` |

### New V4 Units (Reused with Tint, Height, and Distinct Silhouette)

| `UnitType` | Reused `.glb` File | `targetHeight` | `tintHex` | `tintStrength` | Visual Differentiation & Silhouette |
|---|---|---|---|---|---|
| `goblin-stalker` | `/assets/models/Rogue_Hooded.glb` | `0.88` | `0x365314` (dark olive) | `0.65` | Pointed hood distinct from `goblin-scout` (unhooded `Rogue.glb`), crouched stature shorter than `archer` (`0.98`), dark moss-green + red enemy ring. |
| `skeleton-shieldbearer` | `/assets/models/Skeleton_Warrior.glb` | `1.04` | `0x64748b` (cold slate iron) | `0.50` | Shorter than `armored-skeleton` (`1.16`), slate metallic tone contrasting against dark iron/bronze; when `isGuarding === true`, activates the pulsing defense ring and `🛡` badge. |
| `necromancer-acolyte` | `/assets/models/Skeleton_Mage.glb` | `1.00` | `0x0d9488` (necrotic emerald) | `0.55` | Immediately contrasts with `cultist-mage`'s crimson robe and the allied `mage`'s purple; spectral green VFX when casting `dark-mend`. |
| `ashen-guardian` | `/assets/models/Skeleton_Warrior.glb` | `1.42` | `0x7f1d1d` (charcoal ash & crimson ember) | `0.55` | ~40% taller than standard heroes (`1.42` vs `1.02`), hitbox `0.85 × 1.55 × 0.85`, boss-accented HP bar (`👑`), intense ember aura (`0xf97316`) activated upon entering Phase 2 (`bossPhase === 2`). |

*(For the procedural fallback in `UnitRenderer.ts` — should a `.glb` fail to load — each new unit type gets a simple procedural builder reusing existing primitives with the colors/heights above, plus a prominent front shield on `skeleton-shieldbearer` and ember pauldrons/crown on `ashen-guardian`.)*
