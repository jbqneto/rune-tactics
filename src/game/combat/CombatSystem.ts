import { SKILLS, type SkillDef } from '../../config/gameConfig';
import type { AttackKind, GameEvent, GridCoord, PendingAttack, UnitState } from '../../shared/types';
import {
  fortitudeResistance,
  getAttributeForAttack,
  offensiveBonus,
} from '../attributes/AttributeSystem';
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

/**
 * Fórmula centralizada de dano da V4:
 * `attackPower = basePower + offensiveBonus(mainAttr)`
 * `totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort)`
 * `damageBeforeGuard = max(1, attackPower - totalDefense)`
 * Se `target.isGuarding`, reduz em 50% arredondado para cima, com piso 1.
 */
export function computeDamage(
  attacker: Pick<UnitState, 'attributes'>,
  target: Pick<UnitState, 'baseArmor' | 'attributes' | 'isGuarding'>,
  basePower: number,
  attackKind: AttackKind,
): number {
  const mainAttr = getAttributeForAttack(attacker.attributes, attackKind);
  const attackPower = basePower + offensiveBonus(mainAttr);
  const totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort);
  const damageBeforeGuard = Math.max(1, attackPower - totalDefense);
  return target.isGuarding ? Math.max(1, Math.ceil(damageBeforeGuard * 0.5)) : damageBeforeGuard;
}

/** Calcula e aplica dano ao alvo, devolvendo `unitAttacked` e, se ele morreu, `unitDied` (ou `bossPhaseChanged`). */
function applyDamage(
  attacker: UnitState,
  target: UnitState,
  basePower: number,
  attackKind: AttackKind,
  extra: Pick<Extract<GameEvent, { type: 'unitAttacked' }>, 'isRanged' | 'skillId' | 'pendingAttackId'>,
): GameEvent[] {
  const wasGuarded = target.isGuarding;
  const finalDamage = computeDamage(attacker, target, basePower, attackKind);
  target.hp = Math.max(0, target.hp - finalDamage);
  const events: GameEvent[] = [
    {
      type: 'unitAttacked',
      attackerId: attacker.id,
      targetId: target.id,
      damage: finalDamage,
      targetHpRemaining: target.hp,
      ...(wasGuarded ? { wasGuarded: true } : {}),
      ...extra,
    },
  ];
  if (target.hp === 0) {
    target.alive = false;
    target.isGuarding = false;
    events.push({ type: 'unitDied', unitId: target.id });
  } else if (
    target.type === 'ashen-guardian' &&
    target.bossPhase === 1 &&
    target.hp <= Math.floor(target.maxHp * 0.5)
  ) {
    target.bossPhase = 2;
    target.moveRange += 1;
    events.push({
      type: 'bossPhaseChanged',
      unitId: target.id,
      phase: 2,
      newMoveRange: target.moveRange,
    });
  }
  return events;
}

/** Ativa a postura defensiva unificada (50% de mitigação até a próxima ativação da própria unidade). */
export function resolveDefend(unit: UnitState): GameEvent[] {
  unit.hasAttacked = true;
  unit.isGuarding = true;
  return [{ type: 'unitGuarded', unitId: unit.id }];
}

/** Aplica o ataque básico nas duas unidades. Quem chama valida antes com `canAttack`. */
export function resolveAttack(attacker: UnitState, target: UnitState): GameEvent[] {
  attacker.hasAttacked = true;
  return applyDamage(attacker, target, attacker.basePower, attacker.attackKind, {
    isRanged: attacker.attackRange > 1,
  });
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
    const healPower = skill.heal + offensiveBonus(caster.attributes.int);
    const healEvents: GameEvent[] = affected.map((ally) => {
      const amount = Math.min(healPower, ally.maxHp - ally.hp);
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

  const attackKind = skill.attackKind ?? caster.attackKind;
  return [
    skillEvent,
    ...affected.flatMap((victim) =>
      applyDamage(caster, victim, skill.damage, attackKind, {
        isRanged: skill.range > 1,
        skillId: skill.id,
      }),
    ),
  ];
}

/** Resolve um ataque anunciado (`PendingAttack`) no início da próxima ativação do conjurador vivo. */
export function resolvePendingAttack(
  pending: PendingAttack,
  caster: UnitState,
  units: readonly UnitState[],
): GameEvent[] {
  const affected = units.filter(
    (u) => u.alive && u.team !== caster.team && pending.targetCells.some((c) => sameCell(c, u.pos)),
  );
  const resolvedEvent: GameEvent = {
    type: 'pendingAttackResolved',
    pendingAttackId: pending.id,
    casterId: caster.id,
    skillName: pending.skillName,
    targetCells: pending.targetCells.map((c) => ({ x: c.x, y: c.y })),
    affectedUnitIds: affected.map((u) => u.id),
  };

  const damageEvents = affected.flatMap((victim) =>
    applyDamage(caster, victim, pending.basePower, pending.attackKind, {
      pendingAttackId: pending.id,
    }),
  );
  const attackedEvents = damageEvents.filter((e) => e.type === 'unitAttacked');
  const otherEvents = damageEvents.filter((e) => e.type !== 'unitAttacked');

  return [resolvedEvent, ...attackedEvents, ...otherEvents];
}
