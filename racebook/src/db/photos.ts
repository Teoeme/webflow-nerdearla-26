import { getDatabase } from "./connection";
import type { Photo } from "./types";

export type PhotoInput = Pick<Photo, "id" | "eventId" | "ownerId" | "uploaderId" | "storageKey">;

type PhotoRow = {
  id: string;
  event_id: string;
  owner_id: string;
  uploader_id: string;
  storage_key: string;
  created_at: string;
};

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

export async function listPhotosOwnedBy(athleteId: string, eventId: string): Promise<Photo[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT id, event_id, owner_id, uploader_id, storage_key, created_at
       FROM photos
       WHERE owner_id = ? AND event_id = ?
       ORDER BY created_at DESC`,
    )
    .bind(athleteId, eventId)
    .all<PhotoRow>();
  return results.map(toPhoto);
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

// The `results` area owns `src/db/events.ts`; this is a narrow, read-only lookup
// (same pattern `transfers.ts` uses to join `events` for `IncomingTransfer`),
// needed here only to label a photo's alt text with its event name.
export async function findEventName(eventId: string): Promise<string | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare("SELECT name FROM events WHERE id = ?")
    .bind(eventId)
    .first<{ name: string }>();
  return row?.name;
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
