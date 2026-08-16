# Private operations activation gates

Status: template only; no control is asserted to exist or pass

Scope: the separately deployed private operations application and dormant
Phase 4 Slice 2 creator-review API

This packet contains no production values. Never add real names, domains,
hostnames, account or subject identifiers, key serials, recovery codes, tokens,
credentials, secrets, or personal recovery details. Keep completed evidence and
configuration in approved restricted systems.

The authoritative boundary, state machine, and evidence design remain in
[Phase 4 Slice 2 — Private creator-review state foundation](../architecture/phase4-slice2-private-creator-review.md).
This packet does not authorize approval, role promotion, identity files, tax or
banking intake, moderator review, or creator publishing.

## 1. Pass/fail activation gates

The review router must remain unmounted until every mandatory gate is `PASS`
for the exact release and production configuration. Code without current,
reviewed evidence is `NOT EVALUATED`, not `PASS`.

Allowed gate states are `NOT EVALUATED`, `FAIL`, and `PASS`. Every G1–G12 gate
is mandatory. Conditional design branches must satisfy the applicable `PASS`
path; they do not make the gate `NOT APPLICABLE`.

Any change to identity provider, issuer, audience, signing-key trust, effective
Access/IdP policy or precedence, accepted authenticator/AMR set, MFA/session
duration, operator or factor state, origin, session design, proxy chain,
database role, permission mapping, audit destination, or release invalidates the
affected gate.

### G1 — Deployment boundary

**PASS when:**

- `apps/admin` is independently deployed on a restricted origin and is absent
  from public navigation and route manifests.
- The review router is mounted only in the operations server, after all
  authentication, authorization, and request-integrity middleware.
- The public API returns `404` for the route even with a valid public `ADMIN`
  product session.
- Edge restrictions and API-origin verification both apply; production and
  non-production trust configurations are separate.

**FAIL when:** a hidden URL, private DNS, edge path filter, or public role is
treated as the security boundary, or the public API mounts the router.

**Evidence:** deployment review plus public-route, middleware-order, and
environment-isolation tests.

### G2 — Signed assertion verification

The operations API must verify the access assertion itself.

| Check         | PASS requirement                                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issuer        | Exact configured production issuer only; missing, wrong, or ambiguous issuer is denied.                                                                                          |
| Audience      | Exact operations API audience only; product, non-production, missing, or additional unapproved audience is denied.                                                               |
| Signature     | Trusted public key plus explicit algorithm allowlist; unsigned, altered, wrong-algorithm, unknown-key, invalid-signature, and key-fetch-failure cases fail closed.               |
| Key lifecycle | Authenticated key retrieval, bounded caching/retry, and tested rotation; trust-source failure never skips verification.                                                          |
| Time          | `exp` and `iat` are mandatory; expiry, issued-at time, `nbf` when present, bounded clock tolerance, and maximum assertion age are enforced.                                      |
| Subject       | Exact immutable `sub` is mandatory, non-empty, preserved in issuer context, and strictly parsed. Email, display name, request headers, and body values cannot substitute for it. |
| Hygiene       | Raw assertions, tokens, signing material, and sensitive claims never enter logs or review evidence.                                                                              |

**FAIL when:** verification occurs only at the edge, matching is permissive,
expiry is optional, email determines identity, or verifier failure
authenticates a request.

**Evidence:** redacted configuration review, claim/signature unit tests,
production-adapter integration test, rotation/outage test, and log review.

### G3 — Hardware-backed MFA

**PASS when:** every operator and every identity able to change the Access/IdP
policy, DNS/origin routing, deployment, secret store, or database grants must use
phishing-resistant hardware MFA; the
audience-specific access policy has no weaker, bypass, service-token, or
lower-precedence override path; and the production verifier emits the internal
`MFA` assurance value only after verifying signed, provider-supported evidence
that specifically identifies an allowlisted hardware-backed method (for
example, an RFC 8176 `hwk` value or a documented equivalent). Generic `mfa`,
password, OTP, SMS, recovery, policy intent, email, group, or token presence
alone is insufficient. If the selected IdP/access combination cannot
cryptographically bind specific hardware-backed assurance to the validated
assertion, activation remains blocked. Every operator and security-control-plane
administrator also has two separately stored, independently tested keys under
Section 2.

**FAIL when:** password, SMS, a personal phone, a personal mailbox, or security
questions alone can satisfy or recover operations access.

**Evidence:** organization/application/policy precedence review, assertion-claim
review, API assurance tests, weaker/alternate-policy denial tests, controlled
key-enrollment records, and security-control-plane access/change review.

