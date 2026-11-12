# Nayanote

An ADHD-friendly personal organization system: capture anything, find it later, and get help deciding what to do next. Local-first and zero-cost: no paid APIs, hosting or subscriptions are required.

> **Status: Milestone 1 of 6 (Foundation) complete.** The app shell, themes, database and API skeleton run. Capture, tasks, notes, AI, RAG and the planner are **not built yet** and show as "Not built yet" pages. See [Roadmap](#roadmap).

## Product vision

Todoist + Notion + a personal knowledge base + RAG retrieval + a gentle daily planner + a conversational assistant. The defining interaction is asking "What should I do today?" and getting a small, realistic plan grounded in your own data. Success is measured by how much cognitive effort it removes, not by feature count. No streaks, scores or guilt-based messaging.

Principles: capture first, organize later; reduce cognitive load; make starting easier than planning; AI is helpful but never required; the user stays in control.

## Features

| Area | Status |
|---|---|
| App shell, navigation, responsive layout | Done (M1) |
| Light / dark / system theme with persistence | Done (M1) |
| SQLite database + migrations (unified resource schema) | Done (M1) |
| Capture, inbox, tasks, notes, ideas, projects, search | Milestone 2 |
| AI provider abstraction (Groq, Hugging Face, Ollama), chat | Milestone 3 |
| Embeddings, hybrid retrieval (FTS5 + vectors), sources | Milestone 4 |
| Daily planner, "just give me one thing" | Milestone 5 |
| Polish, accessibility, export/delete data, docs | Milestone 6 |

## Screenshots

_Placeholders until Milestone 2 has real screens._

| Light | Dark |
|---|---|
| `docs/screenshots/dashboard-light.png` | `docs/screenshots/dashboard-dark.png` |

## Technology stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 3, React Router 7, TanStack Query, Zustand |
| Backend | Node 22, Express 4, TypeScript (run with `tsx`), Zod 4 |
| Database | SQLite via `better-sqlite3`, plain SQL migrations, FTS5 planned |
| Shared | `packages/shared`: Zod schemas and types used by both sides |
| Icons | Font Awesome Free (solid) |
| Font | Manrope, self-hosted via `@fontsource-variable/manrope` |
| Tests | Vitest, Supertest, jsdom |

## Architecture overview

```
apps/web  (React)  --/api proxy-->  apps/api (Express)  -->  repositories  -->  SQLite file
        \                                  \-- services (planner, RAG, AI: later milestones)
         \-- packages/shared (Zod schemas, types) --/
```

- All SQL lives in `apps/api/src/repositories/` (added in M2), so swapping SQLite for PostgreSQL later touches one layer.
- AI calls will only ever happen on the backend. Keys never reach the browser.
- Data stays on your machine: the database is `data/nayanote.db`, and uploaded documents (future) go in `data/files/`. The browser stores only your theme choice.

## Prerequisites

- Node.js 20 or newer (developed on 22)
- npm 10+
- A C/C++ toolchain only if `better-sqlite3` has no prebuilt binary for your platform

## Installation

```bash
git clone <your-repo-url> nayanote
cd nayanote
npm install
cp .env.example .env     # optional: defaults work without it
npm run dev
```

Open http://localhost:5173. The API runs on http://127.0.0.1:4000 and the database is created and migrated automatically on first start.

## Environment variables

See `.env.example`. None are required.

| Variable | Default | Purpose |
|---|---|---|
| `API_PORT` / `API_HOST` | `4000` / `127.0.0.1` | API bind address (localhost only by default) |
| `WEB_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `DATABASE_PATH` | `./data/nayanote.db` | SQLite file (relative paths resolve from the repo root) |
| `FILES_DIR` | `./data/files` | Local document storage |
| `GROQ_API_KEY`, `HUGGINGFACE_API_KEY`, `OLLAMA_BASE_URL` | empty | Used from Milestone 3. Never commit real keys |

## Database setup

Migrations in `apps/api/migrations/*.sql` run automatically at server start, in order, each in a transaction, and are recorded in `schema_migrations` so they never re-run. To run them manually: `npm run migrate`. Never edit an applied migration; add a new numbered file.

## Development commands

| Command | What it does |
|---|---|
| `npm run dev` | API (watch) + web dev server together |
| `npm run test` | All tests (shared, API, web) |
| `npm run typecheck` | TypeScript across all packages |
| `npm run build` | Typecheck + production build of the web app |
| `npm run migrate` | Apply pending migrations |

## AI provider configuration

Not implemented yet (Milestone 3). Design: a provider interface with Groq, Hugging Face and Ollama adapters, keys from environment variables only, no silent fallback to anything paid, and the whole app fully usable with AI off. Free-tier limits will be verified and documented at implementation time rather than assumed.

## RAG architecture

Not implemented yet (Milestone 4). Plan: local embeddings (`all-MiniLM-L6-v2` via transformers.js), vectors stored in SQLite behind a `VectorStore` interface, hybrid retrieval combining FTS5 keyword search, vector similarity and metadata filters, with source references shown in the UI. Embeddings record the model that produced them so they can be regenerated.

## Testing

```bash
npm run test
```

Current coverage: input schema validation, migrations (idempotency, constraints, cascades), API health and error shape, theme resolution and persistence, and WCAG AA contrast checks for every text/background token pair in both themes.

## Troubleshooting

| Problem | Fix |
|---|---|
| Dashboard shows "Server unreachable" | The API isn't running. Use `npm run dev` from the repo root |
| `better-sqlite3` fails to install | Use a supported Node version (20/22); otherwise install build tools for native modules |
| Port 4000 or 5173 in use | Set `API_PORT`, or stop the other process. Vite will pick another port automatically, so update `WEB_ORIGIN` to match |
| Theme looks wrong after changing OS theme | Choose "Match system" in Settings. Explicit light/dark ignores the OS |
| Want a clean database | Stop the server and delete `data/nayanote.db*` (this deletes all your data) |

## Deployment

Local-first is the supported mode. Hosted deployment is not part of Milestone 1. When added, it will document free hosts and their limits; note that SQLite needs a persistent disk, which many free tiers lack.

## Free-tier limitations

None apply yet: Milestone 1 uses no external services. Provider limits (Groq, Hugging Face) will be checked and recorded in Milestone 3.

## Licenses and attribution

- Font Awesome Free: icons are CC BY 4.0, fonts SIL OFL 1.1, code MIT. https://fontawesome.com/license/free
- Manrope: SIL OFL 1.1.

## Roadmap

Milestones 2 to 6 as in the feature table above. Later ideas: document upload (PDF/text), optional cloud sync, multi-user support.
