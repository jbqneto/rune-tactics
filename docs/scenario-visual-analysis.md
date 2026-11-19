# Visual Scenario Analysis and Modular Architecture (V4)

This document consolidates **Delivery 1** of the visual upgrade for the **Forgotten Swamp (`forgotten-swamp`)** and **Fortress of Bones (`fortress`)** scenarios in Rune Tactics V4, fully preserving the engine contract (`IGameEngine`), flat 12×12 grid (`GridSystem`), 360° orbital camera (`CameraController`), raycasting (`InputManager`), and the stylized low-poly visual identity defined in `docs/art-direction.md`.

---

## 1. Explicit Reference Image Mapping

> [!IMPORTANT]
> **ATTENTION IMPLEMENTATION AGENTS:** The numeric suffixes of the files in `references/scenarios/` are inverted relative to the campaign stage order (`stage-2-swamp` and `stage-3-fortress`). Use exclusively the validated mapping below:

| Reference File | Corresponding Scenario | `mapId` (`gameConfig.ts`) | Campaign Stage (`CAMPAIGN_STAGES`) |
|---|---|---|---|
| `references/scenarios/scenario_02.png` | **Fortress of Bones** | `'fortress'` (`"Abandoned Fortress"`) | **Stage 3** (`stage-3-fortress` — *"Shield Wall"*) |
| `references/scenarios/scenario_03.png` | **Forgotten Swamp** | `'forgotten-swamp'` (`"Forgotten Swamp"`) | **Stage 2** (`stage-2-swamp` — *"Three Bridges of the Mist"*) |

---

## 2. Current Technical Diagnosis (Code & Constraints)

Inspecting `src/game/grid/GridSystem.ts`, `src/config/gameConfig.ts`, `src/rendering/BoardRenderer.ts`, `src/rendering/SceneManager.ts`, `src/rendering/CameraController.ts`, and `src/input/InputManager.ts` revealed the following facts and invariants:

### 2.1 `GridSystem` and Coordinate Mapping
- **`GridSystem` (`src/game/grid/GridSystem.ts`) is strictly flat 2D (12×12):** there is no elevation/height field in `GridCoord`, `ObstacleDef`, or `UnitState`. All 144 playable cells share the exact same logical height (`y = 0` in 3D world space).
- **`BoardRenderer.gridToWorld(coord, y = 0)`** (`src/rendering/BoardRenderer.ts:177-184`):
  - `CELL_SIZE = 1`, `TILE_HEIGHT = 0.16`, `half = 5.5`.
  - `worldX = coord.x - 5.5` → `x = 0` sits at `-5.5` (West); `x = 11` sits at `+5.5` (East).
  - `worldZ = 5.5 - coord.y` → `y = 0` (hero spawn, South) sits at `+5.5`; `y = 11` (enemy spawn, North) sits at `-5.5`.
  - Therefore, the playable board area spans `[-6.0, +6.0] × [-6.0, +6.0]` on the `XZ` plane, with dry tile tops at `y = 0.0` (`tile.position.y = -0.08`).
- **Initial Camera Projection (`CameraController.ts` + `SceneManager.ts`):**
  - `INITIAL_AZIMUTH = Math.PI / 4`, `CAMERA_RADIUS = 20.0`, `CAMERA_HEIGHT_Y = 12.8`, `target = (0, 0.35, 0)`, `frustumSize = 14.8`, `near = 0.1`, `far = 100`.
  - The initial camera sits in the **Southeast (`+X, +Z`)** quadrant looking toward **Northwest (`-X, -Z`)**, with vertical pitch `tan(pitch) = (12.8 - 0.35) / 20.0 = 0.6225` (`~31.9°`).
  - On the default screen (16:9, usable frustum ~`26.3` units wide × `14.8` tall):
    - **Top-left edge** = West border (`x = -6`, `coord.x = 0`).
    - **Top-right edge** = North border (`z = -6`, `coord.y = 11`, enemy side).
    - **Bottom-left edge** = South border (`z = +6`, `coord.y = 0`, hero side).
    - **Bottom-right edge** = East border (`x = +6`, `coord.x = 11`).
    - **Margins around the 12×12 diamond:** ~`4.6` lateral units and ~`2.9` vertical units remain in orthographic projection (world span out to `r ≈ 25–38` within `far = 100`), ideal for outer platforms, towers, gates, cliffs, waterfall, and horizon without encroaching on the grid.

