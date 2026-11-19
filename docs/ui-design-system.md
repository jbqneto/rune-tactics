# UI Design System

This document defines the tokens, components, and layout for the V3 visual HUD. The mood comes from `references/ref-v3.png`; base colors and typography come from `art-direction.md`. It describes the target: `src/style.css` and `src/ui/HudManager.ts` do not follow it yet at the time of writing.

The HUD only presents engine state. It never decides rules: every label, count, and button state comes from `GameStateSnapshot`.

## Current State

- `src/style.css` has no CSS variables: roughly 25 colors and a dozen sizes are hardcoded directly in rules.
- System fonts are used.
- There is no turn-order bar.
- The allies panel, active unit card, action bar, and top-right status panel already exist and are reused under the new visual style.
- The undo move button has no icon.

Migration starts by creating the tokens below in `:root` and replacing hardcoded values with them without changing layout. The new layout follows afterward.

## Tokens

### Color

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0f172a` | page background |
| `--color-surface` | `rgba(15, 23, 42, 0.86)` | panels |
| `--color-surface-raised` | `rgba(30, 41, 59, 0.92)` | buttons, list items |
| `--color-surface-hover` | `rgba(51, 65, 85, 0.95)` | hovered item |
| `--color-border` | `rgba(148, 163, 184, 0.35)` | neutral border |
| `--color-border-strong` | `rgba(203, 166, 98, 0.45)` | panel border, antique gold |
| `--color-text` | `#f8fafc` | primary text |
| `--color-text-muted` | `#94a3b8` | labels, secondary text |
| `--color-text-disabled` | `#64748b` | disabled text |
| `--color-gold` | `#facc15` | active unit, primary action |
| `--color-gold-soft` | `#cba662` | hairlines and titles |
| `--color-player` | `#3b82f6` | player team, movement |
| `--color-player-soft` | `#60a5fa` | player highlight |
| `--color-enemy` | `#ef4444` | enemy team, attack |
| `--color-enemy-soft` | `#f87171` | enemy highlight |
| `--color-skill` | `#a855f7` | skill |
| `--color-skill-soft` | `#c084fc` | skill highlight |
| `--color-heal` | `#4ade80` | healing, ally HP |
| `--color-hp-low` | `#f59e0b` | HP below 35% |
| `--color-success` | `#22c55e` | victory, confirm |
| `--color-danger` | `#ef4444` | defeat, error |
| `--color-overlay` | `rgba(9, 13, 20, 0.72)` | modal backdrop |
| `--color-focus` | `#93c5fd` | keyboard focus ring |

Class colors, used on portrait frames and card accents:

| Token | Value |
|---|---|
| `--color-class-knight` | `#3b82f6` |
| `--color-class-archer` | `#22c55e` |
| `--color-class-mage` | `#a855f7` |
| `--color-class-cleric` | `#eab308` |

### Typography

| Token | Value |
|---|---|
| `--font-display` | `'Cinzel', Georgia, serif` |
| `--font-ui` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |

| Token | Size / Line Height | Weight | Usage |
|---|---|---|---|
| `--text-display` | 28 / 34 px | 700 | result title |
| `--text-title` | 18 / 24 px | 700 | game title, map name |
| `--text-heading` | 14 / 20 px | 600 | unit name, panel title |
| `--text-body` | 13 / 18 px | 500 | buttons, body copy |
| `--text-label` | 12 / 16 px | 500 | labels, secondary values |
| `--text-caption` | 11 / 14 px | 600 | badges, counters |

- `--text-display`, `--text-title`, and `--text-heading` use `--font-display`. Others use `--font-ui`.
- Panel titles and badges are uppercase with `0.06em` letter spacing.
- Numbers use `font-variant-numeric: tabular-nums`.
- Minimum text size anywhere in the UI is 11 px.

### Spacing

4 px base unit.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4 px | between icon and small text |
| `--space-2` | 8 px | inside buttons, between list items |
| `--space-3` | 12 px | compact panel padding |
| `--space-4` | 16 px | panel padding, screen margin |
| `--space-5` | 24 px | between groups |
| `--space-6` | 32 px | modal padding |

### Borders, Radii, and Shadows

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4 px | badges, bars |
| `--radius-md` | 8 px | panels, buttons |
| `--radius-lg` | 12 px | modal |
| `--radius-pill` | 999 px | counters |
| `--border-width` | 1 px | default |
| `--border-width-strong` | 2 px | active, selected, focus |
| `--shadow-panel` | `0 6px 20px rgba(0, 0, 0, 0.45)` | panels |
| `--shadow-raised` | `0 2px 6px rgba(0, 0, 0, 0.35)` | buttons |
| `--glow-gold` | `0 0 0 1px rgba(250, 204, 21, 0.6), 0 0 12px rgba(250, 204, 21, 0.35)` | active unit |
| `--glow-player` | `0 0 0 1px rgba(96, 165, 250, 0.5)` | selected action mode |
| `--glow-skill` | `0 0 0 1px rgba(192, 132, 252, 0.5)` | selected skill mode |

