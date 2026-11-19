import { describe, expect, it } from 'vitest';
import { INITIAL_UNITS, MAPS, OBSTACLES } from '../src/config/gameConfig';
import { GameEngine } from '../src/game/GameEngine';
import { manhattan } from '../src/game/grid/GridSystem';
import type { GameEvent } from '../src/shared/types';
import {
  archerAt,
  armoredAt,
  clericAt,
  crate,
  knightAt,
  meleeAt,
  runEnemyTurn,
  unitOf,
  wall,
} from './helpers';

const SKELETON = 'melee-skeleton-1';

/** Knight at (1,1) and an adjacent skeleton at (1,2), no obstacles. */
const duel = () => new GameEngine({ obstacles: [], units: [knightAt(1, 1), meleeAt(1, 2)] });

/** Knight and archer against a skeleton adjacent to the knight and a distant armored skeleton. */
const squad = () =>
  new GameEngine({ obstacles: [], units: [knightAt(1, 1), archerAt(0, 0), meleeAt(1, 2), armoredAt(7, 7)] });

const types = (events: GameEvent[]) => events.map((e) => e.type);

describe('GameEngine: initial state and fixed turnOrder (V2.1)', () => {
  it('starts in player_unit_active, round 1, locked on knight-1, with fixed interleaved order of 10 units', () => {
    const engine = new GameEngine();
    const state = engine.getState();
    expect(state).toMatchObject({
      gridSize: 12,
      phase: 'player',
      turnState: 'player_unit_active',
      turnIndex: 0,
      round: 1,
      activeUnitId: 'knight-1',
      activationLocked: true,
      activationTeam: 'player',
      selectedUnitId: 'knight-1',
      winner: null,
    });
    expect(state.turnOrder).toEqual([
      'knight-1',
      'goblin-scout-1',
      'archer-1',
      'melee-skeleton-1',
      'mage-1',
      'melee-skeleton-2',
      'cleric-1',
      'armored-skeleton-1',
      'skeleton-archer-1',
      'cultist-mage-1',
    ]);
    expect(state.units.map((u) => [u.id, u.type, u.team])).toEqual(
      INITIAL_UNITS.map((s) => [s.id, s.type, s.team]),
    );
    expect(MAPS.some((m) => m.id === state.mapId && m.name === state.mapName)).toBe(true);
    expect(engine.consumeEvents()).toEqual([]);
  });

  it('walks through the exact fixed order of 10 units and repeats in Round 2', () => {
    const engine = new GameEngine();
    const expectedOrder = engine.getState().turnOrder;
    const round1Actors: string[] = [];

    while (engine.getState().round === 1) {
      const state = engine.getState();
      if (state.turnState === 'player_unit_active') {
        round1Actors.push(state.activeUnitId!);
        engine.endPlayerTurn();
      } else if (state.turnState === 'enemy_activation') {
        if (round1Actors[round1Actors.length - 1] !== state.activeUnitId) {
          round1Actors.push(state.activeUnitId!);
        }
        engine.executeNextEnemyAction();
      }
      engine.consumeEvents();
    }

    expect(round1Actors).toEqual(expectedOrder);
    expect(engine.getState()).toMatchObject({
      round: 2,
      turnIndex: 0,
      activeUnitId: 'knight-1',
      turnState: 'player_unit_active',
    });
  });

  it('exposes obstacles and guarantees isolated copies in getState', () => {
    const engine = new GameEngine({ mapId: 'ruins', randomizeSpawns: false });
    const state = engine.getState();
    expect(state.obstacleDefs).toEqual(OBSTACLES);
    state.units[0].pos.x = 11;
    state.turnOrder.pop();
    expect(engine.getState().turnOrder).toHaveLength(10);
    expect(engine.getState().units[0].pos.x).toBe(4);
  });
});

