import { describe, expect, it } from 'vitest';
import { GRID_SIZE, OBSTACLES } from '../src/config/gameConfig';
import { GridSystem, manhattan } from '../src/game/grid/GridSystem';
import { barrel, crate, meleeAt, pillar, unit, wall } from './helpers';

const open = new GridSystem(8, []);

describe('GridSystem', () => {
  it('uses config grid and obstacles by default', () => {
    const grid = new GridSystem();
    expect(grid.size).toBe(GRID_SIZE);
    for (const o of OBSTACLES) expect(grid.isObstacle(o.pos)).toBe(true);
    expect(grid.isObstacle({ x: 0, y: 0 })).toBe(false);
    expect(new GridSystem(8, [crate(3, 3)]).isObstacle({ x: 3, y: 3 })).toBe(true);
  });

  it('accepts only integer coordinates from 0 to 7', () => {
    expect(open.isInBounds({ x: 0, y: 0 })).toBe(true);
    expect(open.isInBounds({ x: 7, y: 7 })).toBe(true);
    expect(open.isInBounds({ x: -1, y: 0 })).toBe(false);
    expect(open.isInBounds({ x: 0, y: 8 })).toBe(false);
    expect(open.isInBounds({ x: 1.5, y: 2 })).toBe(false);
  });

  it('computes Manhattan distance', () => {
    expect(manhattan({ x: 1, y: 1 }, { x: 4, y: 3 })).toBe(5);
    expect(manhattan({ x: 2, y: 2 }, { x: 3, y: 3 })).toBe(2);
  });

  it('returns only orthogonal neighbors within the grid', () => {
    expect(open.getNeighbors({ x: 0, y: 0 })).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ]);
    expect(open.getNeighbors({ x: 3, y: 3 })).toHaveLength(4);
  });

  it('living unit occupies the cell, dead unit does not', () => {
    const alive = unit(meleeAt(2, 2));
    const dead = unit(meleeAt(3, 3, 'skeleton-2'), { alive: false, hp: 0 });
    expect(open.isOccupied({ x: 2, y: 2 }, [alive, dead])).toBe(true);
    expect(open.isOccupied({ x: 3, y: 3 }, [alive, dead])).toBe(false);
    expect(open.isBlocked({ x: 3, y: 3 }, [alive, dead])).toBe(false);
  });

  it('considers out of bounds, obstacle, or occupied cell as blocked', () => {
    const grid = new GridSystem(8, [wall(1, 1)]);
    const units = [unit(meleeAt(2, 2))];
    expect(grid.isBlocked({ x: 8, y: 0 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 1, y: 1 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 2, y: 2 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 0, y: 0 }, units)).toBe(false);
  });
});

describe('GridSystem.getReachableCells', () => {
  it('reaches cells within `range` steps, excluding origin', () => {
    const from = { x: 3, y: 3 };
    const cells = open.getReachableCells(from, 2, []);
    expect(cells).toHaveLength(12);
    expect(cells).not.toContainEqual(from);
    for (const c of cells) expect(manhattan(from, c)).toBeLessThanOrEqual(2);
  });

  it('respeita as bordas', () => {
    expect(open.getReachableCells({ x: 0, y: 0 }, 1, [])).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ]);
  });

  it('does not stop on an obstacle or occupied cell', () => {
    const grid = new GridSystem(8, [crate(1, 0)]);
    const cells = grid.getReachableCells({ x: 0, y: 0 }, 2, [unit(meleeAt(0, 2))]);
    expect(cells).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it('does not pass through obstacles: detouring costs steps', () => {
    // Wall at x=1 with passage only at y=3.
    const grid = new GridSystem(
      8,
      [0, 1, 2, 4, 5, 6, 7].map((y) => wall(1, y)),
    );
    expect(grid.getReachableCells({ x: 0, y: 0 }, 3, [])).not.toContainEqual({ x: 2, y: 0 });
    expect(grid.getReachableCells({ x: 0, y: 0 }, 8, [])).toContainEqual({ x: 2, y: 0 });
  });

  it('does not pass through living units, but passes through dead unit cells', () => {
    // One-cell wide corridor at y=0.
    const grid = new GridSystem(
      8,
      [0, 1, 2, 3, 4, 5, 6, 7].map((x) => barrel(x, 1)),
    );
    const blocker = unit(meleeAt(1, 0));
    expect(grid.getReachableCells({ x: 0, y: 0 }, 3, [blocker])).toEqual([]);
    blocker.alive = false;
    expect(grid.getReachableCells({ x: 0, y: 0 }, 3, [blocker])).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });
});

