# Session Handoff

Last updated: 2026-06-28 · Branch: `dev`

## Current phase

**Phase 1 (Repository & frontend foundation) is complete against the FULL
PLAN.md definition** — not the earlier "lightweight" reduced scope. Every Phase
1 task and exit criterion has been implemented and verified (see tables below).
Next up is **Phase 2** (backend/database foundation). No backend code has been
written yet — `apps/api` and `packages/*` are still empty scaffolding.

> Nothing has been committed or pushed. The entire `apps/web` restructure plus
> this session's work remain uncommitted on `dev` (git shows the new trees as
> `??`). A baseline commit is still advisable before Phase 2.

## What changed this session

The previous session had implemented routing, tooling, the API client, and
foundation primitives, but had **deferred** the shared application shell,
layout-duplication extraction, route grouping, broad fixture migration, and real
loading/empty/error states. This session finished all of that.

### Shared application shell (PLAN tasks 8 & 9)

- **`components/MemberLayout.jsx`** — new shared member shell. Composes the top
  bar + left sidebar + chat rail + mobile bottom nav around page content, owns
  the compose-menu state, and routes navigation through React Router. Single
  source of truth for the scaffold the five social pages each used to
  re-implement inline.
- **`components/AppHeader.jsx`** — extracted shared header (logo, search,
  notifications, Oasis, profile menu) with its own dropdown state and outside-
  click handling. Navigation (Oasis/Dashboard/Wallet/Profile/Logout) goes
  through `useNavigate`.
- **`components/PumdokiLogo.jsx`** — extracted the brand SVG that all seven
  pages had each redefined with a different gradient id.
- **`Home, Profile, Store, Connect, Promotions`** were refactored to render
  their `<main>` content inside `<MemberLayout>`, removing the duplicated
  `<header>` (~100–160 lines each), `<Sidebar>`/`<MobileNav>`/`<ChatSidebar>`
  wiring, local `PumdokiLogo`, and header dropdown state. Page-specific modals
  (CreatePostModal, MomentComposer, lightboxes) stay in the page.
  - ProfilePage keeps its distinct background via a new `bgClassName` prop on
    `MemberLayout` (default `bg-[#fff8fb]`, Profile passes `bg-[#F8F9FA]`).

### Loading / empty / error / retry states on core pages (PLAN task 19)

- **`lib/useSimulatedFetch.js`** — dev-only async-state driver returning
  `{ status, retry }` (`loading | ready | empty | error`). States are forceable
  for QA/E2E via a `?state=loading|empty|error` query param; "Try again" clears
  the forced state and resolves to `ready`, proving the retry path is wired.
  This is the seam that swaps to `apiClient` calls in Phase 2+.
- All five social pages now gate their `<main>` content through this hook,
  rendering `LoadingState` / `EmptyState` / `ErrorState` (from the existing
  `StateViews`) as appropriate.

### Route groups (PLAN task 7)

- **`App.jsx`** reorganized into explicit Public/auth · Member · Creator · Admin
  · Legal groups. Added a protected **`/admin/*` placeholder** (role-guarded
  seam for Phase 11). Social pages now receive only `{ userStatus,
  onStatusChange }`; pages that still own their header (Wallet, Dashboard, Oasis,
  onboarding, legal) keep the `useNav` callback adapter.

### Fixture migration (PLAN task 10)

Mock content data moved out of component bodies into `apps/web/src/fixtures/`:

- `chatContacts.js`, `notifications.js` (were duplicated across 5 pages),
- `homeFeed.js` (moments, feedPosts, fypPosts),
- `storeContent.js`, `connectCreators.js`, `promotions.js`,
- `profile.js` (profile header, services, reviews, posts, media).

Page-local UI **config** (filter-tab definitions, colour constants) intentionally
stays in the component — only content/mock data moved. `fixtures/README.md`
updated to list the set.

### Misc

