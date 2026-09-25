"use client";

import { useSearchParams } from "next/navigation";

const INVALID_UPLOAD_QUERY_VALUE = "invalid";

// A small client island: it reads the ?upload=invalid redirect from the upload
// route handler directly from the URL, so `EventGallery` keeps its exact
// server-component signature (`{ eventId: string }`) instead of threading
// `searchParams` through the contract just for this one message.
export function UploadErrorBanner({ message }: { message: string }) {
  const searchParams = useSearchParams();
  const isInvalidUpload = searchParams.get("upload") === INVALID_UPLOAD_QUERY_VALUE;
  if (!isInvalidUpload) return null;

  return <p className="text-label text-accent">{message}</p>;
}
