import type { PlayerSeat, PvPHeroClass } from '../shared/pvpTypes';

export interface PvPLobbyCallbacks {
  onCreateRoom: (displayName: string) => Promise<void> | void;
  onJoinRoom: (inviteCode: string, displayName: string) => Promise<void> | void;
  onReconnect: () => Promise<void> | void;
  onDiscardReconnect: () => void;
  onSelectClasses: (classes: PvPHeroClass[]) => void;
  onToggleReady: (ready: boolean) => void;
  onLeaveRoom: () => void;
  onBackToMenu: () => void;
}

export interface OpponentDraftInfo {
  displayName: string;
  connected: boolean;
  ready: boolean;
  selectedCount: number;
  actorType?: 'human' | 'mcp-agent' | string;
}

interface HeroClassDef {
  id: PvPHeroClass;
  name: string;
  role: string;
  hp: number;
  attack: string;
  skillName: string;
  skillDesc: string;
  portrait: string;
}

const HERO_CLASSES: readonly HeroClassDef[] = [
  {
    id: 'knight',
    name: 'Knight',
    role: 'Frontline Bruiser',
    hp: 12,
    attack: 'Melee (2 dmg)',
    skillName: 'Runic Strike',
    skillDesc: '4 single-target damage',
    portrait: '/assets/portraits/knight.png',
  },
  {
    id: 'archer',
    name: 'Archer',
    role: 'Ranged Striker',
    hp: 8,
    attack: 'Ranged (2 dmg, rng 3)',
    skillName: 'Marked Shot',
    skillDesc: '3 single-target damage (rng 3)',
    portrait: '/assets/portraits/archer.png',
  },
  {
    id: 'mage',
    name: 'Mage',
    role: 'Area Caster',
    hp: 7,
    attack: 'Magic (2 dmg, rng 2)',
    skillName: 'Arcane Burst',
    skillDesc: '2 damage in 5-cell cross',
    portrait: '/assets/portraits/mage.png',
  },
  {
    id: 'cleric',
    name: 'Cleric',
    role: 'Support / Off-Tank',
    hp: 9,
    attack: 'Melee (2 dmg)',
    skillName: 'Healing Light',
    skillDesc: '3 HP ally heal (rng 3)',
    portrait: '/assets/portraits/cleric.png',
  },
];

interface FocusableDraftControl {
  id: string;
  getAttribute(name: string): string | null;
  classList: { contains(token: string): boolean };
}

/** Stable selector for a focused draft control, so focus survives innerHTML re-renders. */
export function draftFocusSelector(el: FocusableDraftControl | null | undefined): string | null {
  if (!el) return null;
  const classId = el.getAttribute('data-class-id');
  if (classId) return `[data-class-id="${classId}"]`;
  const slot = el.getAttribute('data-slot');
  for (const cls of ['btn-slot-up', 'btn-slot-down']) {
    if (slot !== null && el.classList.contains(cls)) return `.${cls}[data-slot="${slot}"]`;
  }
  return el.id ? `#${el.id}` : null;
}

export class PvPLobbyOverlay {
  private readonly container: HTMLElement;
  private readonly callbacks: PvPLobbyCallbacks;

  private overlayEl!: HTMLDivElement;
  private currentView: 'none' | 'lobby' | 'waiting' | 'draft' = 'none';

  private activeSeat: PlayerSeat = 'A';
  private selectedClasses: PvPHeroClass[] = ['knight', 'archer', 'mage'];
  private isReady = false;
  private currentInviteCode: string | null = null;
  private opponentInfo: OpponentDraftInfo = {
    displayName: 'Waiting for opponent...',
    connected: false,
    ready: false,
    selectedCount: 0,
    actorType: 'human',
  };
  private myActorType: 'human' | 'mcp-agent' = 'human';

  constructor(parent: HTMLElement, callbacks: PvPLobbyCallbacks) {
    this.container = parent;
    this.callbacks = callbacks;
    this.buildDom();
  }

