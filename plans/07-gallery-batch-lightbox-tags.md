# 07 · gallery · Batch upload, lightbox, tags and destination events

**Status:** done

## Goal

On their event page an athlete uploads many photos at once and browses them in a
lightbox. Per photo, the owner can **transfer** it (it moves to the friend) or **tag** a
friend (it stays, and also appears in the friend's gallery). In the inbox, accepting a
transfer or a tag asks where the photo goes: one of the recipient's own events, or a new
event prefilled with the sender's event data.

## Area and branch

- Area: `gallery`
- Branch and worktree, created from `develop` **after plan 05 is merged**:
  ```sh
  git worktree add ../webflow-nerdearla-26-gallery-tags -b feat/gallery-tags develop
  ```
- All paths below are relative to `racebook/`.

## Read first

- `AGENTS.md` (including *Public repository*), `README.md`, `docs/brand.md`.
- `plans/05-platform-private-events.md` → *Contracts*, and the real `src/db/events.ts`
  and `src/db/types.ts` on `develop` (they win over the plan).
- The current gallery code: `src/features/gallery/`, `src/app/inbox/page.tsx`,
  `src/app/api/photos/**`, `src/db/photos.ts`, `src/db/transfers.ts`.
- Load the *Código Sostenible* skills before writing code: `cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`.

## Owns

- `src/db/photos.ts`, `src/db/transfers.ts`, `src/db/photo-tags.ts` (new)
- `src/features/gallery/` (everything inside)
- `src/app/api/photos/route.ts`, `src/app/api/photos/[photoId]/route.ts`
- `src/app/inbox/page.tsx`
- `src/i18n/messages/gallery.en.ts`, `src/i18n/messages/gallery.es.ts`

## Must not touch

- `src/db/events.ts`, `src/db/results.ts`, `src/app/page.tsx`, `src/app/events/**`,
  `src/features/results/`: owned by `results` (plan 06, in parallel). Use only the plan 05
  functions of `events.ts`, never the deprecated `findEvent` / `listEvents`.
- Migrations, `src/db/types.ts`, `src/session/`, `src/app/layout.tsx`, `src/components/`
  (missing a ui component? report it).
- `docs/`, `plans/` (except this Status line), `README.md`, `AGENTS.md`.

## Depends on

Plan 05 merged. `EventGallery` keeps its exact signature
(`export async function EventGallery(props: { eventId: string }): Promise<JSX.Element>`):
plan 06 renders it and changes nothing about it.

## Contracts

### Consumed (from plan 05)

```ts
import { listEventsOwnedBy, findOwnedEvent, prepareEventInsert, type EventDetails } from "@/db/events";
import type { Photo, PhotoTag, Transfer, RaceEvent } from "@/db/types";
```

### Destination (shared by transfers and tags)

```ts
// src/db/photos.ts
export type Destination =
  | { kind: "existing"; eventId: string }
  | { kind: "new"; details: EventDetails };
```

Every accept runs **one** `database.batch([...])`:

1. If `kind: "new"`: the statement from `prepareEventInsert(database, recipientId, details)`,
   and its `event.id` becomes the destination id.
2. The photo or tag update, guarded in SQL by: the request is `pending`, addressed to
   `recipientId`, **and** `EXISTS (SELECT 1 FROM events WHERE id = :destination AND
   owner_id = :recipientId)`.
3. The request update (`accepted`, `resolved_at`), with the **same** guards.

The function returns whether statement 3 changed a row. A destination event that is not
the recipient's changes nothing.

### Photos (`src/db/photos.ts`)

```ts
export type EventPhoto = Photo & { taggedByName: string | null }; // null: I own it

// Photos I own in this event, plus photos I was tagged on and accepted into this event.
// A photo appears once (DISTINCT by id). Newest first.
export async function listEventPhotos(athleteId: string, eventId: string): Promise<EventPhoto[]>;
export async function findPhoto(photoId: string): Promise<Photo | undefined>;
export async function createPhoto(input: PhotoInput): Promise<void>; // unchanged
// Remove listPhotosOwnedBy and findEventName (use findOwnedEvent).
```

### Transfers (`src/db/transfers.ts`)

```ts
export type IncomingTransfer = Transfer & {
  fromAthleteName: string;
  sourceEvent: EventDetails; // the sender's event, used to prefill "new event"
};
export async function acceptTransfer(
  transferId: string,
  recipientId: string,
  destination: Destination,
): Promise<boolean>; // photo: owner_id and event_id change together
// requestTransfer, rejectTransfer, listPendingTransfersFrom keep their signatures.
```

### Tags (`src/db/photo-tags.ts`)

```ts
export type TagRequestOutcome = "tagged" | "not_owner" | "already_tagged" | "same_athlete";
export type IncomingTag = PhotoTag & { taggedByName: string; sourceEvent: EventDetails };
export type PhotoTagWithName = PhotoTag & { athleteName: string };

export async function requestTag(input: {
  photoId: string;
  taggedById: string;
  athleteId: string;
}): Promise<TagRequestOutcome>;
// Owner check in SQL (INSERT ... SELECT ... WHERE photos.owner_id = taggedById);
// the unique index photo_tags_one_open_per_athlete → "already_tagged" (match that
// index's message only, like transfers do).
export async function listIncomingTags(athleteId: string): Promise<IncomingTag[]>; // pending, newest first
export async function listOpenTagsOnEvent(ownerId: string, eventId: string): Promise<PhotoTagWithName[]>;
// pending + accepted tags on the owner's photos of that event, for the grid pills
export async function acceptTag(tagId: string, athleteId: string, destination: Destination): Promise<boolean>;
// sets status 'accepted', event_id = destination; the photo itself is untouched
export async function rejectTag(tagId: string, athleteId: string): Promise<boolean>;
```

A transferred photo keeps its tags. Only the current owner transfers or tags; a photo you
see through a tag is read-only for you.

## Behaviour

### Batch upload

- A client component with `<input type="file" multiple accept=...>`. It uploads the
  selected files **one request per file**, sequentially (no request carries more than one
  photo, so the Workers body limit never matters), and shows a row per file: waiting,
  uploading, done, rejected (with the reason). Then `router.refresh()`.
- `POST /api/photos` now takes one file and answers JSON: `201 { photoId }`, or `400
  { reason: "type" | "size" | "missing" }`, or `404` when the event is not the current
  athlete's (`findOwnedEvent`). Keep the named type list and size limit, in **one** module
  that both the route and the client component import (today they are two constants).
- Remove `?upload=invalid` and `UploadErrorBanner`.

### Lightbox

- The grid thumbnails are buttons. Clicking one opens a lightbox (client component, native
  `<dialog>`): the photo large (`object-contain`), previous / next buttons, ← / → keys,
  Esc and a close button, a counter ("3 of 12" / "3 de 12", a dictionary function), and
  "Tagged by <name>" when it applies. Focus returns to the thumbnail on close.
- Only the URLs, alt texts and labels cross into the client component (strings, no
  dictionary functions).

### Per-photo actions (owner only)

- Under each owned photo: a `Select` of the other athletes and two buttons, "Transfer" /
  "Transferir" and "Tag" / "Etiquetar" (both outline; the primary action of the gallery is
  the upload). Pills show pending transfer, and each tag (pending / accepted) with the
  athlete's name.
- Show a translated message for every non-success outcome (`already_pending`,
  `already_tagged`, `not_owner`, `same_athlete`) instead of ignoring it.

### Inbox

- Two sections: "Photos sent to you" / "Fotos que te mandaron" (transfers) and "You were
  tagged" / "Te etiquetaron" (tags). Empty state when both are empty.
- Each item: the photo, who sent or tagged it and from which event, and a destination
  `Select`: my events (`listEventsOwnedBy`, by name and date) plus "New event: <source
  event name>" / "Evento nuevo: …". Preselect my event with the same name and date if there
  is one; otherwise "new". "Accept" (primary) and "Reject" (outline).
- After accepting, link to the destination event.

## Steps

1. Create the worktree; `npm install`; apply local migrations (fresh `.wrangler/state`).
2. `photos.ts` (`Destination`, `listEventPhotos`), `transfers.ts` (accept with
   destination, `IncomingTransfer.sourceEvent`), `photo-tags.ts`. Check each accept batch
   and guard by hand with `wrangler d1 execute --local`.
3. Upload route (one file, JSON, ownership) and the batch uploader.
4. Grid + lightbox, per-photo actions and outcome messages.
5. Inbox with both sections and the destination picker.
6. Verification, small conventional commits (`feat(gallery): ...`), Status `done`.

## Verification

- `npm run build` and `npm run lint` pass.
- `npm run dev` (plan 06 may not be merged: use `/events/<event>-lucia` URLs, which exist
  after plan 05):
  - As Lucía, select 5 images plus 1 PDF: 5 upload, the PDF row says rejected, the grid
    shows 5 new photos. Posting to `/api/photos` with Tomás's event id returns 404.
  - The lightbox opens on the clicked photo; ←/→ and Esc work; the counter is right.
  - Tag Tomás on photo 1 and transfer photo 2 to Sofía. Tagging Tomás again on photo 1
    shows "already tagged".
  - As Tomás, accept the tag into "New event: Medio Maratón de Buenos Aires": a new event
    appears on his medal board with photo 1 in its gallery, marked "Tagged by Lucía";
    Lucía still has photo 1.
  - As Sofía, accept the transfer into her existing `event-baires-21k-sofia`: photo 2 is in
    her gallery and no longer in Lucía's.
  - Posting an accept with an event of another athlete as destination changes nothing.
  - `ES` switches every string.

## Done when

- [ ] Batch upload, lightbox, tag and transfer with destination work, in both languages.
- [ ] Every accept is one batch, guarded by pending + recipient + destination ownership.
- [ ] Every Provided signature exists with the exact name; removed functions are gone.
- [ ] No hard-coded user-facing strings; build passes.