### G4 — Provisioning and permissions

**PASS when:**

- Operators are explicitly provisioned; there is no domain-based or just-in-
  time enrollment.
- Verified issuer context plus exact `sub` maps uniquely to one active internal
  operator. Email and public accounts are not identity mappings.
- The API checks active state, `ADMIN` role, and the explicit
  `creator_applications.review` permission on every request.
- `MEMBER`, `CREATOR`, `MODERATOR`, inactive, offboarded, unprovisioned, and
  permission-removed principals are denied immediately.
- Provisioning, permission changes, suspension, and offboarding have approved,
  auditable records. An offboarded subject is never reassigned.

**FAIL when:** a role claim or email implicitly grants access, every admin
inherits review permission, mappings are ambiguous, or only the UI authorizes.

**Evidence:** mapping review, role/permission matrix tests, duplicate-mapping
test, deprovisioning test, and current access review.

### G5 — Origin and mutation-CSRF controls

**PASS when:** the API uses an exact operations-origin allowlist; credentialed
CORS never uses a wildcard; browser mutations reject missing, opaque,
cross-site, product, and non-production origins; methods, headers, content types,
and body sizes are bounded; and unexpected form encodings are rejected.

If any ambient credential or cookie is used, mutations also require an
unpredictable anti-CSRF token tied to the operations session. `SameSite` and
CORS are not sufficient alone. An edge-injected assertion derived from the
browser's ambient `CF_Authorization` cookie is still cookie-backed for this
threat model and does not qualify for a CSRF exemption. Only a genuinely
non-ambient bearer credential explicitly attached by the client may use a
different reviewed request-integrity design; it must never fall back to product
cookies or automatic credentials.

**FAIL when:** origin checks exist only in the UI, matching uses suffixes or
reflection, or product and operations origins share ambient credentials.

**Evidence:** CORS/preflight, exact-origin, cross-site, missing/opaque-origin,
content-type, and CSRF mismatch/replay tests as applicable.

### G6 — Trusted proxy policy

**PASS when:** the deployed proxy chain is documented in the restricted system;
the app explicitly trusts only that boundary; forwarded headers from untrusted
peers are ignored; a blanket `trust proxy = true` is prohibited; rate limits and
evidence use the reviewed semantics; and stored addresses are accurately
labelled as direct-peer or verified proxy-derived values.

**FAIL when:** arbitrary clients can choose their evidence or rate-limit address
with forwarding headers, or an unverified value is called the originating IP.

**Evidence:** infrastructure-to-application mapping and tests for untrusted
headers, direct access, extra hops, spoofed positions, missing addresses, and
rate limiting.

### G7 — Session isolation

**PASS when:** either every request uses a freshly verified short-lived
assertion and no first-party operations session exists, or a dedicated session
has all of these properties:

- separate audience, cookie name, cryptographic keys, storage, and revocation
  from the product session;
- short idle and absolute expiry, rotation, immediate revocation, and server-
  side permission rechecks;
- creation only from a freshly verified operations assertion with exact MFA;
- `Secure`, `HttpOnly`, narrowly scoped cookie and G5-compliant CSRF defense.

In both designs, `pumdoki_session` can never authenticate or upgrade into an
operations principal.

**FAIL when:** product and operations sessions share trust material or renewal,
a public session bootstraps operations, or removal waits for long expiry.

**Evidence:** architecture decision and public-session, cross-audience,
cross-environment, expiry, rotation, revocation, and cookie tests as applicable.

### G8 — Runtime database grants

**PASS when:**

- The service uses a dedicated runtime role distinct from database, schema,
  migration, backup, and human owners.
- It has only required schema/table/sequence rights and no ownership, DDL,
  role-management, bypass, or grant capability.
- It may append review events but cannot `UPDATE`, `DELETE`, or `TRUNCATE` them;
  read access is separately justified and minimized.
- `PUBLIC` and default privileges are reviewed so future objects do not inherit
  broad access.
- Tests connect as the real runtime role: allowed transactions succeed,
  forbidden event changes and DDL fail, and event-write failure rolls the
  application status change back.
- Migration and emergency credentials are unavailable to the running app.
- The public API and operations service use different runtime roles. The public
  role cannot update creator-review or identity status and cannot insert review
  events. The operations role has only the column-scoped application update
  needed for `status`/`updatedAt` plus event insertion; it cannot change
  applicant fields, `identityVerificationStatus`, `User.role`, or acceptance
  evidence.
- Denial tests connect as both real runtime roles and exercise every prohibited
  table/column operation, including raw SQL outside the service layer.

