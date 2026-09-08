# Session Handoff

Updated: September 8, 2026. LLC filed, awaiting Maryland approval; CCBill inquiry sent, awaiting reply.
Published engineering checkpoint: `8c33fd1`; source consolidation: `56cb0ad`.
Legal/status/budget cleanup is complete; the current founder task is below. This file is the current
checkpoint; historical command logs remain in Git, including the previous
[Slice 4 handoff at 25057bd](https://github.com/QK-Connoisseur/PDoki/blob/25057bd/HANDOFF.md).

## One next founder task

The [business definition](docs/product/initial-business-definition.md) has been
answered and reviewed. Step 1 is complete even though some details remain open.
The founder confirms **Kiban Digital Holdings LLC** is filed through Northwest
and awaiting Maryland approval. This September 8 update advances the earlier
order-received screenshot. State approval, EIN, banking, exact filing date and
amount charged are not verified. Keep the distinction between filed and approved;
prototype legal notices must not imply approved formation or live operations.

The founder confirms the CCBill inquiry was sent to its Sales team. Await the
response, then bring it back for review; do not assign sending it again.
The [prepared inquiry](docs/product/initial-ccbill-inquiry.md) is retained as a
reference, not an independently verified copy of the sent email. It covers PPV photos/videos/bundles in feed/chat,
subscriptions, tipping, Veso, and chat-arranged services including possible
adult calls. It asks about eligibility, complete costs/reserves, payouts,
countries and onboarding evidence. The entity/prototype status is explicit.
CCBill has been contacted; no reply, merchant approval, contract or payment is
reported. Maryland approval remains the separate pending formation milestone.

The founder chose DIY, drafts and suitable Fiverr specialists wherever practical,
with paid legal advice only for necessary issues and substantive review. The
[earlier counsel brief](docs/product/initial-counsel-inquiry.md) is parked as a
scope reference. Do not restart a broad counsel-first task or ask a lawyer to
reselect the entity without a concrete reason. Qualified review of applicable
adult-platform, records/consent, funds-flow and policy requirements still belongs
before reliance or dependent sensitive implementation. No lawyer is hired.
The founder needs one active task; PLAN.md §20 owns the waiting sequence.

Technical design review remains before payment/media/identity implementation;
independent integrated review/retest remains before real uploads and payments.
Email selection remains at Step 6. No software expansion is assigned now.

## Founder decisions preserved

- Veso stays (1 Veso = USD 1), with separate append-only member-credit and
  creator-earnings ledgers. Store, subscriptions/paid content, tipping and
  real-time chat remain launch requirements.
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
identity/approval/moderation/performer workflow. No content/media/payment/Veso/
messaging backend exists. The review router and Cloudflare candidate remain
unmounted; no role promotion or identity-file collection is enabled; G1–G12
remain NOT EVALUATED. Legal entity, merchant onboarding and other external
decisions have not started, as confirmed by the founder on September 6.
