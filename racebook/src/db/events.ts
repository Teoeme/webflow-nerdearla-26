import { getDatabase } from "./connection";
import type { Discipline, RaceEvent } from "./types";

type EventRow = {
  id: string;
  name: string;
  date: string;
  location: string;
  discipline: Discipline;
};

function toRaceEvent(row: EventRow): RaceEvent {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    location: row.location,
    discipline: row.discipline,
  };
}

export async function listEvents(): Promise<RaceEvent[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare("SELECT id, name, date, location, discipline FROM events ORDER BY date DESC")
    .all<EventRow>();
  return results.map(toRaceEvent);
}

export async function findEvent(eventId: string): Promise<RaceEvent | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare("SELECT id, name, date, location, discipline FROM events WHERE id = ?")
    .bind(eventId)
    .first<EventRow>();
  return row ? toRaceEvent(row) : undefined;
}

export async function createEvent(input: Omit<RaceEvent, "id">): Promise<RaceEvent> {
  const database = await getDatabase();
  const event: RaceEvent = { id: crypto.randomUUID(), ...input };
  await database
    .prepare("INSERT INTO events (id, name, date, location, discipline) VALUES (?, ?, ?, ?, ?)")
    .bind(event.id, event.name, event.date, event.location, event.discipline)
    .run();
  return event;
}
