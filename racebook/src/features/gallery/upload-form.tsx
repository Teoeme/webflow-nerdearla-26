"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";
import { ACCEPTED_PHOTO_TYPES_ATTRIBUTE, type PhotoUploadRejectionReason } from "./upload-constraints";

type UploadRowStatus = "waiting" | "uploading" | "done" | "rejected";

type UploadRow = {
  key: string;
  fileName: string;
  status: UploadRowStatus;
  reason?: PhotoUploadRejectionReason;
};

type UploadMessages = GalleryMessages["eventGallery"]["upload"];

function statusLabel(row: UploadRow, messages: UploadMessages): string {
  if (row.status === "rejected") return messages.rejected[row.reason ?? "missing"];
  return messages[row.status];
}

function withRowStatus(
  rows: UploadRow[],
  key: string,
  status: UploadRowStatus,
  reason?: PhotoUploadRejectionReason,
): UploadRow[] {
  return rows.map((row) => (row.key === key ? { ...row, status, reason } : row));
}

function isSettled(row: UploadRow): boolean {
  return row.status === "done" || row.status === "rejected";
}

function formatProgress(template: string, settledCount: number, totalCount: number): string {
  return template.replace("{done}", String(settledCount)).replace("{total}", String(totalCount));
}

function preventDefault(event: DragEvent<HTMLDivElement>): void {
  event.preventDefault();
}

// A batch uploader, shown as an overlay panel: a drop zone (drag and drop, plus a file
// picker), an overall progress bar and one row per file. Every file is still its own
// request, uploaded one at a time (a request never carries more than one photo, so the
// Workers body limit never matters).
export function UploadForm({ eventId, messages }: { eventId: string; messages: UploadMessages }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function openPanel(): void {
    dialogRef.current?.showModal();
  }

  async function uploadFiles(files: File[]): Promise<void> {
    setIsUploading(true);
    const initialRows = files.map((file, index) => ({
      key: `${index}-${file.name}`,
      fileName: file.name,
      status: "waiting" as UploadRowStatus,
    }));
    setRows(initialRows);

    for (const [index, row] of initialRows.entries()) {
      const file = files[index];
      setRows((currentRows) => withRowStatus(currentRows, row.key, "uploading"));

      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("photo", file);

      const response = await fetch("/api/photos", { method: "POST", body: formData });
      if (response.ok) {
        setRows((currentRows) => withRowStatus(currentRows, row.key, "done"));
        continue;
      }

      const body = (await response.json().catch(() => null)) as { reason?: PhotoUploadRejectionReason } | null;
      setRows((currentRows) => withRowStatus(currentRows, row.key, "rejected", body?.reason ?? "missing"));
    }

    setIsUploading(false);
    router.refresh();
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    void uploadFiles(files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    void uploadFiles(files);
  }

  const settledCount = rows.filter(isSettled).length;
  const overallProgress = rows.length === 0 ? 0 : Math.round((settledCount / rows.length) * 100);

  return (
    <>
      <Button type="button" onClick={openPanel}>
        {messages.button}
      </Button>
      <dialog
        ref={dialogRef}
        onClose={() => setRows([])}
        className="panel m-auto w-[min(92vw,32rem)] max-w-none bg-background p-0 backdrop:bg-black/80"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-heading text-lg">{messages.button}</span>
            {rows.length > 0 ? (
              <span className="text-label text-text-muted">
                {formatProgress(messages.progressTemplate, settledCount, rows.length)}
              </span>
            ) : null}
          </div>

          {rows.length > 0 ? (
            <div className="h-1 overflow-hidden rounded-sm bg-line">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${overallProgress}%` }} />
            </div>
          ) : null}

          <div
            onDrop={handleDrop}
            onDragOver={preventDefault}
            className="rounded-sm border border-dashed border-line p-4 text-center text-label text-text-muted"
          >
            {messages.dropZone}{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-accent underline-offset-2 hover:underline"
            >
              {messages.browseFiles}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_PHOTO_TYPES_ATTRIBUTE}
            multiple
            className="hidden"
            onChange={handleFilesSelected}
            disabled={isUploading}
          />

          {rows.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {rows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-center justify-between gap-2 border-t border-line pt-1 text-label"
                >
                  <span className="text-text">{row.fileName}</span>
                  <span className="text-text-muted">{statusLabel(row, messages)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {rows.length > 0 && !isUploading ? (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
                {messages.close}
              </Button>
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
