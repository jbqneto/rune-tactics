// Shared contracts between the engine (src/game) and the UI/presentation layer (src/rendering, src/input, src/ui).
// This file imports nothing: no Three.js, no DOM, no config.
// Turn system rules are documented in docs/turn-system.md.

/** Board cell. x = column, y = row, both from 0 to `gridSize - 1`. */
export interface GridCoord {
  x: number;
  y: number;
}

export type Team = 'player' | 'enemy';

export type AttributeKey = 'str' | 'dex' | 'int' | 'fort';
export type UnitAttributes = Record<AttributeKey, number>;
export type AttackKind = 'melee' | 'ranged' | 'magic';
export type GameMode = 'quick-battle' | 'campaign' | 'pvp';

export type UnitType =
  | 'knight'
  | 'archer'
  | 'mage'
  | 'cleric'
  | 'melee-skeleton'
  | 'skeleton-archer'
  | 'armored-skeleton'
  | 'goblin-scout'
  | 'cultist-mage'
  | 'goblin-stalker'
  | 'skeleton-shieldbearer'
  | 'necromancer-acolyte'
  | 'ashen-guardian';

export type SkillId = 'runic-strike' | 'marked-shot' | 'arcane-burst' | 'healing-light' | 'dark-mend';

export interface PendingAttack {
  id: string;
  casterId: string;
  skillName: string;
  targetCells: GridCoord[];
  basePower: number;
  attackKind: AttackKind;
  preparedRound: number;
}

export type ObstacleKind = 'wall' | 'pillar' | 'crate' | 'barrel' | 'water';

/** Every obstacle blocks movement. Only `wall` and `pillar` block line of sight (`water` does not). */
export interface ObstacleDef {
  pos: GridCoord;
  kind: ObstacleKind;
  blocksLos: boolean;
}

/**
 * A battlefield. Maps live in `src/config/gameConfig.ts`; the engine picks one per battle,
 * without repeating the previous battle's map.
 */
export interface MapConfig {
  /** Stable identifier, in kebab-case. */
  id: string;
  /** Display name shown in the HUD. */
  name: string;
  gridSize: number;
  obstacles: ObstacleDef[];
  /**
   * Rows (`y`) where heroes spawn. Each hero gets a randomly chosen free cell in these rows.
   * They must contain more unobstructed cells than the number of heroes.
   */
  playerSpawnRows: number[];
  /** Same for enemies. */
  enemySpawnRows: number[];
  /** Optional visual theme for the board. */
  theme?: 'ruins' | 'swamp' | 'fortress' | 'catacombs' | 'sanctuary';
  /** Visual bridge cells over water (does not alter pathfinding rules). */
  bridgeCells?: GridCoord[];
}

/**
 * Whose turn it is, in summary. Derived from `TurnState`:
 * 'player' covers `player_unit_active`; 'enemy' is `enemy_activation`.
 */
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';

/**
 * Turn machine state (V2.1 — automatic fixed order).
 * - `player_unit_active`: the player unit determined by `turnOrder` is active.
 * - `enemy_activation`: an enemy determined by `turnOrder` is acting via `executeNextEnemyAction`.
 * - `victory` and `defeat`: terminal states.
 */
export type TurnState = 'player_unit_active' | 'enemy_activation' | 'victory' | 'defeat';

export interface UnitState {
  id: string;
  name: string;
  type: UnitType;
  team: Team;
  /** For a dead unit, this is the cell where it fell: the corpse stays there and blocks nothing. */
  pos: GridCoord;
  hp: number;
  maxHp: number;
  attributes: UnitAttributes;
  baseHp: number;
  baseArmor: number;
  basePower: number;
  attackKind: AttackKind;
  /** Effective basic attack power (`basePower + offensiveBonus(mainAttr)`), derived for HUD/queries. */
  damage: number;
  /** Effective defense (`baseArmor + fortitudeResistance(attributes.fort)`), derived for HUD/queries. */
  armor: number;
  /** Orthogonal steps per activation. */
  moveRange: number;
  /** Maximum Manhattan distance to target. Above 1, the attack requires line of sight. */
  attackRange: number;
  /** Dead units remain in the list, with `alive: false` and `hp: 0`. They are never removed. */
  alive: boolean;
  /** Reset at the start of each round. */
  hasMoved: boolean;
  /** Basic attack and skill consume the same action. */
  hasAttacked: boolean;
  /** Whether the unit has already taken its activation this round. Reset at the start of each round. */
  hasActivatedThisRound: boolean;
  /** `null` for units without a skill (enemies). */
  skillId: SkillId | null;
  skillName: string | null;
  /** 0 = ready. On use, set to the skill's cooldown; decreases by 1 at the start of each round. */
  skillCooldown: number;
  /** Defensive stance granting 50% damage mitigation until the unit's next activation. */
  isGuarding: boolean;
  /** Current phase of the `ashen-guardian` boss (1 or 2). */
  bossPhase?: 1 | 2;
  /** Portrait path for the HUD, relative to the site root. */
  portraitPath?: string;
}

