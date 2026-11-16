import { INITIAL_UNITS, SKILLS, UNIT_STATS, type UnitSpawn } from '../../config/gameConfig';
import type { UnitState } from '../../shared/types';

export function createUnit(spawn: UnitSpawn): UnitState {
  const { name, maxHp, damage, moveRange, attackRange, skillId, portraitPath } = UNIT_STATS[spawn.type];
  return {
    id: spawn.id,
    name,
    type: spawn.type,
    team: spawn.team,
    pos: { ...spawn.pos },
    hp: maxHp,
    maxHp,
    damage,
    moveRange,
    attackRange,
    alive: true,
    hasMoved: false,
    hasAttacked: false,
    hasActivatedThisRound: false,
    skillId,
    skillName: skillId ? SKILLS[skillId].name : null,
    skillCooldown: 0,
    portraitPath,
  };
}

export function createUnits(spawns: readonly UnitSpawn[] = INITIAL_UNITS): UnitState[] {
  return spawns.map(createUnit);
}
