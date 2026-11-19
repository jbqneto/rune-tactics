# Visual Asset Specification

This document defines what every asset must meet to be accepted into the game: format, dimensions, budgets, naming, and acceptance criteria. Visual look is defined in `art-direction.md`. It describes the V3 visual target; nothing here alters `src/`.

## Production Strategy

The decision is documented in `3d-asset-research.md`: hybrid solution.

| Track | What It Is | When to Use |
|---|---|---|
| Imported model | `.glb` file with rig and animations, from a free-license pack (CC0) | characters available in a style-compatible pack |
| Modular Three.js kit | code-assembled primitive model | fallback if `.glb` fails to load; units without an imported model; all scenery and VFX |

Both tracks fulfill the same contract in this document: same scale, same pivot, same orientation, and same animation clip names. Consumers of the model never need to know which track produced it.

Tools unavailable in the local environment (Blender, paid 3D model generators) are excluded from the pipeline. Any `.glb` must arrive ready to load without conversion steps.

## Coordinate System

| Rule | Value |
|---|---|
| Unit | 1 board cell = 1 Three.js unit |
| Vertical axis | `+Y` |
| Pivot | on the ground, at base center: `(0, 0, 0)` |
| Model forward | `+Z` |
| Rest pose | standing upright, centered on pivot, zero offset |
| File scale | 1.0. No hidden scale transforms on child nodes |

The renderer rotates the model around `Y` to face targets and places its pivot at cell center. A model whose pivot is off the floor or whose forward axis differs must be fixed in the asset file, not in code.

An imported model authored at a different scale is normalized once on load via a scale factor declared next to its file path. That factor is the only correction allowed outside the asset file.

## Characters

### Volume

Every character fits inside a cylinder of diameter 0.6. Weapons may extend upward or forward from the cylinder, never more than 0.2 sideways.

| Unit (`UnitType`) | Height | Base Diameter | File |
|---|---|---|---|
| `knight` | 1.05 | 0.55 | `knight.glb` |
| `archer` | 1.05 | 0.45 | `archer.glb` |
| `mage` | 1.10 | 0.50 | `mage.glb` |
| `cleric` | 0.95 | 0.55 | `cleric.glb` |
| `goblin-scout` | 0.80 | 0.45 | `goblin-scout.glb` |
| `melee-skeleton` | 1.00 | 0.45 | `melee-skeleton.glb` |
| `skeleton-archer` | 1.00 | 0.45 | `skeleton-archer.glb` |
| `armored-skeleton` | 1.25 | 0.60 | `armored-skeleton.glb` |
| `cultist-mage` | 1.05 | 0.50 | `cultist-mage.glb` |

File names match `UnitType`, inside `public/assets/models/characters/`.

### Budgets

| Item | Imported Model | Three.js Kit |
|---|---|---|
| Triangles per character | up to 1,500; `armored-skeleton` up to 1,800 | up to 400 |
| Materials per character | up to 3 | up to 6 |
| Texture | one flat-color atlas, up to 512×512, shared where possible | none |
| Bones | up to 30 | N/A |
| File size | up to 400 KB | N/A |
| Compression | none requiring extra decoders | N/A |

The `GLTFLoader` bundled in `three` is the sole loader. Files using Draco, Meshopt, or KTX2 are not accepted because they require extra decoders.

### Imported Model Structure

- Single root node with identity transform only.
- One skinned mesh or a few rigid meshes attached to bones.
- Weapon as a separate node attached to the hand bone with a predictable name (`Weapon`), allowing the renderer to swap or hide it.
- No extra lights, cameras, or scenes embedded in the file.
- Standard glTF materials, no extensions.

### Three.js Kit Structure

- Root group at pivot; an inner body group receiving facing rotation and pose animations.
- A separate weapon pivot for attack swings.
- One material per color, instantiated per unit and never shared between units because opacity and hit-flash vary per unit.
- Flat shading on all materials.
- Invisible click hitbox of `0.75 × 1.25 × 0.75`, tagged in `userData` with the unit ID. Present on both tracks.

### Shared Elements Across Both Tracks

| Element | Specification |
|---|---|
| Base ring | flat ring at 0.02 above floor, outer diameter 0.82; blue, gold, or red per `art-direction.md` |
| Shadow | model casts shadow; ring and VFX do not |
| HP bar | HTML element over the board, 0.25 above model top |
| Opacity | 1.0 on active unit, 0.75 on other living units |

The 75% opacity requires care on imported models: when switching a material to transparent after initial render, mark the material for recompilation and keep `depthWrite` enabled so draw order remains clean.

## Animations

### Normalized Clip Names

Every character exposes these exact six clips with these exact names:

