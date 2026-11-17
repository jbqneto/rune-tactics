import * as THREE from 'three';
import type { GridCoord, ObstacleKind } from '../../shared/types';
import type {
  AnimatedScenarioObject,
  ModularStructureResult,
  ObstacleRayUserData,
  OccluderBounds,
} from './ScenarioTypes';

// ---------------------------------------------------------------------------
// Deterministic PRNG & Resource Tracker
// ---------------------------------------------------------------------------

export function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOOP_RAYCAST: THREE.Mesh['raycast'] = () => {};

export class ScenarioResourceTracker {
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly textures = new Set<THREE.Texture>();

  trackGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.geometries.add(geo);
    return geo;
  }

  trackMaterial<T extends THREE.Material>(mat: T): T {
    this.materials.add(mat);
    return mat;
  }

  trackTexture<T extends THREE.Texture>(tex: T): T {
    this.textures.add(tex);
    return tex;
  }

  /** Disables raycasting recursively for non-interactive ornaments and effects. */
  markNoRaycast(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).raycast = NOOP_RAYCAST;
      }
    });
  }

  /** Attaches explicit obstacle raycast metadata and collects solid meshes. */
  applyObstacleMetadata(
    obj: THREE.Object3D,
    kind: ObstacleKind,
    coord: GridCoord,
    targetList: THREE.Mesh[]
  ): void {
    const data: ObstacleRayUserData = {
      kind: 'obstacle',
      obstacleKind: kind,
      gridCoord: { x: coord.x, y: coord.y },
    };
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.raycast !== NOOP_RAYCAST) {
        mesh.userData = data;
        targetList.push(mesh);
      }
    });
  }

  dispose(): void {
    for (const geo of this.geometries) {
      geo.dispose();
    }
    this.geometries.clear();

    for (const mat of this.materials) {
      mat.dispose();
    }
    this.materials.clear();

    for (const tex of this.textures) {
      tex.dispose();
    }
    this.textures.clear();
  }
}

export function computeWorldBounds(
  halfW: number,
  halfD: number,
  minY: number,
  maxY: number,
  worldX = 0,
  worldY = 0,
  worldZ = 0,
  rotationY = 0
): OccluderBounds {
  const c = Math.abs(Math.cos(rotationY));
  const s = Math.abs(Math.sin(rotationY));
  const rx = halfW * c + halfD * s;
  const rz = halfW * s + halfD * c;
  return {
    minX: worldX - rx,
    maxX: worldX + rx,
    minZ: worldZ - rz,
    maxZ: worldZ + rz,
    minY: worldY + minY,
    maxY: worldY + maxY,
  };
}

// ---------------------------------------------------------------------------
// Deterministic CanvasTexture Generators
// ---------------------------------------------------------------------------

function makeCanvas(size: number, height = size): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D context for procedural scenario texture.');
  }
  return [canvas, ctx];
}

function finalizeTexture(
  tracker: ScenarioResourceTracker,
  canvas: HTMLCanvasElement,
  repeat = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  } else {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  tex.needsUpdate = true;
  return tracker.trackTexture(tex);
}

export interface WeatheredStoneTextureOptions {
  seed?: number;
  variant?: 'floor' | 'masonry';
  baseColor?: string;
  secondaryColor?: string;
  mortarColor?: string;
  mossColor?: string;
  mossAmount?: number;
  size?: number;
}

