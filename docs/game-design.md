# Game Design

This document describes the V2.2 rules, the current baseline version. Exact numbers come from `src/config/gameConfig.ts`; if there is any discrepancy, the config file takes precedence. The alternating activation system is detailed in `docs/turn-system.md`.

## Overview

Four heroes face six enemies across five distinct types in a 12×12 medieval arena. Teams alternate **individual activations**: one unit acts at a time (movement and attack/skill, in either order), once per round. Whoever eliminates the opposing side wins.

## Board and Obstacles

- 12×12 grid. Columns run A through L (`x` 0..11) and rows 1 through 12 (`y` 0..11).
- A cell holds at most one **living** unit. Corpses and empty cells allow passage.
- Every obstacle blocks movement. Only walls (`wall`) and pillars (`pillar`) block line of sight.
- The arena features a central wall on row 7 (`y = 6`) with two passages (west gate at C7–D7 and east passage at I7), full-cover pillars, and crates/barrels as low barriers (see `OBSTACLES` in `src/config/gameConfig.ts`).

## Heroes

| Class | HP | Movement | Damage | Range | Skill | Starting Position |
|---|---|---|---|---|---|---|
| Knight (`knight`) | 10 | 3 | 2 | 1 | Runic Strike | E2 (`4,1`) |
| Archer (`archer`) | 8 | 3 | 2 | 3 | Marked Shot | C1 (`2,0`) |
| Mage (`mage`) | 7 | 2 | 1 | 2 | Arcane Burst | H1 (`7,0`) |
| Cleric (`cleric`) | 9 | 2 | 2 | 1 | Healing Light | G2 (`6,1`) |

## Skills

| Skill | Target | Effect | Range | Area | Cooldown |
|---|---|---|---|---|---|
| Runic Strike | Enemy | 3 damage | 1 | single target | 2 rounds |
| Marked Shot | Enemy | 3 damage | 3 | single target | 2 rounds |
| Arcane Burst | Enemy | 2 damage | 3 | target cell + 4 orthogonally adjacent | 3 rounds |
| Healing Light | Ally | Heals 3 HP (up to `maxHp`) | 3 | single target (includes caster) | 2 rounds |

- Using a skill replaces the basic attack: each hero performs one or the other per activation.
- Damage skills only hurt enemies; `Arcane Burst` does not hit allies inside the area.
- `Healing Light` only heals living allies with `HP < maxHp` (including the Cleric itself) and does not revive the dead.
- Skills with range greater than 1 require line of sight to the target cell.
- Upon use, the skill goes on cooldown. Cooldowns tick down by 1 at the start of each new round (once all living units have activated).

## Enemies

| Type | HP | Movement | Damage | Range | Starting Position |
|---|---|---|---|---|---|
| Goblin Scout (`goblin-scout`) | 4 | 4 | 1 | 1 | K10 (`10,9`) |
| Melee Skeleton (`melee-skeleton`) | 5 | 2 | 1 | 1 | D11 (`3,10`) and I11 (`8,10`) |
| Armored Skeleton (`armored-skeleton`) | 8 | 2 | 2 | 1 | F11 (`5,10`) |
| Skeleton Archer (`skeleton-archer`) | 4 | 2 | 1 | 3 | C12 (`2,11`) |
| Cultist Mage (`cultist-mage`) | 5 | 2 | 2 | 3 | G12 (`6,11`) |

Enemies do not have skills.

## Turns and Alternating Activations

- Matches start in `awaiting_player_choice`, round 1, with `knight-1` selected.
- Each living unit is entitled to **1 activation per round** (`hasActivatedThisRound`).
- In `awaiting_player_choice`, the player selects any eligible living ally. Upon executing the first action (move, attack, or skill), the unit is locked (`player_unit_active`, `activationLocked = true`) until both movement and attack are spent or the player ends the activation (`endPlayerTurn()`).
- When an activation ends, the turn passes to the opposing team if it has any eligible living unit; otherwise it remains with whichever team still has eligible units left.
- When no living units on either team remain eligible, a new round begins (`round += 1`), all actions are refreshed, and skill cooldowns tick down by 1.

## Movement, Combat, and Corpses

- Movement is orthogonal, with no diagonals. Units cannot pass through obstacles or other living units.
- Attack range is measured by Manhattan distance; attacks with range greater than 1 require line of sight (only `wall` and `pillar` block LoS; units and corpses do not).
- When HP reaches 0, the unit dies (`alive: false`, `hp: 0`), but **remains in the unit list and on the grid as a persistent corpse** on the cell where it fell. Corpses do not block movement or LoS, are skipped by the turn scheduler, and cannot be selected, attacked, or healed.

## Enemy AI

Every living enemy follows the same flow: attack if a valid target is in range; otherwise, move up to `moveRange` steps toward an attack position (or close the distance if no attack path exists).

