# Rune Tactics V5 — Game Command, Event, and State Contracts

All contracts defined here live in `src/shared/` with **zero runtime dependencies** (no Three.js, no DOM, no Colyseus imports). Existing PvE contracts in `src/shared/types.ts` remain backward-compatible.

---

## 1. Minimal Additions to `src/shared/types.ts`

```ts
// Updated GameMode (additive, preserves 'quick-battle' | 'campaign')
export type GameMode = 'quick-battle' | 'campaign' | 'pvp';
```

Optional additive metadata on `GameStateSnapshot` (only populated when `mode === 'pvp'`):

```ts
export interface GameStateSnapshot {
  // ...all existing V4 fields unchanged...

  /** PvP perspective metadata when `mode === 'pvp'`. */
  pvp?: {
    matchId: string;
    revision: number;
    mySeat: 'A' | 'B';
    activeSeat: 'A' | 'B' | null;
    winnerSeat: 'A' | 'B' | null;
    turnDeadlineMs: number | null;
    opponentConnected: boolean;
  };
}
```

And optional `UnitRenderer` / `HudManager` support relies on `state.mode === 'pvp'` plus `pvp` metadata without changing any `IGameEngine` method signatures.

---

## 2. Canonical PvP Types (`src/shared/pvpTypes.ts`)

### 2.1 Seats, Teams, Classes, and Actors

```ts
import type {
  AttackKind,
  GridCoord,
  ObstacleDef,
  PendingAttack,
  SkillId,
  UnitAttributes,
  UnitType,
} from './types';

export type PlayerSeat = 'A' | 'B';
export type PvPTeam = 'teamA' | 'teamB';
export type PvPHeroClass = 'knight' | 'archer' | 'mage' | 'cleric';

export type ActorType = 'human' | 'mcp-agent' | 'system';

export interface ActorContext {
  /** Stable server-authenticated identity (never trusted from raw client payload). */
  actorId: string;
  seat: PlayerSeat;
  team: PvPTeam;
  type: ActorType;
}

export type PvPRoomPhase =
  | 'WAITING_FOR_PLAYER'
  | 'CHARACTER_SELECTION'
  | 'WAITING_FOR_READY'
  | 'STARTING'
  | 'IN_PROGRESS'
  | 'PAUSED_DISCONNECTED'
  | 'FINISHED';

export type MatchFinishReason =
  | 'elimination'
  | 'disconnect_timeout'
  | 'forfeit'
  | 'aborted';
```

Helper invariant:
- `seatToTeam('A') === 'teamA'` and `seatToTeam('B') === 'teamB'`.
- `teamToSeat('teamA') === 'A'` and `teamToSeat('teamB') === 'B'`.

---

### 2.2 `GameCommand` and `CommandEnvelope`

Every tactical action is represented as a discrete discriminated union (`GameCommand`), wrapped in an idempotent, revision-checked `CommandEnvelope`:

```ts
export type GameCommand =
  | { type: 'Move'; unitId: string; to: GridCoord }
  | { type: 'Attack'; unitId: string; targetId: string }
  | { type: 'UseSkill'; unitId: string; targetCell: GridCoord }
  | { type: 'Defend'; unitId: string }
  | { type: 'UndoMove'; unitId: string }
  | { type: 'SmartAttack'; unitId: string; targetId: string }
  | { type: 'SmartUseSkill'; unitId: string; targetCell: GridCoord }
  | { type: 'EndTurn'; unitId: string };

export interface CommandEnvelope {
  /** Client- or agent-generated unique ID (UUID v4) for idempotency deduplication. */
  commandId: string;
  matchId: string;
  /** Optimistic concurrency guard: must equal current `ObservableMatchState.revision`. */
  expectedRevision: number;
  /** Informational timestamp from caller; ignored by deterministic rules. */
  issuedAtMs: number;
  command: GameCommand;
}
```

> **Why `unitId` is included in every `GameCommand`**: Even though fixed turn order determines `activeUnitId`, requiring `unitId` prevents an asynchronous agent or lagged client from accidentally executing an action on the *next* unit after a turn timeout or state transition.

---

### 2.3 `PvPGameplayEvent`

Canonical, server-emitted facts using `'teamA' | 'teamB'` and `PlayerSeat`:

