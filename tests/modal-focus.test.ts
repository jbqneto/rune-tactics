import { describe, expect, it } from 'vitest';
import { syncBackgroundInert } from '../src/ui/modalFocus';

function node(...classes: string[]) {
  const set = new Set(classes);
  const attrs = new Map<string, string>();
  return {
    inert: false,
    classList: { contains: (c: string) => set.has(c) },
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    removeAttribute: (k: string) => attrs.delete(k),
    attrs,
  };
}

describe('modal overlay focus isolation', () => {
  it('makes HUD chrome inert while any overlay is visible and restores it after closing', () => {
    const top = node('hud-top');
    const bottom = node('hud-bottom');
    const menu = node('hud-overlay');
    const pvp = node('hud-overlay', 'hidden');
    const host = { children: [top, bottom, menu, pvp] };

    expect(syncBackgroundInert(host)).toBe(true);
    expect(top.inert).toBe(true);
    expect(bottom.inert).toBe(true);
    expect(menu.inert).toBe(false);
    expect(menu.attrs.get('aria-modal')).toBe('true');
    expect(menu.attrs.get('role')).toBe('dialog');
    expect(pvp.attrs.has('aria-modal')).toBe(false);

    host.children[2] = node('hud-overlay', 'hidden');
    expect(syncBackgroundInert(host)).toBe(false);
    expect(top.inert).toBe(false);
    expect(bottom.inert).toBe(false);
  });
});
