# 09 · results · Medal board, event detail and form layout

**Status:** todo

## Goal

The results screens follow the chosen wireframes: the medal board is a card grid
(*Medal board · B*), the event detail has a compact stat bar on top and the gallery at full
width (*Event detail · B*), and the result and new-event forms are a centered two-column
panel with a medal swatch picker (*Result form*).

## Area and branch

- Area: `results`
- Worktree from `develop` **after plans 06 and 07 are merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-results-layout -b feat/results-layout develop
  ```
- Paths relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `docs/brand.md`.
- The wireframes: private Artifact https://claude.ai/artifact/MCWsv7d5YYEJHzt9BGjFf9, read
  it with the Artifact tool (`action: "read"`). Artboards: **Medal board · B**, **Event
  detail · B**, **Result form**. They show layout and hierarchy; `docs/brand.md` and
  `src/components/ui/` win on every visual value.
- Load the *Código Sostenible* skills before writing code (`cs-*`).

## Owns

- `src/app/page.tsx`, `src/app/events/**`
- `src/features/results/`
- `src/i18n/messages/results.en.ts`, `src/i18n/messages/results.es.ts`

## Must not touch

- `src/app/layout.tsx` (plan 08 adds the sidebar in parallel: design the pages for a
  content column next to a sidebar, not for the full window).
- `src/features/gallery/`, `src/app/inbox/`, `src/db/**`, `src/components/**`.
- Keep rendering `<EventGallery eventId={event.id} />` unchanged, at full content width.

## Contracts consumed

```ts
import { listEventPhotos } from "@/db/photos"; // (athleteId, eventId) -> EventPhoto[]
```

Photo URLs are `/api/photos/<photoId>`. Read the real signatures on `develop`.

## Steps

1. Medal board: summary stats row, then a responsive grid of event cards (`panel`): event
   name, date and location, medal badge, place and time, and a strip of up to 3 photo
   thumbnails (named constant) when the event has photos. The whole card links to the
   event. Cards without a result keep "No result yet". One primary action: "Log a race".
2. Event detail: title block, then a compact horizontal stat bar (only the non-null
   stats), the "Edit/Log my result" primary action, then the gallery full width.
3. Forms: centered `panel`, fields in two columns on desktop, one on mobile. Medal as a
   row of selectable swatches (a radio group styled with `MedalBadge` colors plus "None"),
   keyboard accessible. The new-event form uses the same layout.
4. `npm run build`, `npm run lint`, small conventional commits (`feat(results): ...`),
   Status `done`.

## Verification

- Build and lint pass. `npm run dev` as Lucía: cards in a grid with medals and photo
  strips (after uploading a few photos), event detail with the stat bar and full-width
  gallery, forms in two columns that still save. Narrow window: everything stacks.
  `ES` switches every string.

## Done when

- [ ] The three screens follow the chosen wireframes, in both languages.
- [ ] No new colors or components outside `src/components/ui/`.
