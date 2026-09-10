# Pumdoki Detailed Implementation Plan

@CLAUDE.md

Last updated: September 10, 2026

## 1. Purpose

This plan turns the current frontend prototype into a secure, launchable adult creator platform. It is dependency-ordered: later phases should not be treated as complete until their prerequisites and exit criteria are satisfied.

The plan distinguishes:

- **Decision locked:** A product or vendor direction has been selected.
- **UI prototype:** A screen or interaction exists with mock data.
- **Backend implemented:** Server logic and persistence exist.
- **Integrated:** Frontend and backend complete the user flow.
- **Production-ready:** Security, compliance, tests, monitoring, and operational procedures are verified.

### Phase completion verification rule

`PLAN.md`, `CLAUDE.md`, and the current session handoff must be read together
before starting or resuming a phase.

A phase must not be described as **finished**, **complete**, or **verified**
until all of the following are true:

1. Every task required by that phase, or an explicitly documented and
   founder-approved reduced scope, is complete.
2. Every exit criterion for the phase is satisfied.
3. The relevant automated checks have been run after the final changes. At
   minimum, run the repository's lint, unit-test, and production-build commands
   when those commands apply. Run browser/E2E, API integration, database
   migration/seed, security, or infrastructure checks whenever the phase
   touches those areas.
4. The handoff records the exact commands run, their results, any warnings, and
   any tests that could not be run.
5. A failed, skipped, unavailable, or environment-blocked required check means
   the phase is not yet verified. Environment-specific failures must be clearly
   distinguished from product failures and rerun in a suitable environment.
6. Manual visual inspection may supplement automated tests, but it does not
   replace required automated verification.

If work is intentionally deferred, the phase must be labeled **partially
complete** or given a narrower name such as **foundation complete**. It must not
be reported as fully complete against the original phase definition.

## 2. Confirmed scope and assumptions

### Launch scope

- Store and Connect are launch-critical. Connect is creator discovery: filters for online status, price, language, and service, leading to profiles and real-time chat.
- Tipping, PPV content, and Send Love are launch scope.
- The original Oasis/Drimy game is cancelled by founder decision on September 6, 2026. Its possible streak/learning replacement is later work, not launch scope.
- Real-time direct messaging uses WebSockets and is mandatory at launch. Tipping/Send Love remains mandatory; Veso payments are deferred beyond beta by the September 9 decision below.
- Veso remains a deferred prepaid-value concept at 1 Veso = 1 USD. Recharge, wallet spending and Veso-funded purchases/tips are not beta launch requirements.
- The payment method for beta Store purchases, creator-service orders and tipping remains unresolved. This deferral does not approve a replacement checkout or remove those product features. Connect itself is discovery; a calendar/booking engine is not implied.
- Membership tiers are standardized across creators.
- Explicit content can be hidden or shown based on an adult member's preference.
- International creators, especially Latin American creators, are a core audience.
- Live streaming is post-MVP.
- Begin with a controlled pilot before public member registration. The proposed founding-creator programme may eventually reach about 500; that is not an initial operating-capacity commitment.

### Beta payment scope decision — September 9, 2026

The founder deferred Veso payments beyond beta because of implementation
complexity and the perceived high risk of the prepaid-credit model being
flagged during CCBill or Epoch review. This records the founder's risk
assessment, not a processor rejection or confirmed prohibition.

Veso recharge, prepaid balances and spending, promotional credits, transfers,
and their dedicated ledger/UI/operations work are deferred and do not gate
beta. Preserve the design for later reconsideration; it has no promised
release date or automatic post-beta activation. Revisit it only with explicit
scope, processor acceptance and targeted review of the actual funds flow.

Subscriptions, PPV, tipping and paid service-order intent remain in the launch
roadmap. A replacement beta payment model has not been selected or approved.
Resolve that model with the relevant product slice before monetized beta use;
entitlements, payment authenticity, refunds, reconciliation and creator-earnings
controls still apply to any enabled paid flow. This decision supersedes older
Veso-at-launch statements, including historical references in other repo docs.

September 10 UI direction: remove prepaid-credit items from all tracker tabs
and the website UI. Display prices in USD ($), with no emoji currency symbols.
The billing preview covers purchases, subscriptions and tips; it does not hold
member funds or process payments. Creator earnings remain separate.

### Current external dependencies

- CCBill is the intended primary adult payment processor.
- Epoch is the intended fallback/cascade processor.
- CCBill's first Sales reply was supplied September 9: it requires a fully
  functioning review site (password protection permitted), US business/owner,
  US business banking and principal ID. Detailed site scope, model eligibility,
  pricing and creator payouts remain unanswered; no merchant approval is reported.
- Cascade behavior has not been confirmed with either provider.
- The founder reports Kiban Digital Holdings LLC filed in Maryland through
  Northwest, awaiting state approval, as of September 8, 2026. An EIN,
  business bank account have not been verified; the formation purchase is
  recorded in the expense tracker.
- Legal policies have not been approved by counsel.
- Real support/compliance email mailboxes do not yet exist.

## 3. Recommended technical decisions

### 3.1 Language and framework

Recommendation:

- Keep the existing frontend in JavaScript while the structure is stabilized.
- Write all new backend and shared-contract code in TypeScript.
- Convert frontend files gradually when they are touched for backend integration.
- Use Node.js, Express, PostgreSQL, and Prisma unless a later proof-of-concept reveals a concrete blocker.

Why:

- TypeScript provides the most value at API, payment, entitlement, and ledger boundaries.
- A gradual conversion avoids pausing product work for a large rewrite.
- Express and Prisma match the proposed architecture and are approachable for a solo developer.

Decision gate:

- Confirm this stack before Phase 2 begins.

### 3.2 Authentication

Recommendation:

- Use one Pumdoki-owned authentication system as the source of truth.
- Support email/password first.
- Store sessions in secure, HTTP-only, SameSite cookies.
- Add Google or other OAuth providers as optional login methods later.
- Do not run two independent account systems.

Required capabilities:

- Registration.
- Email verification.
- Login/logout.
- Password reset.
- Session renewal.
- Session revocation.
- Role-based authorization.
- Accepted-policy version records.
- Age-attestation records.
- Admin-enforced suspension and logout.

Decision gate:

- Confirm whether optional Google login is required for the first beta.

### 3.3 Admin architecture

Decision locked — founder-confirmed August 3, 2026:

- Keep the public Pumdoki application free of `/admin` routes and admin links.
- Build a separately deployed private operations application in a future
  `apps/admin` workspace with its own layout, build, hosting, and access policy.
- Keep `ADMIN` in the backend role model and enforce every operational
  permission in the API. The separate deployment is defense in depth, not a
  replacement for authorization.
- Require a signed operations identity boundary with cryptographically verified,
  phishing-resistant, hardware-backed authentication assurance before launch,
  plus restricted access, audit logging, and separately permissioned sensitive
  records.

Why:

- The customer-facing app should not advertise or host the operations surface.
- Independent deployment reduces accidental coupling and allows a stricter
  authentication, network, release, and monitoring posture.
- API authorization remains mandatory because a private URL or hidden link is
  not a security boundary.

### 3.4 Email

Recommendation:

- Evaluate Amazon SES first because the planned infrastructure already uses AWS.
- Use a local mail-capture tool in development.
- Verify that the final provider supports the platform's lawful adult-content business model and expected complaint volume.
- Use `.example` addresses in prototypes until domains and real inboxes are configured.

Required transactional messages:

- Email verification.
- Password reset.
- Login/security alerts.
- Subscription receipt and renewal.
- Cancellation and failed payment.
- Veso recharge receipt — deferred beyond beta with Veso.
- Creator application received/approved/rejected.
- Content moderation and appeal notices.
- Chat-arranged service-order confirmation, cancellation and refund updates as required. Scheduled booking reminders remain deferred.
- Payout and tax-document notices.

Local implementation status:

- A provider-neutral mailer with local Mailpit SMTP and an explicit
  non-delivery console sink is implemented.
- Mailpit is part of the local Docker Compose stack and receives verification
  mail, password-reset mail, and the post-commit pending creator-application
  receipt.
- No production provider is selected. Adult-business support, production
  deliverability, authenticated TLS, DKIM, SPF, and DMARC remain open; the
  current mailer fails closed in production.

