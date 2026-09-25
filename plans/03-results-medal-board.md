# 03 · results · Medal board

**Status:** done

## Goal

The current athlete sees their medal board (every race they logged, newest first, with
medal, place and time), opens an event to see its details, their metrics and everyone's
results, and logs or edits their own result for an event. New events can be added to the
shared catalog.

## Area and branch

- Area: `results`
- Branch and worktree, created from `develop` **after plans 01 and 02 are merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-results -b feat/results develop
  ```
- All paths below are relative to `racebook/` (the Next.js app).

## Read first

- `AGENTS.md` (parallel work, shared contracts, languages, code standards).
- `README.md` → *Scope* and *Data model*.
- `docs/brand.md` (accent is scarce: one primary action per screen).
- `plans/01-platform-foundation.md` → *Contracts* and `plans/02-ui-kit.md` → *Contracts*:
  what you build on. Read the real files on `develop`; they win over the plans.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

Create or modify only these:

- `src/db/events.ts`, `src/db/results.ts`
- `src/app/page.tsx` (replace platform's placeholder with the medal board)
- `src/app/events/[eventId]/page.tsx`
- `src/app/events/new/page.tsx`
- `src/app/events/[eventId]/result/page.tsx`
- `src/features/results/` (everything inside: components, server actions, parsing)
- `src/i18n/messages/results.en.ts`, `src/i18n/messages/results.es.ts`

## Must not touch

- `src/features/gallery/`, `src/app/inbox/`, `src/app/api/`, `src/db/photos.ts`,
  `src/db/transfers.ts`: owned by `gallery` (plan 04, runs in parallel).
- `src/db/types.ts`, `connection.ts`, `athletes.ts`, migrations, `src/session/`,
  `src/i18n/` outside your two message files, `src/app/layout.tsx`: owned by `platform`.
- `src/app/globals.css`, `src/components/ui/`: owned by `ui`. Missing a component or a
  variant? Report it; don't build a parallel one.
- `docs/`, `plans/` (except the Status line of this file), `README.md`, `AGENTS.md`.

## Depends on

- Plans 01 and 02, merged into `develop`.
- `EventGallery` from plan 04. Plan 04 lands a stub on `develop` as its first step. If it
  is not on `develop` yet when you get to step 5, do steps 6–7 first and come back.

## Contracts

### Consumed (exact, from the other plans)

```ts
// platform
import { getDatabase } from "@/db/connection";          // Promise<D1Database>
import { listAthletes } from "@/db/athletes";
import type { RaceEvent, RaceResult, Medal, Discipline } from "@/db/types";
import { getCurrentAthlete } from "@/session/current-athlete"; // Promise<Athlete>
import { getCurrentLocale } from "@/i18n/current-locale";      // Promise<Locale>
import { getDictionary } from "@/i18n/dictionary";            // dictionary.results
import { formatEventDate, formatDuration, formatPace, formatDistance } from "@/i18n/formatters";

// ui
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { MedalBadge } from "@/components/ui/medal-badge"; // { medal, label }
import { Stat } from "@/components/ui/stat";              // { label, value, emphasis? }
// plus the `panel`, `text-display`, `text-heading`, `text-label`, `text-metric` classes

// gallery (plan 04)
import { EventGallery } from "@/features/gallery/event-gallery";
// export async function EventGallery(props: { eventId: string }): Promise<JSX.Element>
// A server component: it reads the current athlete and dictionary itself.
```

### Provided

```ts
// src/db/events.ts
export async function listEvents(): Promise<RaceEvent[]>;                   // date desc
export async function findEvent(eventId: string): Promise<RaceEvent | undefined>;
export async function createEvent(input: Omit<RaceEvent, "id">): Promise<RaceEvent>;

// src/db/results.ts
export type AthleteResult = RaceResult & { event: RaceEvent };
export type EventResult = RaceResult & { athleteName: string };
export type ResultInput = Omit<RaceResult, "id">;

