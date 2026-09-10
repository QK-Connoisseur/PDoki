import { test, expect } from "@playwright/test";
import { loginAs, submitLogin } from "./auth-helpers";

async function dismissCookieBanner(page) {
  const consent = page.getByRole("dialog", { name: "Cookie consent" });
  await expect(consent).toBeVisible();
  await consent
    .getByRole("button", { name: "Reject Non-Essential", exact: true })
    .click();
  await expect(consent).toHaveCount(0);
}

test("Activity requires login, restores the requested route, and survives refresh", async ({
  page,
}) => {
  await page.goto("/activity");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Your Activity", exact: true })
  ).toHaveCount(0);
  await submitLogin(page);
  await expect(page).toHaveURL(/\/activity$/);
  await expect(
    page.getByRole("heading", { name: "Your Activity", exact: true })
  ).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/activity$/);
  await expect(
    page.getByRole("heading", { name: "Your Activity", exact: true })
  ).toBeVisible();
});

test("the shared desktop More menu opens Your Activity", async ({ page }) => {
  await loginAs(page);
  await dismissCookieBanner(page);
  const rail = page.locator("aside.member-glass-rail-left");
  await rail.getByRole("button", { name: "More", exact: true }).click();
  await rail
    .getByRole("button", { name: "Your Activity", exact: true })
    .click();
  await expect(page).toHaveURL(/\/activity$/);
  await expect(
    page.getByRole("heading", { name: "Your Activity", exact: true })
  ).toBeVisible();
});

test("the mobile profile menu opens Your Activity", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAs(page);
  await dismissCookieBanner(page);
  await page.getByRole("button", { name: "Profile menu" }).click();
  await page
    .locator("#member-profile-popover")
    .getByRole("button", { name: "Your Activity", exact: true })
    .click();
  await expect(page).toHaveURL(/\/activity$/);
  await expect(
    page.getByRole("heading", { name: "Your Activity", exact: true })
  ).toBeVisible();
  await expect(page.locator("#member-profile-popover")).toHaveCount(0);
});

test("Activity filters clearly labeled examples without changing the account", async ({
  page,
}) => {
  await loginAs(page);
  await dismissCookieBanner(page);
  const mutations = [];
  page.on("request", (request) => {
    if (
      request.url().includes("/api/v1/") &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method())
    ) {
      mutations.push(`${request.method()} ${new URL(request.url()).pathname}`);
    }
  });
  await page.goto("/activity");
  const history = page.getByRole("region", { name: "Activity history" });
  const categories = page.getByRole("group", { name: "Activity categories" });
  const search = page.getByRole("searchbox", { name: "Search activity" });
  const month = page.getByRole("combobox", { name: "Activity month" });
  const rows = history.getByRole("listitem");

  await expect(
    page.getByRole("note", { name: "Activity preview" })
  ).toContainText(
    "These examples are not your account history. No real purchases or payments are shown."
  );
  await expect(rows).toHaveCount(11);
  await categories.getByRole("button", { name: /^Likes/ }).click();
  await expect(rows).toHaveCount(3);
  await search.fill("Luna");
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText("Golden hour photo diary");
  await month.selectOption({ label: "August 2026" });
  await expect(rows).toHaveCount(0);
  await expect(
    history.getByRole("heading", { name: "No matching activity" })
  ).toBeVisible();

  await history.getByRole("button", { name: "Reset filters" }).click();
  await expect(rows).toHaveCount(11);
  await expect(search).toHaveValue("");
  await expect(month).toHaveValue("all");
  await expect(
    categories.getByRole("button", { name: /^All activity/ })
  ).toHaveAttribute("aria-pressed", "true");

  await categories.getByRole("button", { name: /^Payments/ }).click();
  await expect(rows).toHaveCount(3);
  await expect(history.getByText("$15.00", { exact: true })).toBeVisible();
  await expect(rows.getByRole("button")).toHaveCount(0);
  await expect(
    history.getByRole("button", {
      name: /refund|cancel subscription|delete|clear history/i,
    })
  ).toHaveCount(0);
  expect(mutations).toEqual([]);
});
