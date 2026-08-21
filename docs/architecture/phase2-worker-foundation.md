# Phase 2 durable worker foundation

Date: 2026-08-20 · Status: implemented and verified; draft PR #13 open against dev

## Authority and scope

The founder approved local implementation and verification of the durable
Phase 2 worker foundation using the provisional application-owned PostgreSQL
pattern. This slice starts from `dev` merge commit `6a04b0c` on local branch
`codex/phase2-worker-foundation`.

On August 20, the founder separately approved staging the reviewed working
tree, creating its feature-branch commit, and pushing
`codex/phase2-worker-foundation`. This authority does not include opening or
merging a pull request, staging or production deployment, live role or secret
provisioning, Redis, a provider or vendor, email/token delivery, payment or
Veso behavior, or private-operations activation. The founder subsequently
authorized opening a draft PR against `dev`; PR #13 is now open, while merge
and every other boundary listed here remain withheld.

## Outcome

The local foundation adds:

- a production-shaped Prisma migration for durable job state and one fixed,
  non-secret `PHASE2_CANARY_V1` intent/effect;
- an allowlisted `job_queue` SQL interface with atomic enqueue, bounded
  `SKIP LOCKED` claims, database-time leases, token fencing, bounded retry,
  terminal states, backlog ceilings, and aggregate-only telemetry;
- a separate worker process under `apps/api/src/worker`, with an explicit
  `WORKER_DATABASE_URL`, bounded concurrency, lease renewal, strict payload
  validation, deadline handling, fail-stop database transitions, and bounded
  graceful shutdown; and
- a local-only CLI that submits the non-secret canary through the same Prisma
  transaction and idempotency boundary used by tests.

No public API route enqueues work. No current email, creator receipt, payment,
Veso, identity, creator-review, or other product effect has moved to the
worker.

## Persistence and transaction boundary

`DurableJob` records the job kind, versioned bounded payload, operation-scoped
deduplication-key hash, state, availability, attempt policy, opaque lease,
request correlation, replay reference, allowlisted failure category, and
lifecycle timestamps. `WorkerCanaryIntent`, `WorkerCanaryJob`, and
`WorkerCanaryEffect` separate accepted business intent, its durable job, and
the idempotent domain effect.

The canary submit path:

1. validates a bounded opaque idempotency key and canonical request digest;
2. hashes the key with the fixed `pumdoki:phase2-canary:v1` operation scope;
3. serializes same-key races with a transaction-scoped advisory lock;
4. returns the original stable intent/job for the same hash and digest;
5. rejects the same hash with a changed digest; and
6. creates the intent, durable job, and canary link in one Prisma transaction.

Only the operation-scoped key hash is persisted. Raw idempotency keys and
payload secrets are not stored or logged. A failed enqueue or caller rollback
leaves neither intent nor job.

The migration models `CANCELED`, `DISCARDED`, and replay references so future
approved slices do not require incompatible core state changes. It does not
add operator replay/cancel routines, routes, or authorization; those remain
separately gated.

## Database interface and lease invariants

Runtime mutation is exposed only through `SECURITY DEFINER` routines in the
`job_queue` schema. Every routine pins `search_path` to `pg_catalog`, fully
qualifies application relations, and revokes `PUBLIC` execution. The
migration intentionally does not guess deployment role names or grant live
credentials.

The fixed interface contains:

- `enqueue_phase2_canary`;
- `claim_one`;
- `renew_job`;
- `release_unstarted_job`;
- `complete_job`;
- `fail_job`;
- `record_phase2_canary_effect`; and
- `queue_stats`.

Claims use a 30-second lease and a caller-generated opaque UUID token. Renew,
safe release, completion, failure, and effect application all lock the current
row first, then evaluate fresh database time and require the current unexpired
token. A stale attempt cannot mutate a reclaimed attempt even if it began a
query before lease expiry and waited on a row lock.

The worker may release a claim only when shutdown intercepts it before handler
execution; that release decrements the reservation so it does not consume the
delivery-attempt budget. Once handler work begins, shutdown never marks the job
available early. Uncertain work remains leased and is recovered only after
expiry.

The canary has a kind-owned three-attempt policy. Retryable failures receive
bounded exponential delay with ±25% jitter. Invalid payloads and permanent
handler failures become `DEAD` immediately. Expired final attempts become
`DEAD` in bounded indexed batches. If the idempotent canary effect exists,
failure, completion, replay, and final-expiry reconciliation consistently use
the intent-level effect and converge on `SUCCEEDED` without duplicating it.

Active backlog is capped at 1,000 jobs globally and 100 canary jobs under a
transaction-scoped advisory lock. A capacity failure aborts the producer
transaction instead of dropping older work.

The current one-kind foundation makes the 100-canary ceiling the effective
limit. A concurrent 100th/101st submission regression proves exactly one
transaction succeeds at the boundary and the rejected transaction leaves no
orphan intent or job. The 1,000-job ceiling is retained as a future cross-kind
defense and is not independently reachable while the canary is the only
allowlisted kind.

## Least-privilege boundary

The migration owns objects and functions but provisions no runtime
principals. The opt-in local privilege proof creates a disposable PostgreSQL
database and three directly authenticated, non-superuser `NOINHERIT` roles:

- a migration owner applies the current migration artifact and is then made
  `NOLOGIN`;
- an API role receives only the narrow intent columns, stable-replay linkage,
  schema usage, and canary enqueue routine; and
- a worker role receives only `job_queue` usage and the worker/telemetry
  routines, with no direct table access.

