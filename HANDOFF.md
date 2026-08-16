# Session Handoff

Last updated: 2026-08-16 · Working branch: `codex/operations-readiness-packet` · Base: `dev`

## Current phase

**Phase 4 Slice 1 is published and CI-verified as `ce6c9e4`; Phase 4
Slice 2 and its creator UX are published through PR #1 merge commit
`e7352c8`; frontend routing hardening is published through PR #2 merge commit
`1189404`.** The Slice 2 security boundary and state machine are recorded, its
public API exposure and concurrency defects are repaired, and its full local
migration, API, browser, build, and quality gates are green. It remains
deliberately unusable as an operations workflow until the documented
private-origin authentication and deployment controls exist.

The founder-approved Phase 3 core scope is complete:

1. Core auth backend — complete, published, and CI-verified.
2. Email verification and password reset — complete, published, and
   CI-verified in commit `dcdccd5`.
3. Frontend auth integration — complete, published, and CI-verified in commit
   `1089ae0`.
4. Settings — Slice 4A persists the default-hidden explicit preference; Slice
   4B adds profile, email/reverification, password, and active-session controls.

Phase 4 Slice 1 replaces simulated creator approval with a database-backed
application. A verified member submits a creator-facing name, country code,
and three versioned prototype acknowledgements. The application persists as
`PENDING`, identity verification remains `NOT_STARTED`, and the account remains
a member with no Dashboard access. No ID, selfie, tax, or banking files are
requested. Counsel-approved policies, provider integration, country/tax gates,
and private operations review remain open.

