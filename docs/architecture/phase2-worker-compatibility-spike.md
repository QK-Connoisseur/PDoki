# Phase 2 worker compatibility and privilege spike

Date: 2026-08-18 · Status: transaction/privilege sub-proof passed; candidate evaluation open

## Scope and authority

This spike follows the founder-approved
[Phase 2 async-work ADR](phase2-async-work-throttling-idempotency.md). It is a
local compatibility and privilege proof only. It does not authorize or create a
production job schema, worker process, provider, cloud resource, dependency,
runtime upgrade, secret, deployment, live configuration, or private-operations
activation.

The separately authorized [Node 24 runtime baseline](node24-runtime-baseline.md)
is a later, isolated follow-up. It changes no worker-foundation authorization
or conclusion in this spike.

No existing email flow was moved to a queue. The spike harness reads or changes
no user, creator, payment, Veso, identity, or review data.

## Question

Can the current PostgreSQL 17 and Prisma 7 transaction boundary satisfy the
ADR's atomic enqueue, role separation, bounded claim, and stale-worker fencing
requirements without weakening database ownership?

## Baseline and candidate result

The repository baseline is Node.js `>=24.19.0`, with exact local/CI selection
through `.nvmrc`. It uses PostgreSQL 17 and already has Prisma 7 plus `pg` for
database-backed tests. It has no job library, queue schema, worker process, or
separate runtime database URLs.

As of this spike:

| Candidate                           | Compatibility result                                                                                                                                                                                                                                                                                                                                          | Outcome                                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graphile Worker                     | Tagged `0.17.3` declares Node 14+, and the current official requirements documentation requires Node 22.18+, which the Node 24 baseline satisfies. Its documented default expects the worker to execute as the database-owner role; lower-privilege use needs adjustments, and SQL enqueue requires owner privilege or a reviewed `SECURITY DEFINER` wrapper. | Not installed. Re-evaluate the current supported release and exact restricted-role migration behavior on Node 24.                                                                           |
| pg-boss                             | Current `12.27.0` requires Node 22.12+, which the Node 24 baseline satisfies. It documents Prisma transaction enqueue and migration suppression, but its job/completion model still needs a focused proof that a stale attempt cannot acknowledge a reclaimed job under the ADR's opaque lease-token rule.                                                    | Not installed. Re-evaluate on Node 24, including stale-attempt fencing and exact least-privilege grants.                                                                                    |
| Application-owned PostgreSQL outbox | The synthetic proof uses the existing Prisma transaction, permits exact API/worker grants, and represents the ADR's opaque lease token and token-matched acknowledgement directly. An isolated migration fixture and worker retry/shutdown lifecycle were not tested.                                                                                         | Provisional leading option for the current SQL boundary, not a final candidate selection. Complete test-only migration and lifecycle evaluation before the durable local foundation begins. |

Primary references:

