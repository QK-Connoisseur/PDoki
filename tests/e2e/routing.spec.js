import { test, expect } from "@playwright/test";
import { loginAs, submitLogin } from "./auth-helpers";

// Phase 1 browser coverage: real URLs must resolve on a cold load (not just via
// in-app navigation), unknown paths remain reviewable, browser Back/Forward works across
// the shared shell, and core pages expose real loading / empty / error states.

test.describe("routing", () => {
  test("root redirects to /login and renders the login screen", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("an anonymous deep link returns to /store after login", async ({
    page,
  }) => {
    await page.goto("/store");
    await expect(page).toHaveURL(/\/login$/);
    await submitLogin(page);
    await expect(page).toHaveURL(/\/store$/);
    await expect(page.getByText("Trending")).toBeVisible();
  });

  test("deep-linking /connect renders the Connect screen", async ({ page }) => {
    await loginAs(page);
    await page.goto("/connect");
    await expect(page).toHaveURL(/\/connect$/);
    await expect(
      page.getByRole("heading", { name: "Connect", exact: true })
    ).toBeVisible();
  });

  test("unknown routes preserve the URL and offer anonymous recovery", async ({
    page,
  }) => {
    await page.goto("/does-not-exist");
    await expect(page).toHaveURL(/\/does-not-exist$/);
    await expect(
      page.getByRole("heading", { name: "This page wandered off." })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Go back" })).toBeVisible();

    const mainBox = await page.locator("main").boundingBox();
    const cardBox = await page.locator("main > section").boundingBox();
    expect(mainBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    const mainCenter = mainBox.x + mainBox.width / 2;
    const cardCenter = cardBox.x + cardBox.width / 2;
    expect(Math.abs(mainCenter - cardCenter)).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("authenticated visitors can recover from an unknown route", async ({
    page,
  }) => {
    await loginAs(page);
    await page.goto("/missing-member-page");
    await expect(page).toHaveURL(/\/missing-member-page$/);
    await expect(page.getByRole("button", { name: "Go home" })).toBeVisible();
    await page.getByRole("button", { name: "Go home" }).click();
    await expect(page).toHaveURL(/\/home$/);
  });
});

test.describe("browser history", () => {
  test("Back/Forward navigate between shared-shell member routes", async ({
    page,
  }) => {
    await loginAs(page);
    await page.goto("/home");
    await expect(page.getByText("For You")).toBeVisible();

    // In-app navigation through the shared sidebar pushes SPA history entries.
    await page
      .getByRole("button", { name: "Store", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/store$/);
    await expect(page.getByText("Trending")).toBeVisible();

    await page
      .getByRole("button", { name: "Connect", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/connect$/);

    // Browser Back returns to Store, Forward returns to Connect.
    await page.goBack();
    await expect(page).toHaveURL(/\/store$/);
    await expect(page.getByText("Trending")).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/connect$/);
    await expect(
      page.getByRole("heading", { name: "Connect", exact: true })
    ).toBeVisible();
  });
});

test.describe("core page async states", () => {
  test("loading state is shown while data resolves", async ({ page }) => {
    await loginAs(page);
    await page.goto("/store?state=loading");
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByText("Loading the store…")).toBeVisible();
  });

  test("empty state is shown when there is no data", async ({ page }) => {
    await loginAs(page);
    await page.goto("/store?state=empty");
    await expect(page.getByText("No items found")).toBeVisible();
  });

  test("error state shows a retry that recovers the page", async ({ page }) => {
    await loginAs(page);
    await page.goto("/store?state=error");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("We couldn’t load the store.")).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();

    // Retry clears the forced failure and resolves to real content.
    await expect(page.getByText("Trending")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});

const featurePageStates = [
  {
    name: "wallet",
    path: "/wallet",
    empty: "Your wallet is empty",
    error: "We couldn’t load your wallet.",
    ready: "Wallet",
  },
  {
    name: "Oasis",
    path: "/oasis",
    empty: "Your Oasis is waiting",
    error: "We couldn’t load Oasis.",
    ready: "Lumiveil",
  },
  {
    name: "creator dashboard",
    path: "/dashboard",
    empty: "No creator activity yet",
    error: "We couldn’t load your creator dashboard.",
    ready: "Welcome back, Your Pumdoki",
  },
];

test.describe("feature page async states", () => {
  for (const feature of featurePageStates) {
    test(`${feature.name} exposes an empty state`, async ({ page }) => {
      await loginAs(
        page,
        feature.name === "creator dashboard" ? "creator" : "member"
      );
      await page.goto(`${feature.path}?state=empty`);
      await expect(page.getByText(feature.empty)).toBeVisible();
    });

    test(`${feature.name} retries after an error`, async ({ page }) => {
      await loginAs(
        page,
        feature.name === "creator dashboard" ? "creator" : "member"
      );
      await page.goto(`${feature.path}?state=error`);
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(page.getByText(feature.error)).toBeVisible();

      await page.getByRole("button", { name: "Try again" }).click();

      await expect(page.getByText(feature.ready).first()).toBeVisible();
      await expect(page.getByRole("alert")).toHaveCount(0);
    });
  }
});
