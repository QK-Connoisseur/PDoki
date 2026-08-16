# Staging infrastructure and provider decision matrix

Date: 2026-08-13 · Status: draft planning artifact; no providers selected

## Purpose

This document turns the remaining Phase 2 infrastructure decisions into an
evidence-based review packet. It does not authorize a deployment, create an
account, select a vendor, or prove that any control is operational.

Copy the applicable template into the approved restricted decision system before
completing it. Keep this repository copy blank. Record secret references in the
approved secret manager; never place credentials, restricted-record links or
IDs, account identifiers, personal phone numbers, recovery codes, customer data,
or private endpoints in this file.

## Decision metadata

| Field                    | Value                                  |
| ------------------------ | -------------------------------------- |
| Decision owner           | `[FOUNDER / ENGINEERING OWNER]`        |
| Security reviewer        | `[REVIEWER]`                           |
| Privacy/legal reviewer   | `[COUNSEL OR PRIVACY REVIEWER]`        |
| Target decision date     | `[YYYY-MM-DD]`                         |
| Architecture record      | `[RECORDED OUTSIDE GIT]`               |
| Cost ceiling             | `[USD AMOUNT PER MONTH, BEFORE TAXES]` |
| Cost-alert recipients    | `[ROLE-BASED RECIPIENTS]`              |
| Intended staging region  | `[AWS REGION AFTER LEGAL REVIEW]`      |
| Data residency rationale | `[DECISION RECORD]`                    |

## Non-negotiable staging guardrails

- Staging is a separate environment with distinct credentials, domains,
  databases, storage, encryption keys, mail configuration, and access policy.
- Staging must use synthetic accounts and reserved `.example` addresses. No
  production identity documents, payment data, creator media, customer data,
  personal recovery details, or copied production database belongs there.
- The public web/API surface and the future private operations surface require
  separate origins, audiences, access policy, and deployment approval.
- The database is not publicly reachable. Administrative access follows a
  documented, time-bounded path and is logged.
- Workloads receive least-privilege roles; humans use centrally managed access
  with phishing-resistant MFA. Long-lived access keys are not the default.
- Secrets are injected at runtime from an approved secret store, are never
  built into images or frontend assets, and have named rotation and emergency
  revocation owners.
- HTTPS is mandatory. Certificates renew automatically, HTTP redirects safely,
  and API CORS permits only the approved staging web origin.
- Backups are encrypted, retention is explicit, and a successful isolated
  restoration—not a dashboard checkbox—is the acceptance evidence.
- Monitoring must minimize and redact personal data before export. Provider
  defaults do not replace an explicit data-processing and retention review.
- No provider is approved merely because it offers an adult-content customer a
  signup form. Written acceptable-use confirmation for Pumdoki's intended
  business model is required where suspension would interrupt a critical
  service.

## AWS staging shape

Score each option `1` (unacceptable) through `5` (strong), attach evidence, and
record the approved answer in a separate architecture decision. A blank cell is
undecided, not implicitly accepted.

