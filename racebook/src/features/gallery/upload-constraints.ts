// Shared by the upload route (authoritative check) and the batch uploader (accept
// attribute on the file input). Neither duplicates the type list or the size limit.
export const ALLOWED_PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES_ATTRIBUTE = ALLOWED_PHOTO_CONTENT_TYPES.join(",");

export type PhotoUploadRejectionReason = "type" | "size" | "missing";

export function rejectionReasonForPhoto(file: {
  type: string;
  size: number;
}): PhotoUploadRejectionReason | undefined {
  const isAllowedType = (ALLOWED_PHOTO_CONTENT_TYPES as readonly string[]).includes(file.type);
  if (!isAllowedType) return "type";
  if (file.size === 0 || file.size > MAX_PHOTO_SIZE_BYTES) return "size";
  return undefined;
}
