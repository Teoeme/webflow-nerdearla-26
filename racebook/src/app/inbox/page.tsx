import Link from "next/link";
import { Button } from "@/components/ui/button";
import { findEventName } from "@/db/photos";
import { listIncomingTransfers } from "@/db/transfers";
import { acceptIncomingTransfer, rejectIncomingTransfer } from "@/features/gallery/actions";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";
import { getCurrentAthlete } from "@/session/current-athlete";

const ISO_DATE_LENGTH = 10;

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

  const [incomingTransfers, acceptedEventName] = await Promise.all([
    listIncomingTransfers(currentAthlete.id),
    acceptedEventId ? findEventName(acceptedEventId) : Promise.resolve(undefined),
  ]);

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-display text-3xl">{messages.title}</h1>
      {acceptedEventId && acceptedEventName ? (
        <Link href={`/events/${acceptedEventId}`} className="text-label text-accent">
          {messages.viewInEvent(acceptedEventName)}
        </Link>
      ) : null}
      {incomingTransfers.length === 0 ? (
        <p className="text-text-muted">{messages.empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {incomingTransfers.map((transfer) => (
            <li
              key={transfer.id}
              className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <img
                src={`/api/photos/${transfer.photoId}`}
                alt={photoMessages.photoAlt(transfer.eventName)}
                loading="lazy"
                className="aspect-square w-full max-w-40 rounded-sm object-cover"
              />
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-text">
                  {messages.sentFrom(transfer.fromAthleteName, transfer.eventName)}
                </p>
                <p className="text-label text-text-muted">
                  {formatEventDate(transfer.createdAt.slice(0, ISO_DATE_LENGTH), locale)}
                </p>
                <div className="flex gap-2">
                  <form action={acceptIncomingTransfer}>
                    <input type="hidden" name="transferId" value={transfer.id} />
                    <input type="hidden" name="eventId" value={transfer.eventId} />
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
      )}
    </main>
  );
}
