import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { SupportedScreenshotMediaType } from "./screenshot-constraints";

// Confirmed against https://ai.google.dev/gemini-api/docs/models — a current, generally
// available Flash model with vision input and structured JSON output. Re-check this id
// against the live model list once a key is available; swap it here if it's retired.
const GEMINI_MODEL_ID = "gemini-2.5-flash";
const GEMINI_GENERATE_CONTENT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;

const MIN_PLAUSIBLE_HEART_RATE = 30;
const MAX_PLAUSIBLE_HEART_RATE = 250;
const MIN_PLAUSIBLE_DISTANCE_KM = 0;
const MAX_PLAUSIBLE_DISTANCE_KM = 1000;
const MIN_PLAUSIBLE_TIME_SECONDS = 1;
const MAX_PLAUSIBLE_TIME_SECONDS = 7 * 24 * 60 * 60;
const MIN_PLAUSIBLE_ELEVATION_M = 0;
const MAX_PLAUSIBLE_ELEVATION_M = 20000;

export type CapturedMetrics = {
  timeSeconds: number | null;
  distanceKm: number | null;
  avgHeartRate: number | null;
  elevationM: number | null;
};

export type CaptureOutcome =
  | { kind: "captured"; metrics: CapturedMetrics }
  | { kind: "unreadable" } // not a workout summary, or nothing legible
  | { kind: "unavailable" }; // no key, API error, blocked response

const EXTRACTION_PROMPT = `You are reading a screenshot of a sports watch or fitness app activity
summary (Garmin, Strava, Coros, or similar). Read the workout totals shown on screen and
return them as the requested JSON.

Rules:
- Convert miles to kilometers and feet to meters.
- "timeSeconds" is the total elapsed time of the whole activity, in whole seconds — the
  main duration shown on screen, never a lap, split or pace value.
- Use null for any field that is not visible on screen. Never guess or estimate a value
  that isn't shown.
- "isWorkoutSummary" is false when the image is not a workout or activity summary screen
  (a chat screenshot, a photo, a menu, an empty screen, etc.).`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    isWorkoutSummary: { type: "BOOLEAN" },
    timeSeconds: { type: "NUMBER", nullable: true },
    distanceKm: { type: "NUMBER", nullable: true },
    avgHeartRate: { type: "NUMBER", nullable: true },
    elevationM: { type: "NUMBER", nullable: true },
  },
  required: ["isWorkoutSummary", "timeSeconds", "distanceKm", "avgHeartRate", "elevationM"],
};

type GeminiExtraction = {
  isWorkoutSummary: boolean;
  timeSeconds: number | null;
  distanceKm: number | null;
  avgHeartRate: number | null;
  elevationM: number | null;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
};

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isGeminiExtraction(value: unknown): value is GeminiExtraction {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.isWorkoutSummary === "boolean" &&
    isNullableNumber(candidate.timeSeconds) &&
    isNullableNumber(candidate.distanceKm) &&
    isNullableNumber(candidate.avgHeartRate) &&
    isNullableNumber(candidate.elevationM)
  );
}

function parseGeminiExtraction(responseText: string): GeminiExtraction | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    return undefined;
  }
  return isGeminiExtraction(parsed) ? parsed : undefined;
}

function clampToPlausibleRange(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  return value >= min && value <= max ? value : null;
}

function sanitizeMetrics(extraction: GeminiExtraction): CapturedMetrics {
  const timeSeconds = clampToPlausibleRange(extraction.timeSeconds, MIN_PLAUSIBLE_TIME_SECONDS, MAX_PLAUSIBLE_TIME_SECONDS);
  const distanceKm = clampToPlausibleRange(extraction.distanceKm, MIN_PLAUSIBLE_DISTANCE_KM, MAX_PLAUSIBLE_DISTANCE_KM);
  const avgHeartRate = clampToPlausibleRange(extraction.avgHeartRate, MIN_PLAUSIBLE_HEART_RATE, MAX_PLAUSIBLE_HEART_RATE);
  const elevationM = clampToPlausibleRange(extraction.elevationM, MIN_PLAUSIBLE_ELEVATION_M, MAX_PLAUSIBLE_ELEVATION_M);

  return {
    timeSeconds: timeSeconds === null ? null : Math.round(timeSeconds),
    distanceKm: distanceKm === null ? null : Math.round(distanceKm * 100) / 100,
    avgHeartRate: avgHeartRate === null ? null : Math.round(avgHeartRate),
    elevationM: elevationM === null ? null : Math.round(elevationM),
  };
}

async function readGeminiApiKey(): Promise<string | undefined> {
  const { env } = await getCloudflareContext({ async: true });
  return env.GEMINI_API_KEY;
}

async function requestExtraction(
  apiKey: string,
  image: { base64: string; mediaType: SupportedScreenshotMediaType },
): Promise<Response> {
  return fetch(GEMINI_GENERATE_CONTENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ inlineData: { mimeType: image.mediaType, data: image.base64 } }, { text: EXTRACTION_PROMPT }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });
}

export async function extractMetrics(image: {
  base64: string;
  mediaType: SupportedScreenshotMediaType;
}): Promise<CaptureOutcome> {
  const apiKey = await readGeminiApiKey();
  if (!apiKey) return { kind: "unavailable" };

  let response: Response;
  try {
    response = await requestExtraction(apiKey, image);
  } catch {
    console.error("Gemini request failed", { errorKind: "network" });
    return { kind: "unavailable" };
  }

  if (!response.ok) {
    console.error("Gemini request failed", { status: response.status });
    return { kind: "unavailable" };
  }

  const body = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;
  if (body?.promptFeedback?.blockReason) {
    console.error("Gemini response blocked", { reason: body.promptFeedback.blockReason });
    return { kind: "unavailable" };
  }

  const responseText = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof responseText !== "string") return { kind: "unavailable" };

  const extraction = parseGeminiExtraction(responseText);
  if (!extraction) return { kind: "unreadable" };
  if (!extraction.isWorkoutSummary) return { kind: "unreadable" };

  return { kind: "captured", metrics: sanitizeMetrics(extraction) };
}
