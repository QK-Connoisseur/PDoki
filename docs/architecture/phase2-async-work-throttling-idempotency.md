# Phase 2 ADR — durable async work, shared throttling, and idempotency

Date: 2026-08-18 · Status: accepted design; implementation not started

## Scope and authority

The founder approved this provider-neutral architecture direction on
August 18, 2026. This record authorizes documentation and local verification
only. It does not authorize a provider, account, purchase, cloud resource,
secret, DNS change, staging or production deployment, live migration, or
private-operations activation.

Phase 2 remains partially complete. This ADR decides how the remaining
background-job, shared-throttling, and idempotency foundations must preserve
correctness; it does not claim that any of them exist yet.

## Context

The current API already uses PostgreSQL as the authority for users, sessions,
single-use verification tokens, acceptance evidence, creator applications, and
creator-review concurrency. Its login, email-request, current-password, and
general API limiters are process-local. Mail preparation and delivery happen
after database work commits and are bounded from the request's perspective, but
delivery remains unknown when the transport fails or times out.

The repository has no Redis client, shared throttle store, outbox/job model,
worker process, dead-letter path, or general request-idempotency record.
Readiness currently checks PostgreSQL only. No payment webhook, Veso ledger, or
production email transport exists.

These gaps are related operationally but are not one interchangeable system:

- throttling decides whether work may begin;
- a durable job records that accepted work must eventually be attempted;
- idempotency ensures a retry cannot create a second consequential effect; and
- Redis may coordinate instances but cannot become the durable business record.

## Decision

### 1. PostgreSQL is the durable authority

PostgreSQL will hold durable job intent, job outcome, operation-specific
idempotency records, webhook receipts, ledger effects, entitlements, session
lifecycle, and creator-review state/evidence.

When a domain mutation requires asynchronous follow-up, the domain mutation
and its durable job/outbox record must commit in the same PostgreSQL
transaction. The API must not acknowledge durable asynchronous acceptance
unless that transaction commits. There is no PostgreSQL-to-Redis or
PostgreSQL-to-external-queue dual write at the correctness boundary.

A PostgreSQL-backed worker library may be selected after a local compatibility,
transaction, migration, and least-privilege spike. If no candidate satisfies
those constraints, Pumdoki will use an application-owned outbox/job table with
the same invariants. The exact library, schema, and polling mechanism are not
selected by this ADR.

### 2. Redis is ephemeral coordination only

Redis may provide shared throttle counters, bounded windows, and short-lived
coordination such as a non-authoritative worker wake-up hint. General caching
and session caching are not approved by this ADR. Redis must never be the sole
or authoritative record for:

- sessions or revocation;
- a durable or completed job;
- request or webhook idempotency;
- a payment, refund, chargeback, or Veso transaction;
- a creator earning, entitlement, or payable balance;
- creator-review state or evidence; or
- any other business effect that must survive expiry, eviction, failover,
  operator flush, or total Redis loss.

A cold or empty Redis instance may cause additional database work or a degraded
route, but it must not resurrect access or duplicate a business effect.

### 3. Background delivery is at least once

Workers must assume that any claimed job can run more than once. Exactly-once
delivery is not promised. Every handler must be idempotent at its durable domain
boundary, even if the queue also offers a deduplication feature.

A deployed worker will be a separate process with independent scaling,
graceful shutdown, bounded concurrency, and a least-privilege database role. A
job claim requires a lease or equivalent ownership mechanism so abandoned work
can be recovered without allowing two durable effects.

### 4. Idempotency is operation-specific and database-backed

Consequential client mutations and provider webhooks will use PostgreSQL-backed
idempotency designed for their domain. Pumdoki will not introduce a generic
middleware cache that treats arbitrary HTTP responses as proof of business
completion.

Redis may reduce duplicate work, but correctness must remain unchanged when
Redis is unavailable.

## Responsibility and outage matrix

