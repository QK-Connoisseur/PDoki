# Phase 3 · Slice 4: Settings and Explicit-Content Preferences

Date: 2026-08-01 · Status: in progress · Branch: `dev`

## Purpose

Slice 4 begins the real Settings experience with one complete vertical flow:
an authenticated adult member can view and change whether explicit content is
shown. The value is stored by the API and defaults to hidden.

This first cut does not claim that explicit-content filtering is complete
across feeds, Store, Connect, search, or recommendations. Those product APIs
and content-classification fields do not exist yet. Each future content query
must enforce the stored preference before returning explicit records.

## Decisions

- Store account-scoped settings in a one-to-one `UserPreference` record rather
  than adding unrelated preference columns directly to `User`.
- `showExplicitContent` defaults to `false` in PostgreSQL and in API fallback
  behavior. Missing legacy preference rows are treated as hidden.
- Registration creates the preference row atomically with the user, acceptance
  evidence, and first session. The migration backfills current users.
- Use authenticated `GET /api/v1/me/preferences` and
  `PATCH /api/v1/me/preferences` endpoints.
- Enabling explicit content requires a deliberate confirmation in the UI.
  Disabling it takes effect immediately.
- The preference is not an age-verification substitute. Registration's adult
  age attestation remains a separate requirement.
- Do not implement filtering as CSS-only hiding. Future content endpoints must
  exclude explicit records when the preference is false.

## Initial deliverable

1. Prisma model, migration, registration creation, and seed support.
2. Shared request/response contracts.
3. Authenticated API read/update routes with integration tests.
4. Protected `/settings` page with account context and an accessible explicit
   content switch.
5. Settings navigation from shared and specialized profile menus.
6. Browser coverage proving default-hidden and refresh persistence.

## Remaining Settings scope

Later Slice 4 increments still need profile editing, email change and
re-verification, password change, active-session management, notification
preferences, theme selection, billing links, data export, and a
counsel-approved account-deletion process. Until those land, Phase 3 remains
partially complete.

## Exit criteria

- New and existing users resolve to `showExplicitContent: false` unless they
  deliberately opt in.
- The preference persists in PostgreSQL and survives browser refresh and a new
  session.
- Anonymous preference requests are rejected.
- Invalid update bodies use the standard API error envelope.
- Settings loading, unavailable, saving, confirmation, success, and failure
  states are accessible and tested.
- Future content services have a documented server-side enforcement
  requirement; Phase 3 is not called complete until that enforcement exists.
