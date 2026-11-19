import { describe, expect, it, vi } from 'vitest';
import { PvPClientEngine } from '../src/network/PvPClientEngine';
import { ColyseusMatchClient, parseActorType, resolveServerUrl, toHttpUrl } from '../src/network/ColyseusMatchClient';
import type {
  CommandEnvelope,
  CommandResult,
  LegalActionsSnapshot,
  ObservableMatchState,
  PlayerSeat,
  PvPGameplayEvent,
} from '../src/shared/pvpTypes';

function createMockMatchState(overrides: Partial<ObservableMatchState> = {}): ObservableMatchState {
  return {
    matchId: 'match-123',
    revision: 1,
    phase: 'IN_PROGRESS',
    mapId: 'forgotten-swamp',
    mapName: 'Forgotten Swamp',
    seed: 42,
    gridSize: 12,
    obstacles: [{ x: 3, y: 3 }],
    obstacleDefs: [{ pos: { x: 3, y: 3 }, kind: 'water', blocksLos: false }],
    bridgeCells: [],
    seats: {
      A: {
        seat: 'A',
        team: 'teamA',
        actorId: 'actor-a',
        displayName: 'Player A',
        connected: true,
        ready: true,
        selectedClasses: ['knight', 'archer', 'mage'],
        rematchRequested: false,
      },
      B: {
        seat: 'B',
        team: 'teamB',
        actorId: 'actor-b',
        displayName: 'Player B',
        connected: true,
        ready: true,
        selectedClasses: ['cleric', 'knight', 'archer'],
        rematchRequested: false,
      },
    },
    units: [
      {
        id: 'A1',
        name: 'Knight A',
        type: 'knight',
        team: 'teamA',
        seat: 'A',
        slot: 0,
        pos: { x: 1, y: 1 },
        hp: 30,
        maxHp: 30,
        attributes: { str: 4, dex: 2, int: 1, fort: 3 },
        baseHp: 30,
        baseArmor: 2,
        basePower: 6,
        attackKind: 'melee',
        damage: 8,
        armor: 3,
        moveRange: 3,
        attackRange: 1,
        alive: true,
        hasMoved: false,
        hasAttacked: false,
        hasActivatedThisRound: false,
        skillId: 'runic-strike',
        skillName: 'Runic Strike',
        skillCooldown: 0,
        isGuarding: false,
      },
      {
        id: 'B1',
        name: 'Cleric B',
        type: 'cleric',
        team: 'teamB',
        seat: 'B',
        slot: 0,
        pos: { x: 10, y: 10 },
        hp: 24,
        maxHp: 24,
        attributes: { str: 2, dex: 2, int: 4, fort: 2 },
        baseHp: 24,
        baseArmor: 1,
        basePower: 4,
        attackKind: 'melee',
        damage: 5,
        armor: 2,
        moveRange: 3,
        attackRange: 1,
        alive: true,
        hasMoved: false,
        hasAttacked: false,
        hasActivatedThisRound: false,
        skillId: 'healing-light',
        skillName: 'Healing Light',
        skillCooldown: 0,
        isGuarding: false,
      },
    ],
    turnOrder: ['A1', 'B1'],
    turnIndex: 0,
    round: 1,
    activeTeam: 'teamA',
    activeSeat: 'A',
    activeUnitId: 'A1',
    canUndoMove: false,
    pendingAttacks: [],
    turnDeadlineMs: 100000,
    pausedRemainingTurnMs: null,
    winnerTeam: null,
    winnerSeat: null,
    finishReason: null,
    ...overrides,
  };
}

