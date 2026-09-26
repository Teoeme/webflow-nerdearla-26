import type { JSX } from "react";
import { listAthletes } from "@/db/athletes";
import { findOwnedEvent } from "@/db/events";
import { listOpenTagsOnEvent, type PhotoTagWithName } from "@/db/photo-tags";
import { listEventPhotos } from "@/db/photos";
import { listPendingTransfersFrom } from "@/db/transfers";
import type { Athlete } from "@/db/types";
import { getDictionary } from "@/i18n/dictionary";
import { getCurrentAthlete } from "@/session/current-athlete";
import { GalleryGrid } from "./gallery-grid";
import type { LightboxPhoto } from "./lightbox";
import { pillsForOwnedPhoto } from "./photo-status";
import type { ShareCandidate, ShareMessages } from "./share-panel";

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

function toTagsByPhotoId(tags: PhotoTagWithName[]): Map<string, PhotoTagWithName[]> {
  const tagsByPhotoId = new Map<string, PhotoTagWithName[]>();
  for (const tag of tags) {
    const tagsForPhoto = tagsByPhotoId.get(tag.photoId) ?? [];
    tagsForPhoto.push(tag);
    tagsByPhotoId.set(tag.photoId, tagsForPhoto);
  }
  return tagsByPhotoId;
}

type ShareDictionary = Awaited<ReturnType<typeof getDictionary>>["gallery"]["eventGallery"]["share"];

// The Share panel is a client component: `sendButton`/`tagButton` in the dictionary are
// functions of an athlete's name, and a function can't cross that boundary as a prop.
// Every candidate's two labels are resolved to plain strings here, once, instead of
// passing the functions down.
function toShareCandidates(candidates: Athlete[], share: ShareDictionary): ShareCandidate[] {
  return candidates.map((athlete) => ({
    id: athlete.id,
    name: athlete.name,
    sendLabel: share.sendButton(athlete.name),
    tagLabel: share.tagButton(athlete.name),
  }));
}

function toShareMessages(share: ShareDictionary): ShareMessages {
  const { action, setCover, deletePhoto, confirmDelete, modalTitle, closeLabel, modeSend, modeTag, choosePrompt, pendingPill, addedPill, outcomes } = share;
  return { action, setCover, deletePhoto, confirmDelete, modalTitle, closeLabel, modeSend, modeTag, choosePrompt, pendingPill, addedPill, outcomes };
}

export async function EventGallery({ eventId }: { eventId: string }): Promise<JSX.Element> {
  const [currentAthlete, dictionary] = await Promise.all([getCurrentAthlete(), getDictionary()]);
  const messages = dictionary.gallery.eventGallery;

  const [photos, athletes, event, pendingTransfers, openTags] = await Promise.all([
    listEventPhotos(currentAthlete.id, eventId),
    listAthletes(),
    findOwnedEvent(eventId, currentAthlete.id),
    listPendingTransfersFrom(currentAthlete.id, eventId),
    listOpenTagsOnEvent(currentAthlete.id, eventId),
  ]);

  const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete] as const));
  const transferCandidates = athletes.filter((athlete) => athlete.id !== currentAthlete.id);
  const pendingRecipientByPhotoId = toPendingRecipientByPhotoId(pendingTransfers, athleteById);
  const tagsByPhotoId = toTagsByPhotoId(openTags);
  const displayEventName = event?.name ?? eventId;
  const shareCandidates = toShareCandidates(transferCandidates, messages.share);
  const shareMessages = toShareMessages(messages.share);

  const lightboxPhotos: LightboxPhoto[] = photos.map((photo) => {
    const isOwnPhoto = photo.taggedByName === null;
    const pendingRecipient = pendingRecipientByPhotoId.get(photo.id);
    const tags = tagsByPhotoId.get(photo.id) ?? [];

    return {
      id: photo.id,
      src: `/api/photos/${photo.id}`,
      alt: messages.photoAlt(displayEventName),
      taggedByLabel: photo.taggedByName ? messages.taggedBy(photo.taggedByName) : null,
      pills: isOwnPhoto ? pillsForOwnedPhoto(photo.id, pendingRecipient, tags, messages) : [],
      ownerActions: isOwnPhoto
        ? {
            eventId,
            candidates: shareCandidates,
            pendingTransferRecipientId: pendingRecipient?.id ?? null,
            tagStatusByAthleteId: Object.fromEntries(tags.map((tag) => [tag.athleteId, tag.status])),
            messages: shareMessages,
          }
        : null,
    };
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-heading text-xl">{messages.heading}</h2>
      {photos.length === 0 ? <p className="text-text-muted">{messages.emptyState}</p> : null}
      <GalleryGrid
        eventId={eventId}
        photos={lightboxPhotos}
        lightboxLabels={messages.lightbox}
        uploadMessages={messages.upload}
      />
    </section>
  );
}
