import { getDatabase } from "./connection";
import type { Discipline, RaceEvent } from "./types";

type EventRow = {
  id: string;
  owner_id: string;
  name: string;
  date: string;
  location: string;
  discipline: Discipline;
  cover_photo_id: string | null;
};

const EVENT_COLUMNS = "id, owner_id, name, date, location, discipline, cover_photo_id";

function toRaceEvent(row: EventRow): RaceEvent {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    date: row.date,
    location: row.location,
    discipline: row.discipline,
    coverPhotoId: row.cover_photo_id,
  };
}

export async function listEventsOwnedBy(ownerId: string): Promise<RaceEvent[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE owner_id = ? ORDER BY date DESC`)
    .bind(ownerId)
    .all<EventRow>();
  return results.map(toRaceEvent);
}

export async function findOwnedEvent(eventId: string, ownerId: string): Promise<RaceEvent | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ? AND owner_id = ?`)
    .bind(eventId, ownerId)
    .first<EventRow>();
  return row ? toRaceEvent(row) : undefined;
}

export type EventDetails = Omit<RaceEvent, "id" | "ownerId" | "coverPhotoId">;

// For atomic writes in another module's database.batch([...]) (plan 07 accepts a transfer
// or tag into a brand-new event in one transaction). It prepares; it does not run.
// A brand-new event never starts with a cover: the athlete sets one afterwards, from
// their gallery.
export function prepareEventInsert(
  database: D1Database,
  ownerId: string,
  details: EventDetails,
): { statement: D1PreparedStatement; event: RaceEvent } {
  const event: RaceEvent = { id: crypto.randomUUID(), ownerId, ...details, coverPhotoId: null };
  const statement = database
    .prepare("INSERT INTO events (id, owner_id, name, date, location, discipline) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(event.id, event.ownerId, event.name, event.date, event.location, event.discipline);
  return { statement, event };
}

export async function createEvent(ownerId: string, details: EventDetails): Promise<RaceEvent> {
  const database = await getDatabase();
  const { statement, event } = prepareEventInsert(database, ownerId, details);
  await statement.run();
  return event;
}

// Sets an event's cover photo. Guards both sides of the relationship so an athlete can
// only point their event at a photo they actually own in that same event: the update
// only takes effect when both EXISTS conditions hold. Returns whether a row changed.
export async function setEventCover(eventId: string, ownerId: string, photoId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `UPDATE events
       SET cover_photo_id = ?
       WHERE id = ? AND owner_id = ?
         AND EXISTS (
           SELECT 1 FROM photos WHERE id = ? AND owner_id = ? AND event_id = ?
         )`,
    )
    .bind(photoId, eventId, ownerId, photoId, ownerId, eventId)
    .run();
  return result.meta.changes > 0;
}
