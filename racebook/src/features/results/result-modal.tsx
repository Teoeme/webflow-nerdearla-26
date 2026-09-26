"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { RaceResult } from "@/db/types";
import { ResultForm, type CapturedFieldName } from "./result-form";
import type { ClientResultsMessages } from "./client-messages";
import {
  ScreenshotCapture,
  toResultFormValues,
  type ScreenshotCaptureLabels,
} from "@/features/ai-capture/screenshot-capture";

// How long a field stays visibly highlighted after a screenshot capture fills it.
const CAPTURE_HIGHLIGHT_DURATION_MS = 3000;

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
  captureLabels,
}: {
  eventId: string;
  existingResult: RaceResult | undefined;
  messages: ClientResultsMessages;
  closeLabel: string;
  eventSummary: string;
  initiallyOpen: boolean;
  captureLabels: ScreenshotCaptureLabels;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [prefilledValues, setPrefilledValues] = useState<ReturnType<typeof toResultFormValues>>();
  const [highlightedFields, setHighlightedFields] = useState<CapturedFieldName[]>();
  const [captureCount, setCaptureCount] = useState(0);
  const triggerLabel = existingResult
    ? messages.eventDetail.myResult.editCta
    : messages.eventDetail.myResult.logCta;

  // The highlight is tied to the moment of capture, not to `prefilledValues` itself:
  // `prefilledValues` intentionally survives a close/reopen within the same session
  // (see ResultForm), but the highlight must not reappear on a plain reopen.
  useEffect(() => {
    if (!highlightedFields) return;
    const timeoutId = setTimeout(() => setHighlightedFields(undefined), CAPTURE_HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeoutId);
  }, [highlightedFields]);

  function closeModal(): void {
    setOpen(false);
    setHighlightedFields(undefined);
  }

  return (
    <Modal
      trigger={<Button variant="outline">{triggerLabel}</Button>}
      title={messages.resultForm.title}
      description={eventSummary}
      closeLabel={closeLabel}
      size="wide"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setHighlightedFields(undefined);
      }}
    >
      <div className="mb-4">
        <ScreenshotCapture
          labels={captureLabels}
          onCaptured={(metrics) => {
            const values = toResultFormValues(metrics);
            setPrefilledValues(values);
            setHighlightedFields(Object.keys(values) as CapturedFieldName[]);
            // Remount the form so its uncontrolled fields take the captured values.
            setCaptureCount((count) => count + 1);
          }}
        />
      </div>
      <ResultForm
        key={captureCount}
        eventId={eventId}
        existingResult={existingResult}
        messages={messages}
        prefilledValues={prefilledValues}
        highlightedFields={highlightedFields}
        onSaved={closeModal}
      />
    </Modal>
  );
}
