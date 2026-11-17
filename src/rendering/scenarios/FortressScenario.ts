import * as THREE from 'three';
import type { GridCoord, ObstacleDef } from '../../shared/types';
import {
  buildBannerStand,
  buildBrazier,
  buildCliffEdge,
  buildDistantSilhouettes,
  buildGatehouse,
  buildRuinedArch,
  buildStaircase,
  buildTent,
  buildTree,
  buildWallSegment,
  buildWatchtower,
  buildWaterfall,
  createMossTexture,
  createSeededRng,
  createTerracottaRoofTexture,
  createWaterTexture,
  createWeatheredStoneTexture,
  createWoodPlankTexture,
  ScenarioResourceTracker,
} from './ScenarioKit';
import type {
  AnimatedScenarioObject,
  ModularStructureResult,
  OccludingStructure,
  ScenarioAtmospherePreset,
  ScenarioBuildOptions,
  ScenarioBuildResult,
  TileRayUserData,
} from './ScenarioTypes';

const CELL_SIZE = 1;
const TILE_HEIGHT = 0.16;

function gridToWorld(coord: GridCoord, gridSize: number, y = 0): THREE.Vector3 {
  const half = (gridSize - 1) / 2;
  return new THREE.Vector3(
    (coord.x - half) * CELL_SIZE,
    y,
    (half - coord.y) * CELL_SIZE
  );
}

interface FortressPalette {
  floorMats: THREE.MeshStandardMaterial[];
  stoneLightMat: THREE.MeshStandardMaterial;
  stoneDarkMat: THREE.MeshStandardMaterial;
  mossMat: THREE.MeshStandardMaterial;
  woodMat: THREE.MeshStandardMaterial;
  woodDarkMat: THREE.MeshStandardMaterial;
  ironMat: THREE.MeshStandardMaterial;
  terracottaMat: THREE.MeshStandardMaterial;
  crimsonMat: THREE.MeshStandardMaterial;
  cliffMat: THREE.MeshStandardMaterial;
  flowerRedMat: THREE.MeshStandardMaterial;
  flowerWhiteMat: THREE.MeshStandardMaterial;
}

function createFortressPalette(tracker: ScenarioResourceTracker): FortressPalette {
  const floorTexA = createWeatheredStoneTexture(tracker, {
    seed: 101,
    variant: 'floor',
    baseColor: '#8b887e',
    secondaryColor: '#767268',
    mortarColor: '#4a473f',
    mossColor: '#4e6936',
    mossAmount: 0.22,
  });
  const floorTexB = createWeatheredStoneTexture(tracker, {
    seed: 207,
    variant: 'floor',
    baseColor: '#837f75',
    secondaryColor: '#6d695f',
    mortarColor: '#44413a',
    mossColor: '#3f5a2c',
    mossAmount: 0.34,
  });
  const masonryTex = createWeatheredStoneTexture(tracker, {
    seed: 313,
    variant: 'masonry',
    baseColor: '#878379',
    secondaryColor: '#6f6b62',
    mortarColor: '#47453e',
    mossColor: '#4a6633',
    mossAmount: 0.26,
  });
  const mossTex = createMossTexture(tracker, {
    seed: 419,
    baseColor: '#4e6936',
    highlightColor: '#6b8c47',
    earthColor: '#38522b',
  });
  const woodTex = createWoodPlankTexture(tracker, {
    seed: 521,
    baseColor: '#6e4728',
    grainColor: '#4a2e18',
    planks: 5,
  });
  const roofTex = createTerracottaRoofTexture(tracker, {
    seed: 631,
    baseColor: '#9a3e2e',
    darkColor: '#7c2d22',
  });

  const makeMat = (params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial =>
    tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        roughness: 0.88,
        metalness: 0.05,
        ...params,
      })
    );

  return {
    floorMats: [
      makeMat({ map: floorTexA, color: 0xf4efe6, roughness: 0.88 }),
      makeMat({ map: floorTexB, color: 0xe6dfd3, roughness: 0.91 }),
      makeMat({ map: floorTexA, color: 0xd8d2c7, roughness: 0.92 }),
    ],
    stoneLightMat: makeMat({ map: masonryTex, color: 0xe8e2d7, roughness: 0.86 }),
    stoneDarkMat: makeMat({ map: masonryTex, color: 0xbcb6aa, roughness: 0.9 }),
    mossMat: makeMat({ map: mossTex, color: 0xdbe6cf, roughness: 0.95 }),
    woodMat: makeMat({ map: woodTex, color: 0xe5d3be, roughness: 0.82 }),
    woodDarkMat: makeMat({ map: woodTex, color: 0xa6896d, roughness: 0.86 }),
    ironMat: makeMat({ color: 0x2b2f38, metalness: 0.62, roughness: 0.44 }),
    terracottaMat: makeMat({ map: roofTex, color: 0xf2ded6, roughness: 0.78 }),
    crimsonMat: makeMat({ color: 0x8f1d22, roughness: 0.9 }),
    cliffMat: makeMat({ color: 0x4b5059, roughness: 0.95, metalness: 0.04 }),
    flowerRedMat: makeMat({ color: 0xc84b31, roughness: 0.8 }),
    flowerWhiteMat: makeMat({ color: 0xe2e8f0, roughness: 0.8 }),
  };
}

