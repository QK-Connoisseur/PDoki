# Non-secret configuration and secret-reference inventory

Status: planning template only. Rows identify configuration and secret references;
they never contain values. Proposed identifiers do not prove that a provider or
control exists.

## Rules and classification

- Keep credentials, tokens, keys, recovery material, connection strings, and
  environment-specific values out of Git, logs, tickets, chat, and screenshots.
- Use accountable role names here; keep named people and emergency contacts in the
  approved private operations record.
- `Storage` names only a storage class, never a vault path, record ID, or value.
- Browser-exposed `VITE_` configuration can contain only public values.

| Classification | Meaning                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| Public         | Intentionally observable; still change-controlled                        |
| Internal       | Non-secret operational configuration                                     |
| Restricted     | Sensitive topology, tenant, or authorization metadata                    |
| Secret         | Credential or cryptographic value injected from an approved secret store |

## Blank row

| Variable or identifier | Category | Owner            | Environment                     | Storage                             | Rotation                   | Classification                          | Status / notes                             |
| ---------------------- | -------- | ---------------- | ------------------------------- | ----------------------------------- | -------------------------- | --------------------------------------- | ------------------------------------------ |
| `IDENTIFIER_ONLY`      | Purpose  | Accountable role | Dev / CI / staging / production | Configuration or secret-store class | Owner plus trigger/cadence | Public / Internal / Restricted / Secret | Proposed / implemented / blocked; no value |

## Starter inventory

### Private access and origins

| Variable or identifier       | Category                     | Owner                   | Environment              | Storage                      | Rotation                                     | Classification | Status / notes                                  |
| ---------------------------- | ---------------------------- | ----------------------- | ------------------------ | ---------------------------- | -------------------------------------------- | -------------- | ----------------------------------------------- |
| `OPERATIONS_ACCESS_ISSUER`   | Access/IdP issuer            | Security/Operations     | Staging, production      | Restricted deployment config | IdP/tenant change                            | Restricted     | Proposed; required before operations deployment |
| `OPERATIONS_ACCESS_AUDIENCE` | Access/IdP audience          | Security/Operations     | Staging, production      | Restricted deployment config | App replacement or exposure                  | Restricted     | Proposed; validate exactly                      |
| `OPERATIONS_ACCESS_JWKS_URL` | Access/IdP verification keys | Security/Operations     | Staging, production      | Restricted deployment config | Issuer/provider change; support key rollover | Restricted     | Proposed; also validate issuer and audience     |
| `OPERATIONS_ORIGIN`          | Private operations origin    | Security/Operations     | Staging, production      | Restricted deployment config | Host/proxy change                            | Restricted     | Proposed; distinct from public web              |
| `OPERATIONS_MUTATION_ORIGIN` | Mutation/CSRF origin         | Security/Engineering    | Staging, production      | Restricted deployment config | Host/proxy change                            | Restricted     | Proposed; exact, fail-closed match              |
| `TRUSTED_PROXY_POLICY`       | Trusted proxy boundary       | Security/Infrastructure | Staging, production      | Restricted deployment config | Network/proxy change                         | Restricted     | Proposed; reject spoofable identity headers     |
| `WEB_ORIGIN`                 | Public web CORS origin       | Engineering             | Dev, staging, production | Deployment config            | Public host change                           | Internal       | Implemented; inventory values privately         |
| `VITE_API_BASE_URL`          | Browser-visible API URL      | Engineering             | Dev, staging, production | Build config                 | API routing change                           | Public         | Implemented; never secret                       |

### Database roles

| Variable or identifier        | Category                         | Owner                   | Environment                         | Storage                                             | Rotation                                     | Classification | Status / notes                               |
| ----------------------------- | -------------------------------- | ----------------------- | ----------------------------------- | --------------------------------------------------- | -------------------------------------------- | -------------- | -------------------------------------------- |
| `DATABASE_RUNTIME_URL`        | Least-privileged public API role | Database/Infrastructure | Staging, production                 | Managed secret store                                | Exposure/provider change and defined cadence | Secret         | Proposed split from general connection       |
| `DATABASE_OPERATIONS_URL`     | Least-privileged operations role | Database/Infrastructure | Staging, production                 | Managed secret store                                | Exposure/provider change and defined cadence | Secret         | Proposed; operations permissions only        |
| `DATABASE_MIGRATION_URL`      | Deployment/migration role        | Database/Infrastructure | Staging, production                 | Deployment-only secret store                        | Exposure/pipeline change and defined cadence | Secret         | Proposed; never inject into runtime          |
| `DATABASE_BACKUP_ROLE`        | Backup/restore identity          | Database/Infrastructure | Staging, production                 | Managed identity/secret store                       | Backup policy, exposure, provider change     | Secret         | Proposed; keep grants and tests private      |
| `DATABASE_OBSERVABILITY_ROLE` | Read-only monitoring identity    | Database/Infrastructure | Staging, production                 | Managed identity/secret store                       | Exposure/provider change and defined cadence | Secret         | Proposed; no mutations or sensitive payloads |
| `DATABASE_URL`                | Current general connection       | Engineering             | Development; transitional elsewhere | Ignored local `.env`; managed secret store remotely | Exposure or role split                       | Secret         | Implemented locally; never commit            |

