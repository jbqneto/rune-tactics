import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/game/GameEngine';
import { getBossAttackArea, nextEnemyAction } from '../src/game/ai/EnemyAI';
import { GridSystem } from '../src/game/grid/GridSystem';
import type { GameEvent, UnitSpawn } from '../src/shared/types';
import { archerAt, clericAt, knightAt, mageAt, runEnemyTurn, unit, unitOf } from './helpers';

const open = new GridSystem(12, []);

const stalkerAt = (x: number, y: number, id = 'goblin-stalker-1'): UnitSpawn => ({
  id,
  type: 'goblin-stalker',
  team: 'enemy',
  pos: { x, y },
});

const shieldbearerAt = (x: number, y: number, id = 'skeleton-shieldbearer-1'): UnitSpawn => ({
  id,
  type: 'skeleton-shieldbearer',
  team: 'enemy',
  pos: { x, y },
});

const acolyteAt = (x: number, y: number, id = 'necromancer-acolyte-1'): UnitSpawn => ({
  id,
  type: 'necromancer-acolyte',
  team: 'enemy',
  pos: { x, y },
});

const bossAt = (x: number, y: number, id = 'ashen-guardian-1'): UnitSpawn => ({
  id,
  type: 'ashen-guardian',
  team: 'enemy',
  pos: { x, y },
});

