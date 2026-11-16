import * as THREE from 'three';
import { CameraController } from './CameraController';

export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraController: CameraController;

  private readonly canvas: HTMLCanvasElement;
  private readonly frustumSize = 17.5;
  private readonly torchLights: { light: THREE.PointLight; baseIntensity: number; phase: number }[] = [];
  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private onFrameCallback: ((dt: number) => void) | null = null;
  private readonly handleResizeBound: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const aspect = this.getAspect();
    this.camera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      100
    );
    this.camera.position.set(17, 18.5, 17);
    this.camera.lookAt(0, 0.25, 0);
    this.cameraController = new CameraController(this.camera, this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLights();

    this.handleResizeBound = () => this.resize();
    window.addEventListener('resize', this.handleResizeBound);
    this.resize();
  }

  private setupLights(): void {
    // Cool ambient & hemisphere fill
    const ambient = new THREE.AmbientLight(0x9fb4d4, 0.58);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.45);
    this.scene.add(hemi);

    // Main directional key light with shadows
    const dirLight = new THREE.DirectionalLight(0xeef4ff, 1.15);
    dirLight.position.set(9, 17, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 55;
    const d = 13.5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Warm torch PointLights around the 12x12 arena
    const torchPositions: [number, number, number][] = [
      [-6.65, 1.75, -6.65],
      [6.65, 1.75, -6.65],
      [-6.65, 1.75, 6.65],
      [6.65, 1.75, 6.65],
    ];
    torchPositions.forEach(([x, y, z], idx) => {
      const light = new THREE.PointLight(0xf59e0b, 3.6, 14, 1.5);
      light.position.set(x, y, z);
      this.scene.add(light);
      this.torchLights.push({
        light,
        baseIntensity: 3.2,
        phase: idx * 1.7,
      });
    });
  }

  private getAspect(): number {
    const width = this.canvas.clientWidth || window.innerWidth || 1;
    const height = this.canvas.clientHeight || window.innerHeight || 1;
    return width / height;
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / Math.max(height, 1);

    const effectiveHeight = aspect < 1 ? this.frustumSize / aspect : this.frustumSize;
    const effectiveWidth = effectiveHeight * aspect;

    this.camera.left = -effectiveWidth / 2;
    this.camera.right = effectiveWidth / 2;
    this.camera.top = effectiveHeight / 2;
    this.camera.bottom = -effectiveHeight / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  start(onFrame: (dt: number) => void): void {
    this.onFrameCallback = onFrame;
    this.lastTime = performance.now();

    const tick = (now: number): void => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.elapsed += dt;

      // Subtle torchlight flicker
      for (const torch of this.torchLights) {
        const flicker =
          Math.sin(this.elapsed * 7.5 + torch.phase) * 0.25 +
          Math.sin(this.elapsed * 13.1 + torch.phase * 2) * 0.12;
        torch.light.intensity = torch.baseIntensity + flicker;
      }

      this.cameraController.update(dt);
      this.onFrameCallback?.(dt);
      this.renderer.render(this.scene, this.camera);

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.handleResizeBound);
    this.cameraController.dispose();
    this.renderer.dispose();
  }
}
