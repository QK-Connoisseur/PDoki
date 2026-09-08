# Pumdoki

Pumdoki is an adult creator platform focused on subscriptions, paid content, creator services, social interaction, and creator discovery through Connect.

The repository contains a broad React frontend prototype plus a local
TypeScript/Express/PostgreSQL backend foundation. Core authentication, secure
sessions, email verification, password reset, account-security Settings, and
their database models are implemented locally. Media, payments, compliance
operations, moderation, and production infrastructure remain incomplete.

The detailed delivery roadmap is maintained in [PLAN.md](./PLAN.md).

## Product direction

Pumdoki's current positioning is:

> A space for creators, members, and real interaction.

The visual identity uses a soft sakura-pink, pearl, and off-white palette with rounded, premium interfaces. Sakura Kiss and Midnight City are the two free launch themes.

## Confirmed launch scope

The following are intended to work at launch:

- Member and creator accounts.
- Creator profiles and standardized membership tiers.
- The Home feed with Following and For You views.
- Public, subscriber-only, tier-restricted, and individually paid content.
- Pay-to-view individual photos/videos and bundles, offered in feed posts or sent as locked content through chat.
- Store browsing, purchases, favorites, history, and responsive YouTube-like thumbnails.
- Connect creator discovery with online status, price, language, and service filters. Members communicate and arrange orders through real-time chat; automated calendars/bookings are not assumed launch scope.
- Real-time direct messages using WebSockets.
- Creator tipping through Send Love.
- Veso prepaid credits, where 1 Veso equals 1 USD.
- Veso wallet recharge and spending.
- Creator dashboard plus separately deployed private admin operations.
- Explicit-content preference controls.
- Creator verification, consent, moderation, reporting, and required compliance workflows.
- A clear, responsive interface with both existing static themes. Additional motion, sound, Plus benefits, and retention experiments are later work.

Live streaming remains post-MVP.

## Important product decisions

### Veso

Veso is a prepaid platform credit:

- 1 Veso represents 1 USD of purchasing value.
- Members recharge Vesos before spending them.
- Store content, Connect services, and Send Love may be paid with Vesos.
- Member Veso balances and creator payable earnings must be separate accounting systems.
- Veso must use an auditable transaction ledger rather than a directly editable balance.
- The recharge experience should be visually comparable to E-Pal's Buff recharge flow.
- E-Pal may be used as a product reference, but Pumdoki's financial, refund, expiration, transfer, and redemption policies require independent processor and legal review.

### Explicit content

- New members must be able to choose whether explicit 18+ content is displayed.
- Explicit content should be hidden by default until the member opts in.
- The preference belongs in onboarding, Settings, and relevant feed controls.
- The choice does not replace age verification or legal compliance requirements.

### Store

- Use noticeable 16:9 thumbnails with clear duration/type badges.
- Target four medium cards on a typical large desktop.
- Add more columns only as screen width genuinely allows.
- Avoid reducing thumbnails to tiny cards to maximize column count.
- Mobile should use a prominent single-column presentation.
- Purchased, Favorites, Liked, and History must be backed by real account data.

### Oasis and later retention — founder decision, September 6, 2026

The original Oasis/Drimy collectible game is cancelled. Its legacy prototype
may remain in the repository for reference but must not be treated as a launch
requirement or extended. The Oasis name may be reused after launch for daily
and friend streaks plus playful adult language learning, including profanity
and opt-in roasting. This is an unbuilt concept; mechanics, costs, privacy,
moderation, and any AI provider remain undecided. No replacement game economy,
Orbs, creature evolution, leagues, or randomized purchases are approved.

### Founding creators and Pumdoki Plus

The founder wants a founding-creator programme with a profile badge, no profit
for Pumdoki on those creators' sales, and recovery of the costs they create.
This clarifies the earlier processing-fees-only description: the exact cost
basis and fee are undecided, and a no-loss outcome has not been demonstrated.
Approximately 500 creators is a proposed programme size, not an initial pilot
capacity commitment. Eligible costs, duration, payout/reserve treatment, shared
cost allocation and funding must be decided before publishing an offer.
Pumdoki Plus, cosmetics/avatar decorations, and free Plus
for a proposed top 100/leaderboard are ideas for later evaluation; prices,
benefits, selection rules, and free-membership promises are not approved.

