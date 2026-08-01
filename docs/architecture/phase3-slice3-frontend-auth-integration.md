# Phase 3 · Slice 3: Frontend Authentication Integration

Date: 2026-08-01 · Status: implemented and locally verified · Branch: `dev`

## Context

Phase 3 slices 1 and 2 provide the server-side account system: registration,
login, secure cookie sessions, `/me`, logout/logout-all, email verification,
password reset, role enforcement, and the `requireVerifiedEmail` seam. The
Slice 3 frontend now consumes those APIs: Login and SignUp are live,
`ProtectedRoute` restores and enforces server identity, and verification/reset
routes complete the browser flows.

This slice connects the existing React interface to those APIs. It does not add
Settings or explicit-content preferences; those remain slice 4.

## Decisions

- The API remains the source of truth for identity, role, and verification
  state.
- Browser code never reads or stores the session token. Authentication uses the
  existing `HttpOnly` cookie with `credentials: "include"`.
- Session restoration uses `GET /api/v1/me` once when the application starts.
- First beta remains email/password only. The current Google controls are
  removed or visibly disabled as unavailable; they must not imply a working
  OAuth flow.
- Successful login returns the member to the protected route they originally
  requested, falling back to `/home`.
- Unverified users may sign in and browse. A persistent banner offers resend
  and verification guidance. Money and creator actions remain protected by the
  future API endpoints that apply `requireVerifiedEmail`.
- API roles use the canonical uppercase values `MEMBER`, `CREATOR`,
  `MODERATOR`, and `ADMIN`. The public frontend uses `CREATOR` for its only
  role-restricted product route; `ADMIN` remains a backend/private-operations
  role and does not create a public `/admin` route.
- Creator Dashboard navigation is rendered only for `CREATOR` accounts. Link
  visibility improves the experience, while `ProtectedRoute` and future API
  permissions remain the security boundary.
- The operations UI is an independently built `apps/admin` application, not a
  route group inside `apps/web`. Slice 3 creates only its safe, data-free shell;
  operational authentication and workflows remain Phase 11.
- No authentication data is persisted in localStorage or sessionStorage.

## Initial gaps corrected by this slice

`apps/web/src/lib/apiClient.js` previously read non-2xx fields from the response
root. It now parses the API's
`{ error: { code, message, requestId, details? } }` envelope and notifies the
auth provider when a later request returns `401`.

`ProtectedRoute` previously accepted lowercase role strings. Route declarations
and tests now use the API's canonical uppercase roles.

## Frontend architecture

Add an authentication feature area under `apps/web/src/auth/`:

- `AuthProvider` owns the current user and a small explicit state machine.
- `useAuth` exposes the state and auth actions to pages and guards.
- An auth API adapter wraps `apiClient` calls and validates the user response
  shape at the feature boundary.
- Auth-specific loading, unavailable, and retry states use the existing state
  components and visual language.

The provider wraps the router-facing application shell so route guards, auth
pages, headers, and the verification banner share the same state.

## State model

The provider exposes:

- `status`: `loading`, `authenticated`, `unauthenticated`, or `unavailable`.
- `user`: the server-returned public user while authenticated, otherwise null.
- `login`, `register`, `logout`, `logoutAll`, `refreshSession`,
  `requestVerification`, `confirmVerification`, `requestPasswordReset`, and
  `confirmPasswordReset`.

On application start:

1. Set `loading`.
2. Request `/me`.
3. `200` → `authenticated`.
4. `401` → `unauthenticated`; this is an expected state, not an error.
5. Network or `5xx` → `unavailable` with a retry action. Do not redirect in a
   loop or pretend the user is signed out.

Any later `401` clears the user and returns to `unauthenticated`. The redirect
to `/login` is performed by routing code, not from the low-level API client.

## Routes and screens

