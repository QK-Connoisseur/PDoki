# Session Handoff

Last updated: 2026-06-28 · Branch: `dev`

## Current phase

**Phase 1 (Repository & frontend foundation) is complete against the FULL
PLAN.md definition** — not the earlier "lightweight" reduced scope. Every Phase
1 task and exit criterion has been implemented and verified (see tables below).
Next up is **Phase 2** (backend/database foundation). No backend code has been
written yet — `apps/api` and `packages/*` are still empty scaffolding.

> The repository/frontend baseline is committed locally as `b49f012`
> (`Back end and repo structure`). The final Phase 1 completion changes in this
> handoff remain uncommitted and unpushed on `dev`; the branch is four commits
> ahead of `origin/dev`.

## What changed this session

The previous session had implemented routing, tooling, the API client, and
foundation primitives, but had **deferred** the shared application shell,
layout-duplication extraction, route grouping, broad fixture migration, and real
loading/empty/error states. This session finished all of that.

### Final Phase 1 completion audit

- Extracted the remaining backend-bound prototype datasets from Login, Wallet,
  Oasis, and Creator Dashboard into `fixtures/login.js`, `fixtures/wallet.js`,
  `fixtures/oasis.js`, and `fixtures/creatorDashboard.js`.
- Added loading, empty, error, and retry states to Wallet, Oasis, and Creator
  Dashboard, closing the remaining ambiguity around "core pages."
- Expanded Playwright coverage for each new feature-page state and retry path.
- Reconciled `CLAUDE.md` with the shared shell, route groups, fixtures, and
  async-state architecture.
- Removed all remaining ESLint warnings; lint now passes with zero errors and
  zero warnings.
- Updated `docs/product/Pumdoki_MasterTracker_V4.xlsx` with the June 28 Phase 1
  verification and current CI/Phase 2 status. The workbook archive and updated
  cells were reopened and validated after writing.

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
- `login.js` (featured creators and CTA cards),
- `wallet.js` (wallet summary and transaction/account data),
- `oasis.js` (Drimy, tasks, achievements, leaderboard, and inventory),
- `creatorDashboard.js` (earnings, subscribers, content, bookings, shop, and
  settings data).

Page-local UI **config** (filter-tab definitions, colour constants) intentionally
stays in the component — only content/mock data moved. `fixtures/README.md`
updated to list the set.

### Misc

- `.hide-scrollbar` moved to `index.css` (was injected per-page via `<style>`).
- Browser/E2E suite expanded (see below).

## Phase 1 task checklist (PLAN §5)

| #   | Task                                                                   | Status                                          |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | npm workspaces for apps/_ and packages/_                               | ✅ (pre-existing)                               |
| 2   | Keep React app in apps/web                                             | ✅                                              |
| 3   | Create apps/api workspace                                              | ✅ scaffold exists (TS init is Phase 2)         |
| 4   | Add React Router                                                       | ✅                                              |
| 5   | Replace currentPage nav with stable routes                             | ✅                                              |
| 6   | Refresh + Back/Forward on every page                                   | ✅ (BrowserRouter + E2E)                        |
| 7   | Route groups (Public/Member/Creator/Admin/Legal)                       | ✅ (App.jsx + /admin placeholder)               |
| 8   | Shared application shell                                               | ✅ `MemberLayout`                               |
| 9   | Extract header/sidebar/mobile nav/profile menu/notifications/chat rail | ✅ `AppHeader` + `MemberLayout`                 |
| 10  | Move mock data to dev fixtures                                         | ✅ all backend-bound prototype content fixtures |
| 11  | API client (base URL, creds, typed errors, request IDs, 401 handling)  | ✅ (pre-existing `lib/apiClient.js`)            |
| 12  | ESLint + Prettier                                                      | ✅ (pre-existing)                               |
| 13  | Vitest + RTL                                                           | ✅ (pre-existing)                               |
| 14  | Playwright                                                             | ✅ (expanded this session)                      |
| 15  | Environment validation                                                 | ✅ (pre-existing `lib/env.js`)                  |
| 16  | `.env.example`                                                         | ✅ (pre-existing)                               |
| 17  | GitHub Actions (install/lint/test/build)                               | ✅ (pre-existing `.github/workflows/ci.yml`)    |
| 18  | Error boundaries + route error states                                  | ✅ `ErrorBoundary` + `StateViews`               |
| 19  | Loading/empty/retry on core pages                                      | ✅ social pages + Wallet/Oasis/Dashboard        |

