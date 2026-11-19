import * as THREE from 'three';
import type { GridCoord, MapConfig, ObstacleDef } from '../shared/types';
import { computeOccludedIds, type OcclusionItem } from './scenarioOcclusion';
import type { SceneAtmosphereConfig } from './SceneManager';
import { buildFortressScenario } from './scenarios/FortressScenario';
import { buildDorterScenario } from './scenarios/DorterScenario';
import type {
  ObstacleRayUserData,
  ScenarioBuildOptions,
  ScenarioBuildResult,
  TileRayUserData,
} from './scenarios/ScenarioTypes';
import { buildSwampScenario } from './scenarios/SwampScenario';

export interface BoardHighlights {
  reachable: GridCoord[];
  attackRangeCells?: GridCoord[];
  attackable: GridCoord[];
  skillRangeCells?: GridCoord[];
  skillTargets: GridCoord[];
  skillArea: GridCoord[];
  skillMode?: 'enemy' | 'ally';
  dangerCells?: GridCoord[];
  hoverCell: GridCoord | null;
  path: GridCoord[] | null;
}

export interface BuildBoardOptions {
  mapId?: string;
  theme?: MapConfig['theme'];
  bridgeCells?: GridCoord[];
}

const GRID_HIGHLIGHTS = {
  movement: { color: 0x3b82f6, opacity: 0.20, borderColor: 0x60a5fa, borderOpacity: 0.78 },
  attackRange: { color: 0xef4444, opacity: 0.12 },
  healRange: { color: 0x34d399, opacity: 0.14 },
  validTarget: { color: 0xef4444, opacity: 0.26, borderColor: 0xf87171, borderOpacity: 0.85 },
} as const;

const CELL_SIZE = 1;
const TILE_HEIGHT = 0.16;
const TILE_Y_OFFSETS = [-0.014, -0.008, 0, 0.008, 0.014] as const;

function createSquareBorderGeometry(outerHalf: number, innerHalf: number): THREE.ShapeGeometry {
  const outer = new THREE.Shape();
  outer.moveTo(-outerHalf, -outerHalf);
  outer.lineTo(outerHalf, -outerHalf);
  outer.lineTo(outerHalf, outerHalf);
  outer.lineTo(-outerHalf, outerHalf);
  outer.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-innerHalf, -innerHalf);
  hole.lineTo(innerHalf, -innerHalf);
  hole.lineTo(innerHalf, innerHalf);
  hole.lineTo(-innerHalf, innerHalf);
  hole.closePath();
  outer.holes.push(hole);

  return new THREE.ShapeGeometry(outer);
}

function createCornerReticleGeometry(outerHalf: number, armLen: number, thickness: number): THREE.ShapeGeometry {
  const inner = outerHalf - thickness;
  const shapes: THREE.Shape[] = [];
  const signs: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];

  for (const [sx, sy] of signs) {
    const s = new THREE.Shape();
    const ox = sx * outerHalf;
    const oy = sy * outerHalf;
    const ix = sx * inner;
    const iy = sy * inner;
    const ax = sx * (outerHalf - armLen);
    const ay = sy * (outerHalf - armLen);

    s.moveTo(ax, oy);
    s.lineTo(ox, oy);
    s.lineTo(ox, ay);
    s.lineTo(ix, ay);
    s.lineTo(ix, iy);
    s.lineTo(ax, iy);
    s.closePath();
    shapes.push(s);
  }

  return new THREE.ShapeGeometry(shapes);
}

function coordKey(c: GridCoord): string {
  return `${c.x},${c.y}`;
}

export class BoardRenderer {
  readonly group = new THREE.Group();

  private gridSize = 8;
  private tileMeshes: THREE.Mesh[] = [];
  private obstacleMeshes: THREE.Mesh[] = [];
  private activeScenario: ScenarioBuildResult | null = null;
  private occlusionItems: OcclusionItem[] = [];
  private elapsed = 0;
  private readonly highlightGroup = new THREE.Group();
  private readonly pathGroup = new THREE.Group();

  private readonly floorTexture: THREE.Texture;
  private readonly wallTexture: THREE.Texture;

  private readonly tileGeo = new THREE.BoxGeometry(0.95, TILE_HEIGHT, 0.95);
  private readonly tileMatLight: THREE.MeshStandardMaterial;
  private readonly tileMatMid: THREE.MeshStandardMaterial;
  private readonly tileMatDark: THREE.MeshStandardMaterial;
  private readonly wallMat: THREE.MeshStandardMaterial;

