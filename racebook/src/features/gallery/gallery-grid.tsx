"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { LightboxProvider, type LightboxLabels, type LightboxPhoto } from "./lightbox";
import { PhotoCard } from "./photo-card";
import { ACCEPTED_PHOTO_TYPES_ATTRIBUTE, type PhotoUploadRejectionReason } from "./upload-constraints";
import { UploadPlaceholderTile, UploadTile, type UploadMessages, type UploadRow } from "./upload-tile";

type UploadOutcome = { ok: true; photoId: string } | { ok: false; reason: PhotoUploadRejectionReason };

function parseRejectionReason(responseText: string): PhotoUploadRejectionReason {
  try {
    const body = JSON.parse(responseText) as { reason?: PhotoUploadRejectionReason };
    return body.reason ?? "missing";
  } catch {
    return "missing";
  }
}

function parsePhotoId(responseText: string): string {
  try {
    const body = JSON.parse(responseText) as { photoId?: string };
    return body.photoId ?? "";
  } catch {
    return "";
  }
}

// Uploads through XMLHttpRequest instead of fetch: only XHR exposes upload progress
// events, which drive each placeholder tile's progress ring.
function uploadPhotoWithProgress(
  eventId: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadOutcome> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/photos");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const isSuccess = request.status >= 200 && request.status < 300;
      resolve(
        isSuccess
          ? { ok: true, photoId: parsePhotoId(request.responseText) }
          : { ok: false, reason: parseRejectionReason(request.responseText) },
      );
    };
    request.onerror = () => resolve({ ok: false, reason: "missing" });

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("photo", file);
    request.send(formData);
  });
}

function withRowUpdate(rows: UploadRow[], key: string, update: Partial<UploadRow>): UploadRow[] {
  return rows.map((row) => (row.key === key ? { ...row, ...update } : row));
}

function filesFrom(fileList: FileList | null): File[] {
  return fileList ? Array.from(fileList) : [];
}

// The whole photo grid for one event: the upload tile as its first cell, an in-flight
// placeholder tile per file being uploaded, then the real photos — plus a drop target
// that spans the whole grid, not just the tile, so a drag can land anywhere.
export function GalleryGrid({
  eventId,
  photos,
  lightboxLabels,
  uploadMessages,
}: {
  eventId: string;
  photos: LightboxPhoto[];
  lightboxLabels: LightboxLabels;
  uploadMessages: UploadMessages;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [isDraggingOverGrid, setIsDraggingOverGrid] = useState(false);

  // Once the server data (`photos`) catches up with an uploaded file — matched by the
  // photo id the upload response returned — its placeholder tile can go: the real
  // `PhotoCard` now renders in its place.
  useEffect(() => {
    const uploadedPhotoIds = new Set(photos.map((photo) => photo.id));
    setRows((currentRows) =>
      currentRows.filter((row) => !(row.photoId && uploadedPhotoIds.has(row.photoId))),
    );
  }, [photos]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const newRows: UploadRow[] = files.map((file) => ({
        key: crypto.randomUUID(),
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
        progressPercent: 0,
      }));
      setRows((currentRows) => [...currentRows, ...newRows]);

      for (const [index, row] of newRows.entries()) {
        const file = files[index];
        const outcome = await uploadPhotoWithProgress(eventId, file, (percent) =>
          setRows((currentRows) => withRowUpdate(currentRows, row.key, { progressPercent: percent })),
        );
        if (outcome.ok) {
          setRows((currentRows) => withRowUpdate(currentRows, row.key, { status: "done", photoId: outcome.photoId }));
        } else {
          setRows((currentRows) => withRowUpdate(currentRows, row.key, { status: "rejected", reason: outcome.reason }));
        }
      }

      router.refresh();
    },
    [eventId, router],
  );

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>): void {
    const files = filesFrom(event.target.files);
    event.target.value = "";
    if (files.length > 0) void uploadFiles(files);
  }

  function dismissRow(key: string): void {
    setRows((currentRows) => currentRows.filter((row) => row.key !== key));
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingOverGrid(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDraggingOverGrid(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingOverGrid(false);
    const files = filesFrom(event.dataTransfer.files);
    if (files.length > 0) void uploadFiles(files);
  }

  const isEmpty = photos.length === 0 && rows.length === 0;

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_PHOTO_TYPES_ATTRIBUTE}
      multiple
      className="hidden"
      onChange={handleFilesSelected}
    />
  );

  if (isEmpty) {
    return (
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative rounded-sm"
      >
        <UploadTile messages={uploadMessages} isLarge onClick={openFilePicker} />
        {hiddenInput}
        {isDraggingOverGrid ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm border border-accent bg-accent/5 text-label text-accent">
            {uploadMessages.dropHint}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      <LightboxProvider photos={photos} labels={lightboxLabels}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <UploadTile messages={uploadMessages} isLarge={false} onClick={openFilePicker} />
          {rows.map((row) => (
            <UploadPlaceholderTile
              key={row.key}
              row={row}
              messages={uploadMessages}
              onDismiss={() => dismissRow(row.key)}
            />
          ))}
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      </LightboxProvider>
      {hiddenInput}
      {isDraggingOverGrid ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm border border-accent bg-accent/5 text-label text-accent">
          {uploadMessages.dropHint}
        </div>
      ) : null}
    </div>
  );
}
