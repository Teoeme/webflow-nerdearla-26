# Racebook — visual identity

Dark, almost monochrome, with one electric blue for emphasis: a futuristic gym. Few colors
and no in-between shades: if a new color seems necessary, the design is wrong first.

## Color

Dark only. There is no light theme.

| Token | Value | Use |
|---|---|---|
| `background` | `#0B0C0E` | Page background |
| `surface` | `#1A1D22` → `#0D0E11` | Cards and panels: gradient from dark gray (top left) to black |
| `field` | `#0D0E11` | Input fill |
| `line` | `#22252A` | Dividers, input borders |
| `glow` | `#3D7BFF` at 22% | Neon border of cards and panels |
| `text-muted` | `#8B9099` | Secondary text, labels, metadata |
| `text` | `#EEF0F3` | Primary text |
| `accent` | `#3D7BFF` | Emphasis: primary action, links, active state, key numbers |
| `on-accent` | `#0B0C0E` | Text on an `accent` fill |
| `medal-gold` | `#D4AF37` | Gold medal badge only |
| `medal-silver` | `#B8BEC6` | Silver medal badge only |
| `medal-bronze` | `#C08457` | Bronze medal badge only |

Rules:

- `accent` is scarce: one primary action per screen, plus active states and key numbers.
- Text on `accent` fills uses `on-accent` (dark), not white: white on this blue fails contrast.
- Medal colors appear only on medal badges, never as decoration.
- Hover and pressed states change opacity or border, not the color.
- A rejected or destructive action is a neutral outline button. There is no red.

## Typography

One family: **Archivo** (Google Fonts, variable: weight, width and italic). Its width axis
gives the condensed, athletic display style and a normal body from the same file.

| Role | Setting |
|---|---|
| Display (wordmark, page titles, big numbers) | Italic, weight 800–900, width 75, uppercase, tight tracking |
| Heading | Italic, weight 700, width 87.5 |
| Body | Normal, weight 400, width 100 |
| Label | Normal, weight 600, width 100, uppercase, wide tracking, small size |
| Metrics (times, pace, distance) | Tabular numbers (`font-variant-numeric: tabular-nums`) |

Load it with `next/font/google` (`Archivo`, `axes: ["wdth"]`, `style: ["normal", "italic"]`),
never from a runtime `<link>`.

## Logo

The wordmark is the word **RACEBOOK** set in the display style: Archivo italic, weight 900,
width 75, uppercase, tracking `-0.02em`. The italic gives the forward slant; do not add an
extra CSS skew.

- Default: `text` color on `background`.
- Emphasis version (landing, empty states): `accent` color.
- No icon, no box, no gradient.

## Shape

- Radius: `4px` for everything (buttons, inputs, cards, photos). Sharp and sporty.
- Cards and panels: `surface` gradient, `1px` border in `glow`, and a faint outer glow
  (`shadow-glow`). The neon must be barely noticeable; if it reads as a glowing box, it is
  too strong.
- Inputs: flat `field` fill with a `1px` border in `line`; the border turns `accent`
  on focus.
- Dividers inside a card use `line`. No drop shadows other than the glow.

## Tailwind v4 tokens

Paste into `src/app/globals.css`. Tailwind generates `bg-background`, `text-accent`,
`border-line`, `border-glow`, `bg-surface`, `shadow-glow`, `rounded-sm`, etc. from these.

```css
@import "tailwindcss";

@theme {
  --color-background: #0b0c0e;
  --color-field: #0d0e11;
  --color-line: #22252a;
  --color-glow: rgb(61 123 255 / 0.22);
  --color-text-muted: #8b9099;
  --color-text: #eef0f3;
  --color-accent: #3d7bff;
  --color-on-accent: #0b0c0e;
  --color-medal-gold: #d4af37;
  --color-medal-silver: #b8bec6;
  --color-medal-bronze: #c08457;

  --font-sans: var(--font-archivo);
  --radius-sm: 4px;
  --shadow-glow: 0 0 24px -12px rgb(61 123 255 / 0.35);
}

@utility bg-surface {
  background-image: linear-gradient(160deg, #1a1d22 0%, #0d0e11 100%);
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-sans);
}
```
