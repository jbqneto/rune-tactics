import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_SAVE_KEY,
  CAMPAIGN_STAGES,
  MAX_ATTRIBUTE,
  SKILLS,
  UNIT_STATS,
} from '../src/config/gameConfig';
import {
  applyAttributePoint,
  calcMaxHp,
  computeUnitArmor,
  computeUnitDamage,
  fortitudeResistance,
  offensiveBonus,
  type AttributeProgressionTarget,
} from '../src/game/attributes/AttributeSystem';
import { CampaignSystem } from '../src/game/campaign/CampaignSystem';
import { SaveSystem } from '../src/game/campaign/SaveSystem';
import { computeDamage } from '../src/game/combat/CombatSystem';
import { createUnit } from '../src/game/entities/UnitFactory';
import { GameEngine } from '../src/game/GameEngine';
import { manhattan, sameCell } from '../src/game/grid/GridSystem';
import type {
  AttributeKey,
  GameEvent,
  GridCoord,
  StorageAdapter,
  UnitState,
  UnitType,
} from '../src/shared/types';
import { archerAt, knightAt, runEnemyTurn, unitOf } from './helpers';

class MemoryStorage implements StorageAdapter {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

const TARGET_PRIORITY: Record<UnitType, number> = {
  'necromancer-acolyte': 0,
  'cultist-mage': 1,
  'skeleton-archer': 2,
  'goblin-stalker': 3,
  'goblin-scout': 4,
  'melee-skeleton': 5,
  'skeleton-shieldbearer': 6,
  'armored-skeleton': 7,
  'ashen-guardian': 8,
  knight: 99,
  archer: 99,
  mage: 99,
  cleric: 99,
};

function isCellInPendingDanger(engine: GameEngine, pos: GridCoord): boolean {
  const { pendingAttacks } = engine.getState();
  return pendingAttacks.some((p) => p.targetCells.some((c) => sameCell(c, pos)));
}

function scoreEnemyTarget(attacker: UnitState, enemy: UnitState, allies: readonly UnitState[]): number {
  const expectedDmg = computeDamage(attacker, enemy, attacker.basePower, attacker.attackKind);
  const lethalBonus = expectedDmg >= enemy.hp ? -1000 : 0;
  const hitsToKill = Math.ceil(enemy.hp / Math.max(1, expectedDmg));
  const guardPenalty = enemy.isGuarding ? 30 : 0;
  const dist = manhattan(attacker.pos, enemy.pos);
  // Coesão tática + eficiência de abate (evita desperdiçar ataques em 2 DEF enquanto conjuradores estão abertos)
  const allyAvgDist =
    allies.reduce((sum, a) => sum + manhattan(a.pos, enemy.pos), 0) / Math.max(1, allies.length);
  return (
    lethalBonus +
    hitsToKill * 35 +
    TARGET_PRIORITY[enemy.type] * 12 +
    dist * 8 +
    allyAvgDist * 6 +
    guardPenalty
  );
}

/**
 * Executa uma ativação determinística simples do jogador:
 * 1. Se estiver dentro de uma zona de PendingAttack, tenta sair dela com `moveSelectedUnit` ou atacar/defender.
 * 2. Clérigo prioriza curar aliados feridos (Healing Light) antes de atacar.
 * 3. Demais heróis priorizam usar skill ofensiva (escolhendo melhor área no Arcane Burst) ou `smartAttack`.
 * 4. Se nenhum inimigo estiver ao alcance, aproxima-se do inimigo prioritário e usa `defend()` se perto do perigo.
 */
function runDeterministicHeroTurn(engine: GameEngine): GameEvent[] {
  const collected: GameEvent[] = [];
  const state = engine.getState();
  const heroId = state.activeUnitId;
  if (!heroId || state.turnState !== 'player_unit_active') return collected;

  const getHero = () => engine.getState().units.find((u) => u.id === heroId)!;
  const finishTurn = () => {
    if (engine.getState().activeUnitId === heroId && engine.getState().turnState === 'player_unit_active') {
      engine.endPlayerTurn();
    }
    collected.push(...engine.consumeEvents());
  };

  let hero = getHero();
  if (!hero.alive) {
    finishTurn();
    return collected;
  }

  // Passo 1: Clérigo cura aliado ferido se possível
  if (hero.type === 'cleric' && hero.skillCooldown === 0 && !hero.hasAttacked) {
    const injuredAllies = engine
      .getState()
      .units.filter((u) => u.alive && u.team === 'player' && u.hp < u.maxHp)
      .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.hp - b.hp);

    for (const ally of injuredAllies) {
      if (ally.maxHp - ally.hp >= 3 && engine.getSmartSkillPlan(ally.pos)) {
        // Se estiver em zona de perigo e puder sair mantendo cura, sai primeiro
        if (isCellInPendingDanger(engine, hero.pos) && !hero.hasMoved) {
          const safeEscape = engine
            .getReachableCells(hero.id)
            .filter((c) => !isCellInPendingDanger(engine, c))
            .sort((a, b) => manhattan(a, ally.pos) - manhattan(b, ally.pos))[0];
          if (safeEscape && manhattan(safeEscape, ally.pos) <= SKILLS['healing-light'].range) {
            engine.moveSelectedUnit(safeEscape);
            collected.push(...engine.consumeEvents());
            hero = getHero();
          }
        }
        if (
          engine.getState().activeUnitId === heroId &&
          engine.getState().turnState === 'player_unit_active' &&
          !hero.hasAttacked &&
          engine.smartUseSkill(ally.pos).ok
        ) {
          collected.push(...engine.consumeEvents());
          hero = getHero();
          // Recua de zona de perigo após curar se ainda tiver movimento
          if (
            engine.getState().activeUnitId === heroId &&
            engine.getState().turnState === 'player_unit_active' &&
            !hero.hasMoved &&
            isCellInPendingDanger(engine, hero.pos)
          ) {
            const safe = engine
              .getReachableCells(hero.id)
              .filter((c) => !isCellInPendingDanger(engine, c))[0];
            if (safe) {
              engine.moveSelectedUnit(safe);
              collected.push(...engine.consumeEvents());
            }
          }
          finishTurn();
          return collected;
        }
      }
    }
  }

