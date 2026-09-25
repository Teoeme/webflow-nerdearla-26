import { getDatabase } from "./connection";
import type { Discipline, Medal, RaceEvent, RaceResult } from "./types";

type ResultRow = {
  id: string;
  athlete_id: string;
  event_id: string;
  place: number | null;
  time_seconds: number | null;
  medal: Medal | null;
  distance_km: number | null;
  pace_seconds_per_km: number | null;
  avg_heart_rate: number | null;
  elevation_m: number | null;
};

type EventWithResultRow = {
  id: string;
  owner_id: string;
  name: string;
  date: string;
  location: string;
  discipline: Discipline;
  result_id: string | null;
  athlete_id: string | null;
  place: number | null;
  time_seconds: number | null;
  medal: Medal | null;
  distance_km: number | null;
  pace_seconds_per_km: number | null;
  avg_heart_rate: number | null;
  elevation_m: number | null;
};

function toRaceResult(row: ResultRow): RaceResult {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    eventId: row.event_id,
    place: row.place,
    timeSeconds: row.time_seconds,
    medal: row.medal,
    distanceKm: row.distance_km,
    paceSecondsPerKm: row.pace_seconds_per_km,
    avgHeartRate: row.avg_heart_rate,
    elevationM: row.elevation_m,
  };
}

function toEventEntry(row: EventWithResultRow): EventEntry {
  const event: RaceEvent = {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    date: row.date,
    location: row.location,
    discipline: row.discipline,
  };

  const result =
    row.result_id === null
      ? null
      : toRaceResult({
          id: row.result_id,
          athlete_id: row.athlete_id as string,
          event_id: row.id,
          place: row.place,
          time_seconds: row.time_seconds,
          medal: row.medal,
          distance_km: row.distance_km,
          pace_seconds_per_km: row.pace_seconds_per_km,
          avg_heart_rate: row.avg_heart_rate,
          elevation_m: row.elevation_m,
        });

  return { event, result };
}

export type EventEntry = { event: RaceEvent; result: RaceResult | null };
export type ResultInput = Omit<RaceResult, "id">;

const RESULT_COLUMNS =
  "id, athlete_id, event_id, place, time_seconds, medal, distance_km, pace_seconds_per_km, avg_heart_rate, elevation_m";

// Every event the athlete owns, newest first, with their own result attached
// when they logged one.
export async function listEventEntries(ownerId: string): Promise<EventEntry[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT e.id, e.owner_id, e.name, e.date, e.location, e.discipline,
              r.id AS result_id, r.athlete_id, r.place, r.time_seconds, r.medal,
              r.distance_km, r.pace_seconds_per_km, r.avg_heart_rate, r.elevation_m
       FROM events e
       LEFT JOIN results r ON r.event_id = e.id AND r.athlete_id = e.owner_id
       WHERE e.owner_id = ?
       ORDER BY e.date DESC`,
    )
    .bind(ownerId)
    .all<EventWithResultRow>();

  return results.map(toEventEntry);
}

export async function findResult(athleteId: string, eventId: string): Promise<RaceResult | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare(`SELECT ${RESULT_COLUMNS} FROM results WHERE athlete_id = ? AND event_id = ?`)
    .bind(athleteId, eventId)
    .first<ResultRow>();
  return row ? toRaceResult(row) : undefined;
}

export async function saveResult(input: ResultInput): Promise<void> {
  const database = await getDatabase();
  const existing = await findResult(input.athleteId, input.eventId);
  const id = existing?.id ?? crypto.randomUUID();

  await database
    .prepare(
      `INSERT INTO results (${RESULT_COLUMNS})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (athlete_id, event_id) DO UPDATE SET
         place = excluded.place,
         time_seconds = excluded.time_seconds,
         medal = excluded.medal,
         distance_km = excluded.distance_km,
         pace_seconds_per_km = excluded.pace_seconds_per_km,
         avg_heart_rate = excluded.avg_heart_rate,
         elevation_m = excluded.elevation_m`,
    )
    .bind(
      id,
      input.athleteId,
      input.eventId,
      input.place,
      input.timeSeconds,
      input.medal,
      input.distanceKm,
      input.paceSecondsPerKm,
      input.avgHeartRate,
      input.elevationM,
    )
    .run();
}
