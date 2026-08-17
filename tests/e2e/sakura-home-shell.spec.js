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

  const verificationBubble = page.locator(".email-verification-bubble");
  await expect(verificationBubble).toHaveCount(1);
  const resendVerification = verificationBubble.getByRole("button", {
    name: "Resend verification link",
  });
  await expect(resendVerification).toHaveCSS("border-top-width", "0px");
  await expect(resendVerification).toHaveCSS(
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
  const [rightArrowBox, scrollerBox] = await Promise.all([
    nextMoments.boundingBox(),
    momentsScroller.boundingBox(),
  ]);
  expect(rightArrowBox).not.toBeNull();
  expect(scrollerBox).not.toBeNull();
  expect(
    rightArrowBox.x - (scrollerBox.x + scrollerBox.width)
  ).toBeGreaterThanOrEqual(4);
  const initialScrollLeft = await momentsScroller.evaluate(
    (element) => element.scrollLeft
  );
  await nextMoments.click();
  await expect
    .poll(() => momentsScroller.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initialScrollLeft);
  await expect(previousMoments).toBeVisible();
  const [leftArrowBox, shiftedScrollerBox] = await Promise.all([
    previousMoments.boundingBox(),
    momentsScroller.boundingBox(),
  ]);
  expect(leftArrowBox).not.toBeNull();
  expect(shiftedScrollerBox).not.toBeNull();
  expect(
    shiftedScrollerBox.x - (leftArrowBox.x + leftArrowBox.width)
  ).toBeGreaterThanOrEqual(4);

  const expandChat = page.getByRole("button", { name: "Expand inbox" });
  await expect(expandChat.locator("path")).toHaveAttribute(
    "d",
    "M15 19l-7-7 7-7"
  );
  await expandChat.click();
  const messagesDialog = page.getByRole("dialog", { name: "Messages" });
  await expect(messagesDialog).toBeVisible();
  const [chatPanelFill, railFill] = await Promise.all([
    messagesDialog.evaluate(
      (element) => getComputedStyle(element).backgroundImage
    ),
    leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(chatPanelFill).toBe(railFill);
  await page.getByRole("button", { name: "Close messages" }).click();

  await page.goto("/store");
  await expect(backdrop).toHaveCount(0);
});

test("the soft-pink Sakura scene and glass colors stay fixed while scrolling", async ({
  page,
}) => {
  await loginAs(page, "member");

  const backdrop = page.getByTestId("sakura-backdrop");
  const header = page.locator("header.member-glass-header");
  const leftRail = page.locator("aside.member-glass-rail-left");
  const rightRail = page.locator("aside.member-glass-rail-right");
  const feedCard = page.locator("article.sakura-feed-card").first();
  await expect(backdrop).toHaveAttribute("data-scene", "static");
  await expect(backdrop).toHaveCSS("position", "fixed");
  await expect(backdrop).toHaveCSS("animation-name", "none");
  await expect(backdrop).toHaveCSS("background-size", "cover");
  await expect(backdrop).toHaveCSS("background-image", /sakura-feed-desktop/);
  await expect(header).toHaveCSS("backdrop-filter", "none");
  await expect(feedCard).toHaveCSS("backdrop-filter", "none");

  const [leftRailFill, rightRailFill, feedCardFill] = await Promise.all([
    leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    rightRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    feedCard.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(feedCardFill).toBe(leftRailFill);
  expect(rightRailFill).toBe(leftRailFill);

  const [initialBackdropBox, initialHeaderFill] = await Promise.all([
    backdrop.boundingBox(),
    header.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(initialBackdropBox).not.toBeNull();
  expect(initialHeaderFill).not.toBe("none");

  await page.evaluate(() => window.scrollTo(0, 700));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const [scrolledBackdropBox, scrolledHeaderFill] = await Promise.all([
    backdrop.boundingBox(),
    header.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(scrolledBackdropBox).toEqual(initialBackdropBox);
  expect(scrolledHeaderFill).toBe(initialHeaderFill);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(backdrop).toHaveCSS("background-image", /sakura-feed-mobile/);
  const mobileNav = page.locator("nav.member-glass-mobile-nav");
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav).toHaveCSS("backdrop-filter", "none");
  const mobileNavFill = await mobileNav.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect
    .poll(() =>
      mobileNav.evaluate((element) => getComputedStyle(element).backgroundImage)
    )
    .toBe(mobileNavFill);
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
});
