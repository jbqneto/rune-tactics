import * as THREE from 'three';
import type { GridCoord } from '../../shared/types';
import {
  buildAquaticPlants,
  buildBannerStand,
  buildBrazier,
  buildBridge,
  buildBrokenPillar,
  buildCliffEdge,
  buildDistantSilhouettes,
  buildRuinedArch,
  buildStaircase,
  buildTree,
  buildWallSegment,
  createMedallionTexture,
  createMistSpriteTexture,
  createMossTexture,
  createSeededRng,
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
  ScenarioPointLightPreset,
  TileRayUserData,
} from './ScenarioTypes';

const CELL_SIZE = 1;
const TILE_HEIGHT = 0.16;

function coordKey(c: GridCoord): string {
  return `${c.x},${c.y}`;
}

function gridToWorld(coord: GridCoord, gridSize: number, y = 0): THREE.Vector3 {
  const half = (gridSize - 1) / 2;
  return new THREE.Vector3(
    (coord.x - half) * CELL_SIZE,
    y,
    (half - coord.y) * CELL_SIZE
  );
}

interface SwampMaterials {
  stoneFloorLight: THREE.MeshStandardMaterial;
  stoneFloorDark: THREE.MeshStandardMaterial;
  masonry: THREE.MeshStandardMaterial;
  darkStone: THREE.MeshStandardMaterial;
  moss: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  darkWood: THREE.MeshStandardMaterial;
  iron: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  waterTex: THREE.CanvasTexture;
  waterBed: THREE.MeshStandardMaterial;
  medallion: THREE.MeshStandardMaterial;
  mistTex: THREE.CanvasTexture;
  bridgeClickMat: THREE.MeshBasicMaterial;
}

function createSwampMaterials(
  tracker: ScenarioResourceTracker,
  seed: number
): SwampMaterials {
  const floorTexLight = createWeatheredStoneTexture(tracker, {
    seed: seed + 11,
    variant: 'floor',
    baseColor: '#6c7877',
    secondaryColor: '#586565',
    mortarColor: '#36413e',
    mossAmount: 0.24,
  });
  const floorTexDark = createWeatheredStoneTexture(tracker, {
    seed: seed + 23,
    variant: 'floor',
    baseColor: '#525e5f',
    secondaryColor: '#445051',
    mortarColor: '#2d3735',
    mossAmount: 0.3,
  });
  const masonryTex = createWeatheredStoneTexture(tracker, {
    seed: seed + 37,
    variant: 'masonry',
    baseColor: '#667271',
    secondaryColor: '#4f5a5b',
    mortarColor: '#323c3a',
    mossAmount: 0.28,
  });
  const mossTex = createMossTexture(tracker, {
    seed: seed + 51,
    baseColor: '#4a6b2f',
    highlightColor: '#638740',
    earthColor: '#355022',
  });
  const woodTex = createWoodPlankTexture(tracker, {
    seed: seed + 67,
    baseColor: '#5e412c',
    grainColor: '#402b1c',
  });
  const waterTex = createWaterTexture(tracker, {
    seed: seed + 83,
    deepColor: '#132d2d',
    baseColor: '#1e4442',
    rippleColor: '#4a7a75',
  });
  waterTex.repeat.set(7, 7);

  const medallionTex = createMedallionTexture(tracker, {
    stoneColor: '#64706f',
    engravingColor: '#33403f',
    runeColor: '#768d85',
  });
  const mistTex = createMistSpriteTexture(tracker);

  return {
    stoneFloorLight: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: floorTexLight,
        roughness: 0.86,
        metalness: 0.05,
      })
    ),
    stoneFloorDark: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: floorTexDark,
        roughness: 0.88,
        metalness: 0.05,
      })
    ),
    masonry: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: masonryTex,
        roughness: 0.9,
        metalness: 0.04,
      })
    ),
    darkStone: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x3b4445,
        roughness: 0.93,
        metalness: 0.04,
      })
    ),
    moss: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: mossTex,
        roughness: 0.94,
        metalness: 0.02,
      })
    ),
    wood: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.85,
        metalness: 0.05,
      })
    ),
    darkWood: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x402b1c,
        roughness: 0.9,
        metalness: 0.05,
      })
    ),
    iron: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x2b2f38,
        roughness: 0.45,
        metalness: 0.58,
      })
    ),
    water: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: waterTex,
        color: 0x1b3b3a,
        roughness: 0.14,
        metalness: 0.18,
        transparent: true,
        opacity: 0.84,
      })
    ),
    waterTex,
    waterBed: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x0f2424,
        roughness: 0.95,
        metalness: 0.02,
      })
    ),
    medallion: tracker.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: medallionTex,
        roughness: 0.82,
        metalness: 0.06,
      })
    ),
    mistTex,
    bridgeClickMat: tracker.trackMaterial(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    ),
  };
}