export function createWeatheredStoneTexture(
  tracker: ScenarioResourceTracker,
  opts: WeatheredStoneTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const rng = createSeededRng(opts.seed ?? 101);
  const variant = opts.variant ?? 'floor';
  const baseColor = opts.baseColor ?? '#7c7b74';
  const secondaryColor = opts.secondaryColor ?? '#66655e';
  const mortarColor = opts.mortarColor ?? '#3b3d39';
  const mossColor = opts.mossColor ?? '#4a6b2f';
  const mossAmount = opts.mossAmount ?? 0.25;

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = mortarColor;
  ctx.fillRect(0, 0, size, size);

  const rows = variant === 'floor' ? 4 : 6;
  const cols = variant === 'floor' ? 4 : 3;
  const rowH = size / rows;
  const colW = size / cols;
  const gap = Math.max(2, Math.floor(size * 0.015));

  for (let r = 0; r < rows; r++) {
    const offset = variant === 'masonry' && r % 2 === 1 ? colW * 0.5 : 0;
    for (let c = -1; c <= cols; c++) {
      const bx = c * colW + offset + gap * 0.5;
      const by = r * rowH + gap * 0.5;
      const bw = colW - gap;
      const bh = rowH - gap;

      ctx.fillStyle = rng() > 0.45 ? baseColor : secondaryColor;
      ctx.fillRect(bx, by, bw, bh);

      // Subtle bevel highlight & wear
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(bx + 1, by + 1, bw - 2, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(bx + 1, by + bh - 3, bw - 2, 2);

      // Cracks / speckles
      const speckles = 6;
      for (let s = 0; s < speckles; s++) {
        const sx = bx + rng() * (bw - 4) + 2;
        const sy = by + rng() * (bh - 4) + 2;
        ctx.fillStyle = rng() > 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(sx, sy, 2 + rng() * 4, 2 + rng() * 3);
      }
    }
  }

  // Optional moss patches along mortar seams
  if (mossAmount > 0) {
    const count = Math.floor(42 * mossAmount);
    ctx.fillStyle = mossColor;
    for (let i = 0; i < count; i++) {
      const mx = rng() * size;
      const my = rng() * size;
      const mr = 3 + rng() * 9;
      ctx.globalAlpha = 0.35 + rng() * 0.35;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return finalizeTexture(tracker, canvas, true);
}

export interface MossTextureOptions {
  seed?: number;
  baseColor?: string;
  highlightColor?: string;
  earthColor?: string;
  size?: number;
}

export function createMossTexture(
  tracker: ScenarioResourceTracker,
  opts: MossTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const rng = createSeededRng(opts.seed ?? 202);
  const baseColor = opts.baseColor ?? '#4a6b2f';
  const highlightColor = opts.highlightColor ?? '#63883e';
  const earthColor = opts.earthColor ?? '#344723';

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 140; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 4 + rng() * 16;
    ctx.fillStyle = rng() > 0.45 ? earthColor : highlightColor;
    ctx.globalAlpha = 0.25 + rng() * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Tiny stylized blade/leaf strokes
  for (let i = 0; i < 90; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = rng() > 0.5 ? '#759c4a' : '#2a3d1c';
    ctx.fillRect(x, y, 2, 4);
  }

  return finalizeTexture(tracker, canvas, true);
}

export interface WoodPlankTextureOptions {
  seed?: number;
  baseColor?: string;
  grainColor?: string;
  planks?: number;
  size?: number;
}

export function createWoodPlankTexture(
  tracker: ScenarioResourceTracker,
  opts: WoodPlankTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const rng = createSeededRng(opts.seed ?? 303);
  const baseColor = opts.baseColor ?? '#6b472b';
  const grainColor = opts.grainColor ?? '#462c18';
  const planks = opts.planks ?? 5;

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const plankW = size / planks;
  for (let p = 0; p < planks; p++) {
    const x = p * plankW;
    ctx.fillStyle = p % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, 0, plankW, size);

    // Plank seam
    ctx.fillStyle = '#24150b';
    ctx.fillRect(x, 0, 2, size);

    // Grain lines
    ctx.fillStyle = grainColor;
    for (let g = 0; g < 6; g++) {
      const gx = x + 4 + rng() * Math.max(4, plankW - 8);
      ctx.globalAlpha = 0.28 + rng() * 0.25;
      ctx.fillRect(gx, 0, 1.5, size);
    }
    ctx.globalAlpha = 1;

    // Nail heads at ends
    ctx.fillStyle = '#1f2329';
    ctx.fillRect(x + 5, 10, 3, 3);
    ctx.fillRect(x + plankW - 8, 10, 3, 3);
    ctx.fillRect(x + 5, size - 13, 3, 3);
    ctx.fillRect(x + plankW - 8, size - 13, 3, 3);
  }

  return finalizeTexture(tracker, canvas, true);
}

export type BannerEmblem = 'sword' | 'tree' | 'rune';

export interface BannerTextureOptions {
  emblem?: BannerEmblem;
  clothColor?: string;
  trimColor?: string;
  emblemColor?: string;
  size?: number;
}

export function createBannerTexture(
  tracker: ScenarioResourceTracker,
  opts: BannerTextureOptions = {}
): THREE.CanvasTexture {
  const w = opts.size ?? 128;
  const h = w * 2;
  const emblem = opts.emblem ?? 'sword';
  const clothColor = opts.clothColor ?? '#8f1d22';
  const trimColor = opts.trimColor ?? '#d4a24c';
  const emblemColor = opts.emblemColor ?? '#e7dfd1';

  const [canvas, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);

  // Banner body with V-cut bottom
  ctx.fillStyle = clothColor;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.96);
  ctx.lineTo(w * 0.5, h * 0.8);
  ctx.lineTo(0, h * 0.96);
  ctx.closePath();
  ctx.fill();

  // Subtle vertical cloth fold shading
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.22)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.08)');
  grad.addColorStop(0.65, 'rgba(0,0,0,0.12)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Border trim
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(3, w * 0.05);
  ctx.strokeRect(w * 0.08, h * 0.04, w * 0.84, h * 0.72);

  // Emblem
  ctx.fillStyle = emblemColor;
  ctx.strokeStyle = emblemColor;
  const cx = w * 0.5;
  const cy = h * 0.4;

  if (emblem === 'sword') {
    ctx.fillRect(cx - w * 0.04, cy - h * 0.18, w * 0.08, h * 0.28);
    ctx.fillRect(cx - w * 0.16, cy + h * 0.04, w * 0.32, h * 0.035);
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.24);
    ctx.lineTo(cx - w * 0.06, cy - h * 0.17);
    ctx.lineTo(cx + w * 0.06, cy - h * 0.17);
    ctx.closePath();
    ctx.fill();
  } else if (emblem === 'tree') {
    ctx.fillRect(cx - w * 0.035, cy + h * 0.02, w * 0.07, h * 0.14);
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.05, w * 0.2, 0, Math.PI * 2);
    ctx.arc(cx - w * 0.12, cy + h * 0.01, w * 0.12, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.12, cy + h * 0.01, w * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = Math.max(3, w * 0.045);
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.18);
    ctx.lineTo(cx + w * 0.15, cy);
    ctx.lineTo(cx, cy + h * 0.18);
    ctx.lineTo(cx - w * 0.15, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.18);
    ctx.lineTo(cx, cy + h * 0.18);
    ctx.stroke();
  }

  return finalizeTexture(tracker, canvas, false);
}

export interface WaterTextureOptions {
  seed?: number;
  baseColor?: string;
  rippleColor?: string;
  deepColor?: string;
  size?: number;
}

export function createWaterTexture(
  tracker: ScenarioResourceTracker,
  opts: WaterTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const rng = createSeededRng(opts.seed ?? 404);
  const baseColor = opts.baseColor ?? '#1b3b3a';
  const rippleColor = opts.rippleColor ?? '#3b7470';
  const deepColor = opts.deepColor ?? '#112726';

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 45; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 10 + rng() * 24;
    ctx.fillStyle = deepColor;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = rippleColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < 36; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 14 + rng() * 26;
    ctx.globalAlpha = 0.25 + rng() * 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y - 4, x + len, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  return finalizeTexture(tracker, canvas, true);
}

export interface TerracottaRoofTextureOptions {
  seed?: number;
  baseColor?: string;
  darkColor?: string;
  size?: number;
}

export function createTerracottaRoofTexture(
  tracker: ScenarioResourceTracker,
  opts: TerracottaRoofTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const rng = createSeededRng(opts.seed ?? 505);
  const baseColor = opts.baseColor ?? '#9a3e2e';
  const darkColor = opts.darkColor ?? '#73281d';

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = darkColor;
  ctx.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 6;
  const rowH = size / rows;
  const colW = size / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? colW * 0.5 : 0;
    for (let c = -1; c <= cols; c++) {
      const tx = c * colW + offset;
      const ty = r * rowH;
      ctx.fillStyle = rng() > 0.35 ? baseColor : '#883325';
      ctx.beginPath();
      ctx.roundRect(tx + 2, ty + 2, colW - 4, rowH - 3, [2, 2, 8, 8]);
      ctx.fill();
    }
  }

  return finalizeTexture(tracker, canvas, true);
}

export interface MedallionTextureOptions {
  stoneColor?: string;
  engravingColor?: string;
  runeColor?: string;
  size?: number;
}

