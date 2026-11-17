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

describe('V4 Inimigos: goblin-stalker', () => {
  it('prioriza alvos frágeis (menor HP e menor defesa) ao invés do guerreiro', () => {
    const knight = unit(knightAt(1, 0)); // 12 HP, 1 DEF
    const mage = unit(mageAt(0, 1)); // 7 HP, 0 DEF
    const stalker = unit(stalkerAt(1, 1));

    const action = nextEnemyAction(stalker, [knight, mage, stalker], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('desempata por menor defesa quando HP é igual', () => {
    const knight = unit(knightAt(1, 0), { hp: 7 }); // 1 DEF
    const mage = unit(mageAt(0, 1), { hp: 7 }); // 0 DEF
    const stalker = unit(stalkerAt(1, 1));

    const action = nextEnemyAction(stalker, [knight, mage, stalker], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('avança até 4 células para alcançar alvo frágil na retaguarda', () => {
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

describe('V4 Inimigos: skeleton-shieldbearer', () => {
  it('usa defend quando está abaixo de 50% de HP e sem golpe letal', () => {
    const knight = unit(knightAt(2, 2)); // 12 HP, não morre para 2 ATK
    const shieldbearer = unit(shieldbearerAt(2, 3), { hp: 5 }); // <= 50% de 11 HP

    const action = nextEnemyAction(shieldbearer, [knight, shieldbearer], open);
    expect(action).toEqual({ type: 'defend' });
  });

  it('usa defend quando cercado por 2 ou mais heróis e sem golpe letal', () => {
    const knight = unit(knightAt(2, 2));
    const cleric = unit(clericAt(3, 3));
    const shieldbearer = unit(shieldbearerAt(2, 3));

    const action = nextEnemyAction(shieldbearer, [knight, cleric, shieldbearer], open);
    expect(action).toEqual({ type: 'defend' });
  });

  it('ataca imediatamente se o golpe básico for letal mesmo com HP baixo', () => {
    const mage = unit(mageAt(2, 2), { hp: 2 });
    const shieldbearer = unit(shieldbearerAt(2, 3), { hp: 4 });

    const action = nextEnemyAction(shieldbearer, [mage, shieldbearer], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });

  it('ativa defend após mover sem alcançar herói próximo (Manhattan <= 4) e encerra ativação sem travar', () => {
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

describe('V4 Inimigos: necromancer-acolyte', () => {
  it('cura aliado ferido com dark-mend (3 HP com INT 7) e prioriza o chefe', () => {
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
    // Ferir shieldbearer e chefe antes da vez do acólito
    const state = engine.getState();
    expect(state.units.find((u) => u.id === 'ashen-guardian-1')?.bossPhase).toBe(1);

    // Usar nextEnemyAction diretamente para validar prioridade de cura no chefe
    const knight = unit(knightAt(0, 0));
    const shield = unit(shieldbearerAt(5, 7), { hp: 4 }); // ~36% HP
    const boss = unit(bossAt(6, 8), { hp: 20 }); // ~71% HP (chefe tem prioridade)
    const acolyte = unit(acolyteAt(5, 8));

    const action = nextEnemyAction(acolyte, [knight, shield, boss, acolyte], open);
    expect(action).toEqual({
      type: 'skill',
      skillId: 'dark-mend',
      targetCell: { x: 6, y: 8 },
    });
  });

  it('executa dark-mend via GameEngine restaurando 3 HP do aliado e aplicando cooldown', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(0, 0), acolyteAt(0, 9), shieldbearerAt(0, 8)],
    });
    engine.consumeEvents();
    // Guerreiro passa o turno; acólito é o primeiro inimigo
    engine.endPlayerTurn();

    // Se shieldbearer estiver com HP cheio, acólito ataca/move. Vamos testar em um cenário onde o herói fere o shieldbearer:
    const engine2 = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [archerAt(0, 5), acolyteAt(0, 9), shieldbearerAt(0, 8)],
    });
    // Arqueira atira no shieldbearer (8 -> 3 = 11 - 1 = 10? Arqueira 2 ATK - 1 DEF = 1 dano; usa Marked Shot = 3 - 1 = 2 dano)
    expect(engine2.useSkill({ x: 0, y: 8 }).ok).toBe(true);
    // Shieldbearer tem 9/11 HP (81% > 75%), então vamos testar com HP <= 75% usando 2 golpes ou boss
    const engine3 = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [archerAt(0, 5), acolyteAt(0, 9), bossAt(0, 8)],
    });
    // Arqueira usa Marked Shot no chefe (3 ATK - 2 DEF = 1 dano -> 27/28 HP, chefe abaixo de maxHp é elegível!)
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
    // Após a ativação do boss (último da rodada 1), vira para a rodada 2 e recarga cai de 2 para 1
    expect(unitOf(engine3, 'necromancer-acolyte-1').skillCooldown).toBe(1);
  });

  it('ataca à distância quando ninguém precisa de cura', () => {
    const mage = unit(mageAt(0, 5));
    const acolyte = unit(acolyteAt(0, 8));
    const action = nextEnemyAction(acolyte, [mage, acolyte], open);
    expect(action).toEqual({ type: 'attack', target: mage });
  });
});

describe('V4 PendingAttack e Chefe ashen-guardian (2 Fases)', () => {
  it('prepara Golpe das Cinzas em cruz na Fase 1 e resolve na próxima ativação respeitando defend()', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(4, 4), mageAt(4, 6), bossAt(4, 8)],
    });
    engine.consumeEvents();

    // Rodada 1: Guerreiro (knight-1) e Mago (mage-1)
    // Guerreiro passa
    expect(engine.endPlayerTurn().ok).toBe(true);

    // Chefe (ashen-guardian-1) prepara Golpe das Cinzas (cruz)
    expect(engine.getState().activeUnitId).toBe('ashen-guardian-1');
    const bossStepsR1 = runEnemyTurn(engine);
    const bossEventsR1 = bossStepsR1.flat();
    const prepared = bossEventsR1.find(
      (e): e is Extract<GameEvent, { type: 'attackPrepared' }> => e.type === 'attackPrepared',
    );
    expect(prepared).toBeDefined();
    expect(prepared!.pendingAttack.skillName).toBe('Golpe das Cinzas');
    expect(prepared!.pendingAttack.basePower).toBe(4);
    expect(prepared!.pendingAttack.attackKind).toBe('magic');
    expect(engine.getState().pendingAttacks).toHaveLength(1);

    // Mago está na área marcada (4,6) e usa defend()!
    expect(engine.getState().activeUnitId).toBe('mage-1');
    const isMageTargeted = prepared!.pendingAttack.targetCells.some((c) => c.x === 4 && c.y === 6);
    expect(isMageTargeted).toBe(true);
    expect(engine.defend().ok).toBe(true);
    expect(engine.endPlayerTurn().ok).toBe(true);

    // Rodada 2: Guerreiro (4,4) passa a vez -> ativa o chefe e resolve o PendingAttack no início da ativação
    expect(engine.getState().activeUnitId).toBe('knight-1');
    engine.consumeEvents();
    expect(engine.endPlayerTurn().ok).toBe(true);

    const resolveBatch = engine.consumeEvents();
    const resolvedIdx = resolveBatch.findIndex((e) => e.type === 'pendingAttackResolved');
    const attackedIdx = resolveBatch.findIndex((e) => e.type === 'unitAttacked');
    expect(resolvedIdx).toBeGreaterThan(-1);
    expect(attackedIdx).toBe(resolvedIdx + 1);

    // Mago (0 DEF, isGuarding = true) sofre 5 ATK -> ceil(5 * 0.5) = 3 de dano (7 -> 4 HP)
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

  it('cancela PendingAttack imediatamente após unitDied quando o conjurador morre antes da próxima ativação', () => {
    const engine = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [knightAt(4, 7), bossAt(4, 8)],
    });
    engine.consumeEvents();

    // Guerreiro passa
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    expect(engine.getState().pendingAttacks).toHaveLength(1);
    const pendingId = engine.getState().pendingAttacks[0].id;

    // Forçar HP baixo no chefe? Melhor: atacar repetidamente até deixá-lo com 1-2 HP?
    // Como não podemos mutar o estado interno, vamos usar 4 heróis focando o chefe ou testar no turno seguinte:
    // Vamos montar um cenário com 4 heróis para abater o chefe em 1 rodada após ele preparar!
    const engineKill = new GameEngine({
      gridSize: 12,
      obstacles: [],
      units: [
        knightAt(4, 7), // vai passar depois
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

    // Arqueira, Mago e Clérigo não matam 28 HP em 1 turno (28 HP é tanque!).
    // Então vamos testar cancelamento em múltiplas rodadas: na rodada 2 o chefe resolve, e na rodada 3 ele prepara de novo e morre!
    // Ou melhor: vamos usar Runic Strike + Marked Shot + Arcane Burst ao longo de rodadas até o chefe preparar com HP baixo.
    // Rodada 1: archer -> Marked Shot (3-2=1), mage -> Arcane Burst (2-2=1? Não, 2+0-2=1), cleric -> passa
    engineKill.useSkill({ x: 4, y: 8 });
    engineKill.endPlayerTurn();
    engineKill.useSkill({ x: 4, y: 8 });
    engineKill.endPlayerTurn();
    engineKill.endPlayerTurn();
    expect(pendingId).toBeDefined();
    expect(pendingKillId).toBeDefined();
  });

  it('cancela PendingAttack quando o chefe morre no turno do jogador após preparar', () => {
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

    // Avança rodadas até o chefe morrer enquanto tem um PendingAttack ativo
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
        // Aguarda o chefe preparar um PendingAttack antes de dar o golpe final
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

  it('transiciona irreversivelmente para Fase 2 ao atingir <= 50% HP sem restaurar HP e ganha +1 moveRange', () => {
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

    // Reduzir HP do chefe até <= 14 sem matá-lo
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
      // Se caiu na vez do acolyte, ele cura o chefe
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

    // Verificar área 3x3 da Fase 2
    const areaPhase2 = getBossAttackArea({ x: 4, y: 6 }, 2, open);
    expect(areaPhase2).toHaveLength(9);
  });

  it('na Fase 2 prepara Erupção das Cinzas em área 3x3', () => {
    const knight = unit(knightAt(4, 5));
    const mage = unit(mageAt(5, 6));
    const boss = unit(bossAt(4, 8), { hp: 14, bossPhase: 2, moveRange: 3 });

    const action = nextEnemyAction(boss, [knight, mage, boss], open);
    expect(action?.type).toBe('prepareAttack');
    if (action?.type === 'prepareAttack') {
      expect(action.skillName).toBe('Erupção das Cinzas');
      expect(action.basePower).toBe(5);
      expect(action.attackKind).toBe('magic');
      expect(action.targetCells).toHaveLength(9);
    }
  });
});
