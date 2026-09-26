// Shared by the metrics-capture route (authoritative check) and the client component
// (accept attribute on the file input). Neither duplicates the type list or size limit.
export const ALLOWED_SCREENSHOT_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_SCREENSHOT_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_SCREENSHOT_TYPES_ATTRIBUTE = ALLOWED_SCREENSHOT_CONTENT_TYPES.join(",");

export type SupportedScreenshotMediaType = (typeof ALLOWED_SCREENSHOT_CONTENT_TYPES)[number];

export type ScreenshotRejectionReason = "type" | "size" | "missing";

export function rejectionReasonForScreenshot(file: {
  type: string;
  size: number;
}): ScreenshotRejectionReason | undefined {
  const isAllowedType = (ALLOWED_SCREENSHOT_CONTENT_TYPES as readonly string[]).includes(file.type);
  if (!isAllowedType) return "type";
  if (file.size === 0 || file.size > MAX_SCREENSHOT_SIZE_BYTES) return "size";
  return undefined;
}
