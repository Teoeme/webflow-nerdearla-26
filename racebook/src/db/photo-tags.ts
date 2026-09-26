import { getDatabase } from "./connection";
import type { EventDetails } from "./events";
import { resolveDestination, type Destination, type DestinationChoice } from "./photos";
import type { PhotoTag } from "./types";

export type TagRequestOutcome = "tagged" | "not_owner" | "already_tagged" | "same_athlete";

export type IncomingTag = PhotoTag & { taggedByName: string; sourceEvent: EventDetails };
export type PhotoTagWithName = PhotoTag & { athleteName: string };

type PhotoTagRow = {
  id: string;
  photo_id: string;
  athlete_id: string;
  tagged_by_id: string;
  status: PhotoTag["status"];
  event_id: string | null;
  created_at: string;
  resolved_at: string | null;
};

type IncomingTagRow = PhotoTagRow & {
  tagged_by_name: string;
  event_name: string;
  event_date: string;
  event_location: string;
  event_discipline: EventDetails["discipline"];
};

type PhotoTagWithNameRow = PhotoTagRow & { athlete_name: string };

function toPhotoTag(row: PhotoTagRow): PhotoTag {
  return {
    id: row.id,
    photoId: row.photo_id,
    athleteId: row.athlete_id,
    taggedById: row.tagged_by_id,
    status: row.status,
    eventId: row.event_id,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

function toIncomingTag(row: IncomingTagRow): IncomingTag {
  return {
    ...toPhotoTag(row),
    taggedByName: row.tagged_by_name,
    sourceEvent: {
      name: row.event_name,
      date: row.event_date,
      location: row.event_location,
      discipline: row.event_discipline,
    },
  };
}

function toPhotoTagWithName(row: PhotoTagWithNameRow): PhotoTagWithName {
  return { ...toPhotoTag(row), athleteName: row.athlete_name };
}

// SQLite's message when photo_tags_one_open_per_athlete rejects a second open tag.
const ALREADY_TAGGED_CONFLICT = "UNIQUE constraint failed: photo_tags.photo_id, photo_tags.athlete_id";

function isAlreadyTaggedConflict(error: unknown): boolean {
  return error instanceof Error && error.message.includes(ALREADY_TAGGED_CONFLICT);
}

export async function requestTag(input: {
  photoId: string;
  taggedById: string;
  athleteId: string;
}): Promise<TagRequestOutcome> {
  if (input.taggedById === input.athleteId) return "same_athlete";

  const database = await getDatabase();
  const tagId = crypto.randomUUID();

  try {
    const insertResult = await database
      .prepare(
        `INSERT INTO photo_tags (id, photo_id, athlete_id, tagged_by_id)
         SELECT ?, id, ?, ?
         FROM photos
         WHERE id = ? AND owner_id = ?`,
      )
      .bind(tagId, input.athleteId, input.taggedById, input.photoId, input.taggedById)
      .run();

    return insertResult.meta.changes > 0 ? "tagged" : "not_owner";
  } catch (error) {
    if (isAlreadyTaggedConflict(error)) return "already_tagged";
    throw error;
  }
}

export async function listIncomingTags(athleteId: string): Promise<IncomingTag[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT
         pt.id, pt.photo_id, pt.athlete_id, pt.tagged_by_id, pt.status, pt.event_id,
         pt.created_at, pt.resolved_at,
         a.name AS tagged_by_name,
         e.name AS event_name, e.date AS event_date, e.location AS event_location,
         e.discipline AS event_discipline
       FROM photo_tags pt
       JOIN photos p ON p.id = pt.photo_id
       JOIN athletes a ON a.id = pt.tagged_by_id
       JOIN events e ON e.id = p.event_id
       WHERE pt.athlete_id = ? AND pt.status = 'pending'
       ORDER BY pt.created_at DESC`,
    )
    .bind(athleteId)
    .all<IncomingTagRow>();
  return results.map(toIncomingTag);
}

// Pending and accepted tags on the owner's photos of that event, for the grid pills.
export async function listOpenTagsOnEvent(ownerId: string, eventId: string): Promise<PhotoTagWithName[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT
         pt.id, pt.photo_id, pt.athlete_id, pt.tagged_by_id, pt.status, pt.event_id,
         pt.created_at, pt.resolved_at,
         a.name AS athlete_name
       FROM photo_tags pt
       JOIN photos p ON p.id = pt.photo_id
       JOIN athletes a ON a.id = pt.athlete_id
       WHERE p.owner_id = ? AND p.event_id = ? AND pt.status IN ('pending', 'accepted')
       ORDER BY pt.created_at DESC`,
    )
    .bind(ownerId, eventId)
    .all<PhotoTagWithNameRow>();
  return results.map(toPhotoTagWithName);
}

// Reads the pending tag under the same guard the accept batch uses (still pending,
// still on this athlete), joined to its photo's current event — always the tagger's
// original event, since the photo's own event_id never changes on a tag (only the
// tag row gets one, once accepted). Returns undefined when there is nothing left to
// accept, so the caller can bail out before writing anything.
async function findPendingTagSourceEvent(
  database: D1Database,
  tagId: string,
  athleteId: string,
): Promise<EventDetails | undefined> {
  const row = await database
    .prepare(
      `SELECT e.name AS event_name, e.date AS event_date, e.location AS event_location,
              e.discipline AS event_discipline
       FROM photo_tags pt
       JOIN photos p ON p.id = pt.photo_id
       JOIN events e ON e.id = p.event_id
       WHERE pt.id = ? AND pt.status = 'pending' AND pt.athlete_id = ?`,
    )
    .bind(tagId, athleteId)
    .first<{ event_name: string; event_date: string; event_location: string; event_discipline: EventDetails["discipline"] }>();
  if (!row) return undefined;
  return { name: row.event_name, date: row.event_date, location: row.event_location, discipline: row.event_discipline };
}

// Sets status 'accepted' and event_id = destination; the photo itself is untouched.
// Returns the destination event's id once the tag was actually accepted, or undefined
// when there was nothing pending to accept — in that case nothing is written, so a
// "new event" choice never leaves behind an orphan event.
export async function acceptTag(
  tagId: string,
  athleteId: string,
  choice: DestinationChoice,
): Promise<string | undefined> {
  const database = await getDatabase();
  const sourceEvent = await findPendingTagSourceEvent(database, tagId, athleteId);
  if (!sourceEvent) return undefined;

  const destination: Destination =
    choice.kind === "existing" ? { kind: "existing", eventId: choice.eventId } : { kind: "new", details: sourceEvent };
  const { statements: destinationStatements, eventId: destinationEventId } = resolveDestination(
    database,
    athleteId,
    destination,
  );

  const markTagAccepted = database
    .prepare(
      `UPDATE photo_tags
       SET status = 'accepted', event_id = ?, resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND status = 'pending' AND athlete_id = ?
       AND EXISTS (SELECT 1 FROM events WHERE id = ? AND owner_id = ?)`,
    )
    .bind(destinationEventId, tagId, athleteId, destinationEventId, athleteId);

  const batchResults = await database.batch([...destinationStatements, markTagAccepted]);

  const wasAccepted = batchResults[batchResults.length - 1].meta.changes > 0;
  return wasAccepted ? destinationEventId : undefined;
}

export async function rejectTag(tagId: string, athleteId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `UPDATE photo_tags
       SET status = 'rejected', resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND status = 'pending' AND athlete_id = ?`,
    )
    .bind(tagId, athleteId)
    .run();

  return result.meta.changes > 0;
}