/** Facts that already occurred in the engine, in chronological order. The UI only animates them. */
export type GameEvent =
  /** `path` includes both origin and destination cells. */
  | { type: 'unitMoved'; unitId: string; path: GridCoord[] }
  /**
   * The activation's movement was undone. `path` is the return path: starts at the cell the unit
   * occupied and ends at the cell it came from, both included.
   */
  | { type: 'moveUndone'; unitId: string; path: GridCoord[] }
  /**
   * Damage applied to a target. `isRanged` indicates a projectile (range above 1).
   * `skillId` is populated when damage comes from a skill; in that case a `skillUsed` precedes it.
   */
  | {
      type: 'unitAttacked';
      attackerId: string;
      targetId: string;
      damage: number;
      targetHpRemaining: number;
      wasGuarded?: boolean;
      isRanged?: boolean;
      skillId?: SkillId;
      pendingAttackId?: string;
    }
  /** The unit entered defensive stance (50% mitigation until its next activation). */
  | { type: 'unitGuarded'; unitId: string }
  /** A skill was cast. Precedes the `unitAttacked` or `unitHealed` of each unit in `affectedUnitIds`. */
  | { type: 'skillUsed'; casterId: string; skillId: SkillId; targetCell: GridCoord; affectedUnitIds: string[] }
  /** Healing applied. `amount` is the actual HP recovered, already capped by `maxHp`. */
  | { type: 'unitHealed'; casterId: string; targetId: string; amount: number; targetHpAfter: number }
  /** A telegraphed area attack was prepared and will resolve on the caster's next activation. */
  | { type: 'attackPrepared'; pendingAttack: PendingAttack }
  /** A telegraphed attack resolved at the start of the caster's activation. */
  | {
      type: 'pendingAttackResolved';
      pendingAttackId: string;
      casterId: string;
      skillName: string;
      targetCells: GridCoord[];
      affectedUnitIds: string[];
    }
  /** A telegraphed attack was cancelled because the caster died before its next activation. */
  | { type: 'attackCancelled'; pendingAttackId: string; casterId: string; reason: 'caster_died' }
  /** The `ashen-guardian` boss irreversibly entered Phase 2. */
  | { type: 'bossPhaseChanged'; unitId: string; phase: 2; newMoveRange: number }
  | { type: 'unitDied'; unitId: string }
  /** A unit started its activation. For the player, emitted along with the first action or pass. */
  | { type: 'activationStarted'; unitId: string; team: Team; round: number }
  /** Activation ended: by spending both actions, manual end, no actions left, or death. */
  | { type: 'activationEnded'; unitId: string }
  /** All living units have activated and a new round began. */
  | { type: 'roundStarted'; round: number }
  /** Turn passed to the other team, or a new round began. */
  | { type: 'turnChanged'; phase: Phase; round: number }
  | { type: 'battleEnded'; winner: Team }
  | { type: 'gameReset' };

/**
 * What `smartAttack` or `smartUseSkill` would do right now, so the UI can preview it before clicking.
 * `path` contains only the current cell when the action is valid from where the unit stands; otherwise
 * it goes from the current cell to the cell from which it will act, both included.
 */
export interface SmartActionPlan {
  path: GridCoord[];
}

