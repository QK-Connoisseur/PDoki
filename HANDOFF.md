# Session Handoff

Last updated: 2026-07-06 · Branch: `dev`

## Current phase

**Phase 2 is partially complete — the local backend foundation is done and
verified.** Per PLAN.md's phase completion verification rule, Phase 2 must NOT
be described as complete: the cloud-dependent tasks (staging API + RDS,
automated backups + restore drill, Sentry/error tracking, background-job
queue, idempotency framework) are deferred because they require AWS/Sentry
accounts and founder decisions. Everything that can be built and verified
locally has been.

Phase 1 (repository & frontend foundation) was committed as `219bfac` and
pushed at the start of this session; GitHub CI validated it.

## Decisions locked this session (founder-confirmed)

- **Stack (PLAN §3.1 gate): Node.js + TypeScript + Express + PostgreSQL +
  Prisma — confirmed.** (Express resolved to v5, Prisma to v7, Zod to v4,
  TypeScript to v6 at install time.)
- **Local Postgres runs via Docker Compose** (root `docker-compose.yml`,
  `postgres:17-alpine`, credentials matching `.env.example`). This closes the
  open question carried since Phase 1.
- **This session targeted the local foundation only** (HANDOFF "next exact
  task" steps 1–4); cloud items deferred, phase labeled partially complete.

## What was built

- **`docker-compose.yml`** — Postgres 17 with healthcheck and named volume.
  Root scripts: `db:up` / `db:down`.
- **`.env.example`** — API vars now active (PORT, WEB*ORIGIN, DATABASE_URL,
  LOG_LEVEL, RATE_LIMIT*\*). Copy to `.env` locally (never committed).
- **`packages/config`** — shared `tsconfig.base.json` (strict, NodeNext,
  ES2022, ESM). Each package declares its own `outDir`/`rootDir` because
  relative paths in an extended tsconfig resolve against the base file.
- **`packages/contracts`** — Zod v4 schemas + types: `ApiErrorSchema`
  (envelope `{ error: { code, message, requestId, details? } }` with a closed
  code enum), `HealthResponseSchema`, `ReadyResponseSchema`, `UserSchema`,
  `RegisterRequestSchema`, `LoginRequestSchema`, `SessionSchema`. 7 unit
  tests. Builds to `dist/` consumed by the API.
- **`packages/database`** — Prisma **7** (new `prisma-client` generator,
  ESM, client generated into `src/generated/` and gitignored;
  `@prisma/adapter-pg` driver adapter, required in v7). `prisma.config.ts`
  loads `DATABASE_URL` from the root `.env` via dotenv; all CLI use goes
  through root `db:*` scripts. Models: `User` (UserRole/UserStatus enums,
  unique email, passwordHash, timestamps) and `Session` (tokenHash unique,
  expiresAt, revokedAt, cascade delete). Init migration
  `20260706204710_init`. Idempotent seed creates four `.example` users
  (admin/moderator/creator/member) with dev-only scrypt hashes (Phase 3
  replaces with argon2id).
- **`apps/api`** — TypeScript Express 5 service:
  - `env.ts` — Zod-validated environment (`loadEnv` throws on bad config).
  - `app.ts` — dependency-injected `createApp({ env, logger, checkDatabase,
version })`: request IDs (echo valid incoming `x-request-id`, else UUID),
    pino-http structured logging (auth/cookie headers redacted), helmet, CORS
    (WEB_ORIGIN + credentials), 100 kB JSON limit, global rate limit
    returning the `RATE_LIMITED` envelope.
  - `routes/health.ts` + `routes/ready.ts` — `/api/v1/health` and
    `/api/v1/ready` (503 `degraded` when the injected DB check fails).
  - `middleware/validate.ts` — Zod request validation into `req.validated`
    (Express 5 request props are getter-only), `BAD_REQUEST` envelope with
    issue details on failure.
  - `errors.ts`/`middleware/errorHandler.ts` — `HttpError` + consistent
    envelope; unhandled errors log and return `INTERNAL` without leaking.
  - `db.ts`/`server.ts` — real Prisma `SELECT 1` readiness check, graceful
    SIGINT/SIGTERM shutdown. 15 Vitest + Supertest tests, DB stubbed.
- **Root scripts** — `dev:api`, `build:contracts`, `build:database`,
  `build:api` (ordered: contracts → prisma generate → database → api),
  `test:api`, `db:generate/migrate/deploy/seed/studio`.
- **Lint/CI** — typescript-eslint recommended on `apps/api` + `packages/*`
  (unused vars are errors; generated Prisma client ignored). New CI job
  `API build & test` with a Postgres 17 service: `npm ci` → `build:api` →
  `db:deploy` → seed → `test:api`.

## Exact commands run (final pass, repo root)

| Command                              | Result                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `npm run lint`                       | ✅ exit 0 — 0 errors, 0 warnings (now includes TS workspaces)                      |
| `npm run test` (web)                 | ✅ 12/12 unit tests (3 files)                                                      |
| `npm run test:api`                   | ✅ 15/15 tests (4 files: env, app, ready, validate)                                |
| `npm run test -w @pumdoki/contracts` | ✅ 7/7 tests                                                                       |
| `npm run build` (web)                | ✅ built (index js 768.76 kB, gzip 185.85 kB; known >500 kB advisory)              |
| `npm run build:api`                  | ✅ contracts + database (incl. prisma generate) + api all compile                  |
| `npm run test:e2e`                   | ✅ 27/27 Playwright tests (chromium)                                               |
| Migration repeatability              | ✅ fresh volume (`docker compose down -v` → `up`) + `db:deploy` re-applied cleanly |
| `npm run db:seed` (twice)            | ✅ idempotent — "Users in database: 4" both runs                                   |

Live manual verification (dev server + Docker Postgres):

- `GET /api/v1/health` → 200 `{"status":"ok","uptimeSeconds":…,"version":"0.1.0"}` with `x-request-id` header.
- `GET /api/v1/ready` → 200 `{"status":"ready","checks":{"database":"up"}}`.
- `GET /api/v1/nope` → 404 `NOT_FOUND` envelope with requestId.
- `docker compose stop db` → ready returned 503 `degraded`/`down`; `start db` → recovered to 200 without restart.

## Risks & open decisions (carried forward)

- **Prisma 7 guardrail:** the CLI refuses AI-invoked `prisma migrate reset`.
  Equivalent dev-db reset: `docker compose down -v && npm run db:up && npm run db:deploy && npm run db:seed`.
- **`tsx watch` (dev:api) needs an interactive terminal** — it did not start
  when spawned detached in this session. Fine for human use; anything
  automated should use `build:api` + `start`.
- **Deferred Phase 2 items** (need founder accounts/decisions): staging API +
  RDS deploy, automated backups + tested restore, Sentry (or equivalent),
  background-job queue (likely adds Redis), idempotency framework.
- **Master tracker** (`docs/product/Pumdoki_MasterTracker_V4.xlsx`) has NOT
  been updated with Phase 2 rows this session — flagged for founder review.
- **Production deep-link rewrite still needed** for BrowserRouter (host must
  fall back to `index.html`; future `infra/cloudflare` config).
- `?state=` override in `useSimulatedFetch` remains a dev/E2E affordance
  until pages switch to real `apiClient` calls.
- CI does not gate on `format:check` (would force reformatting the prototype).
- Seed password hashing is dev-only scrypt; Phase 3 must introduce the real
  auth hashing (argon2id) and never reuse the seed helper.

## Next exact task

Two options, founder's call:

1. **Finish Phase 2 remainder** — needs AWS account decisions (staging
   API + RDS, backups) and a Sentry account; job queue + idempotency
   framework can be built locally once a Redis decision is made.
2. **Proceed to Phase 3 (auth, roles, settings) on the local stack** —
   registration, password hashing, sessions (the `Session` model and auth
   contracts from this session are the starting point), email verification
   (needs the PLAN §3.4 mail-capture tool locally), and the explicit-content
   preference gate. The PLAN §3.2 decision gate (Google OAuth in beta scope?)
   remains open but does not block email/password work.
