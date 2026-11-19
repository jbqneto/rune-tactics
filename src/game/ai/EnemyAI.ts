import { ASHEN_GUARDIAN_PHASE_ATTACKS } from '../../config/gameConfig';
import type { AttackKind, GridCoord, SkillId, UnitState } from '../../shared/types';
import { fortitudeResistance } from '../attributes/AttributeSystem';
import { canReach, computeDamage, getSkill } from '../combat/CombatSystem';
import { GridSystem, manhattan, sameCell } from '../grid/GridSystem';

export type EnemyAction =
  | { type: 'attack'; target: UnitState }
  | { type: 'move'; path: GridCoord[] }
  | { type: 'defend' }
  | { type: 'skill'; skillId: SkillId; targetCell: GridCoord }
  | {
      type: 'prepareAttack';
      skillName: string;
      targetCells: GridCoord[];
      basePower: number;
      attackKind: AttackKind;
      cooldown: number;
    };

/** Distance that ranged units (archer, cultist, and acolyte) try to keep from targets. */
const RANGED_SAFE_DISTANCE = 2;

/** First element with the lowest score; on ties, preserves list order. */
function minBy<T>(items: readonly T[], score: (item: T) => number): T | undefined {
  let best: T | undefined;
  let bestScore = Infinity;
  for (const item of items) {
    const s = score(item);
    if (s < bestScore) [best, bestScore] = [item, s];
  }
  return best;
}

/** First element according to a deterministic comparator (< 0 means `a` is better than `b`). */
function bestBy<T>(items: readonly T[], compare: (a: T, b: T) => number): T | undefined {
  let best: T | undefined;
  for (const item of items) {
    if (best === undefined || compare(item, best) < 0) best = item;
  }
  return best;
}

/** Telegraphed attack area for the `ashen-guardian` boss: cross in Phase 1, 3x3 in Phase 2. */
export function getBossAttackArea(center: GridCoord, bossPhase: 1 | 2, grid: GridSystem): GridCoord[] {
  if (!grid.isInBounds(center)) return [];
  if (bossPhase === 1) {
    return [{ x: center.x, y: center.y }, ...grid.getNeighbors(center)];
  }
  const cells: GridCoord[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cell = { x: center.x + dx, y: center.y + dy };
      if (grid.isInBounds(cell)) cells.push(cell);
    }
  }
  return cells;
}

function nextRangedKiterAction(
  enemy: UnitState,
  targets: readonly UnitState[],
  units: readonly UnitState[],
  grid: GridSystem,
): EnemyAction | null {
  const targetsFrom = (cell: GridCoord) => targets.filter((t) => canReach(cell, t.pos, enemy.attackRange, grid));
  const distanceToNearest = (cell: GridCoord) => Math.min(...targets.map((t) => manhattan(cell, t.pos)));

  const inRange = targetsFrom(enemy.pos);
  if (inRange.length > 0) {
    const target = minBy(inRange, (t) => t.hp * 100 + manhattan(enemy.pos, t.pos))!;
    return { type: 'attack', target };
  }
  if (enemy.hasMoved) return null;

  const firingCells = grid
    .getReachableCells(enemy.pos, Infinity, units)
    .filter((cell) => targetsFrom(cell).length > 0)
    .map((cell) => ({ cell, steps: grid.getPath(enemy.pos, cell, units)!.length - 1 }));

  let goal: GridCoord | undefined;
  if (firingCells.length > 0) {
    const now = firingCells.filter((f) => f.steps <= enemy.moveRange);
    goal = minBy(now.length > 0 ? now : firingCells, (f) =>
      distanceToNearest(f.cell) >= RANGED_SAFE_DISTANCE ? f.steps : f.steps + 100,
    )!.cell;
  } else {
    const reachable = grid.getReachableCells(enemy.pos, enemy.moveRange, units);
    const closest = minBy(reachable, distanceToNearest);
    if (closest && distanceToNearest(closest) < distanceToNearest(enemy.pos)) goal = closest;
  }
  if (!goal) return null;

  return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
}

