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
  it('ataca quando há alvo ao alcance', () => {
    const knight = unit(knightAt(1, 1));
    const skeleton = unit(meleeAt(1, 2));
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toEqual({ type: 'attack', target: knight });
  });

  it('anda pelo menor caminho em direção ao alvo, até moveRange passos', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 5));
    expect(movePath(nextEnemyAction(skeleton, [knight, skeleton], open))).toEqual([
      { x: 0, y: 5 },
      { x: 0, y: 4 },
      { x: 0, y: 3 },
    ]);
  });

  it('para na célula adjacente ao alvo, sem gastar o movimento todo', () => {
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

  it('encerra a ação se já se moveu e segue sem alvo ao alcance', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 3), { hasMoved: true });
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toBeNull();
  });

  it('não faz mais nada depois de atacar', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 1), { hasAttacked: true });
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)).toBeNull();
  });

  it.each([
    ['melee-skeleton', meleeAt],
    ['skeleton-archer', boneArcherAt],
    ['armored-skeleton', armoredAt],
  ] as const)('%s morto não age', (_type, at) => {
    const knight = unit(knightAt(0, 0));
    const dead = unit(at(0, 1), { alive: false, hp: 0 });
    expect(nextEnemyAction(dead, [knight, dead], open)).toBeNull();
  });

  it('não age se não há aliado vivo, e ignora os mortos como alvo', () => {
    const deadKnight = unit(knightAt(0, 1), { alive: false, hp: 0 });
    const skeleton = unit(meleeAt(0, 2));
    expect(nextEnemyAction(skeleton, [deadKnight, skeleton], open)).toBeNull();

    const mage = unit(mageAt(0, 7));
    expect(last(movePath(nextEnemyAction(skeleton, [deadKnight, mage, skeleton], open)))).toEqual({ x: 0, y: 4 });
  });

  it('contorna obstáculos', () => {
    const grid = new GridSystem(8, [crate(0, 2)]);
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 3));
    expect(movePath(nextEnemyAction(skeleton, [knight, skeleton], grid))).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ]);
  });

  it('não atravessa nem ocupa a célula de outra unidade viva', () => {
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

  it('atravessa a célula de uma unidade morta', () => {
    const knight = unit(knightAt(0, 0));
    const dead = unit(meleeAt(1, 0, 'front'), { alive: false, hp: 0 });
    const back = unit(meleeAt(2, 0, 'back'));
    expect(movePath(nextEnemyAction(back, [knight, dead, back], open))).toEqual([
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('sem caminho até uma posição de ataque, chega o mais perto que consegue', () => {
    const grid = new GridSystem(8, [crate(1, 0), crate(0, 1)]);
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(5, 0));
    const path = movePath(nextEnemyAction(skeleton, [knight, skeleton], grid));
    expect(path).toHaveLength(3);
    expect(manhattan(last(path), knight.pos)).toBe(3);
  });

  it('fica parado se andar não o aproxima de ninguém', () => {
    const grid = new GridSystem(8, [crate(0, 1)]);
    const knight = unit(knightAt(0, 0));
    const front = unit(meleeAt(1, 0, 'front'));
    const back = unit(meleeAt(2, 0, 'back'));
    expect(nextEnemyAction(back, [knight, front, back], grid)).toBeNull();
  });

  it('é determinística', () => {
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
  it('vai até o aliado mais próximo pelo caminho', () => {
    const knight = unit(knightAt(0, 0));
    const mage = unit(mageAt(7, 4));
    const skeleton = unit(meleeAt(5, 4));
    // O guerreiro vem antes na lista, mas o mago está a um passo de distância.
    expect(movePath(nextEnemyAction(skeleton, [knight, mage, skeleton], open))).toEqual([
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ]);
  });

  it('entre os alvos ao alcance, bate no de menos HP', () => {
    const knight = unit(knightAt(1, 0));
    const mage = unit(mageAt(0, 1));
    const skeleton = unit(meleeAt(1, 1));
    expect(nextEnemyAction(skeleton, [knight, mage, skeleton], open)).toEqual({ type: 'attack', target: mage });
  });

  it('só ataca corpo a corpo', () => {
    const knight = unit(knightAt(0, 0));
    const skeleton = unit(meleeAt(0, 2));
    expect(nextEnemyAction(skeleton, [knight, skeleton], open)?.type).toBe('move');
  });
});

describe('EnemyAI: armored-skeleton', () => {
  it('entre os alvos ao alcance, bate no mais próximo, e não no mais fraco', () => {
    const knight = unit(knightAt(1, 0));
    const mage = unit(mageAt(0, 1));
    const armored = unit(armoredAt(1, 1));
    expect(nextEnemyAction(armored, [knight, mage, armored], open)).toEqual({ type: 'attack', target: knight });
  });

  it('avança para a célula que engaja mais aliados; o melee-skeleton pega a primeira', () => {
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

    // Os dois gastam o mesmo número de passos: a diferença é só a escolha da célula.
    expect(armoredPath).toHaveLength(meleePath.length);
  });

  it('avança mesmo sem chegar ao alvo neste turno', () => {
    const knight = unit(knightAt(0, 0));
    const armored = unit(armoredAt(0, 6));
    expect(last(movePath(nextEnemyAction(armored, [knight, armored], open)))).toEqual({ x: 0, y: 4 });
  });
});

describe('EnemyAI: skeleton-archer', () => {
  it('atira de longe quando tem alcance e linha de visão', () => {
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

  it('caixote não tira a linha de visão', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(0, 3));
    const grid = new GridSystem(8, [crate(0, 1)]);
    expect(nextEnemyAction(archer, [knight, archer], grid)?.type).toBe('attack');
  });

  it('sem linha de visão, anda até uma célula com tiro e atira de lá', () => {
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

  it('fora de alcance, só se aproxima até ter tiro e não encosta no alvo', () => {
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

  it('cercado, sem como chegar a uma célula com tiro nem se aproximar, fica parado', () => {
    const knight = unit(knightAt(0, 0));
    const archer = unit(boneArcherAt(7, 7));
    const grid = new GridSystem(8, [crate(6, 7), crate(7, 6)]);
    expect(nextEnemyAction(archer, [knight, archer], grid)).toBeNull();
  });
});

describe('EnemyAI: goblin-scout', () => {
  it('move até 4 células em direção ao aliado vivo mais vulnerável (menor HP)', () => {
    const knight = unit(knightAt(0, 0)); // HP 10, mais próximo (dist 2)
    const mage = unit(mageAt(0, 6), { hp: 3 }); // HP 3, mais vulnerável (dist 4)
    const goblin = unit(goblinAt(0, 2)); // moveRange 4

    const path = movePath(nextEnemyAction(goblin, [knight, mage, goblin], open));
    expect(path.length - 1).toBeLessThanOrEqual(4);
    expect(last(path)).toEqual({ x: 0, y: 5 });
  });

  it('entre os alvos ao alcance, ataca o de menor HP', () => {
    const knight = unit(knightAt(1, 0), { hp: 10 });
    const mage = unit(mageAt(0, 1), { hp: 2 });
    const goblin = unit(goblinAt(1, 1));
    expect(nextEnemyAction(goblin, [knight, mage, goblin], open)).toEqual({ type: 'attack', target: mage });
  });
});

describe('EnemyAI: cultist-mage', () => {
  it('ataca à distância (alcance 3) com linha de visão e prioriza menor HP', () => {
    const knight = unit(knightAt(0, 2), { hp: 10 });
    const mage = unit(mageAt(3, 3), { hp: 4 });
    const cultist = unit(cultistAt(0, 3));
    expect(nextEnemyAction(cultist, [knight, mage, cultist], open)).toEqual({ type: 'attack', target: mage });
  });

  it('ao buscar posição de tiro, prefere manter distância >= 2 dos aliados', () => {
    const knight = unit(knightAt(0, 0));
    const cultist = unit(cultistAt(0, 5));
    const path = movePath(nextEnemyAction(cultist, [knight, cultist], open));
    expect(manhattan(last(path), knight.pos)).toBeGreaterThanOrEqual(2);
    expect(canReach(last(path), knight.pos, cultist.attackRange, open)).toBe(true);
  });
});