function buildStylizedObstacle(
  tracker: ScenarioResourceTracker,
  obs: ObstacleDef,
  gridSize: number,
  palette: FortressPalette,
  rng: () => number
): THREE.Group {
  const pos = gridToWorld(obs.pos, gridSize, 0);
  const group = new THREE.Group();
  group.position.set(pos.x, 0, pos.z);

  const addSolidBox = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rotY = 0
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)),
      mat
    );
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const addOrnamentMoss = (w: number, h: number, d: number, x: number, y: number, z: number): void => {
    const moss = new THREE.Mesh(
      tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)),
      palette.mossMat
    );
    moss.position.set(x, y, z);
    moss.receiveShadow = true;
    tracker.markNoRaycast(moss);
    group.add(moss);
  };

  switch (obs.kind) {
    case 'wall': {
      // Ruined fortress parapet wall (height 1.24 - 1.38, footprint <= 0.90 x 0.90)
      addSolidBox(0.88, 0.24, 0.82, palette.stoneDarkMat, 0, 0.12, 0);
      addSolidBox(0.84, 0.72, 0.72, palette.stoneLightMat, 0, 0.6, 0);
      // Asymmetric ruined crenellations / stacked stones
      const leftH = 0.28 + rng() * 0.12;
      const rightH = 0.18 + rng() * 0.12;
      addSolidBox(0.34, leftH, 0.64, palette.stoneLightMat, -0.22, 0.96 + leftH * 0.5, 0);
      addSolidBox(0.28, rightH, 0.58, palette.stoneDarkMat, 0.24, 0.96 + rightH * 0.5, 0.02);
      addOrnamentMoss(0.32, 0.06, 0.42, -0.18, 0.98 + leftH, 0.05);
      break;
    }

    case 'pillar': {
      // Stepped ruined stone buttress / pillar (height ~1.34, footprint <= 0.84 x 0.84)
      addSolidBox(0.84, 0.2, 0.84, palette.stoneDarkMat, 0, 0.1, 0);
      addSolidBox(0.68, 0.16, 0.68, palette.stoneLightMat, 0, 0.28, 0);
      const shaft = new THREE.Mesh(
        tracker.trackGeometry(new THREE.CylinderGeometry(0.28, 0.33, 0.78, 8)),
        palette.stoneLightMat
      );
      shaft.position.set(0, 0.75, 0);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      group.add(shaft);
      // Fractured capital block
      addSolidBox(0.56, 0.18, 0.54, palette.stoneDarkMat, 0.02, 1.23, -0.02, 0.18);
      addOrnamentMoss(0.36, 0.07, 0.34, 0.05, 1.35, 0);
      break;
    }

    case 'crate': {
      // Supply crate cluster with cross-braces & iron corners (height <= 0.64, below LoS)
      addSolidBox(0.56, 0.52, 0.56, palette.woodMat, -0.08, 0.26, 0.06, 0.12);
      addSolidBox(0.58, 0.07, 0.58, palette.woodDarkMat, -0.08, 0.48, 0.06, 0.12);
      addSolidBox(0.58, 0.07, 0.58, palette.woodDarkMat, -0.08, 0.08, 0.06, 0.12);
      // Secondary smaller crate tucked beside it
      addSolidBox(0.34, 0.34, 0.34, palette.woodDarkMat, 0.24, 0.17, -0.2, -0.22);
      break;
    }

    case 'barrel': {
      // Pair of wooden barrels with iron hoops (height <= 0.62, below LoS)
      const addBarrel = (bx: number, bz: number, h: number, r: number): void => {
        const body = new THREE.Mesh(
          tracker.trackGeometry(new THREE.CylinderGeometry(r * 0.88, r * 0.84, h, 10)),
          palette.woodMat
        );
        body.position.set(bx, h * 0.5, bz);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        for (const hoopY of [h * 0.24, h * 0.76]) {
          const hoop = new THREE.Mesh(
            tracker.trackGeometry(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.05, 10)),
            palette.ironMat
          );
          hoop.position.set(bx, hoopY, bz);
          group.add(hoop);
        }
      };
      addBarrel(-0.14, 0.08, 0.6, 0.22);
      addBarrel(0.2, -0.14, 0.48, 0.18);
      break;
    }

    default:
      break;
  }

  return group;
}

