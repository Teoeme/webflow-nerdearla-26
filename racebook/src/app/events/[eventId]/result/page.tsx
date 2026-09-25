import { notFound } from "next/navigation";
import { findEvent } from "@/db/events";
import { findResult } from "@/db/results";
import { ResultForm } from "@/features/results/result-form";
import { toClientResultsMessages } from "@/features/results/client-messages";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getDictionary } from "@/i18n/dictionary";

export default async function ResultFormPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await findEvent(eventId);
  if (!event) notFound();

  const [athlete, dictionary] = await Promise.all([getCurrentAthlete(), getDictionary()]);
  const messages = dictionary.results;
  const existingResult = await findResult(athlete.id, event.id);

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-display text-3xl">{messages.resultForm.title(event.name)}</h1>
      <ResultForm
        eventId={event.id}
        existingResult={existingResult}
        messages={toClientResultsMessages(messages)}
      />
    </main>
  );
}
