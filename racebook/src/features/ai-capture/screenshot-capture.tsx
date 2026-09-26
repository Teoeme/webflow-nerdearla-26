"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/i18n/formatters";
import type { CapturedMetrics } from "./extract-metrics";
import { ACCEPTED_SCREENSHOT_TYPES_ATTRIBUTE, type ScreenshotRejectionReason } from "./screenshot-constraints";

type CaptureFailureReason = ScreenshotRejectionReason | "unreadable" | "unavailable";

export type ScreenshotCaptureLabels = {
  button: string;
  reading: string;
  filledTemplate: string;
  errors: Record<CaptureFailureReason, string>;
};

type CaptureState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "done"; filledCount: number }
  | { status: "failed"; reason: CaptureFailureReason };

const METRIC_FIELDS: (keyof CapturedMetrics)[] = ["timeSeconds", "distanceKm", "avgHeartRate", "elevationM"];

function countFilledFields(metrics: CapturedMetrics): number {
  return METRIC_FIELDS.filter((field) => metrics[field] !== null).length;
}

function formatFilledMessage(template: string, filledCount: number): string {
  return template.replace("{count}", String(filledCount));
}

function isCaptureFailureReason(value: unknown): value is CaptureFailureReason {
  return value === "type" || value === "size" || value === "missing" || value === "unreadable" || value === "unavailable";
}

export function toResultFormValues(
  metrics: CapturedMetrics,
): Partial<Record<"time" | "distance" | "avgHeartRate" | "elevation", string>> {
  const values: Partial<Record<"time" | "distance" | "avgHeartRate" | "elevation", string>> = {};
  if (metrics.timeSeconds !== null) values.time = formatDuration(metrics.timeSeconds);
  if (metrics.distanceKm !== null) values.distance = String(metrics.distanceKm);
  if (metrics.avgHeartRate !== null) values.avgHeartRate = String(metrics.avgHeartRate);
  if (metrics.elevationM !== null) values.elevation = String(metrics.elevationM);
  return values;
}

export function ScreenshotCapture({
  labels,
  onCaptured,
}: {
  labels: ScreenshotCaptureLabels;
  onCaptured: (metrics: CapturedMetrics) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CaptureState>({ status: "idle" });

  async function captureScreenshot(file: File): Promise<void> {
    setState({ status: "reading" });

    const formData = new FormData();
    formData.append("screenshot", file);
    const response = await fetch("/api/metrics-capture", { method: "POST", body: formData });
    const body = (await response.json().catch(() => null)) as { metrics?: CapturedMetrics; reason?: unknown } | null;

    if (response.ok && body?.metrics) {
      onCaptured(body.metrics);
      setState({ status: "done", filledCount: countFilledFields(body.metrics) });
      return;
    }

    const reason = isCaptureFailureReason(body?.reason) ? body.reason : "unavailable";
    setState({ status: "failed", reason });
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void captureScreenshot(file);
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={state.status === "reading"}
      >
        {labels.button}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_SCREENSHOT_TYPES_ATTRIBUTE}
        className="hidden"
        onChange={handleFileSelected}
      />
      {state.status === "reading" ? <span className="text-label text-text-muted">{labels.reading}</span> : null}
      {state.status === "done" ? (
        <span className="text-label text-text-muted">{formatFilledMessage(labels.filledTemplate, state.filledCount)}</span>
      ) : null}
      {state.status === "failed" ? (
        <span className="text-label text-text-muted">{labels.errors[state.reason]}</span>
      ) : null}
    </div>
  );
}
