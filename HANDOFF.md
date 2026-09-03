# Session Handoff

Last updated: 2026-08-30 · Working branch: `codex/phase4-yubikey-claim-schema-evaluation` · Base: published `origin/dev` at PR #15 merge `24e1653` · Slice 4: draft PR #17, implementation `317abda`; merge separately gated

## Current phase

**Phase 4 Slice 1 is published and CI-verified as `ce6c9e4`; Phase 4
Slice 2 and its creator UX are published through PR #1 merge commit
`e7352c8`; frontend routing hardening is published through PR #2 merge commit
`1189404`.** The Slice 2 security boundary and state machine are recorded, its
public API exposure and concurrency defects are repaired, and its full local
migration, API, browser, build, and quality gates are green. It remains
deliberately unusable as an operations workflow until the documented
private-origin authentication and deployment controls exist.

**Phase 4 Slice 3 is published through PR #15 merge commit `24e1653`.** Its
implementation began at `9904334` and adds provider-neutral signed-assertion
verification, database-owned exact operator and permission authorization,
transaction-time reauthorization, and test-only request-integrity seams. Post-
merge GitHub Actions run `32784338614` passed the API, web/private-admin, and
real-stack Playwright jobs. The normal API/server still do not mount the
creator-review router. Provider/live configuration, runtime database roles,
deployment, and activation remain separately gated. G1–G12 remain
`NOT EVALUATED`.

**Phase 4 Slice 4 is submitted in draft PR #17, implementation `317abda`.**
The founder authorized staging, commit, push, and the draft PR on August 30.
Merge remains separately gated; exact-head CI must pass before review closes.
This publication does not restart further private-operations development. The
founder approved all seven private-operations policy decisions, including the
two-lock identity-plus-Pumdoki-authorization model, and authorized the YubiKey
schema step. The unmounted Cloudflare candidate verifier and credential-
redaction coverage passed `66/66` focused tests on Node `24.19.0`; focused
TypeScript, API build, scoped ESLint, Prettier, and import/mount checks also
passed. Cloudflare remains an evaluation candidate, `amr: ["hwk"]` is a proposed
contract rather than proven provider behavior. On 2026-08-25 the founder
independently authenticated both existing Cloudflare account hardware-key
enrollments on the new Mac. That physical/browser result does not inspect the
exact candidate Access application, a signed assertion or hardware-method
claim, AAGUID, policy precedence, or controlled recovery separation.

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

