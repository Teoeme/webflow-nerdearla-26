import { NewEventForm } from "@/features/results/new-event-form";
import { toClientResultsMessages } from "@/features/results/client-messages";
import { getDictionary } from "@/i18n/dictionary";

export default async function NewEventPage() {
  const dictionary = await getDictionary();
  const messages = dictionary.results;

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-display text-3xl">{messages.newEventForm.title}</h1>
      <NewEventForm messages={toClientResultsMessages(messages)} />
    </main>
  );
}
