# Attribute System — Rune Tactics V4 (The Ashen Campaign)

This document specifies the four unit attributes, the configurable cap, the pure derived formulas, the action-type mapping, and the Fortitude progression rule between stages. All rules in this system live in `src/game/attributes/AttributeSystem.ts`, with no access to Three.js or the DOM.

---

## 1. The Four Attributes

Every unit (hero, regular enemy, and boss) has exactly four positive integer attributes defined in the `UnitAttributes` structure:

| Key | Name | Primary Role | Impact on Formulas |
|---|---|---|---|
| `str` | **Strength (STR)** | Physical melee combat | Increases damage of basic attacks and melee skills (`attackKind: 'melee'`). |
| `dex` | **Dexterity (DEX)** | Physical ranged combat | Increases damage of physical ranged basic attacks and skills (`attackKind: 'ranged'`). |
| `int` | **Intellect (INT)** | Offensive magic and healing | Increases magic damage (`attackKind: 'magic'`) and healing skill potency (`targetTeam: 'ally'`). |
| `fort` | **Fortitude (FORT)** | Vitality and resilience | Increases the unit's `maxHp` and adds passive resistance to total defense. |

### Configuration Constants (`src/config/gameConfig.ts`)

- `MIN_ATTRIBUTE = 1`
- `MAX_ATTRIBUTE = 12` (configurable cap; no attribute can exceed `MAX_ATTRIBUTE` through progression).
- `ATTRIBUTE_BASE_THRESHOLD = 4` (neutral reference baseline used in formulas).

---

## 2. Exact Pure Formulas

The formulas below are implemented as exported pure functions in `src/game/attributes/AttributeSystem.ts` and imported by `CombatSystem`, `UnitFactory`, and `CampaignSystem`.

### 2.1 Offensive / Magic Bonus

```ts
export function offensiveBonus(attr: number): number {
  return Math.floor(Math.max(0, attr - 4) / 3);
}
```

Lookup table (for quick reference and unit tests):

| `attr` value (`str`, `dex`, or `int`) | `Math.max(0, attr - 4)` | `offensiveBonus(attr)` |
|---|---|---|
| `1` to `4` | `0` | `+0` |
| `5` | `1` | `+0` |
| `6` | `2` | `+0` |
| `7` | `3` | `+1` |
| `8` | `4` | `+1` |
| `9` | `5` | `+1` |
| `10` | `6` | `+2` |
| `11` | `7` | `+2` |
| `12` (`MAX_ATTRIBUTE`) | `8` | `+2` |

### 2.2 Maximum HP (`calcMaxHp`)

```ts
export function calcMaxHp(baseHp: number, fort: number): number {
  return baseHp + 2 * Math.max(0, fort - 4);
}
```

Increment table above `baseHp`:

| `fort` value | Bonus over `baseHp` |
|---|---|
| `1` to `4` | `+0` |
| `5` | `+2` |
| `6` | `+4` |
| `7` | `+6` |
| `8` | `+8` |
| `9` | `+10` |
| `10` | `+12` |
| `11` | `+14` |
| `12` (`MAX_ATTRIBUTE`) | `+16` |

### 2.3 Fortitude Resistance (`fortitudeResistance`)

```ts
export function fortitudeResistance(fort: number): number {
  return Math.floor(Math.max(0, fort - 4) / 4);
}
```

Lookup table:

| `fort` value | `Math.max(0, fort - 4)` | `fortitudeResistance(fort)` |
|---|---|---|
| `1` to `7` | `0` to `3` | `+0` |
| `8` to `11` | `4` to `7` | `+1` |
| `12` (`MAX_ATTRIBUTE`) | `8` | `+2` |

A unit's total defense in combat is:

```ts
totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort);
```

---

## 3. Mapping by Attack and Skill Type

Damage or healing scaling is **never inferred from `attackRange`** — because magic units such as `mage` (`attackRange: 2`) and `cultist-mage` (`attackRange: 3`) have range greater than 1 yet scale with `int`, not `dex`. Instead, every unit and every offensive skill explicitly declares its `attackKind`:

```ts
export type AttackKind = 'melee' | 'ranged' | 'magic';
```

### Canonical Mapping Rule

| Action Type | Condition / Field | Attribute used in `offensiveBonus(attr)` |
|---|---|---|
| Physical melee attack | `attackKind === 'melee'` | `str` |
| Physical ranged attack | `attackKind === 'ranged'` | `dex` |
| Magic attack (basic, skill, or telegraphed) | `attackKind === 'magic'` | `int` |
| Healing skill | `skill.targetTeam === 'ally'` (`skill.heal > 0`) | `int` |

### Explicit Unit and Skill Mapping

- **Knight (`knight`)**: basic attack `'melee'` (`str`), `Runic Strike` `'melee'` (`str`).
- **Archer (`archer`)**: basic attack `'ranged'` (`dex`), `Marked Shot` `'ranged'` (`dex`).
- **Mage (`mage`)**: basic attack `'magic'` (`int`), `Arcane Burst` `'magic'` (`int`).
- **Cleric (`cleric`)**: basic attack `'melee'` (`str`), `Healing Light` heals via (`int`).
- **Physical melee enemies** (`goblin-scout`, `goblin-stalker`, `melee-skeleton`, `armored-skeleton`, `skeleton-shieldbearer`): `'melee'` (`str`).
- **Physical ranged enemy** (`skeleton-archer`): `'ranged'` (`dex`).
- **Magic enemies** (`cultist-mage`, `necromancer-acolyte`): basic attack `'magic'` (`int`); the acolyte's `Dark Mend` skill heals via (`int`).
- **Boss (`ashen-guardian`)**: basic attack `'melee'` (`str`); telegraphed attacks (`Ashen Slam` and `Ashen Eruption`) `'magic'` (`int`).

Pure helper function in `AttributeSystem.ts`:

```ts
export function getAttributeForAttack(
  attributes: UnitAttributes,
  attackKind: AttackKind,
): number {
  switch (attackKind) {
    case 'melee':
      return attributes.str;
    case 'ranged':
      return attributes.dex;
    case 'magic':
      return attributes.int;
  }
}
```

---

## 4. `FORT` Increase Rule Between Stages

During the campaign camp/evolution phase (described in `docs/campaign-design.md`), the player can invest attribute points earned after each victory. When a point is invested in **`fort`**, the mandatory rule is:

1. Validate that `hero.attributes.fort < MAX_ATTRIBUTE` and `hero.unspentPoints > 0`. If false, reject without mutating state.
2. Store `oldMaxHp = hero.maxHp` (equivalent to `calcMaxHp(baseHp, oldFort)`).
3. Increment `newFort = hero.attributes.fort + 1`.
4. Recalculate `newMaxHp = calcMaxHp(baseHp, newFort)`.
5. Compute the positive delta: `hpGain = Math.max(0, newMaxHp - oldMaxHp)`.
6. Update `hero.maxHp = newMaxHp`.
7. Add only `hpGain` to current `hp` (capped at `newMaxHp`):
   ```ts
   hero.hp = Math.min(newMaxHp, hero.hp + hpGain);
   ```

### `FORT` Rule Invariants

- **Never heals prior damage**: if a hero entered the camp at `7 / 12` HP after post-battle recovery (`fort = 6`) and gains `+1` in `fort` (`6 -> 7`, `newMaxHp = 14`, `hpGain = 2`), their HP becomes **`9 / 14`** (not `14 / 14`).
- If `fort` is incremented from a value `< 4` to `<= 4` (e.g., `3 -> 4`), `oldMaxHp === newMaxHp`, so `hpGain = 0` and current HP does not change.
- If `fort` increases from `7 -> 8`, in addition to `+2` `maxHp` and `+2` current `hp`, `fortitudeResistance(8)` changes from `0` to `1`, increasing the unit's total defense by `+1`.
- Because post-victory recovery (+35% for living / 25% revive for fallen) runs **before** the point-spending screen opens, `FORT` gains always apply after recovery deterministically and without double-counting.
