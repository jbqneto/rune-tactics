import { describe, expect, it } from 'vitest';
import { nextEnemyAction, type EnemyAction } from '../src/game/ai/EnemyAI';
import { canReach } from '../src/game/combat/CombatSystem';
import { GridSystem, manhattan } from '../src/game/grid/GridSystem';
import type { GridCoord } from '../src/shared/types';
import { armoredAt, boneArcherAt, crate, cultistAt, goblinAt, knightAt, mageAt, meleeAt, unit, wall } from './helpers';

const open = new GridSystem(8, []);

const movePath = (action: EnemyAction | null): GridCoord[] => {
  if (action?.type !== 'move') throw new Error(`esperava movimento, veio ${action?.type ?? 'null'}`);
  return action.path;
};
const last = <T>(items: T[]): T => items[items.length - 1];

describe('EnemyAI: regras comuns', () => {
  it('attacks when a target is in range', () => {
    const knight = unit(knightAt(1, 1));
    const skeleton = unit(meleeAt(1, 2));
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toEqual({ type: 'attack', target: knight });
  });

  it('moves along the shortest path toward target, up to moveRange steps', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 5));
    expect(movePath(nextEnemyAction(skeleton, [knight, skeleton], open))).toEqual([
      { x: 0, y: 5 },
      { x: 0, y: 4 },
      { x: 0, y: 3 },
    ]);
  });

  it('stops on the cell adjacent to target without spending all movement', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 2));
    expect(movePath(nextEnemyAction(skeleton, [knight, skeleton], open))).toEqual([
      { x: 0, y: 2 },
      { x: 0, y: 1 },
    ]);
  });

  it('ataca depois de se mover, se ficou ao alcance', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 1), { hasMoved: true });
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)?.type).toBe('attack');
  });

  it('ends action if already moved and still has no target in range', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 3), { hasMoved: true });
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toBeNull();
  });

  it('does nothing else after attacking', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 1), { hasAttacked: true });
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toBeNull();
  });

  it.each([
    ['melee-skeleton', meleeAt],
    ['skeleton-archer', boneArcherAt],
    ['armored-skeleton', armoredAt],
  ] as const)('dead %s does not act', (_type, at) => {
    const knight = unit(knightAt(0, 0));
    const dead = unit(at(0, 1), { alive: false, hp: 0 });
    expect(nextEnemyAction(dead, [knight, dead], open)).toBeNull();
  });

  it('does not act if there are no living allies, and ignores dead ones as targets', () => {
    const deadKnight = unit(knightAt(0, 1), { alive: false, hp: 0 });
    const skeleton = unit(meleeAt(0, 2));
    expect(nextEnemyAction(skeleton, [deadKnight, skeleton], open)).toBeNull();

    const mage = unit(mageAt(0, 7));
    expect(last(movePath(nextEnemyAction(skeleton, [deadKnight, mage, skeleton], open)))).toEqual({ x: 0, y: 4 });
  });

  it('routes around obstacles', () => {
    const grid = new GridSystem(8, [crate(0, 2)]);
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 3));
    expect(movePath(nextEnemyAction(skeleton, [knight, skeleton], grid))).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ]);
  });

  it('does not pass through or occupy another living unit cell', () => {
    const knight = unit(knightAt(0, 0));
    const front = unit(meleeAt(1, 0, 'front'));
    const back = unit(meleeAt(2, 0, 'back'));
    const units = [knight, front, back];
    const path = movePath(nextEnemyAction(back, units, open));
    expect(path).toEqual([
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ]);
    expect(open.isOccupied(last(path), units)).toBe(false);
  });

  it('passes through a dead unit cell', () => {
    const knight = unit(knightAt(0, 0));
    const dead = unit(meleeAt(1, 0, 'front'), { alive: false, hp: 0 });
    const back = unit(meleeAt(2, 0, 'back'));
    expect(movePath(nextEnemyAction(back, [knight, dead, back], open))).toEqual([
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('without a path to an attack position, gets as close as possible', () => {
    const grid = new GridSystem(8, [crate(1, 0), crate(0, 1)]);
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(5, 0));
    const path = movePath(nextEnemyAction(skeleton, [knight, skeleton], grid));
    expect(path).toHaveLength(3);
    expect(manhattan(last(path), knight.pos)).toBe(3);
  });

  it('stays still if moving does not get closer to anyone', () => {
    const grid = new GridSystem(8, [crate(0, 1)]);
    const knight = unit(knightAt(0, 0));
    const front = unit(meleeAt(1, 0, 'front'));
    const back = unit(meleeAt(2, 0, 'back'));
    expect(nextEnemyAction(back, [knight, front, back], grid)).toBeNull();
  });

  it('is deterministic', () => {
    const make = () => {
      const knight = unit(knightAt(3, 3));
      const mage = unit(mageAt(2, 2));
      const skeleton = unit(armoredAt(6, 6));
      return nextEnemyAction(skeleton, [knight, mage, skeleton], open);
    };
    expect(make()).toEqual(make());
  });
});

describe('EnemyAI: melee-skeleton', () => {
  it('moves toward the nearest ally along the path', () => {
    const knight = unit(knightAt(0, 0));
    const mage = unit(mageAt(7, 4));
    const skeleton = unit(meleeAt(5, 4));
    // Knight comes first in the list, but Mage is one step away.
    expect(movePath(nextEnemyAction(skeleton, [knight, mage, skeleton], open))).toEqual([
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ]);
  });

  it('among targets in range, hits the one with lowest HP', () => {
    const knight = unit(knightAt(1, 0));
    const mage = unit(mageAt(0, 1));
    const skeleton = unit(meleeAt(1, 1));
    expect(nextEnemyAction(skeleton, [knight, mage, skeleton], open)).toEqual({ type: 'attack', target: mage });
  });

  it('only attacks in melee', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 2));
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)?.type).toBe('move');
  });
});