```ts
export type PvPGameplayEvent =
  | { type: 'unitMoved'; unitId: string; path: GridCoord[] }
  | { type: 'moveUndone'; unitId: string; path: GridCoord[] }
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
  | { type: 'unitGuarded'; unitId: string }
  | {
      type: 'skillUsed';
      casterId: string;
      skillId: SkillId;
      targetCell: GridCoord;
      affectedUnitIds: string[];
    }
  | {
      type: 'unitHealed';
      casterId: string;
      targetId: string;
      amount: number;
      targetHpAfter: number;
    }
  | { type: 'attackPrepared'; pendingAttack: PendingAttack }
  | {
      type: 'pendingAttackResolved';
      pendingAttackId: string;
      casterId: string;
      skillName: string;
      targetCells: GridCoord[];
      affectedUnitIds: string[];
    }
  | {
      type: 'attackCancelled';
      pendingAttackId: string;
      casterId: string;
      reason: 'caster_died';
    }
  | { type: 'unitDied'; unitId: string }
  | { type: 'activationStarted'; unitId: string; team: PvPTeam; round: number }
  | { type: 'activationEnded'; unitId: string; reason: 'completed' | 'manual' | 'timeout' | 'died' }
  | { type: 'roundStarted'; round: number }
  | { type: 'turnChanged'; activeTeam: PvPTeam; round: number }
  | { type: 'turnTimedOut'; unitId: string; team: PvPTeam; round: number }
  | { type: 'battleEnded'; winnerTeam: PvPTeam; winnerSeat: PlayerSeat; reason: MatchFinishReason };
```

Ordering guarantees (matching `AGENTS.md` V2.3/V4 invariants):
- Events generated by a single command or timeout arrive contiguously in exact causal order inside `CommandResult.events` and the room's `matchEvents` broadcast.
- `skillUsed` is immediately followed by `unitAttacked` / `unitHealed` for each affected target, then `unitDied` if fatal, then `battleEnded` OR `activationEnded` -> `roundStarted` -> `turnChanged` -> `activationStarted`.

---

### 2.4 `CommandResult`

```ts
export type CommandErrorCode =
  | 'MATCH_NOT_FOUND'
  | 'MATCH_NOT_ACTIVE'
  | 'MATCH_PAUSED'
  | 'UNAUTHORIZED_ACTOR'
  | 'NOT_YOUR_TURN'
  | 'UNIT_NOT_ACTIVE'
  | 'STALE_REVISION'
  | 'COMMAND_CONFLICT'
  | 'ILLEGAL_ACTION'
  | 'INVALID_COMMAND';

export type CommandResult =
  | {
      ok: true;
      commandId: string;
      matchId: string;
      /** Revision after applying this command (`expectedRevision + 1`). */
      revision: number;
      idempotentReplay: boolean;
      events: PvPGameplayEvent[];
      state: ObservableMatchState;
    }
  | {
      ok: false;
      commandId: string;
      matchId: string;
      code: CommandErrorCode;
      message: string;
      /** Authoritative current revision so callers can resync cleanly. */
      currentRevision: number;
      idempotentReplay: boolean;
    };
```

---

### 2.5 `ObservableMatchState`

Canonical, JSON-serializable, self-contained state snapshot returned by `MatchService.getMatchState`, broadcast on state updates, and exposed to MCP agents:

```ts
export interface PvPUnitState {
  id: string;
  name: string;
  type: PvPHeroClass;
  team: PvPTeam;
  seat: PlayerSeat;
  /** 0..2 slot index within the team's selection order. */
  slot: 0 | 1 | 2;
  pos: GridCoord;
  hp: number;
  maxHp: number;
  attributes: UnitAttributes;
  baseHp: number;
  baseArmor: number;
  basePower: number;
  attackKind: AttackKind;
  damage: number;
  armor: number;
  moveRange: number;
  attackRange: number;
  alive: boolean;
  hasMoved: boolean;
  hasAttacked: boolean;
  hasActivatedThisRound: boolean;
  skillId: SkillId | null;
  skillName: string | null;
  skillCooldown: number;
  isGuarding: boolean;
  portraitPath?: string;
}

export interface PvPSeatInfo {
  seat: PlayerSeat;
  team: PvPTeam;
  actorId: string | null;
  displayName: string;
  connected: boolean;
  ready: boolean;
  selectedClasses: PvPHeroClass[];
  rematchRequested: boolean;
}

export interface ObservableMatchState {
  matchId: string;
  revision: number;
  phase: PvPRoomPhase;
  mapId: string;
  mapName: string;
  seed: number;
  gridSize: number;
  obstacles: GridCoord[];
  obstacleDefs: ObstacleDef[];
  bridgeCells: GridCoord[];
  /** Present and ordered symmetrically by seat A and B. */
  seats: {
    A: PvPSeatInfo;
    B: PvPSeatInfo;
  };
  units: PvPUnitState[];
  turnOrder: string[];
  turnIndex: number;
  round: number;
  activeTeam: PvPTeam | null;
  activeSeat: PlayerSeat | null;
  activeUnitId: string | null;
  canUndoMove: boolean;
  pendingAttacks: PendingAttack[];
  /** Epoch timestamp (ms) when current activation expires; null if paused/finished. */
  turnDeadlineMs: number | null;
  /** Remaining ms frozen when paused due to disconnect. */
  pausedRemainingTurnMs: number | null;
  winnerTeam: PvPTeam | null;
  winnerSeat: PlayerSeat | null;
  finishReason: MatchFinishReason | null;
  /** Optional perspective metadata when projected for a specific actor. */
  viewer?: {
    seat: PlayerSeat;
    myTeam: PvPTeam;
    opponentTeam: PvPTeam;
    isMyTurn: boolean;
  };
}
```

