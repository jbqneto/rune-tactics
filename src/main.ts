import './style.css';
import { MAPS, SKILLS } from './config/gameConfig';
import { CampaignSystem } from './game/campaign/CampaignSystem';
import { SaveSystem } from './game/campaign/SaveSystem';
import { GameEngine, type GameSetup } from './game/GameEngine';
import { InputManager, type InteractionMode } from './input/InputManager';
import { BoardRenderer } from './rendering/BoardRenderer';
import { type SceneAtmosphereConfig, SceneManager } from './rendering/SceneManager';
import { UnitRenderer } from './rendering/UnitRenderer';
import type {
  GameEvent,
  GameStateSnapshot,
  GridCoord,
  IGameEngine,
  Phase,
  TurnState,
} from './shared/types';
import { HudManager } from './ui/HudManager';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
const hudEl = document.getElementById('hud');

if (!canvas || !hudEl) {
  throw new Error('Elementos #game-canvas ou #hud não encontrados no DOM.');
}

const saveSystem = new SaveSystem(window.localStorage);
const campaignSystem = new CampaignSystem(saveSystem);

let engine: IGameEngine = new GameEngine();

const engineProxy: IGameEngine = {
  getState: () => engine.getState(),
  selectUnit: (unitId) => engine.selectUnit(unitId),
  getReachableCells: (unitId) => engine.getReachableCells(unitId),
  getPath: (from, to) => engine.getPath(from, to),
  getAttackableTargets: (unitId) => engine.getAttackableTargets(unitId),
  hasLineOfSight: (from, to) => engine.hasLineOfSight(from, to),
  getAttackRangeCells: (unitId) => engine.getAttackRangeCells(unitId),
  getSkillRangeCells: (unitId) => engine.getSkillRangeCells(unitId),
  getSkillTargetCells: (unitId) => engine.getSkillTargetCells(unitId),
  getSkillAreaCells: (targetCell, unitId) => engine.getSkillAreaCells(targetCell, unitId),
  moveSelectedUnit: (to) => engine.moveSelectedUnit(to),
  attackTarget: (targetId) => engine.attackTarget(targetId),
  useSkill: (targetCell) => engine.useSkill(targetCell),
  undoMove: () => engine.undoMove(),
  getSmartAttackPlan: (targetId) => engine.getSmartAttackPlan(targetId),
  smartAttack: (targetId) => engine.smartAttack(targetId),
  getSmartSkillPlan: (targetCell) => engine.getSmartSkillPlan(targetCell),
  smartUseSkill: (targetCell) => engine.smartUseSkill(targetCell),
  defend: () => engine.defend(),
  endPlayerTurn: () => engine.endPlayerTurn(),
  executeNextEnemyAction: () => engine.executeNextEnemyAction(),
  reset: () => engine.reset(),
  consumeEvents: () => engine.consumeEvents(),
};

const sceneManager = new SceneManager(canvas);
const boardRenderer = new BoardRenderer(sceneManager.scene);

const TURN_TIMER_SECONDS = 60;

const DEFAULT_ATMOSPHERE: SceneAtmosphereConfig = {
  backgroundColor: 0x0c1424,
  fogColor: 0x0c1424,
  fogDensity: 0.012,
  ambientColor: 0x94a3b8,
  ambientIntensity: 0.48,
  hemiSkyColor: 0x8ec5e8,
  hemiGroundColor: 0x1e3536,
  hemiIntensity: 0.62,
  dirColor: 0xfff1d6,
  dirIntensity: 1.38,
  dirPosition: [11, 18, 8],
  rimColor: 0x7dd3fc,
  rimIntensity: 0.55,
  rimPosition: [-10, 10, -11],
  pointLights: [
    { position: [-6.65, 1.75, -6.65], color: 0xf59e0b, intensity: 3.2, distance: 14, decay: 1.5 },
    { position: [6.65, 1.75, -6.65], color: 0xf59e0b, intensity: 3.2, distance: 14, decay: 1.5 },
    { position: [-6.65, 1.75, 6.65], color: 0xf59e0b, intensity: 3.2, distance: 14, decay: 1.5 },
    { position: [6.65, 1.75, 6.65], color: 0xf59e0b, intensity: 3.2, distance: 14, decay: 1.5 },
  ],
};

