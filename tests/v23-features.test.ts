import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/config/gameConfig';
import { GameEngine } from '../src/game/GameEngine';
import { archerAt, knightAt, meleeAt, unitOf, wall } from './helpers';

describe('V2.3: Desfazer Movimento (undoMove / canUndoMove)', () => {
  it('permite desfazer 1x por ativação, restaura pos e hasMoved e mantém ativação aberta', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), meleeAt(7, 7)],
    });
    expect(engine.getState().canUndoMove).toBe(false);

    expect(engine.moveSelectedUnit({ x: 3, y: 1 })).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
      canUndoMove: true,
    });
    expect(unitOf(engine, 'knight-1')).toMatchObject({ pos: { x: 3, y: 1 }, hasMoved: true });

    expect(engine.undoMove()).toEqual({ ok: true });
    expect(engine.getState()).toMatchObject({
      turnState: 'player_unit_active',
      activeUnitId: 'knight-1',
      canUndoMove: false,
    });
    expect(unitOf(engine, 'knight-1')).toMatchObject({ pos: { x: 1, y: 1 }, hasMoved: false });
    expect(engine.consumeEvents().map((e) => e.type)).toEqual(['unitMoved', 'moveUndone']);

    // Segundo movimento na mesma ativação não pode ser desfeito
    expect(engine.moveSelectedUnit({ x: 2, y: 1 })).toEqual({ ok: true });
    expect(engine.getState().canUndoMove).toBe(false);
    expect(engine.undoMove().ok).toBe(false);
  });

  it('bloqueia undoMove após ataque ou após encerrar a ativação', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), meleeAt(2, 2)],
    });
    engine.moveSelectedUnit({ x: 2, y: 1 });
    expect(engine.getState().canUndoMove).toBe(true);

    // Após atacar, a ativação encerra e undo não é mais possível
    engine.attackTarget('melee-skeleton-1');
    expect(engine.getState().canUndoMove).toBe(false);
    expect(engine.undoMove().ok).toBe(false);

    // Após endPlayerTurn também bloqueia
    const eng2 = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), meleeAt(7, 7)],
    });
    eng2.moveSelectedUnit({ x: 2, y: 1 });
    eng2.endPlayerTurn();
    expect(eng2.getState().canUndoMove).toBe(false);
    expect(eng2.undoMove().ok).toBe(false);
  });
});

describe('V2.3: Ataque Inteligente (smartAttack / smartUseSkill)', () => {
  it('ataca sem mover quando o alvo já está ao alcance, preservando hasMoved', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), meleeAt(1, 2)],
    });
    const plan = engine.getSmartAttackPlan('melee-skeleton-1');
    expect(plan).toEqual({ path: [{ x: 1, y: 1 }] });

    expect(engine.smartAttack('melee-skeleton-1')).toEqual({ ok: true });
    expect(unitOf(engine, 'knight-1')).toMatchObject({
      pos: { x: 1, y: 1 },
      hasMoved: false,
      hasAttacked: true,
    });
    expect(engine.getState().turnState).toBe('player_unit_active');
    expect(engine.consumeEvents().map((e) => e.type)).toEqual(['unitAttacked']);
  });

  it('move pelo menor caminho até o alcance, desempata deterministicamente e encerra ativação', () => {
    // knight (moveRange 3) em (1,1), melee em (1,4) -> precisa andar 2 passos até (1,3)
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(1, 1), meleeAt(1, 4)],
    });
    const plan = engine.getSmartAttackPlan('melee-skeleton-1');
    expect(plan).toEqual({
      path: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
      ],
    });

    expect(engine.smartAttack('melee-skeleton-1')).toEqual({ ok: true });
    expect(unitOf(engine, 'knight-1')).toMatchObject({
      pos: { x: 1, y: 3 },
      hasMoved: true,
      hasAttacked: true,
    });
    expect(engine.getState()).toMatchObject({
      turnState: 'enemy_activation',
      canUndoMove: false,
    });
    expect(engine.consumeEvents().map((e) => e.type)).toEqual([
      'unitMoved',
      'unitAttacked',
      'activationEnded',
      'turnChanged',
      'activationStarted',
    ]);
  });

  it('respeita LoS e obstáculos no planejamento de smartAttack', () => {
    // Arqueira em (0,0), parede em (0,1) bloqueando LoS até (0,2)
    const engine = new GameEngine({
      obstacles: [wall(0, 1)],
      units: [archerAt(0, 0), meleeAt(0, 2)],
    });
    const plan = engine.getSmartAttackPlan('melee-skeleton-1');
    expect(plan).not.toBeNull();
    // Contorna a parede indo para (1,0) ou (1,1) de onde tem LoS para (0,2)
    const dest = plan!.path[plan!.path.length - 1];
    expect(dest.x).toBe(1);
    expect(engine.smartAttack('melee-skeleton-1')).toEqual({ ok: true });
    expect(unitOf(engine, 'melee-skeleton-1').hp).toBe(3);
  });

  it('falha sem consumir ações quando já moveu ou quando não há célula válida', () => {
    const engine = new GameEngine({
      obstacles: [],
      units: [knightAt(0, 0), meleeAt(8, 8)],
    });
    expect(engine.getSmartAttackPlan('melee-skeleton-1')).toBeNull();
    expect(engine.smartAttack('melee-skeleton-1').ok).toBe(false);

    // Já moveu e alvo fora de alcance
    const eng2 = new GameEngine({
      obstacles: [],
      units: [knightAt(0, 0), meleeAt(0, 3)],
    });
    eng2.moveSelectedUnit({ x: 0, y: 1 });
    expect(eng2.getSmartAttackPlan('melee-skeleton-1')).toBeNull();
    expect(eng2.smartAttack('melee-skeleton-1').ok).toBe(false);
    expect(unitOf(eng2, 'knight-1').hasAttacked).toBe(false);
  });

  it('smartUseSkill move e lança habilidade sem permitir undo', () => {
    const eng = new GameEngine({
      obstacles: [],
      units: [knightAt(0, 0), meleeAt(0, 3)],
    });
    const plan = eng.getSmartSkillPlan({ x: 0, y: 3 });
    expect(plan).toEqual({
      path: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
    });
    expect(eng.smartUseSkill({ x: 0, y: 3 })).toEqual({ ok: true });
    expect(unitOf(eng, 'melee-skeleton-1').hp).toBe(1);
    expect(eng.getState().canUndoMove).toBe(false);
    expect(eng.getState().turnState).toBe('enemy_activation');
  });
});

