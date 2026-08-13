# Future staging verification runbook

Date: 2026-08-13 · Status: draft; staging does not exist

## Scope and safety

Run this only after the candidate has provisional evaluation approval under
`staging-provider-decision-matrix.md` and a named release owner authorizes an
isolated staging verification window. Successful verification informs the
separate final-acceptance decision. It is a future checklist, not proof that
infrastructure or controls exist today, and neither provisional nor final
staging approval authorizes production/private-router activation.

Copy this runbook into the approved restricted change system before completing
it; keep the repository copy blank. Use only synthetic accounts and reserved
`.example` addresses. Store logs and screenshots only in that restricted
system; never record its URL/ID, credentials, tokens, cookies, recovery codes,
personal phone numbers, private endpoints, or real customer data in this file.

| Run field           | Value                            |
| ------------------- | -------------------------------- |
| Change/release      | `[IMMUTABLE RELEASE ID]`         |
| Staging environment | `[NON-SECRET ENVIRONMENT ALIAS]` |
| Verification window | `[START/END UTC]`                |
| Release owner       | `[OWNER]`                        |
| Database owner      | `[OWNER]`                        |
| Security observer   | `[OWNER]`                        |
| Recovery observer   | `[OWNER]`                        |
| Evidence location   | `[RECORDED OUTSIDE GIT]`         |
| Approved rollback   | `[ROLLBACK RECORD]`              |
| Result              | `[PASS / FAIL / BLOCKED]`        |

Stop immediately if the environment identity is ambiguous, production data is
visible, a command targets an unverified database, a secret appears in output,
or the approved rollback/recovery owner is unavailable. Never use Prisma
`migrate reset` in staging.

## 1. Preflight

- [ ] Confirm the AWS account/environment alias, region, release ID, public web
      origin, public API origin, and private operations origin against the
      approved change. Do not paste private identifiers here.
- [ ] Confirm staging and production have distinct domains, databases,
      credentials, encryption keys, mail configuration, monitoring projects,
      and access roles.
- [ ] Confirm the database has no production/customer records and all test
      identities use reserved addresses.
- [ ] Confirm human access uses named identities and hardware-backed MFA; CI
      uses the approved short-lived deployment role.
- [ ] Confirm the runtime database role is not the migration owner and does not
      have prohibited mutation rights on append-only evidence tables.
- [ ] Confirm current backup status, rollback stop conditions, incident channel,
      and named responders before changing anything.

Record externally: `[PREFLIGHT RESULT AND EVIDENCE]`

## 2. HTTPS, origin, and public routing

- [ ] Request the public web and API hostnames over HTTP. Confirm only the
      intended permanent HTTPS redirect occurs and no private hostname leaks.
- [ ] Request them over HTTPS. Confirm hostname validation, approved TLS policy,
      complete certificate chain, automated-renewal ownership, and an expiry
      alert.
- [ ] Confirm expected security headers and the approved HSTS rollout state.
- [ ] Confirm `GET /api/v1/health` reports the immutable release version and
      `GET /api/v1/ready` is healthy only when PostgreSQL is reachable.
- [ ] From the approved web origin, confirm credentialed CORS works. From an
      unapproved origin, confirm the API rejects the mutation/preflight as
      applicable and no state or side effect occurs—not merely that the browser
      cannot read the response. Include simple-form content types plus missing,
      opaque, product, and non-production origins in the denial matrix.
- [ ] Authenticate a synthetic user and inspect the session cookie: `Secure`,
      `HttpOnly`, the approved `SameSite` value, correct host/path scope, and no
      token in browser storage or URLs.
- [ ] Request an unknown public-web route and confirm the branded not-found
      state. Request `/admin` and representative `/api/v1/admin/*` paths and
      confirm the public surfaces reveal no operations workflow.

Record externally: `[HTTPS/ROUTING RESULT, REDACTED OUTPUT, AND EVIDENCE]`

## 3. Migration repeatability

- [ ] Resolve the target through the approved environment/secret reference and
      independently confirm it is the staging database before execution.
- [ ] Capture the pre-deploy schema/migration status and a recoverable backup or
      snapshot reference. Do not copy connection strings into evidence.