- `.hide-scrollbar` moved to `index.css` (was injected per-page via `<style>`).
- Browser/E2E suite expanded (see below).

## Phase 1 task checklist (PLAN §5)

| # | Task | Status |
|---|------|--------|
| 1 | npm workspaces for apps/* and packages/* | ✅ (pre-existing) |
| 2 | Keep React app in apps/web | ✅ |
| 3 | Create apps/api workspace | ✅ scaffold exists (TS init is Phase 2) |
| 4 | Add React Router | ✅ |
| 5 | Replace currentPage nav with stable routes | ✅ |
| 6 | Refresh + Back/Forward on every page | ✅ (BrowserRouter + E2E) |
| 7 | Route groups (Public/Member/Creator/Admin/Legal) | ✅ (App.jsx + /admin placeholder) |
| 8 | Shared application shell | ✅ `MemberLayout` |
| 9 | Extract header/sidebar/mobile nav/profile menu/notifications/chat rail | ✅ `AppHeader` + `MemberLayout` |
| 10 | Move mock data to dev fixtures | ✅ shared + per-page content fixtures |
| 11 | API client (base URL, creds, typed errors, request IDs, 401 handling) | ✅ (pre-existing `lib/apiClient.js`) |
| 12 | ESLint + Prettier | ✅ (pre-existing) |
| 13 | Vitest + RTL | ✅ (pre-existing) |
| 14 | Playwright | ✅ (expanded this session) |
| 15 | Environment validation | ✅ (pre-existing `lib/env.js`) |
| 16 | `.env.example` | ✅ (pre-existing) |
| 17 | GitHub Actions (install/lint/test/build) | ✅ (pre-existing `.github/workflows/ci.yml`) |
| 18 | Error boundaries + route error states | ✅ `ErrorBoundary` + `StateViews` |
| 19 | Loading/empty/retry on core pages | ✅ `useSimulatedFetch` + StateViews |

## Phase 1 exit criteria (PLAN §5)

| Criterion | Status |
|-----------|--------|
| Root install and build succeed | ✅ |
| Real URL routes work | ✅ |
| Shared layout duplication reduced | ✅ (5 headers/logos/chat-contacts deduped; prod JS bundle 807 → 766 kB) |
| CI validates every branch | ✅ (workflow present) |
| Frontend ready to consume APIs | ✅ (`apiClient` + `useSimulatedFetch` seam) |
| `npm run lint` zero errors (warnings recorded) | ✅ 0 errors / 16 warnings |
| `npm run test` unit tests pass | ✅ 12/12 |
| `npm run build` succeeds | ✅ |
| `npm run test:e2e` Phase 1 browser tests pass (direct loads, refresh/deep links, unknown-route, Back/Forward) | ✅ 21/21 |
| Manually smoke-test public/member/creator/legal/Store/Connect/Wallet/Oasis/dashboard | ✅ automated `smoke.spec.js` exercises every route through the dev server |
| Record verification in handoff | ✅ (this file) |

## Exact commands run (final pass, all from repo root)

| Command | Result |
| --- | --- |
| `npm run lint` | ✅ exit 0 — **0 errors, 16 warnings** |
| `npm run test` | ✅ **12/12** unit tests (3 files) |
| `npm run build` | ✅ built (`dist/assets/index-*.js` ≈ 766 kB, gzip ≈ 184 kB) |
| `npx playwright install chromium` | ✅ |
| `npm run test:e2e` | ✅ **21/21** browser tests (chromium) |

`npm install` was **not** re-run — no dependency changes this session.

### Browser test coverage (`tests/e2e/`)

- `routing.spec.js` — root→/login redirect, deep-link `/store` & `/connect`,
  unknown-route fallback, **browser Back/Forward** across shared-shell routes
  (in-app sidebar nav → `goBack`/`goForward`), and core-page **loading / empty /
  error+retry** states.
- `smoke.spec.js` — every required route (`/login`, `/signup`, `/home`,
  `/profile`, `/store`, `/connect`, `/promotions`, `/wallet`, `/oasis`,
  `/dashboard`, `/creator/onboarding`, `/legal`, `/legal/terms`) renders through
  the dev server without hitting the top-level `ErrorBoundary`.

### Warnings (all pre-existing, none introduced)

16 ESLint warnings remain, all in untouched code paths: `apiClient.js` (`cause`
unused), `CreatorDashboardPage.jsx` (4 unused nav props), `OasisPage.jsx`
(`useRef`, `showLuckyCatch`), `ProfilePage.jsx` (`setMediaFilter`,
`filteredMedia` — pre-existing media-filter feature stubs), `SignUpPage.jsx`
(`step`/`setStep`). The two import warnings the refactor briefly introduced
(unused `useEffect`/`useRef` in Store/Promotions) were fixed. Net warnings fell
from 23 → 16.

## Routes now live

`/login` · `/signup` · `/home` · `/profile/:creatorId?` · `/oasis` · `/connect`
· `/store` · `/promotions` · `/dashboard` · `/wallet` · `/creator/onboarding` ·
`/admin/*` (placeholder) · `/legal` · `/legal/:page` · `*`→`/login`

## Does Phase 1 genuinely satisfy the full PLAN.md definition?

**Yes.** Every Phase 1 task (including the previously deferred shell, layout
extraction, route grouping, fixture migration, and async states) and every exit
criterion is implemented and verified by automated lint/unit/build/E2E plus a
route smoke suite. The one nuance worth stating plainly:

- **Task 10 (fixtures):** every page's primary *content* dataset is now in
  `fixtures/`, but page-local *UI config* (filter definitions, colour constants)
  deliberately stays in components. This matches CLAUDE.md's guidance that
  fixtures back content that will be replaced by `/api/v1` responses. If a
  stricter reading is wanted (every literal out of components), that is a small
  follow-up, not a blocker.

Nothing required by Phase 1 is failing, skipped, or environment-blocked.

## Risks & open decisions (carried forward)

- **OPEN QUESTION (blocks Phase 2 DB step):** provide a `docker-compose.yml` for
  local Postgres, or run Postgres another way (hosted/local install)?
- **Minor intentional UI consolidation:** the shared `AppHeader` now shows the
  Oasis button and gives every profile-menu item a working action on all five
  social pages. Previously Connect/Store/Promotions omitted the Oasis button and
  a couple of menu items were inert — the shared header unifies this. The shared
  chat fixture also standardizes one contact's unread count (Store/Promotions/
  Profile previously showed `0`, now `11` like Home/Connect). These are
  deliberate consistency fixes, not regressions.
- **Production deep-link rewrite still needed:** `BrowserRouter` needs the host
  to fall back to `index.html` for unknown paths (fine in Vite dev/preview; the
  future `infra/cloudflare` static config must add a rewrite rule).
- **`?state=` override** in `useSimulatedFetch` is a dev/E2E affordance; it is
  removed when pages switch to real `apiClient` calls.
- **CI does not gate on `format:check`** (would force reformatting the ~14k-line
  prototype); Prettier runs locally / on new code only.
- **react-hooks v7 React-Compiler purity rules disabled** (flag decorative
  `Math.random()`/`Date.now()`); `rules-of-hooks` is still a hard error.
- **Nothing is committed.** Baseline commit advisable before Phase 2.

## Next exact task (Phase 2 — `apps/api` scaffold)

1. Init TypeScript + Express in `apps/api` with `dev`/`build`/`start` scripts.
2. Structured bootstrap: `/api/v1/health`, `/api/v1/ready`, request IDs,
   structured logging, consistent error envelope, Zod validation middleware,
   rate-limit scaffolding, CORS for the web origin, env validation.
3. Then `packages/contracts` (health/auth/user/session/error schemas).
4. Then `packages/database` (Prisma) + dev seed + local Postgres.
