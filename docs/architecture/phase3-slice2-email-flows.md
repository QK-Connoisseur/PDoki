# Phase 3 · Slice 2: Email Verification and Password Reset

Date: 2026-07-27 · Status: approved by founder · Branch: `dev`

## Context

Phase 3 slice 1 (core auth backend) is implemented, verified, and published to
`origin/dev` at `f2bd3af`. This slice builds the email flows that slice 1
deliberately deferred: address verification, password reset, and the mail
transport both depend on.

Slice 1's spec left two questions open for this slice, both now decided below:
the duplicate-registration enumeration trade-off (resolved by keeping the
`409`) and whether login requires a verified address (it does not).

Founder decisions locked 2026-07-27:

- **Soft verification gate.** Unverified users may log in and browse. Money and
  creator actions require a verified address. Nothing in this slice blocks
  login.
- **Password reset is fully neutral. Registration is not.** Slice 1's
  `409 CONFLICT` on a duplicate address is kept deliberately, and the signup
  form may say the address is taken. OnlyFans, LoyalFans, and Fansly all
  disclose this at signup; matching the category's norm is worth more than
  closing a leak that a neutral response would only half close, since auto-
  login makes the two cases distinguishable by `Set-Cookie` anyway. Reset
  stays neutral because it is the flow that actually gets scripted and
  neutrality there costs nothing the user notices.
- **No email provider is selected in this slice.** Local Mailpit plus an
  explicit non-delivery console sink only. The provider decision in PLAN's
  dependency register (due 2026-07-23, adult-business support unconfirmed)
  stays open and must not be pre-empted by this code.
- **This slice is backend-only.** No frontend changes; the pages that consume
  these endpoints are slice 3.

Phase 3 must not be described as complete until all four sub-projects satisfy
PLAN §7's exit criteria.

## Approach

Follow slice 1's shape: thin routes → `auth/service.ts` → response shaping,
with collaborators supplied through the existing `createApp` dependency
injection seam. The mailer becomes a second injected collaborator alongside
`database`, so tests substitute an in-memory implementation without touching
transport code.

Alternatives considered and rejected:

- **A background job queue for sending.** Rejected — Phase 2's queue is
  deferred, and sends here are low-volume and user-initiated. Sends happen
  inline, after the database transaction commits, and a send failure is logged
  without failing the user-facing request.
- **A provider SDK now.** Rejected — the choice of provider must follow the
  confirmation of which providers accept an adult-content platform, not
  precede it.

## Mail transport

New module `apps/api/src/mail/`:

| File           | Purpose                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mailer.ts`    | `Mailer.send(message)` plus `MailMessage` (`template`, `to`, `subject`, `text`, `html`) and the bounded best-effort send wrapper.                             |
| `smtp.ts`      | Nodemailer transport for plaintext loopback Mailpit only. Non-local and production selection fail closed; connection, greeting, and socket waits are bounded. |
| `console.ts`   | Explicit non-delivery sink. Logs only the static template identifier and never recipients, bodies, links, or tokens.                                          |
| `memory.ts`    | Test double. Captures sent messages for assertions.                                                                                                           |
| `templates.ts` | Pure functions returning HTML-escaped verification, reset, and creator-application-received messages. No I/O.                                                 |

`createApp` gains a `mailer` dependency; `server.ts` selects the transport from
env. The current templates are verification, password reset, and a
creator-application-received receipt added by Phase 4 Slice 1.

Message preparation and delivery happen after the relevant database work has
committed. Preparation or transport failures never turn that successful
domain operation into an error response. The wrapper bounds how long a request
waits, while the SMTP transport supplies its own I/O timeouts. A timeout means
delivery is unknown, not cancelled or guaranteed. Durable delivery intent and
bounded retry still require implementation of the separately approved
[Phase 2 transactional outbox/worker architecture](phase2-async-work-throttling-idempotency.md).
That architecture does not guarantee recipient delivery.

Local Mailpit is added to `docker-compose.yml` (SMTP `1025`, web UI `8025`) and
started by the existing `npm run db:up`. Compose publishes SMTP and the
unauthenticated Mailpit inbox on host IPv4 loopback (`127.0.0.1`) only; never
replace those bindings with unqualified host-port mappings.

New environment variables, validated in `env.ts` and documented in
`.env.example`:

| Variable         | Default                    | Notes                              |
| ---------------- | -------------------------- | ---------------------------------- |
| `MAIL_TRANSPORT` | `smtp`                     | Local Mailpit; `console` discards. |
| `SMTP_HOST`      | `localhost`                | Loopback Mailpit only.             |
| `SMTP_PORT`      | `1025`                     | Mailpit's SMTP port locally.       |
| `MAIL_FROM`      | `no-reply@pumdoki.example` | Reserved example domain only.      |

Email links are built from the existing `WEB_ORIGIN`; no additional URL
variable is introduced.

`createMailer` deliberately refuses to start in production. A future
production transport must add an approved provider, authenticated TLS,
credentials sourced from the deployment secret store, and operational
delivery controls before that guard can be removed.

**Compliance constraints on template copy.** Templates use reserved
`@pumdoki.example` addresses only. They must not claim that encryption,
moderation vendors, support response times, or compliance processes exist.
Copy is placeholder and is not counsel-approved.

## Schema changes (one migration)

One new model. It intentionally mirrors `Session`'s security shape.

```prisma
enum VerificationTokenKind {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}

