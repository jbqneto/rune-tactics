import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '../src/rendering/CameraController';
import { TOUCH_TAP_SLOP_PX, resolveTouchTap } from '../src/input/InputManager';

describe('touch tap: preview first, confirm on second tap', () => {
  it('first tap on an actionable target previews it instead of acting', () => {
    expect(resolveTouchTap({ previewToken: null, tapToken: 'default:3,4', actionable: true })).toEqual({
      action: 'preview',
      previewToken: 'default:3,4',
    });
  });

  it('second tap on the same target in the same mode confirms', () => {
    expect(resolveTouchTap({ previewToken: 'default:3,4', tapToken: 'default:3,4', actionable: true })).toEqual({
      action: 'commit',
      previewToken: null,
    });
  });

  it('tapping a different target moves the preview', () => {
    expect(resolveTouchTap({ previewToken: 'default:3,4', tapToken: 'default:5,4', actionable: true })).toEqual({
      action: 'preview',
      previewToken: 'default:5,4',
    });
  });

  it('a mode change invalidates the previous preview', () => {
    expect(resolveTouchTap({ previewToken: 'default:3,4', tapToken: 'attack:3,4', actionable: true }).action).toBe('preview');
  });

  it('tapping a non-actionable cell clears the preview', () => {
    expect(resolveTouchTap({ previewToken: 'default:3,4', tapToken: 'default:9,9', actionable: false })).toEqual({
      action: 'clear',
      previewToken: null,
    });
  });

  it('uses a finger-sized slop to tell taps from drags', () => {
    expect(TOUCH_TAP_SLOP_PX).toBeGreaterThanOrEqual(8);
  });
});

describe('one-finger drag orbits the camera on touch screens', () => {
  type Handler = (e: Partial<PointerEvent>) => void;
  function fakeTarget() {
    const handlers: Record<string, Handler[]> = {};
    return {
      handlers,
      addEventListener: (type: string, fn: Handler) => (handlers[type] ??= []).push(fn),
      removeEventListener: vi.fn(),
      fire: (type: string, e: Partial<PointerEvent>) => handlers[type]?.forEach((fn) => fn(e)),
    };
  }

  it('rotates with a touch drag and ignores a second finger', () => {
    const canvas = fakeTarget();
    const win = fakeTarget();
    vi.stubGlobal('window', win);
    try {
      const ctrl = new CameraController(new THREE.PerspectiveCamera(), canvas as unknown as HTMLElement);
      const start = ctrl.targetAzimuth;
      canvas.fire('pointerdown', { pointerType: 'touch', pointerId: 1, button: 0, clientX: 100, clientY: 100 });
      canvas.fire('pointerdown', { pointerType: 'touch', pointerId: 2, button: 0, clientX: 300, clientY: 100 });
      win.fire('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 600, clientY: 100 });
      expect(ctrl.targetAzimuth).toBe(start);
      win.fire('pointermove', { pointerType: 'touch', pointerId: 1, clientX: 160, clientY: 100 });
      expect(ctrl.targetAzimuth).not.toBe(start);
      expect(ctrl.isDragging).toBe(true);
      win.fire('pointerup', { pointerType: 'touch', pointerId: 1, button: 0, clientX: 160, clientY: 100 });
      expect(ctrl.isDragging).toBe(false);
      // A touch drag must not swallow a later long-press "cancel" (contextmenu).
      expect(ctrl.consumeRightDrag()).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('a left mouse drag still does not rotate', () => {
    const canvas = fakeTarget();
    const win = fakeTarget();
    vi.stubGlobal('window', win);
    try {
      const ctrl = new CameraController(new THREE.PerspectiveCamera(), canvas as unknown as HTMLElement);
      const start = ctrl.targetAzimuth;
      canvas.fire('pointerdown', { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100, clientY: 100 });
      win.fire('pointermove', { pointerType: 'mouse', pointerId: 1, clientX: 300, clientY: 100 });
      expect(ctrl.targetAzimuth).toBe(start);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
