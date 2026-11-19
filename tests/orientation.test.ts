import { describe, expect, it } from 'vitest';
import {
  computeWorldYaw,
  findNearestLivingEnemy,
  shortestAngleDelta,
} from '../src/rendering/orientation';
import type { Team, UnitState, UnitType } from '../src/shared/types';

function makeUnit(
  id: string,
  team: Team,
  x: number,
  y: number,
  alive = true,
  type: UnitType = team === 'player' ? 'knight' : 'melee-skeleton'
): UnitState {
  return {
    id,
    name: id,
    type,
    team,
    pos: { x, y },
    hp: alive ? 5 : 0,
    maxHp: 5,
    damage: 1,
    moveRange: 3,
    attackRange: 1,
    alive,
    hasMoved: false,
    hasAttacked: false,
    hasActivatedThisRound: false,
    skillId: null,
    skillName: null,
    skillCooldown: 0,
  };
}

describe('orientation', () => {
  it('orients toward the sole living enemy', () => {
    const hero = makeUnit('knight-1', 'player', 2, 2);
    const enemy = makeUnit('goblin-1', 'enemy', 5, 4);

    const nearest = findNearestLivingEnemy(hero, [hero, enemy]);
    expect(nearest?.id).toBe('goblin-1');

    const yaw = computeWorldYaw({ x: 0, z: 0 }, { x: 1, z: 0 });
    expect(yaw).toBeCloseTo(Math.PI / 2);
  });

  it('picks the closest enemy by Manhattan distance among multiple enemies', () => {
    const hero = makeUnit('knight-1', 'player', 3, 3);
    const farEnemy = makeUnit('skel-far', 'enemy', 8, 7); // dist = 9
    const midEnemy = makeUnit('skel-mid', 'enemy', 5, 5); // dist = 4
    const nearEnemy = makeUnit('skel-near', 'enemy', 4, 4); // dist = 2

    const nearest = findNearestLivingEnemy(hero, [hero, farEnemy, midEnemy, nearEnemy]);
    expect(nearest?.id).toBe('skel-near');
  });

  it('breaks distance ties deterministically by turnOrder', () => {
    const hero = makeUnit('knight-1', 'player', 4, 4);
    const enemyA = makeUnit('enemy-a', 'enemy', 4, 6); // dist = 2
    const enemyB = makeUnit('enemy-b', 'enemy', 6, 4); // dist = 2

    // enemyB appears earlier in turnOrder even though it is later in units
    const nearest = findNearestLivingEnemy(
      hero,
      [hero, enemyA, enemyB],
      ['knight-1', 'enemy-b', 'enemy-a']
    );
    expect(nearest?.id).toBe('enemy-b');

    // Without turnOrder, falls back to units order
    const nearestDefault = findNearestLivingEnemy(hero, [hero, enemyA, enemyB]);
    expect(nearestDefault?.id).toBe('enemy-a');
  });

  it('ignores dead enemies and returns null when there are no living enemies', () => {
    const hero = makeUnit('knight-1', 'player', 2, 2);
    const deadNear = makeUnit('dead-near', 'enemy', 2, 3, false);
    const aliveFar = makeUnit('alive-far', 'enemy', 7, 7, true);

    expect(findNearestLivingEnemy(hero, [hero, deadNear, aliveFar])?.id).toBe('alive-far');
    expect(findNearestLivingEnemy(hero, [hero, deadNear])).toBeNull();
  });

  it('shortestAngleDelta always picks the shortest arc in [-PI, PI]', () => {
    // From +170° to -170° should rotate +20°, not -340°
    const from = (170 * Math.PI) / 180;
    const to = (-170 * Math.PI) / 180;
    const delta = shortestAngleDelta(from, to);
    expect(delta).toBeCloseTo((20 * Math.PI) / 180);

    // From -170° to +170° should rotate -20°, not +340°
    const deltaRev = shortestAngleDelta(to, from);
    expect(deltaRev).toBeCloseTo((-20 * Math.PI) / 180);

    // Equivalent angles separated by 2*PI have delta 0
    expect(shortestAngleDelta(0.5, 0.5 + Math.PI * 2)).toBeCloseTo(0);
  });
});
