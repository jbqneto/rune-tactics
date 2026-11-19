import {
  ATTRIBUTE_BASE_THRESHOLD,
  CAMPAIGN_STAGES,
  MAX_ATTRIBUTE,
  SKILLS,
  UNIT_STATS,
} from '../config/gameConfig';
import type { InteractionMode } from '../input/InputManager';
import { watchModalOverlays } from './modalFocus';
import { wireLandscapeButtons } from './mobileLandscape';
import type {
  AttackKind,
  AttributeKey,
  CampaignHeroProgress,
  CampaignState,
  GameMode,
  GameStateSnapshot,
  Phase,
  UnitState,
  UnitType,
} from '../shared/types';

export interface MapViewerEntry {
  id: string;
  name: string;
}

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
  onOpenMapViewer?: () => void;
  onSelectViewerMap?: (mapId: string) => void;
  onExitMapViewer?: () => void;
  onPvPBattle?: () => void;
  onForfeit?: () => void;
  onRequestRematch?: () => void;
}

const isDevEnv = import.meta.env.ENVIRONMENT === 'development';

const PHASE_LABELS: Record<Phase, string> = {
  player: 'Player',
  enemy: 'Enemies',
  victory: 'Victory',
  defeat: 'Defeat',
};

const ATTACK_KIND_LABELS: Record<AttackKind, string> = {
  melee: 'Melee',
  ranged: 'Ranged',
  magic: 'Magic',
};

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
  fort: 'FORT',
};

const ATTRIBUTE_KEYS: readonly AttributeKey[] = ['str', 'dex', 'int', 'fort'];

const UNIT_CLASS_LABELS: Record<UnitType, string> = {
  knight: 'Knight',
  archer: 'Archer',
  mage: 'Mage',
  cleric: 'Cleric',
  'melee-skeleton': 'Skeleton',
  'skeleton-archer': 'Skeleton Archer',
  'armored-skeleton': 'Armored Skeleton',
  'goblin-scout': 'Goblin Scout',
  'cultist-mage': 'Cultist Mage',
  'goblin-stalker': 'Goblin Stalker',
  'skeleton-shieldbearer': 'Skeleton Shieldbearer',
  'necromancer-acolyte': 'Necromancer Acolyte',
  'ashen-guardian': 'Ashen Guardian',
};

const ICON_MOVE = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19h14v-3l-4-2-1-6H8l1 6-4 2v3z"/><path d="M8 8V5h5v3"/></svg>`;
const ICON_ATTACK = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`;
const ICON_DEFEND = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
const ICON_UNDO = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
const ICON_END_TURN = `<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

function getAttributeGainPreview(hero: CampaignHeroProgress, attr: AttributeKey): string {
  const cur = hero.attributes[attr];
  if (cur >= MAX_ATTRIBUTE) return 'Max';

  const next = cur + 1;
  if (attr === 'fort') {
    const hpGain = next > ATTRIBUTE_BASE_THRESHOLD ? 2 : 0;
    const defCur = Math.floor(Math.max(0, cur - ATTRIBUTE_BASE_THRESHOLD) / 4);
    const defNext = Math.floor(Math.max(0, next - ATTRIBUTE_BASE_THRESHOLD) / 4);
    const parts: string[] = [];
    if (hpGain > 0) parts.push(`+${hpGain} Max HP`);
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
    if (hero.type === 'cleric' && attr === 'int') return '+1 Heal/Magic';
    return isMainAttr ? '+1 ATK' : '+1 Bonus';
  }

  const progress = Math.max(0, next - ATTRIBUTE_BASE_THRESHOLD) % 3;
  return `${progress}/3 to +1`;
}

export class HudManager {
  readonly healthBarsLayer: HTMLDivElement;

