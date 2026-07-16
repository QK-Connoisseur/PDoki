# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pumdoki is an adult creator platform (subscriptions, paid content, creator services/bookings, real-time messaging, prepaid "Veso" credits, and a collectible "Oasis/Drimy" retention game). The repo is an npm-workspaces monorepo: a **React frontend prototype** in `apps/web` plus a TypeScript Express API in `apps/api`, shared Zod schemas in `packages/contracts`, and Prisma + PostgreSQL in `packages/database`. The Phase 3 core-auth backend slice is implemented; email verification, password reset, frontend auth integration, Settings, payments, media, and other product APIs remain incomplete. `packages/ui` is still empty scaffolding.

Authoritative product/scope docs, read these before non-trivial work:

- `README.md` — product direction, confirmed launch scope, and stable UI requirements (Profile, Store, Veso, Oasis, legal/compliance UI).
- `PLAN.md` — dependency-ordered, 14-phase delivery roadmap with exit criteria and open business/legal decisions.
- `docs/product/Pumdoki_MasterTracker_V4.xlsx` — operational checklist ("master tracker").

## Commands

All commands run from the repo root and delegate to the `@pumdoki/web` workspace:

```bash
npm install        # install all workspaces (Node >= 20.19 required)
npm run dev        # vite dev server for the web app
npm run build      # production build of the web app
npm run preview    # preview the production build
```

Backend/API (Phase 2 foundation; requires a root `.env` copied from `.env.example`):

```bash
npm run db:up      # start local Postgres 17 via Docker Compose (Docker Desktop required)
npm run db:migrate # prisma migrate dev (root .env supplies DATABASE_URL)
npm run db:deploy  # apply committed migrations (used by CI and clean environments)
npm run db:seed    # idempotent dev seed (four .example users)
npm run dev:api    # tsx watch server on :3000 (interactive terminal only)
npm run build:api  # builds contracts -> database (incl. prisma generate) -> api
npm run test:api   # Vitest + Supertest; auth suites require db:up + current migrations
```

Quality tooling (root): `npm run lint` (ESLint flat config; the JS prototype is pragmatic — noisy rules are warnings, `rules-of-hooks` is an error — while `apps/api` and `packages/*` TypeScript is linted with typescript-eslint recommended and unused-vars as errors), `npm run format`/`format:check` (Prettier), `npm run test` (Vitest + Testing Library in `apps/web`), `npm run test:api` (Vitest + Supertest in `apps/api`), `npm run test:e2e` (Playwright; run `npx playwright install` once first). CI lives in `.github/workflows/ci.yml` (lint + unit test + build, an API job with a Postgres service that deploys migrations, seeds, tests, and builds the backend, plus a Playwright job). Backend TypeScript is typechecked by its `tsc` builds; the JS frontend still has **no typecheck**.

## Architecture

Backend foundation (all TypeScript, ESM, strict; base tsconfig in `packages/config/tsconfig.base.json` — note each package declares its own `outDir`/`rootDir` because relative paths in an extended tsconfig resolve against the base file):

- `apps/api/src` — Express 5 API. `createApp()` in `app.ts` is a dependency-injected factory (env, logger, database, `checkDatabase`, version); `server.ts` wires real Prisma. Middleware: request IDs, pino-http logging, helmet, strict-origin credentialed CORS, JSON limits, and global rate limiting. Every non-2xx response uses `{ error: { code, message, requestId, details? } }`. `validate()` parses Zod contracts into `req.validated`. Endpoints: health/readiness plus `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/logout-all`, and `GET /api/v1/me`.
- `apps/api/src/auth` + `middleware/auth.ts` — Argon2id password hashing, dev-scrypt compatibility/upgrade, opaque 32-byte session tokens with SHA-256 hashes at rest, secure HttpOnly SameSite cookies, 30-day sliding expiry renewed at most daily, runtime suspension/ban checks, role gates, and bounded instance-local login throttling. Redis-backed multi-instance throttling remains deferred.
- `packages/contracts` — Zod schemas shared between API and future frontend integration (error envelope, health/ready, user, auth). Build before the API (`npm run build:api` handles ordering).
- `packages/database` — Prisma 7 with the `prisma-client` generator and `@prisma/adapter-pg`. Models: `User`, `Session`, and append-only `AcceptanceRecord`. Acceptance evidence uses restrictive deletion; account deletion must not cascade it. Sessions store only token hashes plus expiry/revocation/IP/user-agent metadata. `src/seed.ts` is idempotent; seed scrypt hashes upgrade to Argon2id after successful login. **Prisma 7's CLI blocks AI-invoked `migrate reset`**; recreate the Docker volume (`docker compose down -v && npm run db:up && npm run db:deploy`) instead.