model VerificationToken {
  id          String                @id @default(uuid()) @db.Uuid
  userId      String                @db.Uuid
  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind        VerificationTokenKind
  tokenHash   String                @unique
  createdAt   DateTime              @default(now())
  expiresAt   DateTime
  consumedAt  DateTime?
  requestedIp String?               @db.VarChar(45)

  @@index([userId, kind])
}
```

`onDelete: Cascade` is correct and deliberate here: these are transient
credentials, not legal evidence. `AcceptanceRecord`'s restrictive deletion rule
is unchanged and unaffected.

## Token lifecycle

- **Generation.** 32 random bytes, base64url, produced by the same helper
  shape as session tokens. Only the SHA-256 hash is persisted. The raw token
  exists only in the sent email.
- **Lifetimes.** Email verification: 24 hours. Password reset: 1 hour.
- **Single use.** Consumption sets `consumedAt` inside the same transaction
  that applies the token's effect. A consumed token is never valid again.
- **Reissue invalidates.** Issuing a token of a given kind marks every prior
  unconsumed token of that kind for that user as consumed, so at most one
  token per kind is live.
- **Lookup is by hash**, never by user; an expired, consumed, or unknown hash
  is treated identically at lookup.

Consuming a **verification** token sets `User.emailVerifiedAt` and leaves
sessions untouched.

Consuming a **reset** token, in one transaction:

1. writes the new argon2id password hash,
2. revokes **every** session for that user (password change logs out
   everywhere, including the requesting client),
3. sets `emailVerifiedAt` if it is null — mailbox possession has just been
   proven,
4. marks the token consumed.

No session is created; the user logs in again with the new password.

## Endpoints

All under `/api/v1`.

| Endpoint                            | Behavior                                                                                                                                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/verify-email/request`   | `requireAuth`. Issues a token and sends the verification mail. Always `202` — including when the address is already verified, in which case no token is issued and no mail is sent. Throttled.                        |
| `POST /auth/verify-email/confirm`   | `{ token }`. Valid → `200` with the public user (now `emailVerified: true`). Unknown or consumed → `400 INVALID_TOKEN`. Expired → `400 TOKEN_EXPIRED`. Does not require authentication.                               |
| `POST /auth/password-reset/request` | `{ email }`. **Always `202`**, identical body and timing posture whether or not the address exists. A real account receives the reset mail; an unknown address receives nothing. Throttled per normalized email + IP. |
| `POST /auth/password-reset/confirm` | `{ token, password }`. Valid → `200`, sessions revoked, no cookie set. Invalid/expired → same codes as verification confirm.                                                                                          |

Distinguishing `TOKEN_EXPIRED` from `INVALID_TOKEN` leaks nothing: the token is
an unguessable secret already in the holder's possession, and the distinction
lets slice 3 offer a "resend" path rather than a dead end.

### `POST /auth/register` — one addition, no behavior change