| Clip | Loops | In-Game Duration | Content |
|---|---|---|---|
| `Idle` | yes | free, 2 to 3 s per cycle | subtle breathing, feet planted |
| `Walk` | yes | one cycle per two cells | in-place stride |
| `Attack` | no | 0.34 s | wind-up, strike or shot, recovery |
| `Hit` | no | 0.15 s | brief recoil on taking damage |
| `Death` | no | 0.3 to 0.5 s | collapse to lying pose |
| `Cast` | no | 0.3 to 0.6 s | skill casting gesture |

Rules:

- **No root motion.** All animations happen in place. The renderer moves the unit across the board.
- **Names are the contract.** A pack using different clip names is mapped once on load via a lookup table next to the file path. All other code only knows these six names.
- **Game-controlled duration.** Clips are sped up or slowed down to fit table durations. `Attack` impact timing sits near 60% of the clip.
- **`Death` holds on its final frame** and stops there.
- **Crossfades** between clips use short 0.08 to 0.12 s blends.

### Fallback When a Clip Is Missing

| Missing Clip | Fallback |
|---|---|
| `Cast` | `Attack` |
| `Hit` | white flash and code-driven pose recoil |
| `Walk` | `Idle` with code-driven step hop |
| `Death` | code-driven rotation to lying pose |
| `Idle` | static rest pose |

In the Three.js kit, all six names map to code-driven pose animations with matching durations.

### Engine Event to Clip Mapping

| Event | Unit | Clip |
|---|---|---|
| `unitMoved` | mover | `Walk` during travel, then `Idle` |
| `moveUndone` | mover | `Walk`, faster |
| `unitAttacked` without `skillId` | attacker | `Attack` |
| `unitAttacked` | target | `Hit`, at impact |
| `skillUsed` | caster | `Cast` |
| `unitHealed` | target | green and gold glow, no clip |
| `unitDied` | casualty | `Death` |
| none | all living | `Idle` |

## Mandatory Death Rule

| Team | After `Death` | Ring & HP Bar | Click Hitbox |
|---|---|---|---|
| Ally | stays lying on the ground in its death cell until battle end | hidden | removed |
| Enemy | shrinks and disappears at end of clip | hidden | removed |

- This rule applies to both production tracks.
- It also applies when state arrives with the unit already dead without a death event: dead allies appear lying down, dead enemies do not appear.
- A dead enemy never reappears on subsequent state syncs.
- Allied corpses do not block movement, sight, or clicks, and another unit can stop on the same cell.
- The lying pose preserves the direction the unit was facing.
- Match reset restores pose, scale, visibility, and click hitbox for all units.

## Scenery

All scenery uses the modular Three.js kit. Pieces and dimensions:

| Piece | Dimensions (W × H × D) | Triangles | Material | Blocks Sight |
|---|---|---|---|---|
| Floor tile | 0.93 × 0.14 × 0.93 | 12 | `stone-floor.png`, two shades | — |
| Board slab | grid + 0.6 border, 0.5 height | up to 200 | dark stone, two-tone side cut | — |
| Wall (`wall`) | 0.86 × 1.20 × 0.86 | up to 60 | `stone-wall.png` | yes |
| Pillar (`pillar`) | base 0.84, shaft 0.56, 1.60 height | up to 120 | `stone-wall.png` | yes |
| Crate (`crate`) | 0.70 × 0.60 × 0.70 | up to 60 | wood | no |
| Barrel (`barrel`) | diameter 0.60, height 0.70 | up to 120 | wood and iron | no |
| Torch | post 0.42 × 1.35, brazier and flame | up to 80 | stone, emissive flame | outside grid |
| Banner | 0.5 × 1.4, on pole | up to 30 | blue or crimson cloth | outside grid |
| Perimeter ruin | up to 1.8 height | up to 60 per segment | `stone-wall.png` | outside grid |

Rules:

- **Height encodes the rule.** Sight-blocking obstacles are 1.2 or taller. Movement-only obstacles are 0.7 or shorter. No piece sits between those values.
- **One obstacle per cell,** centered, never spilling into neighboring cells.
- **Every clickable mesh carries a `userData` tag:** tile with cell coordinate, obstacle with obstacle marker.
- **Tall perimeter pieces** hide when positioned between the camera and the board.
- **On map change,** old pieces are removed and their geometries and materials disposed.
- **Shared geometry and materials** across identical scenery pieces.

## Effects

| Effect | Shape | Color | Duration |
|---|---|---|---|
| Ranged attack projectile | 0.11 sphere | by team and class | flight in 60% of 0.34 s |
| Runic Strike | ring arc on target | light blue `#38bdf8` | 0.3 s |
| Marked Shot | arrow, then diamond reticle on target | green `#4ade80` | 0.34 s |
| Arcane Burst | one 0.15 projectile to target cell, then cross explosion | cyan `#22d3ee` and purple `#a855f7` | 0.62 s, impact at 45% |
| Healing Light | ground ring and overhead halo on target | green `#4ade80` and gold `#facc15` | 0.42 s |
| Hit reaction | white emissive flash on target | white | 0.15 s |