/** Copy of the state: mutating it does not affect the engine. */
export interface GameStateSnapshot {
  /** Current match mode. */
  mode: GameMode;
  pvp?: { matchId: string; revision: number; mySeat: 'A' | 'B'; activeSeat: 'A' | 'B' | null; winnerSeat: 'A' | 'B' | null; turnDeadlineMs: number | null; opponentConnected: boolean };
  /** Stage number (1..5) when `mode === 'campaign'`. */
  stageNumber?: number;
  /** Stage name when `mode === 'campaign'`. */
  stageName?: string;
  /** Map selected for this battle. */
  mapId: string;
  mapName: string;
  /** Seed that generated the map and starting positions for this battle. The same seed replays the battle. */
  seed: number;
  gridSize: number;
  /** Positions of `obstacleDefs` only, in the same order. */
  obstacles: GridCoord[];
  obstacleDefs: ObstacleDef[];
  /** Includes dead units (`alive: false`), which remain as corpses on the cell where they fell. */
  units: UnitState[];
  phase: Phase;
  turnState: TurnState;
  /** Fixed interleaved order of unit IDs defined at match start. */
  turnOrder: string[];
  /** Current index within `turnOrder`. */
  turnIndex: number;
  /** Starts at 1 and increments when all living units have activated. */
  round: number;
  /**
   * Unit with an open activation: the ally locked in `player_unit_active` or the enemy acting
   * in `enemy_activation`. `null` in other states.
   */
  activeUnitId: string | null;
  /** `true` in `player_unit_active`: the player cannot switch allies until the activation ends. */
  activationLocked: boolean;
  /** Team of the current activation. `null` after battle ends. */
  activationTeam: Team | null;
  /** Unit focused in the HUD. In `player_unit_active` it is always equal to `activeUnitId`. */
  selectedUnitId: string | null;
  /** Whether `undoMove` would be accepted right now. See conditions on the method. */
  canUndoMove: boolean;
  /** Telegraphed area attacks awaiting resolution on the caster's next activation. */
  pendingAttacks: PendingAttack[];
  winner: Team | null;
}

export type ActionResult = { ok: true } | { ok: false; reason: string };

/**
 * Single point of contact between the UI and the rules.
 * Where `unitId` is optional, it defaults to the selected unit; if none, returns an empty list.
 * A unit is "eligible" when it is alive and has not yet activated this round.
 */
export interface IGameEngine {
  getState(): GameStateSnapshot;

  /**
   * Focuses a living player unit. Only valid during the player's turn.
   * - In `player_unit_active`: rejects any unit other than the active one, and rejects `null`.
   */
  selectUnit(unitId: string | null): ActionResult;

  /** Cells where the unit can stop right now. Empty if it already moved or cannot act this activation. */
  getReachableCells(unitId?: string): GridCoord[];

  /**
   * Shortest orthogonal path between two cells, including origin and destination.
   * Ignores `moveRange`. Returns `null` if no path exists.
   */
  getPath(from: GridCoord, to: GridCoord): GridCoord[] | null;

  /**
   * Living enemies in range and, for range above 1, with line of sight.
   * Empty if the unit already attacked or cannot act this activation.
   */
  getAttackableTargets(unitId?: string): UnitState[];

  /**
   * Line of sight between the centers of two cells. Only obstacles with `blocksLos` interrupt it;
   * units and corpses do not. Origin and destination never block, and the line passes between two obstacles
   * that only touch diagonally at a corner.
   */
  hasLineOfSight(from: GridCoord, to: GridCoord): boolean;

  /**
   * All cells within the unit's basic attack range (respecting obstacles and line of sight).
   * Empty if the unit already attacked or is not the active unit.
   */
  getAttackRangeCells(unitId?: string): GridCoord[];

  /**
   * All cells within the unit's skill range (respecting obstacles and line of sight).
   * Empty if the unit already attacked, is on cooldown, has no skill, or is not the active unit.
   */
  getSkillRangeCells(unitId?: string): GridCoord[];

  /**
   * Cells where the unit can cast its skill right now: in range and with line of sight (for range above 1).
   * - Damage skill: the area of effect must hit at least one living enemy.
   * - Healing skill: the cell must contain a living ally below max HP; may be the caster itself.
   * Empty if the unit already attacked, is on cooldown, has no skill, or cannot act this activation.
   */
  getSkillTargetCells(unitId?: string): GridCoord[];

  /**
   * Cells hit if the unit's skill is cast on `targetCell`: the cell itself or,
   * for `arcane-burst`, it and its orthogonally adjacent cells within the grid. Does not validate range.
   */
  getSkillAreaCells(targetCell: GridCoord, unitId?: string): GridCoord[];

  /**
   * Moves the selected unit, which must be eligible. Movement and attack are valid in either order.
   * The first successful action opens the activation and locks the unit (`player_unit_active`).
   * When the active unit has both moved and attacked, the activation ends automatically and the turn advances.
   */
  moveSelectedUnit(to: GridCoord): ActionResult;

  /** Basic attack with the selected unit. Opens and ends the activation like `moveSelectedUnit`. */
  attackTarget(targetId: string): ActionResult;

  /**
   * Casts the selected unit's skill on a cell from `getSkillTargetCells`.
   * Consumes the activation's attack action. Opens and ends the activation like `moveSelectedUnit`.
   */
  useSkill(targetCell: GridCoord): ActionResult;