describe('GameEngine: manual switch lock (selectUnit)', () => {
  it('rejects switching to another ally or clearing selection, keeping activeUnitId intact', () => {
    const engine = squad();
    expect(engine.selectUnit('knight-1')).toEqual({ ok: true });
    expect(engine.selectUnit('archer-1')).toEqual({ ok: false, reason: 'Cannot change the active unit.' });
    expect(engine.selectUnit(null)).toEqual({ ok: false, reason: 'Cannot change the active unit.' });
    expect(engine.selectUnit(SKELETON).ok).toBe(false);
    expect(engine.getState()).toMatchObject({
      activeUnitId: 'knight-1',
      selectedUnitId: 'knight-1',
    });

    // Also rejects during enemy turn
    engine.endPlayerTurn();
    expect(engine.selectUnit('knight-1')).toEqual({ ok: false, reason: 'Cannot change the active unit.' });
  });
});

describe('GameEngine: automatic and manual turn ending (scenarios A to E)', () => {
  it('Scenario A: move -> attack ends automatically and advances to the next actor in turnOrder', () => {
    const engine = duel();
    expect(engine.moveSelectedUnit({ x: 2, y: 2 })).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
    });

    expect(engine.attackTarget(SKELETON)).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'enemy_activation',
      phase: 'enemy',
      activeUnitId: SKELETON,
      turnIndex: 1,
      selectedUnitId: null,
    });
    expect(unitOf(engine, 'knight-1').hasActivatedThisRound).toBe(true);
    expect(types(engine.consumeEvents())).toEqual([
      'unitMoved',
      'unitAttacked',
      'activationEnded',
      'turnChanged',
      'activationStarted',
    ]);
  });

  it('Scenario B: attack -> move stays open after attack and ends automatically after move', () => {
    const engine = duel();
    expect(engine.attackTarget(SKELETON)).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
    });

    expect(engine.moveSelectedUnit({ x: 2, y: 1 })).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'enemy_activation',
      activeUnitId: SKELETON,
    });
    expect(types(engine.consumeEvents())).toEqual([
      'unitAttacked',
      'unitMoved',
      'activationEnded',
      'turnChanged',
      'activationStarted',
    ]);
  });

  it('Scenario B (skill variant): useSkill -> move ends after move', () => {
    const engine = duel();
    expect(engine.useSkill({ x: 1, y: 2 })).toEqual({ ok: true });
    expect(engine.getState().turnState).toBe('player_unit_active');
    expect(engine.moveSelectedUnit({ x: 2, y: 1 })).toEqual({ ok: true });
    expect(engine.getState().turnState).toBe('enemy_activation');
  });

  it('Scenarios C, D, and E: only 1 action (or 0) stays open until endPlayerTurn()', () => {
    const engine = duel();
    engine.moveSelectedUnit({ x: 2, y: 1 });
    expect(engine.getState().turnState).toBe('player_unit_active');
    expect(engine.endPlayerTurn()).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'enemy_activation',
      activeUnitId: SKELETON,
    });

    // During enemy turn endPlayerTurn is rejected
    expect(engine.endPlayerTurn().ok).toBe(false);
  });

  it('invalid actions never consume resources or advance the turn', () => {
    const engine = duel();
    expect(engine.moveSelectedUnit({ x: 11, y: 11 }).ok).toBe(false);
    expect(engine.attackTarget('nonexistent').ok).toBe(false);
    expect(engine.useSkill({ x: 5, y: 5 }).ok).toBe(false);
    expect(unitOf(engine, 'knight-1')).toMatchObject({ hasMoved: false, hasAttacked: false });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
    });
    expect(engine.consumeEvents()).toEqual([]);
  });
});