- [Graphile Worker `0.17.3` package manifest](https://github.com/graphile/worker/blob/v0.17.3/package.json),
  [current requirements](https://worker.graphile.org/docs/requirements), and
  [restricted-role guidance](https://worker.graphile.org/docs/schema)
- [Graphile SQL enqueue ownership requirement](https://worker.graphile.org/docs/sql-add-job)
- [pg-boss `12.27.0` package](https://www.npmjs.com/package/pg-boss/v/12.27.0),
  [Prisma transaction adapter](https://pgboss.io/api/adapters),
  [migration controls](https://pgboss.io/api/constructor), and
  [job schema](https://pgboss.io/sql/job-table)
- [PostgreSQL `SKIP LOCKED`](https://www.postgresql.org/docs/17/sql-select.html)
  and [privilege model](https://www.postgresql.org/docs/17/ddl-priv.html)
- [Prisma raw SQL inside transactions](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries)
- [Node.js end-of-life status](https://nodejs.org/en/about/eol)

The initial local proof ran on Node `v26.7.0` and npm `11.19.0`; it did not run
on the former end-of-life Node 20 CI baseline. The separate Node 24 baseline
verification reran this dedicated suite successfully on Node `v24.19.0` and npm
`11.17.0`. This runtime change does not authorize the durable worker foundation.

## Reproducible local proof

Run from the repository root with the existing loopback Docker PostgreSQL
service healthy:

```bash
npm run test:phase2-worker-spike
```

The command builds the API dependency chain, typechecks the spike, then runs a
dedicated Vitest configuration. It is intentionally excluded from the normal
API build and test discovery because it requires the local test bootstrap role
to create temporary cluster roles.

The harness refuses to run when any of these safety conditions is absent:

- `NODE_ENV` is not production;
- the PostgreSQL hostname is loopback;
- the URL has no query parameters that could override its connection target;
- the database/user are exactly the existing local Compose
  `pumdoki_dev`/`pumdoki` pair;
- the server major is PostgreSQL 17; and
- the bootstrap test role is a superuser.

For each run it generates bounded random identifiers and creates only:

- a temporary migration-owner role;
- a temporary API role;
- a temporary worker role;
- a synthetic domain-intent schema; and
- a synthetic job schema.

All three roles are `NOLOGIN`, `NOINHERIT`, non-superuser roles without
database creation, role creation, replication, or row-security bypass rights.
The migration owner owns the schemas, tables, and three allowlisted
`SECURITY DEFINER` routines. Every routine pins `search_path` to `pg_catalog`,
uses fully qualified relations, accepts bound values, and has public execution
revoked.

The API role may insert the synthetic domain intent and execute only the fixed
canary-enqueue routine. The worker role may read the referenced synthetic
domain row and execute only the bounded claim and token-matched completion
routines. Neither runtime role can own/migrate the schemas, write the other
role's tables directly, call the other role's routine, or assume the migration
role.

## Verified results

The local run passed five focused tests:

1. All schemas, tables, and routines were owned by the migration role; runtime
   role attributes and DDL/role-escalation attempts remained denied.
2. A Prisma interactive transaction wrote domain intent and called the
   allowlisted enqueue routine atomically. Another connection saw neither row
   before commit; both a forced rollback and a real duplicate-dedupe enqueue
   failure left no partial domain/job row.
3. Direct queue-table access and cross-role routine calls failed with
   PostgreSQL insufficient-privilege errors while the intended API and worker
   operations succeeded.
4. Two independent worker transactions claimed two distinct jobs using
   `FOR UPDATE SKIP LOCKED` without blocking, then completed them through their
   own lease tokens.
5. After an expired lease was reclaimed with a new token, the stale token could
   not acknowledge the job; the current token completed it and the attempt
   count remained accurate.

Result recorded on August 18, 2026:

```text
Node        v26.7.0
npm         11.19.0
Test Files  1 passed (1)
Tests       5 passed (5)
```

Runtime-baseline rerun on August 18, 2026:

```text
Node        v24.19.0
npm         11.17.0
Test Files  1 passed (1)
Tests       5 passed (5)
```

A separate post-run database query found no remaining generated role or schema.

## Conclusion

The application-owned PostgreSQL pattern is compatible with the current Prisma
transaction boundary and satisfies this sub-proof's privilege and lease-fencing
criteria. It is the provisional leading option, not a completed worker-candidate
selection. No third-party dependency or production schema is selected by this
result.

This proof does **not** establish the production design or Phase 2 completion.
It does not execute an isolated job-migration fixture or implement retry and
terminal-state policy, replay/cancellation evidence, payload schemas, worker lifecycle,
backlog controls, readiness/telemetry, retention, recipient privacy, provider
delivery, or deployed database roles.

## Next sequencing gates

1. Publish the separately authorized narrow
   [Node 24 runtime baseline](node24-runtime-baseline.md).
2. After that baseline is published, finish the candidate spike: re-evaluate current
   Graphile Worker and pg-boss, and test the chosen/app-owned path's exact
   least-privilege grants, stale-attempt fencing, isolated migration fixture,
   and retry/graceful-shutdown lifecycle. The fixture and lifecycle harness
   must stay excluded from normal `db:deploy` and runtime paths.
3. Only after that evaluation, review a separate durable local
   worker-foundation PR with persistence, a worker process, and a non-secret
   idempotent canary. It still adds no provider or deployment.
4. Keep Redis/shared throttling, creator-receipt migration, production email,
   cloud provisioning, and operation-specific financial idempotency in their
   separately reviewed slices.