- [ ] Build the exact release through the normal clean install/build gate.
- [ ] With the release-scoped migration role, run `npm run db:deploy`. Do not
      run `db:migrate` or `migrate reset`.
- [ ] Confirm all committed migrations are applied, the application becomes
      ready, and a synthetic registration/login/settings/creator-application
      smoke flow succeeds.
- [ ] Run `npm run db:deploy` a second time and confirm it is a no-op.
- [ ] Confirm the prior application release remains compatible for the approved
      rollback window. Stop rather than attempting an improvised destructive
      schema rollback.

Record externally: `[MIGRATION RESULT, MIGRATION LIST, RELEASE ID, AND EVIDENCE]`

## 4. Backup restoration drill

- [ ] Select a backup within the approved retention window and record its age
      relative to the recovery-point objective `[RPO]`.
- [ ] Restore into a new isolated recovery target with no public route and new
      credentials. Never overwrite the source database.
- [ ] Use the approved recovery role to connect; verify migration state,
      referential constraints, record-count checks, and synthetic canary rows.
- [ ] Point an isolated API instance at the restored target and confirm
      readiness plus the approved read-only smoke checks.
- [ ] Measure time from authorization to usable recovery and compare it with
      `[RTO]`. Record gaps and owners.
- [ ] Revoke temporary access and dispose of the recovery target through the
      approved deletion/retention process only after the recovery observer signs
      off.

Record externally: `[BACKUP REFERENCE, OBSERVED RPO/RTO, RESULT, AND EVIDENCE]`

## 5. Monitoring, alerting, and PII redaction

- [ ] Generate one approved synthetic API error and one readiness degradation.
      Confirm alerts reach `[ROLE-BASED RECIPIENT]` within `[ALERT SLO]`, include
      environment/release/request ID, and contain an actionable runbook link.
- [ ] Confirm recovery notifications arrive and duplicate alerts group as
      designed.
- [ ] Search application logs, monitoring events, traces, alert notifications,
      and exports for the synthetic canary values. Confirm passwords, password
      hashes, raw email/reset/session tokens, cookies, authorization headers,
      secret values, full request bodies, and unnecessary personal data are
      absent.
- [ ] Confirm browser source maps do not expose secrets and access to unminified
      sources follows the approved policy.
- [ ] Confirm retention, deletion, sampling, region, support access, and
      subprocessor settings match the approved provider record.

Any prohibited field is a failed gate: disable the affected export, preserve
restricted evidence, rotate exposed credentials if applicable, and rerun only
after redaction is fixed.

Record externally: `[ALERT TIMING, REDACTION RESULT, AND EVIDENCE]`

## 6. Redis/cache and queue outage semantics

Execute only after Redis/cache or a queue is actually introduced. Mark each
unimplemented dependency `NOT APPLICABLE`; do not simulate a passing result.

- [ ] Confirm the approved owner initiates a controlled disconnect/failover and
      monitoring detects timeout, eviction, reconnect, and failover states.
- [ ] Verify login, password-reset, and email-request throttles follow the
      documented conservative behavior; they must not become silently unlimited
      across instances.
- [ ] Verify health/readiness behavior matches the dependency classification:
      required dependencies block readiness; optional ones produce an explicit
      degraded signal without hiding risk.
- [ ] For queued work, prove an acknowledged durable job is not lost, retry
      backoff is bounded, poison work reaches the dead-letter path, and operator
      replay is authorized and audited.
- [ ] Confirm a cold/empty Redis instance cannot resurrect a revoked session,
      change a creator-review result, or create a duplicate ledger/payment
      effect.
- [ ] Confirm payment webhook/Veso idempotency remains PostgreSQL-backed and
      correct while Redis is unavailable. Redis may reduce duplicate work but
      is never the durable financial record.
- [ ] Restore service and verify controlled recovery without a retry storm.

Record externally: `[OUTAGE TIMELINE, OBSERVED SEMANTICS, AND EVIDENCE]`

## 7. Transactional email authentication and events

Execute only after written provider acceptance of the intended adult creator
business, an approved DPA/data flow, and a staging sender domain exist.

- [ ] Send verification and password-reset templates only to controlled test
      inboxes. Confirm links use the staging web origin and no identity,
      payment, or explicit-content data is present.
