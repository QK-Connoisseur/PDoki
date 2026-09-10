# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pumdoki is an adult creator platform with subscriptions/paid content, creator
discovery through Connect, real-time chat and tipping. Prepaid Veso payments
are deferred beyond beta by the September 9 founder decision. Connect
discovery, real-time chat and tipping remain launch requirements; the beta
payment model is unresolved.
The original Oasis/Drimy game was cancelled September 6, 2026; a possible later
streak/adult-language-learning concept is not a launch requirement. The repo is
an npm-workspaces monorepo: React prototype `apps/web`, disabled private shell
`apps/admin`, TypeScript Express API `apps/api`, Zod `packages/contracts`, and
Prisma/PostgreSQL `packages/database`. Authentication, Settings and pending
creator applications are real; payments, content/media, messaging, operations
and production infrastructure remain incomplete.

Phase 3 is published through `d55f5f3`; Phase 4 Slices 1–4 have published
source. Slice 3 merged in PR #15 (`24e1653`). Slice 4's reviewed head `25057bd`
(PR #17) was merged through consolidation `56cb0ad` on September 6, together
with local notifications and the static themes already in dev. All three
combined CI jobs passed in run `34026349075`. See HANDOFF.md for publication
and verification evidence; read Git refs for current dev/main tips. Cloudflare
remains an unselected candidate, the public API does not mount operations, and
G1–G12 remain NOT EVALUATED. Merging code is not deployment or activation.

The founder needs one active task at a time. Read PLAN.md's current sequential
workflow and do not assign parallel founder workstreams. PLAN.md §20 owns the
active founder step; historical slice records must not restart completed tasks.
At the start of every work session, whenever the active workflow changes, and
in the final response, state the phase (P00–P14), the exact master-tracker task
ID, and a brief plain-language description of the workflow. Confirm the ID from
the current tracker; do not invent one. If work has no assigned phase or ID,
say so explicitly. Keep this orientation short and focus on the one active task.
The business definition has been answered and reviewed. Preserve
provisional ideas without presenting unapproved benefits, prices or capacity
as promises. No extra motion, game, Plus or design expansion is authorized.

September 8: the founder confirms Kiban Digital Holdings LLC is filed through
Northwest and awaiting Maryland approval. September 9: CCBill's initial Sales
reply requires a functioning review site, optionally password protected; model
eligibility, fees and payouts remain open. The founder cancelled the proposed
clarification follow-up and directed work toward a functioning review website.
Prefer DIY, drafts and suitable Fiverr specialists;
use paid legal advice only for necessary, specific issues and substantive
review. Do not restart a broad counsel-first or entity-selection task.

September 10 UI update: prices use plain USD ($); prepaid-credit controls and
member stored balances are removed. Billing replaces the wallet preview, and
`/wallet` redirects to `/billing`. Payments remain unimplemented.

September 10 explicit UI request: **P08 / LEG-MT-080 — Build 'Your Activity'
page** moves from Post-MVP into Phase 8 alongside social actions and Store
account history. `/activity` is a protected UI preview with labeled example
likes, purchases, subscriptions and payments; category/date filters and search
work locally. Shared sidebar/profile-menu links expose it on desktop/mobile.
Status is In Progress / UI Prototype; authenticated history APIs, pagination,
account isolation and content/payment persistence integration remain pending.
Dependencies are P03, P05, P06 and P07. This bounded slice is authorized now
for `dev` only; after it, the pending founder task remains P05 / LEG-MT-088
review of the working local content flow. It does not activate payments or
authorize other design expansion. PLAN.md §12 owns its scope.

September 9 beta-scope update: defer Veso payments because of implementation
complexity and the founder's perceived high risk of CCBill/Epoch flagging the
prepaid-credit model. This is not evidence of a processor rejection or ban.
Veso recharge, balances/spending, promotional credits, transfers and related
ledger/UI/operations work are no longer beta launch gates. Preserve their
deferred design for later scope, processor acceptance and targeted review;
do not cancel other launch features or select a replacement beta checkout by
inference.
Any enabled paid beta still needs its agreed payment model, entitlements,
refund/reconciliation and creator-earnings controls. This decision supersedes
older mandatory-Veso launch statements in other repo instructions and docs.
The local content/R2 milestone remains pending founder review; the bounded
Your Activity UI request above does not close it.

Latest September 9 direction supersedes the earlier paperwork-first sequence:
work one functional product slice at a time, pairing code with its necessary
founder/provider decisions and targeted review. Start from the existing P05
content/access design toward a working test-creator publishing and member-read
flow. Use test accounts and safe sample media; recruitment and polish are not
prerequisites. Review concrete sensitive flows before live use. No provider
purchase, deployment, real identity collection or payment activation is implied.
PLAN.md §9 and §20 own the updated scope and actual implementation status.

The first [local content flow](docs/architecture/phase5-local-content-flow.md)
is now implemented: private safe PNG/JPEG/MP4 uploads, sealed drafts,
publication/removal, and test-member feed/media reads. Both content flags are
off by default; production/remote use is rejected. R2 safe photo/video integration
is verified using bucket-scoped credentials in ignored `.env.r2.local` (0600).
The bucket overview shows Public Access Disabled. Cloud upload/read, private
access, restart persistence, removal and both browser paths passed; generated
objects were cleaned up. Next is founder review of this working local flow.
Credentials belong only in the local file, never chat or commits. Do not restart design-only work
or claim Phase 5, hosted review or production readiness. See HANDOFF for tests
and the isolated review database; preserve the existing development database.

Authoritative product/scope docs, read these before non-trivial work:

- `README.md` — product direction, confirmed launch scope, and stable UI requirements (Profile, Store, billing, Oasis, legal/compliance UI).
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
npm run db:deploy  # apply repository migrations (used by CI and clean environments)
npm run db:seed    # idempotent dev seed (four .example users)
npm run dev:api    # tsx watch server on :3000 (interactive terminal only)
npm run dev:worker # separate local durable worker (requires WORKER_DATABASE_URL)
npm run enqueue:worker-canary -- --idempotency-key local-safe-canary # non-secret local proof
npm run build:api  # builds contracts -> database (incl. prisma generate) -> api
npm run test:api   # Vitest + Supertest; auth suites require db:up + current migrations
```

`npm run db:up` starts PostgreSQL and Mailpit with host ports bound to IPv4
loopback only. PostgreSQL uses `127.0.0.1:5432`; Mailpit accepts SMTP on
`127.0.0.1:1025` and exposes its local inbox on `http://127.0.0.1:8025`. Mail settings come from
the root environment: `MAIL_TRANSPORT` (`console` or `smtp`), `SMTP_HOST`,
`SMTP_PORT`, and `MAIL_FROM`. The local setup uses reserved `.example`
addresses; no production email provider has been selected.

For local full-stack manual review on macOS or Windows, use `127.0.0.1`
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
- `apps/api/src/operations` — dormant assertion, exact DB authorization and request-integrity primitives. Slice 4 adds a synthetic Cloudflare claim-schema candidate and credential-header redaction, with no production import/mount. Real signed hardware-method evidence and provider selection remain absent. Further operations work is parked; see HANDOFF.md.
- `apps/api/src/mail` — provider-neutral mailer interface, pure verification/reset templates, console and Nodemailer SMTP transports, and an in-memory test transport. Sends happen after database work and failures are logged without converting successful registration/reset requests into transport errors.
- `apps/api/src/durableJobs` + `apps/api/src/worker` — published Phase 2 durable-worker foundation. A fixed non-secret canary is enqueued atomically through Prisma, then processed by a separate PostgreSQL worker with opaque lease fencing, bounded retries, terminal states, redacted telemetry, and bounded shutdown. No current product flow uses it. PR #13 merged into `dev` as `6311522`; deployment and product-flow migration remain separately gated.
- `packages/contracts` — Zod schemas shared by the API and browser integration (error envelope, health/ready, user, auth, Settings, and creator applications). Build before the API (`npm run build:api` handles ordering).
- `packages/database` — Prisma 7 with the `prisma-client` generator and `@prisma/adapter-pg`. Models: `User`, `Session`, append-only `AcceptanceRecord`, transient `VerificationToken`, one-to-one `UserPreference`, one-to-one `CreatorApplication`, the published `DurableJob`/worker-canary foundation models, and dormant `OperationsOperator` plus append-only operations-permission grant evidence. Acceptance evidence, creator applications, and operations authorization history use restrictive deletion/immutability rules; account deletion must not cascade legal evidence. Session and verification credentials store only hashes plus lifecycle metadata. Explicit content defaults hidden. `src/seed.ts` is idempotent; seed scrypt hashes upgrade to Argon2id after successful login. The operations models are local/test foundation only and have no mounted production workflow. **Prisma 7's CLI blocks AI-invoked `migrate reset`**; use an isolated temporary database or recreate the Docker volume (`docker compose down -v && npm run db:up && npm run db:deploy`) instead.

The frontend code lives in `apps/web/src`:

- `App.jsx` — root. **Uses React Router (`BrowserRouter`).** `AuthProvider` restores the HttpOnly-cookie session through `/me`. Routes are organized into public/auth, member, creator, and legal groups. The older `useNav` adapter remains for specialized pages that still expose callback navigation. Shared-shell pages navigate directly with React Router. Routes are wrapped in an `ErrorBoundary`; member/creator routes use the real `ProtectedRoute` state and uppercase API roles. Creator Dashboard navigation is visible only to `CREATOR` accounts. The public app intentionally has no `/admin` route. `userStatus` is lifted so it persists across routes.
- `auth/` — auth API adapter, canonical roles and policy versions, `AuthProvider` state machine, and hooks. The API remains the identity source of truth; no auth token is stored in browser storage.
- `pages/` — one component per screen (Home, Profile, Store, Connect, Billing, Promotions, CreatorDashboard, Oasis, Settings, Login, SignUp, ForgotPassword, ResetPassword, VerifyEmail, LegalHub, CreatorOnboarding). Settings is protected and uses real APIs for display name, email/reverification, password, active sessions, and the explicit-content preference. Creator onboarding now uses the real application API, requests no identity files, persists a pending outcome, and never promotes or redirects a member to Dashboard. Several prototype pages remain large, but backend-bound sample content is imported from `fixtures/` rather than being declared inside page components.
- `components/` — shared widgets and foundation primitives. `MemberLayout` is the shared shell for Home, Profile, Store, Connect, and Promotions; it composes `AppHeader`, Sidebar/mobile navigation, and ChatSidebar. Specialized feature areas such as Billing, Oasis, and Creator Dashboard intentionally retain their own layouts. `ErrorBoundary`, `ProtectedRoute`, and `StateViews` provide failure, authorization, loading, empty, and retry seams.
- `lib/` — `env.js` (validated `import.meta.env` access), `apiClient.js` (fetch wrapper: base URL, credentials, nested error envelopes, request IDs, typed errors, and global later-`401` notification), and `useSimulatedFetch.js` (temporary async-state seam for prototype pages until real API calls replace it).
- `fixtures/` — development-only sample content for public, social, Billing, Oasis, and Creator Dashboard pages. These files are the replacement boundary for future `/api/v1` responses.
- `utils/` — small pure helpers (e.g. `sortMomentRail.js`).
- `test/setup.js` — Vitest setup (jest-dom). Tests are colocated as `*.test.{js,jsx}`.

The backend retains `ADMIN` for API authorization. `apps/admin` is an
independently buildable private shell, not a public product route. Its Phase 11
moderation/operations workflows remain unimplemented and must not be deployed
until operational MFA/SSO, restricted hosting, API permissions, and audit
controls are in place.

Conventions:

- Prototype content comes from `fixtures/`; media is loaded from external demo URLs. Page-local display configuration and interactive local state remain in components. Authentication uses the real API; financial buttons and most product-domain data remain simulated.
- Styling is **Tailwind CSS v4** via `@tailwindcss/vite` (config-less; `@import "tailwindcss"` in `index.css`). Custom keyframe animations are hand-written in `index.css`. Visual identity is Sakura Kiss (sakura-pink/pearl/off-white) with rounded "premium" surfaces; Midnight City is the blue second theme. Theme selection is browser-local. Both backgrounds are static desktop/mobile JPGs; background motion controls, overlays, and videos are removed and must not be reintroduced without a separately approved, professionally reviewed implementation.
- Plain JavaScript + JSX (no TypeScript in the frontend). PLAN.md mandates **TypeScript for all new backend/shared-contract code**, converting frontend files only when touched for backend integration.

## Domain rules that affect implementation

These are product invariants, not suggestions — violating them is a correctness bug:

- **Veso is deferred beyond beta.** If later approved, it remains prepaid credit (1 Veso = 1 USD), with member credits and creator payable earnings in **separate append-only ledgers**, never directly editable balances. Veso-funded Store/service purchases and Send Love are deferred, not beta requirements. Do not infer that a replacement beta payment method is approved.
- **Explicit content is hidden by default**; adult members opt in. This is distinct from age verification.
- The old Oasis/Drimy game is cancelled. Do not extend its client-side prototype. Any later streak/reward system must have server-authoritative progress and separately approved scope.
- **Server-side entitlement checks** gate protected media; protected/original media URLs must never appear in public feed payloads.

## Compliance constraints on the prototype

- Legal copy in the frontend is **placeholder, not counsel-approved**. Do not present it as final.
- Use reserved sample addresses (e.g. `support@pumdoki.example`) — never invent real contact details, and never claim that encryption, moderation vendors, response times, or compliance processes exist until they actually do.
- Never commit secrets, identity documents, processor credentials, or real `.env` files.
- Acceptance records are legal/compliance evidence: append new versions, never edit existing records, and never cascade-delete them with a user. Counsel must approve retention and pseudonymization rules before account deletion ships.
- Do not commit temporary implementation-prompt Markdown files (the previous prompt-heavy `.agents`/AI-folder approach was deliberately rejected — product decisions belong in README/PLAN/tracker/docs).

## Repository state note

Work against apps/web and apps/api, never the obsolete top-level src paths.
HANDOFF.md is the current publication and verification checkpoint; Git/CI
evidence outranks stale historical next-task prose. Phase 2 is partial and its
published worker serves only a non-secret canary. Phase 4 remains a dormant
foundation, not an operating approval/identity/moderation workflow. Retain all
actual legal, payment, sensitive-data and activation controls. Do not turn
routine local implementation decisions into repeated founder approvals.
Static themes are the final approved background result. Notification read
state remains a frontend prototype. Historical intermediate motion branches
must not reintroduce background video. Later human-reviewed motion is deferred.
