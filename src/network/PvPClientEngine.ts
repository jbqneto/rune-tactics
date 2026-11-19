import type {
  ActionResult,
  GameEvent,
  GameStateSnapshot,
  GridCoord,
  IGameEngine,
  Phase,
  SmartActionPlan,
  Team,
  TurnState,
  UnitState,
  UnitType,
} from '../shared/types';
import {
  seatToTeam,
  type CommandEnvelope,
  type CommandResult,
  type GameCommand,
  type LegalActionsSnapshot,
  type ObservableMatchState,
  type PlayerSeat,
  type PvPGameplayEvent,
} from '../shared/pvpTypes';
import type { ColyseusMatchClient, MatchEventsPayload, MatchInitPayload } from './ColyseusMatchClient';

export interface IPvPCommandSender {
  sendCommand(envelope: CommandEnvelope): void;
}

export interface PvPClientEngineOptions {
  mySeat: PlayerSeat;
  client?: ColyseusMatchClient | (IPvPCommandSender & {
    onMatchInit?: (cb: (data: MatchInitPayload) => void) => () => void;
    onMatchEvents?: (cb: (data: MatchEventsPayload) => void) => () => void;
    onLegalActions?: (cb: (data: LegalActionsSnapshot) => void) => () => void;
    onCommandResult?: (cb: (data: CommandResult) => void) => () => void;
  });
  initialState?: ObservableMatchState;
  initialLegalActions?: LegalActionsSnapshot;
  onErrorFeedback?: (message: string) => void;
}

export class PvPClientEngine implements IGameEngine {
  private mySeat: PlayerSeat;
  private client: IPvPCommandSender | null = null;
  private matchState: ObservableMatchState | null = null;
  private legalActions: LegalActionsSnapshot | null = null;
  private inFlightCommandId: string | null = null;
  private lastProcessedRevision = -1;
  private eventQueue: GameEvent[] = [];
  private selectedUnitId: string | null = null;
  private onErrorFeedback?: (message: string) => void;
  private unsubscribeFns: Array<() => void> = [];

  constructor(options: PvPClientEngineOptions) {
    this.mySeat = options.mySeat;
    this.onErrorFeedback = options.onErrorFeedback;

    if (options.initialState) {
      this.matchState = options.initialState;
      this.lastProcessedRevision = options.initialState.revision;
    }
    if (options.initialLegalActions) {
      this.legalActions = options.initialLegalActions;
    }

    if (options.client) {
      this.attachClient(options.client);
    }
  }

  setSeat(seat: PlayerSeat): void {
    this.mySeat = seat;
  }

  getSeat(): PlayerSeat {
    return this.mySeat;
  }

  getInFlightCommandId(): string | null {
    return this.inFlightCommandId;
  }

  getRawMatchState(): ObservableMatchState | null {
    return this.matchState;
  }

  getLegalActionsSnapshot(): LegalActionsSnapshot | null {
    return this.legalActions;
  }

  attachClient(client: PvPClientEngineOptions['client']): void {
    this.dispose();
    if (!client) return;
    this.client = client;

    if (client.onMatchInit) {
      this.unsubscribeFns.push(client.onMatchInit(this.handleMatchInit.bind(this)));
    }
    if (client.onMatchEvents) {
      this.unsubscribeFns.push(client.onMatchEvents(this.handleMatchEvents.bind(this)));
    }
    if (client.onLegalActions) {
      this.unsubscribeFns.push(client.onLegalActions(this.handleLegalActions.bind(this)));
    }
    if (client.onCommandResult) {
      this.unsubscribeFns.push(client.onCommandResult(this.handleCommandResult.bind(this)));
    }
  }

  dispose(): void {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
    this.client = null;
  }

  handleMatchInit(init: MatchInitPayload): void {
    this.mySeat = init.mySeat;
    this.matchState = init.state;
    this.legalActions = init.legalActions;
    this.lastProcessedRevision = init.state.revision;
  }

  handleMatchEvents(payload: MatchEventsPayload): void {
    if (payload.revision > this.lastProcessedRevision) {
      this.lastProcessedRevision = payload.revision;
      this.matchState = payload.state;
      this.enqueuePvPEvents(payload.events);
    }
  }

  handleLegalActions(legalActions: LegalActionsSnapshot): void {
    this.legalActions = legalActions;
  }