| Responsibility                            | Durable authority                                                                      | Permitted Redis role                       | Required outage behavior                                                                                                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login and current-password confirmation   | Security policy and application configuration                                          | Shared attempt counters                    | Use a stricter bounded process-local emergency limiter. A tracked threshold returns `429`; an unavailable/full fallback returns retryable `503`. Never accept unlimited guesses.                      |
| Registration                              | Security policy plus PostgreSQL account constraints                                    | Shared per-client request counter          | Use a strict bounded local allowance. A tracked threshold returns `429`; an unavailable/full fallback returns `503`. Do not leave CPU-heavy hashing/account creation behind only the general limiter. |
| Verification-email resend                 | PostgreSQL token state plus application policy                                         | Shared request counter                     | Return a retryable service error and create/send nothing when the required shared counter is unavailable.                                                                                             |
| Password-reset request                    | PostgreSQL token state plus application policy                                         | Shared request counter                     | Preserve the enumeration-neutral `202` response, but create/send nothing when the required shared counter is unavailable.                                                                             |
| General API limiting                      | Application and edge policy                                                            | Shared counters                            | A stricter bounded local fallback is allowed only with an approved hard replica ceiling and edge limit; otherwise fail closed. Never silently disable the limit.                                      |
| Token confirmation and session revocation | PostgreSQL token/session lifecycle                                                     | No shared counter required for correctness | Keep already-issued token confirmation and logout/revocation available behind a bounded local abuse guard; Redis loss cannot block revocation or make a token reusable.                               |
| Durable background work                   | PostgreSQL job/outbox record                                                           | Optional short-lived coordination          | If durable enqueue cannot commit, roll back the associated domain mutation and return an error.                                                                                                       |
| Worker outage                             | PostgreSQL job/outbox record                                                           | None required                              | Accepted jobs remain durable; surface explicit degradation and alert on age, depth, and failures. Do not falsely report delivery.                                                                     |
| Payment webhook processing                | Unique PostgreSQL provider/integration/event receipt plus transactional domain effects | Optional duplicate suppression             | Remain correct while Redis is absent; acknowledge only after durable receipt.                                                                                                                         |
| Veso and financial mutations              | Append-only PostgreSQL ledger and constraints                                          | Optional contention optimization           | No completed effect or balance exists solely in Redis.                                                                                                                                                |
| Session revocation                        | PostgreSQL session lifecycle                                                           | None approved                              | Redis is not in the session authority/read path; its loss cannot affect revocation.                                                                                                                   |
| Creator-review transitions                | PostgreSQL expected-status transaction and evidence                                    | None                                       | Redis loss cannot weaken the existing compare-and-set invariant.                                                                                                                                      |

Route-specific policies override the general limiter policy. Liveness and
readiness probes bypass request throttles entirely. Token confirmations,
logout, and session revocation bypass the shared global store and use their
documented bounded local guard so Redis loss cannot block an already-issued
credential flow or revocation.

The in-memory limiter remains acceptable for unit tests, local development, and
an explicitly single-instance local environment. Configuration must make it
impossible to select that adapter silently in a multi-instance deployed
environment. The emergency fallback must reject new keys rather than evict an
active block when its bounded capacity is full.

Shared throttle keys must be time-bounded and derived with a versioned,
environment-specific keyed digest so raw email addresses, user IDs, or IP
addresses are not stored as Redis keys. Exact trusted-proxy hops and client-IP
normalization, including IPv6 handling, must be approved before a deployed
limiter uses request IP. A broad `trust proxy = true` setting is prohibited.

The digest secret belongs in the approved secret system and is never logged.
Rotation must use a bounded overlap/dual-generation strategy or an explicit
fail-closed maintenance transition so changing the secret cannot erase every
active abuse window at once. Counter increment, limit comparison, and TTL
assignment must be one atomic store operation rather than a separate
check-then-record sequence. Healthy shared-store thresholds and
response-neutrality rules remain unchanged unless a separate security/product
review approves a change. That means initially preserving ten failed logins per
email-plus-IP per 15 minutes, five verification/reset requests per
email-plus-IP per hour, and five failed current-password confirmations per
account-plus-IP per hour. The general limit remains environment-configured.
Exact stricter emergency-fallback and new registration limits are selected and
tested in the separately reviewed implementation policy; this ADR approves
their conservative direction, not unreviewed numbers.

