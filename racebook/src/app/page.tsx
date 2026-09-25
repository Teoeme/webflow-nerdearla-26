import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { listEventEntries, type EventEntry } from "@/db/results";
import type { Medal } from "@/db/types";
import { EventCard } from "@/features/results/event-card";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";

function countMedals(entries: EventEntry[], medal: Medal): number {
  return entries.filter((entry) => entry.result?.medal === medal).length;
}

function countLoggedRaces(entries: EventEntry[]): number {
  return entries.filter((entry) => entry.result !== null).length;
}

export default async function MedalBoardPage() {
  const [athlete, locale, dictionary] = await Promise.all([
    getCurrentAthlete(),
    getCurrentLocale(),
    getDictionary(),
  ]);
  const messages = dictionary.results;

  const entries = await listEventEntries(athlete.id);

  const goldCount = countMedals(entries, "gold");
  const silverCount = countMedals(entries, "silver");
  const bronzeCount = countMedals(entries, "bronze");
  const totalMedals = goldCount + silverCount + bronzeCount;
  const racesLogged = countLoggedRaces(entries);

  return (
    <main className="flex flex-col gap-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">{dictionary.common.nav.medalBoard}</h1>
          <p className="text-text-muted">{dictionary.common.greeting(athlete.name)}</p>
        </div>
        <ButtonLink href="/events/new">{messages.medalBoard.logRace}</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-6">
        <Stat label={messages.medalBoard.stats.racesLogged} value={String(racesLogged)} />
        <Stat label={messages.medalBoard.stats.medals} value={String(totalMedals)} emphasis />
        <Stat label={messages.medalBoard.stats.gold} value={String(goldCount)} />
        <Stat label={messages.medalBoard.stats.silver} value={String(silverCount)} />
        <Stat label={messages.medalBoard.stats.bronze} value={String(bronzeCount)} />
      </div>

      {entries.length === 0 ? (
        <div className="panel flex flex-col items-start gap-3 p-6">
          <p>{messages.medalBoard.emptyState.message}</p>
          <ButtonLink href="/events/new" variant="outline">
            {messages.medalBoard.emptyState.cta}
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {entries.map((entry) => (
            <li key={entry.event.id} className="panel p-6">
              <EventCard entry={entry} locale={locale} messages={messages} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
