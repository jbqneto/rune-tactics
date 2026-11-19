# Art Direction

This document defines the visual look of Rune Tactics starting from the V3 visual pass. It describes the target; the code in `src/rendering/`, `src/ui/`, and `src/style.css` is still on the previous look at the time of writing. Dimensions and formats for each asset are in `visual-asset-specification.md`, and UI specifications are in `ui-design-system.md`.

## Scope

The visual reference is `references/ref-v3.png`. Mood, palette, lighting, and UI organization come from it. Mechanics **do not**: multi-level terrain, bridges, chests, relics, objectives, hero levels, bosses, and cell effects remain out of scope for V3.

Practical consequences:

- The board remains flat, 12×12 cells. No art element implies playable elevation inside the grid.
- Stairs, bridges, waterfalls, an altar, and banners may exist only as outer scenery, outside the grid cells.
- No enemy is designed as a boss: no unit is larger than the Armored Skeleton.

## Pillars

1. **Tactical readability before beauty.** From any camera angle, the player identifies team, class, and active unit at a glance. If a pretty detail gets in the way of that, it goes.
2. **Tabletop miniature.** The battlefield feels like a diorama on a floating stone slab: chunky forms, toy-like proportions, few materials.
3. **Facets, not textures.** Form comes from flat planes catching light. Textures belong only on floor tiles and walls.
4. **Tight palette.** Cool stone, warm torchlight, and one strong color per class. Red belongs to enemies.
5. **One cohesive set.** Models, portraits, icons, and UI share the exact same colors and signature silhouettes.

## Visual Style

- **Genre:** Stylized low-poly medieval fantasy tactical RPG, viewed from a three-quarter top-down orthographic camera.
- **True low-poly:** low polycount, large readable faces. Flat shading on every face. No smooth shading, no normal maps, no micro-detail.
- **Form before detail:** each object resolves into three to eight simple volumes. A detail only belongs if it changes the silhouette.
- **Subtle imperfections:** slightly jittered vertices and subtle shade variation between neighboring faces so stone and wood never look like plastic.
- **No realism:** no photorealism, fine noise, smooth surface gradients, text baked into textures, or 2D sprites replacing 3D units.

## Palette

### Environment

| Usage | Color | Hex |
|---|---|---|
| Background and fog | midnight blue | `#0f172a` |
| Floor stone, light | slate | `#64748b` |
| Floor stone, dark | deep slate | `#475569` |
| Walls and pillars | blue-slate | `#55627a` |
| Slab and side cross-section | dark stone | `#334155` |
| Crate and barrel wood | brown | `#8b5a2b` |
| Metal fittings | dark iron | `#3f3f46` |
| Moss and foliage | muted forest green | `#2d5a3c` |
| Flame and torchlight | amber | `#f59e0b`, `#fb923c` |
| Allied banner | royal blue | `#2563eb` |
| Enemy banner | crimson | `#b91c1c` |

### Heroes

Each hero has a class color used on at least 40% of the model's visible surface, in its portrait, and on its card accent.

| Class | Class Color | Secondary | Accent |
|---|---|---|---|
| Knight | royal blue `#3b82f6` | steel `#cbd5e1` | antique gold `#cba662` |
| Archer | forest green `#22c55e` | leather `#8b5a2b` | light wood `#d6a86a` |
| Mage | purple `#a855f7` | indigo `#4338ca` | cyan crystal `#22d3ee` |
| Cleric | ivory `#f1f5f9` | gold `#eab308` | sky blue `#7dd3fc` |

### Enemies

All enemies share desaturated bone and iron, with crimson as the sole strong accent color.

| Type | Base | Secondary | Accent |
|---|---|---|---|
| Melee Skeleton | bone `#e5e7eb` | iron `#57534e` | crimson `#ef4444` |
| Skeleton Archer | bone `#e5e7eb` | dark cloth `#44403c` | crimson `#ef4444` |
| Armored Skeleton | iron `#57534e` | bone `#d6d3d1` | crimson `#dc2626`, bronze `#a16207` |
| Goblin Scout | olive skin `#6b8e23` | dark leather `#422006` | crimson scarf `#ef4444` |
| Cultist Mage | wine robe `#4a0d1f` | black `#18181b` | magenta glow `#f43f5e` |

