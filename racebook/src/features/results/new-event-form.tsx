"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { Discipline } from "@/db/types";
import { createEventAction, type NewEventFormState } from "./actions";
import type { ClientResultsMessages } from "./client-messages";
import { FieldError } from "./field-error";

const INITIAL_STATE: NewEventFormState = { errors: {} };
const DISCIPLINE_OPTIONS: Discipline[] = [
  "road_running",
  "trail_running",
  "triathlon",
  "cycling",
  "swimming",
];

export function NewEventForm({ messages }: { messages: ClientResultsMessages }) {
  const [state, formAction, isPending] = useActionState(createEventAction, INITIAL_STATE);
  const fields = messages.newEventForm.fields;
  const errors = state.errors;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label={fields.name} htmlFor="name">
        <Input id="name" name="name" type="text" />
        {errors.name ? <FieldError message={messages.errors[errors.name]} /> : null}
      </Field>

      <Field label={fields.date} htmlFor="date">
        <Input id="date" name="date" type="date" />
        {errors.date ? <FieldError message={messages.errors[errors.date]} /> : null}
      </Field>

      <Field label={fields.location} htmlFor="location">
        <Input id="location" name="location" type="text" />
        {errors.location ? <FieldError message={messages.errors[errors.location]} /> : null}
      </Field>

      <Field label={fields.discipline} htmlFor="discipline">
        <Select id="discipline" name="discipline" defaultValue="">
          <option value="" disabled>
            {fields.discipline}
          </option>
          {DISCIPLINE_OPTIONS.map((discipline) => (
            <option key={discipline} value={discipline}>
              {messages.disciplines[discipline]}
            </option>
          ))}
        </Select>
        {errors.discipline ? <FieldError message={messages.errors[errors.discipline]} /> : null}
      </Field>

      <Button type="submit" disabled={isPending} className="self-start">
        {messages.newEventForm.submit}
      </Button>
    </form>
  );
}