  private readonly highlightGeo = new THREE.PlaneGeometry(0.9, 0.9);
  private readonly highlightBorderGeo = createSquareBorderGeometry(0.45, 0.405);
  private readonly hoverReticleGeo = createCornerReticleGeometry(0.47, 0.2, 0.052);
  private readonly reachableMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.movement.color,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.movement.opacity,
    depthWrite: false,
  });
  private readonly reachableBorderMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.movement.borderColor,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.movement.borderOpacity,
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
  private readonly attackableBorderMat = new THREE.MeshBasicMaterial({
    color: GRID_HIGHLIGHTS.validTarget.borderColor,
    transparent: true,
    opacity: GRID_HIGHLIGHTS.validTarget.borderOpacity,
    depthWrite: false,
  });
  private readonly skillTargetMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  private readonly skillTargetBorderMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });
  private readonly skillAreaMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  private readonly skillAreaBorderMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  private readonly hoverMoveMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  private readonly hoverAttackMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  private readonly hoverSkillMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
  });
  private readonly healTargetMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  private readonly healTargetBorderMat = new THREE.MeshBasicMaterial({
    color: 0x6ee7b7,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });
  private readonly hoverHealMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  private readonly hoverReticleGoldMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
  });
  private readonly hoverReticleEmeraldMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
  });
  private readonly dangerMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  private readonly dangerAmberMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  private readonly dangerRingGeo = new THREE.RingGeometry(0.32, 0.44, 4);
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
    this.tileMatMid = new THREE.MeshStandardMaterial({
      map: this.floorTexture,
      color: 0xb0bccb,
      roughness: 0.86,
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

  buildBoard(
    gridSize: number,
    obstacleDefs: ObstacleDef[],
    mapIdOrOptions: string | BuildBoardOptions = 'ruins'
  ): void {
    const options: BuildBoardOptions =
      typeof mapIdOrOptions === 'string' ? { mapId: mapIdOrOptions } : mapIdOrOptions;
    const theme = options.theme;
    const mapId = options.mapId ?? theme ?? 'ruins';
    const bridgeCells = options.bridgeCells ?? [];

    this.gridSize = gridSize;
    this.elapsed = 0;
    this.clearActiveScenario();
    this.disposeBoardChildren();
    this.tileMeshes = [];
    this.obstacleMeshes = [];

    if (mapId === 'forgotten-swamp' || mapId === 'fortress' || mapId === 'dorter-ruins') {
      const scenarioOptions: ScenarioBuildOptions = {
        mapId,
        gridSize,
        obstacleDefs,
        theme,
        bridgeCells,
      };
      const scenario = mapId === 'dorter-ruins'
        ? buildDorterScenario(scenarioOptions)
        : mapId === 'forgotten-swamp'
          ? buildSwampScenario(scenarioOptions)
          : buildFortressScenario(scenarioOptions);

      this.activeScenario = scenario;
      this.group.add(scenario.group);
      this.tileMeshes.push(...scenario.tileMeshes);
      this.obstacleMeshes.push(...scenario.obstacleMeshes);
      this.occlusionItems = scenario.occluders.map((occ) => ({
        id: occ.id,
        centerX: (occ.bounds.minX + occ.bounds.maxX) / 2,
        centerZ: (occ.bounds.minZ + occ.bounds.maxZ) / 2,
        halfWidth: (occ.bounds.maxX - occ.bounds.minX) / 2,
        halfDepth: (occ.bounds.maxZ - occ.bounds.minZ) / 2,
        height: occ.bounds.maxY,
        category: occ.bounds.maxY >= 2.2 ? 'tall' : 'mid',
      }));
      return;
    }

    const isFortress = mapId === 'fortress' || theme === 'fortress';
    const isSanctuary = mapId === 'sanctuary' || theme === 'sanctuary';
    const isSwamp = mapId === 'swamp' || theme === 'swamp';

    // Layered FFT-style diorama plinth/base (y < 0, outside playable cells)
    // 1. Weathered stone lip overhanging the darker stratified bedrock/earth skirt
    const lipWidth = gridSize * CELL_SIZE + 0.88;
    const lipHeight = 0.16;
    const lipColor = isSanctuary
      ? 0x2d1f24
      : isFortress
        ? 0x475569
        : isSwamp
          ? 0x2e4034
          : 0x4b5563;
    const lipMat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      color: lipColor,
      roughness: 0.88,
      metalness: isSanctuary ? 0.14 : 0.06,
    });
    const lipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(lipWidth, lipHeight, lipWidth),
      lipMat
    );
    lipMesh.position.set(0, -TILE_HEIGHT / 2 - lipHeight / 2, 0);
    lipMesh.receiveShadow = true;
    lipMesh.castShadow = true;
    lipMesh.raycast = () => {};
    this.group.add(lipMesh);

    // 2. Recessed upper earth/masonry skirt under the overhanging lip
    const upperWidth = gridSize * CELL_SIZE + 0.62;
    const upperHeight = 0.34;
    const upperColor = isSanctuary
      ? 0x1c1418
      : isFortress
        ? 0x293548
        : isSwamp
          ? 0x1f2d24
          : 0x334155;
    const upperMat = new THREE.MeshStandardMaterial({
      color: upperColor,
      roughness: 0.92,
      metalness: isSanctuary ? 0.16 : 0.08,
    });
    const upperMesh = new THREE.Mesh(
      new THREE.BoxGeometry(upperWidth, upperHeight, upperWidth),
      upperMat
    );
    upperMesh.position.set(0, -TILE_HEIGHT / 2 - lipHeight - upperHeight / 2, 0);
    upperMesh.receiveShadow = true;
    upperMesh.raycast = () => {};
    this.group.add(upperMesh);

    // 3. Mid stratified bedrock stratum
    const midWidth = gridSize * CELL_SIZE + 1.32;
    const midHeight = 0.44;
    const midColor = isSanctuary
      ? 0x140d10
      : isFortress
        ? 0x1e293b
        : isSwamp
          ? 0x16221b
          : 0x253042;
    const midMat = new THREE.MeshStandardMaterial({
      color: midColor,
      roughness: 0.94,
    });
    const midMesh = new THREE.Mesh(
      new THREE.BoxGeometry(midWidth, midHeight, midWidth),
      midMat
    );
    midMesh.position.set(0, -TILE_HEIGHT / 2 - lipHeight - upperHeight - midHeight / 2, 0);
    midMesh.receiveShadow = true;
    midMesh.raycast = () => {};
    this.group.add(midMesh);

    // 4. Deep bedrock base
    const lowerWidth = gridSize * CELL_SIZE + 2.08;
    const lowerHeight = 0.62;
    const lowerMat = new THREE.MeshStandardMaterial({
      color: isSanctuary ? 0x0c0709 : 0x131b29,
      roughness: 0.96,
    });
    const lowerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(lowerWidth, lowerHeight, lowerWidth),
      lowerMat
    );
    lowerMesh.position.set(
      0,
      -TILE_HEIGHT / 2 - lipHeight - upperHeight - midHeight - lowerHeight / 2,
      0
    );
    lowerMesh.receiveShadow = true;
    lowerMesh.raycast = () => {};
    this.group.add(lowerMesh);

    // 5. Four corner stone buttresses / pilasters anchoring the plinth
    const totalPlinthDepth = lipHeight + upperHeight + midHeight + lowerHeight;
    const buttressOffset = upperWidth / 2 + 0.14;
    const buttressCorners: [number, number][] = [
      [-buttressOffset, -buttressOffset],
      [buttressOffset, -buttressOffset],
      [-buttressOffset, buttressOffset],
      [buttressOffset, buttressOffset],
    ];
    for (const [bx, bz] of buttressCorners) {
      const shaft = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, totalPlinthDepth * 0.88, 0.46),
        lipMat
      );
      shaft.position.set(bx, -TILE_HEIGHT / 2 - (totalPlinthDepth * 0.88) / 2 - 0.02, bz);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      shaft.raycast = () => {};

      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.16, 0.56),
        lipMat
      );
      cap.position.set(bx, -TILE_HEIGHT / 2 - 0.06, bz);
      cap.castShadow = true;
      cap.receiveShadow = true;
      cap.raycast = () => {};

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.64, 0.24, 0.64),
        midMat
      );
      foot.position.set(bx, -TILE_HEIGHT / 2 - totalPlinthDepth + 0.12, bz);
      foot.receiveShadow = true;
      foot.raycast = () => {};

      this.group.add(shaft, cap, foot);
    }

    // Subtle moss/ember accents along the stepped diorama ledge
    const dioramaEdgeMat = new THREE.MeshStandardMaterial({
      color: isSanctuary ? 0x450a0a : 0x2d5a3c,
      emissive: isSanctuary ? 0x7f1d1d : 0x000000,
      emissiveIntensity: isSanctuary ? 0.35 : 0,
      roughness: 0.92,
    });
    const stepOffset = midWidth / 2 - 0.14;
    const stepY = -TILE_HEIGHT / 2 - lipHeight - upperHeight + 0.02;
    const mossEdgeCoords: [number, number, number, number][] = [
      [-stepOffset * 0.65, stepOffset, 1.4, 0.28],
      [stepOffset * 0.45, stepOffset, 1.1, 0.28],
      [-stepOffset * 0.5, -stepOffset, 1.3, 0.28],
      [stepOffset, -stepOffset * 0.55, 0.28, 1.4],
      [-stepOffset, stepOffset * 0.4, 0.28, 1.2],
    ];
    for (const [mx, mz, mw, md] of mossEdgeCoords) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(mw, 0.07, md),
        dioramaEdgeMat
      );
      strip.position.set(mx, stepY, mz);
      strip.receiveShadow = true;
      strip.raycast = () => {};
      this.group.add(strip);
    }

    // Thin dark mortar/grout recess plane beneath the stone tiles
    const groutMat = new THREE.MeshStandardMaterial({
      color: isSanctuary ? 0x0e080b : 0x0f172a,
      roughness: 0.98,
      metalness: 0.0,
    });
    const groutPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize * CELL_SIZE, gridSize * CELL_SIZE),
      groutMat
    );
    groutPlane.rotation.x = -Math.PI / 2;
    groutPlane.position.set(0, -0.095, 0);
    groutPlane.receiveShadow = true;
    groutPlane.raycast = () => {};
    this.group.add(groutPlane);

    const waterKeys = new Set(
      obstacleDefs.filter((o) => o.kind === 'water').map((o) => coordKey(o.pos))
    );

    // Stone floor tiles with subtle deterministic height and 3-shade stone variation
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isEven = (x + y) % 2 === 0;
        const hash = (x * 7 + y * 13) % 5;
        const isWater = waterKeys.has(coordKey({ x, y }));
        const tileMat = isEven
          ? hash === 0
            ? this.tileMatMid
            : this.tileMatLight
          : hash === 4
            ? this.tileMatMid
            : this.tileMatDark;
        const tile = new THREE.Mesh(this.tileGeo, tileMat);
        const yJitter = isWater ? 0 : TILE_Y_OFFSETS[hash];
        const yPos = isWater ? -TILE_HEIGHT / 2 - 0.08 : -TILE_HEIGHT / 2 + yJitter;
        tile.position.copy(this.gridToWorld({ x, y }, yPos));
        tile.receiveShadow = true;
        tile.userData = {
          kind: 'tile',
          gridCoord: { x, y },
        } satisfies TileRayUserData;
        this.group.add(tile);
        this.tileMeshes.push(tile);
      }
    }

    // Decorative perimeter matching the map / theme
    this.buildPerimeterScenery(gridSize, mapId, theme);

    // Internal obstacles by kind
    for (const obs of obstacleDefs) {
      this.buildObstacle(obs);
    }

    // Visual bridges over water/swamp
    for (const cell of bridgeCells) {
      this.buildBridgeCell(cell);
    }
  }

  private buildPerimeterScenery(
    gridSize: number,
    mapId: string,
    theme?: MapConfig['theme']
  ): void {
    const half = gridSize / 2;
    const outerRadius = half + 0.95;
    const corner = half + 0.65;
    const mossEdge = half + 0.55;

    const isSanctuary = mapId === 'sanctuary' || theme === 'sanctuary';
    const isFortress = mapId === 'fortress' || theme === 'fortress';
    const isSwamp = mapId === 'swamp' || theme === 'swamp';
    const isCatacombs = mapId === 'catacombs' || theme === 'catacombs';

    // Outer courtyard stone rim
    const rimGeo = new THREE.BoxGeometry(gridSize + 2.7, 0.28, gridSize + 2.7);
    const rimMat = new THREE.MeshStandardMaterial({
      color: isSanctuary ? 0x181115 : isSwamp ? 0x18261e : 0x1e293b,
      roughness: 0.95,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, -TILE_HEIGHT - 0.34, 0);
    rim.receiveShadow = true;
    this.group.add(rim);

    // 4 Corner torches / iron braziers
    const torchCoords: [number, number][] = [
      [-corner, -corner],
      [corner, -corner],
      [-corner, corner],
      [corner, corner],
    ];
    const brazierMat = new THREE.MeshStandardMaterial({
      color: isSanctuary ? 0x1c1917 : isFortress ? 0x27272a : 0x475569,
      roughness: 0.6,
      metalness: isFortress || isSanctuary ? 0.5 : 0.1,
    });
    const flameColor = isSanctuary ? 0xef4444 : isCatacombs ? 0x10b981 : 0xfb923c;
    const flameMat = new THREE.MeshBasicMaterial({ color: flameColor });

    for (const [tx, tz] of torchCoords) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, isFortress || isSanctuary ? 1.15 : 1.35, 0.42),
        isFortress || isSanctuary ? brazierMat : this.wallMat
      );
      post.position.set(tx, 0.45, tz);
      post.castShadow = true;
      post.receiveShadow = true;

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.25, 6), brazierMat);
      bowl.position.set(tx, isFortress || isSanctuary ? 1.12 : 1.25, tz);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 6), flameMat);
      flame.position.set(tx, isFortress || isSanctuary ? 1.42 : 1.54, tz);

      this.group.add(post, bowl, flame);
    }

    if (isSanctuary) {
      // Corrupted Sanctuary: dark obelisks, glowing embers, and crimson banners
      const obsidianMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.75,
        metalness: 0.25,
      });
      const emberMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xdc2626,
        emissiveIntensity: 0.85,
        roughness: 0.35,
      });
      const obeliskPositions: [number, number, number][] = [
        [-half * 0.5, -outerRadius, 2.0],
        [half * 0.5, -outerRadius, 2.0],
        [-outerRadius, -half * 0.45, 1.7],
        [outerRadius, -half * 0.45, 1.7],
      ];
      for (const [ox, oz, oh] of obeliskPositions) {
        const obelisk = new THREE.Mesh(new THREE.BoxGeometry(0.54, oh, 0.54), obsidianMat);
        obelisk.position.set(ox, oh / 2 - 0.15, oz);
        obelisk.castShadow = true;
        obelisk.receiveShadow = true;

        const runeCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), emberMat);
        runeCore.position.set(ox, oh + 0.08, oz);
        this.group.add(obelisk, runeCore);
      }

      // Embers scattered along the sanctuary border
      const emberSpots: [number, number][] = [
        [-mossEdge, -half * 0.2],
        [-mossEdge, half * 0.55],
        [-half * 0.25, -mossEdge - 0.15],
        [half * 0.25, -mossEdge - 0.15],
        [mossEdge + 0.12, half * 0.3],
        [-half * 0.45, mossEdge + 0.12],
      ];
      for (const [ex, ez] of emberSpots) {
        const cinder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), emberMat);
        cinder.scale.set(1.25, 0.45, 1.15);
        cinder.position.set(ex, 0.02, ez);
        this.group.add(cinder);
      }
      return;
    }

    if (isSwamp) {
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3c, roughness: 0.92 });
      const reedMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.9 });
      const swampSpots: [number, number][] = [
        [-mossEdge, -half * 0.65],
        [-mossEdge, half * 0.4],
        [-half * 0.3, -mossEdge - 0.1],
        [half * 0.4, -mossEdge - 0.1],
        [mossEdge + 0.1, -half * 0.25],
        [half * 0.5, mossEdge + 0.1],
      ];
      for (const [sx, sz] of swampSpots) {
        const tuft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), mossMat);
        tuft.scale.set(1.4, 0.55, 1.3);
        tuft.position.set(sx, 0.03, sz);
        const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.65, 5), reedMat);
        reed.position.set(sx + 0.08, 0.3, sz - 0.06);
        this.group.add(tuft, reed);
      }
      return;
    }

    if (isFortress) {
      // Ameias/muros fortificados na borda + estandartes escuros
      const wallSegments: { x: number; y: number; z: number; w: number; h: number; d: number }[] = [
        { x: -half * 0.45, y: 0.95, z: -outerRadius, w: gridSize * 0.45, h: 1.9, d: 0.55 },
        { x: half * 0.45, y: 0.95, z: -outerRadius, w: gridSize * 0.45, h: 1.9, d: 0.55 },
        { x: -outerRadius, y: 0.9, z: -half * 0.45, w: 0.55, h: 1.8, d: gridSize * 0.45 },
        { x: -outerRadius, y: 0.9, z: half * 0.45, w: 0.55, h: 1.8, d: gridSize * 0.45 },
        { x: outerRadius, y: 0.35, z: -half * 0.5, w: 0.45, h: 0.7, d: gridSize * 0.35 },
        { x: half * 0.5, y: 0.35, z: outerRadius, w: gridSize * 0.35, h: 0.7, d: 0.45 },
      ];
      for (const seg of wallSegments) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(seg.w, seg.h, seg.d), this.wallMat);
        mesh.position.set(seg.x, seg.y - 0.2, seg.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.group.add(mesh);
      }

      // Ameias no topo das muralhas traseiras
      for (let i = -2; i <= 2; i++) {
        const merlonBack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.58), this.wallMat);
        merlonBack.position.set(i * 2.0, 1.85, -outerRadius);
        merlonBack.castShadow = true;
        this.group.add(merlonBack);
      }

      // Estandartes escuros fora da grade
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.5 });
      const bannerBlue = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.85 });
      const bannerCrimson = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
      const bannerPositions: [number, number, THREE.MeshStandardMaterial][] = [
        [-half * 0.65, outerRadius + 0.15, bannerBlue],
        [half * 0.65, -outerRadius - 0.15, bannerCrimson],
      ];
      for (const [bx, bz, clothMat] of bannerPositions) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 6), poleMat);
        pole.position.set(bx, 0.85, bz);
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.15, 0.05), clothMat);
        cloth.position.set(bx, 1.15, bz);
        cloth.castShadow = true;
        this.group.add(pole, cloth);
      }
      return;
    }

    if (mapId === 'courtyard') {
      // Broken arches + subtle courtyard foliage
      const archPosts: [number, number, number][] = [
        [-half * 0.55, -outerRadius, 1.6],
        [-half * 0.25, -outerRadius, 1.3],
        [-outerRadius, -half * 0.5, 1.5],
        [outerRadius, -half * 0.55, 0.7],
      ];
      for (const [ax, az, h] of archPosts) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.55), this.wallMat);
        post.position.set(ax, h / 2 - 0.15, az);
        post.castShadow = true;
        post.receiveShadow = true;
        this.group.add(post);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(half * 0.35 + 0.6, 0.35, 0.55), this.wallMat);
      lintel.position.set(-half * 0.4, 1.5, -outerRadius);
      lintel.castShadow = true;
      this.group.add(lintel);

      const mossMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3c, roughness: 0.9 });
      const tufts: [number, number][] = [
        [-mossEdge, -half * 0.7],
        [-mossEdge, half * 0.35],
        [-half * 0.2, -mossEdge - 0.12],
        [half * 0.55, -mossEdge - 0.12],
        [mossEdge + 0.12, -half * 0.2],
        [half * 0.4, mossEdge + 0.12],
      ];
      for (const [mx, mz] of tufts) {
        const tuft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), mossMat);
        tuft.scale.set(1.35, 0.7, 1.25);
        tuft.position.set(mx, 0.05, mz);
        this.group.add(tuft);
      }
      return;
    }

    // 'ruins' (default): broken walls, stone border arch, and moss tufts
    const backWallSegments: { x: number; y: number; z: number; w: number; h: number; d: number }[] = [
      { x: -half * 0.55, y: 0.9, z: -outerRadius, w: gridSize * 0.4, h: 1.8, d: 0.5 },
      { x: half * 0.45, y: 0.65, z: -outerRadius, w: gridSize * 0.35, h: 1.3, d: 0.5 },
      { x: -outerRadius, y: 0.85, z: -half * 0.5, w: 0.5, h: 1.7, d: gridSize * 0.42 },
      { x: -outerRadius, y: 0.5, z: half * 0.52, w: 0.5, h: 1.0, d: gridSize * 0.3 },
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

    // Arco de pedra na borda traseira
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.32, 0.52), this.wallMat);
    archLintel.position.set(0, 1.65, -outerRadius);
    archLintel.castShadow = true;
    this.group.add(archLintel);

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
    const solidMeshes: THREE.Mesh[] = [];

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
      solidMeshes.push(base, col, cap);
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
      solidMeshes.push(body, cap);
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
      solidMeshes.push(box, frame);
    } else if (obs.kind === 'water') {
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x1e4d3b,
        emissive: 0x0f2920,
        emissiveIntensity: 0.25,
        roughness: 0.16,
        metalness: 0.1,
        transparent: true,
        opacity: 0.78,
      });
      const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), waterMat);
      waterPlane.rotation.x = -Math.PI / 2;
      waterPlane.position.y = -0.035;
      waterPlane.receiveShadow = true;
      waterPlane.userData = { gridCoord: obs.pos, obstacleKind: 'water' };
      group.add(waterPlane);
      // Excluded from obstacleMeshes: water is recessed and does not block LoS or selection behind it.
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
      solidMeshes.push(body, bandTop, bandBot);
    }

    if (solidMeshes.length > 0) {
      const solidUserData: ObstacleRayUserData = {
        kind: 'obstacle',
        obstacleKind: obs.kind,
        gridCoord: { x: obs.pos.x, y: obs.pos.y },
      };
      for (const mesh of solidMeshes) {
        mesh.userData = solidUserData;
        this.obstacleMeshes.push(mesh);
      }
    }

    this.group.add(group);
  }

  private buildBridgeCell(coord: GridCoord): void {
    const group = new THREE.Group();
    group.position.copy(this.gridToWorld(coord, 0));

    const plankMat = new THREE.MeshStandardMaterial({ color: 0x7c4d25, roughness: 0.86 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1b, roughness: 0.9 });

    for (let i = -1; i <= 1; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.24), plankMat);
      plank.position.set(0, -0.028, i * 0.3);
      plank.receiveShadow = true;
      plank.castShadow = true;
      plank.userData = { gridCoord: coord, isBridge: true };
      group.add(plank);
    }

    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.94), railMat);
    leftRail.position.set(-0.42, 0.017, 0);
    leftRail.castShadow = true;
    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.94), railMat);
    rightRail.position.set(0.42, 0.017, 0);
    rightRail.castShadow = true;
    group.add(leftRail, rightRail);

    this.group.add(group);
  }

  getTileMeshes(): THREE.Object3D[] {
    return this.tileMeshes;
  }

  getObstacleMeshes(): THREE.Object3D[] {
    return this.obstacleMeshes;
  }

  getAtmosphere(): SceneAtmosphereConfig | null {
    const preset = this.activeScenario?.atmosphere;
    if (!preset) return null;

    return {
      backgroundColor: preset.backgroundColor,
      fogColor: preset.fogColor,
      fogDensity: preset.fogDensity,
      ambientColor: preset.ambientColor,
      ambientIntensity: preset.ambientIntensity,
      hemiSkyColor: preset.hemiSkyColor,
      hemiGroundColor: preset.hemiGroundColor,
      hemiIntensity: preset.hemiIntensity,
      dirColor: preset.dirLightColor,
      dirIntensity: preset.dirLightIntensity,
      dirPosition: preset.dirLightPosition,
      rimColor: preset.rimLightColor,
      rimIntensity: preset.rimLightIntensity,
      pointLights: preset.pointLights.map((pl) => ({
        position: pl.position,
        color: pl.color,
        intensity: pl.intensity,
        distance: pl.distance,
        decay: pl.decay,
      })),
    };
  }

  update(dt: number, cameraAzimuthRad: number): void {
    this.elapsed += dt;
    if (!this.activeScenario) return;

    this.activeScenario.update(dt, this.elapsed);

    if (this.occlusionItems.length > 0) {
      const occluded = computeOccludedIds(this.occlusionItems, cameraAzimuthRad);
      for (const occluder of this.activeScenario.occluders) {
        occluder.upperGroup.visible = !occluded.has(occluder.id);
      }
    }
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
        isHovered ? 0.02 : 0.012,
        this.reachableBorderMat
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
        isHovered ? 0.022 : 0.014,
        this.attackableBorderMat
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
      const borderMat = isHeal ? this.healTargetBorderMat : this.skillTargetBorderMat;
      this.addTileHighlight(cell, mat, isHovered ? 0.024 : 0.016, borderMat);
    }

    for (const cell of highlights.skillArea) {
      const isHovered = hoverKey === coordKey(cell);
      if (!isHovered) {
        this.addTileHighlight(cell, this.skillAreaMat, 0.021, this.skillAreaBorderMat);
      }
    }

    for (const cell of highlights.dangerCells ?? []) {
      this.addTileHighlight(cell, this.dangerMat, 0.015, this.attackableBorderMat);
      const warningFrame = new THREE.Mesh(this.dangerRingGeo, this.dangerAmberMat);
      warningFrame.rotation.x = -Math.PI / 2;
      warningFrame.rotation.z = Math.PI / 4;
      warningFrame.position.copy(this.gridToWorld(cell, 0.017));
      warningFrame.raycast = () => {};
      this.highlightGroup.add(warningFrame);
    }

    if (highlights.hoverCell) {
      const isMoveHover = highlights.reachable.some((c) => coordKey(c) === hoverKey);
      const isHealHover = isHeal && validSkillKeys.has(hoverKey ?? '');
      const reticleMat =
        isMoveHover || isHealHover ? this.hoverReticleEmeraldMat : this.hoverReticleGoldMat;
      const reticle = new THREE.Mesh(this.hoverReticleGeo, reticleMat);
      reticle.rotation.x = -Math.PI / 2;
      reticle.position.copy(this.gridToWorld(highlights.hoverCell, 0.028));
      reticle.raycast = () => {};
      this.highlightGroup.add(reticle);
    }

    if (highlights.path && highlights.path.length >= 2) {
      this.renderPathPreview(highlights.path);
    }
  }

  private addTileHighlight(
    cell: GridCoord,
    material: THREE.Material,
    yOffset: number,
    borderMaterial?: THREE.Material
  ): void {
    const plane = new THREE.Mesh(this.highlightGeo, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.copy(this.gridToWorld(cell, yOffset));
    plane.raycast = () => {};
    this.highlightGroup.add(plane);

    if (borderMaterial) {
      const border = new THREE.Mesh(this.highlightBorderGeo, borderMaterial);
      border.rotation.x = -Math.PI / 2;
      border.position.copy(this.gridToWorld(cell, yOffset + 0.001));
      border.raycast = () => {};
      this.highlightGroup.add(border);
    }
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

  private disposeBoardChildren(): void {
    const sharedGeos = new Set<THREE.BufferGeometry>([
      this.tileGeo,
      this.highlightGeo,
      this.highlightBorderGeo,
      this.hoverReticleGeo,
      this.dangerRingGeo,
    ]);
    const sharedMats = new Set<THREE.Material>([
      this.tileMatLight,
      this.tileMatMid,
      this.tileMatDark,
      this.wallMat,
    ]);
    const disposedMats = new Set<THREE.Material>();

    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      if (child === this.highlightGroup || child === this.pathGroup) continue;
      this.group.remove(child);
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry && !sharedGeos.has(obj.geometry)) {
            obj.geometry.dispose();
          }
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            if (m && !sharedMats.has(m) && !disposedMats.has(m)) {
              disposedMats.add(m);
              m.dispose();
            }
          }
        }
      });
    }
  }

  private clearActiveScenario(): void {
    if (this.activeScenario) {
      this.group.remove(this.activeScenario.group);
      this.activeScenario.dispose();
      this.activeScenario = null;
    }
    this.occlusionItems = [];
  }

  dispose(): void {
    this.clearActiveScenario();
    this.tileMeshes = [];
    this.obstacleMeshes = [];
    this.disposeBoardChildren();
    this.clearGroup(this.highlightGroup, false);
    this.clearGroup(this.pathGroup, true);
    this.tileGeo.dispose();
    this.highlightGeo.dispose();
    this.highlightBorderGeo.dispose();
    this.hoverReticleGeo.dispose();
    this.dangerRingGeo.dispose();
    this.tileMatLight.dispose();
    this.tileMatMid.dispose();
    this.tileMatDark.dispose();
    this.wallMat.dispose();
    this.floorTexture.dispose();
    this.wallTexture.dispose();
    this.reachableMat.dispose();
    this.reachableBorderMat.dispose();
    this.attackRangeMat.dispose();
    this.healRangeMat.dispose();
    this.attackableMat.dispose();
    this.attackableBorderMat.dispose();
    this.skillTargetMat.dispose();
    this.skillTargetBorderMat.dispose();
    this.skillAreaMat.dispose();
    this.skillAreaBorderMat.dispose();
    this.hoverMoveMat.dispose();
    this.hoverAttackMat.dispose();
    this.hoverSkillMat.dispose();
    this.healTargetMat.dispose();
    this.healTargetBorderMat.dispose();
    this.hoverHealMat.dispose();
    this.hoverReticleGoldMat.dispose();
    this.hoverReticleEmeraldMat.dispose();
    this.dangerMat.dispose();
    this.dangerAmberMat.dispose();
    this.pathMat.dispose();
  }
}