The frontend code lives in `apps/web/src`:

- `App.jsx` — root. **Uses React Router (`BrowserRouter`).** Routes are organized into public/auth, member, creator, admin, and legal groups. The older `useNav` adapter remains for specialized pages that still expose callback navigation. Shared-shell pages navigate directly with React Router. Routes are wrapped in an `ErrorBoundary`; member/creator/admin routes use `ProtectedRoute` (currently a transparent seam until real auth exists). `userStatus` is lifted so it persists across routes.
- `pages/` — one component per screen (Home, Profile, Store, Connect, Wallet, Promotions, CreatorDashboard, Oasis, Login, SignUp, LegalHub, CreatorOnboarding). Several prototype pages remain large, but backend-bound sample content is imported from `fixtures/` rather than being declared inside page components.
- `components/` — shared widgets and foundation primitives. `MemberLayout` is the shared shell for Home, Profile, Store, Connect, and Promotions; it composes `AppHeader`, Sidebar/mobile navigation, and ChatSidebar. Specialized feature areas such as Wallet, Oasis, and Creator Dashboard intentionally retain their own layouts. `ErrorBoundary`, `ProtectedRoute`, and `StateViews` provide failure, authorization, loading, empty, and retry seams.
- `lib/` — `env.js` (validated `import.meta.env` access), `apiClient.js` (fetch wrapper: base URL, credentials, request IDs, typed errors, 401 handling), and `useSimulatedFetch.js` (temporary async-state seam for prototype pages until real API calls replace it).
- `fixtures/` — development-only sample content for public, social, Wallet, Oasis, and Creator Dashboard pages. These files are the replacement boundary for future `/api/v1` responses.
- `utils/` — small pure helpers (e.g. `sortMomentRail.js`).
- `test/setup.js` — Vitest setup (jest-dom). Tests are colocated as `*.test.{js,jsx}`.

Conventions:

- Prototype content comes from `fixtures/`; media is loaded from external demo URLs. Page-local display configuration and interactive local state remain in components. Frontend auth and all financial buttons are still simulated; the new backend auth endpoints persist independently until Phase 3 frontend integration.
- Styling is **Tailwind CSS v4** via `@tailwindcss/vite` (config-less; `@import "tailwindcss"` in `index.css`). Custom keyframe animations are hand-written in `index.css`. Visual identity is sakura-pink/pearl/off-white with rounded "premium" surfaces; Dark Knight is a planned second theme.
- Plain JavaScript + JSX (no TypeScript in the frontend). PLAN.md mandates **TypeScript for all new backend/shared-contract code**, converting frontend files only when touched for backend integration.

## Domain rules that affect implementation

These are product invariants, not suggestions — violating them is a correctness bug:

- **Veso** is prepaid credit (1 Veso = 1 USD). Member Veso balances and creator payable earnings are **separate ledgers**; never model a balance as a directly-editable number — it must be an append-only transaction ledger. Store, Connect, and Send Love (tipping) spend Veso.
- **Explicit content is hidden by default**; adult members opt in. This is distinct from age verification.
- **Oasis** progress, inventory, cooldowns, rewards, and purchases must be **server-authoritative** when the backend exists; the client never sets XP/Orbs/stage/inventory directly.
- **Server-side entitlement checks** gate protected media; protected/original media URLs must never appear in public feed payloads.

## Compliance constraints on the prototype

- Legal copy in the frontend is **placeholder, not counsel-approved**. Do not present it as final.
- Use reserved sample addresses (e.g. `support@pumdoki.example`) — never invent real contact details, and never claim that encryption, moderation vendors, response times, or compliance processes exist until they actually do.
- Never commit secrets, identity documents, processor credentials, or real `.env` files.
- Acceptance records are legal/compliance evidence: append new versions, never edit existing records, and never cascade-delete them with a user. Counsel must approve retention and pseudonymization rules before account deletion ships.
- Do not commit temporary implementation-prompt Markdown files (the previous prompt-heavy `.agents`/AI-folder approach was deliberately rejected — product decisions belong in README/PLAN/tracker/docs).

## Repository state note

The monorepo migration is committed: work against `apps/web` and `apps/api`, never old top-level paths. Phase 2 is **partially complete (local foundation)** — staging deploy, RDS, backups, Sentry, job queue, and idempotency remain deferred. Phase 3 slice 1 (core auth backend) is locally implemented and verified; slices 2–4 remain. See `HANDOFF.md` for exact commands, counts, and publication status.