- [ ] Inspect received headers and DNS evidence: SPF authorization, aligned DKIM
      signature, DMARC alignment/policy/report destination, and the approved
      transactional sender isolation all pass.
- [ ] Confirm transport uses validated TLS and scoped credentials that can be
      revoked without affecting unrelated services.
- [ ] Trigger approved synthetic delivery, soft bounce, hard bounce, and
      complaint events. Confirm signed webhook verification, timestamp/replay
      protection, PostgreSQL event idempotency, classification, suppression,
      alerting, and operator ownership.
- [ ] Confirm raw verification/reset tokens and unnecessary message bodies are
      absent from provider event history, application logs, alerts, and webhook
      evidence according to the approved retention policy.
- [ ] Confirm the provider export/deletion and emergency-exit procedures have
      named owners. Deliverability success does not approve legal template copy.

Record externally: `[AUTHENTICATION HEADERS, EVENT RESULTS, AND EVIDENCE]`

## 8. Private operations denial checks

The current creator-review router must remain unmounted until the complete
operations boundary is separately approved and deployed.

- [ ] Against the public API, request the creator-review path anonymously and
      with a valid public `ADMIN` product session. Both must remain generic
      `404` responses.
- [ ] Confirm the public web app has no operations navigation or route and the
      operations origin is not discoverable in public assets.
- [ ] If a future private operations API is under verification, deny requests
      with missing, malformed, expired, wrong-issuer, wrong-audience, or invalid-
      signature assertions; insufficient MFA; unknown/inactive operator;
      missing permission; wrong origin/CSRF proof; or untrusted forwarded IP.
- [ ] Confirm a public product cookie never authenticates the private API and a
      private operations credential is audience-bound, short-lived, and not
      accepted by the public product as privilege evidence.
- [ ] Confirm direct-origin/bypass attempts do not avoid edge restrictions and
      every denied attempt is correlated without logging the credential.
- [ ] Confirm no tested path can `APPROVE`, promote a role, mutate identity
      status, or bypass the Slice 2 expected-status transaction.

Record externally: `[DENIAL MATRIX, RELEASE ID, AND EVIDENCE]`

## 9. Lost hardware-key recovery drill

Perform as an announced tabletop or with a dedicated synthetic operator. Never
disable the last working factor or use the founder's personal recovery contact
as test data.

- [ ] Confirm the operator has at least two independently stored, pre-enrolled
      hardware-backed factors and that backup custody/access is documented.
- [ ] Declare one test key lost. Confirm it can no longer authenticate after
      revocation and existing privileged sessions follow the approved revocation
      policy.
- [ ] Recover with the independent factor through the approved identity-
      verification and, if required, multi-person authorization path. No help-
      desk or phone-only shortcut may silently weaken the policy.
- [ ] Enroll a replacement, verify it, update inventory/custody, and confirm the
      old key cannot be reactivated without a new approved ceremony.
- [ ] Confirm alerts and immutable audit evidence show requester, approver,
      timestamps, factor change, session revocation, and recovery outcome. If the
      selected control plane cannot make that evidence immutable, record the
      limitation accurately and require separately controlled tamper-resistant
      delivery. Never expose recovery codes or personal contact details.
- [ ] Exercise the documented break-glass path separately, including access
      expiry, post-use credential rotation, review, and re-sealing.

Record externally: `[TABLETOP/DRILL RESULT, GAPS, OWNERS, AND EVIDENCE]`

## 10. Closeout

- [ ] Mark every section `PASS`, `FAIL`, `BLOCKED`, or `NOT APPLICABLE` with
      evidence; blank checks are not passes.
- [ ] Open tracked remediation for every deviation with severity, owner, due
      date, and release consequence.
- [ ] Confirm no test credentials, public recovery targets, synthetic messages,
      or elevated temporary roles remain.
- [ ] Record measured cost against `[MONTHLY COST CEILING]` and verify alerts.
- [ ] Obtain release, database, security, and recovery-owner sign-off.

Staging passes only when all required sections pass and no unresolved finding
can expose data, duplicate a financial effect, bypass operations controls, or
prevent recovery within the approved objectives.