### Founder workflow

Work one founder step at a time. The
[initial business definition](docs/product/initial-business-definition.md) has
been answered and reviewed. As of September 8, 2026, the founder confirms
**Kiban Digital Holdings LLC** is filed through Northwest and awaiting Maryland
approval. The CCBill inquiry has been sent to Sales and is awaiting a reply.
PLAN.md §20 owns the current stage: await and review the response. The
[prepared inquiry](docs/product/initial-ccbill-inquiry.md) remains a reference.
Use founder-led work, drafts and suitable Fiverr specialists where practical;
pay for targeted qualified legal review only when needed for the actual issue.
Do not require a broad legal consultation for routine entity formation.
The sequential order, review checkpoints, legal-copy release procedure, and
email-provider timing are in PLAN.md. Use the
[budget notes](docs/product/launch-budget.md) and master tracker for estimates;
an estimate is not spending authorization or a promised launch date.

### International direction

Pumdoki ultimately intends to support the United States, Latin America, Europe, and other eligible regions. Rollout should be phased based on:

- Payment and payout support.
- Adult-content legality.
- Identity-verification availability.
- Privacy and consumer-protection requirements.
- Tax and reporting obligations.
- Sanctions and prohibited-region screening.

Latin American creator support is a core requirement, including localization and international tax/payout onboarding.

## Preserved frontend requirements

These requirements were extracted from temporary implementation-prompt files before those files were removed.

### Profile

- The profile avatar should not use a story ring or attached online-status dot.
- The textual status badge under the username remains.
- Profile sections should use clear card separation and readable spacing.
- Service selection must have an obvious active state and clear price badges.
- Selected service content is separated into Service Description, Pricing and Details, and Reviews.
- Feed is a direct tab without a nested Media submenu.
- Media Store includes filters, search, grid/list views, and a Free Content filter.
- About Me should not duplicate Service Types or Reviews.
- About Me includes a sakura-themed external-links section with an empty state.
- Styles and platforms should be rendered as chips.

### Legal and compliance UI

- A global footer exposes Terms, Privacy, Cookies, DMCA, 18 USC §2257, Acceptable Use, Appeals, Law Enforcement, and Contact links.
- Signup requires an unchecked 18+ and terms/privacy clickwrap.
- Cookie controls include Accept All, Reject Non-Essential, and Manage Preferences.
- Creator onboarding currently collects creator-facing profile fields and
  versioned prototype acknowledgements only. It must not add identity-document
  or selfie collection until an approved provider, retention policy, and
  private operations workflow exist.
- Content publishing includes a mandatory rights and policy confirmation.
- Legal copy currently in the frontend is explicitly a prototype, not counsel-approved policy or an operational intake channel. PLAN.md records when and how approved copy replaces it before public launch.
- Prototype contact details must use reserved sample addresses such as `support@pumdoki.example` until real mailboxes exist.
- No interface may claim that encryption, moderation vendors, response times, legal programs, or compliance processes exist until they are actually operational.

## Repository structure

```text
pumdoki/
├── apps/
│   ├── web/                 # React 19 + Vite + Tailwind frontend
│   ├── admin/               # Separately built private operations shell
│   └── api/                 # Node/TypeScript Express API
├── packages/
│   ├── contracts/           # Shared API schemas and types
│   ├── database/            # Prisma schema, migrations, and seed
│   ├── ui/                  # Shared design-system components
│   └── config/              # Shared lint, TypeScript, and formatting config
├── docs/
│   ├── architecture/
│   ├── operations/           # Non-secret readiness templates; no live state
│   ├── legal/
│   ├── api/
│   └── product/
├── infra/
│   ├── aws/
│   └── cloudflare/
├── tests/
│   └── e2e/
├── .github/workflows/
├── PLAN.md
└── README.md
```

The previous prompt-heavy AI folder proposal was intentionally not adopted. Product decisions belong in the README, PLAN, tracker, issues, and focused formal documentation—not in a growing collection of disposable prompts.

