import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

async function waitForBackgroundImage(locator) {
  await locator.evaluate(async (element) => {
    const backgroundImage = getComputedStyle(element).backgroundImage;
    const url = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    if (!url) throw new Error("Expected the themed background image to exist");

    await new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener(
        "error",
        () => reject(new Error(`Unable to load themed background: ${url}`)),
        { once: true }
      );
      image.src = url;
      if (image.complete && image.naturalWidth > 0) resolve();
    });
  });
}

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
  await expect(header).toHaveCSS("border-bottom-width", "1px");
  await expect(header).toHaveCSS("box-shadow", "none");
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
  const verificationShadow = await verificationBubble.evaluate(
    (element) => getComputedStyle(element).boxShadow
  );
  expect(verificationShadow).not.toContain("inset");
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
  await expect(backdrop).toBeVisible();
  await expect(page.locator(".sakura-glass-surface").first()).toBeVisible();
});

test("the Sakura glass material is shared by member routes and Create", async ({
  page,
}) => {
  await loginAs(page, "member");

  const routes = [
    { path: "/home", surface: "article.sakura-feed-card" },
    { path: "/store", surface: ".sakura-glass-surface" },
    { path: "/connect", surface: ".sakura-glass-surface" },
    { path: "/promotions", surface: "article.sakura-glass-surface" },
    { path: "/profile", surface: ".sakura-glass-surface" },
    { path: "/settings", surface: "section.sakura-glass-surface" },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(
      page.locator('[data-member-visual="sakura-glass"]')
    ).toBeVisible();
    await expect(page.locator('[data-member-theme="sakura"]')).toBeVisible();
    await expect(page.getByTestId("sakura-backdrop")).toBeVisible();

    const surface = page.locator(route.surface).first();
    const leftRail = page.locator("aside.member-glass-rail-left");
    await expect(surface).toBeVisible();
    const [surfaceFill, railFill] = await Promise.all([
      surface.evaluate((element) => getComputedStyle(element).backgroundImage),
      leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    ]);
    expect(surfaceFill).toBe(railFill);
  }

  await page.goto("/store");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByRole("button", { name: "Create Post", exact: true }).click();
  const createPanel = page.locator(".member-glass-modal-panel");
  const leftRail = page.locator("aside.member-glass-rail-left");
  await expect(createPanel).toBeVisible();
  const [createFill, railFill] = await Promise.all([
    createPanel.evaluate(
      (element) => getComputedStyle(element).backgroundImage
    ),
    leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(createFill).toBe(railFill);
  await page.getByRole("button", { name: "Close", exact: true }).click();

  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  const mobileComposeMenu = page
    .locator("nav.member-glass-mobile-nav")
    .locator("div.absolute.bottom-full");
  await expect(mobileComposeMenu).toBeVisible();
  const mobileComposeBox = await mobileComposeMenu.boundingBox();
  expect(mobileComposeBox).not.toBeNull();
  expect(mobileComposeBox.x).toBeGreaterThanOrEqual(0);
  expect(mobileComposeBox.x + mobileComposeBox.width).toBeLessThanOrEqual(321);
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
  await waitForBackgroundImage(header);
  await expect(header).toHaveCSS("backdrop-filter", "none");
  await expect(feedCard).toHaveCSS("backdrop-filter", "none");
  const initialHeaderBackground = await header.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  expect(initialHeaderBackground).toContain("linear-gradient");
  expect(initialHeaderBackground).toContain("sakura-feed-desktop");

  const [leftRailFill, rightRailFill, feedCardFill] = await Promise.all([
    leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    rightRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    feedCard.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(feedCardFill).toBe(leftRailFill);
  expect(rightRailFill).toBe(leftRailFill);

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await header.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map(
        (image) =>
          image.complete ||
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          })
      )
    )
  );
  const [initialBackdropBox, initialHeaderFill, initialHeaderScreenshot] =
    await Promise.all([
      backdrop.boundingBox(),
      header.evaluate((element) => getComputedStyle(element).backgroundImage),
      header.screenshot(),
    ]);
  expect(initialBackdropBox).not.toBeNull();
  expect(initialHeaderFill).not.toBe("none");

  await page.evaluate(() => window.scrollTo(0, 700));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const [scrolledBackdropBox, scrolledHeaderFill, scrolledHeaderScreenshot] =
    await Promise.all([
      backdrop.boundingBox(),
      header.evaluate((element) => getComputedStyle(element).backgroundImage),
      header.screenshot(),
    ]);
  expect(scrolledBackdropBox).toEqual(initialBackdropBox);
  expect(scrolledHeaderFill).toBe(initialHeaderFill);
  expect(scrolledHeaderScreenshot.equals(initialHeaderScreenshot)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(backdrop).toHaveCSS("background-image", /sakura-feed-mobile/);
  await expect(header).toHaveCSS("background-image", /sakura-feed-mobile/);
  await waitForBackgroundImage(header);
  const mobileNav = page.locator("nav.member-glass-mobile-nav");
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav).toHaveCSS("backdrop-filter", "none");
  const mobileNavFill = await mobileNav.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  const mobileHeaderBox = await header.boundingBox();
  expect(mobileHeaderBox).not.toBeNull();
  const mobileHeaderClip = {
    x: Math.round(mobileHeaderBox.x + 16),
    y: Math.round(mobileHeaderBox.y),
    width: Math.round(mobileHeaderBox.width - 32),
    height: Math.round(mobileHeaderBox.height),
  };
  const initialMobileHeaderScreenshot = await page.screenshot({
    clip: mobileHeaderClip,
  });
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect
    .poll(() =>
      mobileNav.evaluate((element) => getComputedStyle(element).backgroundImage)
    )
    .toBe(mobileNavFill);
  const scrolledMobileHeaderScreenshot = await page.screenshot({
    clip: mobileHeaderClip,
  });
  expect(
    scrolledMobileHeaderScreenshot.equals(initialMobileHeaderScreenshot)
  ).toBe(true);
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.emulateMedia({ contrast: "more" });
  await expect(header).toHaveCSS("background-image", "none");

  await page.emulateMedia({
    contrast: "no-preference",
    forcedColors: "active",
  });
  await expect(backdrop).toBeHidden();
  await expect(header).toHaveCSS("background-image", "none");
});

test("header popovers stay inside a narrow member viewport", async ({
  page,
}) => {
  await loginAs(page, "member");
  await page.setViewportSize({ width: 320, height: 700 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    )
  ).toBe(true);

  for (const accessibleName of ["Search", "Notifications", "Profile menu"]) {
    const trigger = page.getByRole("button", { name: accessibleName });
    await trigger.click();

    const popover = page.locator(".member-header-popover:visible");
    await expect(popover).toHaveCount(1);
    const popoverBox = await popover.boundingBox();
    expect(popoverBox).not.toBeNull();
    expect(popoverBox.x).toBeGreaterThanOrEqual(0);
    expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(321);

    await trigger.click();
    await expect(popover).toHaveCount(0);
  }
});