- Unlit, transparent materials with `depthWrite: false`.
- Every effect removes its meshes and disposes geometries and materials upon completion.
- A skill is a single animation: projectile, impact VFX, and simultaneous damage to all targets hit.

## Board Highlights

| Highlight | Shape | Height Above Floor |
|---|---|---|
| Reachable, range, target cell | 0.9 × 0.9 translucent plane | 0.012 to 0.02 |
| Path | 0.14-wide ribbon with arrowhead | 0.035 |
| Skill area | translucent purple plane | 0.02 |

Colors are defined in `art-direction.md`. Planes sit at distinct heights to avoid Z-fighting.

## 2D Assets

### Portraits

| Rule | Value |
|---|---|
| Size | 256×256 px |
| Format | PNG, opaque (no transparency) |
| Folder and filename | `public/assets/portraits/<UnitType>.png` |
| Content | three-quarter bust, dark slate background, no text and no frame |
| File size | up to 120 KB |

Current status: six 256×256 PNG portraits exist. `cleric`, `goblin-scout`, and `cultist-mage` are placeholder SVGs and need to be redone as PNGs matching the rest.

### Icons

| Rule | Value |
|---|---|
| Size | 128×128 px, displayed between 22 and 56 px |
| Format | PNG with transparent background, or SVG with 128 viewBox |
| Folder and filename | `public/assets/icons/<name>.<ext>` |
| Content | single silhouette, two tones and one accent, no text and no frame |
| File size | up to 30 KB per PNG; up to 4 KB per SVG |

| Icon | File | Status |
|---|---|---|
| Move | `move` | exists as SVG |
| Attack | `basic-attack` | exists as SVG |
| Undo move | `undo-move` | **missing** |
| End turn | `end-turn` | exists as PNG |
| Runic Strike | `runic-strike` | exists as PNG |
| Marked Shot | `marked-shot` | exists as SVG |
| Arcane Burst | `arcane-burst` | exists as SVG |
| Healing Light | `healing-light` | exists as SVG |

Icons currently mix two styles: painted PNGs and flat vector SVGs. V3 unifies all into one family per `art-direction.md`.

### Textures

| Rule | Value |
|---|---|
| Size | 512×512 px |
| Format | PNG |
| Folder and filename | `public/assets/textures/<name>.png` |
| Content | seamlessly tileable on all four edges, top-down view, uniform lighting, no baked shadows |
| Usage | UV repeat tuned so one flagstone is roughly one cell |

`stone-floor.png` and `stone-wall.png` both exist at 512×512. No new textures are needed.

### Fonts

WOFF2 files in `public/assets/fonts/` for the families defined in `art-direction.md`, free license, only the weights used.

## Scene Budget

| Item | Limit |
|---|---|
| On-screen triangles | 60,000 |
| Draw calls | 150 |
| Shadow-casting lights | 1 |
| Point lights | 4 |
| Shadow map | 2048×2048 |
| Total imported models | 4 MB |
| Total 2D assets | 2 MB |

## Loading

- All models load before the first battle frame. No model swapping mid-battle.
- If a `.glb` fails to load, the unit falls back to the Three.js kit and logs the error to console. The game never lacks a model.
- Model path, scale factor, and clip mapping table are declared in one place alongside unit visual metadata.

## Naming and Folders

```text
public/assets/
  models/characters/<UnitType>.glb
  portraits/<UnitType>.png
  icons/<name>.png | .svg
  textures/<name>.png
  fonts/<family>-<weight>.woff2
```

- Lowercase hyphenated names matching code identifiers (`UnitType`, `SkillId`).
- No version numbers in filenames.

## Acceptance Criteria

For every asset:

- [ ] Source and license logged in `asset-generation.md`.
- [ ] Naming and folder follow this specification.
- [ ] Within file-size and triangle budgets.
- [ ] Passes the consistency checklist in `art-direction.md`.

Additionally for characters:

- [ ] Ground pivot at `(0, 0, 0)`, forward `+Z`, height matching table.
- [ ] All six clips exist with normalized names, or have defined fallbacks.
- [ ] No clip has root motion.
- [ ] Team death rule honored, including after state sync and match reset.
- [ ] 75% opacity without draw-order sorting artifacts.
- [ ] Click hitbox exists while alive and disappears on death.
- [ ] Readable with camera on all four sides.

## Known Gaps

- No `.glb` files exist in the project yet; `public/assets/models/` does not exist.
- Evaluated free packs lack ready-made goblin or cleric models. Those two units start on the Three.js kit or as variants of another model with custom accessories and colors.
- Missing `undo-move` icon.
- Three portraits are placeholders.
