// The inbox destination <select> uses this value for "a brand-new event", and one of
// the recipient's own event ids for anything else.
export const NEW_EVENT_DESTINATION_VALUE = "new";

// What the recipient picked in the destination <select>, before any validation: an
// existing event's id, or the "new event" sentinel. For "new", the event details still
// need reading and validating from the rest of the form — see accept-event-details.ts —
// they are never trusted from the client as-is.
export type DestinationSelection = { kind: "existing"; eventId: string } | { kind: "new" };

export function parseDestinationSelection(formData: FormData): DestinationSelection | null {
  const destinationValue = formData.get("destination");
  if (typeof destinationValue !== "string" || !destinationValue) return null;

  if (destinationValue === NEW_EVENT_DESTINATION_VALUE) return { kind: "new" };
  return { kind: "existing", eventId: destinationValue };
}
