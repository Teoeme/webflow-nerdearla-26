"use client";

import { useState } from "react";
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
  const [isReadingCapture, setIsReadingCapture] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const triggerLabel = existingResult
    ? messages.eventDetail.myResult.editCta
    : messages.eventDetail.myResult.logCta;

  // A field stays marked as AI-filled until the athlete either edits it or saves
  // the form (`closeModal`, below) — never on a timer.
  function markFieldEdited(field: CapturedFieldName): void {
    setHighlightedFields((current) => current?.filter((highlighted) => highlighted !== field));
  }

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
          onReadingChange={setIsReadingCapture}
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
        isCapturing={isReadingCapture}
        aiBadgeLabel={captureLabels.filledByAi}
        onFieldEdited={markFieldEdited}
        onSaved={closeModal}
      />
    </Modal>
  );
}
