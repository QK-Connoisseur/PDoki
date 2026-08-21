# Node 24 runtime baseline

Date: 2026-08-18 · Status: published and CI-verified

## Decision and authority

Pumdoki's supported runtime baseline moves from end-of-life Node 20 to Node
`24.19.0` LTS. The exact local and CI runtime is stored in `.nvmrc`; package
metadata requires Node `>=24.19.0` so the founder's existing newer local runtime
remains usable. Node type definitions are pinned to major 24 so TypeScript
cannot silently compile against Node 26-only APIs.

This is a runtime, CI, documentation, and verification change only. It adds no
job library, worker, queue schema, Redis integration, provider, cloud resource,
deployment automation, live configuration, secret, or private-admin control.
It does not authorize the durable Phase 2 worker foundation.

## Repository contract

- `.nvmrc` pins `24.19.0`, the current Node 24 LTS release at the decision date.
- Every workspace manifest declares Node `>=24.19.0`.
- The lockfile resolves `@types/node` `24.13.3` through a direct root development
  dependency.
- All three CI jobs read `.nvmrc` through `actions/setup-node@v7`.
- Checkout, setup, and Playwright-report upload use their Node 24-based `v7`
  action majors. Existing read-only token permissions and timeouts remain
  unchanged.
- Docker Compose remains PostgreSQL/Mailpit only; this decision adds no runtime
  container or service.

Primary references:

- [official Node distribution index](https://nodejs.org/dist/index.json)
- [Node release schedule](https://github.com/nodejs/Release/blob/main/schedule.json)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/upload-artifact](https://github.com/actions/upload-artifact)

## Local verification

The verification began with a clean `npm ci` on macOS ARM64 using:

```text
Node  v24.19.0
npm   11.17.0
```

The clean dependency tree resolved the Node 24 native/platform packages and
`@types/node` `24.13.3`. The following gates passed:

- dependency-tree inspection: `npm ls --all`;
- formatting and lint;
- web tests: 38 files, 166 tests;
- shared-contract tests: 1 file, 24 tests;
- web, private-admin, contracts, database/Prisma, and API builds;
- all six committed PostgreSQL migrations and the idempotent local seed;
- API tests: 17 files, 118 tests, including native Argon2 paths;
- isolated Phase 2 compatibility spike: 1 file, 5 tests;
- real-stack Chromium: 46 tests; and
- post-spike catalog cleanup: no generated role or schema remained.

The clean install reported 15 dependency advisories. This runtime-baseline PR
does not claim to remediate them; dependency security work remains a separate
reviewed change.

## Publication result

PR #9 published the worker-compatibility spike as merge commit `5c19af0`. PR
#10 then published this isolated runtime baseline as merge commit `9a36b19`,
preserving reviewed head `5ec94f6`. GitHub Actions run `32306324892` passed all
three jobs on that final head, and post-merge `dev` run `32306625394` passed the
same Node 24 lint/build, API, and real-stack Playwright jobs.

The subsequent local candidate evaluation relied on this Node 24 baseline to
reassess current Graphile Worker and pg-boss releases and exercise a disposable
application-owned migration/lifecycle fixture. PR #11 published that evidence
as merge commit `afdb59d`; final-head run `32347088768` and post-merge run
`32347585996` passed all three jobs. The founder later approved local-only
implementation and verification of the provisional application-owned
foundation, followed by a separate approval to stage, commit, and push its
feature branch and a later approval to open draft PR #13 against `dev`. That
PR is now open; merge, production grants, and deployment remain separately
unauthorized.
