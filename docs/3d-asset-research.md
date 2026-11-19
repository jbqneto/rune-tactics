# Rune Tactics V3 — Comparative 3D Asset Production Research

## 1. Local Environment Discovery
- **Blender:** not installed in the environment (`blender: command not found`), ruling out a local CLI rigging/conversion pipeline (`.blend`/`.fbx` → `.glb`).
- **AI 3D Tools (Meshy / Tripo / Hyper3D Rodin):** no access or API keys configured in the environment; require paid subscriptions (~$20–$30/month) for commercial use without CC BY restrictions.
- **Three.js + `GLTFLoader` + `AnimationMixer`:** already available via the `three` package installed in the project.
- **2D Generation (`image-generator`):** available via Gemini in Antigravity (with limited quota on `gemini-3.1-flash-image`), already used for portraits, textures, and icons in `public/assets/`.

---

## 2. Strategy Comparison Table

| Tool / Library | Asset Type | Quality | Three.js Compatibility | Available Animations | License | Cost | Integration Effort | Pros | Limitations | Recommendation |
|---|---|---|---|---|---|---|---|---|---|---|
| **KayKit (GitHub CC0)** (`Adventurers 1.0`, `Skeletons 1.0`, `Dungeon Remastered 1.0`) | Rigged characters + low-poly scenery/props | High (cohesive style, ideal for isometric tactical RPG) | Native `.glb` / `.gltf` (`GLTFLoader`) | Yes (embedded in `.glb`, `AnimationMixer`-compatible) | **CC0 1.0** (free commercial use, no attribution required) | Free | Low–Medium | Consistent style across heroes/skeletons/scenery; lightweight texture atlas; web-ready `.glb` | No native Goblin or Cleric with those exact names (adaptable via variants/accessories or Three.js fallback) | **Recommended (Primary)** |
| **Quaternius** | Low-poly characters and creatures | High | Requires conversion (`.fbx`/`.blend` → `.glb` or third-party sources) | Yes (Universal Animation Library) | **CC0 1.0** | Free | Medium–High (no local Blender) | Wide variety of classes and monsters | Official distribution in `.fbx`/`.blend` | Secondary (if converted `.glb` is needed) |
| **Kenney.nl** | Modular scenery kits and basic characters | Medium–High (clean/toy-like) | `.glb`/`.fbx`/`.obj` | Limited in older packs | **CC0 1.0** | Free | Low | Great modularity for props/dungeons | Less expressive for rigged heroes | Optional for props |
| **Poly Pizza / Sketchfab** | Standalone community models | Variable (inconsistent) | `.glb`/`.gltf` | Variable | Mixed (CC-BY, CC0, non-commercial — requires item-by-item check) | Free / Paid | High (scale/style/license normalization) | Large catalog | Inconsistent style across authors; licensing risk | Avoid for main cast |
| **Blender (Procedural / Scripting)** | Custom meshes and rigs | Medium (if script-generated) | Exports `.glb` | Manual | Custom | Free | Very High | Full control | **Unavailable in environment** (`blender` not installed) | Discarded for V3 |
| **Meshy / Tripo / Hyper3D Rodin** | Text-to-3D / Image-to-3D | Medium–High (variable topology) | Exports `.glb` | Experimental auto-rigging | Free = CC BY 4.0 / Non-commercial; Pro = ~$20–$30/mo | Paid for commercial use | Medium–High | Fast for one-off props | No access in environment; paid; inconsistent topology/rigs | Discarded for V3 |
| **Hybrid Solution (Strategy D)** | **CC0 GLB (KayKit)** + **Three.js Fallback/Accessories/Scenery** + **AI 2D Assets** | High and consistent | Native (`GLTFLoader` + `AnimationMixer` + Three.js) | `Idle`, `Walk`, `Attack`, `Hit`, `Death`, `Cast` | **CC0 1.0** + Custom | Free | Medium | Combines rigged animated characters, safe fallback if GLB fails, Three.js lighting/VFX, and HUD with 2D portraits/icons | Requires `CharacterVisualController` to normalize scale/pivot/clips | **CHOSEN STRATEGY** |

---

## 3. Architectural Decision
Adopt **Strategy D (Hybrid Solution)**:
1. **Main 3D characters as CC0 `.glb` (KayKit Adventurers & Skeletons)** loaded via `GLTFLoader` + `AnimationMixer` through `CharacterVisualController`.
2. **Automatic procedural fallback** (preserving the V2 low-poly Three.js models) if any `.glb` fails to load or for specific variants (e.g., `goblin-scout`, `cleric` when using an adapted base with distinct accessories/colors).
3. **Modular Three.js scenery and VFX** using the already generated `stone-floor.png` and `stone-wall.png` textures, warm-lit torches, arches/pillars/crates/barrels, and native particles.
4. **Interface (V3 HUD)** using existing 2D portraits and icons + full layout and design system upgrade (`docs/ui-design-system.md`).
