import { describe, expect, it, vi } from 'vitest';
import { canLockLandscape, enterLandscapeFullscreen } from '../src/ui/mobileLandscape';

function env(overrides: Record<string, unknown> = {}) {
  const lock = vi.fn().mockResolvedValue(undefined);
  const requestFullscreen = vi.fn().mockResolvedValue(undefined);
  return {
    lock,
    requestFullscreen,
    value: {
      fullscreenEnabled: true,
      isTouch: true,
      orientation: { lock },
      target: { requestFullscreen },
      ...overrides,
    },
  };
}

describe('landscape fullscreen helper', () => {
  it('is offered only on touch devices that support fullscreen + orientation lock', () => {
    expect(canLockLandscape(env().value)).toBe(true);
    expect(canLockLandscape(env({ isTouch: false }).value)).toBe(false);
    expect(canLockLandscape(env({ fullscreenEnabled: false }).value)).toBe(false);
    expect(canLockLandscape(env({ orientation: {} }).value)).toBe(false);
  });

  it('enters fullscreen first and then locks landscape', async () => {
    const e = env();
    await expect(enterLandscapeFullscreen(e.value)).resolves.toBe(true);
    expect(e.requestFullscreen).toHaveBeenCalled();
    expect(e.lock).toHaveBeenCalledWith('landscape');
    expect(e.requestFullscreen.mock.invocationCallOrder[0]).toBeLessThan(e.lock.mock.invocationCallOrder[0]);
  });

  it('never throws when the browser refuses (e.g. iOS Safari)', async () => {
    const e = env();
    e.requestFullscreen.mockRejectedValue(new Error('denied'));
    await expect(enterLandscapeFullscreen(e.value)).resolves.toBe(false);
    const f = env();
    f.lock.mockRejectedValue(new Error('NotSupportedError'));
    await expect(enterLandscapeFullscreen(f.value)).resolves.toBe(false);
  });
});
