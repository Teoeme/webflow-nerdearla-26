"use client";

import { useRef, useState, type ChangeEvent } from "react";
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

// A batch uploader: every file is its own request, uploaded one at a time (a request
// never carries more than one photo, so the Workers body limit never matters), each
// shown as its own row.
export function UploadForm({ eventId, messages }: { eventId: string; messages: UploadMessages }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES_ATTRIBUTE}
        multiple
        className="hidden"
        onChange={handleFilesSelected}
        disabled={isUploading}
      />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
        {messages.button}
      </Button>
      {rows.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row.key} className="text-label text-text-muted flex items-center justify-between gap-2">
              <span>{row.fileName}</span>
              <span>{statusLabel(row, messages)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
