import { SKILLS } from '../config/gameConfig';
import type { InteractionMode } from '../input/InputManager';
import type { GameStateSnapshot, Phase, UnitState } from '../shared/types';

export interface HudCallbacks {
  onSelectUnit: (unitId: string) => void;
  onSetMode: (mode: InteractionMode) => void;
  onEndTurn: () => void;
  onReset: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  player: 'Turno do Jogador',
  enemy: 'Turno dos Inimigos',
  victory: 'Vitória',
  defeat: 'Derrota',
};

export class HudManager {
  readonly healthBarsLayer: HTMLDivElement;

  private readonly callbacks: HudCallbacks;
  private readonly heroRosterEl: HTMLDivElement;
  private readonly phaseBadge: HTMLSpanElement;
  private readonly roundValue: HTMLSpanElement;
  private readonly enemyListEl: HTMLDivElement;
  private readonly unitCardEl: HTMLDivElement;
  private readonly moveBtn: HTMLButtonElement;
  private readonly attackBtn: HTMLButtonElement;
  private readonly skillBtn: HTMLButtonElement;
  private readonly skillIconEl: HTMLImageElement;
  private readonly skillLabelEl: HTMLSpanElement;
  private readonly skillCdEl: HTMLSpanElement;
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
            <h1 class="hud-title">Rune Tactics <span class="hud-version">V2</span></h1>
            <p class="hud-subtitle">TACTICAL RPG</p>
          </div>

          <div id="hud-hero-roster" class="hud-hero-roster" data-interactive></div>
        </div>

        <div id="hud-combat-feedback" class="hud-combat-feedback hidden"></div>

        <div class="hud-top-right">
          <div class="hud-panel hud-turn-card">
            <div class="hud-turn-row">
              <span class="hud-label">Turno:</span>
              <span id="hud-phase" class="hud-phase-badge">Turno do Jogador</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Round:</span>
              <span id="hud-round" class="hud-round-value">1</span>
            </div>
            <button id="btn-reset" class="hud-btn hud-btn-secondary hud-btn-sm" type="button" data-interactive>
              Reiniciar
            </button>
          </div>

          <div class="hud-panel hud-enemies-card">
            <div class="hud-section-title">Inimigos</div>
            <div id="hud-enemy-list" class="hud-enemy-list"></div>
          </div>
        </div>
      </div>

      <div class="hud-bottom">
        <div id="hud-unit-card" class="hud-panel hud-unit-card"></div>

        <div class="hud-action-bar-wrap" data-interactive>
          <div id="hud-controls-status" class="hud-controls-status hidden">
            Turno dos Inimigos — Controles indisponíveis
          </div>
          <div class="hud-action-bar">
            <button id="btn-move" class="hud-action-btn" type="button" title="Mover unidade selecionada">
              <img src="/assets/icons/move.svg" alt="" class="hud-action-icon" />
              <span>Mover</span>
            </button>
            <button id="btn-attack" class="hud-action-btn" type="button" title="Ataque básico">
              <img src="/assets/icons/basic-attack.svg" alt="" class="hud-action-icon" />
              <span>Atacar</span>
            </button>
            <button id="btn-skill" class="hud-action-btn hud-action-btn--skill" type="button">
              <img id="skill-btn-icon" src="/assets/icons/runic-strike.png" alt="" class="hud-action-icon" />
              <span id="skill-btn-label">Habilidade</span>
              <span id="skill-btn-cd" class="hud-skill-cd hidden"></span>
            </button>
            <button id="btn-end-turn" class="hud-action-btn hud-action-btn--end" type="button">
              <img src="/assets/icons/end-turn.png" alt="" class="hud-action-icon" />
              <span>Encerrar Turno</span>
            </button>
          </div>
        </div>

        <div class="hud-bottom-spacer"></div>
      </div>

