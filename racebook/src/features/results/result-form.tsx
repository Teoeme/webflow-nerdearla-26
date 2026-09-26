"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { joinClassNames } from "@/components/ui/class-names";
import { MedalBadge } from "@/components/ui/medal-badge";
import type { Medal, RaceResult } from "@/db/types";
import { formatDuration } from "@/i18n/formatters";
import { saveResultAction, type ResultFormState } from "./actions";
import type { ClientResultsMessages } from "./client-messages";
import { FieldError } from "./field-error";
import { AiFilledBadge } from "@/features/ai-capture/ai-filled-badge";
import type { toResultFormValues } from "@/features/ai-capture/screenshot-capture";

type ResultFormPrefill = ReturnType<typeof toResultFormValues>;
export type CapturedFieldName = keyof ResultFormPrefill;

const INITIAL_STATE: ResultFormState = { errors: {} };
const MEDAL_OPTIONS: Medal[] = ["bronze", "silver", "gold"];

// Classes for a field that was just filled by a screenshot capture: an accent border and
// a faint accent tint that stay until the athlete edits the field or saves the form (see
// ResultModal). The tint pulses once on arrival, then settles into a steady highlight.
const CAPTURE_HIGHLIGHT_CLASS_NAME = "border-accent bg-accent/10";
const CAPTURE_PULSE_CLASS_NAME = "motion-safe:animate-[capture-pulse_var(--motion-duration-slow)_ease-out]";

// Classes for a field while Gemini is still reading the screenshot: a moving accent
// sweep (motion-safe only; a static accent border is the reduced-motion fallback).
const CAPTURE_READING_CLASS_NAME = "motion-safe:field-shimmer border-accent/40";

// A swatch (real radio + label, keyboard accessible) styled with the same
// border/focus rules as the rest of the form's fields.
const MEDAL_SWATCH_CLASS_NAME =
  "flex flex-1 basis-24 cursor-pointer items-center justify-center gap-2 rounded-sm border border-line px-3 py-2 has-[:checked]:border-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent";

function timeDefaultValue(existingResult: RaceResult | undefined): string {
  if (!existingResult || existingResult.timeSeconds === null) return "";
  return formatDuration(existingResult.timeSeconds);
}

// A field that can be auto-filled from a screenshot capture: same layout as the shared
// `Field`, plus the "AI" badge next to its label when the capture just filled it. Built
// locally instead of extending `Field` (owned by the `ui` area) since its `label` slot
// only takes plain text.
function CapturableField({
  label,
  htmlFor,
  hint,
  isHighlighted,
  badgeLabel,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  isHighlighted: boolean;
  badgeLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-label text-text-muted">
        {label}
        {isHighlighted && badgeLabel ? <AiFilledBadge label={badgeLabel} /> : null}
      </label>
      {children}
      {hint ? <span className="text-sm text-text-muted">{hint}</span> : null}
    </div>
  );
}

