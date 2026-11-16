import './style.css';
import { SKILLS } from './config/gameConfig';
import { GameEngine } from './game/GameEngine';
import { InputManager, type InteractionMode } from './input/InputManager';
import { BoardRenderer } from './rendering/BoardRenderer';
import { SceneManager } from './rendering/SceneManager';
import { UnitRenderer } from './rendering/UnitRenderer';
import type { GameEvent, GameStateSnapshot, GridCoord, IGameEngine, Phase, TurnState } from './shared/types';
import { HudManager } from './ui/HudManager';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
const hudEl = document.getElementById('hud');

if (!canvas || !hudEl) {
  throw new Error('Elementos #game-canvas ou #hud não encontrados no DOM.');
}

const engine: IGameEngine = new GameEngine();
const sceneManager = new SceneManager(canvas);
const boardRenderer = new BoardRenderer(sceneManager.scene);

const TURN_TIMER_SECONDS = 60;

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

function handleEndTurn(): void {
  if (unitRenderer.isAnimating || engine.getState().turnState !== 'player_unit_active') return;
  const res = engine.endPlayerTurn();
  if (res.ok) {
    mode = 'default';
    clearHover();
    enemyStepTimer = 0.25;
    syncFromEngine();
  }
}

const hudManager = new HudManager(hudEl, {
  onSelectUnit: (_unitId) => {
    // V2.1: troca manual de unidade bloqueada pela ordem fixa de turnos.
  },
  onSetMode: (nextMode) => {
    if (unitRenderer.isAnimating || engine.getState().phase !== 'player') return;
    mode = mode === nextMode && nextMode !== 'default' ? 'default' : nextMode;
    clearHover();
    refreshHighlights();
    const state = engine.getState();
    const hasSkillTargets = state.selectedUnitId
      ? engine.getSkillTargetCells().length > 0
      : false;
    hudManager.update(state, mode, unitRenderer.isAnimating, hasSkillTargets);
  },
  onUndoMove: () => {
    if (unitRenderer.isAnimating || engine.getState().turnState !== 'player_unit_active') return;
    const res = engine.undoMove();
    if (res.ok) {
      mode = 'default';
      clearHover();
      syncFromEngine();
    }
  },
  onEndTurn: handleEndTurn,
  onReset: () => {
    engine.reset();
    const newState = engine.getState();
    boardRenderer.buildBoard(newState.gridSize, newState.obstacleDefs);
    mode = 'default';
    clearHover();
    enemyStepTimer = 0;
    turnTimerSeconds = TURN_TIMER_SECONDS;
    lastTimerActiveId = null;
    lastTimerRound = 0;
    lastTimerTurnState = null;
    syncFromEngine();
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
  if (state.phase !== 'player' || unitRenderer.isAnimating || !state.selectedUnitId) {
    boardRenderer.setHighlights({
      reachable: [],
      attackable: [],
      skillTargets: [],
      skillArea: [],
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
    } else if (ev.type === 'unitAttacked' && !ev.skillId) {
      const attacker = units.find((u) => u.id === ev.attackerId);
      const target = units.find((u) => u.id === ev.targetId);
      if (attacker && target) {
        hudManager.showFeedback(`${attacker.name} causou ${ev.damage} de dano em ${target.name}!`);
      }
    }
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
}

new InputManager(
  canvas,
  sceneManager.camera,
  engine,
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

// Initial setup
const initialState = engine.getState();
boardRenderer.buildBoard(initialState.gridSize, initialState.obstacleDefs);
syncFromEngine();

sceneManager.start((dt) => {
  unitRenderer.update(dt, sceneManager.camera);

  const animatingNow = unitRenderer.isAnimating;
  if (wasAnimating && !animatingNow) {
    const state = engine.getState();
    const hasSkillTargets = state.selectedUnitId
      ? engine.getSkillTargetCells().length > 0
      : false;
    refreshHighlights();
    hudManager.update(state, mode, false, hasSkillTargets);
  }
  wasAnimating = animatingNow;

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