Any fallback or fail-closed transition must emit a redacted degraded signal and
metric. It must not log raw throttle keys, credentials, tokens, or request
bodies. A dependency failure is not a user rate-limit violation: future
implementations must use a standard retryable `503` error and `Retry-After`
semantics rather than disguising it as `429`, except where the password-reset
request deliberately preserves its neutral `202` envelope.

Liveness must not depend on Redis or a request limiter and returns `200` while
the process is alive. Readiness/degraded status follows this contract:

- PostgreSQL unavailable returns `503`;
- Redis unavailable may return `200` with a generic degraded dependency state
  only when every affected route has its approved bounded fallback active and
  tested; otherwise readiness returns `503`;
- an API with a separate unavailable worker may return `200` with a generic
  degraded state for unrelated routes while queue-backed acceptance continues
  to depend on successful PostgreSQL enqueue; and
- a worker's own readiness fails when it cannot claim/process its required
  dependencies.

Probe routes bypass request counters. Public responses expose no provider,
topology, endpoint, credential, backlog payload, or private-environment detail;
restricted telemetry carries the operational diagnosis.

## Durable job protocol

Every job type is classified before implementation:

- **Required intent:** the domain command is not accepted unless its job record
  commits in the same transaction. An enqueue failure rolls back the command.
- **Optional notification:** the domain command may succeed without a job only
  when its slice truthfully promises neither durable enqueue nor delivery and
  documents the resulting loss window. It cannot be described as a durable
  outbox guarantee.

The creator-application receipt becomes required intent if it is migrated to
the durable outbox described below. Failure to write that intent means the
application transaction does not commit; preparation or transport failure
after commit never rolls back the application.

The implementation may choose different field names, but the durable model must
represent at least:

- a UUID job identifier and allowlisted job kind;
- an integer payload version and bounded typed payload;
- a stable deduplication key with an appropriate uniqueness scope;
- `PENDING`, `RUNNING`, `SUCCEEDED`, terminal `DEAD`, authorized terminal
  `CANCELED`, and deliberate local non-delivery `DISCARDED` outcomes or
  equivalent;
- availability time, attempt count, and policy-owned maximum attempts;
- an opaque lease token plus lease expiry;
- originating request/correlation identifiers;
- an optional immutable original-job reference plus replay sequence for an
  authorized replay;
- creation, completion, and terminal-state timestamps; and
- an allowlisted, truncated failure category without a raw provider exception
  or payload.

Durable acceptance is the committed PostgreSQL record, not a JavaScript
promise, in-memory enqueue, Redis write, or provider request.

The implementation must preserve this sequence:

1. Validate and authorize the request.
2. In one PostgreSQL transaction, write the domain intent/effect and the
   durable job record that references it.
3. Return success only after the transaction commits.
4. A worker claims available work with bounded ownership, validates the
   versioned payload, and executes an idempotent handler.
5. The worker records completion durably. If it dies after an external effect
   but before acknowledgement, the retry must not duplicate a durable Pumdoki
   domain effect. A provider with idempotency support reuses a stable provider
   key; an inherently at-least-once notification may be delivered twice and
   must be duplicate-tolerant.
6. Retryable failures use bounded exponential backoff with jitter and a maximum
   attempt count. Non-retryable or exhausted work enters an explicit terminal
   state.
7. Replay requires a specifically authorized operator action, a reason, and
   application-level audit evidence. Replay must not erase the original failure
   history. It creates a new linked job ID and replay-specific deduplication key
   rather than clearing or colliding with the original key; handler idempotency
   remains the final duplicate-effect barrier.

Cancellation is a distinct terminal operator outcome, not a synonym for
failure or discarded local delivery. It requires an atomic state/lease-token
check, explicit authorization, a reason, and correlated evidence. A pending job
may be canceled before claim. Running work may be canceled only after ownership
is safely relinquished and before uncancellable external I/O begins. Once such
I/O has started, the system must preserve the uncertain/retryable outcome rather
than falsely mark the job canceled.

Queue internals are not the business audit record. Consequential workflows keep
an application-owned domain record and enqueue work that references it.