  // Passo 2: Se estiver em zona de ataque anunciado e ainda não moveu, sai para célula segura
  if (isCellInPendingDanger(engine, hero.pos) && !hero.hasMoved) {
    const aliveEnemies = engine.getState().units.filter((u) => u.alive && u.team === 'enemy');
    const safeCells = engine
      .getReachableCells(hero.id)
      .filter((c) => !isCellInPendingDanger(engine, c));

    if (safeCells.length > 0 && aliveEnemies.length > 0) {
      safeCells.sort((a, b) => {
        const minA = Math.min(...aliveEnemies.map((e) => manhattan(a, e.pos)));
        const minB = Math.min(...aliveEnemies.map((e) => manhattan(b, e.pos)));
        return minA - minB || a.y - b.y || a.x - b.x;
      });
      engine.moveSelectedUnit(safeCells[0]);
      collected.push(...engine.consumeEvents());
      hero = getHero();
    }
  }

  if (engine.getState().activeUnitId !== heroId || engine.getState().turnState !== 'player_unit_active') {
    finishTurn();
    return collected;
  }

  // Passo 3: Tenta usar habilidade ofensiva se pronta
  const aliveAllies = engine.getState().units.filter((u) => u.alive && u.team === 'player');
  if (hero.skillId && hero.skillId !== 'healing-light' && hero.skillCooldown === 0 && !hero.hasAttacked) {
    const aliveEnemies = engine
      .getState()
      .units.filter((u) => u.alive && u.team === 'enemy')
      .sort((a, b) => scoreEnemyTarget(hero, a, aliveAllies) - scoreEnemyTarget(hero, b, aliveAllies));

    if (hero.skillId === 'arcane-burst') {
      const candidateCells: { cell: GridCoord; hits: number; score: number }[] = [];
      for (let y = 0; y < engine.getState().gridSize; y++) {
        for (let x = 0; x < engine.getState().gridSize; x++) {
          const cell = { x, y };
          const plan = engine.getSmartSkillPlan(cell);
          if (!plan) continue;
          const dest = plan.path[plan.path.length - 1];
          if (isCellInPendingDanger(engine, dest)) continue;
          const area = engine.getSkillAreaCells(cell, hero.id);
          const hits = aliveEnemies.filter((e) => area.some((a) => sameCell(a, e.pos)));
          if (hits.length === 0) continue;
          const score = hits.length * 100 - Math.min(...hits.map((h) => h.hp));
          candidateCells.push({ cell, hits: hits.length, score });
        }
      }
      candidateCells.sort((a, b) => b.score - a.score || a.cell.y - b.cell.y || a.cell.x - b.cell.x);
      if (candidateCells.length > 0 && engine.smartUseSkill(candidateCells[0].cell).ok) {
        collected.push(...engine.consumeEvents());
        finishTurn();
        return collected;
      }
    } else {
      for (const target of aliveEnemies) {
        const plan = engine.getSmartSkillPlan(target.pos);
        if (!plan) continue;
        const dest = plan.path[plan.path.length - 1];
        if (isCellInPendingDanger(engine, dest)) continue;
        if (engine.smartUseSkill(target.pos).ok) {
          collected.push(...engine.consumeEvents());
          finishTurn();
          return collected;
        }
      }
    }
  }

