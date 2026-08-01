import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

// Phase 1 route smoke test: every required route must render through the dev
// server without falling into the top-level ErrorBoundary, covering the public,
// member, creator, and legal groups plus the shared-shell social pages. The
// operations application is a separate deployment and has no public web route.

const publicRoutes = [
  { path: "/login", group: "public", expect: "Welcome back" },
  { path: "/signup", group: "public" },
  {
    path: "/forgot-password",
    group: "public",
    expect: "Reset your password",
  },
  {
    path: "/reset-password",
    group: "public",
    expect: "Reset link invalid",
  },
  {
    path: "/verify-email",
    group: "public",
    expect: "Verification link invalid",
  },
  { path: "/legal", group: "legal" },
  { path: "/legal/terms", group: "legal" },
];

const protectedRoutes = [
  { path: "/home", group: "member", expect: "For You" },
  { path: "/profile", group: "member" },
  { path: "/store", group: "member", expect: "Trending" },
  { path: "/connect", group: "member", expect: "Voice Call" },
  { path: "/promotions", group: "member" },
  { path: "/wallet", group: "member" },
  { path: "/settings", group: "member", expect: "Content preferences" },
  { path: "/oasis", group: "member" },
  { path: "/dashboard", group: "creator", role: "creator" },
  { path: "/creator/onboarding", group: "creator" },
];

for (const route of publicRoutes) {
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

for (const route of protectedRoutes) {
  test(`${route.group}: ${route.path} renders for an authorized account`, async ({
    page,
  }) => {
    await loginAs(page, route.role || "member");
    await page.goto(route.path);

    await expect(page.getByText("This page hit a snag")).toHaveCount(0);
    await expect(page.locator("#root")).not.toBeEmpty();
    if (route.expect) {
      await expect(page.getByText(route.expect).first()).toBeVisible();
    }
  });
}
