"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import type { TagRequestOutcome } from "@/db/photo-tags";
import type { TransferRequestOutcome } from "@/db/transfers";
import type { Athlete } from "@/db/types";
import { requestPhotoTag, requestPhotoTransfer } from "./actions";

export type TransferFormMessages = {
  fieldLabel: string;
  placeholder: string;
  button: string;
  menuLabel: string;
  modalTitle: string;
  closeLabel: string;
  outcomes: Record<Exclude<TransferRequestOutcome, "requested">, string>;
};

export type TagFormMessages = {
  fieldLabel: string;
  placeholder: string;
  button: string;
  menuLabel: string;
  modalTitle: string;
  closeLabel: string;
  outcomes: Record<Exclude<TagRequestOutcome, "tagged">, string>;
};

// Modal only ever opens from a Menu item or a Lightbox button — never from clicking the
// trigger itself, since visibility is fully controlled by `open`/`onOpenChange` — so the
// trigger stays invisible and out of the tab order.
const HIDDEN_TRIGGER = <button type="button" tabIndex={-1} aria-hidden="true" className="sr-only" />;

// Per-photo owner actions: the owner sends a photo to a friend (it moves) or tags one
// (it stays, and also appears in the friend's gallery once accepted). Both open in a
// Modal instead of an inline form, reused by the grid card menu and the lightbox
// footer — same server action, same outcome handling. Success closes the modal; any
// other outcome shows its message and leaves the modal open.

export function TransferModal({
  photoId,
  eventId,
  candidates,
  messages,
  open,
  onOpenChange,
}: {
  photoId: string;
  eventId: string;
  candidates: Athlete[];
  messages: TransferFormMessages;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [outcome, formAction, isPending] = useActionState(requestPhotoTransfer, null);
  const outcomeMessage = outcome && outcome !== "requested" ? messages.outcomes[outcome] : null;

  useEffect(() => {
    if (outcome === "requested") onOpenChange(false);
  }, [outcome, onOpenChange]);

  return (
    <Modal
      trigger={HIDDEN_TRIGGER}
      title={messages.modalTitle}
      open={open}
      onOpenChange={onOpenChange}
      closeLabel={messages.closeLabel}
    >
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="photoId" value={photoId} />
        <input type="hidden" name="eventId" value={eventId} />
        <Field label={messages.fieldLabel} htmlFor={`transfer-${photoId}`}>
          <Select
            id={`transfer-${photoId}`}
            name="toAthleteId"
            required
            placeholder={messages.placeholder}
            options={candidates.map((athlete) => ({ value: athlete.id, label: athlete.name }))}
          />
        </Field>
        <Button type="submit" variant="primary" disabled={isPending} className="self-start">
          {messages.button}
        </Button>
        {outcomeMessage ? <p className="text-label text-text-muted">{outcomeMessage}</p> : null}
      </form>
    </Modal>
  );
}

export function TagModal({
  photoId,
  eventId,
  candidates,
  messages,
  open,
  onOpenChange,
}: {
  photoId: string;
  eventId: string;
  candidates: Athlete[];
  messages: TagFormMessages;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [outcome, formAction, isPending] = useActionState(requestPhotoTag, null);
  const outcomeMessage = outcome && outcome !== "tagged" ? messages.outcomes[outcome] : null;

  useEffect(() => {
    if (outcome === "tagged") onOpenChange(false);
  }, [outcome, onOpenChange]);

  return (
    <Modal
      trigger={HIDDEN_TRIGGER}
      title={messages.modalTitle}
      open={open}
      onOpenChange={onOpenChange}
      closeLabel={messages.closeLabel}
    >
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="photoId" value={photoId} />
        <input type="hidden" name="eventId" value={eventId} />
        <Field label={messages.fieldLabel} htmlFor={`tag-${photoId}`}>
          <Select
            id={`tag-${photoId}`}
            name="athleteId"
            required
            placeholder={messages.placeholder}
            options={candidates.map((athlete) => ({ value: athlete.id, label: athlete.name }))}
          />
        </Field>
        <Button type="submit" variant="primary" disabled={isPending} className="self-start">
          {messages.button}
        </Button>
        {outcomeMessage ? <p className="text-label text-text-muted">{outcomeMessage}</p> : null}
      </form>
    </Modal>
  );
}
