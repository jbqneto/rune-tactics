# Campaign Design — Rune Tactics V4 (The Ashen Campaign)

This document specifies the structure of the 5 sequential stages (`StageConfig`), the two new maps (`forgotten-swamp` and `corrupted-sanctuary`), the complete campaign flow, recovery between stages, hero progression, checkpoints, versioned persistence in `localStorage`, and separation from the **Quick Battle** mode.

---

## 1. Mode Separation: Campaign vs. Quick Battle

The game provides two explicit modes (`GameMode = 'campaign' | 'quick-battle'`):

1. **Campaign (`The Ashen Campaign`)**:
   - Fixed sequence of 5 stages (`StageConfig[]` in `src/config/gameConfig.ts`).
   - Heroes persist their attributes (`str`, `dex`, `int`, `fort`) and `hp`/`maxHp` across stages, recover partially after victories, gain `+1` point per hero per stage won, and have per-stage checkpoints with automatic `localStorage` persistence.
   - Enemy formations in each stage are fixed/curated in `StageConfig` (or use fixed deterministic stage spawns) to guarantee progressive tactical pacing.
2. **Quick Battle (`quick-battle`)**:
   - Preserves V2.3 behavior intact: randomized map selection from `MAPS` without consecutive repetition and seeded spawn positions (`seed`).
   - The 4 heroes enter with the default starting attributes from the class table, using the V4 attribute and defense formulas.
   - Never reads, modifies, or deletes the campaign save in `localStorage`.

---

## 2. Structure of the 5 Stages (`CAMPAIGN_STAGES: StageConfig[]`)

Each stage is declared in `src/config/gameConfig.ts` via the `StageConfig` interface:

```ts
export interface StageEnemySpawn {
  id: string;
  type: UnitType;
  pos: GridCoord;
}

export interface StageHeroSpawn {
  id: string;
  type: 'knight' | 'archer' | 'mage' | 'cleric';
  pos: GridCoord;
}

export interface StageConfig {
  stageNumber: number; // 1..5
  id: string;
  name: string;
  subtitle: string;
  mapId: string;
  isBossStage: boolean;
  heroSpawns: StageHeroSpawn[];
  enemies: StageEnemySpawn[];
}
```

### Canonical Hero Formation in Stages

For visual consistency and tactical clarity across all 5 stages, the 4 heroes spawn on the two southern rows (`playerSpawnRows: [0, 1]`):

- `knight-1` (`knight`): `{ x: 4, y: 1 }` (center-left vanguard)
- `cleric-1` (`cleric`): `{ x: 7, y: 1 }` (center-right vanguard / close support)
- `archer-1` (`archer`): `{ x: 2, y: 0 }` (west backline)
- `mage-1` (`mage`): `{ x: 9, y: 0 }` (east backline)

*(All cells above are guaranteed free of obstacles on all campaign maps; if any future map alters spawns, each `StageConfig` supports its own `heroSpawns`.)*

---

### Stage 1: Outpost Ruins (`stage-1-outpost`)
- **Map**: `ruins` ("Current Ruins")
- **Objective**: Introduce tactical combat, line of sight across the central wall, and the **Defend** stance.
- **Enemies (3)**:
  - `goblin-scout-1` (`goblin-scout`): `{ x: 2, y: 10 }` (west flank, wide gate)
  - `melee-skeleton-1` (`melee-skeleton`): `{ x: 5, y: 10 }` (center)
  - `goblin-scout-2` (`goblin-scout`): `{ x: 9, y: 10 }` (east flank, narrow passage)
- **Interleaved turn order (`buildTurnOrder`)**: `knight-1`, `goblin-scout-1`, `cleric-1`, `melee-skeleton-1`, `archer-1`, `goblin-scout-2`, `mage-1`.

---

### Stage 2: Forgotten Swamp (`stage-2-swamp`)
- **Map**: `forgotten-swamp` ("Forgotten Swamp" — **new map**)
- **Objective**: Hold the 3 narrow bridges/chokepoints against fast flankers and archer pressure across the water.
- **Enemies (5)**:
  - `goblin-stalker-1` (`goblin-stalker`): `{ x: 2, y: 10 }` (aligned with west bridge `x=2`)
  - `goblin-scout-1` (`goblin-scout`): `{ x: 5, y: 10 }` (central bridge)
  - `goblin-scout-2` (`goblin-scout`): `{ x: 6, y: 10 }` (central bridge)
  - `goblin-stalker-2` (`goblin-stalker`): `{ x: 9, y: 10 }` (aligned with east bridge `x=9`)
  - `skeleton-archer-1` (`skeleton-archer`): `{ x: 5, y: 11 }` (backline firing across the swamp)