### Motion and Z-Layers

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 120 ms | hover, press |
| `--duration-base` | 180 ms | state changes, badges |
| `--duration-slow` | 280 ms | modal and toast entry |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | all transitions |

| Token | Value | Usage |
|---|---|---|
| `--z-healthbars` | 1 | HP bars over the board |
| `--z-hud` | 5 | panels |
| `--z-toast` | 8 | combat toast |
| `--z-modal` | 10 | battle result |

Under `prefers-reduced-motion`, durations drop to zero and nothing slides or pulses.

## States

The same states apply to every interactive component.

| State | When | Treatment |
|---|---|---|
| default | resting | `--color-surface-raised` surface, `--color-border` border |
| `hover` | pointer over enabled element | `--color-surface-hover` surface, function-colored border |
| pressed | during click | shifts 1 px down, no shadow |
| `selected` | chosen action mode (move, attack, skill) | background tinted 35% with function color, strong border, matching glow |
| `active` | currently acting unit | 2 px gold border and `--glow-gold` |
| `disabled` | action unavailable | 0.45 opacity, `--color-text-disabled` text, default cursor, no hover |
| focus | keyboard navigation | 2 px ring in `--color-focus`, 2 px offset |

Rules:

- `selected` is player choice; `active` is game state. The two never share the same color: `selected` uses function color, `active` uses gold.
- `disabled` does not change appearance on hover and does not respond to keyboard input.
- A disabled button explains why in its `title`: "Already moved", "On cooldown: 2 rounds", "Enemy turn".
- State is never communicated by color alone: there is always a label, icon, or distinct border.

## Components

### Panel

Surface `--color-surface`, border `--border-width` in `--color-border-strong`, radius `--radius-md`, shadow `--shadow-panel`, padding `--space-3` by `--space-4`, backdrop blur 6 px. Panel titles use `--text-caption` in `--color-gold-soft`, uppercase.

### Portrait

| Size | Side | Usage |
|---|---|---|
| small | 28 px | enemy list |
| medium | 40 px | allies panel, turn order |
| large | 72 px | active unit card |

Square, `--radius-sm`, 2 px border in team color: `--color-player` or `--color-enemy`. The active unit card uses class color. Active unit: gold border and `--glow-gold`. Defeated unit: greyscale image at 50% opacity.

### HP Bar

6 px tall track, `--radius-sm`, background `rgba(0, 0, 0, 0.5)`. Fill in `--color-heal` for allies and `--color-enemy` for enemies; below 35% of max, `--color-hp-low` for allies. Next to it, `current / max` value in `--text-label` with tabular numerals. Width animates over `--duration-base`.

### Status Badge

`--text-caption`, uppercase, `--radius-sm`, padding `2px 6px`.

| Badge | Rule, in this order | Color |
|---|---|---|
| `DEFEATED` | unit is not alive | `--color-text-disabled` text, dark grey background |
| `ACTING` | id matches `activeUnitId` | dark text over `--color-gold` |
| `DONE` | `hasActivatedThisRound` | `--color-text-muted` text, `--color-border` border |
| `WAITING` | all other cases | `--color-player-soft` text, `--color-player` border |

The badge is derived from the snapshot on every update. The HUD stores no state of its own.

### Button

Height 36 px, `--radius-md`, `--text-body` weight 600.

| Variant | Usage | Appearance |
|---|---|---|
| primary | "Play Again" | `--color-player` background, white text |
| secondary | "Restart" | `--color-surface-raised` background, `--color-border` border |

### Action Button

Used in the action bar. 24 px icon and `--text-body` label; 48 px height; 96 px min width.

| Action | Icon | Function Color | Shortcut |
|---|---|---|---|
| Move | boot | `--color-player` | — |
| Attack | sword | `--color-enemy` | — |
| Skill | unit's skill icon | `--color-skill`; `--color-heal` for healing | — |
| Undo Move | curved arrow | `--color-text-muted` | — |
| End Turn (E) | hourglass | `--color-gold` | `E` |

- The skill button displays the active unit's skill name. When on cooldown, a circular badge in the corner shows remaining rounds.
- The shortcut appears in parentheses in the label and in `aria-keyshortcuts`.
- "End Turn (E)" is separated from the others by a wider gap to prevent misclicks.

### Turn Order Item

Medium portrait with team-colored border. The active item is 20% larger, has a gold border, `--glow-gold`, and a triangular marker above. Not clickable and has no hover state.

