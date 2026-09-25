"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acceptTransfer, rejectTransfer, requestTransfer } from "@/db/transfers";
import { getCurrentAthlete } from "@/session/current-athlete";

export async function requestPhotoTransfer(formData: FormData): Promise<void> {
  const photoId = formData.get("photoId");
  const eventId = formData.get("eventId");
  const toAthleteId = formData.get("toAthleteId");

  const hasValidFields =
    typeof photoId === "string" && typeof eventId === "string" && typeof toAthleteId === "string";
  if (!hasValidFields) return;

  const currentAthlete = await getCurrentAthlete();
  await requestTransfer({ photoId, fromAthleteId: currentAthlete.id, toAthleteId });
  revalidatePath(`/events/${eventId}`);
}

export async function acceptIncomingTransfer(formData: FormData): Promise<void> {
  const transferId = formData.get("transferId");
  const eventId = formData.get("eventId");
  if (typeof transferId !== "string" || typeof eventId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  const wasAccepted = await acceptTransfer(transferId, currentAthlete.id);
  revalidatePath("/", "layout");
  if (wasAccepted) redirect(`/inbox?acceptedEventId=${eventId}`);
}

export async function rejectIncomingTransfer(formData: FormData): Promise<void> {
  const transferId = formData.get("transferId");
  if (typeof transferId !== "string") return;

  const currentAthlete = await getCurrentAthlete();
  await rejectTransfer(transferId, currentAthlete.id);
  revalidatePath("/", "layout");
}
