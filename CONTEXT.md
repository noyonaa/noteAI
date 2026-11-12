# CONTEXT.md: Nayanote canonical project memory

Read this fully before changing code. It is kept current as the project evolves. Items marked **[IMPLEMENTED]** exist and are tested; **[PLANNED]** do not exist yet and must not be assumed.

_Last updated: Milestone 1 complete (2026-11-03)._

---

## A. Product context

- **What:** Nayanote is an AI-assisted personal organization system: Todoist + Notion + knowledge base + RAG + daily planner + chat assistant, as a local web app. (Name is provisional; the owner may rename it.)
- **Why:** People with ADHD / executive dysfunction / decision fatigue often know work exists but can't decide where to start.
- **Who:** A single user (initially the owner, Nayanote's author, a software developer) on their own machine.
- **Defining interaction:** User asks "What should I do today?" and gets a small, realistic plan grounded in their own tasks, notes and deadlines.
- **Philosophy:** capture first, organize later; reduce cognitive load; make starting easier than planning; break tasks down; never overwhelm; no guilt messaging; easy to resume after inactivity; calm UI; **AI helpful but never required**; user stays in control.
- **Never build:** gamification, streaks, productivity scores, aggressive notifications.
- **Success metric:** cognitive effort removed, not feature count.
- **Key workflows (planned):** quick capture to Inbox; triage into tasks/notes/ideas/projects; "What should I do today?" / "Just give me one thing"; ask questions about saved knowledge with sources shown.

## B. Technical architecture

- **Monorepo** (npm workspaces): `apps/web`, `apps/api`, `packages/shared`.
- **Frontend [IMPLEMENTED shell]:** React 18 + Vite + TS + Tailwind 3. Routing with React Router 7 (declarative `BrowserRouter`). Server state via TanStack Query; UI state via Zustand (theme store). Dev server proxies `/api` to `http://127.0.0.1:4000`.
- **Backend [IMPLEMENTED skeleton]:** Express 4 + TS, executed with `tsx` (no compiled build; `npm run build` for api is a typecheck). Layers: `routes` (thin) -> `services` (logic, M2+) -> `repositories` (only place with SQL, M2+) -> SQLite. Central error handler in `middleware/error.ts`.
- **Database:** SQLite file, WAL mode, foreign keys ON. Migrations are numbered `.sql` files applied at startup.
- **LLM providers [PLANNED, M3]:** provider interface; Groq, Hugging Face, Ollama adapters.
- **Embeddings [PLANNED, M4]:** local model via transformers.js; `VectorStore` interface; brute-force cosine over BLOB vectors initially.
- **RAG [PLANNED, M4]:** hybrid FTS5 + vector + metadata filters; structured SQL for exact facts.
- **Planner [PLANNED, M5]:** deterministic ranking in backend; LLM only explains/converses.
- **Data flow today:** browser -> Vite proxy -> Express -> SQLite. Only `GET /api/health` exists.
- **Storage:** all data local. DB at `data/nayanote.db`, documents (future) in `data/files/`. Browser `localStorage` holds only the theme key (`nayanote-theme`). Do not move user content into browser storage (5 MB cap, backend can't read it).

## C. Technology decisions

| Decision | Why | Alternatives considered |
|---|---|---|
| npm workspaces + shared Zod package | One schema for form and API validation | Separate repos; duplicated types |
| SQLite (`better-sqlite3`) | Zero cost, offline, single file, fast, sync API | PostgreSQL (kept as a future option; not used anywhere now) |
| Plain SQL migrations + hand-written repositories | Simple, transparent, easy to swap DB | Drizzle/Prisma (more abstraction than needed) |
| Brute-force vector search behind `VectorStore` | Personal data is small; no native extension risk | `sqlite-vec` (can slot in later) |
| `all-MiniLM-L6-v2` embeddings (planned) | Small, local, free | BGE-small (benchmark in M4) |
| Tailwind driven by CSS variables | Light/dark switch by swapping tokens, no `dark:` sprawl | CSS-in-JS |
| **Font Awesome Free (solid) icons** | Owner's explicit choice. **Do not use Lucide or mix icon families** | Lucide (rejected by owner) |
| Manrope self-hosted | No third-party font CDN calls | Inter, DM Sans |
| Zod 4, React Router 7 | Upgraded to clear `npm audit` advisories (0 vulnerabilities at M1) | Zod 3 / RR 6 had open advisories |
| `@fortawesome/react-fontawesome` 3.x | 0.2.x is deprecated; 3.x supports React 18 | n/a |

**Free-tier rule:** services that must **never** introduce a mandatory paid dependency: LLM providers, embeddings, hosting, storage. Groq/HF free-tier limits must be re-verified at M3 and documented; never silently fall back to a paid endpoint; app must work with AI off.

## D. Database context

Migration `001_init.sql` **[IMPLEMENTED]**:

| Table | Purpose | Key columns |
|---|---|---|
| `resources` | Unified model for all types | `id` PK, `type` (task/note/idea/project/goal/reminder/bookmark/habit), `title` (non-blank), `description`, `category`, `priority`, `status`, `deadline`, `start_date`, `estimated_minutes`, `actual_minutes`, `energy`, `postpone_count`, `completed_at`, `url`, `project_id` -> resources (SET NULL), `parent_id` -> resources (CASCADE, subtasks), `archived` 0/1, `created_at`, `updated_at` |
| `tags` | Tag names | `id`, `name` UNIQUE NOCASE |
| `resource_tags` | Many-to-many | PK (`resource_id`, `tag_id`), both CASCADE |
| `resource_relationships` | Typed links | `from_id`, `to_id`, `kind` (depends_on/related/supports), UNIQUE triple, no self-links |
| `user_settings` | Key/value settings | `key` PK, `value` |
| `schema_migrations` | Applied migrations | `name` PK, `applied_at` |

- Task-oriented columns are nullable so notes/ideas are never forced to have deadlines or priorities. CHECK constraints enforce allowed values.
- Subtasks = resources with `parent_id`. Projects are resources of type `project`; tasks join via `project_id`. Goals link to projects through `resource_relationships` (`supports`).
- Indexes: type, status (partial, non-archived), deadline (partial), project, parent, updated_at, tag, relationship target.
- Timestamps are ISO-8601 UTC text. IDs are text (generator chosen in M2).
- **[PLANNED] migrations:** FTS5 virtual table (M2); `chat_sessions`, `chat_messages` (M3); `embeddings` with `model_id` (M4); `planner_sessions`, `planner_recommendations` (M5).
- **Rules:** never edit an applied migration; add a new numbered file. Prefer archival over hard delete. Data owner: the single local user; no `user_id` column yet (add via migration + repository filter if multi-user is ever needed).

## E. API documentation

Conventions **[IMPLEMENTED]**: JSON over REST under `/api`. Errors always `{ "error": { "code": string, "message": string, "issues"?: [...] } }`. Codes so far: `validation_error` (400, Zod issues), `not_found` (404), `internal_error` (500; message is generic, no stack trace). Request bodies capped at 1 MB. CORS limited to `WEB_ORIGIN`. Server binds to `127.0.0.1` by default.

| Endpoint | Status | Response |
|---|---|---|
| `GET /api/health` | **IMPLEMENTED** | `{ status: "ok", migrations: number, ai: { available: boolean, reason?: string } }` |
| Resources CRUD, tags, search | PLANNED (M2) | validated with `createResourceSchema` in `packages/shared` |
| AI chat, providers config | PLANNED (M3) | |
| Retrieval / semantic search | PLANNED (M4) | |
| Planner (`/api/planner/*`) | PLANNED (M5) | |
| Export / delete all data | PLANNED (M6) | |

Validation: Zod schemas live in `packages/shared/src`. `createResourceSchema` requires only `title` (type defaults to `task`).

## F. UI/UX context

- **Philosophy:** calm, polished SaaS look. Avoid generic AI aesthetics: no purple-blue gradients, dominant violet, glassmorphism, glows, emojis as icons, over-rounded cards, excessive animation or dashboard clutter. Progressive disclosure.
- **Palette source:** `#FDE8E9`, `#1B1F3B`, `#B14AED`, `#C874D9`, `#E1BBC9`. Pink + navy = identity. Violet = sparing accent only.
- **Contrast findings:** `#B14AED` fails AA as small text and as a text-bearing button fill (~4.1:1 with white). So primary buttons are navy (light) / pink (dark), and violet text uses `--accent-text`. `#85838D` is below AA, so `--text-subtle` is for placeholders/disabled only; body secondary text uses `--text-muted`.
- **Tokens** (`apps/web/src/styles/tokens.css`; Tailwind maps them in `tailwind.config.js`):

| Token | Light | Dark |
|---|---|---|
| bg | `#FFFDFC` | `#14172A` |
| surface | `#FFFFFF` | `#1B1F3B` |
| surface-muted | `#F5F3F2` | `#232850` |
| sidebar | `#FDE8E9` | `#10132A` |
| border / border-strong | `#ECD9DE` / `#E1BBC9` | `#2C3158` / `#3D4373` |
| text / text-muted / text-subtle | `#1B1F3B` / `#5F5D6E` / `#85838D` | `#FDE8E9` / `#B1AEC4` / `#7D7A94` |
| primary / on-primary | `#1B1F3B` / `#FDE8E9` | `#FDE8E9` / `#1B1F3B` |
| accent / accent-soft | `#B14AED` / `#C874D9` | `#C874D9` / `#B14AED` |
| accent-text / accent-wash | `#8A22C9` / `#F6E9FC` | `#DBA3EA` / `#2D2150` |
| success / warning / danger | `#2B7A57` / `#8F5400` / `#B3261E` | `#6FCF9F` / `#F0B35A` / `#FF9A92` |

- **Theme logic** (`lib/theme.ts`): modes `system|light|dark`, stored under `nayanote-theme`, applied as `.dark` on `<html>`, set before first paint by an inline script in `index.html`, follows OS changes in system mode.
- **Typography:** Manrope variable; base 15px / 1.55.
- **Icons:** Font Awesome Free solid only, registered in `lib/icons.ts` and rendered via `components/ui/Icon.tsx`. Add new icons to the registry, not ad hoc imports. Attribution (CC BY 4.0) is in README.
- **Layout:** desktop 256px sidebar; below `lg` a top bar with a drawer. Nav order: Dashboard, Inbox, Today, Upcoming, All tasks, Projects, Notes, Knowledge base, AI assistant, Settings.
- **Components** (`components/ui`): `Button`, `IconButton` (requires `label`), `Input` (requires `label`), `Card`, `Badge`, `Spinner`, `EmptyState`, `Icon`. Layout in `components/layout`. Features will live in `src/features/` and pages in `src/routes/`. A `Dialog` is deliberately deferred until M2 needs it.
- **Honesty rule:** unbuilt pages render `Placeholder` ("Not built yet: arrives in Milestone N"). No fake data presented as real.

## G. AI and RAG context

**All [PLANNED].** Fixed design decisions from the owner's brief:

- Providers: Groq (preferred), Hugging Face, optional Ollama; provider abstraction; env-var keys; timeouts, retries, rate-limit handling; graceful degradation when AI is unavailable.
- Assistant must retrieve from the DB before answering about personal data, must not invent tasks/deadlines, must separate retrieved facts / its own recommendations / missing info, and must ask for confirmation before any write action. The LLM never runs SQL; it proposes structured actions executed by validated backend functions.
- Retrieval: structured queries for exact facts; RAG (FTS5 + vector + metadata) for notes/ideas/context; show source resources; say so when nothing relevant is found.
- Planner: deterministic transparent ranking (deadline urgency, priority, importance, estimated duration, energy, available time, overdue, dependencies, project goals, postponement count); recommend few tasks; time blocks and breaks; skip blocked tasks; dismiss/defer; never guilt. Includes a "Just give me one thing to start with" interaction.
- Known limitations: none to report yet.

## H. Development status

- **Current milestone:** 1 (Foundation) **complete**; next is Milestone 2 (Core Productivity).
- **Completed (M1):** monorepo; API skeleton with migrations and health route; SQLite schema 001; shared Zod resource schema; design tokens, light/dark/system theme; app shell with responsive navigation; base UI components; Settings theme switcher; Dashboard system-status card wired to the real API.
- **Verified:** `npm run typecheck` clean; 49 tests passing (shared 4, API 6, web 39); `npm run build` succeeds; API and web boot and `/api/health` works directly and via the Vite proxy; `npm audit --omit=dev` reports 0 vulnerabilities.
- **Not verified:** the UI has not been viewed in a real browser or on a phone-width viewport (no browser access in the build environment). Do a visual pass of both themes and the mobile drawer.
- **In progress:** none. **Pending:** M2 to M6 (see README roadmap).
- **Known bugs:** none known.
- **Technical debt / notes:** `better-sqlite3` is a native module (prebuilt binaries cover mainstream platforms). API runs via `tsx` rather than compiled output. Dashboard text "1 migration applied" is pluralized naively; fix when more migrations exist. A pre-existing `.env` is optional; Node's `--env-file-if-exists` is used.

## I. Instructions for future AI agents

1. **Read this file before changing code**, and check the actual repository; verify existing code before proposing replacements.
2. Preserve the architecture (routes -> services -> repositories; SQL only in repositories) unless a justified improvement is needed; explain it and update this file.
3. Do not duplicate existing functionality; reuse `components/ui`, `lib/icons.ts`, `packages/shared` schemas.
4. Follow existing naming and structure conventions.
5. **Never silently introduce paid dependencies or services.** Never add a silent fallback to a paid endpoint. Keep AI optional.
6. Never remove existing functionality without the owner's approval.
7. Icons: Font Awesome Free only. Colors: tokens only, no raw hex in components. Run the token contrast test after palette edits.
8. Do not edit applied migrations. Add new numbered ones.
9. Do not claim a feature is complete unless it is implemented and tested. Do not present mock data as real.
10. Work milestone by milestone. At the end of each: verify, run tests, fix errors, update README.md and CONTEXT.md, list outstanding issues, explain what was implemented.
11. When a requirement is ambiguous and the decision is hard to reverse, ask the owner; otherwise pick the simplest maintainable zero-cost option.
12. Update this file as decisions are made, not at the end.
