# Pumdoki

Pumdoki is an adult creator platform focused on subscriptions, paid content, creator services, social interaction, and a collectible companion system called Oasis.

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
- Store browsing, purchases, favorites, history, and responsive YouTube-like thumbnails.
- Connect creator services and bookings.
- Real-time direct messages using WebSockets.
- Creator tipping through Send Love.
- Veso prepaid credits, where 1 Veso equals 1 USD.
- Veso wallet recharge and spending.
- Creator dashboard plus separately deployed private admin operations.
- Explicit-content preference controls.
- Creator verification, consent, moderation, reporting, and required compliance workflows.
- Oasis/Drimy daily-retention gameplay, collectibles, backgrounds, and skins.

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

### Oasis

- Oasis is launch scope, not a post-launch experiment.
- Its primary purpose is daily retention.
- Members collect and evolve Drimys.
- Rewards include collectible backgrounds, skins, frames, badges, and related cosmetics.
- Progress, inventory, tasks, cooldowns, purchases, and rewards must be server-authoritative.
- Paid randomized rewards should not launch without legal and payment-provider review.

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
- Legal copy currently in the frontend is placeholder material and is not approved for production.
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
- Oasis.
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
  Notifications, account-synced appearance, billing, export,
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
Phase 4 Slice 3 is locally committed and verified on
`codex/phase4-private-ops-access-foundation` as implementation commit
`9904334`. It adds provider-neutral signed-assertion verification, database-
owned exact operator/permission authorization, and test-only request-integrity
seams for the dormant review router. The public API still does not mount that
router, and no operational identity provider, session, private origin, runtime
database role, live configuration, or deployment exists. G1–G12 remain
`NOT EVALUATED`.
Production
infrastructure, identity verification, operational authentication/review,
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

For full-stack review on the current Windows workstation, use
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
- Architecture decisions and durable slice designs live under `docs/architecture`.
- Counsel-approved policies may later live under `docs/legal`.
- Temporary implementation prompts should not be committed.
- Never place secrets, identity documents, processor credentials, or real `.env` files in Git.