The goblin is matte olive, never the Archer's bright green. The cultist is wine and black, never the Mage's purple.

### Board Highlights

| Meaning | Color | Hex |
|---|---|---|
| Reachable cells | blue | `#3b82f6` |
| Path and selection | yellow | `#facc15` |
| Destination under cursor | green | `#22c55e` |
| Attack range | soft red | `#f87171` |
| Attackable target | red | `#ef4444` |
| Skill range and area | purple | `#a855f7` |
| Heal target | light green | `#4ade80` |

These colors are never used on models or in-grid scenery so highlights never blend into objects.

## Visual Team Treatment

Team affiliation is communicated through four redundant cues so it works even with a rotated camera and for color-blind players:

| Cue | Allies | Enemies |
|---|---|---|
| Temperature | cool, saturated jewel tones | desaturated bone and iron, with crimson |
| Base ring | blue `#3b82f6`; gold `#facc15` when active | red `#ef4444` |
| HP bar | green | red |
| Portrait frame | blue or gold | red |

The currently acting unit appears at full opacity with a brighter gold or red ring. All other living units render at 75% opacity.

## Character Proportions

- **Three-head figurine.** The head accounts for roughly one third of total height. Hands and weapons are exaggerated by ~30%.
- **Reference height:** 1.05 units for a hero on a 1.0 cell. Each unit fits inside a 0.6-diameter cylinder so it never spills into neighboring cells.
- **Solid footing:** wide base and short legs. No spindly limbs that vanish at distance.
- **Weapon always visible from above:** held beside or above the body, never hidden behind it.

| Unit | Height | Width | Posture |
|---|---|---|---|
| Knight | 1.05 | wide | upright, broad shoulders |
| Archer | 1.05 | narrow | nimble, one foot forward |
| Mage | 1.10 with hat | medium, conical | upright, staff at side |
| Cleric | 0.95 | wide | stocky |
| Goblin Scout | 0.80 | narrow | hunched forward |
| Melee Skeleton | 1.00 | narrow | slightly hunched |
| Skeleton Archer | 1.00 | narrow | upright |
| Armored Skeleton | 1.25 | very wide | heavy, large pauldrons |
| Cultist Mage | 1.05 | medium, conical | hunched, arms tucked in |

## Shapes and Silhouettes

Each unit has a signature silhouette, recognizable in flat black and mirrored in its portrait.

| Unit | Signature Shape | Weapon | Must-Have Detail |
|---|---|---|---|
| Knight | broad-shouldered trapezoid with kite shield | straight sword | blue crest on helm and dark visor |
| Archer | pointed hood and vertical longbow | bow and diagonal quiver on back | green hood draped over shoulders |
| Mage | tall cone: pointed hat/hood and floor-length robe | staff taller than head | lit cyan crystal atop the staff |
| Cleric | short, wide block with tabard | mace or short hammer | gold chest emblem and ivory hood |
| Goblin Scout | small hunched body with horizontal pointed ears | dagger | crimson scarf around neck |
| Melee Skeleton | thin torso with visible ribs | short sword and round shield | dark eye sockets and crimson-striped shield |
| Skeleton Archer | thin torso, no shield | bow | tattered cloth hood |
| Armored Skeleton | largest bulk on the board: pauldrons and horned helm | two-handed axe | iron plates with bronze rivets |
| Cultist Mage | closed-hood cone, faceless | orb floating before hands | two glowing magenta eyes inside the hood |

Pairs that must read clearly apart from afar:

- **Mage and Cultist Mage:** Mage is bright, upright, with a tall staff; Cultist is dark, hunched, staffless.
- **Archer and Skeleton Archer:** full green hood vs. thin bone silhouette.
- **Knight and Armored Skeleton:** shield and blue vs. horns, iron, and larger bulk.
- **Cleric and Knight:** Cleric is shorter, ivory, shieldless.

