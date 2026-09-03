# Phase 4 founder decision record — private operations policy

Date: 2026-08-24 · Status: founder-approved direction; operational evidence and
activation remain incomplete

## Decision context

The founder approved all seven private-operations policy decisions below while
Phase 4 remains partial. These decisions constrain later engineering, provider
evaluation, enrollment, deployment, and operations work. They do not themselves
select a provider, create or configure an account, enroll an operator, prove a
hardware key, authorize spending, deploy a service, mount the creator-review
router, or make any G1–G12 activation gate pass.

The implementation boundary remains defined by
[Phase 4 Slice 3 — Private operations access foundation](phase4-slice3-private-operations-access-foundation.md),
and activation remains governed by the
[private operations activation gates](../operations/private-admin-activation-gates.md).

## Approved decisions

### D1 — Initial operator scope

Private-beta operations begin founder-only. Every operator must have an
individual identity; shared accounts and shared daily-use keys are prohibited.
Adding another operator is a new, explicit provisioning decision rather than an
automatic consequence of employment, an email domain, a group, or a public
Pumdoki role.

### D2 — Phishing-resistant hardware authentication

Normal private-operations access requires phishing-resistant hardware-backed
authentication. Each covered operator must enroll and independently test a
primary hardware key and a separately stored backup key. Password, SMS, email,
OTP, security questions, or possession of a normal browser session cannot
satisfy or silently recover the hardware-key requirement.

### D3 — Private operations isolation

The operations application must use a restricted origin and an independently
scoped, short-lived operations session that is separate from the public
Pumdoki application and its `pumdoki_session`. A hidden route or successful
public-product login is not an operations boundary.

### D4 — Two-lock authorization

Every operations request must pass two independent locks:

1. **Identity lock:** the approved identity/access layer proves the exact
   person and produces signed evidence of an approved phishing-resistant,
   hardware-backed authentication method.
2. **Pumdoki authorization lock:** Pumdoki resolves the exact signed
   `(issuer, subject)` tuple to an explicitly provisioned, active operator; the
   mapped internal user remains active with the `ADMIN` role; and the operator
   holds the exact permission required for the requested action.

An identity-provider login alone never grants operations access. Email address,
company domain, identity-provider group, upstream role claim, public Pumdoki
login, token-supplied user ID, or token-supplied permission cannot replace the
Pumdoki-owned operator mapping and permission check.

The initial narrow permission is `creator_applications.review`. It permits only
the separately specified non-approval creator-application transitions; it does
not grant creator approval, payouts, identity-record access, moderation,
account control, role promotion, or publishing. Each future sensitive
capability requires a separately designed and founder-approved permission.

Authorization must be evaluated at request time and rechecked inside the same
database transaction as a review mutation so suspension, revocation, role
change, or permission removal takes effect immediately. The founder's normal
identity may receive the narrow review permission only through the controlled
provisioning process. Break-glass identities have no standing creator-review
permission.

### D5 — Controlled provisioning and offboarding

Founder-controlled records must govern enrollment, least-privilege grants,
permission changes, periodic access review, suspension, revocation, and
offboarding. There is no domain-based or just-in-time enrollment. An offboarded
external subject is never reassigned to another person, and revocation must be
provably effective at the API boundary.

### D6 — Separated recovery and break glass

Emergency recovery must remain separate from routine access and from the same
single identity, device, mailbox, phone, or storage dependency being recovered.
Break glass stays hardware-backed, least-privilege, time-bounded, alerted, and
reviewed. It is not an everyday login path and must not silently downgrade
normal authentication.

### D7 — Independent audit and disablement

Private operations require a separately controlled audit destination, an
approved retention schedule, delivery monitoring, named alert ownership, and a
tested emergency disablement path. Authorization, identity, key, audit,
database, proxy/origin, or deployment incidents must fail closed and preserve
evidence without relying only on the potentially compromised path.

## Relationship to the implementation

PR #15 merged the dormant Slice 3 foundation into `dev` as `24e1653`; post-
merge GitHub Actions run `32784338614` passed the API, web/private-admin, and
real-stack Playwright jobs. That code is consistent with the D4 two-lock model:
it validates a provider-neutral signed identity first, then resolves a
Pumdoki-owned operator mapping and permission and rechecks authorization during
the mutation transaction.

The merged code remains local foundation evidence only. It does not mount the
creator-review router or establish the provider, live issuer/JWKS/origin,
hardware-key claim semantics, operations session, controlled operator,
restricted runtime database role, audit destination, deployment, or incident
process required by these decisions.

The bounded local
[Phase 4 Slice 4 — YubiKey claim-schema evaluation](phase4-slice4-yubikey-claim-schema-evaluation.md)
is implemented and locally verified with synthetic inputs only. The founder
approved publication on 2026-08-30, and implementation `317abda` is pushed in
[draft PR #17](https://github.com/QK-Connoisseur/PDoki/pull/17) against `dev`.
Implementation-head CI run `33337349347` passed on `317abda`; every later
reconciliation head requires fresh CI before review or merge. No final-head CI
or merge is claimed. Cloudflare Access is an
evaluation candidate, not a selected provider. On 2026-08-25, the founder
independently authenticated the existing primary USB-C and backup USB-A
Cloudflare account security-key enrollments on the new Mac. That sanitized,
account-level physical-key result does not inspect or prove the exact candidate
Access application assertion, signed hardware-method claim, AAGUID, recovery
separation, or any G1–G12 gate.

## Status and follow-up

- Publication closes out completed Slice 4 work only. Further private-
  operations development remains parked under the newer local plan; bounded
  content-domain design is the next proposed engineering priority, not live
  Access testing. PR readiness and merge require separate approval.
- Phase 4 remains partial.
- The creator-review router remains unmounted from the normal API.
- `APPROVED`, role promotion, identity collection, and creator publishing
  remain absent.
- G1–G12 remain `NOT EVALUATED`.
- Live identifiers, credentials, tokens, subject values, PINs, OTP output,
  AAGUIDs, credential IDs, key serials, account identifiers, recovery material,
  and restricted evidence must stay out of Git.
- The founder approved the PLAN-aligned master tracker at home. Its 2026-08-25
  reconciliation preserves every legacy record and records only sanitized
  decision and physical-test outcomes.
