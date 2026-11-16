import { describe, expect, it } from 'vitest';
import { GRID_SIZE, OBSTACLES } from '../src/config/gameConfig';
import { GridSystem, manhattan } from '../src/game/grid/GridSystem';
import { barrel, crate, meleeAt, pillar, unit, wall } from './helpers';

const open = new GridSystem(8, []);

describe('GridSystem', () => {
  it('usa a grade e os obstáculos da config por padrão', () => {
    const grid = new GridSystem();
    expect(grid.size).toBe(GRID_SIZE);
    for (const o of OBSTACLES) expect(grid.isObstacle(o.pos)).toBe(true);
    expect(grid.isObstacle({ x: 0, y: 0 })).toBe(false);
    expect(new GridSystem(8, [crate(3, 3)]).isObstacle({ x: 3, y: 3 })).toBe(true);
  });

  it('aceita só coordenadas inteiras de 0 a 7', () => {
    expect(open.isInBounds({ x: 0, y: 0 })).toBe(true);
    expect(open.isInBounds({ x: 7, y: 7 })).toBe(true);
    expect(open.isInBounds({ x: -1, y: 0 })).toBe(false);
    expect(open.isInBounds({ x: 0, y: 8 })).toBe(false);
    expect(open.isInBounds({ x: 1.5, y: 2 })).toBe(false);
  });

  it('calcula a distância de Manhattan', () => {
    expect(manhattan({ x: 1, y: 1 }, { x: 4, y: 3 })).toBe(5);
    expect(manhattan({ x: 2, y: 2 }, { x: 3, y: 3 })).toBe(2);
  });

  it('devolve só vizinhos ortogonais dentro da grade', () => {
    expect(open.getNeighbors({ x: 0, y: 0 })).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ]);
    expect(open.getNeighbors({ x: 3, y: 3 })).toHaveLength(4);
  });

  it('unidade viva ocupa a célula, unidade morta não', () => {
    const alive = unit(meleeAt(2, 2));
    const dead = unit(meleeAt(3, 3, 'skeleton-2'), { alive: false, hp: 0 });
    expect(open.isOccupied({ x: 2, y: 2 }, [alive, dead])).toBe(true);
    expect(open.isOccupied({ x: 3, y: 3 }, [alive, dead])).toBe(false);
    expect(open.isBlocked({ x: 3, y: 3 }, [alive, dead])).toBe(false);
  });

  it('considera bloqueado o que está fora da grade, é obstáculo ou está ocupado', () => {
    const grid = new GridSystem(8, [wall(1, 1)]);
    const units = [unit(meleeAt(2, 2))];
    expect(grid.isBlocked({ x: 8, y: 0 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 1, y: 1 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 2, y: 2 }, units)).toBe(true);
    expect(grid.isBlocked({ x: 0, y: 0 }, units)).toBe(false);
  });
});

