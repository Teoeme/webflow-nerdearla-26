"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createEvent } from "@/db/events";
import { saveResult } from "@/db/results";
import { getCurrentAthlete } from "@/session/current-athlete";
import type { Discipline, Medal } from "@/db/types";
import {
  calculatePaceSecondsPerKm,
  parseDecimal,
  parseDuration,
  parseInteger,
  parsePositiveInteger,
} from "./parsing";

const MEDALS: readonly Medal[] = ["gold", "silver", "bronze"];
const DISCIPLINES: readonly Discipline[] = [
  "road_running",
  "trail_running",
  "triathlon",
  "cycling",
  "swimming",
];

function readText(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

function readMedal(formData: FormData): Medal | null {
  const value = formData.get("medal");
  return typeof value === "string" && (MEDALS as readonly string[]).includes(value) ? (value as Medal) : null;
}

function isDiscipline(value: FormDataEntryValue | null): value is Discipline {
  return typeof value === "string" && (DISCIPLINES as readonly string[]).includes(value);
}

export type ResultFieldName = "place" | "time" | "distance" | "avgHeartRate" | "elevation";
export type ResultErrorKey = "invalidNumber" | "invalidDuration" | "atLeastOneField";
export type ResultFormState = { errors: Partial<Record<ResultFieldName | "form", ResultErrorKey>> };

export async function saveResultAction(
  eventId: string,
  _previousState: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  const placeInput = readText(formData, "place");
  const timeInput = readText(formData, "time");
  const distanceInput = readText(formData, "distance");
  const avgHeartRateInput = readText(formData, "avgHeartRate");
  const elevationInput = readText(formData, "elevation");
  const medal = readMedal(formData);

  const isFormEmpty =
    !placeInput && !timeInput && !distanceInput && !avgHeartRateInput && !elevationInput && medal === null;
  if (isFormEmpty) {
    return { errors: { form: "atLeastOneField" } };
  }

  const place = placeInput ? parsePositiveInteger(placeInput) : undefined;
  const timeSeconds = timeInput ? parseDuration(timeInput) : undefined;
  const distanceKm = distanceInput ? parseDecimal(distanceInput) : undefined;
  const avgHeartRate = avgHeartRateInput ? parsePositiveInteger(avgHeartRateInput) : undefined;
  const elevationM = elevationInput ? parseInteger(elevationInput) : undefined;

  const errors: ResultFormState["errors"] = {};
  if (placeInput && place === undefined) errors.place = "invalidNumber";
  if (timeInput && timeSeconds === undefined) errors.time = "invalidDuration";
  if (distanceInput && distanceKm === undefined) errors.distance = "invalidNumber";
  if (avgHeartRateInput && avgHeartRate === undefined) errors.avgHeartRate = "invalidNumber";
  if (elevationInput && elevationM === undefined) errors.elevation = "invalidNumber";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const paceSecondsPerKm =
    timeSeconds !== undefined && distanceKm !== undefined
      ? calculatePaceSecondsPerKm(timeSeconds, distanceKm)
      : null;

  const athlete = await getCurrentAthlete();
  await saveResult({
    athleteId: athlete.id,
    eventId,
    place: place ?? null,
    timeSeconds: timeSeconds ?? null,
    medal,
    distanceKm: distanceKm ?? null,
    paceSecondsPerKm,
    avgHeartRate: avgHeartRate ?? null,
    elevationM: elevationM ?? null,
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
  redirect(`/events/${eventId}`);
}

export type NewEventFieldName = "name" | "date" | "location" | "discipline";
export type NewEventFormState = { errors: Partial<Record<NewEventFieldName, "required">> };

export async function createEventAction(
  _previousState: NewEventFormState,
  formData: FormData,
): Promise<NewEventFormState> {
  const name = readText(formData, "name");
  const date = readText(formData, "date");
  const location = readText(formData, "location");
  const disciplineInput = formData.get("discipline");

  const errors: NewEventFormState["errors"] = {};
  if (!name) errors.name = "required";
  if (!date) errors.date = "required";
  if (!location) errors.location = "required";
  if (!isDiscipline(disciplineInput)) errors.discipline = "required";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const event = await createEvent({ name, date, location, discipline: disciplineInput as Discipline });
  revalidatePath("/");
  redirect(`/events/${event.id}/result`);
}