  /**
   * Undoes the active unit's movement: it returns to the cell it started from and `hasMoved` resets to `false`,
   * so it can move again. Emits `moveUndone`. Does not end the activation.
   * Only accepted when all conditions hold (as reported by `canUndoMove`):
   * - it is the player's turn and the active unit has moved this activation;
   * - it has not attacked or used a skill after moving;
   * - the move was not part of `smartAttack` or `smartUseSkill`;
   * - `undoMove` has not been used yet this activation. After undoing, the next move is final.
   */
  undoMove(): ActionResult;

  /**
   * Plan for `smartAttack` against that target, or `null` if the attack is not possible this activation.
   * Pure query: does not mutate state or emit events.
   */
  getSmartAttackPlan(targetId: string): SmartActionPlan | null;

  /**
   * Basic attack that moves automatically if needed.
   * - If the target is already in range, with line of sight when required, attacks from where it stands without spending movement.
   * - Otherwise, if the unit has not moved yet, picks among reachable cells from which the attack is valid
   *   the one with lowest movement cost; on ties, closest to the target (Manhattan); still tied, lowest
   *   `y` then lowest `x`. Moves there and attacks. Emits `unitMoved` then `unitAttacked`.
   * - If no such cell exists, or the unit already moved and the target is out of range, rejects without changing anything.
   * Both actions happen together or neither happens. Movement made here cannot be undone.
   * With both movement and attack spent, the activation ends automatically, like `moveSelectedUnit`.
   */
  smartAttack(targetId: string): ActionResult;

  /** Plan for `smartUseSkill` on that target cell, or `null` if the skill cannot hit it this activation. */
  getSmartSkillPlan(targetCell: GridCoord): SmartActionPlan | null;

  /**
   * `useSkill` that moves automatically if needed, following the same rules as `smartAttack`:
   * casts from where it stands if `targetCell` is already a valid target; otherwise moves to the lowest-cost
   * reachable cell from which it becomes valid (same tie-breakers, measuring distance to `targetCell`) and casts.
   */
  smartUseSkill(targetCell: GridCoord): ActionResult;

  /**
   * Defensive stance for the active unit: consumes the attack action and reduces incoming damage by 50%
   * (rounded up, minimum 1) until the unit's next activation.
   */
  defend(): ActionResult;

  /**
   * Ends the current player activation and passes the turn. Keeps the legacy method name:
   * it no longer ends the entire team's turn.
   * - In `player_unit_active`: ends the active unit's activation, even with actions remaining.
   */
  endPlayerTurn(): ActionResult;

  /**
   * Advances the enemy activation by one step. Only acts in `enemy_activation`.
   * Picks the next eligible enemy if none is active and executes one action (a move or an attack).
   * When the active enemy has nothing left to do, the same call ends the activation and passes the turn.
   * Returns `true` if it executed an action. Returning `false` does not mean the enemy turn is over:
   * the UI should keep calling while `turnState` is `enemy_activation`.
   */
  executeNextEnemyAction(): boolean;

  /**
   * Starts a new battle and emits `gameReset`: picks a different map from the previous one and new starting
   * positions. The UI must rebuild the board because `gridSize` and obstacles may have changed.
   */
  reset(): void;

  /** Returns accumulated events since the last call and clears the queue. */
  consumeEvents(): GameEvent[];
}

// ---------------------------------------------------------------------------
// Campaign and Persistence Contracts (V4)
// ---------------------------------------------------------------------------

export interface StageUnitSpawn {
  id: string;
  type: UnitType;
  pos: GridCoord;
}

export interface StageConfig {
  stageNumber: number;
  id: string;
  name: string;
  subtitle: string;
  mapId: string;
  isBossStage: boolean;
  heroSpawns: StageUnitSpawn[];
  enemies: StageUnitSpawn[];
}

export interface CampaignHeroProgress {
  id: string;
  type: 'knight' | 'archer' | 'mage' | 'cleric';
  attributes: UnitAttributes;
  hp: number;
  maxHp: number;
  unspentPoints: number;
}

export interface CampaignCheckpoint {
  stageNumber: number;
  heroes: CampaignHeroProgress[];
}

export type CampaignStatus = 'in_stage' | 'between_stages' | 'completed';

export interface CampaignState {
  version: 4;
  status: CampaignStatus;
  currentStage: number;
  heroes: CampaignHeroProgress[];
  checkpoint: CampaignCheckpoint;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