function createMockLegalActions(overrides: Partial<LegalActionsSnapshot> = {}): LegalActionsSnapshot {
  return {
    matchId: 'match-123',
    revision: 1,
    actorSeat: 'A',
    actorTeam: 'teamA',
    isYourTurn: true,
    activeUnitId: 'A1',
    canMove: true,
    canAttack: true,
    canUseSkill: true,
    canDefend: true,
    canUndoMove: false,
    canEndTurn: true,
    attackRangeCells: [{ x: 1, y: 2 }, { x: 2, y: 1 }],
    skillRangeCells: [{ x: 1, y: 2 }, { x: 2, y: 1 }],
    moves: [
      {
        to: { x: 1, y: 2 },
        path: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
        steps: 1,
        command: { type: 'Move', unitId: 'A1', to: { x: 1, y: 2 } },
      },
      {
        to: { x: 2, y: 1 },
        path: [{ x: 1, y: 1 }, { x: 2, y: 1 }],
        steps: 1,
        command: { type: 'Move', unitId: 'A1', to: { x: 2, y: 1 } },
      },
    ],
    attacks: [
      {
        targetId: 'B1',
        targetPos: { x: 10, y: 10 },
        targetType: 'cleric',
        estimatedDamage: 6,
        targetHp: 24,
        wouldKill: false,
        command: { type: 'Attack', unitId: 'A1', targetId: 'B1' },
      },
    ],
    smartAttacks: [
      {
        targetId: 'B1',
        targetPos: { x: 10, y: 10 },
        path: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 9, y: 10 }],
        steps: 2,
        estimatedDamage: 6,
        wouldKill: false,
        command: { type: 'SmartAttack', unitId: 'A1', targetId: 'B1' },
      },
    ],
    skills: [
      {
        targetCell: { x: 1, y: 2 },
        skillId: 'runic-strike',
        areaCells: [{ x: 1, y: 2 }],
        affectedUnitIds: ['B1'],
        command: { type: 'UseSkill', unitId: 'A1', targetCell: { x: 1, y: 2 } },
      },
    ],
    smartSkills: [
      {
        targetCell: { x: 10, y: 10 },
        skillId: 'runic-strike',
        path: [{ x: 1, y: 1 }, { x: 9, y: 10 }],
        steps: 2,
        areaCells: [{ x: 10, y: 10 }],
        affectedUnitIds: ['B1'],
        command: { type: 'SmartUseSkill', unitId: 'A1', targetCell: { x: 10, y: 10 } },
      },
    ],
    defendCommand: { type: 'Defend', unitId: 'A1' },
    undoMoveCommand: null,
    endTurnCommand: { type: 'EndTurn', unitId: 'A1' },
    ...overrides,
  };
}

