# 15 · final touches (three parallel executors)

**Status:** in-progress

Deadline 23:59 ART. Each workstream has its own branch and owns disjoint files. Hard cutoff
for merge: 23:35 (onboarding: 23:30). Anything not verified by then is not merged.

## A · Mobile stat bar and photo action buttons (`fix/final-ui`)

- Event page result stats (`src/app/events/[eventId]/page.tsx`): on mobile the `divide-x`
  row wraps badly (indented rows, dangling dividers). Use a responsive grid (2 columns on
  mobile, auto-fit row on desktop) with dividers only where they make sense.
- Photo tile actions (`src/features/gallery/photo-card.tsx`, lightbox footer): "Set as
  cover" and "Share" overflow and wrap on small tiles. Make them compact icon buttons
  (inline SVG, `aria-label` + tooltip text from the dictionary) in a small toolbar that
  never wraps, on every viewport.
- Owns: those two files, `src/features/gallery/lightbox.tsx`, `src/i18n/messages/gallery.*`.

## B · Demo data in production (`chore/demo-data`, no app code)

- Fill the live app through its own API (photo uploads, server actions) so every athlete
  has good-looking races, results, photos with covers, and a pending transfer and a pending
  tag in the inbox, to demo the hero flow.
- Images: only free-licensed (Lorem Picsum / Unsplash License). Never watermarked or
  copyrighted images. Replace the cover of any event currently showing a watermarked
  photo.
- Scripts live in the scratchpad, never in the repo.

## C · Onboarding modal with Remotion (`feat/onboarding`)

- First visit shows a modal with a short Remotion `<Player>` animation (3 scenes: medal
  board, photos, transfer/tag + AI capture), bilingual captions, "Skip" / "Start".
  Seen-state in `localStorage` (per-viewer convenience). A "?" entry in the sidebar reopens it.
- Owns: `src/features/onboarding/**`, `src/app/layout.tsx` (mount only),
  `src/i18n/messages/onboarding.*` + `src/i18n/dictionary.ts` (register the pair),
  `package.json` (`remotion`, `@remotion/player`).