### 3.5 Identity verification

Recommendation:

- Price specialist identity/age-verification providers before choosing manual verification.
- For a tightly controlled private beta, a manual workflow may be used only after a documented security and legal design exists.
- Design the database and API so a third-party provider can replace manual review without changing creator accounts.

Manual beta requirements:

- Dedicated encrypted storage separate from public media.
- Strict admin roles.
- Access audit logs.
- No identity documents in application logs.
- Defined retention and deletion rules.
- File signature and malware validation.
- Review decision, reason, reviewer, and timestamp.
- Escalation process for mismatches or suspected fraud.

### 3.6 International rollout

Recommendation:

- Do not enable every country on day one.
- Start with a controlled country allowlist.
- Prioritize the United States and selected Latin American countries supported by identity verification, payments, payouts, tax collection, and legal review.
- Add the EU/EEA only after GDPR, DSA, cookie-consent, data-request, and consumer-rights workflows are production-ready.

Country-enablement checklist:

- Adult content is lawful for the intended service.
- Processor accepts members from the country.
- Creator payout method is available.
- Identity verification supports local documents.
- Tax forms and withholding are understood.
- Privacy and deletion requests are operational.
- Sanctions screening is supported.
- Support language and policy translations exist.

### 3.7 Provisional upload limits

Initial cost-conscious recommendation:

- Images: JPEG, PNG, or WebP; 20 MB per image.
- Image sets: maximum 50 images per post during beta.
- Video: MP4 or WebM; 1 GB and 30 minutes per file during beta.
- Audio: MP3, AAC, M4A, or WAV; 250 MB per file.
- Creator avatar: 10 MB.
- Banner: 20 MB.
- Identity documents: JPEG, PNG, or PDF; 10 MB each.

Implementation principles:

- Upload media directly to Cloudflare R2 with short-lived signed requests.
- Never proxy large media through the main API process.
- Keep original protected media private.
- Generate thumbnails and delivery variants asynchronously.
- Revisit limits after measuring storage and processing costs in beta.

### 3.8 Commission and payout model

Do not lock a final percentage until CCBill and Epoch provide actual pricing.

The model must specify whether the creator percentage is calculated from:

1. Gross member price.
2. Gross price after taxes and refunds.
3. Net processor proceeds after direct payment costs.

Recommended modeling exercise:

- Compare platform fees of 20%, 25%, and 30%.
- Model processor fees at 10%, 12%, and 15%.
- Include chargebacks, refunds, storage, support, verification, and taxes.
- Model a Founding Creator discount of five percentage points.
- Define whether the Founding rate is permanent or time-limited.

Provisional recommendation:

- Avoid promising an 80/20 gross split until processor economics are known.
- Prefer a clearly disclosed creator share of net eligible receipts if high-risk processor fees make gross accounting unsustainable.
- Keep creator earnings and platform revenue separately auditable. If Veso is later approved, its member-credit ledger must remain separate from creator earnings; the Veso-specific implementation is deferred beyond beta.

### 3.9 Durable async work, shared throttling, and idempotency

Decision locked — founder-confirmed August 18, 2026:

- PostgreSQL is the durable authority for job/outbox acceptance,
  operation-specific idempotency, provider-event receipts, and consequential
  business effects.
- Redis is limited to shared throttling and ephemeral coordination. It is never
  the sole record for sessions, accepted/completed work, payments, Veso,
  entitlements, or creator-review outcomes.
- Workers process at least once. Handlers must be idempotent, retries and leases
  are bounded, poison work is isolated, and replay is separately authorized and
  evidenced.
- Redis outages follow explicit conservative route policies and never create an
  unlimited path.
- This approval covers the provider-neutral
  [Phase 2 architecture record](docs/architecture/phase2-async-work-throttling-idempotency.md)
  and local verification only. It does not select a library/provider, authorize
  spend or provisioning, deploy infrastructure, change live configuration, or
  activate private operations.

## 4. Phase 0 — Baseline, tracker, and scope control

### Tasks

1. Preserve the current frontend state in a clean Git commit.
2. Review all existing uncommitted legal/profile work.
3. Reclassify tracker rows by PLAN phase, keep the five implementation-maturity
   states separate from workflow, and preserve the legacy source rows.
4. Mark processor selection separately from processor integration.
5. Mark existing Wallet, legal, onboarding, and Oasis screens as UI prototypes.
6. Confirm the exact MVP list in writing.
7. Preserve Store, discovery-focused Connect, tipping, PPV, Send Love, WebSockets, and explicit-content controls as product launch scope. Veso payments/recharge are deferred beyond beta by the September 9 decision; the beta payment model remains unresolved. The old Oasis game is cancelled.
8. Keep live streaming in post-MVP backlog.
9. Create an open-decision register for:
   - Commission.
   - Founding Creator economics.
   - Payout cadence.
   - LLC state.
   - Identity provider.
   - Email provider.
   - Launch country allowlist.
   - Refund policies for the agreed beta payment model; Veso policies deferred beyond beta.
10. Replace fake production claims with clearly marked prototype copy before any public deployment.

### Exit criteria

- Clean Git baseline.
- No accidental prompt Markdown files.
- Tracker reflects product reality.
- MVP scope approved.
- Every unresolved business/legal decision has an owner and due date.

## 5. Phase 1 — Repository and frontend foundation

### Tasks

1. Use npm workspaces for `apps/*` and `packages/*`.
2. Keep the existing React application in `apps/web`.
3. Create the `apps/api` backend workspace.
4. Add React Router.
5. Replace `currentPage` navigation with stable routes.
6. Support refresh and browser Back/Forward on every page.
7. Introduce route groups:
   - Public/auth.
   - Member.
   - Creator.
   - Legal.
8. Create a shared application shell.
9. Extract shared header, sidebar, mobile navigation, profile menu, notifications, and chat rail.
10. Move mock data to development fixtures.
11. Add an API client with:
    - Base URL configuration.
    - Credentials.
    - Typed errors.
    - Request IDs.
    - Unauthorized-session handling.
12. Add ESLint and Prettier.
13. Add Vitest and React Testing Library.
14. Add Playwright.
15. Add environment validation.
16. Add `.env.example`.
17. Add GitHub Actions for install, lint, test, and build.
18. Add error boundaries and route error states, including a branded,
    accessible 404 page for unknown URLs with clear Back, Home, and Sign-in
    actions appropriate to the visitor's session state.
19. Add loading, empty, and retry states to core pages.
20. Lazy-load feature routes behind an accessible shared loading state while
    keeping critical recovery routes eager.

Implemented, published, and CI-verified — August 16, 2026: unknown URLs retain
their requested path and render a branded 404. Anonymous visitors receive Back
and Sign-in recovery; authenticated visitors receive Back and Home; `/admin`
remains a generic unknown route. Unresolved sessions are never guessed, and an
authentication outage exposes retry. Feature pages are route-split behind the
shared loading state. PR #2 merged into `dev` as `1189404` after GitHub Actions
run `31948805621` passed at reviewed head `3e5646d`; see `HANDOFF.md` for test
and bundle measurements.

### Exit criteria

- Root install and build succeed.
- Real URL routes work.
- Shared layout duplication is reduced.
- CI validates every branch.
- Frontend is ready to consume APIs.
- Run `npm run lint` with zero errors and record any warnings.
- Run `npm run test` with all unit tests passing.
- Run `npm run build` successfully.
- Run `npm run test:e2e` with all Phase 1 browser tests passing. The browser
  suite must cover direct URL loads, refresh/deep links, the branded
  unknown-route state without a silent login redirect, and browser Back/Forward
  behavior on representative routes.
- Manually smoke-test the public, member, creator, legal, Store, Connect,
  Wallet, Oasis, and dashboard routes in the development server.
- Record the verification commands and results in the current handoff before
  marking Phase 1 complete.

## 6. Phase 2 — Backend and database foundation

### Tasks