describe('PvPClientEngine - Perspective Projection', () => {
  it('projects units relative to Seat A (myTeam -> player, opponentTeam -> enemy)', () => {
    const state = createMockMatchState();
    const engineA = new PvPClientEngine({ mySeat: 'A', initialState: state });
    const snapshotA = engineA.getState();

    const unitA = snapshotA.units.find((u) => u.id === 'A1')!;
    const unitB = snapshotA.units.find((u) => u.id === 'B1')!;

    expect(unitA.team).toBe('player');
    expect(unitB.team).toBe('enemy');
  });

  it('projects units relative to Seat B (myTeam -> player, opponentTeam -> enemy)', () => {
    const state = createMockMatchState();
    const engineB = new PvPClientEngine({ mySeat: 'B', initialState: state });
    const snapshotB = engineB.getState();

    const unitA = snapshotB.units.find((u) => u.id === 'A1')!;
    const unitB = snapshotB.units.find((u) => u.id === 'B1')!;

    expect(unitA.team).toBe('enemy');
    expect(unitB.team).toBe('player');
  });

  it('projects phase and turnState when activeTeam is teamA', () => {
    const state = createMockMatchState({ activeTeam: 'teamA', activeSeat: 'A' });
    const engineA = new PvPClientEngine({ mySeat: 'A', initialState: state });
    const engineB = new PvPClientEngine({ mySeat: 'B', initialState: state });

    const snapA = engineA.getState();
    expect(snapA.phase).toBe('player');
    expect(snapA.turnState).toBe('player_unit_active');
    expect(snapA.activationTeam).toBe('player');
    expect(snapA.selectedUnitId).toBe('A1');

    const snapB = engineB.getState();
    expect(snapB.phase).toBe('enemy');
    expect(snapB.turnState).toBe('enemy_activation');
    expect(snapB.activationTeam).toBe('enemy');
    expect(snapB.selectedUnitId).toBeNull();
  });

  it('projects phase and turnState when activeTeam is teamB', () => {
    const state = createMockMatchState({ activeTeam: 'teamB', activeSeat: 'B', activeUnitId: 'B1' });
    const engineA = new PvPClientEngine({ mySeat: 'A', initialState: state });
    const engineB = new PvPClientEngine({ mySeat: 'B', initialState: state });

    const snapA = engineA.getState();
    expect(snapA.phase).toBe('enemy');
    expect(snapA.turnState).toBe('enemy_activation');
    expect(snapA.activationTeam).toBe('enemy');

    const snapB = engineB.getState();
    expect(snapB.phase).toBe('player');
    expect(snapB.turnState).toBe('player_unit_active');
    expect(snapB.activationTeam).toBe('player');
    expect(snapB.selectedUnitId).toBe('B1');
  });

  it('projects victory and defeat correctly from winnerSeat', () => {
    const stateWinA = createMockMatchState({
      phase: 'FINISHED',
      winnerSeat: 'A',
      winnerTeam: 'teamA',
      finishReason: 'elimination',
    });

    const engineA = new PvPClientEngine({ mySeat: 'A', initialState: stateWinA });
    const engineB = new PvPClientEngine({ mySeat: 'B', initialState: stateWinA });

    expect(engineA.getState().phase).toBe('victory');
    expect(engineA.getState().turnState).toBe('victory');
    expect(engineA.getState().winner).toBe('player');

    expect(engineB.getState().phase).toBe('defeat');
    expect(engineB.getState().turnState).toBe('defeat');
    expect(engineB.getState().winner).toBe('enemy');
  });

  it('projects PvP events relative to viewer perspective', () => {
    const state = createMockMatchState();
    const engineA = new PvPClientEngine({ mySeat: 'A', initialState: state });
    const engineB = new PvPClientEngine({ mySeat: 'B', initialState: state });

    const events: PvPGameplayEvent[] = [
      { type: 'activationStarted', unitId: 'A1', team: 'teamA', round: 1 },
      { type: 'turnChanged', activeTeam: 'teamA', round: 1 },
      { type: 'battleEnded', winnerTeam: 'teamA', winnerSeat: 'A', reason: 'elimination' },
    ];

    engineA.handleMatchEvents({ revision: 2, events, state: { ...state, revision: 2 } });
    engineB.handleMatchEvents({ revision: 2, events, state: { ...state, revision: 2 } });

    const eventsA = engineA.consumeEvents();
    expect(eventsA).toEqual([
      { type: 'activationStarted', unitId: 'A1', team: 'player', round: 1 },
      { type: 'turnChanged', phase: 'player', round: 1 },
      { type: 'battleEnded', winner: 'player' },
    ]);

    const eventsB = engineB.consumeEvents();
    expect(eventsB).toEqual([
      { type: 'activationStarted', unitId: 'A1', team: 'enemy', round: 1 },
      { type: 'turnChanged', phase: 'enemy', round: 1 },
      { type: 'battleEnded', winner: 'enemy' },
    ]);
  });
});

