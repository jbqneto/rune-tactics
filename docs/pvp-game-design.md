# Rune Tactics V5 — 3v3 PvP Game Design

## 1. Match Overview

Two human players (**Player A / Seat A** vs **Player B / Seat B**) command **3 heroes each** on a `12×12` tactical battlefield. Activations alternate unit-by-unit in fixed interleaved order. Eliminating all 3 opposing heroes—or winning by opponent forfeit / 90s disconnect timeout—wins the match.

---

## 2. Hero Selection, Team Composition, and Turn Order

### 2.1 Draft Rules (`CHARACTER_SELECTION` -> `WAITING_FOR_READY`)
- Playable hero pool (`PVP_HERO_CLASSES` in `src/config/gameConfig.ts`):
  1. `knight` — **Knight**
  2. `archer` — **Archer**
  3. `mage` — **Mage**
  4. `cleric` — **Cleric**
- Each player picks **3 unique classes** (no duplicate class within the same team; opponent may pick any overlapping classes, including mirror teams).
- **Order matters**: the order `[Slot 1, Slot 2, Slot 3]` chosen during selection defines that player's **activation sequence** inside the fixed turn order.
- Both players lock choices via **Ready** before the match transitions through `STARTING` to `IN_PROGRESS`.

### 2.2 Fixed Interleaved Turn Order (`3v3`)
At match start, `turnOrder` interleaves both teams slot-by-slot:
- When `startingTeam === 'teamA'` (Match 1 default):
  `[A1, B1, A2, B2, A3, B3]`
- When `startingTeam === 'teamB'` (alternated on Rematch):
  `[B1, A1, B2, A2, B3, A3]`

Rules inherited from `TurnSystem` (`docs/turn-system.md`):
- `turnOrder` is immutable for the duration of the match.
- Fallen units keep their slot in `turnOrder` (never compacted or re-sorted) and are skipped without emitting `activationStarted`.
- A `round` completes after traversing all 6 slots; on round wrap, `round += 1`, action flags reset, and skill cooldowns on living units tick down by `1` (floor `0`).

---

## 3. Standardized PvP Attributes & Skills (No PvE Progression)

All PvP units spawn at **canonical Level 0 stats** from `UNIT_STATS` and `SKILLS` in `src/config/gameConfig.ts` (Campaign upgrades, `unspentPoints`, and `SaveSystem` are completely isolated from PvP):

| Class (`UnitType`) | Role | HP (`baseHp`/`fort`) | ATK (`basePower`/`main`) | DEF (`baseArmor`/`fort`) | `moveRange` | `attackRange` | `attackKind` | Skill (`SKILLS`) |
|---|---|---|---|---|---:|---:|---|---|
| `knight` | Frontline Bruiser | **12** (`8`, `fort: 6`) | **2** (`2`, `str: 6`) | **1** (`1`, `fort: 6`) | 3 | 1 | `melee` | **Runic Strike** (`dmg 4, rng 1, cd 2, single`) |
| `archer` | Ranged Striker | **8** (`8`, `fort: 4`) | **2** (`2`, `dex: 6`) | **0** (`0`, `fort: 4`) | 3 | 3 | `ranged` | **Marked Shot** (`dmg 3, rng 3, cd 2, single`) |
| `mage` | Area Caster | **7** (`7`, `fort: 4`) | **2** (`2`, `int: 6`) | **0** (`0`, `fort: 4`) | 2 | 2 | `magic` | **Arcane Burst** (`dmg 2, rng 3, cd 3, cross`) |
| `cleric` | Support / Off-Tank | **9** (`7`, `fort: 5`) | **2** (`2`, `str: 5`) | **1** (`1`, `fort: 5`) | 2 | 1 | `melee` | **Healing Light** (`heal 3, rng 3, cd 2, single, ally`) |

