# Pumdoki Detailed Implementation Plan

@CLAUDE.md

Last updated: September 9, 2026

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
- Begin with a controlled pilot before public member registration. The proposed founding-creator program may eventually reach about 500; that is not an initial operating-capacity commitment.

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

September 13 final wallet direction: after discussing a simple optional USD
balance, the founder chose to handle wallets in the future and continue the
questionnaire. Wallet assessment and implementation are parked; neither is a
current payment-work prerequisite or beta dependency. Phase 6 preserves the
candidate for a future explicit revisit. Direct-payment work continues.

### Current external dependencies

- CCBill is the intended primary adult payment processor.
- Epoch is the intended fallback/cascade processor.
- CCBill's first Sales reply was supplied September 9: it requires a fully
  functioning review site (password protection permitted), US business/owner,
  US business banking and principal ID. Detailed site scope, model eligibility,
  pricing and creator payouts remain unanswered; no merchant approval is reported.
- Cascade behavior has not been confirmed with either provider.
- The founder confirmed Maryland approval of Kiban Digital Holdings LLC and
  EIN receipt on September 16, 2026. P04 / LEG-MT-158 is complete on that
  confirmation. Original state/IRS documents have not been independently
  inspected. Banking and Pumdoki trade-name registration remain open; the
  formation purchase is recorded in the expense tracker.
- Legal policies have not been approved by counsel.
- The founder reports creating `legal@pumdoki.com`, `support@pumdoki.com`,
  `privacy@pumdoki.com`, `report@pumdoki.com` and `safety@pumdoki.com` aliases
  in Google Workspace Business on September 13.
  Final configuration and testing remain pending; operational intake is not
  yet verified. Other compliance contact addresses remain unconfirmed.

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

Founder direction, confirmed September 13 (**P04 / LEG-MT-155**, Question 12):

- Plan automated age assurance for members and identity/age verification for creators. Ondato and Veriff are candidates; Veriff has served as a pricing benchmark. No provider is selected or contracted.
- Question 20 confirms a minimum age of 18 plus any higher applicable legal minimum. Member age-assurance requirements depend on jurisdiction, applicable law, payment-provider requirements and platform risk controls. Required checks must succeed before adult-content access; self-attestation alone cannot replace them. Creator identity/age verification remains a separate process.
- Compare supported countries, adult-platform suitability, total pilot costs (including minimums, retries and fallback checks), privacy/retention terms and applicable legal/processor requirements.
- Configure and test the required verification flows before live adult-content access or real creator identity onboarding. Coordinate selection and implementation with CCBill's confirmed review requirements; its current reply does not establish a requirement to select the provider before the first site submission.
- Keep the integration replaceable without changing creator accounts. Any later proposal for manual identity collection requires its own documented security and legal design; it is not the current selected approach.

Requirements for any separately approved manual identity-record workflow:

- Dedicated encrypted storage separate from public media.
- Strict admin roles.
- Access audit logs.
- No identity documents in application logs.
- Defined retention and deletion rules.
- File signature and malware validation.
- Review decision, reason, reviewer, and timestamp.
- Escalation process for mismatches or suspected fraud.

### 3.6 International rollout

Founder direction for international eligibility and a limited member pilot,
confirmed September 13 and 16 (**P04 / LEG-MT-153**, questionnaire Questions 9–10 and 49):

- Plan for international creators at launch wherever the service can lawfully and operationally support them; broad international availability is the objective.
- No fixed regional shortlist is approved. This replaces the earlier recommendation to prioritize only the United States and selected Latin American countries.
- Maintain a controlled country-enablement list, with creator and member eligibility assessed separately. Actual supported countries and payout methods remain to be confirmed before onboarding from those locations.
- Q49: actively restrict unsupported access, onboarding or transactions through appropriate geographic and eligibility controls, rather than relying only on not marketing there. Required age checks must succeed before adult-content access. No specific country example or final country list is approved.
- Begin with a limited number of international adult members, automated age checks and payment-risk controls, and a defined cash buffer for refunds, chargebacks and processor holds. Admission volume and country availability must fit affordable verification costs and available support capacity. Member count, verification spending cap and cash-buffer amount are not yet set; no funds are confirmed reserved by this decision.
- Verify applicable adult-content law, sanctions, identity verification, payment/payout coverage, tax and privacy requirements. Required country-specific workflows must be operational before live use, including applicable EU/EEA privacy, DSA, cookie-consent, data-request and consumer-rights obligations.

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

Question 131 approved September 22, 2026: the proposed standard platform
commission is 20%, with creators receiving 80% of the sale amount excluding
applicable sales taxes or VAT. Ordinary payment-processing costs would be covered
from Pumdoki's share. Validate this rate against confirmed provider pricing and
operating costs before publishing a firm offer or enabling live payments.
This approves a target and its calculation base, not proven profitability.

The cost model must include processor fees, chargebacks, refunds, storage,
support, verification and taxes. Earlier 20%, 25% and 30% platform scenarios and
10%, 12% and 15% processor scenarios are sensitivity assumptions, not provider
quotes or approved alternative fees. The earlier preference for a creator share
of net processor receipts is superseded by Q131's approved target: do not silently
subtract ordinary processing costs from the creator's 80% allocation.

Q139 approves reversing the affected creator share and corresponding platform
commission for ordinary chargebacks, with applicable dispute fees and unrecovered
ordinary processing costs borne by Pumdoki. Protect legitimately earned creator
pay where Pumdoki's own billing/service error caused the loss and the creator
fulfilled their obligations; correcting duplicate/unearned credits remains valid.
No blanket stolen-card or dishonest-buyer protection is promised at launch.
Model platform-error losses and failed recovery after creator withdrawals, not
just lost commission. Q140 applies the same share-reversal and platform-error
protection principles to refunds; Pumdoki absorbs unrecovered processing costs
and applicable refund-processing fees. Q141 permits actual disclosed payout-provider
transfer fees without platform markup, with commission charged once per sale.
Actual methods, provider fees and economics remain unconfirmed. See §20 for
approved safeguards and USD 100 examples.
Q134 approves planned payout initiation on the 1st and 16th or next business day,
subject to confirmed providers, eligible available earnings and required checks.
Q135 approves USD 50 as the proposed standard available-earnings minimum, with
confirmed method-specific limits disclosed in advance and balances carried forward.
Q147 preserves legitimately earned unpaid balances after termination, with reviewed
holds and a final-settlement process that does not automatically forfeit amounts
below the ordinary minimum. Final provider methods and settlement details remain open.
Q137 approves a provisional 14-calendar-day transaction pending period subject to
settlement/reserve requirements; it does not cover later chargebacks or guarantee
bank receipt. Final provider minimums, methods, hold/reserve arrangements and cutoff
details remain pending in §20.
Paid-session commission remains pending Q31. Question 132 replaces the earlier
cost-recovery/no-profit founding offer with the Founders program: standard
commission, recognition, discovery placement and community/event benefits. The
public tag is "Founders". Q133 approves the tag for an eligible account's lifetime
and conditional discovery/event benefits. Eligibility and event budgets remain pending;
no founder fee reduction, permanent exemption or recurring prize budget is approved.

Keep creator earnings and platform revenue separately auditable. If Veso is later
approved, its member-credit ledger must remain separate from creator earnings;
the Veso-specific implementation is deferred beyond beta.

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

1. Completed P04 / LEG-MT-158: the founder confirmed Maryland approval of
   Kiban Digital Holdings LLC and EIN receipt on September 16, 2026.
2. Retain approved formation documents and the IRS confirmation letter privately.
   The founder reports their personal name is absent from the initial filing
   and present in the internal resolution/operating agreement. Independent
   inspection of the originals and public state record remains unperformed.
3. EIN obtained; do not submit a duplicate application. Business banking
   accepting the actual adult-platform business remains a separate follow-up.
   The [IRS](https://www.irs.gov/businesses/employer-identification-number)
   provides EINs free. Keep the EIN outside the source repository.
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
4. Determine required tax/payout documentation and collection timing; complete it before withdrawals, or earlier if required by law or the payment/payout provider (Question 22).
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

### Optional USD wallet — parked for future work, September 13, 2026

**P06 / LEG-MT-094** retains the processor-fit reference within the existing
payment work. After considering an optional balance, the founder explicitly
deferred wallets to the future and resumed the questionnaire. Do not restart
wallet assessment or implementation in the current workflow. The following
candidate is preserved for a later explicit revisit, conditional on manageable
incremental development, review and support work.
Members must retain direct-payment options; the old requirement to buy Veso
for every purchase is superseded. Use plain USD and the descriptive working
label `Wallet balance` in this assessment; the Veso brand adds no required
product functionality and is not a requirement for the candidate.

The previously proposed boundaries are accepted for evaluation: purchases
within Pumdoki only, no member-to-member transfers or ordinary member cash-out,
limited loading/spending, separate creator payable earnings, auditable funding
and spending records, appropriate payout controls and cash coverage. Amounts,
countries, provider terms and loss allocation remain undecided. Legally required
refunds are not prohibited by the no-cash-out boundary.

**Recommended minimum candidate, not yet an approved implementation scope:**
optional wallet spending for PPV and tips, with recurring subscriptions staying
on the approved processor. Use one funding source for each purchase: the entire
wallet balance debit or the entire direct payment, without splitting a purchase
between them. Members explicitly choose/authorize direct payment when the
balance is insufficient; the existence of a saved card is not authorization for
an unexpected charge. Omit automatic top-ups, wallet-funded subscription
renewals, promotional currency/bonuses, cryptocurrency and extra processors from
this candidate. No expiry or inactivity-fee policy is approved.

The current backend has no payment/wallet ledger or processor integration.
Existing billing screens are fixtures. A wallet therefore cannot be assessed
as a UI-only addition: it needs verified top-ups, atomic balance spending,
funding-to-purchase attribution, reversals, balance/settlement reconciliation,
and tested operator handling. Share the direct-payment ledger and processor
foundation where possible; assess these incremental requirements only when the
founder chooses to revisit wallets. Do not promise a small cost or duration.
If it materially expands delivery or support burden, leave the wallet outside
the initial release. Direct-payment features remain useful without it.

The processor must accept the exact model, and targeted review must address
unused balances, refund/closure treatment and applicable prepaid-value rules.
Strict no-refund wording cannot replace mandatory consumer rights or prevent
valid card disputes. CCBill's public token/credit support is encouraging but
does not establish Pumdoki approval. No new provider message is authorized.

### Historical Veso product rules — deferred, not the optional-wallet specification

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
7. Failed renewal preserves already-paid access. For the pilot, no automatic unpaid access grace applies; subscription access pauses at paid expiry until successful renewal or a new subscription payment is confirmed (Question 25).
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
- A verified successful PPV payment creates ongoing access to the purchased version without a scheduled expiry. Ordinary creator deletion/delisting preserves existing buyers' access; legal/safety removals and the applicable Terms and Refund Policy still govern access (Question 26).
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

## 20. Founder decisions and sequential work order — updated September 9, 2026

The founder has limited time and must receive one functional product slice at
a time. The latest September 9 direction pairs founder/provider work with code
inside that slice, rather than completing all paperwork first or bolting live
requirements on later. Do not treat missing replies to ideas as approval.
At each handoff say what completed, the current functional task,
and what evidence finishes it. Keep parked ideas here and in the tracker.
Routine implementation inside an authorized scope does not need repeated
permission; financial commitments, live exposure, and activation retain their
actual approval boundaries.

### Formation and spending approach — September 16 update

The founder first supplied a Northwest order-received screen, then confirmed
that **Kiban Digital Holdings LLC** is filed in Maryland and awaiting state
approval. The founder also confirmed the CCBill inquiry was sent to Sales.
On September 9 the founder supplied the sent email and CCBill's initial Sales
reply. The email reports a September 8 filing date; expected approval late in
September is a forecast. Original email headers/timestamps and state approval
documents have not been inspected. Those earlier approval forecasts are
superseded by the September 16 founder confirmation below. The founder
previously confirmed the $196 formation purchase, recorded in the tracker.
CCBill model/merchant approval and business banking remain unverified.
Do not downgrade the confirmed formation status or resend the first inquiry.

**September 16 completion — P04 / LEG-MT-158:** the founder confirms Maryland
has approved Kiban Digital Holdings LLC, then completed the IRS online EIN
application and supplied the issued EIN in chat. Formation and EIN receipt are
complete based on that report. This date records the confirmation and EIN
receipt, not an independently verified state effective date. The original
state approval and IRS letter have not been independently inspected. Retain
them and the full EIN in private records outside the repository. Do not buy
a duplicate EIN service or restart formation. Business banking, Pumdoki DBA
registration and processor approval remain separate open steps.

The founder reports their personal name appears in the internal initial
resolution and operating agreement, but not in the initial state filing.
Northwest's address is shown in the company dashboard. The public Maryland
record has not been independently checked; LEG-MT-025 remains In Progress.
The legal questionnaire and engineering review retain their existing order.

September 13 questionnaire review (**P04 / LEG-MT-158**): the founder supplied
a Northwest dashboard screenshot showing **Kiban Digital Holdings LLC** and
**306 W Redwood St, Ste 201, Baltimore, MD 21201** as the Company Principal
Address, with the Company Mailing Address marked "Same as principal." The
registered-agent section separately lists Northwest at the same address. This
supports retaining the entity/principal-address answer in `Kiban-Details.docx`.
The dashboard records "Submitted to State" on September 8, 2026 and estimates
completion on September 24, 2026; "Formation Complete" is not marked complete.
This September 13 screenshot is historical provider-dashboard evidence.
The September 16 founder confirmation above supersedes its pending status;
it is not independent inspection of the state approval document.
The founder is reviewing questionnaire answers one at a time in chat and will
edit the DOCX manually; record confirmed decisions here without adopting
unconfirmed proposals from the document.

Question 3 approved in chat (**P04 / LEG-MT-011**): retain Pumdoki as the
platform name, `pumdoki.com` as the stated domain, and Kiban Digital Holdings
LLC as the intended operating entity. No trade name is registered. Maryland
trade-name registration and the signing method remain undecided pending advice
on applicable requirements and appropriate operator naming across the Terms,
Creator Agreement and signature blocks. The founder's preference is to minimize
public disclosure of their personal name, signature and home address while
meeting applicable requirements. A supplied Northwest chat response indicates
that its representative can sign for the LLC; inspect the completed filing
before relying on its privacy outcome. No filing, service purchase or particular
"d/b/a" wording is approved by this questionnaire answer.

Question 4 approved in chat (**P04 / LEG-MT-011**): use `legal@pumdoki.com`
for legal notices and `support@pumdoki.com` for general support. The founder
reports that both aliases have been created in Google Workspace Business;
final configuration and testing have not been completed. Update the
questionnaire wording from planned addresses to created aliases with setup
and testing pending. Configure and test them before publishing them as live
contact channels. This does not establish staffed or tested operational intake.

Question 5 approved in chat (**P04 / LEG-MT-012**): use `privacy@pumdoki.com`
for privacy and data-rights requests. The founder confirms that the Google
Workspace Business alias has been created. Final configuration and testing
remain pending, consistent with the other confirmed aliases; complete them
before publishing the address as a live contact channel.

Question 6 approved in chat (**P04 / LEG-MT-015**): the founder will handle
DMCA notices under the public designated-agent title "Copyright Agent."
Registration with the U.S. Copyright Office remains pending and is planned
before launch, naming Kiban Digital Holdings LLC as the service provider and
Pumdoki and `pumdoki.com` as alternate names. Use `dmca@pumdoki.com` as the
planned public email and a dedicated business telephone number. The founder
selected Northwest for the public business phone service during the Question 15
privacy review; the assigned number, activation and testing remain unconfirmed.
Creation/configuration/testing of the DMCA email is unverified.
The proposed correspondence address is the confirmed company principal address,
306 W Redwood St, Ste 201, Baltimore, MD 21201; confirm that DMCA correspondence
can be received there before using it as the agent's contact address. The
Copyright Office permits a position held by an individual as the public agent
designation; this does not promise anonymity or establish operational intake.
Its current fee is $6 and renewal is required before the three-year designation
expires. Source: https://www.copyright.gov/dmca-directory/faq.html (reviewed
September 13, 2026). No registration has been submitted by this review.

Question 7 contact update (**P04 / LEG-MT-032**): the founder confirms that
both `report@pumdoki.com` and `safety@pumdoki.com` aliases have been created
in Google Workspace Business. Final routing, configuration and testing of
these two aliases remain unverified. This confirms the addresses exist, not
that complaint or safety intake is operational. The proposed answer assigns
general complaints and content reports to `report@pumdoki.com` and safety
concerns to `safety@pumdoki.com`, with founder handling initially; this routing
description remains proposed pending the founder's review. In-product reporting
remains planned, with its operational workflow tracked under P11 / LEG-MT-111.

Question 9 approved in chat (**P04 / LEG-MT-153**): accept international
creators at launch wherever Pumdoki can lawfully and operationally support
them, with broad international availability as the objective. Eligibility
depends on applicable laws and sanctions, supported identity verification,
available payment and creator-payout services, and required tax and privacy
arrangements. Final supported countries and payout methods remain unconfirmed
and must be settled before onboarding creators from those locations. Draft
the Creator Agreement for international participation and flag necessary
country-specific provisions; review earnings classification and withholding
without assuming a particular tax treatment. The questionnaire's previous
regional shortlist, blanket exclusion rationales and named payout routes are
superseded by this answer. This decision does not approve any particular
country, provider or live onboarding. The Question 10 decision below supplements
this direction for members. Section 3.6 reflects both decisions.

Question 10 pilot controls approved in chat (**P04 / LEG-MT-153**): start
with a limited number of international adult members, automated checks, and
a defined cash buffer. Preserve broad international availability as the
objective, with actual country access subject to applicable law and sanctions,
effective age assurance, processor coverage, privacy and consumer obligations,
affordable verification costs, payment risk and available support capacity.
The member limit, verification budget and cash-buffer amount remain undecided;
the control design is approved, not implemented or funded. Set these limits
before opening the pilot, and limit admissions as necessary while cost and
workload are measured. The earlier US/Canada/Mexico-only answer is superseded;
no particular country or live payment activation is approved.

The founder also raised creator tax documentation, including whether W-8BEN
is required. This is a separate creator/payout issue under **P04 / LEG-MT-021**,
not an age-verification or ordinary member-registration requirement. IRS guidance
distinguishes foreign individual beneficial owners (generally W-8BEN), foreign
entity beneficial owners (generally W-8BEN-E) and U.S. persons (W-9); exceptions,
income source/classification, collection timing and withholding treatment must
be resolved for the actual payment arrangement. A W-8BEN does not by itself
establish a withholding exemption. No final tax-document workflow or withholding
rate is approved. Sources reviewed September 13:
https://www.irs.gov/instructions/iw8ben and https://www.irs.gov/instructions/iw8.

Question 12 approved in chat (**P04 / LEG-MT-155**): no age/identity provider
is selected. Ondato and Veriff are candidates, with Veriff retained as the
previous pricing benchmark. Plan automated member age assurance and creator
identity/age verification. Select on country coverage, adult-platform suitability,
total pilot cost including minimums/retries/fallbacks, privacy/retention terms,
and applicable legal and processor requirements. Required flows must be
configured and tested before live adult-content access or real creator identity
onboarding; coordinate with CCBill's confirmed review requirements. No provider
purchase, contract, integration or pre-submission selection deadline is approved.
Section 3.5 reflects this direction. The §2257 custodian remains a separate
pending selection under LEG-MT-016.

