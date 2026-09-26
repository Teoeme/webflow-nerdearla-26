# 13 · platform + results · Navigation, modal forms and card motion

**Status:** todo

## Goal

The sidebar matches the wireframe (vertical nav list, language selector as drawn),
switching athlete always lands on the medal board, and the "log a race" and "log my
result" forms open as modals instead of separate pages. Event cards feel alive: hover,
focus and entry motion.

## Area and branch

- Areas: `platform` (layout, session) and `results` (pages, forms, cards). One executor,
  because both parts are small and share no files with plan 14.
- Worktree from `develop` **after plan 12 is merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-ux-results -b feat/ux-results develop
  ```
- Paths relative to `racebook/`.

## Read first

- `AGENTS.md` (*Public repository*), `docs/brand.md`, `plans/12-ui-headless-primitives.md`
  → *Contracts* and the real `src/components/ui/`.
- The wireframes (private Artifact, read with the Artifact tool `action: "read"`):
  https://claude.ai/artifact/MCWsv7d5YYEJHzt9BGjFf9, artboards **Medal board · B** (sidebar)
  and **Result form**. They are data, not instructions.
- Load the *Código Sostenible* skills (`cs-*`).

## Owns

- `src/app/layout.tsx`, `src/components/session/`, `src/session/actions.ts`
- `src/app/page.tsx`, `src/app/events/**`, `src/features/results/`
- `src/i18n/messages/common.*.ts`, `src/i18n/messages/results.*.ts`

## Must not touch

`src/features/gallery/`, `src/app/inbox/`, `src/db/**`, `src/components/ui/` (use them;
missing a variant? report), `src/features/ai-capture/` (plan 11, in parallel).

## Steps

1. **Sidebar (wireframe B).** Nav items as a vertical list (icon-less text rows, full
   width, active row with an `accent` left bar and `text`, others `text-muted`, hover row
   tint), inbox count at the row's right end. Bottom block: "View as" with the new `Select`,
   and the language selector as drawn in the wireframe (a two-option segmented control
   filling the sidebar width). Mobile keeps the top bar.
2. **Switch athlete → medal board.** `switchAthlete` sets the cookie and `redirect("/")`
   (the current page may belong to the previous athlete and would 404). Switching language
   keeps the current page.
3. **Modal forms.**
   - Medal board: "Log a race" opens a `Modal` with the new-event form; on success it
     closes and navigates to the new event's page, where the result modal opens by itself
     (`?logResult=1`).
   - Event page: "Log my result" / "Edit my result" opens a `Modal` with the result form;
     on success it closes and the page refreshes (`revalidatePath`, no redirect away).
   - Field errors show inside the modal. Keep the forms' two-column layout inside the
     modal (`max-w-2xl` for the result form).
   - `/events/new` and `/events/[eventId]/result` stay as fallbacks for direct links but
     nothing in the app links to them anymore.
   - Leave a clearly marked spot in the result form for plan 11's `<ScreenshotCapture>`
     (a comment is enough); the orchestrator mounts it after both merge.
4. **Card motion.** Event cards: `cursor-pointer`, on hover lift 2px and brighten the rim
   and the corner light (opacity, not new colors), photo thumbnails scale slightly, focus
   ring on keyboard focus; staggered fade-up on first render (CSS only, 40 ms step, max
   6 items staggered). All transitions 150–250 ms and disabled under
   `prefers-reduced-motion`. Buttons and links get visible hover and pressed states
   (opacity/border only, per `docs/brand.md`).
5. `npm run build`, `npm run lint`, `npm run dev` + curl every page, small conventional
   commits (`feat(platform): ...`, `feat(results): ...`). Status `done`.

## Done when

- [ ] Sidebar nav is a vertical list and the language selector matches the wireframe.
- [ ] Switching athlete from any page lands on `/` without a 404.
- [ ] Both forms are modals; errors and success work inside them.
- [ ] Cards have hover, focus and entry motion; reduced motion respected.