Claims use database time and a bounded atomic batch (`FOR UPDATE SKIP LOCKED`
or an equivalent primitive), then commit before external I/O. A completion or
failure update must match both the job ID and current lease token so a stale
worker cannot acknowledge work that has been reclaimed. Expired leases become
reclaimable; polling uses bounded jitter and never holds a database lock during
provider I/O. PostgreSQL polling remains the discovery baseline. Redis or a
future broker may provide a wake-up hint but cannot be required to discover an
accepted job.

The bounded handler deadline must be shorter than the lease horizon with an
explicit safety margin, or the worker must renew through a token-matched
heartbeat before the margin expires. A worker that loses renewal may not start
additional external I/O. Once uncancellable provider I/O has begun, shutdown
must not proactively release the lease; forced termination lets it expire and
relies on the stable provider idempotency key or duplicate-tolerant handler.

### Payload boundary

Job payloads must be schema-validated, versioned, size-bounded, and limited to
the identifiers and necessary routing data required to reload or preserve
durable state.
They must not contain:

- session cookies or authentication headers;
- passwords, API keys, credentials, or recovery codes;
- raw email-verification or password-reset tokens;
- unnecessary message bodies, identity files, banking/tax data, or explicit
  content; or
- mutable authorization claims that the worker could trust without rechecking
  current durable state.

Logs, metrics, alerts, and dead-letter views must identify a job by safe
correlation fields without exposing its payload or personal data.

When a workflow requires an event-time recipient, the producing transaction
must persist that captured snapshot with the delivery intent rather than reload
a later user address. The creator-application receipt therefore preserves the
verified email captured under the existing user-row lock. That address is
necessary personal data: only the producer and least-privilege delivery worker
may access it; it is never logged or shown in a dead-letter view; and its
success/dead-state retention and deletion rules must be bounded before the
migration ships.

The worker-facing delivery interface must report success, retryable failure,
permanent failure, and ambiguous timeout rather than absorb transport errors.
The current request-facing best-effort mail wrapper intentionally hides those
failures and therefore cannot be reused as the worker retry boundary. A local
console sink is recorded as discarded, not falsely delivered. At-least-once
SMTP can duplicate after an ambiguous timeout, so any migrated template must be
safe to receive more than once.

For external mail, `SUCCEEDED` means that the configured transport or provider
accepted the attempt. It does not mean that the recipient received or read the
message. Delivery, bounce, deferral, and complaint outcomes are separate future
provider-event states. The local console sink remains `DISCARDED`, not
`SUCCEEDED` or delivered.

## Idempotency contracts

### Consequential client mutations

Future consequential APIs will require an idempotency key according to their
operation contract. The unique scope is authenticated principal plus operation
name/version plus idempotency-key hash. The canonical validated request digest
is stored separately and compared after the scoped key matches; otherwise the
same key with a changed request could evade the required conflict. Authentication,
authorization, and validation happen before lookup; an idempotency key never
grants permission. Keys are opaque and length-bounded, and only their hashes
are stored.

Each operation defines how its keys are created. A client-generated key should
carry at least 128 bits of randomness (a UUIDv4 is acceptable); an operation may
instead derive a deterministic key from a documented stable business
identifier with the same uniqueness scope. Guessable free-form user input and
accidental cross-operation key reuse are not valid idempotency contracts.

- The same key and request digest replays the same stable result or resource
  reference after completion.
- The same key with a different request digest returns `409` and creates no new
  effect.
- Parallel requests with the same key produce one durable domain effect.
- A rolled-back transaction does not leave a false completed record and may be
  retried safely.
- Transient `5xx` responses are not stored as completed business outcomes.

For a synchronous database mutation, the idempotency record, domain effect, and
stable completed result share one short PostgreSQL transaction. A concurrent
same-key caller waits for that transaction or receives a documented retryable
conflict; rollback leaves no false reservation to reclaim.

For an asynchronously accepted command, one transaction creates the domain
intent/resource, durable job, and idempotency record pointing to the stable
accepted response/resource. Later requests replay that acceptance or completed
result. Worker progress and abandoned ownership are governed by the job lease,
not by letting another HTTP request repeat the domain command. If an
implementation exposes an `IN_PROGRESS` state, its response (`202`, bounded
wait, or retryable `409`/`425`) is operation-specific and cannot grant a second
effect.

