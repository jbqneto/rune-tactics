import type { GridCoord, ObstacleDef, ObstacleKind, SkillId, Team, UnitType } from '../shared/types';

export const GRID_SIZE = 12;

const obstacles = (kind: ObstacleKind, blocksLos: boolean, cells: [number, number][]): ObstacleDef[] =>
  cells.map(([x, y]) => ({ pos: { x, y }, kind, blocksLos }));

/**
 * Arena 12x12. Os heróis começam no sul (linhas 0 e 1) e os inimigos no norte (linhas 9 a 11).
 *
 *   11  . . S . . . C . . . . .     # parede   (bloqueia movimento e visão)
 *   10  . . . M . A . . M . . .     O pilar    (bloqueia movimento e visão)
 *    9  . . . O . . c . O . G .     c caixote  (bloqueia só movimento)
 *    8  . b . . . . . . . . c .     b barril   (bloqueia só movimento)
 *    7  . . . . . . . . . . . .
 *    6  # # . . # # # # . # # #     portão oeste (x=2,3) e passagem estreita leste (x=8)
 *    5  . . . . . . . . . . . .
 *    4  . . . . . c c . . . . .     barricada baixa no centro do pátio sul
 *    3  . . . O . . . . O . . .
 *    2  . . . . . . . . . . b .
 *    1  . . . . K . H . . . . .
 *    0  . . R . . . . W . . . .
 *       0 1 2 3 4 5 6 7 8 9 10 11
 */
export const OBSTACLES: ObstacleDef[] = [
  // Muralha central: divide a arena e deixa duas passagens.
  ...obstacles('wall', true, [
    [0, 6],
    [1, 6],
    [4, 6],
    [5, 6],
    [6, 6],
    [7, 6],
    [9, 6],
    [10, 6],
    [11, 6],
  ]),
  // Colunas: cobertura total nos dois pátios.
  ...obstacles('pillar', true, [
    [3, 3],
    [8, 3],
    [3, 9],
    [8, 9],
  ]),
  // Barreiras baixas: seguram o avanço, mas dá para atirar por cima.
  ...obstacles('crate', false, [
    [5, 4],
    [6, 4],
    [6, 9],
    [10, 8],
  ]),
  ...obstacles('barrel', false, [
    [10, 2],
    [1, 8],
  ]),
];

export interface SkillDef {
  id: SkillId;
  name: string;
  /** Quem a habilidade afeta. 'ally' inclui o próprio lançador. */
  targetTeam: 'enemy' | 'ally';
  /** Dano em cada inimigo atingido. 0 para habilidades de cura. */
  damage: number;
  /** HP devolvido ao aliado, até o `maxHp` dele. 0 para habilidades de dano. */
  heal: number;
  /** Distância de Manhattan máxima até a célula alvo. Acima de 1, exige linha de visão. */
  range: number;
  /** Rodadas até poder usar de novo. */
  cooldown: number;
  /** 'cross' atinge a célula alvo e as quatro ortogonalmente adjacentes. */
  area: 'single' | 'cross';
  icon?: string;
}

export const SKILLS: Record<SkillId, SkillDef> = {
  'runic-strike': {
    id: 'runic-strike',
    name: 'Runic Strike',
    targetTeam: 'enemy',
    damage: 3,
    heal: 0,
    range: 1,
    cooldown: 2,
    area: 'single',
    icon: '/assets/icons/runic-strike.png',
  },
  'marked-shot': {
    id: 'marked-shot',
    name: 'Marked Shot',
    targetTeam: 'enemy',
    damage: 3,
    heal: 0,
    range: 3,
    cooldown: 2,
    area: 'single',
    icon: '/assets/icons/marked-shot.svg',
  },
  'arcane-burst': {
    id: 'arcane-burst',
    name: 'Arcane Burst',
    targetTeam: 'enemy',
    damage: 2,
    heal: 0,
    range: 3,
    cooldown: 3,
    area: 'cross',
    icon: '/assets/icons/arcane-burst.svg',
  },
  'healing-light': {
    id: 'healing-light',
    name: 'Healing Light',
    targetTeam: 'ally',
    damage: 0,
    heal: 3,
    range: 3,
    cooldown: 2,
    area: 'single',
    icon: '/assets/icons/healing-light.svg',
  },
};

