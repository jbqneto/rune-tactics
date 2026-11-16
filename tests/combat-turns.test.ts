import { describe, expect, it } from 'vitest';
import { INITIAL_UNITS, SKILLS } from '../src/config/gameConfig';
import {
  canAttack,
  getSkillAreaCells,
  getSkillTargetCells,
  isValidSkillTarget,
  resolveAttack,
  resolveSkill,
} from '../src/game/combat/CombatSystem';
import { createUnits } from '../src/game/entities/UnitFactory';
import { GridSystem } from '../src/game/grid/GridSystem';
import { TurnSystem } from '../src/game/turns/TurnSystem';
import { archerAt, armoredAt, boneArcherAt, clericAt, crate, cultistAt, goblinAt, knightAt, mageAt, meleeAt, unit, wall } from './helpers';

const open = new GridSystem(8, []);

describe('UnitFactory', () => {
  it.each([
    ['knight', knightAt, { name: 'Guerreiro', maxHp: 10, moveRange: 3, damage: 2, attackRange: 1 }, 'runic-strike'],
    ['archer', archerAt, { name: 'Arqueira', maxHp: 8, moveRange: 3, damage: 2, attackRange: 3 }, 'marked-shot'],
    ['mage', mageAt, { name: 'Mago', maxHp: 7, moveRange: 2, damage: 1, attackRange: 2 }, 'arcane-burst'],
    ['cleric', clericAt, { name: 'Clérigo', maxHp: 9, moveRange: 2, damage: 2, attackRange: 1 }, 'healing-light'],
  ] as const)('cria a classe %s com stats e habilidade', (type, at, stats, skillId) => {
    expect(unit(at(0, 0))).toMatchObject({
      ...stats,
      type,
      team: 'player',
      hp: stats.maxHp,
      alive: true,
      hasMoved: false,
      hasAttacked: false,
      hasActivatedThisRound: false,
      skillId,
      skillName: SKILLS[skillId].name,
      skillCooldown: 0,
      portraitPath: `/assets/portraits/${type}.${type === 'cleric' ? 'svg' : 'png'}`,
    });
  });

  it.each([
    ['melee-skeleton', meleeAt, { name: 'Melee Skeleton', maxHp: 5, moveRange: 2, damage: 1, attackRange: 1 }],
    ['skeleton-archer', boneArcherAt, { name: 'Skeleton Archer', maxHp: 4, moveRange: 2, damage: 1, attackRange: 3 }],
    ['armored-skeleton', armoredAt, { name: 'Armored Skeleton', maxHp: 8, moveRange: 2, damage: 2, attackRange: 1 }],
    ['goblin-scout', goblinAt, { name: 'Goblin Scout', maxHp: 4, moveRange: 4, damage: 1, attackRange: 1 }],
    ['cultist-mage', cultistAt, { name: 'Cultist Mage', maxHp: 5, moveRange: 2, damage: 2, attackRange: 3 }],
  ] as const)('cria o inimigo %s sem habilidade', (type, at, stats) => {
    expect(unit(at(0, 0))).toMatchObject({
      ...stats,
      type,
      team: 'enemy',
      hasActivatedThisRound: false,
      skillId: null,
      skillName: null,
    });
  });

  it('as habilidades têm dano/cura, alcance, recarga e área da V2.2', () => {
    expect(SKILLS['runic-strike']).toMatchObject({ name: 'Runic Strike', targetTeam: 'enemy', damage: 3, heal: 0, range: 1, cooldown: 2, area: 'single' });
    expect(SKILLS['marked-shot']).toMatchObject({ name: 'Marked Shot', targetTeam: 'enemy', damage: 3, heal: 0, range: 3, cooldown: 2, area: 'single' });
    expect(SKILLS['arcane-burst']).toMatchObject({ name: 'Arcane Burst', targetTeam: 'enemy', damage: 2, heal: 0, range: 3, cooldown: 3, area: 'cross' });
    expect(SKILLS['healing-light']).toMatchObject({ name: 'Healing Light', targetTeam: 'ally', damage: 0, heal: 3, range: 3, cooldown: 2, area: 'single' });
  });

  it('a batalha inicial tem 4 heróis e os 5 tipos de inimigos', () => {
    const units = createUnits();
    expect(units.filter((u) => u.team === 'player').map((u) => u.id)).toEqual([
      'knight-1',
      'archer-1',
      'mage-1',
      'cleric-1',
    ]);
    const enemyTypes = new Set(units.filter((u) => u.team === 'enemy').map((u) => u.type));
    expect(enemyTypes).toEqual(
      new Set(['melee-skeleton', 'skeleton-archer', 'armored-skeleton', 'goblin-scout', 'cultist-mage']),
    );
  });

  it('não compartilha a posição com a config', () => {
    const [knight] = createUnits();
    knight.pos.x = 11;
    expect(INITIAL_UNITS[0].pos.x).toBe(4);
  });
});