describe('GridSystem.getReachableCells', () => {
  it('alcança as células a até `range` passos, sem a origem', () => {
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

  it('não para em obstáculo nem em célula ocupada', () => {
    const grid = new GridSystem(8, [crate(1, 0)]);
    const cells = grid.getReachableCells({ x: 0, y: 0 }, 2, [unit(meleeAt(0, 2))]);
    expect(cells).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it('não atravessa obstáculos: contornar custa passos', () => {
    // Parede em x=1 com passagem só em y=3.
    const grid = new GridSystem(
      8,
      [0, 1, 2, 4, 5, 6, 7].map((y) => wall(1, y)),
    );
    expect(grid.getReachableCells({ x: 0, y: 0 }, 3, [])).not.toContainEqual({ x: 2, y: 0 });
    expect(grid.getReachableCells({ x: 0, y: 0 }, 8, [])).toContainEqual({ x: 2, y: 0 });
  });

  it('não atravessa unidade viva, mas atravessa célula de unidade morta', () => {
    // Corredor de uma célula de largura em y=0.
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

  it('devolve só a origem quando origem e destino coincidem', () => {
    expect(open.getPath({ x: 2, y: 2 }, { x: 2, y: 2 }, [])).toEqual([{ x: 2, y: 2 }]);
  });

  it('contorna obstáculos e unidades vivas', () => {
    const grid = new GridSystem(8, [crate(1, 0)]);
    const blocker = unit(meleeAt(1, 1));
    const path = grid.getPath({ x: 0, y: 0 }, { x: 2, y: 0 }, [blocker])!;
    expect(path).not.toContainEqual({ x: 1, y: 0 });
    expect(path).not.toContainEqual({ x: 1, y: 1 });
    expect(path).toHaveLength(7);
  });

  it('devolve null se o destino é obstáculo, está ocupado ou fica fora da grade', () => {
    const grid = new GridSystem(8, [pillar(4, 4)]);
    const units = [unit(meleeAt(5, 5))];
    expect(grid.getPath({ x: 0, y: 0 }, { x: 4, y: 4 }, units)).toBeNull();
    expect(grid.getPath({ x: 0, y: 0 }, { x: 5, y: 5 }, units)).toBeNull();
    expect(grid.getPath({ x: 0, y: 0 }, { x: 8, y: 0 }, units)).toBeNull();
    expect(grid.getPath({ x: -1, y: 0 }, { x: 1, y: 0 }, units)).toBeNull();
  });

  it('devolve null se o destino está cercado', () => {
    const grid = new GridSystem(8, [wall(1, 0), crate(0, 1)]);
    expect(grid.getPath({ x: 5, y: 5 }, { x: 0, y: 0 }, [])).toBeNull();
  });
});

describe('GridSystem.hasLineOfSight', () => {
  const from = { x: 0, y: 0 };

  it('é livre em campo aberto e para a própria célula', () => {
    expect(open.hasLineOfSight(from, { x: 7, y: 7 })).toBe(true);
    expect(open.hasLineOfSight(from, { x: 5, y: 2 })).toBe(true);
    expect(open.hasLineOfSight(from, from)).toBe(true);
  });

  it.each([
    ['wall', wall, false],
    ['pillar', pillar, false],
    ['crate', crate, true],
    ['barrel', barrel, true],
  ] as const)('%s no meio da linha: visão %s', (_kind, make, expected) => {
    expect(new GridSystem(8, [make(1, 0)]).hasLineOfSight(from, { x: 3, y: 0 })).toBe(expected);
    expect(new GridSystem(8, [make(0, 2)]).hasLineOfSight(from, { x: 0, y: 3 })).toBe(expected);
    expect(new GridSystem(8, [make(1, 1)]).hasLineOfSight(from, { x: 2, y: 2 })).toBe(expected);
  });

  it('origem e destino não bloqueiam por si mesmos', () => {
    const grid = new GridSystem(8, [wall(0, 0), wall(3, 0)]);
    expect(grid.hasLineOfSight(from, { x: 3, y: 0 })).toBe(true);
  });

  it('obstáculo fora da linha não bloqueia', () => {
    const grid = new GridSystem(8, [wall(1, 1), wall(2, 1), wall(0, 1)]);
    expect(grid.hasLineOfSight(from, { x: 3, y: 0 })).toBe(true);
  });

  it('linha inclinada é bloqueada por qualquer célula que ela atravessa', () => {
    // De (0,0) a (2,1) a linha atravessa (1,0) e (1,1), e não toca (2,0) nem (0,1).
    const to = { x: 2, y: 1 };
    expect(new GridSystem(8, [wall(1, 0)]).hasLineOfSight(from, to)).toBe(false);
    expect(new GridSystem(8, [wall(1, 1)]).hasLineOfSight(from, to)).toBe(false);
    expect(new GridSystem(8, [wall(2, 0), wall(0, 1)]).hasLineOfSight(from, to)).toBe(true);
  });

  it('passa entre dois obstáculos que só se tocam pelo canto', () => {
    const grid = new GridSystem(8, [wall(1, 0), wall(0, 1)]);
    expect(grid.hasLineOfSight(from, { x: 1, y: 1 })).toBe(true);
    expect(grid.hasLineOfSight(from, { x: 3, y: 3 })).toBe(true);
  });

  it('é simétrica', () => {
    const grid = new GridSystem();
    for (let i = 0; i < 64; i++) {
      for (let j = i + 1; j < 64; j++) {
        const a = { x: i % 8, y: Math.floor(i / 8) };
        const b = { x: j % 8, y: Math.floor(j / 8) };
        expect(grid.hasLineOfSight(a, b)).toBe(grid.hasLineOfSight(b, a));
      }
    }
  });

  it('aceita uma lista de obstáculos explícita', () => {
    expect(open.hasLineOfSight(from, { x: 3, y: 0 }, [wall(2, 0)])).toBe(false);
    expect(open.hasLineOfSight(from, { x: 3, y: 0 }, [crate(2, 0)])).toBe(true);
  });
});
