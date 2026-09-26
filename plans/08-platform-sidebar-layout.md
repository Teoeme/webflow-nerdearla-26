# 08 · platform · Sidebar layout

**Status:** done

## Goal

On desktop the app has a left sidebar (wordmark, nav with the inbox pending count,
"View as" and EN/ES) and the page content to its right, as in wireframe *Medal board · B*.
On mobile the sidebar collapses into a top bar.

## Area and branch

- Area: `platform`
- Worktree from `develop` **after plans 06 and 07 are merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-sidebar -b feat/sidebar-layout develop
  ```
- Paths relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `docs/brand.md`.
- The wireframes: private Artifact https://claude.ai/artifact/MCWsv7d5YYEJHzt9BGjFf9, read
  it with the Artifact tool (`action: "read"`). Use the artboard **Medal board · B** for the
  sidebar. The wireframes show layout and hierarchy; `docs/brand.md` and
  `src/components/ui/` win on every visual value.
- Load the *Código Sostenible* skills before writing code (`cs-*`).

## Owns

- `src/app/layout.tsx`
- `src/components/session/athlete-switcher.tsx`, `src/components/session/language-switcher.tsx`
- `src/i18n/messages/common.en.ts`, `src/i18n/messages/common.es.ts`

## Must not touch

- Pages and `src/features/**` (plans 09 and 10 run in parallel), `src/db/**`,
  `src/components/ui/`, `globals.css`. Missing a ui token or utility? Report it.

## Contracts consumed

```ts
import { listIncomingTransfers } from "@/db/transfers"; // pending, for the current athlete
import { listIncomingTags } from "@/db/photo-tags";     // pending, for the current athlete
```

Read the real signatures on `develop`; they win.

## Steps

1. Sidebar: fixed width on `lg` and up, full height, `border-r border-line`; the content
   area scrolls and keeps a sensible max width. Wordmark on top, nav (Medal board, Inbox),
   switchers at the bottom.
2. Inbox count: the sum of pending incoming transfers and tags, shown as a small
   `text-label` badge next to "Inbox" only when it is above zero (accent is allowed: it is
   an active state). Active nav item marked (`aria-current="page"`); this needs the
   pathname, so the nav is a small client component receiving labels and the count as
   props.
3. Below `lg`: a top bar with the wordmark and nav; switchers wrap under it. No hamburger.
4. `npm run build`, `npm run lint`, small conventional commits (`feat(platform): ...`),
   Status `done`.

## Verification

- Build and lint pass. `npm run dev`: the sidebar shows on a wide window and collapses on
  a narrow one; the count appears when Tomás has a pending transfer and disappears after
  he accepts it; switching athlete and language still works.

## Done when

- [ ] Sidebar on desktop, top bar on mobile, both languages.
- [ ] Inbox count is correct and hidden at zero.