### 2.2 Elevation and Depth Strategy Without Breaking the Grid
1. **Inside the 12×12 grid (`|x| ≤ 6.0`, `|z| ≤ 6.0`):**
   - **Never imply playable elevation or steps inside the 144 cells:** all units (`UnitRenderer.gridToWorld(pos, 0)`), highlights (`BoardHighlights`), and paths (`pathGroup`) stay strictly on the `y = 0` plane.
   - **Rich 3D internal obstacles:** upgrade `wall`, `pillar`, `crate`, `barrel`, and `water` geometries while strictly honoring the rule's visual height envelope (`AGENTS.md` / `art-direction.md`):
     - `wall` and `pillar` (`blocksLos: true`): height between **`1.15` and `1.45`**, base contained inside the cell (`≤ 0.90 × 0.90`).
     - `crate` and `barrel` (`blocksLos: false`): height **`≤ 0.68`**, visually below line of fire.
     - `water` (`blocksLos: false`): recessed (`y = -0.045` water plane, riverbed at `-0.22`), never added to `obstacleMeshes`.
   - **Identified bug in `buildBridgeCell` (`BoardRenderer.ts:678-685`):** currently bridge planks sit at `y = 0.005` with height `0.05` (top at **`+0.030`**), above `BoardHighlights` planes (`y = 0.010` to `0.024`) — hiding range, movement, danger, and hover highlights on `bridgeCells`!
     - **Mandatory fix:** position bridge plank decks with **top at `y = -0.003`** (and support beams submerged at `y < -0.02`), keeping railings only along outer edges adjacent to `'water'` (`x ± 0.44`).
2. **Outside the 12×12 grid (`|x| > 6.15` or `|z| > 6.15`, or `y < -0.16`):**
   - **Elevated platforms, border terraces, and decorative stairs:** live **exclusively outside playable cells** (e.g., starting at `±6.35`), visually connecting the 12×12 courtyard to raised North/West terraces (such as the Gothic Gate & medallion terrace in the Swamp and Watchtower/Gate terrace in the Fortress), with stone stairs descending to board-edge level or out toward the cliff.
   - **Surrounding terrain and horizon:** craggy cliffs (`y` from `-0.16` down to `-12`), extended swamp water basins, waterfall, distant pines/trees, and castle/aqueduct silhouettes on the horizon, plus a 360° cylindrical sky/horizon ring (`r = 38`, `BackSide`, `fog: false`, `raycast = () => {}`).

### 2.3 Raycasting, `userData`, and 360° Camera Occlusion
1. **Inspection of `InputManager.ts:259-263` and `BoardRenderer.ts:578-669`:**
   - `InputManager` runs the raycaster **with `recursive = false`** solely against three lists: `unitRenderer.getUnitHitboxes()`, `board.getObstacleMeshes()`, and `board.getTileMeshes()`.
   - **Current issue found:** in `BoardRenderer.ts`, `pillar`, `wall`, `crate`, and `barrel` meshes added to `this.obstacleMeshes` **lack `userData`**. This violates the `AGENTS.md` rule (*"Raycastable objects must carry an explicit marker in `userData`"*).
   - **Mandatory fix:**
     - Every `tile` in `tileMeshes`: `tile.userData = { kind: 'tile', gridCoord: { x, y } }`.
     - Every solid mesh in `obstacleMeshes`: `mesh.userData = { kind: 'obstacle', obstacleKind: obs.kind, gridCoord: obs.pos }`.
     - Minor ornaments attached to obstacles or water cells (hanging moss, lily pads, flowers, reeds, fine nails/trim) receive `mesh.raycast = () => {}` and **do not** enter `obstacleMeshes`, ensuring the rule's solid silhouette blocks clicks behind internal obstacles without false blocks from foliage.
     - Perimeter and outer-terrain objects **never** enter `obstacleMeshes` or `tileMeshes`, and their children may set `raycast = () => {}`.
