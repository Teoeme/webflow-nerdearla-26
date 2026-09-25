import Link from "next/link";
import { MedalBadge } from "@/components/ui/medal-badge";
import type { AthleteResult } from "@/db/results";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/locale";
import { formatDuration, formatEventDate, formatPace } from "@/i18n/formatters";

// One row of the medal board: the athlete's own result for one event.
export function ResultPanel({
  result,
  locale,
  messages,
}: {
  result: AthleteResult;
  locale: Locale;
  messages: Dictionary["results"];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/events/${result.event.id}`} className="text-heading text-lg hover:opacity-80">
          {result.event.name}
        </Link>
        {result.medal ? <MedalBadge medal={result.medal} label={messages.medals[result.medal]} /> : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
        <span>{formatEventDate(result.event.date, locale)}</span>
        <span>{result.event.location}</span>
        <span>{messages.disciplines[result.event.discipline]}</span>
      </div>

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
    </div>
  );
}