describe('GameEngine: getAttackRangeCells and getSkillRangeCells (range and LoS)', () => {
  it('getAttackRangeCells respects range, obstacles, and line of sight', () => {
    const engine = new GameEngine({
      obstacles: [wall(0, 1), crate(1, 0)],
      units: [archerAt(0, 0), meleeAt(5, 5)],
    });
    const rangeCells = engine.getAttackRangeCells();
    // (0,1) has wall -> not included and blocks (0,2) and (0,3)
    expect(rangeCells).not.toContainEqual({ x: 0, y: 1 });
    expect(rangeCells).not.toContainEqual({ x: 0, y: 2 });
    expect(rangeCells).not.toContainEqual({ x: 0, y: 3 });
    // (1,0) has crate (obstacle) -> not included, but does NOT block LoS to (2,0) and (3,0)
    expect(rangeCells).not.toContainEqual({ x: 1, y: 0 });
    expect(rangeCells).toContainEqual({ x: 2, y: 0 });
    expect(rangeCells).toContainEqual({ x: 3, y: 0 });
    // Out of range (manhattan 4)
    expect(rangeCells).not.toContainEqual({ x: 4, y: 0 });
    // Inactive unit returns []
    expect(engine.getAttackRangeCells('melee-skeleton-1')).toEqual([]);

    // After attacking, returns []
    const eng2 = new GameEngine({ obstacles: [], units: [archerAt(0, 0), meleeAt(0, 2)] });
    eng2.attackTarget('melee-skeleton-1');
    expect(eng2.getAttackRangeCells()).toEqual([]);
  });

  it('getSkillRangeCells respects range, LoS, cooldown, and includes own cell for healing-light', () => {
    const engine = new GameEngine({
      obstacles: [wall(0, 1)],
      units: [clericAt(0, 0), knightAt(2, 0), meleeAt(5, 5)],
    });
    const skillRange = engine.getSkillRangeCells();
    expect(skillRange).toContainEqual({ x: 0, y: 0 }); // own cell for healing
    expect(skillRange).toContainEqual({ x: 2, y: 0 });
    expect(skillRange).not.toContainEqual({ x: 0, y: 1 }); // wall
    expect(skillRange).not.toContainEqual({ x: 0, y: 2 }); // blocked by wall
    expect(engine.getSkillRangeCells('knight-1')).toEqual([]); // not the active unit

    // For damage skill (Marked Shot), own cell is not included
    const engArcher = new GameEngine({
      obstacles: [],
      units: [archerAt(0, 0), meleeAt(0, 2)],
    });
    const archerSkillRange = engArcher.getSkillRangeCells();
    expect(archerSkillRange).not.toContainEqual({ x: 0, y: 0 });
    expect(archerSkillRange).toContainEqual({ x: 0, y: 2 });

    // On cooldown returns []
    engArcher.useSkill({ x: 0, y: 2 });
    expect(engArcher.getSkillRangeCells()).toEqual([]);
  });
});