function nextGoblinStalkerAction(
  enemy: UnitState,
  targets: readonly UnitState[],
  units: readonly UnitState[],
  grid: GridSystem,
): EnemyAction | null {
  const totalDefense = (t: UnitState) => t.baseArmor + fortitudeResistance(t.attributes.fort);
  const compareTarget = (a: UnitState, b: UnitState) =>
    a.hp - b.hp ||
    totalDefense(a) - totalDefense(b) ||
    manhattan(enemy.pos, a.pos) - manhattan(enemy.pos, b.pos);

  const targetsFrom = (cell: GridCoord) => targets.filter((t) => canReach(cell, t.pos, enemy.attackRange, grid));
  const inRange = targetsFrom(enemy.pos);

  if (inRange.length > 0) {
    const killable = inRange.filter(
      (t) => computeDamage(enemy, t, enemy.basePower, enemy.attackKind) >= t.hp,
    );
    const target =
      killable.length > 0
        ? bestBy(killable, (a, b) => b.damage - a.damage || compareTarget(a, b))!
        : bestBy(inRange, compareTarget)!;
    return { type: 'attack', target };
  }
  if (enemy.hasMoved) return null;

  const firingCells = grid
    .getReachableCells(enemy.pos, Infinity, units)
    .filter((cell) => targetsFrom(cell).length > 0)
    .map((cell) => {
      const cellTargets = targetsFrom(cell);
      const bestTarget = bestBy(cellTargets, compareTarget)!;
      const adjacentHeroes = targets.filter((t) => manhattan(t.pos, cell) === 1).length;
      return {
        cell,
        steps: grid.getPath(enemy.pos, cell, units)!.length - 1,
        bestTarget,
        adjacentHeroes,
      };
    });

  let goal: GridCoord | undefined;
  if (firingCells.length > 0) {
    const withinRange = firingCells.filter((f) => f.steps <= enemy.moveRange);
    const pool = withinRange.length > 0 ? withinRange : firingCells;
    goal = bestBy(
      pool,
      (a, b) =>
        compareTarget(a.bestTarget, b.bestTarget) ||
        a.steps - b.steps ||
        a.adjacentHeroes - b.adjacentHeroes,
    )!.cell;
  } else {
    const priorityTarget = bestBy(targets, compareTarget)!;
    const reachable = grid.getReachableCells(enemy.pos, enemy.moveRange, units);
    const distToPriority = (cell: GridCoord) => manhattan(cell, priorityTarget.pos);
    const closest = minBy(reachable, distToPriority);
    if (closest && distToPriority(closest) < distToPriority(enemy.pos)) goal = closest;
  }
  if (!goal) return null;

  return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
}

function nextShieldbearerAction(
  enemy: UnitState,
  targets: readonly UnitState[],
  units: readonly UnitState[],
  grid: GridSystem,
): EnemyAction | null {
  const targetsFrom = (cell: GridCoord) => targets.filter((t) => canReach(cell, t.pos, enemy.attackRange, grid));
  const distanceToNearest = (cell: GridCoord) => Math.min(...targets.map((t) => manhattan(cell, t.pos)));
  const inRange = targetsFrom(enemy.pos);

  if (inRange.length > 0) {
    const killable = inRange.filter(
      (t) => computeDamage(enemy, t, enemy.basePower, enemy.attackKind) >= t.hp,
    );
    if (killable.length > 0) {
      const target = minBy(killable, (t) => t.hp * 100 + manhattan(enemy.pos, t.pos))!;
      return { type: 'attack', target };
    }
    if (!enemy.isGuarding && (enemy.hp <= Math.floor(enemy.maxHp * 0.5) || inRange.length >= 2)) {
      return { type: 'defend' };
    }
    const target = minBy(inRange, (t) => manhattan(enemy.pos, t.pos) * 100 + t.hp)!;
    return { type: 'attack', target };
  }

  if (!enemy.hasMoved) {
    const rangedAllies = units.filter(
      (u) => u.alive && u.team === enemy.team && u.id !== enemy.id && u.attackRange > 1,
    );
    const distToRangedAlly = (cell: GridCoord) =>
      rangedAllies.length === 0 ? 0 : Math.min(...rangedAllies.map((a) => manhattan(cell, a.pos)));

    const firingCells = grid
      .getReachableCells(enemy.pos, Infinity, units)
      .filter((cell) => targetsFrom(cell).length > 0)
      .map((cell) => ({ cell, steps: grid.getPath(enemy.pos, cell, units)!.length - 1 }));

    let goal: GridCoord | undefined;
    if (firingCells.length > 0) {
      const nearestSteps = firingCells[0].steps;
      const nearest = firingCells.filter((f) => f.steps === nearestSteps);
      goal = bestBy(
        nearest,
        (a, b) =>
          targetsFrom(b.cell).length - targetsFrom(a.cell).length ||
          distToRangedAlly(a.cell) - distToRangedAlly(b.cell),
      )!.cell;
    } else {
      const reachable = grid.getReachableCells(enemy.pos, enemy.moveRange, units);
      const closest = minBy(reachable, distanceToNearest);
      if (closest && distanceToNearest(closest) < distanceToNearest(enemy.pos)) goal = closest;
    }
    if (goal) {
      return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
    }
  }

  if (!enemy.isGuarding && targets.some((t) => manhattan(enemy.pos, t.pos) <= 4)) {
    return { type: 'defend' };
  }
  return null;
}

