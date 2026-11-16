import { SKILLS, type SkillDef } from '../../config/gameConfig';
import type { GameEvent, GridCoord, UnitState } from '../../shared/types';
import { GridSystem, manhattan, sameCell } from '../grid/GridSystem';

/** De `from`, dá para acertar `to` com esse alcance? Acima de 1, exige linha de visão. */
export function canReach(from: GridCoord, to: GridCoord, range: number, grid: GridSystem): boolean {
  return manhattan(from, to) <= range && (range <= 1 || grid.hasLineOfSight(from, to));
}

export function canAttack(attacker: UnitState, target: UnitState, grid: GridSystem): boolean {
  return (
    attacker.alive &&
    !attacker.hasAttacked &&
    target.alive &&
    target.team !== attacker.team &&
    canReach(attacker.pos, target.pos, attacker.attackRange, grid)
  );
}

/** Tira HP do alvo e devolve `unitAttacked` e, se ele morreu, `unitDied`. */
function applyDamage(
  attacker: UnitState,
  target: UnitState,
  damage: number,
  extra: Pick<Extract<GameEvent, { type: 'unitAttacked' }>, 'isRanged' | 'skillId'>,
): GameEvent[] {
  target.hp = Math.max(0, target.hp - damage);
  const events: GameEvent[] = [
    {
      type: 'unitAttacked',
      attackerId: attacker.id,
      targetId: target.id,
      damage,
      targetHpRemaining: target.hp,
      ...extra,
    },
  ];
  if (target.hp === 0) {
    target.alive = false;
    events.push({ type: 'unitDied', unitId: target.id });
  }
  return events;
}

/** Aplica o ataque básico nas duas unidades. Quem chama valida antes com `canAttack`. */
export function resolveAttack(attacker: UnitState, target: UnitState): GameEvent[] {
  attacker.hasAttacked = true;
  return applyDamage(attacker, target, attacker.damage, { isRanged: attacker.attackRange > 1 });
}

export function getSkill(unit: UnitState): SkillDef | null {
  return unit.skillId ? SKILLS[unit.skillId] : null;
}

/** Células atingidas pela habilidade lançada em `targetCell`, dentro da grade. */
export function getSkillAreaCells(skill: SkillDef, targetCell: GridCoord, grid: GridSystem): GridCoord[] {
  if (!grid.isInBounds(targetCell)) return [];
  const center = { x: targetCell.x, y: targetCell.y };
  return skill.area === 'cross' ? [center, ...grid.getNeighbors(center)] : [center];
}

/** Alvos válidos para a habilidade na área: inimigos vivos (para dano) ou aliados vivos feridos (para cura). */
function getSkillAffectedUnits(
  caster: UnitState,
  skill: SkillDef,
  targetCell: GridCoord,
  units: readonly UnitState[],
  grid: GridSystem,
): UnitState[] {
  const area = getSkillAreaCells(skill, targetCell, grid);
  if (skill.targetTeam === 'ally') {
    return units.filter(
      (u) => u.alive && u.team === caster.team && u.hp < u.maxHp && area.some((c) => sameCell(c, u.pos)),
    );
  }
  return units.filter((u) => u.alive && u.team !== caster.team && area.some((c) => sameCell(c, u.pos)));
}

/** A célula é um alvo válido: ao alcance, com linha de visão se preciso, e com algum alvo válido na área. */
export function isValidSkillTarget(
  caster: UnitState,
  skill: SkillDef,
  targetCell: GridCoord,
  units: readonly UnitState[],
  grid: GridSystem,
): boolean {
  if (!grid.isInBounds(targetCell) || grid.isObstacle(targetCell)) return false;
  if (skill.targetTeam === 'enemy' && sameCell(targetCell, caster.pos)) return false;
  return (
    canReach(caster.pos, targetCell, skill.range, grid) &&
    getSkillAffectedUnits(caster, skill, targetCell, units, grid).length > 0
  );
}

/** Células onde a unidade pode lançar a habilidade agora. */
export function getSkillTargetCells(caster: UnitState, units: readonly UnitState[], grid: GridSystem): GridCoord[] {
  const skill = getSkill(caster);
  if (!skill || !caster.alive || caster.hasAttacked || caster.skillCooldown > 0) return [];
  const cells: GridCoord[] = [];
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (isValidSkillTarget(caster, skill, { x, y }, units, grid)) cells.push({ x, y });
    }
  }
  return cells;
}

/** Aplica a habilidade. Quem chama valida antes com `isValidSkillTarget`. */
export function resolveSkill(
  caster: UnitState,
  skill: SkillDef,
  targetCell: GridCoord,
  units: readonly UnitState[],
  grid: GridSystem,
): GameEvent[] {
  const affected = getSkillAffectedUnits(caster, skill, targetCell, units, grid);
  caster.hasAttacked = true;
  caster.skillCooldown = skill.cooldown;

  const skillEvent: GameEvent = {
    type: 'skillUsed',
    casterId: caster.id,
    skillId: skill.id,
    targetCell: { x: targetCell.x, y: targetCell.y },
    affectedUnitIds: affected.map((u) => u.id),
  };

  if (skill.targetTeam === 'ally') {
    const healEvents: GameEvent[] = affected.map((ally) => {
      const amount = Math.min(skill.heal, ally.maxHp - ally.hp);
      ally.hp += amount;
      return {
        type: 'unitHealed',
        casterId: caster.id,
        targetId: ally.id,
        amount,
        targetHpAfter: ally.hp,
      };
    });
    return [skillEvent, ...healEvents];
  }

  return [
    skillEvent,
    ...affected.flatMap((victim) =>
      applyDamage(caster, victim, skill.damage, { isRanged: skill.range > 1, skillId: skill.id }),
    ),
  ];
}