| Area                    | Options to evaluate                                                                     | Required evidence and rejection gate                                                                                                                     | Decision      |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Environment boundary    | Dedicated staging AWS account; shared non-production account with strict boundary       | Account and billing ownership diagram; deny if staging and production roles, keys, or data stores cannot be separated                                    | `[UNDECIDED]` |
| Region                  | Candidate regions permitted by legal, privacy, latency, and service-availability review | Written residency rationale and required-service availability; do not choose on latency alone                                                            | `[UNDECIDED]` |
| Web hosting             | Static object/CDN delivery; managed frontend hosting                                    | Private origin where applicable, deploy rollback, cache invalidation, security headers, access logs, predictable cost                                    | `[UNDECIDED]` |
| API compute             | Managed container service; managed orchestrator; virtual-machine service                | Private service networking, health checks, rolling rollback, autoscaling floor/ceiling, log delivery, supported Node runtime, no shell-dependent release | `[UNDECIDED]` |
| Image/artifact registry | Managed private registry or approved equivalent                                         | Immutable release identifier, vulnerability scanning policy, retention and rollback rules, workload-role pull access only                                | `[UNDECIDED]` |
| PostgreSQL              | Managed RDS PostgreSQL on a project-compatible major version                            | Private endpoint, encryption, parameter ownership, automated backups/PITR, maintenance policy, connection limit, restore procedure, cost                 | `[UNDECIDED]` |
| Database availability   | Single availability zone for cost-limited staging; multi-zone staging                   | Documented failure tolerance and production-parity trade-off; never describe single-zone staging as highly available                                     | `[UNDECIDED]` |
| Database access         | Workload security group plus approved administrative tunnel/session path                | No public ingress; least-privilege application role distinct from migration owner; access audit evidence                                                 | `[UNDECIDED]` |
| Network                 | Dedicated VPC/subnets; approved shared non-production network                           | Public/private route diagram, egress path, DNS, security-group rules, flow-log decision, no broad database ingress                                       | `[UNDECIDED]` |
| Edge and DNS            | AWS-native edge/DNS; approved external edge in front of AWS origin                      | DNS ownership, origin-bypass controls, TLS termination boundary, trusted-proxy chain, rate-limit responsibility                                          | `[UNDECIDED]` |
| HTTPS                   | Managed public certificate at edge/load balancer                                        | Automated renewal, TLS policy, HTTP redirect, HSTS rollout plan, hostname validation, expiry alert                                                       | `[UNDECIDED]` |
| Runtime secrets         | AWS-managed secret store candidates                                                     | Encryption key ownership, workload-role reads, audit events, versioning, rotation, rollback, cost; no secrets in CI output                               | `[UNDECIDED]` |
| Configuration           | Environment configuration plus secret references                                        | Clear split between non-secret config and secrets; startup validation; environment-specific values; no production reuse                                  | `[UNDECIDED]` |
| Human IAM               | Identity Center/federated roles; tightly controlled break-glass role                    | Hardware-backed MFA, least privilege, no shared identities, access review cadence, short sessions, logged break-glass procedure                          | `[UNDECIDED]` |
| CI deployment identity  | Short-lived GitHub OIDC role                                                            | Repository/branch/environment claims restricted, approval gate, minimal deploy permissions, no stored AWS access keys                                    | `[UNDECIDED]` |
| Application DB role     | Dedicated runtime role                                                                  | CRUD only where needed; no schema-owner powers; no `UPDATE`, `DELETE`, or `TRUNCATE` on append-only legal/review evidence where required                 | `[UNDECIDED]` |
| Migration DB role       | Separate release-time role                                                              | Schema permissions available only to migration job; invocation and result logged; runtime cannot assume it                                               | `[UNDECIDED]` |
| Backups                 | Automated database backups plus approved snapshots                                      | Encryption, `[RETENTION]`, `[RPO]`, deletion protection decision, restore test, ownership, expiration and cost                                           | `[UNDECIDED]` |
| Cross-boundary recovery | Same-region copy; cross-region or cross-account copy                                    | Threat model, privacy/residency permission, key access, restore complexity, recovery value versus cost                                                   | `[UNDECIDED]` |
| Release rollback        | Immutable prior image plus database-compatible application rollback                     | Release identifiers, backward-compatibility window, stop criteria; no promise of automatic schema rollback                                               | `[UNDECIDED]` |
| Cost controls           | Budget alerts, service caps, tags, scheduled scale-down where safe                      | Monthly estimate under `[COST CEILING]`, alert thresholds, named responder, overage stop rule, backup/log growth included                                | `[UNDECIDED]` |

### Required architecture attachments

- `[CONTEXT DIAGRAM]`: browser, edge, web origin, public API, private operations
  origin, PostgreSQL, mail, monitoring, cache/queue, and trust boundaries.
- `[NETWORK DIAGRAM]`: VPC, subnets, load balancer/edge, egress, security
  groups, database path, DNS, and approved operator access path.