export async function listResultsForAthlete(athleteId: string): Promise<AthleteResult[]>; // event date desc
export async function listResultsForEvent(eventId: string): Promise<EventResult[]>;       // place asc, nulls last
export async function findResult(athleteId: string, eventId: string): Promise<RaceResult | undefined>;
export async function saveResult(input: ResultInput): Promise<void>;
// One result per athlete and event (UNIQUE in the schema):
// INSERT ... ON CONFLICT (athlete_id, event_id) DO UPDATE SET ...
```

Rows are snake_case; map them to the camelCase types in one mapping function per module.
New ids use `crypto.randomUUID()`. All SQL uses bound parameters (`.bind(...)`), never
string interpolation.

### Routes

| Route | Content |
|---|---|
| `/` | Medal board of the current athlete |
| `/events/[eventId]` | Event detail (`notFound()` for an unknown id) |
| `/events/[eventId]/result` | Form: log or edit the current athlete's result for that event |
| `/events/new` | Form: add an event to the shared catalog, then go to its result form |

## Screens

Everything a user reads comes from `dictionary.results` (both languages, *vos* in
Spanish). Athlete and event names are data and are not translated. Dates, times, pace
and distance go through the platform formatters. Discipline and medal names are
translated through named maps in the dictionary (`disciplines.road_running`,
`medals.gold`…).

### Medal board (`/`)

- Title in `text-display` ("Medal board" / "Medallero") and the athlete's name.
- A summary row of `Stat`s: races logged, and gold / silver / bronze counts. The medal
  total is the one `emphasis` value.
- One `panel` per result, newest first: event name (link to its detail), date, location,
  discipline, `MedalBadge` when there is a medal, place, time, pace.
- Empty state: a short line and a `ButtonLink` to `/events/new`.
- One primary action: "Log a race" / "Cargá una carrera" → `/events/new`. To log a
  result for an event already in the catalog, the athlete uses that event's detail page.
- Below the athlete's own results, "Other events" lists catalog events they have no
  result for (name, date, link to detail), so shared events are reachable.

### Event detail (`/events/[eventId]`)

- Event name (`text-display`), date, location, discipline.
- The current athlete's result as `Stat`s (time, place, distance, pace, avg HR,
  elevation; skip the ones that are `null`), with a `ButtonLink` to the result form
  ("Edit my result" / "Editá tu resultado", or "Log my result" / "Cargá tu resultado"
  when there is none). That is the screen's primary action.
- "Results" table of every athlete (place, name, time, pace, medal). Times use
  `text-metric`.
- `<EventGallery eventId={event.id} />` below. Don't style or wrap its contents.

### Result form (`/events/[eventId]/result`)

- Fields: place, time (`h:mm:ss` or `mm:ss`), medal (select: none, gold, silver,
  bronze), distance (km, decimals allowed), avg HR, elevation (m). All optional except
  that at least one must be filled. Prefilled with the existing result.
- Pace is not typed: when both time and distance are present, it is derived
  (`round(timeSeconds / distanceKm)`), otherwise `null`.
- Parsing lives in `src/features/results/` as pure functions (`parseDuration("1:32:47")
  -> 5567`, `undefined` for bad input). Never trust the form: validate on the server.
- The form is a client component using `useActionState` with a server action. The action
  returns field errors (a map from field to message key); it does not throw for bad
  input. On success it `redirect`s to `/events/[eventId]`.
- The athlete is always `getCurrentAthlete()`, read inside the action. It is never a form
  field.

### New event (`/events/new`)

- Fields: name, date (`<Input type="date">`), location, discipline (select over the five
  `Discipline` values). All required. Same `useActionState` pattern.
- On success it redirects to `/events/[newId]/result`.

## Steps

1. Create the worktree. In `racebook/`, run `npm install` and
   `npx wrangler d1 migrations apply DB --local`.
2. `src/db/events.ts` and `src/db/results.ts`. Check each query by hand with
   `npx wrangler d1 execute DB --local --command "..."` against the seed.
3. `results.en.ts` / `results.es.ts`: fill them as the screens need copy (Spanish typed
   against English, so a missing key fails the build).
4. Medal board `/`. `npm run build` passes.
5. Event detail `/events/[eventId]`, rendering `<EventGallery>`.
6. Result form, parsing and its server action.
7. New event form and its server action.
8. Run the verification, commit in small conventional commits (`feat(results): ...`),
   rebase on `develop`, merge into `develop`, push.
9. Set this plan's Status to `done` (or report what is blocked).

## Verification

- `npm run build` and `npm run lint` pass in `racebook/`.
- With `npm run dev` and local migrations applied:
  - As Lucía, `/` shows 3 races, newest first (Medio Maratón 2026-08-23 on top), 1 gold
    and 1 silver; "Maratón de Buenos Aires" has no medal badge.
  - As Sofía, the counts change to her 2 races, 1 gold.
  - `/events/event-baires-21k` lists Lucía (2), Sofía (5), Tomás (37) in that order.
  - `/events/does-not-exist` is a 404.
  - Editing Lucía's 10K time to `43:50` with 10 km saves pace `4:23` and survives a
    reload. A time of `abc` shows an error on the field and saves nothing.
  - Creating an event lands on its result form; after saving, it tops the medal board.
  - `ES` switches every string on these screens, including disciplines and medals.
    `formatDistance` shows `21,1 km` in Spanish.
- There is no test runner in this project. Given the deadline, verification is the build
  plus the manual checks above; that is a deliberate trade-off, not an omission.

## Done when

- [ ] All four routes work as described, in both languages.
- [ ] Every `Provided` signature exists with the exact name.
- [ ] No SQL outside `src/db/`; no hard-coded user-facing strings; no cookie reads.
- [ ] Only `src/components/ui/` components are used for buttons, fields, badges, stats.
- [ ] `npm run build` passes and the branch is merged into `develop`.
