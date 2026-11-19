import { describe, expect, it, vi } from 'vitest';
import { syncPvPDraftOverlay } from '../src/ui/pvpDraftSync';
import type { PvPHeroClass } from '../src/shared/pvpTypes';

const defaults: PvPHeroClass[] = ['knight', 'archer', 'mage'];

function sync(mySelected: string[], publishDraft: (classes: PvPHeroClass[]) => void) {
  return syncPvPDraftOverlay({
    overlay: null,
    mySeat: 'A',
    draftClasses: defaults,
    phase: 'CHARACTER_SELECTION',
    seats: {
      A: { displayName: 'Alice', connected: true, ready: false, selectedClasses: mySelected },
      B: { displayName: 'Bob', connected: true, ready: false, selectedClasses: [] },
    },
    onOpponentUpdate: vi.fn(),
    onOpenMenu: vi.fn(),
    publishDraft,
  });
}

describe('PvP draft defaults reach the server', () => {
  it('publishes the locally displayed lineup when the server has none, so Ready can lock in', () => {
    const publishDraft = vi.fn();
    sync([], publishDraft);
    expect(publishDraft).toHaveBeenCalledWith(defaults);
  });

  it('does not republish once the server already holds a full lineup', () => {
    const publishDraft = vi.fn();
    sync(['knight', 'archer', 'mage'], publishDraft);
    expect(publishDraft).not.toHaveBeenCalled();
  });
});
