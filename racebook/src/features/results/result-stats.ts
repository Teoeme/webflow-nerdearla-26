import type { RaceResult } from "@/db/types";
import type { Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/locale";
import { formatDistance, formatDuration, formatPace } from "@/i18n/formatters";

export type ResultStat = { label: string; value: string };

// Builds the athlete's own result as a list of Stats, skipping metrics that
// were never logged. Order matches the plan: time, place, distance, pace,
// avg heart rate, elevation.
export function buildResultStats(
  result: RaceResult | undefined,
  messages: Dictionary["results"],
  locale: Locale,
): ResultStat[] {
  if (!result) return [];

  const labels = messages.eventDetail.stats;
  const stats: Array<ResultStat | undefined> = [
    result.timeSeconds !== null ? { label: labels.time, value: formatDuration(result.timeSeconds) } : undefined,
    result.place !== null ? { label: labels.place, value: String(result.place) } : undefined,
    result.distanceKm !== null
      ? { label: labels.distance, value: formatDistance(result.distanceKm, locale) }
      : undefined,
    result.paceSecondsPerKm !== null
      ? { label: labels.pace, value: formatPace(result.paceSecondsPerKm) }
      : undefined,
    result.avgHeartRate !== null ? { label: labels.avgHeartRate, value: String(result.avgHeartRate) } : undefined,
    result.elevationM !== null ? { label: labels.elevation, value: String(result.elevationM) } : undefined,
  ];

  return stats.filter((stat): stat is ResultStat => stat !== undefined);
}