Question 15 approved in chat (**P02 / LEG-MT-157**): Google Workspace Business
is the business email provider. Legal, support, privacy, report and safety
aliases have been created; configuration and external sending/receiving tests
remain pending. Amazon SES and Resend remain transactional-email candidates,
with no provider selected. Sentry is under consideration for error tracking,
not confirmed. No third-party analytics or advertising tools are planned at
launch. Moderation is planned to be handled by the founder during the limited
pilot; procedures and coverage remain to be established. Northwest is selected
for the public business telephone service, with activation and testing pending.
This approves the questionnaire answer without completing production email,
monitoring, moderation or telephone setup.

Question 15 privacy review (**P02 / LEG-MT-157**, public contact dependency
**P04 / LEG-MT-015**): the founder selected Northwest for the public business
telephone service. Number assignment, plan details, activation, caller ID,
voicemail and testing remain unverified; this records the provider choice,
not a service purchase or completed setup. On September 13, the founder reported
turning off "Let people find you by phone number" on the account being reviewed;
this setting change was not independently inspected. Google Workspace profile
visibility and alias sender exposure still need review. No account rename,
recovery-setting change or completed privacy audit is established. Personal
account identifiers and recovery details are not recorded here.

Question 16 operating approach confirmed in chat (**P14 / LEG-MT-122**, complaint
policy dependency **P04 / LEG-MT-032**): the founder will check urgent reports
daily, including weekends, during the limited pilot and delegate coverage when
unavailable. Potential helpers have been identified privately; no helper has
been engaged, assigned access or confirmed as an operational backup. Establish
the backup's availability, instructions and appropriate individual access
before relying on that coverage. Personal helper names are not recorded here.

Plan email-based founder support, automated receipt acknowledgments and urgent
report alerts. Retain a two-business-day target for a human response to routine
inquiries; this is not a promise to resolve every support issue within that time.
Content complaints covered by Mastercard's adult-merchant rules must be reviewed
and resolved within seven business days, with immediate removal when review
finds illegal content. Valid TAKE IT DOWN removal requests require removal
within 48 hours of receipt, including weekends, and reasonable efforts to
identify and remove known identical copies within that period. Urgent legal and
safety reports must be escalated without waiting for the routine support queue;
any shorter applicable legal or processor deadline takes priority. Intake,
alerts, deadline tracking, backup coverage and removal procedures still require
configuration and testing before live use. This records the operating direction,
not a completed support workflow or final published policy.

Question 16 sources reviewed September 13, 2026: Mastercard Security Rules and
Procedures, Merchant Edition, August 4, 2026, §9.4.1, page 116
(https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf);
FTC TAKE IT DOWN enforcement guidance
(https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-begins-enforcing-take-it-down-act).
Fansly's published process similarly separates ordinary complaint responses
from 48-hour nonconsensual intimate imagery escalation
(https://help.fansly.com/en/articles/10544570-how-to-report-content-on-fansly).

Question 17 approved in chat (**P04 / LEG-MT-020**): CCBill has provided initial
Sales/intake guidance, including a functioning online review site (password
protection permitted) and US business, banking and principal-identification
requirements. No detailed account-specific compliance checklist or merchant
approval has been received. Model eligibility, fees, reserves and creator-payout
arrangements remain unresolved. Draft using applicable law and current published
Mastercard adult-content merchant requirements, including §9.4.1 of the Security
Rules and Procedures. Incorporate additional written CCBill/acquiring-bank
requirements when received, before finalizing policies and activating payments.
Sources: [first CCBill exchange](docs/product/initial-ccbill-inquiry.md) and the
[Mastercard Merchant Edition, August 4, 2026](https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf),
reviewed September 13, 2026. Public rules are a drafting reference, not approval
of Pumdoki or evidence that its controls are implemented.

Question 18 approved in chat (**P14 / LEG-MT-139**): no fixed launch date.
The current objective is a functioning, password-protected website for CCBill
review; CCBill's underwriting timeline remains unconfirmed. Initial launch is
planned as a limited member pilot after processor approval and completion of
the required product, legal, safety, security and support checks. Expansion
depends on pilot results, verified country coverage and operational capacity.
This supersedes the questionnaire's late-2026 review-site target and unsupported
four-to-eight-week underwriting estimate. The launch checklist and its checks
remain incomplete; this records the timing policy, not readiness or a release
date. The [first CCBill exchange](docs/product/initial-ccbill-inquiry.md) contains
no confirmed underwriting duration.

Question 20 approved in chat (**P04 / LEG-MT-060**, Terms of Service: minimum
user age and verification): users must be at least 18 and meet any higher
applicable legal minimum age. Automated third-party member age assurance is
planned, with requirements determined by the user's jurisdiction, applicable
law, payment-provider requirements and platform risk controls. Required
verification must succeed before adult content becomes accessible;
self-attestation alone cannot replace a required verification check. No provider
is selected, and country-specific requirements, configuration and testing remain
pending. Creator identity and age verification are handled separately from
member age assurance. The existing explicit-content opt-in also remains separate.
This clarifies the jurisdiction-aware entry gate already tracked under
LEG-MT-060; it does not establish a universal paid check for every signup or
adopt Fansly's exact country list, provider or retention claims. Source reviewed
September 13, 2026:
https://help.fansly.com/en/articles/11845000-global-age-verification-requirement.

Question 21 approved in chat (**P04 / LEG-MT-011**, Terms of Service: member
registration): planned registration requires a display name, email address and
password, confirmation that the user meets the minimum-age requirement,
acceptance of the Terms of Service and Acceptable Use Policy, and acknowledgment
of the Privacy Policy. Members must verify their email address. Additional age
assurance follows jurisdiction, applicable law, payment-provider requirements
and platform risk controls, as confirmed in Question 20. Required checks must
succeed before adult-content access; account creation and email verification
do not substitute for them.

The current registration foundation already collects display name, email,
password and age attestation and records versioned Terms/Privacy acceptance.
Explicit AUP acceptance and the final reviewed privacy-acknowledgment wording
still need to be incorporated into the approved registration flow before launch.
Preserve existing acceptance evidence and append new policy versions/records.
This approves questionnaire wording, not a completed policy or implementation.

Question 22 approved in chat (**P04 / LEG-MT-021**, Terms of Service: creator
versus member accounts): all accounts begin as member accounts. Creator status
requires a separate application, verified email, identity and age verification,
acceptance of the Creator Agreement, and approval before creator publishing and
monetization are enabled. Creators must satisfy applicable performer identity,
age, consent and recordkeeping requirements before relevant content can be
published, including §2257 requirements where applicable.

Required tax and payout documentation must be completed before withdrawals,
or earlier if required by law or the payment/payout provider. Exact forms and
collection timing remain to be confirmed for the selected payout arrangement.
This separates account approval, content requirements and payout readiness; it
does not assume that all tax collection may wait until the first withdrawal.
The current application foundation still records a pending outcome without
identity verification, role promotion or live publishing/payment activation.
The creator-onboarding implementation list above reflects this timing decision.
Fansly provides a comparison for separate approval and tax/payout stages, not
proof of Pumdoki's tax treatment or provider acceptance:
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
(reviewed September 13, 2026).

Question 23 approved in chat (**P06 / LEG-MT-097**, subscription cancellation):
members will be able to cancel automatic renewal through the account's
Billing/Subscriptions area. Confirmation must state the effective cancellation
date and the date paid access ends. Access ordinarily continues through the
period already paid for. Cancellation alone does not trigger a prorated refund
for unused time; applicable law, processor requirements and the Refund Policy
continue to govern available refunds.

Confirm any applicable cancellation cutoff with the processor and clearly
disclose it before purchase. The cancellation and confirmation flow still needs
implementation and testing. CCBill's public FAQ specifies cancellation a full
24 hours before the end of the initial billing period, but its applicability to
Pumdoki's eventual setup is unconfirmed; no account-specific cutoff is adopted.
Sources reviewed September 13, 2026:
https://help.fansly.com/en/articles/12314322-managing-subscriptions and
https://ccbill.com/support/cancel-recurring-membership.

Question 25 approved in chat (**P06 / LEG-MT-099**, failed-subscription-payment
grace period): no automatic access grace period is planned for the pilot.
A failed renewal does not shorten access already paid for. Once that period
ends, access provided by the affected subscription pauses until a successful
renewal or new subscription payment is confirmed. Notify the member and provide
a way to update payment details or reactivate. Automatic retries must follow
processor-approved rules and valid renewal authorization. Retry timing and
final subscription status remain subject to confirmation with the processor;
there is no approved fixed three-day automatic cancellation rule.

A failed renewal alone must not suspend the whole member account or revoke
separately purchased content. Recurring billing, notifications, processor event
handling and subscription entitlement changes remain unimplemented. This
supersedes the questionnaire's three-day access-grace proposal and the earlier
Phase 6 statement that a failed renewal enters a grace state. Source reviewed
September 13, 2026: https://ccbill.com/doc/webhooks-user-guide and
https://ccbill.com/doc/renewal-failure-declined-rebill.

Question 26 approved in chat (**P06 / LEG-MT-146**, PPV purchase and delivery):
use a one-off charge through the approved processor's hosted checkout. Grant
access only after Pumdoki verifies successful payment with the processor.
The purchasing account receives ongoing access to the purchased version without
a scheduled expiry. Ordinary creator deletion or delisting stops new sales but
must preserve existing buyers' access to that version. Access remains subject
to legal and safety removal requirements and the applicable Terms and Refund
Policy; the approved answer does not decide download rights.

Implement durable purchase entitlements and retention of the purchased media
version, distinguishing ordinary creator delisting from quarantine or required
removal. This supersedes the blanket purchaser-denial rule in the historical
Phase 5 content/access design only for ordinary creator deletion/delisting;
legal/safety removals must still block delivery. The working local free-content
removal flow is unchanged. Processor approval, hosted checkout, payment
verification, paid-media retention and buyer access controls remain to be
implemented and tested; this is an approved product requirement, not a live
payment or storage capability. Source reviewed September 13, 2026:
https://help.fansly.com/en/articles/12582143-if-i-delete-sold-media-will-fans-keep-access.

Question 27 approved in chat (**P04 / LEG-MT-011**, refund circumstances):
PPV purchases are generally final after successful delivery; changing one's
mind does not ordinarily qualify for a refund. Subscription cancellation does
not ordinarily produce a refund for unused time. Review requests involving
duplicate/incorrect charges, confirmed unauthorized transactions, failure to
deliver, material differences from the description, or loss of promised access
that cannot be resolved. Applicable consumer rights (including any withdrawal
rights) and processor requirements take precedence; provide refunds or other
appropriate remedies where required. Additional goodwill refunds may be granted
case by case without creating a general entitlement to future refunds.
The final policy and handling workflow must be finalized and tested before live
payments. This replaces the questionnaire's absolute wording on unused
subscription time and preserves mandatory remedies.

September 13: the founder also authorized a bounded **refund-help UI preview**
while the commissioned lawyer's draft/review is pending. `/legal/refunds` uses
an original Pumdoki help-article layout informed by Fansly's refund article:
purchase/subscription explanations, reviewable issues, request-preparation
guidance, consumer-rights exceptions, and related policy links. Billing, the
shared footer, and Legal Hub link to it. It is explicitly a draft, not yet in
effect, with no submission form, sensitive-data intake or refund processing.
Q23, Q26 and Q27 provide its approved product direction; publishing final legal
copy and operating refunds remain incomplete. This authorized P04 UI work does
not mark Terms, payment operations or the phase complete. The P05 local-content
founder review remains the next engineering checkpoint after this discussion.

Sources reviewed September 13, 2026:
https://help.fansly.com/en/articles/10544590-requesting-a-refund and
https://commission.europa.eu/topics/business-and-industry/contract-rules/digital-contracts/digital-contract-rules_en.
The founder subsequently considered a simpler optional USD balance alongside
direct payments (**P06 / LEG-MT-094**), then explicitly chose to handle wallets
in the future and continue to Question 28. This latest instruction parks the
assessment as well as implementation. Preserve the Phase 6 candidate; do not
delay current work or restore mandatory Veso spending for it.

Questionnaire impact if wallets are later resumed: retain the current approved
answers now; future wallet changes would affect Q11 (processor arrangement),
Q26 (PPV funding) and Q27 (refunds). Direct purchases still use the approved
processor; any future wallet-funded purchase requires an authoritative,
successful ledger debit before access, backed by verified top-up funds. A
top-up alone does not buy a particular creator's content. Q26's ongoing
purchased-version access remains unchanged. Q27's approved purchase-refund
rules remain unchanged; a separate wallet addendum must address top-up refunds,
unused balances and closure if a wallet proceeds. Do not yet publish an
absolute non-refundable-top-up rule or require refunds to wallet credit.

Q23–25 cancellation, renewal and failed-payment answers do not need changes
if the recommended processor-billed subscription boundary is adopted. If
wallet-funded renewal is later selected, separately decide funding priority,
insufficient-balance behavior and any authorized card fallback. Upcoming
chargeback, creator payout/hold/refund-allocation, and privacy/payment-data
answers must cover the chosen model when reached; no earlier entity, age,
country, tax or contact decision needs to be reopened solely for this option.

The founder's LoyalFans payment-method/country observations are observations
of the offered UI, not verified global availability or evidence that a zero
balance explains a hidden wallet option. Do not copy that country list into
Pumdoki eligibility. Official sources reviewed September 13, 2026:
https://help.fansly.com/en/articles/10544581-general-fan-wallet-information,
https://loyalfans.com/legal/terms-conditions,
https://ccbill.com/industries/live-cams and
https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-a-charge-on-my-credit-card-bill-en-61/.

Question 28 approved September 14, 2026 (**P06 / LEG-MT-103**, chargeback
consequences): review chargebacks using processor records and available
evidence. Access associated with the disputed transaction may be temporarily
restricted during review. If payment is reversed, related paid access may end
under the applicable Terms and Refund Policy. Unrelated, valid purchases are
not automatically revoked. Broader payment or account restrictions may be
applied where justified by fraud, account-security risks or processor
requirements. Confirmed fraud or repeated bad-faith chargeback abuse may result
in suspension or termination, with notice and an opportunity to appeal where
applicable. Do not penalize members solely for raising a good-faith dispute;
statutory dispute rights remain unaffected. Legal and processor review,
implementation and testing remain pending. This replaces Q28's blanket
immediate suspension, loss of purchased access and repeat-chargeback
termination recommendation. It preserves Q26's unrelated valid purchases and
Q27's mandatory remedies; it does not activate dispute operations.

Sources reviewed for Q28:
https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-a-charge-on-my-credit-card-bill-en-61/,
https://help.fansly.com/en/articles/12314588-disputing-a-transaction and
https://loyalfans.com/legal/terms-conditions.
Q29's graduated enforcement, immediate action for absolute prohibitions and
appeals direction remains unchanged; final policy and operations are pending.

Question 30 approved September 14, 2026 (**P04 / LEG-MT-011**, paid service
categories): proposed categories are SFW gaming companionship, permitted SFW
social-media interactions and adult video calls. Final launch availability
depends on processor approval, supported delivery methods, and implemented
age-verification, consent, moderation and dispute-handling controls. Services
involving third-party platforms must comply with those platforms' rules;
prohibited paid engagement will not be offered. Keep each category's provisions
self-contained so it can be enabled, restricted or suspended without
restructuring the Terms or Acceptable Use Policy. This qualifies the earlier
unconditional launch-category answer; it does not approve a final service
catalogue or implement booking, calls or paid service operations. The source
review identified rules against artificial engagement, including
https://newsroom.tiktok.com/how-tiktok-counters-deceptive-behaviour?lang=en-150.

Pumdoki Plus questionnaire note approved September 14, 2026 (**P04 /
LEG-MT-011**, Terms drafting context): describe Plus as a possible optional
platform-level premium membership, distinct from subscriptions to individual
creators. It is deferred and outside the confirmed launch offering. Benefits,
price, billing interval, renewal, cancellation and refund terms remain
undecided; specific Plus terms will be supplied for review once the offering
is defined. Place the note in Section 1 before the subscription-cancellation
question without renumbering the questionnaire. This is future drafting
context, not permission to implement Plus, advertise benefits or apply the
creator-subscription rules to it automatically. The existing deferred
DEC-PLUS-IDEAS tracker entry remains applicable; no new delivery task or
launch-scope change is required. The founder continues to edit the DOCX
manually.

Q31's paid-session commission remains pending. The expectation that it may
match standard content commission is provisional, not an approved fee.

Question 32 approved September 14, 2026 (**P04 / LEG-MT-011**, external
communication and transactions): lawful communication outside Pumdoki and
permitted links to creators' social profiles are allowed. Creators and members
must not use Pumdoki to redirect payment for purchases or services arranged
through Pumdoki outside its approved checkout. External service delivery is
permitted only through methods expressly allowed by Pumdoki, subject to
applicable legal and processor requirements and the external platform's rules.
Permission to share social links or communicate elsewhere does not
automatically authorize paid service delivery there. These provisions do not
require creators to operate exclusively on Pumdoki. This replaces the earlier
claim that retaining platform payments necessarily brings external activity
inside Pumdoki's moderation systems. It does not approve an external delivery
provider or activate payments, service fulfillment or monitoring. Q30's
category requirements remain applicable. Sources reviewed:
https://help.fansly.com/en/articles/12328704-promoting-other-websites and
https://fansly.com/tos.

Question 33 direction approved September 14, 2026 (**P04 / LEG-MT-011**,
arbitration): no provider or rules are selected. Ask the commissioned lawyer
to recommend whether mandatory individual arbitration and a class-action
waiver are appropriate for a Maryland-based platform serving international
members and creators. Consider NAM, used in Fansly's current platform Terms,
and AAA, with applicable business costs and registration requirements explained.
Address small-claims access, remote hearings, mandatory consumer rights and
whether creator disputes need different treatment. Request an appropriate
arbitration location without assuming all international users must attend in
Maryland. This replaces Q33's tentative AAA/Maryland selection with a targeted
recommendation request; it does not approve an arbitration agreement, a
class-action waiver, provider registration, spending or live legal copy.
Sources reviewed: https://fansly.com/tos (Section 14, NAM) and
https://www.adr.org/rules-forms-and-fees/consumer/ (business fee obligations).

Question 34 approved September 14, 2026 (**P04 / LEG-MT-011**, informal
dispute resolution): the founder selected **60 calendar days**, replacing the
questionnaire's 30-day proposal. If arbitration is adopted, require a
good-faith attempt to resolve covered disputes for 60 calendar days after
receipt of written notice describing the dispute and requested remedy, before
starting arbitration where legally permitted. Extensions require mutual
written agreement. Preserve small-claims access, urgent court relief,
regulatory complaints and statutory payment-dispute rights. This process must
not delay required refunds, content removal or complaint handling. Ask counsel
to include appropriate protections against legal filing deadlines expiring
during the informal process and confirm enforceability for international
users. This is a formal-dispute negotiation period, not a new support or
refund response deadline. It does not select an arbitration provider or make
the draft policy effective. Reference: https://fansly.com/tos (Section 14's
60-day informal period); separate payment-dispute deadlines remain relevant:
https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-a-charge-on-my-credit-card-bill-en-61/.

Question 35 approved September 16, 2026 (**P04 / LEG-MT-011**, court venue):
Maryland remains the preferred court venue for disputes not subject to
arbitration. Ask counsel to provide for jurisdiction and venue in the
appropriate Maryland state or federal courts to the extent legally
enforceable. Preserve applicable small-claims options and mandatory consumer
rights to bring or defend proceedings in another jurisdiction. Align the
provision with the final arbitration clause and identify necessary exceptions
for international users. This qualifies the questionnaire's unconditional
Maryland venue answer; it does not choose an arbitration seat, override
non-waivable consumer rights or finalize legal copy. Source reviewed:
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02012R1215-20150110
(Articles 17–19, qualifying consumer contracts). Questionnaire review now
continues under **P04 / LEG-MT-012 — Draft Privacy Policy**; the P05
local-content founder review remains the next engineering checkpoint.

