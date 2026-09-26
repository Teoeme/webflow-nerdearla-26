import { notFound } from "next/navigation";
import { Stat } from "@/components/ui/stat";
import { findOwnedEvent } from "@/db/events";
import { listEventPhotos } from "@/db/photos";
import { findResult } from "@/db/results";
import { EventGallery } from "@/features/gallery/event-gallery";
import { ResultModal } from "@/features/results/result-modal";
import { buildResultStats } from "@/features/results/result-stats";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ logResult?: string }>;
}) {
  const { eventId } = await params;
  const { logResult } = await searchParams;
  const athlete = await getCurrentAthlete();
  const event = await findOwnedEvent(eventId, athlete.id);
  if (!event) notFound();

  const [locale, dictionary] = await Promise.all([getCurrentLocale(), getDictionary()]);
  const messages = dictionary.results;

  const myResult = await findResult(athlete.id, event.id);
  const myResultStats = buildResultStats(myResult, messages, locale);
  const eventSummary = `${event.name} · ${formatEventDate(event.date, locale)} · ${event.location}`;

  // Same fallback as the medal-board card: the event's own cover, or, absent
  // that, its most recent photo (already newest-first).
  const eventPhotos = await listEventPhotos(athlete.id, event.id);
  const coverPhotoId = event.coverPhotoId ?? eventPhotos[0]?.id ?? null;

  return (
    <main className="motion-safe:page-enter flex flex-col gap-8 p-6">
      <div className="panel relative isolate overflow-hidden">
        {coverPhotoId ? (
          <div className="absolute inset-0">
            <img src={`/api/photos/${coverPhotoId}`} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/70 to-transparent" />
          </div>
        ) : null}
        <div className="relative flex min-h-40 flex-col justify-end gap-1 p-6">
          <h1 className="text-display text-3xl">{event.name}</h1>
          <p className="text-text-muted">
            {formatEventDate(event.date, locale)} · {event.location} ·{" "}
            {messages.disciplines[event.discipline]}
          </p>
        </div>
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
        <ResultModal
          eventId={event.id}
          existingResult={myResult}
          messages={messages}
          closeLabel={dictionary.common.modal.closeLabel}
          eventSummary={eventSummary}
          initiallyOpen={logResult === "1"}
          captureLabels={dictionary.aiCapture.screenshotCapture}
        />
      </section>

      <EventGallery eventId={event.id} />
    </main>
  );
}