export function createMedallionTexture(
  tracker: ScenarioResourceTracker,
  opts: MedallionTextureOptions = {}
): THREE.CanvasTexture {
  const size = opts.size ?? 256;
  const stoneColor = opts.stoneColor ?? '#5d6968';
  const engravingColor = opts.engravingColor ?? '#2f3838';
  const runeColor = opts.runeColor ?? '#7dd3fc';

  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = stoneColor;
  ctx.fillRect(0, 0, size, size);

  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.strokeStyle = engravingColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.31, 0, Math.PI * 2);
  ctx.stroke();

  // 8-point rosette
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * size * 0.14, cy + Math.sin(a) * size * 0.14);
    ctx.lineTo(cx + Math.cos(a) * size * 0.42, cy + Math.sin(a) * size * 0.42);
    ctx.stroke();
  }

  // Faint runic inner ring
  ctx.strokeStyle = runeColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  return finalizeTexture(tracker, canvas, false);
}

export function createMistSpriteTexture(
  tracker: ScenarioResourceTracker,
  color = 'rgba(186, 214, 218, 0.45)',
  size = 128
): THREE.CanvasTexture {
  const [canvas, ctx] = makeCanvas(size);
  const cx = size * 0.5;
  const grad = ctx.createRadialGradient(cx, cx, size * 0.05, cx, cx, cx);
  grad.addColorStop(0, color);
  grad.addColorStop(0.55, 'rgba(148, 184, 190, 0.18)');
  grad.addColorStop(1, 'rgba(148, 184, 190, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return finalizeTexture(tracker, canvas, false);
}

export interface HorizonSkyTextureOptions {
  topColor?: string;
  midColor?: string;
  horizonColor?: string;
  groundColor?: string;
  size?: number;
}

export function createHorizonSkyTexture(
  tracker: ScenarioResourceTracker,
  opts: HorizonSkyTextureOptions = {}
): THREE.CanvasTexture {
  const w = opts.size ?? 512;
  const h = 256;
  const [canvas, ctx] = makeCanvas(w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, opts.topColor ?? '#162036');
  grad.addColorStop(0.45, opts.midColor ?? '#283b5c');
  grad.addColorStop(0.72, opts.horizonColor ?? '#555d78');
  grad.addColorStop(1, opts.groundColor ?? '#1a2230');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  return finalizeTexture(tracker, canvas, false);
}

// ---------------------------------------------------------------------------
// Internal Geometry Helpers
// ---------------------------------------------------------------------------

function makeStandardMat(
  tracker: ScenarioResourceTracker,
  params: THREE.MeshStandardMaterialParameters
): THREE.MeshStandardMaterial {
  return tracker.trackMaterial(
    new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.05,
      ...params,
    })
  );
}

