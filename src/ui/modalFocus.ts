interface OverlayHostChild {
  inert: boolean;
  classList: { contains(token: string): boolean };
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

interface OverlayHost {
  children: ArrayLike<OverlayHostChild>;
}

const isOverlay = (el: OverlayHostChild) => el.classList.contains('hud-overlay');
const isVisibleOverlay = (el: OverlayHostChild) => isOverlay(el) && !el.classList.contains('hidden');

/**
 * While a HUD overlay (menu, camp, result, PvP lobby) is visible, the HUD
 * chrome behind it must not be reachable by Tab or assistive technology.
 * Returns whether a modal overlay is open.
 */
export function syncBackgroundInert(host: OverlayHost): boolean {
  const children = Array.from(host.children);
  const open = children.some(isVisibleOverlay);
  for (const child of children) {
    if (isOverlay(child)) {
      if (isVisibleOverlay(child)) {
        child.setAttribute('role', 'dialog');
        child.setAttribute('aria-modal', 'true');
      } else {
        child.removeAttribute('aria-modal');
      }
    } else if (child.inert !== open) {
      child.inert = open;
    }
  }
  return open;
}

/** Keeps background inertness in sync as overlays open, close, or are appended. */
export function watchModalOverlays(host: HTMLElement): () => void {
  const sync = () => syncBackgroundInert(host as unknown as OverlayHost);
  const observer = new MutationObserver(sync);
  observer.observe(host, { childList: true, attributes: true, attributeFilter: ['class'], subtree: true });
  sync();
  return () => observer.disconnect();
}