All V4 centralized combat formulas (`AttributeSystem` + `CombatSystem`) apply verbatim:
- Damage: `max(1, attackPower - totalDefense)`, halved rounded up (`Math.max(1, Math.ceil(damageBeforeGuard * 0.5))`) when `isGuarding === true`.
- `Defend` (`G`): sets `isGuarding = true`, consumes `hasAttacked`, works before or after moving, expires at the start of the defending unit's next activation.
- `Arcane Burst` (`cross`) only hits opposing units inside its 5-cell cross (never self/allies); `Healing Light` heals living allies below `maxHp` (including the Cleric itself), never revives corpses.

---

## 4. Selected PvP Map from `MAPS` (`src/config/gameConfig.ts`)

### Selected Map: `forgotten-swamp` (**Forgotten Swamp**)

Evaluation of all 9 existing `12×12` arenas in `MAPS` (`src/config/gameConfig.ts`):

| Map ID | Obstacles | N-S Mirror (`y' = 11-y`) | 180° Rotational (`11-x, 11-y`) | 360° Scenario Occluders | PvP Verdict |
|---|---:|---:|---:|---|---|
| **`forgotten-swamp`** | **28** (`16 water`, `4 pillar`, `4 crate`, `4 barrel`) + `8 bridgeCells` | **28 / 28 (100%)** | **28 / 28 (100%)** | **Yes (`SwampScenario.ts`)** | **SELECTED** — Perfect dual symmetry + 360° camera-ready diorama |
| `catacombs` | 22 | 12 / 22 | 22 / 22 | No (`buildPerimeterScenery`) | Runner-up (missing perimeter occluders for 180° camera) |
| `sanctuary` | 20 | 8 / 20 | 20 / 20 | No (`buildPerimeterScenery`) | Runner-up (missing perimeter occluders for 180° camera) |
| `gauntlet` | 22 | 0 / 22 | 22 / 22 | No | Narrow S-lanes, no occluders |
| `courtyard` | 12 | 4 / 12 | 10 / 12 | No | Central wall biased toward South |
| `fortress` | 20 | 4 / 20 | 4 / 20 | Yes (`FortressScenario.ts`) | Strongly asymmetric North vs South |
| `ruins` | 19 | 0 / 19 | 0 / 19 | No | Asymmetric gates and cover |
| `dorter-ruins` | 0 | N/A | N/A | `occluders: []` | Open empty field; zero cover/LoS play |

### Why `forgotten-swamp` is Optimal for 3v3 PvP
1. **100% Mathematical Symmetry**: All `28` obstacles and `8` `bridgeCells` are invariant under N-S mirror, E-W mirror, and 180° rotation. Neither Player A nor Player B gets closer cover or shorter flank routes.
2. **Anti-Stalemate 3-Bridge Geometry**: The central swamp moat (`y = 5, 6`) is crossed by **3 bridges** totaling **4 bridge columns** (`x = 2`, `x = 5..6` double-wide center, `x = 9`). With 3 units per team and 4 crossing columns, no team can permanently body-block all lanes.
3. **Ranged & LoS Depth**: `water` has `blocksLos: false` (blocks movement only), letting `Archer` and `Mage` contest space across the moat while symmetric `pillar`s at `(2,2),(9,2)` and `(2,9),(9,9)` prevent turn-1 spawn sniping.
4. **360° Camera Legibility**: `SwampScenario.ts` registers perimeter arches, trees, and braziers in `occluders`, so `BoardRenderer.update` automatically hides structures between Player B's 180°-rotated camera (`225°`) and the board.

### Mirrored Starting Positions
- **Team A** spawns in `playerSpawnRows: [0, 1]` using `createRng(seed)` to select 3 distinct free cells `[p0, p1, p2]`.
- **Team B** spawns at the **exact 180° point-symmetric mirrors** in `enemySpawnRows: [10, 11]`: `{ x: 11 - p.x, y: 11 - p.y }` for slots `[0, 1, 2]`.
- Result: guaranteed identical initial distances to bridges, cover, and opposing units regardless of seed.

