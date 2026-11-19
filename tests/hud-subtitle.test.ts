import { describe, expect, it } from 'vitest';
import { hudSubtitleForMode } from '../src/ui/HudManager';

describe('HUD header subtitle', () => {
  it('names the active mode instead of always showing the campaign', () => {
    expect(hudSubtitleForMode('campaign')).toBe('THE ASHEN CAMPAIGN');
    expect(hudSubtitleForMode('quick-battle')).toBe('QUICK BATTLE');
    expect(hudSubtitleForMode('pvp')).toBe('ONLINE PVP • 3v3');
  });
});
