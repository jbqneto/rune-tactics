# Combat System — Rune Tactics V4 (The Ashen Campaign)

This document specifies the centralized damage formula, the unification of the **Defend** action, the attribute-scaled healing formula, and the full lifecycle of **Telegraphed Attacks (`PendingAttack`)**. All logic resides in `src/game/combat/CombatSystem.ts`, `src/game/turns/TurnSystem.ts`, and `src/game/GameEngine.ts`.

---

## 1. Centralized Damage Formula

All combat damage — whether basic attack (`resolveAttack`), offensive skill (`resolveSkill`), or telegraphed attack (`resolvePendingAttack`) — goes through a single centralized pure function in `CombatSystem.ts` (`computeDamage`).

### Full Equation

```ts
const mainAttr = getAttributeForAttack(attacker.attributes, attackKind);
const attackPower = basePower + offensiveBonus(mainAttr);
const totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort);
const damageBeforeGuard = Math.max(1, attackPower - totalDefense);
const finalDamage = target.isGuarding
  ? Math.max(1, Math.ceil(damageBeforeGuard * 0.5))
  : damageBeforeGuard;
```

### Parameters by Source

| Hit Source | `basePower` | `attackKind` |
|---|---|---|
| Basic attack (`resolveAttack`) | `attacker.basePower` | `attacker.attackKind` |
| Offensive skill (`resolveSkill`) | `skill.damage` | `skill.attackKind` |
| Telegraphed attack (`PendingAttack`) | `pending.basePower` | `pending.attackKind` |

### Guarantees and Edge Cases

- **Minimum damage floor = 1**: even if `totalDefense >= attackPower`, `damageBeforeGuard` is at least `1`, and even when `target.isGuarding` is active with `damageBeforeGuard === 1`, `Math.max(1, Math.ceil(1 * 0.5)) === 1`. Every landed attack deals at least `1` damage.
- **Guard rounding**: `Math.ceil(damageBeforeGuard * 0.5)` rounds halves up (`3 -> 2`, `4 -> 2`, `5 -> 3`).
- **Resulting HP**: `target.hp = Math.max(0, target.hp - finalDamage)`. If `target.hp === 0`, `target.alive = false`, `target.isGuarding = false`, and `unitDied` is emitted.

---

## 2. Defend Action (`defend()`) — V4 Unification

In V3 there was a prototype `defend()` that added a numeric shield (`GUARD_SHIELD = 2` and `SHIELD_WALL_BONUS = 1`). **In V4, `defend()` is unified into a pure 50% mitigation defensive stance**, with no absorbing numeric shield (`shield`) and no adjacent Shield Wall bonus.

### Defend Action Rules

1. **Action consumption**: `defend()` replaces the basic attack or skill for that activation (`unit.hasAttacked = true`).
2. **Free turn order**:
   - Can be used **before moving** (`hasMoved === false`, `hasAttacked === false`): activates the defensive stance and keeps the activation open so the unit can still move or end manually.
   - Can be used **after moving** (`hasMoved === true`, `hasAttacked === false`): activates the defensive stance and automatically ends the activation (`hasMoved && hasAttacked`), passing the turn forward.
   - If `unit.hasAttacked === true`, it is rejected with `{ ok: false, reason }` without mutating state or emitting events.
3. **Effect**: sets `unit.isGuarding = true` and emits `{ type: 'unitGuarded', unitId: unit.id }`.
4. **Exact duration**:
   - Remains active for the remainder of the current round and the start of the next round **until the start of the unit's own next activation** (or until its death).
   - When `TurnSystem.advanceTurn` selects `nextUnit` to start its new activation, it sets `nextUnit.isGuarding = false` before emitting `activationStarted` (and before resolving any actions of the new turn).
   - Edge-case note: can `nextUnit` have prepared a `PendingAttack` and used Defend before? Not on the same turn, because both preparing and defending consume `hasAttacked`; however, if a unit is defending and gets hit by an enemy's telegraphed attack before its next activation, `isGuarding === true` reduces the telegraphed attack's damage by 50%!
5. **Undo move (`undoMove`)**: just like attacking or using a skill, executing `defend()` after moving clears `undoSnapshot` (`canUndoMove` becomes `false`), since the tactical action has already been taken.
6. **V3 prototype cleanup and compatibility**:
   - Removed `GUARD_SHIELD` and `SHIELD_WALL_BONUS` from `src/config/gameConfig.ts`.
   - Removed `shield` from `UnitState` and `shieldAbsorbed` from `unitAttacked` in `src/shared/types.ts`, simplifying `unitGuarded` to `{ type: 'unitGuarded'; unitId: string }` (and adding optional `wasGuarded?: boolean` on `unitAttacked` for mitigation feedback in HUD/renderer).
   - Updated `tests/defend.test.ts`, `UnitRenderer.ts` (displays `shieldAura` when `unit.alive && unit.isGuarding`), and `HudManager.ts` (shows `🛡 Defending (-50%)` badge when `unit.isGuarding`).