### Monitoring and Redis

| Variable or identifier      | Category                | Owner                      | Environment              | Storage                                        | Rotation                                       | Classification | Status / notes                       |
| --------------------------- | ----------------------- | -------------------------- | ------------------------ | ---------------------------------------------- | ---------------------------------------------- | -------------- | ------------------------------------ |
| `MONITORING_DSN`            | Telemetry ingestion     | Reliability/Engineering    | Staging, production      | Restricted config or secret store per provider | Exposure/project/provider change               | Restricted     | Provider-neutral placeholder         |
| `MONITORING_AUTH_TOKEN`     | Release integration     | Reliability/Engineering    | CI, staging, production  | CI/managed secret store                        | Exposure/personnel/provider change and cadence | Secret         | Proposed; minimum scope              |
| `MONITORING_ENVIRONMENT`    | Environment label       | Reliability/Engineering    | Dev, staging, production | Deployment config                              | Topology change                                | Internal       | Proposed; no personal data           |
| `ALERT_DELIVERY_CREDENTIAL` | Alert integration       | Reliability/Operations     | Staging, production      | Managed secret store                           | Exposure/destination change and cadence        | Secret         | Proposed; contacts stay private      |
| `REDIS_URL`                 | Shared Redis connection | Infrastructure/Engineering | Staging, production      | Managed secret store                           | Exposure/provider change and cadence           | Secret         | Provider and beta approach undecided |
| `REDIS_TLS_CA`              | Redis trust reference   | Infrastructure/Security    | Staging, production      | Managed trust/config store                     | Certificate/provider lifecycle                 | Restricted     | Proposed                             |
| `REDIS_KEY_PREFIX`          | Environment namespace   | Engineering                | Dev, staging, production | Deployment config                              | Environment/tenancy change                     | Internal       | Proposed; not an access boundary     |

### SMTP and mail

| Variable or identifier    | Category                    | Owner                      | Environment              | Storage                    | Rotation                                  | Classification | Status / notes                               |
| ------------------------- | --------------------------- | -------------------------- | ------------------------ | -------------------------- | ----------------------------------------- | -------------- | -------------------------------------------- |
| `MAIL_TRANSPORT`          | Transport selection         | Engineering                | Dev, staging, production | Deployment config          | Provider/environment change               | Internal       | Implemented; Mailpit is local only           |
| `SMTP_HOST` / `SMTP_PORT` | SMTP endpoint               | Infrastructure/Engineering | Dev, staging, production | Deployment config          | Provider/endpoint change                  | Internal       | Implemented; production provider open        |
| `SMTP_USERNAME`           | SMTP identity               | Infrastructure/Engineering | Staging, production      | Managed secret store       | With credential/provider change           | Restricted     | Proposed                                     |
| `SMTP_PASSWORD`           | SMTP credential             | Infrastructure/Engineering | Staging, production      | Managed secret store       | Exposure/provider change and cadence      | Secret         | Proposed                                     |
| `MAIL_FROM`               | Sender address              | Product/Operations         | Dev, staging, production | Deployment config          | Domain/sender-policy change               | Public         | Local reserved example; production undecided |
| `MAIL_PROVIDER_API_KEY`   | Provider credential if used | Infrastructure/Engineering | Staging, production      | Managed secret store       | Exposure/provider change and cadence      | Secret         | Optional placeholder                         |
| `MAIL_DKIM_PRIVATE_KEY`   | Domain-signing key          | Security/Infrastructure    | Staging, production      | Managed/provider key store | Mail policy, exposure, provider migration | Secret         | Proposed; value never inventoried here       |

## Environment check

- Assign an owner, classification, environment, storage class, and rotation trigger
  to every required item.
- Separate development, staging, and production credentials and identities.
- Give runtime identities narrower privileges than deployment identities.
- Keep public and operations origins distinct and exact allowlists documented
  privately.
- Verify secrets cannot enter browser bundles, logs, build output, or Git.
- Record only sanitized test dates and outcomes; keep values and evidence private.