The public web application intentionally has no `/admin` route. `apps/admin`
is an independently buildable private operations shell for a future separate
deployment. Its workflows are not implemented and it must not be exposed
publicly. The backend `ADMIN` role remains necessary but is never sufficient
for operational API authorization. A signed operations principal, explicit
active-operator mapping, and the required permission must also pass at the API
origin; the public product session does not qualify. Separate hosting and
hidden navigation are not substitutes for those server-side controls.

## Current frontend

The web prototype includes:

- Landing/login and signup.
- Home feed and moment rail.
- Creator profiles and services.
- Connect.
- Store.
- Promotions.
- Wallet.
- Creator dashboard.
- Legacy Oasis prototype (cancelled direction; retained for reference).
- Chat UI.
- Legal hub and creator-onboarding UI.

Current limitations:

- Data is mostly hardcoded mock data (migrating to `apps/web/src/fixtures` per page).
- Authentication uses the real API with HttpOnly-cookie session restoration,
  protected/role routes, registration/login/logout, email verification, and
  password reset. Protected Settings uses real APIs for display name,
  email/reverification, password change, active-session listing/revocation,
  and a default-hidden explicit-content preference with deliberate opt-in.
  Sakura Kiss and Midnight City can be selected locally for the shared member shell;
  the theme choice is saved only in the current browser. Both themes use static
  desktop/mobile artwork. Background motion controls, overlays, and videos have
  been removed; motion is deferred until a professionally reviewed implementation.
  The notification bell supports sample All/Unread activity with temporary read state. Persisted notifications, account-synced appearance, billing, export,
  and deletion remain sequenced to their later dependency phases.
- Verified members can now submit one real creator application. The application
  and versioned prototype-policy evidence persist in PostgreSQL, while the
  account remains a member with no Dashboard access. Identity documents,
  operational approval, tax intake, and finalized legal terms are deliberately
  not collected or simulated yet.
- Financial buttons do not process real transactions.
- Media is loaded from external demo URLs.
- Many controls are visual placeholders.

URL routing (React Router), ESLint/Prettier, Vitest + Testing Library unit
tests, real-stack Playwright auth/routing coverage, and GitHub Actions CI are
now in place for the frontend foundation. Unknown URLs retain their path and
render a branded, session-aware 404, while non-login feature routes are lazy-
loaded behind a shared accessible loading state. Phase 3 is published and
CI-verified through commit `d55f5f3`. Phase 4 Slice 1, the persisted pending
creator-application foundation, is published and CI-verified as commit
`ce6c9e4`.
Phase 4 Slice 2 and the frontend routing hardening are published on `dev`
through merge commit `1189404`. Slice 2 remains a fail-closed backend
state/evidence foundation rather than a deployable private-operations workflow.
Phase 4 Slice 3 is published through PR #15 merge commit `24e1653`; post-merge
GitHub Actions run `32784338614` passed all three jobs. It adds provider-neutral
signed-assertion verification, database-owned exact operator/permission
authorization, and test-only request-integrity seams for the dormant review
router. The founder has approved the seven private-operations policy decisions,
including the two-lock identity-plus-Pumdoki-authorization model, in
[the durable decision record](docs/architecture/phase4-private-operations-founder-policy-decisions.md).
The public API still does not mount that router, and no operational identity
provider, session, private origin, runtime database role, live configuration,
or deployment exists. G1–G12 remain `NOT EVALUATED`.