**FAIL when:** the app connects as an owner/migration role or ORM behavior is
used as proof of database enforcement.

**Evidence:** redacted grant inventory, runtime-role integration and forbidden-
SQL tests, default-privilege review, and credential-separation review.

### G9 — Audit limitations and minimum monitoring

`CreatorApplicationReviewEvent` records successful transition evidence. It is
not a complete immutable operations audit: it does not prove authentication,
record every denial/read, prevent a database owner from changing data, or
provide monitoring.

**PASS when:** successful events contain the authenticated internal operator,
state change, reason, database time, request correlation, and accurately
described address evidence; structured security logs cover authentication and
authorization failures, verifier outages, provisioning/permission changes,
break-glass use, session lifecycle, and mutation outcomes; any sensitive view
is logged before release; and logs reach a separately controlled destination
with protected retention, delivery-failure monitoring, and alerts.

Raw tokens, recovery data, and unnecessary application data must be absent.
The activation record must list residual audit limits and prohibited actions.

**FAIL when:** review events are described as a complete/immutable audit log,
sensitive views are unlogged, delivery fails silently, or ordinary operators
can alter the only audit copy.

**Evidence:** event and log-schema tests, redaction review, delivery-failure and
alert tests, retention/access approval, and residual-limit record.

### G10 — Abuse verification

All cases must run against the release candidate and deployed security shape.
No denied case may create unauthorized state or a review event.

| Test family       | Required result                                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boundary          | Public route stays `404`; public `ADMIN` session cannot authenticate to operations.                                                                                                                                                                       |
| Assertion         | Missing/malformed, unsigned, altered, wrong-algorithm, unknown-key, bad-signature, wrong issuer/audience, expired/not-yet-valid/too-old, missing-expiry, and missing-issued-at assertions are denied. Trust outage fails closed.                          |
| Identity/MFA      | Missing, blank, email-derived, duplicated, unknown, ambiguously mapped, inactive, offboarded, permission-removed, weak-factor, and non-`MFA` principals are denied.                                                                                       |
| Authorization     | `MEMBER`, `CREATOR`, and `MODERATOR` are denied; concurrent suspension/removal cannot create durable access.                                                                                                                                              |
| Request integrity | Wrong/missing/opaque origin, CSRF mismatch/replay, unexpected content type, oversized body, invalid UUID, and injected actor/evidence fields are rejected.                                                                                                |
| Proxy             | Untrusted forwarded values, extra hops, and direct-access spoofing cannot choose evidence or bypass rate limits.                                                                                                                                          |
| Session           | Product, expired, revoked, wrong-audience, and wrong-environment sessions are denied; assertion failure has no session fallback.                                                                                                                          |
| Review model      | Every state-machine cell is covered; `APPROVE`, reopening, duplicate/terminal transitions, role promotion, and identity-status mutation remain impossible.                                                                                                |
| Atomicity         | Same-status parallel requests yield one success, one conflict, and one event; event-write failure rolls back status.                                                                                                                                      |
| Database          | Actual public and operations runtime roles can perform only their allowed work; the public role cannot review, the operations role cannot change applicant/identity/role/acceptance data, and neither can modify/delete/truncate evidence or execute DDL. |
| Observability     | Denials are observable and logs contain no assertions, secrets, recovery data, or unnecessary personal data.                                                                                                                                              |
| Availability      | Body and rate controls bound repeated invalid requests without trusting spoofable address input.                                                                                                                                                          |

**PASS when:** automated results, staging abuse report, and any manual review are
current and green. **FAIL when:** only happy paths or mocked boundary adapters
have been tested.

### G11 — Hardware-key policy adopted

**PASS when:** Section 2 is adopted in the controlled policy system for operators
and all security-control-plane administrators, with roles, cadences, storage and
recovery arrangements, alert paths, and evidence; every covered individual has
two independently stored and tested keys; recovery separation is verified; and
enrollment, policy-change, key-loss, break-glass, access-review, and offboarding
exercises pass.

### G12 — Disablement and incident response

**PASS when:** authorized responders can disable the origin and unmount/deny the
route without weakening authentication; runbooks cover issuer/signing-key,
operator, key, database credential, proxy/origin, and audit-delivery incidents;
dependencies fail closed; and exercises prove revocation, containment, evidence
preservation, restoration approval, and gate re-evaluation.

**FAIL when:** review continues through an identity/audit failure, disablement
depends only on the compromised path, or restoration automatically remounts the
route.