  private buildDom(): void {
    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'hud-pvp-overlay';
    this.overlayEl.className = 'hud-overlay hidden';
    this.overlayEl.setAttribute('data-interactive', '');
    this.container.appendChild(this.overlayEl);
  }

  showLobby(hasReconnectToken: boolean, initialInviteCode?: string): void {
    this.currentView = 'lobby';
    this.isReady = false;
    this.currentInviteCode = null;
    this.overlayEl.classList.remove('hidden');

    const storedName = (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('rune_tactics_player_name')
      : null) ?? 'Commander';

    this.overlayEl.innerHTML = `
      <div class="hud-modal hud-pvp-modal">
        <div class="hud-menu-badge">MULTIPLAYER PVP • 3v3</div>
        <h2 class="hud-modal-title hud-menu-title">Online Battle</h2>
        <p class="hud-modal-subtitle">Command 3 heroes in turn-based tactical combat</p>

        <div id="pvp-error-banner" class="hud-pvp-error hidden"></div>

        <div class="hud-pvp-name-row">
          <label for="pvp-player-name" class="hud-pvp-label">Player Name:</label>
          <input
            id="pvp-player-name"
            class="hud-pvp-input"
            type="text"
            maxlength="20"
            value="${escapeHtml(storedName)}"
            placeholder="Commander"
          />
        </div>

        ${
          hasReconnectToken
            ? `
          <div class="hud-pvp-reconnect-card">
            <div class="hud-pvp-reconnect-title">Active Match Detected</div>
            <p class="hud-pvp-reconnect-desc">An active session was found in this browser.</p>
            <div class="hud-pvp-reconnect-actions">
              <button id="btn-pvp-reconnect" class="hud-btn hud-btn-primary hud-btn-sm" type="button">
                Reconnect
              </button>
              <button id="btn-pvp-discard-reconnect" class="hud-btn hud-btn-secondary hud-btn-sm" type="button">
                Discard
              </button>
            </div>
          </div>
          `
            : ''
        }

        <div class="hud-pvp-lobby-grid">
          <div class="hud-pvp-lobby-card">
            <h3 class="hud-pvp-card-title">Create Match</h3>
            <p class="hud-pvp-card-desc">Generate a private Room ID and invite a friend.</p>
            <button id="btn-pvp-create-room" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
              Create Room
            </button>
          </div>

          <div class="hud-pvp-lobby-card">
            <h3 class="hud-pvp-card-title">Join by Room ID</h3>
            <p class="hud-pvp-card-desc">Enter a Room ID (RT-XXXXXXXX) to join.</p>
            <div class="hud-pvp-join-row">
              <input
                id="pvp-invite-code"
                class="hud-pvp-input hud-pvp-code-input"
                type="text"
                maxlength="11"
                value="${escapeHtml(initialInviteCode ?? '')}"
                placeholder="RT-XXXXXXXX"
              />
              <button id="btn-pvp-join-room" class="hud-btn hud-btn-primary" type="button">
                Join
              </button>
            </div>
          </div>
        </div>

        <div class="hud-pvp-modal-footer">
          <button id="btn-pvp-back-menu" class="hud-btn hud-btn-secondary" type="button">
            Back to Menu
          </button>
        </div>
      </div>
    `;

    this.bindLobbyEvents();
  }

  private bindLobbyEvents(): void {
    const nameInput = this.overlayEl.querySelector('#pvp-player-name') as HTMLInputElement | null;
    const getName = () => {
      const name = nameInput?.value.trim() || 'Commander';
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('rune_tactics_player_name', name);
      }
      return name;
    };

    const btnCreate = this.overlayEl.querySelector('#btn-pvp-create-room');
    btnCreate?.addEventListener('click', async () => {
      this.setLoading(true, 'Creating room...');
      try {
        await this.callbacks.onCreateRoom(getName());
      } catch (err) {
        this.setLoading(false);
        this.showError(err instanceof Error ? err.message : 'Failed to create room');
      }
    });