### Stat Row

Label in `--text-label` and `--color-text-muted`; value in `--text-heading` with tabular numerals. Used for ATK, MOV, and RNG.

### Action Indicator

Pill with dot and label for "Move" and "Attack": available in `--color-heal`, spent in `--color-text-disabled` with strikethrough text.

### Combat Toast

Short banner at top center, below turn order: `--color-surface`, `--text-body`, `--radius-pill`. Fades in and out over `--duration-slow` and auto-dismisses after 2 s. Pointer-events none.

### Result Modal

`--color-overlay` backdrop with blur. Centered box with `--radius-lg` and `--space-6` padding. Title in `--text-display`: `--color-success` on victory, `--color-danger` on defeat. Modal appears only after the final blow's animation finishes.

### Tooltip

Native `title` attribute on buttons, showing action and disabled reason. No custom tooltip component in this version.

## Layout

### Regions

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐     ┌────────────────────────────────────────┐    ┌────────────┐ │
│ │ Title    │     │   TURN ORDER      ▼                    │    │ Map        │ │
│ └──────────┘     │  [▣] [▢] [▢] [▢] [▢] [▢] [▢] [▢]      │    │ Turn       │ │
│ ┌──────────┐     └────────────────────────────────────────┘    │ Round      │ │
│ │ ALLIES   │              ( combat toast )                     │ [Restart]  │ │
│ │ ▢ name   │                                                   │ Enemies    │ │
│ │   HP ▬▬  │                                                   │ alive 5/6  │ │
│ │   badge  │                                                   └────────────┘ │
│ │ ▢ ...    │                    BOARD                                         │
│ │ ▢ ...    │              (central free zone)                                 │
│ │ ▢ ...    │                                                                  │
│ └──────────┘                                                                  │
│ ┌────────────────┐                                                            │
│ │ ACTIVE UNIT    │   ┌──────────────────────────────────────────────────┐     │
│ │ ▣  name  HP    │   │ [Move] [Attack] [Skill] [Undo]     [End Turn (E)] │     │
│ │ ATK MOV RNG    │   └──────────────────────────────────────────────────┘     │
│ └────────────────┘                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Region | Anchor | Reference Size |
|---|---|---|
| Title | top-left | 248 px wide |
| Allies panel | left, below title | 248 px wide |
| Turn order | top-center | up to 560 px wide, 72 px tall |
| Match panel | top-right | 232 px wide |
| Active unit card | bottom-left | 300 px wide |
| Action bar | bottom-center | fit-content width, 64 px tall |

Screen margin is `--space-4`. Gap between panels in the same column is `--space-2`.

### Turn Order

- **Data source:** `turnOrder`, `turnIndex`, `units`, and `round` from snapshot.
- **Content:** active unit first followed by upcoming units in activation order, up to eight items.
- **Dead units** do not appear.
- **Round wrap:** where the queue crosses the end of `turnOrder`, a thin divider labeled "Round N+1" marks the boundary.
- **Active:** highlighted as described in the component spec; sole item with marker.
- **Team:** blue border for allies, red for enemies.
- **Non-interactive:** items are not buttons. Hovering shows the unit's name via `title`.
- **Update:** on each activation change, items slide left over `--duration-base`.

### Allies Panel

- One entry per hero in unit list order: medium portrait, name, class, HP bar with value, and status badge.
- Acting hero's entry has a gold border.
- Defeated hero has greyscale portrait and empty HP bar.
- **No manual turn switching.** Entries are not clickable, do not change cursor, and have no `selected` state. The acting unit is always decided by turn order.

### Active Unit Card

- Large portrait with class-colored border.
- Name in `--text-heading` and class in `--text-label`.
- HP bar with value.
- Three stats: ATK (damage), MOV (movement), and RNG (range).
- Two action indicators: Move and Attack, available or spent.
- Skill row: icon, name, and status ("Ready" or "Cooldown: N rounds").
- During enemy turns, the card shows the acting enemy with a red border and no action indicators.
- After battle end, the card is empty.

### Action Bar

- Five action buttons in order: Move, Attack, Skill, Undo Move, End Turn (E).
- Selected mode receives `selected` styling. Only one at a time.
- `disabled` conditions:

| Button | Disabled When |
|---|---|
| Move | unit has already moved |
| Attack | unit has already attacked |
| Skill | already attacked, on cooldown, or no valid targets |
| Undo Move | `canUndoMove` is false |
| End Turn (E) | never, during the player's turn |

- All buttons are disabled during enemy turns, during animations, and after battle end. In those cases, a banner above the bar explains why: "Enemy turn".

### Match Panel

Compact, at top-right:

