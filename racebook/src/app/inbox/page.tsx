import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import type { EventDetails } from "@/db/events";
import { listEventsOwnedBy } from "@/db/events";
import { listIncomingTags } from "@/db/photo-tags";
import { listIncomingTransfers } from "@/db/transfers";
import type { Locale } from "@/i18n/locale";
import type { RaceEvent } from "@/db/types";
import {
  acceptIncomingTag,
  acceptIncomingTransfer,
  rejectIncomingTag,
  rejectIncomingTransfer,
} from "@/features/gallery/actions";
import { NEW_EVENT_DESTINATION_VALUE } from "@/features/gallery/destination";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import type { Dictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";
import { getCurrentAthlete } from "@/session/current-athlete";

const ISO_DATE_LENGTH = 10;

type InboxMessages = Dictionary["gallery"]["inbox"];

// The destination <select> defaults to "new event": guessing a matching existing event
// by name/date/location picked the wrong one whenever the recipient had a duplicate, so
// the recipient always chooses explicitly instead. The accept action derives the new
// event's details from the transfer/tag row itself — the client never sends them.
function DestinationFields({
  idPrefix,
  sourceEvent,
  myEvents,
  locale,
  messages,
}: {
  idPrefix: string;
  sourceEvent: EventDetails;
  myEvents: RaceEvent[];
  locale: Locale;
  messages: InboxMessages;
}) {
  return (
    <Field label={messages.destinationFieldLabel} htmlFor={`${idPrefix}-destination`}>
      <Select id={`${idPrefix}-destination`} name="destination" defaultValue={NEW_EVENT_DESTINATION_VALUE}>
        <option value={NEW_EVENT_DESTINATION_VALUE}>{messages.newEventOption(sourceEvent.name)}</option>
        {myEvents.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name} · {formatEventDate(event.date, locale)}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ acceptedEventId?: string }>;
}) {
  const { acceptedEventId } = await searchParams;

  const [currentAthlete, dictionary, locale] = await Promise.all([
    getCurrentAthlete(),
    getDictionary(),
    getCurrentLocale(),
  ]);
  const messages = dictionary.gallery.inbox;
  const photoMessages = dictionary.gallery.eventGallery;

  const [incomingTransfers, incomingTags, myEvents] = await Promise.all([
    listIncomingTransfers(currentAthlete.id),
    listIncomingTags(currentAthlete.id),
    listEventsOwnedBy(currentAthlete.id),
  ]);

  const acceptedEventName = acceptedEventId
    ? myEvents.find((event) => event.id === acceptedEventId)?.name
    : undefined;
  const isEmpty = incomingTransfers.length === 0 && incomingTags.length === 0;

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-display text-3xl">{messages.title}</h1>
      {acceptedEventId && acceptedEventName ? (
        <Link href={`/events/${acceptedEventId}`} className="text-label text-accent">
          {messages.viewInEvent(acceptedEventName)}
        </Link>
      ) : null}

      {isEmpty ? (
        <p className="text-text-muted">{messages.empty}</p>
      ) : (
        <>
          {incomingTransfers.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-heading text-xl">{messages.transfersHeading}</h2>
              <ul className="flex flex-col gap-4">
                {incomingTransfers.map((transfer) => (
                  <li
                    key={transfer.id}
                    className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <img
                      src={`/api/photos/${transfer.photoId}`}
                      alt={photoMessages.photoAlt(transfer.sourceEvent.name)}
                      loading="lazy"
                      className="aspect-square w-full max-w-40 rounded-sm object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <p className="text-text">
                        {messages.sentFrom(transfer.fromAthleteName, transfer.sourceEvent.name)}
                      </p>
                      <p className="text-label text-text-muted">
                        {formatEventDate(transfer.createdAt.slice(0, ISO_DATE_LENGTH), locale)}
                      </p>
                      <div className="flex flex-wrap items-end gap-2">
                        <form action={acceptIncomingTransfer} className="flex flex-col gap-2">
                          <input type="hidden" name="transferId" value={transfer.id} />
                          <DestinationFields
                            idPrefix={`transfer-${transfer.id}`}
                            sourceEvent={transfer.sourceEvent}
                            myEvents={myEvents}
                            locale={locale}
                            messages={messages}
                          />
                          <Button type="submit" variant="primary">
                            {messages.accept}
                          </Button>
                        </form>
                        <form action={rejectIncomingTransfer}>
                          <input type="hidden" name="transferId" value={transfer.id} />
                          <Button type="submit" variant="outline">
                            {messages.reject}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {incomingTags.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-heading text-xl">{messages.tagsHeading}</h2>
              <ul className="flex flex-col gap-4">
                {incomingTags.map((tag) => (
                  <li key={tag.id} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <img
                      src={`/api/photos/${tag.photoId}`}
                      alt={photoMessages.photoAlt(tag.sourceEvent.name)}
                      loading="lazy"
                      className="aspect-square w-full max-w-40 rounded-sm object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <p className="text-text">{messages.taggedFrom(tag.taggedByName, tag.sourceEvent.name)}</p>
                      <p className="text-label text-text-muted">
                        {formatEventDate(tag.createdAt.slice(0, ISO_DATE_LENGTH), locale)}
                      </p>
                      <div className="flex flex-wrap items-end gap-2">
                        <form action={acceptIncomingTag} className="flex flex-col gap-2">
                          <input type="hidden" name="tagId" value={tag.id} />
                          <DestinationFields
                            idPrefix={`tag-${tag.id}`}
                            sourceEvent={tag.sourceEvent}
                            myEvents={myEvents}
                            locale={locale}
                            messages={messages}
                          />
                          <Button type="submit" variant="primary">
                            {messages.accept}
                          </Button>
                        </form>
                        <form action={rejectIncomingTag}>
                          <input type="hidden" name="tagId" value={tag.id} />
                          <Button type="submit" variant="outline">
                            {messages.reject}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
