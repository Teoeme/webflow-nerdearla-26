# 04 · gallery · Photos and transfers

**Status:** todo

## Goal

On each event page the current athlete sees their photos of that event, uploads new ones
and asks to transfer a photo to the friend who appears in it. The friend finds the request
in their inbox, accepts or rejects it, and an accepted photo moves to their gallery for
the same event. This is the hero feature: it must never be cut.

## Area and branch

- Area: `gallery`
- Branch and worktree, created from `develop` **after plans 01 and 02 are merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-gallery -b feat/gallery develop
  ```
- All paths below are relative to `racebook/` (the Next.js app).

## Read first

- `AGENTS.md` (parallel work, shared contracts, languages, code standards).
- `README.md` → *The problem* and *Data model* (transfer rules).
- `docs/brand.md` (reject is a neutral outline button; there is no red).
- `plans/01-platform-foundation.md` → *Contracts* and `plans/02-ui-kit.md` → *Contracts*.
  Read the real files on `develop`; they win over the plans.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

Create or modify only these:

- `src/db/photos.ts`, `src/db/transfers.ts`
- `src/features/gallery/` (everything inside: `event-gallery.tsx`, other components,
  server actions)
- `src/app/api/photos/route.ts` (upload), `src/app/api/photos/[photoId]/route.ts` (serve)
- `src/app/inbox/page.tsx`
- `src/i18n/messages/gallery.en.ts`, `src/i18n/messages/gallery.es.ts`

## Must not touch

- `src/app/page.tsx`, `src/app/events/`, `src/features/results/`, `src/db/events.ts`,
  `src/db/results.ts`: owned by `results` (plan 03, runs in parallel). The event page
  renders your `EventGallery`; you don't edit that page.
- `src/db/types.ts`, `connection.ts`, `athletes.ts`, migrations, `src/storage/`,
  `src/session/`, `src/i18n/` outside your two message files, `src/app/layout.tsx`,
  `next.config.ts`: owned by `platform`.
- `src/app/globals.css`, `src/components/ui/`: owned by `ui`. Missing a component or a
  variant? Report it; don't build a parallel one.
- `docs/`, `plans/` (except the Status line of this file), `README.md`, `AGENTS.md`.

## Depends on

Plans 01 and 02, merged into `develop`. Plan 03 depends on **your step 2** (the stub), so
land it on `develop` first, before anything else.

## Contracts

### Consumed (exact, from the other plans)

```ts
// platform
import { getDatabase } from "@/db/connection";          // Promise<D1Database>
import { listAthletes, findAthlete } from "@/db/athletes";
import type { Athlete, Photo, Transfer } from "@/db/types";
import { getPhotoBucket } from "@/storage/photo-bucket"; // Promise<R2Bucket>
import { getCurrentAthlete } from "@/session/current-athlete"; // Promise<Athlete>
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";            // dictionary.gallery
import { formatEventDate } from "@/i18n/formatters";

// ui
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/status-pill"; // { status, label }
// plus the `panel`, `text-heading`, `text-label` classes
```

### Provided

```tsx
// src/features/gallery/event-gallery.tsx: plan 03 renders it on /events/[eventId]
export async function EventGallery(props: { eventId: string }): Promise<JSX.Element>;
// Server component. Reads the current athlete and the dictionary itself.
```

```ts
// src/db/photos.ts
export type PhotoInput = Pick<Photo, "id" | "eventId" | "ownerId" | "uploaderId" | "storageKey">;
export async function listPhotosOwnedBy(athleteId: string, eventId: string): Promise<Photo[]>; // newest first
export async function findPhoto(photoId: string): Promise<Photo | undefined>;
export async function createPhoto(input: PhotoInput): Promise<void>;

