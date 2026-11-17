import type {
  AttackKind,
  GridCoord,
  ObstacleDef,
  ObstacleKind,
  SkillId,
  StageConfig,
  StageUnitSpawn,
  Team,
  UnitAttributes,
  UnitType,
} from '../shared/types';

export const GRID_SIZE = 12;
export const MIN_ATTRIBUTE = 1;
export const MAX_ATTRIBUTE = 12;
export const ATTRIBUTE_BASE_THRESHOLD = 4;

export const CAMPAIGN_SURVIVOR_HEAL_RATIO = 0.35;
export const CAMPAIGN_REVIVE_HP_RATIO = 0.25;
export const CAMPAIGN_POINTS_PER_STAGE = 1;
export const CAMPAIGN_SAVE_KEY = 'rune_tactics_v4_save';
export const CAMPAIGN_SAVE_VERSION = 4;

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

export interface MapConfig {
  id: string;
  name: string;
  gridSize: number;
  obstacles: ObstacleDef[];
  playerSpawnRows: [number, number];
  enemySpawnRows: [number, number];
  theme?: 'ruins' | 'swamp' | 'fortress' | 'catacombs' | 'sanctuary';
  bridgeCells?: GridCoord[];
}

export const MAPS: MapConfig[] = [
  {
    id: 'ruins',
    name: 'Ruínas Atuais',
    gridSize: GRID_SIZE,
    obstacles: OBSTACLES,
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'fortress',
    name: 'Fortaleza Abandonada',
    gridSize: GRID_SIZE,
    obstacles: [
      ...obstacles('wall', true, [
        [2, 5],
        [3, 5],
        [4, 5],
        [7, 5],
        [8, 5],
        [9, 5],
        [2, 7],
        [3, 7],
        [8, 7],
        [9, 7],
      ]),
      ...obstacles('pillar', true, [
        [5, 3],
        [6, 3],
        [5, 8],
        [6, 8],
      ]),
      ...obstacles('crate', false, [
        [0, 5],
        [11, 5],
        [4, 8],
        [7, 8],
      ]),
      ...obstacles('barrel', false, [
        [1, 3],
        [10, 3],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'courtyard',
    name: 'Pátio das Ruínas',
    gridSize: GRID_SIZE,
    obstacles: [
      ...obstacles('pillar', true, [
        [3, 4],
        [8, 4],
        [3, 7],
        [8, 7],
      ]),
      ...obstacles('wall', true, [
        [5, 5],
        [6, 5],
      ]),
      ...obstacles('crate', false, [
        [1, 5],
        [10, 6],
        [4, 8],
        [7, 3],
      ]),
      ...obstacles('barrel', false, [
        [2, 3],
        [9, 8],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'catacombs',
    name: 'Catacumbas Cruzadas',
    gridSize: GRID_SIZE,
    obstacles: [
      ...obstacles('wall', true, [
        [2, 4],
        [2, 5],
        [2, 6],
        [2, 7],
        [9, 4],
        [9, 5],
        [9, 6],
        [9, 7],
        [4, 3],
        [7, 3],
        [4, 8],
        [7, 8],
      ]),
      ...obstacles('pillar', true, [
        [5, 5],
        [6, 6],
      ]),
      ...obstacles('crate', false, [
        [0, 6],
        [11, 5],
        [5, 2],
        [6, 9],
      ]),
      ...obstacles('barrel', false, [
        [1, 3],
        [10, 8],
        [3, 5],
        [8, 6],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'sanctuary',
    name: 'Santuário Rúnico',
    gridSize: GRID_SIZE,
    obstacles: [
      ...obstacles('wall', true, [
        [4, 5],
        [4, 6],
        [7, 5],
        [7, 6],
        [0, 4],
        [1, 4],
        [10, 7],
        [11, 7],
      ]),
      ...obstacles('pillar', true, [
        [2, 2],
        [9, 2],
        [2, 9],
        [9, 9],
        [5, 4],
        [6, 7],
      ]),
      ...obstacles('crate', false, [
        [3, 6],
        [8, 5],
        [5, 8],
        [6, 3],
      ]),
      ...obstacles('barrel', false, [
        [1, 8],
        [10, 3],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'gauntlet',
    name: 'Corredor da Forja',
    gridSize: GRID_SIZE,
    obstacles: [
      ...obstacles('wall', true, [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [8, 7],
        [9, 7],
        [10, 7],
        [11, 7],
        [5, 5],
        [6, 6],
      ]),
      ...obstacles('pillar', true, [
        [5, 2],
        [6, 9],
        [2, 7],
        [9, 4],
      ]),
      ...obstacles('crate', false, [
        [4, 3],
        [7, 4],
        [4, 7],
        [7, 8],
      ]),
      ...obstacles('barrel', false, [
        [1, 6],
        [10, 5],
        [3, 8],
        [8, 3],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'forgotten-swamp',
    name: 'Pântano Esquecido',
    gridSize: GRID_SIZE,
    theme: 'swamp',
    obstacles: [
      ...obstacles('water', false, [
        [0, 5],
        [1, 5],
        [3, 5],
        [4, 5],
        [7, 5],
        [8, 5],
        [10, 5],
        [11, 5],
        [0, 6],
        [1, 6],
        [3, 6],
        [4, 6],
        [7, 6],
        [8, 6],
        [10, 6],
        [11, 6],
      ]),
      ...obstacles('pillar', true, [
        [2, 2],
        [9, 2],
        [2, 9],
        [9, 9],
      ]),
      ...obstacles('crate', false, [
        [4, 3],
        [7, 3],
        [4, 8],
        [7, 8],
      ]),
      ...obstacles('barrel', false, [
        [1, 3],
        [10, 3],
        [1, 8],
        [10, 8],
      ]),
    ],
    bridgeCells: [
      { x: 2, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 9, y: 5 },
      { x: 2, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 9, y: 6 },
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
  {
    id: 'corrupted-sanctuary',
    name: 'Santuário Corrompido',
    gridSize: GRID_SIZE,
    theme: 'sanctuary',
    obstacles: [
      ...obstacles('wall', true, [
        [3, 3],
        [8, 3],
        [0, 5],
        [11, 5],
        [0, 6],
        [11, 6],
        [3, 8],
        [8, 8],
      ]),
      ...obstacles('pillar', true, [
        [1, 2],
        [10, 2],
        [5, 7],
        [6, 7],
        [1, 9],
        [10, 9],
      ]),
      ...obstacles('crate', false, [
        [4, 2],
        [7, 2],
        [4, 6],
        [7, 6],
      ]),
      ...obstacles('barrel', false, [
        [2, 4],
        [9, 4],
      ]),
    ],
    playerSpawnRows: [0, 1],
    enemySpawnRows: [10, 11],
  },
];

export interface SkillDef {
  id: SkillId;
  name: string;
  /** Quem a habilidade afeta. 'ally' inclui o próprio lançador. */
  targetTeam: 'enemy' | 'ally';
  /** Dano base em cada inimigo atingido. 0 para habilidades de cura. */
  damage: number;
  /** HP base devolvido ao aliado, até o `maxHp` dele. 0 para habilidades de dano. */
  heal: number;
  /** Tipo de ataque para escalonamento de dano em habilidades ofensivas. */
  attackKind?: AttackKind;
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
    damage: 4,
    heal: 0,
    attackKind: 'melee',
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
    attackKind: 'ranged',
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
    attackKind: 'magic',
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
  'dark-mend': {
    id: 'dark-mend',
    name: 'Dark Mend',
    targetTeam: 'ally',
    damage: 0,
    heal: 2,
    range: 3,
    cooldown: 2,
    area: 'single',
  },
};

export interface UnitStats {
  name: string;
  baseHp: number;
  baseArmor: number;
  basePower: number;
  attributes: UnitAttributes;
  attackKind: AttackKind;
  moveRange: number;
  attackRange: number;
  skillId: SkillId | null;
  portraitPath?: string;
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  knight: {
    name: 'Guerreiro',
    baseHp: 8,
    baseArmor: 1,
    basePower: 2,
    attributes: { str: 6, dex: 4, int: 3, fort: 6 },
    attackKind: 'melee',
    moveRange: 3,
    attackRange: 1,
    skillId: 'runic-strike',
    portraitPath: '/assets/portraits/knight.png',
  },
  archer: {
    name: 'Arqueira',
    baseHp: 8,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 4, dex: 6, int: 3, fort: 4 },
    attackKind: 'ranged',
    moveRange: 3,
    attackRange: 3,
    skillId: 'marked-shot',
    portraitPath: '/assets/portraits/archer.png',
  },
  mage: {
    name: 'Mago',
    baseHp: 7,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 3, dex: 4, int: 6, fort: 4 },
    attackKind: 'magic',
    moveRange: 2,
    attackRange: 2,
    skillId: 'arcane-burst',
    portraitPath: '/assets/portraits/mage.png',
  },
  cleric: {
    name: 'Clérigo',
    baseHp: 7,
    baseArmor: 1,
    basePower: 2,
    attributes: { str: 5, dex: 3, int: 6, fort: 5 },
    attackKind: 'melee',
    moveRange: 2,
    attackRange: 1,
    skillId: 'healing-light',
    portraitPath: '/assets/portraits/cleric.png',
  },
  'melee-skeleton': {
    name: 'Melee Skeleton',
    baseHp: 5,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 5, dex: 4, int: 2, fort: 4 },
    attackKind: 'melee',
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/melee-skeleton.png',
  },
  'skeleton-archer': {
    name: 'Skeleton Archer',
    baseHp: 4,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 4, dex: 6, int: 2, fort: 4 },
    attackKind: 'ranged',
    moveRange: 2,
    attackRange: 3,
    skillId: null,
    portraitPath: '/assets/portraits/skeleton-archer.png',
  },
  'armored-skeleton': {
    name: 'Armored Skeleton',
    baseHp: 7,
    baseArmor: 2,
    basePower: 2,
    attributes: { str: 7, dex: 4, int: 2, fort: 6 },
    attackKind: 'melee',
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/armored-skeleton.png',
  },
  'goblin-scout': {
    name: 'Goblin Scout',
    baseHp: 4,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 4, dex: 6, int: 3, fort: 4 },
    attackKind: 'melee',
    moveRange: 4,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/goblin-scout.png',
  },
  'cultist-mage': {
    name: 'Cultist Mage',
    baseHp: 6,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 3, dex: 4, int: 7, fort: 4 },
    attackKind: 'magic',
    moveRange: 2,
    attackRange: 3,
    skillId: null,
    portraitPath: '/assets/portraits/cultist-mage.png',
  },
  'goblin-stalker': {
    name: 'Goblin Stalker',
    baseHp: 6,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 7, dex: 7, int: 3, fort: 4 },
    attackKind: 'melee',
    moveRange: 4,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/goblin-stalker.png',
  },
  'skeleton-shieldbearer': {
    name: 'Skeleton Shieldbearer',
    baseHp: 7,
    baseArmor: 1,
    basePower: 2,
    attributes: { str: 5, dex: 4, int: 2, fort: 6 },
    attackKind: 'melee',
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/skeleton-shieldbearer.png',
  },
  'necromancer-acolyte': {
    name: 'Necromancer Acolyte',
    baseHp: 5,
    baseArmor: 0,
    basePower: 2,
    attributes: { str: 3, dex: 4, int: 7, fort: 5 },
    attackKind: 'magic',
    moveRange: 2,
    attackRange: 3,
    skillId: 'dark-mend',
    portraitPath: '/assets/portraits/necromancer-acolyte.png',
  },
  'ashen-guardian': {
    name: 'Guardião das Cinzas',
    baseHp: 20,
    baseArmor: 1,
    basePower: 4,
    attributes: { str: 7, dex: 4, int: 7, fort: 8 },
    attackKind: 'melee',
    moveRange: 2,
    attackRange: 1,
    skillId: null,
    portraitPath: '/assets/portraits/ashen-guardian.png',
  },
};

export interface BossPhaseAttackDef {
  skillName: string;
  basePower: number;
  attackKind: AttackKind;
  range: number;
  cooldown: number;
  area: 'cross' | '3x3';
}

export const ASHEN_GUARDIAN_PHASE_ATTACKS: Record<1 | 2, BossPhaseAttackDef> = {
  1: {
    skillName: 'Golpe das Cinzas',
    basePower: 4,
    attackKind: 'magic',
    range: 3,
    cooldown: 2,
    area: 'cross',
  },
  2: {
    skillName: 'Erupção das Cinzas',
    basePower: 5,
    attackKind: 'magic',
    range: 3,
    cooldown: 2,
    area: '3x3',
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

export const CAMPAIGN_HERO_SPAWNS: StageUnitSpawn[] = [
  { id: 'knight-1', type: 'knight', pos: { x: 4, y: 1 } },
  { id: 'cleric-1', type: 'cleric', pos: { x: 7, y: 1 } },
  { id: 'archer-1', type: 'archer', pos: { x: 2, y: 0 } },
  { id: 'mage-1', type: 'mage', pos: { x: 9, y: 0 } },
];

export const CAMPAIGN_STAGES: StageConfig[] = [
  {
    stageNumber: 1,
    id: 'stage-1-outpost',
    name: 'Posto Avançado',
    subtitle: 'Ruínas da Muralha Central',
    mapId: 'ruins',
    isBossStage: false,
    heroSpawns: CAMPAIGN_HERO_SPAWNS,
    enemies: [
      { id: 'goblin-scout-1', type: 'goblin-scout', pos: { x: 2, y: 10 } },
      { id: 'melee-skeleton-1', type: 'melee-skeleton', pos: { x: 5, y: 10 } },
      { id: 'goblin-scout-2', type: 'goblin-scout', pos: { x: 9, y: 10 } },
    ],
  },
  {
    stageNumber: 2,
    id: 'stage-2-swamp',
    name: 'Pântano Esquecido',
    subtitle: 'As Três Pontes da Névoa',
    mapId: 'forgotten-swamp',
    isBossStage: false,
    heroSpawns: CAMPAIGN_HERO_SPAWNS,
    enemies: [
      { id: 'goblin-stalker-1', type: 'goblin-stalker', pos: { x: 2, y: 10 } },
      { id: 'goblin-scout-1', type: 'goblin-scout', pos: { x: 5, y: 10 } },
      { id: 'goblin-scout-2', type: 'goblin-scout', pos: { x: 6, y: 10 } },
      { id: 'goblin-stalker-2', type: 'goblin-stalker', pos: { x: 9, y: 10 } },
      { id: 'skeleton-archer-1', type: 'skeleton-archer', pos: { x: 5, y: 11 } },
    ],
  },
  {
    stageNumber: 3,
    id: 'stage-3-fortress',
    name: 'Fortaleza dos Ossos',
    subtitle: 'Muralha de Escudos',
    mapId: 'fortress',
    isBossStage: false,
    heroSpawns: CAMPAIGN_HERO_SPAWNS,
    enemies: [
      { id: 'skeleton-shieldbearer-1', type: 'skeleton-shieldbearer', pos: { x: 4, y: 10 } },
      { id: 'skeleton-shieldbearer-2', type: 'skeleton-shieldbearer', pos: { x: 7, y: 10 } },
      { id: 'melee-skeleton-1', type: 'melee-skeleton', pos: { x: 2, y: 10 } },
      { id: 'melee-skeleton-2', type: 'melee-skeleton', pos: { x: 9, y: 10 } },
      { id: 'armored-skeleton-1', type: 'armored-skeleton', pos: { x: 5, y: 10 } },
      { id: 'skeleton-archer-1', type: 'skeleton-archer', pos: { x: 6, y: 11 } },
    ],
  },
  {
    stageNumber: 4,
    id: 'stage-4-catacombs',
    name: 'Catacumbas Arcanas',
    subtitle: 'Conclave das Sombras',
    mapId: 'catacombs',
    isBossStage: false,
    heroSpawns: CAMPAIGN_HERO_SPAWNS,
    enemies: [
      { id: 'armored-skeleton-1', type: 'armored-skeleton', pos: { x: 4, y: 10 } },
      { id: 'armored-skeleton-2', type: 'armored-skeleton', pos: { x: 7, y: 10 } },
      { id: 'cultist-mage-1', type: 'cultist-mage', pos: { x: 1, y: 11 } },
      { id: 'cultist-mage-2', type: 'cultist-mage', pos: { x: 10, y: 11 } },
      { id: 'necromancer-acolyte-1', type: 'necromancer-acolyte', pos: { x: 4, y: 11 } },
      { id: 'necromancer-acolyte-2', type: 'necromancer-acolyte', pos: { x: 7, y: 11 } },
    ],
  },
  {
    stageNumber: 5,
    id: 'stage-5-sanctuary',
    name: 'Santuário Corrompido',
    subtitle: 'Altar do Guardião das Cinzas',
    mapId: 'corrupted-sanctuary',
    isBossStage: true,
    heroSpawns: CAMPAIGN_HERO_SPAWNS,
    enemies: [
      { id: 'skeleton-shieldbearer-1', type: 'skeleton-shieldbearer', pos: { x: 4, y: 10 } },
      { id: 'ashen-guardian-1', type: 'ashen-guardian', pos: { x: 6, y: 10 } },
      { id: 'necromancer-acolyte-1', type: 'necromancer-acolyte', pos: { x: 8, y: 11 } },
    ],
  },
];