2. **Current 360° camera occlusion issue:**
   - **Currently there is NO dynamic azimuth-based hiding system in `BoardRenderer.ts` or `SceneManager.ts`.** In `fortress` (`BoardRenderer.ts:455-497`), walls on the `+X` and `+Z` sides were simply modeled shorter (`0.7`) assuming the initial camera at `π/4`. Orbiting 180° causes the tall `-Z` walls (`1.9`) to visually obscure the board.
   - **Architectural solution (2-Part Automatic Isometric Cutaway):**
     - Every tall out-of-grid piece (wall, gate, watchtower, tent, gothic arches, gnarled tree, nearby pines, border pillars, and tall braziers with top `height > 0.55`) is split into:
       1. **Low base/plinth (`y ≤ 0.45`)**: always visible, preserving perimeter readability and diorama framing across 360°.
       2. **Tall superstructure (`y > 0.45`)**: grouped into a `THREE.Group` registered in `PerimeterOccluder[]`.
     - Pure geometric logic lives in `src/rendering/scenarioOcclusion.ts` (no Three.js and no DOM, 100% testable in Vitest Node).
     - Every frame (`BoardRenderer.update(dt, cameraAzimuth)`), compute `isPerimeterOccluderBlocking(bounds, azimuth)` using actual orthographic projection along `-camDir = (-sin(az), -cos(az))` with pitch slope `tanPitch = 12.45 / 20.0 = 0.6225`. If the piece is on the camera side (`dot(center, camDir) > 0`) and its projection between `y = 0.45` and `y = height` intersects the board square `[-6.2, +6.2]²`, its superstructure automatically gets `visible = false`.

---

## 3. Detailed Visual Analysis of Scenarios

### 3.1 Scenario A: Fortress of Bones — `fortress` (`references/scenarios/scenario_02.png`)

#### A. Composition and Spatial Readability
- **Concept:** Borderland keep atop a craggy rocky plateau at dusk, overlooking a misty valley with a winding river, distant bridge, and horizon castle.
- **Mapping to `fortress` layout in `src/config/gameConfig.ts`:**
  - 12×12 board: weathered cobblestone courtyard with grass/moss tufts along edges and internal tactical cover:
    - `wall` (10 cells): `[2..4, 5]`, `[7..9, 5]`, `[2..3, 7]`, `[8..9, 7]` — two ruined inner wall lines creating a central chokepoint (`x = 5, 6`) and side corridors (`x = 0..1`, `x = 10..11`).
    - `pillar` (4 cells): `[5, 3]`, `[6, 3]`, `[5, 8]`, `[6, 8]` — twin buttresses in the South and North courtyards.
    - `crate` (4 cells): `[0, 5]`, `[11, 5]`, `[4, 8]`, `[7, 8]`.
    - `barrel` (2 cells): `[1, 3]`, `[10, 3]`.
  - **North Perimeter (`z < -6.3`, behind enemies):** Fortified curtain wall with alternating crenellations/merlons, hanging ivy/vines along masonry seams, and a centered **Main Stone Arch Gate** (`x ≈ 0, z ≈ -7.1`) with a half-raised **iron portcullis**, twin crenellated flanking towers, **two large Pedestal Braziers with live fire**, and **two Crimson Banners** (gold sword-and-laurel emblem), revealing a stone road continuing past the gate.
  - **West Perimeter (`x < -6.3`, left flank):** Two-story **Wooden Watchtower** with X-bracing, pyramidal terracotta tile roof, hanging glowing lantern, vertical crimson banner, sharpened wooden palisade stakes at the base, supply stacks of crates/barrels, and a **Crimson Military Tent** on a timber frame beside the Northwest wall.
  - **South (`z > +6.3`) and East (`x > +6.3`) Perimeters:** Low ruined parapet walls, a decorative **small ruined stone arch** along the outer East/South edge, exterior **stone staircases** descending to lower cliff terraces, grass tufts, and tiny red/white accent flowers between flagstones.
  - **Cliffs and Outer Depth Layer:**
    - Faceted rocky cliff faces dropping below the slab (`y = -0.16` down to `-9.5`) on all four sides.
    - **Waterfall on the East cliff (`+X`):** tiered strips of animated translucent water cascading down rocks into mist clouds below.
    - **Horizon:** dark pine clusters along outer plateau rims; valley below with a winding river ribbon, distant arched bridge, layered hills, and a **distant castle silhouette** perched on a cliff; 360° twilight sky ring in the background.

