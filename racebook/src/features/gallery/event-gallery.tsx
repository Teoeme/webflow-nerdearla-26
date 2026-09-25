import { Suspense } from "react";
import { listAthletes } from "@/db/athletes";
import { findEventName, listPhotosOwnedBy } from "@/db/photos";
import { listPendingTransfersFrom } from "@/db/transfers";
import type { Athlete } from "@/db/types";
import { getDictionary } from "@/i18n/dictionary";
import { getCurrentAthlete } from "@/session/current-athlete";
import { PhotoCard } from "./photo-card";
import { UploadErrorBanner } from "./upload-error-banner";
import { UploadForm } from "./upload-form";

function toPendingRecipientByPhotoId(
  pendingTransfers: Awaited<ReturnType<typeof listPendingTransfersFrom>>,
  athleteById: Map<string, Athlete>,
): Map<string, Athlete> {
  const entries = pendingTransfers
    .map((transfer): readonly [string, Athlete] | undefined => {
      const recipient = athleteById.get(transfer.toAthleteId);
      return recipient ? ([transfer.photoId, recipient] as const) : undefined;
    })
    .filter((entry) => entry !== undefined);
  return new Map(entries);
}

export async function EventGallery({ eventId }: { eventId: string }) {
  const [currentAthlete, dictionary] = await Promise.all([getCurrentAthlete(), getDictionary()]);
  const messages = dictionary.gallery.eventGallery;

  const [photos, athletes, eventName, pendingTransfers] = await Promise.all([
    listPhotosOwnedBy(currentAthlete.id, eventId),
    listAthletes(),
    findEventName(eventId),
    listPendingTransfersFrom(currentAthlete.id, eventId),
  ]);

  const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]));
  const transferCandidates = athletes.filter((athlete) => athlete.id !== currentAthlete.id);
  const pendingRecipientByPhotoId = toPendingRecipientByPhotoId(pendingTransfers, athleteById);
  const displayEventName = eventName ?? eventId;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading text-xl">{messages.heading}</h2>
      <Suspense fallback={null}>
        <UploadErrorBanner message={messages.uploadInvalid} />
      </Suspense>
      {photos.length === 0 ? (
        <p className="text-text-muted">{messages.emptyState}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              eventId={eventId}
              eventName={displayEventName}
              pendingRecipient={pendingRecipientByPhotoId.get(photo.id)}
              transferCandidates={transferCandidates}
              messages={messages}
            />
          ))}
        </div>
      )}
      <UploadForm eventId={eventId} messages={messages} />
    </section>
  );
}
