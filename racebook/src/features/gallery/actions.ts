"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acceptTag, rejectTag, requestTag, type TagRequestOutcome } from "@/db/photo-tags";
import { acceptTransfer, rejectTransfer, requestTransfer, type TransferRequestOutcome } from "@/db/transfers";
import { getCurrentAthlete } from "@/session/current-athlete";
import { parseDestinationChoice } from "./destination";

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
  const choice = parseDestinationChoice(formData);
  if (typeof transferId !== "string" || !choice) return;

  const currentAthlete = await getCurrentAthlete();
  const destinationEventId = await acceptTransfer(transferId, currentAthlete.id, choice);
  revalidatePath("/", "layout");
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
  const choice = parseDestinationChoice(formData);
  if (typeof tagId !== "string" || !choice) return;

  const currentAthlete = await getCurrentAthlete();
  const destinationEventId = await acceptTag(tagId, currentAthlete.id, choice);
  revalidatePath("/", "layout");
  if (destinationEventId) redirect(`/inbox?acceptedEventId=${destinationEventId}`);
}

export async function rejectIncomingTag(formData: FormData): Promise<void> {
  const tagId = formData.get("tagId");
  if (typeof tagId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTag(tagId, currentAthlete.id);
  revalidatePath("/", "layout");
}