describe('GridSystem.getPath', () => {
  it('devolve o menor caminho ortogonal com origem e destino', () => {
    const path = open.getPath({ x: 1, y: 1 }, { x: 3, y: 2 }, [])!;
    expect(path).toHaveLength(4);
    expect(path[0]).toEqual({ x: 1, y: 1 });
    expect(path[3]).toEqual({ x: 3, y: 2 });
    for (let i = 1; i < path.length; i++) expect(manhattan(path[i - 1], path[i])).toBe(1);
  });

  it('returns only origin when origin and destination coincide', () => {
    expect(open.getPath({ x: 2, y: 2 }, { x: 2, y: 2 }, [])).toEqual([{ x: 2, y: 2 }]);
  });

  it('routes around obstacles and living units', () => {
    const grid = new GridSystem(8, [crate(1, 0)]);
    const blocker = unit(meleeAt(1, 1));
    const path = grid.getPath({ x: 0, y: 0 }, { x: 2, y: 0 }, [blocker])!;
    expect(path).not.toContainEqual({ x: 1, y: 0 });
    expect(path).not.toContainEqual({ x: 1, y: 1 });
    expect(path).toHaveLength(7);
  });

  it('returns null if destination is an obstacle, occupied, or out of bounds', () => {
    const grid = new GridSystem(8, [pillar(4, 4)]);
    const units = [unit(meleeAt(5, 5))];
    expect(grid.getPath({ x: 0, y: 0 }, { x: 4, y: 4 }, units)).toBeNull();
    expect(grid.getPath({ x: 0, y: 0 }, { x: 5, y: 5 }, units)).toBeNull();
    expect(grid.getPath({ x: 0, y: 0 }, { x: 8, y: 0 }, units)).toBeNull();
    expect(grid.getPath({ x: -1, y: 0 }, { x: 1, y: 0 }, units)).toBeNull();
  });

  it('returns null if destination is surrounded', () => {
    const grid = new GridSystem(8, [wall(1, 0), crate(0, 1)]);
    expect(grid.getPath({ x: 5, y: 5 }, { x: 0, y: 0 }, [])).toBeNull();
  });
});

describe('GridSystem.hasLineOfSight', () => {
  const from = { x: 0, y: 0 };

  it('is clear in open field and for own cell', () => {
    expect(open.hasLineOfSight(from, { x: 7, y: 7 })).toBe(true);
    expect(open.hasLineOfSight(from, { x: 5, y: 2 })).toBe(true);
    expect(open.hasLineOfSight(from, from)).toBe(true);
  });

  it.each([
    ['wall', wall, false],
    ['pillar', pillar, false],
    ['crate', crate, true],
    ['barrel', barrel, true],
  ] as const)('%s in the middle of the line: LoS %s', (_kind, make, expected) => {
    expect(new GridSystem(8, [make(1, 0)]).hasLineOfSight(from, { x: 3, y: 0 })).toBe(expected);
    expect(new GridSystem(8, [make(0, 2)]).hasLineOfSight(from, { x: 0, y: 3 })).toBe(expected);
    expect(new GridSystem(8, [make(1, 1)]).hasLineOfSight(from, { x: 2, y: 2 })).toBe(expected);
  });

  it('origin and destination do not block by themselves', () => {
    const grid = new GridSystem(8, [wall(0, 0), wall(3, 0)]);
    expect(grid.hasLineOfSight(from, { x: 3, y: 0 })).toBe(true);
  });

  it('obstacle outside the line does not block', () => {
    const grid = new GridSystem(8, [wall(1, 1), wall(2, 1), wall(0, 1)]);
    expect(grid.hasLineOfSight(from, { x: 3, y: 0 })).toBe(true);
  });

  it('diagonal line is blocked by any cell it crosses', () => {
    // From (0,0) to (2,1) the line crosses (1,0) and (1,1), and touches neither (2,0) nor (0,1).
    const to = { x: 2, y: 1 };
    expect(new GridSystem(8, [wall(1, 0)]).hasLineOfSight(from, to)).toBe(false);
    expect(new GridSystem(8, [wall(1, 1)]).hasLineOfSight(from, to)).toBe(false);
    expect(new GridSystem(8, [wall(2, 0), wall(0, 1)]).hasLineOfSight(from, to)).toBe(true);
  });

  it('passes between two obstacles that only touch at a corner', () => {
    const grid = new GridSystem(8, [wall(1, 0), wall(0, 1)]);
    expect(grid.hasLineOfSight(from, { x: 1, y: 1 })).toBe(true);
    expect(grid.hasLineOfSight(from, { x: 3, y: 3 })).toBe(true);
  });

  it('is symmetric', () => {
    const grid = new GridSystem();
    for (let i = 0; i < 64; i++) {
      for (let j = i + 1; j < 64; j++) {
        const a = { x: i % 8, y: Math.floor(i / 8) };
        const b = { x: j % 8, y: Math.floor(j / 8) };
        expect(grid.hasLineOfSight(a, b)).toBe(grid.hasLineOfSight(b, a));
      }
    }
  });

  it('accepts an explicit obstacle list', () => {
    expect(open.hasLineOfSight(from, { x: 3, y: 0 }, [wall(2, 0)])).toBe(false);
    expect(open.hasLineOfSight(from, { x: 3, y: 0 }, [crate(2, 0)])).toBe(true);
  });
});
