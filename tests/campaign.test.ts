import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_SAVE_KEY,
  CAMPAIGN_STAGES,
  MAPS,
  UNIT_STATS,
} from '../src/config/gameConfig';
import { CampaignSystem } from '../src/game/campaign/CampaignSystem';
import { SaveSystem } from '../src/game/campaign/SaveSystem';
import { GameEngine } from '../src/game/GameEngine';
import { GridSystem } from '../src/game/grid/GridSystem';
import type { GameStateSnapshot, StorageAdapter } from '../src/shared/types';

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

function makeVictorySnapshot(
  stageNumber: number,
  heroHps: Record<string, { hp: number; alive: boolean }>,
): GameStateSnapshot {
  const engine = new GameEngine({
    mode: 'campaign',
    stageNumber,
    stageName: CAMPAIGN_STAGES[stageNumber - 1].name,
    mapId: CAMPAIGN_STAGES[stageNumber - 1].mapId,
    randomizeSpawns: false,
  });
  const snap = engine.getState();
  return {
    ...snap,
    winner: 'player',
    phase: 'victory',
    units: snap.units.map((u) => {
      if (u.team !== 'player') {
        return { ...u, alive: false, hp: 0 };
      }
      const override = heroHps[u.id];
      return override
        ? { ...u, hp: override.hp, alive: override.alive }
        : u;
    }),
  };
}

