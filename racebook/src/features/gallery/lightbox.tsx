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

// Only plain strings cross into this client component: the server has already resolved
// every translated label (see event-gallery.tsx and photo-card.tsx).
export type LightboxPhoto = {
  id: string;
  src: string;
  alt: string;
  taggedByLabel: string | null;
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
        className="panel m-auto max-w-3xl bg-background p-0 backdrop:bg-black/80"
      >
        {currentPhoto ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-label text-text-muted">
                {(openIndex ?? 0) + 1} {labels.counterSeparator} {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="text-label text-text-muted hover:text-text"
              >
                {labels.close}
              </button>
            </div>
            <img
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              className="max-h-[70vh] w-full rounded-sm object-contain"
            />
            {currentPhoto.taggedByLabel ? (
              <p className="text-label text-text-muted">{currentPhoto.taggedByLabel}</p>
            ) : null}
            <div className="flex justify-between gap-4">
              <button type="button" onClick={showPrevious} className="text-label text-accent">
                {labels.previous}
              </button>
              <button type="button" onClick={showNext} className="text-label text-accent">
                {labels.next}
              </button>
            </div>
          </div>
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
