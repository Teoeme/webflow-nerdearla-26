import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MedalBadge } from "@/components/ui/medal-badge";
import type { EventEntry } from "@/db/results";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/locale";
import { formatDuration, formatEventDate, formatPace } from "@/i18n/formatters";

// One card of the medal board: an event the athlete owns, with their own
// result attached when they logged one, or a call to log it otherwise.
export function EventCard({
  entry,
  locale,
  messages,
}: {
  entry: EventEntry;
  locale: Locale;
  messages: Dictionary["results"];
}) {
  const { event, result } = entry;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/events/${event.id}`} className="text-heading text-lg hover:opacity-80">
          {event.name}
        </Link>
        {result?.medal ? <MedalBadge medal={result.medal} label={messages.medals[result.medal]} /> : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
        <span>{formatEventDate(event.date, locale)}</span>
        <span>{event.location}</span>
        <span>{messages.disciplines[event.discipline]}</span>
      </div>

      {result ? (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-metric text-sm">
          {result.place !== null ? (
            <span>
              {messages.eventDetail.stats.place}: {result.place}
            </span>
          ) : null}
          {result.timeSeconds !== null ? (
            <span>
              {messages.eventDetail.stats.time}: {formatDuration(result.timeSeconds)}
            </span>
          ) : null}
          {result.paceSecondsPerKm !== null ? (
            <span>
              {messages.eventDetail.stats.pace}: {formatPace(result.paceSecondsPerKm)}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-text-muted">{messages.medalBoard.card.noResultYet}</span>
          <ButtonLink href={`/events/${event.id}/result`} variant="outline">
            {messages.medalBoard.card.logResultCta}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
