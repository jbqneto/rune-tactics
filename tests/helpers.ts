import type { UnitSpawn } from '../src/config/gameConfig';
import { createUnit } from '../src/game/entities/UnitFactory';
import type { GameEvent, IGameEngine, ObstacleDef, ObstacleKind, Team, UnitState, UnitType } from '../src/shared/types';

const spawner =
  (type: UnitType, team: Team) =>
  (x: number, y: number, id = `${type}-1`): UnitSpawn => ({ id, type, team, pos: { x, y } });

export const knightAt = spawner('knight', 'player');
export const archerAt = spawner('archer', 'player');
export const mageAt = spawner('mage', 'player');
export const clericAt = spawner('cleric', 'player');
export const meleeAt = spawner('melee-skeleton', 'enemy');
export const boneArcherAt = spawner('skeleton-archer', 'enemy');
export const armoredAt = spawner('armored-skeleton', 'enemy');
export const goblinAt = spawner('goblin-scout', 'enemy');
export const cultistAt = spawner('cultist-mage', 'enemy');

const obstacle =
  (kind: ObstacleKind, blocksLos: boolean) =>
  (x: number, y: number): ObstacleDef => ({ pos: { x, y }, kind, blocksLos });

export const wall = obstacle('wall', true);
export const pillar = obstacle('pillar', true);
export const crate = obstacle('crate', false);
export const barrel = obstacle('barrel', false);

export const unit = (spawn: UnitSpawn, overrides: Partial<UnitState> = {}): UnitState => ({
  ...createUnit(spawn),
  ...overrides,
});

/** Runs the enemy phase until leaving `enemy_activation` and returns events for each executed step. */
export function runEnemyTurn(engine: IGameEngine): GameEvent[][] {
  const steps: GameEvent[][] = [];
  for (let i = 0; engine.getState().turnState === 'enemy_activation'; i++) {
    if (i > 100) throw new Error('enemy activation did not terminate');
    const acted = engine.executeNextEnemyAction();
    const evs = engine.consumeEvents();
    if (acted || evs.length > 0) steps.push(evs);
  }
  return steps;
}

export const unitOf = (engine: IGameEngine, id: string): UnitState =>
  engine.getState().units.find((u) => u.id === id)!;