**Evidence:** disablement, identity/key outage, credential-revocation, and
audit-failure exercises plus reviewed controlled runbooks.

## 2. Operator hardware-key and recovery policy template

Adopt this template outside the repository before provisioning production
operators or any administrator able to change identity/access policy,
DNS/origin routing, deployment, secrets, or database grants. Never copy their
identities, key serials, recovery codes, personal contacts, or storage details
back into this file.

### Mandatory policy

- Each human operator and security-control-plane administrator has an individual
  identity; shared accounts and shared daily-use keys are prohibited.
- Each such person enrolls and independently tests at least two phishing-
  resistant hardware keys: a primary and a backup.
- The backup is in a different physical failure domain—not on the same device,
  keyring, bag, or routine location as the primary.
- Recovery cannot depend solely on the workstation, phone, personal number,
  personal mailbox, password-manager session, or cloud identity being
  recovered. At least one recovery authority and factor survive loss of the
  primary identity plane.
- SMS or personal contact details are never the sole operations-recovery path.
  Any provider-imposed temporary use is a recorded risk and is replaced only
  after independent recovery is tested.
- Recovery and break-glass actions are time-bounded, alerted, reviewed, and
  never silently downgrade normal MFA.

### Lifecycle checklist

| Event                 | Required actions                                                                                                                                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enrollment            | Verify operator out of band; approve least privilege; create exact subject mapping; enroll primary and separately stored backup keys; require local user verification; test each key and API `MFA`; prove weak-factor and product-session denial; grant production permission only after both keys and recovery separation pass. |
| Routine review        | Use primary, secure backup; test backup on an adopted cadence; review active mappings, permission, factor count, backup-test recency, and recovery authority after organizational changes and on schedule.                                                                                                                       |
| Primary lost/failed   | Suspend if compromise is possible; use backup through normal MFA; revoke lost factor and sessions; inspect activity; enroll/test a replacement backup before routine work; record incident.                                                                                                                                      |
| Both keys unavailable | Use break glass; never improvise with a personal phone/mailbox or weak factor.                                                                                                                                                                                                                                                   |
| Offboarding           | Disable internal mapping and permission at the effective time; remove upstream access; revoke sessions, factors, assertions where supported, credentials, and recovery authority; recover/revoke organization keys; transfer work without identity; inspect activity; prove former access is denied; never reassign `sub`.       |

### Break-glass template

- Maintain emergency access separate from ordinary identities and the same
  single recovery dependency. It remains hardware-backed, never password-only.
- Store two emergency factors or recovery components separately from each other
  and daily-use keys. Require two authorized roles when staffing permits; any
  temporary exception requires explicit restricted risk acceptance.
- Prefer no standing creator-review permission. Emergency elevation is least
  privilege, time-bounded, automatically expires, and is removed after use.
- Alert every authentication, elevation, and action. Record authorization roles,
  reason, time window, actions, and review in the controlled incident system—
  never credentials or recovery material.
- After use, revoke sessions/elevation, inspect activity, replace exposed
  recovery material, retest normal access, and complete post-incident review.
- Exercise break glass on an adopted cadence in a safe environment. An untested
  procedure does not pass G11.

## Activation record template

Complete this in the restricted change-management system, not this repository.

| Field                   | Required content                                                         |
| ----------------------- | ------------------------------------------------------------------------ |
| Release and environment | Exact immutable release and activation environment                       |
| Scope                   | Routes and non-approval actions being enabled                            |
| G1–G12                  | State, restricted evidence location, reviewer role, and review time      |
| Exceptions              | Rationale, compensating control, expiry, and owner; no silent waiver     |
| Residual limitations    | Audit, identity, legal, vendor, and operational actions still prohibited |
| Rollback                | Tested route-disablement method and decision authority                   |
| Approvals               | Security, operations, and release approval roles and times               |

Activation is `FAIL` if any gate is `FAIL` or `NOT EVALUATED`, if evidence is
stale for the release/configuration, or if deployed scope exceeds reviewed
scope. Passing these gates for non-approval review does not satisfy the separate
blockers for creator approval, identity handling, publishing, payments, or
Phase 11 operations.

## Official implementation references

These vendor references are implementation aids, not evidence that a gate has
passed:

- [Cloudflare Access: validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Access: application-token claims](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/)
- [Cloudflare Access: MFA methods and policy precedence](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/mfa-requirements/)
- [Cloudflare Access: session management](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/)
- [Yubico: spare-key guidance](https://www.yubico.com/products/spare/)
- [Yubico: WebAuthn deployment and recovery practices](https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/Best_Practices.html)
