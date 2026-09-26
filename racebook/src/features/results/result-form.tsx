"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { MedalBadge } from "@/components/ui/medal-badge";
import type { Medal, RaceResult } from "@/db/types";
import { formatDuration } from "@/i18n/formatters";
import { saveResultAction, type ResultFormState } from "./actions";
import type { ClientResultsMessages } from "./client-messages";
import { FieldError } from "./field-error";
import type { toResultFormValues } from "@/features/ai-capture/screenshot-capture";

type ResultFormPrefill = ReturnType<typeof toResultFormValues>;

const INITIAL_STATE: ResultFormState = { errors: {} };
const MEDAL_OPTIONS: Medal[] = ["bronze", "silver", "gold"];

// A swatch (real radio + label, keyboard accessible) styled with the same
// border/focus rules as the rest of the form's fields.
const MEDAL_SWATCH_CLASS_NAME =
  "flex flex-1 basis-24 cursor-pointer items-center justify-center gap-2 rounded-sm border border-line px-3 py-2 has-[:checked]:border-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent";

function timeDefaultValue(existingResult: RaceResult | undefined): string {
  if (!existingResult || existingResult.timeSeconds === null) return "";
  return formatDuration(existingResult.timeSeconds);
}

export function ResultForm({
  eventId,
  existingResult,
  messages,
  onSaved,
  prefilledValues,
}: {
  eventId: string;
  existingResult: RaceResult | undefined;
  messages: ClientResultsMessages;
  onSaved?: () => void;
  // Values read from a screenshot; they win over the saved result until the athlete saves.
  prefilledValues?: ResultFormPrefill;
}) {
  const saveResultForEvent = saveResultAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(saveResultForEvent, INITIAL_STATE);
  const fields = messages.resultForm.fields;
  const errors = state.errors;

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

        <Field label={fields.time} htmlFor="time" hint={messages.resultForm.hints.time}>
          <Input id="time" name="time" type="text" defaultValue={prefilledValues?.time ?? timeDefaultValue(existingResult)} />
          {errors.time ? <FieldError message={messages.errors[errors.time]} /> : null}
        </Field>

        <Field label={fields.distance} htmlFor="distance">
          <Input
            id="distance"
            name="distance"
            type="number"
            step="0.01"
            min={0}
            defaultValue={prefilledValues?.distance ?? existingResult?.distanceKm ?? ""}
          />
          {errors.distance ? <FieldError message={messages.errors[errors.distance]} /> : null}
        </Field>

        <Field label={fields.avgHeartRate} htmlFor="avgHeartRate">
          <Input
            id="avgHeartRate"
            name="avgHeartRate"
            type="number"
            min={1}
            defaultValue={prefilledValues?.avgHeartRate ?? existingResult?.avgHeartRate ?? ""}
          />
          {errors.avgHeartRate ? <FieldError message={messages.errors[errors.avgHeartRate]} /> : null}
        </Field>

        <Field label={fields.elevation} htmlFor="elevation">
          <Input id="elevation" name="elevation" type="number" defaultValue={prefilledValues?.elevation ?? existingResult?.elevationM ?? ""} />
          {errors.elevation ? <FieldError message={messages.errors[errors.elevation]} /> : null}
        </Field>

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
