# Session Handoff

Updated: September 6, 2026. Reviewed source consolidation: `56cb0ad`.
Legal/status/budget cleanup is complete; the current founder task is below. This file is the current
checkpoint; historical command logs remain in Git, including the previous
[Slice 4 handoff at 25057bd](https://github.com/QK-Connoisseur/PDoki/blob/25057bd/HANDOFF.md).

## One next founder task

Fill [the one-page business definition](docs/product/initial-business-definition.md).
Short answers and “not sure” are sufficient. Do not assign another founder task
until those answers have been reviewed. The founder works solo, has limited
time, and explicitly needs sequential guidance. The full waiting sequence is
in PLAN.md §20; it is not a to-do list for today.

The next human involvement is a scoped adult-platform counsel consultation
after that definition, with a quote and spending cap first. Technical design
review comes before payment/media/identity implementation, and an independent
integrated review/retest comes before real uploads and payments. Fiverr is an
acceptable sourcing channel if relevant qualifications and deliverables are
verified. No reviewer, provider, purchase or live deployment is selected here.

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
- Founder badge and processing-fees-only creator pricing are the intended
  acquisition direction, potentially for about 500 creators. Cohort size,
  duration, costs passed through, ordinary fees, reserves and funding remain
  provisional. Free Plus for a proposed top 100/leaderboard and Plus/cosmetic
  benefits are unpriced ideas, not published promises or delivered features.
- Recruitment may use the founder's E-Pal contact and Discord communities;
  actual creator commitments have not yet been evidenced.
- Static Sakura Kiss/Midnight City, palette placement and avatar decorations
  are preserved. Motion/sound/richer gratification are later work; no background
  videos should be restored from superseded branches.
- Cash available now is USD 1,000–5,000, with a possible further USD 5,000 over
  later months. Future funds are not committed. See the current tracker budget
  and [budget notes](docs/product/launch-budget.md); estimates are not quotes or
  spending permission. Founder living expenses are outside the project budget.

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
Final dev/main branch publication is reported in this task's final response.
The CI workflow runs on both branches; inspect those runs for the latest checkpoint. No source push in the inspected repository workflow deploys the site:
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
