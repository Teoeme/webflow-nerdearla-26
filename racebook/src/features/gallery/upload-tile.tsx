"use client";

import type { GalleryMessages } from "@/i18n/messages/gallery.en";
import type { PhotoUploadRejectionReason } from "./upload-constraints";

export type UploadMessages = GalleryMessages["eventGallery"]["upload"];

export type UploadRowStatus = "uploading" | "done" | "rejected";

export type UploadRow = {
  key: string;
  fileName: string;
  previewUrl: string;
  status: UploadRowStatus;
  progressPercent: number;
  photoId?: string;
  reason?: PhotoUploadRejectionReason;
};

function AddPhotoGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.086a1 1 0 0 0 .82-.429l.94-1.342A1 1 0 0 1 10.166 5h3.668a1 1 0 0 1 .82.429l.94 1.342a1 1 0 0 0 .82.429H18.5A1.5 1.5 0 0 1 20 8.5v8A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M17 9.5h2M18 8.5v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// First cell of the photo grid: a dashed drop target that also opens the file picker.
// `isLarge` centers a bigger version of the same tile for the empty-gallery state.
export function UploadTile({
  messages,
  isLarge,
  onClick,
}: {
  messages: UploadMessages;
  isLarge: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isLarge
          ? "mx-auto flex aspect-[2/1] w-full max-w-md flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          : "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-line p-2 text-center text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      }
    >
      <AddPhotoGlyph />
      <span className="text-label">{messages.addPhotos}</span>
      <span className="text-sm text-text-muted">{messages.hint}</span>
    </button>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" className="-rotate-90">
      <circle cx="16" cy="16" r={radius} stroke="rgb(255 255 255 / 0.25)" strokeWidth="3" fill="none" />
      <circle
        cx="16"
        cy="16"
        r={radius}
        stroke="var(--color-accent)"
        strokeWidth="3"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-150"
      />
    </svg>
  );
}

// A tile in place of a real photo while it uploads: the local thumbnail preview
// (object URL) with a progress ring on top, or an inline rejection reason once the
// server turned it down. Dismissible only once settled.
export function UploadPlaceholderTile({
  row,
  messages,
  onDismiss,
}: {
  row: UploadRow;
  messages: UploadMessages;
  onDismiss: () => void;
}) {
  const isRejected = row.status === "rejected";

  return (
    <figure className="panel relative aspect-square overflow-hidden">
      <img
        src={row.previewUrl}
        alt=""
        className={`h-full w-full object-cover ${isRejected ? "opacity-30" : "opacity-70"}`}
      />
      {isRejected ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-2 text-center">
          <span className="text-label text-text">{messages.rejected[row.reason ?? "missing"]}</span>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-sm border border-line px-2 py-0.5 text-label text-text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {messages.dismiss}
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background/30">
          {row.status === "done" ? (
            <span className="text-label text-text">{messages.done}</span>
          ) : (
            <ProgressRing percent={row.progressPercent} />
          )}
        </div>
      )}
    </figure>
  );
}
