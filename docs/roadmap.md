# Roadmap

V2 is the current version and is complete. V3 and V4 are listed here purely as direction: none of them are implemented yet, and no code should be written to anticipate them without an explicit request.

## V1: Systems Prototype (completed)

Reference: `references/ref-v1.png`.

- 8x8 board with obstacles, one knight against two skeletons.
- Orthogonal movement, melee attack, turns, victory, and defeat.
- In V1.1, movement and attack became usable in either order, and turns started ending automatically when no actions remain.

## V2: Tactical RPG (completed)

Reference: `references/ref-v2.png`. Rules are documented in `docs/game-design.md`.

- Three hero classes: knight, archer, and mage.
- One skill with cooldown per class: Runic Strike, Marked Shot, and Arcane Burst (area of effect).
- Ranged attacks with line of sight. Walls and pillars block sight; crates and barrels only block movement.
- Three skeleton types, each with its own behavior: Melee Skeleton, Skeleton Archer, and Armored Skeleton.
- Multiple units per side, with free selection among heroes.
- Medieval arena with stone floor and walls, ruins, and torches.
- HUD with portraits, action bar, and icons, with assets in `public/assets/`.

These items appeared in the V2 reference and did not make it in. They carry over to V3:

- Boss (War Chief).
- Mission objectives, such as holding the runic altar for 3 rounds.
- Per-unit turn order displayed in a turn bar.
- Hero levels.
- Defensive ability (Guard).
- Terrain types with movement cost and effect.

## V3: Larger Battlefields and Deeper Tactics (planned, not implemented)

Reference: `references/ref-v3.png`.

- The deferred items from V2 listed above.
- Larger maps with multi-level terrain. High ground costs more movement and grants attack and defense bonuses.
- More classes (dwarf cleric) and more enemy types (goblin, enemy mage).
- Defense attribute and additional skills (Shield Wall).
- Cell effects, such as an arcane field that deals damage and applies weakness.
- Items, relics, and chests.
- Hero progression between battles.

## V4: To Be Defined (planned, not implemented)

There is no visual reference for V4. The ideas below are provisional and need confirmation before any planning:

- Campaign with multiple chained missions.
- Saved games.
- Sound and music.