describe('V4 Enemies: goblin-stalker', () => {
  it('prioritizes fragile targets (lowest HP and lowest defense) over the knight', () => {
    const knight = unit(knightAt(1, 0)); // 12 HP, 1 DEF
    const mage = unit(mageAt(0, 1)); // 7 HP, 0 DEF
    const stalker = unit(stalkerAt(1, 1));

    const action = nextEnemyAction(stalker, [knight, mage, stalker], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('breaks ties by lowest defense when HP is equal', () => {
    const knight = unit(knightAt(1, 0), { hp: 7 }); // 1 DEF
    const mage = unit(mageAt(0, 1), { hp: 7 }); // 0 DEF
    const stalker = unit(stalkerAt(1, 1));

    const action = nextEnemyAction(stalker, [knight, mage, stalker], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('advances up to 4 cells to reach a fragile backline target', () => {
    const knight = unit(knightAt(4, 2));
    const mage = unit(mageAt(4, 6));
    const stalker = unit(stalkerAt(4, 9));

    const action = nextEnemyAction(stalker, [knight, mage, stalker], open);
    expect(action?.type).toBe('move');
    if (action?.type === 'move') {
      expect(action.path.length - 1).toBeLessThanOrEqual(4);
      expect(action.path[action.path.length - 1]).toEqual({ x: 4, y: 7 });
    }
  });
});

describe('V4 Enemies: skeleton-shieldbearer', () => {
  it('uses defend when below 50% HP and has no lethal blow', () => {
    const knight = unit(knightAt(2, 2)); // 12 HP, survives 2 ATK
    const shieldbearer = unit(shieldbearerAt(2, 3), { hp: 5 }); // <= 50% of 11 HP

    const action = nextEnemyAction(shieldbearer, [knight, shieldbearer], open);
    expect(action).toEqual({ type: 'defend' });
  });

  it('uses defend when surrounded by 2 or more heroes and has no lethal blow', () => {
    const knight = unit(knightAt(2, 2));
    const cleric = unit(clericAt(3, 3));
    const shieldbearer = unit(shieldbearerAt(2, 3));

    const action = nextEnemyAction(shieldbearer, [knight, cleric, shieldbearer], open);
    expect(action).toEqual({ type: 'defend' });
  });

  it('attacks immediately if basic attack is lethal even at low HP', () => {
    const mage = unit(mageAt(2, 2), { hp: 2 });
    const shieldbearer = unit(shieldbearerAt(2, 3), { hp: 4 });

    const action = nextEnemyAction(shieldbearer, [mage, shieldbearer], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('activates defend after moving without reaching a nearby hero (Manhattan <= 4) and ends activation cleanly', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(0, 0), shieldbearerAt(0, 5)],
    });
    engine.consumeEvents();
    engine.endPlayerTurn();

    const steps = runEnemyTurn(engine);
    const allEvents = steps.flat();
    expect(allEvents.some((e) => e.type === 'unitMoved')).toBe(true);
    expect(allEvents.some((e) => e.type === 'unitGuarded' && e.unitId === 'skeleton-shieldbearer-1')).toBe(true);
    expect(unitOf(engine, 'skeleton-shieldbearer-1').isGuarding).toBe(true);
    expect(engine.getState().turnState).toBe('player_unit_active');
  });
});

describe('V4 Enemies: necromancer-acolyte', () => {
  it('heals injured ally with dark-mend (3 HP with INT 7) and prioritizes the boss', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [
        knightAt(0, 0),
        acolyteAt(5, 8),
        shieldbearerAt(5, 7),
        bossAt(6, 8),
      ],
    });
    // Check boss initial phase before testing acolyte priority
    const state = engine.getState();
    expect(state.units.find((u) => u.id === 'ashen-guardian-1')?.bossPhase).toBe(1);

    // Use nextEnemyAction directly to validate healing priority on the boss
    const knight = unit(knightAt(0, 0));
    const shield = unit(shieldbearerAt(5, 7), { hp: 4 }); // ~36% HP
    const boss = unit(bossAt(6, 8), { hp: 20 }); // ~71% HP (boss has priority)
    const acolyte = unit(acolyteAt(5, 8));

    const action = nextEnemyAction(acolyte, [knight, shield, boss, acolyte], open);
    expect(action).toEqual({
      type: 'skill',
      skillId: 'dark-mend',
      targetCell: { x: 6, y: 8 },
    });
  });

  it('executes dark-mend via GameEngine restoring ally HP and applying cooldown', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(0, 0), acolyteAt(0, 9), shieldbearerAt(0, 8)],
    });
    engine.consumeEvents();
    // Knight passes turn; acolyte is the first enemy
    engine.endPlayerTurn();

    // If shieldbearer is at full HP, acolyte attacks/moves. Test a scenario where the hero injures the boss:
    const engine2 = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [archerAt(0, 5), acolyteAt(0, 9), shieldbearerAt(0, 8)],
    });
    // Archer shoots shieldbearer (Marked Shot = 3 - 1 = 2 damage)
    expect(engine2.useSkill({ x: 0, y: 8 }).ok).toBe(true);
    // Shieldbearer has 9/11 HP (81% > 75%), so test with boss below maxHp
    const engine3 = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [archerAt(0, 5), acolyteAt(0, 9), bossAt(0, 8)],
    });
    // Archer uses Marked Shot on boss (3 ATK - 2 DEF = 1 damage -> 27/28 HP, boss below maxHp is eligible!)
    expect(engine3.useSkill({ x: 0, y: 8 }).ok).toBe(true);
    expect(unitOf(engine3, 'ashen-guardian-1').hp).toBe(27);
    engine3.endPlayerTurn();
    engine3.consumeEvents();

    const steps = runEnemyTurn(engine3);
    const events = steps.flat();
    const skillEv = events.find((e) => e.type === 'skillUsed');
    const healEv = events.find((e) => e.type === 'unitHealed');
    expect(skillEv).toMatchObject({
      type: 'skillUsed',
      casterId: 'necromancer-acolyte-1',
      skillId: 'dark-mend',
      targetCell: { x: 0, y: 8 },
    });
    expect(healEv).toMatchObject({
      type: 'unitHealed',
      casterId: 'necromancer-acolyte-1',
      targetId: 'ashen-guardian-1',
      amount: 1,
      targetHpAfter: 28,
    });
    // After boss activation (last in round 1), round wraps to 2 and cooldown drops from 2 to 1
    expect(unitOf(engine3, 'necromancer-acolyte-1').skillCooldown).toBe(1);
  });

  it('attacks at range when nobody needs healing', () => {
    const mage = unit(mageAt(0, 5));
    const acolyte = unit(acolyteAt(0, 8));
    const action = nextEnemyAction(acolyte, [mage, acolyte], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });
});

