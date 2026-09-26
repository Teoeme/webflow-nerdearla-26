# 12 · ui · Headless primitives (Radix)

**Status:** done

## Goal

The ui kit has styled, accessible `Select`, `Modal` and `Menu` components built on Radix
primitives, and every native `<select>` in the app uses the new `Select`. Plans 13 and 14
build their screens with these three components.

## Area and branch

- Area: `ui` (this plan also migrates the existing `Select` call sites in other areas; it
  runs alone, before 13 and 14).
- Worktree from `develop`:
  ```sh
  git worktree add ../webflow-nerdearla-26-primitives -b feat/ui-primitives develop
  ```
- Paths relative to `racebook/`.

## Read first

`AGENTS.md` (*Public repository*), `docs/brand.md`, `src/components/ui/*`,
`src/app/globals.css`. Load the *Código Sostenible* skills (`cs-*`).

## Owns

- `package.json`, `package-lock.json`: add `radix-ui` (the unified package) only.
- `src/components/ui/field.tsx` (`Select`), `src/components/ui/modal.tsx` (new),
  `src/components/ui/menu.tsx` (new), `src/app/globals.css` (only if an animation keyframe
  is needed).
- Call-site migration only, no other change in these files:
  `src/components/session/athlete-switcher.tsx`, `src/features/results/new-event-form.tsx`,
  `src/features/gallery/action-forms.tsx`, `src/app/inbox/page.tsx`.

## Must not touch

Everything else. No layout or behaviour changes in the migrated files: same names, same
values, same form submission.

## Contracts (provided)

```tsx
// src/components/ui/field.tsx: replaces the native Select
export type SelectOption = { value: string; label: string };
export function Select(props: {
  name: string;            // submitted with the form (Radix renders a hidden native select)
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  id?: string;             // for <Field htmlFor>
  "aria-label"?: string;
  required?: boolean;
  disabled?: boolean;
}): JSX.Element; // "use client"

// src/components/ui/modal.tsx
export function Modal(props: {
  trigger: ReactNode;      // rendered via Dialog.Trigger asChild (e.g. a <Button>)
  title: string;
  description?: string;
  children: ReactNode;     // the form
  open?: boolean; onOpenChange?: (open: boolean) => void; // optional control
}): JSX.Element; // "use client"

// src/components/ui/menu.tsx
export type MenuItem = { label: string; onSelect: () => void };
export function Menu(props: {
  trigger: ReactNode;      // asChild
  items: MenuItem[];
  align?: "start" | "end";
}): JSX.Element; // "use client"
```

- All three are client components; server components can render them and pass strings.
- Style with the brand tokens only: `field` fill, `line` border that turns `accent` on
  focus, `panel` for the content surfaces (select list, menu, modal), 4px radius, text
  `text` / `text-muted`, highlighted item with a subtle `accent` tint and `accent` text,
  checked item marked with a check. Modal: dimmed `background` overlay, centered `panel`
  max-w-lg, title in `text-heading`, close button top right, Esc and click-outside close,
  focus trapped. Short opacity/scale transitions (150 ms) on open and close, respecting
  `prefers-reduced-motion`.
- The athlete switcher keeps submitting on change: `onValueChange` → `form.requestSubmit()`
  (the hidden native select carries the value).

## Steps

1. Worktree, `npm install radix-ui`, fresh local migrations.
2. `Select`, `Modal`, `Menu`.
3. Migrate the four call sites.
4. `npm run build`, `npm run lint`, then `npm run dev` and curl every page (a function
   passed from a server to a client component fails only at runtime). Check the switcher,
   the new-event form and an inbox accept still submit the right values. Small
   conventional commits (`feat(ui): ...`). Status `done`.

## Done when

- [ ] No native `<select>` left (`rg "<select" src` finds only Radix internals, if any).
- [ ] The three components exist with the exact props above.
- [ ] Every form that used a select still submits the same field names and values.