---

## 3. Healing (`Healing Light` and `Dark Mend`)

Skills with `targetTeam === 'ally'` apply the `INT`-scaled healing formula:

```ts
const healPower = skill.heal + offensiveBonus(caster.attributes.int);
const actualHeal = Math.min(healPower, target.maxHp - target.hp);
target.hp += actualHeal;
```

### Healing Rules

- Valid only for **living** targets (`target.alive === true`), on the **same team** as the caster (`target.team === caster.team`), with `target.hp < target.maxHp`.
- **Never heals dead units** (`!target.alive`).
- The caster may heal themselves (`manhattan === 0`).
- Healing never exceeds `target.maxHp`.
- If `skill.range > 1`, requires line of sight (`hasLineOfSight`) from the caster to the target cell.
- `isGuarding` on the target **does not** reduce incoming healing.
- Consumes `hasAttacked = true` and sets `skillCooldown = skill.cooldown`.

---

## 4. Telegraphed Attacks (`PendingAttack`)

To create tactical readability in advanced encounters and the boss fight (`ashen-guardian`), high-impact area attacks use a two-turn cycle called **Telegraphed Attack (`PendingAttack`)**.

### Data Structure (`src/shared/types.ts`)

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

### Full Lifecycle

1. **Preparation (Caster's Activation $N$)**:
   - The caster (via AI decision) chooses to prepare the attack on a fixed set of valid cells within the grid (`targetCells`).
   - Preparation **consumes the turn's tactical action** (`caster.hasAttacked = true`) and applies the skill cooldown (`caster.skillCooldown = cooldown`).
   - Creates a `PendingAttack` with a deterministic ID (e.g., `${caster.id}-pending-${round}-${counter}`) and inserts it into `pendingAttacks`.
   - Emits `{ type: 'attackPrepared', pendingAttack }` (immutable copy of coordinates).
   - `GameStateSnapshot.pendingAttacks` exposes a copy of the list so `BoardRenderer` highlights all `targetCells` as **danger cells** throughout the round until resolution or cancellation.

2. **Player Reaction (between Caster's Activation $N$ and Activation $N+1$)**:
   - The player sees the exact marked cells and knows which caster is channeling the strike.
   - The player has three meaningful tactical responses:
     1. **Move out of the area** with `moveSelectedUnit` or `smartAttack`;
     2. **Use `Defend`** to cut the impact damage in half (`-50%`);
     3. **Slay the caster** before its next activation to cancel the attack!

3. **Cancellation on Caster Death**:
   - If the caster dies (`alive` becomes `false`) before the start of its next activation:
   - All `PendingAttack` entries with `casterId === deadUnit.id` are immediately removed from `pendingAttacks` during the action that caused the death.
   - For each one, emits `{ type: 'attackCancelled', pendingAttackId, casterId, reason: 'caster_died' }` right after `unitDied`.
   - The danger cells vanish from the board immediately.

4. **Resolution (Start of the living caster's next activation)**:
   - At the exact moment `TurnSystem.advanceTurn` advances the cursor to the caster and it is alive (`nextUnit.alive === true`), after clearing `nextUnit.isGuarding = false` and emitting `activationStarted`:
   - The engine (`GameEngine` delegating to `CombatSystem.resolvePendingAttacksForUnit`) finds all `PendingAttack` entries with `casterId === nextUnit.id`, removes them from `pendingAttacks`, and resolves them **before** `nextUnit` executes any new actions for the newly started activation.
   - For each `PendingAttack`:
     - Filters all **living units of the opposing team** (`u.alive && u.team !== caster.team`) whose `pos` is in `pending.targetCells` (an enemy telegraphed attack **does not** damage other enemies; consistent with `Arcane Burst`).
     - First emits the grouping event `{ type: 'pendingAttackResolved', pendingAttackId, casterId, skillName, targetCells, affectedUnitIds }`.
     - Next, for each affected victim, applies `computeDamage` with `pending.basePower` and `pending.attackKind` against the victim's current defense and `isGuarding`, emitting `unitAttacked` (with `pendingAttackId`, and `wasGuarded` if applicable) and, if `hp === 0`, `unitDied`.
   - Immediately after resolving pending attacks, checks for battle end (`checkBattleEnd`). If all heroes fell from the impact, emits `battleEnded` (`winner: 'enemy'`) and the caster **does not** start any additional actions.
   - If the battle continues, the caster's normal activation proceeds with `hasMoved = false` and `hasAttacked = false`.

### Event Contiguity Guarantee

Just like skills (`skillUsed` followed by `unitAttacked`), events from a resolved `PendingAttack` always arrive contiguously in the same `consumeEvents()` batch:
`pendingAttackResolved` → `unitAttacked` (for each victim) → `unitDied` (for each casualty), allowing `UnitRenderer` to animate a single simultaneous explosion/impact across the entire marked zone.
