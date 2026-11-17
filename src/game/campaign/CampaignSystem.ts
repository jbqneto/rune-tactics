import {
  CAMPAIGN_HERO_SPAWNS,
  CAMPAIGN_POINTS_PER_STAGE,
  CAMPAIGN_REVIVE_HP_RATIO,
  CAMPAIGN_SAVE_VERSION,
  CAMPAIGN_STAGES,
  CAMPAIGN_SURVIVOR_HEAL_RATIO,
  MAX_ATTRIBUTE,
  UNIT_STATS,
  type UnitSpawn,
} from '../../config/gameConfig';
import type {
  AttributeKey,
  CampaignHeroProgress,
  CampaignState,
  GameStateSnapshot,
  StageConfig,
} from '../../shared/types';
import { applyAttributePoint, calcMaxHp } from '../attributes/AttributeSystem';
import type { GameSetup } from '../GameEngine';
import type { SaveSystem } from './SaveSystem';

const ATTRIBUTE_KEYS: readonly AttributeKey[] = ['str', 'dex', 'int', 'fort'];

function cloneHero(hero: CampaignHeroProgress): CampaignHeroProgress {
  return {
    ...hero,
    attributes: { ...hero.attributes },
  };
}

function cloneHeroes(heroes: readonly CampaignHeroProgress[]): CampaignHeroProgress[] {
  return heroes.map(cloneHero);
}

function cloneState(state: CampaignState): CampaignState {
  return {
    ...state,
    heroes: cloneHeroes(state.heroes),
    checkpoint: {
      stageNumber: state.checkpoint.stageNumber,
      heroes: cloneHeroes(state.checkpoint.heroes),
    },
  };
}

function createInitialHeroes(): CampaignHeroProgress[] {
  return CAMPAIGN_HERO_SPAWNS.map((spawn) => {
    const stats = UNIT_STATS[spawn.type];
    const attributes = { ...stats.attributes };
    const maxHp = calcMaxHp(stats.baseHp, attributes.fort);
    return {
      id: spawn.id,
      type: spawn.type as CampaignHeroProgress['type'],
      attributes,
      hp: maxHp,
      maxHp,
      unspentPoints: 0,
    };
  });
}

function isHeroFullyMaxed(hero: CampaignHeroProgress): boolean {
  return ATTRIBUTE_KEYS.every((key) => hero.attributes[key] >= MAX_ATTRIBUTE);
}

export type CampaignActionResult =
  | { ok: true; state: CampaignState }
  | { ok: false; reason: string };

/**
 * Máquina de estado da campanha de 5 fases: inicialização, geração de `GameSetup`,
 * recuperação pós-vitória, evolução de atributos, checkpoint e reinício de fase.
 */
export class CampaignSystem {
  private state: CampaignState | null = null;

  constructor(private readonly saveSystem?: SaveSystem) {}

  startNewCampaign(): CampaignState {
    const heroes = createInitialHeroes();
    this.state = {
      version: CAMPAIGN_SAVE_VERSION,
      status: 'in_stage',
      currentStage: 1,
      heroes,
      checkpoint: {
        stageNumber: 1,
        heroes: cloneHeroes(heroes),
      },
    };
    this.persist();
    return cloneState(this.state);
  }

  loadCampaign(): CampaignState | null {
    if (!this.saveSystem) return null;
    const loaded = this.saveSystem.load();
    if (!loaded) return null;
    this.state = cloneState(loaded);
    return cloneState(this.state);
  }

  getState(): CampaignState | null {
    return this.state ? cloneState(this.state) : null;
  }

  getCurrentStageConfig(): StageConfig {
    const state = this.requireState();
    const stage = CAMPAIGN_STAGES.find((s) => s.stageNumber === state.currentStage);
    if (!stage) {
      throw new Error(`Fase inválida na campanha: ${state.currentStage}`);
    }
    return stage;
  }

  createStageGameSetup(seed?: number): GameSetup {
    const state = this.requireState();
    const stage = this.getCurrentStageConfig();

    const units: UnitSpawn[] = [
      ...stage.heroSpawns.map((h) => ({
        id: h.id,
        type: h.type,
        team: 'player' as const,
        pos: { ...h.pos },
      })),
      ...stage.enemies.map((e) => ({
        id: e.id,
        type: e.type,
        team: 'enemy' as const,
        pos: { ...e.pos },
      })),
    ];

    return {
      mode: 'campaign',
      stageNumber: stage.stageNumber,
      stageName: stage.name,
      mapId: stage.mapId,
      randomizeSpawns: false,
      units,
      heroOverrides: cloneHeroes(state.heroes),
      ...(seed !== undefined ? { seed } : {}),
    };
  }

