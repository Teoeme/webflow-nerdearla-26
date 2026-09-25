# 02 · ui · Kit

**Status:** done

## Goal

The brand from `docs/brand.md` is live in code: Tailwind v4 is wired, the tokens and the
`panel` utility exist in `globals.css`, and `src/components/ui/` has the small set of
presentational components that the `results` and `gallery` areas build their screens with.

## Area and branch

- Area: `ui`
- Branch and worktree, created from `develop`:
  ```sh
  git worktree add ../webflow-nerdearla-26-ui -b feat/ui develop
  ```
- All paths below are relative to `racebook/` (the Next.js app).

## Read first

- `AGENTS.md` (parallel work, plans, languages, code standards).
- `docs/brand.md`: the single source of every color, font setting and shape rule. Don't
  invent values; if something is missing there, report it.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

Create or modify only these:

- `postcss.config.mjs` (it has no plugins today, so Tailwind is installed but not running)
- `src/app/globals.css` (replace the scaffold demo CSS completely)
- `src/components/ui/class-names.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/field.tsx`
- `src/components/ui/medal-badge.tsx`
- `src/components/ui/status-pill.tsx`
- `src/components/ui/stat.tsx`
- `src/components/ui/wordmark.tsx`

## Must not touch

- `src/app/layout.tsx`, `src/app/fonts.ts`, `src/app/page.tsx`, `src/components/session/`:
  owned by `platform` (plan 01, runs in parallel). Using `<Wordmark>` in the header is a
  later change in the platform area, not here.
- `src/db/`, `src/i18n/`, `src/session/`, `wrangler.json`, `package.json`.
- `docs/`, `plans/` (except the Status line of this file), `README.md`, `AGENTS.md`.

## Depends on

Plan 01 (platform), for two things only:

- The CSS variable `--font-archivo`, set on `<html>` by `src/app/fonts.ts`. Until 01 merges,
  the font falls back to the browser default; that is expected.
- The types `Medal` and `TransferStatus` from `src/db/types.ts` (exact definitions below).
  `medal-badge.tsx` and `status-pill.tsx` import them. **Rebase on `develop` after plan 01
  is merged, before running the final build.** If 01 is not merged yet when everything else
  is done, stop and report instead of copying the types.

```ts
// src/db/types.ts (provided by plan 01)
export type Medal = "gold" | "silver" | "bronze";
export type TransferStatus = "pending" | "accepted" | "rejected";
```

## Contracts

These are the exact names other plans build against. Don't rename them.

### Rules for every component

- Presentational only: no data access, no cookies, no dictionaries. Every string a user
  reads (labels, badge text) arrives as a prop, already translated by the caller.
- No hooks and no `"use client"`: they render in server components and inside client ones.
- Components that wrap a native element accept that element's props (`...rest`) and a
  `className`, merged with `joinClassNames`. They don't override `type`, `name` or
  `onChange` behaviour.
- Colors, radius and fonts come only from the tokens below. No hex values in components.

### Tailwind wiring (`postcss.config.mjs`)

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`@tailwindcss/postcss` and `tailwindcss` v4 are already in `devDependencies`.

### Tokens (`src/app/globals.css`)

Replace the file with the block in `docs/brand.md` → *Tailwind v4 tokens*, verbatim, then
add the typography utilities below, taken from `docs/brand.md` → *Typography*. Archivo is a
variable font, so its width axis is set with `font-stretch`.

```css
/* Display: wordmark, page titles, big numbers. */
@utility text-display {
  font-style: italic;
  font-weight: 900;
  font-stretch: 75%;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;
}

@utility text-heading {
  font-style: italic;
  font-weight: 700;
  font-stretch: 87.5%;
  line-height: 1.15;
}

@utility text-label {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Times, pace, distance: digits keep their width. */
@utility text-metric {
  font-variant-numeric: tabular-nums;
}
```

Consumers size them with Tailwind (`text-display text-5xl`, `text-heading text-2xl`).

### `src/components/ui/class-names.ts`

```ts
export function joinClassNames(...classNames: Array<string | false | null | undefined>): string;
// joinClassNames("a", isActive && "b", undefined) -> "a b"
```

### `src/components/ui/button.tsx`

```tsx
export type ButtonVariant = "primary" | "outline";

export function Button(
  props: ComponentProps<"button"> & { variant?: ButtonVariant }, // default "primary"
): JSX.Element;

// A link that looks like a button (next/link).
export function ButtonLink(
  props: ComponentProps<typeof Link> & { variant?: ButtonVariant },
): JSX.Element;
```

- `primary`: `bg-accent text-on-accent`. One per screen (brand rule; the caller decides).
- `outline`: transparent, `border border-line text-text`. Also used for reject and any
  destructive action: there is no red.
- Both: `rounded-sm`, `text-label`, same height and padding; hover and pressed change
  opacity or border only; `focus-visible` shows an `accent` outline; `disabled` lowers
  opacity and sets `cursor-not-allowed`.