function registerOccluder(
  occluders: OccludingStructure[],
  id: string,
  structure: ModularStructureResult,
  animatedObjects: AnimatedScenarioObject[]
): void {
  occluders.push({
    id,
    bounds: structure.bounds,
    upperGroup: structure.upperGroup,
  });
  for (const anim of structure.animated) {
    animatedObjects.push(anim);
  }
}

function addStaticBox(
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
  const mesh = new THREE.Mesh(
    tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)),
    mat
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

function buildCrateObstacle(
  tracker: ScenarioResourceTracker,
  mats: SwampMaterials,
  worldPos: THREE.Vector3,
  rotationY: number
): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(worldPos);
  group.rotation.y = rotationY;

  addStaticBox(tracker, group, 0.66, 0.62, 0.66, mats.wood, 0, 0.31, 0);
  addStaticBox(tracker, group, 0.7, 0.08, 0.7, mats.darkWood, 0, 0.06, 0);
  addStaticBox(tracker, group, 0.7, 0.08, 0.7, mats.darkWood, 0, 0.56, 0);
  addStaticBox(tracker, group, 0.68, 0.07, 0.08, mats.iron, 0, 0.31, 0.31);
  addStaticBox(tracker, group, 0.68, 0.07, 0.08, mats.iron, 0, 0.31, -0.31);

  return group;
}

function buildBarrelObstacle(
  tracker: ScenarioResourceTracker,
  mats: SwampMaterials,
  worldPos: THREE.Vector3
): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(worldPos);

  const body = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(0.28, 0.25, 0.7, 10)),
    mats.wood
  );
  body.position.y = 0.35;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const hoopGeo = tracker.trackGeometry(new THREE.CylinderGeometry(0.295, 0.295, 0.06, 10));
  for (const hy of [0.16, 0.54]) {
    const hoop = new THREE.Mesh(hoopGeo, mats.iron);
    hoop.position.y = hy;
    hoop.castShadow = true;
    group.add(hoop);
  }

  return group;
}