1. Initialize TypeScript in `apps/api`.
2. Add Express and production middleware.
3. Add PostgreSQL and Prisma under `packages/database`.
4. Create shared schemas in `packages/contracts`.
5. Define `/api/v1`.
6. Implement consistent API errors.
7. Add request validation.
8. Add request IDs and structured logging.
9. Add health/readiness endpoints.
10. Add rate limiting and brute-force protection.
11. Add a background-job queue.
12. Add an idempotency framework.
13. Add database migrations and development seeds.
14. Define local, staging, and production environments.
15. Deploy staging API and RDS.
16. Configure automated backups.
17. Test one database restoration.
18. Add Sentry or an equivalent error tracker.

Architecture status — August 21, 2026:

- The provider-neutral design for tasks 11 and 12 is founder-approved and
  recorded in
  `docs/architecture/phase2-async-work-throttling-idempotency.md`.
- PR #8 published that decision to `dev` as merge commit `a126554` after all
  three CI jobs passed at reviewed head `2ba21a9`.
- The separately authorized local
  [worker compatibility and privilege spike](docs/architecture/phase2-worker-compatibility-spike.md)
  passed 5/5 focused tests. It proved Prisma-transaction enqueue, synthetic
  migration/API/worker role separation, two-worker `SKIP LOCKED` claims, and
  stale-lease-token rejection, then removed every temporary role and schema.
  PR #9 published this proof to `dev` as merge commit `5c19af0` after exact-head
  GitHub Actions run `32194178253` passed all three jobs.
- The separately authorized
  [Node 24 runtime baseline](docs/architecture/node24-runtime-baseline.md) is
  locally verified on exact Node `v24.19.0` / npm `11.17.0`. It aligns engines,
  Node typings, CI action runtimes, and local guidance; all web, contract, API,
  spike, build, migration/seed, and 46-browser-test gates pass. It adds no
  worker, provider, schema, service, deployment, or live configuration. PR #10
  published it as `9a36b19`; final-head run `32306324892` and post-merge run
  `32306625394` passed all three Node 24 jobs.
- The follow-up
  [worker candidate evaluation](docs/architecture/phase2-worker-candidate-evaluation.md)
  rejects unchanged Graphile Worker `0.17.3` and pg-boss `12.27.0` because
  neither satisfies mandatory per-attempt fencing. The application-owned
  isolated migration/lifecycle suite passes 13/13 local tests and, together
  with the published 5/5 Prisma proof, is the provisional local leading
  pattern. It remains outside normal migrations, the production build, normal
  API test discovery, and runtime paths; it is not a production selection or
  durable implementation. PR #11 published this evidence as merge commit
  `afdb59d`; final-head run `32347088768` and post-merge run `32347585996`
  passed all three jobs.
- The founder separately approved local implementation and verification of the
  provisional application-owned pattern on August 20, 2026. The resulting
  [durable worker foundation](docs/architecture/phase2-worker-foundation.md)
  adds a production-shaped migration, separate worker process, and fixed
  non-secret idempotent canary. Clean disposable-PostgreSQL verification,
  exact-role proof, full regression suites, and compiled normal/fatal process
  checks pass. Later approvals authorized staging, committing, and pushing its
  feature branch, opening draft PR #13, and then merging its reviewed head.
  PR #13 merged into `dev` as `6311522`, preserving head `8a8688f`; exact-head
  run `32518256241` and post-merge run `32535922437` passed all three jobs. It
  has no public enqueue route and moves no current product flow to async work.
- The separately approved local-network hardening now binds the tracked
  working-copy PostgreSQL Compose host port to `127.0.0.1:5432`. A
  container-only recreate
  preserved the named volume, cluster/database identity, seven successful
  migrations, and sampled domain-row counts; no database reset or repair was
  performed.
- No shared throttle store, Redis dependency, reusable general idempotency
  framework, deployed worker credentials, or product-flow queue is
  implemented.
- Phase 2 remains partially complete until the implementation tasks and the
  existing HTTPS staging, restore, and monitoring exit criteria pass.

### Initial data domains

- Users.
- Sessions.
- Roles and permissions.
- Creator profiles.
- Creator applications.
- Agreements and policy versions.
- Membership tiers.
- Posts and media.
- Follows.
- Reactions, comments, and bookmarks.
- Subscriptions and entitlements.
- Veso accounts and ledger entries — deferred beyond beta; other payment/earnings records depend on the agreed payment model.
- Store purchases.
- Creator services and chat-arranged orders; automated scheduling/bookings require a later scope decision.
- Conversations and messages.
- Reports, moderation actions, and appeals.
- Admin audit events.
- Later streak/learning retention data only after a separate product definition; old Drimy/Orb/inventory requirements are cancelled.

### Exit criteria

- Staging API is available over HTTPS.
- Migrations are repeatable.
- Backups and restoration are tested.
- Logging and monitoring work.

## 7. Phase 3 — Authentication, roles, and settings

### Tasks

1. Register member accounts.
2. Hash passwords using a modern password-hashing algorithm.
3. Create secure server sessions.
4. Implement email verification.
5. Implement password reset.
6. Implement logout and revoke-all-sessions.
7. Create Member, Creator, Moderator, and Admin roles.
8. Enforce permissions in the API.
9. Record age attestation.
10. Record accepted Terms and Privacy versions.
11. Add account suspension and ban states.
12. Build Settings:
    - Profile.
    - Email.
    - Password.
    - Active sessions.
    - Notifications.
    - Theme.
    - Explicit-content preference.
    - Billing.
    - Data export.
    - Account deletion.
13. Default explicit content to hidden.
14. Add an explicit-content opt-in gate for adults.
15. Add optional OAuth only after core auth is stable.

### Founder-approved Phase 3 transition scope — August 1, 2026

The founder approved closing Phase 3 on the core authentication and account-
security scope delivered through Slice 4B, rather than pulling later product
domains forward solely because they have future Settings entries:

- Notifications move with persisted notifications and messaging in Phase 9.
- Billing moves with subscriptions, processors, and receipts in Phase 7.
- Data export and account deletion require the Phase 4 legal/retention design
  and final pre-launch privacy verification. Acceptance evidence must never be
  cascade-deleted.
- Theme selection moves with the shared design-system/theme implementation.
- Server-side explicit-content filtering moves with real content APIs in
  Phase 5; the persisted default-hidden preference and deliberate Settings
  control are the Phase 3 boundary.
- Optional OAuth remains deferred until first-beta requirements justify it.

This is a reduced Phase 3 scope, not a claim that every item in the original
Settings list is implemented.

### Exit criteria

- Authentication persists across refresh.
- Protected pages reject unauthorized users.
- Admin permissions are server-enforced.
- Explicit-content preference persists safely and is exposed through the
  protected frontend Settings flow. Real content-query enforcement is a Phase
  5 exit criterion because Phase 3 has no content API to filter.

### Current implementation status — August 2, 2026

- Phase 3 is split into four separately specified and verified slices: core
  auth backend, email flows, frontend auth integration, and Settings.
- Slice 1, core auth backend, is implemented and locally verified: Argon2id
  registration/login, opaque server sessions, logout/logout-all, `/me`,
  runtime suspension checks, role middleware, age attestation, and versioned
  Terms/Privacy acceptance records.
- Slice 2, email verification and password reset, is implemented and locally
  verified: provider-neutral mail, Mailpit, hashed and expiring single-use
  tokens, reissue invalidation, verification/reset endpoints, session
  revocation after reset, request throttling, and the verified-email middleware
  seam.
- Slice 3, frontend auth integration, is implemented, published, and
  CI-verified:
  nested API errors, persistent cookie-backed auth restoration, live
  Login/SignUp/logout, canonical role guards, requested-route restoration,
  verification/reset screens, the unverified-email banner, and real
  API/PostgreSQL/Mailpit browser flows.
- Acceptance records use restrictive deletion. A future account-deletion flow
  must deactivate/pseudonymize according to a counsel-approved retention
  schedule rather than cascade-delete legal evidence.
- Slice 4A was committed as `7972bf2`. It adds a one-to-one persisted
  preference with a default-hidden migration/backfill, authenticated
  `GET/PATCH /me/preferences`, a protected Settings page, deliberate opt-in,
  immediate opt-out, and unit/API/browser coverage.
- Slice 4B was committed as `d55f5f3`. Protected Settings now
  supports display-name editing, current-password-confirmed email change with
  reverification, current-password-confirmed password change, and active-
  session listing/revocation. Sensitive changes invalidate stale tokens and
  revoke every other session while preserving the current browser.
