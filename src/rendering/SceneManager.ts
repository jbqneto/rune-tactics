import * as THREE from 'three';
import { CameraController } from './CameraController';

export interface ScenePointLightConfig {
  position: readonly [number, number, number];
  color?: number;
  intensity?: number;
  distance?: number;
  decay?: number;
}

export interface SceneAtmosphereConfig {
  backgroundColor?: number;
  fogColor?: number;
  fogDensity?: number;
  ambientColor?: number;
  ambientIntensity?: number;
  hemiSkyColor?: number;
  hemiGroundColor?: number;
  hemiIntensity?: number;
  dirColor?: number;
  dirIntensity?: number;
  dirPosition?: readonly [number, number, number];
  rimColor?: number;
  rimIntensity?: number;
  rimPosition?: readonly [number, number, number];
  pointLights?: readonly ScenePointLightConfig[];
  particleColor?: number;
  particleOpacity?: number;
}

const PARTICLE_COUNT = 100;
const PARTICLE_X_MIN = -8.5;
const PARTICLE_X_SPAN = 17.0;
const PARTICLE_Y_MIN = 0.35;
const PARTICLE_Y_SPAN = 4.15;
const PARTICLE_Z_MIN = -8.5;
const PARTICLE_Z_SPAN = 17.0;

export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraController: CameraController;

  private readonly canvas: HTMLCanvasElement;
  private readonly frustumSize = 14.8;
  private readonly torchLights: { light: THREE.PointLight; baseIntensity: number; phase: number }[] = [];
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private dirLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private particleGeometry!: THREE.BufferGeometry;
  private particleMaterial!: THREE.PointsMaterial;
  private particleTexture: THREE.CanvasTexture | null = null;
  private particles!: THREE.Points;
  private particleVelocities!: Float32Array;
  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private onFrameCallback: ((dt: number) => void) | null = null;
  private readonly handleResizeBound: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1424);
    this.scene.fog = new THREE.FogExp2(0x0c1424, 0.012);

    const aspect = this.getAspect();
    this.camera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      100
    );
    this.camera.position.set(Math.SQRT1_2 * 20.0, 12.8, Math.SQRT1_2 * 20.0);
    this.camera.lookAt(0, 0.35, 0);
    this.cameraController = new CameraController(this.camera, this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    // Phones have 3x DPR but small, hot GPUs: 1.5x is visually close and far cheaper.
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.setupLights();
    this.setupParticles();

    this.handleResizeBound = () => this.resize();
    window.addEventListener('resize', this.handleResizeBound);
    this.resize();
  }

  private setupLights(): void {
    // Soft ambient fill
    this.ambientLight = new THREE.AmbientLight(0x94a3b8, 0.48);
    this.scene.add(this.ambientLight);

    // Blue-teal hemisphere sky/ground fill for FFT-style diorama contrast
    this.hemiLight = new THREE.HemisphereLight(0x8ec5e8, 0x162436, 0.62);
    this.scene.add(this.hemiLight);

    // Crisp warm directional key light with shadows
    this.dirLight = new THREE.DirectionalLight(0xffe8c2, 1.45);
    this.dirLight.position.set(11, 18, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 55;
    const d = 13.5;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Cool rim light for crisp low-poly silhouette separation
    this.rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.55);
    this.rimLight.position.set(-10, 10, -11);
    this.scene.add(this.rimLight);

    // Warm torch PointLights around the 12x12 arena (fixed 4-light pool)
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

  private setupParticles(): void {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    this.particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    // Deterministic LCG so atmospheric dust distribution is consistent across loads
    let seed = 0x51a7c3;
    const nextRand = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      positions[idx] = PARTICLE_X_MIN + nextRand() * PARTICLE_X_SPAN;
      positions[idx + 1] = PARTICLE_Y_MIN + nextRand() * PARTICLE_Y_SPAN;
      positions[idx + 2] = PARTICLE_Z_MIN + nextRand() * PARTICLE_Z_SPAN;

      this.particleVelocities[idx] = (nextRand() - 0.5) * 0.26;
      this.particleVelocities[idx + 1] = 0.05 + nextRand() * 0.14;
      this.particleVelocities[idx + 2] = (nextRand() - 0.5) * 0.26;
    }

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const ctx = spriteCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.55)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
      this.particleTexture = new THREE.CanvasTexture(spriteCanvas);
    }

    this.particleMaterial = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 4.5,
      sizeAttenuation: false,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.particles.raycast = () => {};
    this.scene.add(this.particles);
  }

  private updateParticles(dt: number): void {
    const posAttr = this.particleGeometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const vel = this.particleVelocities;
    const xMax = PARTICLE_X_MIN + PARTICLE_X_SPAN;
    const yMax = PARTICLE_Y_MIN + PARTICLE_Y_SPAN;
    const zMax = PARTICLE_Z_MIN + PARTICLE_Z_SPAN;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      let x = arr[idx] + vel[idx] * dt;
      let y = arr[idx + 1] + vel[idx + 1] * dt;
      let z = arr[idx + 2] + vel[idx + 2] * dt;

      if (x < PARTICLE_X_MIN) x += PARTICLE_X_SPAN;
      else if (x > xMax) x -= PARTICLE_X_SPAN;

      if (y < PARTICLE_Y_MIN) y += PARTICLE_Y_SPAN;
      else if (y > yMax) y -= PARTICLE_Y_SPAN;

      if (z < PARTICLE_Z_MIN) z += PARTICLE_Z_SPAN;
      else if (z > zMax) z -= PARTICLE_Z_SPAN;

      arr[idx] = x;
      arr[idx + 1] = y;
      arr[idx + 2] = z;
    }

    posAttr.needsUpdate = true;
  }

  /**
   * Updates scene background, fog, key/fill lights, and reconfigures the fixed
   * 4-PointLight pool in place without adding/removing lights (avoids shader recompilation).
   */
  applyAtmosphere(config: SceneAtmosphereConfig): void {
    if (config.backgroundColor !== undefined) {
      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.setHex(config.backgroundColor);
      } else {
        this.scene.background = new THREE.Color(config.backgroundColor);
      }
    }

    if (this.scene.fog instanceof THREE.FogExp2) {
      if (config.fogColor !== undefined) {
        this.scene.fog.color.setHex(config.fogColor);
      }
      if (config.fogDensity !== undefined) {
        this.scene.fog.density = config.fogDensity;
      }
    }

    if (config.ambientColor !== undefined) {
      this.ambientLight.color.setHex(config.ambientColor);
    }
    if (config.ambientIntensity !== undefined) {
      this.ambientLight.intensity = config.ambientIntensity;
    }

    if (config.hemiSkyColor !== undefined) {
      this.hemiLight.color.setHex(config.hemiSkyColor);
    }
    if (config.hemiGroundColor !== undefined) {
      this.hemiLight.groundColor.setHex(config.hemiGroundColor);
    }
    if (config.hemiIntensity !== undefined) {
      this.hemiLight.intensity = config.hemiIntensity;
    }

    if (config.dirColor !== undefined) {
      this.dirLight.color.setHex(config.dirColor);
    }
    if (config.dirIntensity !== undefined) {
      this.dirLight.intensity = config.dirIntensity;
    }
    if (config.dirPosition !== undefined) {
      this.dirLight.position.set(config.dirPosition[0], config.dirPosition[1], config.dirPosition[2]);
    }

    if (config.rimColor !== undefined) {
      this.rimLight.color.setHex(config.rimColor);
    }
    if (config.rimIntensity !== undefined) {
      this.rimLight.intensity = config.rimIntensity;
    }
    if (config.rimPosition !== undefined) {
      this.rimLight.position.set(config.rimPosition[0], config.rimPosition[1], config.rimPosition[2]);
    }

    if (config.pointLights !== undefined) {
      for (let i = 0; i < this.torchLights.length; i++) {
        const torch = this.torchLights[i];
        const cfg = config.pointLights[i];
        if (cfg) {
          torch.light.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
          if (cfg.color !== undefined) {
            torch.light.color.setHex(cfg.color);
          }
          if (cfg.distance !== undefined) {
            torch.light.distance = cfg.distance;
          }
          if (cfg.decay !== undefined) {
            torch.light.decay = cfg.decay;
          }
          const intensity = cfg.intensity ?? 3.2;
          torch.baseIntensity = intensity;
          torch.light.intensity = intensity;
          torch.light.visible = intensity > 0;
        } else {
          torch.baseIntensity = 0;
          torch.light.intensity = 0;
          torch.light.visible = false;
        }
      }
    }

    if (config.particleColor !== undefined) {
      this.particleMaterial.color.setHex(config.particleColor);
    }
    if (config.particleOpacity !== undefined) {
      this.particleMaterial.opacity = config.particleOpacity;
      this.particleMaterial.visible = config.particleOpacity > 0;
    }
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
        if (torch.baseIntensity <= 0) {
          torch.light.intensity = 0;
          continue;
        }
        const flicker =
          Math.sin(this.elapsed * 7.5 + torch.phase) * 0.25 +
          Math.sin(this.elapsed * 13.1 + torch.phase * 2) * 0.12;
        torch.light.intensity = Math.max(0, torch.baseIntensity + flicker);
      }

      this.updateParticles(dt);
      this.cameraController.update(dt);
      this.onFrameCallback?.(dt);
      this.renderer.render(this.scene, this.camera);

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  setAzimuth(azimuthRad: number, immediate = true): void {
    this.cameraController.setAzimuth(azimuthRad, immediate);
  }

  getAzimuth(): number {
    return this.cameraController.currentAzimuth;
  }

  dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('resize', this.handleResizeBound);
    this.scene.remove(this.particles);
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.particleTexture?.dispose();
    this.cameraController.dispose();
    this.renderer.dispose();
  }
}
