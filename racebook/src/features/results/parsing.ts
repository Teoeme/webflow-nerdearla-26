// Pure parsing functions for the result and new-event forms. Each returns
// `undefined` for input that doesn't fit, instead of throwing: a malformed
// form field is expected user input, not an exceptional situation.

const DURATION_PATTERN = /^\d+:\d{1,2}(:\d{1,2})?$/;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export function parseDuration(value: string): number | undefined {
  const trimmed = value.trim();
  if (!DURATION_PATTERN.test(trimmed)) return undefined;

  const segments = trimmed.split(":").map(Number);
  const [hours, minutes, seconds] = segments.length === 3 ? segments : [0, segments[0], segments[1]];
  if (minutes >= MINUTES_PER_HOUR || seconds >= SECONDS_PER_MINUTE) return undefined;

  return hours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE + minutes * SECONDS_PER_MINUTE + seconds;
}

export function parsePositiveInteger(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;

  const parsed = Number(trimmed);
  return parsed > 0 ? parsed : undefined;
}

export function parseInteger(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return undefined;

  return Number(trimmed);
}

export function parseDecimal(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function calculatePaceSecondsPerKm(timeSeconds: number, distanceKm: number): number {
  return Math.round(timeSeconds / distanceKm);
}