describe('EnemyAI: armored-skeleton', () => {
  it('among targets in range, hits the closest one rather than the weakest', () => {
    const knight = unit(knightAt(1, 0));
    const mage = unit(mageAt(0, 1));
    const armored = unit(armoredAt(1, 1));
    expect(nextEnemyAction(armored, [knight, mage, armored], open)).toEqual({ type: 'attack', target: knight });
  });

  it('advances to the cell engaging the most allies; melee-skeleton takes the first', () => {
    const knight = unit(knightAt(3, 2));
    const mage = unit(mageAt(2, 3));
    const touching = (cell: GridCoord) => [knight, mage].filter((u) => manhattan(u.pos, cell) === 1).length;

    const armored = unit(armoredAt(5, 3));
    const armoredPath = movePath(nextEnemyAction(armored, [knight, mage, armored], open));
    expect(last(armoredPath)).toEqual({ x: 3, y: 3 });
    expect(touching(last(armoredPath))).toBe(2);

    const melee = unit(meleeAt(5, 3));
    const meleePath = movePath(nextEnemyAction(melee, [knight, mage, melee], open));
    expect(last(meleePath)).toEqual({ x: 4, y: 2 });
    expect(touching(last(meleePath))).toBe(1);

    // Both spend the same number of steps: the only difference is cell choice.
    expect(armoredPath).toHaveLength(meleePath.length);
  });

  it('advances even without reaching the target this turn', () => {
    const knight = unit(knightAt(0, 0));
    const armored = unit(armoredAt(0, 6));
    expect(last(movePath(nextEnemyAction(armored, [knight, armored], open)))).toEqual({ x: 0, y: 4 });
  });
});

