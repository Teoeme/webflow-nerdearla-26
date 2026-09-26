import { NextResponse, type NextRequest } from "next/server";
import { findOwnedEvent } from "@/db/events";
import { createPhoto } from "@/db/photos";
import { rejectionReasonForPhoto } from "@/features/gallery/upload-constraints";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getPhotoBucket } from "@/storage/photo-bucket";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const eventId = formData.get("eventId");
  const photo = formData.get("photo");

  if (typeof eventId !== "string" || !eventId || !(photo instanceof File)) {
    return NextResponse.json({ reason: "missing" }, { status: 400 });
  }

  const rejectionReason = rejectionReasonForPhoto(photo);
  if (rejectionReason) {
    return NextResponse.json({ reason: rejectionReason }, { status: 400 });
  }

  const currentAthlete = await getCurrentAthlete();
  const event = await findOwnedEvent(eventId, currentAthlete.id);
  if (!event) return new NextResponse(null, { status: 404 });

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

  return NextResponse.json({ photoId }, { status: 201 });
}
