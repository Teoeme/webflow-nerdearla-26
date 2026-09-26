"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { RaceResult } from "@/db/types";
import { ResultForm } from "./result-form";
import type { ClientResultsMessages } from "./client-messages";

// Opens the result form in a modal on the event page itself. Set
// `initiallyOpen` from the page's `?logResult=1` search param so it opens by
// itself right after logging a new race.
export function ResultModal({
  eventId,
  existingResult,
  messages,
  closeLabel,
  eventSummary,
  initiallyOpen,
}: {
  eventId: string;
  existingResult: RaceResult | undefined;
  messages: ClientResultsMessages;
  closeLabel: string;
  eventSummary: string;
  initiallyOpen: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const triggerLabel = existingResult
    ? messages.eventDetail.myResult.editCta
    : messages.eventDetail.myResult.logCta;

  return (
    <Modal
      trigger={<Button variant="outline">{triggerLabel}</Button>}
      title={messages.resultForm.title}
      description={eventSummary}
      closeLabel={closeLabel}
      size="wide"
      open={open}
      onOpenChange={setOpen}
    >
      <ResultForm
        eventId={eventId}
        existingResult={existingResult}
        messages={messages}
        onSaved={() => setOpen(false)}
      />
      {/* Plan 11 (ai-capture) mounts <ScreenshotCapture /> here once merged. */}
    </Modal>
  );
}
