import { SKILLS } from '../config/gameConfig';
import type { InteractionMode } from '../input/InputManager';
import type { GameStateSnapshot, Phase, UnitState, UnitType } from '../shared/types';

export interface HudCallbacks {
  onSelectUnit: (unitId: string) => void;
  onSetMode: (mode: InteractionMode) => void;
  onUndoMove: () => void;
  onEndTurn: () => void;
  onReset: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  player: 'Jogador',
  enemy: 'Inimigos',
  victory: 'Vitória',
  defeat: 'Derrota',
};

const UNIT_CLASS_LABELS: Record<UnitType, string> = {
  knight: 'Cavaleiro',
  archer: 'Arqueira',
  mage: 'Mago',
  cleric: 'Clérigo',
  'melee-skeleton': 'Esqueleto',
  'skeleton-archer': 'Arqueiro Esqueleto',
  'armored-skeleton': 'Esqueleto Blindado',
  'goblin-scout': 'Batedor Goblin',
  'cultist-mage': 'Mago Cultista',
};

const ICON_MOVE = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19h14v-3l-4-2-1-6H8l1 6-4 2v3z"/><path d="M8 8V5h5v3"/></svg>`;
const ICON_ATTACK = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`;
const ICON_UNDO = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
const ICON_END_TURN = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

export class HudManager {
  readonly healthBarsLayer: HTMLDivElement;

  private readonly callbacks: HudCallbacks;
  private readonly heroRosterEl: HTMLDivElement;
  private readonly turnOrderTrackEl: HTMLDivElement;
  private readonly mapNameEl: HTMLSpanElement;
  private readonly phaseBadge: HTMLSpanElement;
  private readonly roundValue: HTMLSpanElement;
  private readonly timerRowEl: HTMLDivElement;
  private readonly timerValueEl: HTMLSpanElement;
  private readonly enemyCountEl: HTMLSpanElement;
  private readonly enemyListEl: HTMLDivElement;
  private readonly unitCardEl: HTMLDivElement;
  private readonly moveBtn: HTMLButtonElement;
  private readonly attackBtn: HTMLButtonElement;
  private readonly skillBtn: HTMLButtonElement;
  private readonly skillIconEl: HTMLImageElement;
  private readonly skillLabelEl: HTMLSpanElement;
  private readonly skillCdEl: HTMLSpanElement;
  private readonly undoMoveBtn: HTMLButtonElement;
  private readonly endTurnBtn: HTMLButtonElement;
  private readonly resetBtn: HTMLButtonElement;
  private readonly controlsStatusEl: HTMLDivElement;
  private readonly feedbackEl: HTMLDivElement;
  private readonly resultOverlay: HTMLDivElement;
  private readonly resultTitle: HTMLHeadingElement;
  private readonly resultSubtitle: HTMLParagraphElement;
  private readonly playAgainBtn: HTMLButtonElement;
  private feedbackTimer: number | null = null;

  constructor(container: HTMLElement, callbacks: HudCallbacks) {
    this.callbacks = callbacks;

    container.innerHTML = `
      <div id="health-bars" class="health-bars-layer"></div>

      <div class="hud-top">
        <div class="hud-left-col">
          <div class="hud-panel hud-title-card">
            <h1 class="hud-title">Rune Tactics <span class="hud-version">V3</span></h1>
            <p class="hud-subtitle">TACTICAL RPG</p>
          </div>

          <div class="hud-panel hud-allies-panel">
            <div class="hud-section-title">Aliados</div>
            <div id="hud-hero-roster" class="hud-hero-roster"></div>
          </div>
        </div>

        <div class="hud-center-top">
          <div id="hud-turn-order" class="hud-panel hud-turn-order" aria-label="Ordem de turno">
            <span class="hud-turn-order-label">Ordem de Turno</span>
            <div id="hud-turn-order-track" class="hud-turn-order-track"></div>
          </div>
          <div id="hud-combat-feedback" class="hud-combat-feedback hidden"></div>
        </div>

        <div class="hud-top-right">
          <div class="hud-panel hud-turn-card">
            <div class="hud-turn-row">
              <span class="hud-label">Mapa</span>
              <span id="hud-map-name" class="hud-map-name">—</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Turno</span>
              <span id="hud-phase" class="hud-phase-badge">Jogador</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Round</span>
              <span id="hud-round" class="hud-round-value">1</span>
            </div>
            <div id="hud-timer-row" class="hud-turn-row">
              <span class="hud-label">Tempo</span>
              <span id="hud-timer-value" class="hud-turn-timer-val">60s</span>
            </div>
            <button id="btn-reset" class="hud-btn hud-btn-secondary hud-btn-sm" type="button" data-interactive>
              Reiniciar
            </button>

            <div class="hud-divider"></div>

            <div class="hud-enemies-header">
              <span class="hud-section-title">Inimigos</span>
              <span id="hud-enemy-count" class="hud-enemy-count">0 / 0</span>
            </div>
            <div id="hud-enemy-list" class="hud-enemy-list"></div>
          </div>
        </div>
      </div>

      <div class="hud-bottom">
        <div id="hud-unit-card" class="hud-panel hud-unit-card"></div>

        <div class="hud-action-bar-wrap" data-interactive>
          <div id="hud-controls-status" class="hud-controls-status hidden">
            Vez dos inimigos
          </div>
          <div class="hud-panel hud-action-bar">
            <button id="btn-move" class="hud-action-btn hud-action-btn--move" type="button" title="Mover unidade ativa">
              ${ICON_MOVE}
              <span>Mover</span>
            </button>
            <button id="btn-attack" class="hud-action-btn hud-action-btn--attack" type="button" title="Ataque básico">
              ${ICON_ATTACK}
              <span>Atacar</span>
            </button>
            <button id="btn-skill" class="hud-action-btn hud-action-btn--skill" type="button">
              <img id="skill-btn-icon" src="/assets/icons/runic-strike.png" alt="" class="hud-action-icon" />
              <span id="skill-btn-label">Habilidade</span>
              <span id="skill-btn-cd" class="hud-skill-cd hidden"></span>
            </button>
            <button id="btn-undo-move" class="hud-action-btn hud-action-btn--undo" type="button" title="Desfazer movimento">
              ${ICON_UNDO}
              <span>Desfazer movimento</span>
            </button>
            <div class="hud-action-sep" aria-hidden="true"></div>
            <button id="btn-end-turn" class="hud-action-btn hud-action-btn--end" type="button" aria-keyshortcuts="E" title="Encerrar turno (E)">
              ${ICON_END_TURN}
              <span>Encerrar turno (E)</span>
            </button>
          </div>
        </div>

        <div class="hud-bottom-spacer"></div>
      </div>

      <div class="hud-viewport-warning" role="status">
        <div class="hud-panel hud-viewport-card">
          <h2>Janela muito estreita</h2>
          <p>Rune Tactics V3 foi projetado para desktop com largura mínima de 1024 px.</p>
        </div>
      </div>

      <div id="hud-result-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal">
          <h2 id="hud-result-title" class="hud-modal-title">Vitória!</h2>
          <p id="hud-result-subtitle" class="hud-modal-subtitle"></p>
          <button id="btn-play-again" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
            Jogar novamente
          </button>
        </div>
      </div>
    `;

    this.healthBarsLayer = container.querySelector('#health-bars') as HTMLDivElement;
    this.heroRosterEl = container.querySelector('#hud-hero-roster') as HTMLDivElement;
    this.turnOrderTrackEl = container.querySelector('#hud-turn-order-track') as HTMLDivElement;
    this.mapNameEl = container.querySelector('#hud-map-name') as HTMLSpanElement;
    this.phaseBadge = container.querySelector('#hud-phase') as HTMLSpanElement;
    this.roundValue = container.querySelector('#hud-round') as HTMLSpanElement;
    this.timerRowEl = container.querySelector('#hud-timer-row') as HTMLDivElement;
    this.timerValueEl = container.querySelector('#hud-timer-value') as HTMLSpanElement;
    this.enemyCountEl = container.querySelector('#hud-enemy-count') as HTMLSpanElement;
    this.enemyListEl = container.querySelector('#hud-enemy-list') as HTMLDivElement;
    this.unitCardEl = container.querySelector('#hud-unit-card') as HTMLDivElement;
    this.moveBtn = container.querySelector('#btn-move') as HTMLButtonElement;
    this.attackBtn = container.querySelector('#btn-attack') as HTMLButtonElement;
    this.skillBtn = container.querySelector('#btn-skill') as HTMLButtonElement;
    this.skillIconEl = container.querySelector('#skill-btn-icon') as HTMLImageElement;
    this.skillLabelEl = container.querySelector('#skill-btn-label') as HTMLSpanElement;
    this.skillCdEl = container.querySelector('#skill-btn-cd') as HTMLSpanElement;
    this.undoMoveBtn = container.querySelector('#btn-undo-move') as HTMLButtonElement;
    this.endTurnBtn = container.querySelector('#btn-end-turn') as HTMLButtonElement;
    this.resetBtn = container.querySelector('#btn-reset') as HTMLButtonElement;
    this.controlsStatusEl = container.querySelector('#hud-controls-status') as HTMLDivElement;
    this.feedbackEl = container.querySelector('#hud-combat-feedback') as HTMLDivElement;
    this.resultOverlay = container.querySelector('#hud-result-overlay') as HTMLDivElement;
    this.resultTitle = container.querySelector('#hud-result-title') as HTMLHeadingElement;
    this.resultSubtitle = container.querySelector('#hud-result-subtitle') as HTMLParagraphElement;
    this.playAgainBtn = container.querySelector('#btn-play-again') as HTMLButtonElement;

    this.moveBtn.addEventListener('click', () => this.callbacks.onSetMode('default'));
    this.attackBtn.addEventListener('click', () => this.callbacks.onSetMode('attack'));
    this.skillBtn.addEventListener('click', () => this.callbacks.onSetMode('skill'));
    this.undoMoveBtn.addEventListener('click', () => this.callbacks.onUndoMove());
    this.endTurnBtn.addEventListener('click', () => this.callbacks.onEndTurn());
    this.resetBtn.addEventListener('click', () => this.callbacks.onReset());
    this.playAgainBtn.addEventListener('click', () => this.callbacks.onReset());
  }

  updateTurnTimer(secondsRemaining: number | null): void {
    if (secondsRemaining === null) {
      this.timerRowEl.classList.add('hidden');
      return;
    }
    this.timerRowEl.classList.remove('hidden');
    const sec = Math.max(0, Math.ceil(secondsRemaining));
    this.timerValueEl.textContent = `${sec}s`;
    this.timerValueEl.classList.toggle('is-warning', sec <= 15 && sec > 5);
    this.timerValueEl.classList.toggle('is-critical', sec <= 5);
  }

  showFeedback(message: string): void {
    if (this.feedbackTimer !== null) {
      window.clearTimeout(this.feedbackTimer);
    }
    this.feedbackEl.textContent = message;
    this.feedbackEl.classList.remove('hidden');
    this.feedbackTimer = window.setTimeout(() => {
      this.feedbackEl.classList.add('hidden');
      this.feedbackTimer = null;
    }, 2000);
  }

  update(
    state: GameStateSnapshot,
    mode: InteractionMode,
    isAnimating: boolean,
    hasSkillTargets: boolean
  ): void {
    const isPlayerTurn = state.turnState === 'player_unit_active';
    const isEnemyPhase = state.turnState === 'enemy_activation';
    const controlsLocked = !isPlayerTurn || isAnimating;

    this.mapNameEl.textContent = state.mapName;
    this.phaseBadge.textContent = PHASE_LABELS[state.phase];
    this.phaseBadge.className = `hud-phase-badge hud-phase--${state.phase}`;
    this.roundValue.textContent = String(state.round);

    this.controlsStatusEl.classList.toggle('hidden', !isEnemyPhase);
    this.controlsStatusEl.textContent = isEnemyPhase
      ? 'Vez dos inimigos'
      : isAnimating
        ? 'Executando ação...'
        : '';

    this.renderTurnOrder(state);

    const getStatusBadge = (unit: UnitState): { label: string; cls: string } => {
      if (!unit.alive) return { label: 'DERROTADO', cls: 'is-defeated' };
      if (unit.id === state.activeUnitId) return { label: 'EM TURNO', cls: 'is-in-turn' };
      if (unit.hasActivatedThisRound) return { label: 'CONCLUÍDO', cls: 'is-done' };
      return { label: 'AGUARDANDO', cls: 'is-waiting' };
    };

    // Painel de Aliados (Esquerda — informativo, sem troca manual)
    const heroes = state.units.filter((u) => u.team === 'player');
    this.heroRosterEl.innerHTML = '';
    for (const hero of heroes) {
      const card = document.createElement('div');
      const isActive = hero.id === state.activeUnitId;
      const { label, cls } = getStatusBadge(hero);
      card.className = `hud-hero-item hud-class--${hero.type}${isActive ? ' is-active-unit' : ''}${hero.hasActivatedThisRound ? ' is-activated' : ''}${hero.alive ? '' : ' is-dead'}`;

      const pct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
      const isLowHp = hero.alive && pct < 35;
      const movePip = hero.hasMoved ? 'is-used' : 'is-ready';
      const atkPip = hero.hasAttacked ? 'is-used' : 'is-ready';

      card.innerHTML = `
        <img src="${hero.portraitPath ?? ''}" alt="${hero.name}" class="hud-hero-portrait" />
        <div class="hud-hero-info">
          <div class="hud-hero-top">
            <span class="hud-hero-name">${hero.name}</span>
            <span class="hud-hero-hp">${hero.hp}/${hero.maxHp}</span>
          </div>
          <div class="hud-hero-hp-row">
            <div class="hud-mini-track">
              <div class="hud-mini-fill${isLowHp ? ' is-low' : ''}" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="hud-hero-bottom">
            <span class="hud-hero-status ${cls}">${label}</span>
            <span class="hud-hero-pips">
              <i class="pip ${movePip}" title="Movimento"></i>
              <i class="pip ${atkPip}" title="Ataque"></i>
            </span>
          </div>
        </div>
      `;
      this.heroRosterEl.appendChild(card);
    }

    // Lista compacta de Inimigos (Superior Direito)
    const enemies = state.units.filter((u) => u.team === 'enemy');
    const livingEnemies = enemies.filter((u) => u.alive).length;
    this.enemyCountEl.textContent = `${livingEnemies} / ${enemies.length}`;
    this.enemyListEl.innerHTML = '';
    for (const enemy of enemies) {
      const item = document.createElement('div');
      const isActive = enemy.id === state.activeUnitId;
      const { label, cls } = getStatusBadge(enemy);
      item.className = `hud-enemy-item${isActive ? ' is-active-unit' : ''}${enemy.alive ? '' : ' is-dead'}`;
      item.innerHTML = `
        <img src="${enemy.portraitPath ?? ''}" alt="${enemy.name}" class="hud-enemy-portrait" />
        <div class="hud-enemy-info">
          <div class="hud-enemy-top">
            <span class="hud-enemy-name">${enemy.name}</span>
            <span class="hud-enemy-hp">${enemy.hp}/${enemy.maxHp}</span>
          </div>
          <div class="hud-enemy-bottom">
            <span class="hud-enemy-status ${cls}">${label}</span>
          </div>
        </div>
      `;
      this.enemyListEl.appendChild(item);
    }

    // Card da Unidade Ativa (Inferior Esquerdo)
    const isBattleOver = state.phase === 'victory' || state.phase === 'defeat';
    const focusId = isBattleOver ? null : (state.activeUnitId ?? state.selectedUnitId);
    const activeUnit = focusId
      ? state.units.find((u) => u.id === focusId && u.alive) ?? null
      : null;

    this.renderUnitCard(activeUnit, state.activeUnitId);
    this.updateActionBar(
      isPlayerTurn ? activeUnit : null,
      mode,
      controlsLocked,
      hasSkillTargets,
      state.canUndoMove,
      isAnimating,
      isEnemyPhase
    );

    if (isBattleOver && !isAnimating) {
      const isVictory = state.phase === 'victory';
      this.resultOverlay.classList.remove('hidden');
      this.resultTitle.textContent = isVictory ? 'Vitória!' : 'Derrota!';
      this.resultTitle.className = `hud-modal-title ${isVictory ? 'is-victory' : 'is-defeat'}`;
      this.resultSubtitle.textContent = isVictory
        ? `Todos os inimigos foram derrotados em ${state.round} round(s).`
        : `Todos os heróis caíram no round ${state.round}.`;
    } else {
      this.resultOverlay.classList.add('hidden');
    }
  }

  private renderTurnOrder(state: GameStateSnapshot): void {
    this.turnOrderTrackEl.innerHTML = '';
    if (state.turnOrder.length === 0) return;

    const unitMap = new Map(state.units.map((u) => [u.id, u]));
    const total = state.turnOrder.length;
    const maxItems = 8;
    const startIdx = Math.max(0, state.turnIndex % total);

    let shown = 0;
    let roundSeparatorAdded = false;

    for (let offset = 0; offset < total * 2 && shown < maxItems; offset++) {
      const rawIndex = startIdx + offset;
      if (rawIndex >= total && !roundSeparatorAdded) {
        roundSeparatorAdded = true;
        const sep = document.createElement('div');
        sep.className = 'hud-turn-sep';
        sep.textContent = `R${state.round + 1}`;
        sep.title = `Round ${state.round + 1}`;
        this.turnOrderTrackEl.appendChild(sep);
      }

      const unitId = state.turnOrder[rawIndex % total];
      const unit = unitMap.get(unitId);
      if (!unit || !unit.alive) continue;

      const isCurrent = offset === 0 && unit.id === state.activeUnitId;
      const item = document.createElement('div');
      item.className = `hud-turn-item hud-turn-item--${unit.team}${isCurrent ? ' is-current' : ''}`;
      item.title = `${unit.name} (${unit.hp}/${unit.maxHp} HP)`;
      item.innerHTML = `
        ${isCurrent ? '<span class="hud-turn-caret" aria-hidden="true">▼</span>' : ''}
        <img src="${unit.portraitPath ?? ''}" alt="${unit.name}" class="hud-turn-portrait" />
      `;
      this.turnOrderTrackEl.appendChild(item);
      shown++;
    }
  }

  private updateActionBar(
    selected: UnitState | null,
    mode: InteractionMode,
    controlsLocked: boolean,
    hasSkillTargets: boolean,
    canUndoMove: boolean,
    isAnimating: boolean,
    isEnemyPhase: boolean
  ): void {
    const lockReason = isEnemyPhase
      ? 'Vez dos inimigos'
      : isAnimating
        ? 'Aguarde a animação'
        : 'Ação indisponível';

    const canAct = !controlsLocked && !!selected && !selected.hasActivatedThisRound;

    this.moveBtn.disabled = !canAct || selected.hasMoved;
    this.moveBtn.classList.toggle('is-selected', mode === 'default' && !this.moveBtn.disabled);
    this.moveBtn.title = this.moveBtn.disabled
      ? selected?.hasMoved
        ? 'Já se moveu'
        : lockReason
      : 'Mover unidade ativa';

    this.attackBtn.disabled = !canAct || selected.hasAttacked;
    this.attackBtn.classList.toggle('is-selected', mode === 'attack');
    this.attackBtn.title = this.attackBtn.disabled
      ? selected?.hasAttacked
        ? 'Já atacou'
        : lockReason
      : 'Ataque básico (ou clique em um inimigo para ataque inteligente)';

    if (selected && selected.skillId) {
      const skill = SKILLS[selected.skillId];
      const isHeal = skill.targetTeam === 'ally';
      this.skillBtn.style.display = 'flex';
      this.skillIconEl.src = skill.icon ?? '/assets/icons/runic-strike.png';
      this.skillLabelEl.textContent = skill.name;
      const effectLabel = skill.heal > 0 ? `Cura: ${skill.heal}` : `Dano: ${skill.damage}`;
      const areaLabel = skill.area === 'cross' ? 'Cruz (5 células)' : 'Alvo único';
      this.skillBtn.classList.toggle('is-heal-skill', isHeal);

      if (selected.skillCooldown > 0) {
        this.skillCdEl.textContent = String(selected.skillCooldown);
        this.skillCdEl.classList.remove('hidden');
      } else {
        this.skillCdEl.classList.add('hidden');
      }

      const canUseSkill =
        canAct &&
        !selected.hasAttacked &&
        selected.skillCooldown === 0 &&
        hasSkillTargets;
      this.skillBtn.disabled = !canUseSkill;
      this.skillBtn.classList.toggle('is-selected', mode === 'skill');

      if (!canUseSkill) {
        const why = controlsLocked
          ? lockReason
          : selected.hasAttacked
            ? 'Já atacou nesta ativação'
            : selected.skillCooldown > 0
              ? `Em recarga: ${selected.skillCooldown} rodada(s)`
              : 'Nenhum alvo válido';
        this.skillBtn.title = `${skill.name} — ${why}`;
      } else {
        this.skillBtn.title = `${skill.name} — ${effectLabel} | Alcance: ${skill.range} | Área: ${areaLabel} | Recarga: ${skill.cooldown}t`;
      }
    } else {
      this.skillBtn.disabled = true;
      this.skillBtn.classList.remove('is-selected', 'is-heal-skill');
      this.skillLabelEl.textContent = 'Habilidade';
      this.skillCdEl.classList.add('hidden');
      this.skillBtn.title = lockReason;
    }

    this.undoMoveBtn.disabled = !canUndoMove || isAnimating;
    this.undoMoveBtn.title = this.undoMoveBtn.disabled
      ? 'Nenhum movimento para desfazer'
      : 'Desfazer último movimento desta ativação';

    this.endTurnBtn.disabled = !canAct;
    this.endTurnBtn.title = this.endTurnBtn.disabled ? lockReason : 'Encerrar turno (E)';
  }

  private renderUnitCard(unit: UnitState | null, activeUnitId: string | null): void {
    this.unitCardEl.classList.remove('is-enemy-active');
    if (!unit) {
      this.unitCardEl.innerHTML = `
        <div class="hud-unit-empty">
          <strong>Batalha encerrada</strong>
          <span>Use "Jogar novamente" para iniciar uma nova partida.</span>
        </div>
      `;
      return;
    }

    const isEnemy = unit.team === 'enemy';
    this.unitCardEl.classList.toggle('is-enemy-active', isEnemy);
    this.unitCardEl.classList.toggle('is-locked', isEnemy);

    const pct = Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100));
    const isLowHp = !isEnemy && pct < 35;
    const classLabel = UNIT_CLASS_LABELS[unit.type] ?? unit.type;

    const skillHtml = unit.skillName
      ? `
        <div class="hud-unit-skill-row">
          <span class="hud-unit-skill">${unit.skillName}</span>
          <span class="hud-unit-skill-cd">${
            unit.skillCooldown > 0 ? `Recarga: ${unit.skillCooldown}t` : 'Pronta'
          }</span>
        </div>
      `
      : '';

    const actionsHtml = !isEnemy && unit.id === activeUnitId
      ? `
        <div class="hud-unit-actions">
          <span class="action-pill ${unit.hasMoved ? 'is-used' : 'is-ready'}">
            <i class="pill-dot"></i>Movimento: ${unit.hasMoved ? 'Usado' : 'Disponível'}
          </span>
          <span class="action-pill ${unit.hasAttacked ? 'is-used' : 'is-ready'}">
            <i class="pill-dot"></i>Ataque: ${unit.hasAttacked ? 'Usado' : 'Disponível'}
          </span>
        </div>
      `
      : '';

    this.unitCardEl.innerHTML = `
      <div class="hud-unit-card-inner hud-class--${unit.type}">
        <img src="${unit.portraitPath ?? ''}" alt="${unit.name}" class="hud-unit-portrait hud-unit-portrait--${unit.team}" />
        <div class="hud-unit-body">
          <div class="hud-unit-header">
            <span class="hud-unit-name">${unit.name}</span>
            <span class="hud-unit-class">${classLabel}</span>
          </div>
          <div class="hud-unit-hp-row">
            <div class="hud-mini-track">
              <div class="hud-mini-fill${isLowHp ? ' is-low' : ''}${isEnemy ? ' is-enemy' : ''}" style="width:${pct}%"></div>
            </div>
            <span class="hud-unit-hp-val">${unit.hp} / ${unit.maxHp}</span>
          </div>
          <div class="hud-unit-stats">
            <div><span>ATK</span><strong>${unit.damage}</strong></div>
            <div><span>MOV</span><strong>${unit.moveRange}</strong></div>
            <div><span>ALC</span><strong>${unit.attackRange}</strong></div>
          </div>
          ${skillHtml}
          ${actionsHtml}
        </div>
      </div>
    `;
  }
}