  // Passo 4: Tenta ataque básico inteligente em inimigo prioritário
  const sortedEnemies = engine
    .getState()
    .units.filter((u) => u.alive && u.team === 'enemy')
    .sort((a, b) => scoreEnemyTarget(hero, a, aliveAllies) - scoreEnemyTarget(hero, b, aliveAllies));

  for (const target of sortedEnemies) {
    const plan = engine.getSmartAttackPlan(target.id);
    if (!plan) continue;
    const dest = plan.path[plan.path.length - 1];
    // Se já está em danger ou destino é seguro, ataca (se o único jeito for entrar em danger, evita a menos que seja golpe letal)
    const isLethal =
      computeDamage(hero, target, hero.basePower, hero.attackKind) >= target.hp;
    if (isCellInPendingDanger(engine, dest) && !isLethal) continue;
    if (engine.smartAttack(target.id).ok) {
      collected.push(...engine.consumeEvents());
      finishTurn();
      return collected;
    }
  }

  // Passo 5: Se não alcançou ataque ainda e pode mover, avança mantendo distância segura para alcance
  hero = getHero();
  if (!hero.hasMoved && sortedEnemies.length > 0) {
    const primary = sortedEnemies[0];
    const reachable = engine
      .getReachableCells(hero.id)
      .filter((c) => !isCellInPendingDanger(engine, c));

    const idealDist = hero.attackRange;
    const knight = aliveAllies.find((a) => a.type === 'knight');
    let bestCell: GridCoord | null = null;
    let bestScore = Infinity;

    for (const cell of reachable) {
      const path = engine.getPath(hero.pos, cell);
      if (!path) continue;
      const d = manhattan(cell, primary.pos);
      const distPenalty = Math.abs(d - idealDist) * 10;
      const dangerAdjacent = sortedEnemies.some((e) => manhattan(cell, e.pos) <= 1) && hero.attackRange > 1 ? 45 : 0;
      const aheadOfKnight =
        hero.attackRange > 1 && knight && knight.alive && cell.y > knight.pos.y + 1 ? 25 : 0;
      const losBonus =
        hero.attackRange > 1 && d <= hero.attackRange && engine.hasLineOfSight(cell, primary.pos)
          ? -15
          : 0;
      const cohesionPenalty =
        hero.type === 'cleric' && knight && knight.id !== hero.id
          ? manhattan(cell, knight.pos) * 5
          : 0;
      const score = d * 6 + distPenalty + dangerAdjacent + aheadOfKnight + losBonus + cohesionPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestCell = cell;
      }
    }