function buildPlayableBoard(
  tracker: ScenarioResourceTracker,
  group: THREE.Group,
  options: ScenarioBuildOptions,
  mats: SwampMaterials,
  tileMeshes: THREE.Mesh[],
  obstacleMeshes: THREE.Mesh[],
  occluders: OccludingStructure[],
  rng: () => number
): void {
  const { gridSize, obstacleDefs, bridgeCells = [] } = options;

  const waterKeys = new Set(
    obstacleDefs.filter((o) => o.kind === 'water').map((o) => coordKey(o.pos))
  );
  const bridgeKeys = new Set(bridgeCells.map((c) => coordKey(c)));

  const tileGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.96, TILE_HEIGHT, 0.96));
  const bridgeClickGeo = tracker.trackGeometry(new THREE.PlaneGeometry(0.96, 0.96));

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const coord: GridCoord = { x, y };
      const key = coordKey(coord);

      if (waterKeys.has(key)) {
        const wPos = gridToWorld(coord, gridSize, -0.04);
        const plants = buildAquaticPlants(tracker, {
          seed: Math.floor(rng() * 100000) + x * 31 + y * 97,
          lilyPads: rng() > 0.35 ? 2 : 1,
          lotusCount: rng() > 0.55 ? 1 : 0,
          reedsCount: rng() > 0.3 ? 3 : 2,
          spreadRadius: 0.34,
          worldX: wPos.x,
          worldY: wPos.y,
          worldZ: wPos.z,
        });
        group.add(plants);
        continue;
      }

      if (bridgeKeys.has(key)) {
        const bPos = gridToWorld(coord, gridSize, 0);
        const railLeft = waterKeys.has(coordKey({ x: x - 1, y }));
        const railRight = waterKeys.has(coordKey({ x: x + 1, y }));

        const bridge = buildBridge(tracker, {
          length: 1.0,
          width: 0.96,
          railLeft,
          railRight,
          woodMat: mats.wood,
          postMat: mats.darkWood,
          worldX: bPos.x,
          worldY: 0,
          worldZ: bPos.z,
        });
        tracker.markNoRaycast(bridge);
        group.add(bridge);

        const clickTile = new THREE.Mesh(bridgeClickGeo, mats.bridgeClickMat);
        clickTile.rotation.x = -Math.PI / 2;
        clickTile.position.set(bPos.x, -0.001, bPos.z);
        clickTile.userData = {
          kind: 'tile',
          gridCoord: { x, y },
        } satisfies TileRayUserData;
        group.add(clickTile);
        tileMeshes.push(clickTile);
        continue;
      }

      const isLight = (x + y) % 2 === 0;
      const tile = new THREE.Mesh(
        tileGeo,
        isLight ? mats.stoneFloorLight : mats.stoneFloorDark
      );
      tile.position.copy(gridToWorld(coord, gridSize, -TILE_HEIGHT / 2));
      tile.receiveShadow = true;
      tile.userData = {
        kind: 'tile',
        gridCoord: { x, y },
      } satisfies TileRayUserData;
      group.add(tile);
      tileMeshes.push(tile);
    }
  }

  for (const obs of obstacleDefs) {
    if (obs.kind === 'water') continue;
    const pos = gridToWorld(obs.pos, gridSize, 0);

    if (obs.kind === 'pillar') {
      const pillar = buildBrokenPillar(tracker, {
        height: 1.35 + rng() * 0.25,
        radius: 0.34,
        moss: true,
        stoneMat: mats.masonry,
        mossMat: mats.moss,
        worldX: pos.x,
        worldY: 0,
        worldZ: pos.z,
        rotationY: Math.floor(rng() * 4) * (Math.PI / 2),
      });
      tracker.applyObstacleMetadata(pillar.root, 'pillar', obs.pos, obstacleMeshes);
      group.add(pillar.root);
      occluders.push({
        id: `obs-pillar-${obs.pos.x}-${obs.pos.y}`,
        bounds: pillar.bounds,
        upperGroup: pillar.upperGroup,
      });
    } else if (obs.kind === 'wall') {
      const wall = buildWallSegment(tracker, {
        length: 0.94,
        height: 1.4,
        thickness: 0.56,
        crenellations: false,
        moss: true,
        stoneMat: mats.masonry,
        mossMat: mats.moss,
        worldX: pos.x,
        worldY: 0,
        worldZ: pos.z,
      });
      tracker.applyObstacleMetadata(wall.root, 'wall', obs.pos, obstacleMeshes);
      group.add(wall.root);
      occluders.push({
        id: `obs-wall-${obs.pos.x}-${obs.pos.y}`,
        bounds: wall.bounds,
        upperGroup: wall.upperGroup,
      });
    } else if (obs.kind === 'crate') {
      const crate = buildCrateObstacle(tracker, mats, pos, (rng() - 0.5) * 0.24);
      tracker.applyObstacleMetadata(crate, 'crate', obs.pos, obstacleMeshes);
      group.add(crate);
    } else if (obs.kind === 'barrel') {
      const barrel = buildBarrelObstacle(tracker, mats, pos);
      tracker.applyObstacleMetadata(barrel, 'barrel', obs.pos, obstacleMeshes);
      group.add(barrel);
    }
  }
}

