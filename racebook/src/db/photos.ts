import { getDatabase } from "./connection";
import { prepareEventInsert, type EventDetails } from "./events";
import type { Photo } from "./types";

export type PhotoInput = Pick<Photo, "id" | "eventId" | "ownerId" | "uploaderId" | "storageKey">;

// A photo I own, or a photo I was tagged on and accepted into one of my events.
// `taggedByName` is null when I own the photo outright.
export type EventPhoto = Photo & { taggedByName: string | null };

// A transfer or a tag can be accepted into one of the recipient's existing events, or
// into a brand-new one prefilled from the sender's event.
export type Destination = { kind: "existing"; eventId: string } | { kind: "new"; details: EventDetails };

// What the recipient decided when accepting: an existing event's id, or a brand-new
// event's details. The "new" details are prefilled from the sender's event but editable,
// so the accept server action validates them (required fields, YYYY-MM-DD date,
// discipline in the enum) before they ever reach this type — see
// features/gallery/accept-event-details.ts.
export type DestinationChoice = { kind: "existing"; eventId: string } | { kind: "new"; details: EventDetails };

type PhotoRow = {
  id: string;
  event_id: string;
  owner_id: string;
  uploader_id: string;
  storage_key: string;
  created_at: string;
};

type EventPhotoRow = PhotoRow & { tagged_by_name: string | null };

function toPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    eventId: row.event_id,
    ownerId: row.owner_id,
    uploaderId: row.uploader_id,
    storageKey: row.storage_key,
    createdAt: row.created_at,
  };
}

function toEventPhoto(row: EventPhotoRow): EventPhoto {
  return { ...toPhoto(row), taggedByName: row.tagged_by_name };
}

// Photos I own in this event, plus photos I was tagged on and accepted into this event.
// A photo appears once (grouped by id): the two branches never overlap in practice
// (an athlete can't tag themselves), but grouping keeps that guarantee explicit.
export async function listEventPhotos(athleteId: string, eventId: string): Promise<EventPhoto[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT id, event_id, owner_id, uploader_id, storage_key, created_at,
              MAX(tagged_by_name) AS tagged_by_name
       FROM (
         SELECT p.id, p.event_id, p.owner_id, p.uploader_id, p.storage_key, p.created_at,
                NULL AS tagged_by_name
         FROM photos p
         WHERE p.owner_id = ? AND p.event_id = ?

         UNION ALL

         SELECT p.id, p.event_id, p.owner_id, p.uploader_id, p.storage_key, p.created_at,
                a.name AS tagged_by_name
         FROM photos p
         JOIN photo_tags t ON t.photo_id = p.id
         JOIN athletes a ON a.id = t.tagged_by_id
         WHERE t.athlete_id = ? AND t.status = 'accepted' AND t.event_id = ?
       )
       GROUP BY id
       ORDER BY created_at DESC`,
    )
    .bind(athleteId, eventId, athleteId, eventId)
    .all<EventPhotoRow>();
  return results.map(toEventPhoto);
}

export async function findPhoto(photoId: string): Promise<Photo | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare(
      `SELECT id, event_id, owner_id, uploader_id, storage_key, created_at
       FROM photos
       WHERE id = ?`,
    )
    .bind(photoId)
    .first<PhotoRow>();
  return row ? toPhoto(row) : undefined;
}

// Deletes a photo the athlete owns, together with every row that points at it (its
// transfers and tags, and the cover of any event), in one transaction. Returns the
// storage key to remove from the bucket, or undefined when the photo isn't theirs.
export async function deleteOwnedPhoto(photoId: string, ownerId: string): Promise<string | undefined> {
  const database = await getDatabase();
  const photo = await findPhoto(photoId);
  if (!photo || photo.ownerId !== ownerId) return undefined;

  const ownedPhotoGuard = "EXISTS (SELECT 1 FROM photos WHERE id = ? AND owner_id = ?)";
  const results = await database.batch([
    database.prepare(`DELETE FROM photo_tags WHERE photo_id = ? AND ${ownedPhotoGuard}`).bind(photoId, photoId, ownerId),
    database.prepare(`DELETE FROM transfers WHERE photo_id = ? AND ${ownedPhotoGuard}`).bind(photoId, photoId, ownerId),
    database
      .prepare(`UPDATE events SET cover_photo_id = NULL WHERE cover_photo_id = ? AND ${ownedPhotoGuard}`)
      .bind(photoId, photoId, ownerId),
    database.prepare("DELETE FROM photos WHERE id = ? AND owner_id = ?").bind(photoId, ownerId),
  ]);
  const wasDeleted = results[results.length - 1].meta.changes > 0;
  return wasDeleted ? photo.storageKey : undefined;
}

export async function createPhoto(input: PhotoInput): Promise<void> {
  const database = await getDatabase();
  await database
    .prepare(
      `INSERT INTO photos (id, event_id, owner_id, uploader_id, storage_key)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(input.id, input.eventId, input.ownerId, input.uploaderId, input.storageKey)
    .run();
}

// Shared by transfers.ts and photo-tags.ts: turns a Destination into the statement(s)
// needed inside their single accept batch, and the event id to write on the photo or tag.
export function resolveDestination(
  database: D1Database,
  recipientId: string,
  destination: Destination,
): { statements: D1PreparedStatement[]; eventId: string } {
  if (destination.kind === "existing") {
    return { statements: [], eventId: destination.eventId };
  }
  const { statement, event } = prepareEventInsert(database, recipientId, destination.details);
  return { statements: [statement], eventId: event.id };
}