### `src/components/ui/field.tsx`

```tsx
// Label + control + optional hint, stacked. The label is <label htmlFor={htmlFor}>.
export function Field(props: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}): JSX.Element;

export function Input(props: ComponentProps<"input">): JSX.Element;
export function Select(props: ComponentProps<"select">): JSX.Element; // <option>s as children
```

- Label: `text-label text-text-muted`. Hint: small `text-text-muted`.
- `Input` and `Select`: `bg-field border border-line rounded-sm text-text`, border turns
  `accent` on focus (`focus:border-accent`, no extra ring). `Input type="number"` uses
  `text-metric`.

### `src/components/ui/medal-badge.tsx`

```tsx
import type { Medal } from "@/db/types";

export function MedalBadge(props: { medal: Medal; label: string }): JSX.Element;
// <MedalBadge medal="gold" label={dictionary.results.medals.gold} />
```

- A small round disc in `medal-gold` / `medal-silver` / `medal-bronze` (named map from
  `Medal` to its class) followed by the label in `text-label`. The disc is decorative
  (`aria-hidden`); the label carries the meaning.
- Medal colors appear here and nowhere else in the app.

### `src/components/ui/status-pill.tsx`

```tsx
import type { TransferStatus } from "@/db/types";

export function StatusPill(props: { status: TransferStatus; label: string }): JSX.Element;
```

- `rounded-sm border px-2 text-label`. Named map from status to classes:
  `pending` → `border-accent text-accent` (it is the active state),
  `accepted` → `border-line text-text`, `rejected` → `border-line text-text-muted`.

### `src/components/ui/stat.tsx`

```tsx
// One metric: label on top, value below. The value is already formatted by the caller
// (formatDuration, formatPace… from src/i18n/formatters.ts).
export function Stat(props: { label: string; value: string; emphasis?: boolean }): JSX.Element;
```

- Label: `text-label text-text-muted`. Value: `text-heading text-2xl text-metric`, in
  `text-accent` when `emphasis` (key numbers), `text-text` otherwise.

### `src/components/ui/wordmark.tsx`

```tsx
export type WordmarkTone = "default" | "accent";

export function Wordmark(props: { tone?: WordmarkTone; className?: string }): JSX.Element;
// Renders RACEBOOK in text-display; "default" -> text-text, "accent" -> text-accent.
```

- The word `RACEBOOK` is the brand name, not copy: it is not translated. Name it as a
  constant. No icon, no box, no gradient, no extra skew.

### Surfaces

Cards and panels use the `panel` utility directly (`<section className="panel p-6">`).
There is no `Panel` component.

## Steps

1. Create the worktree. In `racebook/`, run `npm install`.
2. Wire Tailwind in `postcss.config.mjs`. Replace `globals.css` with the brand tokens and
   the typography utilities. `npm run build` passes.
3. Write `class-names.ts`, `button.tsx`, `field.tsx`, `stat.tsx`, `wordmark.tsx`.
   `npm run build` passes.
4. Rebase on `develop` once plan 01 is merged (see *Depends on*). Write
   `medal-badge.tsx` and `status-pill.tsx`.
5. Visual check (below) with a scratch page that is **never committed**.
6. Run the verification, commit in small conventional commits (`feat(ui): ...`), rebase on
   `develop`, merge into `develop`, push.
7. Set this plan's Status to `done` (or report what is blocked).

## Verification

- `npm run build` and `npm run lint` pass in `racebook/`.
- Scratch page `src/app/kit-check/page.tsx`, local only (delete it before committing;
  `git status` must not show it). Render every component and variant: both buttons (normal,
  disabled), `ButtonLink`, a `Field` with `Input`, one with `Select`, the three medals, the
  three statuses, two `Stat`s (one with `emphasis`), both wordmarks, all inside a
  `panel`. With `npm run dev`, check by hand:
  - The page background is `#0B0C0E`, text is light, and nothing from the old scaffold CSS
    (centered body, purple links, rounded 8px buttons) remains.
  - The `panel` shows a faint blue light in the bottom-right corner that fades along both
    edges. It reads as light, not as a blue border.
  - Text on the primary button is dark, not white.
  - Tab through the page: every button, link and field shows a visible focus state; an
    input's border turns blue on focus.
  - The wordmark and titles are italic and condensed (once plan 01's font is merged).
- There is no test runner in this project. Given the deadline, verification is the build
  plus the manual checks above; that is a deliberate trade-off, not an omission.

## Done when

- [ ] Tailwind v4 runs: utility classes like `bg-accent` produce styles.
- [ ] `globals.css` holds exactly the brand tokens, `panel` and the four typography
      utilities; no scaffold CSS is left.
- [ ] Every component above exists with the exact name, props and file.
- [ ] No hex value and no user-facing string literal inside `src/components/ui/`
      (except the `RACEBOOK` brand constant).
- [ ] `npm run build` passes and the branch is merged into `develop`.