  handleCommandResult(result: CommandResult): void {
    if (this.inFlightCommandId === result.commandId) {
      this.inFlightCommandId = null;
    }

    if (!result.ok) {
      this.onErrorFeedback?.(result.message);
    } else {
      if (result.revision > this.lastProcessedRevision) {
        this.lastProcessedRevision = result.revision;
        this.matchState = result.state;
        this.enqueuePvPEvents(result.events);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // IGameEngine Implementation
  // ---------------------------------------------------------------------------

  getState(): GameStateSnapshot {
    if (!this.matchState) {
      return this.createEmptySnapshot();
    }

    const myTeam = seatToTeam(this.mySeat);
    const opponentSeat: PlayerSeat = this.mySeat === 'A' ? 'B' : 'A';

    let phase: Phase;
    let turnState: TurnState;
    let winner: Team | null = null;

    if (this.matchState.winnerSeat) {
      if (this.matchState.winnerSeat === this.mySeat) {
        phase = 'victory';
        turnState = 'victory';
        winner = 'player';
      } else {
        phase = 'defeat';
        turnState = 'defeat';
        winner = 'enemy';
      }
    } else if (this.matchState.winnerTeam) {
      if (this.matchState.winnerTeam === myTeam) {
        phase = 'victory';
        turnState = 'victory';
        winner = 'player';
      } else {
        phase = 'defeat';
        turnState = 'defeat';
        winner = 'enemy';
      }
    } else if (this.matchState.phase === 'FINISHED') {
      phase = 'defeat';
      turnState = 'defeat';
      winner = null;
    } else {
      const isMyTurn = this.matchState.activeTeam === myTeam;
      if (isMyTurn) {
        phase = 'player';
        turnState = 'player_unit_active';
      } else {
        phase = 'enemy';
        turnState = 'enemy_activation';
      }
    }

    const units: UnitState[] = this.matchState.units.map((u) => {
      const team: Team = u.team === myTeam ? 'player' : 'enemy';
      return {
        id: u.id,
        name: u.name,
        type: u.type as UnitType,
        team,
        pos: { x: u.pos.x, y: u.pos.y },
        hp: u.hp,
        maxHp: u.maxHp,
        attributes: { ...u.attributes },
        baseHp: u.baseHp,
        baseArmor: u.baseArmor,
        basePower: u.basePower,
        attackKind: u.attackKind,
        damage: u.damage,
        armor: u.armor,
        moveRange: u.moveRange,
        attackRange: u.attackRange,
        alive: u.alive,
        hasMoved: u.hasMoved,
        hasAttacked: u.hasAttacked,
        hasActivatedThisRound: u.hasActivatedThisRound,
        skillId: u.skillId,
        skillName: u.skillName,
        skillCooldown: u.skillCooldown,
        isGuarding: u.isGuarding,
        portraitPath: u.portraitPath,
      };
    });

    const activeUnitId = this.matchState.activeUnitId;
    const isPlayerActive = phase === 'player';
    const selectedUnitId = isPlayerActive ? (this.selectedUnitId ?? activeUnitId) : null;
    const activationLocked = isPlayerActive && activeUnitId !== null;
    const activationTeam: Team | null = this.matchState.activeTeam
      ? (this.matchState.activeTeam === myTeam ? 'player' : 'enemy')
      : null;

    const canUndoMove = isPlayerActive
      ? (this.legalActions?.canUndoMove ?? this.matchState.canUndoMove)
      : false;

    const opponentConnected = this.matchState.seats?.[opponentSeat]?.connected ?? true;

    return {
      mode: 'pvp',
      pvp: {
        matchId: this.matchState.matchId,
        revision: this.matchState.revision,
        mySeat: this.mySeat,
        activeSeat: this.matchState.activeSeat,
        winnerSeat: this.matchState.winnerSeat,
        turnDeadlineMs: this.matchState.turnDeadlineMs,
        opponentConnected,
      },
      mapId: this.matchState.mapId,
      mapName: this.matchState.mapName,
      seed: this.matchState.seed,
      gridSize: this.matchState.gridSize,
      obstacles: this.matchState.obstacles.map((o) => ({ x: o.x, y: o.y })),
      obstacleDefs: this.matchState.obstacleDefs.map((od) => ({
        pos: { x: od.pos.x, y: od.pos.y },
        kind: od.kind,
        blocksLos: od.blocksLos,
      })),
      units,
      phase,
      turnState,
      turnOrder: [...this.matchState.turnOrder],
      turnIndex: this.matchState.turnIndex,
      round: this.matchState.round,
      activeUnitId,
      activationLocked,
      activationTeam,
      selectedUnitId,
      canUndoMove,
      pendingAttacks: this.matchState.pendingAttacks ? [...this.matchState.pendingAttacks] : [],
      winner,
    };
  }

  selectUnit(unitId: string | null): ActionResult {
    if (unitId === null) {
      this.selectedUnitId = null;
      return { ok: true };
    }
    const activeId = this.matchState?.activeUnitId ?? null;
    if (activeId && unitId !== activeId) {
      return { ok: false, reason: 'Cannot switch active unit during fixed turn order' };
    }
    this.selectedUnitId = unitId;
    return { ok: true };
  }

  getReachableCells(unitId?: string): GridCoord[] {
    if (!this.legalActions || !this.legalActions.isYourTurn || !this.legalActions.canMove) {
      return [];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [];
    }
    return this.legalActions.moves.map((m) => ({ x: m.to.x, y: m.to.y }));
  }

  getPath(from: GridCoord, to: GridCoord): GridCoord[] | null {
    if (from.x === to.x && from.y === to.y) {
      return [{ x: from.x, y: from.y }];
    }
    if (!this.legalActions) return null;

    const move = this.legalActions.moves.find(
      (m) => m.to.x === to.x && m.to.y === to.y
    );
    if (move) {
      return move.path.map((c) => ({ x: c.x, y: c.y }));
    }

    const sa = this.legalActions.smartAttacks.find(
      (s) => s.path.length > 0 && s.path[s.path.length - 1].x === to.x && s.path[s.path.length - 1].y === to.y
    );
    if (sa) {
      return sa.path.map((c) => ({ x: c.x, y: c.y }));
    }

    const ss = this.legalActions.smartSkills.find(
      (s) => s.path.length > 0 && s.path[s.path.length - 1].x === to.x && s.path[s.path.length - 1].y === to.y
    );
    if (ss) {
      return ss.path.map((c) => ({ x: c.x, y: c.y }));
    }

    return null;
  }

  getAttackableTargets(unitId?: string): UnitState[] {
    if (!this.legalActions || !this.legalActions.isYourTurn || !this.legalActions.canAttack) {
      return [];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [];
    }
    const targetIds = new Set(this.legalActions.attacks.map((a) => a.targetId));
    const snapshot = this.getState();
    return snapshot.units.filter((u) => targetIds.has(u.id));
  }

  hasLineOfSight(from: GridCoord, to: GridCoord): boolean {
    if (from.x === to.x && from.y === to.y) return true;
    if (!this.legalActions) return false;

    const inAttacks = this.legalActions.attacks.some((a) => a.targetPos.x === to.x && a.targetPos.y === to.y);
    if (inAttacks) return true;

    const inAttackRange = this.legalActions.attackRangeCells.some((c) => c.x === to.x && c.y === to.y);
    if (inAttackRange) return true;

    const inSkillRange = this.legalActions.skillRangeCells.some((c) => c.x === to.x && c.y === to.y);
    if (inSkillRange) return true;

    return false;
  }

  getAttackRangeCells(unitId?: string): GridCoord[] {
    if (!this.legalActions || !this.legalActions.isYourTurn) {
      return [];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [];
    }
    return this.legalActions.attackRangeCells.map((c) => ({ x: c.x, y: c.y }));
  }

  getSkillRangeCells(unitId?: string): GridCoord[] {
    if (!this.legalActions || !this.legalActions.isYourTurn) {
      return [];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [];
    }
    return this.legalActions.skillRangeCells.map((c) => ({ x: c.x, y: c.y }));
  }

  getSkillTargetCells(unitId?: string): GridCoord[] {
    if (!this.legalActions || !this.legalActions.isYourTurn || !this.legalActions.canUseSkill) {
      return [];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [];
    }
    return this.legalActions.skills.map((s) => ({ x: s.targetCell.x, y: s.targetCell.y }));
  }

  getSkillAreaCells(targetCell: GridCoord, unitId?: string): GridCoord[] {
    if (!this.legalActions) {
      return [{ x: targetCell.x, y: targetCell.y }];
    }
    if (unitId && unitId !== this.legalActions.activeUnitId) {
      return [{ x: targetCell.x, y: targetCell.y }];
    }
    const skill = this.legalActions.skills.find(
      (s) => s.targetCell.x === targetCell.x && s.targetCell.y === targetCell.y
    );
    if (skill) {
      return skill.areaCells.map((c) => ({ x: c.x, y: c.y }));
    }
    const smartSkill = this.legalActions.smartSkills.find(
      (s) => s.targetCell.x === targetCell.x && s.targetCell.y === targetCell.y
    );
    if (smartSkill) {
      return smartSkill.areaCells.map((c) => ({ x: c.x, y: c.y }));
    }
    return [{ x: targetCell.x, y: targetCell.y }];
  }

  getSmartAttackPlan(targetId: string): SmartActionPlan | null {
    if (!this.legalActions || !this.legalActions.isYourTurn) {
      return null;
    }
    const option = this.legalActions.smartAttacks.find((sa) => sa.targetId === targetId);
    if (!option) {
      return null;
    }
    return { path: option.path.map((c) => ({ x: c.x, y: c.y })) };
  }

  getSmartSkillPlan(targetCell: GridCoord): SmartActionPlan | null {
    if (!this.legalActions || !this.legalActions.isYourTurn) {
      return null;
    }
    const option = this.legalActions.smartSkills.find(
      (ss) => ss.targetCell.x === targetCell.x && ss.targetCell.y === targetCell.y
    );
    if (!option) {
      return null;
    }
    return { path: option.path.map((c) => ({ x: c.x, y: c.y })) };
  }

  moveSelectedUnit(to: GridCoord): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canMove || !this.legalActions.isYourTurn) {
      return { ok: false, reason: 'Movement is not available' };
    }
    const option = this.legalActions.moves.find(
      (m) => m.to.x === to.x && m.to.y === to.y
    );
    if (!option) {
      return { ok: false, reason: 'Illegal move destination' };
    }
    return this.dispatchCommand(option.command);
  }

  attackTarget(targetId: string): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canAttack || !this.legalActions.isYourTurn) {
      return { ok: false, reason: 'Attack is not available' };
    }
    const option = this.legalActions.attacks.find((a) => a.targetId === targetId);
    if (!option) {
      return { ok: false, reason: 'Illegal attack target' };
    }
    return this.dispatchCommand(option.command);
  }

  useSkill(targetCell: GridCoord): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canUseSkill || !this.legalActions.isYourTurn) {
      return { ok: false, reason: 'Skill is not available' };
    }
    const option = this.legalActions.skills.find(
      (s) => s.targetCell.x === targetCell.x && s.targetCell.y === targetCell.y
    );
    if (!option) {
      return { ok: false, reason: 'Illegal skill target' };
    }
    return this.dispatchCommand(option.command);
  }

  undoMove(): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canUndoMove || !this.legalActions.isYourTurn || !this.legalActions.undoMoveCommand) {
      return { ok: false, reason: 'Cannot undo move' };
    }
    return this.dispatchCommand(this.legalActions.undoMoveCommand);
  }

  smartAttack(targetId: string): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.isYourTurn) {
      return { ok: false, reason: 'Not your turn' };
    }
    const option = this.legalActions.smartAttacks.find((a) => a.targetId === targetId);
    if (!option) {
      return { ok: false, reason: 'Illegal smart attack target' };
    }
    return this.dispatchCommand(option.command);
  }

  smartUseSkill(targetCell: GridCoord): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.isYourTurn) {
      return { ok: false, reason: 'Not your turn' };
    }
    const option = this.legalActions.smartSkills.find(
      (s) => s.targetCell.x === targetCell.x && s.targetCell.y === targetCell.y
    );
    if (!option) {
      return { ok: false, reason: 'Illegal smart skill target' };
    }
    return this.dispatchCommand(option.command);
  }

  defend(): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canDefend || !this.legalActions.isYourTurn || !this.legalActions.defendCommand) {
      return { ok: false, reason: 'Cannot defend' };
    }
    return this.dispatchCommand(this.legalActions.defendCommand);
  }

  endPlayerTurn(): ActionResult {
    if (this.inFlightCommandId) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.legalActions?.canEndTurn || !this.legalActions.isYourTurn || !this.legalActions.endTurnCommand) {
      return { ok: false, reason: 'Cannot end turn' };
    }
    return this.dispatchCommand(this.legalActions.endTurnCommand);
  }

  executeNextEnemyAction(): boolean {
    return false;
  }

  reset(): void {
    this.eventQueue = [];
    this.inFlightCommandId = null;
  }

  consumeEvents(): GameEvent[] {
    const events = [...this.eventQueue];
    this.eventQueue = [];
    return events;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private dispatchCommand(command: GameCommand): ActionResult {
    if (this.inFlightCommandId !== null) {
      return { ok: false, reason: 'Command already in flight' };
    }
    if (!this.matchState) {
      return { ok: false, reason: 'Match not initialized' };
    }

    const commandId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `cmd-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const envelope: CommandEnvelope = {
      commandId,
      matchId: this.matchState.matchId,
      expectedRevision: this.matchState.revision,
      issuedAtMs: Date.now(),
      command,
    };

    this.inFlightCommandId = commandId;

    if (this.client) {
      try {
        this.client.sendCommand(envelope);
      } catch (err) {
        this.inFlightCommandId = null;
        return { ok: false, reason: err instanceof Error ? err.message : 'Failed to send command' };
      }
    }

    return { ok: true };
  }

  private enqueuePvPEvents(events: PvPGameplayEvent[]): void {
    const myTeam = seatToTeam(this.mySeat);
    for (const event of events) {
      switch (event.type) {
        case 'unitMoved':
          this.eventQueue.push({
            type: 'unitMoved',
            unitId: event.unitId,
            path: event.path.map((c) => ({ x: c.x, y: c.y })),
          });
          break;
        case 'moveUndone':
          this.eventQueue.push({
            type: 'moveUndone',
            unitId: event.unitId,
            path: event.path.map((c) => ({ x: c.x, y: c.y })),
          });
          break;
        case 'unitAttacked':
        case 'unitGuarded':
        case 'skillUsed':
        case 'unitHealed':
        case 'attackPrepared':
        case 'pendingAttackResolved':
        case 'attackCancelled':
          this.eventQueue.push({ ...event } as GameEvent);
          break;
        case 'unitDied':
          this.eventQueue.push({ type: 'unitDied', unitId: event.unitId });
          break;
        case 'activationStarted':
          this.eventQueue.push({
            type: 'activationStarted',
            unitId: event.unitId,
            team: event.team === myTeam ? 'player' : 'enemy',
            round: event.round,
          });
          break;
        case 'activationEnded':
          this.eventQueue.push({
            type: 'activationEnded',
            unitId: event.unitId,
          });
          break;
        case 'roundStarted':
          this.eventQueue.push({
            type: 'roundStarted',
            round: event.round,
          });
          break;
        case 'turnChanged':
          this.eventQueue.push({
            type: 'turnChanged',
            phase: event.activeTeam === myTeam ? 'player' : 'enemy',
            round: event.round,
          });
          break;
        case 'battleEnded':
          this.eventQueue.push({
            type: 'battleEnded',
            winner: (event.winnerTeam === myTeam || event.winnerSeat === this.mySeat) ? 'player' : 'enemy',
          });
          break;
        case 'turnTimedOut':
          // Server-specific event; not in GameEvent union
          break;
      }
    }
  }

  private createEmptySnapshot(): GameStateSnapshot {
    return {
      mode: 'pvp',
      pvp: {
        matchId: '',
        revision: 0,
        mySeat: this.mySeat,
        activeSeat: null,
        winnerSeat: null,
        turnDeadlineMs: null,
        opponentConnected: true,
      },
      mapId: '',
      mapName: '',
      seed: 0,
      gridSize: 12,
      obstacles: [],
      obstacleDefs: [],
      units: [],
      phase: 'player',
      turnState: 'player_unit_active',
      turnOrder: [],
      turnIndex: 0,
      round: 1,
      activeUnitId: null,
      activationLocked: false,
      activationTeam: null,
      selectedUnitId: null,
      canUndoMove: false,
      pendingAttacks: [],
      winner: null,
    };
  }
}
