import * as THREE from 'three';
import type { GridCoord } from '../../shared/types';
import {
  buildTree,
  createMossTexture,
  ScenarioResourceTracker,
} from './ScenarioKit';
import type { ScenarioBuildOptions, ScenarioBuildResult, ScenarioAtmospherePreset, TileRayUserData } from './ScenarioTypes';

const TILE_HEIGHT = 0.16;

function world(coord: GridCoord, size: number): THREE.Vector3 {
  const half = (size - 1) / 2;
  return new THREE.Vector3(coord.x - half, 0, half - coord.y);
}

function loadTileableTexture(
  tracker: ScenarioResourceTracker,
  path: string,
  repeatX = 1,
  repeatY = 1,
): THREE.Texture {
  const loader = new THREE.TextureLoader();
  const tex = tracker.trackTexture(loader.load(path));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

export function buildDorterScenario(options: ScenarioBuildOptions): ScenarioBuildResult {
  const tracker = new ScenarioResourceTracker();
  const group = new THREE.Group();
  group.name = 'dorter-ruins-scenario';
  const tileMeshes: THREE.Mesh[] = [];
  const obstacleMeshes: THREE.Mesh[] = [];

  const tileGeo = tracker.trackGeometry(new THREE.BoxGeometry(0.985, TILE_HEIGHT, 0.985));
  const cobbleTex = loadTileableTexture(tracker, '/assets/textures/dorter-cobble.png', 0.5, 0.5);
  const wallTex = loadTileableTexture(tracker, '/assets/textures/dorter-stone-wall.png', 1.25, 1);
  const grassTex = createMossTexture(tracker, {
    seed: 1721,
    baseColor: '#4c732d',
    highlightColor: '#769c42',
    earthColor: '#63462a',
  });

  const mat = (params: THREE.MeshStandardMaterialParameters) =>
    tracker.trackMaterial(new THREE.MeshStandardMaterial({ roughness: 0.88, ...params }));

  // Warm cream-beige cobblestone tiles with subtle per-tile tonal variation.
  const floorMats = [0xffffff, 0xf5ead5, 0xebddc2].map((color) => mat({ map: cobbleTex, color }));
  const stone = mat({ map: wallTex, color: 0xf7efe0 });
  const stoneShadow = mat({ map: wallTex, color: 0xcab898 });
  const grass = mat({ map: grassTex, color: 0xb7d47c });
  const sand = mat({ color: 0xc69458 });
  const sandDark = mat({ color: 0xa67642 });
  const earth = [0x59341e, 0x422517, 0x2d1812].map((color) => mat({ color }));
  const wood = mat({ color: 0x4f321f });
  const roofWood = mat({ color: 0x5c3a23 });
  const crateMat = mat({ color: 0x875a34 });
  const darkInterior = mat({ color: 0x1e1612 });
  const pineTrunk = mat({ color: 0x4d311c });
  const pine = mat({ color: 0x2d5432 });

  const addBox = (
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    castShadow = true,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(tracker.trackGeometry(new THREE.BoxGeometry(w, h, d)), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.raycast = () => {};
    group.add(mesh);
    return mesh;
  };

  // Courtyard floor keeps the tactical grid raycastable while the scenery stays decorative.
  for (let y = 0; y < options.gridSize; y++) {
    for (let x = 0; x < options.gridSize; x++) {
      const tile = new THREE.Mesh(tileGeo, floorMats[(x * 3 + y * 7) % floorMats.length]);
      tile.position.copy(world({ x, y }, options.gridSize));
      tile.position.y = -TILE_HEIGHT / 2;
      tile.receiveShadow = true;
      tile.userData = { kind: 'tile', gridCoord: { x, y } } satisfies TileRayUserData;
      group.add(tile);
      tileMeshes.push(tile);
    }
  }

  // Helper to place a stepped hillside block with a full-width grassy top.
  const addHillStep = (
    w: number,
    h: number,
    d: number,
    x: number,
    baseY: number,
    z: number,
    grassTop = true,
    cliffMat: THREE.Material = sand,
  ) => {
    addBox(w, h, d, cliffMat, x, baseY + h / 2, z);
    if (grassTop) {
      addBox(w + 0.02, 0.14, d + 0.02, grass, x, baseY + h + 0.07, z);
    }
  };

  // North (back) stepped grassy hillside rising behind the ruined building.
  addHillStep(15.6, 0.72, 2.5, 0, -0.08, -7.25, true, sand);
  addHillStep(13.8, 1.35, 2.2, -0.4, -0.08, -8.3, true, sand);
  addHillStep(9.4, 2.05, 1.8, -1.3, -0.08, -9.15, true, sandDark);
  // Sandy dirt path cutting down the north-east slope.
  addHillStep(2.6, 1.1, 1.9, 4.6, -0.08, -8.0, false, sand);

  // West (left) stepped grassy/sandy terraces flanking the courtyard.
  addHillStep(2.2, 0.62, 13.6, -7.1, -0.08, -0.4, true, sand);
  addHillStep(1.8, 1.15, 10.6, -8.0, -0.08, -1.6, true, sandDark);
  // Sandy ramp/ledge near the front-left corner.
  addHillStep(2.0, 0.34, 3.2, -7.1, -0.08, 4.8, false, sand);

  // East (right) stepped grassy/sandy terraces flanking the courtyard.
  addHillStep(2.2, 0.58, 13.6, 7.1, -0.08, -0.4, true, sand);
  addHillStep(1.8, 1.1, 9.8, 8.0, -0.08, -2.0, true, sandDark);
  // Exposed sandy path on the right terrace.
  addHillStep(1.9, 0.72, 3.4, 7.25, -0.08, 2.2, false, sand);

  // Dark-brown stratified earth skirt beneath the entire diorama plateau.
  addBox(16.6, 0.16, 16.8, stoneShadow, 0, -0.16, -0.9, false);
  for (let i = 0; i < earth.length; i++) {
    const width = 16.8 + i * 0.44;
    const depth = 17.0 + i * 0.44;
    const height = [0.36, 0.48, 0.62][i];
    const yCenter = -0.24 - i * 0.46 - height / 2;
    addBox(width, height, depth, earth[i], 0, yCenter, -0.9, false);
  }

  // --- Ruined Dorter Stone Building (center-back of the courtyard) ---
  // Back wall (north): left ruined wing + central-right gable room wall.
  addBox(4.3, 2.25, 0.48, stone, -3.55, 1.125, -2.65);
  addBox(1.5, 2.35, 0.48, stone, 0.25, 1.175, -2.65);

  // West wing side wall with stepped/crenellated ruin silhouette and buttresses.
  addBox(0.5, 2.25, 5.2, stone, -5.45, 1.125, -0.25);
  addBox(0.5, 1.35, 1.4, stoneShadow, -5.45, 0.675, 2.95);
  // Wall buttresses / pilasters on the west wing.
  for (const z of [-2.3, -0.4, 1.5]) {
    addBox(0.24, 2.45, 0.42, stoneShadow, -5.12, 1.225, z);
  }
  // Crenellated / broken stone teeth along top of west & back walls.
  for (const [x, y, z, w, h] of [
    [-5.45, 2.42, -2.4, 0.56, 0.34],
    [-5.45, 2.42, -0.9, 0.56, 0.34],
    [-5.45, 2.38, 0.8, 0.56, 0.26],
    [-4.6, 2.42, -2.65, 0.9, 0.34],
    [-3.1, 2.38, -2.65, 1.1, 0.28],
    [-1.9, 2.15, -2.65, 0.8, 0.28],
  ] as const) {
    addBox(w, h, 0.52, stoneShadow, x, y, z);
  }

  // East gable wing: front doorway facade + windowed east wall + pitched timber roof.
  // Front-right facade (z = -0.35) with timber-framed doorway opening at x = 2.65.
  addBox(1.2, 2.25, 0.46, stone, 1.35, 1.125, -0.35);
  addBox(1.4, 2.25, 0.46, stone, 4.15, 1.125, -0.35);
  addBox(1.6, 0.55, 0.48, stoneShadow, 2.75, 1.98, -0.35);
  // Dark timber doorway posts and lintel.
  addBox(0.2, 1.72, 0.54, wood, 1.98, 0.86, -0.35);
  addBox(0.2, 1.72, 0.54, wood, 3.52, 0.86, -0.35);
  addBox(1.82, 0.2, 0.58, wood, 2.75, 1.72, -0.35);
  // Subtle recessed interior shadow inside the doorway.
  addBox(1.3, 1.62, 0.14, darkInterior, 2.75, 0.81, -0.58, false);

  // East side wall (x = 4.65) with a framed window cutout.
  addBox(0.46, 2.25, 1.1, stoneShadow, 4.65, 1.125, -0.9);
  addBox(0.46, 2.25, 1.1, stoneShadow, 4.65, 1.125, -2.55);
  addBox(0.46, 0.8, 0.65, stoneShadow, 4.65, 0.4, -1.72); // window sill
  addBox(0.46, 0.55, 0.65, stoneShadow, 4.65, 1.98, -1.72); // window lintel
  // Back wall behind the gable room.
  addBox(3.9, 2.25, 0.46, stoneShadow, 2.75, 1.125, -2.95);

  // Stone gable triangle + solid pitched timber roof over the east wing.
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-2.05, 0);
  gableShape.lineTo(2.05, 0);
  gableShape.lineTo(0, 1.45);
  gableShape.closePath();
  const gableGeo = tracker.trackGeometry(new THREE.ShapeGeometry(gableShape));
  const frontGable = new THREE.Mesh(gableGeo, stone);
  frontGable.position.set(2.75, 2.25, -0.11);
  frontGable.castShadow = true;
  frontGable.receiveShadow = true;
  frontGable.raycast = () => {};
  group.add(frontGable);

  const backGable = new THREE.Mesh(gableGeo, stoneShadow);
  backGable.position.set(2.75, 2.25, -3.18);
  backGable.rotation.y = Math.PI;
  backGable.castShadow = true;
  backGable.receiveShadow = true;
  backGable.raycast = () => {};
  group.add(backGable);

  // Two angled timber roof slabs + ridge beam.
  for (const side of [-1, 1]) {
    const roofSlope = new THREE.Mesh(
      tracker.trackGeometry(new THREE.BoxGeometry(2.45, 0.14, 3.35)),
      roofWood,
    );
    roofSlope.position.set(2.75 + side * 1.05, 2.98, -1.65);
    roofSlope.rotation.z = side * -0.6;
    roofSlope.castShadow = true;
    roofSlope.receiveShadow = true;
    roofSlope.raycast = () => {};
    group.add(roofSlope);
  }
  addBox(0.2, 0.2, 3.45, wood, 2.75, 3.68, -1.65);

  // Courtyard wooden crates, low stone steps, and rubble blocks.
  for (const [x, z] of [[-2.6, -0.4], [-1.9, -0.1], [-4.2, -1.6]] as const) {
    addBox(0.66, 0.58, 0.66, crateMat, x, 0.29, z);
    addBox(0.7, 0.08, 0.7, wood, x, 0.55, z);
  }
  addBox(1.1, 0.28, 0.55, stoneShadow, 2.75, 0.14, 0.15);
  addBox(0.55, 0.32, 0.55, stoneShadow, -4.7, 0.16, 2.2);

  // Pine trees seated directly on top of the stepped grass terraces.
  const pinePlacements: Array<[number, number, number, number]> = [
    [-4.6, 2.1, -9.2, 1.15],
    [-2.4, 2.1, -9.0, 0.95],
    [1.8, 1.4, -8.3, 1.05],
    [-8.0, 1.2, -3.8, 1.0],
    [7.2, 0.64, -4.6, 1.0],
    [8.0, 1.15, -1.2, 0.92],
  ];
  for (const [x, y, z, scale] of pinePlacements) {
    const tree = buildTree(tracker, {
      variant: 'pine',
      scale,
      trunkMat: pineTrunk,
      foliageMat: pine,
      worldX: x,
      worldY: y,
      worldZ: z,
    });
    tracker.markNoRaycast(tree.root);
    group.add(tree.root);
  }

  const atmosphere: ScenarioAtmospherePreset = {
    backgroundColor: 0x227887,
    fogColor: 0x3b8e97,
    fogDensity: 0.005,
    ambientColor: 0xe6decb,
    ambientIntensity: 0.78,
    hemiSkyColor: 0x7ad0dc,
    hemiGroundColor: 0x5c412c,
    hemiIntensity: 0.78,
    dirLightColor: 0xffe6ba,
    dirLightIntensity: 1.9,
    dirLightPosition: [11, 17, 8],
    rimLightColor: 0x56c3d2,
    rimLightIntensity: 0.55,
    pointLights: [],
  };

  return {
    group,
    tileMeshes,
    obstacleMeshes,
    occluders: [],
    animatedObjects: [],
    atmosphere,
    update: () => {},
    dispose: () => tracker.dispose(),
  };
}