describe('EnemyAI: skeleton-archer', () => {
  it('shoots from afar when it has range and line of sight', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(0, 3));
    expect(nextEnemyAction(archer, [knight, archer], open)).toEqual({ type: 'attack', target: knight });
  });

  it('entre os alvos ao alcance, atira no de menos HP', () => {
    const knight = unit(knightAt(0, 2));
    const mage = unit(mageAt(3, 3));
    const archer = unit(boneArcherAt(0, 3));
    expect(nextEnemyAction(archer, [knight, mage, archer], open)).toEqual({ type: 'attack', target: mage });
  });

  it('crate does not block line of sight', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(0, 3));
    const grid = new GridSystem(8, [crate(0, 1)]);
    expect(nextEnemyAction(archer, [knight, archer], grid)?.type).toBe('attack');
  });

  it('without line of sight, moves to a firing cell and shoots from there', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(0, 2));
    const units = [knight, archer];
    const grid = new GridSystem(8, [wall(0, 1)]);
    expect(canReach(archer.pos, knight.pos, archer.attackRange, grid)).toBe(false);

    const path = movePath(nextEnemyAction(archer, units, grid));
    const end = last(path);
    expect(path.length - 1).toBeLessThanOrEqual(archer.moveRange);
    expect(canReach(end, knight.pos, archer.attackRange, grid)).toBe(true);

    archer.pos = end;
    archer.hasMoved = true;
    expect(nextEnemyAction(archer, units, grid)).toEqual({ type: 'attack', target: knight });
  });

  it('out of range, only approaches until it has a shot and does not stand adjacent to target', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(0, 5));
    const path = movePath(nextEnemyAction(archer, [knight, archer], open));
    expect(last(path)).toEqual({ x: 0, y: 3 });

    const closer = unit(boneArcherAt(0, 4));
    expect(last(movePath(nextEnemyAction(closer, [knight, closer], open)))).toEqual({ x: 0, y: 3 });
  });

  it('ao andar para atirar, nunca termina encostado em um aliado', () => {
    const knight = unit(knightAt(3, 3));
    const mage = unit(mageAt(4, 4));
    const grid = new GridSystem(8, [wall(2, 2), wall(5, 3), crate(3, 5)]);
    let moves = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const archer = unit(boneArcherAt(x, y));
        const units = [knight, mage, archer];
        if (grid.isBlocked(archer.pos, [knight, mage])) continue;
        const action = nextEnemyAction(archer, units, grid);
        if (action?.type !== 'move') continue;
        moves++;
        const end = last(action.path);
        expect(Math.min(manhattan(end, knight.pos), manhattan(end, mage.pos))).toBeGreaterThanOrEqual(2);
      }
    }
    expect(moves).toBeGreaterThan(5);
  });

  it('surrounded, with no way to reach a firing cell or approach, stays still', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(7, 7));
    const grid = new GridSystem(8, [crate(6, 7), crate(7, 6)]);
    expect(nextEnemyAction(archer, [knight, archer], grid)).toBeNull();
  });
});

describe('EnemyAI: goblin-scout', () => {
  it('moves up to 4 cells toward the most vulnerable living ally (lowest HP)', () => {
    const knight = unit(knightAt(0, 0)); // HP 10, closer (dist 2)
    const mage = unit(mageAt(0, 6), { hp: 3 }); // HP 3, more vulnerable (dist 4)
    const goblin = unit(goblinAt(0, 2)); // moveRange 4

    const path = movePath(nextEnemyAction(goblin, [knight, mage, goblin], open));
    expect(path.length - 1).toBeLessThanOrEqual(4);
    expect(last(path)).toEqual({ x: 0, y: 5 });
  });

  it('among targets in range, attacks the one with lowest HP', () => {
    const knight = unit(knightAt(1, 0), { hp: 10 });
    const mage = unit(mageAt(0, 1), { hp: 2 });
    const goblin = unit(goblinAt(1, 1));
    expect(nextEnemyAction(goblin, [knight, mage, goblin], open)).toEqual({ type: 'attack', target: mage });
  });
});

describe('EnemyAI: cultist-mage', () => {
  it('attacks at range (range 3) with line of sight and prioritizes lowest HP', () => {
    const knight = unit(knightAt(0, 2), { hp: 10 });
    const mage = unit(mageAt(3, 3), { hp: 4 });
    const cultist = unit(cultistAt(0, 3));
    expect(nextEnemyAction(cultist, [knight, mage, cultist], open)).toEqual({ type: 'attack', target: mage });
  });

  it('when seeking a firing position, prefers keeping distance >= 2 from allies', () => {
    const knight = unit(knightAt(0, 0));
    const cultist = unit(cultistAt(0, 5));
    const path = movePath(nextEnemyAction(cultist, [knight, cultist], open));
    expect(manhattan(last(path), knight.pos)).toBeGreaterThanOrEqual(2);
    expect(canReach(last(path), knight.pos, cultist.attackRange, open)).toBe(true);
  });
});