Register keeps slice 1's contract exactly: success is `201` with a session
cookie, and a duplicate address is `409 CONFLICT`. Slice 1's `409` test stands
unchanged, and slice 3's signup form may tell the user the address is taken.

The only addition: a successful registration now also sends the verification
mail. A send failure is logged and does not fail the registration.

The accepted trade-off is that the signup form confirms whether an address has
a Pumdoki account. This matches the category norm (OnlyFans, LoyalFans,
Fansly) and is recorded here as a deliberate decision rather than an oversight,
so that it is not silently re-litigated in a later slice.

## Verification gate

`requireVerifiedEmail` middleware layers on `requireAuth` and returns
`403 EMAIL_UNVERIFIED` when `emailVerifiedAt` is null. It is implemented and
tested this slice against a test-only route, following the `requireRole`
precedent, and applied to real money and creator endpoints when those exist in
Phase 5 and later. No currently shipping endpoint uses it.

`GET /me` already exposes `emailVerified`, which is what slice 3's persistent
"verify your email" banner will read.

## Throttling

The bounded in-memory key store behind `loginAttempts.ts` is generalized into a
reusable limiter and applied to both request endpoints: **5 requests per hour**
per normalized email + IP.

The two endpoints respond to exhaustion differently, and deliberately so:

- `verify-email/request` is authenticated, so there is nothing to leak:
  exhaustion returns `429 RATE_LIMITED`.
- `password-reset/request` returns the neutral `202` even when limited, and
  simply sends no mail. A `429` here would reveal through the envelope which
  addresses are worth attacking.

This remains instance-local until the approved shared-throttling architecture
is implemented, as documented for login throttling in slice 1. Provider and
implementation selection remain deferred.

## Contracts changes (`packages/contracts`)

- Request/response schemas for the four new endpoints.
- Error-code enum gains `INVALID_TOKEN`, `TOKEN_EXPIRED`, `EMAIL_UNVERIFIED`.
- Password rules for reset reuse the existing registration password schema, so
  the two paths cannot drift.

## Testing

DB-backed Supertest suites against `createApp`, wired to real Prisma and the
in-memory mailer. Required coverage:

- **Mailer:** the templates render the correct link built from `WEB_ORIGIN`;
  the memory mailer captures recipient and subject; a transport failure is
  logged and does **not** fail the user-facing request.
- **Token lifecycle:** single use (second confirm → `INVALID_TOKEN`); expiry
  (→ `TOKEN_EXPIRED`); reissue invalidates the previous unconsumed token of
  that kind; a token of the wrong kind cannot be redeemed at the other
  endpoint; unknown hash → `INVALID_TOKEN`.
- **Verification:** confirm sets `emailVerifiedAt` and `/me` reports
  `emailVerified: true`; requesting while already verified returns `202` and
  sends nothing.
- **Password reset:** unknown email returns the identical `202` and sends
  nothing; successful reset revokes all sessions (a previously valid cookie
  → `401` on `/me`); the new password logs in and the old one does not; reset
  sets `emailVerifiedAt` when it was null.
- **Register:** a successful registration sends exactly one verification mail;
  a mailer failure is logged and still returns `201` with a session. Slice 1's
  duplicate-email `409` behavior is re-asserted as unchanged.
- **Gate:** `requireVerifiedEmail` → `403 EMAIL_UNVERIFIED` for an unverified
  user, passes for a verified one.
- **Throttle:** the sixth request within the window is limited, and password
  reset's limited response is still shaped `202`.

## Out of scope

Frontend pages and banners (slice 3), changing an email address from Settings
(slice 4), send retries or a job queue, provider selection and production
deliverability (DKIM/SPF/DMARC), Redis-backed shared throttling, and
localization of mail copy.

## Exit criteria for this slice

- All four endpoints and the register change behave per this spec.
- The migration applies cleanly to a fresh database and is repeatable.
- `npm run lint`, `npm run build:api`, and `npm run test:api` pass locally and
  in CI.
- Mailpit receives real mail from a local `npm run dev:api` run, visually
  confirmed at `http://localhost:8025`.
- PLAN.md, CLAUDE.md, and HANDOFF.md updated with the exact commands run and
  their real results.