Phase 2 remains **partially complete (published fixed-canary foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, shared throttling,
and the general idempotency framework remain unimplemented. The founder
approved a provider-neutral architecture direction
on August 18, 2026: PostgreSQL is the durable jobs/outbox and idempotency
authority; Redis is limited to shared throttling and ephemeral coordination;
and dependency outages must never create an unlimited path. Merged PR #9
published the separately authorized local compatibility/privilege proof,
merged PR #10 published the separately authorized Node 24 runtime baseline,
and merged PR #11 published the separately authorized local worker-candidate
evaluation and disposable application-owned migration/lifecycle fixture. None
of these changes authorizes a provider, production worker dependency or schema,
spend, provisioning, deployment, live configuration, or private-operations
activation. On August 20, 2026, the founder separately approved local-only
implementation and verification of that provisional application-owned worker
foundation. The founder later approved staging, committing, and pushing
`codex/phase2-worker-foundation`, then opening draft PR #13, and later merging
that reviewed head. PR #13 merged into `dev` as `6311522`, preserving reviewed
head `8a8688f`; exact-head run `32518256241` and post-merge run `32535922437`
passed all three jobs. The published foundation moves no current product flow
to async work.

## Publication status

- `origin/dev` is at PR #15 merge commit `24e1653`, which publishes Slice 3
  implementation commit `9904334` and reviewed reconciliation head `48ebc1c`.
  Post-merge run `32784338614` passed the API, lint/test/build, and real-stack
  Playwright jobs. The current Slice 4 branch is based directly on that merge
  and its implementation `317abda` is submitted in draft
  [PR #17](https://github.com/QK-Connoisseur/PDoki/pull/17). Exact-head CI and
  review remain required; merge and every live-control gate are separate.
- Publication preserves the newer August 26 entity/content-spine planning
  changes in the working tree without including them in this PR. The mixed
  tracker is also left untouched and uncommitted; its later planning revision
  needs a separate reconciliation/publication decision. The tracker counts
  below describe previously published historical snapshots, not current PR #17 metrics.
- The August 21 tracker rework preserves all 148 legacy task rows and every
  original backlog, note, assumption, and expense cell. Its PLAN-aligned
  Delivery Tracker contains 161 stable execution records across P00–P14 and
  POST, including explicit completed records for the two published Phase 4
  foundations. Dedicated Phase Roadmap, Review & Blocker Queue, Daily Log, and
  Decision Register views make current work and approvals easier to follow.
  After the Slice 3 local debrief it reports 27 Done, 50 In Progress, 3 In
  Review, 1 Blocked, and 80 Not Started records (16.8% record progress). The
  Review & Blocker Queue contains the three Slice 3 review records plus blocked
  item `P07-E2E-001`; no prior record or history row was deleted.
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
- [Pull request #3](https://github.com/QK-Connoisseur/PDoki/pull/3) merged the
  non-secret operations-readiness packet as `80efce5`. It changes no live
  account, selects no provider, and authorizes no deployment/router activation.
- [Pull request #6](https://github.com/QK-Connoisseur/PDoki/pull/6) reconciled
  the product master tracker as `7749ef6` without implementing the pending
  operational/product rows.
- [Pull request #7](https://github.com/QK-Connoisseur/PDoki/pull/7) merged the
  approved Sakura Glass member-shell design and avatar-decoration foundation as
  `ee7fe83`.
- [Pull request #4](https://github.com/QK-Connoisseur/PDoki/pull/4) merged
  bounded API graceful shutdown as `bac4803`.
- [Pull request #5](https://github.com/QK-Connoisseur/PDoki/pull/5) merged
  bounded post-commit creator-application receipts as `b3e60b6`, including
  loopback-only Mailpit exposure and transaction-current verified-recipient
  protection. Its final-head GitHub Actions run `32106491183` passed all jobs.
- [Pull request #8](https://github.com/QK-Connoisseur/PDoki/pull/8) merged the
  founder-approved provider-neutral Phase 2 async-foundation ADR as `a126554`.
  GitHub Actions run `32138399232` passed all three jobs at reviewed head
  `2ba21a9`. It selected no provider and implemented no queue, Redis store,
  idempotency framework, deployment, or live configuration.
- [Pull request #9](https://github.com/QK-Connoisseur/PDoki/pull/9) merged the
  transaction/privilege sub-proof as `5c19af0`. It adds no production
  dependency, schema, migration, worker, runtime configuration, or behavior.
  Its dedicated PostgreSQL 17 proof passes 5/5 tests: Prisma atomic
  commit/rollback (including enqueue failure), synthetic
  migration/API/worker role separation, two-worker `SKIP LOCKED`, and
  stale-lease-token fencing. A separate cleanup query found no remaining
  generated role or schema. Its initial dedicated run used local Node
  `v26.7.0`, and the Node 24 baseline branch reran it successfully on Node
  `v24.19.0`. Its result provisionally favored an application-owned
  PostgreSQL outbox and is now extended by the local candidate evaluation below.
- The separately authorized
  [Node 24 runtime baseline](docs/architecture/node24-runtime-baseline.md) is
  locally green on exact Node `v24.19.0` / npm `11.17.0`: clean install and
  dependency-tree inspection, 166 web tests, 24 contract tests, 118 API tests,
  5 spike tests, 46 real-stack Chromium tests, every production build, all six
  migrations, and the idempotent seed. CI now reads `.nvmrc`; current action
  majors also use Node 24. No provider, worker, schema, deployment, or live
  configuration is added. PR #10 published the isolated runtime baseline as
  `9a36b19`; final-head and post-merge CI are green.
- The published
  [worker candidate evaluation](docs/architecture/phase2-worker-candidate-evaluation.md)
  rejects unchanged Graphile Worker `0.17.3` and pg-boss `12.27.0` under the
  accepted ADR because neither has the required opaque per-attempt completion
  fence; Graphile also lacks retry jitter. The application-owned synthetic
  migration/lifecycle suite passes 13/13 tests on Node `v24.19.0`: direct
  restricted test-role credentials and exact candidate-database grants,
  indexed/bounded `SKIP LOCKED` terminalization, token-and-expiry fencing,
  attempt-neutral safe release, bounded jittered retry, permanent/exhausted
  `DEAD` outcomes, all-work drain, claim-versus-drain safety, and crash-like
  lease recovery. The original 5/5 Prisma suite still passes, the normal
  migration ledger is unchanged, and post-run generated databases/roles are
  zero. PR #11 published this provisional local recommendation as `afdb59d`;
  local-only implementation/verification was separately approved on August
  20, followed by a separate stage/commit/push approval for the foundation
  branch. Pull-request publication and merge were later separately approved
  through PR #13; production grants and deployment remain separate approval
  gates.
- Local backup branch
  `codex/backup-dev-before-squash-20260729` preserves the pre-publication
  history.

## Phase 4 Slice 3 local verification — 2026-08-23

Plain-language outcome: the dormant creator-review seam no longer has to trust
an adapter-supplied user ID or permissions in local tests. A signed external
identity is validated first, then an exact Pumdoki-owned operator mapping and
permission are resolved from PostgreSQL and rechecked inside the same review
transaction. Exact-origin, JSON/body-limit, injected-CSRF, direct-peer audit,
and credential-redaction seams are covered without creating an operations
server or exposing the router.

- Exact Node `24.19.0` / npm `11.17.0` verification passed 287/287 API tests
  across 30 files, 166/166 web tests, 24/24 contract tests, and 15/15 focused
  operations migration/review cases.
- All eight repository migrations applied to a clean disposable PostgreSQL 17
  database, a second deploy was a no-op, and API/database/contracts/web/admin
  builds, lint, formatting, Prisma validation, and diff checks passed.
- The ordinary `pumdoki_dev` database was not migrated, repaired, or reset. It
  still records seven migrations and has no `OperationsOperator` table. Test
  schemas/rows and both explicitly named disposable databases were removed.
- Nothing operational was activated: there is no public router mount,
  operations server/session, provider adapter, live issuer/key/origin,
  provisioned operator, runtime DB role, live configuration, deployment,
  `APPROVED`, role promotion, identity mutation/file collection, or publishing
  workflow. G1–G12 remain `NOT EVALUATED`.

## Phase 4 founder decisions and Slice 4 scope — 2026-08-24

Plain-language outcome: the founder has approved the policy for who may operate
the private review boundary and how identity, permission, recovery, and auditing
must work. The completed remote-safe Slice 4 step checked whether a candidate
token shape could carry the required proof; it did not create or activate a
private operations system.

- Founder decisions D1–D7 are approved and recorded in
  `docs/architecture/phase4-private-operations-founder-policy-decisions.md`:
  founder-only initial operation, two separately stored hardware keys, an
  isolated private origin/session, the exact two-lock authorization model,
  controlled provisioning/offboarding, separated recovery/break glass, and
  independent audit/disablement.
- The two-lock rule requires both signed proof of the exact person using an
  approved hardware-backed method and a Pumdoki-owned active operator mapping,
  active `ADMIN` user, and exact action permission. Successful identity-provider
  login, email, domain, group, upstream role, or public Pumdoki login alone is
  never operations authorization.
- The local Slice 4 evaluation may add only an unmounted candidate Cloudflare
  assertion adapter and synthetic ephemeral-RSA tests for its documented
  application-token shape and proposed top-level `amr: ["hwk"]` evidence.
- The separate candidate suite passed `65/65` tests and the focused logger-
  redaction check passed `1/1`, for `66/66` combined focused checks on Node
  `24.19.0`. Focused TypeScript, the API build, scoped ESLint, Prettier, and
  import/mount checks passed.
- Cloudflare is not selected. Its public application-token example does not
  currently document the proposed `amr` claim. Both existing account keys
  passed founder-attested Mac browser authentication, but a controlled exact-
  application assertion review is still required. If hardware use is not
  proven by provider-supported signed evidence, the candidate fails G3.
- The primary key received only the founder-entered local FIDO2 PIN described
  above. No Cloudflare enrollment, provider signing key, Access application
  configuration, operator mapping, restricted origin, deployment, router mount,
  or product behavior changed. Phase 4 is partial and G1–G12 remain
  `NOT EVALUATED`.
- The founder approved the PLAN-aligned tracker at home. Its 2026-08-25
  reconciliation preserves all legacy records and contains no restricted key
  evidence.

## Slice 4 publication debrief — 2026-08-30

- Changed: committed the completed dormant candidate and redaction tests as
  `317abda`, pushed the existing branch, and opened draft PR #17 against `dev`
  under the founder's August 30 approval.
- Why it matters: the bounded evaluation now has a reviewable remote artifact;
  it is not a new private-operations implementation or provider decision.
- Verification: fresh Node `24.19.0` checks passed `66/66` focused checks,
  `273/273` non-database API tests, `166/166` web tests, `24/24` contract tests,
  focused TypeScript, full lint, and API/web/admin builds. Implementation-head
  CI run [`33337349347`](https://github.com/QK-Connoisseur/PDoki/actions/runs/33337349347)
  passed all three jobs, including database-backed API and Playwright checks,
  on `317abda`. Every later reconciliation head still requires fresh CI.
- Preserved: no provider selection, real assertion inspection, restricted key
  evidence, live configuration, deployment, mount, creator approval, role
  promotion, or activation. G1–G12 remain `NOT EVALUATED`.
- Not included: the newer mixed entity/content-spine planning and tracker edits
  remain local and uncommitted. No tracker cell or historical record was changed
  by this publication.
- Next: review the draft and its exact-head CI; merge requires separate approval.
  Keep further private-operations work parked. The next proposed engineering
  step is the content-domain schema decision packet, before separately approved
  implementation.

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
- At this Phase 3 publication checkpoint, the legacy master tracker marked
  account/login, roles, session management, email verification, password reset,
  and login/signup screens Done. Its then-current formula summary was 19/148
  Done (12.8%), 46 In Progress, and 83 Not Started across five sheets. Those
  dated figures remain preserved in `Legacy Overview 2026-08-16`; current
  execution status now lives in the PLAN-aligned Delivery Tracker and Overview.

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

## Current Phase 2 worker-candidate evidence — verified 2026-08-19, published 2026-08-20

PR #11 published only a dedicated application-owned PostgreSQL candidate
harness, its isolated synthetic migration fixture, explicit scripts, and
architecture/status records. The harness is excluded from the production API
build, normal API test discovery, Prisma migrations, `db:deploy`, and runtime
paths.

| Command / check                           | Result                                                          |
| ----------------------------------------- | --------------------------------------------------------------- |
| `npm run test:phase2-worker-spike`        | ✅ published Prisma/privilege baseline, 5/5                     |
| `npm run test:phase2-worker-candidates`   | ✅ isolated migration/lifecycle candidate, 13/13                |
| Post-run PostgreSQL catalog audit         | ✅ 0 candidate databases / 0 candidate or compatibility roles   |
| Normal Prisma migration-ledger snapshot   | ✅ unchanged, using allowlisted non-log fields                  |
| `npm run test:api`                        | ✅ 17 files, 118/118 tests                                      |
| `npm run test`                            | ✅ 38 files, 166/166 web tests                                  |
| Contracts workspace tests                 | ✅ 1 file, 24/24 tests                                          |
| `npm run build`, `build:admin`, API build | ✅ web, private operations, contracts, database, and API builds |
| `npm run lint` / `npm run format:check`   | ✅ exit 0                                                       |
| `git diff --check`                        | ✅ exit 0                                                       |

PR #11 changed no application/runtime behavior, so the real-stack browser suite
was not rerun during the local evaluation. Publication CI passed on reviewed
head `b858bd1` in run `32347088768` and on merge commit `afdb59d` in run
`32347585996`, including the normal real-stack Playwright job. The 13-test
candidate suite remains an explicit local/opt-in evidence command rather than a
standard CI job.

## Current Phase 2 durable-worker verification — 2026-08-20

The separately approved application-owned foundation is implemented, verified,
and published through PR #13 merge `6311522`, preserving reviewed head
`8a8688f`. Exact-head run `32518256241` and post-merge run `32535922437` passed
all three jobs. Exact Node `v24.19.0`, npm `11.17.0`, and PostgreSQL 17 local
evidence:

| Command / check                               | Result                                                         |
| --------------------------------------------- | -------------------------------------------------------------- |
| Clean disposable `db:deploy`                  | ✅ all 7 repository migrations applied                         |
| Worker unit suites                            | ✅ 8 files, 87/87 tests                                        |
| Durable foundation integration                | ✅ 1 file, 10/10 tests                                         |
| Opt-in exact-role privilege proof             | ✅ 1/1; isolated database/roles removed                        |
| Full API suite                                | ✅ 26 files + 1 opt-in skip; 215/215 run tests passed          |
| Web suite                                     | ✅ 38 files, 166/166 tests                                     |
| Contracts suite                               | ✅ 1 file, 24/24 tests                                         |
| Published compatibility/candidate suites      | ✅ 5/5 and 13/13                                               |
| API/contracts/database, web, and admin builds | ✅ all production builds                                       |
| Hostile ambient `PGOPTIONS` startup smoke     | ✅ worker pins `READ COMMITTED`/timeouts and reaches ready     |
| Compiled canary + `SIGTERM` process smoke     | ✅ one effect, `SUCCEEDED`, clean pool close, exit 0           |
| Compiled fatal-transition process smoke       | ✅ one effect retained, job leased, bounded pool close, exit 1 |
| Prisma validation, lint, Prettier, diff check | ✅ exit 0                                                      |
| Post-run PostgreSQL catalog audit             | ✅ 0 generated Phase 2 databases and 0 generated Phase 2 roles |

The 100-canary capacity boundary is covered by racing the 100th and 101st
submissions: one succeeds, one receives the fixed capacity failure, and the
losing transaction leaves no orphan intent or job. The 1,000 global ceiling is
a future cross-kind defense and is not independently reachable while the
canary is the only job kind.

The final compiled-process checks exercise both normal and fatal lifecycle
paths. A deliberately hostile ambient `PGOPTIONS` value requested weaker
timeouts and non-`READ COMMITTED` isolation; the fixed pool startup
configuration overrode it, and the repository probe confirmed the required
isolation and grants before the worker reported ready. Normal work then created
one idempotent effect and drained on `SIGTERM`. An intentionally removed
completion routine in the disposable database made the worker stop claiming,
report degraded state without raw database details, drain, close its pool, and
exit 1 while leaving the effect-bearing job leased for recovery. The disposable
database was then removed.

The ordinary `pumdoki_dev` database was not reset or used as final migration
evidence. An early draft of the new migration had already been applied there
before hash-only idempotency and effect reconciliation were finalized. Its
ledger was not edited; repair or recreation still requires separate approval.

Following separate founder approval on August 20, the tracked working-copy
PostgreSQL Compose mapping now publishes `127.0.0.1:5432:5432`. The local `db`
container was recreated without removing its named volume. Before/after evidence matches:
PostgreSQL cluster identifier `7673277215565467682`, database OID `16384`,
PostgreSQL `17.10`, seven successful migrations, and sampled domain counts of
115 users, 849 sessions, 393 acceptance records, and 20 creator applications.
The recreated container is healthy, normalized Compose configuration and Docker
runtime publishers contain only `127.0.0.1`, and direct IPv4-loopback
connectivity passes.

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
- PostgreSQL and Mailpit host ports are now bound to IPv4 loopback. This removes
  the prior LAN-facing wildcard publisher, but it does not protect against
  other processes on the same host or containers on the Compose network.
  Restricted deployed credentials and network controls remain separate gates.
- Counsel must define acceptance-evidence retention and pseudonymization.
- Counsel-approved creator/payout/content policies, country eligibility, tax
  intake, and an identity provider with approved security/retention controls
  do not exist yet. Do not enable ID collection or creator approval.
- Published provider-neutral signed-assertion verification, exact operator/grant
  authorization, transaction-time rechecks, and request-integrity seams now
  exist on `dev` through PR #15. They are not production controls: there
  is still no live provider/issuer/key/origin, controlled operations-policy
  hardware-key enrollment/recovery, exact Access assertion evidence, operations
  session/server, restricted hosting, runtime DB grant, creator-
  review UI, globally immutable audit log, or deployment. Slice 2's dormant
  application-level evidence seam must remain unmounted, and G1–G12 remain
  `NOT EVALUATED`.
- The founder approved the seven private-operations policy decisions and the
  bounded local YubiKey claim-schema evaluation on 2026-08-24. Cloudflare
  remains an evaluation candidate. Both existing account hardware-key
  enrollments passed founder-attested Mac browser authentication on 2026-08-25,
  but no exact Access application assertion or signed hardware-method evidence
  has been reviewed, so this does not constitute verified private-admin access
  or hardware-backed assurance integration. The readiness packet in
  `docs/operations/` defines the future evidence gate without asserting current
  account state.
- Revisit Google Workspace signup/recovery privacy without recording personal
  contact details in this repository. Confirm directory visibility and current
  recovery factors, enroll an independent backup key/recovery path, and verify
  access before replacing any temporary contact so the privacy improvement does
  not create an account lockout.
- Production `BrowserRouter` host rewrites remain required.

## Next exact task

1. Review draft PR #17 and require full database-backed/API, lint/test/build,
   and Playwright CI on its exact final head. Do not mark it ready or merge
   without separate founder approval.
2. Keep further private-operations development parked. The August 30 approval
   publishes the completed Slice 4 only; it does not authorize provider
   selection, a real Access assertion test, live configuration, or deployment.
3. The next proposed engineering step is the Phase 5 content-domain decision
   packet for `Post`, `Media`, and `Follow`. Agree ownership, visibility,
   moderation/quarantine states, and access invariants with the founder before
   separately approved schema/migration implementation. No live R2 setup or
   fixture deletion is authorized by this publication.
4. Preserve the newer local entity/content-spine PLAN/HANDOFF revisions and
   mixed tracker edits, which are excluded from this PR. Their reconciliation
   and publication are a separate scope decision.
5. Do not repair or recreate the ordinary `pumdoki_dev` database without
   separate approval. Slice 3's database proof used disposable databases.
6. Keep the router unmounted, G1–G12 `NOT EVALUATED`, and creator approval,
   role promotion, identity collection, and publishing absent. Phase 2 remains
   partial; its deployment and operational gates remain open.