Question 36 approved September 16, 2026 (**P04 / LEG-MT-012**, registration
data): the current ordinary-member registration implementation collects email,
display name and password, storing the password as a hash. It records age
attestation, email-verification status, account identifiers, timestamps,
versioned Terms/Privacy acceptance, and associated IP address and
browser/session information. The planned launch flow will additionally record
Acceptable Use Policy acceptance and use the reviewed Privacy Policy
acknowledgment wording from Q21; those changes remain pending. Where age
verification is required, the intended flow will process results from the
selected provider. The provider, exact returned information and retention
arrangements remain unconfirmed. The ordinary-member registration form does
not currently request a date of birth. This replaces the earlier incomplete
data list and separates current collection from planned verification; it does
not select a provider, approve identity-document collection/storage, alter
retention or finalize the Privacy Policy. Source inspection:
`packages/contracts/src/auth.ts`, `apps/api/src/auth/service.ts` and
`packages/database/prisma/schema.prisma`. The founder edits the questionnaire
manually.

Question 37 approved September 16, 2026 (**P04 / LEG-MT-012**, creator data):
in addition to ordinary member data, planned creator onboarding and
monetization involve creator application details, legal name, date of birth,
identity-verification information, residence/tax information, applicable tax
documentation, payout details and agreement-acceptance records. Performer
identity, age and consent records, including §2257 records where applicable,
are also required. Tax documentation depends on tax status, entity type and
the payment arrangement, such as W-9 for U.S. persons or an applicable W-8
form for foreign persons. This replaces the blanket W-9 reference; it does not
select a form for every foreign creator, a withholding rate or a final tax
workflow. The Privacy Policy must identify which information Kiban receives,
can access and stores, and which is handled by verification, tax, payout or
recordkeeping providers. Exact fields, collection timing and storage
arrangements remain to be confirmed. Sensitive identity, tax and payout
collection is not implemented. Preserve Q22's stage-specific requirements;
this does not authorize real data collection or provider activation. Sources
reviewed: https://www.irs.gov/instructions/iw8ben and
https://creatorhub.fansly.com/tax-forms-and-record-keeping/.

Question 38 approved September 16, 2026 (**P04 / LEG-MT-012**, verification
information and document storage): use specialist third-party providers for
age and identity verification. Retain the minimum necessary verification
evidence, such as the outcome, verification reference and date, plus any
additional information required by applicable law or confirmed processor
requirements. Avoid storing raw identity documents or verification selfies in
Pumdoki's ordinary application systems. Where §2257 recordkeeping applies,
have the required records, including identity-document copies, held by a
qualified records custodian under documented retention and access arrangements.
Providers and the custodian remain unselected. Confirm the information
returned to Kiban, its access to documents, retention/deletion arrangements
and each party's responsibilities before implementation; the final Privacy
Policy must describe the actual arrangements. This qualifies the original
pass/fail-only proposal and separates member age checks from creator/performer
recordkeeping. Outsourcing does not remove an applicable producer's duties;
this decision does not determine Kiban's §2257 status or authorize real
identity collection, a manual document workflow or provider activation.
Sources reviewed:
https://help.fansly.com/en/articles/11845000-global-age-verification-requirement
(member age-verification flow) and
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.2
(required records and contracted custodians).

Question 39 approved September 16, 2026 (**P04 / LEG-MT-012**, payment
information): use processor-hosted checkout so full card numbers and card
security codes are submitted directly to the processor and are not collected
or stored by Pumdoki. Kiban will receive or access information necessary to
operate the service, potentially including transaction/subscription references,
amounts, currencies, dates, payment status, refund/chargeback information and
limited payment-method details such as card brand and last four digits.
Customer contact and billing information may also be accessible depending on
the processor and configuration. Use necessary information for purchased
access, subscription management, support, accounting, fraud prevention and
payment disputes; retain only necessary information. Confirm the exact fields
available through the integration and merchant dashboard, and retention,
before finalizing the Privacy Policy. This replaces the questionnaire's
inaccurate "None" and "support purposes only" statements. It does not select a
final integration or approve live payments; payment processing remains
unimplemented. Source reviewed: https://ccbill.com/doc/newsalesuccess.

Question 40 reviewed September 16, 2026 (**P04 / LEG-MT-012**, direct messages
and communications): retain the existing answer as a description of the
planned messaging service. Its message content, attachment, timestamp and
participant categories, with review in response to reports, complaints or
legal requests, fit the intended scope. This is not a claim that production
messaging storage or moderation exists: Phase 9 persistence and Phase 11
operations remain pending. Retention, permissions and applicable legal-request
handling still need the approved policies and implementation. No new message
monitoring, encryption claim or service activation is approved.

Question 41 approved September 16, 2026 (**P04 / LEG-MT-012**, device, IP,
location, log and usage information): the current authentication and server
systems collect IP addresses, browser/user-agent information, session
identifiers and timestamps, and technical API request/error logs. For launch,
use approximate location derived from IP where needed to apply geographic
access restrictions and applicable legal or processor requirements. Confirm
the provider, information processed and retention arrangements before
implementation. Additional page/content interaction tracking remains to be
defined. Collect only information needed for specific service, security or
operational purposes, and document those purposes, access and retention in
the final Privacy Policy. This distinguishes existing technical records from
planned location checks and undefined interaction tracking; it does not
activate a location provider or additional tracking. Source inspection:
`apps/api/src/routes/auth.ts`, `apps/api/src/auth/service.ts`,
`apps/api/src/app.ts`, `apps/api/src/logger.ts` and
`packages/database/prisma/schema.prisma`. Transparency reference:
https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/cookies-and-privacy-notices-in-detail/.

Question 42 reviewed September 16, 2026 (**P04 / LEG-MT-012**, analytics and
tracking technologies): retain the existing answer. No third-party analytics
are planned at launch; ordinary first-party session handling remains, and
error tracking is planned with Sentry unconfirmed. This is consistent with
Q15. The current frontend error boundary logs errors to the console and has
only a placeholder for a future reporting provider; this review does not
claim that Sentry or another external error service is implemented.

Question 43 approved September 16, 2026 (**P04 / LEG-MT-012**, cookies and
similar storage): the current account flow uses a first-party session cookie
for authentication and session management. Theme preferences use browser local
storage; the explicit-content preference is stored against the user's account.
Other browser storage remembers the selected chat, dismissal of the
email-verification banner and choices in the prototype cookie banner. No
advertising cookies or third-party analytics are planned at launch. Before
launch, complete an inventory of cookies and similar storage, including
selected providers, document their purposes and duration, and implement any
required consent controls. The existing cookie banner is a prototype and must
be aligned with the actual storage used. This corrects the original claim
that theme/content settings both use preference cookies; it does not certify
the current banner or activate tracking. Source inspection:
`apps/api/src/auth/session.ts`, `apps/api/src/routes/preferences.ts`,
`apps/web/src/appearance/MemberThemeProvider.jsx`,
`apps/web/src/components/ChatSidebar.jsx`,
`apps/web/src/components/EmailVerificationBanner.jsx` and
`apps/web/src/components/CookieConsentBanner.jsx`. Reference:
https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/.

Questions 44 and 45 reviewed September 16, 2026 (**P04 / LEG-MT-012**): retain
the existing answers on no advertising/retargeting tools and no sale of
personal information or sharing for cross-context behavioural advertising.
These fit Q15/Q42's launch direction. This is the intended data-use policy;
selected-provider and final implementation review remain necessary.

Question 46 direction and questionnaire wording approved September 16, 2026 (**P04 / LEG-MT-012**,
retention): the founder directed Pumdoki to follow the published OnlyFans and
Fansly model for purchased content, accounts, messages, complaints, transaction
records and §2257 records. Adopt the verified service-need and legal-obligation
approach below; do not invent a shared numerical retention schedule that the
platforms do not publish. The earlier blanket account-plus-12-month,
24-month-message and three-year-complaint proposals are not adopted.

- Purchased content: preserve the purchased version and entitlement evidence
  for ongoing buyer access without a scheduled expiry, including after ordinary
  creator delisting or message deletion. This implements Q26's Fansly-based
  direction; legal/safety removal, reversed payments and applicable Terms and
  Refund Policy still govern access. Do not claim an identical OnlyFans rule.
- Accounts: retain necessary data for the account's life or the relevant
  service need. After closure, delete or anonymize unnecessary data while
  restricting and retaining only records justified by continuing obligations,
  transactions, security, disputes or legal requirements. The account-deletion
  procedure is recorded under Q47 below; no 30-day recovery window is adopted.
- Messages: retain ordinary conversation history while needed to provide the
  messaging service, subject to reviewed deletion rules and preservation needs.
  Do not automatically purge messages merely because they reach 24 months.
  User-visible removal and backend deletion are distinct; purchased media and
  necessary transaction or complaint evidence must be handled separately.
- Complaints/moderation: retain necessary evidence through investigation,
  resolution, appeals, applicable claim periods and justified safety or legal
  preservation needs. No universal three-year period is selected. Record the
  reason and review point for extended retention rather than keeping everything
  indefinitely. Q64 adds the specific one-year clock from CyberTipline submission
  for report contents and related material covered by 18 U.S.C. §2258A, with
  longer preservation where legally required; this is not a blanket clock for
  every complaint or the user's entire account.
- Transactions: retain necessary financial, tax, refund, chargeback and payout
  records for applicable accounting/tax/processor periods and legal holds.
  OnlyFans' reproduced policy mentions seven years in some compliance cases;
  this is not a verified shared seven-year rule, a universal IRS requirement or
  a blanket maximum. Define the applicable clock for each record category.
- §2257 records, where applicable: use the qualified custodian approach in Q38
  and the actual rule in 28 CFR §75.4: seven years measured from creation or
  the latest amendment/addition, and five years following business cessation
  (with the regulation's dissolution provision where relevant). Document the
  applicable dates and custody responsibilities; do not summarize this as an
  automatic twelve-year retention period or decide Kiban's legal status here.

The founder approved the questionnaire answer without competitor names. Its
transaction-record wording includes seven years where applicable and longer
where legally required, not a universal seven-year rule. The answer describes
planned policies and explicitly leaves the operational schedule, legal holds,
provider copies, backups and deletion/anonymization controls to be defined
before launch. The internal evidence below remains for traceability. The
account-deletion procedure approved under Q47 follows below.

Evidence reviewed September 16: Fansly's live Privacy Policy, Sections 5, 7
and 8 (the page displays February 26, 2022), uses necessary-purpose retention
and deletion exceptions: https://fansly.com/privacy. Its help pages confirm
preservation of sold media after ordinary deletion:
https://help.fansly.com/en/articles/12582143-if-i-delete-sold-media-will-fans-keep-access
and https://help.fansly.com/en/articles/10544423-mass-messages.
OnlyFans' live site was blocked by the browser safety policy; it was not
bypassed. Secondary evidence is ConductAtlas's reproduced clauses, labelled
May 5, 2026 and captured July 9, 2026, rather than a verified current live
OnlyFans policy:
https://conductatlas.com/platform/onlyfans/onlyfans-privacy-policy/provision/CA-P-058736/retention-for-duration-of-account-or-service-need/,
https://conductatlas.com/platform/onlyfans/onlyfans-privacy-policy/provision/CA-P-058737/retention-for-trust-and-safety-investigations/,
https://conductatlas.com/platform/onlyfans/onlyfans-privacy-policy/provision/CA-P-058739/retention-for-legal-claims-and-litigation/
and
https://conductatlas.com/platform/onlyfans/onlyfans-privacy-policy/provision/CA-P-058738/retention-up-to-seven-years-for-compliance/.
Statutory source: https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.4.

The business direction is decided. Before live use, translate it into a
category-specific operational schedule with necessary legal/tax/processor
review, start dates, deletion/anonymization actions, access restrictions and
legal-hold reviews, including provider copies and backups. This remaining
implementation detail is not a reason to reopen the whole business model.
Final legal wording, timers, deletion jobs, purchases, messaging and operational
retention controls remain unimplemented.

Question 47 approved September 16, 2026 (**P04 / LEG-MT-012**, account
deletion): plan self-service deletion requests through account settings or
`privacy@pumdoki.com`, with proportionate verification of account ownership.
Before confirmation, explain the consequences for subscriptions, purchased
content access and outstanding creator payouts. No mandatory recovery period
is planned for launch; the original automatic 30-day wait is not adopted.

Account closure will stop future subscription renewals and new transactions
involving the closing account. Handle existing paid obligations, refunds,
disputes and creator payouts under the applicable policies. Ordinary creator
closure preserves other members' purchased access, subject to legal/safety
removals and the applicable Terms, consistently with Q26/Q46.

Delete or anonymize unnecessary personal information without undue delay and
within applicable legal deadlines. Retain only necessary records with a
documented lawful basis under Q46's schedule; moderation or law-enforcement
labels do not automatically exempt all related data from deletion. Include
provider copies and backups in the procedure. Implementation and final policy
review remain required before live use. This approval does not claim that
self-service deletion, renewal cancellation, settlement or erasure controls
already exist. Reference for erasure deadlines, exceptions and backups:
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/.

Question 48 approved September 16, 2026 (**P04 / LEG-MT-012**, privacy
requests): use `privacy@pumdoki.com` as the planned contact, while recognizing
and routing valid requests received through other channels. Log and acknowledge
requests, then handle them without undue delay within the applicable deadline.
Generally this is one calendar month for EU/UK GDPR requests and 45 calendar
days for covered CCPA access, correction and deletion requests; apply shorter
deadlines where required. Do not use 45 days as a universal privacy-request
target or treat an acknowledgement as the substantive response. Communicate
any legally permitted extension within the required notice period, with the
reason and revised deadline.

Use proportionate identity verification based on the request and sensitivity
of the information, using existing account verification wherever possible.
Request additional identification only when necessary. Explain any retention
exception or refusal and available complaint/appeal rights. For the limited
launch, use the existing inbox and a restricted request log with deadline
reminders. The alias exists; routing, monitoring and the handling procedure
still require configuration and testing before launch. This does not claim
an operational privacy-request service or establish that every cited law
applies to every user/request.

References: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals_en,
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-of-access/what-should-we-consider-when-responding-to-a-request/
and https://oag.ca.gov/privacy/ccpa.

Question 49 approved September 16, 2026 (**P04 / LEG-MT-153**, international
restrictions): support international creators and a limited pilot of
international adult members. Enable countries once applicable legal,
age-verification, payment/payout, privacy, tax and operational requirements
have been met. The final supported-country lists remain unconfirmed.

Assess creator and member eligibility separately. Actively restrict relevant
access, onboarding or transactions where the location or activity cannot yet
be supported, using appropriate geographic and eligibility controls rather
than relying solely on not marketing there. Required age checks must succeed
before adult-content access. Broad international availability remains the
objective; expand with verified provider coverage and manageable verification
costs, payment risk and support capacity. This implements Q9/Q10's direction
without approving a fixed regional shortlist, the questionnaire's Argentina
example, any specific provider or live access. The restrictions and operational
controls still require implementation and verification before live use.

Comparison sources reviewed September 16:
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly and
https://help.fansly.com/en/articles/11845000-global-age-verification-requirement.
These support broad creator eligibility with restrictions and country-specific
age checks; they do not establish Pumdoki's supported countries or providers.

Question 50 approved September 16, 2026 (**P04 / LEG-MT-012**, GDPR
applicability): draft the Privacy Policy for international creators and members
from the outset, including EU/EEA and UK provisions where applicable. Do not
leave these dormant solely because member access is limited during the pilot.
Determine applicability from the actual services, locations served and
processing activities, not creator nationality or member availability alone.
The questionnaire's old US/Canada/Mexico-only premise and categorical exclusion
of UK GDPR are not adopted.

Before beginning covered processing, establish the necessary privacy controls,
rights-request procedures, vendor arrangements and international-transfer
safeguards, including any required local representative. This includes covered
creator onboarding before public launch. Review actual applicability/readiness
against the launch configuration; this drafting decision neither approves a
particular country nor claims that the required controls are implemented.
References:
https://www.edpb.europa.eu/documents/guideline/guidelines-32018-on-the-territorial-scope-of-the-gdpr-article-3-version-adopted_en
and
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/are-we-making-a-restricted-transfer/.

Question 51 reviewed September 16 (**P04 / LEG-MT-012**): retain the pending
vendor-specific retention answer. Age-verification and §2257 custodian terms
remain unconfirmed until selection. Q46's operational schedule also covers
other provider copies and backups; no invented provider retention period is
approved.

Question 52 reviewed September 16 (**P04 / LEG-MT-014 — Draft Acceptable Use
Policy**): retain the questionnaire's core prohibited-content categories.
This does not complete the AUP: the later specific rules remain to be resolved,
followed by review against the selected processor's requirements and
implementation. Q53's subsequent decision follows below.

Question 53 approved September 21, 2026 (**P04 / LEG-MT-014**, additional
prohibited categories): supplement Q52's core rules with the following:

- Sexual scenarios involving real, simulated or implied intoxication,
  drugging, unconsciousness, hypnosis or inability to consent.
- Alcohol consumption or presence in adult content, and depictions or
  promotion of cannabis or other intoxicating substances, regardless of
  local legality.
- Sexual or fetish content involving feces, vomit, blood, urine consumption,
  or bodily waste deposited on another person.
- Additional content prohibited by applicable law or requirements of the
  selected payment processor, acquiring bank or card networks.

Apply these restrictions to content, descriptions, promotional material and
requests made through the platform. Publish clear definitions and examples
for creators and moderators, and reconcile the final list with the selected
processor's written requirements before launch. These are approved platform
policy choices, not a claim that every category is universally illegal.
The specific list replaces the questionnaire's vague reference to bodily
fluids associated with disease transmission. Comparison references:
https://fansly.com/tos and
https://ccbill.com/cs/client/policies/ccbill/acceptable_use.html.
Final policy review and operational enforcement remain pending.

Question 54 approved September 21, 2026 (**P04 / LEG-MT-014**, third parties
and co-performers): verify the identity and age of every person depicted in
creator content or participating as a co-performer, including faceless,
blurred-face and voice-only performers. They must have been at least 18 when
the content was created and meet any higher applicable legal minimum. A
partner, spouse or another verified creator is not exempt; replace the
questionnaire's narrower reference to identifiable persons.

Creators must obtain documented, voluntary consent to participation and
recording before production, and permission to upload/distribute the content
before uploading it. Pumdoki must approve the required verification and
consent evidence before publication or sale. Consent must cover the content
and its intended uses; another person's verified account or a creator tag
alone does not establish consent. Q55's documentation and permitted-use
decision follows below. This is an approved policy requirement, not an implemented
verification/consent workflow or authorization to collect real identity data.
Preserve Q38's specialist-provider and qualified-custodian direction.
References:
https://www.mastercard.com/content/dam/public/mastercardcom/na/global-site/documents/SPME-Manual.pdf
(published Merchant Edition, February 11, 2025, §9.4.1),
https://help.fansly.com/en/articles/10544523-how-to-verify-and-publish-content-featuring-others-on-fansly
and https://help.fansly.com/en/articles/12315578-ai-generated-content-on-fansly
(includes the voice-only co-performer requirement).

Question 55 approved September 21, 2026 (**P04 / LEG-MT-014**, consent
documentation; related recordkeeping task **P04 / LEG-MT-016**): require
government-issued photo-ID verification through the approved secure process
and a signed, dated consent release for each person, linked to their verified
identity and the content covered. Document participation/recording consent
before production and upload/distribution permission before upload, consistent
with Q54. Complete required verification and consent review before publication,
including additional jurisdiction-specific documentation or formalities.

Download permission is required only if downloading is enabled for that content;
this does not approve downloads, which remain undecided under Q26. Promotional
reuse beyond the agreed platform publication requires separate, optional
permission specifying permitted uses and channels. Do not treat either right
as automatically granted by a purchase or a general publication release.

Retain documentation securely under defined access and retention rules. Where
§2257 applies, the required statutory records, including required ID copies,
will be held by a qualified custodian separately from other records. Consent
releases need their own documented storage arrangements. The same provider
may manage both if its contract covers both services, with statutory records
still segregated. Preserve Q38's storage boundaries and Q46's retention
direction; this does not decide Kiban's producer status or relieve any
applicable producer of its obligations. Final forms, providers and workflows
remain unconfirmed and must be established before live use. References:
https://www.mastercard.com/content/dam/public/mastercardcom/na/global-site/documents/SPME-Manual.pdf
(§9.4.1, conditional download consent) and
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.2
(required records, segregation and contracted custodians).

Question 56 decision approved September 21, 2026
(**P04 / LEG-MT-014**, AI-generated and digitally altered adult content):
permit only minor retouching of authentic creator media, such as lighting,
exposure and contrast adjustments or light skin smoothing. The result must
remain a faithful, recognizable depiction of the verified creator, preserving
their actual physical features and natural skin tone. Permitted AI-assisted
edits must be clearly labeled **AI-enhanced**; disclosure does not make a
prohibited alteration acceptable.

Prohibit digital changes to physical appearance or clothing, including muscle
definition, body proportions or waist shape; lightening, darkening or otherwise
recoloring the complexion; adding or altering facial hair; changing teeth or
their appearance; changing eye or hair color; and adding, removing or replacing
clothing. These restrictions concern digital alterations, not actual grooming,
hair dye or wardrobe choices captured in authentic media. Minor lighting/color
correction is allowed only when it preserves the person's natural appearance.

Clearly stylized, non-photorealistic adult artwork and virtual personas may be
permitted through accounts operated by verified adults, subject to processor
acceptance and moderation readiness. Creators must hold the necessary rights
to the source material and resulting work, clearly disclose virtual/synthetic
content, and label AI-generated work **AI-generated**. Any real participants
must be verified, consenting adults; fictional characters must be unambiguously
adult. This conditional allowance is distinct from edits of authentic creator
media, which remain subject to the appearance restrictions above.

Prohibit photorealistic or lifelike adult media substantially generated by AI,
including deepfakes and face swaps. Consent or an AI-generated label does not
override this restriction. Non-consensual likenesses, impersonation, sexualized
minors or apparent minors, and other prohibited content remain banned
regardless of the technique used.

Violations will result in a warning and may lead to content removal, account
restrictions, suspension or a permanent ban according to severity and repeated
violations. Preserve Q29's immediate-action exceptions for serious/absolute
prohibitions and its appeals direction; do not promise a warning before every
serious safety action. This is the founder's platform policy choice, not a
claim about a competitor's exact rule or an implemented detection/enforcement
system. Final policy review, creator guidance and moderation controls remain
pending. The stylized-artwork/virtual-persona allowance is an approved policy
direction with the stated prerequisites; it does not authorize activation or
new product implementation.

Question 57 approved September 21, 2026 (**P04 / LEG-MT-014**, deepfakes and
synthetic depictions): replace the original consent-only restriction with Q56's
prohibition on photorealistic or lifelike adult media substantially generated
by AI, including deepfakes and face swaps, regardless of consent or labeling.
Non-consensual likenesses, impersonation and sexualized depictions of minors
or apparent minors remain prohibited regardless of technique.

Minor retouching of authentic creator media and clearly stylized adult artwork
or virtual personas remain subject to all Q56 appearance, verification, rights,
consent, disclosure and labeling conditions. The stylized-content allowance
still requires processor acceptance and moderation readiness. Preserve the
enforcement and appeals procedures and immediate action for serious violations.
This records aligned policy wording, not an operating moderation workflow.

Question 58 approved September 21, 2026 (**P04 / LEG-MT-014**, weapons,
drugs, violence, self-harm, harassment, impersonation and doxxing): prohibit
weapons in content except obviously fake costume props used without threats,
violence or other prohibited activity. Drug and intoxicant content remains
subject to Q53. Prohibit content depicting, promoting or instructing violence,
suicide or self-harm.

Prohibit harassment, threats, stalking, impersonation and doxxing, including
unauthorized disclosure of another person's private identity, address, contact
details or location. Good-faith reports submitted privately through approved
reporting channels are not doxxing. Violating content may be removed immediately
and accounts restricted during review. Deliberate or serious doxxing, credible
threats and other severe violations may result in immediate permanent termination;
other violations follow proportionate enforcement based on severity and history,
with an appeal. This replaces automatic permanent termination for every privacy
incident. Final definitions and operating moderation/reporting/appeal controls
remain pending. Comparison reference: https://fansly.com/tos (fake-prop exception
and severity-based enforcement); the approved wording is Pumdoki's policy choice.