Public auth routes:

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password?token=...`
- `/verify-email?token=...`

Protected routes continue to use `ProtectedRoute`.

`ProtectedRoute` behavior:

- `loading` → full-page loading state.
- `unavailable` → retryable service-unavailable state.
- `unauthenticated` → redirect to `/login` with the requested location stored
  in navigation state.
- Authenticated but wrong role → a clear forbidden state. The API still
  enforces every privileged operation.
- Authenticated and allowed → render children.

Authenticated users visiting `/login` or `/signup` are redirected to `/home`,
unless the route is displaying a submission error that still needs attention.

## Login and registration

The existing visual layouts stay intact while their forms become controlled,
accessible API forms.

Login:

- Submit normalized email and password.
- Generic `401` copy does not distinguish unknown email from wrong password.
- `429` shows a retry-later message.
- Network and server failures remain retryable and retain the entered email.
- Passwords are never logged or retained after success.

Registration:

- Submit display name, email, password, literal age attestation, and the current
  Terms and Privacy version identifiers.
- The age/Terms/Privacy checkbox starts unchecked.
- `409 CONFLICT` may say the address is already registered, matching the
  approved slice 2 posture.
- Success updates auth state from the returned user and navigates to `/home`.
- The unverified banner is immediately visible after successful registration.

Policy-version constants must live in one named frontend module until a future
configuration endpoint supplies them. Placeholder legal copy remains clearly
non-production.

## Verification and password reset

The verification banner:

- Appears only when `user.emailVerified` is false.
- Offers resend with pending, accepted, throttled, and retryable states.
- Never claims delivery when the request failed.

Verification confirmation:

- Reads the token from the URL, posts it once, then removes the token from
  visible browser history with a replace navigation.
- Success refreshes the provider user and shows a verified state.
- `TOKEN_EXPIRED` offers resend when the user is authenticated.
- `INVALID_TOKEN` shows a safe invalid/already-used state.

Password reset:

- The request screen always shows the same accepted result for syntactically
  valid email addresses.
- The confirmation screen enforces the shared password rules before submit.
- Success explains that all sessions were revoked and returns the user to
  login.
- Invalid and expired tokens have distinct recovery copy without exposing
  account existence.

## Testing

Unit and component coverage:

- API client parses the nested error envelope and preserves request IDs.
- Provider initialization covers `/me` success, `401`, network failure, retry,
  and later unauthorized invalidation.
- Login covers success, generic credentials failure, rate limiting, and
  transport failure.
- Registration covers the full contract, unchecked attestation, `409`, and
  unverified success.
- ProtectedRoute covers every state plus canonical role enforcement and
  requested-route restoration.
- Verification covers success, expiry, invalid token, resend, and throttling.
- Password reset request stays enumeration-neutral; confirmation covers
  success, expiry, invalid token, and password validation.

Playwright coverage:

- An anonymous deep link redirects to login and returns after authentication.
- A registered user sees the verification banner.
- A valid verification link updates the UI.
- Password reset completes and the previous password no longer works.
- Logout protects member routes on refresh.
- Members cannot see Creator Dashboard navigation or enter the creator route.
- Creators can open the dashboard from the profile menu.
- The public app has no `/admin` route.

Browser tests should use the real local API/PostgreSQL stack for the core
vertical flow. Mocked component tests remain useful for edge states.

## Exit criteria

- Login and signup use the real API with no simulated success path.
- Authentication persists across refresh through `/me`.
- Protected routes reject anonymous users and enforce canonical roles.
- Verification and reset URLs complete the backend flows.
- Unverified state is visible without blocking ordinary browsing.
- Logout and logout-all clear frontend state and protect later navigation.
- All lint, formatting, unit, API, build, and Playwright checks pass after the
  final changes.
- `PLAN.md`, `CLAUDE.md`, `HANDOFF.md`, and the master tracker record the real
  result without claiming Settings or explicit-content completion.

## Implementation record

Completed on 2026-07-29:

- Added the auth provider/state machine, API adapter, canonical roles, public
  route guard, protected-route enforcement, and global later-`401`
  invalidation.
- Connected Login and SignUp to the API and added forgot-password,
  reset-password, verification-confirmation, and persistent unverified-email
  experiences.
- Added component coverage for auth state, forms, guards, verification, and
  reset edge cases.
- Added real PostgreSQL/API/Mailpit Playwright flows and CI services for
  registration, verification, password reset, session persistence, logout,
  requested-route restoration, creator-only navigation/role denial, and public
  `/admin` route absence.
- Removed the public admin placeholder while retaining the backend `ADMIN` role
  and added an independently buildable, data-free `apps/admin` shell. Phase 11
  still owns its authentication, restricted deployment, API integration,
  permissions, moderation workflows, and audit controls.
- Kept Settings and explicit-content preferences explicitly out of scope for
  Slice 4.

## Out of scope

Profile/email/password Settings, active-session management UI,
explicit-content preferences, Google OAuth, production mail-provider
selection, Redis-backed throttling, payment/creator verification gates, and
admin account-management endpoints.
