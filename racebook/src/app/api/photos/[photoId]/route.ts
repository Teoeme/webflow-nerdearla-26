import { NextResponse, type NextRequest } from "next/server";
import { findPhoto } from "@/db/photos";
import { getPhotoBucket } from "@/storage/photo-bucket";

const ONE_YEAR_IN_SECONDS = 31536000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> },
): Promise<NextResponse> {
  const { photoId } = await params;

  const photo = await findPhoto(photoId);
  if (!photo) return new NextResponse(null, { status: 404 });

  const bucket = await getPhotoBucket();
  const object = await bucket.get(photo.storageKey);
  if (!object) return new NextResponse(null, { status: 404 });

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
    },
  });
}
