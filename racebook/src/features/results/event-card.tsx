import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MedalBadge } from "@/components/ui/medal-badge";
import type { EventPhoto } from "@/db/photos";
import type { EventEntry } from "@/db/results";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/locale";
import { formatDuration, formatEventDate } from "@/i18n/formatters";

const MAX_CARD_PHOTO_PREVIEWS = 3;

// One card of the medal board grid: an event the athlete owns, with their own
// result attached when they logged one, or a call to log it otherwise, plus a
// peek at the event's photos when there are any.
export function EventCard({
  entry,
  photos,
  locale,
  messages,
}: {
  entry: EventEntry;
  photos: EventPhoto[];
  locale: Locale;
  messages: Dictionary["results"];
}) {
  const { event, result } = entry;
  const hiddenPhotoCount = photos.length - MAX_CARD_PHOTO_PREVIEWS;

  return (
    <article className="panel flex h-full flex-col gap-3 p-5">
      {/* The whole card links to the event: an invisible anchor fills it, and
          the visible CTA link below sits above it (z-10) so both stay
          independently clickable. */}
      <Link
        href={`/events/${event.id}`}
        aria-label={event.name}
        className="absolute inset-0 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="text-heading text-lg">{event.name}</span>
        {result?.medal ? <MedalBadge medal={result.medal} label={messages.medals[result.medal]} /> : null}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
        <span>{formatEventDate(event.date, locale)}</span>
        <span>{event.location}</span>
        <span>{messages.disciplines[event.discipline]}</span>
      </div>

      {result ? (
        <div className="flex flex-wrap items-baseline gap-4">
          {result.place !== null ? (
            <span>
              <span className="text-sm text-text-muted">{messages.eventDetail.stats.place} </span>
              <span className="text-display text-lg text-accent">{result.place}</span>
            </span>
          ) : null}
          {result.timeSeconds !== null ? (
            <span className="text-metric text-sm">{formatDuration(result.timeSeconds)}</span>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-text-muted">{messages.medalBoard.card.noResultYet}</span>
          <ButtonLink href={`/events/${event.id}/result`} variant="outline" className="relative z-10">
            {messages.medalBoard.card.logResultCta}
          </ButtonLink>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="flex gap-1.5">
          {photos.slice(0, MAX_CARD_PHOTO_PREVIEWS).map((photo) => (
            <img
              key={photo.id}
              src={`/api/photos/${photo.id}`}
              alt=""
              loading="lazy"
              className="h-11 w-11 rounded-sm border border-line object-cover"
            />
          ))}
          {hiddenPhotoCount > 0 ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-line bg-field text-label text-text-muted">
              +{hiddenPhotoCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
