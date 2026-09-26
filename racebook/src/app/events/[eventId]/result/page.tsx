import { notFound } from "next/navigation";
import { findOwnedEvent } from "@/db/events";
import { findResult } from "@/db/results";
import { ResultForm } from "@/features/results/result-form";
import { toClientResultsMessages } from "@/features/results/client-messages";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";

export default async function ResultFormPage({
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
  const existingResult = await findResult(athlete.id, event.id);

  return (
    <main className="flex justify-center p-6">
      <div className="panel flex w-full max-w-2xl flex-col gap-6 p-8">
        <div>
          <h1 className="text-display text-2xl">{messages.resultForm.title}</h1>
          <p className="text-sm text-text-muted">
            {event.name} · {formatEventDate(event.date, locale)} · {event.location}
          </p>
        </div>
        <ResultForm
          eventId={event.id}
          existingResult={existingResult}
          messages={toClientResultsMessages(messages)}
        />
      </div>
    </main>
  );
}
