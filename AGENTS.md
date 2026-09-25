# AGENTS.md

Read `README.md` first: it holds the contest rules, scope, data model and plan.

**Hard deadline: 2026-09-25, 23:59 ART.** Prefer working, deployed and simple over clever.

## Public repository

This repository is **public**. Everything committed, including history, commit messages and
plans, can be read by anyone. Git history is permanent: deleting a file later does not
remove it.

Never commit:

- Secrets of any kind: API keys (including the AI model key for ai-capture), tokens,
  passwords, `.env` / `.dev.vars` files. Secrets live only in Webflow Cloud environment
  variables and in ignored local files.
- Local tooling state: `.atl/`, `.wrangler/`, `.open-next/`, `.claude/`, editor folders.
- Personal data: emails, names or paths of your machine (`/Users/...`), real people's
  photos. Seed data uses fictional athletes only.
- References to other projects, clients or employers, in code, docs, plans or commits.
  This project is only Racebook.

Before every commit, check `git status` and the staged diff (`git diff --cached`). Stage
files by name, not with `git add -A` / `git add .`. If something sensitive was committed,
stop and report it instead of trying to hide it with a new commit.

## Parallel work

Several agents work on this repo at the same time. To avoid stepping on each other:

- **Branches:** `develop` is the integration branch; `main` is production and only receives
  merges from `develop`. Never work on `develop` or `main` directly.
- **One agent, one worktree, one branch**, created from `develop`.
  ```sh
  git worktree add ../webflow-nerdearla-26-<area> -b feat/<area> develop
  ```
- **Stay inside your area** (table below). If you need a change in another area, stop and
  report it instead of editing it.
- **Merge to `develop` small and often** (rebase on `develop` first).
- The app lives in `racebook/`. Run `npm run build` there before merging. A broken
  `develop` blocks everyone, and `main` is meant to deploy to Webflow Cloud on every push.

| Area | Branch | Owns |
|---|---|---|
| platform | `feat/platform` | Webflow Cloud config, bindings, `src/db/` (connection, types, schema, migrations, seed), session (current athlete, locale), i18n plumbing, fonts, layout and switchers |
| ui | `feat/ui` | Visual identity in code: `globals.css` tokens and the shared components in `src/components/ui/` (see `docs/brand.md`) |
| results | `feat/results` | Medal board: event list, event detail, result form |
| gallery | `feat/gallery` | Photo upload, gallery, transfers (request, inbox, accept/reject) |
| ai-capture | `feat/ai-capture` | Screenshot → metrics extraction |

## Plans

Work is planned and executed by different agents. A planner writes plans in `plans/`;
**other agents execute them, in parallel.** Time is short, so a plan that collides with
another one costs more than a plan that is a bit less ambitious.

- **One plan, one area, one branch.** Name it `plans/NN-<area>-<slug>.md`
  (`01-platform-schema.md`). `NN` is the order it was written, not a priority.
- **Scopes never overlap.** A plan lists the exact files and folders it creates or modifies.
  Two plans that can run at the same time must not share a single file. If they would, split
  the work differently or make one plan depend on the other.
- **Contracts first.** Whatever several plans share (schema, types, `src/db/` function signatures,
  the current-athlete function, routes) is defined in one plan, usually `platform`. The other
  plans quote the exact signature they consume, so they can start before it is merged.
- **The plan is self-contained.** The executor has no memory of the planning conversation.
  Everything it needs is written in the plan.

Every plan has these sections:

| Section | Content |
|---|---|
| Status | `todo`, `in-progress` or `done`. Only the executor of the plan updates it |
| Goal | What works when the plan is done, in one or two sentences |
| Area and branch | Area from the table above and its branch/worktree |
| Owns | Exhaustive list of files and folders the plan may create or modify |
| Must not touch | Nearby files owned by other plans or areas |
| Depends on | Plans that must be merged first, or the contract to build against until then |
| Contracts | Exact signatures and types consumed or provided |
| Steps | Small, ordered, each one verifiable |
| Verification | Commands to run (`npm run build` at minimum) and what to check by hand |
| Done when | Checkable acceptance criteria |

Executors:

- Load the *Código Sostenible* skills before writing code (`cs-fundamentos`,
  `cs-implementacion`, `cs-errores`, `cs-solid-diseno`, `cs-refactoring`, `cs-mitos`).
  All code, tests included, follows them.
- Stay inside the plan's **Owns** list. If the work needs anything outside it, stop and
  report it; don't edit it.
- Update only your own plan file, and only its Status line.

## Shared contracts

- **The schema is owned by `platform`.** Other areas consume it; they don't change it.
  Need a new column? Ask for it. Migrations are numbered files in `racebook/src/db/migrations/`
  (`0001_init.sql`, `0002_...`); never edit a migration that is already on `develop`.
- Data access goes through `src/db/` modules, one per entity. UI components don't write SQL.
- The current athlete comes from a single function in the platform area (cookie-based,
  simulated users). Don't read the cookie anywhere else.

## Languages

The app is fully bilingual, **English and Spanish**: the jury speaks both. Every string a
user reads exists in both languages, from day one. A screen with hard-coded copy is not done.

- **No locale in the URL.** The language is a cookie, set by a language switcher in the
  layout. First visit: the browser's `Accept-Language`, falling back to English. This keeps
  routes as they are and needs no middleware.
- **The current locale comes from a single function in the platform area**, like the current
  athlete. Don't read the cookie or the header anywhere else.
- **Dictionaries, no library.** Copy lives in typed TypeScript objects. English is the
  source: the Spanish object is typed against it, so a missing translation is a build error.
- **One dictionary per area, so parallel work never collides.** Each area owns its own pair
  of files (`<area>.en.ts`, `<area>.es.ts`) and only edits those. The platform area creates
  every pair up front (empty for other areas) and owns the file that combines them.
- Dates, times, pace and distances are formatted with `Intl` for the current locale, not by
  hand. Athlete and event names are data and are not translated.
- Spanish copy is neutral Rioplatense Spanish with *vos* ("Aceptá la foto"), the way the
  local audience speaks.

## Platform constraints (Webflow Cloud)

- Next.js App Router + TypeScript, running on Cloudflare Workers through the OpenNext adapter.
- Only Edge-runtime middleware. No `use cache`. No Node-only APIs (`fs`, native modules).
- Storage: Webflow Cloud SQLite (data) and Object Storage (photos).
- Docs: https://developers.webflow.com/webflow-cloud/intro

## Code standards

- Artifacts (code, identifiers, comments, commits) in **English**. UI copy in both
  languages, through the dictionaries (see Languages).
- Pronounceable, concrete names. No `helper`, `manager`, `utils`, `handler` as a standalone name.
  No `I` prefix on interfaces, no `Impl` suffix.
- One concept, one name — use the names in the README data model everywhere.
- No magic literals: every value has a name.
- A function does what its name says and nothing else. No hidden mutations.
- Design for the present. No abstractions "just in case".

## Commits

- Conventional commits: `feat(gallery): accept photo transfer`.
- No AI attribution or `Co-Authored-By` lines.