function addBox(
  tracker: ScenarioResourceTracker,
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  castShadow = true,
  receiveShadow = true
): THREE.Mesh {
  const mesh = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

function createModularContainer(
  worldX = 0,
  worldY = 0,
  worldZ = 0,
  rotationY = 0
): { root: THREE.Group; baseGroup: THREE.Group; upperGroup: THREE.Group } {
  const root = new THREE.Group();
  root.position.set(worldX, worldY, worldZ);
  root.rotation.y = rotationY;
  const baseGroup = new THREE.Group();
  const upperGroup = new THREE.Group();
  root.add(baseGroup, upperGroup);
  return { root, baseGroup, upperGroup };
}

// ---------------------------------------------------------------------------
// Modular Structure Builders
// ---------------------------------------------------------------------------

export interface WallSegmentOptions {
  length?: number;
  height?: number;
  thickness?: number;
  crenellations?: boolean;
  moss?: boolean;
  stoneMat?: THREE.Material;
  mossMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildWallSegment(
  tracker: ScenarioResourceTracker,
  opts: WallSegmentOptions = {}
): ModularStructureResult {
  const length = opts.length ?? 2.4;
  const height = opts.height ?? 1.8;
  const thickness = opts.thickness ?? 0.55;
  const baseH = Math.min(0.45, height);
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x7b7870 });
  const mossMat = opts.mossMat ?? makeStandardMat(tracker, { color: 0x4a6b2f });

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  // Base plinth (always visible)
  addBox(tracker, baseGroup, length, baseH, thickness + 0.08, stoneMat, 0, baseH * 0.5, 0);

  // Upper wall body
  const upperH = Math.max(0.1, height - baseH);
  addBox(tracker, upperGroup, length, upperH, thickness, stoneMat, 0, baseH + upperH * 0.5, 0);

  if (opts.crenellations !== false) {
    const merlonCount = Math.max(2, Math.floor(length / 0.65));
    const step = length / merlonCount;
    for (let i = 0; i < merlonCount; i++) {
      const mx = -length * 0.5 + step * (i + 0.5);
      addBox(
        tracker,
        upperGroup,
        step * 0.55,
        0.32,
        thickness * 0.88,
        stoneMat,
        mx,
        height + 0.16,
        0
      );
    }
  }

  if (opts.moss) {
    const patch = addBox(
      tracker,
      upperGroup,
      length * 0.42,
      0.16,
      thickness + 0.04,
      mossMat,
      -length * 0.18,
      height * 0.72,
      0,
      false,
      true
    );
    tracker.markNoRaycast(patch);
  }

  const totalH = opts.crenellations !== false ? height + 0.32 : height;
  const bounds = computeWorldBounds(
    length * 0.5,
    (thickness + 0.08) * 0.5,
    0,
    totalH,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface GatehouseOptions {
  openingWidth?: number;
  height?: number;
  stoneMat?: THREE.Material;
  ironMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildGatehouse(
  tracker: ScenarioResourceTracker,
  opts: GatehouseOptions = {}
): ModularStructureResult {
  const openingW = opts.openingWidth ?? 2.1;
  const height = opts.height ?? 2.8;
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x7e7b73 });
  const ironMat = opts.ironMat ?? makeStandardMat(tracker, { color: 0x2b2f38, metalness: 0.6, roughness: 0.45 });

  const towerW = 1.05;
  const towerD = 1.15;
  const totalW = openingW + towerW * 2;
  const baseH = 0.45;

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  // Two tower bases (always visible)
  const sideOffset = openingW * 0.5 + towerW * 0.5;
  addBox(tracker, baseGroup, towerW + 0.1, baseH, towerD + 0.1, stoneMat, -sideOffset, baseH * 0.5, 0);
  addBox(tracker, baseGroup, towerW + 0.1, baseH, towerD + 0.1, stoneMat, sideOffset, baseH * 0.5, 0);

  // Upper side towers + crenellations
  const towerUpperH = height - baseH;
  for (const sx of [-sideOffset, sideOffset]) {
    addBox(tracker, upperGroup, towerW, towerUpperH, towerD, stoneMat, sx, baseH + towerUpperH * 0.5, 0);
    for (const cx of [-0.32, 0.32]) {
      for (const cz of [-0.35, 0.35]) {
        addBox(tracker, upperGroup, 0.28, 0.3, 0.28, stoneMat, sx + cx, height + 0.15, cz);
      }
    }
  }

  // Arch lintel connecting towers
  const lintelH = 0.65;
  const lintelY = height - lintelH * 0.5 - 0.15;
  addBox(tracker, upperGroup, openingW + 0.2, lintelH, 0.72, stoneMat, 0, lintelY, 0);

  // Iron portcullis (semi-raised)
  const bars = 5;
  for (let i = 0; i < bars; i++) {
    const bx = -openingW * 0.38 + (openingW * 0.76 * i) / (bars - 1);
    addBox(tracker, upperGroup, 0.06, 1.35, 0.06, ironMat, bx, 1.45, 0, true, false);
  }
  addBox(tracker, upperGroup, openingW * 0.86, 0.06, 0.08, ironMat, 0, 1.05, 0, true, false);
  addBox(tracker, upperGroup, openingW * 0.86, 0.06, 0.08, ironMat, 0, 1.65, 0, true, false);

  const bounds = computeWorldBounds(
    totalW * 0.5,
    (towerD + 0.1) * 0.5,
    0,
    height + 0.3,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface WatchtowerOptions {
  height?: number;
  woodMat?: THREE.Material;
  roofMat?: THREE.Material;
  stoneMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildWatchtower(
  tracker: ScenarioResourceTracker,
  opts: WatchtowerOptions = {}
): ModularStructureResult {
  const deckY = opts.height ?? 2.1;
  const woodMat = opts.woodMat ?? makeStandardMat(tracker, { color: 0x6e4728 });
  const roofMat = opts.roofMat ?? makeStandardMat(tracker, { color: 0x9a3e2e });
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x737067 });
  const lanternMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({ color: 0xfdba74 })
  );

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  // Stone foundation & palisade stakes (always visible)
  addBox(tracker, baseGroup, 1.7, 0.35, 1.7, stoneMat, 0, 0.175, 0);
  const stakeGeo = tracker.trackGeometry(new THREE.ConeGeometry(0.08, 0.45, 5));
  for (const sx of [-0.75, -0.25, 0.25, 0.75]) {
    const stake = new THREE.Mesh(stakeGeo, woodMat);
    stake.position.set(sx, 0.225, 0.92);
    stake.castShadow = true;
    baseGroup.add(stake);
  }

  // 4 corner posts
  for (const px of [-0.62, 0.62]) {
    for (const pz of [-0.62, 0.62]) {
      addBox(tracker, upperGroup, 0.14, deckY + 1.15, 0.14, woodMat, px, (deckY + 1.15) * 0.5, pz);
    }
  }

  // Platform deck + guard rails
  addBox(tracker, upperGroup, 1.55, 0.12, 1.55, woodMat, 0, deckY, 0);
  addBox(tracker, upperGroup, 1.5, 0.08, 0.08, woodMat, 0, deckY + 0.48, 0.7);
  addBox(tracker, upperGroup, 1.5, 0.08, 0.08, woodMat, 0, deckY + 0.48, -0.7);
  addBox(tracker, upperGroup, 0.08, 0.08, 1.5, woodMat, 0.7, deckY + 0.48, 0);
  addBox(tracker, upperGroup, 0.08, 0.08, 1.5, woodMat, -0.7, deckY + 0.48, 0);

  // Pyramidal terracotta roof
  const roof = new THREE.Mesh(
    tracker.trackGeometry(new THREE.ConeGeometry(1.38, 1.05, 4)),
    roofMat
  );
  roof.position.set(0, deckY + 1.65, 0);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;
  upperGroup.add(roof);

  // Hanging lantern
  const lantern = new THREE.Mesh(
    tracker.trackGeometry(new THREE.OctahedronGeometry(0.12, 0)),
    lanternMat
  );
  lantern.position.set(0.75, deckY + 0.85, 0.75);
  tracker.markNoRaycast(lantern);
  upperGroup.add(lantern);

  const bounds = computeWorldBounds(
    0.95,
    0.95,
    0,
    deckY + 2.2,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface TentOptions {
  width?: number;
  depth?: number;
  height?: number;
  clothMat?: THREE.Material;
  woodMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildTent(
  tracker: ScenarioResourceTracker,
  opts: TentOptions = {}
): ModularStructureResult {
  const w = opts.width ?? 1.5;
  const d = opts.depth ?? 1.8;
  const h = opts.height ?? 1.25;
  const clothMat = opts.clothMat ?? makeStandardMat(tracker, { color: 0x8f1d22, roughness: 0.9 });
  const woodMat = opts.woodMat ?? makeStandardMat(tracker, { color: 0x5c3c22 });

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  // Low supply crate at base (always visible)
  addBox(tracker, baseGroup, 0.45, 0.35, 0.45, woodMat, w * 0.45, 0.175, d * 0.3);

  // Tent prism canopy (3-sided cylinder rotated)
  const tentGeo = tracker.trackGeometry(new THREE.CylinderGeometry(w * 0.58, w * 0.58, d, 3));
  tentGeo.rotateX(Math.PI / 2);
  const tent = new THREE.Mesh(tentGeo, clothMat);
  tent.scale.set(1, h / (w * 0.86), 1);
  tent.position.set(0, h * 0.42, 0);
  tent.castShadow = true;
  tent.receiveShadow = true;
  upperGroup.add(tent);

  // Ridge pole & front/back support posts
  addBox(tracker, upperGroup, 0.08, 0.08, d + 0.25, woodMat, 0, h * 0.96, 0);
  addBox(tracker, upperGroup, 0.08, h, 0.08, woodMat, 0, h * 0.5, d * 0.5 + 0.05);
  addBox(tracker, upperGroup, 0.08, h, 0.08, woodMat, 0, h * 0.5, -d * 0.5 - 0.05);

  const bounds = computeWorldBounds(
    w * 0.6,
    d * 0.55,
    0,
    h + 0.1,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface RuinedArchOptions {
  style?: 'roman' | 'gothic';
  width?: number;
  height?: number;
  stoneMat?: THREE.Material;
  mossMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildRuinedArch(
  tracker: ScenarioResourceTracker,
  opts: RuinedArchOptions = {}
): ModularStructureResult {
  const style = opts.style ?? 'gothic';
  const width = opts.width ?? 2.2;
  const height = opts.height ?? 2.5;
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x6c7877 });
  const mossMat = opts.mossMat ?? makeStandardMat(tracker, { color: 0x4a6b2f });

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  const pillarW = 0.48;
  const pillarD = 0.52;
  const halfSpan = width * 0.5 - pillarW * 0.5;
  const baseH = 0.42;

  // Pedestals (always visible)
  addBox(tracker, baseGroup, pillarW + 0.1, baseH, pillarD + 0.1, stoneMat, -halfSpan, baseH * 0.5, 0);
  addBox(tracker, baseGroup, pillarW + 0.1, baseH, pillarD + 0.1, stoneMat, halfSpan, baseH * 0.5, 0);

  // Upper columns
  const colH = height * 0.68 - baseH;
  addBox(tracker, upperGroup, pillarW, colH, pillarD, stoneMat, -halfSpan, baseH + colH * 0.5, 0);
  addBox(tracker, upperGroup, pillarW, colH, pillarD, stoneMat, halfSpan, baseH + colH * 0.5, 0);

  if (style === 'gothic') {
    // Pointed ogival arch segments
    const segLen = width * 0.58;
    const leftSlope = addBox(tracker, upperGroup, segLen, 0.34, pillarD * 0.9, stoneMat, -halfSpan * 0.48, height * 0.82, 0);
    leftSlope.rotation.z = 0.58;
    const rightSlope = addBox(tracker, upperGroup, segLen, 0.34, pillarD * 0.9, stoneMat, halfSpan * 0.48, height * 0.82, 0);
    rightSlope.rotation.z = -0.58;
    addBox(tracker, upperGroup, 0.36, 0.32, pillarD * 0.92, stoneMat, 0, height * 0.96, 0);
  } else {
    // Roman semi-circular/stepped arch
    addBox(tracker, upperGroup, width * 0.88, 0.34, pillarD * 0.9, stoneMat, 0, height * 0.82, 0);
    addBox(tracker, upperGroup, width * 0.5, 0.24, pillarD * 0.85, stoneMat, 0, height * 0.96, 0);
  }

  // Moss cap & hanging vine
  const moss = addBox(tracker, upperGroup, width * 0.46, 0.14, pillarD * 0.95, mossMat, -0.2, height * 0.92, 0, false, true);
  tracker.markNoRaycast(moss);

  const bounds = computeWorldBounds(
    width * 0.5 + 0.08,
    pillarD * 0.55,
    0,
    height + 0.15,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface BrokenPillarOptions {
  height?: number;
  radius?: number;
  moss?: boolean;
  stoneMat?: THREE.Material;
  mossMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildBrokenPillar(
  tracker: ScenarioResourceTracker,
  opts: BrokenPillarOptions = {}
): ModularStructureResult {
  const height = opts.height ?? 1.3;
  const radius = opts.radius ?? 0.34;
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x767a77 });
  const mossMat = opts.mossMat ?? makeStandardMat(tracker, { color: 0x4a6b2f });

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  // Stepped base (always visible)
  addBox(tracker, baseGroup, radius * 2.4, 0.22, radius * 2.4, stoneMat, 0, 0.11, 0);
  addBox(tracker, baseGroup, radius * 2.0, 0.16, radius * 2.0, stoneMat, 0, 0.3, 0);

  // Fractured shaft
  const shaftH = Math.max(0.25, height - 0.38);
  const shaft = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(radius * 0.88, radius, shaftH, 7)),
    stoneMat
  );
  shaft.position.set(0, 0.38 + shaftH * 0.5, 0);
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  upperGroup.add(shaft);

  // Angled fracture cap
  const cap = addBox(tracker, upperGroup, radius * 1.1, 0.2, radius * 0.95, stoneMat, 0.04, height - 0.05, 0);
  cap.rotation.z = 0.24;

  if (opts.moss) {
    const moss = addBox(tracker, upperGroup, radius * 1.3, 0.1, radius * 1.3, mossMat, 0, height - 0.02, 0, false, true);
    tracker.markNoRaycast(moss);
  }

  const bounds = computeWorldBounds(
    radius * 1.25,
    radius * 1.25,
    0,
    height + 0.08,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface StaircaseOptions {
  width?: number;
  steps?: number;
  height?: number;
  depth?: number;
  stoneMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildStaircase(
  tracker: ScenarioResourceTracker,
  opts: StaircaseOptions = {}
): THREE.Group {
  const width = opts.width ?? 1.8;
  const steps = opts.steps ?? 4;
  const height = opts.height ?? 0.55;
  const depth = opts.depth ?? 1.2;
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x737067 });

  const group = new THREE.Group();
  group.position.set(opts.worldX ?? 0, opts.worldY ?? 0, opts.worldZ ?? 0);
  group.rotation.y = opts.rotationY ?? 0;

  const stepH = height / steps;
  const stepD = depth / steps;
  for (let i = 0; i < steps; i++) {
    const curH = stepH * (i + 1);
    const z = -depth * 0.5 + stepD * (i + 0.5);
    addBox(tracker, group, width, curH, stepD + 0.02, stoneMat, 0, curH * 0.5, z);
  }

  // Side stringers
  addBox(tracker, group, 0.14, height * 0.72, depth, stoneMat, -width * 0.5 - 0.05, height * 0.36, 0);
  addBox(tracker, group, 0.14, height * 0.72, depth, stoneMat, width * 0.5 + 0.05, height * 0.36, 0);

  return group;
}

export interface BridgeOptions {
  length?: number;
  width?: number;
  railLeft?: boolean;
  railRight?: boolean;
  woodMat?: THREE.Material;
  postMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

/**
 * Builds a wooden bridge segment with deck top strictly at `y = -0.003`
 * so `BoardHighlights` (y >= 0.010) remain 100% visible over `bridgeCells`.
 */
export function buildBridge(
  tracker: ScenarioResourceTracker,
  opts: BridgeOptions = {}
): THREE.Group {
  const length = opts.length ?? 1.0;
  const width = opts.width ?? 0.96;
  const woodMat = opts.woodMat ?? makeStandardMat(tracker, { color: 0x5e412c });
  const postMat = opts.postMat ?? makeStandardMat(tracker, { color: 0x402b1c });

  const group = new THREE.Group();
  group.position.set(opts.worldX ?? 0, opts.worldY ?? 0, opts.worldZ ?? 0);
  group.rotation.y = opts.rotationY ?? 0;

  // Planks: height 0.04, center at -0.023 => top at y = -0.003
  const plankCount = 4;
  const plankLen = (length - 0.04) / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const pz = -length * 0.5 + plankLen * (i + 0.5) + 0.02;
    addBox(tracker, group, width, 0.04, plankLen - 0.03, woodMat, 0, -0.023, pz, false, true);
  }

  // Submerged support stringers (y < -0.04)
  addBox(tracker, group, 0.1, 0.14, length, postMat, -width * 0.36, -0.11, 0, false, true);
  addBox(tracker, group, 0.1, 0.14, length, postMat, width * 0.36, -0.11, 0, false, true);

  // Selective side railings (only adjacent to water)
  const addRail = (rx: number): void => {
    addBox(tracker, group, 0.07, 0.28, 0.07, postMat, rx, 0.11, -length * 0.42);
    addBox(tracker, group, 0.07, 0.28, 0.07, postMat, rx, 0.11, length * 0.42);
    addBox(tracker, group, 0.05, 0.05, length, woodMat, rx, 0.22, 0);
  };

  if (opts.railLeft) addRail(-width * 0.46);
  if (opts.railRight) addRail(width * 0.46);

  return group;
}

export interface BrazierOptions {
  pedestalHeight?: number;
  stoneMat?: THREE.Material;
  ironMat?: THREE.Material;
  flameColor?: number;
  coreColor?: number;
  phase?: number;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
}

export function buildBrazier(
  tracker: ScenarioResourceTracker,
  opts: BrazierOptions = {}
): ModularStructureResult {
  const pedH = opts.pedestalHeight ?? 0.72;
  const stoneMat = opts.stoneMat ?? makeStandardMat(tracker, { color: 0x6e716d });
  const ironMat = opts.ironMat ?? makeStandardMat(tracker, { color: 0x2b2f38, metalness: 0.55, roughness: 0.45 });
  const outerMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({ color: opts.flameColor ?? 0xf97316, transparent: true, opacity: 0.88 })
  );
  const innerMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({ color: opts.coreColor ?? 0xfef08a })
  );

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    0
  );

  // Pedestal base
  const baseTarget = pedH > 0.75 ? baseGroup : root;
  const upperTarget = pedH > 0.75 ? upperGroup : root;

  addBox(tracker, baseTarget, 0.52, Math.min(0.42, pedH), 0.52, stoneMat, 0, Math.min(0.42, pedH) * 0.5, 0);
  if (pedH > 0.42) {
    const rem = pedH - 0.42;
    addBox(tracker, upperTarget, 0.38, rem, 0.38, stoneMat, 0, 0.42 + rem * 0.5, 0);
  }

  // Iron bowl
  const bowl = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(0.32, 0.18, 0.22, 6)),
    ironMat
  );
  bowl.position.set(0, pedH + 0.11, 0);
  bowl.castShadow = true;
  upperTarget.add(bowl);

  // Multi-layer flame
  const outerFlame = new THREE.Mesh(
    tracker.trackGeometry(new THREE.ConeGeometry(0.2, 0.48, 5)),
    outerMat
  );
  outerFlame.position.set(0, pedH + 0.36, 0);
  tracker.markNoRaycast(outerFlame);
  upperTarget.add(outerFlame);

  const innerFlame = new THREE.Mesh(
    tracker.trackGeometry(new THREE.ConeGeometry(0.11, 0.3, 5)),
    innerMat
  );
  innerFlame.position.set(0, pedH + 0.31, 0);
  tracker.markNoRaycast(innerFlame);
  upperTarget.add(innerFlame);

  const phase = opts.phase ?? 0;
  const flameAnim: AnimatedScenarioObject = {
    kind: 'flame',
    update: (_dt, elapsed) => {
      const wave = Math.sin(elapsed * 7.5 + phase) * 0.12 + Math.cos(elapsed * 13.0 + phase) * 0.07;
      outerFlame.scale.set(1 + wave * 0.4, 1 + wave, 1 - wave * 0.3);
      outerFlame.rotation.y = elapsed * 1.4 + phase;
      innerFlame.scale.set(1 - wave * 0.3, 1 + wave * 0.7, 1 + wave * 0.3);
    },
  };

  const bounds = computeWorldBounds(
    0.34,
    0.34,
    0,
    pedH + 0.6,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    0
  );

  return { root, baseGroup, upperGroup, bounds, animated: [flameAnim] };
}

