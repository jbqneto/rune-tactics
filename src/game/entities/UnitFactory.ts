import { INITIAL_UNITS, SKILLS, UNIT_STATS, type UnitSpawn } from '../../config/gameConfig';
import type { CampaignHeroProgress, UnitState } from '../../shared/types';
import { calcMaxHp, computeUnitArmor, computeUnitDamage } from '../attributes/AttributeSystem';

export function createUnit(spawn: UnitSpawn, override?: CampaignHeroProgress): UnitState {
  const stats = UNIT_STATS[spawn.type];
  const attributes = override ? { ...override.attributes } : { ...stats.attributes };
  const maxHp = calcMaxHp(stats.baseHp, attributes.fort);
  const hp = override ? Math.min(maxHp, Math.max(1, override.hp)) : maxHp;
  const damage = computeUnitDamage(stats.basePower, attributes, stats.attackKind);
  const armor = computeUnitArmor(stats.baseArmor, attributes.fort);

  return {
    id: spawn.id,
    name: stats.name,
    type: spawn.type,
    team: spawn.team,
    pos: { ...spawn.pos },
    hp,
    maxHp,
    attributes,
    baseHp: stats.baseHp,
    baseArmor: stats.baseArmor,
    basePower: stats.basePower,
    attackKind: stats.attackKind,
    damage,
    armor,
    moveRange: stats.moveRange,
    attackRange: stats.attackRange,
    alive: true,
    hasMoved: false,
    hasAttacked: false,
    hasActivatedThisRound: false,
    skillId: stats.skillId,
    skillName: stats.skillId ? SKILLS[stats.skillId].name : null,
    skillCooldown: 0,
    isGuarding: false,
    ...(spawn.type === 'ashen-guardian' ? { bossPhase: 1 as const } : {}),
    portraitPath: stats.portraitPath,
  };
}

export function createUnits(
  spawns: readonly UnitSpawn[] = INITIAL_UNITS,
  heroOverrides?: readonly CampaignHeroProgress[],
): UnitState[] {
  return spawns.map((spawn) => {
    const override =
      heroOverrides && spawn.team === 'player'
        ? heroOverrides.find((h) => h.id === spawn.id)
        : undefined;
    return createUnit(spawn, override);
  });
}
