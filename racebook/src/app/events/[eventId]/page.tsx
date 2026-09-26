import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { findOwnedEvent } from "@/db/events";
import { findResult } from "@/db/results";
import { EventGallery } from "@/features/gallery/event-gallery";
import { buildResultStats } from "@/features/results/result-stats";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const athlete = await getCurrentAthlete();
  const event = await findOwnedEvent(eventId, athlete.id);
  if (!event) notFound();

  const [locale, dictionary] = await Promise.all([getCurrentLocale(), getDictionary()]);
  const messages = dictionary.results;

  const myResult = await findResult(athlete.id, event.id);
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

      <section className="panel flex flex-wrap items-center gap-6 p-5">
        <h2 className="sr-only">{messages.eventDetail.myResult.title}</h2>
        {myResultStats.length > 0 ? (
          <div className="flex flex-1 flex-wrap items-center divide-x divide-line">
            {myResultStats.map((stat) => (
              <div key={stat.label} className="px-6 first:pl-0 last:pr-0">
                <Stat label={stat.label} value={stat.value} />
              </div>
            ))}
          </div>
        ) : (
          <p className="flex-1 text-text-muted">{messages.medalBoard.card.noResultYet}</p>
        )}
        <ButtonLink href={`/events/${event.id}/result`} variant="outline">
          {myResult ? messages.eventDetail.myResult.editCta : messages.eventDetail.myResult.logCta}
        </ButtonLink>
      </section>

      <EventGallery eventId={event.id} />
    </main>
  );
}