export interface TreeOptions {
  variant?: 'gnarled' | 'pine';
  scale?: number;
  trunkMat?: THREE.Material;
  foliageMat?: THREE.Material;
  mossMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildTree(
  tracker: ScenarioResourceTracker,
  opts: TreeOptions = {}
): ModularStructureResult {
  const variant = opts.variant ?? 'pine';
  const s = opts.scale ?? 1.0;

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  if (variant === 'gnarled') {
    const trunkMat = opts.trunkMat ?? makeStandardMat(tracker, { color: 0x42352c });
    const foliageMat = opts.foliageMat ?? makeStandardMat(tracker, { color: 0x3b592c });
    const mossMat = opts.mossMat ?? makeStandardMat(tracker, { color: 0x5c6e49 });

    // Exposed roots & stump base (always visible)
    const stump = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.28 * s, 0.45 * s, 0.45 * s, 7)),
      trunkMat
    );
    stump.position.set(0, 0.22 * s, 0);
    stump.castShadow = true;
    baseGroup.add(stump);

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.3;
      const rootMesh = addBox(
        tracker,
        baseGroup,
        0.16 * s,
        0.18 * s,
        0.65 * s,
        trunkMat,
        Math.cos(a) * 0.36 * s,
        0.09 * s,
        Math.sin(a) * 0.36 * s
      );
      rootMesh.rotation.y = -a;
    }

    // Twisted upper trunk + limbs + canopy
    const trunk = new THREE.Mesh(
      tracker.trackGeometry(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 1.8 * s, 7)),
      trunkMat
    );
    trunk.position.set(0.06 * s, 1.3 * s, 0);
    trunk.rotation.z = -0.12;
    trunk.castShadow = true;
    upperGroup.add(trunk);

    const canopyOffsets: [number, number, number, number][] = [
      [0, 2.35 * s, 0, 0.85 * s],
      [-0.55 * s, 2.05 * s, 0.25 * s, 0.6 * s],
      [0.58 * s, 2.15 * s, -0.2 * s, 0.58 * s],
    ];
    for (const [cx, cy, cz, cr] of canopyOffsets) {
      const puff = new THREE.Mesh(
        tracker.trackGeometry(new THREE.IcosahedronGeometry(cr, 0)),
        foliageMat
      );
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      puff.receiveShadow = true;
      upperGroup.add(puff);
    }

    // Hanging Spanish moss curtains
    for (const [mx, mz] of [[-0.5 * s, 0.25 * s], [0.5 * s, -0.15 * s], [0.1 * s, 0.5 * s]]) {
      const drape = addBox(tracker, upperGroup, 0.08 * s, 0.65 * s, 0.08 * s, mossMat, mx, 1.55 * s, mz, false, false);
      tracker.markNoRaycast(drape);
    }

    const bounds = computeWorldBounds(
      0.9 * s,
      0.9 * s,
      0,
      3.1 * s,
      opts.worldX,
      opts.worldY,
      opts.worldZ,
      opts.rotationY
    );
    return { root, baseGroup, upperGroup, bounds, animated: [] };
  }

  // Medieval layered pine tree
  const trunkMat = opts.trunkMat ?? makeStandardMat(tracker, { color: 0x4f311b });
  const foliageMat = opts.foliageMat ?? makeStandardMat(tracker, { color: 0x264429 });

  const trunkBase = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(0.14 * s, 0.18 * s, 0.45 * s, 6)),
    trunkMat
  );
  trunkBase.position.set(0, 0.225 * s, 0);
  trunkBase.castShadow = true;
  baseGroup.add(trunkBase);

  const layers: [number, number, number][] = [
    [0.82 * s, 1.0 * s, 0.95 * s],
    [0.64 * s, 0.9 * s, 1.55 * s],
    [0.44 * s, 0.8 * s, 2.1 * s],
  ];
  for (const [r, h, y] of layers) {
    const cone = new THREE.Mesh(
      tracker.trackGeometry(new THREE.ConeGeometry(r, h, 6)),
      foliageMat
    );
    cone.position.set(0, y, 0);
    cone.castShadow = true;
    cone.receiveShadow = true;
    upperGroup.add(cone);
  }

  const bounds = computeWorldBounds(
    0.85 * s,
    0.85 * s,
    0,
    2.55 * s,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );
  return { root, baseGroup, upperGroup, bounds, animated: [] };
}