The proof invokes the actual Prisma `submitPhase2Canary` path under the API
role, exercises every worker routine under the worker role, denies cross-role
functions, table CRUD, DDL, temporary tables, role assumption, and
session-authorization escalation, then force-cleans and audits all generated
resources. The normal local `.env.example` intentionally reuses the Compose
owner credential for development convenience; real restricted LOGIN
credentials and secret provisioning remain a deployment gate.

## Worker lifecycle

The worker is a separate compiled entry point rather than part of the HTTP API
process. It requires `WORKER_DATABASE_URL` explicitly and never falls back to
`DATABASE_URL`. Supported local commands are:

```bash
npm run dev:worker
npm run enqueue:worker-canary -- --idempotency-key local-safe-canary
npm run start:worker
```

The local canary CLI runs only when `NODE_ENV` is exactly `development` or
`test`. It accepts only bounded safe identifiers, exposes no arbitrary job
kind/payload/retry policy, and emits only safe intent/job/request identifiers.

The runtime defaults to concurrency 2, a one-second jittered poll, a ten-second
token-matched heartbeat, and a twenty-second handler deadline beneath the
thirty-second lease. PostgreSQL statement and client-query timeouts bound a
stalled database call beneath that handler deadline. Fixed PostgreSQL startup
options override ambient `PGOPTIONS`, pin `READ COMMITTED`, and the startup
probe fails closed unless that isolation plus the required routines and grants
are effective. This preserves the fresh-snapshot final-expiry reconciliation
contract. The worker stops accepting claims before drain. A deadline always
uses the fenced timeout transition even if a handler ignores abort; an already
committed idempotent effect is reconciled by PostgreSQL rather than directly
acknowledged. Once the deadline wins, a late handler result cannot complete the
job and a late rejection is contained without raw error telemetry. The fixed
canary is the only current handler and its database effect call is also bounded.
Lost renewal prevents further domain I/O or acknowledgement.

A failed renewal, completion, or failure transition stops new claims, marks
the process degraded, triggers the same bounded drain/pool-close path exactly
once, and terminates nonzero. Raw database errors are not retained or logged.
First `SIGINT`/`SIGTERM` drains bounded active work and closes the pool; the
grace deadline or a second signal forces a nonzero exit and leaves uncertain
work for lease recovery.

The process emits redacted lifecycle events, per-job kind/attempt/duration and
allowlisted failure categories, and a periodic aggregate heartbeat containing
available (including reclaimable expired leases), scheduled, running,
terminal, and retrying counts plus oldest available age.
It never emits payloads, raw idempotency keys, key hashes, lease tokens,
database URLs, or raw provider/database exceptions. No public readiness route
or external monitoring provider is added in this slice.

## Verification

Final evidence ran on exact Node `v24.19.0` / npm `11.17.0` and PostgreSQL 17
using a clean disposable database with all seven migrations applied. The
verification set passed:

- worker unit coverage for environment bounds, payload validation, telemetry,
  heartbeat/lost-lease behavior, concurrency, deadlines, claim/drain races,
  fail-stop transitions, and shutdown;
- database integration coverage for atomic enqueue/rollback, stable replay and
  changed-digest conflict, strict payload constraints, token fencing,
  lock-wait expiry, attempt-neutral release, retry/terminal isolation,
  intent-scoped replay reconciliation, and crash-after-effect recovery;
- the opt-in exact-role privilege proof against the current migration
  artifact;
- compiled separate-process checks proving one canary creates exactly one
  durable effect and exits cleanly on `SIGTERM`, while an intentionally broken
  completion routine triggers bounded fatal drain, closes the pool, exits 1,
  and leaves the effect-bearing job leased for recovery;
- the full API, web, and contracts test suites, every production build, lint,
  format, and migration checks; and
- the published 5/5 compatibility and 13/13 candidate evidence suites.

Exact command counts and outcomes are recorded in `HANDOFF.md`. The normal
local `pumdoki_dev` database was not used as final migration evidence because
an earlier uncommitted draft of this migration was applied there before its
hash-only and reconciliation hardening. No local data was reset, its Prisma
migration ledger was not edited, and any repair or recreation remains a
separate explicit approval. Final verification used only disposable databases;
the final database and all generated Phase 2 databases and roles were removed
afterward.

Following separate founder approval, the tracked working-copy Compose
PostgreSQL mapping now publishes `127.0.0.1:5432:5432`, matching Mailpit's
loopback-only host boundary. A container-only recreate retained the same named volume, PostgreSQL
cluster identifier, database OID, seven-row successful migration ledger, and
sampled domain counts of 115 users, 849 sessions, 393 acceptance records, and
20 creator applications. The recreated container is healthy, normalized
Compose configuration and Docker runtime publishers contain only `127.0.0.1`,
and direct IPv4-loopback connectivity passes.

This narrows host exposure but does not protect against other processes on the
same host or containers on the Compose network. Restricted deployed credentials
and network controls remain a separate deployment gate.

## Remaining gates

This feature-branch foundation is not a production queue or Phase 2
completion. Draft PR #13 is open against `dev`; merge remains separately
gated, and every changed head requires exact-head CI.
Later slices still require independent review and authority
for:

- deployed migration/API/worker credentials and secrets;
- worker readiness integration, monitoring, alert routing, retention,
  authorized replay/cancellation, and load/backpressure evidence;
- Redis-backed shared throttling and its route-specific outage policy;
- a general operation-specific idempotency framework and provider-event
  receipts;
- any email/token, payment, Veso, booking, creator-review, or other product
  migration to async work; and
- staging/production infrastructure, providers, spending, deployment, and live
  configuration.

Phase 2 remains partially complete.