    const btnJoin = this.overlayEl.querySelector('#btn-pvp-join-room');
    const codeInput = this.overlayEl.querySelector('#pvp-invite-code') as HTMLInputElement | null;
    const handleJoin = async () => {
      const code = codeInput?.value.trim().toUpperCase() || '';
      if (!code) {
        this.showError('Please enter a Room ID (e.g. RT-XXXXXXXX).');
        return;
      }
      this.setLoading(true, 'Connecting to match...');
      try {
        await this.callbacks.onJoinRoom(code, getName());
      } catch (err) {
        this.setLoading(false);
        this.showError(err instanceof Error ? err.message : 'Failed to join room');
      }
    };
    btnJoin?.addEventListener('click', handleJoin);
    codeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJoin();
    });

    const btnReconnect = this.overlayEl.querySelector('#btn-pvp-reconnect');
    btnReconnect?.addEventListener('click', async () => {
      this.setLoading(true, 'Reconnecting to match...');
      try {
        await this.callbacks.onReconnect();
      } catch (err) {
        this.setLoading(false);
        this.showError(err instanceof Error ? err.message : 'Failed to reconnect');
      }
    });

    const btnDiscard = this.overlayEl.querySelector('#btn-pvp-discard-reconnect');
    btnDiscard?.addEventListener('click', () => {
      this.callbacks.onDiscardReconnect();
      this.showLobby(false);
    });

    const btnBack = this.overlayEl.querySelector('#btn-pvp-back-menu');
    btnBack?.addEventListener('click', () => {
      this.hide();
      this.callbacks.onBackToMenu();
    });
  }

  showWaitingForPlayer(inviteCode: string): void {
    this.currentView = 'waiting';
    this.currentInviteCode = inviteCode;
    this.overlayEl.classList.remove('hidden');

    const inviteUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?pvp=${inviteCode}`
      : `?pvp=${inviteCode}`;

    this.overlayEl.innerHTML = `
      <div class="hud-modal hud-pvp-modal hud-pvp-waiting-modal">
        <div class="hud-menu-badge">ROOM CREATED</div>
        <h2 class="hud-modal-title">Waiting for Opponent</h2>
        <p class="hud-modal-subtitle">Share this Room ID or link with your opponent</p>

        <div class="hud-pvp-invite-display">
          <div class="hud-pvp-code-badge">${escapeHtml(inviteCode)}</div>
          <div class="hud-pvp-invite-actions">
            <button id="btn-pvp-copy-code" class="hud-btn hud-btn-secondary" type="button">
              Copy Room ID
            </button>
            <button id="btn-pvp-copy-link" class="hud-btn hud-btn-primary" type="button">
              Copy Invite Link
            </button>
          </div>
          <div id="pvp-copy-feedback" class="hud-pvp-copy-feedback hidden">Copied to clipboard!</div>
        </div>

        <div class="hud-pvp-spinner-row">
          <div class="hud-pvp-spinner"></div>
          <span>Waiting for Player B to join...</span>
        </div>

        <div class="hud-pvp-mcp-tip">
          <span class="hud-pvp-tip-icon">🤖</span>
          <span>Tip: An AI agent can also join via MCP using this Room ID (<code>join_pvp_room</code>).</span>
        </div>

        <div class="hud-pvp-modal-footer">
          <button id="btn-pvp-leave-waiting" class="hud-btn hud-btn-secondary" type="button">
            Cancel & Leave
          </button>
        </div>
      </div>
    `;

    const feedbackEl = this.overlayEl.querySelector('#pvp-copy-feedback');
    const showFeedback = (text: string) => {
      if (feedbackEl) {
        feedbackEl.textContent = text;
        feedbackEl.classList.remove('hidden');
        setTimeout(() => feedbackEl.classList.add('hidden'), 2500);
      }
    };

    this.overlayEl.querySelector('#btn-pvp-copy-code')?.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteCode);
        showFeedback('Room ID copied!');
      }
    });

    this.overlayEl.querySelector('#btn-pvp-copy-link')?.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl);
        showFeedback('Invite link copied!');
      }
    });

    this.overlayEl.querySelector('#btn-pvp-leave-waiting')?.addEventListener('click', () => {
      this.callbacks.onLeaveRoom();
      this.showLobby(false);
    });
  }

  setMyActorType(actorType?: 'human' | 'mcp-agent' | string): void {
    this.myActorType = actorType === 'mcp-agent' ? 'mcp-agent' : 'human';
    if (this.currentView === 'draft') {
      this.renderDraftContent();
    }
  }

  showDraft(
    seat: PlayerSeat,
    selectedClasses: PvPHeroClass[],
    isReady: boolean,
    opponentInfo: OpponentDraftInfo,
    myActorType?: 'human' | 'mcp-agent' | string
  ): void {
    this.currentView = 'draft';
    this.activeSeat = seat;
    this.selectedClasses = selectedClasses.length > 0 ? [...selectedClasses] : ['knight', 'archer', 'mage'];
    this.isReady = isReady;
    this.opponentInfo = opponentInfo;
    if (myActorType !== undefined) {
      this.myActorType = myActorType === 'mcp-agent' ? 'mcp-agent' : 'human';
    }
    this.overlayEl.classList.remove('hidden');
    this.renderDraftContent();
  }

  updateDraftState(
    selectedClasses: PvPHeroClass[],
    isReady: boolean,
    opponentInfo: OpponentDraftInfo,
    myActorType?: 'human' | 'mcp-agent' | string
  ): void {
    if (this.currentView !== 'draft') return;
    this.selectedClasses = [...selectedClasses];
    this.isReady = isReady;
    this.opponentInfo = opponentInfo;
    if (myActorType !== undefined) {
      this.myActorType = myActorType === 'mcp-agent' ? 'mcp-agent' : 'human';
    }
    this.renderDraftContent();
  }

  private renderDraftContent(): void {
    const isHost = this.activeSeat === 'A';
    const seatLabel = isHost ? 'Player A (Seat A)' : 'Player B (Seat B)';
    const myMcpBadge = this.myActorType === 'mcp-agent' ? ' <span class="hud-mcp-badge">[MCP]</span>' : '';
    const oppMcpBadge = this.opponentInfo.actorType === 'mcp-agent' ? ' <span class="hud-mcp-badge">[MCP]</span>' : '';

    // Preview order
    const previewSlots = isHost
      ? [
          { tag: 'A1', name: this.getClassName(0), you: true },
          { tag: 'B1', name: 'Opponent 1', you: false },
          { tag: 'A2', name: this.getClassName(1), you: true },
          { tag: 'B2', name: 'Opponent 2', you: false },
          { tag: 'A3', name: this.getClassName(2), you: true },
          { tag: 'B3', name: 'Opponent 3', you: false },
        ]
      : [
          { tag: 'A1', name: 'Opponent 1', you: false },
          { tag: 'B1', name: this.getClassName(0), you: true },
          { tag: 'A2', name: 'Opponent 2', you: false },
          { tag: 'B2', name: this.getClassName(1), you: true },
          { tag: 'A3', name: 'Opponent 3', you: false },
          { tag: 'B3', name: this.getClassName(2), you: true },
        ];

    const focusSelector = this.focusedSelector();
    this.overlayEl.innerHTML = `
      <div class="hud-modal hud-pvp-modal hud-pvp-draft-modal">
        <div class="hud-pvp-draft-header">
          <div class="hud-menu-badge">3v3 HERO DRAFT & ACTIVATION ORDER</div>
          <h2 class="hud-modal-title">Select 3 Unique Classes</h2>
          <div class="hud-pvp-seat-tag">You are ${seatLabel}${myMcpBadge}</div>
        </div>

        <div class="hud-pvp-draft-pool">
          ${HERO_CLASSES.map((cls) => {
            const isSelected = this.selectedClasses.includes(cls.id);
            const slotIndex = this.selectedClasses.indexOf(cls.id);
            const slotBadge = isSelected ? `<span class="hud-pvp-slot-pill">Slot ${slotIndex + 1}</span>` : '';
            return `
              <button
                type="button"
                class="hud-pvp-hero-option ${isSelected ? 'is-selected' : ''} ${this.isReady ? 'is-locked' : ''}"
                data-class-id="${cls.id}"
                aria-pressed="${isSelected}"
                ${this.isReady ? 'disabled' : ''}
              >
                ${slotBadge}
                <img src="${cls.portrait}" alt="" class="hud-pvp-hero-portrait" />
                <div class="hud-pvp-hero-details">
                  <div class="hud-pvp-hero-name">${cls.name}</div>
                  <div class="hud-pvp-hero-role">${cls.role}</div>
                  <div class="hud-pvp-hero-stats">HP ${cls.hp} • ${cls.attack}</div>
                  <div class="hud-pvp-hero-skill">${cls.skillName}: ${cls.skillDesc}</div>
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="hud-pvp-order-section">
          <div class="hud-pvp-section-title">Your Activation Order (Slots 1, 2, 3):</div>
          <div class="hud-pvp-slots-row">
            ${[0, 1, 2].map((i) => {
              const clsId = this.selectedClasses[i];
              const clsDef = HERO_CLASSES.find((c) => c.id === clsId);
              return `
                <div class="hud-pvp-slot-box">
                  <span class="hud-pvp-slot-num">Slot ${i + 1}</span>
                  <strong>${clsDef ? clsDef.name : 'Empty'}</strong>
                  ${
                    !this.isReady && this.selectedClasses.length === 3
                      ? `
                    <div class="hud-pvp-slot-arrows">
                      <button type="button" class="btn-slot-up" data-slot="${i}" aria-label="Move ${clsDef?.name ?? 'hero'} earlier" ${i === 0 ? 'disabled' : ''}>◀</button>
                      <button type="button" class="btn-slot-down" data-slot="${i}" aria-label="Move ${clsDef?.name ?? 'hero'} later" ${i === 2 ? 'disabled' : ''}>▶</button>
                    </div>
                    `
                      : ''
                  }
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="hud-pvp-preview-section">
          <div class="hud-pvp-section-title">Match Activation Sequence Preview:</div>
          <div class="hud-pvp-preview-pills">
            ${previewSlots.map((s) => `
              <div class="hud-pvp-preview-pill ${s.you ? 'is-you' : 'is-opp'}">
                <span class="pill-tag">${s.tag}</span>
                <span class="pill-name">${s.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="hud-pvp-opponent-bar">
          <div class="hud-pvp-opponent-status">
            <span>Opponent: <strong>${escapeHtml(this.opponentInfo.displayName)}</strong>${oppMcpBadge}</span>
            <span class="hud-pvp-conn-badge ${this.opponentInfo.connected ? 'is-connected' : 'is-disconnected'}">
              ${this.opponentInfo.connected ? 'Connected' : 'Disconnected'}
            </span>
            <span class="hud-pvp-ready-badge ${this.opponentInfo.ready ? 'is-ready' : 'is-choosing'}">
              ${this.opponentInfo.ready ? '✓ Ready' : 'Choosing...'}
            </span>
          </div>
        </div>

        <div class="hud-pvp-draft-actions">
          <button
            id="btn-pvp-toggle-ready"
            class="hud-btn ${this.isReady ? 'hud-btn-secondary' : 'hud-btn-primary'} hud-btn-lg"
            type="button"
            ${this.selectedClasses.length !== 3 ? 'disabled' : ''}
          >
            ${this.isReady ? 'Cancel Ready' : 'Ready (Lock In)'}
          </button>
          <button id="btn-pvp-leave-draft" class="hud-btn hud-btn-secondary" type="button">
            Leave Room
          </button>
        </div>
      </div>
    `;

    this.bindDraftEvents();
    this.restoreFocus(focusSelector);
  }

  private focusedSelector(): string | null {
    const active = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
    return active && this.overlayEl.contains?.(active) ? draftFocusSelector(active) : null;
  }

  private restoreFocus(selector: string | null): void {
    if (!selector) return;
    const target = this.overlayEl.querySelector<HTMLElement>(selector);
    if (target && !(target as HTMLButtonElement).disabled) target.focus();
  }

  private getClassName(slotIndex: number): string {
    const id = this.selectedClasses[slotIndex];
    const def = HERO_CLASSES.find((c) => c.id === id);
    return def ? def.name : 'Pick Hero';
  }

  private bindDraftEvents(): void {
    if (this.isReady) {
      // Locked while ready
      this.overlayEl.querySelector('#btn-pvp-toggle-ready')?.addEventListener('click', () => {
        this.callbacks.onToggleReady(false);
      });
      this.overlayEl.querySelector('#btn-pvp-leave-draft')?.addEventListener('click', () => {
        this.callbacks.onLeaveRoom();
      });
      return;
    }

    // Toggle hero selection
    const heroCards = this.overlayEl.querySelectorAll('.hud-pvp-hero-option');
    heroCards.forEach((card) => {
      card.addEventListener('click', () => {
        const classId = card.getAttribute('data-class-id') as PvPHeroClass | null;
        if (!classId) return;

        if (this.selectedClasses.includes(classId)) {
          if (this.selectedClasses.length > 1) {
            this.selectedClasses = this.selectedClasses.filter((c) => c !== classId);
          }
        } else {
          if (this.selectedClasses.length < 3) {
            this.selectedClasses.push(classId);
          } else {
            // Replace last slot
            this.selectedClasses[2] = classId;
          }
        }
        this.callbacks.onSelectClasses([...this.selectedClasses]);
        this.renderDraftContent();
      });
    });

    // Reorder arrows
    this.overlayEl.querySelectorAll('.btn-slot-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = Number(btn.getAttribute('data-slot'));
        if (slot > 0) {
          const temp = this.selectedClasses[slot - 1];
          this.selectedClasses[slot - 1] = this.selectedClasses[slot];
          this.selectedClasses[slot] = temp;
          this.callbacks.onSelectClasses([...this.selectedClasses]);
          this.renderDraftContent();
        }
      });
    });

    this.overlayEl.querySelectorAll('.btn-slot-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = Number(btn.getAttribute('data-slot'));
        if (slot < 2) {
          const temp = this.selectedClasses[slot + 1];
          this.selectedClasses[slot + 1] = this.selectedClasses[slot];
          this.selectedClasses[slot] = temp;
          this.callbacks.onSelectClasses([...this.selectedClasses]);
          this.renderDraftContent();
        }
      });
    });

    // Ready button
    this.overlayEl.querySelector('#btn-pvp-toggle-ready')?.addEventListener('click', () => {
      if (this.selectedClasses.length === 3) {
        this.callbacks.onToggleReady(true);
      }
    });

    // Leave button
    this.overlayEl.querySelector('#btn-pvp-leave-draft')?.addEventListener('click', () => {
      this.callbacks.onLeaveRoom();
    });
  }

  showError(message: string): void {
    const errorEl = this.overlayEl.querySelector('#pvp-error-banner');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  setLoading(loading: boolean, message = 'Loading...'): void {
    let loader = this.overlayEl.querySelector('#pvp-loader') as HTMLDivElement | null;
    if (loading) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'pvp-loader';
        loader.className = 'hud-pvp-loader-overlay';
        this.overlayEl.appendChild(loader);
      }
      loader.innerHTML = `
        <div class="hud-pvp-spinner"></div>
        <span>${escapeHtml(message)}</span>
      `;
      loader.classList.remove('hidden');
    } else {
      loader?.classList.add('hidden');
    }
  }

  hide(): void {
    this.currentView = 'none';
    this.overlayEl.classList.add('hidden');
  }

  isOpen(): boolean {
    return this.currentView !== 'none';
  }

  isInDraft(): boolean {
    return this.currentView === 'draft';
  }

  getInviteCode(): string | null {
    return this.currentInviteCode;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
