# 01 · platform · Foundation

**Status:** done

## Goal

The app has its database, photo storage, simulated session and bilingual plumbing in place.
Every other area can build on these contracts: a placeholder home page greets the current
athlete in the current language, and both switchers ("View as…" and EN/ES) work.

## Area and branch

- Area: `platform`
- Branch and worktree, created from `develop`:
  ```sh
  git worktree add ../webflow-nerdearla-26-platform -b feat/platform develop
  ```
- All paths below are relative to `racebook/` (the Next.js app).

## Read first

- `AGENTS.md` (parallel work, plans, shared contracts, languages, code standards).
- `README.md` → *Data model*.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

Create or modify only these:

- `wrangler.json`, `cloudflare-env.d.ts` (regenerated)
- `src/db/migrations/0001_init.sql`, `src/db/migrations/0002_seed.sql`
- `src/db/connection.ts`, `src/db/types.ts`, `src/db/athletes.ts`
- `src/storage/photo-bucket.ts`
- `src/session/current-athlete.ts`, `src/session/actions.ts`
- `src/i18n/locale.ts`, `src/i18n/current-locale.ts`, `src/i18n/dictionary.ts`,
  `src/i18n/formatters.ts`
- `src/i18n/messages/common.en.ts`, `src/i18n/messages/common.es.ts`
- Empty dictionary pairs for the other areas (created here, owned by them afterwards):
  `src/i18n/messages/{results,gallery,ai-capture}.{en,es}.ts`
- `src/app/fonts.ts`, `src/app/layout.tsx`
- `src/components/session/athlete-switcher.tsx`, `src/components/session/language-switcher.tsx`
- `src/app/page.tsx`: replace the scaffold demo with a placeholder (owned by `results`
  afterwards).

## Must not touch

- `src/app/globals.css` and `src/components/ui/`: owned by the `ui` area (plan 02, runs in
  parallel). Until it merges the page looks unstyled; that is expected.
- `docs/`, `plans/` (except the Status line of this file), `README.md`, `AGENTS.md`.
- `src/db/{events,results,photos,transfers}.ts`: they belong to the `results` and `gallery`
  areas. This plan only defines their row types in `src/db/types.ts`.

## Depends on

Nothing. The scaffold on `develop` is enough.

## Contracts

These are the exact names other plans build against. Don't rename them.

### Bindings (`wrangler.json`)

Add to the existing file (keep everything else):

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "racebook",
    "database_id": "racebook-local",
    "migrations_dir": "./src/db/migrations"
  }
],
"r2_buckets": [
  {
    "binding": "PHOTOS",
    "bucket_name": "racebook-photos"
  }
]
```

Webflow Cloud assigns the real `database_id` on deploy
(https://developers.webflow.com/webflow-cloud/storing-data/sqlite). Then run
`npm run cf-typegen` so `CloudflareEnv` has `DB: D1Database` and `PHOTOS: R2Bucket`.

### Schema (`src/db/migrations/0001_init.sql`)

IDs are `TEXT`. New rows use `crypto.randomUUID()`; seed rows use readable fixed ids.
Timestamps are ISO 8601 UTC strings. Event dates are `YYYY-MM-DD`.

```sql
CREATE TABLE athletes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT
);

CREATE TABLE events (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  discipline TEXT NOT NULL
    CHECK (discipline IN ('road_running', 'trail_running', 'triathlon', 'cycling', 'swimming'))
);

CREATE TABLE results (
  id TEXT PRIMARY KEY NOT NULL,
  athlete_id TEXT NOT NULL REFERENCES athletes (id),
  event_id TEXT NOT NULL REFERENCES events (id),
  place INTEGER,
  time_seconds INTEGER,
  medal TEXT CHECK (medal IN ('gold', 'silver', 'bronze')),
  distance_km REAL,
  pace_seconds_per_km INTEGER,
  avg_heart_rate INTEGER,
  elevation_m INTEGER,
  UNIQUE (athlete_id, event_id)
);