Questions 59-60 reviewed September 21 and retained: permitted external links and
promotion of creators' other platforms fit Q32's non-exclusive approach. General
content rules and the prohibition on diverting Pumdoki-arranged payments still
apply; this does not approve external paid-service delivery. Q61's strict
prohibition on soliciting prostitution or escorting is retained, with the existing
enforcement, appeals and appropriate-referral framework applying. No new live
service, reporting process or enforcement capability is claimed by these answers.

Question 62 approved September 21, 2026 (**P04 / LEG-MT-014**, first and
repeat violations): minor first violations normally receive a warning and
removal or correction of offending content. Repeated or more serious violations
may lead to account restrictions, temporary suspension or permanent termination.
Consider severity, actual or potential harm, intent and relevant violation
history rather than an automatic three-strike rule or fixed seven-day suspension.

Serious violations may warrant immediate content removal and account suspension
during investigation, followed by permanent termination where justified without
a prior warning. Provide notice of the decision and information about available
appeals, subject to lawful restrictions on disclosure. This aligns Q62 with
Q29/Q58 and replaces the questionnaire's fixed first/second/third penalty ladder.
Moderation, decision notices and appeals remain planned workflows, not implemented
capabilities.

Question 63 approved September 21, 2026 (**P04 / LEG-MT-014**, immediate
permanent termination): substantiated serious violations may result in immediate
permanent termination, including child sexual exploitation, non-consensual
intimate content, trafficking or coercion, prohibited prostitution or escort
solicitation, deliberate or severe doxxing, and credible threats of serious harm.
Disable accounts confirmed to be operated by minors; content depicting minors
remains prohibited.

Suspected serious violations may trigger immediate content removal and account
suspension pending urgent review. Required reporting and evidence preservation
must proceed without waiting for the account investigation to conclude. Making
a report does not by itself establish grounds for permanently banning a
particular account. Apply Q62's notice and appeals procedures, subject to lawful
restrictions on disclosure. This replaces the original blanket termination
trigger for any conduct requiring a report and aligns doxxing enforcement with
Q58. Reference for the distinction between apparent violations and final account
decisions: 18 U.S.C. §2258A,
https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title18-section2258A&num=0&edition=prelim.
These are approved policy requirements; reporting, preservation, moderation and
appeals workflows remain unimplemented.

Question 64 approved September 21, 2026 (**P04 / LEG-MT-014**, escalation to
law enforcement; related **P04 / LEG-MT-030** request-policy work): report
apparent CSAM, child sex trafficking and online enticement of children to NCMEC's
CyberTipline as soon as reasonably possible after obtaining knowledge of facts
indicating a reportable violation, as required by applicable law. This expands
the questionnaire's CSAM-only description of mandatory CyberTipline reporting.

Immediately escalate credible emergencies involving danger of death or serious
physical injury to the appropriate emergency services or law-enforcement agency.
Refer other suspected trafficking, coercion or serious criminal activity where
reporting is required, or otherwise legally permitted and appropriate. Disclose
only information lawfully shareable for that purpose; this is not blanket
permission to provide private communications or account data on any request.

Preserve relevant evidence securely with restricted access and documented actions.
Retain CyberTipline report contents and related material covered by the statutory
preservation requirement for one year after submission, with longer preservation
where legally required. Q46's operational retention schedule must include this
specific clock. Removing public access must not destroy evidence subject to
preservation. Mandatory reports and emergency action must not await completion
of an internal investigation or appeal. References: 18 U.S.C. §2258A and §2702,
https://www.law.cornell.edu/uscode/text/18/2258A,
https://www.law.cornell.edu/uscode/text/18/2702, and
https://us.missingkids.org/blog/2024/first-line-of-defense-guidelines-to-help-online-platforms-detect-sexually-exploited-kids.
NCMEC reporting setup, restricted evidence handling, operational contacts and
procedures remain unimplemented. The related government-request policy also
still needs drafting; this decision does not complete LEG-MT-030 or authorize
real reports, sensitive collection or deployment.

Questions 65-66 reviewed September 21 (**P04 / LEG-MT-013 — Draft Community /
Platform Rules**) and retained: community rules apply to creators and members,
with additional creator obligations in the Creator Agreement; use concise plain
language, with detailed enforceable rules in the AUP. This task is In Progress,
not a fully locked community-policy decision.

Question 67 approved September 21, 2026 (**P04 / LEG-MT-013**, comments and
direct messages): require respectful conduct and prohibit harassment, threats,
hate speech and unauthorized disclosure of another person's private information.
Creators may decline ordinary messages and requests without giving a reason.
A subscription, purchase or tip does not automatically guarantee a reply or
ongoing personal attention.

Where a response or interaction is expressly included in an accepted paid service,
the creator must fulfill the agreed terms or cancel and resolve the payment under
the Refund Policy. Payment never overrides consent or personal boundaries. This
clarifies the questionnaire's blanket no-reply-obligation statement without
approving a new service category or implementing messaging/payment workflows.
Preserve Q27/Q30's refund and service-availability boundaries.

Question 68 reviewed September 21 and retained as a launch-policy requirement:
prohibit harassment and bullying, including coordinated harassment and repeated
unwanted contact after a request to stop. Blocking must be available to creators
and members at launch; the questionnaire's present-tense availability statement
must not be treated as an implemented capability. Real messaging, user blocking
and the related enforcement workflow remain unimplemented.

Question 69 approved September 21, 2026 (**P04 / LEG-MT-013**, unwanted sexual
communications): prohibit unsolicited or unwanted explicit personal messages
and media from creators or members. Being an adult creator or accepting paid
messages does not by itself mean every intimate photograph is welcome. Users
must respect refusals, requests to stop and blocks.

Provide reporting and blocking. Review the reported message and relevant
conversation, remove or disable access to violating content, and retain necessary
evidence with restricted access under the existing retention rules. Apply warnings,
messaging restrictions, suspension or permanent termination according to severity
and history, consistent with Q62-63. Serious incidents may justify immediate action;
repeated sending after refusal and evasion of blocks weigh toward stronger
enforcement. An allegation alone does not establish a violation or require an
automatic ban. Preserve decision notices and available appeals under Q62.

The founder selected platform-policy enforcement for this answer. Messaging,
reporting, user blocking and moderation controls remain launch requirements, not
implemented capabilities.

Question 70 approved September 21, 2026 (**P04 / LEG-MT-013**, impersonation and
false profiles): prohibit impersonation of another person, creator, business or
platform staff. Stage names and permitted, clearly disclosed virtual personas are
allowed provided they do not impersonate someone else or misrepresent required
verification information. Preserve Q56's conditions for virtual personas and
synthetic content; this decision does not expand those permissions.

Replace the blanket automatic-termination answer with content removal, account
restrictions, suspension or termination according to severity and history. Serious
impersonation may justify immediate termination, subject to applicable review and
appeal procedures under Q62-63. These are policy decisions; account verification
and moderation operations remain incomplete.

Question 71 approved September 21, 2026 (**P04 / LEG-MT-013**, spam and
promotional activity): prohibit spam, scams, repetitive or indiscriminate unwanted
messaging, misleading promotional claims, fake engagement, and unauthorized bots
or automation. Creators may promote their content to followers and subscribers
through platform-approved tools, where available, while respecting messaging
preferences, refusals, blocks and content rules, including Q69.

Replace the blanket automated-posting ban: authorized scheduled posts and bulk
or automated messages are not prohibited solely because they use automation.
This is a policy allowance; scheduling, bulk messaging and other automation
features still require separate implementation approval. Preserve Q32 and Q59-61:
no solicitation of off-platform payment for purchases or services arranged through
Pumdoki, while permitted external profile links remain allowed.

Reference features reviewed September 21:
https://help.fansly.com/en/articles/12328724-post-scheduling and
https://help.fansly.com/en/articles/10544423-mass-messages.
Messaging, payment and moderation operations remain incomplete.

Question 72 approved September 21, 2026 (**P04 / LEG-MT-013**, custom-content
requests): members may request permitted custom content through direct messages.
Creators choose whether to accept or decline and need not give a reason. Requests
and resulting content must meet all content, verification and consent requirements.

Before accepting payment, agree on the content, format, price and delivery
deadline. Payments must use Pumdoki's approved checkout. Accepted paid requests
must be fulfilled as agreed or canceled with payment resolved under the Refund
Policy. Payment never overrides consent or personal boundaries. Preserve the
Q27/Q30/Q32/Q67 service, refund and payment boundaries in the Community Rules,
Terms and Creator Agreement.

Paid custom orders may be offered only once the relevant processor approvals,
delivery methods and moderation controls are in place. This is a product/policy
decision, not implemented messaging, order handling or payment capability.

Question 73 approved September 21, 2026 (**P04 / LEG-MT-013**, creators refusing
requests): creators may decline requests without giving a reason or being
penalized solely for refusing. They are never required to create content or perform
an interaction against their wishes. Canceling an accepted paid request requires
payment resolution under the Refund Policy. Payment never overrides consent or
personal boundaries. Include these protections in both the Community Rules and
Creator Agreement, consistent with Q67/Q72. This does not remove existing payment
obligations or implement custom-order/refund workflows.

Question 74 reviewed September 21 and retained as the intended launch scope:
in-product reporting on content, profiles and messages, user-level blocking, and
a public reporting route usable without an account. These remain planned
capabilities; the answer does not establish operational reporting, blocking or
case handling. Preserve Q7's unverified alias routing/testing status and Q68-69's
implementation requirements.

Question 75 approved September 21, 2026 (**P04 / LEG-MT-013**, immediate removal):
substantiated serious violations may result in immediate permanent termination
without prior warning, including child sexual exploitation, non-consensual intimate
content, trafficking or coercion, prohibited prostitution or escort solicitation,
deliberate or severe doxxing, and credible threats of serious harm. Disable accounts
confirmed to be operated by minors.

Suspected serious violations may trigger immediate content removal and account
suspension pending urgent review. A report alone does not establish grounds for a
permanent account ban. Required reporting and evidence preservation proceed without
waiting for the investigation to conclude; applicable decision notices and appeals
remain available. This aligns the Community Rules with Q62-64. Final policy review
and operating enforcement controls remain pending; LEG-MT-013 stays In Progress.

Question 76 approved September 21, 2026 (**P04 / LEG-MT-015 — Create DMCA Policy &
Takedown Process**): identify the designated agent publicly as "Copyright Agent,"
a position initially held by the founder, who will receive and handle notices.
Kiban Digital Holdings LLC is the service provider; Pumdoki and pumdoki.com are
alternate names. This replaces the proposed entity-as-agent wording and aligns
with the existing Q6 decision.
The Copyright Office FAQ, rechecked September 21, permits a position/title held by
an individual: https://www.copyright.gov/dmca-directory/faq.html.
Registration, contact setup/testing and mail-receipt confirmation remain pending.
The remaining DMCA policy and workflow review is incomplete.

Question 77 conditional wording approved September 21, 2026 (**P04 / LEG-MT-015**,
DMCA mailing address). The proposed address remains 306 W Redwood St, Ste 201,
Baltimore, MD 21201, subject to confirming
that Northwest will accept and promptly forward DMCA notices and counter-notices
addressed to Copyright Agent, Kiban Digital Holdings LLC under the founder's service.
The Copyright Office accepts a physical mailing address or post office box for the
designated agent; its separate service-provider address rule requires a street
address unless a waiver is granted. This does not establish Northwest's coverage.
Northwest's public service description distinguishes state/legal mail from its
limited ordinary-business-mail scanning allowance; treatment of DMCA correspondence
under this account remains unconfirmed. Source checked September 21:
https://www.northwestregisteredagent.com/registered-agent.

The founder approved keeping the address provisional; this is not confirmation
that Northwest has accepted DMCA mail under the current service.

Question 78 approved September 21, 2026 (**P04 / LEG-MT-015**, DMCA email address):
use dmca@pumdoki.com as the planned contact for copyright notices and counter-notices,
monitored by the founder acting as Copyright Agent. Confirm alias creation,
routing, and send/receive testing before publishing it or using it for Copyright
Office registration. This confirms the Q6 address choice and intended handling,
not that creation, configuration, monitoring or testing has been completed.

Question 79 approved September 21, 2026 (**P04 / LEG-MT-015**, public telephone):
use a dedicated Northwest business number as the Copyright Agent's public contact
in the DMCA Policy and Copyright Office directory. Link to the DMCA Policy from
the Terms, and supply the business number elsewhere when required. Do not use the
founder's personal number as the public DMCA contact; replace the original blanket
promise about all filings with this public-contact commitment. Number assignment,
activation, call routing and testing remain to be confirmed before publication or
registration. This is policy direction, not completed setup.

Questions 80-83 reviewed September 21 and retained as summaries of the planned
DMCA process: registration remains pending before launch (Q80); log and review
notices, remove/disable access on complying notices, and notify the uploading
creator with a copy (Q81); the founder reviews notices and counter-notices (Q82);
restore material 10-14 business days after receiving a complying counter-notice
unless the agent first receives notice of the complainant's filed court action
seeking to restrain the relevant activity (Q83).

These summaries do not establish operating intake or case handling. Implement
expeditious takedown, prompt creator notification, reasonable assistance for
qualifying incomplete notices, prompt forwarding of counter-notices and the
statutory restoration clock. Preserve separate content-policy restrictions;
resolution of a copyright notice does not authorize prohibited content. Sources
reviewed September 21: 17 U.S.C. §512(c)(3), (g),
https://www.law.cornell.edu/uscode/text/17/512 and
https://www.copyright.gov/512/.

Question 84 approved September 21, 2026 (**P04 / LEG-MT-015**, repeat infringement):
maintain and enforce a repeat-infringer policy and terminate accounts in appropriate
circumstances. Consider relevant infringement notices, other available evidence,
repeated conduct, deliberate reuploads, previous warnings, and outcomes of
counter-notices or other challenges.

Invalid or duplicate notices do not count as separate infringements. Review and
correct records when complaints are withdrawn or successfully challenged; submitting
a counter-notice alone does not establish that the complaint was false. Enforcement
does not depend solely on three notices within a fixed period. Serious or deliberate
infringement may justify earlier termination, with applicable notice, counter-notice
and appeal procedures preserved.

This replaces the draft's three-unresolved-valid-notices-within-12-months proposal;
no guaranteed three-strike allowance or automatic yearly reset is adopted. Section
512(i) requires adoption, reasonable implementation and communication of a policy
for terminating repeat infringers in appropriate circumstances, without prescribing
that count or period. Sources are the §512 and Copyright Office references above.
Case records, notices, counter-notice handling and enforcement remain unimplemented;
final policy review is pending.