    if (bestCell) {
      engine.moveSelectedUnit(bestCell);
      collected.push(...engine.consumeEvents());
      hero = getHero();
    }
  }

  // Passo 6: Se ainda não atacou após mover (ex.: Guerreiro ou Clérigo na vanguarda, ou alguém em zona de perigo), usa Defender!
  if (
    engine.getState().activeUnitId === heroId &&
    engine.getState().turnState === 'player_unit_active' &&
    !hero.hasAttacked
  ) {
    const nearEnemy = sortedEnemies.some((e) => manhattan(hero.pos, e.pos) <= 4);
    if (isCellInPendingDanger(engine, hero.pos) || nearEnemy) {
      engine.defend();
      collected.push(...engine.consumeEvents());
    }
  }

  finishTurn();
  return collected;
}

describe('V4 Simulação de Balanceamento e Campanha Completa', () => {
  it('compara potencial de dano por classe (Guerreiro STR > Arqueira DEX > Mago INT > Clérigo cura INT) e evolução até o limite 12', () => {
    const knight = createUnit({ id: 'k', type: 'knight', team: 'player', pos: { x: 0, y: 0 } });
    const archer = createUnit({ id: 'a', type: 'archer', team: 'player', pos: { x: 0, y: 0 } });
    const mage = createUnit({ id: 'm', type: 'mage', team: 'player', pos: { x: 0, y: 0 } });
    const cleric = createUnit({ id: 'c', type: 'cleric', team: 'player', pos: { x: 0, y: 0 } });
    const dummy = createUnit({ id: 'd', type: 'goblin-scout', team: 'enemy', pos: { x: 0, y: 1 } }); // 0 DEF

    // Base (nível 0): habilidades ofensivas vs alvo 0 DEF e cura do Clérigo
    const baseKnightSkillDmg = computeDamage(
      knight,
      dummy,
      SKILLS['runic-strike'].damage,
      SKILLS['runic-strike'].attackKind!,
    );
    const baseArcherSkillDmg = computeDamage(
      archer,
      dummy,
      SKILLS['marked-shot'].damage,
      SKILLS['marked-shot'].attackKind!,
    );
    const baseMageSkillDmg = computeDamage(
      mage,
      dummy,
      SKILLS['arcane-burst'].damage,
      SKILLS['arcane-burst'].attackKind!,
    );
    const baseClericHeal = SKILLS['healing-light'].heal + offensiveBonus(cleric.attributes.int);
    const baseClericSkillDmg = 0; // Healing Light não causa dano

    expect(baseKnightSkillDmg).toBe(4);
    expect(baseArcherSkillDmg).toBe(3);
    expect(baseMageSkillDmg).toBe(2);
    expect(baseClericHeal).toBe(3);
    expect(baseKnightSkillDmg).toBeGreaterThan(baseArcherSkillDmg);
    expect(baseArcherSkillDmg).toBeGreaterThan(baseMageSkillDmg);
    expect(baseMageSkillDmg).toBeGreaterThan(baseClericSkillDmg);

    // Evoluir o atributo principal de cada classe até MAX_ATTRIBUTE (12)
    const evolveToMax = (type: UnitType, attr: AttributeKey): AttributeProgressionTarget => {
      const stats = UNIT_STATS[type];
      let target: AttributeProgressionTarget = {
        baseHp: stats.baseHp,
        hp: calcMaxHp(stats.baseHp, stats.attributes.fort),
        maxHp: calcMaxHp(stats.baseHp, stats.attributes.fort),
        attributes: { ...stats.attributes },
        unspentPoints: 20,
      };
      while (target.attributes[attr] < MAX_ATTRIBUTE) {
        const res = applyAttributePoint(target, attr);
        expect(res.ok).toBe(true);
        if (res.ok) target = res.hero;
      }
      // Tentativa além de MAX_ATTRIBUTE = 12 deve ser recusada
      expect(applyAttributePoint(target, attr).ok).toBe(false);
      return target;
    };

    const maxKnight = evolveToMax('knight', 'str');
    const maxArcher = evolveToMax('archer', 'dex');
    const maxMage = evolveToMax('mage', 'int');
    const maxCleric = evolveToMax('cleric', 'int');

    const maxKnightBasic = computeUnitDamage(UNIT_STATS.knight.basePower, maxKnight.attributes, 'melee');
    const maxArcherBasic = computeUnitDamage(UNIT_STATS.archer.basePower, maxArcher.attributes, 'ranged');
    const maxMageBasic = computeUnitDamage(UNIT_STATS.mage.basePower, maxMage.attributes, 'magic');
    const maxClericBasic = computeUnitDamage(UNIT_STATS.cleric.basePower, maxCleric.attributes, 'melee');

    expect(maxKnightBasic).toBe(4); // 2 + offensiveBonus(12) = 4
    expect(maxArcherBasic).toBe(4);
    expect(maxMageBasic).toBe(4);
    expect(maxClericBasic).toBe(2); // ataque básico do Clérigo escala com STR (5 -> +0), não com INT!

    const maxKnightSkillDmg = computeDamage(
      maxKnight,
      dummy,
      SKILLS['runic-strike'].damage,
      'melee',
    );
    const maxArcherSkillDmg = computeDamage(
      maxArcher,
      dummy,
      SKILLS['marked-shot'].damage,
      'ranged',
    );
    const maxMageSkillDmg = computeDamage(
      maxMage,
      dummy,
      SKILLS['arcane-burst'].damage,
      'magic',
    );
    const maxClericHeal = SKILLS['healing-light'].heal + offensiveBonus(maxCleric.attributes.int);

    expect(maxKnightSkillDmg).toBe(6);
    expect(maxArcherSkillDmg).toBe(5);
    expect(maxMageSkillDmg).toBe(4);
    expect(maxClericHeal).toBe(5);
    expect(maxKnightSkillDmg).toBeGreaterThan(maxArcherSkillDmg);
    expect(maxArcherSkillDmg).toBeGreaterThan(maxMageSkillDmg);

    // Impacto real no motor (GameEngine): comparar dano e cura com stats maximizados
    const combatEngine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        { id: 'k', type: 'knight', team: 'player', pos: { x: 2, y: 2 } },
        { id: 'a', type: 'archer', team: 'player', pos: { x: 2, y: 0 } },
        { id: 'm', type: 'mage', team: 'player', pos: { x: 3, y: 1 } },
        { id: 'c', type: 'cleric', team: 'player', pos: { x: 3, y: 0 } },
        { id: 'dummy-1', type: 'ashen-guardian', team: 'enemy', pos: { x: 2, y: 3 } }, // 28 HP, 2 DEF
      ],
      heroOverrides: [
        {
          id: 'k',
          type: 'knight',
          attributes: maxKnight.attributes,
          hp: maxKnight.maxHp,
          maxHp: maxKnight.maxHp,
          unspentPoints: 0,
        },
        {
          id: 'a',
          type: 'archer',
          attributes: maxArcher.attributes,
          hp: maxArcher.maxHp,
          maxHp: maxArcher.maxHp,
          unspentPoints: 0,
        },
        {
          id: 'm',
          type: 'mage',
          attributes: maxMage.attributes,
          hp: maxMage.maxHp,
          maxHp: maxMage.maxHp,
          unspentPoints: 0,
        },
        {
          id: 'c',
          type: 'cleric',
          attributes: maxCleric.attributes,
          hp: 3, // ferido para testar cura de 5 HP no motor
          maxHp: maxCleric.maxHp,
          unspentPoints: 0,
        },
      ],
    });
    combatEngine.consumeEvents();

    // Knight Runic Strike: 6 - 2 DEF = 4 dano
    expect(combatEngine.useSkill({ x: 2, y: 3 }).ok).toBe(true);
    expect(unitOf(combatEngine, 'dummy-1').hp).toBe(24);
    combatEngine.endPlayerTurn();

    // Turno do chefe: passa ou prepara/ataca
    runEnemyTurn(combatEngine);
    combatEngine.consumeEvents();

    // Archer Marked Shot: 5 - 2 DEF = 3 dano
    expect(combatEngine.useSkill({ x: 2, y: 3 }).ok).toBe(true);
    expect(unitOf(combatEngine, 'dummy-1').hp).toBe(21);
    combatEngine.endPlayerTurn();

    // Mage Arcane Burst: 4 - 2 DEF = 2 dano
    expect(combatEngine.useSkill({ x: 2, y: 3 }).ok).toBe(true);
    expect(unitOf(combatEngine, 'dummy-1').hp).toBe(19);
    combatEngine.endPlayerTurn();

    // Cleric Healing Light em si mesmo: cura +5 HP (3 -> 8)
    expect(combatEngine.useSkill({ x: 3, y: 0 }).ok).toBe(true);
    expect(unitOf(combatEngine, 'c').hp).toBe(8);
  });

  it('valida sobrevivência com FORT no limite e defend() (mitigação 50% mantendo dano mínimo 1)', () => {
    // Evoluir Guerreiro até FORT = 12 (maxHp 24, DEF 3)
    const knightStats = UNIT_STATS.knight;
    let fortKnight: AttributeProgressionTarget = {
      baseHp: knightStats.baseHp,
      hp: calcMaxHp(knightStats.baseHp, knightStats.attributes.fort),
      maxHp: calcMaxHp(knightStats.baseHp, knightStats.attributes.fort),
      attributes: { ...knightStats.attributes },
      unspentPoints: 6,
    };
    while (fortKnight.attributes.fort < MAX_ATTRIBUTE) {
      const res = applyAttributePoint(fortKnight, 'fort');
      expect(res.ok).toBe(true);
      if (res.ok) fortKnight = res.hero;
    }

    expect(fortKnight.attributes.fort).toBe(12);
    expect(fortKnight.maxHp).toBe(24);
    expect(fortitudeResistance(fortKnight.attributes.fort)).toBe(2);
    expect(computeUnitArmor(knightStats.baseArmor, fortKnight.attributes.fort)).toBe(3);

    // Simulação comparativa no motor: Guerreiro base vs Guerreiro FORT=12 + defend() contra Chefe (5 ATK) e Goblin (2 ATK)
    const engine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-tank'),
        { id: 'boss-1', type: 'ashen-guardian', team: 'enemy', pos: { x: 2, y: 3 } },
        { id: 'goblin-1', type: 'goblin-scout', team: 'enemy', pos: { x: 3, y: 2 } },
      ],
      heroOverrides: [
        {
          id: 'knight-tank',
          type: 'knight',
          attributes: fortKnight.attributes,
          hp: fortKnight.maxHp,
          maxHp: fortKnight.maxHp,
          unspentPoints: 0,
        },
      ],
    });
    engine.consumeEvents();

    // Rodada 1: Guerreiro (24 HP, 3 DEF) usa defend() e encerra turno
    expect(engine.defend().ok).toBe(true);
    expect(engine.endPlayerTurn().ok).toBe(true);
    engine.consumeEvents();

    // Chefe prepara ataque ou ataca; Goblin (2 ATK) ataca Guerreiro (3 DEF + defend): dano mínimo = 1!
    const goblinTurnEvents: GameEvent[] = [];
    while (engine.getState().turnState === 'enemy_activation') {
      engine.executeNextEnemyAction();
      goblinTurnEvents.push(...engine.consumeEvents());
    }

    const goblinHit = goblinTurnEvents.find(
      (e): e is Extract<GameEvent, { type: 'unitAttacked' }> =>
        e.type === 'unitAttacked' && e.attackerId === 'goblin-1',
    );
    expect(goblinHit).toBeDefined();
    expect(goblinHit!.damage).toBe(1); // Mesmo 2 ATK < 3 DEF e defend() ativo -> dano mínimo = 1
    expect(goblinHit!.wasGuarded).toBe(true);

    // Verifica que mesmo sob golpes de um atacante fraco com FORT=12 e defend() todo turno,
    // o tanque continua sofrendo >= 1 de dano por golpe (nunca fica invulnerável)
    const minDamageEngine = new GameEngine({
      gridSize: 8,
      obstacles: [],
      units: [
        knightAt(2, 2, 'knight-tank'),
        { id: 'goblin-1', type: 'goblin-scout', team: 'enemy', pos: { x: 2, y: 3 } },
      ],
      heroOverrides: [
        {
          id: 'knight-tank',
          type: 'knight',
          attributes: fortKnight.attributes,
          hp: 5, // HP baixo para confirmar que eventualmente morre por dano mínimo 1
          maxHp: fortKnight.maxHp,
          unspentPoints: 0,
        },
      ],
    });

    const damageLog: number[] = [];
    for (let r = 0; r < 10 && !minDamageEngine.getState().winner; r++) {
      if (minDamageEngine.getState().turnState === 'player_unit_active') {
        expect(minDamageEngine.defend().ok).toBe(true);
        minDamageEngine.endPlayerTurn();
        minDamageEngine.consumeEvents();
      }
      if (minDamageEngine.getState().turnState === 'enemy_activation') {
        const evs = runEnemyTurn(minDamageEngine).flat();
        for (const ev of evs) {
          if (ev.type === 'unitAttacked') damageLog.push(ev.damage);
        }
      }
    }

    expect(damageLog).toEqual([1, 1, 1, 1, 1]);
    expect(minDamageEngine.getState().winner).toBe('enemy');
    expect(unitOf(minDamageEngine, 'knight-tank').alive).toBe(false);

    // Confirma que Arqueira (0 DEF) usando defend() contra Chefe (5 ATK) recebe ceil(5 * 0.5) = 3 em vez de 5
    const archer = createUnit(archerAt(0, 0, 'archer-1'));
    const boss = createUnit({ id: 'b', type: 'ashen-guardian', team: 'enemy', pos: { x: 0, y: 1 } });
    expect(computeDamage(boss, archer, boss.basePower, boss.attackKind)).toBe(5);
    archer.isGuarding = true;
    expect(computeDamage(boss, archer, boss.basePower, boss.attackKind)).toBe(3);
  });

  it('simula a campanha completa (Fases 1 a 5) com CampaignSystem + SaveSystem, vencendo todas as fases, transicionando o Chefe para Fase 2 e resolvendo PendingAttack', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);
    const campaign = new CampaignSystem(saveSystem);

    campaign.startNewCampaign();
    expect(storage.getItem(CAMPAIGN_SAVE_KEY)).not.toBeNull();

    // Plano determinístico de evolução entre fases (1 ponto por herói após cada vitória 1..4)
    const upgradePlan: Record<number, Record<string, AttributeKey>> = {
      1: { 'knight-1': 'str', 'archer-1': 'dex', 'mage-1': 'int', 'cleric-1': 'int' }, // todos +1 ofensivo/cura
      2: { 'knight-1': 'fort', 'archer-1': 'fort', 'mage-1': 'fort', 'cleric-1': 'fort' }, // sobrevivência no meio da campanha
      3: { 'knight-1': 'fort', 'archer-1': 'dex', 'mage-1': 'int', 'cleric-1': 'int' }, // Knight fort 8 (+1 DEF!), outros sobem principal
      4: { 'knight-1': 'str', 'archer-1': 'dex', 'mage-1': 'int', 'cleric-1': 'int' },
    };

    const stageSummaries: Array<{
      stage: number;
      rounds: number;
      aliveHeroes: number;
      bossPhase2Triggered: boolean;
      pendingAttacksPrepared: number;
      pendingAttacksResolved: number;
    }> = [];

    for (let stageNumber = 1; stageNumber <= CAMPAIGN_STAGES.length; stageNumber++) {
      const setup = campaign.createStageGameSetup(1000 + stageNumber);
      const engine = new GameEngine(setup);
      const stageEvents: GameEvent[] = [...engine.consumeEvents()];

      let stepGuard = 0;
      while (!engine.getState().winner && stepGuard < 600) {
        stepGuard++;
        const state = engine.getState();
        if (state.turnState === 'player_unit_active') {
          stageEvents.push(...runDeterministicHeroTurn(engine));
        } else if (state.turnState === 'enemy_activation') {
          stageEvents.push(...runEnemyTurn(engine).flat());
        }
      }

      const finalSnapshot = engine.getState();
      expect(finalSnapshot.winner).toBe('player');
      expect(finalSnapshot.mode).toBe('campaign');
      expect(finalSnapshot.stageNumber).toBe(stageNumber);

      const aliveHeroes = finalSnapshot.units.filter((u) => u.team === 'player' && u.alive).length;
      const bossPhaseEv = stageEvents.find(
        (e): e is Extract<GameEvent, { type: 'bossPhaseChanged' }> => e.type === 'bossPhaseChanged',
      );
      const preparedAttacks = stageEvents.filter(
        (e): e is Extract<GameEvent, { type: 'attackPrepared' }> => e.type === 'attackPrepared',
      );
      const resolvedAttacks = stageEvents.filter(
        (e): e is Extract<GameEvent, { type: 'pendingAttackResolved' }> =>
          e.type === 'pendingAttackResolved',
      );

      stageSummaries.push({
        stage: stageNumber,
        rounds: finalSnapshot.round,
        aliveHeroes,
        bossPhase2Triggered: Boolean(bossPhaseEv),
        pendingAttacksPrepared: preparedAttacks.length,
        pendingAttacksResolved: resolvedAttacks.length,
      });

      const updatedCampaign = campaign.completeStage(finalSnapshot);
      const reloadedFromDisk = new CampaignSystem(new SaveSystem(storage)).loadCampaign();
      expect(reloadedFromDisk).toEqual(updatedCampaign);

      if (stageNumber < CAMPAIGN_STAGES.length) {
        expect(updatedCampaign.status).toBe('between_stages');
        const plan = upgradePlan[stageNumber];
        for (const [heroId, attr] of Object.entries(plan)) {
          expect(campaign.allocateHeroAttribute(heroId, attr).ok).toBe(true);
        }
        expect(campaign.canAdvanceToNextStage()).toBe(true);
        const advRes = campaign.advanceToNextStage();
        expect(advRes.ok).toBe(true);
      } else {
        expect(updatedCampaign.status).toBe('completed');
        expect(bossPhaseEv).toEqual({
          type: 'bossPhaseChanged',
          unitId: 'ashen-guardian-1',
          phase: 2,
          newMoveRange: 3,
        });
        expect(preparedAttacks.length).toBeGreaterThanOrEqual(2);
        expect(resolvedAttacks.length).toBeGreaterThanOrEqual(2);
        expect(resolvedAttacks.some((e) => e.skillName === 'Golpe das Cinzas')).toBe(true);
        expect(resolvedAttacks.some((e) => e.skillName === 'Erupção das Cinzas')).toBe(true);
      }
    }

    expect(stageSummaries).toHaveLength(5);
    expect(stageSummaries.every((s) => s.aliveHeroes >= 1)).toBe(true);
    expect(saveSystem.load()?.status).toBe('completed');
  });
});
