# Rune Tactics V2 — Art Direction Guide

## 1. Visual Identity
- **Style:** Stylized low-poly medieval fantasy tactical RPG, clean hand-painted indie game aesthetic (referencing `references/ref-v2.png`).
- **Readability First:** Isometric top-down legibility is mandatory. Silhouettes, class colors, and team indicators must remain immediately distinguishable at a glance.

## 2. Color Palette
- **Player Team:**
  - Knight: Polished steel silver, royal blue (`#3b82f6`), muted gold trim.
  - Archer: Forest/emerald green (`#22c55e`), warm leather brown, wood bow.
  - Mage: Arcane purple (`#a855f7`), gold trim, glowing cyan/violet crystal (`#c084fc`).
- **Enemy Team:**
  - Bone ivory (`#e5e7eb`), weathered dark iron/bronze, crimson red team accents (`#ef4444`).
- **Environment:**
  - Cool slate stone (`#475569`, `#64748b`), mossy crevices, warm torchlight (`#f59e0b`, `#fb923c`), deep midnight dungeon backdrop (`#0f172a`).

## 3. Asset Categories & Standards
- **Character Portraits (`public/assets/portraits/*.png`):** Square 1:1 bust portraits, three-quarter view, warm key light + cool rim light, dark slate background, no text, no frame.
- **Skill & Action Icons (`public/assets/icons/*.png`):** Square 1:1 stylized fantasy RPG icons, bold centered silhouette, high contrast at small UI sizes (40–56px), dark slate/transparent-friendly background, no text.
- **Textures (`public/assets/textures/*.png`):** Seamless, tileable, top-down/orthographic, uniform diffuse lighting, zero baked shadows, consistent stone scale.

## 4. What to Avoid
- Photorealism, noisy micro-detail, embedded text/letters/watermarks, baked directional shadows on textures, or flat 2D sprites replacing 3D units on the board.