---

### Stage 3: Fortress of Bones (`stage-3-fortress`)
- **Map**: `fortress` ("Abandoned Fortress")
- **Objective**: Break through a defensive frontline of shieldbearers and heavy armor blocking the central corridor while the archer fires from the rear.
- **Enemies (6)**:
  - `skeleton-shieldbearer-1` (`skeleton-shieldbearer`): `{ x: 4, y: 10 }`
  - `skeleton-shieldbearer-2` (`skeleton-shieldbearer`): `{ x: 7, y: 10 }`
  - `melee-skeleton-1` (`melee-skeleton`): `{ x: 2, y: 10 }`
  - `melee-skeleton-2` (`melee-skeleton`): `{ x: 9, y: 10 }`
  - `armored-skeleton-1` (`armored-skeleton`): `{ x: 5, y: 10 }`
  - `skeleton-archer-1` (`skeleton-archer`): `{ x: 6, y: 11 }`

---

### Stage 4: Arcane Catacombs (`stage-4-catacombs`)
- **Map**: `catacombs` ("Crossed Catacombs")
- **Objective**: Breach the inner catacomb walls and neutralize casters (`cultist-mage`) and healers (`necromancer-acolyte`) shielded by armored skeletons.
- **Enemies (6)**:
  - `armored-skeleton-1` (`armored-skeleton`): `{ x: 4, y: 10 }`
  - `armored-skeleton-2` (`armored-skeleton`): `{ x: 7, y: 10 }`
  - `cultist-mage-1` (`cultist-mage`): `{ x: 1, y: 11 }`
  - `cultist-mage-2` (`cultist-mage`): `{ x: 10, y: 11 }`
  - `necromancer-acolyte-1` (`necromancer-acolyte`): `{ x: 4, y: 11 }`
  - `necromancer-acolyte-2` (`necromancer-acolyte`): `{ x: 7, y: 11 }`

---

### Stage 5: Corrupted Sanctuary (`stage-5-sanctuary`)
- **Map**: `corrupted-sanctuary` ("Corrupted Sanctuary" — **new map**)
- **Objective**: Defeat the boss **Ashen Guardian (`ashen-guardian`)** and its two support guardians while dodging or defending against its telegraphed attacks (`Ashen Slam` and `Ashen Eruption`).
- **`isBossStage`**: `true`
- **Enemies (3)**:
  - `skeleton-shieldbearer-1` (`skeleton-shieldbearer`): `{ x: 4, y: 10 }` (protective vanguard)
  - `ashen-guardian-1` (`ashen-guardian`): `{ x: 6, y: 10 }` (boss centered at the northern altar)
  - `necromancer-acolyte-1` (`necromancer-acolyte`): `{ x: 8, y: 11 }` (dark backline support)

---

## 3. New 12×12 Maps (`MAPS`)

All maps remain flat 12×12 grids (`gridSize: 12`), with obstacle-free spawn rows `playerSpawnRows: [0, 1]` and `enemySpawnRows: [10, 11]`, and **100% of free cells mutually connected** (verified via BFS).

For the swamp, the `'water'` obstacle type is added to `ObstacleKind` with **`blocksLos: false`** (blocks movement, allows ranged shots and spells to pass over water). Walkways between water blocks may specify `bridgeCells?: GridCoord[]` in `MapConfig` (a purely visual field for `BoardRenderer` to render wooden planks on the bridge floor, without altering pathing or elevation rules).

### 3.1 `forgotten-swamp` ("Forgotten Swamp")

Legend: `~` water (`water`, `blocksLos: false`); `O` pillar (`blocksLos: true`); `c` crate (`blocksLos: false`); `b` barrel (`blocksLos: false`); `.` free cell (with visual bridge planks on columns C, F–G, and J on rows 6 and 7).