---

## 5. Player Perspective: 180° Camera, Team-Relative Death, and HUD

### 5.1 Player A vs Player B 180° Camera Perspective
- Grid coordinates `(x, y)` remain canonical (`0..11`) across server and both clients.
- In `BoardRenderer.gridToWorld`: `y = 0, 1` maps to `+Z` (South) and `y = 10, 11` maps to `-Z` (North).
- **Player A (`seat === 'A'`)** starts at `CameraController` default azimuth **`π/4` (45°)** (South-East quadrant), with Team A (`y = 0, 1`) in the bottom foreground facing North.
- **Player B (`seat === 'B'`)** starts at azimuth **`5π/4` (`π/4 + π`, 225°)** (North-West quadrant), set immediately in `SceneManager` on match entry so Team B (`y = 10, 11`) appears in the bottom foreground facing South!
- Both players retain unrestricted 360° right-click drag orbit from their initial azimuth; `reset()` / rematch preserves camera angle unless switching back to PvE/Menu (which restores `π/4`).

### 5.2 Team-Relative Visuals and Death Behavior
`PvPClientEngine` projects server state into viewer perspective (`myTeam -> 'player'`, `opponentTeam -> 'enemy'`), producing consistent, intuitive team-relative presentation:
- **Colors & Rings**: Your units (`myTeam`) always show blue base rings and blue HP bars; opponent units (`opponentTeam`) always show red base rings and red HP bars.
- **Active Unit Opacity**: In PvP, the active unit (`activeUnitId`) renders at `1.0` opacity while **all other living units on both teams** render at `0.75` (`INACTIVE_UNIT_OPACITY`), returning to `1.0` when the match finishes.
- **Team-Relative Death Visuals**:
  - **Your fallen units (`myTeam`)**: play death animation and remain on their fall cell as lying corpses (blue-side fallen heroes, blocking nothing).
  - **Opponent fallen units (`opponentTeam`)**: play death animation and shrink/vanish (`root.visible = false`), keeping the board visually focused while remaining logically in `units`/`turnOrder` (matching V2.1–V4 `UnitRenderer` semantics).
- **Team-Relative HUD**:
  - Left roster (`Allies`): your 3 units with Move/Attack pips and `ACTIVE / WAITING / DONE / DEFEATED` badges.
  - Top-right panel (`Opponent`): opponent's 3 units and living count (`X / 3`).
  - Phase badge: **`Your Turn`** vs **`Opponent Turn`** (plus **`Victory`** / **`Defeat`**).
  - Action bar & board clicks are enabled **only** during `Your Turn` (`activeSeat === mySeat`) and unlocked after animations complete.

---

## 6. Turn Clock, Actions, Rematch, and No Chat

- **60-Second Turn Clock**: Server-authoritative (`PVP_TURN_DURATION_MS = 60_000`) per unit activation. Both players see the live countdown bar. Moving or undoing does not reset the timer; ending activation or timing out advances the turn cleanly. Timer freezes during `PAUSED_DISCONNECTED`.
- **Move, Undo, and Smart Actions**:
  - `Move` and `Attack` / `UseSkill` / `Defend` can happen in either order; spending both auto-ends the activation.
  - Manual `Move` can be undone once per activation before attacking/skilling/defending (`UndoMove`).
  - `SmartAttack` and `SmartUseSkill` execute move+action atomically on the server and cannot be undone.
  - `E` ends activation; `G` enters Defend stance (using the same action locks as HUD buttons).
- **Rematch**: Post-match modal shows **Rematch** (mutual agreement required) and **Back to Menu**. Accepting rematch returns both seats to `CHARACTER_SELECTION` with `startingTeam` swapped (`teamA <-> teamB`) so first-move advantage alternates fairly.
- **No Chat**: V5 intentionally includes **no text or voice chat**—only structured match status indicators and combat feedback derived from `PvPGameplayEvent[]`.
