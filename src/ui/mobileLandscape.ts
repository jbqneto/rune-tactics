/**
 * Landscape fullscreen for phones. Browsers only allow `screen.orientation.lock`
 * while the page is fullscreen, and iOS Safari supports neither — so this is a
 * best-effort upgrade on top of the CSS "rotate your device" gate, never a requirement.
 */
export interface LandscapeEnv {
  fullscreenEnabled: boolean;
  isTouch: boolean;
  orientation?: { lock?: (orientation: 'landscape') => Promise<void> } | null;
  target: { requestFullscreen?: (options?: FullscreenOptions) => Promise<void> };
}

export function canLockLandscape(env: LandscapeEnv): boolean {
  return (
    env.isTouch &&
    env.fullscreenEnabled &&
    typeof env.target.requestFullscreen === 'function' &&
    typeof env.orientation?.lock === 'function'
  );
}

/** Resolves true when the device ended up fullscreen and locked to landscape. */
export async function enterLandscapeFullscreen(env: LandscapeEnv): Promise<boolean> {
  try {
    await env.target.requestFullscreen?.({ navigationUI: 'hide' });
    await env.orientation?.lock?.('landscape');
    return true;
  } catch {
    return false;
  }
}

export function browserLandscapeEnv(): LandscapeEnv | null {
  if (typeof document === 'undefined' || typeof screen === 'undefined' || typeof window === 'undefined') return null;
  const orientation = screen.orientation as unknown as LandscapeEnv['orientation'];
  return {
    fullscreenEnabled: Boolean(document.fullscreenEnabled),
    isTouch: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    orientation,
    target: document.documentElement,
  };
}

/** Reveals and wires the given buttons when landscape fullscreen is supported. */
export function wireLandscapeButtons(buttons: Array<HTMLElement | null>, env = browserLandscapeEnv()): void {
  if (!env || !canLockLandscape(env)) return;
  for (const btn of buttons) {
    if (!btn) continue;
    btn.classList.remove('hidden');
    btn.addEventListener('click', () => void enterLandscapeFullscreen(env));
  }
}
