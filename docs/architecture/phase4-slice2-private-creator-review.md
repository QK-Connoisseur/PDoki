# Phase 4 Slice 2 — Private creator-review state foundation

Date: 2026-08-12 · Status: locally verified; deployment disabled · Branch: `dev`

## Goal

Add a safe backend state-machine and evidence foundation for creator-
application review without creating a deployable operations workflow or
weakening the private-operations boundary.

This slice permits only non-approval outcomes. It does not approve creators,
promote accounts, collect identity documents, or expose review controls in the
public application.

## Security boundary

The ordinary `pumdoki_session` is a 30-day public-product session. An `ADMIN`
role on that session is not sufficient authentication for an operational
review. The public API therefore does not mount the creator-review router.

The review router requires an injected operations request verifier. That
verifier is responsible for returning an internal operator only after the
request has passed the complete private-operations boundary. Its untrusted
runtime result is strictly parsed, and production requires an exact `MFA`
assurance value. Invalid or expired assertions return no principal or a typed
authentication error; infrastructure failures remain server errors. The
immutable external subject is preserved exactly rather than normalized at this
boundary. Tests inject an explicit test verifier; no production or development
adapter is configured by the API server in this slice. Consequently, the route
is unreachable in the normal deployable API.

Before any deployed operations server mounts the router, it must:

1. Run on the separately hosted, restricted `apps/admin` origin.
2. Require hardware-backed MFA or equivalent SSO policy.
3. Validate the signed access assertion at the API origin, including issuer,
   audience, signature, expiry, and immutable external subject.
4. Map that subject to an explicitly provisioned, active internal operator.
5. Validate the operations origin and mutation-CSRF posture.
6. Enforce the `creator_applications.review` permission. In this slice that
   permission is restricted to `ADMIN`; `MODERATOR` remains denied.
7. Use a dedicated short-lived operations audience/session if a first-party
   session is added. It must never reuse the public product cookie.
8. Configure trusted-proxy handling before treating forwarded client IPs as
   evidence.

Private DNS, an unlinked URL, and edge path filtering are defense in depth;
none substitutes for API-origin verification and authorization.

## State machine

| Current status      | Request more information | Reject                 |
| ------------------- | ------------------------ | ---------------------- |
| `PENDING`           | `NEEDS_INFORMATION`      | `REJECTED`             |
| `NEEDS_INFORMATION` | denied                   | `REJECTED`             |
| `REJECTED`          | denied (terminal)        | denied (terminal)      |
| `APPROVED`          | denied (outside slice)   | denied (outside slice) |

The request supplies `expectedStatus`, which is the caller's concurrency
precondition. The strict contract permits exactly these combinations:

- `PENDING` + `NEEDS_INFORMATION`
- `PENDING` + `REJECT`
- `NEEDS_INFORMATION` + `REJECT`

Same-state events, reopening, backwards transitions, `APPROVE`, and generic
status mutation are rejected. `identityVerificationStatus` remains unchanged,
and the applicant's `User.role` remains `MEMBER`.

## Concurrency and atomicity

The service performs one PostgreSQL transaction:

1. Conditionally update the application where both `id` and `status` equal the
   request's `applicationId` and `expectedStatus`.
2. If no row changed, distinguish a missing application (`404`) from a stale or
   unavailable transition (`409`).
3. Append one review event using the exact expected and resulting statuses.
4. Return the updated application and event.

PostgreSQL rechecks the conditional-update predicate after a concurrent writer.
Two reviewers acting on the same source status therefore produce one winner;
the stale request receives `409` and appends no event. The event insert follows
the update inside the same transaction, so an evidence-write failure rolls the
status change back.

The acyclic state graph makes the expected status a sufficient concurrency
token. A future design that permits reopening must add a monotonic revision
before introducing a cycle.

## API contract

The dormant router defines:

`PATCH /api/v1/admin/creator-applications/:applicationId`

The UUID parameter is validated before it reaches Prisma. The request is a
strict discriminated union containing only `action`, `expectedStatus`, and a
trimmed 10–500 character `reason`. Reviewer identity, timestamps, request ID,
and peer IP cannot be supplied by the request body.

Error behavior:

- missing/invalid operational authentication: `401 UNAUTHORIZED`
- authenticated principal without the permission, wrong role, or inactive
  internal account: `403 FORBIDDEN`
- malformed UUID/body or impossible action/status combination:
  `400 BAD_REQUEST`
- valid UUID with no application: `404 NOT_FOUND`
- stale, terminal, duplicate, or otherwise unavailable transition:
  `409 CONFLICT`

## Evidence model

Every successful transition appends a `CreatorApplicationReviewEvent` with:

- application and internal reviewer IDs
- exact source and destination statuses
- trimmed reason
- database-generated review timestamp
- request ID for correlation
- nullable direct peer IP

Application and reviewer foreign keys use restrictive deletion. There is no
event update or delete API. The migration also constrains allowed transitions
and rejects the ECMAScript leading/trailing whitespace and line-terminator set,
or out-of-range reason lengths, at the database layer. The API remains the
canonical normalization point before insertion.

This is application-level append-only evidence, not yet a complete immutable
operations audit system. Before deployment, the runtime database role must be
separate from the migration owner and must not receive `UPDATE`, `DELETE`, or
`TRUNCATE` privileges on review events. Request IDs are correlation values,
not authenticated identity, and peer IP is not asserted to be the originating
client while trusted-proxy configuration is undecided.

## Required verification

- Contract coverage for every allowed request and rejection of `APPROVE`,
  impossible combinations, malformed UUIDs, short/long reasons, and injected
  actor/evidence fields.
- The public API returns `404` for the operations route even when a valid
  public `ADMIN` session is supplied.
- Operations authorization covers missing identity, wrong permission,
  `MEMBER`, `CREATOR`, `MODERATOR`, inactive `ADMIN`, and active permitted
  `ADMIN`.
- Every state-machine cell is covered, including terminal and duplicate cases.
- Stored evidence matches the authenticated actor, trimmed reason, source,
  destination, request ID, and request metadata.
- Role and identity-verification state remain unchanged.
- Parallel requests based on the same status yield one success, one conflict,
  and one event.
- A forced event-write failure rolls the status update back.
- Restrictive parent deletion and database transition constraints are covered.
- The additive migration applies over Slice 1 data without modifying existing
  creator applications or acceptance records.
- Contracts, database generation/build, API build/tests, lint, formatting, and
  relevant full-repository gates pass before publication.

## Explicit exclusions and blockers

This slice does not include:

- `APPROVED`, creator role promotion, or Dashboard provisioning
- identity files, verification-provider integration, tax, banking, sanctions,
  or country-eligibility decisions
- an admin queue/detail UI or a deployed operations API server
- notifications, applicant resubmission, reopening, appeals, or reapplication
- moderator review permission
- a global sensitive-view/immutable audit system
- counsel-approved retention or deletion behavior

Production activation remains blocked on the private hostname/origin, IdP or
Cloudflare Access issuer/audience/JWKS identifiers, operator provisioning,
hardware-key enrollment and recovery policy, trusted-proxy configuration, and
the legal/vendor decisions already tracked in `PLAN.md`.