  private readonly callbacks: HudCallbacks;
  private readonly hudTopEl: HTMLDivElement;
  private readonly hudBottomEl: HTMLDivElement;
  private readonly heroRosterEl: HTMLDivElement;
  private readonly turnOrderTrackEl: HTMLDivElement;
  private readonly turnOrderOverflowEl: HTMLSpanElement;
  private readonly mapLabelEl: HTMLSpanElement;
  private readonly subtitleEl: HTMLParagraphElement;
  private readonly mapNameEl: HTMLSpanElement;
  private readonly phaseBadge: HTMLSpanElement;
  private readonly roundValue: HTMLSpanElement;
  private readonly timerRowEl: HTMLDivElement;
  private readonly timerValueEl: HTMLSpanElement;
  private readonly countdownBannerEl: HTMLDivElement;
  private readonly countdownValueEl: HTMLSpanElement;
  private readonly countdownFillEl: HTMLDivElement;
  private readonly enemyTitleEl: HTMLSpanElement;
  private readonly enemyCountEl: HTMLSpanElement;
  private readonly enemyListEl: HTMLDivElement;
  private readonly pvpPauseBannerEl: HTMLDivElement;
  private readonly pvpPauseTextEl: HTMLSpanElement;
  private readonly pvpReconnectingBannerEl: HTMLDivElement;
  private readonly pvpReconnectingTextEl: HTMLSpanElement;
  private currentMode: 'quick-battle' | 'campaign' | 'pvp' = 'quick-battle';
  private pvpOpponentInfo: { displayName?: string; actorType?: 'human' | 'mcp-agent' | string } | null = null;
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
  private readonly btnPvPBattle: HTMLButtonElement;
  private readonly btnMapViewer: HTMLButtonElement | null;
  private readonly mapViewerBarEl: HTMLDivElement | null;
  private readonly mapViewerListEl: HTMLDivElement | null;
  private readonly btnExitMapViewer: HTMLButtonElement | null;

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
            <h1 class="hud-title">Rune Tactics <span class="hud-version">V6</span></h1>
            <p class="hud-subtitle">THE ASHEN CAMPAIGN</p>
          </div>

          <div class="hud-panel hud-allies-panel">
            <div class="hud-section-title">Allies</div>
            <div id="hud-hero-roster" class="hud-hero-roster"></div>
          </div>

          <div id="hud-countdown-banner" class="hud-panel hud-countdown-banner hidden" aria-live="polite">
            <div class="hud-countdown-header">
              <span class="hud-countdown-label">⏱ Turn Timer</span>
              <span id="hud-countdown-value" class="hud-countdown-value">60s</span>
            </div>
            <div class="hud-countdown-track">
              <div id="hud-countdown-fill" class="hud-countdown-fill" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <div class="hud-center-top">
          <div id="hud-turn-order" class="hud-panel hud-turn-order" aria-label="Turn order">
            <div id="hud-turn-order-track" class="hud-turn-order-track"></div>
            <span id="hud-turn-order-overflow" class="hud-turn-overflow hidden"></span>
          </div>
          <div id="hud-combat-feedback" class="hud-combat-feedback hidden"></div>
        </div>

        <div class="hud-top-right">
          <div class="hud-panel hud-turn-card">
            <div class="hud-turn-row">
              <span id="hud-map-label" class="hud-label">Map</span>
              <span id="hud-map-name" class="hud-map-name">—</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Turn</span>
              <span id="hud-phase" class="hud-phase-badge">Player</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Round</span>
              <span id="hud-round" class="hud-round-value">1</span>
            </div>
            <div id="hud-timer-row" class="hud-turn-row">
              <span class="hud-label">Time</span>
              <span id="hud-timer-value" class="hud-turn-timer-val">60s</span>
            </div>
            <div class="hud-turn-card-actions" data-interactive>
              <button id="btn-reset" class="hud-btn hud-btn-secondary hud-btn-sm" type="button">
                Restart
              </button>
              <button id="btn-open-menu" class="hud-btn hud-btn-secondary hud-btn-sm" type="button" title="Return to mode selector">
                Menu
              </button>
            </div>

            <div class="hud-divider"></div>

            <div class="hud-enemies-header">
              <span id="hud-enemies-title" class="hud-section-title">Enemies</span>
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
            Enemy turn
          </div>
          <div class="hud-panel hud-action-bar">
            <button id="btn-move" class="hud-action-btn hud-action-btn--move" type="button" title="Move active unit">
              ${ICON_MOVE}
              <span>Move</span>
            </button>
            <button id="btn-attack" class="hud-action-btn hud-action-btn--attack" type="button" title="Basic attack">
              ${ICON_ATTACK}
              <span>Attack</span>
            </button>
            <button id="btn-skill" class="hud-action-btn hud-action-btn--skill" type="button">
              <img id="skill-btn-icon" src="/assets/icons/runic-strike.png" alt="" class="hud-action-icon" />
              <span id="skill-btn-label">Skill</span>
              <span id="skill-btn-cd" class="hud-skill-cd hidden"></span>
            </button>
            <button id="btn-defend" class="hud-action-btn hud-action-btn--defend" type="button" aria-keyshortcuts="G" title="Defensive stance: reduces incoming damage by 50% until your next activation (G)">
              ${ICON_DEFEND}
              <span>Defend</span>
              <kbd class="hud-hotkey" aria-hidden="true">G</kbd>
            </button>
            <button id="btn-undo-move" class="hud-action-btn hud-action-btn--undo" type="button" title="Undo move">
              ${ICON_UNDO}
              <span>Undo move</span>
            </button>
            <div class="hud-action-sep" aria-hidden="true"></div>
            <button id="btn-end-turn" class="hud-action-btn hud-action-btn--end" type="button" aria-keyshortcuts="E" title="End turn (E)">
              ${ICON_END_TURN}
              <span>End turn</span>
              <kbd class="hud-hotkey" aria-hidden="true">E</kbd>
            </button>
          </div>
        </div>

