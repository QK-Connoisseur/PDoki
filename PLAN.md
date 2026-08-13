# Pumdoki Detailed Implementation Plan

@CLAUDE.md

Last updated: August 13, 2026

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

- Store and Connect are launch-critical.
- Tipping, PPV content, and Send Love are launch scope.
- Oasis is launch scope and must be functional.
- Real-time messaging uses WebSockets.
- Veso is prepaid value at 1 Veso = 1 USD.
- Store and Connect transactions use Veso.
- Membership tiers are standardized across creators.
- Explicit content can be hidden or shown based on an adult member's preference.
- International creators, especially Latin American creators, are a core audience.
- Live streaming is post-MVP.
- The platform will begin with a small group of known creators but should accept public member registration.

### Current external dependencies

- CCBill is the intended primary adult payment processor.
- Epoch is the intended fallback/cascade processor.
- Neither merchant application has started.
- Cascade behavior has not been confirmed with either provider.
- The LLC has not been formed.
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
- Require stronger operational controls before launch: MFA or SSO, restricted
  access, audit logging, and separately permissioned sensitive records.

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
- Veso recharge receipt.
- Creator application received/approved/rejected.
- Content moderation and appeal notices.
- Booking confirmation/reminder/cancellation.
- Payout and tax-document notices.

Local implementation status:

- A provider-neutral mailer with console and SMTP transports is implemented.
- Mailpit is part of the local Docker Compose stack and receives verification
  and password-reset mail.
- No production provider is selected. Adult-business support, production
  deliverability, TLS, DKIM, SPF, and DMARC remain open.

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
- Keep member Veso, creator earnings, and platform revenue in separate ledgers.

## 4. Phase 0 — Baseline, tracker, and scope control

### Tasks

1. Preserve the current frontend state in a clean Git commit.
2. Review all existing uncommitted legal/profile work.
3. Reclassify tracker rows using the five implementation states.
4. Mark processor selection separately from processor integration.
5. Mark existing Wallet, legal, onboarding, and Oasis screens as UI prototypes.
6. Confirm the exact MVP list in writing.
7. Add Store, Connect, tipping, PPV, Send Love, WebSockets, Veso recharge, explicit-content controls, and launch Oasis to MVP.
8. Keep live streaming in post-MVP backlog.
9. Create an open-decision register for:
   - Commission.
   - Founding Creator economics.
   - Payout cadence.
   - LLC state.
   - Identity provider.
   - Email provider.
   - Launch country allowlist.
   - Refund and Veso policies.
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

Current gap — August 3, 2026: the wildcard web route still redirects unknown
URLs to `/login`; the branded 404 state above remains open.

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
- Veso accounts and ledger entries.
- Store purchases.
- Connect services and bookings.
- Conversations and messages.
- Reports, moderation actions, and appeals.
- Admin audit events.
- Oasis creatures, inventory, tasks, and rewards.

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

1. Form the legal entity before merchant onboarding.
2. Evaluate Wyoming and other states with a privacy-focused attorney and CPA.
3. Understand foreign qualification in the founder's operating state.
4. Secure a registered agent.
5. Decide whether Pumdoki is a DBA/trade name.
6. Hire counsel experienced with adult creator platforms or high-risk marketplaces.
7. Draft and approve:
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
   - Refund and Veso terms.
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

### Current Phase 4 implementation status — August 12, 2026

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
- Slice 2 is committed on `codex/phase4-slice2-and-ux` as `1ba32ea`. Its private-operations
  boundary, exact non-approval state machine, concurrency rule, evidence
  limitations, exclusions, and activation blockers are specified in
  `docs/architecture/phase4-slice2-private-creator-review.md`.
- The normal public API does not mount the creator-review router. The dormant
  router requires an injected operations verifier, rejects public-session-only
  access by construction, and permits only `PENDING → NEEDS_INFORMATION`,
  `PENDING → REJECTED`, and `NEEDS_INFORMATION → REJECTED` through an atomic
  expected-status update plus evidence insert. Approval, role promotion, and
  identity-status mutation remain absent.
- The local Slice 2 engineering gate is green: all six migrations deploy to
  PostgreSQL 17, focused migration/review coverage passes 10/10, the full API
  suite passes 90/90, the web suite passes 126/126, the real-stack Chromium
  suite passes 40/40, and builds/lint/format pass. Draft pull request #1 targets
  `dev`; GitHub Actions run `31704980241` passed all three jobs at initial review
  head `ee83274`. Merge remains conditioned on human review and a green final
  PR head, and the foundation is not a usable private-operations workflow.
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

### Upload lifecycle

