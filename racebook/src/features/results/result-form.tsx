"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { Medal, RaceResult } from "@/db/types";
import type { Dictionary } from "@/i18n/dictionary";
import { formatDuration } from "@/i18n/formatters";
import { saveResultAction, type ResultFormState } from "./actions";
import { FieldError } from "./field-error";

const INITIAL_STATE: ResultFormState = { errors: {} };
const MEDAL_OPTIONS: Medal[] = ["gold", "silver", "bronze"];

function timeDefaultValue(existingResult: RaceResult | undefined): string {
  if (!existingResult || existingResult.timeSeconds === null) return "";
  return formatDuration(existingResult.timeSeconds);
}

export function ResultForm({
  eventId,
  existingResult,
  messages,
}: {
  eventId: string;
  existingResult: RaceResult | undefined;
  messages: Dictionary["results"];
}) {
  const saveResultForEvent = saveResultAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(saveResultForEvent, INITIAL_STATE);
  const fields = messages.resultForm.fields;
  const errors = state.errors;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {errors.form ? <FieldError message={messages.errors[errors.form]} /> : null}

      <Field label={fields.place} htmlFor="place">
        <Input id="place" name="place" type="number" min={1} defaultValue={existingResult?.place ?? ""} />
        {errors.place ? <FieldError message={messages.errors[errors.place]} /> : null}
      </Field>

      <Field label={fields.time} htmlFor="time" hint={messages.resultForm.hints.time}>
        <Input id="time" name="time" type="text" defaultValue={timeDefaultValue(existingResult)} />
        {errors.time ? <FieldError message={messages.errors[errors.time]} /> : null}
      </Field>

      <Field label={fields.medal} htmlFor="medal">
        <Select id="medal" name="medal" defaultValue={existingResult?.medal ?? ""}>
          <option value="">{messages.resultForm.medalNoneOption}</option>
          {MEDAL_OPTIONS.map((medal) => (
            <option key={medal} value={medal}>
              {messages.medals[medal]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={fields.distance} htmlFor="distance">
        <Input
          id="distance"
          name="distance"
          type="number"
          step="0.01"
          min={0}
          defaultValue={existingResult?.distanceKm ?? ""}
        />
        {errors.distance ? <FieldError message={messages.errors[errors.distance]} /> : null}
      </Field>

      <Field label={fields.avgHeartRate} htmlFor="avgHeartRate">
        <Input
          id="avgHeartRate"
          name="avgHeartRate"
          type="number"
          min={1}
          defaultValue={existingResult?.avgHeartRate ?? ""}
        />
        {errors.avgHeartRate ? <FieldError message={messages.errors[errors.avgHeartRate]} /> : null}
      </Field>

      <Field label={fields.elevation} htmlFor="elevation">
        <Input id="elevation" name="elevation" type="number" defaultValue={existingResult?.elevationM ?? ""} />
        {errors.elevation ? <FieldError message={messages.errors[errors.elevation]} /> : null}
      </Field>

      <Button type="submit" disabled={isPending} className="self-start">
        {messages.resultForm.submit}
      </Button>
    </form>
  );
}