describe('CombatSystem: ataque básico', () => {
  it('corpo a corpo alcança só a célula ortogonalmente adjacente', () => {
    const knight = unit(knightAt(1, 1));
    expect(canAttack(knight, unit(meleeAt(1, 2)), open)).toBe(true);
    expect(canAttack(knight, unit(meleeAt(2, 2)), open)).toBe(false);
    expect(canAttack(knight, unit(meleeAt(1, 3)), open)).toBe(false);
  });

  it('só permite atacar inimigo vivo, com atacante vivo que ainda não atacou', () => {
    const knight = unit(knightAt(1, 1));
    const skeleton = unit(meleeAt(1, 2));
    expect(canAttack(knight, unit(mageAt(1, 2)), open)).toBe(false);
    expect(canAttack(knight, { ...skeleton, alive: false }, open)).toBe(false);
    expect(canAttack({ ...knight, alive: false }, skeleton, open)).toBe(false);
    expect(canAttack({ ...knight, hasAttacked: true }, skeleton, open)).toBe(false);
  });

  it('ataque à distância vale até o alcance e exige linha de visão', () => {
    const archer = unit(archerAt(0, 0));
    expect(canAttack(archer, unit(meleeAt(0, 3)), open)).toBe(true);
    expect(canAttack(archer, unit(meleeAt(2, 1)), open)).toBe(true);
    expect(canAttack(archer, unit(meleeAt(0, 4)), open)).toBe(false);

    const target = unit(meleeAt(0, 3));
    expect(canAttack(archer, target, new GridSystem(8, [wall(0, 1)]))).toBe(false);
    expect(canAttack(archer, target, new GridSystem(8, [crate(0, 1)]))).toBe(true);
  });

  it('unidades não bloqueiam a linha de visão', () => {
    const archer = unit(archerAt(0, 0));
    const target = unit(meleeAt(0, 2));
    expect(canAttack(archer, target, open)).toBe(true);
    // O guerreiro em (0,1) está no meio da linha e o tiro passa mesmo assim.
    expect(open.hasLineOfSight(archer.pos, target.pos)).toBe(true);
  });

  it('corpo a corpo ignora linha de visão', () => {
    const grid = new GridSystem(8, [wall(0, 1), wall(2, 1)]);
    expect(canAttack(unit(knightAt(1, 1)), unit(meleeAt(1, 2)), grid)).toBe(true);
  });

  it('aplica dano fixo, marca o atacante e informa se é à distância', () => {
    const knight = unit(knightAt(1, 1));
    const skeleton = unit(meleeAt(1, 2));
    expect(resolveAttack(knight, skeleton)).toEqual([
      {
        type: 'unitAttacked',
        attackerId: 'knight-1',
        targetId: 'melee-skeleton-1',
        damage: 2,
        targetHpRemaining: 3,
        isRanged: false,
      },
    ]);
    expect(skeleton).toMatchObject({ hp: 3, alive: true });
    expect(knight.hasAttacked).toBe(true);

    const [shot] = resolveAttack(unit(archerAt(0, 0)), unit(meleeAt(0, 3)));
    expect(shot).toMatchObject({ damage: 2, isRanged: true });
  });

  it('mata o alvo quando o HP chega a 0, sem ficar negativo', () => {
    const skeleton = unit(meleeAt(1, 2), { hp: 1 });
    const events = resolveAttack(unit(knightAt(1, 1)), skeleton);
    expect(skeleton).toMatchObject({ hp: 0, alive: false });
    expect(events.map((e) => e.type)).toEqual(['unitAttacked', 'unitDied']);
    expect(events[0]).toMatchObject({ targetHpRemaining: 0 });
  });
});

