import type { EventDetails } from "@/db/events";
import type { Destination } from "@/db/photos";
import type { Discipline, RaceEvent } from "@/db/types";

// The inbox destination <select> uses this value for "a brand-new event", and one of
// the recipient's own event ids for anything else.
export const NEW_EVENT_DESTINATION_VALUE = "new";

// types.ts (owned by platform) only exports the Discipline type, not a runtime list,
// so the valid values are named here for this one check.
const DISCIPLINES: readonly Discipline[] = [
  "road_running",
  "trail_running",
  "triathlon",
  "cycling",
  "swimming",
];

function isDiscipline(value: FormDataEntryValue | null): value is Discipline {
  return typeof value === "string" && (DISCIPLINES as readonly string[]).includes(value);
}

// Reads the destination <select> plus the hidden source-event fields an inbox item
// form always carries, so "new event" can be prefilled even though the <select> only
// carries a sentinel value.
export function parseDestination(formData: FormData): Destination | null {
  const destinationValue = formData.get("destination");
  if (typeof destinationValue !== "string" || !destinationValue) return null;

  if (destinationValue !== NEW_EVENT_DESTINATION_VALUE) {
    return { kind: "existing", eventId: destinationValue };
  }

  const name = formData.get("sourceEventName");
  const date = formData.get("sourceEventDate");
  const location = formData.get("sourceEventLocation");
  const discipline = formData.get("sourceEventDiscipline");
  const hasValidSourceEvent =
    typeof name === "string" && typeof date === "string" && typeof location === "string" && isDiscipline(discipline);
  if (!hasValidSourceEvent) return null;

  return { kind: "new", details: { name, date, location, discipline } };
}

// After creating a brand-new destination event, the accept function only reports
// success (its contract returns a boolean, not the new event's id). The new event is
// found back by the same details that make it unique among the recipient's *previous*
// events: if one had matched already, the inbox would have offered it instead of "new".
export function findMatchingEvent(events: RaceEvent[], details: EventDetails): RaceEvent | undefined {
  return events.find(
    (event) =>
      event.name === details.name &&
      event.date === details.date &&
      event.location === details.location &&
      event.discipline === details.discipline,
  );
}