## Scenery

- **Floating slab.** The board rests on a stone block with a visible cross-section, like a tabletop diorama. The cut shows stone strata in two tones.
- **Ruined courtyard.** Irregular flagstones, broken walls, arches, and pillars. Moss in crevices and along wall bases.
- **Obstacles readable by height.** Walls and pillars are tall (1.2 or more) and block sight. Crates and barrels are low (0.7 or less) and do not block sight. Height visually encodes the rule and must never be broken by decoration.
- **Out-of-grid framing.** Banners, torches, tall ruins, and foliage sit outside the 144 cells. Because the camera orbits 360°, any tall perimeter piece hides when positioned between the camera and the board.
- **Three maps, one kit.** All three layouts use the same prop kit. Differences come from arrangement, stone tint, and banner colors.

## Lighting

Mood is a clear moonlit night in ancient ruins: cool light from above, warm torchlight below.

| Light | Role | Color | Notes |
|---|---|---|---|
| Primary directional | moonlight, defines planes and casts shadows | cool white `#eef4ff` | high, angled from side; soft shadow |
| Ambient and hemisphere | fill | slate blue `#9fb4d4` | no face goes pure black |
| Torches, four point lights | warmth and corner accents | amber `#f59e0b` | subtle flicker, never pulsing |
| Emissives | magic and eyes | per class | small, localized |

Rules:

- **Warm/cool contrast.** Every face reads as lit by moonlight or warmed by torchlight. This gives facets volume.
- **Readable from every angle.** The camera orbits, so fill lighting must keep the shadowed side legible.
- **Shadows as anchors.** Every unit casts a shadow onto the floor. Without shadows, figurines appear to float.
- **Distance fog only.** Fog hides the edge of the world, never the board.
- **True colors.** Neutral tone mapping, no blown-out highlights. Magic glow comes from emissive materials without heavy post-processing.

## Materials

Standard material is `MeshStandardMaterial` with `flatShading: true`.

| Surface | Roughness | Metalness | Texture | Emissive |
|---|---|---|---|---|
| Cloth, leather, skin | 0.85 to 0.95 | 0 | no | no |
| Bone | 0.75 | 0 | no | no |
| Wood | 0.85 | 0 | no | no |
| Wall and pillar stone | 0.90 | 0 | `stone-wall.png` | no |
| Floor | 0.85 to 0.90 | 0.05 | `stone-floor.png` | no |
| Steel and iron | 0.40 to 0.55 | 0.45 to 0.60 | no | no |
| Gold and bronze | 0.45 | 0.60 | no | no |
| Crystal, orb, eyes | 0.30 | 0 | no | yes, intensity 1.0 to 2.0 |
| Flame | — | — | no | full color, unlit |

Rules:

- **Flat shading on everything** that is a character or prop, including the floor despite its texture.
- **Color by material, not texture.** Characters do not use painted textures. Imported models may use a flat-color palette atlas provided it has no baked shadows.
- **Per-face shade variation** of up to 4% lightness on stone, wood, and cloth to break uniformity. No variation on metal or class colors.
- **Meaningful emissives only:** Mage crystal, Cultist eyes and orb, Cleric emblem when healing, flames, skill VFX.
- **No model transparency** except the 75% inactive-unit rule and VFX.
- **Only two textures**, tileable, with uniform diffuse lighting and no baked shadows.

## Typography

| Role | Family | Usage |
|---|---|---|
| Display and titles | Cinzel, serif | game title, map name, unit name, battle result |
| Interface | Inter, sans-serif | labels, buttons, numbers, body text |

- Fonts are self-hosted by the project, with system stacks as fallback. Zero external runtime font requests.
- HP, damage, and cooldown numbers use tabular numerals so digits never jitter when updating.
- Titles in uppercase with wide tracking. UI copy in sentence case.
- No text smaller than 11 px. No text baked inside images.

## Interface Style