function addPropCluster(
  tracker: ScenarioResourceTracker,
  parent: THREE.Group,
  palette: FortressPalette,
  x: number,
  y: number,
  z: number,
  rotY = 0
): void {
  const cluster = new THREE.Group();
  cluster.position.set(x, y, z);
  cluster.rotation.y = rotY;

  const crate = new THREE.Mesh(
    tracker.trackGeometry(new THREE.BoxGeometry(0.52, 0.48, 0.52)),
    palette.woodMat
  );
  crate.position.set(-0.24, 0.24, 0.05);
  crate.castShadow = true;
  crate.receiveShadow = true;
  cluster.add(crate);

  const barrel = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(0.2, 0.18, 0.54, 10)),
    palette.woodDarkMat
  );
  barrel.position.set(0.24, 0.27, -0.08);
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  cluster.add(barrel);

  const hoop = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 10)),
    palette.ironMat
  );
  hoop.position.set(0.24, 0.4, -0.08);
  cluster.add(hoop);

  tracker.markNoRaycast(cluster);
  parent.add(cluster);
}

function addMossAndFlowerTuft(
  tracker: ScenarioResourceTracker,
  parent: THREE.Group,
  palette: FortressPalette,
  x: number,
  y: number,
  z: number,
  withFlowers = true
): void {
  const tuft = new THREE.Group();
  tuft.position.set(x, y, z);

  const pad = new THREE.Mesh(
    tracker.trackGeometry(new THREE.BoxGeometry(0.75, 0.08, 0.62)),
    palette.mossMat
  );
  pad.position.y = 0.04;
  pad.receiveShadow = true;
  tuft.add(pad);

  if (withFlowers) {
    const offsets: [number, number, boolean][] = [
      [-0.18, 0.12, true],
      [0.14, -0.1, false],
      [0.04, 0.18, true],
    ];
    for (const [fx, fz, isRed] of offsets) {
      const blossom = new THREE.Mesh(
        tracker.trackGeometry(new THREE.DodecahedronGeometry(0.065, 0)),
        isRed ? palette.flowerRedMat : palette.flowerWhiteMat
      );
      blossom.position.set(fx, 0.13, fz);
      tuft.add(blossom);
    }
  }

  tracker.markNoRaycast(tuft);
  parent.add(tuft);
}

function addOuterTerraceSlab(
  tracker: ScenarioResourceTracker,
  parent: THREE.Group,
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number
): void {
  const slab = new THREE.Mesh(
    tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)),
    mat
  );
  slab.position.set(x, y, z);
  slab.receiveShadow = true;
  slab.castShadow = true;
  tracker.markNoRaycast(slab);
  parent.add(slab);
}

