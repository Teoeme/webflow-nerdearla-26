"use client";

import { useState } from "react";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { StatusPill } from "@/components/ui/status-pill";
import { TagModal, TransferModal } from "./action-forms";
import { PhotoThumbnailButton, type LightboxPhoto } from "./lightbox";

// The overlay (pills + menu) shows at reduced opacity by default and full opacity on
// hover or keyboard focus, on pointer-fine (mouse) viewports; smaller/touch viewports
// keep it visible so there is no hover-only affordance to miss.
const overlayVisibilityClassName =
  "opacity-60 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100";

// One grid tile in the event gallery. Reuses the same per-photo view model the
// lightbox renders (`LightboxPhoto`) so the tile and the lightbox footer never
// disagree on pills, tagged-by label or which owner actions are available; only
// plain data and pre-resolved strings cross into this client component.
export function PhotoCard({ photo, actionsLabel }: { photo: LightboxPhoto; actionsLabel: string }) {
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [transferInstance, setTransferInstance] = useState(0);
  const [isTagOpen, setTagOpen] = useState(false);
  const [tagInstance, setTagInstance] = useState(0);

  const ownerActions = photo.ownerActions;
  const canTransfer = ownerActions !== null && ownerActions.showTransferForm;

  function openTransfer(): void {
    setTransferInstance((instance) => instance + 1);
    setTransferOpen(true);
  }

  function openTag(): void {
    setTagInstance((instance) => instance + 1);
    setTagOpen(true);
  }

  const menuItems: MenuItem[] = ownerActions
    ? [
        ...(canTransfer ? [{ label: ownerActions.transferMessages.menuLabel, onSelect: openTransfer }] : []),
        { label: ownerActions.tagMessages.menuLabel, onSelect: openTag },
      ]
    : [];

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

      {menuItems.length > 0 ? (
        <div className={`absolute top-1 right-1 z-10 ${overlayVisibilityClassName}`}>
          <Menu
            align="end"
            trigger={
              <button
                type="button"
                aria-label={actionsLabel}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm border border-line bg-background/70 text-text hover:opacity-80 active:opacity-70"
              >
                ⋯
              </button>
            }
            items={menuItems}
          />
        </div>
      ) : null}

      {ownerActions && canTransfer ? (
        <TransferModal
          key={transferInstance}
          open={isTransferOpen}
          onOpenChange={setTransferOpen}
          photoId={photo.id}
          eventId={ownerActions.eventId}
          candidates={ownerActions.candidates}
          messages={ownerActions.transferMessages}
        />
      ) : null}
      {ownerActions ? (
        <TagModal
          key={tagInstance}
          open={isTagOpen}
          onOpenChange={setTagOpen}
          photoId={photo.id}
          eventId={ownerActions.eventId}
          candidates={ownerActions.candidates}
          messages={ownerActions.tagMessages}
        />
      ) : null}
    </figure>
  );
}
