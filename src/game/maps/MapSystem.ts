import type { MapConfig, UnitSpawn } from '../../config/gameConfig';
import type { GridCoord, ObstacleDef } from '../../shared/types';

/** PRNG determinístico Mulberry32 a partir de uma semente inteira. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Sorteia um mapa de `maps` garantindo que não repita `previousMapId`
 * quando houver pelo menos 2 mapas e `fixedMapId` não estiver definido.
 */
export function pickMap(
  maps: readonly MapConfig[],
  rng: () => number,
  previousMapId: string | null,
  fixedMapId?: string
): MapConfig {
  if (fixedMapId) {
    const found = maps.find((m) => m.id === fixedMapId);
    if (found) return found;
  }

  const candidates =
    maps.length >= 2 && previousMapId
      ? maps.filter((m) => m.id !== previousMapId)
      : maps;

  const idx = Math.floor(rng() * candidates.length);
  return candidates[idx] ?? maps[0];
}

function collectFreeRowCells(
  gridSize: number,
  rows: readonly [number, number],
  obstacles: readonly ObstacleDef[]
): GridCoord[] {
  const blocked = new Set(obstacles.map((o) => `${o.pos.x},${o.pos.y}`));
  const cells: GridCoord[] = [];
  for (const y of rows) {
    for (let x = 0; x < gridSize; x++) {
      if (!blocked.has(`${x},${y}`)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

/**
 * Sorteia posições iniciais para aliados (`playerSpawnRows`) e inimigos (`enemySpawnRows`)
 * sem sobrepor obstáculos ou outras unidades, preservando a ordem exata da lista de spawns.
 */
export function randomizeUnitSpawns(
  spawns: readonly UnitSpawn[],
  gridSize: number,
  obstacles: readonly ObstacleDef[],
  playerSpawnRows: readonly [number, number],
  enemySpawnRows: readonly [number, number],
  rng: () => number
): UnitSpawn[] {
  const playerCells = shuffle(collectFreeRowCells(gridSize, playerSpawnRows, obstacles), rng);
  const enemyCells = shuffle(collectFreeRowCells(gridSize, enemySpawnRows, obstacles), rng);

  let pIdx = 0;
  let eIdx = 0;

  return spawns.map((spawn) => {
    if (spawn.team === 'player') {
      const pos = playerCells[pIdx++];
      if (!pos) throw new Error('Espaço insuficiente nas linhas de spawn do jogador.');
      return { ...spawn, pos: { ...pos } };
    }
    const pos = enemyCells[eIdx++];
    if (!pos) throw new Error('Espaço insuficiente nas linhas de spawn dos inimigos.');
    return { ...spawn, pos: { ...pos } };
  });
}
