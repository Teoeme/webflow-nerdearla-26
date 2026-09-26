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
import { FadeInImage } from "./fade-in-image";
import { SharePanel, type ShareState } from "./share-panel";
import type { PhotoPill } from "./photo-status";

// Present only on a photo I own: the same sharing state the grid card reads, reused here
// so sending or tagging a friend from inside the lightbox goes through the exact same
// server actions and the same Share panel.
export type LightboxOwnerActions = ShareState;

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
  // The native <dialog> renders in the browser's top layer, above a Radix Modal portaled
  // to `body`. To let Transfer/Tag work from the lightbox, we close this dialog right
  // before such a modal opens, and reopen it once the modal closes. That `close()` call
  // fires the dialog's `close` event same as Escape/backdrop would; this flag tells the
  // handler to skip resetting `openIndex` for that one, deliberate close.
  const isClosingForActionModalRef = useRef(false);

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

  const handleDialogClose = useCallback(() => {
    if (isClosingForActionModalRef.current) {
      isClosingForActionModalRef.current = false;
      return;
    }
    close();
  }, [close]);

  const closeForActionModal = useCallback(() => {
    isClosingForActionModalRef.current = true;
    dialogRef.current?.close();
  }, []);

  const reopenAfterActionModal = useCallback(() => {
    if (!dialogRef.current || dialogRef.current.open) return;
    dialogRef.current.showModal();
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
        onClose={handleDialogClose}
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
              <FadeInImage
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                wrapperClassName="max-h-[60vh] w-full"
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
                    <PhotoOwnerActions
                      photoId={currentPhoto.id}
                      photoSrc={currentPhoto.src}
                      photoAlt={currentPhoto.alt}
                      ownerActions={currentPhoto.ownerActions}
                      onActionModalOpenChange={(isActionModalOpen) =>
                        isActionModalOpen ? closeForActionModal() : reopenAfterActionModal()
                      }
                    />
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
                  <FadeInImage
                    src={photo.src}
                    alt=""
                    wrapperClassName="h-full w-full rounded-sm"
                    className="h-full w-full rounded-sm object-cover"
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </dialog>
    </LightboxContext.Provider>
  );
}

// The Share button in the lightbox footer opens the same panel as the grid card — a
// fresh `key` per open discards any outcome message left over from a previous open,
// without disturbing the currently open instance while it closes.
//
// That panel is a Radix Dialog portaled to `body`, while the lightbox is a native
// <dialog> in the browser's top layer: the portal would render underneath it and be
// unreachable. `onActionModalOpenChange` tells the lightbox to close its own dialog
// right before this one opens, and reopen it once this one closes.
function PhotoOwnerActions({
  photoId,
  photoSrc,
  photoAlt,
  ownerActions,
  onActionModalOpenChange,
}: {
  photoId: string;
  photoSrc: string;
  photoAlt: string;
  ownerActions: LightboxOwnerActions;
  onActionModalOpenChange: (isOpen: boolean) => void;
}) {
  const [isShareOpen, setShareOpen] = useState(false);
  const [shareInstance, setShareInstance] = useState(0);

  function openShare(): void {
    setShareInstance((instance) => instance + 1);
    setShareOpen(true);
    onActionModalOpenChange(true);
  }

  function handleShareOpenChange(isOpen: boolean): void {
    setShareOpen(isOpen);
    onActionModalOpenChange(isOpen);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={openShare}
        className="rounded-sm border border-line px-3 py-1.5 text-label text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {ownerActions.messages.action}
      </button>
      <SharePanel
        key={shareInstance}
        open={isShareOpen}
        onOpenChange={handleShareOpenChange}
        photoId={photoId}
        photoSrc={photoSrc}
        photoAlt={photoAlt}
        share={ownerActions}
      />
    </div>
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
    <button
      type="button"
      onClick={() => open(photoId)}
      className="absolute inset-0 block h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <FadeInImage
        src={src}
        alt={alt}
        loading="lazy"
        wrapperClassName="h-full w-full"
        className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105 group-focus-within:scale-105"
      />
    </button>
  );
}
