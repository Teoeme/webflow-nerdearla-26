import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/status-pill";
import type { Athlete, Photo } from "@/db/types";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";
import { requestPhotoTransfer } from "./actions";

export function PhotoCard({
  photo,
  eventId,
  eventName,
  pendingRecipient,
  transferCandidates,
  messages,
}: {
  photo: Photo;
  eventId: string;
  eventName: string;
  pendingRecipient: Athlete | undefined;
  transferCandidates: Athlete[];
  messages: GalleryMessages["eventGallery"];
}) {
  return (
    <figure className="panel flex flex-col gap-2 p-2">
      <img
        src={`/api/photos/${photo.id}`}
        alt={messages.photoAlt(eventName)}
        loading="lazy"
        className="aspect-square w-full rounded-sm object-cover"
      />
      {pendingRecipient ? (
        <StatusPill status="pending" label={messages.pendingWith(pendingRecipient.name)} />
      ) : (
        <form action={requestPhotoTransfer} className="flex flex-col gap-2">
          <input type="hidden" name="photoId" value={photo.id} />
          <input type="hidden" name="eventId" value={eventId} />
          <Field label={messages.transferFieldLabel} htmlFor={`transfer-${photo.id}`}>
            <Select id={`transfer-${photo.id}`} name="toAthleteId" required defaultValue="">
              <option value="" disabled>
                {messages.transferPlaceholder}
              </option>
              {transferCandidates.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" variant="outline">
            {messages.transferButton}
          </Button>
        </form>
      )}
    </figure>
  );
}
