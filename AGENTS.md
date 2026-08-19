# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Pumdoki is an adult creator platform (subscriptions, paid content, creator services/bookings, real-time messaging, prepaid "Veso" credits, and a collectible "Oasis/Drimy" retention game). The repo is an npm-workspaces monorepo: a **React frontend prototype** in `apps/web`, an independently buildable private operations shell in `apps/admin`, a TypeScript Express API in `apps/api`, shared Zod schemas in `packages/contracts`, and Prisma + PostgreSQL in `packages/database`. Phase 3 is published and CI-verified through commit `d55f5f3`. Phase 4 Slice 1 is published and CI-verified as commit `ce6c9e4`: verified members can submit one persisted creator application, versioned prototype acceptances are recorded atomically, and the result remains pending without role promotion or Dashboard access. The publication branch contains a design-recorded, fail-closed, locally verified Phase 4 Slice 2 backend foundation for non-approval review transitions and application-level reviewer evidence; the public API does not mount it, and it is not an operational workflow. Identity collection, counsel-approved policies, production-ready operational authentication/review, payments, media, and other product APIs remain incomplete. `packages/ui` is still empty scaffolding.

Authoritative product/scope docs, read these before non-trivial work:

- `README.md` — product direction, confirmed launch scope, and stable UI requirements (Profile, Store, Veso, Oasis, legal/compliance UI).
- `PLAN.md` — dependency-ordered, 14-phase delivery roadmap with exit criteria and open business/legal decisions.
- `docs/architecture/` — durable slice designs, implementation records, and architecture decisions, including the Phase 3 Settings records and the Phase 4 creator-application foundation.
- `docs/product/Pumdoki_MasterTracker_V4.xlsx` — operational checklist ("master tracker").

## Commands

All commands run from the repo root and delegate to the `@pumdoki/web` workspace:

```bash
npm install        # install all workspaces (Node >= 24.19.0; see .nvmrc)
npm run dev        # vite dev server for the web app
npm run dev:e2e:web # vite bound explicitly to 127.0.0.1 for local full-stack review
npm run dev:admin  # private operations shell on 127.0.0.1:5174
npm run build      # production build of the web app
npm run build:admin # independent operations-app production build
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

`npm run db:up` starts PostgreSQL and Mailpit. Mailpit accepts SMTP on `:1025`
and exposes its local inbox on `http://localhost:8025`. Mail settings come from
the root environment: `MAIL_TRANSPORT` (`console` or `smtp`), `SMTP_HOST`,
`SMTP_PORT`, and `MAIL_FROM`. The local setup uses reserved `.example`
addresses; no production email provider has been selected.

For this Windows workstation's full-stack manual review, use `127.0.0.1`
consistently: set `VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1` in both the
ignored root `.env` and `apps/web/.env.local`, set
`WEB_ORIGIN=http://127.0.0.1:5173` in the root `.env`, run `npm run dev:api` in
one terminal, and run `npm run dev:e2e:web` in another. See `HANDOFF.md` for
the complete prepare/start/stop sequence and seeded accounts.

Quality tooling (root): `npm run lint` (ESLint flat config; the JS prototype is pragmatic — noisy rules are warnings, `rules-of-hooks` is an error — while `apps/api` and `packages/*` TypeScript is linted with typescript-eslint recommended and unused-vars as errors), `npm run format`/`format:check` (Prettier), `npm run test` (Vitest + Testing Library in `apps/web`), `npm run test:api` (Vitest + Supertest in `apps/api`), `npm run test:e2e` (Playwright against the real API/PostgreSQL/Mailpit stack; run `npm run db:up`, migrations, and seed first, plus `npx playwright install` once). CI lives in `.github/workflows/ci.yml` (lint + unit test + build, an API job with a Postgres service that deploys migrations, seeds, tests, and builds the backend, plus a Playwright job with PostgreSQL and Mailpit services). Backend TypeScript is typechecked by its `tsc` builds; the JS frontend still has **no typecheck**.

## Architecture

Backend foundation (all TypeScript, ESM, strict; base tsconfig in `packages/config/tsconfig.base.json` — note each package declares its own `outDir`/`rootDir` because relative paths in an extended tsconfig resolve against the base file):