- The founder-approved Phase 3 core scope is published on `dev` through
  `d55f5f3`. GitHub Actions run `30728045838` passed web, API, private-admin
  build, and real-stack Playwright jobs, so Phase 3 is complete.
- Notification, theme, billing, data-export, and deletion Settings are
  intentionally sequenced to the dependency phases listed above.
- Explicit-content enforcement in server-side feed/content queries remains a
  Phase 5 integration because real content APIs do not yet exist. The client
  preference alone must not be treated as enforcement.
- Durable slice designs live in `docs/architecture/`; the Slice 3, Slice 4A,
  and Slice 4B records are `phase3-slice3-frontend-auth-integration.md`,
  `phase3-slice4-settings-preferences.md`, and
  `phase3-slice4b-account-security-settings.md`.
- Phase 2 remains partially complete while its cloud/operations remainder is
  tracked separately.

## 8. Phase 4 — Legal, trust, and creator onboarding

### Legal workstream

1. Complete the founder-selected Maryland formation of Kiban Digital Holdings
   LLC through Northwest; the founder reports it filed and awaiting state approval.
2. When approval arrives, verify the approved name, formation documents and
   agent/address details; retain private documents outside the repository.
3. Obtain the EIN after state formation, avoiding a duplicate request if
   Northwest is handling it, then arrange a bank account accepting the actual
   adult-platform business. The [IRS](https://www.irs.gov/businesses/employer-identification-number)
   provides EINs free and says to form the entity before applying.
4. Check Pumdoki trade-name registration and routine filing obligations through
   official instructions. Use paid advice only if a concrete issue needs it.
5. Obtain the actual processor requirements before paying for tailored legal work.
6. Prepare drafts using founder work and suitable Fiverr specialists. Obtain
   substantive review from qualified counsel for the applicable adult-platform,
   consent/records, privacy and contract questions before relying
   on those drafts or implementing dependent sensitive workflows.
   Prepaid-value review accompanies any later reconsideration of Veso; it is
   not a beta prerequisite solely because Veso remains in the deferred roadmap.
7. Draft and obtain the applicable review/approval for:
   - Terms of Service.
   - Privacy Policy.
   - Cookie Policy.
   - Creator Agreement.
   - Payout Terms.
   - Acceptable Use Policy.
   - Community Guidelines.
   - DMCA Policy.
   - NCII/TAKE IT DOWN process.
   - Anti-trafficking policy.
   - Appeals policy.
   - Complaint policy.
   - Law-enforcement request policy.
   - Refund terms for enabled paid flows. Veso terms are deferred beyond beta.
8. Configure real operational mailboxes only after ownership and workflows exist.

### Creator onboarding implementation

1. Version creator agreements.
2. Record acceptance timestamp, IP, user, and document version.
3. Collect creator profile information.
4. Collect tax residency and required forms.
5. Collect government ID and verification selfie.
6. Review or submit to identity provider.
7. Approve, reject, or request more information.
8. Record reviewer and reason.
9. Add sanctions and prohibited-region screening.
10. Block publishing until approval.
11. Add performer records and releases.
12. Support more than one performer per media item without creating a complicated public UI.
13. Link every explicit media item to required performer records.

### Current Phase 4 implementation status — reviewed August 30, 2026; activation state unchanged

- Slice 1, the creator-application foundation, is implemented, published on
  `dev` as commit `ce6c9e4`, and CI-verified by GitHub Actions run
  `30739645872` (API, web/private-admin, and real-stack Playwright jobs all
  passed).
- A verified `MEMBER` can submit exactly one creator application containing a
  creator-facing name and two-letter country code. The API returns a persisted
  `PENDING` application with identity verification `NOT_STARTED`.
- The application and three append-only acceptance records (prototype creator
  agreement, content policy, and identity-verification disclosure) are created
  atomically with user, version, timestamp, and request IP.
- Submission does not change the member's role. The profile menu shows
  **Apply to become a creator** only to members and **Creator Dashboard** only
  to creators; a pending applicant cannot access `/dashboard`.
- Revisited applications load the persisted outcome. Duplicate submissions,
  anonymous users, unverified users, non-members, false acceptances, and
  malformed country codes are rejected.
- Founder manual acceptance completed on August 3, 2026: all six Slice 1
  review checks passed, including blocking unverified submission, persisting
  the `PENDING` / `NOT_STARTED` result after reload, role-correct navigation,
  and denying direct `/dashboard` access to non-creators.
- The old simulated ID/selfie upload, hardcoded payout economics, unsupported
  security/retention claims, review-time promise, and direct Dashboard redirect
  were removed. No identity files leave the browser.
- The durable boundary and provider prerequisites are documented in
  `docs/architecture/phase4-slice1-creator-application-foundation.md`.
- Slice 2 is published on `dev` through PR #1 merge commit `e7352c8`. Its
  private-operations boundary, exact non-approval state machine, concurrency
  rule, evidence limitations, exclusions, and activation blockers are specified
  in `docs/architecture/phase4-slice2-private-creator-review.md`.
- The normal public API does not mount the creator-review router. The dormant
  router requires an injected operations verifier, rejects public-session-only
  access by construction, and permits only `PENDING → NEEDS_INFORMATION`,
  `PENDING → REJECTED`, and `NEEDS_INFORMATION → REJECTED` through an atomic
  expected-status update plus evidence insert. Approval, role promotion, and
  identity-status mutation remain absent.
- The final Slice 2 engineering and CI verification is green: all six
  migrations deploy to PostgreSQL 17, focused migration/review coverage passes
  10/10, the full API suite passes 90/90, the web suite passes 133/133, and the
  real-stack Chromium suite passes 40/40. GitHub Actions run `31947756634`
  passed all three jobs at reviewed head `e83b027` before PR #1 merged.
- Slice 3 is published on `dev` through PR #15 merge commit `24e1653`; its
  implementation began at `9904334`. It adds strict provider-neutral signed-
  assertion verification, database-owned exact operator/permission
  authorization, same-transaction reauthorization, and test-only request-
  integrity seams for the dormant review router. Post-merge GitHub Actions run
  `32784338614` passed the API, web/private-admin, and real-stack Playwright
  jobs.
- Slice 3 local verification passed 287/287 API tests, 166/166 web tests,
  24/24 contract tests, and 15/15 focused migration/review cases. All eight
  repository migrations applied to a clean disposable PostgreSQL 17 database,
  and a second deploy was a no-op.
- Slice 3 does not mount the router or add a production provider, issuer/key
  service, operations session/server, private origin, runtime database role,
  operator, live configuration, deployment, `APPROVED`, role promotion, or
  identity workflow. G1–G12 remain `NOT EVALUATED`; publication did not
  authorize deployment or activation.
- On August 24 the founder approved all seven private-operations policy
  decisions, including founder-only initial operation, two separately stored
  hardware keys, an isolated origin/session, controlled provisioning and
  offboarding, separated recovery and break glass, independent audit and
  disablement, and the exact two-lock identity-plus-Pumdoki-authorization
  policy. The durable record is
  `docs/architecture/phase4-private-operations-founder-policy-decisions.md`.
- Slice 4 was merged through [PR #17](https://github.com/QK-Connoisseur/PDoki/pull/17)
  in consolidation `56cb0ad` on September 6, preserving implementation `317abda`
  and reviewed head `25057bd`. Original CI `33337682290` and combined integration
  CI `34026349075` both passed all three jobs. The consolidation also includes
  the notification bell and current static themes. HANDOFF.md records publication
  evidence; Git refs are authoritative for current dev/main tips.
  Publication does not restart further private-operations development.
  The unmounted candidate verifier and credential-redaction
  coverage passed `66/66` focused tests on Node `24.19.0`, with focused
  TypeScript, API build, scoped ESLint, Prettier, and import/mount checks green.
  On August 25 the founder independently authenticated the existing primary
  USB-C and backup USB-A Cloudflare account hardware-key enrollments on the new
  Mac. This limited browser-compatibility evidence does not inspect the exact
  candidate Access application, a signed assertion or hardware-method claim,
  AAGUID, policy precedence, or controlled recovery separation. Cloudflare is
  not selected and G1–G12 remain `NOT EVALUATED`.
- The non-secret [operations readiness packet](docs/operations/README.md)
  provides activation, recovery, configuration, provider-decision, and future
  staging-verification templates. It records no live control, selects no
  provider, and does not authorize deployment or mounting the dormant router.
- This is not creator onboarding completion: counsel-approved policies, legal
  entity work, country eligibility, tax intake, an approved identity provider,
  private operations authentication/review, production-grade reviewer audit
  controls, performer records, and publishing gates remain open.

### Reporting and compliance operations

1. Content report form.
2. Account report form.
3. NCII notice form.
4. DMCA notice and counter-notice.
5. TAKE IT DOWN intake and 48-hour workflow.
6. Trafficking escalation.
7. CSAM escalation and required reporting.
8. Appeal intake.
9. Evidence preservation.
10. Immutable admin audit log.

### Exit criteria

- Counsel-approved launch policies exist.
- Creator identity and agreement records are secure.
- No unapproved creator can publish.
- Reports can be received, triaged, actioned, and audited.

## 9. Phase 5 — Media pipeline and content model

### First local content flow — September 9, 2026

The founder authorized starting the bounded
[content model and access-rule design](docs/architecture/phase5-slice1-content-model-and-access-design.md)
while awaiting Maryland approval and the CCBill response. The local draft covers
content/revision/asset/offer identities, upload and publication states,
server-side access rules, feed/Store/chat boundaries, and synthetic acceptance
cases. The two definition tasks remain in review; human technical review remains
pending under §20. The [first local content implementation](docs/architecture/phase5-local-content-flow.md)
now has contracts, a content/media migration, private PNG/JPEG/MP4 processing,
draft/publish/remove APIs and a real `/home` feed for verified test accounts.
Phase 5 is partially implemented; its production exit is not complete.

The design itself remains a design artifact. The implementation accepts only
safe samples, refuses production/remote activation, and retains the default
disabled prototype mode. Private drafts, publication, media access and removal
have real server enforcement; prices, paid entitlements and live operations are
not simulated into this path. The founder activated R2 ($0 due at activation),
created `pumdoki-review-media`, and saved scoped credentials locally. Actual
cloud photo/video upload, private access, restart persistence, removal and both
browser paths passed; the bucket overview shows Public Access Disabled.
Founder review of the working local flow is next. P04 eligibility/operations
and P06 grants remain live-use dependencies; synthetic evidence cannot replace
them for real users. Apply targeted technical review to the concrete flow before
live sensitive use. See §20 for the superseding work order.

### Planned production upload lifecycle (not the local adapter)

1. Creator requests a signed upload.
2. API checks role, creator status, and quota.
3. API creates a pending media record.
4. Browser uploads directly to a private quarantine bucket/prefix at R2, the selected storage direction; safe-sample integration is verified, while this production upload lifecycle remains unimplemented.
5. Browser confirms completion.
6. Background worker validates the actual file.
7. Worker creates thumbnails and optimized variants.
8. Content enters moderation.
9. Approved content moves to a publishable protected location.
10. Member requests access.
11. API checks entitlement or purchase.
12. API authorizes each protected delivery request; do not expose a reusable storage URL that bypasses later removal checks. See the content/access design.

### Content visibility

Content offers support individual photos/videos or bundles. Creators can offer
pay-to-view content as feed posts and send locked content through chat. Both
delivery surfaces use server-enforced purchase entitlements.

- Public.
- Followers.
- Any subscriber.
- Specific standardized tier.
- PPV purchase entitlement; Veso funding is deferred beyond beta and the beta payment method remains unresolved.
- Scheduled.
- Draft.
- Removed.
- Quarantined.

### Required protections

- Private R2 originals.
- Short signed URL lifetimes.
- No protected URL in public feed payloads.
- Server-side entitlement checks.
- File signature verification.
- Malware scanning.
- Thumbnail separation.
- Optional visible watermarking.
- Takedown invalidates active access.

### Exit criteria

- Approved creator can publish.
- Unauthorized member cannot access protected originals.
- Subscriber and PPV access are enforced by the API.
- Removed content is no longer deliverable.

## 10. Phase 6 — Veso, payments, subscriptions, tipping, and PPV

### Beta boundary — September 9, 2026

Veso-specific work below is retained as deferred beyond beta. Do not mark the
whole mixed payment phase deferred or complete: any selected beta payment,
subscription, PPV or tipping flow still needs its implementation, processor
acceptance and financial/access controls. The beta funding/checkout approach
is unresolved; direct currency checkout or any other replacement is not
approved by removing Veso. Beta acceptance excludes the explicitly deferred
Veso cases, while full Phase 6 completion remains subject to its actual scope.

### Veso product rules to finalize — deferred beyond beta

1. Minimum recharge.
2. Maximum account balance.
3. Recharge packages and optional bonuses.
4. Refund eligibility.
5. Expiration policy.
6. Regional restrictions.
7. Transfer rules.
8. Treatment of promotional Vesos.
9. Chargeback handling.
10. Account closure handling.
11. Creator conversion from earned Vesos to payable balance.
12. Whether taxes are included or added.

### Ledger requirements and deferred Veso accounts

- Store monetary values in integer minor units. Veso denomination rules remain part of its deferred design.
- Never update a balance without a ledger transaction.
- Use separate accounts for:
  - Member purchased Veso — deferred beyond beta.
  - Member promotional Veso — deferred beyond beta.
  - Creator pending earnings.
  - Creator available earnings.
  - Platform revenue.
  - Processor clearing.
  - Refund and chargeback reserves.
- Every payment webhook is idempotent.
- Every purchase references immutable ledger entries.

### Processor work

1. CCBill's initial reply is received. The founder cancelled the clarification follow-up and directed work toward a functioning review site. Return to CCBill with that site; model, fee/reserve and payout decisions remain unresolved until confirmed. Formal approval is separate from development.
2. Begin Epoch discussion after core policies and entity details are ready.
3. Confirm cascade support in writing.
4. Define the beta payment model and implement CCBill checkout only for the agreed, processor-supported flow. Veso funding is excluded from beta.
5. Store raw webhook events.
6. Verify webhook authenticity.
7. Handle sale, rebill, failure, cancel, expiration, refund, and chargeback.
8. Add webhook retry and replay.
9. Implement Epoch only after the integration model is confirmed.
10. Add reconciliation reports.

### Subscription work

1. Standardized tier catalog.
2. Creator activates permitted tiers.
3. Member checks out.
4. Webhook activates subscription.
5. Entitlement grants access.
6. Renewal extends access.
7. Failed renewal enters grace state.
8. Cancellation stops future rebilling.
9. Expiration revokes access.
10. Refund/chargeback applies business rules and audit events.

### Veso recharge UI — deferred beyond beta

The retained later concept is to select a recharge package, choose an available
payment method/provider, then complete checkout. Balance becomes spendable after
verified successful payment confirmation; show a pending state when confirmation
is delayed. A browser success redirect alone must never credit Veso. Bank/card
authentication may add a step, and payment confirmation is distinct from final
settlement to Pumdoki. Start with one approved adult processor; additional
processors share the same ledger and add reconciliation/integration work.

CCBill documents [tokens/credits for adult live-cam platforms](https://ccbill.com/industries/live-cams),
[hosted FlexForms](https://ccbill.com/doc/flexforms-overview) and
[payment lifecycle webhooks](https://ccbill.com/doc/webhooks-user-guide).
These establish technical feasibility, not approval of Pumdoki's exact prepaid
credit, content/service, country and creator-payout model. Retain this research
for any later Veso reconsideration; it does not require Veso review or
implementation for beta.

1. Current balance.
2. Recharge presets.
3. Custom amount if processor permits.
4. Clear 1 Veso = 1 USD explanation.
5. Recharge total and fees/taxes.
6. Payment method.
7. Terms/refund link.
8. Purchase confirmation.
9. Receipt.
10. Recharge history.

### Tipping and PPV

- Send Love remains product scope; its beta payment method is unresolved. The Veso transfer from member credits to creator pending earnings is deferred beyond beta.
- PPV purchase creates a permanent or policy-defined entitlement.
- PPV offers may contain one photo/video or a bundle, surfaced in feed posts or chat; the API verifies access to each included asset.
- Insufficient Veso opening the recharge flow is deferred beyond beta.
- Repeated clicks use idempotency keys.
- Refunds update both entitlement and ledger state.

### Exit criteria

- The agreed beta payment model is explicitly scoped and accepted before any live paid flow; payment effects and creator earnings reconcile.
- Subscription lifecycle is webhook-driven.
- Refunds and chargebacks reconcile.
- Deferred Veso exits, not beta gates: test recharge updates its ledger; Store/service orders, Send Love and PPV consume Veso correctly. These stay incomplete until the later Veso scope is implemented and verified.

## 11. Phase 7 — Core end-to-end vertical slice

Complete the applicable flow before broad feature expansion. The beta version
uses the separately agreed payment model; it requires no Veso recharge or
Veso-funded tip. No replacement model is selected by this record. Paid steps
remain unimplemented until that model and its controls are resolved.

1. Member registers.
2. Member verifies email.
3. Creator registers.
4. Creator accepts agreements.
5. Creator completes identity verification.
6. Admin approves creator.
7. Creator configures standardized tiers.
8. Creator uploads protected media.
9. Moderator approves media.
10. Member starts checkout through the agreed beta payment model; Veso recharge is deferred beyond beta.
11. Member subscribes or buys PPV.
12. Trusted processor event confirms payment.
13. Member receives the correct entitlement.
14. Member accesses protected media.
15. Member sends a tip through the agreed beta payment model; Veso funding is deferred beyond beta.
16. Creator sees pending earnings.
17. Cancellation or expiration changes access correctly.
18. Admin can inspect the full audit trail.

### Exit criteria

- The agreed beta flow passes automated integration and E2E tests, with deferred Veso cases identified separately rather than reported as passed.
- No manual database edits are required.

## 12. Phase 8 — Feed, social actions, Store, and Connect

### Feed

1. Following feed from real followed creators.
2. Simple For You ranking using recency, follows, engagement, and safety eligibility.
3. Pagination.
4. Reactions/Kokoros.
5. Comments.
6. Bookmarks.
7. Follow/unfollow.
8. Locked previews.
9. Explicit-content filtering.
10. Report and block actions.

### Store

1. Four medium cards at common large-desktop widths.
2. More columns only on genuinely wider screens.
3. Minimum practical thumbnail width.
4. 16:9 thumbnails.
5. Video duration and photo/audio type badges.
6. Search.
7. Price filters.
8. Content-type filters.
9. Creator filters.
10. Trending and Recent sorting.
11. Purchased.
12. Favorites.
13. Liked.
14. History.
15. Product-detail view.
16. Purchase through the agreed beta payment flow; Buy with Veso is deferred beyond beta.
17. Veso recharge fallback — deferred beyond beta.
18. Responsive mobile layout.

### Your Activity — LEG-MT-080, moved into P08 September 10, 2026

The founder moved the member Your Activity page from Post-MVP into the main
delivery workflow and authorized its UI now. P08 owns it alongside reactions
and Store Purchased/Liked/History. Its complete implementation depends on P03
authenticated accounts, P05 content, the agreed P06 payment/subscription
records and the P07 purchase-to-access flow. It is a member history view, not
the private P11 operations audit log.

The `/activity` UI is an **In Progress / UI Prototype** slice: the shared
sidebar's Your Activity item and the desktop/mobile profile menu open a page
for likes, purchases, subscriptions and payments. Search and category/date
filters operate on explicitly labeled example records. It uses the existing
Sakura Kiss and Midnight City themes and plain USD amounts. This UI does not
read real account history or activate any payment or subscription operation.

Remaining P08 work: implement authenticated, paginated member-history reads
from the authoritative content and financial records; enforce account
ownership, protected-content visibility and removal rules; connect the UI and
test account isolation, filtering and empty/error states with real persistence.
Do not mark LEG-MT-080 or P08 complete based on the preview alone.

### Connect — founder clarification, September 6, 2026

1. Persist creator profiles and service descriptions; monetary display/checkout follows the agreed beta payment model. Veso-denominated pricing and spending are deferred beyond beta.
2. Filter discovery by online status, price, language, service, and eligibility.
3. Keep card/profile price and service information consistent.
4. Open the correct creator profile or authorized direct conversation.
5. Define a minimal chat-arranged order flow with a durable offer, price,
   payment, fulfillment, cancellation/refund, and dispute record before service
   spending ships. Discovery itself must not be expanded into a booking engine.
6. Defer automated calendars, time-slot reservations, scheduled reminders,
   payment holds, and a full booking lifecycle unless separately justified.

### Exit criteria

- Store tabs contain real account data.
- Your Activity (LEG-MT-080) shows only the signed-in member's persisted
  likes, purchases, subscriptions and payment history, with server-enforced access.
- Connect filters real eligible creators and opens the correct profile/chat.
- Any enabled paid service order has the agreed payment/refund/fulfillment controls.
- Feed actions persist.

## 13. Phase 9 — Real-time messaging and notifications

### WebSocket architecture

1. Authenticate the WebSocket handshake.
2. Authorize each conversation.
3. Persist messages before acknowledgment.
4. Support reconnect and missed-message synchronization.
5. Add typing indicators.
6. Add delivered/read states.
7. Add online, busy, resting, and offline presence.
8. Apply rate limits.
9. Block prohibited attachments until media safety is ready.
10. Add report and block controls.
11. Retain moderation access according to approved policy.

### Notifications

- New message.
- New subscriber.
- Renewal/cancellation.
- Tip confirmation for the agreed payment flow; Veso-specific notifications are deferred beyond beta.
- PPV purchase.
- Chat-arranged service-order status; scheduled booking reminders remain deferred.
- Creator approval.
- Moderation action.
- Report outcome.
- Payout status.

### Exit criteria

- Messages survive reconnects and refresh.
- Unauthorized users cannot subscribe to another conversation.
- Notifications are persisted and marked read.

## 14. Phase 10 — Creator dashboard

Connect the existing UI to:

- Earnings.
- Subscriber list.
- Content management.
- Message queue.
- Standardized tiers.
- Creator services and chat-arranged orders; automated scheduling/bookings require a later scope decision.
- Store items.
- Fan CRM.
- Promotions.
- Payout status.
- Settings.

Keep live-streaming controls hidden behind a disabled feature flag until post-MVP.

### Exit criteria

- Dashboard figures come from real data.
- Every visible launch button has a working action.
- Financial totals reconcile with ledger data.

## 15. Phase 11 — Admin and moderation

Build in this order:

1. Complete and securely deploy the private operations application in
   `apps/admin`; its independent build shell exists, but authentication,
   operational workflows, and hosting controls remain. Do not add `/admin` to
   the public web app.
2. Operations overview.
3. User and creator search.
4. Creator verification queue.
5. Content moderation queue.
6. Reports and complaints.
7. NCII/TAKE IT DOWN queue with deadlines.
8. DMCA workflow.
9. Appeals.
10. Subscriptions and payment events.
11. Veso ledger inspection — deferred beyond beta; inspection of enabled beta payments and creator earnings remains required.
12. Creator earnings and payouts.
13. Chargeback monitoring.
14. Performer/compliance records.
15. Founding badge management.
16. Feature flags.
17. Platform configuration.
18. Immutable audit log.

### Security rules

- The operations application has an independent deployment and is not linked
  from the public product.
- Admin permissions are API-enforced.
- Operational authentication requires a signed operations identity boundary,
  restricted access, and cryptographically verified, phishing-resistant,
  hardware-backed authentication assurance before production use.
- Sensitive document access is separately permissioned.
- Every sensitive view and action is logged.
- Destructive actions require confirmation and reason.
- Audit records cannot be edited or deleted by ordinary admins.

### Exit criteria

- Founder can operate the platform without database access.
- Reports, payments, and creator verification are manageable.
- Sensitive access is auditable.

## 16. Phase 12 — Cancelled game; later retention concept

Founder decision — September 6, 2026: cancel the original Oasis/Drimy game,
including species/evolution, Orbs/XP economies, inventory, Lucky Catch, leagues,
and randomized purchases. These tasks must not gate launch or be resumed from
an old tracker row. Existing prototype code is historical reference; removal
from the release navigation is required before public launch, without
automatically implementing a replacement.

The name Oasis may be retained for a later experience inspired by daily and
friend streaks and playful adult language learning: profanity, humour, and
opt-in roasting. It is not the former collectible game. No curriculum, AI
provider, moderation model, budget, or implementation has been approved.
If later implemented, earned streaks and rewards must be server-authoritative.

Further later ideas: Pumdoki Plus, avatar decorations, cosmetics, a proposed
top-100 free-Plus reward/leaderboard, optional animations/sounds, and richer
interaction feedback. Do not invent benefits, prices, availability, or paid
promises. Backgrounds stay static until a separately reviewed implementation.
Reward/retention design must not reward spending or pressure users to disclose
sensitive activity merely to maintain a streak; decide those rules when this
future feature is actually scoped.

## 17. Phase 13 — Internationalization and accessibility

### Tasks

1. Extract UI text from large components.
2. Add English and Spanish.
3. Support locale-aware dates, times, currency, and numbers.
4. Define timezone behavior for Connect.
5. Translate approved legal documents only after source text is final.
6. Audit keyboard navigation.
7. Add visible focus.
8. Verify color contrast.
9. Add screen-reader labels.
10. Support reduced motion.
11. Test responsive layouts.
12. Test low-bandwidth media behavior.

### Exit criteria

- Core member and creator flows work in English and Spanish.
- Accessibility audit has no critical failures.

## 18. Phase 14 — QA, security, private beta, and launch

### Automated testing

- Unit tests for pricing, entitlement, ledger, and permissions. Retention tests belong to its later approved implementation.
- Integration tests for auth, media, payments, and moderation.
- E2E tests for member and creator vertical slices.
- Webhook duplicate and out-of-order tests.
- WebSocket authorization and reconnect tests.
- Signed-media URL tests.

### Operational testing

1. Database restore drill.
2. Lost-secret rotation drill.
3. Processor webhook outage drill.
4. Content-takedown drill.
5. Account-compromise drill.
6. Chargeback handling drill.
7. Identity-document access review.
8. Support inbox test.
9. Data export and deletion test.
10. Load test feeds, messaging, and signed media.

### Beta sequence

The September 9 Veso deferral applies to this sequence and its release checks.
Veso recharge/spending/ledger work is not a beta gate. Test any agreed beta paid
flow through its own processor sandbox and approval path; the replacement
payment model remains unresolved. Historical Veso prototype controls must be
hidden or clearly unavailable in the beta release. This documentation update
does not change or activate those controls.

1. Internal accounts.
2. Existing trusted creators.
3. Small invited member group.
4. Processor sandbox/test transactions.
5. Limited real transactions after approval.
6. Fix critical and high-severity issues.
7. Expand public member access.
8. Add creators through controlled onboarding.

### Launch gates

- Entity and bank account ready.
- Merchant account approved.
- Counsel-approved policies live.
- Identity and moderation workflows operational.
- Backup restoration tested.
- Core E2E tests passing.
- No critical security findings.
- Support and incident processes staffed.
- Chargeback and report monitoring active.

## 19. Post-MVP

- Live streaming.
- Advanced recommendation engine.
- Native mobile applications.
- Crypto payments.
- Additional themes beyond Sakura Kiss and Midnight City.
- Advanced creator analytics.
- Larger group-chat features.
- External affiliate program.
- Streak/learning retention concept, optional motion/sounds, and Pumdoki Plus/cosmetic benefits after separate scope and economic review. The former Oasis game is cancelled.

## 20. Founder decisions and sequential work order — updated September 10, 2026

The founder has limited time and must receive one functional product slice at
a time. The latest September 9 direction pairs founder/provider work with code
inside that slice, rather than completing all paperwork first or bolting live
requirements on later. Do not treat missing replies to ideas as approval.
At each handoff say what completed, the current functional task,
and what evidence finishes it. Keep parked ideas here and in the tracker.
Routine implementation inside an authorized scope does not need repeated
permission; financial commitments, live exposure, and activation retain their
actual approval boundaries.

### Formation and spending approach — September 8 update

The founder first supplied a Northwest order-received screen, then confirmed
that **Kiban Digital Holdings LLC** is filed in Maryland and awaiting state
approval. The founder also confirmed the CCBill inquiry was sent to Sales.
On September 9 the founder supplied the sent email and CCBill's initial Sales
reply. The email reports a September 8 filing date; expected approval late in
September is a forecast. Original email headers/timestamps and state approval
documents have not been inspected. State approval, CCBill model/merchant
approval, EIN, business bank account and amount charged remain unverified.
Do not downgrade filed status to mere order receipt or resend the first inquiry.

CCBill requires a fully functioning site and permits online password-protected
access. It requests URL, development/timeline, business type/location, average
price/subscription model and services, and lists US registration/business bank/
owner ID requirements. The reply does not define the minimum working review
scope, accept test-mode flows, quote fees/reserves or resolve Veso, services and
creator payouts. The founder explicitly cancelled the
[review-site clarification](docs/product/ccbill-review-site-clarification.md)
and directed work toward the functioning website. No additional Sales reply,
recruited creators, production content or polish is a prerequisite to starting
the next controlled implementation slice. Revisit CCBill with a functioning
review site; approval, live money and public sensitive-data use remain separate.

Use DIY, existing drafts and suitable Fiverr specialists for work the founder
can handle economically. Paid legal advice is for necessary, specific issues
and substantive review of the actual documents/workflows. A broad discovery
consultation or attorney-led entity choice is not a prerequisite to the next
processor inquiry. The earlier six-area counsel brief is a parked reference;
choose the relevant issue and quote when needed. Record the actual model,
reviewed draft version, corrections and remaining limitations of each review.

### Locked product corrections

- September 9 supersedes the earlier Veso-at-launch requirement: defer Veso
  payments beyond beta because of complexity and founder-assessed CCBill/Epoch
  review risk. This is not a reported processor rejection. Retain the concept
  at 1 Veso = USD 1 and separate append-only member-credit/creator-earnings
  ledgers if later approved; do not build or activate it as a beta dependency.
- Keep Store, subscriptions/paid content, real-time chat, tipping/Send Love,
  creator profiles, and discovery-focused Connect in launch scope. The beta
  payment method remains unresolved; no replacement processor flow is approved.
- Cancel the old Oasis/Drimy game. The streak/learning idea in Phase 12 is later.
- Keep Sakura Kiss and Midnight City static; preserve the palette and avatar
  decoration foundation. Optional motion, sound, and richer feedback are later.
- The completed definition clarifies the founding-creator offer: Pumdoki should
  make no profit on those sales while recovering the costs they create. This
  supersedes processing-fees-only wording. Define attributable/shared costs,
  fee calculation, duration, eligibility, reserves/refunds and funding before
  promotion. No-loss economics are an objective, not a verified result.
  Proposed 500 creators, founder badges and free Plus/top-100 ranking rules
  remain provisional; do not publish a lifetime zero-commission promise.
- Two contacted creators may help recruit 50–100 candidates. A paid Discord
  recruiter/helper is proposed, with USD 300–400 monthly cited for assistance.
  This is not evidence of committed creators or qualified operational coverage.
- The content model includes pay-to-view single photos/videos and bundles in
  feed posts and chat, alongside subscriptions and tipping. Possible services
  include SFW gaming/social interactions and adult calls; the catalogue remains
  unfinalized. Following a member or liking a post does not mean account access.
  Gameplay-linked nudity was an illustrative niche idea, not a committed feature.
  Counsel and the processor should receive the current content/services and
  beta payment description, explicitly distinguishing deferred Veso from beta.
  “Ask roughly anything” is not an approved product promise.

### One active step

September 10 bounded engineering request: **P08 / LEG-MT-080 — Your Activity
UI** is brought forward now and published to `dev` only. Its account-data
integration remains in P08 after the dependencies above. This does not close
P05 or create a parallel founder assignment; after this UI slice, the one
pending founder step remains the P05 / LEG-MT-088 local content-flow review.

| Step                                     | Work                                                                                                                                                                                                                                | Finish evidence                                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — done                                 | Founder [business-definition answers](docs/product/initial-business-definition.md) received and reviewed. Open details are carried forward.                                                                                         | Founder answers; unresolved items may say “not sure.”                                                                                                         |
| 2 — filed; awaiting MD                   | Kiban Digital Holdings LLC filed through Northwest, per founder report. Await Maryland approval.                                                                                                                                    | Approved state formation documents still pending. EIN/banking are not verified; the formation cost is recorded in the tracker.                                |
| 3 — current: review working content flow | R2 setup and safe-sample integration are verified. Review Create Post → save draft → publish in the local preview with a safe photo/video.                                                                                          | Cloud upload/read, private drafts, member playback, restart persistence and removal passed. Bucket public access is disabled; founder review remains pending. |
| 4 — waiting                              | Review the reply; set an affordable pilot, creator offer, fee basis and cash plan. Complete EIN/banking/application actions as formation and provider requirements permit; scope only necessary legal/tax questions.                | Founder approves concrete scope and spending cap; formal merchant onboarding proceeds as requirements permit.                                                 |
| 5 — waiting                              | Prepare policy/workflow drafts economically; obtain necessary qualified legal review for identity/age/consent, content review, reports, retention, funds flow and pilot countries. Obtain the scoped human technical design review. | Reviewed implementable requirements, responsible person/backup and concrete review findings.                                                                  |
| 6 — waiting                              | Select transactional email and minimal staging/monitoring once entity/domain ownership, adult-business fit, recipients, data handling and budget are settled.                                                                       | Provider acceptance, costs and sender/operations plan; then implement and verify production mail.                                                             |
| 7 — waiting                              | Build and test the agreed purchase-to-access-to-earnings flow, including chat/service orders/tipping and necessary operations.                                                                                                      | Real persistence, processor sandbox, refunds/reconciliation, entitlements and operator actions verified.                                                      |
| 8 — waiting                              | Independent pre-launch security/payment review, fixes/retest, operational drills and controlled real-money pilot.                                                                                                                   | Applicable legal/provider/technical/operational launch gates pass for the exact release.                                                                      |

Rows 4–8 are dependency reminders, not separate paperwork phases that must all
finish before code. Bring each founder/provider decision into the slice that
needs it, alongside implementation, verification and targeted review. A slice
finishes with working behavior and its necessary real-world setup. The first
milestone is a working content path in the existing UI using test accounts and
safe sample media. The P05 design is its input, not another document to expand.
No live provider purchase, deployment or activation is implied by this plan.

Veso deferral changes beta scope, not this active task: continue the existing
local content flow through founder review of its verified private R2 integration. At the relevant paid-product
slice, settle the beta payment model and its requirements together; do not
restart Veso work or a separate processor follow-up because of this update.

### Human review timing and scope

Paid legal review is commissioned for a defined unresolved legal issue or
applicable document/workflow review, normally after the initial processor
response, within the relevant code slice and before reliance or live sensitive use. It may be
brought forward for a specific need; routine filing and the preliminary sales
inquiry do not require a broad consultation. Prefer preparing drafts first,
then a fixed-scope review and corrections with the reviewed version recorded.
Human technical review accompanies the relevant design/code slice and must
resolve material issues before live protected-media, money or identity use.
Controlled local implementation is not held for a blanket pre-code review.
A narrowly scoped
auth/deployment review may be commissioned sooner if it resolves the founder's
confidence within an approved cap; it is not a full-platform certification.
Use Fiverr if a reviewer can demonstrate relevant expertise and provide a
written scope, reproducible findings, severity, remediation advice and retest.
Check attorney licensing for legal work; generic policy drafting and star
ratings are insufficient evidence of adult-platform expertise. Use synthetic
data and scoped repository access, not production secrets or identity files.
Before real uploads/money, commission the integrated review at Step 8; do not
assume an inexpensive generic “website audit” covers authorization, payouts,
webhook duplicates, media access and operational recovery.

### Email/API timing

Select and integrate transactional email as part of the hosted account-flow
slice, before external verification/reset delivery is needed. Pair provider
fit, ownership, data-handling and cost decisions with implementation; it does
not require finishing every unrelated payment or content decision first.
The current production-mail startup error is an intentional safety guard,
not a fix-by-disabling check. Implement authenticated TLS delivery, verified
sender setup, bounded failures, bounce/complaint ownership and safe retries;
test real production-mode startup and synthetic delivery. Review server-owned
allowed policy versions before approved registration terms go live. Keep old
acceptance records immutable. No real environment/provider configuration is
authorized merely by this plan.

### Legal UI correction and release procedure

The September 6 cleanup replaces invented operational claims with explicit
prototype notices: no claimed identity recordkeeping, human moderation,
StopNCII participation, live support/report mailboxes, response promises,
approved KYC/tax/bank status or counsel-approved legal policies. Prototype
Terms/Privacy versions advance for new acceptances; earlier records are retained.

These source changes appear in local development after reload and in a build
after `npm run build`. A Git push/merge does not itself publish this repository's
website: the inspected workflow runs CI only. Do not deploy the current full
prototype as an operating adult platform. At Step 8, replace notices only with
dated/versioned counsel-approved policy text and tested, staffed intake paths;
verify every link, sender/recipient, report path and acceptance version in
staging, then include them in the separately approved website release. No
manual production copy-paste or direct database editing is required.

### Budget and parked dependencies

Use [launch-budget.md](docs/product/launch-budget.md) and the master tracker's
current budget view. The new founder answer states a USD 1,800 monthly ceiling. Current cash,
sustainable duration and its relationship to the earlier USD 1,000–5,000 now
and possible USD 5,000 later remain unconfirmed. Do not count monthly capacity
as existing cash. The proposed USD 300–400 helper may overlap the budget backup
allowance; confirm inclusion before changing totals. Estimates are planning
allowances, not provider quotes or permission to spend. Keep reserve/hold cash
distinct from fees, ongoing burn and founder living expenses. Avoid committing
to 500 fee-free creators before the subsidy's funding and limits are known.

AWS topology, monitoring, shared throttling, runtime grants, production mail,
identity/country/tax/retention decisions, and operations activation remain open
at their relevant steps. PostgreSQL durability and ephemeral-only Redis are
already decided; do not reopen them. The local worker remains canary-only.

## 21. Immediate next action

The business definition is complete and Kiban Digital Holdings LLC remains
filed, awaiting Maryland approval. CCBill's initial Sales reply has been
received and reviewed; its proposed clarification is cancelled. The first
[local content flow](docs/architecture/phase5-local-content-flow.md) now works:
safe photo/video upload, private persisted draft, publication in the Home feed
and server-enforced access/removal. R2 setup is now complete for this milestone:
scoped credentials are saved in ignored `.env.r2.local`, the bucket overview
shows Public Access Disabled, and actual cloud/API/browser checks passed for
photos and videos. Generated verification objects were cleaned up.
The one founder step is reviewing Create Post → save draft → publish in the
local preview using safe samples. No further storage signup is needed. A
billing alert and the recommended token lifetime remain unverified, and future
hosted use needs its own provider/budget decisions. No new broad
design document or creator recruitment step is required. The
[first exchange](docs/product/initial-ccbill-inquiry.md) records the evidence.
No test-mode acceptance, merchant approval, live hosting or payment activation
is established by this reply.

The earlier [counsel inquiry](docs/product/initial-counsel-inquiry.md) is parked.
Use its relevant questions later for a necessary, scoped review of concrete
drafts or an unresolved issue; do not automatically commission all six areas
or reopen the founder's entity decision. CCBill has replied with intake
requirements; no contract, approval or payment to it is reported. Policy
drafting has been commissioned; delivery and approval remain pending.
The tracker records the legal and Northwest formation purchases.

Review the processor response before a contract, fee or activation. The
assistant must not send a duplicate inquiry, follow-up or other message without
explicit authorization. No automatic monitoring or reminder is scheduled.

Initial creator/member countries, service delivery channels, refund/cancellation
handling, founder hours, helper coverage and exact cash/runway remain open.
Carry these into the appropriate consultation or budget step, one question at
a time; do not return the entire definition as an incomplete assignment.
The first local content implementation and private R2 safe-sample integration
are verified; founder review of the working flow is next. Veso payments are deferred beyond beta. Subsequent slices combine
code, necessary founder/provider decisions and targeted review, including
settling the beta payment model before monetized use. Preserve actual controls
before live sensitive use.