## Phase 1 exit criteria (PLAN §5)

| Criterion                                                                                                     | Status                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Root install and build succeed                                                                                | ✅                                                                              |
| Real URL routes work                                                                                          | ✅                                                                              |
| Shared layout duplication reduced                                                                             | ✅ (5 headers/logos/chat-contacts deduped; prod JS bundle 807 → 768.76 kB)      |
| CI validates every branch                                                                                     | ✅ (workflow present)                                                           |
| Frontend ready to consume APIs                                                                                | ✅ (`apiClient` + `useSimulatedFetch` seam)                                     |
| `npm run lint` zero errors (warnings recorded)                                                                | ✅ 0 errors / 0 warnings                                                        |
| `npm run test` unit tests pass                                                                                | ✅ 12/12                                                                        |
| `npm run build` succeeds                                                                                      | ✅                                                                              |
| `npm run test:e2e` Phase 1 browser tests pass (direct loads, refresh/deep links, unknown-route, Back/Forward) | ✅ 27/27                                                                        |
| Manually smoke-test public/member/creator/legal/Store/Connect/Wallet/Oasis/dashboard                          | ✅ route smoke suite plus visual screenshot inspection of changed feature pages |
| Record verification in handoff                                                                                | ✅ (this file)                                                                  |

## Exact commands run (final pass, all from repo root)

| Command                           | Result                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| `npm run lint`                    | ✅ exit 0 — **0 errors, 0 warnings**                          |
| `npm run test`                    | ✅ **12/12** unit tests (3 files)                             |
| `npm run build`                   | ✅ built (`dist/assets/index-*.js` 768.76 kB, gzip 185.85 kB) |
| `npx playwright install chromium` | ✅                                                            |
| `npm run test:e2e`                | ✅ **27/27** browser tests (chromium)                         |
| One-time visual screenshot pass   | ✅ Wallet, Oasis, and Creator Dashboard rendered correctly    |

`npm install` was **not** re-run — no dependency changes this session.

### Browser test coverage (`tests/e2e/`)

- `routing.spec.js` — root→/login redirect, deep-link `/store` & `/connect`,
  unknown-route fallback, **browser Back/Forward** across shared-shell routes
  (in-app sidebar nav → `goBack`/`goForward`), and core-page **loading / empty /
  error+retry** states, including Wallet, Oasis, and Creator Dashboard.
- `smoke.spec.js` — every required route (`/login`, `/signup`, `/home`,
  `/profile`, `/store`, `/connect`, `/promotions`, `/wallet`, `/oasis`,
  `/dashboard`, `/creator/onboarding`, `/legal`, `/legal/terms`) renders through
  the dev server without hitting the top-level `ErrorBoundary`.

### Warnings

No ESLint warnings remain. The production build still reports Vite's advisory
that the main JavaScript chunk exceeds 500 kB; this is a performance follow-up,
not a Phase 1 build failure.

## Routes now live

`/login` · `/signup` · `/home` · `/profile/:creatorId?` · `/oasis` · `/connect`
· `/store` · `/promotions` · `/dashboard` · `/wallet` · `/creator/onboarding` ·
`/admin/*` (placeholder) · `/legal` · `/legal/:page` · `*`→`/login`

## Does Phase 1 genuinely satisfy the full PLAN.md definition?

**Yes.** Every Phase 1 task (including the previously deferred shell, layout
extraction, route grouping, fixture migration, and async states) and every exit
criterion is implemented and verified by automated lint/unit/build/E2E plus a
route smoke suite. Backend-bound sample content is in `fixtures/`; page-local UI
configuration and interactive state deliberately remain with their components.

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
- **Final Phase 1 completion changes are uncommitted.** The local baseline
  commit exists, but the current changes must be committed and pushed before
  GitHub CI can validate them remotely.

## Next exact task (Phase 2 — `apps/api` scaffold)

1. Init TypeScript + Express in `apps/api` with `dev`/`build`/`start` scripts.
2. Structured bootstrap: `/api/v1/health`, `/api/v1/ready`, request IDs,
   structured logging, consistent error envelope, Zod validation middleware,
   rate-limit scaffolding, CORS for the web origin, env validation.
3. Then `packages/contracts` (health/auth/user/session/error schemas).
4. Then `packages/database` (Prisma) + dev seed + local Postgres.
