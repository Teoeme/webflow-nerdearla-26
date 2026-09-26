import { NewEventForm } from "@/features/results/new-event-form";
import { toClientResultsMessages } from "@/features/results/client-messages";
import { getDictionary } from "@/i18n/dictionary";

export default async function NewEventPage() {
  const dictionary = await getDictionary();
  const messages = dictionary.results;

  return (
    <main className="flex justify-center p-6">
      <div className="panel flex w-full max-w-2xl flex-col gap-6 p-8">
        <h1 className="text-display text-2xl">{messages.newEventForm.title}</h1>
        <NewEventForm messages={toClientResultsMessages(messages)} />
      </div>
    </main>
  );
}
