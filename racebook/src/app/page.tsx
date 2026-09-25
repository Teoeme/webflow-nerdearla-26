import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { listEvents } from "@/db/events";
import { listResultsForAthlete, type AthleteResult } from "@/db/results";
import type { Medal } from "@/db/types";
import { ResultPanel } from "@/features/results/result-panel";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";
import { formatEventDate } from "@/i18n/formatters";

function countMedals(results: AthleteResult[], medal: Medal): number {
  return results.filter((result) => result.medal === medal).length;
}

export default async function MedalBoardPage() {
  const [athlete, locale, dictionary] = await Promise.all([
    getCurrentAthlete(),
    getCurrentLocale(),
    getDictionary(),
  ]);
  const messages = dictionary.results;

  const [results, events] = await Promise.all([listResultsForAthlete(athlete.id), listEvents()]);

  const goldCount = countMedals(results, "gold");
  const silverCount = countMedals(results, "silver");
  const bronzeCount = countMedals(results, "bronze");
  const totalMedals = goldCount + silverCount + bronzeCount;

  const loggedEventIds = new Set(results.map((result) => result.eventId));
  const otherEvents = events.filter((event) => !loggedEventIds.has(event.id));

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
        <Stat label={messages.medalBoard.stats.racesLogged} value={String(results.length)} />
        <Stat label={messages.medalBoard.stats.medals} value={String(totalMedals)} emphasis />
        <Stat label={messages.medalBoard.stats.gold} value={String(goldCount)} />
        <Stat label={messages.medalBoard.stats.silver} value={String(silverCount)} />
        <Stat label={messages.medalBoard.stats.bronze} value={String(bronzeCount)} />
      </div>

      {results.length === 0 ? (
        <div className="panel flex flex-col items-start gap-3 p-6">
          <p>{messages.medalBoard.emptyState.message}</p>
          <ButtonLink href="/events/new" variant="outline">
            {messages.medalBoard.emptyState.cta}
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((result) => (
            <li key={result.id} className="panel p-6">
              <ResultPanel result={result} locale={locale} messages={messages} />
            </li>
          ))}
        </ul>
      )}

      {otherEvents.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading text-xl">{messages.medalBoard.otherEvents.title}</h2>
          <ul className="flex flex-col gap-2">
            {otherEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-baseline gap-3">
                <Link href={`/events/${event.id}`} className="text-accent hover:opacity-80">
                  {event.name}
                </Link>
                <span className="text-sm text-text-muted">{formatEventDate(event.date, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