Question 85 approved September 21, 2026 (**P04 / LEG-MT-015**, copyright warnings):
promptly notify creators when content is removed or access disabled following a
DMCA notice. Identify the affected content, explain the reason and available
counter-notice process, and normally warn that repeated infringement may lead to
account termination. There is no guaranteed number of warnings. Serious or
deliberate infringement may justify immediate action, with applicable notice,
counter-notice and appeal procedures preserved. This replaces the draft's fixed
strike-count language and aligns with Q84. The DMCA questionnaire section is
reviewed; final policy, registration, contact setup and operational controls
remain incomplete. LEG-MT-015 stays In Progress.

The active founder review moves to **P04 / LEG-MT-028 — Draft Non-Consensual
Content Policy**. Questions 86-87 are retained as planned arrangements consistent
with Q7, Q16 and Q74: a public reporting form at pumdoki.com/report and
report@pumdoki.com without an account, clearly linked from the site; founder
handling with monitored alerts and the already agreed urgent/backup coverage.
The alias exists, but routing/testing, the public form, alerts, deadline tracking
and operational backup coverage are not established by these answers. Implement
and verify these before launch; do not present them as operating services.

Question 88 approved September 21, 2026 (**P04 / LEG-MT-028**, NCII report
validation): accept removal requests from the depicted person or an authorized
representative without requiring an account. Require a physical/electronic
signature, sufficient information to identify and locate the content, contact
information, and a good-faith statement that publication was without consent,
including relevant supporting context.

Review reports promptly using proportionate checks and request only necessary
clarification. Government-issued identification will not routinely be required.
Act on valid requests as soon as possible and no later than 48 hours after receipt;
internal review or additional-information requests do not extend that deadline.
Credible safety concerns may warrant immediate restriction while an incomplete
report is clarified. This replaces the draft's claim that the statutory clock
runs regardless, without making a full investigation a prerequisite to removal.

TAKE IT DOWN Act section 3(a)(1)(B) specifies the notice elements above without
prescribing government-ID submission. Section 3(a)(3) also requires reasonable
efforts to identify and remove known identical copies within the same deadline.
Source checked September 21, 2026:
https://www.congress.gov/119/plaws/publ12/PLAW-119publ12.pdf, section 3, p. 6.
Current FTC guidance also supports accessible reporting for people without an
account: https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act.
Implementation and the remaining NCII questionnaire review are pending. No
operating intake, alerts, case records, removal or duplicate-search controls are
established by the Q88 decision.

Question 89 approved September 21, 2026 (**P04 / LEG-MT-028**, urgent removal):
log urgent reports with their receipt time, immediately escalate to the founder
or designated backup, and promptly check the required reporting information.
On receipt of a valid request, remove the reported content as soon as possible
and no later than 48 hours after receipt, including weekends and holidays.
Within that same period, make reasonable efforts to identify and remove known
identical copies. Do not wait for creator permission, a completed investigation
or an appeal. Further investigation and any applicable review/appeal proceed
separately without delaying initial removal. Intake, backup coverage, alerts,
deadline tracking and removal controls remain incomplete; this approves the
procedure, not an operating service.

Question 90 approved September 21, 2026 (**P04 / LEG-MT-028**, duplicate detection):
at launch, combine platform-wide file-fingerprint matching, internal media
references and targeted manual review to locate copies across accounts. Filename
and metadata searches may assist but will not be the sole detection method.
Following a valid request, make reasonable efforts to identify and remove known
identical copies within the same 48-hour deadline. Review suspected cropped,
edited or otherwise altered versions and remove them when they violate the NCII
policy. Use fingerprints of content removed for NCII to screen reuploads.

Assess and test detection coverage, including the need for technology that
recognizes altered copies, before launch. Do not promise automatic detection of
every modified version. The statutory reasonable-efforts duty for known identical
copies is distinct from the broader policy against NCII variants. Readiness is
not determined solely by volume. This replaces Q90's filename/metadata-based
proposal and requires revising Q91's blanket deferral of all hashing.

The existing local safe-media flow computes SHA-256 over stored sanitized media
and saves it on MediaAsset (`apps/api/src/content/storage.ts`,
`apps/api/src/content/service.ts`, `packages/database/prisma/schema.prisma`). This
is an integrity primitive, not an implemented NCII matching, takedown or reupload
blocking system, and does not establish detection of altered/re-encoded copies.
The Q90 decision establishes a launch requirement; matching, moderation integration
and reupload screening remain unimplemented and untested. No matching vendor is
selected and no service is activated. The active work remains questionnaire review.
Sources rechecked September 21:
https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act
(duplicate-removal duty and consideration of hashing for reappearance), and
https://stopncii.org/faq/ (hashing limitations for cropped, filtered or clipped
versions; no Pumdoki participation or integration claimed).

Question 91 approved September 21, 2026 (**P04 / LEG-MT-028**, hashing/automated
matching): basic file-fingerprint matching is planned for launch to identify exact
duplicate files and screen reuploads of content removed for NCII, supported by
human review. Assess the need for additional technology that recognizes visually
similar or altered copies before launch and implement it where necessary for
effective coverage. Matching and moderation controls require implementation and
testing; existing file fingerprints alone are not an operational NCII detection
system. This aligns with Q90 and replaces the original no-hashing-at-launch answer.

Question 92 reviewed September 21 and retained as a summary of intended evidence
preservation: segregated retention of necessary reported content, associated
records and reports, separate from ordinary user-facing removal; disclosure to
law enforcement only on an applicable lawful basis under Q64. Read this with Q46's
retention limits and Q64's mandatory preservation/reporting requirements, not as
unlimited retention or permission for blanket disclosure. The segregated store,
restricted access, case records and disclosure procedure remain unimplemented.

Question 93 approved September 21, 2026 (**P04 / LEG-MT-028**, NCII evidence
retention): retain necessary evidence for documented investigation, appeal, safety,
legal-claim and statutory preservation needs. Set separate retention periods or
deletion triggers for case records, intimate media and reupload-prevention
fingerprints, finalized before launch. Review retention regularly; extensions
require a documented lawful justification. Securely delete unnecessary personal
data and intimate media, with records anonymized where appropriate.

Retain material covered by the CyberTipline preservation requirement for one year
after submission, with longer preservation where legally required. Applicable
legal holds override ordinary deletion schedules. This follows Q46/Q64, replaces
the blanket five-year proposal and does not make the CyberTipline clock a universal
NCII retention period. Final category-specific periods and operational retention,
review, deletion and legal-hold controls remain undefined or unimplemented.
Sources rechecked September 21: 18 U.S.C. §2258A(h),
https://www.law.cornell.edu/uscode/text/18/2258A, and ICO storage-limitation guidance
where UK GDPR applies,
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/.

Question 94 approved September 21, 2026 (**P04 / LEG-MT-028**, law-enforcement
escalation): report apparent child sexual abuse material, child sex trafficking
and online enticement of children to NCMEC's CyberTipline as soon as reasonably
possible after obtaining knowledge of facts indicating a reportable violation,
as required by law. Immediately escalate credible emergencies involving danger
of death or serious physical injury to the appropriate authorities. Refer other
suspected trafficking, coercion or serious criminal activity where required, or
otherwise legally permitted and appropriate.

Consider reporters' requests for police assistance, but share information only
on a lawful basis and within the permitted scope. Required reporting and emergency
action must not await completion of investigation or appeal, and reporting must
not delay required NCII removal. This aligns with Q64 and does not treat any
reporter's request as blanket permission to disclose private data.
Sources rechecked September 21: 18 U.S.C. §2258A(a) and §2702,
https://www.law.cornell.edu/uscode/text/18/2258A and
https://www.law.cornell.edu/uscode/text/18/2702.
The active questionnaire work remains LEG-MT-028; Q64 already records the related
LEG-MT-030 government-request policy, which is still not an operating workflow.

Question 95 reviewed September 21 and retained as the planned notification
summary: notify the uploading account of NCII removal and the appeal route,
without disclosing the reporter's identity in that notification. Q62's lawful
limits on notices/disclosure still apply; this is not an absolute anonymity
promise across legal processes. Notifications and appeals remain unimplemented.

Question 96 approved September 21, 2026 (**P04 / LEG-MT-028**, NCII appeals): the
uploading account and any person depicted may appeal relevant NCII decisions
through the Complaints and Appeals Policy without needing an active account.
Provide human review and keep removed content unavailable during review. Restore
only where review establishes that removal was mistaken and publication satisfies
applicable law, age/identity verification, consent requirements and platform rules.
An incomplete or withdrawn complaint alone does not justify restoration. If valid
consent cannot be established, keep the content removed.

Source check September 21: Mastercard Security Rules and Procedures, Merchant
Edition, **4 August 2026**, §9.4.1, printed p. 116, requires appeals by depicted
persons and consent verification. If the merchant disputes that consent is void
under applicable law, it must allow neutral-body resolution at its expense.
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
This is a card-network condition where applicable, not a universal statutory
arbitration requirement. Q96 approves independent neutral resolution at Pumdoki's
expense where applicable payment rules require it if Pumdoki disputes a depicted
person's claim that consent is legally invalid. Confirm the provider, procedure
and applicable processor requirements before launch. It is distinct from Q33's general consumer arbitration
selection; no provider purchase or activated review service is authorized here.
Fansly's current help article also permits depicted-person appeals and describes
neutral review, but its broader unresolved-complaint arbitration promise is not
automatically adopted:
https://help.fansly.com/en/articles/10544570-how-to-report-content-on-fansly.
NCII appeals do not suspend removal, reporting or evidence-preservation duties.
The NCII questionnaire section is reviewed, but final policy review, retention
periods, neutral-review arrangements and operational controls remain incomplete;
LEG-MT-028 stays In Progress.

The active founder review moves to **P04 / LEG-MT-027 — Draft Anti-Human
Trafficking Policy**. Question 97 is retained as planned public reporting through
the same form and report@pumdoki.com used for NCII, with trafficking explicitly
listed as a reportable category. This retains no-account reporting under Q86.
The alias exists, but routing/testing, form and operational intake remain pending.
The tracker already records this policy in Suzanne Lawyer's purchased USD 1,100
document bundle; commissioned drafting does not establish delivery or approval,
which remain pending. Do not restart a purchase or treat this review as a new
drafting engagement.

Question 98 approved September 21, 2026 (**P04 / LEG-MT-027**, internal escalation):
the founder is the planned primary contact, with a trained, authorized backup to
act when unavailable. Give suspected trafficking/coercion reports urgent human
review, prioritized alongside other safety reports by immediate danger, risks to
children, severity/ongoing harm and applicable deadlines. This replaces the draft's
absolute priority over all other queues and aligns backup coverage with Q16.
Emergency escalation, required reporting, removal and evidence preservation follow
the established Q64/Q89/Q94 procedures without waiting for completion of an internal
investigation. Establish and test backup coverage, appropriate access, alert routing
and escalation procedures before launch. No person is confirmed as an operating
backup and these controls remain unimplemented or unverified.

Question 99 approved September 21, 2026 (**P04 / LEG-MT-027**, indicators for
review). Retain concrete concerns about threats/blackmail, forced
participation or inability to stop; coercive third-party control of accounts,
earnings or communication; unexplained account-control/payout-beneficiary changes
or links across unrelated accounts where the information is legitimately available;
and interference in verification or credible indications of real coercion or
confinement in reported content. Use information from reports, authorized
verification and account/payout records rather than promising monitoring that
does not exist.

Flags require contextual human assessment and are not automatic trafficking
findings or permanent-ban triggers. Account assistance, shared services, nervousness
or language assistance alone do not establish trafficking; this does not separately
authorize account sharing, agencies or third-party payout arrangements. Consider
whether contact is safe and could alert a suspected controller. Do not wait for
multiple indicators before acting on credible immediate danger under Q98.
Relevant source checks September 21:
https://www.fbi.gov/investigate/violent-crime/human-trafficking/trafficking-indicators
(indicators require context, not a checklist or numerical threshold), and
https://humantraffickinghotline.org/en/safety-planning-information
(individual circumstances and safe communication matter). Verification, payout
data access, case review and response procedures remain to be implemented/tested.

Question 100 approved September 21, 2026 (**P04 / LEG-MT-027**, creator education
and guidance): retain onboarding guidance about the prohibition, coercion
indicators and reporting, explain reporting privacy and its legal/safety limits,
and identify the National Human Trafficking Hotline as a US/US-territories resource.
Include appropriate, verified support resources for other supported countries and
local emergency-service guidance rather than treating one US hotline as global.
The Hotline's current FAQ confirms its service area and confidentiality exceptions:
https://humantraffickinghotline.org/en/about-us/hotline-faqs
(checked September 21, 2026). Resource selection, educational material and reporting
controls remain pending; this decision does not establish a service partnership.

Question 101 is retained as planned manual trafficking review at launch, applied
to creator applications, reports and payout-detail changes. This is a policy
requirement, not evidence of an operating review process or access to provider
payout data. It does not defer the separate content-matching controls in Q90/Q91
or other required verification and safety controls.

Question 102 approved September 21, 2026 (**P04 / LEG-MT-027**, account restrictions
during investigation): apply immediate protective action for credible
trafficking/coercion concerns, with publishing/account restrictions and temporary
payout holds proportionate to the risk, including preventing funds reaching a
suspected controller. A report alone should not automatically suspend all account
functions and payouts. Prompt human review and regular reassessment should document
the reason and continuing need for restrictions. Held payouts are not automatically
forfeited; release when the hold is no longer justified, subject to applicable law,
processor requirements and valid transaction adjustments. Consider the affected
person's safety and whether communication could alert a suspected controller.
Required reporting, content removal and evidence preservation must not wait for
completion of the account investigation. This aligns with Q62/Q63/Q98/Q99;
https://humantraffickinghotline.org/en/safety-planning-information
(checked September 21, 2026) supports tailoring safety measures to individual
circumstances, not a particular platform payout rule. Final payout terms, processor
requirements, restriction/review procedures and implementation remain pending.

Question 103 is retained: credible indications of coercion, trafficking or a
person appearing without free consent require immediate content removal. Apply
the existing Q89/Q94/Q98/Q102 reporting, preservation and protective-action
requirements without waiting for a completed account investigation. This records
the planned policy, not an implemented removal or response process.

Question 104 approved September 21, 2026 (**P04 / LEG-MT-027**, permanent account
termination): permanently terminate accounts of users found through human
review to be responsible for trafficking, coercion or knowingly facilitating
exploitation, including coercive control of another creator's account or earnings.
Remove the responsible user's access to affected accounts. Replace the vague
"against the creator's interest" test with coercive control and responsibility;
account assistance or shared services alone are not findings under Q99.

Do not permanently ban a creator solely because they were exploited or their
account was controlled by someone else. Affected accounts may remain restricted
until identity, independent control and voluntary participation are verified and
restoration is safe, lawful and consistent with platform requirements. Recovery
is not guaranteed and does not restore prohibited content. Apply the existing
Q62/Q63 decision-notice and appeal framework, subject to lawful disclosure limits.
This does not delay immediate removal, protective restrictions, required reporting
or evidence preservation. Final policy, case review, account recovery, appeals and
operational controls remain pending.

Question 105 approved September 21, 2026 (**P04 / LEG-MT-027**, law-enforcement
referral procedure): reuse the Q64/Q94 framework rather than the draft's vague
"NCMEC where a minor may be involved." Report apparent child sexual abuse material,
child sex trafficking and online enticement of children to NCMEC's CyberTipline as
soon as reasonably possible after obtaining knowledge of facts indicating a
reportable violation, as required by law. Immediately escalate credible emergencies
involving danger of death or serious physical injury to appropriate emergency
services or law enforcement. Refer other suspected trafficking/coercion where
required, or otherwise legally permitted and appropriate. Preserve relevant evidence
securely and disclose it only on a lawful basis and within the permitted scope.
Required reporting and emergency action must not await investigation or appeal, or
delay required content removal. The standard does not require a completed internal
investigation or conclusive proof before mandatory reporting.

Sources rechecked September 21, 2026: 18 U.S.C. §2258A and §2702,
https://www.law.cornell.edu/uscode/text/18/2258A and
https://www.law.cornell.edu/uscode/text/18/2702.
NCMEC setup, reporting contacts, secure evidence handling and operational procedures
remain pending; the related LEG-MT-030 government-request policy remains separate,
unfinished work. This decision does not authorize a real report or
disclosure of user data.

Question 106 is retained as the planned evidence-preservation summary: use the
same segregated preservation approach as NCII, separate from ordinary removal,
and share evidence on a lawful basis under Q64/Q94/Q105. Q46/Q93 retention limits,
documented preservation purposes and mandatory legal holds continue to apply;
this is not unlimited retention or a requirement to await a request before making
a mandatory report. Restricted storage, retention controls and disclosure
procedures remain unimplemented or unverified.

Question 107 approved September 22, 2026 (**P04 / LEG-MT-027**, specialist
anti-trafficking organization/reporting service): no specialist organization
or outsourced reporting service has been retained; do not promise in advance that
none will be used at launch. Assess suitable training, membership or participation
opportunities before launch and confirm any processor-specific requirements,
considering suitability and cost. Continue Q100's planned verified resources for
supported countries, including the National Human Trafficking Hotline for the US
and its territories. External resources do not replace Pumdoki's internal safety,
moderation and reporting responsibilities. No service, membership, purchase,
contact or partnership is authorized or represented as established by this decision.

Mastercard's Security Rules and Procedures, 4 August 2026, section 9.4.1 item 6
(printed page 117), requires effective prohibitions on trafficking/physical abuse
and strongly recommends active membership and participation in an anti-trafficking
and/or anti-child-exploitation organization. This clause does not require a paid
specialist retainer; acquirer/processor-specific requirements remain unconfirmed.
Source checked September 21, 2026:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
The policy's commissioned drafting, substantive review and operational controls
remain pending. Q107 is the last question in this section; do not mark LEG-MT-027
complete merely because questionnaire wording is reviewed.

The active founder review now moves to **P04 / LEG-MT-032 — Draft Complaint
Policy**, the questionnaire's combined Complaints and Appeals section. Questions
108–111 are retained: complaints through the planned public form, report@pumdoki.com
and in-product reporting; no account required for the public route; categories
cover billing/payment, harassment/conduct, content, creators and platform decisions;
the founder is responsible for review. The founder remains the primary reviewer
with the trained, authorized backup coverage already agreed in Q16/Q98, not a newly
confirmed operating backup. Alias routing, public/in-product intake, alerts and
case handling remain unimplemented or untested. The purchased Suzanne Lawyer
bundle includes complaints/appeals drafting (USD 150 within the USD 1,100 bundle,
Expense Tracker row 11); delivery and substantive approval remain pending.

Question 112 approved September 22, 2026 (**P04 / LEG-MT-032**, ticketing or
case-management system): use a simple access-controlled system from launch to track
complaints and appeals from all reporting routes, with receipt time, category,
priority, responsible reviewer, applicable deadline, status, actions, decisions and
communications. Surface urgent safety cases promptly to the founder or authorized
backup under the existing response/removal deadlines. Store only necessary case
information; sensitive evidence belongs in separate restricted storage with
controlled references where appropriate, subject to the existing retention rules.
Select, configure and test a suitable tool before launch, including its support
for this business and data handling. No vendor is selected, no purchase is
authorized and no bespoke helpdesk build is implied by this decision.

Mastercard section 9.4.1's content-complaint resolution and monthly reporting
requirements support the need for reliable case records; they do not prescribe
a particular ticketing product. Source checked September 22, 2026:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
LEG-MT-032 is In Progress for questionnaire/policy review; final policy and
operating controls remain pending. LEG-MT-031 is the related appeals-policy task,
not a parallel founder assignment. LEG-MT-027 retains In Progress status for its
commissioned draft, final review and outstanding controls.