export interface AquaticPlantsOptions {
  seed?: number;
  lilyPads?: number;
  lotusCount?: number;
  reedsCount?: number;
  spreadRadius?: number;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
}

export function buildAquaticPlants(
  tracker: ScenarioResourceTracker,
  opts: AquaticPlantsOptions = {}
): THREE.Group {
  const rng = createSeededRng(opts.seed ?? 606);
  const spread = opts.spreadRadius ?? 0.36;
  const padMat = makeStandardMat(tracker, { color: 0x3f6e34, roughness: 0.7 });
  const lotusMat = makeStandardMat(tracker, { color: 0xf9a8d4, roughness: 0.6 });
  const reedMat = makeStandardMat(tracker, { color: 0x3d592a });
  const tipMat = makeStandardMat(tracker, { color: 0x8c3b2b });

  const group = new THREE.Group();
  group.position.set(opts.worldX ?? 0, opts.worldY ?? -0.04, opts.worldZ ?? 0);

  const padGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 7, 1, false, 0, Math.PI * 1.75));
  const lilyCount = opts.lilyPads ?? 3;
  for (let i = 0; i < lilyCount; i++) {
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set((rng() - 0.5) * spread * 2, 0.005, (rng() - 0.5) * spread * 2);
    pad.rotation.y = rng() * Math.PI * 2;
    pad.scale.setScalar(0.7 + rng() * 0.55);
    group.add(pad);
  }

  const lotusGeo = tracker.trackGeometry(new THREE.OctahedronGeometry(0.06, 0));
  const lotusCount = opts.lotusCount ?? 1;
  for (let i = 0; i < lotusCount; i++) {
    const flower = new THREE.Mesh(lotusGeo, lotusMat);
    flower.position.set((rng() - 0.5) * spread * 1.6, 0.035, (rng() - 0.5) * spread * 1.6);
    group.add(flower);
  }

  const reedCount = opts.reedsCount ?? 3;
  for (let i = 0; i < reedCount; i++) {
    const rx = (rng() - 0.5) * spread * 1.8;
    const rz = (rng() - 0.5) * spread * 1.8;
    const rh = 0.28 + rng() * 0.22;
    const stalk = addBox(tracker, group, 0.025, rh, 0.025, reedMat, rx, rh * 0.5, rz, false, false);
    stalk.rotation.z = (rng() - 0.5) * 0.18;
    addBox(tracker, group, 0.04, 0.08, 0.04, tipMat, rx, rh * 0.88, rz, false, false);
  }

  tracker.markNoRaycast(group);
  return group;
}

