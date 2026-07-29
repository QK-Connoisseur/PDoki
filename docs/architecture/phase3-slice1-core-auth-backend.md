# Phase 3 · Slice 1: Core Auth Backend

Date: 2026-07-07 · Status: approved by founder · Branch: `dev`

## Context

Phase 2's local backend foundation is complete and verified (see HANDOFF.md,
2026-07-06). Phase 2's remaining items (staging, RDS, backups, Sentry, job
queue, idempotency) are founder-blocked on AWS/Sentry/Redis decisions, so
Phase 3 proceeds on the local stack.

Founder decisions locked 2026-07-07:

- **Phase 3 starts now**; Phase 2 stays labeled partially complete.
- **Email/password only** for first beta (PLAN §3.2 gate closed: no Google
  OAuth in beta; the account model must not preclude adding providers later).
- **Phase 3 is decomposed into four sub-projects**, each with its own
  spec → plan → implementation cycle:
  1. Core auth backend (this spec).
  2. Email flows: verification + password reset (Mailpit + mailer abstraction).
  3. Frontend auth integration: real Login/SignUp, `ProtectedRoute`,
     session persistence.
  4. Settings: profile/email/password/active sessions/notifications/theme/
     explicit-content preference/billing placeholder/data export/deletion.
- **Session policy: 30-day sliding expiry**, extension throttled to once/day.
- **This slice is backend-only.** No frontend changes.

Phase 3 must not be described as complete until all four sub-projects satisfy
PLAN §7's exit criteria.

## Approach

Thin routes + an auth service module. Routes validate (existing `validate()`
middleware) → call `auth/service.ts` → shape the response. The service
receives the Prisma client through the existing `createApp` dependency
injection seam. Alternatives considered: inline route logic (rejected —
slices 2–4 reuse this logic) and a full repository abstraction (rejected —
YAGNI; revisit only if DB-backed test speed becomes a problem).

## Endpoints

All under `/api/v1`:

| Endpoint                | Behavior                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register`   | Validate extended register contract; create user with argon2id hash; write age-attestation + Terms + Privacy acceptance records **in the same transaction**; create session; set cookie; `201` with public user. Duplicate email → `409 CONFLICT` (accepted enumeration trade-off for MVP; revisit in slice 2 when email sending exists). |
| `POST /auth/login`      | Verify credentials; `SUSPENDED`/`BANNED` → `403 FORBIDDEN`; create session; set cookie; return public user. Any credential failure → generic `401 UNAUTHORIZED` (same for unknown email vs wrong password), with a dummy-hash verify to level timing.                                                                                     |
| `POST /auth/logout`     | Revoke current session (`revokedAt`); clear cookie.                                                                                                                                                                                                                                                                                       |
| `POST /auth/logout-all` | Revoke all of the user's sessions (PLAN's revoke-all; the seam admin-enforced suspension reuses).                                                                                                                                                                                                                                         |
| `GET /me`               | Return the authenticated user. Slice 3's session-persistence endpoint.                                                                                                                                                                                                                                                                    |

## Schema changes (one migration)

- `User`: add `emailVerifiedAt DateTime?`. Groundwork for slice 2 — login
  does **not** require verification yet.
- New model `AcceptanceRecord` (append-only; rows are never updated or
  deleted):
  - `id` (uuid), `userId` (FK, restrictive delete), `kind` enum
    (`TERMS | PRIVACY | AGE_ATTESTATION`), `version String?` (null for age
    attestation), `acceptedAt DateTime`, `ipAddress String`.
  - Satisfies PLAN §3.2 "accepted-policy version records" and
    "age-attestation records". Future policy re-acceptance appends new rows.
  - A user row cannot be hard-deleted while acceptance evidence exists.
    The later account-deletion workflow will deactivate the account and
    pseudonymize user-facing/profile data according to a counsel-approved
    retention schedule; it must not silently cascade-delete legal evidence.
- `Session`: add `ipAddress String?`, `userAgent String?`,
  `lastExtendedAt DateTime @default(now())`. Groundwork for the slice-4
  active-sessions page; `lastExtendedAt` throttles sliding renewal.

## Session mechanics

- Opaque token: 32 random bytes, base64url. Sent only as an `HttpOnly`
  cookie: name `pumdoki_session`, `SameSite=Lax`, `Secure` outside
  development, `Path=/`.
- Only the token's SHA-256 hash is stored (existing `Session.tokenHash`).
- 30-day sliding expiry: an authenticated request extends `expiresAt` to
  now + 30 days, at most once per 24 h (checked against `lastExtendedAt`).
- CSRF posture: `SameSite=Lax` + the existing strict CORS `WEB_ORIGIN`
  allowlist. Revisit if cross-site embedding ever becomes a requirement.

## Middleware

- `requireAuth`: read cookie → look up unexpired, unrevoked session → load
  user → reject `SUSPENDED`/`BANNED` **at request time** (this is how
  admin-enforced suspension terminates live sessions) → attach
  `req.auth = { user, session }` using the same getter-only-safe property
  technique as `req.validated`. Failures → `401 UNAUTHORIZED` envelope.
- `requireRole(...roles)`: role gate layered on `requireAuth`;
  wrong role → `403 FORBIDDEN`.
- Login brute-force throttle: per-email+IP limiter on `/auth/login` —
  10 failed attempts per 15-minute window, `429 RATE_LIMITED` envelope
  thereafter; successful login resets the counter. In-memory like the
  existing global limiter. Documented limitation: instance-local until the
  deferred Redis decision (Phase 2 remainder).

## Passwords

- argon2id via the `argon2` npm package for all new hashes.
- Seed users keep dev-only scrypt hashes; verification dispatches on hash
  prefix, and a successful scrypt login transparently rehashes to argon2id.
  The scrypt path is never used for new registrations.

## Contracts changes (`packages/contracts`)

- `RegisterRequestSchema` gains `ageAttested: z.literal(true)`,
  `acceptedTermsVersion: z.string()`, `acceptedPrivacyVersion: z.string()`.
- New `AuthUserSchema`: public user + `emailVerified: z.boolean()`.
- Error-code enum gains `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`.

## Testing

`test:api` becomes DB-backed for the auth suites: Supertest against
`createApp` wired to real Prisma on local/CI Postgres (the CI `API build &
test` job already provisions Postgres 17 and deploys migrations). Tests clean
up rows they create. Existing stubbed suites are unchanged. Local
prerequisite (`npm run db:up` before `npm run test:api`) gets documented in
HANDOFF and CLAUDE.md.

Required coverage:

- Register: happy path (user + session + cookie + 3 acceptance records with
  IP), validation failures, duplicate email → 409, `ageAttested` must be
  literal `true`, and hard deletion is restricted while acceptance evidence
  exists.
- Login: success, wrong password → 401, unknown email → 401 (same envelope),
  suspended → 403, banned → 403, scrypt seed user login succeeds and is
  rehashed to argon2id.
- Cookie: HttpOnly/SameSite/Path flags; `Secure` present outside development.
- Sliding renewal: request extends `expiresAt` when `lastExtendedAt` > 24 h
  old; does not extend twice within 24 h.
- Logout revokes the session (subsequent `GET /me` → 401); logout-all
  revokes every session.
- `requireAuth`: missing cookie, garbage token, expired session, revoked
  session → 401; suspended-mid-session user → 403.
- `requireRole`: member hitting a moderator-gated test route → 403;
  correct role passes.
- Brute-force throttle triggers on repeated login failures.

## Out of scope (deferred to later slices)

Email verification enforcement, password reset, any frontend change,
settings endpoints, OAuth provider linkage, Redis-backed rate limiting,
admin suspension endpoints (only the enforcement seam is built here).

## Exit criteria for this slice

- All endpoints implemented and behaving per this spec.
- Migration applies cleanly to a fresh database and is repeatable.
- `npm run lint`, `npm run build:api`, and `npm run test:api` (with the new
  DB-backed suites) pass locally and in CI.
- HANDOFF.md updated with exact commands run and results.