function buildNorthGothicRuins(
  tracker: ScenarioResourceTracker,
  group: THREE.Group,
  mats: SwampMaterials,
  occluders: OccludingStructure[],
  animatedObjects: AnimatedScenarioObject[],
  pointLights: ScenarioPointLightPreset[]
): void {
  // Northeast / North-Center raised terrace & grand Gothic portal
  const terraceY = 0.52;
  const neTerrace = addStaticBox(
    tracker,
    group,
    7.4,
    0.72,
    4.0,
    mats.masonry,
    2.2,
    terraceY - 0.36,
    -8.45,
    true,
    true
  );
  tracker.markNoRaycast(neTerrace);

  const neMossCap = addStaticBox(
    tracker,
    group,
    7.5,
    0.06,
    4.1,
    mats.moss,
    2.2,
    terraceY - 0.01,
    -8.45,
    false,
    true
  );
  tracker.markNoRaycast(neMossCap);

  // Circular runic medallion on terrace floor in front of the main portal
  const medallion = new THREE.Mesh(
    tracker.trackGeometry(new THREE.CylinderGeometry(1.15, 1.15, 0.03, 24)),
    mats.medallion
  );
  medallion.position.set(2.2, terraceY + 0.015, -7.85);
  medallion.receiveShadow = true;
  tracker.markNoRaycast(medallion);
  group.add(medallion);

  // Wide stone staircase descending from terrace toward the north edge of the arena
  const mainStairs = buildStaircase(tracker, {
    width: 3.1,
    steps: 4,
    height: terraceY,
    depth: 1.35,
    stoneMat: mats.masonry,
    worldX: 2.2,
    worldY: 0,
    worldZ: -6.55,
    rotationY: 0,
  });
  tracker.markNoRaycast(mainStairs);
  group.add(mainStairs);

  // Main Gothic portal arch + flanking side arches
  const mainArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 3.3,
    height: 3.5,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: 2.2,
    worldY: terraceY,
    worldZ: -9.55,
  });
  tracker.markNoRaycast(mainArch.root);
  group.add(mainArch.root);
  registerOccluder(occluders, 'ne-main-gothic-arch', mainArch, animatedObjects);

  const leftSideArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 1.9,
    height: 2.45,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: -0.55,
    worldY: terraceY,
    worldZ: -9.15,
    rotationY: 0.12,
  });
  tracker.markNoRaycast(leftSideArch.root);
  group.add(leftSideArch.root);
  registerOccluder(occluders, 'ne-left-side-arch', leftSideArch, animatedObjects);

  const rightSideArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 1.9,
    height: 2.35,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: 4.95,
    worldY: terraceY,
    worldZ: -9.15,
    rotationY: -0.14,
  });
  tracker.markNoRaycast(rightSideArch.root);
  group.add(rightSideArch.root);
  registerOccluder(occluders, 'ne-right-side-arch', rightSideArch, animatedObjects);

  // Two crimson banners with white tree emblem flanking the main portal
  const bannerLeft = buildBannerStand(tracker, {
    emblem: 'tree',
    clothColor: '#7f1d24',
    trimColor: '#d4a24c',
    emblemColor: '#e7dfd1',
    woodMat: mats.darkWood,
    worldX: 0.45,
    worldY: terraceY,
    worldZ: -9.15,
  });
  tracker.markNoRaycast(bannerLeft.root);
  group.add(bannerLeft.root);
  registerOccluder(occluders, 'ne-banner-left', bannerLeft, animatedObjects);

  const bannerRight = buildBannerStand(tracker, {
    emblem: 'tree',
    clothColor: '#7f1d24',
    trimColor: '#d4a24c',
    emblemColor: '#e7dfd1',
    woodMat: mats.darkWood,
    worldX: 3.95,
    worldY: terraceY,
    worldZ: -9.15,
  });
  tracker.markNoRaycast(bannerRight.root);
  group.add(bannerRight.root);
  registerOccluder(occluders, 'ne-banner-right', bannerRight, animatedObjects);

  // Two warm braziers flanking the terrace/stairs (PointLights #1 & #2)
  const brazierPositions: Array<[number, number, number, number, string]> = [
    [0.15, terraceY, -7.05, 0.4, 'ne-brazier-west'],
    [4.25, terraceY, -7.05, 1.9, 'ne-brazier-east'],
  ];
  for (const [bx, by, bz, phase, id] of brazierPositions) {
    const brazier = buildBrazier(tracker, {
      pedestalHeight: 0.68,
      stoneMat: mats.masonry,
      ironMat: mats.iron,
      flameColor: 0xf97316,
      coreColor: 0xfef08a,
      phase,
      worldX: bx,
      worldY: by,
      worldZ: bz,
    });
    tracker.markNoRaycast(brazier.root);
    group.add(brazier.root);
    registerOccluder(occluders, id, brazier, animatedObjects);
    pointLights.push({
      position: [bx, by + 1.08, bz],
      color: 0xf97316,
      intensity: 2.6,
      distance: 10.5,
      decay: 1.8,
      flicker: true,
    });
  }

  // Northwest Terrace + Ancient Gnarled Tree + Side Staircase + Brazier (#3)
  const nwTerrace = addStaticBox(
    tracker,
    group,
    5.2,
    0.72,
    4.6,
    mats.masonry,
    -6.4,
    terraceY - 0.36,
    -8.4,
    true,
    true
  );
  tracker.markNoRaycast(nwTerrace);

  const nwMoss = addStaticBox(
    tracker,
    group,
    5.3,
    0.06,
    4.7,
    mats.moss,
    -6.4,
    terraceY - 0.01,
    -8.4,
    false,
    true
  );
  tracker.markNoRaycast(nwMoss);

  const nwStairs = buildStaircase(tracker, {
    width: 1.8,
    steps: 4,
    height: terraceY,
    depth: 1.25,
    stoneMat: mats.masonry,
    worldX: -4.8,
    worldY: 0,
    worldZ: -6.55,
    rotationY: 0,
  });
  tracker.markNoRaycast(nwStairs);
  group.add(nwStairs);

  const ancientTree = buildTree(tracker, {
    variant: 'gnarled',
    scale: 1.75,
    worldX: -7.5,
    worldY: terraceY,
    worldZ: -8.6,
    rotationY: 0.45,
  });
  tracker.markNoRaycast(ancientTree.root);
  group.add(ancientTree.root);
  registerOccluder(occluders, 'nw-ancient-tree', ancientTree, animatedObjects);

  const nwRuinedArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 2.1,
    height: 2.5,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: -3.2,
    worldY: terraceY,
    worldZ: -9.3,
    rotationY: 0.25,
  });
  tracker.markNoRaycast(nwRuinedArch.root);
  group.add(nwRuinedArch.root);
  registerOccluder(occluders, 'nw-ruined-arch', nwRuinedArch, animatedObjects);

  const nwBrazier = buildBrazier(tracker, {
    pedestalHeight: 0.65,
    stoneMat: mats.masonry,
    ironMat: mats.iron,
    flameColor: 0xf97316,
    coreColor: 0xfef08a,
    phase: 3.1,
    worldX: -5.85,
    worldY: terraceY,
    worldZ: -6.95,
  });
  tracker.markNoRaycast(nwBrazier.root);
  group.add(nwBrazier.root);
  registerOccluder(occluders, 'nw-brazier', nwBrazier, animatedObjects);
  pointLights.push({
    position: [-5.85, terraceY + 1.05, -6.95],
    color: 0xf97316,
    intensity: 2.5,
    distance: 10,
    decay: 1.8,
    flicker: true,
  });
}

