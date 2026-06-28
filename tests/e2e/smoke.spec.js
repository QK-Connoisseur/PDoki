import { test, expect } from "@playwright/test";

// Phase 1 route smoke test: every required route must render through the dev
// server without falling into the top-level ErrorBoundary, covering the public,
// member, creator, and legal groups plus the shared-shell social pages.

const routes = [
  { path: "/login", group: "public", expect: "Welcome back" },
  { path: "/signup", group: "public" },
  { path: "/home", group: "member", expect: "For You" },
  { path: "/profile", group: "member" },
  { path: "/store", group: "member", expect: "Trending" },
  { path: "/connect", group: "member", expect: "Voice Call" },
  { path: "/promotions", group: "member" },
  { path: "/wallet", group: "member" },
  { path: "/oasis", group: "member" },
  { path: "/dashboard", group: "creator" },
  { path: "/creator/onboarding", group: "creator" },
  { path: "/legal", group: "legal" },
  { path: "/legal/terms", group: "legal" },
];

for (const route of routes) {
  test(`${route.group}: ${route.path} renders`, async ({ page }) => {
    await page.goto(route.path);

    // The ErrorBoundary fallback must not appear.
    await expect(page.getByText("This page hit a snag")).toHaveCount(0);

    // Something actually rendered into the app root.
    await expect(page.locator("#root")).not.toBeEmpty();

    if (route.expect) {
      await expect(page.getByText(route.expect).first()).toBeVisible();
    }
  });
}
