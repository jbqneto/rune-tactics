import './style.css';
import { SKILLS } from './config/gameConfig';
import { GameEngine } from './game/GameEngine';
import { InputManager, type InteractionMode } from './input/InputManager';
import { BoardRenderer } from './rendering/BoardRenderer';
import { SceneManager } from './rendering/SceneManager';
import { UnitRenderer } from './rendering/UnitRenderer';
import type { GameEvent, GridCoord, IGameEngine, Phase } from './shared/types';
import { HudManager } from './ui/HudManager';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
const hudEl = document.getElementById('hud');

if (!canvas || !hudEl) {
  throw new Error('Elementos #game-canvas ou #hud não encontrados no DOM.');
}

const engine: IGameEngine = new GameEngine();
const sceneManager = new SceneManager(canvas);
const boardRenderer = new BoardRenderer(sceneManager.scene);

let mode: InteractionMode = 'default';
let hoverCell: GridCoord | null = null;
let hoverPath: GridCoord[] | null = null;
let hoverSkillArea: GridCoord[] = [];
let enemyStepTimer = 0;
let wasAnimating = false;
let lastPhase: Phase = engine.getState().phase;

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
  onEndTurn: () => {
    if (unitRenderer.isAnimating) return;
    const res = engine.endPlayerTurn();
    if (res.ok) {
      mode = 'default';
      clearHover();
      enemyStepTimer = 0.25;
      syncFromEngine();
    }
  },
  onReset: () => {
    engine.reset();
    mode = 'default';
    clearHover();
    enemyStepTimer = 0;
    syncFromEngine();
  },
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

  unitRenderer.syncUnits(state.units, state.selectedUnitId, state.turnOrder);
  refreshHighlights();

  const hasSkillTargets = state.selectedUnitId
    ? engine.getSkillTargetCells().length > 0
    : false;
  hudManager.update(state, mode, unitRenderer.isAnimating, hasSkillTargets);
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
  if (state.turnState === 'enemy_activation' && !animatingNow) {
    enemyStepTimer -= dt;
    if (enemyStepTimer <= 0) {
      const executed = engine.executeNextEnemyAction();
      syncFromEngine();
      enemyStepTimer = executed ? 0.24 : 0.05;
    }
  }
});
