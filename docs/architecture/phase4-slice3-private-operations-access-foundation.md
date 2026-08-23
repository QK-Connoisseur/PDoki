# Phase 4 Slice 3 — Private operations access foundation

Date: 2026-08-23 · Status: locally implemented and verified; draft-PR publication authorized · Deployment disabled

## Goal

Build and locally verify the provider-neutral identity and request-integrity
primitives needed by a future private operations service without creating or
activating that service.

This is a local engineering foundation, not an operational authentication
system. The normal public API must continue to return `404` for the dormant
creator-review route. No production adapter, private operations server,
first-party operations session, production database role, live provider
configuration, deployment, or operator provisioning is authorized by this
slice.

The authoritative non-approval review state machine and evidence constraints
remain in
[Phase 4 Slice 2 — Private creator-review state foundation](phase4-slice2-private-creator-review.md).
The activation requirements remain in the
[private operations activation gates](../operations/private-admin-activation-gates.md).

## Authorization boundary

This slice is limited to documentation, additive local implementation, and
local verification with synthetic `.example` identities, ephemeral signing
keys, injected test dependencies, and disposable databases where database
integration is required.

It does not authorize:

- mounting the review router in the normal API or adding a deployable operations
  server entry point;
- choosing or configuring an Access, identity, hosting, monitoring, or hardware-
  key provider;
- adding real issuers, audiences, JWKS locations, origins, subjects, operators,
  domains, endpoints, credentials, secrets, recovery data, or restricted
  evidence to the repository;
- provisioning production database roles, granting runtime privileges, changing
  live configuration, spending, deploying, or activating private operations;
- creator approval, role promotion, Dashboard access, creator publishing,
  identity-status mutation, identity files, tax or banking intake, sanctions
  screening, or country-eligibility decisions.

Passing local tests does not make a G1–G12 activation gate pass.

## Provider-neutral trust flow

The future boundary separates cryptographic identity proof from Pumdoki-owned
authorization:

1. A request presents a signed operations assertion through a future,
   separately approved operations transport.
2. The assertion verifier validates the compact token cryptographically and
   validates its exact configured trust claims.
3. The configured assertion verifier interprets provider-supported, signed
   authentication-method evidence against an injected exact-method allowlist.
   It may return internal `MFA` only for an explicitly allowlisted
   phishing-resistant hardware-backed method. Generic `mfa`, password, OTP,
   SMS, recovery, email, group, or token presence is never sufficient.
4. The verifier validates assertion timing but returns only validated issuer,
   exact immutable subject, and internal assurance. Token-supplied email, user
   ID, role, or permission claims never grant Pumdoki authority.
5. The database resolves the exact `(issuer, subject)` tuple to one explicitly
   provisioned internal operator mapping. The tuple is not lowercased, trimmed,
   email-derived, or otherwise normalized.
6. The database remains authoritative for mapping state and permissions. The
   mapped internal user must still be active, have the `ADMIN` role, and hold the
   explicit `creator_applications.review` permission when the request is
   evaluated.
7. Request-integrity checks validate the exact operations origin, JSON request
   shape, and an injected CSRF proof before a future mutation could reach the
   dormant review router.
8. Review evidence records only the authenticated internal reviewer ID and the
   already defined application-level fields. The external assertion and raw
   token never become review-event evidence.

An invalid assertion, invalid assurance result, unknown or inactive mapping,
missing permission, wrong role, or failed request-integrity check never falls
back to the public `pumdoki_session` or another weaker credential.

## Local signed-assertion verifier

The local implementation uses the repository-locked `jose` `6.2.5` resolution.
It is a provider-neutral verifier primitive, not a configured production
adapter.

The verifier requires injected, explicit trust configuration and key
resolution. It must enforce:

- a non-empty algorithm allowlist and rejection of unsigned, altered,
  disallowed-algorithm, unknown-key, and invalid-signature assertions;
- one exact issuer and the exact operations audience; missing, product,
  non-production, or additional unapproved audiences are rejected;
- mandatory `exp` and `iat`, expiry and issued-at validation, `nbf` when present,
  bounded clock tolerance, and a maximum assertion age;
- a mandatory, bounded, non-empty immutable `sub` that is accepted exactly or
  rejected, never normalized into a different identity;
- strict result parsing before any value enters the authorization boundary;
- fail-closed key-resolution and verification errors with no authentication
  fallback; and
- log hygiene that excludes raw assertions, signing material, sensitive claims,
  credentials, and subject-derived personal data.