describe('PvPClientEngine - Synchronous Queries from LegalActionsSnapshot', () => {
  it('answers getReachableCells strictly from moves', () => {
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: createMockMatchState(),
      initialLegalActions: legal,
    });

    expect(engine.getReachableCells()).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }]);
    expect(engine.getReachableCells('A1')).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }]);
    expect(engine.getReachableCells('B1')).toEqual([]);

    // When canMove is false
    engine.handleLegalActions({ ...legal, canMove: false, moves: [] });
    expect(engine.getReachableCells()).toEqual([]);
  });

  it('answers getPath strictly from moves or smart plans', () => {
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: createMockMatchState(),
      initialLegalActions: legal,
    });

    expect(engine.getPath({ x: 1, y: 1 }, { x: 1, y: 1 })).toEqual([{ x: 1, y: 1 }]);
    expect(engine.getPath({ x: 1, y: 1 }, { x: 1, y: 2 })).toEqual([{ x: 1, y: 1 }, { x: 1, y: 2 }]);
    expect(engine.getPath({ x: 1, y: 1 }, { x: 9, y: 10 })).toEqual([{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 9, y: 10 }]);
    expect(engine.getPath({ x: 1, y: 1 }, { x: 5, y: 5 })).toBeNull();
  });

  it('answers getAttackableTargets strictly from attacks', () => {
    const state = createMockMatchState();
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: state,
      initialLegalActions: legal,
    });

    const targets = engine.getAttackableTargets();
    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe('B1');
    expect(targets[0].team).toBe('enemy');

    // When canAttack is false
    engine.handleLegalActions({ ...legal, canAttack: false, attacks: [] });
    expect(engine.getAttackableTargets()).toEqual([]);
  });

  it('answers getAttackRangeCells and getSkillRangeCells', () => {
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: createMockMatchState(),
      initialLegalActions: legal,
    });

    expect(engine.getAttackRangeCells()).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }]);
    expect(engine.getSkillRangeCells()).toEqual([{ x: 1, y: 2 }, { x: 2, y: 1 }]);

    // When not your turn
    engine.handleLegalActions({ ...legal, isYourTurn: false });
    expect(engine.getAttackRangeCells()).toEqual([]);
    expect(engine.getSkillRangeCells()).toEqual([]);
  });

  it('answers getSkillTargetCells and getSkillAreaCells', () => {
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: createMockMatchState(),
      initialLegalActions: legal,
    });

    expect(engine.getSkillTargetCells()).toEqual([{ x: 1, y: 2 }]);
    expect(engine.getSkillAreaCells({ x: 1, y: 2 })).toEqual([{ x: 1, y: 2 }]);
    expect(engine.getSkillAreaCells({ x: 10, y: 10 })).toEqual([{ x: 10, y: 10 }]);
    expect(engine.getSkillAreaCells({ x: 5, y: 5 })).toEqual([{ x: 5, y: 5 }]);
  });

  it('answers getSmartAttackPlan and getSmartSkillPlan', () => {
    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      initialState: createMockMatchState(),
      initialLegalActions: legal,
    });

    const attackPlan = engine.getSmartAttackPlan('B1');
    expect(attackPlan).toEqual({ path: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 9, y: 10 }] });

    const unknownAttackPlan = engine.getSmartAttackPlan('non-existent');
    expect(unknownAttackPlan).toBeNull();

    const skillPlan = engine.getSmartSkillPlan({ x: 10, y: 10 });
    expect(skillPlan).toEqual({ path: [{ x: 1, y: 1 }, { x: 9, y: 10 }] });

    const unknownSkillPlan = engine.getSmartSkillPlan({ x: 0, y: 0 });
    expect(unknownSkillPlan).toBeNull();
  });
});

