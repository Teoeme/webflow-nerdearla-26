# AGENTS.md

Read `README.md` first: it holds the contest rules, scope, data model and plan.

**Hard deadline: 2026-09-25, 23:59 ART.** Prefer working, deployed and simple over clever.

## Parallel work

Several agents work on this repo at the same time. To avoid stepping on each other:

- **One agent, one worktree, one branch.** Never work on `main` directly.
  ```sh
  git worktree add ../webflow-nerdearla-26-<area> -b feat/<area>
  ```
- **Stay inside your area** (table below). If you need a change in another area, stop and
  report it instead of editing it.
- **Merge to `main` small and often** (rebase on `main` first). `main` deploys to Webflow
  Cloud on every push, so it must always build.
- Run `npm run build` before merging. A broken `main` blocks everyone.

| Area | Branch | Owns |
|---|---|---|
| platform | `feat/platform` | Webflow Cloud config, bindings, `db/` (schema, migrations, seed), user switcher, layout |
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
- **Contracts first.** Whatever several plans share (schema, types, `db/` function signatures,
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
  Need a new column? Ask for it. Migrations are numbered files in `db/migrations/`
  (`0001_init.sql`, `0002_...`); never edit a migration that is already on `main`.
- Data access goes through `db/` modules, one per entity. UI components don't write SQL.
- The current athlete comes from a single function in the platform area (cookie-based,
  simulated users). Don't read the cookie anywhere else.

## Platform constraints (Webflow Cloud)

- Next.js App Router + TypeScript, running on Cloudflare Workers through the OpenNext adapter.
- Only Edge-runtime middleware. No `use cache`. No Node-only APIs (`fs`, native modules).
- Storage: Webflow Cloud SQLite (data) and Object Storage (photos).
- Docs: https://developers.webflow.com/webflow-cloud/intro

## Code standards

- Artifacts (code, identifiers, comments, UI copy, commits) in **English**.
- Pronounceable, concrete names. No `helper`, `manager`, `utils`, `handler` as a standalone name.
  No `I` prefix on interfaces, no `Impl` suffix.
- One concept, one name — use the names in the README data model everywhere.
- No magic literals: every value has a name.
- A function does what its name says and nothing else. No hidden mutations.
- Design for the present. No abstractions "just in case".

## Commits

- Conventional commits: `feat(gallery): accept photo transfer`.
- No AI attribution or `Co-Authored-By` lines.