| Row | Content | Source |
|---|---|---|
| Map | map name | `mapName` |
| Turn | "Player" or "Enemies", in team color | `phase` |
| Round | number | `round` |
| Restart | secondary button | — |
| Enemies alive | "5 / 6" counter and a row of small portraits | `units` |

In the enemy portrait row, dead enemies appear greyscale. The currently acting enemy has a gold border.

## Board Free Zone

The board must remain visible and clickable. The free zone is the rectangle between panels:

- starts to the right of the left column and ends to the left of the right column;
- starts below the turn order bar and ends above the action bar.

Rules:

- **No panel enters the free zone.** Only unit HP bars and the combat toast render over it, and neither captures clicks.
- **The board centers in the free zone,** not the viewport. When side columns differ in width, camera framing compensates.
- **Minimum free zone is 640 × 480 px.** Below that, panels shrink according to the responsiveness table.
- **The HUD container does not capture clicks;** only panels and buttons do. Clicking empty space between panels reaches the board.
- **Right-click camera orbit** starts only over the board and continues even if the pointer passes over a panel.

## Responsiveness (Desktop and Mobile Landscape)

The game targets desktop and phones/tablets **in landscape**. Portrait screens narrower than 1024 px, and any window narrower than 560 px or shorter than 300 px, show a "Rotate to landscape" prompt instead of a broken layout. On touch devices that support it (Android Chrome), the prompt and the main menu offer "Play fullscreen in landscape" (Fullscreen API + `screen.orientation.lock`); iOS Safari relies on the prompt only.

**Compact landscape** (`orientation: landscape` and height ≤ 540 px or width ≤ 900 px — e.g. 844×390, 667×375): title card, ally names, enemy list and map row hidden; allies become a portrait rail; unit card reduced to name, HP and skill; action buttons 48 px tall with icon + short label; modals scroll inside the viewport; safe-area insets respected.

**Touch input:** first tap on a reachable cell/target previews the path and shows "Tap again to confirm"; a second tap on the same target in the same mode executes. One-finger drag orbits the camera; long-press cancels the current mode (same as right-click). Renderer pixel ratio is capped at 1.5 on coarse-pointer devices.

| Window Width | Adjustment |
|---|---|
| 1600 px or wider | reference layout |
| 1280 to 1599 px | left column 216 px; unit card 264 px; turn order up to six items |
| 1024 to 1279 px | allies panel shows only portrait, HP bar, and badge at 160 px; enemy portrait row hidden, counter kept; action buttons icon-only; turn order up to five items |

| Window Height | Adjustment |
|---|---|
| 800 px or taller | reference layout |
| 640 to 799 px | title card hidden; unit card single-row; panel padding `--space-2` |
| below 640 px | prompt asking for a larger window |

- Panels never exceed 30% of viewport width or 30% of viewport height combined per side.
- Nothing scrolls. If content doesn't fit, it summarizes per the table.
- Font sizes never shrink with the viewport.
- On resize, board framing recalculates alongside it.

## Accessibility

- Minimum contrast 4.5:1 for text over background; 3:1 for icons and state borders.
- Every button is keyboard-reachable in visual order with a visible focus ring.
- `E` ends the turn. The shortcut is ignored if the button is disabled, on key repeat, with Ctrl/Alt/Meta held, or when focus is inside a text input.
- Decorative portraits use empty `alt` when the unit name appears alongside; standalone portraits carry the unit's name.
- Turn changes and battle outcomes are announced in an `aria-live` region.
- No information relies solely on color: team, status, and mode all have a distinct label, icon, or shape.

## Mapping to Current Code

| Region | Current Element in `HudManager` | Change |
|---|---|---|
| Title | `.hud-title-card` | display font |
| Allies panel | `#hud-hero-roster` | badge and class; no longer interactive |
| Turn order | does not exist | new component, top-center |
| Combat toast | `#hud-combat-feedback` | moves below turn order |
| Match panel | `.hud-turn-card` and `.hud-enemies-card` | merged into one compact panel with alive counter |
| Unit card | `#hud-unit-card` | RNG stat and skill row |
| Action bar | `.hud-action-bar` | undo icon; token-based states |
| Result | `#hud-result-overlay` | appears only after final animation |

## Checklist

- [ ] No color, font size, or border radius hardcoded outside tokens.
- [ ] All five interactive states applied to every interactive component.
- [ ] Turn order matches `turnOrder` and `turnIndex` on every activation change.
- [ ] Badges match snapshot across all four cases.
- [ ] Clicking the allies panel or turn order never changes who acts.
- [ ] No panel overlaps the board at 1024, 1280, 1600, and 1920 px widths.
- [ ] Clicking gaps between panels reaches the board.
- [ ] Full keyboard navigation with visible focus ring.
- [ ] Reduced motion respected.