let mode: InteractionMode = 'default';
let hoverCell: GridCoord | null = null;
let hoverPath: GridCoord[] | null = null;
let hoverSkillArea: GridCoord[] = [];
let enemyStepTimer = 0;
let wasAnimating = false;
let lastPhase: Phase = engine.getState().phase;
let turnTimerSeconds = TURN_TIMER_SECONDS;
let lastTimerActiveId: string | null = null;
let lastTimerRound = 0;
let lastTimerTurnState: TurnState | null = null;
let isMenuOpen = true;
let campaignVictoryHandled = false;

function rebuildBoardForState(state: GameStateSnapshot): void {
  const map = MAPS.find((m) => m.id === state.mapId);
  boardRenderer.buildBoard(
    state.gridSize,
    state.obstacleDefs,
    map ? { mapId: map.id, theme: map.theme, bridgeCells: map.bridgeCells } : state.mapId
  );
  sceneManager.applyAtmosphere(boardRenderer.getAtmosphere() ?? DEFAULT_ATMOSPHERE);
}

function getUniqueDangerCells(state: GameStateSnapshot): GridCoord[] {
  const seen = new Set<string>();
  const cells: GridCoord[] = [];
  for (const pending of state.pendingAttacks) {
    for (const cell of pending.targetCells) {
      const key = `${cell.x},${cell.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        cells.push(cell);
      }
    }
  }
  return cells;
}

function startBattleWithSetup(setup: GameSetup): void {
  engine = new GameEngine(setup);
  const state = engine.getState();
  rebuildBoardForState(state);
  mode = 'default';
  clearHover();
  enemyStepTimer = 0;
  turnTimerSeconds = TURN_TIMER_SECONDS;
  lastTimerActiveId = null;
  lastTimerRound = 0;
  lastTimerTurnState = null;
  lastPhase = state.phase;
  campaignVictoryHandled = false;
  isMenuOpen = false;
  hudManager.hideOverlays();
  syncFromEngine();
}

function startQuickBattle(): void {
  startBattleWithSetup({ mode: 'quick-battle' });
}

function startNewCampaign(): void {
  campaignSystem.startNewCampaign();
  startBattleWithSetup(campaignSystem.createStageGameSetup());
}

function continueCampaign(): void {
  const loaded = campaignSystem.loadCampaign();
  if (!loaded) {
    hudManager.showModeMenu(null);
    return;
  }

  if (loaded.status === 'between_stages') {
    isMenuOpen = true;
    hudManager.showCampOverlay(loaded, campaignSystem.canAdvanceToNextStage());
    return;
  }

  if (loaded.status === 'completed') {
    isMenuOpen = true;
    hudManager.showCampaignCompletedOverlay();
    return;
  }

  startBattleWithSetup(campaignSystem.createStageGameSetup());
}

function handleEndTurn(): void {
  if (isMenuOpen || unitRenderer.isAnimating || engine.getState().turnState !== 'player_unit_active') {
    return;
  }
  const res = engine.endPlayerTurn();
  if (res.ok) {
    mode = 'default';
    clearHover();
    enemyStepTimer = 0.25;
    syncFromEngine();
  }
}

function handleDefend(): void {
  if (isMenuOpen || unitRenderer.isAnimating || engine.getState().turnState !== 'player_unit_active') {
    return;
  }
  const res = engine.defend();
  if (res.ok) {
    mode = 'default';
    clearHover();
    syncFromEngine();
  }
}

const hudManager = new HudManager(hudEl, {
  onSelectUnit: (_unitId) => {
    // V2.1: troca manual de unidade bloqueada pela ordem fixa de turnos.
  },
  onSetMode: (nextMode) => {
    if (isMenuOpen || unitRenderer.isAnimating || engine.getState().phase !== 'player') return;
    mode = mode === nextMode && nextMode !== 'default' ? 'default' : nextMode;
    clearHover();
    refreshHighlights();
    const state = engine.getState();
    const hasSkillTargets = state.selectedUnitId
      ? engine.getSkillTargetCells().length > 0
      : false;
    hudManager.update(state, mode, unitRenderer.isAnimating, hasSkillTargets);
  },
  onDefend: handleDefend,
  onUndoMove: () => {
    if (isMenuOpen || unitRenderer.isAnimating || engine.getState().turnState !== 'player_unit_active') {
      return;
    }
    const res = engine.undoMove();
    if (res.ok) {
      mode = 'default';
      clearHover();
      syncFromEngine();
    }
  },
  onEndTurn: handleEndTurn,
  onReset: () => {
    const current = engine.getState();
    if (current.mode === 'campaign') {
      campaignSystem.restartCurrentStage();
      startBattleWithSetup(campaignSystem.createStageGameSetup());
      return;
    }
    engine.reset();
    const newState = engine.getState();
    rebuildBoardForState(newState);
    mode = 'default';
    clearHover();
    enemyStepTimer = 0;
    turnTimerSeconds = TURN_TIMER_SECONDS;
    lastTimerActiveId = null;
    lastTimerRound = 0;
    lastTimerTurnState = null;
    campaignVictoryHandled = false;
    hudManager.hideOverlays();
    syncFromEngine();
  },
  onNewCampaign: startNewCampaign,
  onContinueCampaign: continueCampaign,
  onQuickBattle: startQuickBattle,
  onOpenMenu: () => {
    isMenuOpen = true;
    hudManager.showModeMenu(saveSystem.load());
  },
  onAllocateAttribute: (heroId, attr) => {
    const res = campaignSystem.allocateHeroAttribute(heroId, attr);
    if (res.ok) {
      hudManager.showCampOverlay(res.state, campaignSystem.canAdvanceToNextStage());
    } else {
      hudManager.showFeedback(res.reason);
    }
  },
  onAdvanceStage: () => {
    const res = campaignSystem.advanceToNextStage();
    if (!res.ok) {
      hudManager.showFeedback(res.reason);
      return;
    }
    startBattleWithSetup(campaignSystem.createStageGameSetup());
  },
  onRestartStageCheckpoint: () => {
    campaignSystem.restartCurrentStage();
    startBattleWithSetup(campaignSystem.createStageGameSetup());
  },
});

window.addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
    e.preventDefault();
    return;
  }
  if (e.repeat) return;
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 'e' || e.key === 'E') {
    handleEndTurn();
  } else if (e.key === 'g' || e.key === 'G') {
    handleDefend();
  }
});

const unitRenderer = new UnitRenderer(
  sceneManager.scene,
  boardRenderer,
  hudManager.healthBarsLayer
);

function clearHover(): void {
  hoverCell = null;
  hoverPath = null;
  hoverSkillArea = [];
}

function refreshHighlights(): void {
  const state = engine.getState();
  const dangerCells = getUniqueDangerCells(state);

  if (state.phase !== 'player' || unitRenderer.isAnimating || !state.selectedUnitId) {
    boardRenderer.setHighlights({
      reachable: [],
      attackable: [],
      skillTargets: [],
      skillArea: [],
      dangerCells,
      hoverCell: null,
      path: null,
    });
    return;
  }

  if (mode === 'skill') {
    const selected = state.units.find((u) => u.id === state.selectedUnitId);
    const skillMode = selected?.skillId ? SKILLS[selected.skillId].targetTeam : 'enemy';
    boardRenderer.setHighlights({
      reachable: [],
      attackable: [],
      skillRangeCells: engine.getSkillRangeCells(),
      skillTargets: engine.getSkillTargetCells(),
      skillArea: hoverSkillArea,
      skillMode,
      dangerCells,
      hoverCell,
      path: null,
    });
    return;
  }

  if (mode === 'attack') {
    boardRenderer.setHighlights({
      reachable: [],
      attackRangeCells: engine.getAttackRangeCells(),
      attackable: engine.getAttackableTargets().map((u) => u.pos),
      skillTargets: [],
      skillArea: [],
      dangerCells,
      hoverCell,
      path: null,
    });
    return;
  }

  boardRenderer.setHighlights({
    reachable: engine.getReachableCells(),
    attackable: engine.getAttackableTargets().map((u) => u.pos),
    skillTargets: [],
    skillArea: [],
    dangerCells,
    hoverCell,
    path: hoverPath,
  });
}

function emitCombatFeedback(events: GameEvent[]): void {
  const units = engine.getState().units;
  for (const ev of events) {
    if (ev.type === 'skillUsed') {
      const caster = units.find((u) => u.id === ev.casterId);
      if (caster) {
        hudManager.showFeedback(`${caster.name} usou ${caster.skillName ?? ev.skillId}!`);
      }
    } else if (ev.type === 'unitHealed') {
      const caster = units.find((u) => u.id === ev.casterId);
      const target = units.find((u) => u.id === ev.targetId);
      if (caster && target) {
        hudManager.showFeedback(`${caster.name} curou ${target.name} (+${ev.amount} HP)!`);
      }
    } else if (ev.type === 'unitGuarded') {
      const unit = units.find((u) => u.id === ev.unitId);
      if (unit) {
        hudManager.showFeedback(`${unit.name} assumiu postura defensiva (-50% dano)!`);
      }
    } else if (ev.type === 'attackPrepared') {
      const caster = units.find((u) => u.id === ev.pendingAttack.casterId);
      hudManager.showFeedback(
        `${caster?.name ?? 'Inimigo'} está preparando ${ev.pendingAttack.skillName}!`
      );
    } else if (ev.type === 'pendingAttackResolved') {
      const caster = units.find((u) => u.id === ev.casterId);
      hudManager.showFeedback(
        `${caster?.name ?? 'Inimigo'} desencadeou ${ev.skillName}!`
      );
    } else if (ev.type === 'attackCancelled') {
      const caster = units.find((u) => u.id === ev.casterId);
      hudManager.showFeedback(
        `Ataque anunciado de ${caster?.name ?? 'inimigo'} foi cancelado!`
      );
    } else if (ev.type === 'bossPhaseChanged') {
      const boss = units.find((u) => u.id === ev.unitId);
      hudManager.showFeedback(
        `🔥 ${boss?.name ?? 'Guardião das Cinzas'} entrou na Fase 2: Fúria das Cinzas!`
      );
    } else if (ev.type === 'unitAttacked' && !ev.skillId) {
      const attacker = units.find((u) => u.id === ev.attackerId);
      const target = units.find((u) => u.id === ev.targetId);
      if (attacker && target) {
        const guardNote = ev.wasGuarded ? ' (🛡 -50%)' : '';
        hudManager.showFeedback(`${attacker.name} causou ${ev.damage} de dano em ${target.name}${guardNote}!`);
      }
    }
  }
}

function handleCampaignVictoryIfNeeded(state: GameStateSnapshot): void {
  if (
    state.mode !== 'campaign' ||
    state.phase !== 'victory' ||
    unitRenderer.isAnimating ||
    campaignVictoryHandled
  ) {
    return;
  }

  campaignVictoryHandled = true;
  isMenuOpen = true;
  const updated = campaignSystem.completeStage(state);
  if (updated.status === 'completed') {
    hudManager.showCampaignCompletedOverlay();
  } else {
    hudManager.showCampOverlay(updated, campaignSystem.canAdvanceToNextStage());
  }
}

function updateTurnTimerState(state: GameStateSnapshot): void {
  if (state.turnState === 'player_unit_active') {
    const unitChanged = state.activeUnitId !== lastTimerActiveId;
    const roundChanged = state.round !== lastTimerRound;
    const resumedPlayer = lastTimerTurnState !== 'player_unit_active';
    if (unitChanged || roundChanged || resumedPlayer) {
      turnTimerSeconds = TURN_TIMER_SECONDS;
      lastTimerActiveId = state.activeUnitId;
      lastTimerRound = state.round;
    }
    hudManager.updateTurnTimer(Math.ceil(turnTimerSeconds));
  } else {
    hudManager.updateTurnTimer(null);
  }
  lastTimerTurnState = state.turnState;
}

function syncFromEngine(): void {
  const events = engine.consumeEvents();
  if (events.length > 0) {
    unitRenderer.enqueueEvents(events);
    emitCombatFeedback(events);
  }

  const state = engine.getState();
  if (lastPhase !== 'enemy' && state.phase === 'enemy') {
    enemyStepTimer = 0.25;
    mode = 'default';
  }
  lastPhase = state.phase;

  unitRenderer.syncUnits(state.units, state.selectedUnitId, state.turnOrder, state.activeUnitId);
  refreshHighlights();

  const hasSkillTargets = state.selectedUnitId
    ? engine.getSkillTargetCells().length > 0
    : false;
  hudManager.update(state, mode, unitRenderer.isAnimating, hasSkillTargets);
  updateTurnTimerState(state);
  handleCampaignVictoryIfNeeded(state);
}

new InputManager(
  canvas,
  sceneManager.camera,
  engineProxy,
  boardRenderer,
  unitRenderer,
  {
    getMode: () => mode,
    setMode: (nextMode) => {
      mode = nextMode;
    },
    onHoverChange: (cell, path, skillArea) => {
      hoverCell = cell;
      hoverPath = path;
      hoverSkillArea = skillArea;
      refreshHighlights();
    },
    onActionExecuted: () => {
      clearHover();
      syncFromEngine();
    },
    onFeedback: (message) => {
      hudManager.showFeedback(message);
    },
  },
  sceneManager.cameraController
);

// Initial setup: exibe seletor de modo com o cenário 3D ao fundo
const initialState = engine.getState();
rebuildBoardForState(initialState);
syncFromEngine();
hudManager.showModeMenu(saveSystem.load());

sceneManager.start((dt) => {
  boardRenderer.update(dt, sceneManager.cameraController.currentAzimuth);
  unitRenderer.update(dt, sceneManager.camera);

  const animatingNow = unitRenderer.isAnimating;
  if (wasAnimating && !animatingNow) {
    const state = engine.getState();
    const hasSkillTargets = state.selectedUnitId
      ? engine.getSkillTargetCells().length > 0
      : false;
    refreshHighlights();
    hudManager.update(state, mode, false, hasSkillTargets);
    handleCampaignVictoryIfNeeded(state);
  }
  wasAnimating = animatingNow;

  if (isMenuOpen) return;

  const state = engine.getState();
  if (state.turnState === 'player_unit_active') {
    turnTimerSeconds = Math.max(0, turnTimerSeconds - dt);
    hudManager.updateTurnTimer(Math.ceil(turnTimerSeconds));
    if (turnTimerSeconds <= 0 && !animatingNow) {
      const res = engine.endPlayerTurn();
      if (res.ok) {
        mode = 'default';
        clearHover();
        syncFromEngine();
      }
      return;
    }
  } else if (state.turnState === 'enemy_activation' && !animatingNow) {
    enemyStepTimer -= dt;
    if (enemyStepTimer <= 0) {
      const executed = engine.executeNextEnemyAction();
      syncFromEngine();
      enemyStepTimer = executed ? 0.24 : 0.05;
    }
  }
});