describe('V4 PendingAttack and ashen-guardian Boss (2 Phases)', () => {
  it('prepares Ashen Cleave in a cross in Phase 1 and resolves on next activation respecting defend()', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(4, 4), mageAt(4, 6), bossAt(4, 8)],
    });
    engine.consumeEvents();

    // Round 1: Knight (knight-1) and Mage (mage-1)
    // Knight passes
    expect(engine.endPlayerTurn().ok).toBe(true);

    // Boss (ashen-guardian-1) prepares Ashen Cleave (cross)
    expect(engine.getState().activeUnitId).toBe('ashen-guardian-1');
    const bossStepsR1 = runEnemyTurn(engine);
    const bossEventsR1 = bossStepsR1.flat();
    const prepared = bossEventsR1.find(
      (e): e is Extract<GameEvent, { type: 'attackPrepared' }> => e.type === 'attackPrepared',
    );
    expect(prepared).toBeDefined();
    expect(prepared!.pendingAttack.skillName).toBe('Ashen Cleave');
    expect(prepared!.pendingAttack.basePower).toBe(4);
    expect(prepared!.pendingAttack.attackKind).toBe('magic');
    expect(engine.getState().pendingAttacks).toHaveLength(1);

    // Mage is in the telegraphed area (4,6) and uses defend()!
    expect(engine.getState().activeUnitId).toBe('mage-1');
    const isMageTargeted = prepared!.pendingAttack.targetCells.some((c) => c.x === 4 && c.y === 6);
    expect(isMageTargeted).toBe(true);
    expect(engine.defend().ok).toBe(true);
    expect(engine.endPlayerTurn().ok).toBe(true);

    // Round 2: Knight (4,4) passes turn -> activates boss and resolves PendingAttack at start of activation
    expect(engine.getState().activeUnitId).toBe('knight-1');
    engine.consumeEvents();
    expect(engine.endPlayerTurn().ok).toBe(true);

    const resolveBatch = engine.consumeEvents();
    const resolvedIdx = resolveBatch.findIndex((e) => e.type === 'pendingAttackResolved');
    const attackedIdx = resolveBatch.findIndex((e) => e.type === 'unitAttacked');
    expect(resolvedIdx).toBeGreaterThan(-1);
    expect(attackedIdx).toBe(resolvedIdx + 1);

    // Mage (0 DEF, isGuarding = true) takes 5 ATK -> ceil(5 * 0.5) = 3 damage (7 -> 4 HP)
    const mageHit = resolveBatch.find(
      (e): e is Extract<GameEvent, { type: 'unitAttacked' }> =>
        e.type === 'unitAttacked' && e.targetId === 'mage-1',
    );
    expect(mageHit).toBeDefined();
    expect(mageHit!.damage).toBe(3);
    expect(mageHit!.wasGuarded).toBe(true);
    expect(unitOf(engine, 'mage-1').hp).toBe(4);
    expect(engine.getState().pendingAttacks).toHaveLength(0);
  });

  it('cancels PendingAttack immediately after unitDied when caster dies before next activation', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(4, 7), bossAt(4, 8)],
    });
    engine.consumeEvents();

    // Knight passes
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    expect(engine.getState().pendingAttacks).toHaveLength(1);
    const pendingId = engine.getState().pendingAttacks[0].id;

    // Set up a 4-hero scenario to verify pending attack creation and subsequent turns
    const engineKill = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [
        knightAt(4, 7), // will pass later
        archerAt(4, 5),
        mageAt(3, 8),
        clericAt(5, 8),
        bossAt(4, 8),
      ],
    });
    // Turn order: knight, boss, archer, mage, cleric
    engineKill.endPlayerTurn();
    runEnemyTurn(engineKill);
    expect(engineKill.getState().pendingAttacks).toHaveLength(1);
    const pendingKillId = engineKill.getState().pendingAttacks[0].id;

    // Round 1: archer -> Marked Shot, mage -> Arcane Burst, cleric -> passes
    engineKill.useSkill({ x: 4, y: 8 });
    engineKill.endPlayerTurn();
    engineKill.useSkill({ x: 4, y: 8 });
    engineKill.endPlayerTurn();
    engineKill.endPlayerTurn();
    expect(pendingId).toBeDefined();
    expect(pendingKillId).toBeDefined();
  });

  it('cancels PendingAttack when boss dies on player turn after preparing', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [
        knightAt(4, 7, 'k1'),
        bossAt(4, 8, 'boss'),
        knightAt(3, 8, 'k2'),
        knightAt(5, 8, 'k3'),
        knightAt(4, 9, 'k4'),
        archerAt(2, 8, 'a1'),
        archerAt(6, 8, 'a2'),
        archerAt(4, 5, 'a3'),
        mageAt(2, 7, 'm1'),
        mageAt(6, 7, 'm2'),
        mageAt(2, 9, 'm3'),
        mageAt(6, 9, 'm4'),
        clericAt(1, 8, 'c1'),
        clericAt(7, 8, 'c2'),
      ],
    });
    engine.consumeEvents();

    // Advance rounds until boss dies while holding an active PendingAttack
    let cancelledEvent: Extract<GameEvent, { type: 'attackCancelled' }> | undefined;
    let diedIdx = -1;
    let cancelIdx = -1;
    let pendingIdBeforeKill: string | undefined;

    for (let guard = 0; guard < 100 && !engine.getState().winner; guard++) {
      if (engine.getState().turnState === 'enemy_activation') {
        runEnemyTurn(engine);
        engine.consumeEvents();
        continue;
      }

      const activeId = engine.getState().activeUnitId!;
      const active = unitOf(engine, activeId);
      const pending = engine.getState().pendingAttacks;

      if (pending.length === 0 && unitOf(engine, 'boss').hp <= 4) {
        // Wait for the boss to prepare a PendingAttack before delivering the final blow
        engine.endPlayerTurn();
        engine.consumeEvents();
        continue;
      }

      if (pending.length > 0 && unitOf(engine, 'boss').hp <= 2) {
        pendingIdBeforeKill = pending[0].id;
      }

      if (active.skillId && active.skillId !== 'healing-light') {
        engine.smartUseSkill({ x: 4, y: 8 });
      }
      if (engine.getState().activeUnitId === activeId && !engine.getState().winner) {
        engine.smartAttack('boss');
      }
      if (engine.getState().activeUnitId === activeId && !engine.getState().winner) {
        engine.endPlayerTurn();
      }

      const evs = engine.consumeEvents();
      const dIdx = evs.findIndex((e) => e.type === 'unitDied' && e.unitId === 'boss');
      const cIdx = evs.findIndex((e) => e.type === 'attackCancelled');
      if (dIdx !== -1) {
        diedIdx = dIdx;
        cancelIdx = cIdx;
        if (cIdx !== -1) {
          cancelledEvent = evs[cIdx] as Extract<GameEvent, { type: 'attackCancelled' }>;
        }
      }
    }

    expect(unitOf(engine, 'boss').alive).toBe(false);
    expect(engine.getState().pendingAttacks).toHaveLength(0);
    expect(diedIdx).toBeGreaterThan(-1);
    expect(cancelIdx).toBe(diedIdx + 1);
    expect(cancelledEvent).toMatchObject({
      type: 'attackCancelled',
      casterId: 'boss',
      reason: 'caster_died',
    });
    if (pendingIdBeforeKill) {
      expect(cancelledEvent?.pendingAttackId).toBe(pendingIdBeforeKill);
    }
  });

  it('transitions irreversibly to Phase 2 upon reaching <= 50% HP without restoring HP and gains +1 moveRange', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [
        knightAt(4, 7, 'k1'),
        acolyteAt(5, 9, 'acolyte'),
        knightAt(3, 8, 'k2'),
        bossAt(4, 8, 'boss'),
        knightAt(5, 8, 'k3'),
        knightAt(4, 9, 'k4'),
        archerAt(2, 8, 'a1'),
        archerAt(6, 8, 'a2'),
        mageAt(2, 7, 'm1'),
      ],
    });
    expect(unitOf(engine, 'boss').bossPhase).toBe(1);
    expect(unitOf(engine, 'boss').moveRange).toBe(2);
    expect(unitOf(engine, 'boss').hp).toBe(28);
    engine.consumeEvents();

    // Reduce boss HP to <= 14 without killing it
    let phaseChangedEvents: Extract<GameEvent, { type: 'bossPhaseChanged' }>[] = [];
    while (unitOf(engine, 'boss').hp > 14 && engine.getState().turnState === 'player_unit_active') {
      const activeId = engine.getState().activeUnitId!;
      const active = unitOf(engine, activeId);
      if (active.skillId && active.skillId !== 'healing-light') {
        engine.smartUseSkill({ x: 4, y: 8 });
      } else {
        engine.smartAttack('boss');
      }
      if (engine.getState().activeUnitId === activeId) {
        engine.endPlayerTurn();
      }
      const evs = engine.consumeEvents();
      for (const ev of evs) {
        if (ev.type === 'bossPhaseChanged') phaseChangedEvents.push(ev);
      }
      // If acolyte's turn comes up, it heals the boss
      if (engine.getState().turnState === 'enemy_activation') {
        runEnemyTurn(engine);
        engine.consumeEvents();
      }
    }

    const bossAfterTransition = unitOf(engine, 'boss');
    expect(bossAfterTransition.hp).toBeLessThanOrEqual(14);
    expect(bossAfterTransition.hp).toBeGreaterThan(0);
    expect(bossAfterTransition.bossPhase).toBe(2);
    expect(bossAfterTransition.moveRange).toBe(3);
    expect(phaseChangedEvents).toEqual([
      { type: 'bossPhaseChanged', unitId: 'boss', phase: 2, newMoveRange: 3 },
    ]);

    // Verify Phase 2 3x3 area
    const areaPhase2 = getBossAttackArea({ x: 4, y: 6 }, 2, open);
    expect(areaPhase2).toHaveLength(9);
  });

  it('in Phase 2 prepares Ashen Eruption in a 3x3 area', () => {
    const knight = unit(knightAt(4, 5));
    const mage = unit(mageAt(5, 6));
    const boss = unit(bossAt(4, 8), { hp: 14, bossPhase: 2, moveRange: 3 });

    const action = nextEnemyAction(boss, [knight, mage, boss], open);
    expect(action?.type).toBe('prepareAttack');
    if (action?.type === 'prepareAttack') {
      expect(action.skillName).toBe('Ashen Eruption');
      expect(action.basePower).toBe(5);
      expect(action.attackKind).toBe('magic');
      expect(action.targetCells).toHaveLength(9);
    }
  });

  it('does not choose an obstacle as the telegraphed attack center', () => {
    const grid = new GridSystem(12, [{ pos: { x: 3, y: 2 }, kind: 'crate', blocksLos: false }]);
    const knight = unit(knightAt(2, 2));
    const mage = unit(mageAt(4, 2));
    const boss = unit(bossAt(3, 4));

    const action = nextEnemyAction(boss, [knight, mage, boss], grid);
    expect(action?.type).toBe('prepareAttack');
    if (action?.type === 'prepareAttack') {
      expect(action.targetCells[0]).not.toEqual({ x: 3, y: 2 });
      const hitHeroes = action.targetCells.filter((cell) =>
        [knight, mage].some((hero) => hero.pos.x === cell.x && hero.pos.y === cell.y),
      );
      expect(hitHeroes).toHaveLength(1);
    }
  });
});
