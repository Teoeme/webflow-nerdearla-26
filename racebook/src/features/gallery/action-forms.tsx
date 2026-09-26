"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import type { TagRequestOutcome } from "@/db/photo-tags";
import type { TransferRequestOutcome } from "@/db/transfers";
import type { Athlete } from "@/db/types";
import { requestPhotoTag, requestPhotoTransfer } from "./actions";

export type TransferFormMessages = {
  fieldLabel: string;
  placeholder: string;
  button: string;
  outcomes: Record<Exclude<TransferRequestOutcome, "requested">, string>;
};

export type TagFormMessages = {
  fieldLabel: string;
  placeholder: string;
  button: string;
  outcomes: Record<Exclude<TagRequestOutcome, "tagged">, string>;
};

// Per-photo owner actions: the owner sends a photo to a friend (it moves) or tags one
// (it stays, and also appears in the friend's gallery once accepted). Both need
// useActionState to show a translated message for a non-success outcome instead of
// silently ignoring it, so they must be client components.

export function TransferForm({
  photoId,
  eventId,
  candidates,
  messages,
}: {
  photoId: string;
  eventId: string;
  candidates: Athlete[];
  messages: TransferFormMessages;
}) {
  const [outcome, formAction, isPending] = useActionState(requestPhotoTransfer, null);
  const outcomeMessage = outcome && outcome !== "requested" ? messages.outcomes[outcome] : null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="photoId" value={photoId} />
      <input type="hidden" name="eventId" value={eventId} />
      <Field label={messages.fieldLabel} htmlFor={`transfer-${photoId}`}>
        <Select id={`transfer-${photoId}`} name="toAthleteId" required defaultValue="">
          <option value="" disabled>
            {messages.placeholder}
          </option>
          {candidates.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" variant="outline" disabled={isPending}>
        {messages.button}
      </Button>
      {outcomeMessage ? <p className="text-label text-text-muted">{outcomeMessage}</p> : null}
    </form>
  );
}

export function TagForm({
  photoId,
  eventId,
  candidates,
  messages,
}: {
  photoId: string;
  eventId: string;
  candidates: Athlete[];
  messages: TagFormMessages;
}) {
  const [outcome, formAction, isPending] = useActionState(requestPhotoTag, null);
  const outcomeMessage = outcome && outcome !== "tagged" ? messages.outcomes[outcome] : null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="photoId" value={photoId} />
      <input type="hidden" name="eventId" value={eventId} />
      <Field label={messages.fieldLabel} htmlFor={`tag-${photoId}`}>
        <Select id={`tag-${photoId}`} name="athleteId" required defaultValue="">
          <option value="" disabled>
            {messages.placeholder}
          </option>
          {candidates.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" variant="outline" disabled={isPending}>
        {messages.button}
      </Button>
      {outcomeMessage ? <p className="text-label text-text-muted">{outcomeMessage}</p> : null}
    </form>
  );
}
