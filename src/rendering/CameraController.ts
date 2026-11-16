import * as THREE from 'three';

const INITIAL_AZIMUTH = Math.PI / 4;
const CAMERA_HEIGHT_Y = 18.5;
const CAMERA_RADIUS = Math.hypot(17, 17);
const DRAG_THRESHOLD_PX = 4;
const ROTATE_SENSITIVITY = 0.008;
const SMOOTHING_FACTOR = 12;

export class CameraController {
  readonly target = new THREE.Vector3(0, 0.25, 0);
  readonly heightY = CAMERA_HEIGHT_Y;
  readonly radius = CAMERA_RADIUS;

  targetAzimuth = INITIAL_AZIMUTH;
  currentAzimuth = INITIAL_AZIMUTH;

  private readonly camera: THREE.Camera;
  private readonly canvas: HTMLElement | null;
  private draggingRight = false;
  private dragDistance = 0;
  private lastX = 0;
  private lastY = 0;
  private suppressContextMenu = false;

  private readonly handlePointerDownBound: (e: PointerEvent) => void;
  private readonly handlePointerMoveBound: (e: PointerEvent) => void;
  private readonly handlePointerUpBound: (e: PointerEvent) => void;
  private readonly handleContextMenuBound: (e: MouseEvent) => void;

  constructor(camera: THREE.Camera, canvas: HTMLElement | null = null) {
    this.camera = camera;
    this.canvas = canvas;
    this.applyCameraTransform();

    this.handlePointerDownBound = (e) => {
      if (e.button === 2) {
        this.beginRightDrag(e.clientX, e.clientY);
      }
    };
    this.handlePointerMoveBound = (e) => {
      if (this.draggingRight) {
        this.moveRightDrag(e.clientX, e.clientY);
      }
    };
    this.handlePointerUpBound = (e) => {
      if (e.button === 2 && this.draggingRight) {
        this.endRightDrag();
      }
    };
    this.handleContextMenuBound = (e) => {
      e.preventDefault();
    };

    if (this.canvas) {
      this.canvas.addEventListener('pointerdown', this.handlePointerDownBound);
      this.canvas.addEventListener('contextmenu', this.handleContextMenuBound);
      if (typeof window !== 'undefined') {
        window.addEventListener('pointermove', this.handlePointerMoveBound);
        window.addEventListener('pointerup', this.handlePointerUpBound);
      }
    }
  }

  get isDragging(): boolean {
    return this.draggingRight && this.dragDistance >= DRAG_THRESHOLD_PX;
  }

  get wasRightDrag(): boolean {
    return this.suppressContextMenu || this.dragDistance >= DRAG_THRESHOLD_PX;
  }

  consumeRightDrag(): boolean {
    const wasDrag = this.wasRightDrag;
    this.suppressContextMenu = false;
    this.dragDistance = 0;
    return wasDrag;
  }

  beginRightDrag(clientX: number, clientY: number): void {
    this.draggingRight = true;
    this.dragDistance = 0;
    this.lastX = clientX;
    this.lastY = clientY;
    this.suppressContextMenu = false;
  }

  moveRightDrag(clientX: number, clientY: number): void {
    if (!this.draggingRight) return;
    const dx = clientX - this.lastX;
    const dy = clientY - this.lastY;
    this.lastX = clientX;
    this.lastY = clientY;
    this.dragDistance += Math.hypot(dx, dy);
    this.targetAzimuth -= dx * ROTATE_SENSITIVITY;
  }

  endRightDrag(): void {
    if (!this.draggingRight) return;
    if (this.dragDistance >= DRAG_THRESHOLD_PX) {
      this.suppressContextMenu = true;
    }
    this.draggingRight = false;
  }

  update(dt: number): void {
    const alpha = 1 - Math.exp(-SMOOTHING_FACTOR * Math.max(0, dt));
    this.currentAzimuth += (this.targetAzimuth - this.currentAzimuth) * alpha;
    this.applyCameraTransform();
  }

  private applyCameraTransform(): void {
    this.camera.position.set(
      Math.sin(this.currentAzimuth) * this.radius,
      this.heightY,
      Math.cos(this.currentAzimuth) * this.radius
    );
    this.camera.lookAt(this.target);
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDownBound);
      this.canvas.removeEventListener('contextmenu', this.handleContextMenuBound);
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', this.handlePointerMoveBound);
        window.removeEventListener('pointerup', this.handlePointerUpBound);
      }
    }
  }
}
