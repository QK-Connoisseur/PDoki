# Session Handoff

Last updated: 2026-07-16 · Branch: `dev`

## Current phase

**Phase 3 slice 1 — core authentication backend — is locally complete and
verified.** Phase 3 as a whole is not complete: email verification/password
reset, frontend auth integration, and Settings remain slices 2–4.

Phase 2 remains **partially complete (local foundation)**. Staging/RDS,
backups and a restore drill, Sentry/equivalent monitoring, a background-job
queue, and the full idempotency framework remain deferred.

Local commits created this session:

- `04e4fb1` — corrected and approved Phase 3 slice 1 design. Acceptance
  evidence now uses restrictive deletion rather than a contradictory cascade.
- `68a38cf` — Phase 3 slice 1 implementation, migration, contracts, tests,
  Argon2 dependency, and non-breaking npm audit updates.
- Current `HEAD` — reconciled `PLAN.md`, `CLAUDE.md`, this handoff, and the
  visually verified master tracker.

The commits are not on `origin/dev`. The remote is a confirmed public GitHub
repository, so the push was stopped pending fresh, explicit approval after
that disclosure. Do not route around this approval requirement.

## Decisions locked

- Phase 3 proceeds on the local stack while Phase 2 stays labeled partially
  complete.
- First beta uses email/password only; Google OAuth is not beta scope.
- Phase 3 has four separately verified slices:
  1. Core auth backend — complete locally.
  2. Email verification and password reset — next.
  3. Frontend auth integration.
  4. Settings and explicit-content preference.
- Sessions use opaque 32-byte tokens, 30-day sliding expiry, and renewal at
  most once per 24 hours.
- Acceptance records are append-only and use restrictive deletion. Future
  account deletion must deactivate/pseudonymize according to a
  counsel-approved retention schedule; it must not cascade-delete evidence.

## What was built

### Database and contracts

- Migration `20260716211419_add_core_auth`:
  - `User.emailVerifiedAt`.
  - `Session.ipAddress`, `userAgent`, and `lastExtendedAt`.
  - `AcceptanceKind` enum and `AcceptanceRecord` with restrictive FK delete.
- Registration contract now requires literal `ageAttested: true`, Terms and
  Privacy versions, normalized email, and trimmed display name.
- Added `AuthUserSchema` and `AuthResponseSchema`.
- Added Argon2id (`argon2@0.44.0`). Existing dev-only scrypt seed hashes are
  accepted once and upgraded to Argon2id after successful login.

### API

- `POST /api/v1/auth/register` — user, three acceptance records, and session
  created atomically; duplicate email returns `409 CONFLICT`.
- `POST /api/v1/auth/login` — generic credential failure, dummy-hash timing
  path, suspension/ban enforcement, scrypt upgrade, and session creation.
- `POST /api/v1/auth/logout` — revokes current session and clears cookie.
- `POST /api/v1/auth/logout-all` — revokes all active sessions for the user.
- `GET /api/v1/me` — authenticated public-user response and session renewal.
- `requireAuth` rejects missing, garbage, expired, revoked, suspended, and
  banned sessions at request time.
- `requireRole` enforces API roles.
- Login failures are limited per normalized-email + IP: ten failures in 15
  minutes, with a bounded in-memory key store. This remains instance-local
  until the deferred Redis decision.
- Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` outside development,
  and refreshed when the database sliding expiry is extended.

### Project records

- `PLAN.md` now records the four Phase 3 slices, current status, acceptance
  retention rule, updated immediate actions, and an owner/date dependency
  register.
- `CLAUDE.md` now documents the auth architecture and DB-backed test
  prerequisite.
- `docs/product/Pumdoki_MasterTracker_V4.xlsx` now reflects the Phase 2 local
  foundation and Phase 3 backend slice without overstating frontend/email
  completion. All five sheets were rendered; the old Overview clipping was
  repaired; no formula errors were found.

## Final verification — 2026-07-16

All commands ran from the repository root after the final dependency updates.

| Command / check                               | Result                                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                                | ✅ exit 0 — 0 errors, 0 warnings                                                                                                                                         |
| `npm run test`                                | ✅ web 12/12 tests, 3 files                                                                                                                                              |
| `npm run test -w @pumdoki/contracts`          | ✅ 9/9 tests, 1 file                                                                                                                                                     |
| `npm run test:api`                            | ✅ 33/33 tests, 5 files; includes 18 DB-backed core-auth tests                                                                                                           |
| `npm run build`                               | ✅ Vite 7.3.6 production build; known 768.76 kB chunk advisory (185.85 kB gzip)                                                                                          |
| `npm run build:api`                           | ✅ contracts, Prisma generation, database, and API TypeScript builds                                                                                                     |
| `npm run test:e2e`                            | ✅ 27/27 Chromium Playwright tests                                                                                                                                       |
| Fresh temporary DB: `npm run db:deploy` twice | ✅ both migrations applied on first run; second reported no pending migrations                                                                                           |
| Fresh temporary DB: `npm run db:seed` twice   | ✅ idempotent; four users both runs; temporary DB dropped afterward                                                                                                      |
| Tracker inspect/render                        | ✅ key ranges correct, formula scan 0 errors, all five sheets visually verified                                                                                          |
| `git diff --check`                            | ✅ no whitespace errors                                                                                                                                                  |
| `npm audit fix`                               | ✅ removed the high-severity Vite/picomatch and other fixable tooling findings without a forced breaking change                                                          |
| Final `npm audit`                             | ⚠️ exit 1 — three moderate findings remain in `@hono/node-server` through the Prisma CLI toolchain; npm's offered fix force-downgrades Prisma 7 to 6 and was not applied |

The first Vitest invocations inside the restricted filesystem sandbox could
not resolve esbuild configs. The required suites were rerun outside that
sandbox and passed; this was an execution-environment limitation, not a
product failure.

## Risks and remaining work

- **Public Git push requires explicit approval.** Local commits are ahead of
  `origin/dev`; no push occurred.
- **Phase 3 is not complete.** Frontend Login/SignUp and `ProtectedRoute` are
  still simulated; email verification, password reset, Settings, and explicit
  preference are not implemented.
- **Phase 2 is not complete.** AWS staging/RDS, backups/restore, monitoring,
  queueing, and idempotency remain.
- **Retention still needs counsel.** The schema prevents accidental deletion,
  but the lawful retention/pseudonymization schedule is a founder/legal task.
- **Login throttling is instance-local.** Multi-instance enforcement waits on
  Redis or an equivalent shared store.
- **Prisma CLI advisory remains.** It does not affect the running Express API,
  but should be rechecked when Prisma ships a non-breaking patched toolchain.
- **Frontend bundle remains large.** Code-splitting is still advisable.
- **Production BrowserRouter rewrite remains required** at the future host.
- `npm run test:api` now requires Docker PostgreSQL with committed migrations
  applied.

## Next exact task

1. Obtain explicit approval to publish the local commits to the confirmed
   public `origin/dev`, then push and verify GitHub CI.
2. Start Phase 3 slice 2 with a spec: Mailpit, provider-neutral mailer,
   verification-token lifecycle, password-reset-token lifecycle, expiry,
   single use, revocation, enumeration posture, and tests.
3. Work the dated dependency register in `PLAN.md` in parallel, beginning with
   email-provider fit, AWS/Sentry/Redis decisions, LLC counsel, and CCBill.
