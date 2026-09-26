import { StatusPill } from "@/components/ui/status-pill";
import type { PhotoTagWithName } from "@/db/photo-tags";
import type { EventPhoto } from "@/db/photos";
import type { Athlete } from "@/db/types";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";
import { TagForm, TransferForm } from "./action-forms";
import { PhotoThumbnailButton } from "./lightbox";

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
  const hasPills = pendingRecipient !== undefined || tags.length > 0;

  return (
    <figure className="panel flex flex-col gap-2 p-2">
      <PhotoThumbnailButton photoId={photo.id} src={photoSrc} alt={photoAlt} />

      {!isOwnPhoto ? (
        <StatusPill status="accepted" label={messages.taggedBy(photo.taggedByName ?? "")} />
      ) : (
        <>
          {hasPills ? (
            <div className="flex flex-wrap gap-1">
              {pendingRecipient ? (
                <StatusPill status="pending" label={messages.pendingWith(pendingRecipient.name)} />
              ) : null}
              {tags.map((tag) => (
                <StatusPill key={tag.id} status={tag.status} label={messages.tagPill(tag.athleteName)} />
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