```text
12 (y=11)  . . . . . . . . . . . .   (enemy spawn)
11 (y=10)  . . . . . . . . . . . .   (enemy spawn)
10 (y=9)   . . O . . . . . . O . .   pillars: (2,9), (9,9)
 9 (y=8)   . b . . c . . c . . b .   barrels: (1,8),(10,8); crates: (4,8),(7,8)
 8 (y=7)   . . . . . . . . . . . .
 7 (y=6)   ~ ~ . ~ ~ . . ~ ~ . ~ ~   bridges at x=2, x=5..6, x=9
 6 (y=5)   ~ ~ . ~ ~ . . ~ ~ . ~ ~   bridges at x=2, x=5..6, x=9
 5 (y=4)   . . . . . . . . . . . .
 4 (y=3)   . b . . c . . c . . b .   barrels: (1,3),(10,3); crates: (4,3),(7,3)
 3 (y=2)   . . O . . . . . . O . .   pillars: (2,2), (9,2)
 2 (y=1)   . . . . . . . . . . . .   (hero spawn)
 1 (y=0)   . . . . . . . . . . . .   (hero spawn)
           A B C D E F G H I J K L
           0 1 2 3 4 5 6 7 8 9 10 11
```

- **Total obstacles**: 28 (`16 water`, `4 pillar`, `4 crate`, `4 barrel`).
- **Free cells**: `144 - 28 = 116`, all connected in a single component.
- **`bridgeCells` (visual)**: `{x:2,y:5}, {x:5,y:5}, {x:6,y:5}, {x:9,y:5}, {x:2,y:6}, {x:5,y:6}, {x:6,y:6}, {x:9,y:6}`.

### 3.2 `corrupted-sanctuary` ("Corrupted Sanctuary")

Legend: `#` wall (`blocksLos: true`); `O` pillar (`blocksLos: true`); `c` crate (`blocksLos: false`); `b` barrel (`blocksLos: false`).

```text
12 (y=11)  . . . . . . . . . . . .   (enemy spawn)
11 (y=10)  . . . . . . . . . . . .   (enemy spawn)
10 (y=9)   . O . . . . . . . . O .   pillars: (1,9), (10,9)
 9 (y=8)   . . . # . . . . # . . .   walls: (3,8), (8,8)
 8 (y=7)   . . . . . O O . . . . .   central altar pillars: (5,7), (6,7)
 7 (y=6)   # . . . c . . c . . . #   walls: (0,6),(11,6); crates: (4,6),(7,6)
 6 (y=5)   # . . . . . . . . . . #   walls: (0,5),(11,5)
 5 (y=4)   . . b . . . . . . b . .   barrels: (2,4), (9,4)
 4 (y=3)   . . . # . . . . # . . .   walls: (3,3), (8,3)
 3 (y=2)   . O . . c . . c . . O .   pillars: (1,2),(10,2); crates: (4,2),(7,2)
 2 (y=1)   . . . . . . . . . . . .   (hero spawn)
 1 (y=0)   . . . . . . . . . . . .   (hero spawn)
           A B C D E F G H I J K L
           0 1 2 3 4 5 6 7 8 9 10 11
```

- **Total obstacles**: 20 (`8 wall`, `6 pillar`, `4 crate`, `2 barrel`).
- **Free cells**: `144 - 20 = 124`, all connected in a single component.
- Note: `MAPS` in `gameConfig.ts` includes these two maps alongside the 6 existing ones (and `QUICK_BATTLE_MAP_IDS` can continue rolling across all maps in `MAPS`, updating the list check in `tests/v23-features.test.ts`).

---

## 4. Campaign Flow, Recovery, Evolution, and Checkpoints

```text
[New Campaign] ──▶ Create 4 base heroes ──▶ Save Stage 1 Checkpoint ──▶ [Stage 1 Battle]
                                                                              │
                 ┌────────────────── Defeat ──────────────────────────────────┤
                 ▼                                                            ▼ Victory
          [Defeat Modal]                                             Is it Stage 5 (Boss)?
       ├─ Restart Stage ──▶ Restore Stage N Checkpoint               ├─ Yes ──▶ [Campaign Victory!]
       └─ New Campaign  ──▶ Clear save & return to Stage 1           └─ No  ──▶ [Post-Victory Recovery]
                                                                                       │
                                                                                       ▼
                                                                             +1 Point / Hero
                                                                                       │
                                                                                       ▼
                                                                               [Camp Screen]
                                                                            (Allocate attributes)
                                                                                       │
                                                                                       ▼ Confirm
                                                                        Save Stage N+1 Checkpoint
                                                                                       │
                                                                                       ▼
                                                                            [Stage N+1 Battle]
```

