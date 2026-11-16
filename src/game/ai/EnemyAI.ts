import type { GridCoord, UnitState } from '../../shared/types';
import { canReach } from '../combat/CombatSystem';
import { GridSystem, manhattan } from '../grid/GridSystem';

export type EnemyAction = { type: 'attack'; target: UnitState } | { type: 'move'; path: GridCoord[] };

/** Distância que unidades à distância (arqueiro e cultista) tentam manter dos alvos. */
const RANGED_SAFE_DISTANCE = 2;

/** O primeiro elemento de menor pontuação; no empate, vale a ordem da lista. */
function minBy<T>(items: readonly T[], score: (item: T) => number): T | undefined {
  let best: T | undefined;
  let bestScore = Infinity;
  for (const item of items) {
    const s = score(item);
    if (s < bestScore) [best, bestScore] = [item, s];
  }
  return best;
}

/**
 * Próximo passo do inimigo na ativação atual, ou `null` se ele não tem mais o que fazer.
 * Não altera nada: quem aplica a ação é o motor.
 *
 * Comportamentos por tipo:
 * - melee-skeleton: vai pelo caminho mais curto e bate no alvo mais fraco ao alcance.
 * - armored-skeleton: entre as células igualmente próximas, escolhe a que encosta em mais alvos, e bate no mais próximo.
 * - skeleton-archer / cultist-mage: ataca à distância com LoS (menor HP) e, ao andar, prefere distância >= 2.
 * - goblin-scout: rápido (moveRange 4), prioriza o aliado vivo mais vulnerável (menor HP).
 */
export function nextEnemyAction(enemy: UnitState, units: readonly UnitState[], grid: GridSystem): EnemyAction | null {
  if (!enemy.alive || enemy.hasAttacked) return null;
  const targets = units.filter((u) => u.alive && u.team !== enemy.team);
  if (targets.length === 0) return null;

  const targetsFrom = (cell: GridCoord) => targets.filter((t) => canReach(cell, t.pos, enemy.attackRange, grid));
  const distanceToNearest = (cell: GridCoord) => Math.min(...targets.map((t) => manhattan(cell, t.pos)));

  const inRange = targetsFrom(enemy.pos);
  if (inRange.length > 0) {
    const target =
      enemy.type === 'armored-skeleton'
        ? minBy(inRange, (t) => manhattan(enemy.pos, t.pos))!
        : minBy(inRange, (t) => t.hp * 100 + manhattan(enemy.pos, t.pos))!;
    return { type: 'attack', target };
  }
  if (enemy.hasMoved) return null;

  const isRangedKiter = enemy.type === 'skeleton-archer' || enemy.type === 'cultist-mage';

  // Células de onde daria para atacar alguém, da mais próxima à mais distante, com o custo em passos.
  const firingCells = grid
    .getReachableCells(enemy.pos, Infinity, units)
    .filter((cell) => targetsFrom(cell).length > 0)
    .map((cell) => ({ cell, steps: grid.getPath(enemy.pos, cell, units)!.length - 1 }));

  let goal: GridCoord | undefined;
  if (firingCells.length > 0) {
    const nearestSteps = firingCells[0].steps;
    if (isRangedKiter) {
      const now = firingCells.filter((f) => f.steps <= enemy.moveRange);
      goal = minBy(now.length > 0 ? now : firingCells, (f) =>
        distanceToNearest(f.cell) >= RANGED_SAFE_DISTANCE ? f.steps : f.steps + 100,
      )!.cell;
    } else if (enemy.type === 'armored-skeleton') {
      const nearest = firingCells.filter((f) => f.steps === nearestSteps);
      goal = minBy(nearest, (f) => -targetsFrom(f.cell).length)!.cell;
    } else if (enemy.type === 'goblin-scout') {
      goal = minBy(firingCells, (f) => {
        const minTargetHp = Math.min(...targetsFrom(f.cell).map((t) => t.hp));
        return minTargetHp * 1000 + f.steps;
      })!.cell;
    } else {
      goal = firingCells[0].cell;
    }
  } else {
    const reachable = grid.getReachableCells(enemy.pos, enemy.moveRange, units);
    if (enemy.type === 'goblin-scout') {
      const weakest = minBy(targets, (t) => t.hp * 100 + manhattan(enemy.pos, t.pos))!;
      const distToWeakest = (cell: GridCoord) => manhattan(cell, weakest.pos);
      const closest = minBy(reachable, distToWeakest);
      if (closest && distToWeakest(closest) < distToWeakest(enemy.pos)) goal = closest;
    } else {
      const closest = minBy(reachable, distanceToNearest);
      if (closest && distanceToNearest(closest) < distanceToNearest(enemy.pos)) goal = closest;
    }
  }
  if (!goal) return null;

  return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
}