export interface UnitStats {
  name: string;
  maxHp: number;
  damage: number;
  moveRange: number;
  attackRange: number;
  skillId: SkillId | null;
  portraitPath?: string;
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  knight: {
    name: 'Guerreiro',
    maxHp: 10,
    damage: 2,
    moveRange: 3,
    attackRange: 1,
    skillId: 'runic-strike',
    portraitPath: '/assets/portraits/knight.png',
  },
  archer: {
    name: 'Arqueira',
    maxHp: 8,
    damage: 2,
    moveRange: 3,
    attackRange: 3,
    skillId: 'marked-shot',
    portraitPath: '/assets/portraits/archer.png',
  },
  mage: {
    name: 'Mago',
    maxHp: 7,
    damage: 1,
    moveRange: 2,
    attackRange: 2,
    skillId: 'arcane-burst',
    portraitPath: '/assets/portraits/mage.png',
  },
  cleric: {
    name: 'Clérigo',
    maxHp: 9,
    damage: 2,
    moveRange: 2,
    attackRange: 1,
    skillId: 'healing-light',
    portraitPath: '/assets/portraits/cleric.svg',
  },
  'melee-skeleton': {
    name: 'Melee Skeleton',
    maxHp: 5,
    damage: 1,
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/melee-skeleton.png',
  },
  'skeleton-archer': {
    name: 'Skeleton Archer',
    maxHp: 4,
    damage: 1,
    moveRange: 2,
    attackRange: 3,
    skillId: null,
    portraitPath: '/assets/portraits/skeleton-archer.png',
  },
  'armored-skeleton': {
    name: 'Armored Skeleton',
    maxHp: 8,
    damage: 2,
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/armored-skeleton.png',
  },
  'goblin-scout': {
    name: 'Goblin Scout',
    maxHp: 4,
    damage: 1,
    moveRange: 4,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/goblin-scout.svg',
  },
  'cultist-mage': {
    name: 'Cultist Mage',
    maxHp: 5,
    damage: 2,
    moveRange: 2,
    attackRange: 3,
    skillId: null,
    portraitPath: '/assets/portraits/cultist-mage.svg',
  },
};

export interface UnitSpawn {
  id: string;
  type: UnitType;
  team: Team;
  pos: GridCoord;
}

/** A ordem da lista é a ordem em que os inimigos ativam e a seleção padrão do jogador. */
export const INITIAL_UNITS: UnitSpawn[] = [
  { id: 'knight-1', type: 'knight', team: 'player', pos: { x: 4, y: 1 } },
  { id: 'archer-1', type: 'archer', team: 'player', pos: { x: 2, y: 0 } },
  { id: 'mage-1', type: 'mage', team: 'player', pos: { x: 7, y: 0 } },
  { id: 'cleric-1', type: 'cleric', team: 'player', pos: { x: 6, y: 1 } },
  { id: 'goblin-scout-1', type: 'goblin-scout', team: 'enemy', pos: { x: 10, y: 9 } },
  { id: 'melee-skeleton-1', type: 'melee-skeleton', team: 'enemy', pos: { x: 3, y: 10 } },
  { id: 'melee-skeleton-2', type: 'melee-skeleton', team: 'enemy', pos: { x: 8, y: 10 } },
  { id: 'armored-skeleton-1', type: 'armored-skeleton', team: 'enemy', pos: { x: 5, y: 10 } },
  { id: 'skeleton-archer-1', type: 'skeleton-archer', team: 'enemy', pos: { x: 2, y: 11 } },
  { id: 'cultist-mage-1', type: 'cultist-mage', team: 'enemy', pos: { x: 6, y: 11 } },
];