      <div id="hud-result-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal">
          <h2 id="hud-result-title" class="hud-modal-title"></h2>
          <p id="hud-result-subtitle" class="hud-modal-subtitle"></p>
          <button id="btn-play-again" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
            Jogar Novamente
          </button>
        </div>
      </div>
    `;

    this.healthBarsLayer = container.querySelector('#health-bars') as HTMLDivElement;
    this.heroRosterEl = container.querySelector('#hud-hero-roster') as HTMLDivElement;
    this.phaseBadge = container.querySelector('#hud-phase') as HTMLSpanElement;
    this.roundValue = container.querySelector('#hud-round') as HTMLSpanElement;
    this.enemyListEl = container.querySelector('#hud-enemy-list') as HTMLDivElement;
    this.unitCardEl = container.querySelector('#hud-unit-card') as HTMLDivElement;
    this.moveBtn = container.querySelector('#btn-move') as HTMLButtonElement;
    this.attackBtn = container.querySelector('#btn-attack') as HTMLButtonElement;
    this.skillBtn = container.querySelector('#btn-skill') as HTMLButtonElement;
    this.skillIconEl = container.querySelector('#skill-btn-icon') as HTMLImageElement;
    this.skillLabelEl = container.querySelector('#skill-btn-label') as HTMLSpanElement;
    this.skillCdEl = container.querySelector('#skill-btn-cd') as HTMLSpanElement;
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
    this.endTurnBtn.addEventListener('click', () => this.callbacks.onEndTurn());
    this.resetBtn.addEventListener('click', () => this.callbacks.onReset());
    this.playAgainBtn.addEventListener('click', () => this.callbacks.onReset());
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
    }, 2400);
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

    // Phase & Round
    this.phaseBadge.textContent = PHASE_LABELS[state.phase];
    this.phaseBadge.className = `hud-phase-badge hud-phase--${state.phase}`;
    this.roundValue.textContent = String(state.round);

    this.controlsStatusEl.classList.toggle('hidden', !isEnemyPhase);
    this.unitCardEl.classList.toggle('is-locked', isEnemyPhase);

    const getStatusBadge = (unit: UnitState): { label: string; cls: string } => {
      if (!unit.alive) return { label: 'DERROTADO', cls: 'is-defeated' };
      if (unit.id === state.activeUnitId) return { label: 'EM TURNO', cls: 'is-in-turn' };
      if (unit.hasActivatedThisRound) return { label: 'CONCLUÍDO', cls: 'is-done' };
      return { label: 'AGUARDANDO', cls: 'is-waiting' };
    };

    // Hero Roster (Left Panel — informativo, sem troca manual de unidade)
    const heroes = state.units.filter((u) => u.team === 'player');
    this.heroRosterEl.innerHTML = '';
    for (const hero of heroes) {
      const card = document.createElement('div');
      const isActive = hero.id === state.activeUnitId;
      const isSelected = hero.id === (state.activeUnitId ?? state.selectedUnitId);
      const { label, cls } = getStatusBadge(hero);
      card.className = `hud-hero-item${isSelected ? ' is-selected' : ''}${isActive ? ' is-active-unit' : ''}${hero.hasActivatedThisRound ? ' is-activated' : ''}${hero.alive ? '' : ' is-dead'}`;

      const pct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
      const movePip = hero.hasMoved ? 'is-used' : 'is-ready';
      const atkPip = hero.hasAttacked ? 'is-used' : 'is-ready';

      card.innerHTML = `
        <img src="${hero.portraitPath ?? ''}" alt="${hero.name}" class="hud-hero-portrait" />
        <div class="hud-hero-info">
          <div class="hud-hero-top">
            <span class="hud-hero-name">${hero.name}</span>
            <span class="hud-hero-status ${cls}">${label}</span>
          </div>
          <div class="hud-hero-hp-row">
            <div class="hud-mini-track"><div class="hud-mini-fill" style="width:${pct}%"></div></div>
            <span class="hud-hero-hp">${hero.alive ? `${hero.hp}/${hero.maxHp}` : '0/' + hero.maxHp}</span>
            <span class="hud-hero-pips">
              <i class="pip ${movePip}" title="Mover"></i>
              <i class="pip ${atkPip}" title="Atacar"></i>
            </span>
          </div>
        </div>
      `;
      this.heroRosterEl.appendChild(card);
    }

    // Enemy List (Top-Right)
    const enemies = state.units.filter((u) => u.team === 'enemy');
    this.enemyListEl.innerHTML = '';
    for (const enemy of enemies) {
      const item = document.createElement('div');
      const isActive = enemy.id === state.activeUnitId;
      const { label, cls } = getStatusBadge(enemy);
      item.className = `hud-enemy-item${isActive ? ' is-active-unit' : ''}${enemy.alive ? '' : ' is-dead'}`;
      item.innerHTML = `
        <img src="${enemy.portraitPath ?? ''}" alt="${enemy.name}" class="hud-enemy-portrait" />
        <span class="hud-enemy-name">${enemy.name}</span>
        <span class="hud-enemy-status ${cls}">${label}</span>
        <span class="hud-enemy-hp">${enemy.alive ? `${enemy.hp}/${enemy.maxHp}` : '0/' + enemy.maxHp}</span>
      `;
      this.enemyListEl.appendChild(item);
    }

    // Selected Unit Detail Card & Action Bar (baseado em activeUnitId / selectedUnitId)
    const focusId = state.activeUnitId ?? state.selectedUnitId;
    const selected = focusId
      ? state.units.find((u) => u.id === focusId && u.alive) ?? null
      : null;

    this.renderUnitCard(selected, state.activeUnitId);
    this.updateActionBar(selected, mode, controlsLocked, hasSkillTargets);

    // Victory / Defeat Overlay (only when !isAnimating)
    if ((state.phase === 'victory' || state.phase === 'defeat') && !isAnimating) {
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

  private updateActionBar(
    selected: UnitState | null,
    mode: InteractionMode,
    controlsLocked: boolean,
    hasSkillTargets: boolean
  ): void {
    const canAct = !controlsLocked && !!selected && !selected.hasActivatedThisRound;
    this.endTurnBtn.disabled = !canAct;

    this.moveBtn.disabled = !canAct || selected.hasMoved;
    this.moveBtn.classList.toggle('is-active', mode === 'default' && !this.moveBtn.disabled);

    this.attackBtn.disabled = !canAct || selected.hasAttacked;
    this.attackBtn.classList.toggle('is-active', mode === 'attack');

    if (selected && selected.skillId) {
      const skill = SKILLS[selected.skillId];
      const isHeal = skill.targetTeam === 'ally';
      this.skillBtn.style.display = 'flex';
      this.skillIconEl.src = skill.icon ?? '/assets/icons/runic-strike.png';
      this.skillLabelEl.textContent = skill.name;
      const effectLabel = skill.heal > 0 ? `Cura: ${skill.heal}` : `Dano: ${skill.damage}`;
      const areaLabel = skill.area === 'cross' ? 'Cruz (5 células)' : 'Alvo único';
      this.skillBtn.title = `${skill.name} — ${effectLabel} | Alcance: ${skill.range} | Área: ${areaLabel} | Recarga: ${skill.cooldown}t`;
      this.skillBtn.classList.toggle('is-heal-skill', isHeal);

      if (selected.skillCooldown > 0) {
        this.skillCdEl.textContent = `CD ${selected.skillCooldown}`;
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
      this.skillBtn.classList.toggle('is-active', mode === 'skill');
    } else {
      this.skillBtn.disabled = true;
      this.skillBtn.classList.remove('is-active', 'is-heal-skill');
      this.skillLabelEl.textContent = 'Habilidade';
      this.skillCdEl.classList.add('hidden');
    }
  }

  private renderUnitCard(unit: UnitState | null, activeUnitId: string | null): void {
    if (!unit) {
      this.unitCardEl.innerHTML = `
        <div class="hud-unit-empty">
          <strong>Nenhum herói selecionado</strong>
          <span>Clique em um herói no tabuleiro ou no painel à esquerda.</span>
        </div>
      `;
      return;
    }

    const moveStatus = unit.hasMoved ? 'Usado' : 'Disponível';
    const attackStatus = unit.hasAttacked ? 'Usado' : 'Disponível';
    const actBadge =
      unit.id === activeUnitId
        ? '<span class="action-pill is-active-unit">EM TURNO</span>'
        : unit.hasActivatedThisRound
          ? '<span class="action-pill is-used">CONCLUÍDO</span>'
          : '<span class="action-pill is-ready">AGUARDANDO</span>';
    const skillInfo = unit.skillName
      ? unit.skillCooldown > 0
        ? `${unit.skillName} (CD ${unit.skillCooldown})`
        : `${unit.skillName} (Pronta)`
      : 'Nenhuma';

    this.unitCardEl.innerHTML = `
      <div class="hud-unit-card-inner">
        <img src="${unit.portraitPath ?? ''}" alt="${unit.name}" class="hud-unit-portrait" />
        <div class="hud-unit-body">
          <div class="hud-unit-header">
            <span class="hud-unit-name">${unit.name}</span>
            <span class="hud-unit-skill">${skillInfo}</span>
          </div>
          <div class="hud-unit-stats">
            <div><span>HP</span><strong>${unit.hp}/${unit.maxHp}</strong></div>
            <div><span>ATK</span><strong>${unit.damage}</strong></div>
            <div><span>MOV</span><strong>${unit.moveRange}</strong></div>
            <div><span>ALC</span><strong>${unit.attackRange}</strong></div>
          </div>
          <div class="hud-unit-actions">
            ${actBadge}
            <span class="action-pill ${unit.hasMoved ? 'is-used' : 'is-ready'}">Mover: ${moveStatus}</span>
            <span class="action-pill ${unit.hasAttacked ? 'is-used' : 'is-ready'}">Atacar: ${attackStatus}</span>
          </div>
        </div>
      </div>
    `;
  }
}
