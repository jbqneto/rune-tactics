import {
  ATTRIBUTE_BASE_THRESHOLD,
  CAMPAIGN_STAGES,
  MAX_ATTRIBUTE,
  SKILLS,
  UNIT_STATS,
} from '../config/gameConfig';
import type { InteractionMode } from '../input/InputManager';
import type {
  AttackKind,
  AttributeKey,
  CampaignHeroProgress,
  CampaignState,
  GameStateSnapshot,
  Phase,
  UnitState,
  UnitType,
} from '../shared/types';

export interface HudCallbacks {
  onSelectUnit: (unitId: string) => void;
  onSetMode: (mode: InteractionMode) => void;
  onDefend: () => void;
  onUndoMove: () => void;
  onEndTurn: () => void;
  onReset: () => void;
  onNewCampaign: () => void;
  onContinueCampaign: () => void;
  onQuickBattle: () => void;
  onOpenMenu: () => void;
  onAllocateAttribute: (heroId: string, attr: AttributeKey) => void;
  onAdvanceStage: () => void;
  onRestartStageCheckpoint: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  player: 'Jogador',
  enemy: 'Inimigos',
  victory: 'Vitória',
  defeat: 'Derrota',
};

const ATTACK_KIND_LABELS: Record<AttackKind, string> = {
  melee: 'Físico',
  ranged: 'Distância',
  magic: 'Mágico',
};

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
  fort: 'FORT',
};

const ATTRIBUTE_KEYS: readonly AttributeKey[] = ['str', 'dex', 'int', 'fort'];

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
  'goblin-stalker': 'Espreitador Goblin',
  'skeleton-shieldbearer': 'Escudeiro Esqueleto',
  'necromancer-acolyte': 'Acólito Necromante',
  'ashen-guardian': 'Guardião das Cinzas',
};