        <div class="hud-bottom-spacer"></div>
      </div>

      <div id="hud-pvp-pause-banner" class="hud-pvp-banner hud-pvp-pause-banner hidden" role="alert">
        <div class="hud-pvp-banner-content">
          <span class="hud-pvp-banner-icon">⚠️</span>
          <span id="hud-pvp-pause-text">Opponent disconnected — Match paused (90s reconnect window)</span>
        </div>
      </div>
      <div id="hud-pvp-reconnecting-banner" class="hud-pvp-banner hud-pvp-reconnecting-banner hidden" role="alert">
        <div class="hud-pvp-banner-content">
          <div class="hud-pvp-spinner-sm"></div>
          <span id="hud-pvp-reconnecting-text">Connection lost — reconnecting...</span>
        </div>
      </div>

      <div class="hud-viewport-warning" role="status">
        <div class="hud-panel hud-viewport-card">
          <div class="hud-rotate-icon" aria-hidden="true">⟳</div>
          <h2>Rotate to landscape</h2>
          <p>Rune Tactics is played in landscape. Turn your phone sideways, or widen the window.</p>
          <button id="btn-landscape-fullscreen" class="hud-btn hud-btn-primary hidden" type="button">
            Play fullscreen in landscape
          </button>
        </div>
      </div>

      <!-- Main Menu / Mode Selector -->
      <div id="hud-mode-menu" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-menu-modal">
          <div class="hud-menu-badge">THE ASHEN CAMPAIGN • PvE &amp; PvP</div>
          <h2 class="hud-modal-title hud-menu-title">Rune Tactics</h2>
          <p class="hud-modal-subtitle">Choose your game mode</p>
          <div class="hud-menu-actions">
            <button id="btn-new-campaign" class="hud-btn hud-btn-primary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">New Campaign</span>
              <span class="hud-menu-btn-desc">5 progressive stages, hero upgrades, and final boss</span>
            </button>
            <button id="btn-continue-campaign" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Continue Campaign</span>
              <span id="hud-continue-stage" class="hud-menu-btn-desc">No save found</span>
            </button>
            <button id="btn-quick-battle" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Quick Battle</span>
              <span class="hud-menu-btn-desc">Standalone skirmish with randomized maps</span>
            </button>
            <button id="btn-pvp-battle" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Multiplayer PvP (3v3)</span>
              <span class="hud-menu-btn-desc">Online tactical match against another player</span>
            </button>
            ${
              isDevEnv
                ? `<button id="btn-map-viewer" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn hud-menu-btn--dev" type="button">
              <span class="hud-menu-btn-title">Map Viewer (Dev)</span>
              <span class="hud-menu-btn-desc">Inspect 3D scenarios and obstacles for all maps</span>
            </button>`
                : ''
            }
          </div>
          <button id="btn-menu-fullscreen" class="hud-btn hud-btn-secondary hud-btn-sm hud-menu-fullscreen hidden" type="button">
            Fullscreen (landscape)
          </button>
        </div>
      </div>

      ${
        isDevEnv
          ? `<div id="hud-map-viewer-bar" class="hud-panel hud-map-viewer-bar hidden" data-interactive>
        <div class="hud-map-viewer-header">
          <div class="hud-map-viewer-title-wrap">
            <span class="hud-map-viewer-badge">Map Viewer (Dev)</span>
            <span class="hud-map-viewer-hint">Right-drag to rotate 360° • Scroll to zoom</span>
          </div>
          <button id="btn-exit-map-viewer" class="hud-btn hud-btn-secondary hud-btn-sm" type="button">
            Exit Map Viewer
          </button>
        </div>
        <div id="hud-map-viewer-list" class="hud-map-viewer-list"></div>
      </div>`
          : ''
      }

      <!-- Camp & Evolution between Stages -->
      <div id="hud-camp-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-camp-modal">
          <div class="hud-menu-badge">CAMP & UPGRADES</div>
          <h2 class="hud-modal-title is-victory">Stage Complete!</h2>
          <p id="hud-camp-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-camp-heroes" class="hud-camp-heroes"></div>
          <p id="hud-camp-hint" class="hud-camp-hint"></p>
          <div class="hud-modal-actions">
            <button id="btn-advance-stage" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
              Start Next Stage
            </button>
          </div>
        </div>
      </div>

