# Operations readiness templates

Date: 2026-08-13 · Status: planning only; no live control is asserted

These documents make future security, privacy, provider, and staging work
reviewable without putting secrets or personal recovery details in Git. They do
not select a provider, authorize an account change or deployment, or activate
the dormant creator-review route.

## Packet order

| Document                                                                                          | Purpose                                                                                                                            | Use only when                                                                       |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Private operations activation gates](private-admin-activation-gates.md)                          | Fail-closed API/origin/MFA/proxy/database gates plus hardware-key, recovery, break-glass, and offboarding policy templates         | Designing or reviewing the separately deployed operations boundary                  |
| [Google Workspace recovery and privacy checklist](google-workspace-recovery-privacy-checklist.md) | Separates directory visibility, signup verification, recovery factors, and public business surfaces                                | Reviewing recovery privacy without recording personal contact details               |
| [Non-secret configuration inventory](non-secret-configuration-inventory-template.md)              | Names required configuration and secret references without storing their values                                                    | Preparing environment configuration and ownership                                   |
| [Staging and provider decision matrix](staging-provider-decision-matrix.md)                       | Compares AWS shape, monitoring, Redis/queue/idempotency, and transactional email prerequisites                                     | Gathering founder, engineering, provider, and legal decisions                       |
| [Future staging verification runbook](staging-verification-runbook.md)                            | Defines the evidence required for HTTPS, migrations, restore, monitoring, dependency outages, email, and private-operations denial | After provisional evaluation approval, during an authorized isolated staging window |

## Repository boundary

- Never add credentials, tokens, account or subject identifiers, real domains or
  private endpoints, key serials, recovery codes, phone numbers, personal email
  addresses, customer data, or restricted console screenshots.
- Store live values and completed evidence only in approved restricted systems.
  Repository records may contain only a sanitized outcome and date. Do not add a
  restricted URL, tenant/vault path, record ID, or other locator; find the live
  evidence through the approved private operations process.
- A placeholder, checklist item, provider feature, code seam, or passing local
  test is not proof that a production control exists.
- The creator-review router remains unmounted until every mandatory activation
  gate passes for the exact deployed release and configuration.
- Creator approval, role promotion, identity collection, publishing, payments,
  and production deployment remain separately blocked by `PLAN.md` and the
  relevant architecture records.
