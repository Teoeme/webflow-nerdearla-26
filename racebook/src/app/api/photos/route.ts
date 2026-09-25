import { NextResponse, type NextRequest } from "next/server";
import { createPhoto } from "@/db/photos";
import { getPhotoBucket } from "@/storage/photo-bucket";
import { getCurrentAthlete } from "@/session/current-athlete";

const ALLOWED_PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

function isSupportedPhoto(file: File): boolean {
  const isAllowedType = (ALLOWED_PHOTO_CONTENT_TYPES as readonly string[]).includes(file.type);
  return isAllowedType && file.size > 0 && file.size <= MAX_PHOTO_SIZE_BYTES;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const eventId = formData.get("eventId");
  const photo = formData.get("photo");

  if (typeof eventId !== "string" || !eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  if (!(photo instanceof File) || !isSupportedPhoto(photo)) {
    return NextResponse.redirect(new URL(`/events/${eventId}?upload=invalid`, request.url), 303);
  }

  const currentAthlete = await getCurrentAthlete();
  const photoId = crypto.randomUUID();
  const storageKey = `photos/${photoId}`;

  const bucket = await getPhotoBucket();
  await bucket.put(storageKey, await photo.arrayBuffer(), {
    httpMetadata: { contentType: photo.type },
  });

  try {
    await createPhoto({
      id: photoId,
      eventId,
      ownerId: currentAthlete.id,
      uploaderId: currentAthlete.id,
      storageKey,
    });
  } catch (error) {
    await bucket.delete(storageKey);
    throw error;
  }

  return NextResponse.redirect(new URL(`/events/${eventId}`, request.url), 303);
}