Question 113 is retained as the intended two-business-day acknowledgment target
for routine complaints. Q16's planned automated receipt confirmations and
two-business-day human-response target remain in place; acknowledgment is not
resolution and urgent safety handling must not wait for the routine queue.
Receipt automation, monitored alerts and operational coverage remain pending.

Question 114 approved September 22, 2026 (**P04 / LEG-MT-032**, resolution
deadlines): aim to resolve routine complaints within seven
business days of receipt, while treating applicable card-network content-complaint
review/resolution deadlines as requirements. Content complaints covered by those
rules must be reviewed and resolved within seven business days, with illegal
content removed immediately when identified. Valid NCII removal requests require
removal as soon as possible and no later than 48 hours after receipt, including
weekends/holidays, with reasonable efforts to identify and remove known identical
copies within that period. This is a removal deadline, not permission to postpone
removal until an investigation or appeal finishes.

Immediately escalate urgent child-exploitation, trafficking/coercion and credible
danger reports under Q64/Q89/Q94/Q98/Q105; required protective action and reporting
do not wait for routine complaint resolution. Any shorter applicable legal or
processor deadline controls. If a routine matter requires longer investigation or
external processor action, explain the delay and give progress updates without
extending mandatory deadlines. This does not make an outside bank/processor's final
financial decision something Pumdoki can guarantee within seven business days.
Sources checked September 22, 2026: Mastercard Security Rules and Procedures,
section 9.4.1, and FTC TAKE IT DOWN business guidance:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act
Policy review, ticketing, alerts, staffing/backup coverage, removal and reporting
controls remain pending. No new operating capability is established by this wording.

The active founder review now moves to **P04 / LEG-MT-031 — Draft Appeals Policy**.
The complaint-intake and deadline questionnaire decisions are recorded under
LEG-MT-032; its commissioned draft, substantive review and operating controls
remain pending, so it stays In Progress. Appeals drafting is also included in
Suzanne Lawyer's purchased complaints/appeals package within the USD 1,100 bundle
(Expense Tracker row 11). Delivery and substantive approval remain pending;
starting questionnaire review does not authorize another purchase.

Question 115 approved September 22, 2026 (**P04 / LEG-MT-031**, types of decisions
that may be appealed): retain appeals of Pumdoki's content removals,
account suspensions/terminations, payout holds and creator-application rejections;
explicitly include content/account restrictions, monetization restrictions and
Pumdoki's decisions on reports of illegal or prohibited content, including a
decision not to remove reported content. Reporters and persons depicted may
challenge the response to their report and relevant consent findings. Preserve
Q96's no-active-account route for uploaders and depicted persons; an appeal does
not require an active account. These are appeals of Pumdoki's own decisions,
not a promise to overturn a bank, processor or court decision.

Copyright notices/counter-notices continue through the separate DMCA procedure;
the general appeal route does not replace its requirements. Appeals do not
automatically restore content, lift restrictions or suspend required removal,
reporting or evidence preservation. Q96's applicable neutral-review arrangement
remains in scope; no provider or operating review process is established here.
Mastercard section 9.4.1's depicted-person removal/consent appeal requirement was
rechecked September 22, 2026:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
The broader appeal categories are approved platform policy. Final drafting,
applicable jurisdiction/provider requirements, human review, notices and appeal
controls remain pending. LEG-MT-031 is In Progress for questionnaire/policy review.

Question 116 approved September 22, 2026 (**P04 / LEG-MT-031**, submission
deadline): use six calendar months from notification of Pumdoki's decision
as a consistent internal-appeal window, replacing the draft's 30 days. Apply any
longer period required by law. Consider late appeals where material new information
or a reasonable explanation for delay is provided. Safety reports and valid NCII
removal requests remain available at any time; copyright procedures, separate
payment-dispute deadlines and other legal rights retain their own rules. The
internal appeal window does not extend those separate deadlines or delay urgent
protective action, reporting or preservation.

Source checked September 22, 2026: Regulation (EU) 2022/2065 (DSA), Articles 19–20,
https://www.boe.es/buscar/doc.php?id=DOUE-L-2022-81573
(official Spanish publication). Article 20 provides at least six months from
notification for covered internal complaints. Article 19 excludes qualifying micro
and small enterprises from this section, subject to its stated exceptions; do not
claim the six-month requirement necessarily applies to Pumdoki at launch or that
an exemption has been confirmed. The approved uniform window is a product-policy
choice informed by that framework.

Final applicability review, notice delivery, deadline tracking and appeal operations
remain pending. Case-record retention must support the chosen appeal period while
following Q46/Q93 category-specific necessity and preservation rules; this decision
does not create blanket six-month retention of intimate media or change the
separate consumer-dispute/arbitration process.

Question 117 approved September 22, 2026 (**P04 / LEG-MT-031**, appeal resolution
timing): prompt human review with a target of a reasoned
decision within 14 business days of receipt for routine appeals. Correct clear
errors without undue delay; prioritize urgent safety matters and ongoing harm.
For a complex case needing longer, notify the appellant before the target expires,
explain the reason, give a revised expected decision date and provide progress
updates. This is an operating target, not a universal legal deadline or permission
to leave an unjustified restriction or payout hold in place for 14 business days.

Shorter applicable legal, card-network or processor deadlines still apply. Appeals
do not pause required removal, reporting or evidence preservation; Q96's applicable
neutral-review arrangements remain separate, and no outside body's resolution time
is promised by the internal target. Intake, human coverage, case timing, notices
and review controls still require implementation/testing before launch.

Sources checked September 22, 2026: DSA Article 20(4)–(6) requires timely, diligent
review and reversal of unfounded decisions without undue delay where applicable;
Article 19 applicability/exclusions remain as noted in Q116. Mastercard section
9.4.1 retains the separate content-complaint and immediate-removal requirements.
https://www.boe.es/buscar/doc.php?id=DOUE-L-2022-81573
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
Neither source establishes the approved 14-business-day routine target as a
universal statutory period. Final policy/provider review remains pending.

Question 118 approved September 22, 2026 (**P04 / LEG-MT-031**, reviewer
separation): at launch, the founder may conduct an appeal
review even where the founder made the original decision. Require a documented
fresh human assessment of relevant evidence, the appellant's arguments and the
applicable written policy, followed by a reasoned written outcome. Assess the
appeal impartially rather than treating the earlier outcome as conclusive.

Where a suitably trained, authorized second reviewer is available, assign appeals
to someone uninvolved in the original decision wherever practicable. A second
internal reviewer is not the same as an independent external neutral body.
Preserve independent/neutral review required by applicable law or payment rules,
including Q96's neutral-body process at Pumdoki's expense where Pumdoki disputes
a depicted person's claim that consent is legally invalid. A one-operator launch
does not waive those obligations. This does not guarantee that every routine
appeal is reviewed externally or authorize a purchase or appointment.

Sources checked September 22, 2026: DSA Article 20(4)–(6) requires diligent,
non-arbitrary handling under appropriately qualified human supervision where
applicable; it does not expressly require a different internal employee for every
appeal. Article 19 applicability remains unconfirmed as noted in Q116. Mastercard
section 9.4.1 provides the separate neutral consent-dispute route described in Q96.
https://www.boe.es/buscar/doc.php?id=DOUE-L-2022-81573
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
Training, qualified second-reviewer availability/access, case-review procedures,
notices and required external arrangements remain unconfirmed or unimplemented.
The Q16/Q98 backup direction does not establish a trained operating appeals team.

Question 119 approved September 22, 2026 (**P04 / LEG-MT-031**, appeal
outcomes): uphold, reverse or modify the original decision,
including restoring eligible content/account access, reducing or lifting a
restriction, reconsidering a creator application, or reducing/releasing an
unjustified payout hold. Record the outcome and corrective action and communicate
the reasoned decision. This expands the examples to cover Q115's appeal scope;
it does not add an automatic approval or blanket reinstatement mechanism.

Restoration remains subject to applicable law, platform rules and required
age/identity/consent checks under Q96/Q104. Required consent must be established
before content is restored; a withdrawn or incomplete complaint alone is not
enough. A reversal resolves the challenged grounds, not separate valid grounds
for removal, restriction or a payout hold. Financial corrections remain subject
to lawful holds and applicable processor requirements under Q102, with no promise
to overturn a bank or court decision. Q115's separate DMCA procedure and immediate
removal/reporting/preservation duties remain in place.

Mastercard section 9.4.1 consent/removal requirements rechecked September 22, 2026:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
Appeal outcomes, restoration and payout controls are planned requirements; final
policy review, financial terms, implementation and testing remain pending.

Question 120 reviewed September 22, 2026 and retained: communicate the final
decision by email, stating the outcome, reasons and whether further review is
available. Apply Q117's prompt reasoned notification and Q62's lawful disclosure
limits; available external remedies must not be described as extinguished by an
internal decision. Email delivery and case-notice controls remain unimplemented.

Question 121 approved September 22, 2026 (**P04 / LEG-MT-031**, second-level
or final review): one internal appeal per decision at launch, with no routine
second internal appeal stage. The outcome is normally final within that process,
but cases may be reopened for material new evidence or a significant error.
This is not a promise of repeated internal appeals or a newly staffed review tier.

Preserve available legal remedies and external review required by applicable law
or payment rules, including Q96's neutral-body review at Pumdoki's expense where
it disputes that consent is legally invalid. Final notices explain applicable
further review options. A second internal stage may be introduced as staffing
increases; an extra employee does not substitute for a required external body.
This does not select a provider or change Q33/Q34's separate consumer-dispute
framework, and no internal appeal pauses mandatory safety action.

Sources rechecked September 22, 2026: Mastercard section 9.4.1 requires neutral
resolution at the merchant's expense for the specified consent dispute; DSA
Articles 20(5) and 21 preserve information about and access to applicable external
redress, with Article 19 exclusions still requiring an applicability assessment.
No DSA exemption or obligation under those sections is confirmed for Pumdoki.
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
https://www.boe.es/buscar/doc.php?id=DOUE-L-2022-81573
Final policy review, applicable external arrangements and appeal controls remain
pending; this decision does not authorize a purchase or appointment.

Question 122 approved September 22, 2026 (**P04 / LEG-MT-031**, creator payment
holds and payout disputes): use the same documented human appeals route,
with written reasons and progress updates, including review or expected release
timing where available, subject to Q62's lawful disclosure limits. Apply Q117's
routine appeal target without promising that an outside processor or bank will
resolve a dispute or release funds within that period.

Holds must be proportionate, regularly reassessed and limited to affected funds
unless a broader restriction is justified. No automatic forfeiture merely because
an appeal is pending or an account is restricted. Valid refunds, chargebacks and
other lawful adjustments may still affect earnings under the Creator Agreement
and applicable payment rules. Record the basis, affected transactions, amounts,
decisions and adjustments; do not treat a temporary hold as platform revenue.

Release funds when the hold is no longer justified, subject to remaining lawful
or processor restrictions. Undisputed eligible earnings follow the normal payout
schedule unless separately restricted on justified grounds. Preserve Q102's safe
contact and anti-coercion safeguards and Q119's separate valid grounds for holds.
This does not promise immediate bank settlement, an escrow/trust arrangement,
blanket forfeiture or that every chargeback cost is passed to a creator. Final
allocation of losses, reserve percentages/durations and payout schedules remain
for the Creator Agreement, provider terms and substantive review.

CCBill's Merchant Accounting FAQs and public merchant terms checked September 22,
2026 distinguish refunds/chargebacks/void deductions from holds that delay payout.
Those documents govern the processor/merchant relationship; they do not establish
Pumdoki's eventual creator terms or confirm approval, pricing or account-specific
reserves. No public generic hold period is adopted as a creator-policy default.
https://ccbill.com/doc/merchant-accounting-faqs
https://ccbill.com/cs/client/policies/ccbill/terms_and_conditions_cc.html
Final legal/provider review, the financial ledger, appeals, reconciliation,
payout controls and their tests remain pending. The appeals questionnaire section
is reviewed; LEG-MT-031 remains In Progress for commissioned drafting, substantive
review, external arrangements and implementation/testing, not complete.

The current legal drafting task is **P04 / LEG-MT-021 — Draft Creator Agreement /
Payout Terms**. On September 23 the founder reports completing the final questionnaire
corrections and is awaiting Suzanne's response. Q150 and the Additional materials
wording are accepted; Q148–149 are retained and Q136 awaits provider confirmation.
Drafting is included
in the already purchased Suzanne Lawyer bundle (Expense Tracker row 11);
delivery and substantive approval remain pending. No new purchase is authorized.

Question 123 approved September 22, 2026 (creator onboarding): start with a member account and
verified email; require a separate creator application, government-ID age and
identity verification through an approved third-party provider, Creator Agreement
acceptance and manual approval before creator publishing/monetization. Content
publication additionally requires the applicable performer identity/age, consent
and recordkeeping checks, including §2257 where applicable, through the designated
approved records process. Preserve Q54/Q55's required consent stages and separate
consent releases from statutory performer records; ordinary identity verification
does not itself establish consent or fulfill all §2257 obligations.

Keep Q22's separate payout stage: required tax documentation and payout setup must
be complete before withdrawals, or earlier when applicable law or the payment/
payout provider requires. Do not universally make all tax documentation a condition
of initial creator approval, or assume it can always wait for a withdrawal request.
Confirm forms, collection timing and responsible parties against the actual
payment arrangement before monetization is enabled. No provider, custodian,
tax treatment, live verification or automated promotion is confirmed here.

Sources checked September 22, 2026: Mastercard section 9.4.1 requires verified
uploaders and performer identity/age and written consent controls. Fansly's current
onboarding guide separates creator approval from tax/payout readiness; it is a
product comparison, not authority for Pumdoki's tax obligations. IRS W-8BEN
instructions call for the applicable form before payment is made, credited or
allocated; this may precede withdrawal depending on the actual arrangement.
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
https://www.irs.gov/instructions/iw8ben
The existing application remains pending-only; identity verification, creator
approval operations, records services, tax/payout collection and live-money
controls are unimplemented or unconfirmed. The separate local test-content flow
does not establish launch readiness.

Question 124 approved September 22, 2026 (**P04 / LEG-MT-021**, eligible account
owners): creator accounts owned and controlled by verified
adult individuals, with an identified owner responsible for the account and its
compliance. Defer company-, agency- and studio-owned accounts until ownership,
representative authority, tax/payout requirements and suitable access controls are
supported and approved. This is a pilot-capacity recommendation, not a legal ban
on business creators or evidence that a company or legitimate assistance implies
trafficking. Preserve Q99's contextual assessment and Q56's permitted virtual-persona
rules for verified adult operators.

Approved collaborations remain possible if each participant satisfies the relevant
age, identity, consent and recordkeeping requirements. This does not authorize
shared passwords, delegated account access or unverified participants. Owning a
business does not itself disqualify an individual applicant, but an individual
account cannot be used to bypass corporate ownership/payee verification. Corporate
payout arrangements are not approved by this decision and need a separately
supported process; tax forms must follow the actual person/entity and arrangement.

Fansly's agency/producer guide and Management Sessions documentation checked
September 22, 2026 show a supported alternative using the primary owner's verified
legal information, co-performer checks and controlled delegated access. They do
not establish Pumdoki's provider eligibility or authorize a new management feature.
https://help.fansly.com/en/articles/12315622-applying-as-an-agency-producer-or-other
https://help.fansly.com/en/articles/12328641-management-sessions
Final eligibility/payout terms, provider review and implementation remain pending.

Question 125 approved September 22, 2026 (**P04 / LEG-MT-021**, creator
countries): align with the already
approved Q9/Q49 international direction rather than repeating the questionnaire's
unconfirmed US/Spain/Latin America/Eastern Europe list. Aim for broad international
creator eligibility, enabling countries where applicable legal and sanctions,
age/identity verification, performer consent/recordkeeping, privacy, tax, payment/
payout and operational requirements can be met. Do not approve a country solely
because a verification vendor accepts its identity documents or a payment service
accepts member purchases there.

Finalize the initial supported creator-country list before creator onboarding
opens, and expand as provider coverage and operating capacity are verified. Assess
creator onboarding/payout eligibility separately from member access under Q49;
the member pilot's limits do not themselves define the creator-country list.
Actively restrict unsupported onboarding or transactions as already agreed.
The exact list, providers and controls remain unconfirmed; LEG-MT-153 stays
unfinished and is the related allowlist task, not a new simultaneous founder step.

Sources checked September 22, 2026: Fansly's onboarding guide describes broad
residency eligibility subject to restrictions and region-dependent payout methods.
OFAC distinguishes comprehensive from selective sanctions; a sanctions program
named for a country is not itself evidence that all of its residents are banned.
No copied competitor restriction list or new blanket nationality exclusion is
adopted. These references do not establish Pumdoki's supported countries.
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
https://ofac.treasury.gov/sanctions-programs-and-country-information
Q125's wording is approved; no country or live onboarding is approved by this
review. Final country/provider readiness and related LEG-MT-153 work remain open.

Question 126 approved September 22, 2026 (**P04 / LEG-MT-021**, minimum creator
age): creators must be at least 18, legally adults in their country of
residence, and meet any higher minimum age required by applicable law. Age and
identity must be verified using valid government-issued photo identification
through the approved verification process before creator approval. Self-attestation
does not substitute for these checks. This preserves Q123's third-party verification
and manual approval stages and aligns the minimum with Q20's higher-applicable-age
qualification. It does not equate a date-of-birth checkbox, explicit-content opt-in
or email verification with completed age/identity verification.

Fansly's current onboarding guide rechecked September 22, 2026 requires both
18 years of age and legal adulthood in the country of residence, with government
photo-ID verification. This supports the comparison, not a country-by-country legal
determination or confirmation of Pumdoki's provider coverage.
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
Country-specific age eligibility, verification-provider selection, configuration
and testing remain pending under the existing Q20/Q49/Q123/Q125 requirements.
This decision does not enable live identity collection or creator approval.

Questions 127–128 reviewed September 22, 2026 and retained. Q127's non-exclusive,
worldwide, royalty-free license is limited to operating the platform; creators
retain ownership. Royalty-free does not remove agreed creator earnings. The final
draft must give effect to Q26/Q46/Q47's continued lawful access to purchased
versions, required preservation and removal exceptions, including limited necessary
survival after ordinary deletion/closure. It does not authorize unrelated resale,
advertising, indefinite public access or a new use of creator media. Review the
separate post-termination answer when reached; no new license scope is approved here.
Q128's separate optional promotional permission is already consistent with Q55,
including applicable permissions from depicted people for agreed uses/channels.
Neither an operating license nor a purchase grants general promotional or download
rights. Final commissioned legal drafting and product controls remain pending.

Question 129 approved September 22, 2026 (**P04 / LEG-MT-021**, co-performer
verification and consent): every real person depicted or performing in the
content, including faceless and voice-only co-performers, must undergo the approved
government-photo-ID age/identity verification process. Confirm at least 18 at the
time of production and compliance with other applicable age requirements. Do not
limit checks to people recognizable to viewers or treat a tag/verified account as
consent to the particular content.

Preserve Q54/Q55: document consent to participation and recording before production,
and permission for upload/distribution before upload. A signed, dated release must
identify the verified person and covered content. Complete required verification
and consent review before publication. Any optional promotion or future permitted
downloads require their separately applicable permissions; downloads remain undecided.

