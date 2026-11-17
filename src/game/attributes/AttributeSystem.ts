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

/** Bônus ofensivo (ou mágico/cura) derivado de STR, DEX ou INT: +1 a cada 3 pontos acima de 4. */
export function offensiveBonus(attr: number): number {
  return Math.floor(Math.max(0, attr - ATTRIBUTE_BASE_THRESHOLD) / 3);
}

/** HP máximo derivado de `baseHp` e `fort`: +2 HP por ponto de Fortitude acima de 4. */
export function calcMaxHp(baseHp: number, fort: number): number {
  return baseHp + 2 * Math.max(0, fort - ATTRIBUTE_BASE_THRESHOLD);
}

/** Resistência passiva de Fortitude: +1 DEF a cada 4 pontos de Fortitude acima de 4. */
export function fortitudeResistance(fort: number): number {
  return Math.floor(Math.max(0, fort - ATTRIBUTE_BASE_THRESHOLD) / 4);
}

/** Seleciona o atributo relevante conforme o tipo explícito de ataque (`melee`, `ranged` ou `magic`). */
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

/** Poder efetivo do ataque básico da unidade (`basePower + offensiveBonus`). */
export function computeUnitDamage(
  basePower: number,
  attributes: UnitAttributes,
  attackKind: AttackKind,
): number {
  return basePower + offensiveBonus(getAttributeForAttack(attributes, attackKind));
}

/** Defesa efetiva da unidade (`baseArmor + fortitudeResistance`). */
export function computeUnitArmor(baseArmor: number, fort: number): number {
  return baseArmor + fortitudeResistance(fort);
}

/**
 * Aplica 1 ponto de atributo sem mutar o objeto de entrada.
 * Ao evoluir `fort`, soma ao `hp` atual apenas o incremento positivo de `maxHp`, sem curar dano prévio.
 */
export function applyAttributePoint<T extends AttributeProgressionTarget>(
  hero: T,
  key: AttributeKey,
): ApplyAttributeResult<T> {
  if (hero.unspentPoints <= 0) {
    return { ok: false, reason: 'Sem pontos de atributo disponíveis.' };
  }
  const currentValue = hero.attributes[key];
  if (currentValue >= MAX_ATTRIBUTE) {
    return { ok: false, reason: `Atributo ${key.toUpperCase()} já atingiu o limite máximo (${MAX_ATTRIBUTE}).` };
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