#### B. Materials, Lighting, and Palette (`fortress`)
- **Lighting and Atmosphere:**
  - Twilight slate-blue sky/backdrop (`#24324d`) with soft fog (`FogExp2`, `#2a3650`, density `0.0085`).
  - Warm late-afternoon directional light (`#ffe6bf`, intensity `1.55`) angled to cast crisp wall and tower shadows across the courtyard.
  - Hemisphere light (`#8ec5e8` / `#2c353d`, intensity `0.68`) + ambient (`#94a3b8`, `0.45`) + cool rim light (`#7dd3fc`, `0.50`) to maintain 360° readability with no pure-black faces.
  - Warm `PointLight`s at the two North Gate braziers and West Tower lantern (`#fb923c`, gentle flicker).
- **Structured Palette:**
  - Light floor/wall stone: `#8b887e` / `#737067` (warmer, more weathered than `ruins`'s cool slate).
  - Flagstone seams/moss and low walls: `#4e6936` / `#38522b`.
  - Cliff rock: `#4b5059` / `#323741`.
  - Wood (tower, palisade, crates, barrels): `#6e4728` / `#4f311b`.
  - Watchtower terracotta roof: `#9a3e2e` / `#7c2d22`.
  - Banner and tent fabric: crimson `#8f1d22` with gold trim/emblem `#d4a24c` (outside playable grid!).
  - Iron (portcullis, hoops, braziers): `#2b2f38`.
  - Edge accent flowers: `#c84b31` / `#e2e8f0` (always outside combat cells).

---

### 3.2 Scenario B: Forgotten Swamp — `forgotten-swamp` (`references/scenarios/scenario_03.png`)

#### A. Composition and Spatial Readability
- **Concept:** Ancient gothic ruins half-submerged in a murky lagoon and thick marsh mist, linked by timber bridges and lit by runic braziers.
- **Exact mapping to `forgotten-swamp` in `src/config/gameConfig.ts`:**
  - 12×12 board: grey-green stone tiles coated with damp edge moss, split horizontally down the middle across rows `y = 5` and `y = 6`:
    - `water` (16 cells, `blocksLos: false`): `[0..1, 5..6]`, `[3..4, 5..6]`, `[7..8, 5..6]`, `[10..11, 5..6]`.
    - `bridgeCells` (8 cells, free walkways): west bridge (`x=2, y=5..6`), **central double bridge** (`x=5..6, y=5..6`), east bridge (`x=9, y=5..6`).
    - `pillar` (4 cells, `blocksLos: true`): `[2, 2]`, `[9, 2]`, `[2, 9]`, `[9, 9]` — moss-draped broken gothic pillars.
    - `crate` (4 cells, `blocksLos: false`): `[4, 3]`, `[7, 3]`, `[4, 8]`, `[7, 8]`.
    - `barrel` (4 cells, `blocksLos: false`): `[1, 3]`, `[10, 3]`, `[1, 8]`, `[10, 8]`.
  - **Adaptive Bridges (`bridgeCells`):**
    - Weathered timber planks aligned North–South with recessed deck (`y_top = -0.003`) and pilings/beams driven into the water.
    - **Neighbor-aware railing rule:** short posts and side railings are generated **only along lateral edges (`±X`) adjacent to `'water'` cells**. Thus the central double bridge (`x = 5..6`) forms a single wide causeway with railings only on the left of `x = 5` and right of `x = 6`, faithful to the central bridge in `scenario_03.png` with no barrier down the middle!
  - **North Perimeter (`z < -6.3`, enemy side):**
    - **Main Ruined Gothic Portal** with pointed ogival arch, smaller arched side windows, broken masonry blocks with dense moss, and hanging vines.
    - Raised North-edge terrace with an engraved **Circular Medallion / Runic Rose** on the floor (`CanvasTexture`), **two Crimson Banners** bearing a pale tree emblem, **two lit Braziers**, and a **wide stone staircase** descending to the board border (decorative, outside the grid).
  - **Northwest Perimeter (`-X, -Z`):**
    - **Large Gnarled Ancestral Swamp Tree**, with thick roots gripping mossy stone blocks, twisted canopy, and curtains of hanging moss (*Spanish moss*), paired with a brazier and side stone stairs.
  - **Southwest (`-X, +Z`) and Southeast (`+X, +Z`) Perimeters:**
    - Smaller ruined ogival arch + brazier in the Southwest sector; broken gothic columns and mossy low walls in front/East corners; sinuous branches/roots at far cliff corners.
  - **Continuous Water and Aquatic Flora:**
    - Beneath the 16 `'water'` cells and extending past grid borders (`[-18, +18]`), a **continuous swamp water basin** (`y = -0.045`, semitransparent with animated texture and dark bed at `-0.24`), making the water channel feel natural and continuous around the diorama.
    - Green lily pads, white-pink lotus blossoms, and clumps of cattails/reeds with reddish-brown tips scattered along water-cell edges (with `raycast = () => {}`) and across the outer lagoon.
  - **Outer Depth Layer and Mist:**
    - Half-submerged ancient aqueduct arches and a small ruined bridge in the background (`-Z / -X`).
    - Silhouetted gnarled trees shrouded in fog.
    - Subtle animated low-lying mist layers drifting over the outer lagoon (`y ≈ 0.08`, soft radial-gradient `CanvasTexture` planes, `raycast = () => {}`, `depthWrite = false`, never encroaching on the playable board).

#### B. Materials, Lighting, and Palette (`forgotten-swamp`)
- **Lighting and Atmosphere:**
  - Twilight swamp backdrop/fog (`#132128`, `FogExp2` density `0.015`).
  - Cool mist-filtered directional light (`#d6e6f2`, intensity `1.18`), balanced by hemisphere fill (`#6b9aa8` / `#182924`, `0.62`) and rim light (`#67e8f9`, `0.40`).
  - Strong localized warm contrast from **4 amber-orange `PointLight`s** on the braziers (`#f97316`, organic flicker), casting warm reflections across damp stones and bordering water.
- **Structured Palette:**
  - Weathered gothic stone: `#6c7877` / `#525e5f`.
  - Thick moss (ruin tops, crevices, banks): `#4a6b2f` / `#355022`.
  - Damp wood (bridges, crates, barrels): `#5e412c` / `#402b1c`.
  - Swamp water: `#1b3b3a` (surface), `#0f2424` (deep bed), soft specular reflection (`roughness: 0.14`, `metalness: 0.18`).
  - Lily pads and lotuses: `#3f6e34` (leaf), `#f1e4eb` / `#f9a8d4` (flower).
  - Cattails / reeds: stalk `#3d592a`, rust tip `#8c3b2b`.
  - Ancestral tree trunks and roots: `#42352c`, hanging moss `#5c6e49`.
  - Tree banners: crimson cloth `#7f1d24`, ivory-white emblem `#e7dfd1`.

---

## 4. Reusable Modular Kit Inventory (`src/rendering/scenarios/ScenarioKit.ts`)

All structural pieces and textures shared between `SwampScenario.ts`, `FortressScenario.ts` (and future upgrades to the other 6 maps) are provided by `src/rendering/scenarios/ScenarioKit.ts`.

### 4.1 Resource Management (`ScenarioResourceTracker`)
- `trackGeometry(geo)`, `trackMaterial(mat)`, `trackTexture(tex)`: registers every dynamically allocated resource during `build`.
- `dispose()`: walks and disposes 100% of registered geometries, materials, and textures, preventing leaks on `reset()` or stage changes.
- `markNoRaycast(obj)`: applies `child.raycast = () => {}` recursively for non-interactive decorations (foliage, flowers, reeds, flames, mist, horizon).
- `applyObstacleMetadata(obj, kind, coord, targetList)`: sets `userData = { kind: 'obstacle', obstacleKind: kind, gridCoord: coord }` and appends solid meshes to `obstacleMeshes`.

### 4.2 Procedural Canvas Textures (`CanvasTexture`, seeded deterministic)
All use `THREE.SRGBColorSpace`, `RepeatWrapping` (when tileable), and a hand-painted low-poly style with no baked directional shadows:
1. **`createWeatheredStoneTexture(opts)`**: irregular stone blocks/flagstones with cracked mortar, subtle bevels, and optional moss/lichen flecks (`variant: 'floor' | 'masonry'`).
2. **`createMossTexture(opts)`**: layered organic moss/grass patches with tonal variation and micro-leaves for ruin tops and plateaus.
3. **`createWoodPlankTexture(opts)`**: longitudinal planks with wood grain, knots, plank gaps, and nail heads.
4. **`createBannerTexture(opts)`**: textile banner with subtle cloth folds, V-notched bottom fringe, gold/ivory trim, and Canvas vector emblem (`emblem: 'sword' | 'tree' | 'rune'`).
5. **`createWaterTexture(opts)`**: soft stylized ripples and organic depth/algae variation for `offset.x/y` animation.
6. **`createTerracottaRoofTexture(opts)`**: overlapping curved roof tiles in rows for the watchtower roof.
7. **`createMedallionTexture(opts)`**: circular runic rose/seal carved in stone for the swamp's Gothic Portal terrace.
8. **`createMistSpriteTexture()` / `createHorizonSkyTexture(palette)`**: soft radial gradient for low swamp mist and a continuous 360° panoramic horizon band (fortress sunset / swamp twilight mist).

### 4.3 Reusable Architectural and Natural Blocks

| Category | Factory / Block in `ScenarioKit.ts` | Key Parameters | 360° Occlusion Support |
|---|---|---|---|
| **Base / Plinth** | `createDioramaBase(opts)` | Width, stepped tiers, colors, side rock material | No (`y < 0`) |
| **Staircase** | `createStoneStairs(opts)` | Width, step count, height, stone color + side cheeks | No if `height ≤ 0.55`, else yes |
| **Wall & Battlements** | `createWallSegment(opts)` | Length, height, optional merlons, moss/vines, cutaway mode | Yes (`baseGroup` + `upperGroup`) |
| **Portcullis Gate** | `createPortcullisGate(opts)` | Opening width, arch height, iron portcullis, flanking towers | Yes (fixed pillar bases; arch/towers hideable) |
| **Ruined Arch** | `createRuinedArch(opts)` | Style (`'roman' | 'gothic'`), width, height, hanging moss/vines | Yes (fixed pedestals; upper arch hideable) |
| **Broken Column** | `createBrokenColumn(opts)` | Height, stepped base, fractured top, moss cover | Yes if perimeter and `h > 0.75` |
| **Watchtower** | `createWatchtower(opts)` | X-braced timber frame, railing, terracotta roof, lantern | Yes (fixed palisade/base; tower/roof hideable) |
| **Camp Tent** | `createCampTent(opts)` | Sloped crimson canvas, wood poles, supply piles | Yes (low supplies fixed; canopy hideable) |
| **Banner Stand** | `createBannerStand(opts)` | Pole, crossbar, fabric using `createBannerTexture` | Yes (next to wall/tower or standalone) |
| **Brazier / Torch** | `createBrazier(opts)` | Stone pedestal, iron bowl, multi-layer animated flame | Yes if tall pedestal (`h > 0.75`) |
| **Timber Bridge** | `createBridgeSegment(opts)` | Planks at `y_top = -0.003`, submerged beams, selective L/R rails | No (`y_top ≤ 0.32`) |
| **Internal Obstacles** | `createStyledObstacle(obs, theme)` | Rich low-poly `wall`, `pillar`, `crate`, `barrel` respecting LoS bounds | No (internal grid rule) |
| **Gnarled Tree** | `createGnarledTree(opts)` | Twisted trunk, exposed roots, organic canopy, Spanish moss | Yes (roots/stump fixed; tall trunk/canopy hideable) |
| **Pine Tree** | `createPineTree(opts)` | Asymmetrical tiered cones in dark green shades | Yes if close to board |
| **Aquatic Flora** | `createAquaticCluster(opts)` | Lily pads (notched discs), lotus flowers, reed clumps | No (`raycast = () => {}`) |
| **Cliff / Rock** | `createCliffPerimeter(opts)` | Irregular stepped faceted rock blocks dropping below slab | No (`y ≤ 0`) |
| **Waterfall** | `createWaterfall(opts)` | Tiered planes with animated UVs + base mist | No (`y ≤ 0`) |
| **Horizon & Mist** | `createHorizonRing(opts)` / `createDistantSilhouette(...)` / `createMistLayer(...)` | 360° ring (`r=38`), castle/aqueduct silhouettes, animated mist planes | Yes for tall nearby silhouettes if entering projection |

---

## 5. Modular Architecture and Lifecycle

### 5.1 Boundaries and Dependency Flow

```text
src/config/gameConfig.ts (MAPS, obstacles, bridgeCells, theme)
         │
         ▼
    src/main.ts
         ├──▶ SceneManager.applyAtmosphere(boardRenderer.getAtmosphere())
         ├──▶ BoardRenderer.buildBoard(gridSize, obstacleDefs, options)
         │         ├──▶ src/rendering/scenarios/SwampScenario.ts    (mapId === 'forgotten-swamp')
         │         ├──▶ src/rendering/scenarios/FortressScenario.ts (mapId === 'fortress')
         │         ├──▶ Classic fallback (other 6 maps)
         │         └──▶ ScenarioKit.ts (textures, blocks, dispose tracker)
         └──▶ BoardRenderer.update(dt, cameraController.currentAzimuth)
                   ├──▶ scenarioOcclusion.ts (pure 360° math, Node-testable)
                   └──▶ flame, water, waterfall, and mist animation
```

### 5.2 Strict Separation Rules
- **`src/rendering/BoardRenderer.ts`** handles exclusively:
  - Maintaining `tileMeshes`, `obstacleMeshes`, `gridToWorld()`, `highlightGroup`, and `pathGroup` (`BoardHighlights` intact).
  - Orchestrating `buildBoard()` and `disposeBoardChildren()`, calling `activeScenario?.dispose()` before building the next map.
  - Keeping fallback rendering for the 6 maps without dedicated modules (`ruins`, `courtyard`, `catacombs`, `sanctuary`, `gauntlet`), fixing explicit `userData` on `obstacleMeshes` and `tileMeshes` right away.
  - Updating `PerimeterOccluder` visibility via `update(dt, azimuth)` (zero per-frame object allocations).
- **`src/rendering/scenarios/SwampScenario.ts`** and **`FortressScenario.ts`** handle exclusively:
  - Assembling the themed visual environment (floor, stylized obstacles, water/bridges, 3D perimeter, outer terrain, horizon, atmosphere, and `PerimeterOccluder[]`) using `ScenarioKit.ts`.
  - Implementing `update(dt, elapsed)` for flame flicker, water/waterfall UV scrolling, and mist drift.
  - Implementing `dispose()` by calling `tracker.dispose()`.
- **`src/rendering/SceneManager.ts`**:
  - Keeps the existing fixed pool of 4 `PointLight`s in the scene (avoiding shader recompilation on map switches) and adds `applyAtmosphere(atmosphere?: ScenarioAtmosphere)` to adjust background color, `FogExp2`, directional, hemisphere, ambient, rim light, and positions/colors/intensities of the `PointLight`s at braziers and lanterns.
- **Layer boundaries (`AGENTS.md`):**
  - No file in `src/rendering/` imports `src/game/` or duplicates constants from `gameConfig.ts`.
  - `src/rendering/scenarioOcclusion.ts` neither imports `three` nor accesses the DOM, allowing direct Vitest tests (`tests/scenario-occlusion.test.ts`).

---

## 6. Delegation Plan — Deliveries 2 to 6

Each delivery below runs in clean sequence, keeping `npm run typecheck`, `npm test`, and `npm run build` green at the end of every step.

### Delivery 2 — Modular Foundation, 360° Occlusion, and `ScenarioKit.ts`
- **Target files:**
  - `src/rendering/scenarioOcclusion.ts` *(new — pure)*
  - `tests/scenario-occlusion.test.ts` *(new — Node tests)*
  - `src/rendering/scenarios/ScenarioTypes.ts` *(new)*
  - `src/rendering/scenarios/ScenarioKit.ts` *(new)*
  - `src/rendering/SceneManager.ts` *(targeted edit for `applyAtmosphere` with fixed `PointLight` pool)*
- **Scope:**
  - Implement and Node-test `isPerimeterOccluderBlocking` covering all 4 quadrants (0°, 45°, 90°, 180°, 270°, 315°), camera-side vs. far-side pieces, varied heights, and near vs. far objects.
  - Implement `ScenarioResourceTracker`, the 8 procedural `CanvasTexture` generators, and all modular builders listed in Section 4.3.
  - Ensure explicit `userData` on obstacles and `raycast = () => {}` on ornaments/foliage/effects.
- **Acceptance criteria:** `typecheck`, `test` (including `scenario-occlusion.test.ts`), and `build` passing with zero warnings.

### Delivery 3 — Forgotten Swamp Scenario (`SwampScenario.ts`)
- **Target files:**
  - `src/rendering/scenarios/SwampScenario.ts` *(new)*
- **Scope:**
  - Reproduce the mood and composition of `references/scenarios/scenario_03.png` using `ScenarioKit.ts`:
    - Mossy floor + 16 `'water'` cells + 3 bridges (`bridgeCells`) with deck at `y_top = -0.003` and railings only on edges bordering water (`x=5..6` unified!).
    - Internal obstacles (`pillar`, `crate`, `barrel`) in damp gothic ruin style with explicit `userData`.
    - Perimeter: North Gothic Portal + runic medallion + tree banners + staircase + 2 braziers; Northwest Gnarled Tree + roots + Spanish moss + brazier + staircase; Southwest Arch + brazier; broken columns; continuous outer water basin, lily pads, lotuses, cattails/reeds, distant aqueducts, animated low mist, and 360° horizon ring.
    - Full registration of `PerimeterOccluder`s (North Portal, Northwest Tree, Southwest Arch, tall border columns/trees).
- **Acceptance criteria:** `typecheck`, `test`, and `build` green; complete `dispose()` of all allocated resources.

### Delivery 4 — Fortress of Bones Scenario (`FortressScenario.ts`)
- **Target files:**
  - `src/rendering/scenarios/FortressScenario.ts` *(new)*
- **Scope:**
  - Reproduce the mood and composition of `references/scenarios/scenario_02.png` using `ScenarioKit.ts`:
    - Warm/weathered flagstone floor with moss seams + internal obstacles (`wall` ruins, buttressed `pillar`, braced `crate`, iron-hooped `barrel`) and explicit `userData`.
    - Perimeter: North Wall with merlons, vines, and arched Main Gate with iron portcullis + flanking towers + 2 braziers + 2 sword banners; West Watchtower with terracotta roof, lantern, banner, and palisade + Crimson supply tent; low parapets, small decorative arch, and exterior front staircases; multi-tiered craggy cliffs with animated waterfall on the right; distant valley with river, bridge, castle silhouette, pines, and 360° twilight horizon ring.
    - Full registration of `PerimeterOccluder`s (North Gate/Wall, West Tower, Tent, tall border pines/arches).
- **Acceptance criteria:** `typecheck`, `test`, and `build` green; complete `dispose()` of all allocated resources.

### Delivery 5 — Integration in `BoardRenderer.ts` and `main.ts`
- **Target files:**
  - `src/rendering/BoardRenderer.ts` *(clean refactor to use `SwampScenario` / `FortressScenario` + 360° occlusion + fallback `userData`)*
  - `src/main.ts` *(call `boardRenderer.update(dt, sceneManager.cameraController.currentAzimuth)` in tick and `sceneManager.applyAtmosphere(boardRenderer.getAtmosphere())` in `rebuildBoardForState`)*
- **Scope:**
  - Wire `'forgotten-swamp'` to `buildSwampScenario` and `'fortress'` to `buildFortressScenario`.
  - Fix `userData` on `tileMeshes` (`kind: 'tile'`) and `obstacleMeshes` (`kind: 'obstacle'`) in classic fallback and fix `buildBridgeCell` height.
  - Ensure immediate occlusion update right after `buildBoard` and continuously during camera orbit.
  - Ensure `reset()` and switches between Quick Battle and Campaign call `dispose()` on the prior scenario without leaks.
- **Acceptance criteria:** `typecheck`, `test`, and `build` green; zero errors when cycling across all 8 maps.

### Delivery 6 — Browser Visual QA, 360° Validation, and Regression
- **Verification scope:**
  - Run `npm run typecheck`, `npm test`, and `npm run build`.
  - Open in browser on `forgotten-swamp` (Stage 2) and `fortress` (Stage 3):
    - Visually inspect with orbital camera at `45°`, `135°`, `225°`, `315°`, and initial view, confirming clean cutaway of tall pieces between camera and board.
    - Confirm full legibility of `BoardHighlights` (movement, range, attack, skill area, boss danger, and path) including over Swamp `bridgeCells`.
    - Test raycasting/clicking: selecting cells behind units, blocking clicks behind internal solid obstacles (`wall`, `pillar`, `crate`, `barrel`), and free selection across `'water'`.
    - Perform 10 resets/map switches verifying zero console/WebGL errors and consistent visuals.