- `[IAM MATRIX]`: founder, engineer, CI deployer, runtime, migration owner,
  backup/restore operator, monitoring reader, and break-glass permissions.
- `[DATA FLOW]`: data classes sent to every provider, retention, deletion, and
  residency.
- `[MONTHLY COST MODEL]`: baseline, test-spike, log/backup growth, network
  egress, taxes, support, and a shutdown/scale-down decision at the ceiling.

## Monitoring and error-tracking provider scorecard

Evaluate at least `[NUMBER]` candidates using the same staged traffic model.
Do not send real customer traffic during evaluation.

| Criterion                      | Candidate A | Candidate B | Candidate C | Required acceptance evidence                                                                         |
| ------------------------------ | ----------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| Intended business accepted     | `[TBD]`     | `[TBD]`     | `[TBD]`     | Written terms/support confirmation; no critical ambiguity around adult creator platforms             |
| DPA and subprocessor terms     | `[TBD]`     | `[TBD]`     | `[TBD]`     | Executable DPA, subprocessor list/change notice, deletion/export terms                               |
| Data region/residency          | `[TBD]`     | `[TBD]`     | `[TBD]`     | Available regions and actual storage/processing path match legal decision                            |
| PII controls                   | `[TBD]`     | `[TBD]`     | `[TBD]`     | Server-side allowlist/redaction before export; request bodies, cookies, tokens, and secrets excluded |
| Retention and deletion         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Configurable `[RETENTION]`, verified deletion behavior, backups covered                              |
| Access security                | `[TBD]`     | `[TBD]`     | `[TBD]`     | SSO/MFA, least-privilege roles, audit log, support-access controls                                   |
| Error and performance coverage | `[TBD]`     | `[TBD]`     | `[TBD]`     | Node/Express and browser support, release tags, source-map privacy, trace sampling                   |
| Alerting and escalation        | `[TBD]`     | `[TBD]`     | `[TBD]`     | Health/readiness, error-rate and latency alerts; test delivery to role-based recipients              |
| Export and portability         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Event export/API and documented offboarding path                                                     |
| Reliability posture            | `[TBD]`     | `[TBD]`     | `[TBD]`     | Published status/incident process and support path appropriate to staging                            |
| Cost at ceiling                | `[TBD]`     | `[TBD]`     | `[TBD]`     | Ingest, retention, seats, traces, source maps, and overage behavior modeled                          |

Monitoring selection is blocked until a synthetic canary demonstrates that
alerts arrive with a request ID while prohibited fields remain absent from the
provider event, log stream, notification, and exported payload.

## Redis, queue, and idempotency decisions

These are related operational dependencies, not one interchangeable product.
Assign each responsibility an explicit durable source of truth and outage
behavior before evaluating a provider.

| Responsibility               | Required source of truth                                                                                        | Permitted Redis/cache role                                           | Required outage decision                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Login/reset/email throttling | Security policy plus auditable application configuration                                                        | Shared counters and bounded windows across API instances             | `[FAIL-CLOSED / BOUNDED LOCAL FALLBACK / OTHER REVIEWED POLICY]`; never silently unlimited                               |
| General API rate limiting    | Application/edge policy                                                                                         | Shared counters or coordination                                      | Define edge versus application ownership and conservative degraded behavior                                              |
| Background jobs              | Durable queue or database-backed job record selected for the job's consequence                                  | Delivery/lease coordination when its durability is proven sufficient | Define enqueue acknowledgement, retries, dead-letter handling, deduplication, and operator replay                        |
| Email delivery jobs          | Durable job record if asynchronous sending is introduced                                                        | Queue coordination and retry scheduling                              | A provider/cache outage cannot falsely report a queued message as durably accepted                                       |
| Payment webhook idempotency  | PostgreSQL record with provider/event key uniqueness, transaction state, and ledger effects in an atomic design | Optional short-lived duplicate suppression or lock optimization only | Payment processing remains safe with Redis unavailable; cache loss may increase DB work, never duplicate a ledger effect |
| Veso ledger mutation         | Append-only PostgreSQL transaction ledger and database constraints                                              | Optional contention coordination only                                | No balance or completed mutation exists solely in Redis                                                                  |
| Creator-review concurrency   | PostgreSQL expected-status update plus append-only evidence transaction                                         | None required by the current Slice 2 design                          | Redis loss does not weaken the database compare-and-set invariant                                                        |
| Session revocation           | PostgreSQL `Session` lifecycle in the current design                                                            | Optional read optimization only after invalidation semantics exist   | Revoked sessions must not become valid because a cache is stale or down                                                  |

