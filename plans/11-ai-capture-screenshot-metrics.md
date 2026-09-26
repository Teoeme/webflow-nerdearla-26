# 11 · ai-capture · Metrics from a watch screenshot

**Status:** todo

## Goal

On the result form, the athlete uploads a screenshot of their watch or app summary
(Garmin, Strava, Coros…) and the form fills itself with the time, distance, average heart
rate and elevation that Claude reads from the image. The athlete reviews and saves as
usual. The screenshot is not stored.

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
- The result form: `src/features/results/result-form.tsx` and
  `src/app/events/[eventId]/result/page.tsx`.
- Load the *Código Sostenible* skills (`cs-*`) and the `claude-api` skill before writing
  code. The API calls below come from that skill; if the installed SDK's types disagree,
  the SDK wins.

## Owns

- `package.json`, `package-lock.json`: add `@anthropic-ai/sdk` and `zod` only.
- `src/features/ai-capture/` (new): extraction, schema, client component.
- `src/app/api/metrics-capture/route.ts` (new)
- `src/i18n/messages/ai-capture.en.ts`, `src/i18n/messages/ai-capture.es.ts` (they exist,
  empty)
- `src/features/results/result-form.tsx`: **only** to mount the capture component and
  prefill the fields it returns. No other change to the form or its action.
- `cloudflare-env.d.ts`: only to type `ANTHROPIC_API_KEY: string` on `CloudflareEnv`.

## Must not touch

- `src/features/results/actions.ts` and `parsing.ts` (saving works as today), everything
  else in `src/features/results/`, `src/db/**`, migrations, `src/features/gallery/`,
  `src/app/layout.tsx`, `src/components/**`, `wrangler.json`.

## Contracts

### Secret

- `ANTHROPIC_API_KEY`, read only in `src/features/ai-capture/` from the Workers env:
  `(await getCloudflareContext({ async: true })).env.ANTHROPIC_API_KEY`, passed explicitly
  as `new Anthropic({ apiKey })`. (`process.env` is not populated with our
  `compatibility_date`.)
- Local: `racebook/.dev.vars` with `ANTHROPIC_API_KEY=...` (already ignored by git; check
  `git status` never shows it). Production: the user adds it as a **secret** environment
  variable in Webflow Cloud.
- Missing key: the route answers `503 { reason: "unavailable" }` and the form hides
  nothing else; the rest of the app works.

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
  | { kind: "unavailable" }; // no key, API error, refusal

export async function extractMetrics(image: {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<CaptureOutcome>;
```

- One `client.messages.parse` call, model `claude-opus-5` (named constant), image as a
  base64 `image` content block before a text block, `output_config.format` =
  `zodOutputFormat(schema)` with a Zod schema of the four nullable fields plus
  `isWorkoutSummary: boolean`. `max_tokens` 1024 (named constant).
- Prompt: extract the totals of the activity shown; convert miles to km and feet to
  meters; time as total seconds (moving or elapsed, whichever the screen labels as the
  main time); `null` for anything not visible; never guess.
- Opt into refusal fallbacks as the `claude-api` skill recommends (`fallbacks: "default"`,
  beta `server-side-fallback-2026-07-01`) if the installed SDK accepts it on this call;
  otherwise skip it and say so in the report. Always check `stop_reason === "refusal"` and
  `parsed_output === null` before reading: both are `unavailable` / `unreadable`, never a
  crash.
- Catch the SDK's typed errors (`Anthropic.APIError` and subclasses) and return
  `unavailable`; log only the status and error type, never the image or the key.
- Sanity limits after parsing (named constants): discard a value outside a plausible
  range (e.g. heart rate 30–250, distance 0–1000 km) by setting it to `null`.

### Route (`POST /api/metrics-capture`)

- Multipart with one field `screenshot`. Current athlete required (`getCurrentAthlete`).
- Validate type (jpeg, png, webp) and size (max 5 MB, named constant: the API limit for an
  image) before calling Claude: `400 { reason: "type" | "size" | "missing" }`.
- `200 { metrics }`, `422 { reason: "unreadable" }`, `503 { reason: "unavailable" }`.
- Nothing is written to the database or the bucket.

### Client component (`src/features/ai-capture/screenshot-capture.tsx`)

```tsx
"use client";
export function ScreenshotCapture(props: {
  labels: ScreenshotCaptureLabels; // plain strings from dictionary.aiCapture
  onCaptured: (metrics: CapturedMetrics) => void;
}): JSX.Element;
```

- An outline button "Fill from a screenshot" / "Completá desde una captura" with a hidden
  file input; while waiting, "Reading your screenshot…" / "Leyendo tu captura…"; then a
  one-line result: "Filled 4 fields. Check them before saving." / "Completamos 4 campos.
  Revisalos antes de guardar.", or the translated error for each reason.
- The result form prefills time (formatted `h:mm:ss` with the platform `formatDuration`),
  distance, avg HR and elevation from `onCaptured`, only for non-null values, and leaves
  the other fields as they are. The athlete still presses Save.

## Steps

1. Worktree, `npm install @anthropic-ai/sdk zod`, fresh local migrations, `.dev.vars`.
2. `extract-metrics.ts` and the route. Test the route with `curl -F screenshot=@...`
   against 2–3 real summary screenshots (the user can provide them; otherwise make one
   with a text-on-image of a Strava-style summary) and a non-workout image.
3. Dictionaries, `ScreenshotCapture`, mount it in the result form.
4. `npm run build`, `npm run lint`, and `npm run dev` + curl every page (a
   function passed to a client component only fails at runtime). Small conventional
   commits (`feat(ai-capture): ...`). Status `done`.

## Verification

- A Garmin/Strava-style screenshot returns the right metrics (check by hand against the
  image); a photo of a cat returns 422; a PDF returns 400; without the key, 503 and the
  form still works.
- `git grep -n "sk-ant"` finds nothing; `.dev.vars` is not tracked.

## Done when

- [ ] The result form fills itself from a screenshot, in both languages.
- [ ] The key lives only in Webflow Cloud secrets and the ignored `.dev.vars`.
- [ ] Every failure is a translated message, never a crash.