describe('CombatSystem: habilidades', () => {
  it('área: uma célula para alvo único, cruz para arcane-burst, sempre dentro da grade', () => {
    expect(getSkillAreaCells(SKILLS['runic-strike'], { x: 3, y: 3 }, open)).toEqual([{ x: 3, y: 3 }]);
    expect(getSkillAreaCells(SKILLS['marked-shot'], { x: 3, y: 3 }, open)).toEqual([{ x: 3, y: 3 }]);

    const cross = getSkillAreaCells(SKILLS['arcane-burst'], { x: 3, y: 3 }, open);
    expect(cross).toHaveLength(5);
    for (const c of [
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 3 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
    ]) {
      expect(cross).toContainEqual(c);
    }

    expect(getSkillAreaCells(SKILLS['arcane-burst'], { x: 0, y: 0 }, open)).toHaveLength(3);
    expect(getSkillAreaCells(SKILLS['arcane-burst'], { x: 8, y: 0 }, open)).toEqual([]);
  });

  it('Runic Strike: 3 de dano corpo a corpo e recarga de 2', () => {
    const knight = unit(knightAt(1, 1));
    const skeleton = unit(meleeAt(1, 2));
    const events = resolveSkill(knight, SKILLS['runic-strike'], skeleton.pos, [knight, skeleton], open);

    expect(events).toEqual([
      {
        type: 'skillUsed',
        casterId: 'knight-1',
        skillId: 'runic-strike',
        targetCell: { x: 1, y: 2 },
        affectedUnitIds: ['melee-skeleton-1'],
      },
      {
        type: 'unitAttacked',
        attackerId: 'knight-1',
        targetId: 'melee-skeleton-1',
        damage: 3,
        targetHpRemaining: 2,
        isRanged: false,
        skillId: 'runic-strike',
      },
    ]);
    expect(knight).toMatchObject({ hasAttacked: true, skillCooldown: 2 });
  });

  it('Runic Strike só alcança inimigo adjacente', () => {
    const knight = unit(knightAt(1, 1));
    const near = unit(meleeAt(1, 2));
    const far = unit(meleeAt(1, 4, 'melee-skeleton-2'));
    expect(getSkillTargetCells(knight, [knight, near, far], open)).toEqual([{ x: 1, y: 2 }]);
  });

  it('Marked Shot: 3 de dano a até 3 células, com linha de visão', () => {
    const archer = unit(archerAt(0, 0));
    const skeleton = unit(boneArcherAt(0, 3));
    const units = [archer, skeleton];
    const skill = SKILLS['marked-shot'];

    expect(isValidSkillTarget(archer, skill, skeleton.pos, units, open)).toBe(true);
    expect(isValidSkillTarget(archer, skill, skeleton.pos, units, new GridSystem(8, [wall(0, 2)]))).toBe(false);
    expect(isValidSkillTarget(archer, skill, skeleton.pos, units, new GridSystem(8, [crate(0, 2)]))).toBe(true);
    expect(isValidSkillTarget(archer, skill, { x: 0, y: 2 }, units, open)).toBe(false);

    const events = resolveSkill(archer, skill, skeleton.pos, units, open);
    expect(events[1]).toMatchObject({ damage: 3, targetHpRemaining: 1, isRanged: true, skillId: 'marked-shot' });
    expect(archer).toMatchObject({ hasAttacked: true, skillCooldown: 2 });

    const out = unit(boneArcherAt(0, 4));
    expect(isValidSkillTarget(unit(archerAt(0, 0)), skill, out.pos, [out], open)).toBe(false);
  });

  it('Arcane Burst: 2 de dano na célula alvo e nas adjacentes, sem ferir aliados', () => {
    const mage = unit(mageAt(0, 1));
    const knight = unit(knightAt(1, 1));
    const center = unit(meleeAt(2, 1, 'center'));
    const right = unit(meleeAt(3, 1, 'right'));
    const up = unit(armoredAt(2, 2, 'up'));
    const diagonal = unit(meleeAt(3, 2, 'diagonal'));
    const far = unit(meleeAt(4, 1, 'far'));
    const units = [mage, knight, center, right, up, diagonal, far];

    const events = resolveSkill(mage, SKILLS['arcane-burst'], { x: 2, y: 1 }, units, open);

    expect(events[0]).toEqual({
      type: 'skillUsed',
      casterId: 'mage-1',
      skillId: 'arcane-burst',
      targetCell: { x: 2, y: 1 },
      affectedUnitIds: ['center', 'right', 'up'],
    });
    expect(events.slice(1).map((e) => e.type)).toEqual(['unitAttacked', 'unitAttacked', 'unitAttacked']);
    for (const e of events.slice(1)) expect(e).toMatchObject({ damage: 2, isRanged: true, skillId: 'arcane-burst' });

    expect([center.hp, right.hp, up.hp]).toEqual([3, 3, 6]);
    expect([diagonal.hp, far.hp]).toEqual([5, 5]);
    // O guerreiro está em (1,1), dentro da cruz, e não é ferido.
    expect(knight.hp).toBe(10);
    expect(mage).toMatchObject({ hp: 7, hasAttacked: true, skillCooldown: 3 });
  });

  it('Arcane Burst mata e ignora quem já está morto', () => {
    const mage = unit(mageAt(0, 0));
    const weak = unit(meleeAt(2, 0, 'weak'), { hp: 2 });
    const dead = unit(meleeAt(2, 1, 'dead'), { hp: 0, alive: false });
    const events = resolveSkill(mage, SKILLS['arcane-burst'], { x: 2, y: 0 }, [mage, weak, dead], open);
    expect(events.map((e) => e.type)).toEqual(['skillUsed', 'unitAttacked', 'unitDied']);
    expect(events[0]).toMatchObject({ affectedUnitIds: ['weak'] });
    expect(weak.alive).toBe(false);
  });

  it('Arcane Burst pode mirar uma célula vazia desde que a área pegue um inimigo', () => {
    const mage = unit(mageAt(0, 0));
    const skeleton = unit(meleeAt(3, 1));
    const cells = getSkillTargetCells(mage, [mage, skeleton], open);
    // (2,1) e (3,0) estão a 3 do mago e encostam no esqueleto; (3,1) está a 4.
    expect(cells).toContainEqual({ x: 2, y: 1 });
    expect(cells).toContainEqual({ x: 3, y: 0 });
    expect(cells).not.toContainEqual({ x: 3, y: 1 });
    expect(cells).not.toContainEqual({ x: 1, y: 0 });
  });

  it('célula alvo não pode ser obstáculo, a própria célula, nem ficar sem linha de visão', () => {
    const mage = unit(mageAt(0, 0));
    const skeleton = unit(meleeAt(0, 3));
    const units = [mage, skeleton];
    const skill = SKILLS['arcane-burst'];

    expect(isValidSkillTarget(mage, skill, { x: 0, y: 2 }, units, open)).toBe(true);
    expect(isValidSkillTarget(mage, skill, { x: 0, y: 2 }, units, new GridSystem(8, [crate(0, 2)]))).toBe(false);
    expect(isValidSkillTarget(mage, skill, { x: 0, y: 3 }, units, new GridSystem(8, [wall(0, 1)]))).toBe(false);

    const adjacent = unit(meleeAt(0, 1));
    expect(isValidSkillTarget(mage, skill, mage.pos, [mage, adjacent], open)).toBe(false);
  });

  it('sem células alvo se a unidade já atacou, está em recarga, morreu ou não tem habilidade', () => {
    const skeleton = unit(meleeAt(1, 2));
    const cellsFor = (overrides: object) => {
      const knight = unit(knightAt(1, 1), overrides);
      return getSkillTargetCells(knight, [knight, skeleton], open);
    };
    expect(cellsFor({})).toHaveLength(1);
    expect(cellsFor({ hasAttacked: true })).toEqual([]);
    expect(cellsFor({ skillCooldown: 1 })).toEqual([]);
    expect(cellsFor({ alive: false })).toEqual([]);
    expect(getSkillTargetCells(skeleton, [unit(knightAt(1, 1)), skeleton], open)).toEqual([]);
  });

  it('Healing Light: cura aliado ferido (e o próprio lançador) até maxHp, respeitando LoS e ignorando mortos', () => {
    const cleric = unit(clericAt(0, 0), { hp: 7 });
    const knight = unit(knightAt(0, 2), { hp: 8 });
    const fullArcher = unit(archerAt(1, 0));
    const deadMage = unit(mageAt(0, 1), { hp: 0, alive: false });
    const units = [cleric, knight, fullArcher, deadMage];

    const targets = getSkillTargetCells(cleric, units, open);
    expect(targets).toContainEqual(cleric.pos);
    expect(targets).toContainEqual(knight.pos);
    expect(targets).not.toContainEqual(fullArcher.pos);
    expect(targets).not.toContainEqual(deadMage.pos);

    expect(getSkillTargetCells(cleric, units, new GridSystem(8, [wall(0, 1)]))).toEqual([cleric.pos]);

    const events = resolveSkill(cleric, SKILLS['healing-light'], knight.pos, units, open);
    expect(events).toEqual([
      {
        type: 'skillUsed',
        casterId: 'cleric-1',
        skillId: 'healing-light',
        targetCell: { x: 0, y: 2 },
        affectedUnitIds: ['knight-1'],
      },
      {
        type: 'unitHealed',
        casterId: 'cleric-1',
        targetId: 'knight-1',
        amount: 2,
        targetHpAfter: 10,
      },
    ]);
    expect(knight.hp).toBe(10);
    expect(cleric).toMatchObject({ hasAttacked: true, skillCooldown: 2 });
  });
});

