# 06 · results · Private medal board

**Status:** todo

## Goal

The medal board and event pages are a personal record: an athlete only sees and edits their
own events. The "results of every athlete" table and the "Other events" list are gone. An
event with no result yet still appears on the medal board.

## Area and branch

- Area: `results`
- Branch and worktree, created from `develop` **after plan 05 is merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-private-results -b feat/private-results develop
  ```
- All paths below are relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `README.md`, `docs/brand.md`.
- `plans/05-platform-private-events.md` → *Contracts*, and the real `src/db/events.ts` and
  `src/db/types.ts` on `develop` (they win over the plan).
- The current results code: `src/app/page.tsx`, `src/app/events/**`, `src/features/results/`,
  `src/db/results.ts`.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

- `src/db/events.ts` (only to delete the deprecated `listEvents` and `findEvent`)
- `src/db/results.ts`
- `src/app/page.tsx`
- `src/app/events/[eventId]/page.tsx`, `src/app/events/[eventId]/result/page.tsx`,
  `src/app/events/new/page.tsx`
- `src/features/results/`
- `src/i18n/messages/results.en.ts`, `src/i18n/messages/results.es.ts`

## Must not touch

- `src/features/gallery/`, `src/app/inbox/`, `src/app/api/`, `src/db/photos.ts`,
  `src/db/transfers.ts`, `src/db/photo-tags.ts`: owned by `gallery` (plan 07, in parallel).
  The event page keeps rendering `<EventGallery eventId={event.id} />` unchanged.
- Migrations, `src/db/types.ts`, `src/session/`, `src/app/layout.tsx`, `src/components/`.
- `docs/`, `plans/` (except this Status line), `README.md`, `AGENTS.md`.

## Depends on

Plan 05 merged. Before deleting `findEvent`, check with `rg` that nothing outside your
Owns list still imports it; if plan 07 code on `develop` does, keep it and report.

## Contracts

### Consumed (from plan 05)

```ts
import {
  listEventsOwnedBy, findOwnedEvent, createEvent, type EventDetails,
} from "@/db/events";
// createEvent(ownerId, details); findOwnedEvent(eventId, ownerId)
```

### Provided / changed

```ts
// src/db/results.ts
export type EventEntry = { event: RaceEvent; result: RaceResult | null };

// Every event of the athlete, newest first, with their result when there is one
// (LEFT JOIN results ON result.event_id = event.id AND result.athlete_id = owner).
export async function listEventEntries(ownerId: string): Promise<EventEntry[]>;

// Remove: listResultsForEvent, EventResult, listResultsForAthlete, AthleteResult
// (replaced by listEventEntries). Keep findResult and saveResult as they are.
```

## Behaviour

- **Ownership is checked on the server, everywhere.** `/events/[eventId]`,
  `/events/[eventId]/result` and `saveResultAction` use
  `findOwnedEvent(eventId, currentAthlete.id)`; an event of another athlete is a
  `notFound()`, exactly like an unknown id. Nothing reveals that it exists.
- **Medal board (`/`).** One card per event from `listEventEntries`. A card with a result
  shows medal, place, time and pace as today; a card without one shows "No result yet" /
  "Todavía sin resultado" and a link to the result form. Summary stats count only events
  with results (races logged) and medals. Remove "Other events".
- **Event detail.** Remove the "Results" table of every athlete. Keep the athlete's own
  result `Stat`s, the primary action (log / edit my result) and `<EventGallery>`.
- **New event.** `createEvent(currentAthlete.id, details)`; still redirects to its result
  form.
- Remove every dictionary key that is no longer used (both languages).
- Layout stays as it is; a separate desktop layout pass comes after the wireframes.

## Steps

1. Create the worktree; `npm install`; apply local migrations (fresh `.wrangler/state`).
2. `listEventEntries` in `results.ts`; remove the replaced functions.
3. Medal board, event detail, result form page and action, new event.
4. Delete the deprecated `listEvents` / `findEvent` (see *Depends on*) and unused copy.
5. Verification, small conventional commits (`feat(results): ...`), Status `done`.

## Verification

- `npm run build` and `npm run lint` pass.
- `npm run dev`, as Lucía: `/` shows her 3 events, newest first, with medals as before;
  no "Other events". `/events/event-baires-21k-lucia` shows her result and gallery, no
  table of other athletes.
- As Lucía, `/events/event-baires-21k-tomas` and `/events/event-baires-21k-tomas/result`
  are 404.
- Creating an event as Sofía shows it on her medal board as "No result yet", and not on
  Lucía's.
- `ES` switches every string.

## Done when

- [ ] No page or action reads an event without checking its owner.
- [ ] Other athletes' results and events are not visible anywhere.
- [ ] Events without a result appear on the medal board.
- [ ] Build passes; unused functions and copy removed.
