import { getDatabase } from "./connection";
import type { EventDetails } from "./events";
import { resolveDestination, type Destination, type DestinationChoice } from "./photos";
import type { Discipline, Transfer } from "./types";

export type IncomingTransfer = Transfer & {
  fromAthleteName: string;
  sourceEvent: EventDetails;
};

export type TransferRequestOutcome = "requested" | "not_owner" | "already_pending" | "same_athlete";

type TransferRow = {
  id: string;
  photo_id: string;
  from_athlete_id: string;
  to_athlete_id: string;
  status: Transfer["status"];
  created_at: string;
  resolved_at: string | null;
};

type IncomingTransferRow = TransferRow & {
  from_athlete_name: string;
  event_name: string;
  event_date: string;
  event_location: string;
  event_discipline: Discipline;
};

function toTransfer(row: TransferRow): Transfer {
  return {
    id: row.id,
    photoId: row.photo_id,
    fromAthleteId: row.from_athlete_id,
    toAthleteId: row.to_athlete_id,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

function toIncomingTransfer(row: IncomingTransferRow): IncomingTransfer {
  return {
    ...toTransfer(row),
    fromAthleteName: row.from_athlete_name,
    sourceEvent: {
      name: row.event_name,
      date: row.event_date,
      location: row.event_location,
      discipline: row.event_discipline,
    },
  };
}

// SQLite's message when transfers_one_pending_per_photo rejects a second pending row.
const PENDING_TRANSFER_CONFLICT = "UNIQUE constraint failed: transfers.photo_id";

function isPendingTransferConflict(error: unknown): boolean {
  return error instanceof Error && error.message.includes(PENDING_TRANSFER_CONFLICT);
}

export async function listIncomingTransfers(athleteId: string): Promise<IncomingTransfer[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT
         t.id, t.photo_id, t.from_athlete_id, t.to_athlete_id, t.status, t.created_at, t.resolved_at,
         a.name AS from_athlete_name,
         e.name AS event_name, e.date AS event_date, e.location AS event_location,
         e.discipline AS event_discipline
       FROM transfers t
       JOIN photos p ON p.id = t.photo_id
       JOIN athletes a ON a.id = t.from_athlete_id
       JOIN events e ON e.id = p.event_id
       WHERE t.to_athlete_id = ? AND t.status = 'pending'
       ORDER BY t.created_at DESC`,
    )
    .bind(athleteId)
    .all<IncomingTransferRow>();
  return results.map(toIncomingTransfer);
}

export async function listPendingTransfersFrom(
  athleteId: string,
  eventId: string,
): Promise<Transfer[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT t.id, t.photo_id, t.from_athlete_id, t.to_athlete_id, t.status, t.created_at, t.resolved_at
       FROM transfers t
       JOIN photos p ON p.id = t.photo_id
       WHERE t.from_athlete_id = ? AND p.event_id = ? AND t.status = 'pending'
       ORDER BY t.created_at DESC`,
    )
    .bind(athleteId, eventId)
    .all<TransferRow>();
  return results.map(toTransfer);
}

export async function requestTransfer(input: {
  photoId: string;
  fromAthleteId: string;
  toAthleteId: string;
}): Promise<TransferRequestOutcome> {
  if (input.fromAthleteId === input.toAthleteId) return "same_athlete";

  const database = await getDatabase();
  const transferId = crypto.randomUUID();

  try {
    const insertResult = await database
      .prepare(
        `INSERT INTO transfers (id, photo_id, from_athlete_id, to_athlete_id)
         SELECT ?, id, owner_id, ?
         FROM photos
         WHERE id = ? AND owner_id = ?`,
      )
      .bind(transferId, input.toAthleteId, input.photoId, input.fromAthleteId)
      .run();

    return insertResult.meta.changes > 0 ? "requested" : "not_owner";
  } catch (error) {
    if (isPendingTransferConflict(error)) return "already_pending";
    throw error;
  }
}

// Pre-read guard the accept batch relies on: is this transfer still pending and still
// addressed to this recipient? Only an existence check — the "new event" details, when
// the recipient chose one, are already validated by the caller (see
// features/gallery/accept-event-details.ts), not read from the transfer's source event.
async function isTransferPending(
  database: D1Database,
  transferId: string,
  recipientId: string,
): Promise<boolean> {
  const row = await database
    .prepare(`SELECT 1 FROM transfers WHERE id = ? AND status = 'pending' AND to_athlete_id = ?`)
    .bind(transferId, recipientId)
    .first();
  return row !== null;
}

// Returns the destination event's id once the transfer was actually accepted, or
// undefined when there was nothing pending to accept (already resolved, wrong
// recipient, or a double submit) — in that case nothing is written, so a "new event"
// choice never leaves behind an orphan event.
export async function acceptTransfer(
  transferId: string,
  recipientId: string,
  choice: DestinationChoice,
): Promise<string | undefined> {
  const database = await getDatabase();
  if (!(await isTransferPending(database, transferId, recipientId))) return undefined;

  const destination: Destination =
    choice.kind === "existing" ? { kind: "existing", eventId: choice.eventId } : { kind: "new", details: choice.details };
  const { statements: destinationStatements, eventId: destinationEventId } = resolveDestination(
    database,
    recipientId,
    destination,
  );

  const movePhotoToRecipient = database
    .prepare(
      `UPDATE photos
       SET owner_id = ?, event_id = ?
       WHERE id = (
         SELECT photo_id FROM transfers WHERE id = ? AND status = 'pending' AND to_athlete_id = ?
       )
       AND EXISTS (SELECT 1 FROM events WHERE id = ? AND owner_id = ?)`,
    )
    .bind(recipientId, destinationEventId, transferId, recipientId, destinationEventId, recipientId);

  const markTransferAccepted = database
    .prepare(
      `UPDATE transfers
       SET status = 'accepted', resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND status = 'pending' AND to_athlete_id = ?
       AND EXISTS (SELECT 1 FROM events WHERE id = ? AND owner_id = ?)`,
    )
    .bind(transferId, recipientId, destinationEventId, recipientId);

  const batchResults = await database.batch([
    ...destinationStatements,
    movePhotoToRecipient,
    markTransferAccepted,
  ]);

  const wasAccepted = batchResults[batchResults.length - 1].meta.changes > 0;
  return wasAccepted ? destinationEventId : undefined;
}

export async function rejectTransfer(transferId: string, recipientId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database
    .prepare(
      `UPDATE transfers
       SET status = 'rejected', resolved_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND status = 'pending' AND to_athlete_id = ?`,
    )
    .bind(transferId, recipientId)
    .run();

  return result.meta.changes > 0;
}
