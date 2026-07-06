# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pumdoki is an adult creator platform (subscriptions, paid content, creator services/bookings, real-time messaging, prepaid "Veso" credits, and a collectible "Oasis/Drimy" retention game). The repo today is a **React frontend prototype** mid-restructure into an npm-workspaces monorepo. Backend, database, auth, payments, and media pipeline are planned but **not yet implemented** — `apps/api`, `packages/{contracts,database,ui,config}`, `docs/*`, and `tests/e2e` are mostly empty scaffolding (`.gitkeep` placeholders).

Authoritative product/scope docs, read these before non-trivial work:

- `README.md` — product direction, confirmed launch scope, and stable UI requirements (Profile, Store, Veso, Oasis, legal/compliance UI).
- `PLAN.md` — dependency-ordered, 14-phase delivery roadmap with exit criteria and open business/legal decisions.
- `docs/product/Pumdoki_MasterTracker_V4.xlsx` — operational checklist ("master tracker").

## Commands

All commands run from the repo root and delegate to the `@pumdoki/web` workspace:

```bash
npm install        # install all workspaces (Node >= 20.19 required)
npm run dev        # vite dev server for the web app
npm run build      # production build of the web app
npm run preview    # preview the production build
```

Quality tooling (root): `npm run lint` (ESLint flat config, pragmatic — noisy rules are warnings, `rules-of-hooks` is an error), `npm run format`/`format:check` (Prettier), `npm run test` (Vitest + Testing Library in `apps/web`), `npm run test:e2e` (Playwright; run `npx playwright install` once first). CI lives in `.github/workflows/ci.yml` (lint + unit test + build, plus a Playwright job). There is still **no typecheck** (frontend is plain JS) and **no backend test suite** (`apps/api` is empty).

## Architecture

The real code lives entirely in `apps/web/src`:

- `App.jsx` — root. **Uses React Router (`BrowserRouter`).** Routes are organized into public/auth, member, creator, admin, and legal groups. The older `useNav` adapter remains for specialized pages that still expose callback navigation. Shared-shell pages navigate directly with React Router. Routes are wrapped in an `ErrorBoundary`; member/creator/admin routes use `ProtectedRoute` (currently a transparent seam until real auth exists). `userStatus` is lifted so it persists across routes.
- `pages/` — one component per screen (Home, Profile, Store, Connect, Wallet, Promotions, CreatorDashboard, Oasis, Login, SignUp, LegalHub, CreatorOnboarding). Several prototype pages remain large, but backend-bound sample content is imported from `fixtures/` rather than being declared inside page components.
- `components/` — shared widgets and foundation primitives. `MemberLayout` is the shared shell for Home, Profile, Store, Connect, and Promotions; it composes `AppHeader`, Sidebar/mobile navigation, and ChatSidebar. Specialized feature areas such as Wallet, Oasis, and Creator Dashboard intentionally retain their own layouts. `ErrorBoundary`, `ProtectedRoute`, and `StateViews` provide failure, authorization, loading, empty, and retry seams.
- `lib/` — `env.js` (validated `import.meta.env` access), `apiClient.js` (fetch wrapper: base URL, credentials, request IDs, typed errors, 401 handling), and `useSimulatedFetch.js` (temporary async-state seam for prototype pages until real API calls replace it).
- `fixtures/` — development-only sample content for public, social, Wallet, Oasis, and Creator Dashboard pages. These files are the replacement boundary for future `/api/v1` responses.
- `utils/` — small pure helpers (e.g. `sortMomentRail.js`).
- `test/setup.js` — Vitest setup (jest-dom). Tests are colocated as `*.test.{js,jsx}`.

Conventions:

- Prototype content comes from `fixtures/`; media is loaded from external demo URLs. Page-local display configuration and interactive local state remain in components. Auth and all financial buttons are simulated — nothing persists.
- Styling is **Tailwind CSS v4** via `@tailwindcss/vite` (config-less; `@import "tailwindcss"` in `index.css`). Custom keyframe animations are hand-written in `index.css`. Visual identity is sakura-pink/pearl/off-white with rounded "premium" surfaces; Dark Knight is a planned second theme.
- Plain JavaScript + JSX (no TypeScript in the frontend). PLAN.md mandates **TypeScript for all new backend/shared-contract code**, converting frontend files only when touched for backend integration.

## Domain rules that affect implementation

These are product invariants, not suggestions — violating them is a correctness bug:

- **Veso** is prepaid credit (1 Veso = 1 USD). Member Veso balances and creator payable earnings are **separate ledgers**; never model a balance as a directly-editable number — it must be an append-only transaction ledger. Store, Connect, and Send Love (tipping) spend Veso.
- **Explicit content is hidden by default**; adult members opt in. This is distinct from age verification.
- **Oasis** progress, inventory, cooldowns, rewards, and purchases must be **server-authoritative** when the backend exists; the client never sets XP/Orbs/stage/inventory directly.
- **Server-side entitlement checks** gate protected media; protected/original media URLs must never appear in public feed payloads.

## Compliance constraints on the prototype

- Legal copy in the frontend is **placeholder, not counsel-approved**. Do not present it as final.
- Use reserved sample addresses (e.g. `support@pumdoki.example`) — never invent real contact details, and never claim that encryption, moderation vendors, response times, or compliance processes exist until they actually do.
- Never commit secrets, identity documents, processor credentials, or real `.env` files.
- Do not commit temporary implementation-prompt Markdown files (the previous prompt-heavy `.agents`/AI-folder approach was deliberately rejected — product decisions belong in README/PLAN/tracker/docs).

## Repository state note

The working tree is mid-migration: the legacy top-level `src/` files show as deleted in git status, with the new `apps/`, `packages/`, `infra/`, `docs/`, `tests/` tree added. Work against `apps/web`, not the old top-level paths.