export interface CliffEdgeOptions {
  boardHalfExtent?: number;
  depth?: number;
  seed?: number;
  cliffMat?: THREE.Material;
}

export function buildCliffEdge(
  tracker: ScenarioResourceTracker,
  opts: CliffEdgeOptions = {}
): THREE.Group {
  const half = opts.boardHalfExtent ?? 6.2;
  const depth = opts.depth ?? 9.5;
  const rng = createSeededRng(opts.seed ?? 707);
  const cliffMat = opts.cliffMat ?? makeStandardMat(tracker, { color: 0x454a54, roughness: 0.94 });

  const group = new THREE.Group();

  // Solid under-slab core
  addBox(tracker, group, half * 2, depth, half * 2, cliffMat, 0, -0.16 - depth * 0.5, 0, false, true);

  // Faceted rocky buttresses around all 4 sides
  const segments = 6;
  const step = (half * 2) / segments;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < segments; i++) {
      const along = -half + step * (i + 0.5);
      const w = step * (0.9 + rng() * 0.25);
      const h = depth * (0.72 + rng() * 0.28);
      const out = 0.65 + rng() * 0.65;
      const y = -0.16 - h * 0.5;
      const offset = half + out * 0.35;

      const x = side === 0 ? along : side === 1 ? along : side === 2 ? -offset : offset;
      const z = side === 0 ? -offset : side === 1 ? offset : along;
      const bw = side < 2 ? w : out;
      const bd = side < 2 ? out : w;

      addBox(tracker, group, bw, h, bd, cliffMat, x, y, z, false, true);
    }
  }

  tracker.markNoRaycast(group);
  return group;
}