1. Creator requests a signed upload.
2. API checks role, creator status, and quota.
3. API creates a pending media record.
4. Browser uploads directly to an R2 quarantine bucket/prefix.
5. Browser confirms completion.
6. Background worker validates the actual file.
7. Worker creates thumbnails and optimized variants.
8. Content enters moderation.
9. Approved content moves to a publishable protected location.
10. Member requests access.
11. API checks entitlement or purchase.
12. API returns a short-lived signed media URL.

### Content visibility

- Public.
- Followers.
- Any subscriber.
- Specific standardized tier.
- PPV/Veso purchase.
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

### Veso product rules to finalize

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

### Recommended ledger model

- Store all values in integer cents or integer Veso units.
- Never update a balance without a ledger transaction.
- Use separate accounts for:
  - Member purchased Veso.
  - Member promotional Veso.
  - Creator pending earnings.
  - Creator available earnings.
  - Platform revenue.
  - Processor clearing.
  - Refund and chargeback reserves.
- Every payment webhook is idempotent.
- Every purchase references immutable ledger entries.

### Processor work

1. Begin CCBill merchant application in parallel with product work.
2. Begin Epoch discussion after core policies and entity details are ready.
3. Confirm cascade support in writing.
4. Implement CCBill checkout.
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

### Veso recharge UI

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

- Send Love creates a Veso transfer from member balance to creator pending earnings.
- PPV purchase creates a permanent or policy-defined entitlement.
- Insufficient Veso opens the recharge flow.
- Repeated clicks use idempotency keys.
- Refunds update both entitlement and ledger state.

### Exit criteria

- Test recharge updates the ledger.
- Store, Connect, Send Love, and PPV consume Veso correctly.
- Subscription lifecycle is webhook-driven.
- Refunds and chargebacks reconcile.

## 11. Phase 7 — Core end-to-end vertical slice

Complete this before broad feature expansion:

1. Member registers.
2. Member verifies email.
3. Creator registers.
4. Creator accepts agreements.
5. Creator completes identity verification.
6. Admin approves creator.
7. Creator configures standardized tiers.
8. Creator uploads protected media.
9. Moderator approves media.
10. Member recharges Veso.
11. Member subscribes or buys PPV.
12. Trusted processor event confirms payment.
13. Member receives the correct entitlement.
14. Member accesses protected media.
15. Member sends a Veso tip.
16. Creator sees pending earnings.
17. Cancellation or expiration changes access correctly.
18. Admin can inspect the full audit trail.

### Exit criteria

- The complete flow passes automated integration and E2E tests.
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
16. Buy with Veso.
17. Recharge fallback.
18. Responsive mobile layout.

### Connect

1. Standard service types.
2. Creator service configuration.
3. Pricing in Veso.
4. Availability calendar.
5. Time-zone handling.
6. Booking.
7. Payment hold.
8. Confirmation.
9. Reminder.
10. Completion.
11. Cancellation and refund rules.
12. Dispute workflow.
13. Reviews.

### Exit criteria

- Store tabs contain real account data.
- Connect booking lifecycle works.
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
- Veso tip.
- PPV purchase.
- Booking and reminder.
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
- Connect services and bookings.
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
11. Veso ledger inspection.
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
- Operational authentication requires MFA or SSO plus restricted access before
  production use.
- Sensitive document access is separately permissioned.
- Every sensitive view and action is logged.
- Destructive actions require confirmation and reason.
- Audit records cannot be edited or deleted by ordinary admins.

### Exit criteria

- Founder can operate the platform without database access.
- Reports, payments, and creator verification are manageable.
- Sensitive access is auditable.

## 16. Phase 12 — Oasis/Drimy launch implementation

### Product loop

1. Member receives or chooses a starter Drimy.
2. Daily login creates a task set.
3. Member earns Orbs through approved platform activity.
4. Member bonds with the Drimy.
5. Drimy gains XP and evolves.
6. Member unlocks cosmetics and collectibles.
7. Collections and streaks encourage return visits.

### Backend domains

- Drimy species.
- User-owned Drimys.
- Evolution stages.
- XP ledger.
- Orb ledger.
- Daily task definitions.
- User task progress.
- Inventory.
- Cosmetics.
- Equipped background/skin/frame.
- Achievements.
- League seasons.
- Leaderboard snapshots.
- Store purchases.
- Reward claims.

### Rules

- Server time controls cooldowns and daily resets.
- Reward claims are idempotent.
- Client cannot directly update XP, Orbs, stage, or inventory.
- Tasks react to real platform events.
- Lucky Catch results update inventory.
- Duplicate rewards have a defined conversion rule.
- Store purchases deduct Orbs or Vesos through the appropriate ledger.
- Fixed-price cosmetics are safer for launch.
- Paid randomized rewards require separate legal and processor approval.

### Launch content target

