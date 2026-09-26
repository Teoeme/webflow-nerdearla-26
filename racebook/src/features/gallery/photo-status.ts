import type { PhotoTagWithName } from "@/db/photo-tags";
import type { Athlete, TransferStatus } from "@/db/types";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";

export type PhotoPill = { id: string; status: TransferStatus; label: string };

// Shared by the grid card and the lightbox footer: the status pills for a photo I own —
// a pending transfer, plus every open tag on it. A photo I don't own (seen through an
// accepted tag) never calls this; it only shows "Tagged by <name>".
export function pillsForOwnedPhoto(
  photoId: string,
  pendingRecipient: Athlete | undefined,
  tags: PhotoTagWithName[],
  messages: GalleryMessages["eventGallery"],
): PhotoPill[] {
  const pendingPill: PhotoPill[] = pendingRecipient
    ? [{ id: `pending-${photoId}`, status: "pending", label: messages.pendingWith(pendingRecipient.name) }]
    : [];
  const tagPills: PhotoPill[] = tags.map((tag) => ({
    id: tag.id,
    status: tag.status,
    label: messages.tagPill(tag.athleteName),
  }));
  return [...pendingPill, ...tagPills];
}