---

### 2.6 `LegalAction` and `LegalActionsSnapshot`

Computed exclusively inside `src/game/` (`MatchService.getLegalActions`) so **neither the browser client nor V6 MCP agents ever compute BFS, LoS, range, or smart paths**:

```ts
export interface MoveLegalOption {
  to: GridCoord;
  /** Shortest orthogonal path including origin and destination. */
  path: GridCoord[];
  steps: number;
  command: Extract<GameCommand, { type: 'Move' }>;
}

export interface AttackLegalOption {
  targetId: string;
  targetPos: GridCoord;
  targetType: UnitType;
  estimatedDamage: number;
  targetHp: number;
  wouldKill: boolean;
  command: Extract<GameCommand, { type: 'Attack' }>;
}

export interface SmartAttackLegalOption {
  targetId: string;
  targetPos: GridCoord;
  /** `[currentPos]` if already in range; otherwise shortest path to firing cell. */
  path: GridCoord[];
  steps: number;
  estimatedDamage: number;
  wouldKill: boolean;
  command: Extract<GameCommand, { type: 'SmartAttack' }>;
}

export interface SkillLegalOption {
  targetCell: GridCoord;
  skillId: SkillId;
  areaCells: GridCoord[];
  affectedUnitIds: string[];
  command: Extract<GameCommand, { type: 'UseSkill' }>;
}

export interface SmartSkillLegalOption {
  targetCell: GridCoord;
  skillId: SkillId;
  path: GridCoord[];
  steps: number;
  areaCells: GridCoord[];
  affectedUnitIds: string[];
  command: Extract<GameCommand, { type: 'SmartUseSkill' }>;
}

export interface LegalActionsSnapshot {
  matchId: string;
  revision: number;
  actorSeat: PlayerSeat;
  actorTeam: PvPTeam;
  /** True only when match is IN_PROGRESS and `activeTeam === actorTeam`. */
  isYourTurn: boolean;
  activeUnitId: string | null;

  canMove: boolean;
  canAttack: boolean;
  canUseSkill: boolean;
  canDefend: boolean;
  canUndoMove: boolean;
  canEndTurn: boolean;

  /** Visual range overlays (empty when not actor's turn or action already spent). */
  attackRangeCells: GridCoord[];
  skillRangeCells: GridCoord[];

  /** Discrete executable options. */
  moves: MoveLegalOption[];
  attacks: AttackLegalOption[];
  smartAttacks: SmartAttackLegalOption[];
  skills: SkillLegalOption[];
  smartSkills: SmartSkillLegalOption[];
  defendCommand: Extract<GameCommand, { type: 'Defend' }> | null;
  undoMoveCommand: Extract<GameCommand, { type: 'UndoMove' }> | null;
  endTurnCommand: Extract<GameCommand, { type: 'EndTurn' }> | null;
}
```

### Design Invariants for Contracts
1. **Payload compactness**: On a 12×12 board with `moveRange <= 3` and 3 opposing units, `LegalActionsSnapshot` is typically 1–3 KB JSON and only computed per state transition for the acting seat (empty options for the non-acting seat).
2. **UI compatibility**: Every query method on `IGameEngine` (`getReachableCells`, `getPath`, `getAttackableTargets`, `getAttackRangeCells`, `getSkillRangeCells`, `getSkillTargetCells`, `getSkillAreaCells`, `getSmartAttackPlan`, `getSmartSkillPlan`) is 100% answered by reading `LegalActionsSnapshot` in `PvPClientEngine`.
3. **Agent clarity**: An MCP LLM agent receives pre-validated `command` objects inside `moves`, `attacks`, `smartAttacks`, `skills`, `smartSkills`, `defendCommand`, `undoMoveCommand`, `endTurnCommand`, along with tactical previews (`estimatedDamage`, `wouldKill`, `affectedUnitIds`, `steps`).
