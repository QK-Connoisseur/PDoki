# Session Handoff

Last updated: 2026-08-01 · Branch: `dev`

## Current phase

**Phase 3 Slice 4B — account-security Settings — is implemented and fully
locally verified.** Slice 3 is published and CI-verified. Slice 4A is captured
in the current local commit; Slice 4B is still in the working tree.

The founder-approved reduced Phase 3 core scope is locally complete:

1. Core auth backend — complete, published, and CI-verified.
2. Email verification and password reset — complete, published, and
   CI-verified in commit `dcdccd5`.
3. Frontend auth integration — complete, published, and CI-verified in commit
   `1089ae0`.
4. Settings — Slice 4A persists the default-hidden explicit preference; Slice
   4B adds profile, email/reverification, password, and active-session controls.

Phase 3 is not yet published/CI-complete. Founder manual review, a Slice 4B
commit, push, and green GitHub CI are still required before Phase 4
implementation begins. Notifications, theme, billing, export/deletion, and
server-side explicit-content query enforcement are intentionally sequenced to
their dependency phases rather than pulled into Phase 3.

Phase 2 remains **partially complete (local foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, a background-job
queue, and the full idempotency framework remain deferred.

## Publication status

- `dev` and `origin/dev` are at Slice 3 commit `1089ae0`.
- Slice 3 was pushed directly to `dev`; GitHub Actions run
  `30703161510` passed all three jobs (web, API, and Playwright).
- Slice 4A is local commit `7972bf2` and has not been pushed. Slice 4B is fully
  locally verified but uncommitted. GitHub CI has therefore not run against
  either Slice 4 increment.
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

Slice 4B founder review checklist:

1. Log in as the seeded member and open **Settings** from the profile menu.
2. Change the display name and confirm it updates in the authenticated shell.
3. Change to an unused `.example` email while entering the current password.
   Confirm the account becomes unverified, open the new message in Mailpit,
   and follow its verification link.
4. Create another session in a different browser/private window, reload
   Settings, and revoke that other session. The current browser must remain
   signed in.
5. Change the password. Confirm the current browser remains signed in, the
   other browser is signed out, the old password fails, and the new password
   succeeds.
6. Confirm explicit content still requires opt-in confirmation, persists after
   reload, and turns off immediately.

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
- Email and password changes require the current password and throttle failed
  confirmations per user/IP. They invalidate relevant outstanding links and
  revoke every other active session while preserving the current browser.
- A changed email is unverified until its new Mailpit/provider link is
  confirmed. Duplicate email changes return `409 CONFLICT`.
- Session revocation is scoped by authenticated user; a foreign or missing
  session identifier returns `NOT_FOUND`.
- Acceptance records remain append-only with restrictive deletion.
- Explicit content is hidden by default. Enabling it requires deliberate
  confirmation; disabling it is immediate. This preference does not replace
  age or identity verification.
- Future content APIs must enforce the preference in server-side queries and
  payload construction. Client-side hiding is not a security boundary.
- Founder-approved Phase 3 transition scope defers notification Settings to
  Phase 9, billing to payments, export/deletion to counsel-approved privacy
  work, theme to the design-system workstream, and explicit-content query
  enforcement to Phase 5 content APIs.

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

## What Slices 4A and 4B implement

- `UserPreference` stores one row per user with
  `showExplicitContent=false` by default. Migration
  `20260801103000_add_user_preferences` backfills existing users and cascades
  preference deletion with the owning user.
- Registration creates the preference atomically; the idempotent development
  seed repairs missing rows without changing an existing selection.
- Shared Zod contracts define the read/update payloads. Authenticated
  `GET /api/v1/me/preferences` and `PATCH /api/v1/me/preferences` endpoints
  return and persist the preference; anonymous calls are rejected.
- The protected `/settings` page is reachable from Profile menu, Sidebar More,
  and Wallet navigation. It uses live APIs for account and content settings.
- Opt-in requires an explanatory confirmation. Opt-out saves immediately.
  Failed updates retain the prior value and show a retryable error.
- The browser regression registers a unique member, navigates through the
  profile menu, opts in, reloads to prove persistence, and opts out.
- The durable design is
  `docs/architecture/phase3-slice4-settings-preferences.md`.
- Slice 4B adds shared Zod contracts and authenticated endpoints for display-
  name editing, email change, password change, active-session listing, and
  session revocation. No new migration is needed because the existing User and
  Session models already contain the required data.
- Email changes require the current password, normalize/uniquely constrain the
  new address, mark it unverified, invalidate all outstanding verification and
  reset tokens, send a fresh verification message, and revoke other sessions.
- Password changes require the current password and a different policy-valid
  new password, invalidate reset tokens, and revoke other sessions.
- The current browser survives sensitive changes. Active-session rows expose
  trustworthy creation/expiry metadata and an ownership-scoped revoke action;
  the UI routes current-session termination through normal logout.
- `AuthProvider.updateUser` keeps the member shell synchronized after profile
  and email edits without reloading or exposing session tokens.
- The Slice 4B browser regression proves the full account-security path against
  PostgreSQL and Mailpit, including reverification and old-password rejection.
- Its durable design is
  `docs/architecture/phase3-slice4b-account-security-settings.md`.
- Notifications, theme, billing, export, deletion, and server-side content
  filtering remain explicitly deferred to their dependency phases under the
  founder-approved Phase 3 transition scope.

## Current local verification — 2026-08-01

All commands ran from the repository root.

| Command / check                      | Result                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `npm run format:check`               | ✅ exit 0                                                                        |
| `npm run lint`                       | ✅ exit 0                                                                        |
| `npm run test`                       | ✅ 22 files, 113/113 web tests                                                   |
| `npm run test -w @pumdoki/contracts` | ✅ 1 file, 18/18 tests                                                           |
| `npm run test:api`                   | ✅ 10 files, 69/69 tests                                                         |
| `npm run build`                      | ✅ Vite 7.3.6 production build                                                   |
| `npm run build:api`                  | ✅ contracts, Prisma generation, database, and API TypeScript builds             |
| `npm run test:e2e`                   | ✅ 39/39 Chromium Playwright tests against real API/PostgreSQL/Mailpit           |
| `npm run db:deploy`                  | ✅ four migrations found; no pending migration                                   |
| `npm run db:seed`                    | ✅ idempotent seed completed; local E2E history explains the current total of 32 |
| Tracker verification                 | ✅ key ranges inspected, zero formula errors, and all five sheets rendered       |
| `git diff --check`                   | ✅ exit 0                                                                        |

The web production bundle still reports the known large-chunk advisory:
816.80 kB minified and 199.32 kB gzip.

Focused UI, API integration, and account-security browser tests passed before
the full suites. The first full contract-test attempt was blocked by the local
sandbox's parent-directory read restriction; the same command passed outside
the sandbox (18/18). PostgreSQL was initially stopped, then `npm run db:up` and
`db:deploy` restored the local stack and all DB-backed tests passed. The first
two focused browser attempts found test-only selector/redirect expectations;
after correcting those assertions, the focused and full browser suites passed.

`npm audit` was not refreshed. The last known result remains the three moderate
Prisma CLI/toolchain findings recorded on 2026-07-16; do not describe the
current dependency set as audit-clean.

## Risks and remaining work

- Dependency-bound notification, theme, billing, export, and deletion Settings
  remain unimplemented by design; see the Phase 3 transition scope in PLAN.md.
- Explicit-content preference persistence works, but no real content/feed API
  exists yet to enforce it while constructing content payloads.
- Production email-provider selection, adult-business support, TLS,
  deliverability, DKIM, SPF, and DMARC remain open.
- Login and email throttling are instance-local until Redis/shared storage.
- Current-password throttling is also instance-local until Redis/shared
  storage. The database/session security behavior itself is enforced server-
  side.
- Phase 2 cloud/operations work remains incomplete.
- Counsel must define acceptance-evidence retention and pseudonymization.
- Production `BrowserRouter` host rewrites remain required.
- Frontend code splitting remains advisable.

## Next exact task

1. Founder manually reviews the Slice 4B checklist above.
2. Commit Slice 4B, push the two local Slice 4 commits, and require green GitHub
   CI before describing Phase 3's reduced core scope as published/complete.
3. Begin Phase 4 with a legal/trust foundation slice: versioned creator-
   agreement acceptance, provider-neutral verification seams, and a creator-
   application received/pending-review result instead of direct Dashboard
   access. Do not claim counsel/vendor/operations approval.
4. Continue the overdue AWS/Sentry/Redis/email-provider decisions and the
   LLC/counsel, CCBill, identity-provider, and country-allowlist workstreams in
   parallel.