function buildSouthAndFlankRuins(
  tracker: ScenarioResourceTracker,
  group: THREE.Group,
  mats: SwampMaterials,
  occluders: OccludingStructure[],
  animatedObjects: AnimatedScenarioObject[],
  pointLights: ScenarioPointLightPreset[],
  _rng: () => number
): void {
  // Southwest mossy stone platform + Ruined Gothic Arch + Brazier (#4)
  const swPlat = addStaticBox(
    tracker,
    group,
    4.6,
    0.34,
    3.8,
    mats.masonry,
    -6.8,
    0.01,
    6.9,
    true,
    true
  );
  tracker.markNoRaycast(swPlat);

  const swArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 2.25,
    height: 2.6,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: -7.5,
    worldY: 0.18,
    worldZ: 6.4,
    rotationY: Math.PI * 0.38,
  });
  tracker.markNoRaycast(swArch.root);
  group.add(swArch.root);
  registerOccluder(occluders, 'sw-ruined-arch', swArch, animatedObjects);

  const swBrazier = buildBrazier(tracker, {
    pedestalHeight: 0.65,
    stoneMat: mats.masonry,
    ironMat: mats.iron,
    flameColor: 0xf97316,
    coreColor: 0xfef08a,
    phase: 4.7,
    worldX: -6.35,
    worldY: 0.18,
    worldZ: 7.55,
  });
  tracker.markNoRaycast(swBrazier.root);
  group.add(swBrazier.root);
  registerOccluder(occluders, 'sw-brazier', swBrazier, animatedObjects);
  pointLights.push({
    position: [-6.35, 0.18 + 1.05, 7.55],
    color: 0xf97316,
    intensity: 2.5,
    distance: 10,
    decay: 1.8,
    flicker: true,
  });

  // Southeast mossy stone platform + decorative steps + broken pillars
  const sePlat = addStaticBox(
    tracker,
    group,
    4.8,
    0.32,
    3.8,
    mats.masonry,
    6.7,
    0.0,
    6.8,
    true,
    true
  );
  tracker.markNoRaycast(sePlat);

  const seStairs = buildStaircase(tracker, {
    width: 2.0,
    steps: 3,
    height: 0.28,
    depth: 1.0,
    stoneMat: mats.masonry,
    worldX: 5.2,
    worldY: -0.1,
    worldZ: 6.95,
    rotationY: -Math.PI * 0.5,
  });
  tracker.markNoRaycast(seStairs);
  group.add(seStairs);

  const sePillar1 = buildBrokenPillar(tracker, {
    height: 1.9,
    radius: 0.36,
    moss: true,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: 7.1,
    worldY: 0.16,
    worldZ: 5.5,
    rotationY: 0.4,
  });
  tracker.markNoRaycast(sePillar1.root);
  group.add(sePillar1.root);
  registerOccluder(occluders, 'se-pillar-1', sePillar1, animatedObjects);

  const sePillar2 = buildBrokenPillar(tracker, {
    height: 1.45,
    radius: 0.32,
    moss: true,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: 7.9,
    worldY: 0.16,
    worldZ: 7.4,
    rotationY: 1.2,
  });
  tracker.markNoRaycast(sePillar2.root);
  group.add(sePillar2.root);
  registerOccluder(occluders, 'se-pillar-2', sePillar2, animatedObjects);

  // South border low mossy wall segments
  const southWall = buildWallSegment(tracker, {
    length: 3.4,
    height: 0.95,
    thickness: 0.52,
    crenellations: false,
    moss: true,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: -1.6,
    worldY: -0.05,
    worldZ: 6.75,
  });
  tracker.markNoRaycast(southWall.root);
  group.add(southWall.root);
  registerOccluder(occluders, 'south-low-wall', southWall, animatedObjects);

  // East & West flank ledges (split into North & South halves so central water channel z in [-1.2, +1.2] stays open)
  const flankCoords: Array<[number, number, number, number]> = [
    [-6.65, -3.6, 1.1, 4.4],
    [-6.65, 3.6, 1.1, 4.4],
    [6.65, -3.6, 1.1, 4.4],
    [6.65, 3.6, 1.1, 4.4],
  ];
  for (const [fx, fz, fw, fd] of flankCoords) {
    const ledge = addStaticBox(tracker, group, fw, 0.28, fd, mats.masonry, fx, -0.08, fz, true, true);
    tracker.markNoRaycast(ledge);
  }

  // Framing ruined arch on the central-north edge of the island
  const midArch = buildRuinedArch(tracker, {
    style: 'gothic',
    width: 2.0,
    height: 2.2,
    stoneMat: mats.masonry,
    mossMat: mats.moss,
    worldX: -6.7,
    worldY: 0.06,
    worldZ: -3.2,
    rotationY: Math.PI * 0.5,
  });
  tracker.markNoRaycast(midArch.root);
  group.add(midArch.root);
  registerOccluder(occluders, 'west-mid-arch', midArch, animatedObjects);
}

