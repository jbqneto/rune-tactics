import { describe, expect, it } from 'vitest';
import { computeDamage } from '../src/game/combat/CombatSystem';
import { createUnit } from '../src/game/entities/UnitFactory';
import { GameEngine } from '../src/game/GameEngine';
import { knightAt, archerAt, meleeAt, armoredAt } from './helpers';

describe('Unified defensive stance (V4 Defend)', () => {
  it('activates isGuarding on the unit and emits simplified unitGuarded without affecting adjacent allies', () => {
    const engine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-1'),
        archerAt(3, 2, 'archer-1'),
        meleeAt(2, 7, 'enemy-1'),
      ],
    });
    engine.consumeEvents();

    const res = engine.defend();
    expect(res).toEqual({ ok: true });

    const events = engine.consumeEvents();
    expect(events).toEqual([
      {
        type: 'unitGuarded',
        unitId: 'knight-1',
      },
    ]);

    const state = engine.getState();
    const knight = state.units.find((u) => u.id === 'knight-1')!;
    const adjArcher = state.units.find((u) => u.id === 'archer-1')!;

    expect(knight.isGuarding).toBe(true);
    expect(knight.hasAttacked).toBe(true);
    expect(knight.hasMoved).toBe(false);
    expect(state.activeUnitId).toBe('knight-1');
    expect(adjArcher.isGuarding).toBe(false);
  });

  it('reduces damage by 50% (ceil, floor 1), emits wasGuarded, and clears isGuarding on next activation', () => {
    const engine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-1'), // 12 HP, 1 DEF
        armoredAt(2, 3, 'enemy-1'), // 3 ATK -> damageBeforeGuard = 2 -> guarded = ceil(2 * 0.5) = 1
      ],
    });
    engine.consumeEvents();

    expect(engine.defend()).toEqual({ ok: true });
    expect(engine.endPlayerTurn()).toEqual({ ok: true });
    engine.consumeEvents();

    expect(engine.executeNextEnemyAction()).toBe(true);
    const attackEvents = engine.consumeEvents();
    expect(attackEvents).toContainEqual({
      type: 'unitAttacked',
      attackerId: 'enemy-1',
      targetId: 'knight-1',
      damage: 1,
      targetHpRemaining: 11,
      wasGuarded: true,
      isRanged: false,
    });

    // Advances the enemy turn to start round 2 for the knight
    expect(engine.executeNextEnemyAction()).toBe(false);

    const stateRound2 = engine.getState();
    const knightRound2 = stateRound2.units.find((u) => u.id === 'knight-1')!;
    expect(knightRound2.hp).toBe(11);
    expect(knightRound2.isGuarding).toBe(false);
  });

  it('rounds mitigation up and respects minimum floor of 1 damage', () => {
    const attacker = createUnit(armoredAt(0, 0, 'armored-1')); // 3 ATK (basePower 2, str 7 -> +1)
    const archer = createUnit(archerAt(0, 1, 'archer-1')); // 0 DEF
    archer.isGuarding = true;
    // damageBeforeGuard = 3 -> ceil(3 * 0.5) = 2
    expect(computeDamage(attacker, archer, attacker.basePower, attacker.attackKind)).toBe(2);

    const weakAttacker = createUnit(meleeAt(0, 0, 'sk-1')); // 2 ATK
    const knight = createUnit(knightAt(0, 1, 'knight-1')); // 1 DEF
    knight.isGuarding = true;
    // damageBeforeGuard = 2 - 1 = 1 -> max(1, ceil(1 * 0.5)) = 1
    expect(computeDamage(weakAttacker, knight, weakAttacker.basePower, weakAttacker.attackKind)).toBe(1);
  });

  it('rejects Defend if the unit has already used its attack action this activation', () => {
    const engine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-1'),
        meleeAt(2, 3, 'enemy-1'),
        meleeAt(7, 7, 'enemy-2'),
      ],
    });

    expect(engine.attackTarget('enemy-1')).toEqual({ ok: true });
    const res = engine.defend();
    expect(res.ok).toBe(false);
  });

  it('allows moving after defending and automatically ends activation after moving and defending', () => {
    const engine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-1'),
        meleeAt(7, 7, 'enemy-1'),
      ],
    });

    expect(engine.moveSelectedUnit({ x: 2, y: 3 })).toEqual({ ok: true });
    expect(engine.getState().activeUnitId).toBe('knight-1');
    expect(engine.defend()).toEqual({ ok: true });
    expect(engine.getState().activeUnitId).toBe('enemy-1');
    expect(engine.getState().turnState).toBe('enemy_activation');
  });
});
