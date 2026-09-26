"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { EventDetails } from "@/db/events";
import type { Discipline, RaceEvent } from "@/db/types";
import type { Locale } from "@/i18n/locale";
import { formatEventDate } from "@/i18n/formatters";
import { NEW_EVENT_DISCIPLINES } from "./accept-event-details";
import type { AcceptFormState } from "./actions";
import { NEW_EVENT_DESTINATION_VALUE } from "./destination";
import { FieldError } from "./field-error";

// Every field here is a plain string or record, never a function: this crosses into a
// client component, and a translated function (like the dictionary's `newEventOption`)
// can't cross that boundary — the caller resolves it to a string first.
export type AcceptFormMessages = {
  destinationFieldLabel: string;
  newEventOptionLabel: string;
  newEventHint: string;
  newEventFields: { name: string; date: string; location: string; discipline: string };
  newEventErrors: { required: string; invalidDate: string };
  disciplines: Record<Discipline, string>;
  accept: string;
  reject: string;
};

const INITIAL_STATE: AcceptFormState = { errors: {} };

// The inbox decision panel for one pending transfer or tag. Destination defaults to
// "new event", prefilled from the sender's event and editable; the server action
// re-validates those fields (accept-event-details.ts) and this form shows their errors
// without navigating away. The pending-request guard, single batch and returned
// destination id all live server-side, unchanged by this form.
export function AcceptForm({
  idFieldName,
  itemId,
  sourceEvent,
  myEvents,
  locale,
  acceptAction,
  rejectAction,
  messages,
}: {
  idFieldName: "transferId" | "tagId";
  itemId: string;
  sourceEvent: EventDetails;
  myEvents: RaceEvent[];
  locale: Locale;
  acceptAction: (state: AcceptFormState, formData: FormData) => Promise<AcceptFormState>;
  rejectAction: (formData: FormData) => Promise<void>;
  messages: AcceptFormMessages;
}) {
  const [state, formAction, isPending] = useActionState(acceptAction, INITIAL_STATE);
  const [destination, setDestination] = useState<string>(NEW_EVENT_DESTINATION_VALUE);
  const isNewEvent = destination === NEW_EVENT_DESTINATION_VALUE;
  const errors = state.errors;
  const acceptFormId = `${itemId}-accept`;

  const destinationOptions = [
    { value: NEW_EVENT_DESTINATION_VALUE, label: messages.newEventOptionLabel },
    ...myEvents.map((event) => ({
      value: event.id,
      label: `${event.name} · ${formatEventDate(event.date, locale)}`,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <form id={acceptFormId} action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name={idFieldName} value={itemId} />
        <Field label={messages.destinationFieldLabel} htmlFor={`${itemId}-destination`}>
          <Select
            id={`${itemId}-destination`}
            name="destination"
            defaultValue={NEW_EVENT_DESTINATION_VALUE}
            onValueChange={setDestination}
            options={destinationOptions}
          />
        </Field>

        {isNewEvent ? (
          <div className="panel grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
            <Field label={messages.newEventFields.name} htmlFor={`${itemId}-name`}>
              <Input id={`${itemId}-name`} name="name" type="text" defaultValue={sourceEvent.name} />
              {errors.name ? <FieldError message={messages.newEventErrors[errors.name]} /> : null}
            </Field>
            <Field label={messages.newEventFields.date} htmlFor={`${itemId}-date`}>
              <Input id={`${itemId}-date`} name="date" type="date" defaultValue={sourceEvent.date} />
              {errors.date ? <FieldError message={messages.newEventErrors[errors.date]} /> : null}
            </Field>
            <Field label={messages.newEventFields.location} htmlFor={`${itemId}-location`}>
              <Input id={`${itemId}-location`} name="location" type="text" defaultValue={sourceEvent.location} />
              {errors.location ? <FieldError message={messages.newEventErrors[errors.location]} /> : null}
            </Field>
            <Field label={messages.newEventFields.discipline} htmlFor={`${itemId}-discipline`}>
              <Select
                id={`${itemId}-discipline`}
                name="discipline"
                defaultValue={sourceEvent.discipline}
                options={NEW_EVENT_DISCIPLINES.map((discipline) => ({
                  value: discipline,
                  label: messages.disciplines[discipline],
                }))}
              />
              {errors.discipline ? <FieldError message={messages.newEventErrors[errors.discipline]} /> : null}
            </Field>
            <p className="col-span-full text-label text-text-muted">{messages.newEventHint}</p>
          </div>
        ) : null}
      </form>

      <div className="flex flex-wrap justify-end gap-2">
        <form action={rejectAction}>
          <input type="hidden" name={idFieldName} value={itemId} />
          <Button type="submit" variant="outline">
            {messages.reject}
          </Button>
        </form>
        <Button type="submit" form={acceptFormId} variant="primary" disabled={isPending}>
          {messages.accept}
        </Button>
      </div>
    </div>
  );
}