describe('V2.3: Mapas, Spawn Aleatório Determinístico e Sorteio sem Repetição', () => {
  it('MAPS possui 8 arenas 12x12 distintas com linhas de spawn válidas e células livres conectadas', () => {
    expect(MAPS.map((m) => m.id)).toEqual([
      'ruins',
      'fortress',
      'courtyard',
      'catacombs',
      'sanctuary',
      'gauntlet',
      'forgotten-swamp',
      'corrupted-sanctuary',
    ]);
    for (const map of MAPS) {
      expect(map.gridSize).toBe(12);
      expect(map.playerSpawnRows).toEqual([0, 1]);
      expect(map.enemySpawnRows).toEqual([10, 11]);

      const blocked = new Set(map.obstacles.map((o) => `${o.pos.x},${o.pos.y}`));
      for (const obs of map.obstacles) {
        expect(obs.pos.x).toBeGreaterThanOrEqual(0);
        expect(obs.pos.x).toBeLessThan(map.gridSize);
        expect(obs.pos.y).toBeGreaterThanOrEqual(0);
        expect(obs.pos.y).toBeLessThan(map.gridSize);
        expect([0, 1, 10, 11]).not.toContain(obs.pos.y);
      }

      // Todas as células livres precisam estar conectadas (BFS a partir de 0,0)
      const totalFree = map.gridSize * map.gridSize - blocked.size;
      const visited = new Set<string>(['0,0']);
      const queue: [number, number][] = [[0, 0]];
      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const key = `${nx},${ny}`;
          if (
            nx >= 0 &&
            nx < map.gridSize &&
            ny >= 0 &&
            ny < map.gridSize &&
            !blocked.has(key) &&
            !visited.has(key)
          ) {
            visited.add(key);
            queue.push([nx, ny]);
          }
        }
      }
      expect(visited.size).toBe(totalFree);
    }
  });

  it('mesma seed gera mapa e posições idênticos, nas linhas corretas e preservando turnOrder', () => {
    const e1 = new GameEngine({ seed: 424242 });
    const e2 = new GameEngine({ seed: 424242 });
    const s1 = e1.getState();
    const s2 = e2.getState();

    expect(s1.mapId).toBe(s2.mapId);
    expect(s1.units.map((u) => u.pos)).toEqual(s2.units.map((u) => u.pos));
    expect(s1.turnOrder).toEqual([
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

    const obstacleKeys = new Set(s1.obstacles.map((o) => `${o.x},${o.y}`));
    const unitKeys = new Set<string>();
    for (const u of s1.units) {
      const key = `${u.pos.x},${u.pos.y}`;
      expect(obstacleKeys.has(key)).toBe(false);
      expect(unitKeys.has(key)).toBe(false);
      unitKeys.add(key);
      if (u.team === 'player') {
        expect([0, 1]).toContain(u.pos.y);
      } else {
        expect([10, 11]).toContain(u.pos.y);
      }
    }
  });

  it('reset() sorteia mapa diferente do imediatamente anterior', () => {
    const engine = new GameEngine({ seed: 12345 });
    let prevMap = engine.getState().mapId;

    for (let i = 0; i < 10; i++) {
      engine.reset();
      const nextMap = engine.getState().mapId;
      expect(nextMap).not.toBe(prevMap);
      prevMap = nextMap;
    }
  });
});