function addDistantValleyDetails(
  tracker: ScenarioResourceTracker,
  parent: THREE.Group
): void {
  const valleyGroup = new THREE.Group();

  const riverMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({ color: 0x3f6680, transparent: true, opacity: 0.7 })
  );
  const bridgeMat = tracker.trackMaterial(
    new THREE.MeshBasicMaterial({ color: 0x242f44 })
  );

  // Winding distant river ribbon in the Northwest valley below the cliff
  const riverSegments: [number, number, number, number, number][] = [
    [-12, -8.8, -14, 7.5, 0.45],
    [-15, -8.8, -19, 8.2, -0.35],
    [-19, -8.8, -24, 9.0, 0.25],
  ];
  for (const [rx, ry, rz, len, rot] of riverSegments) {
    const seg = new THREE.Mesh(
      tracker.trackGeometry(new THREE.PlaneGeometry(2.2, len)),
      riverMat
    );
    seg.rotation.x = -Math.PI / 2;
    seg.rotation.z = rot;
    seg.position.set(rx, ry, rz);
    valleyGroup.add(seg);
  }

  // Distant arched bridge silhouette spanning the valley gorge
  const bridgeSpan = new THREE.Mesh(
    tracker.trackGeometry(new THREE.BoxGeometry(5.5, 0.55, 0.9)),
    bridgeMat
  );
  bridgeSpan.position.set(-14.5, -5.2, -21.5);
  valleyGroup.add(bridgeSpan);

  for (const px of [-16.6, -12.4]) {
    const pier = new THREE.Mesh(
      tracker.trackGeometry(new THREE.BoxGeometry(0.9, 4.2, 0.95)),
      bridgeMat
    );
    pier.position.set(px, -7.2, -21.5);
    valleyGroup.add(pier);
  }

  tracker.markNoRaycast(valleyGroup);
  parent.add(valleyGroup);
}

/**
 * Builds the Fortress of Bones (`fortress`) 3D scenario matching `references/scenarios/scenario_02.png`.
 */