function nextNecromancerAcolyteAction(
  enemy: UnitState,
  targets: readonly UnitState[],
  units: readonly UnitState[],
  grid: GridSystem,
): EnemyAction | null {
  const skill = getSkill(enemy);
  if (skill && enemy.skillCooldown === 0) {
    const healCandidates = units.filter(
      (u) =>
        u.alive &&
        u.team === enemy.team &&
        u.hp < u.maxHp &&
        (u.type === 'ashen-guardian' || u.hp <= Math.floor(u.maxHp * 0.75)),
    );
    const priorityAlly = bestBy(healCandidates, (a, b) => {
      const aBoss = a.type === 'ashen-guardian' ? 0 : 1;
      const bBoss = b.type === 'ashen-guardian' ? 0 : 1;
      return (
        aBoss - bBoss ||
        a.hp / a.maxHp - b.hp / b.maxHp ||
        manhattan(enemy.pos, a.pos) - manhattan(enemy.pos, b.pos)
      );
    });

    if (priorityAlly) {
      if (canReach(enemy.pos, priorityAlly.pos, skill.range, grid)) {
        return { type: 'skill', skillId: skill.id, targetCell: { ...priorityAlly.pos } };
      }
      if (!enemy.hasMoved) {
        const distanceToNearest = (cell: GridCoord) => Math.min(...targets.map((t) => manhattan(cell, t.pos)));
        const healCells = grid
          .getReachableCells(enemy.pos, enemy.moveRange, units)
          .filter((cell) => canReach(cell, priorityAlly.pos, skill.range, grid))
          .map((cell) => ({ cell, steps: grid.getPath(enemy.pos, cell, units)!.length - 1 }));
        if (healCells.length > 0) {
          const goal = minBy(healCells, (f) =>
            distanceToNearest(f.cell) >= RANGED_SAFE_DISTANCE ? f.steps : f.steps + 100,
          )!.cell;
          return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
        }
      }
    }
  }

  return nextRangedKiterAction(enemy, targets, units, grid);
}