> Redis is not durable payment idempotency. It must never be the sole record of
> a processor event, Veso transaction, completed payment mutation, entitlement,
> payable earning, refund, or webhook result. Expiry, eviction, failover, and
> operator flushes make Redis unsuitable as the financial source of truth.

### Redis/cache candidate scorecard

| Criterion                    | Candidate A | Candidate B | Candidate C | Required acceptance evidence                                                  |
| ---------------------------- | ----------- | ----------- | ----------- | ----------------------------------------------------------------------------- |
| Managed service and topology | `[TBD]`     | `[TBD]`     | `[TBD]`     | Supported engine/protocol, zone/failover model, maintenance behavior          |
| Network and encryption       | `[TBD]`     | `[TBD]`     | `[TBD]`     | Private connectivity, TLS in transit, encryption at rest, credential rotation |
| Access control               | `[TBD]`     | `[TBD]`     | `[TBD]`     | Workload-scoped identity/ACL, no public endpoint, audit capability            |
| Data handling                | `[TBD]`     | `[TBD]`     | `[TBD]`     | DPA, subprocessors, region, backup/persistence choices, deletion              |
| Failure semantics            | `[TBD]`     | `[TBD]`     | `[TBD]`     | Tested disconnect, timeout, failover, cold cache, and reconnect behavior      |
| Capacity safeguards          | `[TBD]`     | `[TBD]`     | `[TBD]`     | Memory ceiling, eviction policy, hot-key and connection monitoring            |
| Observability                | `[TBD]`     | `[TBD]`     | `[TBD]`     | Latency, errors, memory, evictions, reconnect, failover alerts                |
| Cost                         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Baseline, failover replicas, transfer, backup, support, and overage modeled   |

### Queue candidate scorecard

| Criterion                      | Candidate A | Candidate B | Candidate C | Required acceptance evidence                                              |
| ------------------------------ | ----------- | ----------- | ----------- | ------------------------------------------------------------------------- |
| Delivery contract              | `[TBD]`     | `[TBD]`     | `[TBD]`     | At-least-once/other semantics understood; consumers are idempotent        |
| Durability and acknowledgement | `[TBD]`     | `[TBD]`     | `[TBD]`     | When acceptance becomes durable and what failures can lose work           |
| Retry/dead-letter controls     | `[TBD]`     | `[TBD]`     | `[TBD]`     | Backoff, max attempts, poison message isolation, replay authorization     |
| Security/data processing       | `[TBD]`     | `[TBD]`     | `[TBD]`     | Private access, encryption, DPA, region, retention, payload minimization  |
| Operational visibility         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Age/depth/failure alerts, correlation IDs, redacted payloads, audit trail |
| Cost                           | `[TBD]`     | `[TBD]`     | `[TBD]`     | Requests, retention, transfer, dead-letter storage, support, overage      |

## Transactional email provider scorecard

Local Mailpit remains a development/test tool. It is not a production or
staging-delivery provider and must not receive real messages.

