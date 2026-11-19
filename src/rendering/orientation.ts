import type { UnitState } from '../shared/types';

/**
 * Finds the nearest living enemy by Manhattan grid distance.
 * Ties are broken by order in `turnOrder` (or `units` if omitted).
 */
export function findNearestLivingEnemy(
  unit: Pick<UnitState, 'pos'>,
  units: readonly UnitState[],
  turnOrder?: readonly string[]
): UnitState | null {
  const orderIndex = turnOrder
    ? new Map<string, number>(turnOrder.map((id, idx) => [id, idx]))
    : null;

  let best: UnitState | null = null;
  let bestDist = Infinity;
  let bestOrder = Infinity;

  for (let i = 0; i < units.length; i++) {
    const candidate = units[i];
    if (candidate.team !== 'enemy' || !candidate.alive) continue;

    const dist =
      Math.abs(candidate.pos.x - unit.pos.x) +
      Math.abs(candidate.pos.y - unit.pos.y);
    const order = orderIndex ? (orderIndex.get(candidate.id) ?? Infinity) : i;

    if (
      dist < bestDist ||
      (dist === bestDist && order < bestOrder)
    ) {
      best = candidate;
      bestDist = dist;
      bestOrder = order;
    }
  }

  return best;
}

/** Computes the yaw angle in the 3D world XZ plane (camera-independent). */
export function computeWorldYaw(
  from: { x: number; z: number },
  to: { x: number; z: number }
): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

/** Returns the shortest angular arc between `from` and `to`, normalized to `[-Math.PI, Math.PI]`. */
export function shortestAngleDelta(from: number, to: number): number {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