// src/db/transfers.ts
export type IncomingTransfer = Transfer & {
  fromAthleteName: string;
  eventId: string;
  eventName: string;
};
export async function listIncomingTransfers(athleteId: string): Promise<IncomingTransfer[]>; // pending, newest first
export async function listPendingTransfersFrom(athleteId: string, eventId: string): Promise<Transfer[]>;
export async function requestTransfer(input: {
  photoId: string;
  fromAthleteId: string;
  toAthleteId: string;
}): Promise<TransferRequestOutcome>;
export type TransferRequestOutcome = "requested" | "not_owner" | "already_pending" | "same_athlete";
export async function acceptTransfer(transferId: string, recipientId: string): Promise<boolean>;
export async function rejectTransfer(transferId: string, recipientId: string): Promise<boolean>;
// true when a pending transfer addressed to recipientId was resolved; false otherwise.
```

Rows are snake_case; map them to the camelCase types in one mapping function per module.
All SQL uses bound parameters. `transfers.ts` may JOIN `athletes` and `events` for
`IncomingTransfer`; that is a read, not a change to their modules.

### Routes

| Route | Content |
|---|---|
| `POST /api/photos` | Upload (multipart form). Redirects (303) back to `/events/[eventId]` |
| `GET /api/photos/[photoId]` | The image bytes from Object Storage |
| `/inbox` | Pending transfers addressed to the current athlete |

## Rules (from the README data model)

- Only the current owner can request a transfer of a photo. Check it in the query
  (`WHERE id = ? AND owner_id = ?`), not only in the UI.
- A photo has at most one `pending` transfer. The unique index
  `transfers_one_pending_per_photo` enforces it: a constraint error on insert is the
  expected `"already_pending"` outcome, not a crash.
- Accepting is atomic, with one `database.batch([...])` (one transaction):
  1. `UPDATE photos SET owner_id = t.to_athlete_id WHERE id = t.photo_id AND EXISTS
     (pending transfer with this id, addressed to recipientId)`
  2. `UPDATE transfers SET status = 'accepted', resolved_at = now WHERE id = ? AND
     status = 'pending' AND to_athlete_id = ?`
  The guard is in both statements, so a stale or foreign request changes nothing.
  `acceptTransfer` returns whether statement 2 changed a row.
- Rejecting only updates the transfer (`status = 'rejected'`, `resolved_at`), with the
  same guard. The photo stays with its owner.
- The acting athlete is always `getCurrentAthlete()`, read on the server. It is never a
  form field.

## Upload and storage

- Upload goes through a **route handler**, not a server action: server actions have a
  1 MB body limit by default, and changing it means editing `next.config.ts`, which is
  not yours. The form is a plain `<form method="post" action="/api/photos"
  encType="multipart/form-data">` with fields `eventId` and `photo`.
- Validate on the server: file present, type in a named list (`image/jpeg`, `image/png`,
  `image/webp`), size under a named maximum (10 MB). A bad upload redirects back with
  `?upload=invalid` and the gallery shows a translated message; it doesn't throw.
- Order: `put` the object first, then `createPhoto`; if the insert fails (for example, an
  unknown event id violates the foreign key), `delete` the object so nothing is orphaned.
- Storage key: `photos/<photoId>`. Store the content type in the object's
  `httpMetadata`.
- `GET /api/photos/[photoId]`: `findPhoto`, then `bucket.get(storageKey)`; 404 if either
  is missing. Respond with the object's content type and
  `Cache-Control: public, max-age=31536000, immutable` (a key never changes content).
- The app runs as an Independent Webflow Cloud app, with no base path, so image URLs are
  `/api/photos/<id>`.

## Screens

Everything a user reads comes from `dictionary.gallery` (both languages, *vos* in
Spanish: "Aceptá la foto"). Athlete and event names are data.

### `EventGallery` (inside the event page)

- Heading "My photos" / "Mis fotos" (`text-heading`).
- A grid of the current athlete's photos for the event (`rounded-sm`, `object-cover`,
  fixed aspect ratio, `loading="lazy"`, `alt` from the dictionary with the event name).
- Under each photo: if it has a pending outgoing transfer, a `StatusPill` "pending" with
  the recipient's name; otherwise a small form: `Select` of the other athletes ("Send to…"
  / "Enviar a…") and an outline `Button` "Transfer" / "Transferir". Its server action
  calls `requestTransfer` and `revalidatePath` of the event page.
- The upload form: file `Input` (`accept` from the named type list) and the gallery's
  primary `Button` "Upload photo" / "Subí una foto".
- Empty state: a short line inviting the first upload.

### Inbox (`/inbox`)

- Title in `text-display` ("Inbox" / "Bandeja").
- One `panel` per incoming pending transfer: the photo, "<name> sent you a photo from
  <event>" (a dictionary function), date, and two buttons: "Accept" / "Aceptá la foto"
  (primary) and "Reject" / "Rechazar" (outline). Server actions call `acceptTransfer` /
  `rejectTransfer` and `revalidatePath("/", "layout")`.
- After accepting, a link to the event where the photo now lives.
- Empty state: "No photos waiting for you" / "No tenés fotos pendientes".

## Steps

1. Create the worktree. In `racebook/`, run `npm install` and
   `npx wrangler d1 migrations apply DB --local`.
2. **Stub first.** `src/features/gallery/event-gallery.tsx` exporting the exact
   `EventGallery` signature and rendering an empty `<section>`. `npm run build` passes.
   Commit (`feat(gallery): add EventGallery stub`), rebase on `develop`, merge into
   `develop`, push. Plan 03 is waiting on it.
3. `src/db/photos.ts` and `src/db/transfers.ts`. Check the accept batch by hand with
   `wrangler d1 execute --local` against rows you insert.
4. `gallery.en.ts` / `gallery.es.ts`, filled as the screens need copy.
5. Upload and serve route handlers.
6. The real `EventGallery`: grid, upload form, transfer request form and action.
7. `/inbox` with accept and reject actions.
8. Run the verification, commit in small conventional commits (`feat(gallery): ...`),
   rebase on `develop`, merge into `develop`, push.
9. Set this plan's Status to `done` (or report what is blocked).

## Verification

- `npm run build` and `npm run lint` pass in `racebook/`.
- With `npm run dev` and local migrations applied (the event page comes from plan 03; if
  it is not merged yet, render `<EventGallery eventId="event-baires-21k" />` in a scratch
  page that is **never committed**):
  - As Lucía, upload a JPEG to `event-baires-21k`: it appears in her gallery and is served
    by `/api/photos/<id>`. A 20 MB file or a PDF shows the error message and stores
    nothing (check the table and the bucket).
  - Transfer it to Tomás: the photo shows "pending" and the transfer form disappears.
    Trying again through the form (or a replayed request) saves no second pending row.
  - Switch to Tomás: `/inbox` shows the request with Lucía's name and the event. Accept:
    the photo leaves the inbox, appears in Tomás's gallery for that event and no longer
    in Lucía's.
  - Repeat with a second photo and reject: it stays with Lucía and she can transfer it
    again.
  - As Sofía, posting an accept for Tomás's transfer id changes nothing.
  - `ES` switches every string on these screens.
- There is no test runner in this project. Given the deadline, verification is the build
  plus the manual checks above; that is a deliberate trade-off, not an omission.

## Done when

- [ ] The stub landed on `develop` before the rest of the work.
- [ ] Upload, serve, request, accept and reject work as described, in both languages.
- [ ] Accept is a single `batch`, guarded by owner/recipient and `pending` in SQL.
- [ ] Every `Provided` signature exists with the exact name.
- [ ] No SQL outside `src/db/`; no hard-coded user-facing strings; no cookie reads.
- [ ] `npm run build` passes and the branch is merged into `develop`.
