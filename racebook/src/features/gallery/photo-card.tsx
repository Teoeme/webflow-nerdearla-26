import { StatusPill } from "@/components/ui/status-pill";
import type { PhotoTagWithName } from "@/db/photo-tags";
import type { EventPhoto } from "@/db/photos";
import type { Athlete } from "@/db/types";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";
import { TagForm, TransferForm } from "./action-forms";
import { PhotoThumbnailButton } from "./lightbox";
import { pillsForOwnedPhoto } from "./photo-status";

export function PhotoCard({
  photo,
  eventId,
  eventName,
  pendingRecipient,
  tags,
  transferCandidates,
  messages,
}: {
  photo: EventPhoto;
  eventId: string;
  eventName: string;
  pendingRecipient: Athlete | undefined;
  tags: PhotoTagWithName[];
  transferCandidates: Athlete[];
  messages: GalleryMessages["eventGallery"];
}) {
  const isOwnPhoto = photo.taggedByName === null;
  const photoSrc = `/api/photos/${photo.id}`;
  const photoAlt = messages.photoAlt(eventName);
  const pills = isOwnPhoto ? pillsForOwnedPhoto(photo.id, pendingRecipient, tags, messages) : [];

  return (
    <figure className="panel flex flex-col gap-2 p-2">
      <PhotoThumbnailButton photoId={photo.id} src={photoSrc} alt={photoAlt} />

      {!isOwnPhoto ? (
        <StatusPill status="accepted" label={messages.taggedBy(photo.taggedByName ?? "")} />
      ) : (
        <>
          {pills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {pills.map((pill) => (
                <StatusPill key={pill.id} status={pill.status} label={pill.label} />
              ))}
            </div>
          ) : null}

          {!pendingRecipient ? (
            <TransferForm
              photoId={photo.id}
              eventId={eventId}
              candidates={transferCandidates}
              messages={messages.transfer}
            />
          ) : null}

          <TagForm
            photoId={photo.id}
            eventId={eventId}
            candidates={transferCandidates}
            messages={messages.tag}
          />
        </>
      )}
    </figure>
  );
}
