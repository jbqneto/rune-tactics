import {
  CAMPAIGN_HERO_SPAWNS,
  CAMPAIGN_SAVE_KEY,
  CAMPAIGN_SAVE_VERSION,
  CAMPAIGN_STAGES,
  MAX_ATTRIBUTE,
  MIN_ATTRIBUTE,
  UNIT_STATS,
} from '../../config/gameConfig';
import type {
  AttributeKey,
  CampaignHeroProgress,
  CampaignState,
  CampaignStatus,
  StorageAdapter,
  UnitAttributes,
} from '../../shared/types';
import { calcMaxHp } from '../attributes/AttributeSystem';

const VALID_STATUSES: ReadonlySet<CampaignStatus> = new Set([
  'in_stage',
  'between_stages',
  'completed',
]);

const ATTRIBUTE_KEYS: readonly AttributeKey[] = ['str', 'dex', 'int', 'fort'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function parseHero(
  raw: unknown,
  allowZeroHp: boolean,
): CampaignHeroProgress | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || typeof raw.type !== 'string') return null;

  const canonical = CAMPAIGN_HERO_SPAWNS.find((h) => h.id === raw.id && h.type === raw.type);
  if (!canonical) return null;

  if (!isRecord(raw.attributes)) return null;
  const attrs: Partial<UnitAttributes> = {};
  for (const key of ATTRIBUTE_KEYS) {
    const val = raw.attributes[key];
    if (!isIntInRange(val, MIN_ATTRIBUTE, MAX_ATTRIBUTE)) return null;
    attrs[key] = val;
  }
  const attributes = attrs as UnitAttributes;

  const baseHp = UNIT_STATS[canonical.type].baseHp;
  const expectedMaxHp = calcMaxHp(baseHp, attributes.fort);
  if (raw.maxHp !== expectedMaxHp) return null;

  const minHp = allowZeroHp ? 0 : 1;
  if (!isIntInRange(raw.hp, minHp, expectedMaxHp)) return null;
  if (typeof raw.unspentPoints !== 'number' || !Number.isInteger(raw.unspentPoints) || raw.unspentPoints < 0) {
    return null;
  }

  return {
    id: canonical.id,
    type: canonical.type as CampaignHeroProgress['type'],
    attributes,
    hp: raw.hp,
    maxHp: expectedMaxHp,
    unspentPoints: raw.unspentPoints,
  };
}

function parseHeroList(raw: unknown, allowZeroHp: boolean): CampaignHeroProgress[] | null {
  if (!Array.isArray(raw) || raw.length !== CAMPAIGN_HERO_SPAWNS.length) return null;
  const parsed: CampaignHeroProgress[] = [];
  const seenIds = new Set<string>();

  for (const item of raw) {
    const hero = parseHero(item, allowZeroHp);
    if (!hero || seenIds.has(hero.id)) return null;
    seenIds.add(hero.id);
    parsed.push(hero);
  }

  for (const canonical of CAMPAIGN_HERO_SPAWNS) {
    if (!seenIds.has(canonical.id)) return null;
  }

  return parsed;
}

/** Valida e converte um objeto desconhecido em `CampaignState`, retornando `null` se inválido. */
export function validateCampaignState(raw: unknown): CampaignState | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== CAMPAIGN_SAVE_VERSION) return null;
  if (typeof raw.status !== 'string' || !VALID_STATUSES.has(raw.status as CampaignStatus)) {
    return null;
  }
  const status = raw.status as CampaignStatus;

  if (!isIntInRange(raw.currentStage, 1, CAMPAIGN_STAGES.length)) return null;

  const heroes = parseHeroList(raw.heroes, status === 'completed');
  if (!heroes) return null;

  if (!isRecord(raw.checkpoint)) return null;
  if (raw.checkpoint.stageNumber !== raw.currentStage) return null;

  const checkpointHeroes = parseHeroList(raw.checkpoint.heroes, false);
  if (!checkpointHeroes) return null;

  return {
    version: 4,
    status,
    currentStage: raw.currentStage,
    heroes,
    checkpoint: {
      stageNumber: raw.checkpoint.stageNumber,
      heroes: checkpointHeroes,
    },
  };
}

/**
 * Persistência versionada da campanha usando `StorageAdapter` injetável (sem acessar DOM/window).
 */
export class SaveSystem {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string = CAMPAIGN_SAVE_KEY,
  ) {}

  save(state: CampaignState): void {
    this.storage.setItem(this.key, JSON.stringify(state));
  }

  load(): CampaignState | null {
    const raw = this.storage.getItem(this.key);
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    return validateCampaignState(parsed);
  }

  hasValidSave(): boolean {
    return this.load() !== null;
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
