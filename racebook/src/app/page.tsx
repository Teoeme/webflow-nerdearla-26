import { Button } from "@/components/ui/button";
import { listEventPhotos, type EventPhoto } from "@/db/photos";
import { listEventEntries, type EventEntry } from "@/db/results";
import type { Medal } from "@/db/types";
import { AnimatedStat } from "@/features/results/animated-stat";
import { EventCard } from "@/features/results/event-card";
import { LogRaceModal } from "@/features/results/log-race-modal";
import { getCurrentAthlete } from "@/session/current-athlete";
import { getCurrentLocale } from "@/i18n/current-locale";
import { getDictionary } from "@/i18n/dictionary";

function countMedals(entries: EventEntry[], medal: Medal): number {
  return entries.filter((entry) => entry.result?.medal === medal).length;
}

function countLoggedRaces(entries: EventEntry[]): number {
  return entries.filter((entry) => entry.result !== null).length;
}

// One entry per event, in the same order as `entries`, so the board can look
// up an event's photos without a separate id-keyed structure.
async function listPhotosByEvent(athleteId: string, entries: EventEntry[]): Promise<EventPhoto[][]> {
  return Promise.all(entries.map((entry) => listEventPhotos(athleteId, entry.event.id)));
}

export default async function MedalBoardPage() {
  const [athlete, locale, dictionary] = await Promise.all([
    getCurrentAthlete(),
    getCurrentLocale(),
    getDictionary(),
  ]);
  const messages = dictionary.results;

  const entries = await listEventEntries(athlete.id);
  const photosByEvent = await listPhotosByEvent(athlete.id, entries);

  const goldCount = countMedals(entries, "gold");
  const silverCount = countMedals(entries, "silver");
  const bronzeCount = countMedals(entries, "bronze");
  const totalMedals = goldCount + silverCount + bronzeCount;
  const racesLogged = countLoggedRaces(entries);

  const summaryStats = [
    { label: messages.medalBoard.stats.racesLogged, value: racesLogged },
    { label: messages.medalBoard.stats.medals, value: totalMedals, emphasis: true },
    { label: messages.medalBoard.stats.gold, value: goldCount },
    { label: messages.medalBoard.stats.silver, value: silverCount },
    { label: messages.medalBoard.stats.bronze, value: bronzeCount },
  ];

  return (
    <main className="motion-safe:page-enter flex flex-col gap-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">{dictionary.common.nav.medalBoard}</h1>
          <p className="text-text-muted">{dictionary.common.greeting(athlete.name)}</p>
        </div>
        <LogRaceModal messages={messages} closeLabel={dictionary.common.modal.closeLabel} />
      </div>

      <div className="flex flex-wrap gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="panel min-w-[7rem] flex-1 p-4">
            <AnimatedStat label={stat.label} target={stat.value} emphasis={stat.emphasis} />
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="panel flex flex-col items-start gap-3 p-6">
          <p>{messages.medalBoard.emptyState.message}</p>
          <LogRaceModal
            messages={messages}
            closeLabel={dictionary.common.modal.closeLabel}
            trigger={<Button variant="outline">{messages.medalBoard.emptyState.cta}</Button>}
          />
        </div>
      ) : (
        <>
          {/* Entry motion for the cards below (`EventCard`); off entirely
              under prefers-reduced-motion via Tailwind's motion-safe:. */}
          <style>{`
            @keyframes card-fade-up {
              from { opacity: 0; transform: translateY(10px) scale(0.96); filter: blur(6px); }
              to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
          `}</style>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry, index) => (
              <li key={entry.event.id}>
                <EventCard
                  entry={entry}
                  photos={photosByEvent[index]}
                  locale={locale}
                  messages={messages}
                  index={index}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
