import { cookies } from "next/headers";
import { findAthlete } from "../db/athletes";
import type { Athlete } from "../db/types";

export const ATHLETE_COOKIE_NAME = "racebook_athlete";
export const DEFAULT_ATHLETE_ID = "athlete-lucia";

export async function getCurrentAthlete(): Promise<Athlete> {
  const cookieStore = await cookies();
  const athleteId = cookieStore.get(ATHLETE_COOKIE_NAME)?.value ?? DEFAULT_ATHLETE_ID;

  const athlete = await findAthlete(athleteId);
  if (athlete) return athlete;

  const defaultAthlete = await findAthlete(DEFAULT_ATHLETE_ID);
  if (defaultAthlete) return defaultAthlete;

  throw new Error(`Default athlete "${DEFAULT_ATHLETE_ID}" is missing from the database`);
}
