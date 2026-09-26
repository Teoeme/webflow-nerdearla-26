"use client";

import { useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { SharePanel } from "./share-panel";
import { deletePhotoAction } from "./actions";
import { setEventCoverAction } from "@/features/results/cover-actions";
import { PhotoThumbnailButton, type LightboxPhoto } from "./lightbox";

// The overlay (pills + Share button) shows at reduced opacity by default and full
// opacity on hover or keyboard focus, on pointer-fine (mouse) viewports; smaller/touch
// viewports keep it visible so there is no hover-only affordance to miss.
const overlayVisibilityClassName =
  "opacity-60 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

// Compact icon buttons for the owner-actions toolbar: text labels ("Set as cover",
// "Share") wrap on a small square tile, so the tile shows an icon only and carries the
// label as `aria-label`/`title` instead.
function CoverIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l2.47 5.01 5.53.8-4 3.9.94 5.5L12 16.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 11l7-3.5M8 13l7 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const iconButtonClassName =
  "flex h-7 w-7 items-center justify-center rounded-sm border border-line bg-background/70 text-text hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

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
              aria-label={ownerActions.messages.setCover}
              title={ownerActions.messages.setCover}
              className={iconButtonClassName}
            >
              <CoverIcon />
            </button>
          </form>
          <form
            action={deletePhotoAction}
            onSubmit={(event) => {
              if (!window.confirm(ownerActions.messages.confirmDelete)) event.preventDefault();
            }}
          >
            <input type="hidden" name="photoId" value={photo.id} />
            <button
              type="submit"
              aria-label={ownerActions.messages.deletePhoto}
              title={ownerActions.messages.deletePhoto}
              className={iconButtonClassName}
            >
              <DeleteIcon />
            </button>
          </form>
          <button
            type="button"
            onClick={openShare}
            aria-label={ownerActions.messages.action}
            title={ownerActions.messages.action}
            className={iconButtonClassName}
          >
            <ShareIcon />
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