const ICON_MOVE = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19h14v-3l-4-2-1-6H8l1 6-4 2v3z"/><path d="M8 8V5h5v3"/></svg>`;
const ICON_ATTACK = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`;
const ICON_DEFEND = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const ICON_UNDO = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
const ICON_END_TURN = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

function getAttributeGainPreview(hero: CampaignHeroProgress, attr: AttributeKey): string {
  const cur = hero.attributes[attr];
  if (cur >= MAX_ATTRIBUTE) return 'Máximo';

  const next = cur + 1;
  if (attr === 'fort') {
    const hpGain = next > ATTRIBUTE_BASE_THRESHOLD ? 2 : 0;
    const defCur = Math.floor(Math.max(0, cur - ATTRIBUTE_BASE_THRESHOLD) / 4);
    const defNext = Math.floor(Math.max(0, next - ATTRIBUTE_BASE_THRESHOLD) / 4);
    const parts: string[] = [];
    if (hpGain > 0) parts.push(`+${hpGain} HP máx`);
    if (defNext > defCur) parts.push('+1 DEF');
    return parts.length > 0 ? parts.join(', ') : `Base (${next}/${ATTRIBUTE_BASE_THRESHOLD})`;
  }

  const offCur = Math.floor(Math.max(0, cur - ATTRIBUTE_BASE_THRESHOLD) / 3);
  const offNext = Math.floor(Math.max(0, next - ATTRIBUTE_BASE_THRESHOLD) / 3);
  const stats = UNIT_STATS[hero.type];
  const isMainAttr =
    (stats.attackKind === 'melee' && attr === 'str') ||
    (stats.attackKind === 'ranged' && attr === 'dex') ||
    (stats.attackKind === 'magic' && attr === 'int');

  if (offNext > offCur) {
    if (hero.type === 'cleric' && attr === 'int') return '+1 Cura/Magia';
    return isMainAttr ? '+1 ATK' : '+1 Bônus';
  }

  const progress = Math.max(0, next - ATTRIBUTE_BASE_THRESHOLD) % 3;
  return `${progress}/3 p/ +1`;
}

export class HudManager {
  readonly healthBarsLayer: HTMLDivElement;

  private readonly callbacks: HudCallbacks;
  private readonly heroRosterEl: HTMLDivElement;
  private readonly turnOrderTrackEl: HTMLDivElement;
  private readonly mapLabelEl: HTMLSpanElement;
  private readonly mapNameEl: HTMLSpanElement;
  private readonly phaseBadge: HTMLSpanElement;
  private readonly roundValue: HTMLSpanElement;
  private readonly timerRowEl: HTMLDivElement;
  private readonly timerValueEl: HTMLSpanElement;
  private readonly countdownBannerEl: HTMLDivElement;
  private readonly countdownValueEl: HTMLSpanElement;
  private readonly countdownFillEl: HTMLDivElement;
  private readonly enemyCountEl: HTMLSpanElement;
  private readonly enemyListEl: HTMLDivElement;
  private readonly unitCardEl: HTMLDivElement;
  private readonly moveBtn: HTMLButtonElement;
  private readonly attackBtn: HTMLButtonElement;
  private readonly skillBtn: HTMLButtonElement;
  private readonly skillIconEl: HTMLImageElement;
  private readonly skillLabelEl: HTMLSpanElement;
  private readonly skillCdEl: HTMLSpanElement;
  private readonly defendBtn: HTMLButtonElement;
  private readonly undoMoveBtn: HTMLButtonElement;
  private readonly endTurnBtn: HTMLButtonElement;
  private readonly resetBtn: HTMLButtonElement;
  private readonly menuBtn: HTMLButtonElement;
  private readonly controlsStatusEl: HTMLDivElement;
  private readonly feedbackEl: HTMLDivElement;

  // Overlays
  private readonly modeMenuOverlay: HTMLDivElement;
  private readonly btnNewCampaign: HTMLButtonElement;
  private readonly btnContinueCampaign: HTMLButtonElement;
  private readonly continueCampaignStageEl: HTMLSpanElement;
  private readonly btnQuickBattle: HTMLButtonElement;

  private readonly campOverlay: HTMLDivElement;
  private readonly campSubtitleEl: HTMLParagraphElement;
  private readonly campHeroesEl: HTMLDivElement;
  private readonly campHintEl: HTMLParagraphElement;
  private readonly btnAdvanceStage: HTMLButtonElement;

  private readonly resultOverlay: HTMLDivElement;
  private readonly resultTitle: HTMLHeadingElement;
  private readonly resultSubtitle: HTMLParagraphElement;
  private readonly resultActionsEl: HTMLDivElement;

  private feedbackTimer: number | null = null;

  constructor(container: HTMLElement, callbacks: HudCallbacks) {
    this.callbacks = callbacks;

    container.innerHTML = `
      <div id="health-bars" class="health-bars-layer"></div>

      <div class="hud-top">
        <div class="hud-left-col">
          <div class="hud-panel hud-title-card">
            <h1 class="hud-title">Rune Tactics <span class="hud-version">V4</span></h1>
            <p class="hud-subtitle">THE ASHEN CAMPAIGN</p>
          </div>

          <div class="hud-panel hud-allies-panel">
            <div class="hud-section-title">Aliados</div>
            <div id="hud-hero-roster" class="hud-hero-roster"></div>
          </div>

          <div id="hud-countdown-banner" class="hud-panel hud-countdown-banner hidden" aria-live="polite">
            <div class="hud-countdown-header">
              <span class="hud-countdown-label">⏱ Tempo do Turno</span>
              <span id="hud-countdown-value" class="hud-countdown-value">60s</span>
            </div>
            <div class="hud-countdown-track">
              <div id="hud-countdown-fill" class="hud-countdown-fill" style="width: 100%"></div>
            </div>
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
              <span id="hud-map-label" class="hud-label">Mapa</span>
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
            <div class="hud-turn-card-actions" data-interactive>
              <button id="btn-reset" class="hud-btn hud-btn-secondary hud-btn-sm" type="button">
                Reiniciar
              </button>
              <button id="btn-open-menu" class="hud-btn hud-btn-secondary hud-btn-sm" type="button" title="Voltar ao seletor de modo">
                Menu
              </button>
            </div>

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
            <button id="btn-defend" class="hud-action-btn hud-action-btn--defend" type="button" aria-keyshortcuts="G" title="Postura defensiva: reduz dano recebido em 50% até sua próxima ativação (G)">
              ${ICON_DEFEND}
              <span>Defender (G)</span>
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
          <p>Rune Tactics V4 foi projetado para desktop com largura mínima de 1024 px.</p>
        </div>
      </div>

      <!-- Menu Inicial / Seletor de Modo -->
      <div id="hud-mode-menu" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-menu-modal">
          <div class="hud-menu-badge">V4 • THE ASHEN CAMPAIGN</div>
          <h2 class="hud-modal-title hud-menu-title">Rune Tactics</h2>
          <p class="hud-modal-subtitle">Escolha seu modo de jogo</p>
          <div class="hud-menu-actions">
            <button id="btn-new-campaign" class="hud-btn hud-btn-primary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Nova Campanha</span>
              <span class="hud-menu-btn-desc">5 fases progressivas, evolução e chefe final</span>
            </button>
            <button id="btn-continue-campaign" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Continuar Campanha</span>
              <span id="hud-continue-stage" class="hud-menu-btn-desc">Nenhum save encontrado</span>
            </button>
            <button id="btn-quick-battle" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Batalha Rápida</span>
              <span class="hud-menu-btn-desc">Combate avulso com mapas sorteados</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Acampamento & Evolução entre Fases -->
      <div id="hud-camp-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-camp-modal">
          <div class="hud-menu-badge">ACAMPAMENTO & EVOLUÇÃO</div>
          <h2 class="hud-modal-title is-victory">Fase Concluída!</h2>
          <p id="hud-camp-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-camp-heroes" class="hud-camp-heroes"></div>
          <p id="hud-camp-hint" class="hud-camp-hint"></p>
          <div class="hud-modal-actions">
            <button id="btn-advance-stage" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
              Iniciar Próxima Fase
            </button>
          </div>
        </div>
      </div>

      <!-- Resultado de Batalha / Vitória Final / Derrota -->
      <div id="hud-result-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal">
          <h2 id="hud-result-title" class="hud-modal-title">Vitória!</h2>
          <p id="hud-result-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-result-actions" class="hud-modal-actions"></div>
        </div>
      </div>
    `;

    this.healthBarsLayer = container.querySelector('#health-bars') as HTMLDivElement;
    this.heroRosterEl = container.querySelector('#hud-hero-roster') as HTMLDivElement;
    this.turnOrderTrackEl = container.querySelector('#hud-turn-order-track') as HTMLDivElement;
    this.mapLabelEl = container.querySelector('#hud-map-label') as HTMLSpanElement;
    this.mapNameEl = container.querySelector('#hud-map-name') as HTMLSpanElement;
    this.phaseBadge = container.querySelector('#hud-phase') as HTMLSpanElement;
    this.roundValue = container.querySelector('#hud-round') as HTMLSpanElement;
    this.timerRowEl = container.querySelector('#hud-timer-row') as HTMLDivElement;
    this.timerValueEl = container.querySelector('#hud-timer-value') as HTMLSpanElement;
    this.countdownBannerEl = container.querySelector('#hud-countdown-banner') as HTMLDivElement;
    this.countdownValueEl = container.querySelector('#hud-countdown-value') as HTMLSpanElement;
    this.countdownFillEl = container.querySelector('#hud-countdown-fill') as HTMLDivElement;
    this.enemyCountEl = container.querySelector('#hud-enemy-count') as HTMLSpanElement;
    this.enemyListEl = container.querySelector('#hud-enemy-list') as HTMLDivElement;
    this.unitCardEl = container.querySelector('#hud-unit-card') as HTMLDivElement;
    this.moveBtn = container.querySelector('#btn-move') as HTMLButtonElement;
    this.attackBtn = container.querySelector('#btn-attack') as HTMLButtonElement;
    this.skillBtn = container.querySelector('#btn-skill') as HTMLButtonElement;
    this.skillIconEl = container.querySelector('#skill-btn-icon') as HTMLImageElement;
    this.skillLabelEl = container.querySelector('#skill-btn-label') as HTMLSpanElement;
    this.skillCdEl = container.querySelector('#skill-btn-cd') as HTMLSpanElement;
    this.defendBtn = container.querySelector('#btn-defend') as HTMLButtonElement;
    this.undoMoveBtn = container.querySelector('#btn-undo-move') as HTMLButtonElement;
    this.endTurnBtn = container.querySelector('#btn-end-turn') as HTMLButtonElement;
    this.resetBtn = container.querySelector('#btn-reset') as HTMLButtonElement;
    this.menuBtn = container.querySelector('#btn-open-menu') as HTMLButtonElement;
    this.controlsStatusEl = container.querySelector('#hud-controls-status') as HTMLDivElement;
    this.feedbackEl = container.querySelector('#hud-combat-feedback') as HTMLDivElement;

    this.modeMenuOverlay = container.querySelector('#hud-mode-menu') as HTMLDivElement;
    this.btnNewCampaign = container.querySelector('#btn-new-campaign') as HTMLButtonElement;
    this.btnContinueCampaign = container.querySelector('#btn-continue-campaign') as HTMLButtonElement;
    this.continueCampaignStageEl = container.querySelector('#hud-continue-stage') as HTMLSpanElement;
    this.btnQuickBattle = container.querySelector('#btn-quick-battle') as HTMLButtonElement;

    this.campOverlay = container.querySelector('#hud-camp-overlay') as HTMLDivElement;
    this.campSubtitleEl = container.querySelector('#hud-camp-subtitle') as HTMLParagraphElement;
    this.campHeroesEl = container.querySelector('#hud-camp-heroes') as HTMLDivElement;
    this.campHintEl = container.querySelector('#hud-camp-hint') as HTMLParagraphElement;
    this.btnAdvanceStage = container.querySelector('#btn-advance-stage') as HTMLButtonElement;

    this.resultOverlay = container.querySelector('#hud-result-overlay') as HTMLDivElement;
    this.resultTitle = container.querySelector('#hud-result-title') as HTMLHeadingElement;
    this.resultSubtitle = container.querySelector('#hud-result-subtitle') as HTMLParagraphElement;
    this.resultActionsEl = container.querySelector('#hud-result-actions') as HTMLDivElement;

    this.moveBtn.addEventListener('click', () => this.callbacks.onSetMode('default'));
    this.attackBtn.addEventListener('click', () => this.callbacks.onSetMode('attack'));
    this.skillBtn.addEventListener('click', () => this.callbacks.onSetMode('skill'));
    this.defendBtn.addEventListener('click', () => this.callbacks.onDefend());
    this.undoMoveBtn.addEventListener('click', () => this.callbacks.onUndoMove());
    this.endTurnBtn.addEventListener('click', () => this.callbacks.onEndTurn());
    this.resetBtn.addEventListener('click', () => this.callbacks.onReset());
    this.menuBtn.addEventListener('click', () => this.callbacks.onOpenMenu());

    this.btnNewCampaign.addEventListener('click', () => this.callbacks.onNewCampaign());
    this.btnContinueCampaign.addEventListener('click', () => this.callbacks.onContinueCampaign());
    this.btnQuickBattle.addEventListener('click', () => this.callbacks.onQuickBattle());
    this.btnAdvanceStage.addEventListener('click', () => this.callbacks.onAdvanceStage());
  }

  showModeMenu(savedCampaign: CampaignState | null): void {
    this.campOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.modeMenuOverlay.classList.remove('hidden');

    if (savedCampaign) {
      this.btnContinueCampaign.disabled = false;
      const stageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === savedCampaign.currentStage);
      const stageName = stageCfg ? ` — ${stageCfg.name}` : '';
      const statusNote =
        savedCampaign.status === 'between_stages'
          ? ' (Acampamento)'
          : savedCampaign.status === 'completed'
            ? ' (Concluída)'
            : '';
      this.continueCampaignStageEl.textContent = `Fase ${savedCampaign.currentStage}/5${stageName}${statusNote}`;
    } else {
      this.btnContinueCampaign.disabled = true;
      this.continueCampaignStageEl.textContent = 'Nenhum save encontrado';
    }
  }

  hideModeMenu(): void {
    this.modeMenuOverlay.classList.add('hidden');
  }

  showCampOverlay(campaign: CampaignState, canAdvance: boolean): void {
    this.modeMenuOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.campOverlay.classList.remove('hidden');

    const currentStageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === campaign.currentStage);
    const nextStageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === campaign.currentStage + 1);
    const currentLabel = currentStageCfg
      ? `Fase ${currentStageCfg.stageNumber}/5 (${currentStageCfg.name})`
      : `Fase ${campaign.currentStage}/5`;
    const nextLabel = nextStageCfg
      ? `Fase ${nextStageCfg.stageNumber}/5 — ${nextStageCfg.name}`
      : `Fase ${campaign.currentStage + 1}/5`;

    this.campSubtitleEl.textContent = `${currentLabel} concluída → Próxima: ${nextLabel}`;

    this.campHeroesEl.innerHTML = '';
    for (const hero of campaign.heroes) {
      const stats = UNIT_STATS[hero.type];
      const card = document.createElement('div');
      card.className = `hud-camp-hero hud-class--${hero.type}`;

      const hpPct = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
      const attrsHtml = ATTRIBUTE_KEYS.map((attr) => {
        const val = hero.attributes[attr];
        const disabled = hero.unspentPoints <= 0 || val >= MAX_ATTRIBUTE;
        const preview = getAttributeGainPreview(hero, attr);
        return `
          <div class="hud-camp-attr-row">
            <div class="hud-camp-attr-info">
              <span class="hud-camp-attr-name">${ATTRIBUTE_LABELS[attr]}</span>
              <strong class="hud-camp-attr-val">${val}</strong>
              <span class="hud-camp-attr-preview">${preview}</span>
            </div>
            <button
              class="hud-camp-plus-btn"
              type="button"
              data-hero-id="${hero.id}"
              data-attr="${attr}"
              ${disabled ? 'disabled' : ''}
              title="Aumentar ${ATTRIBUTE_LABELS[attr]}"
            >+</button>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="hud-camp-hero-header">
          <img src="${stats.portraitPath ?? ''}" alt="${stats.name}" class="hud-camp-portrait" />
          <div class="hud-camp-hero-meta">
            <div class="hud-camp-hero-title-row">
              <strong class="hud-camp-hero-name">${stats.name}</strong>
              <span class="hud-camp-points ${hero.unspentPoints > 0 ? 'has-points' : ''}">
                ${hero.unspentPoints} pt${hero.unspentPoints === 1 ? '' : 's'}
              </span>
            </div>
            <div class="hud-camp-hp-row">
              <div class="hud-mini-track">
                <div class="hud-mini-fill" style="width:${hpPct}%"></div>
              </div>
              <span class="hud-camp-hp-val">${hero.hp}/${hero.maxHp} HP</span>
            </div>
          </div>
        </div>
        <div class="hud-camp-attrs">${attrsHtml}</div>
      `;

      const plusBtns = card.querySelectorAll<HTMLButtonElement>('.hud-camp-plus-btn');
      plusBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const heroId = btn.dataset.heroId;
          const attr = btn.dataset.attr as AttributeKey | undefined;
          if (heroId && attr) {
            this.callbacks.onAllocateAttribute(heroId, attr);
          }
        });
      });

      this.campHeroesEl.appendChild(card);
    }

    this.btnAdvanceStage.textContent = `Iniciar Fase ${campaign.currentStage + 1}`;
    this.btnAdvanceStage.disabled = !canAdvance;
    this.campHintEl.textContent = canAdvance
      ? 'Todos os pontos foram distribuídos. Pronto para avançar!'
      : 'Distribua os pontos disponíveis de cada herói antes de iniciar a próxima fase.';
  }

  hideCampOverlay(): void {
    this.campOverlay.classList.add('hidden');
  }

  showCampaignCompletedOverlay(): void {
    this.modeMenuOverlay.classList.add('hidden');
    this.campOverlay.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');

    this.resultTitle.textContent = 'Campanha Concluída!';
    this.resultTitle.className = 'hud-modal-title is-victory';
    this.resultSubtitle.textContent =
      'The Ashen Campaign — O Guardião das Cinzas foi derrotado e o santuário purificado.';

    this.renderResultButtons([
      { label: 'Nova campanha', primary: true, onClick: () => this.callbacks.onNewCampaign() },
      { label: 'Menu', primary: false, onClick: () => this.callbacks.onOpenMenu() },
    ]);
  }

  hideOverlays(): void {
    this.modeMenuOverlay.classList.add('hidden');
    this.campOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
  }

  private renderResultButtons(
    buttons: Array<{ label: string; primary: boolean; onClick: () => void }>
  ): void {
    this.resultActionsEl.innerHTML = '';
    for (const cfg of buttons) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `hud-btn ${cfg.primary ? 'hud-btn-primary' : 'hud-btn-secondary'} hud-btn-lg`;
      btn.textContent = cfg.label;
      btn.addEventListener('click', cfg.onClick);
      this.resultActionsEl.appendChild(btn);
    }
  }

  updateTurnTimer(secondsRemaining: number | null): void {
    if (secondsRemaining === null) {
      this.timerRowEl.classList.add('hidden');
      this.countdownBannerEl.classList.add('hidden');
      return;
    }
    this.timerRowEl.classList.remove('hidden');
    this.countdownBannerEl.classList.remove('hidden');
    const sec = Math.max(0, Math.ceil(secondsRemaining));
    const pct = Math.max(0, Math.min(100, (sec / 60) * 100));
    const isWarn = sec <= 15 && sec > 5;
    const isCrit = sec <= 5;

    this.timerValueEl.textContent = `${sec}s`;
    this.timerValueEl.classList.toggle('is-warning', isWarn);
    this.timerValueEl.classList.toggle('is-critical', isCrit);

    this.countdownValueEl.textContent = `${sec}s`;
    this.countdownFillEl.style.width = `${pct}%`;
    this.countdownBannerEl.classList.toggle('is-warning', isWarn);
    this.countdownBannerEl.classList.toggle('is-critical', isCrit);
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

    if (state.mode === 'campaign' && state.stageNumber !== undefined && state.stageName) {
      this.mapLabelEl.textContent = 'Fase';
      this.mapNameEl.textContent = `Fase ${state.stageNumber}/5 — ${state.stageName}`;
    } else {
      this.mapLabelEl.textContent = 'Mapa';
      this.mapNameEl.textContent = state.mapName;
    }

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
      if (state.mode === 'campaign') {
        if (!isVictory) {
          this.resultOverlay.classList.remove('hidden');
          this.resultTitle.textContent = 'Derrota!';
          this.resultTitle.className = 'hud-modal-title is-defeat';
          this.resultSubtitle.textContent = `Todos os heróis caíram na Fase ${state.stageNumber ?? 1}/5 (round ${state.round}).`;
          this.renderResultButtons([
            {
              label: 'Reiniciar fase (Checkpoint)',
              primary: true,
              onClick: () => this.callbacks.onRestartStageCheckpoint(),
            },
            {
              label: 'Nova campanha',
              primary: false,
              onClick: () => this.callbacks.onNewCampaign(),
            },
            {
              label: 'Menu',
              primary: false,
              onClick: () => this.callbacks.onOpenMenu(),
            },
          ]);
        }
        // Em vitória de campanha, main.ts abre o Acampamento (Fases 1–4) ou Campanha Concluída (Fase 5).
      } else {
        this.resultOverlay.classList.remove('hidden');
        this.resultTitle.textContent = isVictory ? 'Vitória!' : 'Derrota!';
        this.resultTitle.className = `hud-modal-title ${isVictory ? 'is-victory' : 'is-defeat'}`;
        this.resultSubtitle.textContent = isVictory
          ? `Todos os inimigos foram derrotados em ${state.round} round(s).`
          : `Todos os heróis caíram no round ${state.round}.`;
        this.renderResultButtons([
          { label: 'Jogar novamente', primary: true, onClick: () => this.callbacks.onReset() },
          { label: 'Menu', primary: false, onClick: () => this.callbacks.onOpenMenu() },
        ]);
      }
    } else if (!isBattleOver) {
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

    this.defendBtn.disabled = !canAct || selected.hasAttacked;
    this.defendBtn.title = this.defendBtn.disabled
      ? selected?.hasAttacked
        ? 'Já agiu nesta ativação'
        : lockReason
      : 'Postura defensiva: reduz dano recebido em 50% até sua próxima ativação (G)';

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
          <span>Use as opções da tela de resultado para continuar.</span>
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
    const attackKindLabel = ATTACK_KIND_LABELS[unit.attackKind] ?? unit.attackKind;

    const badgesHtml = [
      unit.isGuarding
        ? '<span class="hud-unit-badge hud-unit-badge--guard">🛡 Postura Defensiva (-50%)</span>'
        : '',
      unit.bossPhase === 2
        ? '<span class="hud-unit-badge hud-unit-badge--boss">🔥 Fase 2: Fúria das Cinzas</span>'
        : '',
    ]
      .filter(Boolean)
      .join('');

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
            <div><span>ATK (${attackKindLabel})</span><strong>${unit.damage}</strong></div>
            <div><span>DEF</span><strong>${unit.armor}</strong></div>
            <div><span>MOV</span><strong>${unit.moveRange}</strong></div>
            <div><span>ALC</span><strong>${unit.attackRange}</strong></div>
          </div>
          <div class="hud-unit-attrs">
            <span>STR <strong>${unit.attributes.str}</strong></span>
            <span>DEX <strong>${unit.attributes.dex}</strong></span>
            <span>INT <strong>${unit.attributes.int}</strong></span>
            <span>FORT <strong>${unit.attributes.fort}</strong></span>
          </div>
          ${badgesHtml ? `<div class="hud-unit-badges">${badgesHtml}</div>` : ''}
          ${skillHtml}
          ${actionsHtml}
        </div>
      </div>
    `;
  }
}
