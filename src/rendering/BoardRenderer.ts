import * as THREE from 'three';
import type { GridCoord, ObstacleDef } from '../shared/types';

export interface BoardHighlights {
  reachable: GridCoord[];
  attackRangeCells?: GridCoord[];
  attackable: GridCoord[];
  skillRangeCells?: GridCoord[];
  skillTargets: GridCoord[];
  skillArea: GridCoord[];
  skillMode?: 'enemy' | 'ally';
  hoverCell: GridCoord | null;
  path: GridCoord[] | null;
}

const GRID_HIGHLIGHTS = {
  movement: { color: 0x3b82f6, opacity: 0.28 },
  attackRange: { color: 0xef4444, opacity: 0.12 },
  healRange: { color: 0x34d399, opacity: 0.14 },
  validTarget: { color: 0xf97316, opacity: 0.40 },
} as const;

const CELL_SIZE = 1;
const TILE_HEIGHT = 0.16;

function coordKey(c: GridCoord): string {
  return `${c.x},${c.y}`;
}

export class BoardRenderer {
  readonly group = new THREE.Group();

  private gridSize = 8;
  private tileMeshes: THREE.Mesh[] = [];
  private obstacleMeshes: THREE.Mesh[] = [];
  private readonly highlightGroup = new THREE.Group();
  private readonly pathGroup = new THREE.Group();

  private readonly floorTexture: THREE.Texture;
  private readonly wallTexture: THREE.Texture;

  private readonly tileGeo = new THREE.BoxGeometry(0.95, TILE_HEIGHT, 0.95);
  private readonly tileMatLight: THREE.MeshStandardMaterial;
  private readonly tileMatDark: THREE.MeshStandardMaterial;
  private readonly wallMat: THREE.MeshStandardMaterial;