CREATE TABLE photos (
  id TEXT PRIMARY KEY NOT NULL,
  event_id TEXT NOT NULL REFERENCES events (id),
  owner_id TEXT NOT NULL REFERENCES athletes (id),
  uploader_id TEXT NOT NULL REFERENCES athletes (id),
  storage_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX photos_by_event_and_owner ON photos (event_id, owner_id);

CREATE TABLE transfers (
  id TEXT PRIMARY KEY NOT NULL,
  photo_id TEXT NOT NULL REFERENCES photos (id),
  from_athlete_id TEXT NOT NULL REFERENCES athletes (id),
  to_athlete_id TEXT NOT NULL REFERENCES athletes (id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resolved_at TEXT
);

-- A photo can have at most one pending transfer.
CREATE UNIQUE INDEX transfers_one_pending_per_photo ON transfers (photo_id)
  WHERE status = 'pending';

CREATE INDEX transfers_by_recipient ON transfers (to_athlete_id, status);
```

### Seed (`src/db/migrations/0002_seed.sql`)

Seeding is a migration, so every deploy gets the same data. Paces are consistent with
time and distance. Photos are not seeded (the gallery area uploads them).

```sql
INSERT INTO athletes (id, name, avatar_url) VALUES
  ('athlete-lucia', 'Lucía Fernández', NULL),
  ('athlete-tomas', 'Tomás Ibarra', NULL),
  ('athlete-sofia', 'Sofía Gómez', NULL);

INSERT INTO events (id, name, date, location, discipline) VALUES
  ('event-baires-21k', 'Medio Maratón de Buenos Aires', '2026-08-23', 'Buenos Aires', 'road_running'),
  ('event-costanera-10k', 'Carrera Costanera 10K', '2026-06-14', 'Buenos Aires', 'road_running'),
  ('event-patagonia-run', 'Patagonia Run', '2026-04-11', 'San Martín de los Andes', 'trail_running'),
  ('event-baires-42k', 'Maratón de Buenos Aires', '2025-09-21', 'Buenos Aires', 'road_running');

INSERT INTO results (id, athlete_id, event_id, place, time_seconds, medal, distance_km, pace_seconds_per_km, avg_heart_rate, elevation_m) VALUES
  ('result-lucia-baires-21k', 'athlete-lucia', 'event-baires-21k', 2, 5567, 'silver', 21.1, 264, 162, 38),
  ('result-lucia-costanera-10k', 'athlete-lucia', 'event-costanera-10k', 1, 2650, 'gold', 10.0, 265, 171, 12),
  ('result-lucia-baires-42k', 'athlete-lucia', 'event-baires-42k', 14, 12065, NULL, 42.2, 286, 158, 64),
  ('result-tomas-baires-21k', 'athlete-tomas', 'event-baires-21k', 37, 6090, NULL, 21.1, 289, 165, 38),
  ('result-tomas-costanera-10k', 'athlete-tomas', 'event-costanera-10k', 9, 2875, NULL, 10.0, 288, 168, 12),
  ('result-tomas-patagonia-run', 'athlete-tomas', 'event-patagonia-run', 3, 22360, 'bronze', 42.0, 532, 148, 2250),
  ('result-sofia-baires-21k', 'athlete-sofia', 'event-baires-21k', 5, 5882, NULL, 21.1, 279, 160, 38),
  ('result-sofia-patagonia-run', 'athlete-sofia', 'event-patagonia-run', 1, 10700, 'gold', 21.0, 510, 156, 1150),
  ('result-sofia-baires-42k', 'athlete-sofia', 'event-baires-42k', 22, 12948, NULL, 42.2, 307, 155, 64);
```

### Row types (`src/db/types.ts`)

Types use camelCase. Each `src/db/<entity>.ts` module maps snake_case rows to them.
`RaceEvent` and `RaceResult` avoid clashing with the DOM `Event` type and with result types.

```ts
export type Discipline = "road_running" | "trail_running" | "triathlon" | "cycling" | "swimming";
export type Medal = "gold" | "silver" | "bronze";
export type TransferStatus = "pending" | "accepted" | "rejected";

export type Athlete = { id: string; name: string; avatarUrl: string | null };

export type RaceEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  location: string;
  discipline: Discipline;
};

export type RaceResult = {
  id: string;
  athleteId: string;
  eventId: string;
  place: number | null;
  timeSeconds: number | null;
  medal: Medal | null;
  distanceKm: number | null;
  paceSecondsPerKm: number | null;
  avgHeartRate: number | null;
  elevationM: number | null;
};

export type Photo = {
  id: string;
  eventId: string;
  ownerId: string;
  uploaderId: string;
  storageKey: string;
  createdAt: string;
};

export type Transfer = {
  id: string;
  photoId: string;
  fromAthleteId: string;
  toAthleteId: string;
  status: TransferStatus;
  createdAt: string;
  resolvedAt: string | null;
};
```

### Data access and storage

```ts
// src/db/connection.ts
export async function getDatabase(): Promise<D1Database>;
// getCloudflareContext({ async: true }) from "@opennextjs/cloudflare", returns env.DB

// src/db/athletes.ts
export async function listAthletes(): Promise<Athlete[]>; // ordered by name
export async function findAthlete(athleteId: string): Promise<Athlete | undefined>;

// src/storage/photo-bucket.ts
export async function getPhotoBucket(): Promise<R2Bucket>; // env.PHOTOS
```

For atomic writes (accepting a transfer), other areas use `database.batch([...])`, which
runs its statements in one transaction.

### Session

```ts
// src/session/current-athlete.ts
export async function getCurrentAthlete(): Promise<Athlete>;
```

- Reads the `racebook_athlete` cookie. It is the only place that reads it.
- The cookie is a system boundary, so be resilient: a missing or unknown id falls back to
  the default athlete, `athlete-lucia` (named constant). It never throws for a bad cookie.
- It reads only; it does not set the cookie.

```ts
// src/session/actions.ts  ("use server")
export async function switchAthlete(formData: FormData): Promise<void>; // field "athleteId"
export async function switchLocale(formData: FormData): Promise<void>;  // field "locale"
```

- Each one validates its value (unknown athlete or locale: do nothing), sets its cookie
  (`racebook_athlete` / `racebook_locale`, path `/`, one year, `sameSite: "lax"`), and calls
  `revalidatePath("/", "layout")`. Name every one of these values.

### Languages

```ts
// src/i18n/locale.ts
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function isLocale(value: unknown): value is Locale;

// src/i18n/current-locale.ts
export async function getCurrentLocale(): Promise<Locale>;
// 1. racebook_locale cookie, if valid
// 2. first supported language in Accept-Language ("es-AR,es;q=0.9" -> "es")
// 3. defaultLocale
// The only place that reads that cookie or that header. Reads only.

// src/i18n/dictionary.ts
export type Dictionary = {
  common: CommonMessages;
  results: ResultsMessages;
  gallery: GalleryMessages;
  aiCapture: AiCaptureMessages;
};
export async function getDictionary(): Promise<Dictionary>; // for getCurrentLocale()
```

Message files follow one shape. English is the source; Spanish is typed against it, so a
missing or extra key fails the build. Copy that needs values is a function.

```ts
// src/i18n/messages/common.en.ts
export const commonEn = {
  greeting: (athleteName: string) => `Welcome back, ${athleteName}`,
  // ...
};
export type CommonMessages = typeof commonEn;

// src/i18n/messages/common.es.ts
import type { CommonMessages } from "./common.en";
export const commonEs: CommonMessages = {
  greeting: (athleteName: string) => `Hola de nuevo, ${athleteName}`,
  // ...
};
```

- Create `results`, `gallery` and `ai-capture` pairs with empty objects
  (`export const resultsEn = {}; export type ResultsMessages = typeof resultsEn;`,
  `export const resultsEs: ResultsMessages = {};`, and so on; the ai-capture names are
  `aiCaptureEn`, `aiCaptureEs`, `AiCaptureMessages`). Each area fills in its own pair later.
- `common` holds the layout copy: nav links ("Medal board" / "Medallero", "Inbox" /
  "Bandeja"), "View as" / "Ver como", the language switcher label, the placeholder greeting.
  Spanish uses *vos*.
- Server components call `getDictionary()` and pass strings down to client components as
  props. Client components don't import dictionaries.

```ts
// src/i18n/formatters.ts: pure functions, no I/O
export function formatEventDate(isoDate: string, locale: Locale): string;
// "2026-08-23" -> "Aug 23, 2026" / "23 ago 2026". Parse as UTC and format with
// timeZone "UTC" so the day never shifts.
export function formatDuration(totalSeconds: number): string;       // 5567 -> "1:32:47", 2650 -> "44:10"
export function formatPace(secondsPerKm: number): string;           // 264 -> "4:24"
export function formatDistance(distanceKm: number, locale: Locale): string; // "21.1 km" / "21,1 km"
```

Use `Intl` with a named locale-to-BCP-47 map (`en` → `en-US`, `es` → `es-AR`).

### Fonts and layout

```ts
// src/app/fonts.ts
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});
```

The `ui` area's tokens read `--font-archivo` (see `docs/brand.md`). If `next/font` rejects
the `wdth` axis for Archivo, keep the rest and report it in the plan's Status line.

`src/app/layout.tsx`:

- `<html lang={locale} className={archivo.variable}>`, keep `import "./globals.css"`.
- `metadata`: title `Racebook`, description "The athlete's book of races." Metadata stays
  in English.
- A header with: the wordmark as text (`RACEBOOK`, classes
  `italic font-black uppercase tracking-tight`), nav links to `/` (medal board) and
  `/inbox` (inbox), `<AthleteSwitcher>` and `<LanguageSwitcher>`.
- Routes the other areas will create: `/` (results), `/events/[eventId]` (results),
  `/inbox` (gallery). `/inbox` may 404 until then.

`src/components/session/athlete-switcher.tsx` (client): a labelled `<select name="athleteId">`
inside a `<form action={switchAthlete}>`; changing it submits the form
(`event.currentTarget.form?.requestSubmit()`). Props: `athletes`, `currentAthleteId`,
`label`.

`src/components/session/language-switcher.tsx` (server): a `<form action={switchLocale}>` with
one submit button per locale (`name="locale"`, `value="en"` / `"es"`, text `EN` / `ES`), and
`aria-pressed` on the current one. Props: `currentLocale`, `label`.

Use Tailwind classes from `docs/brand.md` (`panel`, `text-text-muted`, `border-line`…); they
apply once plan 02 merges.

### Placeholder home (`src/app/page.tsx`)

A server component that shows `common.greeting(currentAthlete.name)`. It proves the database,
the session cookie and the dictionaries work end to end. The `results` area replaces it.

## Steps

1. Create the worktree. In `racebook/`, run `npm install`.
2. Add the bindings to `wrangler.json`; run `npm run cf-typegen`.
3. Write `0001_init.sql` and `0002_seed.sql`. Apply them locally:
   `npx wrangler d1 migrations apply DB --local`. Check:
   `npx wrangler d1 execute DB --local --command "SELECT name FROM athletes"` lists 3 names.
4. Write `src/db/types.ts`, `src/db/connection.ts`, `src/db/athletes.ts`,
   `src/storage/photo-bucket.ts`.
5. Write `src/i18n/locale.ts`, `current-locale.ts`, all message files, `dictionary.ts`,
   `formatters.ts`.
6. Write `src/session/current-athlete.ts` and `src/session/actions.ts`.
7. Write `src/app/fonts.ts`, both switchers, `src/app/layout.tsx`, the placeholder
   `src/app/page.tsx`.
8. Run the verification below, commit in small conventional commits
   (`feat(platform): ...`), rebase on `develop`, merge into `develop`, push.
9. Set this plan's Status to `done` (or report what is blocked).

## Verification

- `npm run build` passes in `racebook/`. `npm run lint` passes.
- `npm run dev` with local migrations applied:
  - Home says "Welcome back, Lucía Fernández" in an English browser.
  - Choosing "Tomás Ibarra" in "View as" reloads with his name; it survives a page reload.
  - `ES` switches the header and greeting to Spanish ("Hola de nuevo, …"); it survives a reload.
  - A garbage `racebook_athlete` cookie (edit it in devtools) falls back to Lucía without
    an error.
- Removing a key from `common.es.ts` makes `npm run build` fail (then restore it).
- There is no test runner in this project. Given the deadline, verification is the build
  plus the manual checks above; that is a deliberate trade-off, not an omission.

## Done when

- [ ] Both bindings exist and `CloudflareEnv` is typed.
- [ ] Both migrations apply cleanly on a fresh local database.
- [ ] Every contract above exists with the exact name and signature.
- [ ] Both switchers work and persist in cookies.
- [ ] All three dictionary pairs for other areas exist, empty and typed.
- [ ] `npm run build` passes and the branch is merged into `develop`.
