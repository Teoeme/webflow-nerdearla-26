# 11 · ai-capture · Metrics from a watch screenshot (Gemini)

**Status:** todo

## Goal

On the result form, the athlete uploads a screenshot of their watch or app summary
(Garmin, Strava, Coros…) and the form fills itself with the time, distance, average heart
rate and elevation that **Google Gemini** reads from the image. The athlete reviews and
saves as usual. The screenshot is not stored.

This plan delivers the route and a self-contained client component. Mounting it in the
result form is a small follow-up done by the orchestrator after plan 13 (which turns the
form into a modal) is merged.

## Area and branch

- Area: `ai-capture`
- Worktree from `develop`:
  ```sh
  git worktree add ../webflow-nerdearla-26-ai-capture -b feat/ai-capture develop
  ```
- Paths relative to `racebook/`.

## Read first

- `AGENTS.md` (especially *Public repository*: the API key is a **secret**, never in code,
  commits, logs or `wrangler.json`), `docs/brand.md`.
- The Gemini API docs (https://ai.google.dev/gemini-api/docs) for image input and
  structured JSON output. The live docs and the installed SDK win over this plan.
- Load the *Código Sostenible* skills (`cs-*`).

## Owns

- `package.json`, `package-lock.json`: add `@google/genai` only. If it doesn't bundle or run
  on Cloudflare Workers (check `npm run build` and a real request in `npm run dev`), use the
  REST `generateContent` endpoint with `fetch` and add nothing.
- `src/features/ai-capture/` (new): extraction, client component.
- `src/app/api/metrics-capture/route.ts` (new)
- `src/i18n/messages/ai-capture.en.ts`, `src/i18n/messages/ai-capture.es.ts` (exist, empty)
- `cloudflare-env.d.ts`: only to type `GEMINI_API_KEY: string` on `CloudflareEnv`.

## Must not touch

`src/features/results/**` (plan 13 is changing the result form in parallel), `src/db/**`,
migrations, `src/features/gallery/`, `src/app/layout.tsx`, `src/components/**`,
`wrangler.json`.

## Contracts

### Secret

- `GEMINI_API_KEY`, read only in `src/features/ai-capture/` from the Workers env:
  `(await getCloudflareContext({ async: true })).env.GEMINI_API_KEY`. (`process.env` is not
  populated with our `compatibility_date`.)
- Local: `racebook/.dev.vars` with `GEMINI_API_KEY=...` (ignored by git; `git status` must
  never show it). The user puts the key there; never ask for it in chat. Production: the
  user adds it as a **secret** environment variable in Webflow Cloud.
- Missing key: the route answers `503 { reason: "unavailable" }`; the rest of the app works.

### Extraction (`src/features/ai-capture/extract-metrics.ts`)

```ts
export type CapturedMetrics = {
  timeSeconds: number | null;
  distanceKm: number | null;
  avgHeartRate: number | null;
  elevationM: number | null;
};

export type CaptureOutcome =
  | { kind: "captured"; metrics: CapturedMetrics }
  | { kind: "unreadable" }   // not a workout summary, or nothing legible
  | { kind: "unavailable" }; // no key, API error, blocked response

export async function extractMetrics(image: {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<CaptureOutcome>;
```

- One `generateContent` call. Model: a current Gemini Flash model with vision and
  structured output (named constant; confirm the id against the API's model list with the
  key). The image goes as inline data before the text prompt; the response is JSON forced
  by a response schema with the four nullable fields plus `isWorkoutSummary: boolean`.
- Prompt: extract the totals of the activity shown; convert miles to km and feet to
  meters; time as total seconds (the screen's main time); `null` for anything not visible;
  never guess.
- Parse the JSON defensively (it may be missing or malformed): anything that doesn't fit
  the shape is `unreadable`; network/API errors and blocked responses are `unavailable`.
  Log only the status and error kind, never the image or the key.
- Sanity limits after parsing (named constants): a value outside a plausible range (heart
  rate 30–250, distance 0–1000 km, time 1 s–7 days, elevation 0–20000 m) becomes `null`.

### Route (`POST /api/metrics-capture`)

- Multipart with one field `screenshot`. Current athlete required (`getCurrentAthlete`).
- Validate type (jpeg, png, webp) and size (max 5 MB, named constant) before calling
  Gemini: `400 { reason: "type" | "size" | "missing" }`.
- `200 { metrics }`, `422 { reason: "unreadable" }`, `503 { reason: "unavailable" }`.
- Nothing is written to the database or the bucket.

### Client component (`src/features/ai-capture/screenshot-capture.tsx`)

```tsx
"use client";
export type ScreenshotCaptureLabels = { /* plain strings only */ };
export function ScreenshotCapture(props: {
  labels: ScreenshotCaptureLabels; // from dictionary.aiCapture, strings only
  onCaptured: (metrics: CapturedMetrics) => void;
}): JSX.Element;
```

- An outline `Button` "Fill from a screenshot" / "Completá desde una captura" with a hidden
  file input; while waiting, "Reading your screenshot…" / "Leyendo tu captura…"; then a
  one-line result: "Filled 4 fields. Check them before saving." / "Completamos 4 campos.
  Revisalos antes de guardar." (count as a template string, not a function), or the
  translated error for each reason.
- Export a pure helper for the mount step:
  `export function toResultFormValues(metrics: CapturedMetrics): Partial<Record<"time" | "distance" | "avgHeartRate" | "elevation", string>>`
  (time formatted `h:mm:ss` with the platform `formatDuration`; only non-null values).

## Steps

1. Worktree, `npm install @google/genai`, fresh local migrations. Ask nothing in chat: if
   `racebook/.dev.vars` has no key, build everything, test the 503 path, and report that
   the live test is pending the key.
2. `extract-metrics.ts` and the route. With a key: test with `curl -F screenshot=@...`
   against 2–3 summary screenshots (the user may drop them in the scratch folder the
   orchestrator names; otherwise render a Strava-style summary image yourself) and a
   non-workout image.
3. Dictionaries and `ScreenshotCapture`.
4. `npm run build`, `npm run lint`, `npm run dev` + curl every page. Small conventional
   commits (`feat(ai-capture): ...`). Status `done`.

## Done when

- [ ] The route returns correct metrics for a summary screenshot, 422 for a non-workout
      image, 400 for a PDF, 503 without the key.
- [ ] `ScreenshotCapture` and `toResultFormValues` exist with the exact signatures.
- [ ] `git grep -n "AIza"` finds nothing; `.dev.vars` is not tracked.