- At least three Drimy species.
- Three evolution stages for each launch Drimy.
- A meaningful starter cosmetic collection.
- Daily task variety.
- Achievement set.
- Backgrounds, skins, frames, and badges.
- Clear empty, locked, earned, and equipped states.

### Exit criteria

- Progress survives devices and refreshes.
- Daily reset is reliable.
- Purchases and rewards cannot be duplicated.
- Inventory and equipped cosmetics render correctly.

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

- Unit tests for pricing, entitlement, ledger, Oasis, and permissions.
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
- Additional themes beyond Sakura and Dark Knight.
- Advanced creator analytics.
- Larger group-chat features.
- External affiliate program.
- Paid randomized Oasis mechanics only if approved.

## 20. Current dependency and decision register

These are working management targets, not legal or processor deadlines. The
founder may revise them, but each item must retain an owner and a concrete
follow-up date.

| Dependency or decision                           | Owner                 | Target     | Current state / next action                                                                                                                                                                                                        |
| ------------------------------------------------ | --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS staging shape and account access             | Founder + Engineering | 2026-07-23 | Overdue: decide deployment shape and credentials boundary; Phase 2 remains partial.                                                                                                                                                |
| Sentry or equivalent                             | Founder + Engineering | 2026-07-23 | Overdue: select account/provider and define environment separation.                                                                                                                                                                |
| Redis, queue, and idempotency approach           | Engineering           | 2026-07-23 | Overdue: decide whether beta uses managed Redis and document the local fallback.                                                                                                                                                   |
| Transactional email provider and local Mailpit   | Founder + Engineering | 2026-07-23 | Local Mailpit and provider-neutral mail are complete; production-provider adult-business fit and deliverability remain overdue.                                                                                                    |
| LLC attorney/CPA shortlist and entity state      | Founder               | 2026-07-30 | Obtain qualified advice; no entity filing is implied by this plan.                                                                                                                                                                 |
| CCBill requirements and fee quote                | Founder               | 2026-07-30 | Request merchant package, technical docs, and complete pricing.                                                                                                                                                                    |
| Identity-verification shortlist                  | Founder + Engineering | 2026-07-30 | Compare two or three providers for countries, AUP, security, and cost.                                                                                                                                                             |
| Epoch terms and written cascade behavior         | Founder               | 2026-08-06 | Confirm commercial and technical fallback behavior in writing.                                                                                                                                                                     |
| Initial country allowlist                        | Founder + Counsel     | 2026-08-06 | Start with the US and only supported Latin American countries.                                                                                                                                                                     |
| Commission, payout, refund, and Veso economics   | Founder + CPA/Counsel | 2026-08-13 | Model processor fees, chargebacks, taxes, reserves, and Founding discounts.                                                                                                                                                        |
| Acceptance/evidence retention schedule           | Founder + Counsel     | 2026-08-13 | Define retention, pseudonymization, lawful deletion, and litigation-hold rules before account deletion or creator onboarding ships.                                                                                                |
| Private-admin restricted access and hardware MFA | Founder + Engineering | 2026-08-06 | In progress: founder is completing Cloudflare and Yubico setup; engineering must document restricted-origin configuration, key enrollment/recovery policy, and required non-secret integration inputs before any admin deployment. |
| Google Workspace recovery-contact privacy        | Founder + Engineering | 2026-08-20 | Review directory visibility and account-recovery factors without recording personal contact details here. Establish independent backup access before replacing any temporary signup contact.                                       |

## 21. Immediate next actions

1. Review draft pull request #1 against `dev` and merge only after human review
   is complete and its final head is green. Keep the review router unmounted
   from the public API.
2. Review backend commit `1ba32ea` and web UX commit `aa10873` independently
   before merging so the two scopes remain auditable.
3. Before any operational deployment, implement the signed Access/IdP assertion
   verifier, explicit operator provisioning/permission mapping, private origin,
   hardware MFA and recovery policy, mutation-origin/CSRF validation, trusted-
   proxy policy, and restricted runtime database grants defined in the Slice 2
   architecture record.
4. Keep `APPROVED`, role promotion, identity files, tax/banking intake, and
   creator publishing disabled until identity, country, legal, and operations
   gates are concrete.
5. In parallel, advance the legal entity/counsel, acceptance-retention,
   identity-provider, country-allowlist, tax, and operational-mailbox decisions.
6. Preserve the dependency sequencing for notification, theme, billing,
   export/deletion, and explicit-content query enforcement.
7. Keep Phase 2 labeled partially complete and close the AWS/Sentry/Redis
   decisions in the register above.
8. Begin the LLC attorney/CPA, CCBill, identity-provider, and country-allowlist
   workstreams in parallel.
9. Build the commission and payout model using real processor quotes when
   available.