Retention is domain-specific; expiry cannot reopen a key while a duplicate
financial or other consequential effect is still possible.

### Provider webhooks

Webhook authentication, signature verification, timestamp tolerance, and
replay checks happen before Pumdoki accepts the event. The webhook route must
capture a strictly size-bounded copy of the exact provider-signed bytes or
provider-defined canonical input before ordinary JSON parsing changes it. Those
bytes are never logged. Only after verification may the handler parse and
normalize the event.

A valid event is recorded under a unique provider, internal
integration/merchant scope, and external-event identifier before a successful
acknowledgement. Environment is included when one database can contain more
than one environment. Each adapter documents the provider's actual uniqueness
guarantee. The durable processing job is created in the same transaction. The
receipt persists bounded allowlisted normalized fields and an event/body digest
by default—not an unrestricted raw provider payload. Persisting a raw body
requires separate necessity, encryption/access-control, and retention approval.

Duplicates, concurrency, redelivery, and reordering must create at most one
domain/ledger effect. Provider-event uniqueness is an early barrier; domain and
append-only ledger constraints remain the final correctness boundary.

Retention and deletion for financial, webhook, and idempotency records require
the separately tracked counsel/operations decision before those domains ship.

## Current email boundary

Existing verification, password-reset, and creator-application receipt sends
remain bounded post-commit best-effort operations until a separate
implementation slice satisfies this ADR.

Verification and reset raw tokens are stored only as hashes, so a worker cannot
reconstruct them. Pumdoki will not put raw tokens or rendered secret links into
an ordinary job payload. Moving those messages to a queue requires a separately
reviewed token-safe delivery design, such as an approved short-lived encrypted
envelope with controlled key ownership or a changed issuance protocol.

The first local worker proof must use a non-secret, idempotent canary or
housekeeping task. It must not silently migrate current authentication emails,
claim guaranteed delivery, or select a production transport.

After that proof, the creator-application receipt is the preferred first real
outbox migration because it contains no bearer token and already follows a
transactional application/evidence boundary. That migration still requires its
own reviewed implementation slice, must persist the transaction-captured
recipient with the application and required receipt intent, and must remove the
inline send rather than dual-send. The `201` then confirms committed application
and delivery intent—not transport acceptance or recipient delivery.

## Security and operational boundaries

- Migration ownership, API enqueue rights, and worker claim/update rights must
  be separable. Runtime processes may not own or migrate the application
  schema.
- The API may enqueue only allowlisted job types. The worker revalidates the job
  schema and current authorization-relevant durable state.
- Worker shutdown stops new claims, finishes bounded active work, releases only
  work for which no uncancellable external I/O has begun, and closes database
  resources within the service shutdown budget. Forced shutdown relies on lease
  expiry rather than falsely marking uncertain work available.
- Queue age, available/running/terminal counts, retry counts, handler latency,
  and last worker heartbeat are observable without exporting payloads.
- A worker outage may leave unrelated API routes ready while the service is
  explicitly degraded. A PostgreSQL or durable-enqueue failure prevents an API
  from acknowledging queue-backed work.
- Configured global and per-kind backlog ceilings plus retry controls must
  prevent an outage from producing an unbounded retry storm or storage-growth
  incident. At a required-intent ceiling, the producer returns retryable `503`
  and commits neither command nor job. Optional work follows its truthful
  no-guarantee classification. The system never drops or overwrites older jobs
  merely to admit new work.
- Operator replay, cancellation, and terminal-state changes require explicit
  permission and correlated evidence. A database owner can still alter rows;
  application-level evidence must not be described as globally immutable.

## Implementation sequence

Each implementation step requires its own reviewed pull request and verification
evidence.

1. **Compatibility and privilege spike.** Evaluate a PostgreSQL-backed worker
   candidate against the current runtime, Prisma transactions, schema
   ownership, least-privilege roles, graceful shutdown, and test environment.
   A runtime-version change is a separate proposal and is not approved here.