function buildOuterSwampDepth(
  tracker: ScenarioResourceTracker,
  group: THREE.Group,
  mats: SwampMaterials,
  animatedObjects: AnimatedScenarioObject[],
  rng: () => number
): void {
  // Under-board cliff foundation
  const cliff = buildCliffEdge(tracker, {
    boardHalfExtent: 6.2,
    depth: 9.5,
    seed: 909,
    cliffMat: mats.darkStone,
  });
  group.add(cliff);

  // Continuous swamp water bed & animated water surface extending 360° around the arena
  const bed = new THREE.Mesh(
    tracker.trackGeometry(new THREE.PlaneGeometry(54, 54)),
    mats.waterBed
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = -0.15;
  bed.receiveShadow = true;
  tracker.markNoRaycast(bed);
  group.add(bed);

  const waterSurface = new THREE.Mesh(
    tracker.trackGeometry(new THREE.PlaneGeometry(52, 52)),
    mats.water
  );
  waterSurface.rotation.x = -Math.PI / 2;
  waterSurface.position.y = -0.045;
  waterSurface.receiveShadow = true;
  tracker.markNoRaycast(waterSurface);
  group.add(waterSurface);

  animatedObjects.push({
    kind: 'water',
    update: (dt: number) => {
      mats.waterTex.offset.x = (mats.waterTex.offset.x + dt * 0.025) % 1;
      mats.waterTex.offset.y = (mats.waterTex.offset.y + dt * 0.015) % 1;
    },
  });

  // Distant ruined aqueduct & submerged bridge in the misty background (-Z)
  for (let i = 0; i < 4; i++) {
    const aq = buildRuinedArch(tracker, {
      style: 'roman',
      width: 2.3,
      height: 2.9,
      stoneMat: mats.darkStone,
      mossMat: mats.moss,
      worldX: -5.5 + i * 2.25,
      worldY: -0.25,
      worldZ: -16.5,
      rotationY: 0.08,
    });
    tracker.markNoRaycast(aq.root);
    group.add(aq.root);
  }

  // Low animated mist drifting over the outer swamp lagoon (outside [-6, +6]²)
  const mistGeo = tracker.trackGeometry(new THREE.PlaneGeometry(6.5, 6.5));
  const mistSpots: Array<[number, number, number, number]> = [
    [-9.5, 0.12, -2.5, 0.28],
    [9.8, 0.14, 1.5, 0.25],
    [-2.5, 0.16, -13.2, 0.34],
    [5.5, 0.15, -13.5, 0.3],
    [-4.0, 0.12, 10.5, 0.26],
    [5.2, 0.13, 10.2, 0.24],
    [-11.5, 0.18, -9.0, 0.32],
    [11.0, 0.16, -7.5, 0.28],
  ];

  for (let i = 0; i < mistSpots.length; i++) {
    const [mx, my, mz, opacity] = mistSpots[i];
    const mistMat = tracker.trackMaterial(
      new THREE.MeshBasicMaterial({
        map: mats.mistTex,
        color: 0x9ec5c8,
        transparent: true,
        opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.rotation.x = -Math.PI / 2;
    mist.position.set(mx, my, mz);
    tracker.markNoRaycast(mist);
    group.add(mist);

    const baseX = mx;
    const baseZ = mz;
    const phase = i * 1.15 + rng() * 0.5;
    animatedObjects.push({
      kind: 'mist',
      update: (_dt: number, elapsed: number) => {
        mist.position.x = baseX + Math.sin(elapsed * 0.25 + phase) * 0.65;
        mist.position.z = baseZ + Math.cos(elapsed * 0.18 + phase) * 0.45;
      },
    });
  }

  // 360° horizon sky band and gnarled tree silhouettes
  const silhouettes = buildDistantSilhouettes(tracker, {
    variant: 'swamp',
    radius: 38,
    silhouetteColor: 0x0e1a1f,
    skyPalette: {
      topColor: '#132128',
      midColor: '#1d323a',
      horizonColor: '#2d474d',
      groundColor: '#0e1a1f',
    },
  });
  group.add(silhouettes);
}

/**
 * Builds the 3D "Forgotten Swamp" (`forgotten-swamp`) scenario inspired by
 * `references/scenarios/scenario_03.png`, preserving the 12×12 playable grid,
 * adaptive bridges, aquatic plants, Gothic ruins, ancient gnarled tree,
 * 360° occlusion groups, and warm brazier atmosphere.
 */
export function buildSwampScenario(options: ScenarioBuildOptions): ScenarioBuildResult {
  const tracker = new ScenarioResourceTracker();
  const group = new THREE.Group();
  const rng = createSeededRng(options.seed ?? 4042);

  const mats = createSwampMaterials(tracker, options.seed ?? 4042);
  const tileMeshes: THREE.Mesh[] = [];
  const obstacleMeshes: THREE.Mesh[] = [];
  const occluders: OccludingStructure[] = [];
  const animatedObjects: AnimatedScenarioObject[] = [];
  const pointLights: ScenarioPointLightPreset[] = [];

  buildPlayableBoard(
    tracker,
    group,
    options,
    mats,
    tileMeshes,
    obstacleMeshes,
    occluders,
    rng
  );

  buildNorthGothicRuins(
    tracker,
    group,
    mats,
    occluders,
    animatedObjects,
    pointLights
  );

  buildSouthAndFlankRuins(
    tracker,
    group,
    mats,
    occluders,
    animatedObjects,
    pointLights,
    rng
  );

  buildOuterSwampDepth(tracker, group, mats, animatedObjects, rng);

  const atmosphere: ScenarioAtmospherePreset = {
    backgroundColor: 0x132128,
    fogColor: 0x132128,
    fogDensity: 0.015,
    ambientColor: 0x89a8b2,
    ambientIntensity: 0.45,
    hemiSkyColor: 0x6b9aa8,
    hemiGroundColor: 0x182924,
    hemiIntensity: 0.62,
    dirLightColor: 0xd6e6f2,
    dirLightIntensity: 1.18,
    dirLightPosition: [-8, 16, 10],
    rimLightColor: 0x67e8f9,
    rimLightIntensity: 0.4,
    pointLights,
  };

  return {
    group,
    tileMeshes,
    obstacleMeshes,
    occluders,
    animatedObjects,
    atmosphere,
    update: (dt: number, elapsed: number) => {
      for (const anim of animatedObjects) {
        anim.update(dt, elapsed);
      }
    },
    dispose: () => {
      tracker.dispose();
    },
  };
}
