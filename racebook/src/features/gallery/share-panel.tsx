"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusPill } from "@/components/ui/status-pill";
import { joinClassNames } from "@/components/ui/class-names";
import type { TagRequestOutcome } from "@/db/photo-tags";
import type { TransferRequestOutcome } from "@/db/transfers";
import type { TagStatus } from "@/db/types";
import { requestPhotoTag, requestPhotoTransfer } from "./actions";

// Plain strings only: `sendButton`/`tagButton` in the dictionary are functions of the
// athlete's name, and a function can't cross the server/client boundary as a prop — the
// server resolves one pair of labels per candidate before this ever reaches the client.
export type ShareCandidate = { id: string; name: string; sendLabel: string; tagLabel: string };

export type ShareMessages = {
  action: string;
  setCover: string;
  modalTitle: string;
  closeLabel: string;
  modeSend: { label: string; description: string };
  modeTag: { label: string; description: string };
  choosePrompt: string;
  pendingPill: string;
  addedPill: string;
  outcomes: {
    not_owner: string;
    already_pending: string;
    already_tagged: string;
    same_athlete: string;
  };
};

// Everything the panel needs about the sharing state of one owned photo: the friends it
// can go to, whether a transfer is already pending (only one at a time), and the tag
// status per friend, so a chip can show "Pending" / "Added" without a second request.
export type ShareState = {
  eventId: string;
  candidates: ShareCandidate[];
  pendingTransferRecipientId: string | null;
  tagStatusByAthleteId: Record<string, TagStatus>;
  messages: ShareMessages;
};

type ShareMode = "send" | "tag";

const HIDDEN_TRIGGER = <button type="button" tabIndex={-1} aria-hidden="true" className="sr-only" />;

function initialsOf(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}

function chipStatus(
  athleteId: string,
  share: ShareState,
): { status: TagStatus; label: string } | null {
  if (athleteId === share.pendingTransferRecipientId) {
    return { status: "pending", label: share.messages.pendingPill };
  }
  const tagStatus = share.tagStatusByAthleteId[athleteId];
  if (tagStatus === "pending") return { status: "pending", label: share.messages.pendingPill };
  if (tagStatus === "accepted") return { status: "accepted", label: share.messages.addedPill };
  return null;
}

function segmentClassName(isActive: boolean): string {
  return joinClassNames(
    "flex flex-col items-start gap-0.5 rounded-sm border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
    isActive ? "border-accent bg-accent/10" : "border-line hover:border-text-muted",
  );
}

function chipClassName(isSelected: boolean): string {
  return joinClassNames(
    "flex items-center gap-2 rounded-sm border py-1 pr-3 pl-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
    isSelected ? "border-accent bg-accent/10 text-text" : "border-line text-text-muted hover:border-text-muted hover:text-text",
  );
}

// The single "Share" surface for an owned photo: pick a friend, then pick what sharing
// means for them — send (the photo moves) or tag (it stays and also appears in theirs).
// Reuses the two existing server actions unchanged; only the presentation is new.
export function SharePanel({
  photoId,
  photoSrc,
  photoAlt,
  share,
  open,
  onOpenChange,
}: {
  photoId: string;
  photoSrc: string;
  photoAlt: string;
  share: ShareState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const hasPendingTransfer = share.pendingTransferRecipientId !== null;
  const [mode, setMode] = useState<ShareMode>(hasPendingTransfer ? "tag" : "send");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const [transferOutcome, transferAction, isTransferPending] = useActionState<
    TransferRequestOutcome | null,
    FormData
  >(requestPhotoTransfer, null);
  const [tagOutcome, tagAction, isTagPending] = useActionState<TagRequestOutcome | null, FormData>(
    requestPhotoTag,
    null,
  );

  useEffect(() => {
    if (transferOutcome === "requested" || tagOutcome === "tagged") onOpenChange(false);
  }, [transferOutcome, tagOutcome, onOpenChange]);

  const selectedAthlete = share.candidates.find((athlete) => athlete.id === selectedAthleteId);
  const isPending = mode === "send" ? isTransferPending : isTagPending;
  const outcome = mode === "send" ? transferOutcome : tagOutcome;
  const outcomeMessage =
    outcome && outcome !== "requested" && outcome !== "tagged" ? share.messages.outcomes[outcome] : null;
  const primaryLabel = selectedAthlete
    ? mode === "send"
      ? selectedAthlete.sendLabel
      : selectedAthlete.tagLabel
    : share.messages.choosePrompt;

  return (
    <Modal
      trigger={HIDDEN_TRIGGER}
      title={share.messages.modalTitle}
      open={open}
      onOpenChange={onOpenChange}
      closeLabel={share.messages.closeLabel}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <img src={photoSrc} alt={photoAlt} className="h-20 w-20 flex-none rounded-sm object-cover" />
          <div className="grid flex-1 grid-cols-2 gap-2">
            <button
              type="button"
              disabled={hasPendingTransfer}
              onClick={() => setMode("send")}
              className={joinClassNames(segmentClassName(mode === "send"), hasPendingTransfer && "opacity-40")}
            >
              <span className="text-label text-text">{share.messages.modeSend.label}</span>
              <span className="text-sm text-text-muted">{share.messages.modeSend.description}</span>
            </button>
            <button type="button" onClick={() => setMode("tag")} className={segmentClassName(mode === "tag")}>
              <span className="text-label text-text">{share.messages.modeTag.label}</span>
              <span className="text-sm text-text-muted">{share.messages.modeTag.description}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {share.candidates.map((athlete) => {
            const status = chipStatus(athlete.id, share);
            return (
              <button
                type="button"
                key={athlete.id}
                aria-pressed={athlete.id === selectedAthleteId}
                onClick={() => setSelectedAthleteId(athlete.id)}
                className={chipClassName(athlete.id === selectedAthleteId)}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-field text-sm text-text">
                  {initialsOf(athlete.name)}
                </span>
                <span className="text-label">{athlete.name}</span>
                {status ? <StatusPill status={status.status} label={status.label} /> : null}
              </button>
            );
          })}
        </div>

        <form action={mode === "send" ? transferAction : tagAction} className="flex flex-col gap-3">
          <input type="hidden" name="photoId" value={photoId} />
          <input type="hidden" name="eventId" value={share.eventId} />
          <input
            type="hidden"
            name={mode === "send" ? "toAthleteId" : "athleteId"}
            value={selectedAthleteId ?? ""}
          />
          <Button type="submit" variant="primary" disabled={!selectedAthleteId || isPending} className="self-start">
            {primaryLabel}
          </Button>
          {outcomeMessage ? <p className="text-label text-text-muted">{outcomeMessage}</p> : null}
        </form>
      </div>
    </Modal>
  );
}
