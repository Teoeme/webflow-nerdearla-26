import { getDatabase } from "./connection";
import type { Athlete } from "./types";

type AthleteRow = {
  id: string;
  name: string;
  avatar_url: string | null;
};

function toAthlete(row: AthleteRow): Athlete {
  return { id: row.id, name: row.name, avatarUrl: row.avatar_url };
}

export async function listAthletes(): Promise<Athlete[]> {
  const database = await getDatabase();
  const { results } = await database
    .prepare("SELECT id, name, avatar_url FROM athletes ORDER BY name")
    .all<AthleteRow>();
  return results.map(toAthlete);
}

export async function findAthlete(athleteId: string): Promise<Athlete | undefined> {
  const database = await getDatabase();
  const row = await database
    .prepare("SELECT id, name, avatar_url FROM athletes WHERE id = ?")
    .bind(athleteId)
    .first<AthleteRow>();
  return row ? toAthlete(row) : undefined;
}
