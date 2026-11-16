import { GRID_SIZE, OBSTACLES } from '../../config/gameConfig';
import type { GridCoord, ObstacleDef, UnitState } from '../../shared/types';

type Occupant = Pick<UnitState, 'pos' | 'alive'>;

interface SearchNode {
  cell: GridCoord;
  dist: number;
  prev: SearchNode | null;
}

// Ordem fixa dos vizinhos: mantém a busca, e portanto a IA, determinística.
const STEPS: readonly GridCoord[] = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

export function manhattan(a: GridCoord, b: GridCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function sameCell(a: GridCoord, b: GridCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

/** O segmento entre os centros de `a` e `b` passa pelo interior da célula `cell`? (recorte de Liang–Barsky) */
function segmentCrossesCell(a: GridCoord, b: GridCoord, cell: GridCoord): boolean {
  const half = 0.5 - 1e-6; // encolhe a célula para que encostar na borda ou no canto não conte
  let enter = 0;
  let exit = 1;
  for (const axis of ['x', 'y'] as const) {
    const delta = b[axis] - a[axis];
    const min = cell[axis] - half - a[axis];
    const max = cell[axis] + half - a[axis];
    if (delta === 0) {
      if (min > 0 || max < 0) return false;
      continue;
    }
    enter = Math.max(enter, Math.min(min / delta, max / delta));
    exit = Math.min(exit, Math.max(min / delta, max / delta));
  }
  return enter <= exit;
}

export class GridSystem {
  constructor(
    readonly size: number = GRID_SIZE,
    readonly obstacles: readonly ObstacleDef[] = OBSTACLES,
  ) {}

  isInBounds(c: GridCoord): boolean {
    return (
      Number.isInteger(c.x) && Number.isInteger(c.y) && c.x >= 0 && c.y >= 0 && c.x < this.size && c.y < this.size
    );
  }

  isObstacle(c: GridCoord): boolean {
    return this.obstacles.some((o) => sameCell(o.pos, c));
  }

  /** Só unidades vivas ocupam célula. */
  isOccupied(c: GridCoord, units: readonly Occupant[]): boolean {
    return units.some((u) => u.alive && sameCell(u.pos, c));
  }

  /** Fora da grade, obstáculo ou unidade viva. */
  isBlocked(c: GridCoord, units: readonly Occupant[]): boolean {
    return !this.isInBounds(c) || this.isObstacle(c) || this.isOccupied(c, units);
  }

  /** Vizinhos ortogonais dentro da grade. */
  getNeighbors(c: GridCoord): GridCoord[] {
    return STEPS.map((s) => ({ x: c.x + s.x, y: c.y + s.y })).filter((n) => this.isInBounds(n));
  }

  /**
   * Linha de visão entre os centros das duas células. Um obstáculo com `blocksLos` a interrompe quando o
   * segmento atravessa o interior da sua célula; tocar só o canto não bloqueia. Origem e destino nunca bloqueiam.
   */
  hasLineOfSight(from: GridCoord, to: GridCoord, obstacles: readonly ObstacleDef[] = this.obstacles): boolean {
    return !obstacles.some(
      (o) => o.blocksLos && !sameCell(o.pos, from) && !sameCell(o.pos, to) && segmentCrossesCell(from, to, o.pos),
    );
  }

  /** Células onde dá para parar saindo de `from` com até `range` passos, da mais próxima à mais distante. */
  getReachableCells(from: GridCoord, range: number, units: readonly Occupant[]): GridCoord[] {
    return this.search(from, units, range)
      .slice(1)
      .map((n) => ({ ...n.cell }));
  }

  /** Menor caminho com origem e destino incluídos, ou `null`. O destino precisa estar livre. */
  getPath(from: GridCoord, to: GridCoord, units: readonly Occupant[]): GridCoord[] | null {
    let node = this.search(from, units, Infinity).find((n) => sameCell(n.cell, to)) ?? null;
    if (!node) return null;
    const path: GridCoord[] = [];
    for (; node; node = node.prev) path.unshift({ ...node.cell });
    return path;
  }

  /** BFS a partir de `from`. A origem não é testada como bloqueio: é a célula de quem anda. */
  private search(from: GridCoord, units: readonly Occupant[], maxSteps: number): SearchNode[] {
    if (!this.isInBounds(from)) return [];
    const nodes: SearchNode[] = [{ cell: from, dist: 0, prev: null }];
    const seen = new Set([from.y * this.size + from.x]);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.dist >= maxSteps) continue;
      for (const next of this.getNeighbors(node.cell)) {
        const key = next.y * this.size + next.x;
        if (seen.has(key) || this.isBlocked(next, units)) continue;
        seen.add(key);
        nodes.push({ cell: next, dist: node.dist + 1, prev: node });
      }
    }
    return nodes;
  }
}