describe('V4: Mapas Novos e Fases da Campanha', () => {
  it('water em forgotten-swamp bloqueia movimento mas não bloqueia linha de visão', () => {
    const swamp = MAPS.find((m) => m.id === 'forgotten-swamp')!;
    expect(swamp).toBeDefined();
    expect(swamp.theme).toBe('swamp');
    expect(swamp.bridgeCells?.length).toBe(8);

    const waterCells = swamp.obstacles.filter((o) => o.kind === 'water');
    expect(waterCells).toHaveLength(16);
    expect(waterCells.every((w) => w.blocksLos === false)).toBe(true);

    const grid = new GridSystem(swamp.gridSize, swamp.obstacles);
    // Coluna 0 tem água em (0,5) e (0,6): não pode andar sobre ela, mas tem LoS através dela
    expect(grid.isObstacle({ x: 0, y: 5 })).toBe(true);
    expect(grid.hasLineOfSight({ x: 0, y: 4 }, { x: 0, y: 7 })).toBe(true);
    // Ponte em (2,5) e (2,6) é livre
    expect(grid.isObstacle({ x: 2, y: 5 })).toBe(false);
    expect(grid.isObstacle({ x: 2, y: 6 })).toBe(false);
  });

  it('CAMPAIGN_STAGES define exatamente 5 fases com spawns válidos nos respectivos mapas', () => {
    expect(CAMPAIGN_STAGES).toHaveLength(5);
    expect(CAMPAIGN_STAGES.map((s) => s.mapId)).toEqual([
      'ruins',
      'forgotten-swamp',
      'fortress',
      'catacombs',
      'corrupted-sanctuary',
    ]);
    expect(CAMPAIGN_STAGES.map((s) => s.isBossStage)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);

    for (const stage of CAMPAIGN_STAGES) {
      const map = MAPS.find((m) => m.id === stage.mapId)!;
      expect(map).toBeDefined();
      const blocked = new Set(map.obstacles.map((o) => `${o.pos.x},${o.pos.y}`));
      const occupied = new Set<string>();

      for (const h of stage.heroSpawns) {
        const key = `${h.pos.x},${h.pos.y}`;
        expect(blocked.has(key)).toBe(false);
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
      for (const e of stage.enemies) {
        const key = `${e.pos.x},${e.pos.y}`;
        expect(blocked.has(key)).toBe(false);
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }

    const stage5Enemies = CAMPAIGN_STAGES[4].enemies.map((e) => e.type);
    expect(stage5Enemies).toContain('ashen-guardian');
  });
});

describe('V4: CampaignSystem (Fluxo, Recuperação, FORT e Checkpoint)', () => {
  it('inicia nova campanha, gera GameSetup sem randomização e preserva modo quick-battle', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);
    const campaign = new CampaignSystem(saveSystem);

    const state = campaign.startNewCampaign();
    expect(state.version).toBe(4);
    expect(state.status).toBe('in_stage');
    expect(state.currentStage).toBe(1);
    expect(state.heroes).toHaveLength(4);
    expect(state.checkpoint.stageNumber).toBe(1);

    const setup = campaign.createStageGameSetup();
    const engine = new GameEngine(setup);
    const snap = engine.getState();

    expect(snap.mode).toBe('campaign');
    expect(snap.stageNumber).toBe(1);
    expect(snap.stageName).toBe('Posto Avançado');
    expect(snap.mapId).toBe('ruins');
    expect(snap.turnOrder).toEqual([
      'knight-1',
      'goblin-scout-1',
      'cleric-1',
      'melee-skeleton-1',
      'archer-1',
      'goblin-scout-2',
      'mage-1',
    ]);

    // Batalha Rápida continua isolada e sem alterar o save
    const quick = new GameEngine({ seed: 101 });
    expect(quick.getState().mode).toBe('quick-battle');
    expect(quick.getState().stageNumber).toBeUndefined();
    expect(saveSystem.hasValidSave()).toBe(true);
  });

  it('aplica recuperação pós-vitória (+35% vivos ceil, revive 25% ceil) e concede +1 ponto por herói', () => {
    const campaign = new CampaignSystem();
    const initial = campaign.startNewCampaign();
    const knightMax = initial.heroes.find((h) => h.id === 'knight-1')!.maxHp; // 12
    const archerMax = initial.heroes.find((h) => h.id === 'archer-1')!.maxHp; // 8
    const mageMax = initial.heroes.find((h) => h.id === 'mage-1')!.maxHp; // 7

    const victory = makeVictorySnapshot(1, {
      'knight-1': { hp: 5, alive: true }, // +ceil(12*0.35)=5 -> 10
      'cleric-1': { hp: 9, alive: true }, // full -> capped at maxHp (9)
      'archer-1': { hp: 0, alive: false }, // dead -> ceil(8*0.25)=2
      'mage-1': { hp: 1, alive: true }, // +ceil(7*0.35)=3 -> 4
    });

    const after = campaign.completeStage(victory);
    expect(after.status).toBe('between_stages');

    const knight = after.heroes.find((h) => h.id === 'knight-1')!;
    const cleric = after.heroes.find((h) => h.id === 'cleric-1')!;
    const archer = after.heroes.find((h) => h.id === 'archer-1')!;
    const mage = after.heroes.find((h) => h.id === 'mage-1')!;

    expect(knight.hp).toBe(Math.min(knightMax, 5 + Math.ceil(knightMax * 0.35)));
    expect(cleric.hp).toBe(cleric.maxHp);
    expect(archer.hp).toBe(Math.ceil(archerMax * 0.25));
    expect(mage.hp).toBe(Math.min(mageMax, 1 + Math.ceil(mageMax * 0.35)));

    expect(after.heroes.every((h) => h.unspentPoints === 1)).toBe(true);
  });

  it('aloca FORT somando apenas o incremento de maxHp ao hp atual e bloqueia avanço com pontos pendentes', () => {
    const campaign = new CampaignSystem();
    campaign.startNewCampaign();

    const victory = makeVictorySnapshot(1, {
      'knight-1': { hp: 5, alive: true },
      'cleric-1': { hp: 9, alive: true },
      'archer-1': { hp: 8, alive: true },
      'mage-1': { hp: 6, alive: true },
    });
    const afterWin = campaign.completeStage(victory);
    const knightBefore = afterWin.heroes.find((h) => h.id === 'knight-1')!;
    expect(knightBefore.hp).toBe(10);
    expect(knightBefore.maxHp).toBe(12);
    expect(knightBefore.attributes.fort).toBe(UNIT_STATS.knight.attributes.fort); // 6

    // Não pode avançar enquanto houver pontos não gastos
    expect(campaign.canAdvanceToNextStage()).toBe(false);
    expect(campaign.advanceToNextStage().ok).toBe(false);

    // Investe FORT no knight (+1 fort -> +2 maxHp, +2 hp apenas, sem curar dano prévio)
    const allocRes = campaign.allocateHeroAttribute('knight-1', 'fort');
    expect(allocRes.ok).toBe(true);
    if (allocRes.ok) {
      const k = allocRes.state.heroes.find((h) => h.id === 'knight-1')!;
      expect(k.attributes.fort).toBe(7);
      expect(k.maxHp).toBe(14);
      expect(k.hp).toBe(12);
      expect(k.unspentPoints).toBe(0);
    }

    // Aloca os demais heróis e avança para Fase 2
    expect(campaign.allocateHeroAttribute('cleric-1', 'int').ok).toBe(true);
    expect(campaign.allocateHeroAttribute('archer-1', 'dex').ok).toBe(true);
    expect(campaign.allocateHeroAttribute('mage-1', 'int').ok).toBe(true);

    expect(campaign.canAdvanceToNextStage()).toBe(true);
    const adv = campaign.advanceToNextStage();
    expect(adv.ok).toBe(true);
    if (adv.ok) {
      expect(adv.state.currentStage).toBe(2);
      expect(adv.state.status).toBe('in_stage');
      expect(adv.state.checkpoint.stageNumber).toBe(2);

      // GameEngine da Fase 2 recebe HP e atributos evoluídos
      const eng2 = new GameEngine(campaign.createStageGameSetup());
      const kUnit = eng2.getState().units.find((u) => u.id === 'knight-1')!;
      expect(kUnit.maxHp).toBe(14);
      expect(kUnit.hp).toBe(12);
      expect(kUnit.attributes.fort).toBe(7);
      expect(eng2.getState().mapId).toBe('forgotten-swamp');
    }
  });

  it('reinicia fase atual restaurando exatamente o checkpoint e conclui campanha na Fase 5', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);
    const campaign = new CampaignSystem(saveSystem);
    campaign.startNewCampaign();

    // Simula avanço até a Fase 5
    for (let stage = 1; stage <= 4; stage++) {
      campaign.completeStage(makeVictorySnapshot(stage, {}));
      for (const id of ['knight-1', 'cleric-1', 'archer-1', 'mage-1']) {
        expect(campaign.allocateHeroAttribute(id, 'str').ok).toBe(true);
      }
      expect(campaign.advanceToNextStage().ok).toBe(true);
    }

    const stage5State = campaign.getState()!;
    expect(stage5State.currentStage).toBe(5);
    expect(stage5State.checkpoint.stageNumber).toBe(5);
    const checkpointStr = stage5State.checkpoint.heroes.find((h) => h.id === 'knight-1')!.attributes.str;

    // Reiniciar fase 5 restaura exatamente o checkpoint da fase 5
    const restarted = campaign.restartCurrentStage();
    expect(restarted.currentStage).toBe(5);
    expect(restarted.status).toBe('in_stage');
    expect(restarted.heroes.find((h) => h.id === 'knight-1')!.attributes.str).toBe(checkpointStr);

    // Vencer a fase 5 conclui a campanha
    const completed = campaign.completeStage(
      makeVictorySnapshot(5, {
        'knight-1': { hp: 3, alive: true },
        'archer-1': { hp: 0, alive: false },
      }),
    );
    expect(completed.status).toBe('completed');
    expect(completed.currentStage).toBe(5);
    expect(saveSystem.load()?.status).toBe('completed');
  });
});