Tests generate ephemeral keys at runtime and use an in-memory/local key set.
No real key, JWKS endpoint, issuer, audience, or provider claim mapping is
stored. Authenticated remote key retrieval, production caching and retry,
provider rotation, and live outage behavior remain deployment blockers under
G2.

## Database-owned operator mapping and permissions

The database, not the signed assertion, owns the relationship between an
external operations identity and Pumdoki authority.

The additive local design provides:

- one exact, unique issuer-and-subject mapping to an internal user;
- explicit active/inactive mapping state;
- explicit operations permission grants, initially limited to
  `creator_applications.review`;
- restrictive relationships so review evidence and identity mappings cannot be
  silently removed with an internal user; and
- lookups that require the mapping, internal user, `ADMIN` role, active user
  state, and permission to remain valid at request time.

No email lookup, domain enrollment, just-in-time provisioning, upstream role
claim, or public-product session can create an operator. No production operator
is seeded, and this slice adds no provisioning, permission-management, or
offboarding API or UI. Synthetic test rows exist only for local verification.
Controlled provisioning records, non-reassignment of an offboarded subject,
access reviews, and production offboarding evidence remain G4 requirements.

## Request-integrity seam

The local request-integrity middleware is deliberately independent of a
provider or session implementation. It requires:

- an exact configured operations origin;
- rejection of missing, opaque/`null`, cross-site, public-product, and other-
  environment origins;
- credentialed CORS with no wildcard behavior when a future operations server
  is designed;
- an explicitly accepted JSON media type and rejection of unexpected form or
  text encodings;
- bounded method, header, and body behavior supplied by the future operations
  composition; and
- a successful injected CSRF verifier for mutations.

The CSRF verifier is a seam only. Tests inject an explicit verifier and cover
missing, rejected, and failed proofs. This slice creates no production CSRF
adapter or first-party operations session. A future session decision must bind
an unpredictable CSRF token to an independently scoped, short-lived operations
session, or adopt another separately reviewed non-ambient request-integrity
design. An edge-injected assertion derived from an ambient browser cookie does
not bypass the G5 CSRF requirement.

## Direct-peer evidence

This slice does not establish a trusted proxy chain. Request evidence therefore
uses only `req.socket.remoteAddress`, stored and described as nullable direct-
peer evidence. `Forwarded`, `X-Forwarded-For`, and similar client-supplied
headers are ignored for evidence and cannot be described as the originating
client IP.

Production proxy trust, origin-bypass protection, verified proxy-derived
addresses, and rate-limit semantics remain G6 activation work. A blanket
`trust proxy = true` is prohibited.

## Router and runtime boundary

The normal `createApp()` composition remains unchanged and must not mount the
creator-review router. A public `ADMIN` product session remains insufficient and
the public operations path remains a generic `404`.

Focused tests may use the existing test-only operations application to exercise
the dormant router and middleware. This does not create a development or
production adapter, server, script, port, session, deployment artifact, or live
route.

The allowed non-approval transitions remain exactly:

- `PENDING` + `NEEDS_INFORMATION`;
- `PENDING` + `REJECT`; and
- `NEEDS_INFORMATION` + `REJECT`.

`APPROVE`, reopening, role promotion, and identity-status mutation remain
impossible and outside this slice.

## Activation-gate status

All gates remain `NOT EVALUATED` after this local slice:

| Gate | Local contribution                                                      | Why it is not `PASS`                                                                                               |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| G1   | Public-route denial and test-only composition coverage                  | No restricted deployment, operations server, edge boundary, or environment-isolation evidence                      |
| G2   | Strict `jose` verifier and ephemeral-key negative tests                 | No approved provider configuration, authenticated production JWKS retrieval, rotation, or deployed outage evidence |
| G3   | Injected hardware-method allowlist and weak-method denials              | No approved provider claim semantics, effective policy review, hardware enrollment, or control-plane evidence      |
| G4   | Database-owned synthetic mapping and permission checks                  | No controlled production provisioning, access review, or offboarding evidence                                      |
| G5   | Exact-origin, JSON, and injected-CSRF middleware tests                  | No live origin, operations session, production CSRF mechanism, or deployed browser/edge test                       |
| G6   | Direct-peer-only semantics and forwarded-header denial tests            | No reviewed deployed proxy chain or rate-limit evidence                                                            |
| G7   | Product-session non-use remains invariant                               | No production assertion transport or independently scoped operations session exists                                |
| G8   | Authorization data is database-owned                                    | No production runtime/migration roles, column grants, credential separation, or real-role denial proof is added    |
| G9   | Assertion redaction and application-level event limits are testable     | No separately controlled audit destination, retention, delivery monitoring, or alerts exist                        |
| G10  | Local abuse cases can be expanded around the new primitives             | Tests are not against an exact deployed release and security shape                                                 |
| G11  | Existing policy template remains the requirement                        | No controlled policy adoption, two-key enrollment, recovery separation, or exercises occur                         |
| G12  | The route remains absent from runtime and verifier failures fail closed | No independent disablement path, controlled incident runbook, or exercise exists                                   |

