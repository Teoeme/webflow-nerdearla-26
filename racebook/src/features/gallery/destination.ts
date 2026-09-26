import type { DestinationChoice } from "@/db/photos";

// The inbox destination <select> uses this value for "a brand-new event", and one of
// the recipient's own event ids for anything else.
export const NEW_EVENT_DESTINATION_VALUE = "new";

// Reads the destination <select>. It carries only the recipient's choice — an existing
// event's id, or the "new event" sentinel — never the new event's details: those are
// never trusted from the client, and are derived on the server from the transfer/tag
// being accepted (see acceptTransfer/acceptTag).
export function parseDestinationChoice(formData: FormData): DestinationChoice | null {
  const destinationValue = formData.get("destination");
  if (typeof destinationValue !== "string" || !destinationValue) return null;

  if (destinationValue === NEW_EVENT_DESTINATION_VALUE) return { kind: "new" };
  return { kind: "existing", eventId: destinationValue };
}