2. **Durable local worker foundation.** Add the job/outbox persistence, a
   separate worker process, and a non-secret idempotent canary. Prove atomic
   enqueue, recovery, retry, terminal handling, and bounded shutdown locally.
3. **Shared throttle abstraction.** Introduce a `ThrottleStore` boundary with an
   in-memory local/test adapter and a Redis adapter. Prove every route's outage
   behavior and prevent local fallback from being selected accidentally in a
   multi-instance deployment.
4. **Operation-specific idempotency primitives.** Add the PostgreSQL contract
   before the first payment, Veso, booking, or other consequential mutation.
   Add the provider-event receipt pattern before the first webhook endpoint.
5. **Provider and staging evaluation.** Select services only through the
   separate decision matrix, provisional evaluation approval, restricted
   configuration, and staging verification runbook. This ADR is not that
   approval.

## Required verification for implementation

The future implementation is not accepted until focused tests prove:

- business intent and job enqueue commit together; rollback leaves neither;
- two concurrent workers or requests create one durable effect;
- killing a worker after an external effect but before acknowledgement retries
  without duplicating the durable Pumdoki domain result; external notifications
  without provider idempotency are explicitly tested as duplicate-tolerant;
- retry delay, maximum attempts, terminal isolation, authorized replay, and
  graceful shutdown behave as documented;
- cancellation wins only before external I/O, records authorization and reason,
  rejects stale lease tokens, and never turns an uncertain provider effect into
  a false canceled outcome;
- payload validation, versioning, size limits, and redaction reject secrets and
  raw authentication tokens;
- Redis disconnect, timeout, reconnect, and cold-start tests exercise every
  route in the outage matrix without an unlimited path;
- an in-memory throttle adapter cannot start in an unapproved multi-instance
  mode;
- the same idempotency key and digest replay a stable result, a changed digest
  returns `409`, and parallel duplicates create one effect;
- invalid webhook signatures create no receipt/effect, while valid duplicate,
  concurrent, and reordered events create one durable processor/domain effect;
- identical external-event identifiers in different internal integration
  scopes remain distinct without exposing provider account identifiers in
  public responses or logs;
- API, worker, migration, and future operations database roles cannot exceed
  their documented grants; and
- health/degraded state, queue age/depth/failure alerts, and redacted logging
  match the dependency classification.

## Alternatives rejected

- **A Redis-backed queue as the sole durable job/business record.** Redis
  expiry, eviction, failover, and operator flush cannot define financial or
  legal truth.
- **Database commit followed by an uncoordinated external enqueue.** The crash
  window can lose required work or create a false success.
- **Fire-and-forget request work.** Process exit or deployment can lose it after
  the user sees success.
- **Exactly-once claims.** External effects and acknowledgement crashes make the
  claim misleading; at-least-once plus idempotency is the honest contract.
- **A generic HTTP response-cache idempotency middleware.** It cannot encode
  operation-specific authorization, transaction, conflict, and stable-result
  rules safely.
- **Raw authentication tokens in job payloads.** That would turn the job store
  into a credential store and widen disclosure/retention risk.
- **Unlimited local throttling fallback.** A dependency outage must never open
  an abuse bypass.

## Consequences and deferred decisions

This design adds PostgreSQL load and operational state, requires every handler
to tolerate duplicates, and can reduce route availability when a required
shared throttle is down. Those costs are accepted to preserve durable and
security correctness.

Still undecided and not authorized by this ADR:

- a Redis, queue, monitoring, cloud, or transactional-email provider;
- a worker library or application-owned schema;
- AWS account shape, region, networking, credentials, or cost ceiling;
- retention, residency, DPA, deletion, and legal policies;
- production/staging provisioning, data migration, DNS, secrets, or rollout;
- asynchronous delivery of raw-token authentication messages;
- payment, Veso, identity, creator approval/promotion, or private-operations
  activation; and
- production readiness or completion of Phase 2.

This ADR did not authorize a Node.js/runtime baseline change. The founder later
authorized the separate [Node 24 runtime baseline](node24-runtime-baseline.md),
whose draft PR, verification, and merge remain independent review gates.
