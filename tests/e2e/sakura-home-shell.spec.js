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

async function captureHeaderMaterial(page, header, horizontalInset = 0) {
  const previousVisibility = await header.evaluate((element) => {
    const content = element.firstElementChild;
    if (!content)
      throw new Error("Expected the header content wrapper to exist");
    const previous = content.style.visibility;
    content.style.visibility = "hidden";
    return previous;
  });

  try {
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve))
    );
    const box = await header.boundingBox();
    if (!box) throw new Error("Expected the header to be visible");

    return await page.screenshot({
      clip: {
        x: Math.round(box.x + horizontalInset),
        y: Math.round(box.y),
        width: Math.round(box.width - horizontalInset * 2),
        height: Math.round(box.height),
      },
    });
  } finally {
    await header.evaluate((element, visibility) => {
      const content = element.firstElementChild;
      if (content) content.style.visibility = visibility;
    }, previousVisibility);
  }
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
  // This test verifies shared material, not promotion expiry behavior.
  await page.clock.setFixedTime(new Date("2026-08-20T12:00:00Z"));
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
    await expect(
      page.locator(
        '[data-member-visual="sakura-glass"][data-member-theme="sakura"]'
      )
    ).toBeVisible();
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

test("the unchanged Sakura wallpaper supports a subtle motion overlay behind live glass", async ({
  page,
}) => {
  await loginAs(page, "member");

  const backdrop = page.getByTestId("sakura-backdrop");
  const motionOverlay = page.getByTestId("sakura-motion-overlay");
  const motionPetals = backdrop.locator("[data-motion-petal]");
  const header = page.locator("header.member-glass-header");
  const leftRail = page.locator("aside.member-glass-rail-left");
  const rightRail = page.locator("aside.member-glass-rail-right");
  const feedCard = page.locator("article.sakura-feed-card").first();
  const visiblePetalCount = () =>
    motionPetals.evaluateAll(
      (petals) =>
        petals.filter((petal) => getComputedStyle(petal).display !== "none")
          .length
    );
  await expect(backdrop).toHaveAttribute("data-scene", "ambient-motion");
  await expect(backdrop).toHaveCSS("position", "fixed");
  await expect(backdrop).toHaveCSS("animation-name", "none");
  await expect(motionOverlay).toBeVisible();
  await expect(motionPetals).toHaveCount(5);
  await expect(motionPetals.first()).toHaveCSS(
    "animation-name",
    "sakura-petal-drift"
  );
  await expect(backdrop).toHaveCSS("background-size", "cover");
  await expect(backdrop).toHaveCSS("background-image", /sakura-feed-desktop/);
  await waitForBackgroundImage(backdrop);
  await expect(header).toHaveCSS("backdrop-filter", /blur/);
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(feedCard).toHaveCSS("backdrop-filter", "none");
  const initialHeaderBackground = await header.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  expect(initialHeaderBackground).toContain("linear-gradient");
  expect(initialHeaderBackground).not.toContain("sakura-feed-desktop");

  const [leftRailFill, rightRailFill, feedCardFill] = await Promise.all([
    leftRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    rightRail.evaluate((element) => getComputedStyle(element).backgroundImage),
    feedCard.evaluate((element) => getComputedStyle(element).backgroundImage),
  ]);
  expect(feedCardFill).toBe(leftRailFill);
  expect(rightRailFill).toBe(leftRailFill);

  const initialBackdropBox = await backdrop.boundingBox();
  const initialHeaderFill = await header.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  const initialHeaderScreenshot = await captureHeaderMaterial(page, header);
  expect(initialBackdropBox).not.toBeNull();
  expect(initialHeaderFill).not.toBe("none");

  await page.evaluate(() => window.scrollTo(0, 700));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const scrolledBackdropBox = await backdrop.boundingBox();
  const scrolledHeaderFill = await header.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  const scrolledHeaderScreenshot = await captureHeaderMaterial(page, header);
  expect(scrolledBackdropBox).toEqual(initialBackdropBox);
  expect(scrolledHeaderFill).toBe(initialHeaderFill);
  expect(scrolledHeaderScreenshot.equals(initialHeaderScreenshot)).toBe(false);

  await page.setViewportSize({ width: 1023, height: 844 });
  expect(await visiblePetalCount()).toBe(3);
  await page.setViewportSize({ width: 1024, height: 844 });
  expect(await visiblePetalCount()).toBe(5);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(backdrop).toHaveCSS("background-image", /sakura-feed-mobile/);
  await waitForBackgroundImage(backdrop);
  expect(await visiblePetalCount()).toBe(3);
  expect(
    await header.evaluate(
      (element) => getComputedStyle(element).backgroundImage
    )
  ).not.toContain("sakura-feed-mobile");
  const mobileNav = page.locator("nav.member-glass-mobile-nav");
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav).toHaveCSS("backdrop-filter", "none");
  const mobileNavFill = await mobileNav.evaluate(
    (element) => getComputedStyle(element).backgroundImage
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  const initialMobileHeaderScreenshot = await captureHeaderMaterial(
    page,
    header,
    16
  );
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect
    .poll(() =>
      mobileNav.evaluate((element) => getComputedStyle(element).backgroundImage)
    )
    .toBe(mobileNavFill);
  const scrolledMobileHeaderScreenshot = await captureHeaderMaterial(
    page,
    header,
    16
  );
  expect(
    scrolledMobileHeaderScreenshot.equals(initialMobileHeaderScreenshot)
  ).toBe(false);
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.emulateMedia({ contrast: "more" });
  await expect(header).toHaveCSS("background-image", "none");
  await expect(header).toHaveCSS("backdrop-filter", "none");

  await page.emulateMedia({
    contrast: "no-preference",
    forcedColors: "active",
  });
  await expect(backdrop).toBeHidden();
  await expect(header).toHaveCSS("background-image", "none");
  await expect(header).toHaveCSS("backdrop-filter", "none");
});

test("members can disable ambient motion and reduced-motion always wins", async ({
  page,
}) => {
  await loginAs(page, "member");
  await page.goto("/settings");

  const backdrop = page.getByTestId("sakura-backdrop");
  const motionToggle = page.getByRole("switch", {
    name: "Ambient background motion",
  });

  await expect(backdrop).toHaveAttribute("data-scene", "ambient-motion");
  await expect(motionToggle).toHaveAttribute("aria-checked", "true");

  await motionToggle.click();
  await expect(backdrop).toHaveAttribute("data-scene", "static");
  await expect(page.getByTestId("sakura-motion-overlay")).toHaveCount(0);

  await page.reload();
  await expect(backdrop).toHaveAttribute("data-scene", "static");
  await expect(motionToggle).toHaveAttribute("aria-checked", "false");

  await motionToggle.click();
  await expect(backdrop).toHaveAttribute("data-scene", "ambient-motion");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(backdrop).toHaveAttribute("data-scene", "static");
  await expect(page.getByTestId("sakura-motion-overlay")).toHaveCount(0);
  await expect(motionToggle).toHaveAttribute("aria-checked", "false");
  await expect(motionToggle).toBeDisabled();
  await expect(
    page.getByText(
      "Motion is currently off because your device requests reduced motion."
    )
  ).toBeVisible();
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
