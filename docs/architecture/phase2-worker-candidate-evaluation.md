# Phase 2 worker candidate evaluation

Date: 2026-08-19 · Status: local evaluation passed; published through PR #11 with normal publication CI green; provisional application-owned recommendation

## Scope and authority

This evaluation follows the founder-approved
[Phase 2 async-work ADR](phase2-async-work-throttling-idempotency.md), the
published [compatibility and privilege sub-proof](phase2-worker-compatibility-spike.md),
and the separately published [Node 24 baseline](node24-runtime-baseline.md).
It is documentation and local verification only.

It adds no production dependency, Prisma migration, worker process, production
or runtime queue, Redis store, provider, vendor account, deployment, secret,
live configuration, or private-operations activation. It does not move email,
payment, Veso, creator-review, identity, or other product work into a queue.
Phase 2 remains partial.

## Decision question

Which locally evaluable PostgreSQL worker pattern can satisfy the accepted
ADR's mandatory transaction, ownership, least-privilege, opaque per-attempt
lease fencing, bounded retry, terminal-state, and shutdown invariants on Node
24 and PostgreSQL 17?

The evaluation considered the current supported Graphile Worker and pg-boss
releases, then exercised the surviving application-owned pattern through an
isolated synthetic migration and lifecycle harness. The two libraries were
not installed or executed because tagged source inspection found a decisive
mandatory-invariant failure before their remaining local checks would affect
the result.

## Candidate result

| Candidate                            | Result against this ADR                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Outcome                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graphile Worker `0.17.3`             | Node 24/PostgreSQL 17 are within declared ranges, SQL enqueue can participate in a caller transaction, and graceful stop is supported. Its claim uses a worker-pool lock, while successful completion deletes by job ID without a per-attempt token. Its documented job retry is deterministic exponential backoff without the ADR-required jitter. Its supported/default migration model also expects runtime migration authority; an exact bespoke restricted-role model remains unproven rather than impossible.                  | Do not advance this release unchanged under the accepted ADR. It fails mandatory stale-attempt fencing and retry jitter.                                                                             |
| pg-boss `12.27.0`                    | Node 24/PostgreSQL 17 are supported. The Prisma adapter supports same-transaction enqueue; migration suppression/CLI control, configurable jittered retry, and graceful stop are available. The tagged job model has no opaque per-attempt lease token, and completion/heartbeat predicates use queue, job ID, and active state. Exact split API/worker grants and forced-deadline behavior remain unproven.                                                                                                                         | Do not advance this release unchanged under the accepted ADR. It fails mandatory stale-attempt fencing.                                                                                              |
| Application-owned PostgreSQL pattern | The combined published local proofs demonstrate Prisma-transaction enqueue/rollback, isolated migration ownership, direct restricted API/worker login credentials and exact candidate-database grants, indexed/bounded `SKIP LOCKED` claims, token-and-expiry-fenced renewal/release/completion/failure, attempt-neutral pre-handler release, kind-owned bounded exponential retry with a ±25% jitter formula, permanent/exhausted `DEAD` outcomes, all-work drain, claim-versus-drain safety, and crash-like lease-expiry recovery. | Provisional local leading candidate and the only evaluated pattern that currently demonstrates the mandatory fence and role split. This is not final production selection or durable implementation. |

Primary version and behavior references, verified on August 19, 2026:

- [Graphile Worker `0.17.3` release](https://github.com/graphile/worker/releases/tag/v0.17.3),
  [tagged package manifest](https://raw.githubusercontent.com/graphile/worker/v0.17.3/package.json),
  [current requirements](https://worker.graphile.org/docs/requirements),
  [claim SQL](https://github.com/graphile/worker/blob/v0.17.3/src/sql/getJobs.ts),
  [completion SQL](https://github.com/graphile/worker/blob/v0.17.3/src/sql/completeJobs.ts),
  and [retry behavior](https://worker.graphile.org/docs/exponential-backoff)
- [pg-boss `12.27.0` release](https://github.com/timgit/pg-boss/releases/tag/12.27.0),
  [tagged package manifest](https://raw.githubusercontent.com/timgit/pg-boss/12.27.0/package.json),
  [tagged SQL plans](https://raw.githubusercontent.com/timgit/pg-boss/12.27.0/src/plans.ts),
  [Prisma adapter](https://pgboss.io/api/adapters), and
  [migration controls](https://pgboss.io/api/constructor)

The library findings are narrow. They do not claim either project is generally
unreliable or lacks at-least-once processing. They mean the releases cannot be
used unchanged while this product's accepted ADR requires acknowledgement to
match both the job ID and the current opaque attempt token. After attempt A's
lease expires and attempt B reclaims the same job, stale attempt A must be
unable to complete, release, fail, or renew attempt B.

## Local application-owned proof

The existing five-test suite remains the Prisma transaction and initial
privilege proof. The new thirteen-test suite adds only:

- `apps/api/src/spikes/phase2WorkerCandidate.migration.sql`, an isolated
  synthetic SQL migration outside normal Prisma migrations and `db:deploy`;
- `apps/api/src/spikes/phase2WorkerCandidate.candidate.ts`, a disposable
  PostgreSQL candidate and lifecycle harness; and
- `apps/api/src/spikes/phase2WorkerCandidate.vitest.config.ts`, dedicated test
  discovery that remains outside normal API tests and production builds.

Run both proofs from the repository root with local Compose PostgreSQL healthy:

```bash
npm run test:phase2-worker-spike
npm run test:phase2-worker-candidates
```

The candidate harness refuses production, non-PostgreSQL or non-loopback
targets, URL query overrides, the wrong database/user/port, non-PostgreSQL-17
servers, and non-superuser bootstrap roles. It also verifies that the configured
hostname resolves only to loopback addresses before connecting.

Each run creates a random temporary database, a `NOLOGIN` migration owner, and
random-password API/worker `LOGIN` roles. All three are `NOINHERIT` and lack
superuser, database/role creation, replication, and row-security-bypass rights.
The local bootstrap applies the fixture under the migration identity; API and
worker clients then authenticate directly with their temporary credentials.
Passwords remain in memory; the harness does not log them or persist plaintext
credentials in repository files. This proves effective test-role credentials
and candidate-database grants, not deployable credential provisioning. Every
generated name is bounded and validated before DDL.

The API role may insert only the synthetic domain intent and execute the fixed
enqueue routine. The worker role may read the referenced domain intent and
execute only the fixed claim, renew, release, complete, and fail routines.
Runtime roles cannot query or mutate the queue table directly, create schema
objects, call cross-role routines, or assume the migration role. All routines
are migration-owner `SECURITY DEFINER` functions with a `pg_catalog` search
path, fully qualified relations, public execution revoked, and bounded inputs.
The attempt-neutral release routine is reserved for a claim intercepted before
handler execution begins; handler failures use the separate fenced failure
transition and consume the attempt.

The thirteen tests verify:

1. unsafe bootstrap targets are rejected;
2. the isolated migration owner, required indexes, role attributes, exact
   candidate-database grants, and denied escalation/direct-access paths;
3. representative required-input `NULL` validation across every allowlisted
   routine;
4. claim establishes a fresh opaque lease token, and renewal, release,
   completion, and failure require the current unexpired token;
5. repeated pre-handler safe release does not consume the delivery-attempt
   budget;
6. retry executes the kind-owned bounded exponential ±25% jitter formula and
   reaches terminal `DEAD` at the configured attempt ceiling;
7. a permanent failure reaches `DEAD` on its first attempt;
8. an expired final attempt becomes `DEAD` instead of remaining stranded;
9. indexed terminalization is bounded with `SKIP LOCKED`, so a locked expired
   job does not block an unrelated available job;
10. normal drain stops new claims, finishes bounded active work, and closes its
    database client;
11. drain waits for every active handler before reporting an aggregated handler
    failure;
12. drain waits for an in-flight claim and safely releases it before closing;
    and
13. crash-like client loss leaves uncertain work leased until expiry, after
    which reclamation rejects every stale-token mutation.

The original `pumdoki_dev.public._prisma_migrations` ledger is snapshotted from
allowlisted non-log fields before and after the run. Cleanup closes clients,
force-drops only the validated random database, removes all generated roles,
then asserts that no matching database or role remains. Cleanup errors are
aggregated rather than hiding an earlier failure.

## Verification result

Final local verification on August 19, 2026:

```text
Node                                      v24.19.0
npm                                       11.17.0
Published compatibility suite             5/5 passed
Application-owned candidate suite          13/13 passed
Candidate TypeScript / ESLint / Prettier   passed
API dependency-chain build                 passed
Normal API / web / contracts tests          118 / 166 / 24 passed
Web / private-operations builds             passed
Post-run candidate databases / roles       0 / 0
Normal Prisma migration ledger             unchanged
```

No Graphile Worker or pg-boss package was installed, no lockfile changed, and
no normal runtime, Prisma migration, `db:deploy`, or product table was touched.

## Limits and next approval boundary

This is synthetic local evidence, not a production worker. It does not prove
production credential provisioning, Prisma migration rollout, a separate
long-running worker process, real signal handling, a heartbeat scheduler,
multi-handler load,
backpressure, telemetry/readiness, retention, replay/cancellation audit,
provider delivery, or statistical thundering-herd behavior. The jitter test
only proves that one execution remains inside its declared bounded formula.
The exact runtime-grant proof is local to the disposable candidate database;
cluster-wide `PUBLIC` defaults on other local databases were not changed or
treated as a production role-provisioning design.

The application-owned pattern is therefore the provisional local leading
candidate, not a binding production selection. PR #11 published this evidence
as merge commit `afdb59d`, preserving reviewed head `b858bd1`. Final-head run
`32347088768` and post-merge `dev` run `32347585996` passed all three jobs.
Publication did not authorize a production selection or durable implementation.
The founder later approved local implementation and verification of the
provisional application-owned foundation on August 20, 2026. That work is
recorded in the [worker-foundation record](phase2-worker-foundation.md) and is
published on its feature branch under a later stage/commit/push approval. It
still adds no provider, Redis, email/token migration, payment/Veso behavior,
deployment, or live configuration. Opening or merging a pull request remains
separately gated.
