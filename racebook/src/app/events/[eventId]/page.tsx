import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { MedalBadge } from "@/components/ui/medal-badge";
import { Stat } from "@/components/ui/stat";
import { findEvent } from "@/db/events";
import { findResult, listResultsForEvent } from "@/db/results";
import { EventGallery } from "@/features/gallery/event-gallery";
import { buildResultStats } from "@/features/results/result-stats";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatDuration, formatEventDate, formatPace } from "@/i18n/formatters";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await findEvent(eventId);
  if (!event) notFound();

  const [athlete, locale, dictionary] = await Promise.all([
    getCurrentAthlete(),
    getCurrentLocale(),
    getDictionary(),
  ]);
  const messages = dictionary.results;

  const [myResult, allResults] = await Promise.all([
    findResult(athlete.id, event.id),
    listResultsForEvent(event.id),
  ]);

  const myResultStats = buildResultStats(myResult, messages, locale);

  return (
    <main className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-display text-3xl">{event.name}</h1>
        <p className="text-text-muted">
          {formatEventDate(event.date, locale)} · {event.location} ·{" "}
          {messages.disciplines[event.discipline]}
        </p>
      </div>

      <section className="panel flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-heading text-xl">{messages.eventDetail.myResult.title}</h2>
          <ButtonLink href={`/events/${event.id}/result`}>
            {myResult ? messages.eventDetail.myResult.editCta : messages.eventDetail.myResult.logCta}
          </ButtonLink>
        </div>
        {myResultStats.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {myResultStats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-xl">{messages.eventDetail.resultsTable.title}</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-label text-text-muted">
              <th className="py-2 pr-4">{messages.eventDetail.resultsTable.place}</th>
              <th className="py-2 pr-4">{messages.eventDetail.resultsTable.athlete}</th>
              <th className="py-2 pr-4">{messages.eventDetail.resultsTable.time}</th>
              <th className="py-2 pr-4">{messages.eventDetail.resultsTable.pace}</th>
              <th className="py-2">{messages.eventDetail.resultsTable.medal}</th>
            </tr>
          </thead>
          <tbody>
            {allResults.map((result) => (
              <tr key={result.id} className="border-t border-line">
                <td className="py-2 pr-4 text-metric">
                  {result.place ?? messages.eventDetail.resultsTable.noResult}
                </td>
                <td className="py-2 pr-4">{result.athleteName}</td>
                <td className="py-2 pr-4 text-metric">
                  {result.timeSeconds !== null
                    ? formatDuration(result.timeSeconds)
                    : messages.eventDetail.resultsTable.noResult}
                </td>
                <td className="py-2 pr-4 text-metric">
                  {result.paceSecondsPerKm !== null
                    ? formatPace(result.paceSecondsPerKm)
                    : messages.eventDetail.resultsTable.noResult}
                </td>
                <td className="py-2">
                  {result.medal ? <MedalBadge medal={result.medal} label={messages.medals[result.medal]} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <EventGallery eventId={event.id} />
    </main>
  );
}
