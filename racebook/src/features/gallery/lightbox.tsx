"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { joinClassNames } from "@/components/ui/class-names";
import type { Athlete } from "@/db/types";
import { TagForm, TransferForm, type TagFormMessages, type TransferFormMessages } from "./action-forms";
import type { PhotoPill } from "./photo-status";

// Present only on a photo I own: the same Select-based forms as the grid card, reused
// here so accepting a transfer or a tag from inside the lightbox goes through the exact
// same server actions.
export type LightboxOwnerActions = {
  eventId: string;
  candidates: Athlete[];
  showTransferForm: boolean;
  transferMessages: TransferFormMessages;
  tagMessages: TagFormMessages;
};

// Only plain strings and pre-computed data cross into this client component: the server
// has already resolved every translated label (see event-gallery.tsx and photo-card.tsx).
export type LightboxPhoto = {
  id: string;
  src: string;
  alt: string;
  taggedByLabel: string | null;
  pills: PhotoPill[];
  ownerActions: LightboxOwnerActions | null;
};

export type LightboxLabels = {
  previous: string;
  next: string;
  close: string;
  counterSeparator: string; // "of" / "de", read as `${n} ${counterSeparator} ${total}`
};

type LightboxContextValue = { open: (photoId: string) => void };

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const context = useContext(LightboxContext);
  if (!context) throw new Error("useLightbox must be used inside a LightboxProvider");
  return context;
}

export function LightboxProvider({
  photos,
  labels,
  children,
}: {
  photos: LightboxPhoto[];
  labels: LightboxLabels;
  children: ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (photoId: string) => {
      const index = photos.findIndex((photo) => photo.id === photoId);
      if (index === -1) return;
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpenIndex(index);
    },
    [photos],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const showPrevious = useCallback(() => {
    setOpenIndex((index) => (index === null ? null : (index - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const showNext = useCallback(() => {
    setOpenIndex((index) => (index === null ? null : (index + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openIndex, showPrevious, showNext]);

  const currentPhoto = openIndex !== null ? photos[openIndex] : null;
  const contextValue = useMemo(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={close}
        className="panel m-auto flex max-h-[92vh] w-[min(96vw,64rem)] max-w-none flex-col gap-3 bg-background p-4 backdrop:bg-black/80"
      >
        {currentPhoto ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <span className="text-label text-text-muted">
                {(openIndex ?? 0) + 1} {labels.counterSeparator} {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
              <button
                type="button"
                onClick={showPrevious}
                aria-label={labels.previous}
                className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-background/70 text-xl text-text hover:opacity-80"
              >
                ‹
              </button>
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                className="max-h-[60vh] w-full rounded-sm object-contain"
              />
              <button
                type="button"
                onClick={showNext}
                aria-label={labels.next}
                className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-background/70 text-xl text-text hover:opacity-80"
              >
                ›
              </button>
            </div>

            <div className="panel flex flex-col gap-3 p-3">
              {currentPhoto.taggedByLabel ? (
                <StatusPill status="accepted" label={currentPhoto.taggedByLabel} />
              ) : (
                <>
                  {currentPhoto.pills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currentPhoto.pills.map((pill) => (
                        <StatusPill key={pill.id} status={pill.status} label={pill.label} />
                      ))}
                    </div>
                  ) : null}
                  {currentPhoto.ownerActions ? (
                    <div className="flex flex-wrap gap-3">
                      {currentPhoto.ownerActions.showTransferForm ? (
                        <TransferForm
                          photoId={currentPhoto.id}
                          eventId={currentPhoto.ownerActions.eventId}
                          candidates={currentPhoto.ownerActions.candidates}
                          messages={currentPhoto.ownerActions.transferMessages}
                        />
                      ) : null}
                      <TagForm
                        photoId={currentPhoto.id}
                        eventId={currentPhoto.ownerActions.eventId}
                        candidates={currentPhoto.ownerActions.candidates}
                        messages={currentPhoto.ownerActions.tagMessages}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="hidden gap-2 overflow-x-auto sm:flex">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  aria-label={photo.alt}
                  aria-current={index === openIndex}
                  className={joinClassNames(
                    "h-14 w-14 flex-none rounded-sm",
                    index === openIndex ? "outline outline-2 outline-accent" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={photo.src} alt="" className="h-full w-full rounded-sm object-cover" />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  );
}

export function PhotoThumbnailButton({
  photoId,
  src,
  alt,
}: {
  photoId: string;
  src: string;
  alt: string;
}) {
  const { open } = useLightbox();
  return (
    <button type="button" onClick={() => open(photoId)} className="block w-full">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-square w-full rounded-sm object-cover"
      />
    </button>
  );
}