No checklist, local result, or code seam may change these states. Activation
requires current restricted evidence for the exact release and configuration.

## Explicit exclusions

This slice does not include:

- a private-admin login, bootstrap, logout, or session lifecycle;
- an operations server, admin API client, creator-review queue, detail page, or
  review controls in `apps/admin`;
- production CORS, CSRF, cookie, origin, DNS, proxy, edge, or hostname
  configuration;
- production database roles, grants, connection strings, migrations that name
  environment roles, or a grant-management workflow;
- a global immutable audit system, sensitive-view logging, monitoring provider,
  alert destination, retention policy, or incident system;
- real hardware keys, recovery, break glass, provider enrollment, or operator
  identities;
- creator approval, applicant notification/resubmission, reapplication,
  reopening, appeals, moderator permissions, or publishing; or
- identity-provider document handling, identity files, tax/banking data,
  country eligibility, legal-policy approval, or retention/deletion decisions.

## Local verification plan

Focused verification must cover:

1. Ephemeral-key signed assertions that accept only the exact configured
   algorithm, issuer, audience, required time claims, maximum age, immutable
   subject, and explicitly accepted synthetic hardware method.
2. Rejection of missing/malformed/unsigned/altered assertions, algorithm
   confusion, unknown keys, bad signatures, wrong or additional audiences,
   wrong issuer, missing `exp`/`iat`, expired/not-yet-valid/too-old assertions,
   malformed subjects, generic MFA, password, OTP, SMS, and recovery methods.
3. Fail-closed key-resolution, assurance-evaluation, mapping, and database
   failures with no public-session fallback and no raw token in logs or errors.
4. Unique exact issuer/subject mapping; rejection of unknown, duplicate or
   ambiguous, inactive, offboarded, permission-removed, non-`ADMIN`, suspended,
   and banned synthetic operators.
5. Rejection of token/body/header-supplied user IDs, emails, roles,
   permissions, actors, and review evidence.
6. Exact-origin, missing/opaque/cross-site/product-origin, JSON media-type, and
   injected-CSRF acceptance, rejection, and failure behavior.
7. Proof that forwarded headers cannot choose stored direct-peer evidence.
8. Continued generic `404` behavior on the public API with anonymous and valid
   public `ADMIN` product sessions.
9. Preservation of the Slice 2 state machine, atomicity, evidence, role, and
   identity-status tests, including the impossibility of `APPROVE`.
10. Clean additive migration verification on a disposable PostgreSQL 17
    database, focused API/database coverage, full relevant regression suites,
    TypeScript builds, lint, formatting, and diff checks.

The handoff and tracker must report local results as foundation evidence only.
They must keep Phase 4 partial, the router unmounted, and G1–G12 `NOT EVALUATED`.

## Local verification result — 2026-08-23

The provider-neutral foundation passed local verification on exact Node
`24.19.0` and npm `11.17.0`:

- the focused assertion, access, request-integrity, and logging suites passed;
- the full API suite passed `287/287` tests across 30 files, with the existing
  opt-in worker privilege file remaining explicitly skipped by normal discovery;
- all eight repository migrations applied to a clean disposable PostgreSQL 17
  database, a second deploy was a no-op, and the operations migration plus
  dormant creator-review integration passed `15/15` focused cases;
- API, database, contracts, public web, and private admin builds passed;
- web tests passed `166/166`, contracts passed `24/24`, and repository lint,
  formatting, Prisma generation/validation, and diff checks passed; and
- the test-created operations rows and migration schemas were absent after the
  suites, and both explicitly named disposable databases were dropped and
  confirmed absent.

The ordinary `pumdoki_dev` public schema was not migrated, repaired, or reset.
Docker's local PostgreSQL and Mailpit containers remain a development resource,
not deployment evidence.

This result does not alter the activation table above. The public application
still does not import or mount the review router, the admin app remains an
informational shell, and no live provider, operations session, runtime database
role, operator, origin, key, credential, deployment, or product workflow exists.
The founder authorized staging, committing, branch push, and opening a draft PR
on 2026-08-23. Merge remains separately gated.