describe('TurnSystem: ordem fixa intercalada (V2.1)', () => {
  const squad = () => [unit(knightAt(0, 0)), unit(mageAt(1, 0)), unit(meleeAt(7, 7)), unit(armoredAt(6, 7))];

  it('gera ordem fixa intercalada e percorre até virar a rodada', () => {
    const turns = new TurnSystem();
    const units = [unit(knightAt(0, 0)), unit(meleeAt(7, 7)), unit(armoredAt(6, 7))];
    turns.reset(units);

    expect(turns.turnOrder).toEqual(['knight-1', 'melee-skeleton-1', 'armored-skeleton-1']);
    expect([turns.turnState, turns.phase, turns.round, turns.activeUnitId, turns.turnIndex]).toEqual([
      'player_unit_active',
      'player',
      1,
      'knight-1',
      0,
    ]);

    // 1. knight-1 termina -> passa para melee-skeleton-1
    expect(turns.advanceTurn(units[0], units)).toEqual([
      { type: 'activationEnded', unitId: 'knight-1' },
      { type: 'turnChanged', phase: 'enemy', round: 1 },
      { type: 'activationStarted', unitId: 'melee-skeleton-1', team: 'enemy', round: 1 },
    ]);
    expect([turns.turnState, turns.activeUnitId, turns.turnIndex]).toEqual([
      'enemy_activation',
      'melee-skeleton-1',
      1,
    ]);

    // 2. melee-skeleton-1 termina -> passa para armored-skeleton-1 (sobra inimiga)
    expect(turns.advanceTurn(units[1], units)).toEqual([
      { type: 'activationEnded', unitId: 'melee-skeleton-1' },
      { type: 'activationStarted', unitId: 'armored-skeleton-1', team: 'enemy', round: 1 },
    ]);
    expect([turns.turnState, turns.activeUnitId, turns.turnIndex]).toEqual([
      'enemy_activation',
      'armored-skeleton-1',
      2,
    ]);

    // 3. armored-skeleton-1 termina -> vira rodada 2 e volta ao índice 0
    expect(turns.advanceTurn(units[2], units)).toEqual([
      { type: 'activationEnded', unitId: 'armored-skeleton-1' },
      { type: 'roundStarted', round: 2 },
      { type: 'turnChanged', phase: 'player', round: 2 },
      { type: 'activationStarted', unitId: 'knight-1', team: 'player', round: 2 },
    ]);
    expect([turns.turnState, turns.phase, turns.round, turns.activeUnitId, turns.turnIndex]).toEqual([
      'player_unit_active',
      'player',
      2,
      'knight-1',
      0,
    ]);
    expect(units.every((u) => !u.hasMoved && !u.hasAttacked && !u.hasActivatedThisRound)).toBe(true);
  });

  it('pula unidades mortas sem reordenar turnOrder e reduz recarga só na virada de rodada', () => {
    const turns = new TurnSystem();
    const units = [unit(knightAt(0, 0)), unit(meleeAt(7, 7))];
    turns.reset(units);
    units[0].skillCooldown = 2;
    units[0].hasMoved = true;
    units[1].alive = false;

    const events = turns.advanceTurn(units[0], units);
    expect(events.map((e) => e.type)).toEqual([
      'activationEnded',
      'roundStarted',
      'turnChanged',
      'activationStarted',
    ]);
    expect(turns.turnOrder).toEqual(['knight-1', 'melee-skeleton-1']);
    expect(units[0]).toMatchObject({ skillCooldown: 1, hasMoved: false, hasActivatedThisRound: false });
  });

  it('vitória ou derrota têm prioridade imediata', () => {
    const turns = new TurnSystem();
    const units = squad();
    turns.reset(units);
    units[2].alive = false;
    units[3].alive = false;
    expect(turns.checkBattleEnd(units)).toEqual([{ type: 'battleEnded', winner: 'player' }]);
    expect([turns.turnState, turns.phase, turns.winner, turns.isOver, turns.activeUnitId]).toEqual([
      'victory',
      'victory',
      'player',
      true,
      null,
    ]);
    expect(turns.advanceTurn(units[0], units)).toEqual([]);
  });

  it('reset restaura rodada 1 e índice 0', () => {
    const turns = new TurnSystem();
    const units = squad();
    turns.reset(units);
    turns.advanceTurn(units[0], units);
    turns.reset(units);
    expect([turns.turnState, turns.phase, turns.round, turns.activeUnitId, turns.turnIndex, turns.winner]).toEqual([
      'player_unit_active',
      'player',
      1,
      'knight-1',
      0,
      null,
    ]);
  });
});