| Type | Target Selection | Movement |
|---|---|---|
| `melee-skeleton` | Strikes lowest-HP hero in range | Takes shortest path to nearest hero |
| `armored-skeleton` | Strikes nearest hero | Among equally close attack cells, chooses the one engaging the most heroes |
| `goblin-scout` | Strikes lowest-HP hero in range | Fast (`moveRange: 4`), prioritizes reaching the most vulnerable living hero (lowest HP) |
| `skeleton-archer` | Shoots lowest-HP hero in range (LoS) | Seeks a firing cell (LoS), preferring distance ≥ 2 from heroes |
| `cultist-mage` | Fires at lowest-HP hero in range (LoS) | Seeks a firing cell (LoS), preferring distance ≥ 2 from heroes |

## Battle End

- Victory: all enemies are defeated.
- Defeat: all heroes are defeated.
- Victory or defeat takes immediate precedence on the killing blow: the turn does not advance and no further activation starts.

## V2.3 (planned, not yet implemented)

The rules below describe V2.3. Only the contracts in `src/shared/types.ts` exist; the engine and UI still follow the sections above. Technical design is in `docs/architecture.md` and tasks are in `docs/implementation-plan.md`.

When V2.3 is implemented, two parts of the sections above will no longer apply: the fixed starting positions in the hero/enemy tables, and the central wall as the sole arena layout.

### Smart Attack

- Clicking an enemy attacks from the hero's current spot if the target is already in range and, for ranged attacks, within line of sight. Movement is not spent.
- If the target is out of range and the hero has not moved yet, the hero walks automatically to a cell from which the attack is valid and immediately attacks.
- The chosen cell is the one with the lowest movement cost. On ties, the closest to the target. If still tied, lowest row then lowest column.
- If no cell within movement range works, nothing happens.
- Before clicking, the game previews the path and destination cell.
- Movement performed by a smart attack cannot be undone, because the attack has already occurred.
- Spending both movement and attack ends the activation, as usual.
- The same rule applies to skills: the hero walks to the cheapest cell from which the target cell becomes valid and casts the skill.

### Undo Move

- After moving a hero, the player can undo the move: the hero returns to its origin cell and can move again.
- Only usable once per activation. Movement performed after undoing is final.
- Only valid while the hero has neither attacked nor used a skill after moving.
- Undoing does not end the activation and does not consume the attack.

### End Turn via Keyboard

- Pressing `E` ends the active hero's activation, matching the "End Turn (E)" button.
- It does nothing during enemy turns, during animations, or after battle end.

### Active Unit Highlight

- The currently acting unit renders at full opacity. All other living units on both teams render at 75% opacity.
- After battle end, all living units return to full opacity.

### Arcane Burst Visuals

- The mage fires a single projectile to the target cell.
- On impact, an explosion covers the target cell and its four orthogonal neighbors.
- All hit enemies take damage simultaneously.
- The rule does not change: 2 damage, range 3, cross area, never harms allies.

### Seeded Random Spawns

- Heroes spawn on randomized cells in the two southern rows (rows 1 and 2). Enemies spawn in the two northern rows (rows 11 and 12).
- No unit spawns on an obstacle or on another unit's cell.
- Randomization uses a seed. The same seed reproduces the same map and positions, which helps with testing and bug reproduction.
- Turn order does not depend on spawn position.

### Maps

- There are three maps, all 12×12. Each new battle picks one, never repeating the previous battle's map consecutively.
- On all maps, the two southern and two northern rows are free of obstacles, and every free cell is reachable.
- The map name is shown in the HUD.

Layout legend: `#` wall and `O` pillar (block movement and sight); `c` crate and `b` barrel (block movement only). Row 12 is at the top and column A is on the left.

**Current Ruins** (`ruinas-atuais`). The V2.2 map: a central wall with a wide gate to the west and a narrow passage to the east.

```text
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . . . O . . c . O . . .
 9  . b . . . . . . . . c .
 8  . . . . . . . . . . . .
 7  # # . . # # # # . # # #
 6  . . . . . . . . . . . .
 5  . . . . . c c . . . . .
 4  . . . O . . . . O . . .
 3  . . . . . . . . . . b .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

**Abandoned Fortress** (`fortaleza-abandonada`). A wide central corridor between two walled wings. The wings offer full cover, but can only be entered through the corridor. Two pillars split the center.

```text
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . . # # . . . . # # . .
 9  . . . . . . . . . . . .
 8  # # # . . . . . . # # #
 7  . . . . c . . c . . . .
 6  . . . . . O O . . . . .
 5  # # # . . . . . . # # #
 4  . . . . b . . b . . . .
 3  . . # # . . . . # # . .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

**Ruined Courtyard** (`patio-das-ruinas`). An open courtyard with scattered wall segments and pillars. Many routes and sparse continuous cover, favoring ranged attacks and flanking.

```text
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . O . . . c . . . . O .
 9  . . . . . . . . # . . .
 8  . . . # # . . . # . . .
 7  . . . . . . O . . . . b
 6  b . . . . O . . . . . .
 5  . . . # . . . # # . . .
 4  . . . # . . . . . . . .
 3  . O . . . . c . . . O .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

The two new layouts are proposals. They were verified by script: zero obstacles in spawn rows and all free cells mutually connected. Each map's balance still needs to be measured in simulated matches.
