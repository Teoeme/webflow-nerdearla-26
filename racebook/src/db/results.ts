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

type ResultWithEventRow = ResultRow & {
  event_name: string;
  event_date: string;
  event_location: string;
  event_discipline: Discipline;
};

type ResultWithAthleteRow = ResultRow & { athlete_name: string };

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

export type AthleteResult = RaceResult & { event: RaceEvent };
export type EventResult = RaceResult & { athleteName: string };
export type ResultInput = Omit<RaceResult, "id">;

const RESULT_COLUMNS =
  "id, athlete_id, event_id, place, time_seconds, medal, distance_km, pace_seconds_per_km, avg_heart_rate, elevation_m";

export async function listResultsForAthlete(athleteId: string): Promise<AthleteResult[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT r.id, r.athlete_id, r.event_id, r.place, r.time_seconds, r.medal,
              r.distance_km, r.pace_seconds_per_km, r.avg_heart_rate, r.elevation_m,
              e.name AS event_name, e.date AS event_date, e.location AS event_location,
              e.discipline AS event_discipline
       FROM results r
       JOIN events e ON e.id = r.event_id
       WHERE r.athlete_id = ?
       ORDER BY e.date DESC`,
    )
    .bind(athleteId)
    .all<ResultWithEventRow>();

  return results.map((row) => ({
    ...toRaceResult(row),
    event: {
      id: row.event_id,
      // A result always lives on its own athlete's private copy of the event
      // (see migration 0003), so the owner is the same athlete as the result.
      ownerId: row.athlete_id,
      name: row.event_name,
      date: row.event_date,
      location: row.event_location,
      discipline: row.event_discipline,
    },
  }));
}

export async function listResultsForEvent(eventId: string): Promise<EventResult[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare(
      `SELECT r.id, r.athlete_id, r.event_id, r.place, r.time_seconds, r.medal,
              r.distance_km, r.pace_seconds_per_km, r.avg_heart_rate, r.elevation_m,
              a.name AS athlete_name
       FROM results r
       JOIN athletes a ON a.id = r.athlete_id
       WHERE r.event_id = ?
       ORDER BY (r.place IS NULL) ASC, r.place ASC`,
    )
    .bind(eventId)
    .all<ResultWithAthleteRow>();

  return results.map((row) => ({ ...toRaceResult(row), athleteName: row.athlete_name }));
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
