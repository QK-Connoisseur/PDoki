# Phase 4 Slice 1 — Creator application foundation

## Goal

Replace the creator-onboarding prototype's simulated approval with a truthful,
database-backed application flow that records versioned acceptance evidence and
always returns a pending-review outcome.

This is a foundation slice, not a complete identity, legal, or moderation
system. Counsel-approved agreements, an identity-verification provider,
operational review, country eligibility, tax intake, document retention, and
creator approval remain blocked on founder/legal/vendor decisions.

## Product boundary

- Only an authenticated `MEMBER` with a verified email may submit.
- Submission never changes the user's role. The user remains a member and
  cannot access `/dashboard` while the application is pending.
- One application exists per user. A duplicate submission returns `CONFLICT`.
- The application stores a creator-facing name, two-letter country code,
  submission state, and provider-neutral identity-verification state.
- The same transaction appends creator-agreement, content-policy, and identity-
  verification-disclosure acceptance records with user, version, timestamp,
  and request IP.
- Prototype versions are explicitly labeled `prototype-*`; they must not be
  represented as counsel-approved launch policies.

## Identity-document decision

Slice 1 does not upload or store government IDs or verification selfies. The
prototype claimed encryption, access controls, retention, and a review SLA that
do not exist. The replacement explains that identity verification is a later
review step and records only `NOT_STARTED`.

The future provider integration must fit behind a provider-neutral boundary and
store only the minimum reference/status metadata needed by Pumdoki. Provider
selection, supported countries, encryption/key ownership, retention/deletion,
review access, webhook verification, and incident procedures must be approved
before document collection is enabled.

## API surface

| Method | Route                            | Result                                      |
| ------ | -------------------------------- | ------------------------------------------- |
| `GET`  | `/api/v1/me/creator-application` | Current application or `null`               |
| `POST` | `/api/v1/creator-applications`   | Creates and returns a `PENDING` application |

## State model

Application states are `PENDING`, `NEEDS_INFORMATION`, `APPROVED`, and
`REJECTED`. Identity-verification states are `NOT_STARTED`, `PENDING`,
`VERIFIED`, and `FAILED`. This slice can create only `PENDING` applications
with `NOT_STARTED` verification; later private operations APIs own transitions.

## Exit criteria

- Migration applies cleanly and preserves existing acceptance evidence.
- Shared contracts normalize country codes and reject missing/false acceptance.
- Anonymous, unverified, and non-member submissions are rejected.
- Application and all acceptance records are created atomically.
- Repeated route visits load the persisted pending outcome.
- The browser flow never promotes the member or navigates to Dashboard.
- No identity files leave the browser because this UI no longer requests them.
