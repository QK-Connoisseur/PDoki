# Phase 3 Slice 4B — Account and security settings

## Goal

Complete the core account-management path inside the protected member web app:

- edit the signed-in user's display name;
- change the account email and require verification of the new address;
- change the password after confirming the current password;
- list active sessions and revoke another session.

The private operations application is outside this slice. The public web app
continues to expose member and creator settings only.

## Security decisions

- Every route is protected by the existing database-backed session middleware.
- Email and password changes require the current password. Failed confirmations
  are rate-limited per user and IP without invalidating the current session.
- Changing email marks the account unverified, invalidates every outstanding
  email-verification and password-reset link, sends a fresh link to the new
  address, and revokes every other active session.
- Changing password invalidates outstanding password-reset links and revokes
  every other active session.
- The session that performs either sensitive change remains active so the user
  can see the result and finish verification. The user can revoke other
  sessions, but the Settings UI directs current-session sign-out through the
  existing Log out action.
- Session identifiers are always scoped to the authenticated user before a
  revocation is applied. A foreign or missing identifier returns `NOT_FOUND`.
- Session display deliberately reports creation and expiry times. The current
  schema does not provide a trustworthy per-request “last active” timestamp.

## API surface

| Method   | Route                            | Result                                     |
| -------- | -------------------------------- | ------------------------------------------ |
| `PATCH`  | `/api/v1/me/profile`             | Updated authenticated user                 |
| `PATCH`  | `/api/v1/me/email`               | Updated, now-unverified authenticated user |
| `PATCH`  | `/api/v1/me/password`            | `{ "status": "changed" }`                  |
| `GET`    | `/api/v1/me/sessions`            | Active sessions with a `current` marker    |
| `DELETE` | `/api/v1/me/sessions/:sessionId` | `204 No Content`                           |

## Exit criteria

- contracts reject malformed input and malformed session responses;
- integration coverage proves authentication, ownership, duplicate-email,
  token invalidation, and other-session revocation behavior;
- Settings has accessible profile, email, password, and session controls;
- browser coverage exercises the complete account-security path;
- the full repository validation suite passes.
