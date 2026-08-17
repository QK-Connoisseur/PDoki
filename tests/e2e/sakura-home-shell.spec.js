import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

test("Home renders the approved Sakura glass shell without extra rail bubbles", async ({
  page,
}) => {
  await loginAs(page, "member");

  const backdrop = page.getByTestId("sakura-backdrop");
  const header = page.locator("header.member-glass-header");
  const leftRail = page.locator("aside.member-glass-rail-left");
  const rightRail = page.getByRole("complementary", {
    name: "Chat sidebar",
  });

  await expect(backdrop).toBeVisible();
  const [headerBox, leftBox, rightBox] = await Promise.all([
    header.boundingBox(),
    leftRail.boundingBox(),
    rightRail.boundingBox(),
  ]);
  expect(headerBox).not.toBeNull();
  expect(leftBox).not.toBeNull();
  expect(rightBox).not.toBeNull();
  const viewportHeight = page.viewportSize().height;
  const headerBottom = headerBox.y + headerBox.height;
  expect(Math.abs(leftBox.y - headerBottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(rightBox.y - headerBottom)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(leftBox.y + leftBox.height - viewportHeight)
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(rightBox.y + rightBox.height - viewportHeight)
  ).toBeLessThanOrEqual(1);

  const selectedDesktopItems = leftRail.locator('[aria-current="page"]');
  await expect(selectedDesktopItems).toHaveCount(1);
  await expect(selectedDesktopItems).toHaveAttribute("aria-label", "Home");
  await expect(leftRail.locator(".member-rail-nav")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );

  const momentsRail = page.locator("[data-moments-rail]");
  await expect(momentsRail).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(momentsRail).toHaveCSS("border-top-width", "0px");

  const nextMoments = page.getByRole("button", { name: "Scroll right" });
  const previousMoments = page.getByRole("button", { name: "Scroll left" });
  const momentsScroller = momentsRail.locator("[data-moments-scroller]");
  await expect(nextMoments).toBeVisible();
  await expect(previousMoments).toHaveCount(0);
  const initialScrollLeft = await momentsScroller.evaluate(
    (element) => element.scrollLeft
  );
  await nextMoments.click();
  await expect
    .poll(() => momentsScroller.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initialScrollLeft);
  await expect(previousMoments).toBeVisible();

  const expandChat = page.getByRole("button", { name: "Expand inbox" });
  await expect(expandChat.locator("path")).toHaveAttribute(
    "d",
    "M15 19l-7-7 7-7"
  );
  await expandChat.click();
  await expect(page.getByRole("dialog", { name: "Messages" })).toBeVisible();
  await page.getByRole("button", { name: "Close messages" }).click();

  await page.goto("/store");
  await expect(backdrop).toHaveCount(0);
});

test("Reduced Motion keeps the Sakura scene static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loginAs(page, "member");

  const backdrop = page.getByTestId("sakura-backdrop");
  await expect(backdrop).toHaveAttribute("data-motion", "paused");
  await expect(backdrop.locator(".sakura-backdrop__petal").first()).toHaveCSS(
    "animation-name",
    "none"
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("the device-local appearance switch keeps the Sakura scene still", async ({
  page,
}) => {
  await loginAs(page, "member");
  await page.goto("/settings");

  const motionSwitch = page.getByRole("switch", {
    name: "Animate Sakura background",
  });
  await expect(motionSwitch).toHaveAttribute("aria-checked", "true");
  await motionSwitch.click();
  await expect(motionSwitch).toHaveAttribute("aria-checked", "false");

  await page.reload();
  await expect(motionSwitch).toHaveAttribute("aria-checked", "false");

  await page.goto("/home");
  const backdrop = page.getByTestId("sakura-backdrop");
  await expect(backdrop).toHaveAttribute("data-motion", "paused");
  await expect(backdrop.locator(".sakura-backdrop__petal").first()).toHaveCSS(
    "animation-name",
    "none"
  );
});