- **Dark stone and metal panels.** Near-opaque midnight blue background, thin antique-gold border, subtly rounded corners. Evokes iron plates and dark wood without photographic textures.
- **The UI frames, never covers.** Panels hug screen edges. The center of the screen belongs to the board.
- **Color with function.** Blue for player and movement, red for enemies and attack, purple for skills, gold for the active unit and primary action.
- **Portraits as identity.** Every reference to a unit includes its portrait.
- **Restrained motion.** Short transitions, no bouncing, no gratuitous pulsing glows.

## Icons

- **Single family.** All action and skill icons share the same visual treatment. Currently painted PNGs and flat SVGs are mixed; V3 unifies them.
- **Single centered silhouette,** legible at 24 px, occupying ~70% of the frame.
- **Two tones plus one accent.** Accent color follows function: blue for move, red for attack, class color for skill, grey for undo, gold for end turn.
- **No text, no frame, no own background.** The button provides the frame.
- **Same angle and lighting** on all icons: front-facing, top-left lighting.
- **Visual vocabulary:** boot for move, sword for attack, curved arrow for undo, hourglass for end turn, and each skill's gesture (runed blade, aimed arrow, cross burst, healing light cross).

## Portraits

- Three-quarter bust facing toward screen center.
- Same lighting as models: cool key light on one side, warm rim light on the other.
- Flat dark slate background, no scenery.
- Signature silhouette and class color appear clearly in frame.
- Same stylized low-poly look as the 3D models. The three placeholder portraits (Cleric, Goblin Scout, and Cultist Mage) are redone to match.

## Animation

| Rule | Value |
|---|---|
| Move step | 0.12 s per cell, with slight hop |
| Melee strike | 0.34 s: wind-up, lunge, recovery |
| Ranged shot | 0.34 s, with impact around 60% |
| Skill | 0.3 to 0.6 s, with VFX at impact |
| Hit reaction | 0.15 s: white flash and brief recoil |
| Death | 0.3 to 0.5 s |
| Facing rotation | shortest arc, ~0.2 s |

- **Anticipation and weight.** Every strike has a short wind-up before and settle after.
- **One action at a time.** Combat animations queue sequentially; input locks while playing.
- **Never sluggish.** No single action exceeds 1.2 s. It's a tactical game; players shouldn't wait on animations.
- **Subtle living idle.** Low-amplitude breathing on all units; slightly stronger on the active unit.
- **Damage lands on impact,** never earlier: HP bar, flash, and floating number trigger together.
- **Death by team.** Allies fall and remain lying on the ground. Enemies fall, shrink, and vanish.
- **No camera shake** and no slow motion.
- **Reduced motion.** With system preference enabled, hops and flashes are toned down without changing action durations.

## Effects

- Simple geometric shapes: rings, shards, spheres, crosses. No photographic particles.
- Effect color matches class or function: cyan and purple for Mage, green for Archer, light blue for Knight, green and gold for healing, red for enemy attacks.
- Every effect disappears in under 0.6 s and leaves zero residue on the board.

## Asset Consistency Checklist

A new asset only ships if it passes every item:

- [ ] Uses only colors from the tables in this document.
- [ ] Solid black silhouette clearly identifies the unit or prop.
- [ ] Reads well at 45° and with the camera rotated to all three other sides.
- [ ] Matches the face density and detail level of neighboring assets.
- [ ] Uses flat shading and material values from the table.
- [ ] Contains no baked shadows, text, or branding in textures.
- [ ] Model, portrait, and icon for the same unit share the same signature silhouette and color.
- [ ] Does not imply any unsupported game mechanic.
- [ ] Complies with `visual-asset-specification.md` and is logged in `asset-generation.md` with source and license.

## What to Avoid

- Photorealism, fine noise, smooth shading, and strong specular highlights.
- Red on heroes or on in-grid scenery.
- Bright green on goblins or purple on cultists.
- Tall in-grid decoration that is not a real obstacle.
- Elements suggesting elevation, objectives, or bosses.
- Mixing different icon families side by side.
- Text inside images.
