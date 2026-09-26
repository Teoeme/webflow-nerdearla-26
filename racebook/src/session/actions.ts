"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { findAthlete } from "../db/athletes";
import { ATHLETE_COOKIE_NAME } from "./current-athlete";
import { isLocale } from "../i18n/locale";
import { LOCALE_COOKIE_NAME } from "../i18n/current-locale";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function switchAthlete(formData: FormData): Promise<void> {
  const athleteId = formData.get("athleteId");
  if (typeof athleteId !== "string") return;

  const athlete = await findAthlete(athleteId);
  if (!athlete) return;

  const cookieStore = await cookies();
  cookieStore.set(ATHLETE_COOKIE_NAME, athlete.id, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  // The page the athlete was on may belong to the previous athlete (a
  // private event, a result); the medal board always exists for everyone.
  redirect("/");
}

export async function switchLocale(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
