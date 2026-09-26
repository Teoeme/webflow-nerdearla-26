import Link from "next/link";
import { joinClassNames } from "@/components/ui/class-names";
import type { EventDetails } from "@/db/events";
import { listEventsOwnedBy } from "@/db/events";
import { listIncomingTags, type IncomingTag } from "@/db/photo-tags";
import { listIncomingTransfers, type IncomingTransfer } from "@/db/transfers";
import type { Locale } from "@/i18n/locale";
import type { RaceEvent } from "@/db/types";
import { AcceptForm, type AcceptFormMessages } from "@/features/gallery/accept-form";
import {
  acceptIncomingTag,
  acceptIncomingTransfer,
  rejectIncomingTag,
  rejectIncomingTransfer,
} from "@/features/gallery/actions";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import type { Dictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";
import { getCurrentAthlete } from "@/session/current-athlete";

type InboxMessages = Dictionary["gallery"]["inbox"];

type InboxItemKind = "transfer" | "tag";

// A transfer and a tag are two different pending requests that both resolve to "a photo
// I can add to one of my events": the inbox lists them side by side under one shape, so
// the split view doesn't need to know which kind it's rendering except where the two
// truly differ (the id field name each accept/reject action expects).
type InboxItem = {
  key: string; // `${kind}:${id}`, also the "item" search param value
  kind: InboxItemKind;
  id: string;
  photoId: string;
  fromName: string;
  sourceEvent: EventDetails;
};

function toTransferItem(transfer: IncomingTransfer): InboxItem {
  return {
    key: `transfer:${transfer.id}`,
    kind: "transfer",
    id: transfer.id,
    photoId: transfer.photoId,
    fromName: transfer.fromAthleteName,
    sourceEvent: transfer.sourceEvent,
  };
}

function toTagItem(tag: IncomingTag): InboxItem {
  return {
    key: `tag:${tag.id}`,
    kind: "tag",
    id: tag.id,
    photoId: tag.photoId,
    fromName: tag.taggedByName,
    sourceEvent: tag.sourceEvent,
  };
}

// The first item by default; if the selected key no longer exists (accepted, rejected,
// or never valid) fall back to the first one too, instead of showing an empty panel.
function selectedItem(items: InboxItem[], selectedKey: string | undefined): InboxItem | undefined {
  const bySelectedKey = items.find((item) => item.key === selectedKey);
  return bySelectedKey ?? items[0];
}

function itemKindLabel(kind: InboxItemKind, messages: InboxMessages): string {
  return kind === "transfer" ? messages.itemKindTransfer : messages.itemKindTag;
}

function itemHeading(item: InboxItem, messages: InboxMessages): string {
  return item.kind === "transfer"
    ? messages.sentFrom(item.fromName, item.sourceEvent.name)
    : messages.taggedFrom(item.fromName, item.sourceEvent.name);
}

function DecisionPanel({
  item,
  myEvents,
  locale,
  messages,
  photoAlt,
}: {
  item: InboxItem;
  myEvents: RaceEvent[];
  locale: Locale;
  messages: InboxMessages;
  photoAlt: string;
}) {
  const idFieldName = item.kind === "transfer" ? "transferId" : "tagId";
  const acceptAction = item.kind === "transfer" ? acceptIncomingTransfer : acceptIncomingTag;
  const rejectAction = item.kind === "transfer" ? rejectIncomingTransfer : rejectIncomingTag;

  // Only plain strings and records cross into AcceptForm (a client component): the
  // dictionary's `newEventOption` is a function, resolved to a string here first.
  const acceptFormMessages: AcceptFormMessages = {
    destinationFieldLabel: messages.destinationFieldLabel,
    newEventOptionLabel: messages.newEventOption(item.sourceEvent.name),
    newEventHint: messages.newEventHint,
    newEventFields: messages.newEventFields,
    newEventErrors: messages.newEventErrors,
    disciplines: messages.disciplines,
    accept: messages.accept,
    reject: messages.reject,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex gap-4">
        <img
          src={`/api/photos/${item.photoId}`}
          alt={photoAlt}
          loading="lazy"
          className="h-40 w-40 flex-none rounded-sm object-cover"
        />
        <div className="flex flex-col gap-2">
          <p className="text-heading text-lg">{itemHeading(item, messages)}</p>
          <p className="text-label text-text-muted">
            {formatEventDate(item.sourceEvent.date, locale)} · {item.sourceEvent.location}
          </p>
          <span className="w-fit rounded-sm border border-line px-2 text-label text-text-muted">
            {itemKindLabel(item.kind, messages)}
          </span>
        </div>
      </div>

      <hr className="border-line" />

      <AcceptForm
        idFieldName={idFieldName}
        itemId={item.id}
        sourceEvent={item.sourceEvent}
        myEvents={myEvents}
        locale={locale}
        acceptAction={acceptAction}
        rejectAction={rejectAction}
        messages={acceptFormMessages}
      />
    </div>
  );
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ acceptedEventId?: string; item?: string }>;
}) {
  const { acceptedEventId, item: selectedKeyParam } = await searchParams;

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

  const items = [...incomingTransfers.map(toTransferItem), ...incomingTags.map(toTagItem)];
  const current = selectedItem(items, selectedKeyParam);

  const acceptedEventName = acceptedEventId
    ? myEvents.find((event) => event.id === acceptedEventId)?.name
    : undefined;
  const isEmpty = items.length === 0;

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
        <div className="panel flex flex-col overflow-hidden sm:flex-row">
          <ul className="flex flex-col sm:w-[22rem] sm:flex-none sm:overflow-y-auto sm:border-r sm:border-line">
            {items.map((item) => {
              const isSelected = item.key === current?.key;
              return (
                <li key={item.key} className="border-b border-line">
                  <Link
                    href={`/inbox?item=${item.key}`}
                    className={joinClassNames(
                      "flex items-center gap-3 border-l-2 p-3 transition-colors",
                      isSelected
                        ? "border-l-accent bg-accent/5"
                        : "border-l-transparent hover:bg-white/[0.03] active:bg-white/[0.06]",
                    )}
                  >
                    <img
                      src={`/api/photos/${item.photoId}`}
                      alt={photoMessages.photoAlt(item.sourceEvent.name)}
                      loading="lazy"
                      className="h-10 w-10 flex-none rounded-sm object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-text">{item.fromName}</span>
                      <span className="truncate text-label text-text-muted">
                        {item.sourceEvent.name} · {formatEventDate(item.sourceEvent.date, locale)}
                      </span>
                    </div>
                    <span className="flex-none text-label text-text-muted">
                      {itemKindLabel(item.kind, messages)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {current ? (
            <DecisionPanel
              item={current}
              myEvents={myEvents}
              locale={locale}
              messages={messages}
              photoAlt={photoMessages.photoAlt(current.sourceEvent.name)}
            />
          ) : null}
        </div>
      )}
    </main>
  );
}
