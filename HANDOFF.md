# Session Handoff

Last updated: 2026-07-28 · Branch: `dev`

## Current phase

**Phase 3 slice 2 — email verification and password reset — is locally
complete and verified.**

Phase 3 as a whole is not complete:

1. Core auth backend — complete locally and published.
2. Email verification and password reset — complete locally; publication and
   GitHub CI verification remain pending.
3. Frontend auth integration — next; design is ready in
   `docs/architecture/phase3-slice3-frontend-auth-integration.md`.
4. Settings and explicit-content preference — not started.

Phase 2 remains **partially complete (local foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, a background-job
queue, and the full idempotency framework remain deferred.

## Publication status

- The confirmed `origin` is a public GitHub repository.
- The founder approved proceeding with the disclosed public publication on
  2026-07-28.
- Publication is currently blocked because the GitHub publishing workflow
  requires the `gh` CLI and an authenticated `gh auth login`; `gh` is not
  installed in this environment.
- The local unpushed history contains the temporary slice 2 execution-plan
  commit even though the file is removed from the current tree and durable
  designs now live in `docs/architecture/`. Rewriting/squashing that unpushed
  history would be destructive and still requires an explicit decision before
  publication.

Do not route around either publication prerequisite.

## Decisions locked

- Phase 3 proceeds on the local stack while Phase 2 stays labeled partially
  complete.
- First beta uses email/password only; Google OAuth is not beta scope.
- Unverified users may log in and browse. Future money and creator actions use
  `requireVerifiedEmail`.
- Registration retains the deliberate duplicate-email `409 CONFLICT`; password
  reset remains enumeration-neutral.
- No production email provider has been selected.
- Sessions use opaque 32-byte tokens, 30-day sliding expiry, and renewal at
  most once per 24 hours.
- Acceptance records remain append-only with restrictive deletion.
- Verification and reset tokens are transient credentials and cascade with the
  user; only hashes are stored.

## What is implemented

### Contracts, database, and mail

- Shared schemas for verification confirmation and password-reset
  request/confirmation.
- Error codes for invalid/expired tokens and unverified email.
- Migration `20260727104556_add_verification_tokens` with
  `VerificationTokenKind` and `VerificationToken`.
- Provider-neutral mailer with console, Nodemailer SMTP, and in-memory
  transports.
- Pure verification and reset templates using `WEB_ORIGIN`.
- Mailpit in Docker Compose on SMTP `1025` and inbox `8025`.
- Root `db:up` starts both PostgreSQL and Mailpit.

### API behavior

- Successful registration sends verification mail after database work.
  Transport/token failures are logged without converting a successful account
  creation into an error.
- Authenticated verification requests are throttled to five per hour per
  email/IP and return `202`; verified accounts receive no new token.
- Verification confirmation consumes hashed 24-hour tokens once and updates
  `emailVerifiedAt`.
- Password-reset requests always return the same `202`, including unknown and
  throttled addresses.
- Reset confirmation consumes a hashed one-hour token once, writes a new
  Argon2id hash, marks the address verified, and revokes every session.
- Reissue invalidates earlier unconsumed tokens of the same kind.
- `requireVerifiedEmail` returns `403 EMAIL_UNVERIFIED`.
- Malformed JSON now returns the standard `400 BAD_REQUEST` envelope instead of
  falling through to `500`.

### Project records and hygiene

- `PLAN.md`, `CLAUDE.md`, `README.md`, and this handoff reflect slices 1–2.
- Durable designs moved to `docs/architecture/`.
- Slice 3 frontend-auth design is ready.
- The master tracker marks email verification and password reset Done; its
  formula-driven summary is now 15/148 Done (10.1%).
- The Prettier baseline now handles the Windows checkout consistently and
  excludes local AI/tool scratch directories.
- The date-dependent Promotions test now freezes `Date` without faking UI
  timers.

## Final local verification — 2026-07-28

All commands ran from the repository root.

| Command / check                      | Result                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                       | ✅ exit 0                                                                                                                                                      |
| `npm run format:check`               | ✅ exit 0                                                                                                                                                      |
| `npm run test`                       | ✅ 11 files, 66/66 web tests                                                                                                                                   |
| `npm run test -w @pumdoki/contracts` | ✅ 1 file, 13/13 tests                                                                                                                                         |
| `npm run test:api`                   | ✅ 8 files, 60/60 tests; run outside the restricted filesystem sandbox required by Vitest/esbuild                                                              |
| `npm run build`                      | ✅ Vite 7.3.6 production build                                                                                                                                 |
| `npm run build:api`                  | ✅ contracts, Prisma generation, database, and API TypeScript builds                                                                                           |
| `npm run test:e2e`                   | ✅ 27/27 Chromium Playwright tests                                                                                                                             |
| Existing DB `npm run db:deploy`      | ✅ three migrations found; none pending                                                                                                                        |
| Isolated clean DB deploy twice       | ✅ all three migrations applied first run; none pending second run                                                                                             |
| Isolated clean DB seed twice         | ✅ four users both runs; temporary database removed                                                                                                            |
| Real Mailpit flow                    | ✅ register `201`, reset request `202`, both messages arrived, both links targeted `http://localhost:5173`, reset token returned `200` once and `400` on reuse |
| Tracker verification                 | ✅ key ranges inspected, formula-error scan returned zero matches, all five sheets rendered and visually checked                                               |
| `git diff --check`                   | Run again immediately before commit                                                                                                                            |

One parallel all-gate invocation caused the Connect component test to exceed
its five-second timeout while builds and Playwright were consuming the same
machine. No assertion failed; the required isolated `npm run test` rerun passed
66/66 in 9.64 seconds.

The web production bundle still reports the known large-chunk advisory:
785.28 kB minified and 190.64 kB gzip.

`npm audit` was not refreshed because permission to send the dependency
metadata to npm's external advisory endpoint was rejected. The last known
result remains the three moderate Prisma CLI/toolchain findings recorded on
2026-07-16; do not describe the current dependency set as audit-clean.

## Risks and remaining work

- Frontend Login/SignUp and `ProtectedRoute` are still simulated.
- `apiClient.js` currently reads error fields at the response root instead of
  the API's nested `error` envelope; slice 3 fixes this first.
- Frontend route declarations use lowercase role placeholders while the API
  returns canonical uppercase roles.
- Production email-provider selection, adult-business support, TLS,
  deliverability, DKIM, SPF, and DMARC remain open.
- Login and email throttling are instance-local until Redis/shared storage.
- Phase 2 cloud/operations work remains incomplete.
- Counsel must define acceptance-evidence retention and pseudonymization.
- Frontend code splitting remains advisable.
- Production `BrowserRouter` host rewrites remain required.

## Next exact task

1. Install GitHub CLI, run `gh auth login`, and verify `gh auth status`.
2. Decide whether to preserve or clean the 13 unpushed slice 2 commits before
   publishing the public `dev` history.
3. Push the committed `dev` branch and verify GitHub CI after the publication
   prerequisites are resolved.
4. Start Phase 3 slice 3 from
   `docs/architecture/phase3-slice3-frontend-auth-integration.md`, beginning
   with the nested API error envelope and persistent auth provider.
5. Work the overdue AWS/Sentry/Redis/email-provider decisions and the July 30
   LLC/counsel, CCBill, and identity-provider targets in parallel.