- `apps/api/src` — Express 5 API. `createApp()` in `app.ts` is a dependency-injected factory (env, logger, database, mailer, `checkDatabase`, version); `server.ts` wires real Prisma and the configured mail transport. Middleware: request IDs, pino-http logging, helmet, strict-origin credentialed CORS, JSON limits, and global rate limiting. Every non-2xx response uses `{ error: { code, message, requestId, details? } }`. `validate()` parses Zod contracts into `req.validated`. Endpoints: health/readiness; register, login, logout/logout-all, `/me`; email-verification/password-reset request and confirm; authenticated preference reads/updates; profile, email, and password changes; active-session listing/revocation; and member creator-application read/submit.
- `apps/api/src/auth` + `middleware/auth.ts` — Argon2id password hashing, dev-scrypt compatibility/upgrade, opaque 32-byte session and verification tokens with SHA-256 hashes at rest, secure HttpOnly SameSite cookies, 30-day sliding session expiry renewed at most daily, runtime suspension/ban checks, role and verified-email gates, and bounded instance-local login/email-request throttling. Redis-backed multi-instance throttling remains deferred.
- `apps/api/src/mail` — provider-neutral mailer interface, pure verification/reset templates, console and Nodemailer SMTP transports, and an in-memory test transport. Sends happen after database work and failures are logged without converting successful registration/reset requests into transport errors.
- `packages/contracts` — Zod schemas shared by the API and browser integration (error envelope, health/ready, user, auth, Settings, and creator applications). Build before the API (`npm run build:api` handles ordering).
- `packages/database` — Prisma 7 with the `prisma-client` generator and `@prisma/adapter-pg`. Models: `User`, `Session`, append-only `AcceptanceRecord`, transient `VerificationToken`, one-to-one `UserPreference`, and one-to-one `CreatorApplication`. Acceptance evidence and creator applications use restrictive deletion; account deletion must not cascade legal evidence. Session and verification credentials store only hashes plus lifecycle metadata. Explicit content defaults hidden. `src/seed.ts` is idempotent; seed scrypt hashes upgrade to Argon2id after successful login. **Prisma 7's CLI blocks AI-invoked `migrate reset`**; use an isolated temporary database or recreate the Docker volume (`docker compose down -v && npm run db:up && npm run db:deploy`) instead.

The frontend code lives in `apps/web/src`:

- `App.jsx` — root. **Uses React Router (`BrowserRouter`).** `AuthProvider` restores the HttpOnly-cookie session through `/me`. Routes are organized into public/auth, member, creator, and legal groups. The older `useNav` adapter remains for specialized pages that still expose callback navigation. Shared-shell pages navigate directly with React Router. Routes are wrapped in an `ErrorBoundary`; member/creator routes use the real `ProtectedRoute` state and uppercase API roles. Creator Dashboard navigation is visible only to `CREATOR` accounts. The public app intentionally has no `/admin` route. `userStatus` is lifted so it persists across routes.
- `auth/` — auth API adapter, canonical roles and policy versions, `AuthProvider` state machine, and hooks. The API remains the identity source of truth; no auth token is stored in browser storage.
- `pages/` — one component per screen (Home, Profile, Store, Connect, Wallet, Promotions, CreatorDashboard, Oasis, Settings, Login, SignUp, ForgotPassword, ResetPassword, VerifyEmail, LegalHub, CreatorOnboarding). Settings is protected and uses real APIs for display name, email/reverification, password, active sessions, and the explicit-content preference. Creator onboarding now uses the real application API, requests no identity files, persists a pending outcome, and never promotes or redirects a member to Dashboard. Several prototype pages remain large, but backend-bound sample content is imported from `fixtures/` rather than being declared inside page components.
- `components/` — shared widgets and foundation primitives. `MemberLayout` is the shared shell for Home, Profile, Store, Connect, and Promotions; it composes `AppHeader`, Sidebar/mobile navigation, and ChatSidebar. Specialized feature areas such as Wallet, Oasis, and Creator Dashboard intentionally retain their own layouts. `ErrorBoundary`, `ProtectedRoute`, and `StateViews` provide failure, authorization, loading, empty, and retry seams.
- `lib/` — `env.js` (validated `import.meta.env` access), `apiClient.js` (fetch wrapper: base URL, credentials, nested error envelopes, request IDs, typed errors, and global later-`401` notification), and `useSimulatedFetch.js` (temporary async-state seam for prototype pages until real API calls replace it).
- `fixtures/` — development-only sample content for public, social, Wallet, Oasis, and Creator Dashboard pages. These files are the replacement boundary for future `/api/v1` responses.
- `utils/` — small pure helpers (e.g. `sortMomentRail.js`).
- `test/setup.js` — Vitest setup (jest-dom). Tests are colocated as `*.test.{js,jsx}`.

The backend retains `ADMIN` for API authorization. `apps/admin` is an
independently buildable private shell, not a public product route. Its Phase 11
moderation/operations workflows remain unimplemented and must not be deployed
until operational MFA/SSO, restricted hosting, API permissions, and audit
controls are in place.

Conventions:

- Prototype content comes from `fixtures/`; media is loaded from external demo URLs. Page-local display configuration and interactive local state remain in components. Authentication uses the real API; financial buttons and most product-domain data remain simulated.
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

The monorepo migration is committed: work against `apps/web` and `apps/api`, never old top-level paths. Phase 2 is **partially complete (local foundation)** — staging deploy, RDS, backups, Sentry, job queue, and idempotency remain deferred. Phase 3 is published and CI-verified through `d55f5f3`. Phase 4 Slice 1 is published and CI-verified as `ce6c9e4`; the current Slice 2 review foundation is committed on `codex/phase4-slice2-and-ux` as `1ba32ea` and fully locally verified, but production activation remains blocked on the separately documented operations controls. Notifications, theme, billing, export/deletion, identity-provider integration, production-ready operational creator review, and server-side content-query enforcement remain deliberately sequenced to their dependency phases. See `HANDOFF.md` for exact commands, counts, and publication status.