function nextAshenGuardianAction(
  enemy: UnitState,
  targets: readonly UnitState[],
  units: readonly UnitState[],
  grid: GridSystem,
): EnemyAction | null {
  const bossPhase: 1 | 2 = enemy.bossPhase ?? 1;
  const phaseAttack = ASHEN_GUARDIAN_PHASE_ATTACKS[bossPhase];

  if (enemy.skillCooldown === 0) {
    const candidates: {
      center: GridCoord;
      area: GridCoord[];
      hitCount: number;
      hpSum: number;
      dist: number;
    }[] = [];

    for (let y = 0; y < grid.size; y++) {
      for (let x = 0; x < grid.size; x++) {
        const center = { x, y };
        if (grid.isObstacle(center)) continue;
        const dist = manhattan(enemy.pos, center);
        if (dist > phaseAttack.range) continue;
        const area = getBossAttackArea(center, bossPhase, grid);
        const hits = targets.filter((h) => area.some((a) => sameCell(a, h.pos)));
        if (hits.length === 0) continue;
        const hpSum = hits.reduce((acc, h) => acc + h.hp, 0);
        candidates.push({ center, area, hitCount: hits.length, hpSum, dist });
      }
    }

    if (candidates.length > 0) {
      const best = bestBy(
        candidates,
        (a, b) =>
          b.hitCount - a.hitCount ||
          a.hpSum - b.hpSum ||
          a.dist - b.dist ||
          a.center.y - b.center.y ||
          a.center.x - b.center.x,
      )!;
      return {
        type: 'prepareAttack',
        skillName: phaseAttack.skillName,
        targetCells: best.area,
        basePower: phaseAttack.basePower,
        attackKind: phaseAttack.attackKind,
        cooldown: phaseAttack.cooldown,
      };
    }
  }

  const targetsFrom = (cell: GridCoord) => targets.filter((t) => canReach(cell, t.pos, enemy.attackRange, grid));
  const inRange = targetsFrom(enemy.pos);
  if (inRange.length > 0) {
    const killable = inRange.filter(
      (t) => computeDamage(enemy, t, enemy.basePower, enemy.attackKind) >= t.hp,
    );
    const target =
      killable.length > 0 ? minBy(killable, (t) => t.hp)! : minBy(inRange, (t) => t.hp)!;
    return { type: 'attack', target };
  }
  if (enemy.hasMoved) return null;

  const firingCells = grid
    .getReachableCells(enemy.pos, Infinity, units)
    .filter((cell) => targetsFrom(cell).length > 0);

  let goal: GridCoord | undefined;
  if (firingCells.length > 0) {
    goal = firingCells[0];
  } else {
    const distanceToNearest = (cell: GridCoord) => Math.min(...targets.map((t) => manhattan(cell, t.pos)));
    const reachable = grid.getReachableCells(enemy.pos, enemy.moveRange, units);
    const closest = minBy(reachable, distanceToNearest);
    if (closest && distanceToNearest(closest) < distanceToNearest(enemy.pos)) goal = closest;
  }
  if (!goal) return null;

  return { type: 'move', path: grid.getPath(enemy.pos, goal, units)!.slice(0, enemy.moveRange + 1) };
}

/**
 * Next step for the enemy in the current activation, or `null` if it has nothing left to do.
 * Does not mutate anything: the engine applies the action.
 */
export function nextEnemyAction(enemy: UnitState, units: readonly UnitState[], grid: GridSystem): EnemyAction | null {
  if (!enemy.alive || enemy.hasAttacked) return null;
  const targets = units.filter((u) => u.alive && u.team !== enemy.team);
  if (targets.length === 0) return null;

  switch (enemy.type) {
    case 'goblin-stalker':
      return nextGoblinStalkerAction(enemy, targets, units, grid);
    case 'skeleton-shieldbearer':
      return nextShieldbearerAction(enemy, targets, units, grid);
    case 'necromancer-acolyte':
      return nextNecromancerAcolyteAction(enemy, targets, units, grid);
    case 'ashen-guardian':
      return nextAshenGuardianAction(enemy, targets, units, grid);
    case 'skeleton-archer':
    case 'cultist-mage':
      return nextRangedKiterAction(enemy, targets, units, grid);
  }

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

  const firingCells = grid
    .getReachableCells(enemy.pos, Infinity, units)
    .filter((cell) => targetsFrom(cell).length > 0)
    .map((cell) => ({ cell, steps: grid.getPath(enemy.pos, cell, units)!.length - 1 }));

  let goal: GridCoord | undefined;
  if (firingCells.length > 0) {
    const nearestSteps = firingCells[0].steps;
    if (enemy.type === 'armored-skeleton') {
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