### 4.1 Recovery Between Stages (Stages 1 → 4)

Constants in `src/config/gameConfig.ts`:
- `CAMPAIGN_ALIVE_HEAL_RATIO = 0.35`
- `CAMPAIGN_REVIVE_HP_RATIO = 0.25`
- `CAMPAIGN_POINTS_PER_VICTORY = 1`

Upon winning stage `N` (`N < 5`), capture each hero's final `hp` and `alive` from `GameStateSnapshot` and apply in this exact order:
1. **Living heroes (`hero.alive && hero.hp > 0`)**:
   ```ts
   const heal = Math.ceil(hero.maxHp * CAMPAIGN_ALIVE_HEAL_RATIO);
   hero.hp = Math.min(hero.maxHp, hero.hp + heal);
   ```
2. **Fallen heroes (`!hero.alive || hero.hp === 0`)**:
   ```ts
   hero.alive = true;
   hero.hp = Math.max(1, Math.ceil(hero.maxHp * CAMPAIGN_REVIVE_HP_RATIO));
   ```
3. **Point grant**: each of the 4 heroes receives `unspentPoints += CAMPAIGN_POINTS_PER_VICTORY` (`+1`), including revived heroes.

### 4.2 Evolution at Camp

- While `status === 'between_stages'`, the player distributes each hero's pending points across the 4 attributes (`str`, `dex`, `int`, `fort`), respecting `MAX_ATTRIBUTE = 12`.
- When investing in `fort`, apply the rule from Section 4 of `docs/attribute-system.md` immediately: recompute `newMaxHp = calcMaxHp(baseHp, newFort)` and add `delta = Math.max(0, newMaxHp - oldMaxHp)` to current `hp` (never healing prior damage).
- All `unspentPoints` must be spent (`totalUnspent === 0`, except in the theoretical case where all attributes are already at `MAX_ATTRIBUTE`) before enabling the **"Start Stage N+1"** button.
- Clicking **"Start Stage N+1"** advances `currentStage` to `N + 1`, sets `status` to `'in_stage'`, records the **new checkpoint** for stage `N + 1`, and saves to `localStorage`.

### 4.3 Checkpoint, Restart, and Persistence (`localStorage`)

- **Key**: `CAMPAIGN_SAVE_KEY = 'rune_tactics_v4_save'`
- **Version**: `CAMPAIGN_SAVE_VERSION = 4`
- **Automatic save points**:
  1. When starting a New Campaign (Stage 1 checkpoint, `status: 'in_stage'`).
  2. When winning a stage 1..4 (recovered state + awarded points, `status: 'between_stages'`).
  3. Whenever an attribute point is allocated in Camp (remains `status: 'between_stages'`).
  4. When confirming progression to Stage `N+1` (new `checkpoint` for Stage `N+1`, `status: 'in_stage'`).
  5. When winning Stage 5 (`status: 'completed'`).
- **Restart Stage**: available both on the Defeat screen and during battle ("Restart Stage" button in the match panel when in Campaign mode). Restores `heroes` from `campaign.checkpoint.heroes` (entry attributes and HP for the current stage) and resets `GameEngine` on the same stage, discarding damage and deaths from the failed attempt.
- **New Campaign**: clears `rune_tactics_v4_save` and starts Stage 1 with the 4 base heroes at full HP.
- **Page reload**:
  - If a valid save exists with `status === 'in_stage'`, **"Continue Campaign"** resumes cleanly from the **start-of-stage checkpoint** of `currentStage`.
  - If `status === 'between_stages'`, it resumes directly on the **Camp / Evolution screen** before stage `currentStage + 1`, preserving recovered `hp` and `unspentPoints`.
  - If `status === 'completed'`, it allows starting a New Campaign or viewing completion.
- **Strict validation on load (`SaveSystem.ts`)**: rejects malformed JSON, `version !== 4`, `currentStage` outside `1..5`, missing any of the 4 canonical heroes, attributes outside `[MIN_ATTRIBUTE, MAX_ATTRIBUTE]`, or `hp <= 0` / `hp > calcMaxHp(baseHp, fort)`, returning `null` without crashing the game.
