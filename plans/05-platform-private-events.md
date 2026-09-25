# 05 · platform · Private events and photo tags (schema)

**Status:** done

## Goal

Events stop being a shared catalog: each event belongs to one athlete. Existing data is
split into per-athlete copies without losing results or photos. A new `photo_tags` table
lets an owner tag a friend on a photo. The shared contracts that plans 06 (results) and
07 (gallery) build on exist and the app still builds and works as today.

## Area and branch

- Area: `platform` (this plan also owns `src/db/events.ts` for this change, because the
  schema and the event queries must land together; afterwards it goes back to `results`).
- Branch and worktree, created from `develop`:
  ```sh
  git worktree add ../webflow-nerdearla-26-private-events -b feat/private-events develop
  ```
- All paths below are relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `README.md` → *Data model*.
- The current code: `src/db/migrations/`, `src/db/types.ts`, `src/db/events.ts`,
  `src/features/results/actions.ts` (`createEventAction`).
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

- `src/db/migrations/0003_private_events_and_tags.sql` (new)
- `src/db/types.ts`
- `src/db/events.ts`
- `src/features/results/actions.ts`: **only** the `createEvent(...)` call inside
  `createEventAction`, to pass `ownerId`. Nothing else in that file.

## Must not touch

- `0001_init.sql`, `0002_seed.sql` (already deployed; never edit a merged migration).
- Every page, component and other `src/db/` module. Plans 06 and 07 change them.
- `docs/`, `plans/` (except this Status line), `README.md`, `AGENTS.md`.

## Depends on

Nothing beyond `develop`. Plans 06 and 07 start after this one is merged.

## Contracts

### Migration `0003_private_events_and_tags.sql`

Run in this order, so every foreign key stays valid at each step:

```sql
-- 1. Events get an owner. SQLite can't add NOT NULL here; the code always sets it.
ALTER TABLE events ADD COLUMN owner_id TEXT REFERENCES athletes (id);

-- 2. One private copy of each shared event per athlete who has a result or owns a
--    photo in it. Copy id: '<event id>-<athlete id without the "athlete-" prefix>',
--    e.g. 'event-baires-21k-lucia'.
INSERT INTO events (id, name, date, location, discipline, owner_id)
SELECT e.id || '-' || replace(p.athlete_id, 'athlete-', ''), e.name, e.date, e.location,
       e.discipline, p.athlete_id
FROM events e
JOIN (
  SELECT event_id, athlete_id FROM results
  UNION
  SELECT event_id, owner_id AS athlete_id FROM photos
) p ON p.event_id = e.id
WHERE e.owner_id IS NULL;

-- 3. Point results and photos at their owner's copy.
UPDATE results
SET event_id = event_id || '-' || replace(athlete_id, 'athlete-', '')
WHERE event_id IN (SELECT id FROM events WHERE owner_id IS NULL);

UPDATE photos
SET event_id = event_id || '-' || replace(owner_id, 'athlete-', '')
WHERE event_id IN (SELECT id FROM events WHERE owner_id IS NULL);

-- 4. Drop the shared originals (an event nobody used is dropped too).
DELETE FROM events WHERE owner_id IS NULL;

CREATE INDEX events_by_owner ON events (owner_id, date);

-- 5. Tags: the photo stays with its owner and also appears in the tagged athlete's
--    event. event_id is chosen by the tagged athlete when accepting.
CREATE TABLE photo_tags (
  id TEXT PRIMARY KEY NOT NULL,
  photo_id TEXT NOT NULL REFERENCES photos (id),
  athlete_id TEXT NOT NULL REFERENCES athletes (id),
  tagged_by_id TEXT NOT NULL REFERENCES athletes (id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  event_id TEXT REFERENCES events (id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resolved_at TEXT
);

-- An athlete has at most one open (pending or accepted) tag per photo.
CREATE UNIQUE INDEX photo_tags_one_open_per_athlete ON photo_tags (photo_id, athlete_id)
  WHERE status IN ('pending', 'accepted');

CREATE INDEX photo_tags_by_athlete ON photo_tags (athlete_id, status);
CREATE INDEX photo_tags_by_event ON photo_tags (event_id, status);
```

Transfers keep their table. On accept, the recipient picks the destination event (plan 07);
nothing new is stored on `transfers`.

### Types (`src/db/types.ts`)

Add, keep everything else:

```ts
export type TagStatus = "pending" | "accepted" | "rejected";

export type RaceEvent = {
  id: string;
  ownerId: string; // new
  name: string;
  date: string; // YYYY-MM-DD
  location: string;
  discipline: Discipline;
};

export type PhotoTag = {
  id: string;
  photoId: string;
  athleteId: string;   // the tagged athlete
  taggedById: string;  // the photo owner who tagged
  status: TagStatus;
  eventId: string | null; // the tagged athlete's event, set on accept
  createdAt: string;
  resolvedAt: string | null;
};
```

### Events (`src/db/events.ts`)

```ts
export type EventDetails = Omit<RaceEvent, "id" | "ownerId">; // name, date, location, discipline

export async function listEventsOwnedBy(ownerId: string): Promise<RaceEvent[]>; // date desc
export async function findOwnedEvent(eventId: string, ownerId: string): Promise<RaceEvent | undefined>;
export async function createEvent(ownerId: string, details: EventDetails): Promise<RaceEvent>;

// For atomic writes in another module's database.batch([...]) (plan 07 accepts a transfer
// or tag into a brand-new event in one transaction). It prepares; it does not run.
export function prepareEventInsert(
  database: D1Database,
  ownerId: string,
  details: EventDetails,
): { statement: D1PreparedStatement; event: RaceEvent };
```

- `createEvent` uses `prepareEventInsert` and runs the statement: one way to insert.
- Keep the old `listEvents()` and `findEvent(eventId)` for now so today's pages build;
  mark them `/** @deprecated Use listEventsOwnedBy / findOwnedEvent. Removed by plan 06. */`.
  Plan 06 removes them.
- Map `owner_id` into `ownerId` in the row mapping.

## Steps

1. Create the worktree; `npm install`.
2. Write the migration. On a fresh local DB: `npx wrangler d1 migrations apply DB --local`
   (delete `.wrangler/state` first to start fresh), then check with `wrangler d1 execute`:
   - `SELECT id, owner_id FROM events ORDER BY id` → 9 rows (Lucía 3, Tomás 3, Sofía 3),
     no row with `owner_id IS NULL`.
   - `SELECT COUNT(*) FROM results r JOIN events e ON e.id = r.event_id AND e.owner_id = r.athlete_id`
     → 9 (every result points at its owner's copy).
3. Also test the migration on a DB that has photos and an accepted transfer: apply
   0001–0002, insert two photos and a transfer by hand, then apply 0003 and check every
   photo points at an event owned by its `owner_id`.
4. Types, `events.ts`, the one-line change in `createEventAction`.
5. `npm run build` and `npm run lint`; `npm run dev`: medal board, an event page and the
   new-event form still work (event URLs now carry the owner suffix).
6. Commit in small conventional commits (`feat(platform): ...`). Set Status to `done`.

## Verification

- Build and lint pass.
- The checks in steps 2 and 3 return the expected counts.
- Creating an event through `/events/new` stores `owner_id` = current athlete.

## Done when

- [ ] Migration 0003 applies cleanly on a fresh DB and on a DB with photos and transfers.
- [ ] Every contract above exists with the exact name and signature.
- [ ] The app builds and today's screens still work.
