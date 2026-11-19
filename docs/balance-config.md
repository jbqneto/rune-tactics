# Balance Table & Initial Parameters — Rune Tactics V4

All numbers below are the single source of truth for `src/config/gameConfig.ts`. Derived stats (`maxHp`, `atk`, `def`) are computed dynamically in `AttributeSystem` and `CombatSystem` using the formulas in `docs/attribute-system.md` and `docs/combat-system.md`.

---

## 1. Global Constants

| Constant | Value | Usage |
|---|---|---|
| `GRID_SIZE` | `12` | Default arena dimensions (`12×12`) |
| `MIN_ATTRIBUTE` | `1` | Minimum attribute floor |
| `MAX_ATTRIBUTE` | `12` | Maximum attribute cap |
| `CAMPAIGN_ALIVE_HEAL_RATIO` | `0.35` | Post-stage healing for surviving heroes (`ceil(maxHp * 0.35)`) |
| `CAMPAIGN_REVIVE_HP_RATIO` | `0.25` | Revival HP for fallen heroes after victory (`ceil(maxHp * 0.25)`) |
| `CAMPAIGN_POINTS_PER_VICTORY` | `1` | Attribute points awarded per hero upon winning each stage |
| `CAMPAIGN_SAVE_KEY` | `'rune_tactics_v4_save'` | Key in `localStorage` |
| `CAMPAIGN_SAVE_VERSION` | `4` | Save format version |

---

## 2. Hero Starting Parameters

| `UnitType` | Name | `baseHp` | `baseArmor` | `basePower` | `str` | `dex` | `int` | `fort` | **Derived Lv.0 (`maxHp` / `ATK` / `DEF`)** | `moveRange` | `attackRange` | `attackKind` | `skillId` |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| `knight` | Knight | `8` | `1` | `2` | `6` | `4` | `3` | `6` | **12 HP / 2 ATK / 1 DEF** | `3` | `1` | `melee` | `runic-strike` |
| `archer` | Archer | `8` | `0` | `2` | `4` | `6` | `3` | `4` | **8 HP / 2 ATK / 0 DEF** | `3` | `3` | `ranged` | `marked-shot` |
| `mage` | Mage | `7` | `0` | `2` | `3` | `4` | `6` | `4` | **7 HP / 2 ATK / 0 DEF** | `2` | `2` | `magic` | `arcane-burst` |
| `cleric` | Cleric | `7` | `1` | `2` | `5` | `3` | `6` | `5` | **9 HP / 2 ATK / 1 DEF** | `2` | `1` | `melee` | `healing-light` |

### Hero Progression Milestones (Campaign: +4 total points per hero)

- Every hero starts with their primary attribute at **`6`**:
  - With the **1st point** (post-Stage 1 → value `7`), they immediately unlock `+1` `offensiveBonus`, raising their `ATK` (or `Heal`) by `+1`.
  - Investing all **4 points** into their primary attribute (`6 → 10`) reaches `+2` `offensiveBonus` by Stage 5 (`ATK 4`, skills `5–6`).
- The Knight starts with `fort: 6` (`12 HP`), able to reach `fort: 8` (`16 HP` and `+1 fortitudeResistance` → `DEF 2`) with just `+2` points in `fort`.
- The Cleric starts with `fort: 5` (`9 HP`) and `baseArmor: 1`, functioning as a second-line off-tank/support.

---

## 3. Skills (`SKILLS`)

| `SkillId` | Name | `targetTeam` | `damage` / `heal` (base) | `attackKind` | `range` | `cooldown` | `area` | Scales with |
|---|---|---|---|---|---:|---:|---|---|
| `runic-strike` | Runic Strike | `enemy` | `damage: 4` | `melee` | `1` | `2` | `single` | `str` (`4` → `5` → `6`) |
| `marked-shot` | Marked Shot | `enemy` | `damage: 3` | `ranged` | `3` | `2` | `single` | `dex` (`3` → `4` → `5`) |
| `arcane-burst` | Arcane Burst | `enemy` | `damage: 2` | `magic` | `3` | `3` | `cross` | `int` (`2` → `3` → `4`) |
| `healing-light` | Healing Light | `ally` | `heal: 3` | — | `3` | `2` | `single` | `int` (`3` → `4` → `5`) |
| `dark-mend` *(enemy)* | Dark Mend | `ally` | `heal: 2` | — | `3` | `2` | `single` | `int` (`2` + `1` = `3`) |

---

## 4. Enemy & Boss Parameters

