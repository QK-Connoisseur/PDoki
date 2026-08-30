# Phase 4 Slice 4 — YubiKey claim-schema evaluation

Date: 2026-08-24 · Updated: 2026-08-30 · Status: draft PR #17 open;
implementation-head CI passed; later heads require fresh CI · Deployment disabled

Base: published `dev` merge `24e1653` (PR #15). Working branch:
`codex/phase4-yubikey-claim-schema-evaluation`. The founder approved staging,
commit, push, and draft-PR publication on 2026-08-30. Implementation `317abda`
is pushed in [draft PR #17](https://github.com/QK-Connoisseur/PDoki/pull/17)
against `dev`. Implementation-head CI run `33337349347` passed on `317abda`.
Every later reconciliation head requires fresh CI before review or merge;
this is not a claim of final-head CI. The PR is not merged, and readiness
and merge require separate approval.

This publication closes out completed local work only. Further private-
operations development remains parked under the newer local plan. Bounded
content-domain design is the next proposed engineering priority, not live
Access testing. No live provider evaluation or activation is authorized by
this publication.

## Goal

Evaluate whether a narrowly scoped, separate Cloudflare Access assertion
verifier can validate the candidate's documented application-token shape and
return the existing `VerifiedOperationsIdentity` result into the database-owned
authorization boundary without weakening the founder-approved two-lock policy.
It does not translate Cloudflare tokens into, or reuse, the Slice 3 ES256
verifier.

This is a synthetic claim-schema evaluation, not provider selection or a live
Cloudflare Access integration. Cloudflare Access remains an evaluation
candidate. The existing account was used only for the sanitized browser and
hardware-key compatibility check recorded below. No account creation or
operations configuration, tenant/application/domain selection, provider
selection, issuer or JWKS integration, audience or subject mapping, operator,
provider signing key or credential, spending, deployment, live operational use,
or router activation is authorized.

The approved policy is recorded in
[Phase 4 founder decision record — private operations policy](phase4-private-operations-founder-policy-decisions.md).
The existing trust and authorization foundation remains authoritative in
[Phase 4 Slice 3](phase4-slice3-private-operations-access-foundation.md).

## Candidate documented application-token shape

Cloudflare's public application-token documentation currently describes:

- the `Cf-Access-Jwt-Assertion` request header;
- an `RS256` signed JWT with a key identifier;
- an exact Access team-domain issuer;
- an application audience represented as an array;
- `type: "app"`;
- `iat`, `exp`, and optional `nbf` timestamps; and
- a subject for identity-based authentication.

The same public application-token example does **not** currently document a
top-level `amr` claim. Cloudflare documents that Access policies can require
specific identity-provider MFA methods for browser applications, but policy
intent is not the signed, audience-bound hardware-method evidence required by
Pumdoki's G3 gate.

Official references used for this local evaluation:

- [Cloudflare Access application-token claims](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Access MFA enforcement](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/mfa-requirements/)
- [Yubico WebAuthn deployment and recovery practices](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/Best_Practices.html)

These references inform a candidate adapter; they are not evidence that a live
control exists or that Cloudflare satisfies G2 or G3.

## Provisional adapter contract

The local candidate adapter must fail closed unless all of the following are
true:

1. Exactly one non-empty compact assertion is supplied through the documented
   `Cf-Access-Jwt-Assertion` header. A cookie, public Pumdoki session,
   `Authorization` value, query parameter, request body, or alternate header is
   never a fallback credential.
2. The protected header uses only `alg: "RS256"`, exact `typ: "JWT"`, and a
   non-empty bounded `kid`. Keys resolve only through an injected synthetic
   source; attacker-selected `jku`, `x5u`, embedded `jwk`, `x5c`, and `crit`
   headers are rejected. The assertion must satisfy the existing signature,
   time, age, and log-hygiene rules.
3. `iss` exactly matches the injected synthetic Access issuer.
4. `aud` is an array containing exactly one string, and that string exactly
   matches the injected synthetic operations audience. Missing, scalar,
   additional, product, or other-environment audiences are rejected.
5. `type` is exactly `app`; `org`, missing, case-variant, and malformed values
   are rejected.
6. `iat` and `exp` are mandatory, `nbf` is enforced when present, and the
   assertion satisfies the existing maximum-age and clock-tolerance policy.
7. `sub` is a bounded, non-empty immutable string and is preserved exactly.
   Empty service-token subjects, normalized values, email substitution, and
   token-supplied Pumdoki IDs are rejected.
8. The proposed hardware-assurance contract is a top-level `amr` array of
   strings containing the exact, case-sensitive RFC 8176 method value `hwk`.
   Generic `mfa`, password, OTP, SMS, recovery, policy membership, email,
   group, device presence, or token presence is insufficient.
9. The adapter returns only the validated issuer, exact subject, and internal
   `MFA` assurance to the existing database-owned authorization boundary.

`amr: ["hwk"]` is a **proposed contract for evaluation**, not a documented
Cloudflare guarantee and not proof that a YubiKey performed the authentication.
If a controlled real-token review cannot show provider-supported, signed,
audience-bound evidence with equivalent hardware semantics, this candidate
fails G3 and must not be activated. The implementation must not infer `hwk`
from an Access allow policy, an email, a group, an IdP name, a browser claim, an
enrollment screen, or an unsigned identity lookup.

## Local implementation boundary

This slice may add only:

- an unmounted candidate Cloudflare assertion adapter;
- exact synthetic configuration parsing where needed by that adapter;
- ephemeral-RSA unit tests for the documented header, algorithm, issuer,
  singleton-array audience, application-token type, timestamps, subject, and
  proposed top-level `amr: ["hwk"]` contract; and
- negative tests for malformed, missing, weak, ambiguous, and provider-shape-
  incompatible inputs.

Tests must generate signing material at runtime and use only `.example` or
obviously synthetic values. The normal API/server must not import or mount the
candidate adapter or creator-review router. No production JWKS retrieval,
caching, rotation, provider outage behavior, configuration, session, CORS,
CSRF, proxy, database role, audit sink, or deployment belongs in this slice.

## Local verification result — 2026-08-24

The bounded candidate evaluation passed locally on exact Node `24.19.0`:

- the separate Cloudflare assertion-verifier suite passed `65/65` tests using
  only synthetic `.example` values and runtime-generated ephemeral RSA keys;
- the focused logger-redaction check passed `1/1`, so the combined candidate
  and credential-redaction result is `66/66`;
- focused TypeScript compilation including test sources, the API TypeScript
  build, scoped ESLint, and Prettier checks passed; and
- an import/mount review confirmed that the normal application and server do
  not import the candidate verifier or mount the creator-review router.

These results prove only that the local candidate fails closed against the
synthetic contract above. No real Cloudflare assertion, YubiKey, AAGUID,
provider configuration, remote JWKS, operator, account, or deployed boundary
was used by the automated evaluation. The founder-attested physical-key result
below is separate from these tests and does not change their synthetic scope.
The empirical signed-assertion proof remains mandatory, and G1–G12 remain
`NOT EVALUATED`.

## Founder-attested physical-key result — 2026-08-25

The founder completed two separate Cloudflare account-dashboard authentication
tests on the new Mac:

- the designated primary USB-C YubiKey received a new FIDO2 PIN locally and its
  existing Cloudflare security-key enrollment authenticated successfully; and
- the designated backup USB-A YubiKey retained its existing FIDO2 PIN and its
  existing Cloudflare security-key enrollment authenticated successfully.

The keys were tested one at a time. No key was reset, removed, re-enrolled, or
renamed. The PINs were entered only by the founder. No PIN, key serial, OTP
output, credential ID, AAGUID, recovery code, account identifier, screenshot,
or raw token is recorded in this repository or tracker.

This is useful physical compatibility and redundant account-authentication
evidence: both existing hardware-key enrollments worked independently on the
Mac. It is
**not** evidence from the exact candidate Cloudflare Access application. The
tests did not inspect an Access application assertion, issuer, audience,
subject, signed `amr` value, policy precedence, alternate-factor denial, or
recovery separation. They therefore do not prove the proposed
`amr: ["hwk"]` contract or make any G1–G12 gate pass.

## Controlled provider evidence still required

This is a future requirement, not the next authorized task. It remains parked
with further private-operations development.

Before the candidate could advance beyond local schema compatibility, a later
separately authorized review must:

1. exercise and document the separately stored recovery process without
   exposing restricted evidence;
2. authenticate through the exact candidate Access application with each key and
   compare the result with all available weaker and recovery paths;
3. inspect a real assertion through a controlled local process while keeping
   the raw token, issuer, audience, subject, tenant, key identifiers, and
   screenshots out of Git and ordinary logs;
4. determine whether the signed assertion itself carries provider-supported
   hardware-method evidence equivalent to the proposed `hwk` contract;
5. verify policy precedence, revocation, key rotation, outage, alternate-factor
   denial, and service-token denial; and
6. record only a sanitized pass/fail outcome and date in the repository after
   restricted evidence review.

A real token must never be pasted into an issue, chat, test fixture, commit,
tracker cell, or Markdown file. AAGUID, key serial, credential ID, recovery
code, personal address, and operator subject are restricted evidence as well.

## Decision outcomes

| Outcome                                                                            | Consequence                                                                                               |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Exact signed hardware-method evidence is proven and all later G2/G3 controls pass  | Cloudflare may remain a candidate; provider selection and activation still require separate approvals.    |
| The claim is absent, unsigned, ambiguous, policy-derived, or not hardware-specific | Cloudflare fails the G3 requirement for this design; do not weaken the verifier or infer `MFA`.           |
| The provider shape differs from the synthetic contract                             | Pause and document the difference; any adapter change requires fresh review, tests, and founder approval. |

## Current gate status

This local evaluation does not alter activation state:

- Phase 4 remains partial.
- The public API and normal server do not mount the creator-review router.
- No provider is selected and no live YubiKey assertion has been evaluated.
- G1–G12 remain `NOT EVALUATED`.
- `APPROVED`, role promotion, identity collection, and creator publishing
  remain absent.
- The founder approved the PLAN-aligned tracker and it was reconciled on
  2026-08-25 without deleting preserved records or recording restricted key
  evidence.