Store consent documentation securely under the approved access/retention process.
Where §2257 applies, a qualified custodian holds the statutory records separately
from consent releases and other records. One provider may serve both roles only
if its contract covers both and the required separation is maintained. Custodian
outsourcing does not remove an applicable producer's obligations. Providers,
forms, custodial arrangements and publication controls remain unconfirmed or
unimplemented; no real identity collection is authorized.

Sources checked September 22, 2026: Mastercard section 9.4.1 covers verification
and written consent of depicted adults; 28 CFR 75.2(e), (f) and (h) covers statutory
record segregation, digital records and contracted custodians. The broader
voice-only/faceless participation rule follows the already approved Q54 platform
policy and does not assert that every audio-only work falls under §2257.
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.2
This replaces the original 'every identifiable person' wording and undifferentiated
custodian-storage description with the approved Q54/Q55 requirements.

Question 130 approved September 22, 2026 (§2257 record submission and custodian
procedure): where §2257 applies, submit required
performer records, including required identity-document copies and content-linked
records, through a secure process to a qualified third-party custodian under
written custody, access and retention arrangements. Do not publish covered content
until required records have been completed and confirmed under Q123/Q129.

Follow Q38's data minimization: the custodian retains required identity-document
copies; Pumdoki's ordinary application retains necessary verification evidence and
record references plus any additional information required by applicable law or
confirmed processor requirements. Avoid an absolute claim that Pumdoki never
holds or can access identity records. Confirm actual data returns, authorized
access, responsibilities and privacy disclosures before implementation. Keep
statutory records segregated from consent releases and other records under Q55/Q129.

The published compliance statement must accurately identify the appointed external
custodian and business address as required by 28 CFR 75.6(f), with the required
record location and lawful availability addressed in the custodial arrangement.
Do not publish an invented custodian, assume a registered-agent address is a
records location, or imply that an ordinary age-verification vendor automatically
provides §2257 custody. Preserve Q46's statutory retention clocks and lawful holds.
Contracting custody does not relieve an applicable producer of its duties; this
does not determine Kiban's producer status. Provider selection, the contract and
the secure submission/access/publication workflow must be finalized and tested
before live use. The custodian and these arrangements remain unconfirmed.

Sources: 28 CFR 75.2(e), (f) and (h), verified earlier September 22 under Q129,
addresses segregation, digital identification copies and contracted custody.
Sections 75.4 and 75.6 rechecked September 22 address record location/retention
and the accurate compliance statement, including external-custodian details.
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.2
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.4
https://www.ecfr.gov/current/title-28/chapter-I/part-75/section-75.6
Q130 is approved as the intended policy, not a confirmed provider arrangement or
implemented workflow. Related P04 / LEG-MT-016 recordkeeping work stays In Progress;
this review does not activate it or authorize collecting real IDs.

Question 131 approved September 22, 2026 (standard platform commission): retain
the proposed standard 20% platform / 80% creator split on the sale amount
excluding applicable sales tax/VAT, with ordinary payment-processing costs paid
from Pumdoki's 20% share. A $100 sale excluding tax would allocate $80 to the
creator and $20 to the platform before its payment and operating costs. This is
a gross-of-processing target, not 80% of net processor proceeds or a profit claim.
Validate the rate against actual provider pricing and the full cost model before
publishing a firm offer or activating payments; no provider quote currently
establishes that this target is sustainable.

Section 3.8's cost-validation requirement remains in force. Its alternatives are
modeling options, not adopted fees; do not silently subtract ordinary processing
costs from the proposed creator share. Chargeback allocation is now approved in
Q139 below, refund allocation in Q140 and permitted payout-fee categories in Q141.
Actual provider fees, final Founders cohort eligibility and paid-session commission
(Q31) remain separate pending decisions.
No founding rate, permanent discount, provider purchase or live payment approval
is implied. The approved questionnaire answer retains its proposed-rate and
cost-validation qualifications; this is not permission to announce final pricing.

Sources checked September 22, 2026: the official creator onboarding guide states
an 80% revenue share and no hidden processing, payout or conversion fees; this is
a comparison benchmark, not evidence of Pumdoki's costs. CCBill's pricing page
explains that the model and charges vary by business and payment arrangements;
it is not a Pumdoki quote.
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
https://ccbill.com/pricing

Question 132 approved September 22, 2026 (Founders program direction): use the
public name and tag **Founders**, not "Founding Creator". Replace the earlier
commission-free/cost-recovery/no-profit offer with the standard commission model
from Q131 plus recognition, discovery and community/event benefits. The target
rate still requires actual cost validation before a firm offer or live payments.

Approved benefits direction:

- A Founders tag in the web app.
- Discoverability at launch and later through a Connect filter; a dedicated
  Founders section below the top sections in Explore is an approved placement
  option. Exact placement/design remains to be defined, not both surfaces as an
  automatic implementation requirement.
- SFW-only Discord community events. Cash-prize events remain optional and must
  have a separately approved budget, rules, eligibility and payment arrangements.
- Early invitations and priority consideration for suitable future events,
  subject to eligibility and available capacity.

Preserve member filters, access restrictions and ordinary verification/moderation.
Promotional use of creator media retains Q55/Q128 permission requirements. These
benefits do not guarantee impressions, audience, sales or permanent top ranking.
No fixed cohort size, member discount, Plus benefit, recurring cash entitlement,
event spending or new UI implementation is authorized by this documentation task.
Update existing program/commission/admin tracker entries rather than keeping
mandatory special founder fees or unapproved permanent 500-person promises.
Related P06 / LEG-MT-043 implementation remains Not Started; the sole active
founder workflow stays P04 / LEG-MT-021.

Question 133 approved September 22, 2026 (Founders benefit duration): the Founders
tag remains for the lifetime of an eligible account, subject to platform rules.
Discovery placements and priority consideration for future events follow the
published program terms and availability. No guaranteed permanent top placement,
recurring event schedule or cash prizes. Each prize event requires its own rules
and approved budget. Eligibility and the enrollment cutoff or cohort limit remain
to be finalized before recruitment; do not adopt the old 500-person cap.

This replaces the obsolete permanent-commission-benefit answer. Q132's standard
commission treatment remains unchanged. Use the spelling "program" in new answer
text. Program implementation and event spending remain unapproved; the founder
edits the DOCX manually.

Question 134 approved September 22, 2026 (payout frequency): plan to initiate
eligible creator payouts twice monthly, on the 1st and 16th or
the next business day, subject to confirmation with the payment/payout providers.
Only available earnings that have cleared applicable holds and meet the confirmed
minimum and required verification, tax and payout-documentation conditions qualify.
The final schedule, cutoff times and supported payout arrangements must be
confirmed before launch. These dates are proposed initiation dates, not guaranteed
bank receipt dates; delivery depends on the payout method and receiving institution.

Do not equate merchant settlement to Pumdoki with disbursements to creators or
promise advances against unsettled funds. Retain Q122's proportionate treatment
of restricted funds and ordinary payment of undisputed eligible earnings. The
provider-specific minimums (Q135), methods (Q136), hold/reserve periods (Q137),
and financial allocation remain pending. This approved direction does not select a payout provider, require manual
bank transfers, authorize payments or set a seven-/fourteen-day hold.

Sources checked September 22, 2026: CCBill describes a merchant billing/payment
schedule with method, threshold and holiday exceptions, not an approved Pumdoki
creator-payment arrangement. The creator onboarding benchmark distinguishes
pending from available earnings and method-dependent payout timing/minimums.
https://ccbill.com/doc/merchant-accounting-faqs
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
Q134 is approved as the planned schedule, subject to provider confirmation and
implementation. The actual payout arrangement remains unconfirmed.

Question 135 approved September 22, 2026 (minimum payout threshold): use USD 50
as the proposed standard minimum available creator balance for a
scheduled payout. Pending or held earnings do not count toward the threshold.
This is a creator-earnings threshold, not the gross member purchase amount or a
member wallet balance. Any different payout-method minimum must be confirmed
with the provider and clearly disclosed before the creator selects that method.
Do not promise a universal USD 50 minimum for all countries and payment rails.

Balances below the applicable threshold carry forward to later scheduled payouts
and are not forfeited merely for being below the minimum. Q147 below now approves
continued entitlement and a final-settlement process after closure/termination;
actual provider methods and procedures remain unconfirmed. The ordinary threshold
must not silently convert unpaid creator earnings into platform revenue. Confirm provider minimums, fees and viable supported routes before launch.
This does not approve any payout method, separate fee, withdrawal mechanism or
change to Q134's planned twice-monthly schedule.

Source checked September 22, 2026: the official payout-minimum guide uses different
minimums by method (USD 20, 50 and 100), with a specific SEPA exception. This supports
method-specific disclosure, not adoption of that platform's providers or exact
limits. Pumdoki's final provider terms remain unconfirmed.
https://help.fansly.com/en/articles/10544481-payout-minimums-by-method
Q135 is approved as the proposed standard and carryforward rule. Actual provider
minimums and viable supported methods still require confirmation before launch.

Question 136 retained September 22, 2026 (payout methods): the original answer
correctly leaves supported methods pending processor and business-bank confirmation
after merchant approval. This does not approve a provider, method or country.
Validate actual creator-disbursement capability, eligible countries, onboarding,
fees, minimums and delivery times before launch; merchant acceptance/settlement
alone does not establish that any bank or processor supports all creator payouts.
No new outreach or purchase is authorized by retaining this pending answer.

Question 137 approved September 22, 2026 (payment reserves and hold periods):
replace the incorrect claim that fourteen days covers the refund/chargeback
window. Use an initial 14-calendar-day pending
period from each completed transaction as a pilot target, subject to confirmed
processor settlement and reserve requirements. This is not a final provider term,
guaranteed availability on day 14, or proof that chargeback exposure has ended.
Do not promise advances against unsettled or unavailable provider funds.

After the pending period and applicable funding conditions are satisfied,
eligible available earnings enter the next Q134 scheduled payout, subject to Q135's
minimum and required verification/tax/payout checks. Clearly distinguish the
transaction pending period, a provider-imposed reserve, any separately agreed
creator reserve, a justified individual hold, the scheduled payout date, and bank
arrival. Earnings clearing just after a payout cutoff may wait until the next
1st/16th run. Do not describe fourteen days as the full sale-to-bank timeline.

Longer or additional holds/reserves need lawful or documented risk/provider
grounds, defined scope, review and release conditions, and disclosure under the
final agreement, subject to lawful notice limits. Retain Q122's proportionality,
review/appeal route, no automatic forfeiture and ordinary payment of undisputed
eligible earnings. No blanket rolling reserve percentage, fixed additional
reserve duration is approved by Q137. Confirm the final hold, settlement, reserve
and cash-buffer arrangements before live payments. Q139 below now addresses
chargeback allocation; Q140 now supplies refund allocation. A short pending
period does not replace those controls.

Sources checked September 22, 2026: CCBill's chargeback guidance describes filing
windows extending to 120 days and exceptions. This is evidence that fourteen days
cannot cover the whole exposure period, not a universal maximum or a proposed
120-day creator hold. The payout benchmark uses a seven-day pending period before
separate request review, processing and delivery; that timing is not automatically
transferable to Pumdoki's unconfirmed provider and funding arrangements.
https://ccbill.com/doc/understanding-chargebacks
https://help.fansly.com/en/articles/10544480-payout-processing-times
Q137 is approved as the proposed pilot pending period and hold/reserve safeguards,
not a confirmed provider arrangement or live payment authorization.

Question 138 approved September 22, 2026 (circumstances allowing payout withholding):
align with Q102/Q122/Q137. A temporary hold may be applied
where reasonably necessary on documented grounds involving suspected fraud,
account takeover or coercion; a trafficking, NCII, law-enforcement or material
Creator Agreement investigation that justifies restricting payment; unresolved
disputed transactions; missing or invalid required verification, tax or payout
documentation; or applicable legal orders and confirmed processor restrictions.
Do not treat every report, open investigation or minor policy breach as an
automatic basis to withhold all earnings or presume wrongdoing.

Limit holds to affected funds unless a broader restriction is justified. Document
the reason, scope and release conditions, review regularly, and give the creator
an explanation, updates and the established human appeal route, subject to lawful
disclosure limits and Q102's safe-contact protections. Urgent safety, removal,
reporting and evidence-preservation duties continue independently of financial
review and appeals. Do not delay these duties to resolve a payout question.

Release funds when the basis ends, subject to any remaining valid legal/provider
restriction; undisputed eligible earnings follow the normal payout schedule
unless separately restricted on justified grounds. No automatic forfeiture merely
because an investigation/appeal is open or an account is restricted. Valid refunds,
chargebacks or other agreed lawful adjustments may still affect the balance,
with chargeback/refund allocation approved in Q139–140 and permitted payout-fee
categories approved in Q141; actual provider fees remain unconfirmed.
This replaces the original absolute
no-forfeiture-while-open sentence with Q122's distinction between temporary holds
and lawful financial adjustments. No new reserve rate, ban, provider appointment,
funds seizure or live payout operation is authorized.

Source rechecked September 22: CCBill's merchant FAQ identifies missing required
contract/identity documents, account holds and payment-option changes as possible
causes of delayed merchant payments. It does not confer blanket authority over
creator earnings or confirm Pumdoki-specific terms. The approved proportionality,
review, notice and appeal safeguards align with Q102/Q122.
https://ccbill.com/doc/merchant-accounting-faqs
Q138 is approved as the intended policy. Final policy/provider review and
implementation are still required; this does not activate payout holds.

Question 139 approved September 22, 2026 (chargeback allocation between Pumdoki
and creators): adopt transaction-share reversal as the launch default, with an
exception for losses caused by Pumdoki's own billing or service errors. This
records the founder's acceptance after the platform comparison and USD 100
examples, superseding the earlier pending proposal that lacked the exception.

When a chargeback is actually applied, reverse only the creator earnings
attributable to the charged-back amount and Pumdoki's corresponding commission.
For a partial chargeback, reverse the corresponding partial allocation; reconcile
tax separately as required. Pumdoki bears any applicable processor chargeback
fee and unrecovered ordinary payment-processing costs. Do not deduct the full
sale amount from the creator while retaining the platform commission, or add an
unconfirmed dispute fee to creator deductions.

Where the loss was caused by Pumdoki's own billing/service error and the creator
fulfilled their obligations, preserve the creator's legitimately earned share
and have Pumdoki bear the loss. This does not preserve duplicate or other unearned
credits recorded by mistake. Stolen-card fraud and dishonest-buyer chargebacks
alone do not trigger this exception: they follow the default allocation unless a
separate funded protection policy is approved in the future. No general guarantee
of fraud or chargeback protection is offered at launch. Do not quietly turn this
narrow exception into a promise to insure all compliant creators' transactions.

For the proposed 80/20 split and a full chargeback on a USD 100 sale excluding
sales tax/VAT, the default reverses USD 80 of creator earnings and USD 20 of
platform commission. If the creator share is successfully recovered, both parties
have zero sale revenue and Pumdoki bears unrecovered costs. Under the
platform-error exception, the creator retains legitimately earned USD 80:
USD 100 received minus USD 80 paid minus USD 100 returned equals a USD 80 platform
loss before unrecovered costs. Do not add another USD 20 to that loss. If the
creator has already withdrawn and no funds can be recovered, the default case
can also leave Pumdoki with that USD 80 loss; the accounting right to deduct is
not cash recovery or insurance.

If already-paid earnings create a negative creator balance, any offset against
future earnings must be expressly covered by the agreed lawful terms. This is
not permission to automatically debit a creator bank account/card. Processor
recovery from merchant funds is separate from recovery of creator earnings.
Retain the approved cash-buffer/risk-limit planning and validate actual reserve
and settlement requirements before live use. The provisional 14-day pending
period does not eliminate later exposure.

Give transaction-level explanations identifying the affected amount and reason,
consider relevant delivery/payment evidence, and provide the established human
review/appeal route subject to lawful disclosure limits. Prevent double deductions
for the same loss, including where a refund already reversed the creator share.
If a chargeback is reversed and funds are actually recovered, restore the
corresponding creator earnings without duplicating a share already protected.
A complaint or open dispute alone is not a final loss; interim holds follow Q138.
Preserve Q28's good-faith dispute protections and unrelated valid purchases.
No automatic account ban or shorter replacement appeal deadline is adopted.
Q140 below supplies refund allocation and Q141 permits actual disclosed payout
transfer fees without markup; the actual provider fee schedule remains unconfirmed.

Benchmarks reviewed September 22: Fansly's FAQ describes protection against most
chargebacks with exceptions. LoyalFans' main Terms protect against unauthorized
payment fraud and platform errors, but its Creator Supplement uses broader
deduction wording and preserves platform fees. These are not copied as a single
coherent protection promise. OnlyFans' historical terms supplied to Parliament in
2021 allow creator-share deductions; current live wording was not verified.
E-Pal's published guidance provides evidence-based internal order disputes and
sanctions for malicious third-party refund activity, not a verified guarantee
covering provider chargeback losses. Its internal 72-hour dispute window is not
adopted as a bank deadline or a new Pumdoki appeal limit.
https://help.fansly.com/en/articles/12328615-creator-security-faq
https://www.loyalfans.com/legal/terms-conditions
https://www.loyalfans.com/legal/creator-supplement
https://committees.parliament.uk/writtenevidence/40780/default/
https://www.epal.gg/help/faq/31
https://www.epal.gg/help/guideline/18

CCBill's accounting FAQ describes chargebacks as merchant-account deductions;
its guide says standard pricing includes chargeback fees except EU Debit. Use
"any applicable" fee and confirm actual terms. This does not confirm Pumdoki
approval or a funded creator-protection arrangement.
https://ccbill.com/doc/merchant-accounting-faqs
https://ccbill.com/doc/understanding-chargebacks
Q139 is approved as the intended policy. Legal/provider review, accounting,
operational controls and implementation/testing remain required before live use.
P06 / LEG-MT-103 remains Not Started; LEG-MT-159 cost validation remains open.
Question 140 approved September 22, 2026 (refund allocation between Pumdoki and
creators): when a refund is issued under applicable law or the refund policy,
reverse the creator share of the refunded amount and Pumdoki's corresponding
commission. Apply proportionate adjustments to partial refunds. Pumdoki absorbs
unrecovered ordinary processing costs and any applicable refund-processing fees;
no unconfirmed fee amount or creator-paid refund surcharge is adopted.

Preserve Q139's exception: if Pumdoki's billing/service error caused the refund
and the creator fulfilled their obligations, the creator retains legitimately
earned pay and Pumdoki bears the loss. Duplicate/unearned credits can still be
corrected. If affected earnings have already been paid out, a negative balance
may be offset against future earnings under the agreed lawful terms, without
automatic creator bank/card debits. Recovery remains uncertain; include refund
exposure in the cost/cash-buffer model alongside Q139.

Give transaction-level explanations of the refund amount and earnings adjustment
and access to human review/appeals. Never deduct the same loss twice, including
where a chargeback has already reversed the affected earnings. This allocation
does not give creators a veto over legally required refunds or replace existing
member refund eligibility and purchased-access decisions. It creates no promise
of live refunds, new member credit/wallet features or approved provider terms.
Final drafting/provider review, refund/ledger controls and tests remain pending.

Source checked September 22: Fansly's creator-refund guidance says voluntary
refunds are deducted from the creator balance or pending funds and processed by
its support team. It supports an earnings-adjustment workflow, not a claim that
all platforms adopt Pumdoki's commission reversal or platform-error exception.
https://help.fansly.com/en/articles/12582124-can-creators-offer-fans-a-refund
Q140 is approved as the intended policy; implementation remains incomplete.