Phase 2 remains **partially complete (local foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, a background-job
queue, and the full idempotency framework remain deferred.

## Publication status

- `dev` and `origin/dev` are at PR #2 merge commit `1189404`, which contains
  PR #1 merge commit `e7352c8`.
- GitHub Actions run `30739645872` passed the API build/test, web/private-admin
  lint/test/build, and real-stack Playwright jobs for Slice 1.
- Phase 4 Slice 2 is published through PR #1 merge commit `e7352c8`; its
  implementation began in commit `1ba32ea`. It adds strict review contracts, a
  fail-closed operations-authentication seam, atomic non-approval transitions,
  a constrained review-event migration, and focused coverage. The normal public
  API does not mount the review router. Its engineering and CI gates pass, but
  it is not a usable private-operations workflow because real operational
  authentication and the documented deployment controls remain open.
- Separate web UX commit `aa10873` redesigns registration, improves the
  creator-application profile-menu width and label wrapping, and replaces the
  generic non-creator `/dashboard` denial with a branded creator-access gate.
  These changes do not weaken the creator-only route guard.
- [Pull request #1](https://github.com/QK-Connoisseur/PDoki/pull/1)
  merged into `dev` as `e7352c8`. Final-head GitHub Actions run `31947756634`
  passed its API, web/private-admin, and real-stack Playwright jobs at
  `e83b027`.
- [Pull request #2](https://github.com/QK-Connoisseur/PDoki/pull/2)
  merged into `dev` as `1189404`. Final-head GitHub Actions run `31948805621`
  passed the same three jobs at `3e5646d`.
- [Draft pull request #3](https://github.com/QK-Connoisseur/PDoki/pull/3), on
  branch `codex/operations-readiness-packet`, adds non-secret planning
  templates for private-admin activation, hardware-key recovery, Google
  Workspace recovery privacy, environment inputs, provider decisions, and
  future staging verification. It makes no live account change, selects no
  provider, and does not authorize deployment or router activation.
- Local backup branch
  `codex/backup-dev-before-squash-20260729` preserves the pre-publication
  history.

## Manual local review setup

For full-stack manual review, use `127.0.0.1` consistently so the browser, API,
and configured credentialed origin use the same explicit IPv4 host.

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

- `member@pumdoki.example` (left unverified for verification-reminder testing)
- `creator@pumdoki.example` (preverified creator-role fixture)
- `admin@pumdoki.example` (backend role validation only; the public web app has
  no admin route)

Phase 4 Slice 1 founder review checklist:

1. Register a unique member, then open the verification message in Mailpit and
   follow the link. An unverified member may open the application page but may
   not submit.
2. From the member profile menu, confirm **Apply to become a creator** is
   present and **Creator Dashboard** is absent. Open the application.
3. Enter a creator-facing name and two-letter country code. Review and accept
   both explicitly labeled prototype policies.
4. Confirm the identity step requests no files and explains that verification
   comes later. Accept the disclosure and submit.
5. Confirm **Application received**, `PENDING`, and `NOT STARTED` appear; reload
   and verify the same persisted result returns.
6. Directly open `/dashboard` and confirm the pending member is denied. Log in
   as the seeded creator and confirm only **Creator Dashboard**, not a new
   application entry, appears in the profile menu.

Founder result — 2026-08-03: ✅ all six checks passed, including blocking
unverified application submission, persisting the `PENDING` / `NOT_STARTED`
result after reload, rendering role-correct navigation, and denying direct
`/dashboard` access to non-creators.

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
- Creator applications are member-only and require a verified email to submit.
  Submission is one-per-user, records versioned evidence atomically, and never
  changes the role or unlocks Dashboard.
- Phase 4 Slice 1 stores no government ID, selfie, tax form, or banking data.
  Identity verification remains provider-neutral and `NOT_STARTED` until
  vendor, security, retention, country, and operations decisions are approved.
- Prototype creator policy versions use a `prototype-*` prefix and must not be
  represented as counsel-approved launch agreements or payout terms.
- Founder confirmed on 2026-08-03 that creator-review operations will follow
  the separately deployed private-admin boundary: no public web route or link,
  API-enforced permissions, and no operational deployment until the signed
  operations identity boundary, restricted access, and cryptographically
  verified, phishing-resistant, hardware-backed authentication assurance are
  implemented.

## Founder manual review — decisions resolved before Slice 3 commit

- Registration, login, persistence, logout, verification through Mailpit, and
  password reset were manually reviewed successfully on 2026-07-29.
- The creator dashboard route allows only canonical `CREATOR` accounts. The
  Dashboard option is rendered only for creators in the shared profile menu,
  sidebar More menu, and Wallet profile menu. A `MEMBER` sees no Dashboard
  option and receives a branded locked-studio state on direct `/dashboard`
  access; the server-backed creator-role boundary remains unchanged.
- Public registration intentionally creates a `MEMBER`. Phase 4 Slice 1 now
  lets a verified member submit a persisted pending creator application, but
  identity review, approval, and role promotion remain unimplemented.
- The old creator-onboarding simulation no longer uploads local identity files
  or navigates directly to `/dashboard`; it returns the persisted pending
  outcome and leaves the account role unchanged.
- Founder decision on 2026-08-01: the public Pumdoki web app has no `/admin`
  route or admin navigation. The placeholder was removed.
- The backend `ADMIN` role and API authorization boundary remain. A separately
  buildable private operations shell now exists in `apps/admin` with its own
  Vite entry point and release artifact. It is not linked from `apps/web` and
  has no operational data or actions.
- Phase 11 must add the signed operations identity boundary,
  phishing-resistant hardware-backed authentication assurance, restricted
  hosting, API integration, permissions, and audit logging before `apps/admin`
  is deployed. The current shell explicitly warns against public deployment.

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
- A modern full-width unverified-email reminder sits in normal page flow below
  each authorized ready-state shell header, so it reserves space instead of
  covering page or chat content. Existing creator-application outcomes include
  the strip; the new-application gate keeps its more specific verification
  card, and forbidden/loading screens do not duplicate the reminder. It
  supports resend pending, accepted, throttled, and failure states and can be
  dismissed for the current browser session without changing verification
  state or bypassing protected actions.
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

## What Phase 4 Slice 1 implements

- `CreatorApplication` is a one-to-one, restrict-on-delete record with
  application states `PENDING`, `NEEDS_INFORMATION`, `APPROVED`, and `REJECTED`
  plus provider-neutral identity states. This slice creates only `PENDING` /
  `NOT_STARTED`.
- Shared strict Zod contracts normalize creator names/country codes and require
  all three exact prototype versions and literal-true acknowledgements.
- Authenticated `GET /api/v1/me/creator-application` loads a member's current
  result. Verified-member-only `POST /api/v1/creator-applications` creates the
  application and acceptance evidence in one transaction; duplicate submission
  returns `409 CONFLICT`.
- The member profile and Sidebar menus expose **Apply to become a creator**.
  Creator accounts instead see **Creator Dashboard**. Application submission
  never changes role or redirects to Dashboard.
- The three-step browser flow loads current state, supports retry and email-
  verification prompting, records the pending outcome, and restores it after
  reload.
- The unsafe prototype copy and behavior were removed: no hardcoded 80/20
  revenue split, payout threshold/net terms, unsupported encryption/access/
  retention claims, 1–3 day SLA, ID/selfie inputs, or simulated approval.
- The durable design is
  `docs/architecture/phase4-slice1-creator-application-foundation.md`.

## Current local verification — 2026-08-02

All commands ran from the repository root.

| Command / check                      | Result                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| `npm run format:check`               | ✅ exit 0                                                            |
| `npm run lint`                       | ✅ exit 0                                                            |
| `npm run test`                       | ✅ 25 files, 122/122 web tests                                       |
| `npm run test -w @pumdoki/contracts` | ✅ 1 file, 21/21 tests                                               |
| `npm run test:api`                   | ✅ 11 files, 74/74 tests                                             |
| `npm run build`                      | ✅ Vite 7.3.6 web production build                                   |
| `npm run build:admin`                | ✅ private operations shell production build                         |
| `npm run build:api`                  | ✅ contracts, Prisma generation, database, and API TypeScript builds |
| `npm run test:e2e -- --workers=1`    | ✅ 40/40 Chromium tests against real API/PostgreSQL/Mailpit          |
| `npm run db:deploy`                  | ✅ fifth migration applied successfully                              |
| Focused creator browser regression   | ✅ signup, Mailpit verify, submit, reload, and Dashboard denial      |
| Tracker                              | Not changed for Slice 1; prior Phase 3 workbook state is intact      |
| `git diff --check`                   | ✅ exit 0                                                            |

The web production bundle still reports the known large-chunk advisory:
812.00 kB minified and 198.68 kB gzip.

Focused contract, browser-adapter, component, API-integration, and Playwright
tests passed before the full suites. One unchanged Connect component test timed
out while format, lint, test, and build were competing in parallel; it passed
alone and the independently rerun full web suite passed 122/122. The first
private-admin build was denied by the local filesystem sandbox while Vite
resolved its config; the same unchanged build passed outside that sandbox.

`npm audit` was not refreshed. The last known result remains the three moderate
Prisma CLI/toolchain findings recorded on 2026-07-16; do not describe the
current dependency set as audit-clean.

## Current web UX verification — 2026-08-03

This verification covers the redesigned registration UI, profile-menu width
and label alignment, and the route-specific non-creator Dashboard gate. It does
not verify or complete the separate Phase 4 Slice 2 backend seam.

| Command / check                                                                                               | Result                                                                                           |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run test -w @pumdoki/web`                                                                                | ✅ 26 files, 126/126 tests                                                                       |
| Focused `ProtectedRoute` and `CreatorDashboardGatePage` tests                                                 | ✅ 2 files, 9/9 tests                                                                            |
| `npx playwright test tests/e2e/auth.spec.js tests/e2e/creator-application.spec.js --workers=1`                | ✅ 7/7 real-stack Chromium tests                                                                 |
| `npm run lint`                                                                                                | ✅ exit 0                                                                                        |
| `npm run build:web`                                                                                           | ✅ Vite 7.3.6 production build                                                                   |
| Prettier check for touched web, E2E, `PLAN.md`, and `HANDOFF.md` files                                        | ✅ exit 0                                                                                        |
| `git diff --check` for touched web, E2E, `PLAN.md`, and `HANDOFF.md` files                                    | ✅ exit 0                                                                                        |
| Manual authenticated `/dashboard` review at desktop and 375 px content width, plus application-CTA navigation | ✅ gate resolved after session restore, no horizontal overflow, CTA opened `/creator/onboarding` |

The web production bundle reports the existing large-chunk advisory at 823.19
kB minified and 201.80 kB gzip. The first sandboxed build attempt could not
resolve Vite's config because of local filesystem restrictions; the unchanged
build passed outside that sandbox.

## Current Slice 2 publication-branch verification — 2026-08-13

The durable design is
`docs/architecture/phase4-slice2-private-creator-review.md`. It records the
private-origin/MFA boundary, exact acyclic transition matrix, optimistic
concurrency rule, evidence limitations, exclusions, and activation blockers.

The normal `createApp()` no longer mounts the creator-review router. The
dormant router requires an injected operational verifier, validates UUID
parameters and strict action/expected-status bodies, and cannot use its test
assurance outside `NODE_ENV=test`. `PENDING` may move to
`NEEDS_INFORMATION` or `REJECTED`; `NEEDS_INFORMATION` may move only to
`REJECTED`; `REJECTED` and `APPROVED` are terminal in this slice. A conditional
status update and event insert share one transaction, so stale/concurrent
requests return `409` without appending evidence.

Checks run from the repository root on August 12:

| Command / check                                  | Result                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Contracts, database, and API TypeScript builds   | ✅ exit 0 after Prisma client generation                              |
| `npm run lint` equivalent with the installed CLI | ✅ exit 0                                                             |
| Focused contract suite                           | ✅ 1 file, 24/24 tests                                                |
| Operations boundary + non-DB API suites          | ✅ 7 files, 31/31 tests outside the local-port sandbox                |
| Slice 2 migration deploy and status              | ✅ all 6 migrations applied; schema up to date on PostgreSQL 17       |
| Focused creator-review database integration      | ✅ 2 files, 10/10 tests                                               |
| Full API suite                                   | ✅ 14 files, 90/90 tests                                              |
| Web unit/component suite                         | ✅ 26 files, 126/126 tests                                            |
| Full real-stack Chromium suite                   | ✅ 40/40 against the API, PostgreSQL, and Mailpit                     |
| Web production build                             | ✅ 823.19 kB minified / 201.80 kB gzip; existing large-chunk advisory |
| Private-admin production build                   | ✅ exit 0                                                             |
| Six-migration SQL/constraint smoke in PGlite     | ✅ all migrations applied; 4/4 Unicode edge-whitespace inserts denied |
| Full Prettier check and `git diff --check`       | ✅ exit 0 after documentation reconciliation                          |

The in-process PGlite smoke check is useful SQL-syntax and constraint evidence,
but it does not replace the required PostgreSQL 17 deploy, concurrency,
rollback, and full integration gates.

The checkout originated on Windows, so exact macOS optional packages already
pinned in `package-lock.json` were added only to ignored `node_modules` for
Rollup, esbuild, Lightning CSS, and Tailwind Oxide. That optional-package repair
did not change a manifest or lockfile; the intentional `pg` test dependency
does. A repository-wide line-ending accident was reduced to the actual semantic
diff, and `.gitattributes` plus Prettier now require LF.

The Slice 2 engineering gate is complete, and PR #1 merged into `dev` as
`e7352c8` after final-head GitHub Actions run `31947756634` passed. PR #2
merged the routing work as `1189404` after run `31948805621` passed. Passing
these checks does not authorize a deployed operations workflow.

## Current frontend routing-hardening verification — 2026-08-16

- Unknown URLs retain the requested path and render a branded, accessible 404.
  Anonymous visitors receive **Go back** and **Sign in**; authenticated visitors
  receive **Go back** and **Go home**. Session restoration is not guessed, and
  an authentication outage offers a retry.
- `/admin` receives the same generic 404 and exposes no private-admin content.
- Non-login feature, auth, and legal routes are lazy-loaded behind an accessible
  shared route-loading state. Login and the 404 recovery route remain eager.
- A rejected lazy import reaches the top-level recovery boundary, whose
  **Reload page** action performs a real page reload because React caches a
  rejected lazy-module promise.
- The final web suite passes 30 files and 144/144 tests. The full real-stack
  Chromium suite passes 41/41 against the API, PostgreSQL, and Mailpit; focused
  routing/authentication coverage passes 21/21 after the final review fixes.
- The production entry JavaScript fell from 824.90 kB / 201.82 kB gzip to
  277.80 kB / 87.93 kB gzip: reductions of 66.32% minified and 56.43% gzip.
  The largest generated JavaScript chunk is 277.80 kB, below Vite's 500 kB
  advisory threshold.
- API 90/90, API/contracts/database build, private-admin build, lint, Prettier,
  and `git diff --check` pass. Desktop 1440×900 and mobile 390×844 visual review
  show no overflow or clipped recovery actions.
- CI now runs Prettier, uses read-only repository-token permissions, and applies
  bounded job timeouts. GitHub CI and human review remain required.

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
- Counsel-approved creator/payout/content policies, country eligibility, tax
  intake, and an identity provider with approved security/retention controls
  do not exist yet. Do not enable ID collection or creator approval.
- The private operations shell has no production signed operations
  authentication, hardware-backed assurance, creator-review UI, deployed API
  verifier, or globally immutable audit log.
  Slice 2's dormant application-level evidence seam must remain unmounted until
  those controls are implemented and verified.
- Founder began the Cloudflare and Yubico prerequisites on 2026-08-03. This is
  in progress and does not yet constitute verified private-admin restricted
  access or hardware-backed assurance integration. The readiness packet in
  `docs/operations/` defines the future evidence gate without asserting
  current account state.
- Revisit Google Workspace signup/recovery privacy without recording personal
  contact details in this repository. Confirm directory visibility and current
  recovery factors, enroll an independent backup key/recovery path, and verify
  access before replacing any temporary contact so the privacy improvement does
  not create an account lockout.
- Production `BrowserRouter` host rewrites remain required.

## Next exact task

1. Treat PR #1 merge commit `e7352c8`, PR #2 merge commit `1189404`, and their
   green final-head CI runs `31947756634` and `31948805621` as the shared `dev`
   baseline.
2. Review [draft pull request #3](https://github.com/QK-Connoisseur/PDoki/pull/3)
   against current `dev`. Merge only after current-dev conflict reconciliation,
   the documented secret/personal-identifier, relative-link, formatting, and
   whitespace checks, and green final-head CI.
3. Keep the creator-review router unmounted from the public API and keep
   `APPROVED`, role promotion, and identity collection absent.
4. Use the non-secret [operations readiness packet](docs/operations/README.md)
   to implement and verify the private operations origin, signed Access/IdP
   assertion verifier, operator provisioning, hardware MFA and recovery,
   mutation-origin/CSRF checks, trusted-proxy policy, and restricted runtime
   database privileges described in the Slice 2 architecture record. Keep live
   identifiers and evidence out of Git, and do not activate from a checklist
   alone.
5. Continue the overdue AWS/Sentry/Redis/email-provider work and the LLC/
   counsel, CCBill, identity-provider, retention, tax, and country-allowlist
   workstreams in parallel. Do not collect identity files in the meantime.
