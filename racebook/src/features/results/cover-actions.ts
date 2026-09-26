"use server";

import { revalidatePath } from "next/cache";
import { setEventCover } from "@/db/events";
import { getCurrentAthlete } from "@/session/current-athlete";

// Sets one of the athlete's own photos as an event's cover. Called from the gallery
// area (a menu item on a photo), which only ever has an eventId and a photoId to hand
// over — the ownership and event-membership checks happen inside setEventCover.
export async function setEventCoverAction(formData: FormData): Promise<void> {
  const eventId = String(formData.get("eventId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  const athlete = await getCurrentAthlete();

  await setEventCover(eventId, athlete.id, photoId);
  revalidatePath("/", "layout");
}