export interface DistantSilhouettesOptions {
  skyPalette?: HorizonSkyTextureOptions;
  silhouetteColor?: number;
  variant?: 'fortress' | 'swamp';
  radius?: number;
}

export function buildDistantSilhouettes(
  tracker: ScenarioResourceTracker,
  opts: DistantSilhouettesOptions = {}
): THREE.Group {
  const radius = opts.radius ?? 38;
  const variant = opts.variant ?? 'fortress';
  const group = new THREE.Group();

  // 360° Horizon sky cylinder
  const skyTex = createHorizonSkyTexture(tracker, opts.skyPalette);
  const skyMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
    })
  );
  const skyRing = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(radius, radius, 28, 32, 1, true)),
    skyMat
  );
  skyRing.position.y = 2.5;
  group.add(skyRing);

  const silMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({
      color: opts.silhouetteColor ?? (variant === 'fortress' ? 0x1b2538 : 0x0f1d22),
    })
  );

  // Distant mountain / ridge ring
  const ridgeCount = 12;
  for (let i = 0; i < ridgeCount; i++) {
    const a = (i * Math.PI * 2) / ridgeCount;
    const dist = 24 + (i % 3) * 3;
    const h = 4 + (i % 4) * 1.6;
    const cone = new THREE.Mesh(
      tracker.trackGeometry(new THREE.ConeGeometry(4.5, h, 5)),
      silMat
    );
    cone.position.set(Math.cos(a) * dist, -3.5 + h * 0.5, Math.sin(a) * dist);
    group.add(cone);
  }

  if (variant === 'fortress') {
    // Distant castle keep silhouette at (-18, -22)
    addBox(tracker, group, 4.2, 4.8, 3.0, silMat, -18, -1.0, -22, false, false);
    addBox(tracker, group, 1.4, 6.8, 1.4, silMat, -20.2, 0.0, -22, false, false);
    addBox(tracker, group, 1.4, 6.2, 1.4, silMat, -15.8, -0.3, -22, false, false);
  } else {
    // Distant submerged aqueduct arches
    for (let i = 0; i < 4; i++) {
      addBox(tracker, group, 0.8, 3.2, 0.8, silMat, -15 + i * 2.6, -1.6, -20, false, false);
    }
    addBox(tracker, group, 9.2, 0.7, 0.9, silMat, -11.1, 0.2, -20, false, false);
  }

  tracker.markNoRaycast(group);
  return group;
}

export interface WaterfallOptions {
  width?: number;
  height?: number;
  waterColor?: number;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildWaterfall(
  tracker: ScenarioResourceTracker,
  opts: WaterfallOptions = {}
): { root: THREE.Group; animated: AnimatedScenarioObject[] } {
  const width = opts.width ?? 1.5;
  const height = opts.height ?? 8.0;
  const waterTex = createWaterTexture(tracker, {
    seed: 808,
    baseColor: '#2d6e7e',
    rippleColor: '#93e5f5',
    deepColor: '#1b4a58',
  });
  waterTex.repeat.set(1, 3);

  const waterMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({
      map: waterTex,
      color: opts.waterColor ?? 0x7dd3fc,
      transparent: true,
      opacity: 0.72,
    })
  );

  const mistTex = createMistSpriteTexture(tracker, 'rgba(210, 238, 250, 0.55)');
  const mistMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({
      map: mistTex,
      transparent: true,
      depthWrite: false,
    })
  );

  const root = new THREE.Group();
  root.position.set(opts.worldX ?? 0, opts.worldY ?? -0.2, opts.worldZ ?? 0);
  root.rotation.y = opts.rotationY ?? 0;

  const stream = new THREE.Mesh(
    tracker.trackGeometry(new THREE.PlaneGeometry(width, height)),
    waterMat
  );
  stream.position.set(0, -height * 0.5, 0);
  root.add(stream);

  const mist = new THREE.Mesh(
    tracker.trackGeometry(new THREE.PlaneGeometry(width * 2.2, width * 1.4)),
    mistMat
  );
  mist.rotation.x = -Math.PI / 2;
  mist.position.set(0, -height + 0.35, 0.4);
  root.add(mist);

  tracker.markNoRaycast(root);

  const anim: AnimatedScenarioObject = {
    kind: 'waterfall',
    update: (dt, elapsed) => {
      waterTex.offset.y -= dt * 1.35;
      mist.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.08);
    },
  };

  return { root, animated: [anim] };
}

export interface BannerStandOptions {
  emblem?: BannerEmblem;
  clothColor?: string;
  trimColor?: string;
  emblemColor?: string;
  woodMat?: THREE.Material;
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  rotationY?: number;
}

export function buildBannerStand(
  tracker: ScenarioResourceTracker,
  opts: BannerStandOptions = {}
): ModularStructureResult {
  const woodMat = opts.woodMat ?? makeStandardMat(tracker, { color: 0x4f311b });
  const bannerTex = createBannerTexture(tracker, {
    emblem: opts.emblem,
    clothColor: opts.clothColor,
    trimColor: opts.trimColor,
    emblemColor: opts.emblemColor,
  });
  const clothMat = tracker.trackMaterial(
    new THREE.MeshStandardMaterial({
      map: bannerTex,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      roughness: 0.85,
    })
  );

  const { root, baseGroup, upperGroup } = createModularContainer(
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  addBox(tracker, baseGroup, 0.24, 0.36, 0.24, woodMat, 0, 0.18, 0);
  addBox(tracker, upperGroup, 0.07, 1.9, 0.07, woodMat, 0, 1.25, 0);
  addBox(tracker, upperGroup, 0.65, 0.06, 0.06, woodMat, 0, 2.12, 0);

  const cloth = new THREE.Mesh(
    tracker.trackGeometry(new THREE.PlaneGeometry(0.56, 1.12)),
    clothMat
  );
  cloth.position.set(0, 1.52, 0.04);
  cloth.castShadow = true;
  upperGroup.add(cloth);

  const bounds = computeWorldBounds(
    0.34,
    0.16,
    0,
    2.25,
    opts.worldX,
    opts.worldY,
    opts.worldZ,
    opts.rotationY
  );

  return { root, baseGroup, upperGroup, bounds, animated: [] };
}