Phase 4 Slice 4 is the dormant
[YubiKey claim-schema evaluation](docs/architecture/phase4-slice4-yubikey-claim-schema-evaluation.md)
from merged [PR #17](https://github.com/QK-Connoisseur/PDoki/pull/17), implementation
`317abda` and reviewed head `25057bd`. September 6 consolidation `56cb0ad`
merged that source and the local notification bell into dev alongside the
current static themes. All three combined CI jobs passed in run `34026349075`.
See HANDOFF.md for the publication checkpoint and Git refs for current dev/main
tips. PR #19 is the static-theme change, not Slice 4.
The candidate remains unmounted and synthetic; Cloudflare is not selected.
Two hardware-key account logins were founder-tested on the Mac, but exact
Access-application assertion and hardware-method evidence remain absent.
Further operations hardening is parked. The next engineering work will follow
the one-page business definition and concrete commercial requirements.

Production infrastructure, identity verification, operational authentication/review,
server-side content filtering, dependency-bound Settings, and other product
domains are not complete. The [operations readiness packet](docs/operations/README.md)
contains non-secret planning templates for those future controls; it neither
records their live state nor authorizes activation.

## Development

### Requirements

- Node.js 24.19.0 or newer. The repository pins the verified local and CI
  baseline in `.nvmrc`; with nvm, run `nvm install && nvm use`.
- npm.

### Install

From the repository root:

```bash
npm install
```

### Run the web app

```bash
npm run dev
```

For full-stack review on macOS or Windows, use
`npm run dev:e2e:web` so Vite binds explicitly to `127.0.0.1`. Keep the API in
a second terminal with `npm run dev:api`; the complete environment and startup
sequence is recorded in `HANDOFF.md`.

The private operations shell is a separate workspace and dev server:

```bash
npm run dev:admin
npm run build:admin
```

It uses `127.0.0.1:5174` for development and is not part of public web-app
navigation or deployment.

### Run the local API stack

Copy `.env.example` to `.env`, then:

```bash
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev:api
```

`db:up` starts PostgreSQL and Mailpit with their host ports bound to IPv4
loopback only. PostgreSQL uses `127.0.0.1:5432`; Mailpit's development inbox is
available at `http://127.0.0.1:8025`.

The locally implemented Phase 2 worker foundation is a separate process. The
worker requires an explicit `WORKER_DATABASE_URL` and does not fall back to
the API's `DATABASE_URL`; the producer CLI uses `DATABASE_URL` because it
submits through the API-side Prisma transaction:

```bash
npm run dev:worker
npm run enqueue:worker-canary -- --idempotency-key local-safe-canary
```

The canary is non-secret and local-only. No public route currently enqueues
work, and no email, payment, Veso, identity, or creator-review flow uses this
worker. PR #13 published the foundation to `dev` as merge commit `6311522`;
exact-head and post-merge CI passed all three jobs. Deployment, live
configuration, and product-flow migration remain separately gated.
Final verification passed against a clean disposable database, which was
removed afterward. Do not treat the ordinary
`pumdoki_dev` migration as final evidence until the stale draft described in
`HANDOFF.md` is separately approved for repair or recreation.

### Production build

```bash
npm run build
```

### Preview the build

```bash
npm run preview
```

### Quality checks

```bash
npm run lint          # ESLint across all workspaces
npm run format        # Prettier write (format:check to verify only)
npm run test          # Vitest unit tests (apps/web)
npm run test:api      # DB-backed API tests; requires the local database
npm run test:e2e      # real API/DB/Mailpit Playwright E2E; start/deploy/seed DB first
```

The build/dev/preview root commands delegate to the `@pumdoki/web` workspace.

### Environment

Copy `.env.example` to `.env` (or `apps/web/.env.local`) for local overrides.
Only `VITE_`-prefixed variables are exposed to the web client; `VITE_API_BASE_URL`
points the frontend API client at the backend. Never commit a real `.env`.

## Documentation rules

- `README.md` describes the product, repository, and stable requirements.
- `PLAN.md` contains the phased implementation roadmap and open decisions.
- The master tracker is the PLAN.md-aligned operational view: use its Delivery
  Tracker for current execution, Review & Blocker Queue for daily attention,
  Phase Roadmap for phase-level truth, Daily Log for plain-language debriefs,
  and Decision Register for open approvals. Its original tracker, backlog,
  notes, and expense sheets remain preserved.
- The founder approved the PLAN-aligned workbook at home. The 2026-08-25 Slice
  4 reconciliation preserves its legacy tracker, backlog, notes, assumptions,
  and expense values while adding only current decision and sanitized progress
  evidence.
- Architecture decisions and durable slice designs live under `docs/architecture`.
- Counsel-approved policies may later live under `docs/legal`.
- Temporary implementation prompts should not be committed.
- Never place secrets, identity documents, processor credentials, or real `.env` files in Git.
