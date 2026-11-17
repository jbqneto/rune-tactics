import { describe, expect, it } from 'vitest';
import { MAX_ATTRIBUTE, MIN_ATTRIBUTE } from '../src/config/gameConfig';
import {
  applyAttributePoint,
  calcMaxHp,
  computeUnitArmor,
  computeUnitDamage,
  fortitudeResistance,
  getAttributeForAttack,
  offensiveBonus,
  type AttributeProgressionTarget,
} from '../src/game/attributes/AttributeSystem';
import type { UnitAttributes } from '../src/shared/types';

describe('AttributeSystem (V4)', () => {
  it('calcula offensiveBonus corretamente para valores de 1 a 12', () => {
    const expected: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 1,
      8: 1,
      9: 1,
      10: 2,
      11: 2,
      12: 2,
    };
    for (let attr = MIN_ATTRIBUTE; attr <= MAX_ATTRIBUTE; attr++) {
      expect(offensiveBonus(attr)).toBe(expected[attr]);
    }
  });

  it('calcula calcMaxHp corretamente para fort de 1 a 12', () => {
    const baseHp = 8;
    expect(calcMaxHp(baseHp, 1)).toBe(8);
    expect(calcMaxHp(baseHp, 4)).toBe(8);
    expect(calcMaxHp(baseHp, 5)).toBe(10);
    expect(calcMaxHp(baseHp, 6)).toBe(12);
    expect(calcMaxHp(baseHp, 8)).toBe(16);
    expect(calcMaxHp(baseHp, 12)).toBe(24);
  });

  it('calcula fortitudeResistance corretamente para fort de 1 a 12', () => {
    for (let fort = 1; fort <= 7; fort++) {
      expect(fortitudeResistance(fort)).toBe(0);
    }
    for (let fort = 8; fort <= 11; fort++) {
      expect(fortitudeResistance(fort)).toBe(1);
    }
    expect(fortitudeResistance(12)).toBe(2);
  });

  it('mapeia corretamente o atributo pelo attackKind explícito', () => {
    const attrs: UnitAttributes = { str: 6, dex: 8, int: 10, fort: 5 };
    expect(getAttributeForAttack(attrs, 'melee')).toBe(6);
    expect(getAttributeForAttack(attrs, 'ranged')).toBe(8);
    expect(getAttributeForAttack(attrs, 'magic')).toBe(10);

    expect(computeUnitDamage(2, attrs, 'melee')).toBe(2);
    expect(computeUnitDamage(2, attrs, 'ranged')).toBe(3);
    expect(computeUnitDamage(2, attrs, 'magic')).toBe(4);
    expect(computeUnitArmor(1, 5)).toBe(1);
    expect(computeUnitArmor(1, 8)).toBe(2);
  });

  describe('applyAttributePoint', () => {
    it('aplica ponto em str/dex/int sem mutar o objeto original', () => {
      const hero: AttributeProgressionTarget = {
        baseHp: 8,
        hp: 10,
        maxHp: 12,
        attributes: { str: 6, dex: 4, int: 3, fort: 6 },
        unspentPoints: 2,
      };
      const res = applyAttributePoint(hero, 'str');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.hero.attributes.str).toBe(7);
        expect(res.hero.unspentPoints).toBe(1);
        expect(res.hero.hp).toBe(10);
        expect(res.hero.maxHp).toBe(12);
      }
      // Imutabilidade
      expect(hero.attributes.str).toBe(6);
      expect(hero.unspentPoints).toBe(2);
    });

    it('ao aumentar FORT de 6 para 7 com dano prévio (7/12), soma apenas +2 de hpGain -> 9/14 sem curar dano anterior', () => {
      const hero: AttributeProgressionTarget = {
        baseHp: 8,
        hp: 7,
        maxHp: 12,
        attributes: { str: 6, dex: 4, int: 3, fort: 6 },
        unspentPoints: 1,
      };
      const res = applyAttributePoint(hero, 'fort');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.hero.attributes.fort).toBe(7);
        expect(res.hero.maxHp).toBe(14);
        expect(res.hero.hp).toBe(9);
        expect(res.hero.unspentPoints).toBe(0);
      }
    });

    it('ao aumentar FORT de 3 para 4 (abaixo do limiar 4), hpGain é 0 e hp não muda', () => {
      const hero: AttributeProgressionTarget = {
        baseHp: 8,
        hp: 5,
        maxHp: 8,
        attributes: { str: 4, dex: 4, int: 4, fort: 3 },
        unspentPoints: 1,
      };
      const res = applyAttributePoint(hero, 'fort');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.hero.attributes.fort).toBe(4);
        expect(res.hero.maxHp).toBe(8);
        expect(res.hero.hp).toBe(5);
      }
    });

    it('recusa evolução quando unspentPoints <= 0 ou atributo está em MAX_ATTRIBUTE (12)', () => {
      const noPoints: AttributeProgressionTarget = {
        baseHp: 8,
        hp: 8,
        maxHp: 8,
        attributes: { str: 6, dex: 4, int: 3, fort: 4 },
        unspentPoints: 0,
      };
      expect(applyAttributePoint(noPoints, 'str').ok).toBe(false);

      const maxed: AttributeProgressionTarget = {
        baseHp: 8,
        hp: 8,
        maxHp: 8,
        attributes: { str: MAX_ATTRIBUTE, dex: 4, int: 3, fort: 4 },
        unspentPoints: 1,
      };
      const res = applyAttributePoint(maxed, 'str');
      expect(res.ok).toBe(false);
      expect(maxed.attributes.str).toBe(MAX_ATTRIBUTE);
      expect(maxed.unspentPoints).toBe(1);
    });
  });
});
