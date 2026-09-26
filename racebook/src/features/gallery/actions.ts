"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteOwnedPhoto, type DestinationChoice } from "@/db/photos";
import { getPhotoBucket } from "@/storage/photo-bucket";
import { acceptTag, rejectTag, requestTag, type TagRequestOutcome } from "@/db/photo-tags";
import { acceptTransfer, rejectTransfer, requestTransfer, type TransferRequestOutcome } from "@/db/transfers";
import { getCurrentAthlete } from "@/session/current-athlete";
import { validateNewEventDetails, type NewEventFieldErrors } from "./accept-event-details";
import { parseDestinationSelection } from "./destination";

export type AcceptFormState = { errors: NewEventFieldErrors };

const INITIAL_ACCEPT_STATE: AcceptFormState = { errors: {} };

type ResolvedDestination = { ok: true; choice: DestinationChoice } | { ok: false; errors: NewEventFieldErrors };

// Reads the recipient's destination choice from the accept form. For an existing
// event, the choice is ready as-is. For "new event", the editable name/date/location/
// discipline fields are validated here — the same rules as the new-event form (all
// required, date YYYY-MM-DD, discipline in the enum) — before they ever become a
// DestinationChoice; invalid input never writes anything.
function parseAcceptedDestination(formData: FormData): ResolvedDestination {
  const selection = parseDestinationSelection(formData);
  if (!selection) return { ok: false, errors: {} };
  if (selection.kind === "existing") {
    return { ok: true, choice: { kind: "existing", eventId: selection.eventId } };
  }

  const validation = validateNewEventDetails(formData);
  if (!validation.valid) return { ok: false, errors: validation.errors };
  return { ok: true, choice: { kind: "new", details: validation.details } };
}

// Deletes one of the current athlete's photos; anything else is ignored.
export async function deletePhotoAction(formData: FormData): Promise<void> {
  const photoId = formData.get("photoId");
  if (typeof photoId !== "string" || !photoId) return;

  const currentAthlete = await getCurrentAthlete();
  const storageKey = await deleteOwnedPhoto(photoId, currentAthlete.id);
  if (!storageKey) return;

  const bucket = await getPhotoBucket();
  await bucket.delete(storageKey);
  revalidatePath("/", "layout");
}

export async function requestPhotoTransfer(
  _previousOutcome: TransferRequestOutcome | null,
  formData: FormData,
): Promise<TransferRequestOutcome | null> {
  const photoId = formData.get("photoId");
  const eventId = formData.get("eventId");
  const toAthleteId = formData.get("toAthleteId");

  const hasValidFields =
    typeof photoId === "string" && typeof eventId === "string" && typeof toAthleteId === "string";
  if (!hasValidFields) return null;

  const currentAthlete = await getCurrentAthlete();
  const outcome = await requestTransfer({ photoId, fromAthleteId: currentAthlete.id, toAthleteId });
  revalidatePath(`/events/${eventId}`);
  return outcome;
}

export async function requestPhotoTag(
  _previousOutcome: TagRequestOutcome | null,
  formData: FormData,
): Promise<TagRequestOutcome | null> {
  const photoId = formData.get("photoId");
  const eventId = formData.get("eventId");
  const athleteId = formData.get("athleteId");

  const hasValidFields =
    typeof photoId === "string" && typeof eventId === "string" && typeof athleteId === "string";
  if (!hasValidFields) return null;

  const currentAthlete = await getCurrentAthlete();
  const outcome = await requestTag({ photoId, taggedById: currentAthlete.id, athleteId });
  revalidatePath(`/events/${eventId}`);
  return outcome;
}

export async function acceptIncomingTransfer(
  _previousState: AcceptFormState,
  formData: FormData,
): Promise<AcceptFormState> {
  const transferId = formData.get("transferId");
  if (typeof transferId !== "string") return INITIAL_ACCEPT_STATE;

  const resolved = parseAcceptedDestination(formData);
  if (!resolved.ok) return { errors: resolved.errors };

  const currentAthlete = await getCurrentAthlete();
  const destinationEventId = await acceptTransfer(transferId, currentAthlete.id, resolved.choice);
  revalidatePath("/", "layout");
  if (destinationEventId) redirect(`/inbox?acceptedEventId=${destinationEventId}`);
  return INITIAL_ACCEPT_STATE;
}

export async function rejectIncomingTransfer(formData: FormData): Promise<void> {
  const transferId = formData.get("transferId");
  if (typeof transferId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTransfer(transferId, currentAthlete.id);
  revalidatePath("/", "layout");
}

export async function acceptIncomingTag(
  _previousState: AcceptFormState,
  formData: FormData,
): Promise<AcceptFormState> {
  const tagId = formData.get("tagId");
  if (typeof tagId !== "string") return INITIAL_ACCEPT_STATE;

  const resolved = parseAcceptedDestination(formData);
  if (!resolved.ok) return { errors: resolved.errors };

  const currentAthlete = await getCurrentAthlete();
  const destinationEventId = await acceptTag(tagId, currentAthlete.id, resolved.choice);
  revalidatePath("/", "layout");
  if (destinationEventId) redirect(`/inbox?acceptedEventId=${destinationEventId}`);
  return INITIAL_ACCEPT_STATE;
}

export async function rejectIncomingTag(formData: FormData): Promise<void> {
  const tagId = formData.get("tagId");
  if (typeof tagId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTag(tagId, currentAthlete.id);
  revalidatePath("/", "layout");
}
