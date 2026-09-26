"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listEventsOwnedBy } from "@/db/events";
import { acceptTag, rejectTag, requestTag, type TagRequestOutcome } from "@/db/photo-tags";
import type { Destination } from "@/db/photos";
import { acceptTransfer, rejectTransfer, requestTransfer, type TransferRequestOutcome } from "@/db/transfers";
import { getCurrentAthlete } from "@/session/current-athlete";
import { findMatchingEvent, parseDestination } from "./destination";

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

export async function acceptIncomingTransfer(formData: FormData): Promise<void> {
  const transferId = formData.get("transferId");
  const destination = parseDestination(formData);
  if (typeof transferId !== "string" || !destination) return;

  const currentAthlete = await getCurrentAthlete();
  const wasAccepted = await acceptTransfer(transferId, currentAthlete.id, destination);
  revalidatePath("/", "layout");
  if (!wasAccepted) return;

  const destinationEventId = await resolveDestinationEventId(currentAthlete.id, destination);
  if (destinationEventId) redirect(`/inbox?acceptedEventId=${destinationEventId}`);
}

export async function rejectIncomingTransfer(formData: FormData): Promise<void> {
  const transferId = formData.get("transferId");
  if (typeof transferId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTransfer(transferId, currentAthlete.id);
  revalidatePath("/", "layout");
}

export async function acceptIncomingTag(formData: FormData): Promise<void> {
  const tagId = formData.get("tagId");
  const destination = parseDestination(formData);
  if (typeof tagId !== "string" || !destination) return;

  const currentAthlete = await getCurrentAthlete();
  const wasAccepted = await acceptTag(tagId, currentAthlete.id, destination);
  revalidatePath("/", "layout");
  if (!wasAccepted) return;

  const destinationEventId = await resolveDestinationEventId(currentAthlete.id, destination);
  if (destinationEventId) redirect(`/inbox?acceptedEventId=${destinationEventId}`);
}

export async function rejectIncomingTag(formData: FormData): Promise<void> {
  const tagId = formData.get("tagId");
  if (typeof tagId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTag(tagId, currentAthlete.id);
  revalidatePath("/", "layout");
}

// acceptTransfer/acceptTag only report success (their contract returns a boolean, not
// the destination event's id): an "existing" destination already names its id, and a
// "new" one is found back by the details that made it unique among the recipient's
// events before the accept (see destination.ts).
async function resolveDestinationEventId(
  recipientId: string,
  destination: Destination,
): Promise<string | undefined> {
  if (destination.kind === "existing") return destination.eventId;

  const events = await listEventsOwnedBy(recipientId);
  return findMatchingEvent(events, destination.details)?.id;
}
