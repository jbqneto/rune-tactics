import { describe, expect, it, vi } from 'vitest';
import { PvPLobbyOverlay, draftFocusSelector } from '../src/ui/PvPLobbyOverlay';

describe('PvP draft focus restoration', () => {
  const el = (attrs: Record<string, string>, classes: string[] = []) => ({
    id: attrs.id ?? '',
    getAttribute: (k: string) => attrs[k] ?? null,
    classList: { contains: (c: string) => classes.includes(c) },
  });

  it('identifies the focused draft control so it can be refocused after re-render', () => {
    expect(draftFocusSelector(el({ 'data-class-id': 'cleric' }, ['hud-pvp-hero-option']))).toBe('[data-class-id="cleric"]');
    expect(draftFocusSelector(el({ 'data-slot': '1' }, ['btn-slot-down']))).toBe('.btn-slot-down[data-slot="1"]');
    expect(draftFocusSelector(el({ id: 'btn-pvp-toggle-ready' }))).toBe('#btn-pvp-toggle-ready');
    expect(draftFocusSelector(null)).toBeNull();
  });
});

describe('PvP draft hero picker accessibility', () => {
  it('renders hero options as keyboard-operable toggle buttons with selected state', () => {
    let html = '';
    const element: any = {
      classList: { add: vi.fn(), remove: vi.fn() },
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      get innerHTML() { return html; },
      set innerHTML(value: string) { html = value; },
    };
    (globalThis as any).document = { createElement: () => element };
    const overlay = new PvPLobbyOverlay(element, {
      onCreateRoom: vi.fn(), onJoinRoom: vi.fn(), onReconnect: vi.fn(),
      onDiscardReconnect: vi.fn(), onSelectClasses: vi.fn(), onToggleReady: vi.fn(),
      onLeaveRoom: vi.fn(), onBackToMenu: vi.fn(),
    });

    overlay.showDraft('A', ['knight', 'archer', 'mage'], false, {
      displayName: 'Opponent', connected: true, ready: false, selectedCount: 0,
    });

    expect(html).toMatch(/<button\s+type="button"\s+class="hud-pvp-hero-option is-selected[^"]*"\s+data-class-id="knight"\s+aria-pressed="true"/);
    expect(html).toMatch(/<button\s+type="button"\s+class="hud-pvp-hero-option\s*[^"]*"\s+data-class-id="cleric"\s+aria-pressed="false"/);
  });
});