      <!-- Battle Result / Final Victory / Defeat -->
      <div id="hud-result-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal">
          <h2 id="hud-result-title" class="hud-modal-title">Victory!</h2>
          <p id="hud-result-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-result-actions" class="hud-modal-actions"></div>
        </div>
      </div>
    `;

    this.healthBarsLayer = container.querySelector('#health-bars') as HTMLDivElement;
    this.hudTopEl = container.querySelector('.hud-top') as HTMLDivElement;
    this.hudBottomEl = container.querySelector('.hud-bottom') as HTMLDivElement;
    this.heroRosterEl = container.querySelector('#hud-hero-roster') as HTMLDivElement;
    this.turnOrderTrackEl = container.querySelector('#hud-turn-order-track') as HTMLDivElement;
    this.turnOrderOverflowEl = container.querySelector('#hud-turn-order-overflow') as HTMLSpanElement;
    this.mapLabelEl = container.querySelector('#hud-map-label') as HTMLSpanElement;
    this.subtitleEl = container.querySelector('.hud-subtitle') as HTMLParagraphElement;
    this.mapNameEl = container.querySelector('#hud-map-name') as HTMLSpanElement;
    this.phaseBadge = container.querySelector('#hud-phase') as HTMLSpanElement;
    this.roundValue = container.querySelector('#hud-round') as HTMLSpanElement;
    this.timerRowEl = container.querySelector('#hud-timer-row') as HTMLDivElement;
    this.timerValueEl = container.querySelector('#hud-timer-value') as HTMLSpanElement;
    this.countdownBannerEl = container.querySelector('#hud-countdown-banner') as HTMLDivElement;
    this.countdownValueEl = container.querySelector('#hud-countdown-value') as HTMLSpanElement;
    this.countdownFillEl = container.querySelector('#hud-countdown-fill') as HTMLDivElement;
    this.enemyTitleEl = container.querySelector('#hud-enemies-title') as HTMLSpanElement;
    this.enemyCountEl = container.querySelector('#hud-enemy-count') as HTMLSpanElement;
    this.enemyListEl = container.querySelector('#hud-enemy-list') as HTMLDivElement;
    watchModalOverlays(container);
    wireLandscapeButtons([
      container.querySelector<HTMLElement>('#btn-landscape-fullscreen'),
      container.querySelector<HTMLElement>('#btn-menu-fullscreen'),
    ]);
    this.pvpPauseBannerEl = container.querySelector('#hud-pvp-pause-banner') as HTMLDivElement;
    this.pvpPauseTextEl = container.querySelector('#hud-pvp-pause-text') as HTMLSpanElement;
    this.pvpReconnectingBannerEl = container.querySelector('#hud-pvp-reconnecting-banner') as HTMLDivElement;
    this.pvpReconnectingTextEl = container.querySelector('#hud-pvp-reconnecting-text') as HTMLSpanElement;
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
    this.btnPvPBattle = container.querySelector('#btn-pvp-battle') as HTMLButtonElement;
    this.btnMapViewer = container.querySelector('#btn-map-viewer') as HTMLButtonElement | null;
    this.mapViewerBarEl = container.querySelector('#hud-map-viewer-bar') as HTMLDivElement | null;
    this.mapViewerListEl = container.querySelector('#hud-map-viewer-list') as HTMLDivElement | null;
    this.btnExitMapViewer = container.querySelector('#btn-exit-map-viewer') as HTMLButtonElement | null;

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
    this.resetBtn.addEventListener('click', () => {
      if (this.currentMode === 'pvp') {
        this.callbacks.onForfeit?.();
      } else {
        this.callbacks.onReset();
      }
    });
    this.menuBtn.addEventListener('click', () => this.callbacks.onOpenMenu());

    this.btnNewCampaign.addEventListener('click', () => this.callbacks.onNewCampaign());
    this.btnContinueCampaign.addEventListener('click', () => this.callbacks.onContinueCampaign());
    this.btnQuickBattle.addEventListener('click', () => this.callbacks.onQuickBattle());
    this.btnPvPBattle.addEventListener('click', () => this.callbacks.onPvPBattle?.());
    this.btnMapViewer?.addEventListener('click', () => this.callbacks.onOpenMapViewer?.());
    this.btnExitMapViewer?.addEventListener('click', () => this.callbacks.onExitMapViewer?.());
    this.btnAdvanceStage.addEventListener('click', () => this.callbacks.onAdvanceStage());
  }

  showModeMenu(savedCampaign: CampaignState | null): void {
    this.hideMapViewer();
    this.campOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.modeMenuOverlay.classList.remove('hidden');

    if (savedCampaign) {
      this.btnContinueCampaign.disabled = false;
      const stageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === savedCampaign.currentStage);
      const stageName = stageCfg ? ` — ${stageCfg.name}` : '';
      const statusNote =
        savedCampaign.status === 'between_stages'
          ? ' (Camp)'
          : savedCampaign.status === 'completed'
            ? ' (Completed)'
            : '';
      this.continueCampaignStageEl.textContent = `Stage ${savedCampaign.currentStage}/5${stageName}${statusNote}`;
    } else {
      this.btnContinueCampaign.disabled = true;
      this.continueCampaignStageEl.textContent = 'No save found';
    }
  }

  hideModeMenu(): void {
    this.modeMenuOverlay.classList.add('hidden');
  }

  showMapViewer(maps: readonly MapViewerEntry[], selectedMapId: string): void {
    if (!this.mapViewerBarEl || !this.mapViewerListEl) return;
    this.hideOverlays();
    this.hudTopEl.classList.add('hidden');
    this.hudBottomEl.classList.add('hidden');
    this.mapViewerBarEl.classList.remove('hidden');

    this.mapViewerListEl.innerHTML = '';
    for (const map of maps) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `hud-map-viewer-chip${map.id === selectedMapId ? ' is-active' : ''}`;
      btn.textContent = map.name;
      btn.title = map.id;
      btn.addEventListener('click', () => {
        this.callbacks.onSelectViewerMap?.(map.id);
      });
      this.mapViewerListEl.appendChild(btn);
    }
  }

  hideMapViewer(): void {
    this.mapViewerBarEl?.classList.add('hidden');
    this.hudTopEl.classList.remove('hidden');
    this.hudBottomEl.classList.remove('hidden');
  }

  showCampOverlay(campaign: CampaignState, canAdvance: boolean): void {
    this.hideMapViewer();
    this.modeMenuOverlay.classList.add('hidden');
    this.resultOverlay.classList.add('hidden');
    this.campOverlay.classList.remove('hidden');

    const currentStageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === campaign.currentStage);
    const nextStageCfg = CAMPAIGN_STAGES.find((s) => s.stageNumber === campaign.currentStage + 1);
    const currentLabel = currentStageCfg
      ? `Stage ${currentStageCfg.stageNumber}/5 (${currentStageCfg.name})`
      : `Stage ${campaign.currentStage}/5`;
    const nextLabel = nextStageCfg
      ? `Stage ${nextStageCfg.stageNumber}/5 — ${nextStageCfg.name}`
      : `Stage ${campaign.currentStage + 1}/5`;

    this.campSubtitleEl.textContent = `${currentLabel} complete → Next: ${nextLabel}`;

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
              title="Increase ${ATTRIBUTE_LABELS[attr]}"
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

    this.btnAdvanceStage.textContent = `Start Stage ${campaign.currentStage + 1}`;
    this.btnAdvanceStage.disabled = !canAdvance;
    this.campHintEl.textContent = canAdvance
      ? 'All points allocated. Ready to advance!'
      : 'Allocate all available attribute points for each hero before starting the next stage.';
  }

  hideCampOverlay(): void {
    this.campOverlay.classList.add('hidden');
  }

  showCampaignCompletedOverlay(): void {
    this.hideMapViewer();
    this.modeMenuOverlay.classList.add('hidden');
    this.campOverlay.classList.add('hidden');
    this.resultOverlay.classList.remove('hidden');

    this.resultTitle.textContent = 'Campaign Complete!';
    this.resultTitle.className = 'hud-modal-title is-victory';
    this.resultSubtitle.textContent =
      'The Ashen Campaign — The Ashen Guardian has been defeated and the sanctuary purified.';

    this.renderResultButtons([
      { label: 'New Campaign', primary: true, onClick: () => this.callbacks.onNewCampaign() },
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

  setPvPOpponent(info: { displayName?: string; actorType?: 'human' | 'mcp-agent' | string } | null): void {
    this.pvpOpponentInfo = info;
    if (this.currentMode === 'pvp') {
      this.updateOpponentHeader();
    }
  }

  private updateOpponentHeader(): void {
    const isMcp = this.pvpOpponentInfo?.actorType === 'mcp-agent';
    const mcpBadge = isMcp ? ' <span class="hud-mcp-badge">[MCP]</span>' : '';
    const baseName = this.pvpOpponentInfo?.displayName && this.pvpOpponentInfo.displayName !== 'Opponent'
      ? escapeHtml(this.pvpOpponentInfo.displayName)
      : 'Opponent';

    if (isMcp) {
      this.enemyTitleEl.innerHTML = `${baseName}${mcpBadge}`;
    } else {
      this.enemyTitleEl.textContent = baseName;
    }
  }

  setPvPReconnecting(visible: boolean, message = 'Connection lost — reconnecting...'): void {
    if (!this.pvpReconnectingBannerEl) return;
    this.pvpReconnectingTextEl.textContent = message;
    this.pvpReconnectingBannerEl.classList.toggle('hidden', !visible);
  }

  setPvPPause(visible: boolean, secondsRemaining?: number): void {
    if (!this.pvpPauseBannerEl) return;
    if (secondsRemaining !== undefined && secondsRemaining > 0) {
      this.pvpPauseTextEl.textContent = `Opponent disconnected — Match paused (${Math.ceil(secondsRemaining)}s reconnect window)`;
    } else {
      this.pvpPauseTextEl.textContent = 'Opponent disconnected — Match paused (90s reconnect window)';
    }
    this.pvpPauseBannerEl.classList.toggle('hidden', !visible);
  }

  update(
    state: GameStateSnapshot,
    mode: InteractionMode,
    isAnimating: boolean,
    hasSkillTargets: boolean
  ): void {
    this.currentMode = state.mode;
    const subtitle = hudSubtitleForMode(state.mode);
    if (this.subtitleEl.textContent !== subtitle) this.subtitleEl.textContent = subtitle;
    const isPlayerTurn = state.turnState === 'player_unit_active';
    const isEnemyPhase = state.turnState === 'enemy_activation';
    const controlsLocked = !isPlayerTurn || isAnimating;

    if (state.mode === 'campaign' && state.stageNumber !== undefined && state.stageName) {
      this.mapLabelEl.textContent = 'Stage';
      this.mapNameEl.textContent = `Stage ${state.stageNumber}/5 — ${state.stageName}`;
    } else {
      this.mapLabelEl.textContent = 'Map';
      this.mapNameEl.textContent = state.mapName;
    }

    if (state.mode === 'pvp') {
      if (state.phase === 'player') {
        this.phaseBadge.textContent = 'Your Turn';
      } else if (state.phase === 'enemy') {
        this.phaseBadge.textContent = 'Opponent Turn';
      } else if (state.phase === 'victory') {
        this.phaseBadge.textContent = 'Victory!';
      } else {
        this.phaseBadge.textContent = 'Defeat!';
      }
      this.updateOpponentHeader();
      this.resetBtn.textContent = 'Forfeit';
      this.resetBtn.title = 'Forfeit match';
      this.resetBtn.classList.add('is-forfeit');

      if (state.pvp && !state.pvp.opponentConnected) {
        this.setPvPPause(true);
      } else {
        this.setPvPPause(false);
      }
    } else {
      this.phaseBadge.textContent = PHASE_LABELS[state.phase];
      this.enemyTitleEl.textContent = 'Enemies';
      this.resetBtn.textContent = 'Restart';
      this.resetBtn.title = 'Restart battle';
      this.resetBtn.classList.remove('is-forfeit');
      this.setPvPPause(false);
    }

    this.phaseBadge.className = `hud-phase-badge hud-phase--${state.phase}`;
    this.roundValue.textContent = String(state.round);

    this.controlsStatusEl.classList.toggle('hidden', !isEnemyPhase);
    this.controlsStatusEl.textContent = isEnemyPhase
      ? state.mode === 'pvp'
        ? 'Opponent turn'
        : 'Enemy turn'
      : isAnimating
        ? 'Executing action...'
        : '';

    this.renderTurnOrder(state);

    const getStatusBadge = (unit: UnitState): { label: string; cls: string } => {
      if (!unit.alive) return { label: 'DEFEATED', cls: 'is-defeated' };
      if (unit.id === state.activeUnitId) return { label: 'ACTIVE', cls: 'is-in-turn' };
      if (unit.hasActivatedThisRound) return { label: 'DONE', cls: 'is-done' };
      return { label: 'WAITING', cls: 'is-waiting' };
    };

    // Allies Panel (Left — informational, no manual unit switching)
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
              <i class="pip ${movePip}" title="Move"></i>
              <i class="pip ${atkPip}" title="Attack"></i>
            </span>
          </div>
        </div>
      `;
      this.heroRosterEl.appendChild(card);
    }

    // Compact Enemy List (Top Right)
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

    // Active Unit Card (Bottom Left)
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
      if (state.mode === 'pvp') {
        this.resultOverlay.classList.remove('hidden');
        this.resultTitle.textContent = isVictory ? 'Victory!' : 'Defeat!';
        this.resultTitle.className = `hud-modal-title ${isVictory ? 'is-victory' : 'is-defeat'}`;
        this.resultSubtitle.textContent = isVictory
          ? 'You defeated your opponent!'
          : 'Your opponent won the match.';
        this.renderResultButtons([
          {
            label: 'Rematch',
            primary: true,
            onClick: () => this.callbacks.onRequestRematch?.(),
          },
          {
            label: 'Back to Menu',
            primary: false,
            onClick: () => this.callbacks.onOpenMenu(),
          },
        ]);
      } else if (state.mode === 'campaign') {
        if (!isVictory) {
          this.resultOverlay.classList.remove('hidden');
          this.resultTitle.textContent = 'Defeat!';
          this.resultTitle.className = 'hud-modal-title is-defeat';
          this.resultSubtitle.textContent = `All heroes fell on Stage ${state.stageNumber ?? 1}/5 (Round ${state.round}).`;
          this.renderResultButtons([
            {
              label: 'Restart Stage (Checkpoint)',
              primary: true,
              onClick: () => this.callbacks.onRestartStageCheckpoint(),
            },
            {
              label: 'New Campaign',
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
        // On campaign victory, main.ts opens the Camp (Stages 1–4) or Campaign Complete (Stage 5).
      } else {
        this.resultOverlay.classList.remove('hidden');
        this.resultTitle.textContent = isVictory ? 'Victory!' : 'Defeat!';
        this.resultTitle.className = `hud-modal-title ${isVictory ? 'is-victory' : 'is-defeat'}`;
        this.resultSubtitle.textContent = isVictory
          ? `All enemies were defeated in ${state.round} round(s).`
          : `All heroes fell on round ${state.round}.`;
        this.renderResultButtons([
          { label: 'Play Again', primary: true, onClick: () => this.callbacks.onReset() },
          { label: 'Menu', primary: false, onClick: () => this.callbacks.onOpenMenu() },
        ]);
      }
    } else if (!isBattleOver) {
      this.resultOverlay.classList.add('hidden');
    }
  }

  private renderTurnOrder(state: GameStateSnapshot): void {
    this.turnOrderTrackEl.innerHTML = '';
    this.turnOrderOverflowEl.classList.add('hidden');
    this.turnOrderOverflowEl.textContent = '';
    this.turnOrderOverflowEl.title = '';
    if (state.turnOrder.length === 0) return;

    const unitMap = new Map(state.units.map((u) => [u.id, u]));
    const total = state.turnOrder.length;
    const maxItems = 6;
    const startIdx = Math.max(0, state.turnIndex % total);

    const livingCount = state.turnOrder.reduce((acc, id) => {
      const u = unitMap.get(id);
      return u && u.alive ? acc + 1 : acc;
    }, 0);
    if (livingCount === 0) return;

    const itemsToShow = Math.min(maxItems, livingCount);
    let shown = 0;
    let roundSeparatorAdded = false;
    let wrappedToNextRound = false;

    for (let offset = 0; offset < total * 2 && shown < itemsToShow; offset++) {
      const rawIndex = startIdx + offset;
      if (rawIndex >= total) {
        wrappedToNextRound = true;
      }

      const unitId = state.turnOrder[rawIndex % total];
      const unit = unitMap.get(unitId);
      if (!unit || !unit.alive) continue;

      if (wrappedToNextRound && !roundSeparatorAdded) {
        roundSeparatorAdded = true;
        const sep = document.createElement('div');
        sep.className = 'hud-turn-sep';
        sep.textContent = `R${state.round + 1}`;
        sep.title = `Round ${state.round + 1}`;
        this.turnOrderTrackEl.appendChild(sep);
      }

      const isCurrent = shown === 0 && unit.id === state.activeUnitId;
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

    if (livingCount > maxItems) {
      const extraCount = livingCount - maxItems;
      this.turnOrderOverflowEl.textContent = `+${extraCount} ›`;
      this.turnOrderOverflowEl.title = `${extraCount} more unit${extraCount === 1 ? '' : 's'} in turn order`;
      this.turnOrderOverflowEl.classList.remove('hidden');
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
      ? 'Enemy turn'
      : isAnimating
        ? 'Wait for animation'
        : 'Action unavailable';

    const canAct = !controlsLocked && !!selected && !selected.hasActivatedThisRound;

    this.moveBtn.disabled = !canAct || selected.hasMoved;
    this.moveBtn.classList.toggle('is-selected', mode === 'default' && !this.moveBtn.disabled);
    this.moveBtn.title = this.moveBtn.disabled
      ? selected?.hasMoved
        ? 'Already moved'
        : lockReason
      : 'Move active unit';

    this.attackBtn.disabled = !canAct || selected.hasAttacked;
    this.attackBtn.classList.toggle('is-selected', mode === 'attack');
    this.attackBtn.title = this.attackBtn.disabled
      ? selected?.hasAttacked
        ? 'Already attacked'
        : lockReason
      : 'Basic attack (or click an enemy for smart attack)';

    if (selected && selected.skillId) {
      const skill = SKILLS[selected.skillId];
      const isHeal = skill.targetTeam === 'ally';
      this.skillBtn.style.display = 'flex';
      this.skillIconEl.src = skill.icon ?? '/assets/icons/runic-strike.png';
      this.skillLabelEl.textContent = skill.name;
      const effectLabel = skill.heal > 0 ? `Heal: ${skill.heal}` : `Damage: ${skill.damage}`;
      const areaLabel = skill.area === 'cross' ? 'Cross (5 cells)' : 'Single target';
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
            ? 'Already acted this activation'
            : selected.skillCooldown > 0
              ? `On cooldown: ${selected.skillCooldown} round(s)`
              : 'No valid targets';
        this.skillBtn.title = `${skill.name} — ${why}`;
      } else {
        this.skillBtn.title = `${skill.name} — ${effectLabel} | Range: ${skill.range} | Area: ${areaLabel} | Cooldown: ${skill.cooldown}t`;
      }
    } else {
      this.skillBtn.disabled = true;
      this.skillBtn.classList.remove('is-selected', 'is-heal-skill');
      this.skillLabelEl.textContent = 'Skill';
      this.skillCdEl.classList.add('hidden');
      this.skillBtn.title = lockReason;
    }

    this.defendBtn.disabled = !canAct || selected.hasAttacked;
    this.defendBtn.title = this.defendBtn.disabled
      ? selected?.hasAttacked
        ? 'Already acted this activation'
        : lockReason
      : 'Defensive stance: reduces incoming damage by 50% until your next activation (G)';

    this.undoMoveBtn.disabled = !canUndoMove || isAnimating;
    this.undoMoveBtn.title = this.undoMoveBtn.disabled
      ? 'No move to undo'
      : 'Undo last move of this activation';

    this.endTurnBtn.disabled = !canAct;
    this.endTurnBtn.title = this.endTurnBtn.disabled ? lockReason : 'End turn (E)';
  }

  private renderUnitCard(unit: UnitState | null, activeUnitId: string | null): void {
    this.unitCardEl.classList.remove('is-enemy-active');
    if (!unit) {
      this.unitCardEl.innerHTML = `
        <div class="hud-unit-empty">
          <strong>Battle ended</strong>
          <span>Use the result screen options to continue.</span>
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
        ? '<span class="hud-unit-badge hud-unit-badge--guard" title="Defensive Stance: -50% incoming damage">GUARD -50%</span>'
        : '',
      unit.bossPhase === 2
        ? '<span class="hud-unit-badge hud-unit-badge--boss" title="Ashen Fury: Phase II">PHASE II</span>'
        : '',
    ]
      .filter(Boolean)
      .join('');

    const skillHtml = unit.skillName
      ? `
        <div class="hud-unit-skill-row">
          <span class="hud-unit-skill">${unit.skillName}</span>
          <span class="hud-unit-skill-cd">${
            unit.skillCooldown > 0 ? `Cooldown: ${unit.skillCooldown}t` : 'Ready'
          }</span>
        </div>
      `
      : '';

    const actionsHtml = !isEnemy && unit.id === activeUnitId
      ? `
        <div class="hud-unit-actions">
          <span class="action-pill ${unit.hasMoved ? 'is-used' : 'is-ready'}">
            <i class="pill-dot"></i>Move: ${unit.hasMoved ? 'Used' : 'Ready'}
          </span>
          <span class="action-pill ${unit.hasAttacked ? 'is-used' : 'is-ready'}">
            <i class="pill-dot"></i>Attack: ${unit.hasAttacked ? 'Used' : 'Ready'}
          </span>
        </div>
      `
      : '';

    this.unitCardEl.innerHTML = `
      <div class="hud-unit-card-inner hud-class--${unit.type}">
        <div class="hud-unit-portrait-frame hud-unit-portrait-frame--${unit.team}">
          <img src="${unit.portraitPath ?? ''}" alt="${unit.name}" class="hud-unit-portrait hud-unit-portrait--${unit.team}" />
        </div>
        <div class="hud-unit-body">
          <div class="hud-unit-header">
            <span class="hud-unit-name">${unit.name}</span>
            <span class="hud-unit-class hud-unit-crest hud-unit-crest--${unit.team}">${classLabel}</span>
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
            <div><span>RNG</span><strong>${unit.attackRange}</strong></div>
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

const HUD_SUBTITLES: Record<GameMode, string> = {
  campaign: 'THE ASHEN CAMPAIGN',
  'quick-battle': 'QUICK BATTLE',
  pvp: 'ONLINE PVP • 3v3',
};

/** Header subtitle for the active game mode. */
export function hudSubtitleForMode(mode: GameMode): string {
  return HUD_SUBTITLES[mode];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