  private readonly highlightGeo = new THREE.PlaneGeometry(0.9, 0.9);
  private readonly reachableMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.movement.color,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.movement.opacity,
    depthWrite: false,
  });
  private readonly attackRangeMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.attackRange.color,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.attackRange.opacity,
    depthWrite: false,
  });
  private readonly healRangeMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.healRange.color,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.healRange.opacity,
    depthWrite: false,
  });
  private readonly attackableMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.validTarget.color,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.validTarget.opacity,
    depthWrite: false,
  });
  private readonly skillTargetMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  private readonly skillAreaMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  private readonly hoverMoveMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  private readonly hoverAttackMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  private readonly hoverSkillMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  private readonly healTargetMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
  });
  private readonly hoverHealMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  private readonly pathMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    depthWrite: false,
  });

  constructor(scene: THREE.Scene) {
    const loader = new THREE.TextureLoader();

    this.floorTexture = loader.load('/assets/textures/stone-floor.png');
    this.floorTexture.colorSpace = THREE.SRGBColorSpace;
    this.floorTexture.wrapS = THREE.RepeatWrapping;
    this.floorTexture.wrapT = THREE.RepeatWrapping;

    this.wallTexture = loader.load('/assets/textures/stone-wall.png');
    this.wallTexture.colorSpace = THREE.SRGBColorSpace;
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;

    this.tileMatLight = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      color: 0xcbd5e1,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.tileMatDark = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      color: 0x94a3b8,
      roughness: 0.88,
      metalness: 0.05,
    });
    this.wallMat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      color: 0xb8c2d0,
      roughness: 0.85,
      metalness: 0.06,
    });

    this.group.add(this.highlightGroup);
    this.group.add(this.pathGroup);
    scene.add(this.group);
  }

  gridToWorld(coord: GridCoord, y = 0): THREE.Vector3 {
    const half = (this.gridSize - 1) / 2;
    return new THREE.Vector3(
      (coord.x - half) * CELL_SIZE,
      y,
      (half - coord.y) * CELL_SIZE
    );
  }

  buildBoard(gridSize: number, obstacleDefs: ObstacleDef[]): void {
    this.gridSize = gridSize;

    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      if (child !== this.highlightGroup && child !== this.pathGroup) {
        this.group.remove(child);
      }
    }
    this.tileMeshes = [];
    this.obstacleMeshes = [];

    // Stone base plinth
    const baseWidth = gridSize * CELL_SIZE + 0.6;
    const baseHeight = 0.5;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseWidth);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.08,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -TILE_HEIGHT / 2 - baseHeight / 2, 0);
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // 8x8 stone floor tiles
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isLight = (x + y) % 2 === 0;
        const tile = new THREE.Mesh(
          this.tileGeo,
          isLight ? this.tileMatLight : this.tileMatDark
        );
        tile.position.copy(this.gridToWorld({ x, y }, -TILE_HEIGHT / 2));
        tile.receiveShadow = true;
        tile.userData = { gridCoord: { x, y } satisfies GridCoord };
        this.group.add(tile);
        this.tileMeshes.push(tile);
      }
    }

    // Medieval ruins perimeter around the 8x8 arena
    this.buildRuinsPerimeter(gridSize);

    // Internal obstacles by kind
    for (const obs of obstacleDefs) {
      this.buildObstacle(obs);
    }
  }

  private buildRuinsPerimeter(gridSize: number): void {
    const half = gridSize / 2;
    const outerRadius = half + 0.95;
    const corner = half + 0.65;
    const mossEdge = half + 0.55;

    // Outer courtyard stone rim
    const rimGeo = new THREE.BoxGeometry(gridSize + 2.7, 0.28, gridSize + 2.7);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.95,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, -TILE_HEIGHT - 0.34, 0);
    rim.receiveShadow = true;
    this.group.add(rim);

    // Back-left & back-right ruined walls (kept behind board so camera view is unobstructed)
    const backWallSegments: { x: number; y: number; z: number; w: number; h: number; d: number }[] = [
      { x: -half * 0.55, y: 0.9, z: -outerRadius, w: gridSize * 0.4, h: 1.8, d: 0.5 },
      { x: half * 0.45, y: 0.65, z: -outerRadius, w: gridSize * 0.35, h: 1.3, d: 0.5 },
      { x: -outerRadius, y: 0.85, z: -half * 0.5, w: 0.5, h: 1.7, d: gridSize * 0.42 },
      { x: -outerRadius, y: 0.5, z: half * 0.52, w: 0.5, h: 1.0, d: gridSize * 0.3 },
      // Low broken front/right ruins for framing without blocking tiles
      { x: outerRadius, y: 0.35, z: -half * 0.6, w: 0.45, h: 0.7, d: gridSize * 0.28 },
      { x: half * 0.65, y: 0.3, z: outerRadius, w: gridSize * 0.25, h: 0.6, d: 0.45 },
    ];

    for (const seg of backWallSegments) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(seg.w, seg.h, seg.d), this.wallMat);
      mesh.position.set(seg.x, seg.y - 0.2, seg.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }

    // 4 Corner torches with stone braziers and emissive flames
    const torchCoords: [number, number][] = [
      [-corner, -corner],
      [corner, -corner],
      [-corner, corner],
      [corner, corner],
    ];
    const brazierMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });

    for (const [tx, tz] of torchCoords) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.35, 0.42), this.wallMat);
      post.position.set(tx, 0.45, tz);
      post.castShadow = true;
      post.receiveShadow = true;

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.25, 6), brazierMat);
      bowl.position.set(tx, 1.25, tz);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 6), flameMat);
      flame.position.set(tx, 1.54, tz);

      this.group.add(post, bowl, flame);
    }

    // Discrete mossy/foliage tufts along ruins
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3c, roughness: 0.9 });
    const mossSpots: [number, number][] = [
      [-mossEdge, -half * 0.75],
      [-mossEdge, half * 0.2],
      [-half * 0.25, -mossEdge - 0.1],
      [half * 0.8, -mossEdge - 0.1],
      [mossEdge + 0.1, -half * 0.3],
    ];
    for (const [mx, mz] of mossSpots) {
      const tuft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), mossMat);
      tuft.scale.set(1.3, 0.65, 1.2);
      tuft.position.set(mx, 0.05, mz);
      this.group.add(tuft);
    }
  }

  private buildObstacle(obs: ObstacleDef): void {
    const group = new THREE.Group();
    group.position.copy(this.gridToWorld(obs.pos, 0));

    if (obs.kind === 'pillar') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.18, 0.84), this.wallMat);
      base.position.y = 0.09;
      base.castShadow = true;
      base.receiveShadow = true;

      const col = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.72, 0.64), this.wallMat);
      col.position.y = 0.54;
      col.castShadow = true;
      col.receiveShadow = true;

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.76), this.wallMat);
      cap.position.y = 0.97;
      cap.castShadow = true;
      cap.receiveShadow = true;

      group.add(base, col, cap);
      this.obstacleMeshes.push(base, col, cap);
    } else if (obs.kind === 'wall') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.64, 0.84), this.wallMat);
      body.position.y = 0.32;
      body.castShadow = true;
      body.receiveShadow = true;

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.88), this.wallMat);
      cap.position.y = 0.7;
      cap.castShadow = true;
      cap.receiveShadow = true;

      group.add(body, cap);
      this.obstacleMeshes.push(body, cap);
    } else if (obs.kind === 'crate') {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1b, roughness: 0.9 });

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.64, 0.72), woodMat);
      box.position.y = 0.32;
      box.castShadow = true;
      box.receiveShadow = true;

      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.76), trimMat);
      frame.position.y = 0.62;
      frame.castShadow = true;

      group.add(box, frame);
      this.obstacleMeshes.push(box, frame);
    } else {
      // barrel
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4d25, roughness: 0.82 });
      const ironMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5,
        metalness: 0.5,
      });

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.68, 10), woodMat);
      body.position.y = 0.34;
      body.castShadow = true;
      body.receiveShadow = true;

      const bandTop = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.08, 10), ironMat);
      bandTop.position.y = 0.54;
      const bandBot = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.08, 10), ironMat);
      bandBot.position.y = 0.16;

      group.add(body, bandTop, bandBot);
      this.obstacleMeshes.push(body, bandTop, bandBot);
    }

    this.group.add(group);
  }

  getTileMeshes(): THREE.Object3D[] {
    return this.tileMeshes;
  }

  getObstacleMeshes(): THREE.Object3D[] {
    return this.obstacleMeshes;
  }

  setHighlights(highlights: BoardHighlights): void {
    this.clearGroup(this.highlightGroup, false);
    this.clearGroup(this.pathGroup, true);

    const hoverKey = highlights.hoverCell ? coordKey(highlights.hoverCell) : null;
    const areaSet = new Set(highlights.skillArea.map(coordKey));

    for (const cell of highlights.reachable) {
      const isHovered = hoverKey === coordKey(cell);
      this.addTileHighlight(
        cell,
        isHovered ? this.hoverMoveMat : this.reachableMat,
        isHovered ? 0.02 : 0.012
      );
    }

    const isHeal = highlights.skillMode === 'ally';
    const validAttackKeys = new Set(highlights.attackable.map(coordKey));
    const validSkillKeys = new Set(highlights.skillTargets.map(coordKey));

    for (const cell of highlights.attackRangeCells ?? []) {
      if (validAttackKeys.has(coordKey(cell))) continue;
      this.addTileHighlight(cell, this.attackRangeMat, 0.01);
    }

    for (const cell of highlights.skillRangeCells ?? []) {
      const key = coordKey(cell);
      if (validSkillKeys.has(key) || areaSet.has(key)) continue;
      this.addTileHighlight(cell, isHeal ? this.healRangeMat : this.attackRangeMat, 0.01);
    }

    for (const cell of highlights.attackable) {
      const isHovered = hoverKey === coordKey(cell);
      this.addTileHighlight(
        cell,
        isHovered ? this.hoverAttackMat : this.attackableMat,
        isHovered ? 0.022 : 0.014
      );
    }

    for (const cell of highlights.skillTargets) {
      const key = coordKey(cell);
      const isHovered = hoverKey === key;
      if (areaSet.has(key) && !isHovered) continue;
      const mat = isHeal
        ? isHovered
          ? this.hoverHealMat
          : this.healTargetMat
        : isHovered
          ? this.hoverSkillMat
          : this.skillTargetMat;
      this.addTileHighlight(cell, mat, isHovered ? 0.024 : 0.016);
    }

    for (const cell of highlights.skillArea) {
      const isHovered = hoverKey === coordKey(cell);
      if (!isHovered) {
        this.addTileHighlight(cell, this.skillAreaMat, 0.021);
      }
    }

    if (highlights.path && highlights.path.length >= 2) {
      this.renderPathPreview(highlights.path);
    }
  }

  private addTileHighlight(cell: GridCoord, material: THREE.Material, yOffset: number): void {
    const plane = new THREE.Mesh(this.highlightGeo, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.copy(this.gridToWorld(cell, yOffset));
    plane.raycast = () => {};
    this.highlightGroup.add(plane);
  }

  private renderPathPreview(path: GridCoord[]): void {
    const y = 0.036;
    const thickness = 0.14;

    for (let i = 0; i < path.length - 1; i++) {
      const a = this.gridToWorld(path[i], y);
      const b = this.gridToWorld(path[i + 1], y);
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);

      const segGeo = new THREE.BoxGeometry(thickness, 0.02, len + thickness * 0.6);
      const seg = new THREE.Mesh(segGeo, this.pathMat);
      seg.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      seg.rotation.y = Math.atan2(dx, dz);
      this.pathGroup.add(seg);
    }

    const prev = this.gridToWorld(path[path.length - 2], y);
    const end = this.gridToWorld(path[path.length - 1], y);
    const dirX = end.x - prev.x;
    const dirZ = end.z - prev.z;

    const coneGeo = new THREE.ConeGeometry(0.18, 0.3, 4);
    coneGeo.rotateX(Math.PI / 2);
    const arrow = new THREE.Mesh(coneGeo, this.pathMat);
    arrow.position.copy(end);
    arrow.rotation.y = Math.atan2(dirX, dirZ);
    this.pathGroup.add(arrow);
  }

  private clearGroup(group: THREE.Group, disposeGeometry: boolean): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (disposeGeometry && child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }
  }
}
