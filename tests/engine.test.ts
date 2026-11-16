import { describe, expect, it } from 'vitest';
import { INITIAL_UNITS, OBSTACLES } from '../src/config/gameConfig';
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

/** Guerreiro em (1,1) e um esqueleto adjacente em (1,2), sem obstáculos. */
const duel = () => new GameEngine({ obstacles: [], units: [knightAt(1, 1), meleeAt(1, 2)] });

/** Guerreiro e arqueira contra um esqueleto adjacente ao guerreiro e um blindado distante. */
const squad = () =>
  new GameEngine({ obstacles: [], units: [knightAt(1, 1), archerAt(0, 0), meleeAt(1, 2), armoredAt(7, 7)] });

const types = (events: GameEvent[]) => events.map((e) => e.type);

describe('GameEngine: estado inicial e turnOrder fixo (V2.1)', () => {
  it('começa em player_unit_active, rodada 1, travado em knight-1, com ordem fixa intercalada de 10 unidades', () => {
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
    expect(state.units.map((u) => [u.id, u.type, u.team, u.pos])).toEqual(
      INITIAL_UNITS.map((s) => [s.id, s.type, s.team, s.pos]),
    );
    expect(engine.consumeEvents()).toEqual([]);
  });

  it('percorre a ordem fixa exata de 10 unidades e repete no Round 2', () => {
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

  it('expõe os obstáculos e garante cópias isoladas em getState', () => {
    const engine = new GameEngine();
    const state = engine.getState();
    expect(state.obstacleDefs).toEqual(OBSTACLES);
    state.units[0].pos.x = 11;
    state.turnOrder.pop();
    expect(engine.getState().turnOrder).toHaveLength(10);
    expect(engine.getState().units[0].pos.x).toBe(4);
  });
});

describe('GameEngine: bloqueio de troca manual (selectUnit)', () => {
  it('recusa trocar para outro aliado ou limpar seleção, mantendo activeUnitId intacto', () => {
    const engine = squad();
    expect(engine.selectUnit('knight-1')).toEqual({ ok: true });
    expect(engine.selectUnit('archer-1')).toEqual({ ok: false, reason: 'Não é possível alterar a unidade ativa.' });
    expect(engine.selectUnit(null)).toEqual({ ok: false, reason: 'Não é possível alterar a unidade ativa.' });
    expect(engine.selectUnit(SKELETON).ok).toBe(false);
    expect(engine.getState()).toMatchObject({
      activeUnitId: 'knight-1',
      selectedUnitId: 'knight-1',
    });

    // No turno inimigo também recusa
    engine.endPlayerTurn();
    expect(engine.selectUnit('knight-1')).toEqual({ ok: false, reason: 'Não é possível alterar a unidade ativa.' });
  });
});

describe('GameEngine: encerramento automático e manual (cenários A a E)', () => {
  it('Cenário A: mover -> atacar encerra automaticamente e passa para o próximo ator na turnOrder', () => {
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

  it('Cenário B: atacar -> mover continua aberta após ataque e encerra automaticamente após mover', () => {
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

  it('Cenário B (variante habilidade): useSkill -> mover encerra após mover', () => {
    const engine = duel();
    expect(engine.useSkill({ x: 1, y: 2 })).toEqual({ ok: true });
    expect(engine.getState().turnState).toBe('player_unit_active');
    expect(engine.moveSelectedUnit({ x: 2, y: 1 })).toEqual({ ok: true });
    expect(engine.getState().turnState).toBe('enemy_activation');
  });

  it('Cenários C, D e E: apenas 1 ação (ou 0) mantém aberta até endPlayerTurn()', () => {
    const engine = duel();
    engine.moveSelectedUnit({ x: 2, y: 1 });
    expect(engine.getState().turnState).toBe('player_unit_active');
    expect(engine.endPlayerTurn()).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'enemy_activation',
      activeUnitId: SKELETON,
    });

    // No turno inimigo endPlayerTurn é recusado
    expect(engine.endPlayerTurn().ok).toBe(false);
  });

  it('ações inválidas nunca consomem recursos nem avançam a vez', () => {
    const engine = duel();
    expect(engine.moveSelectedUnit({ x: 11, y: 11 }).ok).toBe(false);
    expect(engine.attackTarget('inexistente').ok).toBe(false);
    expect(engine.useSkill({ x: 5, y: 5 }).ok).toBe(false);
    expect(unitOf(engine, 'knight-1')).toMatchObject({ hasMoved: false, hasAttacked: false });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
    });
    expect(engine.consumeEvents()).toEqual([]);
  });
});

describe('GameEngine: getAttackRangeCells e getSkillRangeCells (alcance e LoS)', () => {
  it('getAttackRangeCells respeita alcance, obstáculos e linha de visão', () => {
    const engine = new GameEngine({
      obstacles: [wall(0, 1), crate(1, 0)],
      units: [archerAt(0, 0), meleeAt(5, 5)],
    });
    const rangeCells = engine.getAttackRangeCells();
    // (0,1) tem wall -> não está incluído e bloqueia (0,2) e (0,3)
    expect(rangeCells).not.toContainEqual({ x: 0, y: 1 });
    expect(rangeCells).not.toContainEqual({ x: 0, y: 2 });
    expect(rangeCells).not.toContainEqual({ x: 0, y: 3 });
    // (1,0) tem crate (obstáculo) -> não está incluído, mas NÃO bloqueia LoS para (2,0) e (3,0)
    expect(rangeCells).not.toContainEqual({ x: 1, y: 0 });
    expect(rangeCells).toContainEqual({ x: 2, y: 0 });
    expect(rangeCells).toContainEqual({ x: 3, y: 0 });
    // Fora de alcance (manhattan 4)
    expect(rangeCells).not.toContainEqual({ x: 4, y: 0 });
    // Para unidade inativa retorna []
    expect(engine.getAttackRangeCells('melee-skeleton-1')).toEqual([]);

    // Após atacar, retorna []
    const eng2 = new GameEngine({ obstacles: [], units: [archerAt(0, 0), meleeAt(0, 2)] });
    eng2.attackTarget('melee-skeleton-1');
    expect(eng2.getAttackRangeCells()).toEqual([]);
  });

  it('getSkillRangeCells respeita alcance, LoS, recarga e inclui própria célula para healing-light', () => {
    const engine = new GameEngine({
      obstacles: [wall(0, 1)],
      units: [clericAt(0, 0), knightAt(2, 0), meleeAt(5, 5)],
    });
    const skillRange = engine.getSkillRangeCells();
    expect(skillRange).toContainEqual({ x: 0, y: 0 }); // própria célula para cura
    expect(skillRange).toContainEqual({ x: 2, y: 0 });
    expect(skillRange).not.toContainEqual({ x: 0, y: 1 }); // wall
    expect(skillRange).not.toContainEqual({ x: 0, y: 2 }); // bloqueado por wall
    expect(engine.getSkillRangeCells('knight-1')).toEqual([]); // não é a unidade ativa

    // Para habilidade de dano (Marked Shot), própria célula não é incluída
    const engArcher = new GameEngine({
      obstacles: [],
      units: [archerAt(0, 0), meleeAt(0, 2)],
    });
    const archerSkillRange = engArcher.getSkillRangeCells();
    expect(archerSkillRange).not.toContainEqual({ x: 0, y: 0 });
    expect(archerSkillRange).toContainEqual({ x: 0, y: 2 });

    // Em recarga retorna []
    engArcher.useSkill({ x: 0, y: 2 });
    expect(engArcher.getSkillRangeCells()).toEqual([]);
  });
});

describe('GameEngine: morte ignorada na turnOrder, cadáveres, vitória e derrota', () => {
  it('pula unidade morta sem reordenar turnOrder e sem ativações duplicadas', () => {
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

    // knight-1 usa Runic Strike (3 dano) e encerra -> melee-1 (HP 2) ataca -> archer-1 mata melee-1
    engine.useSkill({ x: 0, y: 1 });
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    engine.consumeEvents();

    expect(engine.getState().activeUnitId).toBe('archer-1');
    engine.attackTarget('melee-skeleton-1'); // mata melee-1!
    engine.endPlayerTurn();
    runEnemyTurn(engine); // armored-1 ativa e vira Round 2
    engine.consumeEvents();

    // No Round 2, turnOrder permanece inalterada, mas melee-1 morto é pulado:
    expect(engine.getState().turnOrder).toEqual([
      'knight-1',
      'melee-skeleton-1',
      'archer-1',
      'armored-skeleton-1',
    ]);
    expect(engine.getState().activeUnitId).toBe('knight-1');
    engine.endPlayerTurn();
    expect(engine.getState().activeUnitId).toBe('archer-1'); // pulou melee-skeleton-1!

    // Cadáver continua no grid em (0,1) e não bloqueia movimento
    expect(unitOf(engine, 'melee-skeleton-1')).toMatchObject({ alive: false, hp: 0, pos: { x: 0, y: 1 } });
    expect(engine.getPath({ x: 0, y: 0 }, { x: 0, y: 1 })).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }]);
  });

  it('vitória imediata no último golpe interrompe sem activationEnded nem turnChanged', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), archerAt(0, 2), meleeAt(1, 2)],
    });
    engine.attackTarget('melee-skeleton-1'); // 5 -> 3
    engine.endPlayerTurn();
    runEnemyTurn(engine);
    engine.consumeEvents();

    expect(engine.getState().activeUnitId).toBe('archer-1');
    engine.useSkill({ x: 1, y: 2 }); // 3 de dano, mata!
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

  it('reset() em qualquer estado restaura rodada 1 e índice 0', () => {
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

describe('GameEngine: invariantes em partida simulada (V2.1 12x12)', () => {
  it('partida completa com 4 heróis vs 6 inimigos termina em vitória ou derrota respeitando turnOrder', () => {
    const engine = new GameEngine();
    let safety = 0;

    while (!['victory', 'defeat'].includes(engine.getState().turnState)) {
      if (++safety > 600) throw new Error('Partida simulada não terminou');
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
