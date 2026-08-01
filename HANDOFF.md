# Session Handoff

Last updated: 2026-08-01 · Branch: `dev`

## Current phase

**Phase 3 Slice 4 — Settings and explicit-content preferences — is in
progress.** Slice 3 is published and CI-verified. Slice 4's first vertical cut
is implemented, locally verified, and captured in the current local commit.

Phase 3 as a whole is not complete:

1. Core auth backend — complete, published, and CI-verified.
2. Email verification and password reset — complete, published, and
   CI-verified in commit `dcdccd5`.
3. Frontend auth integration — complete, published, and CI-verified in commit
   `1089ae0`.
4. Settings and explicit-content preference — initial persisted preference
   flow complete locally; broader account Settings remain.

Phase 2 remains **partially complete (local foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, a background-job
queue, and the full idempotency framework remain deferred.

## Publication status

- `dev` and `origin/dev` are at Slice 3 commit `1089ae0`.
- Slice 3 was pushed directly to `dev`; GitHub Actions run
  `30703161510` passed all three jobs (web, API, and Playwright).
- The Slice 4 preference commit is local and has not been pushed. GitHub CI has
  therefore not run against Slice 4 yet.
- Local backup branch
  `codex/backup-dev-before-squash-20260729` preserves the pre-publication
  history.

## Manual local review setup

On this Windows machine, use `127.0.0.1` consistently. Another local process
answers the IPv6 `localhost:3000`, and the normal Vite command binds to
`localhost` rather than `127.0.0.1`.

The ignored root `.env` must contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1
WEB_ORIGIN=http://127.0.0.1:5173
```

The ignored `apps/web/.env.local` must contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1
```

From the repository root, prepare the stack in a setup terminal:

```powershell
npm run db:up
npm run build:api
npm run db:deploy
npm run db:seed
```

`build:api` is required on a fresh checkout and after backend/shared-package
changes. Migrations and the idempotent seed are safe to rerun.

Keep a second terminal open for the API:

```powershell
npm run dev:api
```

Keep a third terminal open for Vite. Use the explicit-address script on this
machine:

```powershell
npm run dev:e2e:web
```

Review endpoints:

- Web app: `http://127.0.0.1:5173/login`
- API health: `http://127.0.0.1:3000/api/v1/health`
- Mailpit inbox: `http://127.0.0.1:8025`

Seeded review accounts all use password `pumdoki-dev-password`:

- `member@pumdoki.example`
- `creator@pumdoki.example`
- `admin@pumdoki.example` (backend role validation only; the public web app has
  no admin route)

When finished, stop the API and Vite watchers with `Ctrl+C`, then run:

```powershell
npm run db:down
```

## Decisions locked

- The API is the source of truth for identity, role, and email-verification
  state.
- Browser code never reads or stores the session token. Auth uses the
  `HttpOnly` session cookie with credentialed requests and `/me` restoration.
- First beta uses email/password only. Google sign-in is visibly disabled.
- Unverified users may log in and browse. Future money and creator actions use
  `requireVerifiedEmail`.
- Registration retains the deliberate duplicate-email `409 CONFLICT`;
  password-reset requests remain enumeration-neutral.
- Sessions use opaque 32-byte tokens, 30-day sliding expiry, and renewal at
  most once per 24 hours.
- Acceptance records remain append-only with restrictive deletion.
- Explicit content is hidden by default. Enabling it requires deliberate
  confirmation; disabling it is immediate. This preference does not replace
  age or identity verification.
- Future content APIs must enforce the preference in server-side queries and
  payload construction. Client-side hiding is not a security boundary.

## Founder manual review — decisions resolved before Slice 3 commit

- Registration, login, persistence, logout, verification through Mailpit, and
  password reset were manually reviewed successfully on 2026-07-29.
- The creator dashboard route allows only canonical `CREATOR` accounts. The
  Dashboard option is rendered only for creators in the shared profile menu,
  sidebar More menu, and Wallet profile menu. A `MEMBER` sees no Dashboard
  option and receives the forbidden state on direct `/dashboard` access.
- Public registration intentionally creates a `MEMBER`. Creator application,
  identity review, approval, and role promotion are later phases and are not
  implemented, so a newly registered user cannot yet become a creator without
  seed/manual database state.
- The prototype creator-onboarding completion currently navigates directly to
  `/dashboard` without promoting the account. Until the approval workflow
  exists, that produces a forbidden state for a normal registered member and
  should be replaced with an application-received/pending-approval outcome.
- Founder decision on 2026-08-01: the public Pumdoki web app has no `/admin`
  route or admin navigation. The placeholder was removed.
- The backend `ADMIN` role and API authorization boundary remain. A separately
  buildable private operations shell now exists in `apps/admin` with its own
  Vite entry point and release artifact. It is not linked from `apps/web` and
  has no operational data or actions.
- Phase 11 must add operational authentication, MFA/SSO, restricted hosting,
  API integration, permissions, and audit logging before `apps/admin` is
  deployed. The current shell explicitly warns against public deployment.

## What Slice 3 implements

### Auth integration

- `apiClient` parses the nested API error envelope, preserves request IDs and
  details, distinguishes network failures, and publishes later `401` events.
- `AuthProvider` owns explicit `loading`, `authenticated`, `unauthenticated`,
  and `unavailable` states; it restores sessions through `/me` and provides
  retry and auth actions.
- The auth feature boundary validates returned public-user data and uses
  canonical uppercase `MEMBER`, `CREATOR`, `MODERATOR`, and `ADMIN` roles.
- `ProtectedRoute` handles loading, unavailable, anonymous, forbidden, and
  authorized states. Anonymous deep links return to the originally requested
  route after login.
- Login, registration, logout, forgot/reset password, and email verification
  use the live API. Registration submits the versioned age/Terms/Privacy
  attestation and the checkbox starts unchecked.
- A persistent unverified-email banner supports resend pending, accepted,
  throttled, and failure states.
- Verification/reset tokens are removed from visible browser history after
  capture. A successful password reset explains global session revocation.

### Test and CI infrastructure

- Unit/component coverage now exercises the API adapter, auth provider,
  Login/SignUp, route guards, verification banner/confirmation, and password
  reset edge states.
- Playwright starts the built API and Vite on explicit `127.0.0.1` origins so
  local cookie behavior is deterministic.
- The CI E2E job now provisions PostgreSQL 17 and Mailpit, builds the API,
  deploys migrations, seeds the database, and exercises real auth flows.
- Browser coverage includes registration, Mailpit verification, refresh
  persistence, password reset and old-password rejection, logout, requested
  route restoration, creator-only Dashboard navigation/route access, and the
  absence of a public `/admin` route.

### Project records

- `PLAN.md`, `CLAUDE.md`, `README.md`, and the Slice 3 architecture record
  describe the published frontend-auth state.
- The master tracker marks account/login, roles, session management, email
  verification, password reset, and login/signup screens Done.
- Its formula-driven summary is 19/148 Done (12.8%), 46 In Progress, and 83 Not
  Started. All five sheets were rendered and visually checked; the formula
  error scan returned zero matches.

## Slice 4 work in progress

- `UserPreference` stores one row per user with
  `showExplicitContent=false` by default. Migration
  `20260801103000_add_user_preferences` backfills existing users and cascades
  preference deletion with the owning user.
- Registration creates the preference atomically; the idempotent development
  seed repairs missing rows without changing an existing selection.
- Shared Zod contracts define the read/update payloads. Authenticated
  `GET /api/v1/me/preferences` and `PATCH /api/v1/me/preferences` endpoints
  return and persist the preference; anonymous calls are rejected.
- The protected `/settings` page shows the current account summary and the
  live explicit-content preference. Profile-menu, Sidebar More, and Wallet
  navigation all open it.
- Opt-in requires an explanatory confirmation. Opt-out saves immediately.
  Failed updates retain the prior value and show a retryable error.
- The browser regression registers a unique member, navigates through the
  profile menu, opts in, reloads to prove persistence, and opts out.
- The durable design is
  `docs/architecture/phase3-slice4-settings-preferences.md`.
- This is not all of Slice 4. Profile editing, email change/reverification,
  password change, session management, notification/theme controls, billing,
  export, and deletion remain. Content filtering cannot be enforced in feed
  queries until Phase 5 introduces real content APIs.

## Current local verification — 2026-08-01

All commands ran from the repository root.

| Command / check                      | Result                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `npm run format:check`               | ✅ exit 0                                                                              |
| `npm run lint`                       | ✅ exit 0                                                                              |
| `npm run test`                       | ✅ 22 files, 106/106 web tests                                                         |
| `npm run test -w @pumdoki/contracts` | ✅ 1 file, 15/15 tests                                                                 |
| `npm run test:api`                   | ✅ 9 files, 64/64 tests                                                                |
| `npm run build`                      | ✅ Vite 7.3.6 production build                                                         |
| `npm run build:api`                  | ✅ contracts, Prisma generation, database, and API TypeScript builds                   |
| `npm run test:e2e`                   | ✅ 38/38 Chromium Playwright tests against real API/PostgreSQL/Mailpit                 |
| `npm run db:deploy`                  | ✅ fourth migration applied successfully                                               |
| `npm run db:seed`                    | ✅ idempotent seed completed; existing local E2E users explain the current total of 19 |
| Tracker verification                 | ✅ key ranges inspected, zero formula errors, and all five sheets rendered             |
| `git diff --check`                   | ✅ exit 0                                                                              |

The web production bundle still reports the known large-chunk advisory:
809.71 kB minified and 197.58 kB gzip.

The first combined web-test run lacked the Settings test's `matchMedia` stub;
after adding it, the full suite passed. The first API run expected a different
validation error label than the established middleware emits; the assertion
was corrected to the existing `BAD_REQUEST` contract and all API tests passed.

`npm audit` was not refreshed. The last known result remains the three moderate
Prisma CLI/toolchain findings recorded on 2026-07-16; do not describe the
current dependency set as audit-clean.

## Risks and remaining work

- Profile editing, email/password changes, active-session controls, and the
  remaining Settings categories are still absent.
- Explicit-content preference persistence works, but no real content/feed API
  exists yet to enforce it while constructing content payloads.
- Production email-provider selection, adult-business support, TLS,
  deliverability, DKIM, SPF, and DMARC remain open.
- Login and email throttling are instance-local until Redis/shared storage.
- Phase 2 cloud/operations work remains incomplete.
- Counsel must define acceptance-evidence retention and pseudonymization.
- Production `BrowserRouter` host rewrites remain required.
- Frontend code splitting remains advisable.

## Next exact task

1. Founder manually reviews `/settings` using the member account, including
   opt-in confirmation, reload persistence, and immediate opt-out.
2. Continue Slice 4 with the account-security increment: profile display-name
   editing, email change plus reverification, password change, and active
   session listing/revocation.
3. Explicitly sequence or defer notification/theme, billing, export, and
   deletion Settings according to their later-phase dependencies. Enforce the
   explicit preference in server-side content queries when Phase 5 adds them.
4. Continue the overdue AWS/Sentry/Redis/email-provider decisions and the
   LLC/counsel, CCBill, identity-provider, and country-allowlist workstreams in
   parallel.
