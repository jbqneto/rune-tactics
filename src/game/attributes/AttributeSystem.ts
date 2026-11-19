import { ATTRIBUTE_BASE_THRESHOLD, MAX_ATTRIBUTE } from '../../config/gameConfig';
import type { AttackKind, AttributeKey, UnitAttributes } from '../../shared/types';

export interface AttributeProgressionTarget {
  baseHp: number;
  hp: number;
  maxHp: number;
  attributes: UnitAttributes;
  unspentPoints: number;
}

export type ApplyAttributeResult<T extends AttributeProgressionTarget> =
  | { ok: true; hero: T }
  | { ok: false; reason: string };

/** Offensive (or magic/healing) bonus derived from STR, DEX, or INT: +1 per 3 points above 4. */
export function offensiveBonus(attr: number): number {
  return Math.floor(Math.max(0, attr - ATTRIBUTE_BASE_THRESHOLD) / 3);
}

/** Max HP derived from `baseHp` and `fort`: +2 HP per Fortitude point above 4. */
export function calcMaxHp(baseHp: number, fort: number): number {
  return baseHp + 2 * Math.max(0, fort - ATTRIBUTE_BASE_THRESHOLD);
}

/** Passive Fortitude resistance: +1 DEF per 4 Fortitude points above 4. */
export function fortitudeResistance(fort: number): number {
  return Math.floor(Math.max(0, fort - ATTRIBUTE_BASE_THRESHOLD) / 4);
}

/** Selects the relevant attribute according to the explicit attack kind (`melee`, `ranged`, or `magic`). */
export function getAttributeForAttack(attributes: UnitAttributes, attackKind: AttackKind): number {
  switch (attackKind) {
    case 'melee':
      return attributes.str;
    case 'ranged':
      return attributes.dex;
    case 'magic':
      return attributes.int;
  }
}

/** Effective basic attack power of the unit (`basePower + offensiveBonus`). */
export function computeUnitDamage(
  basePower: number,
  attributes: UnitAttributes,
  attackKind: AttackKind,
): number {
  return basePower + offensiveBonus(getAttributeForAttack(attributes, attackKind));
}

/** Effective defense of the unit (`baseArmor + fortitudeResistance`). */
export function computeUnitArmor(baseArmor: number, fort: number): number {
  return baseArmor + fortitudeResistance(fort);
}

/**
 * Applies 1 attribute point without mutating the input object.
 * When upgrading `fort`, adds only the positive `maxHp` increment to current `hp`, without healing prior damage.
 */
export function applyAttributePoint<T extends AttributeProgressionTarget>(
  hero: T,
  key: AttributeKey,
): ApplyAttributeResult<T> {
  if (hero.unspentPoints <= 0) {
    return { ok: false, reason: 'No attribute points available.' };
  }
  const currentValue = hero.attributes[key];
  if (currentValue >= MAX_ATTRIBUTE) {
    return { ok: false, reason: `Attribute ${key.toUpperCase()} has already reached the maximum limit (${MAX_ATTRIBUTE}).` };
  }

  const nextValue = currentValue + 1;
  const nextAttributes: UnitAttributes = {
    ...hero.attributes,
    [key]: nextValue,
  };

  let nextMaxHp = hero.maxHp;
  let nextHp = hero.hp;

  if (key === 'fort') {
    const oldMaxHp = hero.maxHp;
    nextMaxHp = calcMaxHp(hero.baseHp, nextValue);
    const hpGain = Math.max(0, nextMaxHp - oldMaxHp);
    nextHp = Math.min(nextMaxHp, hero.hp + hpGain);
  }

  return {
    ok: true,
    hero: {
      ...hero,
      attributes: nextAttributes,
      maxHp: nextMaxHp,
      hp: nextHp,
      unspentPoints: hero.unspentPoints - 1,
    },
  };
}