describe('GameEngine: death skipped in turnOrder, corpses, victory, and defeat', () => {
  it('skips dead unit without reordering turnOrder and without duplicate activations', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(0, 0), archerAt(0, 2), meleeAt(0, 1), armoredAt(7, 7)],
    });
    // turnOrder: knight-1, melee-skeleton-1, archer-1, armored-skeleton-1
    expect(engine.getState().turnOrder).toEqual([
      'knight-1',
      'melee-skeleton-1',
      'archer-1',
      'armored-skeleton-1',
    ]);

    // knight-1 uses Runic Strike (3 damage) and ends -> melee-1 (HP 2) attacks -> archer-1 kills melee-1
    engine.useSkill({ x: 0, y: 1 });
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    engine.consumeEvents();

    expect(engine.getState().activeUnitId).toBe('archer-1');
    engine.attackTarget('melee-skeleton-1'); // kills melee-1!
    engine.endPlayerTurn();
    runEnemyTurn(engine); // armored-1 activates and wraps to Round 2
    engine.consumeEvents();

    // In Round 2, turnOrder remains unchanged, but dead melee-1 is skipped:
    expect(engine.getState().turnOrder).toEqual([
      'knight-1',
      'melee-skeleton-1',
      'archer-1',
      'armored-skeleton-1',
    ]);
    expect(engine.getState().activeUnitId).toBe('knight-1');
    engine.endPlayerTurn();
    expect(engine.getState().activeUnitId).toBe('archer-1'); // skipped melee-skeleton-1!

    // Corpse remains on the grid at (0,1) and does not block movement
    expect(unitOf(engine, 'melee-skeleton-1')).toMatchObject({ alive: false, hp: 0, pos: { x: 0, y: 1 } });
    expect(engine.getPath({ x: 0, y: 0 }, { x: 0, y: 1 })).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }]);
  });

  it('immediate victory on final blow stops without activationEnded or turnChanged', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), archerAt(0, 2), meleeAt(1, 2)],
    });
    engine.attackTarget('melee-skeleton-1'); // 5 -> 3
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    engine.consumeEvents();

    expect(engine.getState().activeUnitId).toBe('archer-1');
    engine.useSkill({ x: 1, y: 2 }); // 3 damage, kills!
    expect(engine.getState()).toMatchObject({
      turnState: 'victory',
      phase: 'victory',
      winner: 'player',
      activeUnitId: null,
      selectedUnitId: null,
    });
    expect(types(engine.consumeEvents())).toEqual(['skillUsed', 'unitAttacked', 'unitDied', 'battleEnded']);
    expect(engine.executeNextEnemyAction()).toBe(false);
  });

  it('reset() in any state restores round 1 and index 0', () => {
    const engine = duel();
    engine.moveSelectedUnit({ x: 2, y: 1 });
    engine.endPlayerTurn();
    engine.consumeEvents();

    engine.reset();
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      turnIndex: 0,
      round: 1,
      activeUnitId: 'knight-1',
      activationLocked: true,
      winner: null,
    });
    expect(engine.consumeEvents()).toEqual([{ type: 'gameReset' }]);
  });
});

describe('GameEngine: invariants in simulated match (V2.1 12x12)', () => {
  it('full match with 4 heroes vs 6 enemies ends in victory or defeat respecting turnOrder', () => {
    const engine = new GameEngine();
    let safety = 0;

    while (!['victory', 'defeat'].includes(engine.getState().turnState)) {
      if (++safety > 600) throw new Error('Simulated match did not finish');
      const state = engine.getState();

      expect(state.activeUnitId).not.toBeNull();
      expect(unitOf(engine, state.activeUnitId!).alive).toBe(true);

      if (state.turnState === 'player_unit_active') {
        const targets = engine.getAttackableTargets();
        if (targets.length > 0) {
          engine.attackTarget(targets[0].id);
        } else {
          const cells = engine.getReachableCells();
          if (cells.length > 0) {
            const best = cells.reduce((a, b) => (b.y > a.y ? b : a));
            engine.moveSelectedUnit(best);
          } else {
            engine.endPlayerTurn();
          }
        }

        if (
          engine.getState().turnState === 'player_unit_active' &&
          engine.getState().activeUnitId === state.activeUnitId
        ) {
          const postTargets = engine.getAttackableTargets();
          if (postTargets.length > 0) {
            engine.attackTarget(postTargets[0].id);
          } else {
            engine.endPlayerTurn();
          }
        }
      } else if (state.turnState === 'enemy_activation') {
        engine.executeNextEnemyAction();
      }

      engine.consumeEvents();

      for (const u of engine.getState().units) {
        expect(u.pos.x).toBeGreaterThanOrEqual(0);
        expect(u.pos.x).toBeLessThan(12);
        expect(u.pos.y).toBeGreaterThanOrEqual(0);
        expect(u.pos.y).toBeLessThan(12);
        expect(manhattan(u.pos, u.pos)).toBe(0);
      }
    }

    expect(['victory', 'defeat']).toContain(engine.getState().turnState);
  });
});