  completeStage(snapshot: GameStateSnapshot): CampaignState {
    const state = this.requireState();
    if (state.status !== 'in_stage') {
      throw new Error('Só é possível concluir uma fase quando status === "in_stage".');
    }
    if (snapshot.winner !== 'player') {
      throw new Error('A fase só pode ser concluída após vitória do jogador.');
    }
    if (snapshot.stageNumber !== undefined && snapshot.stageNumber !== state.currentStage) {
      throw new Error(
        `Snapshot da fase ${snapshot.stageNumber} não corresponde à fase atual ${state.currentStage}.`,
      );
    }

    const isFinalStage = state.currentStage >= CAMPAIGN_STAGES.length;

    state.heroes = state.heroes.map((hero) => {
      const unit = snapshot.units.find((u) => u.id === hero.id);
      if (!unit) {
        throw new Error(`Herói ${hero.id} ausente no snapshot da batalha.`);
      }

      if (isFinalStage) {
        return {
          ...cloneHero(hero),
          hp: unit.alive ? Math.min(hero.maxHp, Math.max(1, unit.hp)) : 0,
        };
      }

      const nextHero = cloneHero(hero);
      if (unit.alive && unit.hp > 0) {
        const heal = Math.ceil(nextHero.maxHp * CAMPAIGN_SURVIVOR_HEAL_RATIO);
        nextHero.hp = Math.min(nextHero.maxHp, unit.hp + heal);
      } else {
        nextHero.hp = Math.max(1, Math.ceil(nextHero.maxHp * CAMPAIGN_REVIVE_HP_RATIO));
      }
      nextHero.unspentPoints += CAMPAIGN_POINTS_PER_STAGE;
      return nextHero;
    });

    state.status = isFinalStage ? 'completed' : 'between_stages';
    this.persist();
    return cloneState(state);
  }

  allocateHeroAttribute(heroId: string, attr: AttributeKey): CampaignActionResult {
    if (!this.state) {
      return { ok: false, reason: 'Nenhuma campanha ativa.' };
    }
    if (this.state.status !== 'between_stages') {
      return { ok: false, reason: 'Atributos só podem ser alocados entre fases.' };
    }

    const idx = this.state.heroes.findIndex((h) => h.id === heroId);
    if (idx === -1) {
      return { ok: false, reason: `Herói não encontrado: ${heroId}` };
    }

    const hero = this.state.heroes[idx];
    const baseHp = UNIT_STATS[hero.type].baseHp;
    const result = applyAttributePoint(
      {
        baseHp,
        hp: hero.hp,
        maxHp: hero.maxHp,
        attributes: { ...hero.attributes },
        unspentPoints: hero.unspentPoints,
      },
      attr,
    );

    if (!result.ok) {
      return { ok: false, reason: result.reason };
    }

    this.state.heroes[idx] = {
      ...hero,
      attributes: { ...result.hero.attributes },
      maxHp: result.hero.maxHp,
      hp: result.hero.hp,
      unspentPoints: result.hero.unspentPoints,
    };
    this.persist();
    return { ok: true, state: cloneState(this.state) };
  }

  canAdvanceToNextStage(): boolean {
    if (!this.state) return false;
    if (this.state.status !== 'between_stages') return false;
    if (this.state.currentStage >= CAMPAIGN_STAGES.length) return false;

    return this.state.heroes.every(
      (hero) => hero.unspentPoints === 0 || isHeroFullyMaxed(hero),
    );
  }

  advanceToNextStage(): CampaignActionResult {
    if (!this.state) {
      return { ok: false, reason: 'Nenhuma campanha ativa.' };
    }
    if (this.state.status !== 'between_stages') {
      return { ok: false, reason: 'A campanha não está entre fases.' };
    }
    if (this.state.currentStage >= CAMPAIGN_STAGES.length) {
      return { ok: false, reason: 'A campanha já está na última fase.' };
    }
    if (!this.canAdvanceToNextStage()) {
      return {
        ok: false,
        reason: 'Distribua todos os pontos de atributo pendentes antes de avançar.',
      };
    }

    this.state.currentStage += 1;
    this.state.status = 'in_stage';
    this.state.checkpoint = {
      stageNumber: this.state.currentStage,
      heroes: cloneHeroes(this.state.heroes),
    };
    this.persist();
    return { ok: true, state: cloneState(this.state) };
  }

  restartCurrentStage(): CampaignState {
    const state = this.requireState();
    state.currentStage = state.checkpoint.stageNumber;
    state.heroes = cloneHeroes(state.checkpoint.heroes);
    state.status = 'in_stage';
    this.persist();
    return cloneState(state);
  }

  clearCampaign(): void {
    this.state = null;
    this.saveSystem?.clear();
  }

  private requireState(): CampaignState {
    if (!this.state) {
      throw new Error('Nenhuma campanha ativa.');
    }
    return this.state;
  }

  private persist(): void {
    if (this.state && this.saveSystem) {
      this.saveSystem.save(cloneState(this.state));
    }
  }
}