| Criterion                     | Candidate A | Candidate B | Candidate C | Required acceptance evidence                                                                                                                         |
| ----------------------------- | ----------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adult-business support        | `[TBD]`     | `[TBD]`     | `[TBD]`     | Written confirmation that the intended adult creator-platform model and transactional use are supported; prohibited content/payload rules understood |
| Account suspension/escalation | `[TBD]`     | `[TBD]`     | `[TBD]`     | Review path, notice where available, appeal/support channel, data export and emergency offboarding plan                                              |
| DPA and subprocessors         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Executable DPA, subprocessor list/change notice, international transfer basis, deletion terms                                                        |
| PII and message data          | `[TBD]`     | `[TBD]`     | `[TBD]`     | Exact envelope/header/body/event data stored; templates exclude unnecessary sensitive content                                                        |
| Retention and deletion        | `[TBD]`     | `[TBD]`     | `[TBD]`     | Configurable message/event retention, backups covered, deletion/export procedure tested                                                              |
| SMTP/API transport security   | `[TBD]`     | `[TBD]`     | `[TBD]`     | TLS requirements, certificate verification, scoped credentials, rotation, IP restrictions if used                                                    |
| SPF                           | `[TBD]`     | `[TBD]`     | `[TBD]`     | Provider-specific sender authorization has one reviewed DNS ownership path                                                                           |
| DKIM                          | `[TBD]`     | `[TBD]`     | `[TBD]`     | Managed key size/rotation, selector ownership, aligned signing-domain verification                                                                   |
| DMARC                         | `[TBD]`     | `[TBD]`     | `[TBD]`     | Staged policy and aggregate-report ownership; alignment verified before enforcement changes                                                          |
| Sender isolation              | `[TBD]`     | `[TBD]`     | `[TBD]`     | Dedicated transactional subdomain/domain decision and separation from human support mail                                                             |
| Bounce handling               | `[TBD]`     | `[TBD]`     | `[TBD]`     | Signed/verified event delivery, hard/soft classification, suppression, retry and operator visibility                                                 |
| Complaint handling            | `[TBD]`     | `[TBD]`     | `[TBD]`     | Feedback event support, immediate suppression policy, investigation evidence, abuse escalation                                                       |
| Webhook security              | `[TBD]`     | `[TBD]`     | `[TBD]`     | Signature, timestamp/replay validation, least-privilege endpoint, event idempotency in PostgreSQL                                                    |
| Deliverability visibility     | `[TBD]`     | `[TBD]`     | `[TBD]`     | Delivery, deferral, bounce and complaint metrics without exposing raw tokens or unnecessary message bodies                                           |
| Access security               | `[TBD]`     | `[TBD]`     | `[TBD]`     | SSO/MFA, scoped API/SMTP keys, audit log, support access, key-revocation procedure                                                                   |
| Cost                          | `[TBD]`     | `[TBD]`     | `[TBD]`     | Staging minimum, launch forecast, dedicated IP/domain extras, retention, support, overage behavior                                                   |

Email selection remains blocked until domain ownership, sender/authentication
records, bounce/complaint ownership, and a safe provider-exit path have named
owners. Provider acceptance does not make email copy counsel-approved.

## Approval record

Use one row per decision in the approved restricted decision system. Keep this
repository table blank; do not add evidence links, record IDs, confidential
terms, or console screenshots here.

| Decision            | Selected option | Alternatives rejected | Provisional evaluation approval | Verification evidence | Final acceptance | Revisit trigger                                     |
| ------------------- | --------------- | --------------------- | ------------------------------- | --------------------- | ---------------- | --------------------------------------------------- |
| AWS staging shape   | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | Cost, region, product scope, or threat-model change |
| Monitoring          | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | Data flow, retention, or provider-terms change      |
| Redis/cache         | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | Multi-instance rollout or security-policy change    |
| Queue               | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | First asynchronous consequential workflow           |
| Durable idempotency | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | Before any payment or ledger integration            |
| Transactional email | `[UNDECIDED]`   | `[TBD]`               | `[OUTSIDE GIT]`                 | `[OUTSIDE GIT]`       | `[OUTSIDE GIT]`  | Terms, deliverability, volume, or region change     |

Provisional approval authorizes only provisioning/evaluating the isolated,
synthetic staging candidate within an explicit cost and change window. Final
acceptance requires the applicable `staging-verification-runbook.md` checks and
evidence in the restricted system. Neither stage authorizes production use or
private-router activation.