Question 141 approved September 22, 2026 (fees that may be deducted from creator
payouts): commission is deducted once from the eligible
sale when creator earnings are calculated, not again on withdrawal. Only actual
payout-provider transfer fees associated with the selected supported method may
be passed through, with no extra platform markup. Disclose the amount or
calculation basis before method selection and any applicable fee before payout
authorization or the scheduled payout. Actual providers, methods and fees remain
unconfirmed; merchant-settlement charges are not automatically creator-payout
fees. No universal free-payout promise is adopted.

Ordinary sale-processing costs remain within Pumdoki's share under Q131.
Chargeback/refund processing costs remain Pumdoki's responsibility under
Q139–140. Valid refunds, chargeback adjustments, correction of unearned credits
and legally required tax withholding are separately authorized adjustments, not
additional service fees. Do not deduct commission twice or treat a notice as
blanket authority to introduce unspecified deductions. Any new or changed fee
needs a lawful agreed basis and advance disclosure for future application.

Itemize platform deductions. Explain that the recipient's bank/e-wallet may
separately impose transfer or currency-conversion charges; disclose known charges
and distinguish costs outside Pumdoki's control from Pumdoki deductions. Do not
invent an exchange rate, confirmed fee schedule or payout-provider appointment.
The exact withholding forms, timing and reporting remain for Q142–143 and the
actual payment arrangement; this approval does not establish tax applicability.

Sources checked September 22: LoyalFans' Terms distinguish the sale commission
from provider payout fees disclosed for each method, and from recipient bank or
e-wallet conversion/transaction charges. Fansly's getting-started guide describes
an 80% share with no hidden payout, processing or conversion fees. Those are
benchmarks, not verified Pumdoki provider economics or an adopted fee schedule.
https://www.loyalfans.com/legal/terms-conditions
https://help.fansly.com/en/articles/12315241-getting-started-on-fansly
Q141 is approved as the permitted fee structure, not a confirmed fee schedule,
provider appointment or live payout authorization. Final review, disclosure and
ledger controls remain pending.

Question 142 approved September 22, 2026 (creator tax documentation, including
W-9/W-8BEN): replace the obsolete non-U.S.-creator exclusion and universal
first-payout collection deadline. Retain Q125's conditional international eligibility and Q124's individual-owner
pilot. Determine documentation from U.S. tax status and the actual payment
arrangement, not nationality or residence alone. Generally collect W-9 for U.S.
persons and W-8BEN for foreign individual beneficial owners, with another
applicable form where required. A U.S. citizen abroad still generally uses W-9.
The W-8BEN-E distinction for foreign entities does not authorize entity-owned
creator accounts or corporate payees at launch.

Keep Q22/Q123's staged onboarding: obtain valid required documentation securely
before payout or an earlier legally/provider-required event, including before
income is paid, credited or allocated where applicable. Determine the exact
trigger before enabling monetization; do not assume all forms can wait for a
withdrawal request, or make every form an unconditional initial creator-approval
requirement. Require updates when circumstances change or certification expires.
Use restricted access and a defined retention process; do not collect tax IDs or
forms in chat, ordinary support email or the repository. A collection provider,
validation process and tax-document workflow remain unselected/unimplemented.

Confirm the income classification/source, responsible payer/withholding/reporting
parties, forms, thresholds and deadlines for the actual operating and payment
arrangement with a qualified U.S. tax professional and the relevant providers
before live monetization. Applicable reporting may include a Form 1099 variant
or Form 1042-S where required; do not promise a 1099 for every creator or assume
that a payment processor automatically handles all platform obligations. Keep
collection of creator certifications separate from filing/furnishing information
returns. A W-8BEN documents status and may support eligible treaty treatment; it
does not automatically exempt a creator from withholding or establish a universal
rate. Some foreign-person reporting can apply even when no tax is withheld.
No threshold, withholding rate, treaty eligibility or tax classification is
adopted by this approval. Q143 below now confirms creator responsibility while
preserving platform duties and fact-dependent classification.

Sources checked September 22: IRS W-8BEN instructions distinguish foreign
individuals, entities and U.S. persons; require the applicable form before payment,
crediting or allocation; and address changes in circumstances and form validity.
The W-9 page identifies certification of taxpayer information for reporting.
The 2026 Form 1042-S instructions distinguish reportable U.S.-source payments and
exceptions, including cases with no withholding. Reporting on the actual creator
payment flow remains unclassified. The live 1099-MISC/NEC instructions endpoint
returned a December 2026 revision, so no current threshold or new obligation is
adopted from that later-dated page.
https://www.irs.gov/instructions/iw8ben
https://www.irs.gov/forms-pubs/about-form-w-9
https://www.irs.gov/instructions/i1042s
Q142 is approved as the documentation and review policy. Actual income/tax
classification, provider roles, collection workflow, withholding/reporting details
and implementation remain unconfirmed; no real tax-data collection or live
monetization is authorized.

Question 143 approved September 22, 2026 (responsibility for creator taxes):
creators determine, report and pay taxes legally due on their
own earnings in relevant jurisdictions, provide accurate required tax information
and maintain appropriate records. Preserve Pumdoki's own legally required
withholding, information-reporting, collection/remittance and other tax duties.
A payment provider may perform agreed functions but is not assumed to discharge
all platform obligations. Reconcile those responsibilities through Q142's review
of the actual payment and income arrangement; this does not select a tax rate,
reporting form for every creator, sales-tax treatment or payroll arrangement.

The Creator Agreement should describe the intended independent relationship,
subject to applicable law and how the relationship actually operates. Do not
assert that every creator is legally an independent contractor in every country
merely because the agreement says so. Final classification and required
protections cannot be contracted away. This preserves the intended independent
creator model without labeling the current platform an employer or restarting
an employment/entity-selection project. Review the concrete arrangement where
necessary before live use.

Sources checked September 22: IRS worker-classification guidance expressly says
a contract label does not determine status; the facts and actual relationship
matter. That is U.S. federal tax guidance, not a universal international
employment-law ruling. Q142's IRS withholding/reporting sources establish why
creator responsibility cannot erase obligations separately imposed on Pumdoki.
https://www.irs.gov/businesses/small-businesses-self-employed/type-of-relationship
https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-defined
https://www.irs.gov/instructions/i1042s
Q143 is approved as the intended division of responsibilities, not a determination
of every creator's tax/employment status. Concrete classification/provider review
and implementation remain pending.

Question 144 reviewed September 22 and retained (custom content and paid sessions):
the same content rules apply, creators may decline requests without giving a
reason and payment must use the approved platform flow, with off-platform payment
solicitation prohibited. Apply the already approved Q72/Q73 safeguards: agree the
scope, price and delivery terms before payment; resolve canceled accepted orders
under the Refund Policy; payment never overrides consent or requires performance
against a creator's wishes. Required verification, consent, records and moderation
continue to apply. Retaining this answer does not activate paid sessions/custom
orders or decide Q31's separately pending paid-session commission. Actual supported
flows and provider approval remain prerequisites.

Question 145 approved September 22, 2026 (subcontractors, agencies and account
managers): align with Q124's verified individual-owner
pilot. Only the verified creator may access and operate the creator account at
launch. Do not permit shared credentials, shared sessions, delegated logins or
third parties managing messages, publication or payout controls. Agency/studio-
owned accounts and delegated account management remain deferred until separately
approved ownership, verification, access/permission, logging, revocation, payout
and safety controls are supported. Do not treat this as authorization to build a
management feature or promise a later launch date.

Distinguish account management from legitimate assistance without account access.
Lawful help such as photography or editing may be used subject to applicable
consent, rights, confidentiality, privacy and platform-content requirements.
The verified creator remains in control and responsible for the account and
published material. This exception grants no access to private member
communications, platform-held verification records or account credentials.
Record-service access remains governed by Q130. Approved collaborations still
require every participant's verification, consent and
recordkeeping checks. Help with production is not a workaround for unverified
performers, corporate payees or prohibited content.

Remove the unsupported assertion that third-party management is the single
clearest trafficking/coercion indicator. Legitimate assistance alone is not proof
of abuse. Q99/Q102 require contextual review of actual coercion, lack of consent,
loss of account/earnings control or other credible evidence, with proportionate
protective action and safe-contact safeguards. This pilot restriction reflects
unsupported access controls and operational capacity, not a finding that agency
or assistant involvement necessarily implies trafficking.

Source checked September 22: Fansly's Management Sessions guide expressly allows
controlled, permission-scoped assistance without sharing login credentials and
restricts sensitive functions such as payouts/account closure. It demonstrates a
supported alternative, not equivalent Pumdoki capability or a reason to introduce
it before the needed controls exist.
https://help.fansly.com/en/articles/12328641-management-sessions
Q145 is approved as the launch policy: creator-only account operation with lawful
outside production help under the stated safeguards. Delegated management remains
deferred; no new feature or provider arrangement is authorized.

Question 146 reviewed September 22 and retained (account termination procedure):
creators may request closure at any time; platform enforcement includes notice
and an appeal route, with immediate action for serious prohibited conduct. Apply
Q47's ownership verification, closure consequences, stopping new transactions and
renewals, handling existing obligations and lawful data retention/deletion without
a mandatory recovery period. Read this short answer with Q62/Q63: urgent protective
suspension can precede investigation, substantiated serious breaches can warrant
termination without prior warning, and notice/appeal information remains subject
to lawful disclosure limits and safety considerations. A report alone is not proof
for permanent termination. This does not limit urgent action to an undefined
"absolute prohibitions" label, create an extra warning entitlement or override
required removal/reporting/preservation. Q147–150 separately address financial,
purchased-access and surviving-rights consequences; retaining Q146 does not
activate an account-deletion or enforcement system.

Question 147 approved September 22, 2026 (accrued but unpaid creator earnings
after termination): legitimate accrued earnings remain payable
following voluntary closure or platform termination, subject to valid transaction
adjustments, required tax withholding, agreed disclosed fees, lawful restrictions
and actual provider requirements. Closing or banning the account is not, by
itself, a basis for forfeiture, a new penalty or converting unpaid earnings into
platform revenue. Do not promise payment of fraudulent/unearned amounts; Q139–142
and applicable law govern the relevant adjustments and withholding.

Release undisputed eligible earnings through the normal applicable payout cycle
once the transaction pending/settlement conditions and required verification,
tax and payout checks are satisfied. Do not make all remaining earnings wait for
an unrelated investigation to finish. Q138 holds must have documented grounds,
proportionate scope and regular review; restrict affected funds unless broader
grounds justify more, provide reasons/updates and the existing human appeal
route subject to lawful disclosure limits and Q102 safe-contact protections, and
release funds when the basis ends subject to separate valid restrictions.
Account termination does not restart the pending clock or authorize an indefinite
hold. No bank-arrival date or advance against unavailable processor funds is
promised. Allow a secure verified settlement/support route without requiring
restoration of a banned account.

Q135's ordinary payout minimum must not automatically forfeit the remaining
balance on closure. Establish a documented final-settlement process and use a
supported payment route or minimum exception where available and lawful. If
provider minimums or other restrictions prevent payment, keep a record of the
amount due and resolve it under the final agreement and applicable law rather
than silently treating it as platform income. Actual closure methods, final
fees, timing and handling of unpaid/unclaimed funds need confirmation before
live launch. No universal provider minimum waiver, instant final payout, new
banking rail or indefinite retention of unnecessary identity data is authorized.

Sources checked September 22: Fansly's payout-minimum guide demonstrates that
minimums differ by method. LoyalFans' closure terms discuss paying unpaid creator
earnings and separately handling balances below the selected method's minimum;
they also contain a forfeiture provision that is not adopted here.
These are product comparisons, not authority to forfeit earnings or confirmation
of Pumdoki provider capabilities. The approved continuing entitlement and hold
safeguards align with approved Q122/Q135/Q138–142.
https://help.fansly.com/en/articles/10544481-payout-minimums-by-method
https://www.loyalfans.com/legal/terms-conditions
Q147 is approved as the intended entitlement, hold and final-settlement policy.
Final legal/provider review, supported methods and implementation are still
required. P06 / LEG-MT-100 records the payout-flow dependency and remains Not
Started; no parallel founder task or live payout capability is activated.

Questions 148–149 reviewed September 22 and retained (purchased content after
creator termination or voluntary closure): members retain access to the purchased
version in accordance with Q26/Q46/Q47 and the applicable Terms and Refund Policy.
Ordinary closure, delisting or unrelated account enforcement alone does not erase
valid purchase entitlements. Required legal/safety removal and reversed payments
can end affected access; do not read "absolute prohibitions" as excluding other
applicable lawful removal grounds. Refunds required by law or the approved policy
must be honored, rather than left to unrestricted discretion. These answers do
not give copyright ownership to buyers, decide downloads, preserve access to
illegal/nonconsensual material or grant access to future content. Paid version
retention, entitlements and refund enforcement remain unimplemented.

Question 150 approved September 22, 2026 (post-termination rights the platform
needs to retain), following the founder's direction to proceed to Additional
materials: retain a non-exclusive license only to the
extent and for the duration necessary to store, technically process and deliver
lawfully purchased content versions to the existing entitled purchasers, complete
outstanding financial obligations and handle legitimate disputes. This implements
Q26/Q46/Q47/Q127 rather than authorizing new sales after closure or public reuse.
Creators retain ownership. No broader advertising, unrelated exploitation or
new-sale right is implied; separate promotional permissions under Q55/Q128 remain
a separate matter. Downloads remain undecided.

Continued delivery remains subject to applicable law, consent and safety/removal
requirements, valid payment reversals, and the Terms and Refund Policy. A surviving
operating license is not a substitute for valid performer consent or a basis to
serve content that must be removed. Technical processing must remain necessary
for authorized delivery, not a right to materially alter the purchased work or
create unrelated derivatives. Final counsel drafting must make this limited
survival explicit and consistent with the operating-license and deletion clauses.

Retain only necessary transaction, tax, consent/verification, applicable §2257,
moderation, complaint/dispute and law-enforcement records for documented lawful
purposes and the applicable retention periods/holds under Q46/Q130. Preserve the
separation of statutory performer records from consent and other records. Any
removed-content evidence must be kept only where lawful and necessary in a
restricted, segregated evidence store; it must not remain publicly accessible or
available to buyers merely because an evidence copy is retained. Delete or
anonymize unnecessary personal data under the approved deletion process when
its lawful purpose and required preservation period end. This is not a blanket
indefinite-retention license or a claim that evidence/erasure controls operate.

Sources checked September 22: Fansly's sold-media guide confirms that deleting
sold media does not remove the purchased version from the buyer's collection.
LoyalFans' Creator Supplement section 5.9.3 explicitly addresses continuing access
for prior purchasers after content removal and specified archival copies. These
support separating necessary surviving rights from ordinary publication rights;
Pumdoki is not adopting that supplement's broader promotional/derivative rights.
https://help.fansly.com/en/articles/12582143-if-i-delete-sold-media-will-fans-keep-access
https://www.loyalfans.com/legal/creator-supplement
Q150 is approved as the intended limited surviving license and retention policy;
final drafting and operating controls remain pending. The numbered questionnaire
review has reached its end, with previously recorded open provider/business issues
still unresolved. The commissioned agreement and LEG-MT-021 remain In Progress,
pending delivery, substantive review and the necessary controls.

The unnumbered Additional materials note was reviewed September 22 and accepted
in the final questionnaire handoff. Review finding: revise the first paragraph because the blanket
statement that no processor or card-network materials are available is inaccurate.
Public Mastercard Security Rules and Procedures (Merchant Edition, 4 August 2026,
section 9.4.1) and CCBill documentation are available and have been consulted.
CCBill's initial Sales correspondence is also available; the requirement for a
functioning review site does not mean that no guidance has been issued. It permits
password-protected online access but does not confirm that a static prototype or
simulated checkout suffices. Final Pumdoki-specific approval, pricing/reserves,
creator payout capability and verification-provider arrangements remain unconfirmed.

Accepted replacement: available materials include the
initial CCBill correspondence and public card-network/provider guidance. Draft
using the agreed platform model, applicable law and current applicable card-network
requirements, including Mastercard section 9.4.1. Identify assumptions and unresolved
provider-dependent provisions, then reconcile the documents with the actual processor,
acquiring-bank, payout and age-verification requirements before activating the relevant
features or processing live payments. Do not claim that provider appointments,
approvals or operational controls exist while they remain planned. Public guidance
is not evidence of Pumdoki approval or confirmation of its negotiated terms.

Retain the second paragraph's accurate single-operator description: the founder
currently owns the relevant responsibilities. Trained backup/delegation is planned
under earlier decisions, not an existing staffed department or guaranteed round-the-clock
coverage. Describe any eventual delegation only when it is actually arranged, with
the founder's accountability and applicable operational requirements preserved.
The paragraph's prediction of a card network's reaction is explanatory judgment,
not a verified statement from an underwriter; no new staffing promise is adopted.

Sources rechecked September 22:
https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/SPME-Manual.pdf
https://ccbill.com/doc/merchant-accounting-faqs
The September 9 Sales reply is summarized in the CCBill section below and in
docs/product/ccbill-review-site-clarification.md; the cancelled follow-up remains
unsent. This note is questionnaire content, not new authorization to contact counsel,
restart provider outreach, collect identity records or activate payments.
September 23 handoff: the founder reports correcting the final response document,
including formation status, creator approval versus publication/payout prerequisites,
applicable privacy-request deadlines and the duplicated impersonation answer.
The founder edits and sends the DOCX privately; it is not a repository artifact.
The legal task now awaits Suzanne's response and commissioned drafts. Final legal
approval, provider details and operational implementation remain outstanding.
The next engineering checkpoint remains P05 / LEG-MT-088; no parallel founder
workstream or live activation is started by this handoff.

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

- September 13 final direction: wallets are future work. Park the optional USD
  wallet assessment and implementation; retain direct payments and resume the
  questionnaire. The candidate in Phase 6 is a future reference, not a beta gate.
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
- September 22 Q132 supersedes the earlier no-profit/cost-recovery Founders
  offer. Use the standard commission model and the public label Founders, with
  discovery placement, a web-app tag, SFW Discord events and future event priority.
  Q133 approves account-lifetime recognition and conditional benefits; eligibility
  remains open, and cash-prize events need their own
  budgets and terms. Earlier 500-person, permanent-fee and Plus promises are not
  approved. No-loss economics were never demonstrated for the superseded offer.
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

| Step                                     | Work                                                                                                                                                                                                                                | Finish evidence                                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — done                                 | Founder [business-definition answers](docs/product/initial-business-definition.md) received and reviewed. Open details are carried forward.                                                                                         | Founder answers; unresolved items may say “not sure.”                                                                                                         |
| 2 — done                                 | P04 / LEG-MT-158: founder confirmed Maryland approval of Kiban Digital Holdings LLC and EIN receipt on September 16, 2026.                                                                                                          | Founder confirmation; original state/IRS documents retained privately, not independently inspected. Banking and DBA remain open.                              |
| 3 — current: review working content flow | R2 setup and safe-sample integration are verified. Review Create Post → save draft → publish in the local preview with a safe photo/video.                                                                                          | Cloud upload/read, private drafts, member playback, restart persistence and removal passed. Bucket public access is disabled; founder review remains pending. |
| 4 — waiting                              | Review the reply; set an affordable pilot, creator offer, fee basis and cash plan. Complete banking/DBA/application actions as provider requirements permit; EIN already obtained; scope only necessary legal/tax questions.        | Founder approves concrete scope and spending cap; formal merchant onboarding proceeds as requirements permit.                                                 |
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

The business definition is complete. The founder confirmed Maryland approval
of Kiban Digital Holdings LLC and EIN receipt on September 16, 2026;
P04 / LEG-MT-158 is complete. Banking and DBA registration remain open.
CCBill's initial Sales reply has been
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
