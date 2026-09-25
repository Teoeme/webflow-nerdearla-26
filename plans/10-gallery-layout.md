# 10 · gallery · Lightbox, upload panel and inbox split view

**Status:** todo

## Goal

The gallery screens follow the chosen wireframes: the lightbox carries the photo actions
and a filmstrip (*Lightbox*), batch upload is an overlay panel with a drop zone and
per-file progress (*Batch upload*), and the inbox is a split view with a list and a
decision panel (*Inbox · B*).

## Area and branch

- Area: `gallery`
- Worktree from `develop` **after plans 06 and 07 are merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-gallery-layout -b feat/gallery-layout develop
  ```
- Paths relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `docs/brand.md`.
- The wireframes: private Artifact https://claude.ai/artifact/MCWsv7d5YYEJHzt9BGjFf9, read
  it with the Artifact tool (`action: "read"`). Artboards: **Lightbox**, **Batch upload**,
  **Inbox · B**. They show layout and hierarchy; `docs/brand.md` and `src/components/ui/`
  win on every visual value.
- Load the *Código Sostenible* skills before writing code (`cs-*`).

## Owns

- `src/features/gallery/`, `src/app/inbox/page.tsx`
- `src/i18n/messages/gallery.en.ts`, `src/i18n/messages/gallery.es.ts`

## Must not touch

- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/events/**`, `src/features/results/`
  (plans 08 and 09 run in parallel). `EventGallery` keeps its exact signature; it renders
  at the full width of the content column.
- `src/db/**` (the data functions from plan 07 are enough; if one is missing, report it),
  `src/components/**`.

## Steps

1. Lightbox: dimmed backdrop, centered photo, prev/next, counter, a filmstrip of
   thumbnails (click to jump), and a footer with the status pills and, for the owner, the
   athlete `Select` with "Transfer" and "Tag" (the same server actions as the grid). Photos
   seen through a tag show "Tagged by <name>" and no actions. Keys and focus as today.
2. Batch upload: an overlay panel opened by the gallery's primary "Upload photos" button,
   with a drop zone (drag and drop plus file picker), an overall progress bar, one row per
   file with its state (waiting, uploading, done, rejected with reason) and a close button
   once it finishes. Same one-request-per-file uploader as today.
3. Inbox: a list of pending items (transfers and tags, each with a kind label) on the
   left; the selected item's decision panel on the right: photo, who and from which event,
   destination `Select` (my events + "New event: <name>"), "Accept" (primary) and
   "Reject" (outline). The selection is a search param (`?item=transfer:<id>` /
   `?item=tag:<id>`), first item by default; no client state needed. Mobile: the list, and
   the panel below the selected item.
4. `npm run build`, `npm run lint`, small conventional commits (`feat(gallery): ...`),
   Status `done`.

## Verification

- Build and lint pass. `npm run dev`: transfer and tag from inside the lightbox work and
  update the pills; dropping 3 images plus a PDF on the drop zone uploads 3 and rejects
  the PDF; as Tomás the inbox shows the list and the panel, accepting moves to the next
  item. Narrow window: everything stacks. `ES` switches every string.

## Done when

- [ ] The three screens follow the chosen wireframes, in both languages.
- [ ] Every action still goes through the plan 07 guards; no new data access.