describe('V4: SaveSystem (Persistência Versionada e Validação Estrita)', () => {
  it('salva e carrega estado válido em StorageAdapter e limpa corretamente', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);
    const campaign = new CampaignSystem(saveSystem);

    const created = campaign.startNewCampaign();
    expect(storage.getItem(CAMPAIGN_SAVE_KEY)).not.toBeNull();

    const reloadedCampaign = new CampaignSystem(saveSystem);
    const loaded = reloadedCampaign.loadCampaign();
    expect(loaded).toEqual(created);

    saveSystem.clear();
    expect(saveSystem.load()).toBeNull();
    expect(saveSystem.hasValidSave()).toBe(false);
  });

  it('rejeita saves corrompidos, versão incompatível ou invariantes violadas', () => {
    const storage = new MemoryStorage();
    const saveSystem = new SaveSystem(storage);
    const campaign = new CampaignSystem(saveSystem);
    const valid = campaign.startNewCampaign();

    // JSON malformado
    storage.setItem(CAMPAIGN_SAVE_KEY, '{invalid-json');
    expect(saveSystem.load()).toBeNull();

    // Versão incompatível
    storage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify({ ...valid, version: 3 }));
    expect(saveSystem.load()).toBeNull();

    // currentStage fora de 1..5
    storage.setItem(
      CAMPAIGN_SAVE_KEY,
      JSON.stringify({ ...valid, currentStage: 6, checkpoint: { ...valid.checkpoint, stageNumber: 6 } }),
    );
    expect(saveSystem.load()).toBeNull();

    // Herói ausente
    storage.setItem(
      CAMPAIGN_SAVE_KEY,
      JSON.stringify({ ...valid, heroes: valid.heroes.slice(0, 3) }),
    );
    expect(saveSystem.load()).toBeNull();

    // Atributo fora de [1, 12]
    const badAttr = structuredClone(valid);
    badAttr.heroes[0].attributes.str = 13;
    storage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify(badAttr));
    expect(saveSystem.load()).toBeNull();

    // HP <= 0 em in_stage
    const zeroHp = structuredClone(valid);
    zeroHp.heroes[0].hp = 0;
    storage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify(zeroHp));
    expect(saveSystem.load()).toBeNull();

    // HP > calcMaxHp
    const overHp = structuredClone(valid);
    overHp.heroes[0].hp = overHp.heroes[0].maxHp + 1;
    storage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify(overHp));
    expect(saveSystem.load()).toBeNull();
  });
});
