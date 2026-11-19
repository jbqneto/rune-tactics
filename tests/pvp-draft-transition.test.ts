import { describe, expect, it, vi } from 'vitest';
import { PvPLobbyOverlay, type OpponentDraftInfo } from '../src/ui/PvPLobbyOverlay';
import { syncPvPDraftOverlay } from '../src/ui/pvpDraftSync';
import type { PvPHeroClass } from '../src/shared/pvpTypes';

function createMockElement() {
  const classes = new Set<string>();
  let html = '';
  const el: any = {
    id: '',
    style: {},
    className: '',
    classList: {
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
      contains: (c: string) => classes.has(c),
    },
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    get innerHTML() {
      return html;
    },
    set innerHTML(val: string) {
      html = val;
    },
  };
  return el;
}

function createOverlay() {
  const docEl = createMockElement();
  (globalThis as any).document = {
    createElement: () => createMockElement(),
  };
  (globalThis as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
  };

  const overlay = new PvPLobbyOverlay(docEl, {
    onCreateRoom: async () => {},
    onJoinRoom: async () => {},
    onReconnect: async () => {},
    onCancelWaiting: async () => {},
    onSelectClasses: () => {},
    onSetReady: () => {},
    onBackToMenu: () => {},
  });

  return { overlay, overlayEl: (overlay as any).overlayEl };
}

describe('PvP draft transition from waiting/lobby', () => {
  const defaultClasses: PvPHeroClass[] = ['knight', 'archer', 'mage'];

  it('transitions Seat A from waiting view into draft on lobbyState CHARACTER_SELECTION', () => {
    const { overlay, overlayEl } = createOverlay();
    const setOpponent = vi.fn();
    const setMenuOpen = vi.fn();

    overlay.showWaitingForPlayer('RT-TEST12');
    expect(overlay.isOpen()).toBe(true);
    expect(overlay.isInDraft()).toBe(false);

    const transitioned = syncPvPDraftOverlay({
      overlay,
      mySeat: 'A',
      draftClasses: defaultClasses,
      phase: 'CHARACTER_SELECTION',
      seats: {
        A: { displayName: 'Alice', connected: true, ready: false, selectedClasses: [], actorType: 'human' },
        B: { displayName: 'Bob', connected: true, ready: false, selectedClasses: [], actorType: 'human' },
      },
      onOpponentUpdate: setOpponent,
      onOpenMenu: setMenuOpen,
    });

    expect(transitioned).toBe(true);
    expect(overlay.isInDraft()).toBe(true);
    expect(setMenuOpen).toHaveBeenCalledWith(true);
    expect(setOpponent).toHaveBeenCalledWith({ displayName: 'Bob', actorType: 'human' });
    expect(overlayEl.innerHTML).toContain('Select 3 Unique Classes');
    expect(overlayEl.innerHTML).toContain('Bob');
  });

  it('transitions Seat B from lobby (connecting) view into draft on roomStateChange CHARACTER_SELECTION', () => {
    const { overlay, overlayEl } = createOverlay();
    const setOpponent = vi.fn();
    const setMenuOpen = vi.fn();

    overlay.showLobby(false, 'RT-TEST12');
    expect(overlay.isOpen()).toBe(true);
    expect(overlay.isInDraft()).toBe(false);

    // Colyseus MapSchema-like seats object with .get()
    const roomSeats = new Map([
      ['A', { displayName: 'Alice', connected: true, ready: false, selectedClasses: ['knight', 'mage', 'cleric'], actorType: 'human' }],
      ['B', { displayName: 'Bot-MCP', connected: true, ready: false, selectedClasses: [], actorType: 'mcp-agent' }],
    ]);

    const transitioned = syncPvPDraftOverlay({
      overlay,
      mySeat: 'B',
      draftClasses: defaultClasses,
      phase: 'CHARACTER_SELECTION',
      seats: roomSeats,
      onOpponentUpdate: setOpponent,
      onOpenMenu: setMenuOpen,
    });

    expect(transitioned).toBe(true);
    expect(overlay.isInDraft()).toBe(true);
    expect(setMenuOpen).toHaveBeenCalledWith(true);
    expect(setOpponent).toHaveBeenCalledWith({ displayName: 'Alice', actorType: 'human' });
    expect(overlayEl.innerHTML).toContain('Select 3 Unique Classes');
    expect(overlayEl.innerHTML).toContain('Player B (Seat B)');
    expect(overlayEl.innerHTML).toContain('[MCP]');
  });

  it('updates draft state without re-triggering showDraft when already in draft (including MCP opponent)', () => {
    const { overlay, overlayEl } = createOverlay();
    const setOpponent = vi.fn();
    const setMenuOpen = vi.fn();
    const showDraftSpy = vi.spyOn(overlay, 'showDraft');
    const updateDraftSpy = vi.spyOn(overlay, 'updateDraftState');

    overlay.showWaitingForPlayer('RT-MCP999');

    // First update: waiting -> draft
    syncPvPDraftOverlay({
      overlay,
      mySeat: 'A',
      draftClasses: defaultClasses,
      phase: 'CHARACTER_SELECTION',
      seats: {
        A: { displayName: 'Alice', connected: true, ready: false, selectedClasses: [], actorType: 'human' },
        B: { displayName: 'Claude-MCP', connected: true, ready: false, selectedClasses: [], actorType: 'mcp-agent' },
      },
      onOpponentUpdate: setOpponent,
      onOpenMenu: setMenuOpen,
    });
    expect(showDraftSpy).toHaveBeenCalledTimes(1);
    expect(updateDraftSpy).toHaveBeenCalledTimes(0);

    // Second update: already in draft -> updateDraftState only
    syncPvPDraftOverlay({
      overlay,
      mySeat: 'A',
      draftClasses: defaultClasses,
      phase: 'WAITING_FOR_READY',
      seats: {
        A: { displayName: 'Alice', connected: true, ready: false, selectedClasses: ['knight', 'archer', 'mage'], actorType: 'human' },
        B: { displayName: 'Claude-MCP', connected: true, ready: true, selectedClasses: ['cleric', 'knight', 'mage'], actorType: 'mcp-agent' },
      },
      onOpponentUpdate: setOpponent,
      onOpenMenu: setMenuOpen,
    });

    expect(showDraftSpy).toHaveBeenCalledTimes(1);
    expect(updateDraftSpy).toHaveBeenCalledTimes(1);
    expect(overlayEl.innerHTML).toContain('Claude-MCP');
    expect(overlayEl.innerHTML).toContain('[MCP]');
    expect(overlayEl.innerHTML).toContain('Ready');
  });

  it('ignores non-draft phases and does not transition', () => {
    const { overlay } = createOverlay();
    const setOpponent = vi.fn();
    const setMenuOpen = vi.fn();

    overlay.showWaitingForPlayer('RT-WAIT11');

    const transitioned = syncPvPDraftOverlay({
      overlay,
      mySeat: 'A',
      draftClasses: defaultClasses,
      phase: 'WAITING_FOR_PLAYER',
      seats: {
        A: { displayName: 'Alice', connected: true, ready: false, selectedClasses: [], actorType: 'human' },
      },
      onOpponentUpdate: setOpponent,
      onOpenMenu: setMenuOpen,
    });

    expect(transitioned).toBe(false);
    expect(overlay.isInDraft()).toBe(false);
    expect(setOpponent).not.toHaveBeenCalled();
    expect(setMenuOpen).not.toHaveBeenCalled();
  });
});
