"use client";

import { useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { SharePanel } from "./share-panel";
import { setEventCoverAction } from "@/features/results/cover-actions";
import { PhotoThumbnailButton, type LightboxPhoto } from "./lightbox";

// The overlay (pills + Share button) shows at reduced opacity by default and full
// opacity on hover or keyboard focus, on pointer-fine (mouse) viewports; smaller/touch
// viewports keep it visible so there is no hover-only affordance to miss.
const overlayVisibilityClassName =
  "opacity-60 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

// One grid tile in the event gallery. Reuses the same per-photo view model the
// lightbox renders (`LightboxPhoto`) so the tile and the lightbox footer never
// disagree on pills, tagged-by label or the sharing state; only plain data and
// pre-resolved strings cross into this client component.
export function PhotoCard({ photo }: { photo: LightboxPhoto }) {
  const [isShareOpen, setShareOpen] = useState(false);
  const [shareInstance, setShareInstance] = useState(0);

  const ownerActions = photo.ownerActions;

  function openShare(): void {
    setShareInstance((instance) => instance + 1);
    setShareOpen(true);
  }

  return (
    <figure className="panel group relative aspect-square overflow-hidden">
      <PhotoThumbnailButton photoId={photo.id} src={photo.src} alt={photo.alt} />

      <div
        className={`pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-2 ${overlayVisibilityClassName}`}
      >
        <div className="flex flex-wrap gap-1">
          {photo.taggedByLabel ? (
            <StatusPill status="accepted" label={photo.taggedByLabel} />
          ) : (
            photo.pills.map((pill) => <StatusPill key={pill.id} status={pill.status} label={pill.label} />)
          )}
        </div>
      </div>

      {ownerActions ? (
        <div className={`absolute top-1 right-1 z-10 flex gap-1 ${overlayVisibilityClassName}`}>
          <form action={setEventCoverAction}>
            <input type="hidden" name="eventId" value={ownerActions.eventId} />
            <input type="hidden" name="photoId" value={photo.id} />
            <button
              type="submit"
              className="flex h-7 items-center rounded-sm border border-line bg-background/70 px-2 text-label text-text hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {ownerActions.messages.setCover}
            </button>
          </form>
          <button
            type="button"
            onClick={openShare}
            className="flex h-7 items-center gap-1 rounded-sm border border-line bg-background/70 px-2 text-label text-text hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {ownerActions.messages.action}
          </button>
        </div>
      ) : null}

      {ownerActions ? (
        <SharePanel
          key={shareInstance}
          open={isShareOpen}
          onOpenChange={setShareOpen}
          photoId={photo.id}
          photoSrc={photo.src}
          photoAlt={photo.alt}
          share={ownerActions}
        />
      ) : null}
    </figure>
  );
}