export function buildFortressScenario(options: ScenarioBuildOptions): ScenarioBuildResult {
  const tracker = new ScenarioResourceTracker();
  const rng = createSeededRng(options.seed ?? 404);
  const palette = createFortressPalette(tracker);

  const root = new THREE.Group();
  root.name = 'fortress-scenario';

  const tileMeshes: THREE.Mesh[] = [];
  const obstacleMeshes: THREE.Mesh[] = [];
  const occluders: OccludingStructure[] = [];
  const animatedObjects: AnimatedScenarioObject[] = [];

  const registerModular = (id: string, res: ModularStructureResult, isOccluder = true): void => {
    tracker.markNoRaycast(res.root);
    root.add(res.root);
    animatedObjects.push(...res.animated);
    if (isOccluder) {
      occluders.push({
        id,
        bounds: res.bounds,
        upperGroup: res.upperGroup,
      });
    }
  };

  // -------------------------------------------------------------------------
  // 1. Playable 12x12 Grid Floor (strictly at y = 0.0 top)
  // -------------------------------------------------------------------------
  const tileGeo = tracker.trackGeometry(
    new THREE.BoxGeometry(CELL_SIZE * 0.985, TILE_HEIGHT, CELL_SIZE * 0.985)
  );
  for (let gx = 0; gx < options.gridSize; gx++) {
    for (let gy = 0; gy < options.gridSize; gy++) {
      const worldPos = gridToWorld({ x: gx, y: gy }, options.gridSize, -TILE_HEIGHT * 0.5);
      const matIdx = Math.floor(rng() * palette.floorMats.length);
      const tile = new THREE.Mesh(tileGeo, palette.floorMats[matIdx]);
      tile.position.copy(worldPos);
      tile.receiveShadow = true;
      const userData: TileRayUserData = {
        kind: 'tile',
        gridCoord: { x: gx, y: gy },
      };
      tile.userData = userData;
      root.add(tile);
      tileMeshes.push(tile);
    }
  }

  // -------------------------------------------------------------------------
  // 2. Internal Stylized Tactical Obstacles
  // -------------------------------------------------------------------------
  for (const obs of options.obstacleDefs) {
    const obsGroup = buildStylizedObstacle(tracker, obs, options.gridSize, palette, rng);
    tracker.applyObstacleMetadata(obsGroup, obs.kind, obs.pos, obstacleMeshes);
    root.add(obsGroup);
  }

  // -------------------------------------------------------------------------
  // 3. Outer Courtyard Lip, Terraces & Cliffs
  // -------------------------------------------------------------------------
  // Outer stone rim wrapping [-6.8, +6.8]² below y = 0 so edges look solid
  addOuterTerraceSlab(tracker, root, palette.stoneDarkMat, 14.2, 0.34, 1.1, 0, -0.17, -6.65); // North terrace
  addOuterTerraceSlab(tracker, root, palette.stoneDarkMat, 14.2, 0.34, 1.0, 0, -0.17, 6.6); // South terrace
  addOuterTerraceSlab(tracker, root, palette.stoneDarkMat, 1.6, 0.34, 13.6, -6.9, -0.17, 0); // West terrace
  addOuterTerraceSlab(tracker, root, palette.stoneDarkMat, 1.2, 0.34, 13.6, 6.65, -0.17, 0); // East terrace

  // Stone road continuing north beyond the gatehouse
  addOuterTerraceSlab(tracker, root, palette.stoneLightMat, 2.5, 0.14, 4.5, 0, -0.07, -9.6);

  // Cliffs descending below the plateau
  root.add(
    buildCliffEdge(tracker, {
      boardHalfExtent: 6.85,
      depth: 10.5,
      seed: 707,
      cliffMat: palette.cliffMat,
    })
  );

  // Decorative external staircases linking outer terraces & edges
  const northStairs = buildStaircase(tracker, {
    width: 1.9,
    steps: 4,
    height: 0.42,
    depth: 1.1,
    stoneMat: palette.stoneLightMat,
    worldX: -3.2,
    worldY: -0.25,
    worldZ: -6.75,
    rotationY: 0,
  });
  tracker.markNoRaycast(northStairs);
  root.add(northStairs);

  const westStairs = buildStaircase(tracker, {
    width: 1.7,
    steps: 4,
    height: 0.46,
    depth: 1.15,
    stoneMat: palette.stoneLightMat,
    worldX: -6.75,
    worldY: -0.35,
    worldZ: 2.3,
    rotationY: Math.PI / 2,
  });
  tracker.markNoRaycast(westStairs);
  root.add(westStairs);

  const southStairs = buildStaircase(tracker, {
    width: 2.0,
    steps: 4,
    height: 0.5,
    depth: 1.25,
    stoneMat: palette.stoneLightMat,
    worldX: -2.6,
    worldY: -0.45,
    worldZ: 6.85,
    rotationY: Math.PI,
  });
  tracker.markNoRaycast(southStairs);
  root.add(southStairs);

  const eastStairs = buildStaircase(tracker, {
    width: 1.8,
    steps: 4,
    height: 0.44,
    depth: 1.15,
    stoneMat: palette.stoneLightMat,
    worldX: 6.75,
    worldY: -0.32,
    worldZ: -2.2,
    rotationY: -Math.PI / 2,
  });
  tracker.markNoRaycast(eastStairs);
  root.add(eastStairs);

  // -------------------------------------------------------------------------
  // 4. North / Northeast Perimeter: Gatehouse, Battlements, Braziers & Banners
  // -------------------------------------------------------------------------
  registerModular(
    'north-gatehouse',
    buildGatehouse(tracker, {
      openingWidth: 2.2,
      height: 2.95,
      stoneMat: palette.stoneLightMat,
      ironMat: palette.ironMat,
      worldX: 0,
      worldY: 0,
      worldZ: -7.15,
      rotationY: 0,
    })
  );

  registerModular(
    'north-wall-west-inner',
    buildWallSegment(tracker, {
      length: 3.1,
      height: 2.15,
      thickness: 0.62,
      crenellations: true,
      moss: true,
      stoneMat: palette.stoneLightMat,
      mossMat: palette.mossMat,
      worldX: -3.65,
      worldY: 0,
      worldZ: -7.05,
    })
  );

  registerModular(
    'north-wall-west-outer',
    buildWallSegment(tracker, {
      length: 2.4,
      height: 1.85,
      thickness: 0.58,
      crenellations: true,
      moss: true,
      stoneMat: palette.stoneDarkMat,
      mossMat: palette.mossMat,
      worldX: -6.35,
      worldY: 0,
      worldZ: -6.95,
    })
  );

  registerModular(
    'north-wall-east-inner',
    buildWallSegment(tracker, {
      length: 3.1,
      height: 2.15,
      thickness: 0.62,
      crenellations: true,
      moss: true,
      stoneMat: palette.stoneLightMat,
      mossMat: palette.mossMat,
      worldX: 3.65,
      worldY: 0,
      worldZ: -7.05,
    })
  );

  registerModular(
    'north-wall-east-outer',
    buildWallSegment(tracker, {
      length: 2.2,
      height: 1.7,
      thickness: 0.56,
      crenellations: true,
      moss: false,
      stoneMat: palette.stoneDarkMat,
      worldX: 6.1,
      worldY: 0,
      worldZ: -6.85,
    })
  );

  // Gatehouse flanking Braziers (warm PointLights 1 & 2)
  const gateBrazierL: [number, number] = [-1.7, -6.55];
  const gateBrazierR: [number, number] = [1.7, -6.55];

  registerModular(
    'gate-brazier-left',
    buildBrazier(tracker, {
      pedestalHeight: 0.82,
      stoneMat: palette.stoneDarkMat,
      ironMat: palette.ironMat,
      phase: 0.4,
      worldX: gateBrazierL[0],
      worldY: 0,
      worldZ: gateBrazierL[1],
    })
  );

  registerModular(
    'gate-brazier-right',
    buildBrazier(tracker, {
      pedestalHeight: 0.82,
      stoneMat: palette.stoneDarkMat,
      ironMat: palette.ironMat,
      phase: 2.1,
      worldX: gateBrazierR[0],
      worldY: 0,
      worldZ: gateBrazierR[1],
    })
  );

  // Two Crimson Banners with 'sword' emblem flanking the gatehouse
  for (const [id, bx] of [
    ['gate-banner-left', -2.75],
    ['gate-banner-right', 2.75],
  ] as const) {
    registerModular(
      id,
      buildBannerStand(tracker, {
        emblem: 'sword',
        clothColor: '#8f1d22',
        trimColor: '#d4a24c',
        emblemColor: '#e6c173',
        woodMat: palette.woodDarkMat,
        worldX: bx,
        worldY: 0.25,
        worldZ: -6.65,
        rotationY: 0,
      })
    );
  }

  // Supply clusters tucked along the north inner wall (outside grid)
  addPropCluster(tracker, root, palette, -4.6, 0, -6.45, 0.25);
  addPropCluster(tracker, root, palette, 4.9, 0, -6.45, -0.3);

  // -------------------------------------------------------------------------
  // 5. West / Southwest Perimeter: Watchtower, Crimson Tent, Palisade & Props
  // -------------------------------------------------------------------------
  const watchtowerPos: [number, number] = [-7.35, -0.7];
  const watchtower = buildWatchtower(tracker, {
    height: 2.25,
    woodMat: palette.woodMat,
    roofMat: palette.terracottaMat,
    stoneMat: palette.stoneDarkMat,
    worldX: watchtowerPos[0],
    worldY: 0,
    worldZ: watchtowerPos[1],
    rotationY: Math.PI / 2,
  });
  registerModular('west-watchtower', watchtower);

  // Crimson banner hanging on the watchtower's courtyard-facing side
  registerModular(
    'watchtower-banner',
    buildBannerStand(tracker, {
      emblem: 'sword',
      clothColor: '#8f1d22',
      trimColor: '#d4a24c',
      emblemColor: '#e6c173',
      woodMat: palette.woodDarkMat,
      worldX: -6.5,
      worldY: 0.3,
      worldZ: -0.7,
      rotationY: Math.PI / 2,
    })
  );

  // Military Crimson Tent beside the watchtower (Northwest)
  registerModular(
    'west-crimson-tent',
    buildTent(tracker, {
      width: 1.65,
      depth: 2.0,
      height: 1.32,
      clothMat: palette.crimsonMat,
      woodMat: palette.woodDarkMat,
      worldX: -7.25,
      worldY: 0,
      worldZ: -3.7,
      rotationY: Math.PI / 2,
    })
  );

  // Supply crates/barrels & ruined low wall on West/Southwest edge
  addPropCluster(tracker, root, palette, -6.7, 0, 0.75, 0.6);
  addPropCluster(tracker, root, palette, -6.7, 0, -5.2, -0.4);

  registerModular(
    'west-south-wall',
    buildWallSegment(tracker, {
      length: 2.2,
      height: 1.15,
      thickness: 0.5,
      crenellations: false,
      moss: true,
      stoneMat: palette.stoneDarkMat,
      mossMat: palette.mossMat,
      worldX: -6.65,
      worldY: 0,
      worldZ: 4.4,
      rotationY: Math.PI / 2,
    })
  );

  // -------------------------------------------------------------------------
  // 6. South / East Perimeter: Ruined Roman Arch, Low Parapets & Courtyard Torch
  // -------------------------------------------------------------------------
  registerModular(
    'south-roman-arch',
    buildRuinedArch(tracker, {
      style: 'roman',
      width: 2.25,
      height: 2.35,
      stoneMat: palette.stoneLightMat,
      mossMat: palette.mossMat,
      worldX: 2.2,
      worldY: 0,
      worldZ: 6.75,
      rotationY: 0,
    })
  );

  // Low ruined parapets along South & East edges
  registerModular(
    'south-parapet-west',
    buildWallSegment(tracker, {
      length: 2.4,
      height: 0.95,
      thickness: 0.46,
      crenellations: false,
      moss: true,
      stoneMat: palette.stoneDarkMat,
      mossMat: palette.mossMat,
      worldX: -5.1,
      worldY: 0,
      worldZ: 6.65,
      rotationY: 0,
    })
  );

  registerModular(
    'east-parapet-north',
    buildWallSegment(tracker, {
      length: 2.3,
      height: 1.1,
      thickness: 0.48,
      crenellations: true,
      moss: true,
      stoneMat: palette.stoneDarkMat,
      mossMat: palette.mossMat,
      worldX: 6.65,
      worldY: 0,
      worldZ: -4.6,
      rotationY: Math.PI / 2,
    })
  );

  // Courtyard / front-border Brazier Torch (PointLight 4)
  const courtyardTorchPos: [number, number] = [6.55, 1.55];
  registerModular(
    'courtyard-brazier',
    buildBrazier(tracker, {
      pedestalHeight: 0.78,
      stoneMat: palette.stoneDarkMat,
      ironMat: palette.ironMat,
      phase: 3.7,
      worldX: courtyardTorchPos[0],
      worldY: 0,
      worldZ: courtyardTorchPos[1],
    })
  );

  addPropCluster(tracker, root, palette, 6.45, 0, -0.4, -0.8);
  addPropCluster(tracker, root, palette, -4.6, 0, 6.4, 0.4);

  // Moss & flower accents along outer ledges (strictly outside 12x12 grid)
  addMossAndFlowerTuft(tracker, root, palette, -6.55, 0, 1.6, true);
  addMossAndFlowerTuft(tracker, root, palette, 4.4, 0, 6.55, true);
  addMossAndFlowerTuft(tracker, root, palette, 6.45, 0, 3.2, false);
  addMossAndFlowerTuft(tracker, root, palette, -0.5, 0, 6.55, true);

  // -------------------------------------------------------------------------
  // 7. Surrounding Moat/Lake Water & Animated Waterfall on Southeast Cliff
  // -------------------------------------------------------------------------
  const moatTex = createWaterTexture(tracker, { seed: 502 });
  moatTex.repeat.set(18, 18);
  const moatGeo = tracker.trackGeometry(new THREE.PlaneGeometry(88, 88));
  const moatMat = tracker.trackMaterial(
    new THREE.MeshStandardMaterial({
      map: moatTex,
      color: 0x25637a,
      roughness: 0.24,
      metalness: 0.22,
      transparent: true,
      opacity: 0.94,
    })
  );
  const moatPlane = new THREE.Mesh(moatGeo, moatMat);
  moatPlane.rotation.x = -Math.PI / 2;
  moatPlane.position.y = -1.55;
  moatPlane.receiveShadow = true;
  tracker.markNoRaycast(moatPlane);
  root.add(moatPlane);
  animatedObjects.push({
    kind: 'water',
    update: (dt) => {
      moatTex.offset.x = (moatTex.offset.x + dt * 0.018) % 1;
      moatTex.offset.y = (moatTex.offset.y + dt * 0.011) % 1;
    },
  });

  // Stone water channel lip feeding the waterfall on the East/Southeast cliff
  addOuterTerraceSlab(tracker, root, palette.stoneDarkMat, 1.1, 0.16, 1.8, 6.75, -0.06, 4.75);
  const waterfall = buildWaterfall(tracker, {
    width: 1.65,
    height: 1.55,
    waterColor: 0x7dd3fc,
    worldX: 7.38,
    worldY: -0.15,
    worldZ: 4.75,
    rotationY: Math.PI / 2,
  });
  root.add(waterfall.root);
  animatedObjects.push(...waterfall.animated);

  // -------------------------------------------------------------------------
  // 8. Pine Trees on Solid Terraces & Twilight Horizon
  // -------------------------------------------------------------------------
  const pinePlacements: [string, number, number, number, number, boolean][] = [
    ['pine-nw-1', -7.45, -0.08, -7.25, 1.05, true],
    ['pine-ne-1', 7.35, -0.08, -7.55, 1.08, true],
  ];

  for (const [id, px, py, pz, scale, nearBoard] of pinePlacements) {
    registerModular(
      id,
      buildTree(tracker, {
        variant: 'pine',
        scale,
        worldX: px,
        worldY: py,
        worldZ: pz,
      }),
      nearBoard
    );
  }

  root.add(
    buildDistantSilhouettes(tracker, {
      variant: 'fortress',
      silhouetteColor: 0x1b2538,
      skyPalette: {
        topColor: '#17233d',
        midColor: '#314568',
        horizonColor: '#c7895c',
        groundColor: '#1a2230',
      },
    })
  );
  addDistantValleyDetails(tracker, root);

  // -------------------------------------------------------------------------
  // 9. Late-Afternoon Golden Atmosphere + 4 Warm PointLights
  // -------------------------------------------------------------------------
  // Watchtower lantern sits at local (0.75, deckY + 0.85, 0.75), rotated +PI/2 around Y
  // Local (+0.75, +0.75) rotated +PI/2 becomes (+0.75, -0.75) in world XZ
  const lanternWorld: [number, number, number] = [
    watchtowerPos[0] + 0.75,
    2.25 + 0.85,
    watchtowerPos[1] - 0.75,
  ];

  const atmosphere: ScenarioAtmospherePreset = {
    backgroundColor: 0x24324d,
    fogColor: 0x2a3650,
    fogDensity: 0.0085,
    ambientColor: 0x94a3b8,
    ambientIntensity: 0.45,
    hemiSkyColor: 0x8ec5e8,
    hemiGroundColor: 0x2c353d,
    hemiIntensity: 0.68,
    dirLightColor: 0xffe6bf,
    dirLightIntensity: 1.55,
    dirLightPosition: [10, 16, 8],
    rimLightColor: 0x7dd3fc,
    rimLightIntensity: 0.5,
    pointLights: [
      {
        position: [gateBrazierL[0], 1.45, gateBrazierL[1]],
        color: 0xfb923c,
        intensity: 2.1,
        distance: 9.5,
        decay: 1.8,
        flicker: true,
      },
      {
        position: [gateBrazierR[0], 1.45, gateBrazierR[1]],
        color: 0xfb923c,
        intensity: 2.1,
        distance: 9.5,
        decay: 1.8,
        flicker: true,
      },
      {
        position: lanternWorld,
        color: 0xfdba74,
        intensity: 1.85,
        distance: 8.5,
        decay: 1.8,
        flicker: true,
      },
      {
        position: [courtyardTorchPos[0], 1.4, courtyardTorchPos[1]],
        color: 0xfb923c,
        intensity: 1.9,
        distance: 9.0,
        decay: 1.8,
        flicker: true,
      },
    ],
  };

  const update = (dt: number, elapsed: number): void => {
    for (const anim of animatedObjects) {
      anim.update(dt, elapsed);
    }
  };

  const dispose = (): void => {
    tracker.dispose();
  };

  return {
    group: root,
    tileMeshes,
    obstacleMeshes,
    occluders,
    animatedObjects,
    atmosphere,
    update,
    dispose,
  };
}
