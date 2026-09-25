import type { Locale } from "./locale";

const BCP47_TAG: Record<Locale, string> = {
  en: "en-US",
  es: "es-AR",
};

export function formatEventDate(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(BCP47_TAG[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (hours === 0) return `${minutes}:${paddedSeconds}`;

  const paddedMinutes = String(minutes).padStart(2, "0");
  return `${hours}:${paddedMinutes}:${paddedSeconds}`;
}

export function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatDistance(distanceKm: number, locale: Locale): string {
  const formattedNumber = new Intl.NumberFormat(BCP47_TAG[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(distanceKm);
  return `${formattedNumber} km`;
}
