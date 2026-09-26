import type { EventDetails } from "@/db/events";
import type { Discipline } from "@/db/types";

// Same enum the events area validates a new event against (see results/actions.ts):
// kept as gallery's own copy since each area owns its own validation, only the
// EventDetails shape is shared.
export const NEW_EVENT_DISCIPLINES: readonly Discipline[] = [
  "road_running",
  "trail_running",
  "triathlon",
  "cycling",
  "swimming",
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isDiscipline(value: FormDataEntryValue | null): value is Discipline {
  return typeof value === "string" && (NEW_EVENT_DISCIPLINES as readonly string[]).includes(value);
}

export type NewEventFieldName = "name" | "date" | "location" | "discipline";
export type NewEventErrorKey = "required" | "invalidDate";
export type NewEventFieldErrors = Partial<Record<NewEventFieldName, NewEventErrorKey>>;

export type NewEventValidation =
  | { valid: true; details: EventDetails }
  | { valid: false; errors: NewEventFieldErrors };

// Validates the editable "new event" fields on accept: all required, the date as
// YYYY-MM-DD, the discipline one of the enum values. Invalid input returns field
// errors and never reaches prepareEventInsert.
export function validateNewEventDetails(formData: FormData): NewEventValidation {
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const disciplineValue = formData.get("discipline");

  const errors: NewEventFieldErrors = {};
  if (!name) errors.name = "required";
  if (!date) errors.date = "required";
  else if (!ISO_DATE_PATTERN.test(date)) errors.date = "invalidDate";
  if (!location) errors.location = "required";
  if (!isDiscipline(disciplineValue)) errors.discipline = "required";

  if (Object.keys(errors).length > 0) return { valid: false, errors };
  return { valid: true, details: { name, date, location, discipline: disciplineValue as Discipline } };
}