export function ResultForm({
  eventId,
  existingResult,
  messages,
  onSaved,
  prefilledValues,
  highlightedFields,
  isCapturing,
  aiBadgeLabel,
  onFieldEdited,
}: {
  eventId: string;
  existingResult: RaceResult | undefined;
  messages: ClientResultsMessages;
  onSaved?: () => void;
  // Values read from a screenshot; they win over the saved result until the athlete saves.
  prefilledValues?: ResultFormPrefill;
  // Fields that were filled by a screenshot capture and still carry the "AI" badge.
  highlightedFields?: CapturedFieldName[];
  // True while Gemini is still reading a screenshot: the four capturable fields shimmer.
  isCapturing?: boolean;
  // "Filled by AI" / "Completado con IA" — the badge's accessible label.
  aiBadgeLabel?: string;
  // Called when the athlete edits a field that was carrying the "AI" badge, so the
  // caller can drop it from `highlightedFields`.
  onFieldEdited?: (field: CapturedFieldName) => void;
}) {
  const saveResultForEvent = saveResultAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(saveResultForEvent, INITIAL_STATE);
  const fields = messages.resultForm.fields;
  const errors = state.errors;

  function isFieldHighlighted(field: CapturedFieldName): boolean {
    return highlightedFields?.includes(field) ?? false;
  }

  function captureFieldClassName(field: CapturedFieldName): string {
    if (isCapturing) return CAPTURE_READING_CLASS_NAME;
    return joinClassNames(isFieldHighlighted(field) && CAPTURE_HIGHLIGHT_CLASS_NAME, isFieldHighlighted(field) && CAPTURE_PULSE_CLASS_NAME);
  }

  // The action only returns (it never redirects, the form lives in a modal
  // on the event page): tell the caller once a submission finishes clean.
  const wasSubmitting = useRef(false);
  useEffect(() => {
    if (wasSubmitting.current && !isPending && Object.keys(state.errors).length === 0) {
      onSaved?.();
    }
    wasSubmitting.current = isPending;
  }, [isPending, state, onSaved]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {errors.form ? <FieldError message={messages.errors[errors.form]} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={fields.place} htmlFor="place">
          <Input id="place" name="place" type="number" min={1} defaultValue={existingResult?.place ?? ""} />
          {errors.place ? <FieldError message={messages.errors[errors.place]} /> : null}
        </Field>

        <CapturableField
          label={fields.time}
          htmlFor="time"
          hint={messages.resultForm.hints.time}
          isHighlighted={isFieldHighlighted("time")}
          badgeLabel={aiBadgeLabel}
        >
          <Input
            id="time"
            name="time"
            type="text"
            defaultValue={prefilledValues?.time ?? timeDefaultValue(existingResult)}
            className={captureFieldClassName("time")}
            disabled={isCapturing}
            onChange={() => onFieldEdited?.("time")}
          />
          {errors.time ? <FieldError message={messages.errors[errors.time]} /> : null}
        </CapturableField>

        <CapturableField
          label={fields.distance}
          htmlFor="distance"
          isHighlighted={isFieldHighlighted("distance")}
          badgeLabel={aiBadgeLabel}
        >
          <Input
            id="distance"
            name="distance"
            type="number"
            step="0.01"
            min={0}
            defaultValue={prefilledValues?.distance ?? existingResult?.distanceKm ?? ""}
            className={captureFieldClassName("distance")}
            disabled={isCapturing}
            onChange={() => onFieldEdited?.("distance")}
          />
          {errors.distance ? <FieldError message={messages.errors[errors.distance]} /> : null}
        </CapturableField>

        <CapturableField
          label={fields.avgHeartRate}
          htmlFor="avgHeartRate"
          isHighlighted={isFieldHighlighted("avgHeartRate")}
          badgeLabel={aiBadgeLabel}
        >
          <Input
            id="avgHeartRate"
            name="avgHeartRate"
            type="number"
            min={1}
            defaultValue={prefilledValues?.avgHeartRate ?? existingResult?.avgHeartRate ?? ""}
            className={captureFieldClassName("avgHeartRate")}
            disabled={isCapturing}
            onChange={() => onFieldEdited?.("avgHeartRate")}
          />
          {errors.avgHeartRate ? <FieldError message={messages.errors[errors.avgHeartRate]} /> : null}
        </CapturableField>

        <CapturableField
          label={fields.elevation}
          htmlFor="elevation"
          isHighlighted={isFieldHighlighted("elevation")}
          badgeLabel={aiBadgeLabel}
        >
          <Input
            id="elevation"
            name="elevation"
            type="number"
            defaultValue={prefilledValues?.elevation ?? existingResult?.elevationM ?? ""}
            className={captureFieldClassName("elevation")}
            disabled={isCapturing}
            onChange={() => onFieldEdited?.("elevation")}
          />
          {errors.elevation ? <FieldError message={messages.errors[errors.elevation]} /> : null}
        </CapturableField>

        <fieldset className="flex flex-col gap-1">
          <legend className="text-label text-text-muted">{fields.medal}</legend>
          <div className="flex flex-wrap gap-2">
            <label className={MEDAL_SWATCH_CLASS_NAME}>
              <input
                type="radio"
                name="medal"
                value=""
                defaultChecked={!existingResult?.medal}
                className="sr-only"
              />
              <span aria-hidden className="h-3 w-3 rounded-full border border-line" />
              <span className="text-label">{messages.resultForm.medalNoneOption}</span>
            </label>
            {MEDAL_OPTIONS.map((medal) => (
              <label key={medal} className={MEDAL_SWATCH_CLASS_NAME}>
                <input
                  type="radio"
                  name="medal"
                  value={medal}
                  defaultChecked={existingResult?.medal === medal}
                  className="sr-only"
                />
                <MedalBadge medal={medal} label={messages.medals[medal]} />
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <Button type="submit" disabled={isPending} className="self-start">
        {messages.resultForm.submit}
      </Button>
    </form>
  );
}
