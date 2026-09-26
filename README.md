# Racebook — the athlete’s book of races

Entry for the **Webflow App Challenge · Nerdearla 2026** (13th edition, Buenos Aires).

A personal medal board for amateur athletes: log the events you race, your results and
performance metrics, and keep a photo gallery of each event — with a way to hand photos
back to the friends who actually appear in them.

- **Live app:** https://racebook-23e161.webflow.io/
- **For judges and AI agents:** features, the problem it solves and a guided tour in
  [`/llms.txt`](https://racebook-23e161.webflow.io/llms.txt) (source:
  [`racebook/public/llms.txt`](racebook/public/llms.txt)).

## The contest

- Landing: https://nerdearla-app-showcase.webflow.io/
- **Deadline: Friday 2026-09-25, 23:59 ART.** Winners announced Saturday 2026-09-26, 12:00 ART.
- The app must be built and deployed on **Webflow Cloud**, reachable from a public URL.
- One project per GitHub account. Public APIs, AI models and the Webflow MCP are allowed.
- Three categories, no formal rubric (Webflow engineers pick): **Best Tech**, **Best Design**,
  **Best of Show**.
- Submission form asks for: GitHub user, app URL, optional description.

## The problem

At a race, a group of friends takes turns: while one competes, the others take the photos.
Everyone ends up with a gallery "polluted" with photos of other people, and missing the
photos of themselves. Racebook lets you **transfer ownership** of a photo to the person in it;
they accept it and the photo moves to their gallery for that same event.

## Scope (MVP for tonight)

| Feature | Status | Notes |
|---|---|---|
| Medal board: events + results | In | Event, date, discipline, place, time, medal |
| Performance metrics | In | Manual entry: distance, pace, avg HR, elevation, time |
| Photo gallery per event | In | Photos only, no video |
| Photo ownership transfer | In — **hero feature** | Request → recipient accepts/rejects → owner changes |
| English and Spanish UI | In | Language switcher, cookie-based. The jury speaks both. See `AGENTS.md` |
| Metrics from a watch screenshot (AI vision) | Stretch | Upload a Garmin/Strava/Coros summary screenshot, a vision model extracts the metrics. Replaces a real Garmin integration. First thing to cut if late. |
| Real authentication | Out | Simulated users with a "View as…" switcher (cookie). Said openly in the pitch. |
| Tagging people in photos | In | The photo stays with its owner and also appears in the tagged athlete's event |
| Video | Out | |
| Garmin Connect API | Out | Requires developer approval. Roadmap item for the pitch. |

## Stack

- **Next.js** (App Router, TypeScript) on **Webflow Cloud**, deployed as an *Independent app*
  (not mounted inside a site, to avoid base-path issues).
- Webflow Cloud runs Next.js on Cloudflare Workers through the **OpenNext Cloudflare adapter**.
  Known limits: only Edge-runtime middleware, no `use cache`, ISR is experimental.
- Storage provided by Webflow Cloud (available by default):
  - **SQLite** — relational data.
  - **Object Storage** — photo files.
- Docs: https://developers.webflow.com/webflow-cloud/intro

## Data model

Key decision: **events are private.** Each athlete keeps their own record; nobody sees
another athlete's events or results. Photos cross between athletes only when the owner
sends them, and the recipient decides which of their events they go to.

```
athletes   (id, name, avatar_url)                       -- 3 seeded users
events     (id, owner_id, name, date, location, discipline)
results    (id, athlete_id, event_id, place, time_seconds, medal,
            distance_km, pace_seconds_per_km, avg_heart_rate, elevation_m)
photos     (id, event_id, owner_id, uploader_id, storage_key, created_at)
transfers  (id, photo_id, from_athlete_id, to_athlete_id,
            status: pending | accepted | rejected, created_at, resolved_at)
photo_tags (id, photo_id, athlete_id, tagged_by_id,
            status: pending | accepted | rejected, event_id, created_at, resolved_at)
```

Rules:
- Only the current owner can transfer or tag a photo.
- **Transfer** moves the photo: on accept, `owner_id` and `event_id` change to the
  recipient and the event they choose.
- **Tag** shares it: the photo stays with its owner and also appears in the tagged
  athlete's gallery, in the event they choose (`photo_tags.event_id`).
- On accept, the destination is one of the recipient's events or a new one prefilled
  from the sender's event. Accepting is atomic.
- A photo has at most one `pending` transfer, and one open tag per athlete.

## Plan (ART)

| Time | Block |
|---|---|
| 19:10–19:40 | Scaffold with `webflow cloud init`, push, **first deploy**, SQLite + storage bindings |
| 19:40–20:10 | Schema, seed, user switcher |
| 20:10–21:00 | Medal board: list, detail, result form |
| 21:00–21:50 | Gallery, upload, transfers (request, inbox, accept/reject) |
| 21:50–22:30 | AI screenshot → metrics (stretch) |
| 22:30–23:15 | Visual polish, good-looking seed data |
| 23:15–23:40 | Final deploy, test on the public URL, **submit** |

Cut order if late: AI screenshot first, then polish. Never cut the transfer flow.

## Getting started

```sh
npx @webflow/webflow-cli cloud init   # scaffold the Next.js app (interactive, needs login)
npm install
npm run dev
```

Connect this repository in the Webflow dashboard (New Project → App). Webflow Cloud deploys on
every push to the connected branch.