| `UnitType` | Name | `baseHp` | `baseArmor` | `basePower` | `str` | `dex` | `int` | `fort` | **Derived (`maxHp` / `ATK` / `DEF`)** | `moveRange` | `attackRange` | `attackKind` | Skill / Special |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| `goblin-scout` | Goblin Scout | `4` | `0` | `2` | `4` | `6` | `3` | `4` | **4 HP / 2 ATK / 0 DEF** | `4` | `1` | `melee` | — |
| `melee-skeleton` | Melee Skeleton | `5` | `0` | `2` | `5` | `4` | `2` | `4` | **5 HP / 2 ATK / 0 DEF** | `2` | `1` | `melee` | — |
| `skeleton-archer` | Skeleton Archer | `4` | `0` | `2` | `4` | `6` | `2` | `4` | **4 HP / 2 ATK / 0 DEF** | `2` | `3` | `ranged` | — |
| `goblin-stalker` | Goblin Stalker | `6` | `0` | `2` | `7` | `7` | `3` | `4` | **6 HP / 3 ATK / 0 DEF** | `4` | `1` | `melee` | Targets most fragile hero |
| `skeleton-shieldbearer` | Skeleton Shieldbearer | `7` | `1` | `2` | `5` | `4` | `2` | `6` | **11 HP / 2 ATK / 1 DEF** | `2` | `1` | `melee` | Uses `defend` (-50% damage) |
| `armored-skeleton` | Armored Skeleton | `7` | `2` | `2` | `7` | `4` | `2` | `6` | **11 HP / 3 ATK / 2 DEF** | `2` | `1` | `melee` | Engages multiple heroes |
| `cultist-mage` | Cultist Mage | `6` | `0` | `2` | `3` | `4` | `7` | `4` | **6 HP / 3 ATK / 0 DEF** | `2` | `3` | `magic` | Magic kiter (`dist >= 2`) |
| `necromancer-acolyte` | Necromancer Acolyte | `5` | `0` | `2` | `3` | `4` | `7` | `5` | **7 HP / 3 ATK / 0 DEF** | `2` | `3` | `magic` | `dark-mend` (heals 3, cd 2) |
| `ashen-guardian` | Ashen Guardian | `20` | `1` | `4` | `7` | `4` | `7` | `8` | **28 HP / 5 ATK / 2 DEF** | `2` *(P2: `3`)* | `1` | `melee` | `Ashen Slam` (cross, pwr 4, cd 2) / `Ashen Eruption` (3×3, pwr 5, cd 2) |

---

## 5. Mathematical Difficulty Curve Check (Stages 1 to 5)

| Stage | Enemies (Count) | Total Enemy HP | Max Potential Damage / Enemy Turn | Accumulated Points per Hero | Expected Tactical Profile |
|---|---|---|---|---|---|
| **1 — Outpost Ruins** | 2 Goblin Scouts + 1 Melee Skeleton (3) | **13 HP** | 6 raw (`3–4` after armor) | `0` (base) | **Accessible**: each hero needs 2 hits (or 1 `Runic Strike`/`Marked Shot` skill on a goblin). Teaches cover, LoS, and `Defend` without unfair defeat risk. |
| **2 — Forgotten Swamp** | 2 Goblin Stalkers + 2 Goblin Scouts + 1 Skeleton Archer (5) | **24 HP** | 12 raw | `+1` | **Chokepoint tactics**: `Goblin Stalker` (`6 HP, 3 ATK`) drops the Mage (`7 HP`) in 3 hits (or 2 combined with the Archer). Holding the narrow bridges with the Knight defending (`3-1=2 → 1` damage) protects the backline. |
| **3 — Fortress of Bones** | 2 Shieldbearers + 2 Melee + 1 Archer + 1 Armored (6) | **47 HP** | 13 raw | `+2` | **Focus fire and stance breaking**: Shieldbearers (`11 HP, 1 DEF`) using `Defend` cut basic attacks from `3` down to `1`. Requires bypassing them with `Arcane Burst` (AoE magic), flanking via the fortress wings, and using `Runic Strike` (`4–5` raw). |
| **4 — Arcane Catacombs** | 2 Cultist Mages + 2 Necromancer Acolytes + 2 Armored Skeletons (6) | **48 HP** | 18 raw | `+3` | **Target priority and LoS**: Acolytes heal `3 HP` on Armored Skeletons (`11 HP, 2 DEF`) if ignored. Use catacomb walls to break Cultist LoS while Archer/Mage eliminate the Acolytes. |
| **5 — Corrupted Sanctuary** | Ashen Guardian + 1 Shieldbearer + 1 Acolyte (3) | **46 HP** *(28 Boss)* | `5–6` raw per hit + telegraphed AoE | `+4` | **Boss encounter**: `Ashen Slam` (`5` magic) and `Ashen Eruption` (`6` magic, `3×3`) deal `5–6` to unarmored targets (`3` if using `Defend`). Eliminating the Acolyte first prevents boss healing; stepping out of the red danger zone or using `Defend` and healing (`4–5 HP`) with the Cleric secures victory in ~6–8 rounds. |