describe('PvPClientEngine - InFlight Command Gating', () => {
  it('blocks duplicate commands until CommandResult arrives', () => {
    const sentEnvelopes: CommandEnvelope[] = [];
    const mockClient = {
      sendCommand: (env: CommandEnvelope) => {
        sentEnvelopes.push(env);
      },
    };

    const legal = createMockLegalActions();
    const state = createMockMatchState();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      client: mockClient,
      initialState: state,
      initialLegalActions: legal,
    });

    // First command succeeds and sets inFlightCommandId
    const res1 = engine.moveSelectedUnit({ x: 1, y: 2 });
    expect(res1).toEqual({ ok: true });
    expect(sentEnvelopes).toHaveLength(1);
    const inFlightId = engine.getInFlightCommandId();
    expect(inFlightId).toBeTruthy();

    // Second command is blocked while in flight
    const res2 = engine.moveSelectedUnit({ x: 2, y: 1 });
    expect(res2).toEqual({ ok: false, reason: 'Command already in flight' });
    expect(sentEnvelopes).toHaveLength(1);

    // Third command (different action) is also blocked
    const res3 = engine.defend();
    expect(res3).toEqual({ ok: false, reason: 'Command already in flight' });

    // Server acknowledges command with CommandResult
    const successResult: CommandResult = {
      ok: true,
      commandId: inFlightId!,
      matchId: state.matchId,
      revision: 2,
      idempotentReplay: false,
      events: [{ type: 'unitMoved', unitId: 'A1', path: [{ x: 1, y: 1 }, { x: 1, y: 2 }] }],
      state: { ...state, revision: 2 },
    };
    engine.handleCommandResult(successResult);

    expect(engine.getInFlightCommandId()).toBeNull();

    // Now a new command is allowed
    const res4 = engine.moveSelectedUnit({ x: 2, y: 1 });
    expect(res4).toEqual({ ok: true });
    expect(sentEnvelopes).toHaveLength(2);
  });

  it('surfaces server error feedback and unblocks inFlightCommandId on rejection', () => {
    let feedbackError = '';
    const mockClient = {
      sendCommand: vi.fn(),
    };

    const legal = createMockLegalActions();
    const engine = new PvPClientEngine({
      mySeat: 'A',
      client: mockClient,
      initialState: createMockMatchState(),
      initialLegalActions: legal,
      onErrorFeedback: (msg) => {
        feedbackError = msg;
      },
    });

    engine.defend();
    const inFlightId = engine.getInFlightCommandId()!;
    expect(inFlightId).toBeTruthy();

    const failureResult: CommandResult = {
      ok: false,
      commandId: inFlightId,
      matchId: 'match-123',
      code: 'ILLEGAL_ACTION',
      message: 'Unit already attacked this activation.',
      currentRevision: 1,
      idempotentReplay: false,
    };

    engine.handleCommandResult(failureResult);

    expect(engine.getInFlightCommandId()).toBeNull();
    expect(feedbackError).toBe('Unit already attacked this activation.');
  });
});

describe('ColyseusMatchClient URL helpers', () => {
  it('converts ws:// and wss:// URLs to http:// and https:// in toHttpUrl', () => {
    expect(toHttpUrl('ws://localhost:2567')).toBe('http://localhost:2567');
    expect(toHttpUrl('wss://play.runetactics.com/')).toBe('https://play.runetactics.com');
    expect(toHttpUrl('http://localhost:2567/')).toBe('http://localhost:2567');
  });

  it('returns fallback URL in resolveServerUrl in Node environment without window', () => {
    const url = resolveServerUrl();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('correctly parses actorType treating absence or non-mcp values as human', () => {
    expect(parseActorType('mcp-agent')).toBe('mcp-agent');
    expect(parseActorType('human')).toBe('human');
    expect(parseActorType(undefined)).toBe('human');
    expect(parseActorType(null)).toBe('human');
    expect(parseActorType('')).toBe('human');
    expect(parseActorType('bot')).toBe('human');
  });

  it('sends raw 3-class array for selectClasses and raw boolean for setReady matching PvPRoom contract', () => {
    const client = new ColyseusMatchClient('http://127.0.0.1:2567');
    const sendSpy = vi.fn();
    (client as any).room = { send: sendSpy };

    client.selectClasses(['knight', 'archer', 'mage']);
    expect(sendSpy).toHaveBeenCalledWith('selectClasses', ['knight', 'archer', 'mage']);

    client.setReady(true);
    expect(sendSpy).toHaveBeenCalledWith('setReady', true);

    client.setReady(false);
    expect(sendSpy).toHaveBeenCalledWith('setReady', false);
  });
});
