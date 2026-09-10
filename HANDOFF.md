# Session Handoff

Updated: September 10, 2026. USD pricing and Billing replace prepaid-credit UI; safe photo/video flow remains verified against private R2. Founder review of the working local flow is next.
Prior engineering checkpoint: `8c33fd1`; source consolidation: `56cb0ad`.
Read current `dev` / `main` Git refs and their CI runs for publication state.
Legal/status/budget cleanup is complete; the current founder task is below. This file is the current
checkpoint; historical command logs remain in Git, including the previous
[Slice 4 handoff at 25057bd](https://github.com/QK-Connoisseur/PDoki/blob/25057bd/HANDOFF.md).

## September 10 — USD pricing and billing UI

The launch tracker no longer includes the deferred prepaid-credit work. Website
prices and composer inputs use plain `$` / USD. Billing replaces the member
wallet: no stored balance, recharge, auto top-up or gift-credit redemption;
creator earnings remain in the creator dashboard. `/wallet` redirects to
`/billing` for existing bookmarks. Credit-funded offers were removed from the
cancelled game prototype. Checkout, subscriptions and tips remain previews;
this change does not implement or activate payment processing.

Validation: all 238 web tests, the web build and repository ESLint passed.
After the final Billing cleanup, its 8 focused tests and the build passed again.
Browser checks passed across 18 desktop/mobile views with synthetic accounts,
including all Billing sections, the legacy redirect and USD composer inputs.
All 13 tracker tabs have no remaining prepaid-brand references; expense totals,
recalculation and existing workbook formulas/features were checked.

September 10 publication checks used Node 24.19.0 and a fresh isolated
`pumdoki_publish_20260910` database: all 10 migrations applied; 425 API tests
passed with one existing opt-in test skipped; 24 contract tests, 238 web tests,
53 standard browser tests and both content browser tests passed. API, web and
admin builds, the content TypeScript check and repository lint passed. The
content browser checks used local storage; earlier private R2 verification is
recorded below. Existing development data was preserved.

The tracker now displays all 17 Deferred status/legend cells with light-red
backgrounds and dark-red text, including automatic formatting for future
Deferred selections. This formatting change preserves cell values, formulas,
cached results and the $1,296 recorded expense total.

## One next founder task

The [business definition](docs/product/initial-business-definition.md) has been
answered and reviewed. Step 1 is complete even though some details remain open.
The founder confirms **Kiban Digital Holdings LLC** is filed through Northwest
and awaiting Maryland approval. This September 8 update advances the earlier
order-received screenshot. The supplied sent email reports filing on September 8.
The formation purchase is recorded in the tracker. State approval, EIN, banking
and original filing documentation remain unverified. Keep the distinction
between filed and approved; prototype legal notices must not imply approved
formation or live operations.

The founder supplied the sent email and first CCBill Sales reply on September 9.
The [first-exchange record](docs/product/initial-ccbill-inquiry.md) now uses that
supplied inquiry text. Sales requests a URL, development/timeline, business and
price/service details. It requires a functioning site, permits password
protection, and lists US business/owner, bank and principal-ID requirements.
It does not answer Veso/services eligibility, fees/reserves, payouts/countries
or underwriting timing, or define the detailed review-site standard.

The founder cancelled the [review-site clarification](docs/product/ccbill-review-site-clarification.md).
Do not send it or require its URL field to continue. Build toward a functioning
website, using one functional slice that pairs code with its necessary founder
and provider work. The first milestone is a test creator uploading safe sample
media and publishing a persisted post that a test member can read in the
existing feed. Drafts stay private; server access checks and refresh/restart
persistence must work. Pair media-storage selection/setup and an approved spend
budget with this implementation. The local flow is implemented and tested;
R2 is now active, with $0 due at activation shown in the founder's screenshot.
The founder confirms creating `pumdoki-review-media` in the default jurisdiction.
Bucket-scoped credentials are saved in ignored `.env.r2.local` (mode 0600).
Actual cloud photo/video upload, private access, publication, restart persistence
and removal checks passed. Cloudflare's bucket overview independently shows
Public Access Disabled. The next founder action is reviewing this working local
upload/publish flow; no further storage signup is needed for this milestone.
No processor approval, contract or payment is reported; Maryland approval remains pending.

The founder chose DIY, drafts and suitable Fiverr specialists wherever practical,
with paid legal advice only for necessary issues and substantive review. The
[earlier counsel brief](docs/product/initial-counsel-inquiry.md) is parked as a
scope reference. Do not restart a broad counsel-first task or ask a lawyer to
reselect the entity without a concrete reason. Qualified review of applicable
adult-platform, records/consent, funds-flow and policy requirements still belongs
within the relevant feature work and before reliance or live sensitive use.
The founder now reports commissioning policy drafts; the tracker owns the
engagement and expense status. Draft delivery and approval remain pending.
The founder wants code and related business/provider decisions handled together;
PLAN.md §20 owns the latest work order.

Targeted review accompanies the relevant design/code slice before live
sensitive use; controlled implementation is not held for a blanket pre-code
review. Email is selected/integrated with hosted account flows when needed.
The P05 design below informed the implemented local milestone.

## P05 first local content flow — September 9 implementation

See [implementation and run instructions](docs/architecture/phase5-local-content-flow.md).
The API now persists private safe media and sealed drafts; a test creator can
publish into the real Home feed and a test member can view photos and play
videos. Removal blocks subsequent media delivery. Requests enforce current
authentication, creator ownership/status and post visibility; private object
keys never enter browser payloads. Upload/save retries are idempotent. Both
flags default off, production/remote activation is refused, and only verified
`.example` test accounts are accepted. This is partial Phase 5, not hosted
review-site, payment, moderation, identity or production completion.

Confirmed checks:

- All nine migrations applied to a fresh isolated database.
- API: 388 tests passed; one existing opt-in worker privilege test skipped.
- Web: 238 tests passed, including the shared contract adapter and real content UI.
- Content browser: photo and video paths both passed, including persisted
  drafts, member playback/access, and removal. Screenshots visually checked.
- API and web builds, scoped frontend TypeScript check and new-code review passed.
- Legacy browser suite: 52/52 passed. Traces identified HTTP 429 from shared
  parallel test traffic; only the Playwright request allowance changed from
  300 to 3000. Product limits and UI assertions remain unchanged.
- Contracts: 24 tests passed; admin build, repository lint/format and
  `git diff --check` passed.
- An actual API process stop/start preserved the published post, session and
  identical video bytes; the safe verification post was subsequently removed.
- Tracker records local completion and verified R2 safe-sample integration.
  Financial actuals were preserved.

These are local verification results from before publication. Publication of
source does not activate the content flags or deploy the application.

Existing local development data was preserved. It has pre-existing worker
schema drift, so tests use `pumdoki_content_final_20260909`. The new content
migration contains no unrelated drift repair. A dependency audit found 23
affected packages at unchanged baseline versions; none are in the new Sharp
dependency chain. Remediation is still pending and must be considered before
hosted exposure. No audit-fix upgrade or production deployment occurred.

R2 setup is complete for this safe-sample milestone. The founder created the
`pumdoki-local-review` Account API token with Object Read & Write scoped only to
`pumdoki-review-media`, then saved its S3 keys locally. Presence/validity, mode
0600 and Git exclusion were checked without displaying secrets. The recommended
30-day token lifetime and a billing alert have not been independently verified.

The S3 adapter sends only
sanitized bytes, uses conditional immutable writes and bounds private reads.
An additive tenth migration records LOCAL/R2 per asset and prevents rewriting
that location, preserving old local uploads. It was applied only to the isolated
review database. The current targeted content/configuration suites pass 86 tests;
API build and scoped lint pass. Actual R2 verification then passed:

- Sanitized PNG/MP4 uploads persisted R2 as their backend; cloud and app reads
  matched stored SHA-256 values. Browser payloads omitted private storage keys.
- Anonymous app reads returned 401; members could not read drafts (404).
  Unsigned S3 requests returned 400 without media; Cloudflare separately showed
  Public Access Disabled. No public endpoint or permission was enabled.
- Published member feed, full/range delivery and a real API process restart
  preserved both media types and the session. Removed posts returned 404 for
  owner/member reads, including ranges.
- Both browser tests passed against R2, including photo rendering and actual
  advancing video playback. Five generated objects across the verification
  runs were deleted and confirmed absent; existing objects were untouched.

The temporary harness first expected S3 403 (Cloudflare returned 400) and needed
an ESM test-runner import correction; neither required an application change.
Final browser evidence is in
`/private/tmp/pumdoki-r2-proof-666cfa89-1732-4c0c-8784-ee39a81683b4`.
Product post removal is a logical tombstone; the verification's explicit cloud
cleanup does not implement production retention/garbage collection. No public
hosting or live adult-media activation occurred. Next: founder review of Create
Post → save draft → publish in the local preview using safe samples.

## P05 Slice 1 — historical local design checkpoint

The [content model and access-rule design](docs/architecture/phase5-slice1-content-model-and-access-design.md)
starts from `3dfad3a` on `codex/phase5-content-access-design`. It defines stable
content/revision/asset/offer identities, immutable purchase manifests, separate
audience and lifecycle rules, recipient-scoped chat offers, explicit-content
suppression, private response boundaries, and upload/removal constraints.
It includes 28 synthetic acceptance cases for later implementation.

At the September 8 design checkpoint, scoped human technical review remained
pending and the design itself added no contracts, Prisma migrations, routes,
worker handlers, frontend behavior, uploads, payments or operations activation.
The September 9 implementation above supersedes its historical next-task prose.
P04 remains partial; P06 remains unimplemented. The next engineering work is
the functional content path above, with targeted review and provider decisions
alongside implementation. The historical design remains a design-only artifact;
it does not itself implement or activate anything.

Historical verification for that design/documentation-only change:

- Agent design review completed; its historical-revision and subscription/PPV
  findings were corrected and rechecked. This is not the pending human review.
- `./node_modules/.bin/prettier --check AGENTS.md CLAUDE.md HANDOFF.md PLAN.md README.md docs/product/initial-business-definition.md docs/architecture/phase5-slice1-content-model-and-access-design.md`
  passed; `git diff --check` passed.
- Read-only Python checks passed for local Markdown link targets, the JSON
  example, and the 28 unique ordered acceptance-case IDs. These validate the
  design artifact, not runtime authorization behavior.
- The tracker has 39 scoped value edits and 9 expected recalculated dependent
  values. Its two P05 definition tasks are `In Review`; phase maturity remains
  `Not Started / UI Prototype`. Formulas, tables, validations, conditional
  formatting, relationship targets and unrelated data were preserved. Affected
  views passed before/after visual review; the saved output's phase and delivery
  rows were independently read back.
- Application lint/unit/API/E2E/build suites were not run: no application,
  contract, schema, migration, dependency, or runtime configuration changed.
  No P05 integration or production-readiness result is claimed.

## Founder decisions preserved

- September 9: the founder deferred Veso payments beyond beta because of
  implementation complexity and the perceived high risk of being flagged
  during CCBill or Epoch review. This is the founder's risk assessment, not a
  reported processor rejection or prohibition. It supersedes the earlier
  Veso-at-launch requirement, including older references elsewhere in the repo.
- Veso recharge, prepaid balances/spending, promotional credits, transfers and
  Veso-funded purchases/tips are deferred, not beta gates or completed work.
  Retain the later concept at 1 Veso = USD 1 with separate append-only
  member-credit and creator-earnings ledgers if reconsidered. No future release
  date, processor acceptance or activation is promised.
- Store, subscriptions/paid content, tipping and real-time chat remain launch
  requirements. The beta payment model remains unresolved; removing Veso does
  not approve a replacement checkout or remove payment/earnings, refund,
  reconciliation and entitlement controls for any enabled paid flow.
  Continue the existing local content/R2 slice; this scope update adds no
  processor outreach, runtime changes, spending or deployment.
- Connect is creator discovery with online, price, language and service
  filters. Communication/order arrangement belongs in chat. Automated calendar,
  reservation and reminder workflows are not implied; actual paid orders still
  need agreed fulfillment/refund/dispute controls.
- The original Oasis/Drimy game is cancelled. Do not resume creatures, Orbs,
  evolution, inventory, leagues or randomized purchases. The name may be reused
  later for day/friend streaks and playful adult language learning, profanity
  and opt-in roasting. This later concept is unbuilt and does not gate launch.
- The founding-creator offer is now clarified as no profit on those sales
  while recovering their costs. This supersedes processing-fees-only wording.
  Fee basis, shared-cost allocation, duration, cohort size and a sustainable
  no-loss outcome remain unproven. Founder badge, proposed 500-creator programme
  and top-100/Plus ideas remain provisional.
- Two contacted creators may help recruit 50–100 candidates. These are prospects,
  not committed creators. A paid Discord recruiter/helper is proposed at
  USD 300–400 monthly; scope, hours and moderation capability remain unverified.
- Static Sakura Kiss/Midnight City, palette placement and avatar decorations
  are preserved. Motion/sound/richer gratification are later work; no background
  videos should be restored from superseded branches.
- The completed definition states a USD 1,800 monthly spending ceiling. Its
  relationship to the earlier USD 1,000–5,000 current cash and possible further
  USD 5,000 is not yet clear; do not convert it into cash already available or
  assumed runway. Whether helper costs are included, and whether they overlap
  the existing backup allowance, is unresolved. Budget totals remain unchanged
  until clarified. See [budget notes](docs/product/launch-budget.md).
- Creator/member launch countries, service delivery channels, order/refund
  rules, founder hours and urgent coverage remain open. “Ask roughly anything”
  and claims of being the only platform are not approved marketing promises.

## Recovered task and branch history

The September 6 reconciliation read **Find next project step**, **Explore
subtle animated backgrounds**, and **Improve notification bell**.

| Work               | Evidence and disposition                                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 3            | Published through d55f5f3; real auth and account-security Settings.                                                                                                                                                                                      |
| Phase 4 Slices 1–2 | Published; creator applications persist pending; review remains dormant and non-approving.                                                                                                                                                               |
| Phase 4 Slice 3    | Already merged by PR #15 as 24e1653. It is not awaiting publication.                                                                                                                                                                                     |
| Phase 4 Slice 4    | PR #17, implementation `317abda` / reviewed `25057bd`. Original final-head CI `33337682290` passed all three jobs. Merged/closed through `56cb0ad`; combined CI `34026349075` passed. Candidate remains synthetic/unmounted; Cloudflare is not selected. |
| Backgrounds        | PR #19 merged final static themes as `0f01961`. Intermediate videos/petals were deliberately retired after founder review. The final motion-retirement branch has the same tree as this baseline.                                                        |
| Notification bell  | Existing local All/Unread, read controls, activity icons and themed indicators included. Fixture-only; reading is temporary component state.                                                                                                             |
| Other old branches | UI/avatar changes are patch-equivalent to dev; pre-squash backup matches a published Phase 3 tree. Obsolete March top-level src code must not be merged back.                                                                                            |

The old task's mixed August 26 PLAN/HANDOFF/tracker edits were not present in the
September 6 working tree. Their documented direction (park operations; prioritize
concrete business/content work) is reconciled here with today's decisions.
Do not claim those missing working copies were recovered byte-for-byte.
Two independently tested hardware-key account logins are historical sanitized
prerequisite evidence only; no actual Access-application assertion/AMR or
operational activation was verified.

## Publication and verification checkpoint

Before consolidation, remote dev was `0f01961` and main was `88e587c`, with
dev 93 commits ahead and zero behind. The authorized consolidation `56cb0ad`
preserves PR #17's ancestry, the static-theme result and the notification work.
It was pushed to dev, GitHub marked PR #17 merged/closed, and all three jobs
passed in [combined CI run 34026349075](https://github.com/QK-Connoisseur/PDoki/actions/runs/34026349075).

This documentation/tracker follow-up records that verified application revision
and corrects two remaining service-order notification descriptions. It changes
no application code. The release target is matching dev/main tips containing
`56cb0ad` plus this checkpoint. Use `git log -1`,
`git ls-remote --heads origin dev main` and the branch CI runs for the current
tips and final publication evidence; the evidence hash above is intentionally
stable rather than pretending to identify a document's own future commit.
No new Slice 4 PR, founder merge decision or operations sprint is needed.

Local Node 24.19.0 checks for the combined code:

| Check                               | Result                                           |
| ----------------------------------- | ------------------------------------------------ |
| Web unit/component suite            | 219/219 passed                                   |
| Shared contracts                    | 24/24 passed                                     |
| API excluding DB integration/spikes | 273/273 passed; includes dormant Slice 4         |
| API/contracts/database build        | Passed                                           |
| Web and private-admin builds        | Passed                                           |
| Global lint / formatting            | Passed                                           |
| Tracker/budget                      | Passed; formulas, preservation and visual review |
| Fresh DB integration and Playwright | Passed in combined CI 34026349075                |

The initial socket-limited API attempt failed with sandbox `listen EPERM`;
the authorized rerun passed. No existing database was reset. Prior dev CI run
33809241413 passed all three jobs; it does not verify new changes by itself.
The preceding release published matching dev/main at `8c33fd1`, with
[main CI 34026601963](https://github.com/QK-Connoisseur/PDoki/actions/runs/34026601963) and
[dev CI 34026602009](https://github.com/QK-Connoisseur/PDoki/actions/runs/34026602009) passing.
The later business-answer updates are local documentation/tracker edits; they
do not change the verified application code. No source push in the inspected repository workflow deploys the site:
the only workflow is CI. No hosting/provider configuration changed.

## Legal UI and email timing

The legal hub is explicitly unapproved prototype content with no operational
intake. Invented business/recordkeeping/moderation/StopNCII/support claims are
removed. Dashboard identity/tax/bank status is “Not collected”; unavailable
support/payout/security controls are disabled. Wallet data is disclosed as
simulated. Terms/Privacy versions for new acceptances are
`prototype-2026-09-06`; old acceptance evidence and creator acknowledgements
are not rewritten. Independent victim-support resources remain available.

The cleanup is visible locally after reload and in subsequent web builds.
Before any public operating launch, qualified counsel must approve actual
versioned documents and the real mailbox/reporting/retention workflows must
exist and be tested. Replace placeholders in source, verify links and
acceptance versions in staging, then include the changes in the approved
website release. A Git merge is not that release. PLAN.md §20 records the
release procedure so it is not forgotten.

Choose transactional email at Step 6: after business/entity/domain, processor,
pilot/country/data-handling and budget decisions, before an external pilot
needs verification/reset mail. The API currently throws in production mode
because production mail is intentionally disabled; do not remove the guard or
run development mode as a workaround. Implement authenticated TLS delivery,
sender authentication, bounce/complaint ownership, safe failure/retry behavior,
and verify actual production-mode startup/delivery when that step is reached.

## Local development and remaining boundaries

Use Node 24.19.0 (`.nvmrc`) and 127.0.0.1 consistently on macOS or Windows.
The ignored root `.env` and apps/web/.env.local must agree on
`VITE_API_BASE_URL=http://127.0.0.1:3000/api/v1`; root WEB_ORIGIN is
`http://127.0.0.1:5173`. Never commit real environment files.

For a clean disposable development database: `npm run db:up`,
`npm run build:api`, `npm run db:deploy`, `npm run db:seed`. Start
`npm run dev:api` and `npm run dev:e2e:web` in separate terminals. Local inbox:
http://127.0.0.1:8025. Private shell: `npm run dev:admin` on 127.0.0.1:5174.
Use the reserved `.example` seed accounts recorded in packages/database/src/seed.ts.

Historical ordinary pumdoki_dev was reported to contain an early worker
migration draft. Its current state has not been repaired or revalidated here.
Do not reset or silently repair it; use a disposable database for final proof.
Docker Compose's PostgreSQL/Mailpit host bindings remain loopback-only.

Phase 2 remains partial: no deployed staging/restore/monitoring/shared throttle
or product-flow jobs. Phase 4 remains partial: no approved policies, operational
identity/approval/moderation/performer workflow. The first local safe-sample
content flow is implemented as recorded above; payment/Veso/messaging backends
remain absent. Veso is deferred beyond beta. The review router and Cloudflare
candidate remain
unmounted; no role promotion or identity-file collection is enabled; G1–G12
remain NOT EVALUATED. The September 9 correspondence update supersedes the
earlier external-status note: the LLC is filed and awaiting Maryland approval,
and the founder directed work toward the functioning review website before
returning to CCBill. Commercial terms remain unresolved. Formal
merchant onboarding, processor approval, EIN and banking remain unverified.
