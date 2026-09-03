import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

async function openAppearance(page, mobile = false) {
  const rail = page.locator(
    mobile ? "nav.member-glass-mobile-nav" : "aside.member-glass-rail-left"
  );
  await rail.getByRole("button", { name: "Appearance", exact: true }).click();
  const panel = rail.getByRole("dialog", { name: "Themes" });
  await expect(panel).toBeVisible();
  return panel;
}

async function expectLoadedCityBackdrop(page, variant) {
  const backdrop = page.getByTestId("dark-knight-backdrop");
  await expect(backdrop).toBeVisible();
  await expect(backdrop).toHaveCSS(
    "background-image",
    new RegExp(`midnight-city-feed-${variant}`)
  );
  await backdrop.evaluate(async (element) => {
    const url = getComputedStyle(element).backgroundImage.match(
      /url\(["']?([^"')]+)["']?\)/
    )?.[1];
    if (!url) throw new Error("Expected the city background URL");
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth) throw new Error("The city image did not load");
  });
  return backdrop;
}

async function expectStaticBackdrop(page, backdrop) {
  await expect(backdrop).toHaveAttribute("data-scene", "static");
  await expect(backdrop).toHaveAttribute("aria-hidden", "true");
  await expect(backdrop).toBeEmpty();
  await expect(backdrop).toHaveCSS("animation-name", "none");
  await expect(
    page.locator(
      '[data-testid="sakura-motion-overlay"], [data-testid="dark-knight-motion-overlay"], [data-testid="sakura-petal-video"], [data-testid="midnight-city-cloud-video"]'
    )
  ).toHaveCount(0);
}

test("the desktop palette keeps both static themes and persists the theme choice", async ({
  page,
}) => {
  await loginAs(page, "member");
  await expect(page.getByTestId("sakura-backdrop")).toBeVisible();
  await expectStaticBackdrop(page, page.getByTestId("sakura-backdrop"));

  const rail = page.locator("aside.member-glass-rail-left");
  const paletteBox = await rail
    .getByRole("button", { name: "Appearance", exact: true })
    .boundingBox();
  const moreBox = await rail
    .getByRole("button", { name: "More", exact: true })
    .boundingBox();
  expect(paletteBox).not.toBeNull();
  expect(moreBox).not.toBeNull();
  expect(paletteBox.y + paletteBox.height).toBeLessThanOrEqual(moreBox.y);

  let panel = await openAppearance(page);
  await expect(panel.getByRole("radio", { name: "Sakura Kiss" })).toBeChecked();
  await expect(panel.getByRole("switch")).toHaveCount(0);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "desktop");
  await expect(page.getByTestId("sakura-backdrop")).toHaveCount(0);
  await expectStaticBackdrop(page, backdrop);

  await page.reload();
  await expectLoadedCityBackdrop(page, "desktop");
  await expectStaticBackdrop(page, backdrop);
  panel = await openAppearance(page);
  await expect(
    panel.getByRole("radio", { name: "Midnight City" })
  ).toBeChecked();
  await expect(panel.getByRole("switch")).toHaveCount(0);

  await panel.getByText("Sakura Kiss", { exact: true }).click();
  await expect(page.getByTestId("dark-knight-backdrop")).toHaveCount(0);
  await expectStaticBackdrop(page, page.getByTestId("sakura-backdrop"));
});

test("legacy motion preferences cannot reactivate either theme's background motion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("pumdoki:sakura-background-motion:v1", "on");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loginAs(page, "member");
  await expectStaticBackdrop(page, page.getByTestId("sakura-backdrop"));
  const panel = await openAppearance(page);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "desktop");
  await expect(panel.getByRole("switch")).toHaveCount(0);
  await expectStaticBackdrop(page, backdrop);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expectStaticBackdrop(page, backdrop);
  await panel.getByText("Sakura Kiss", { exact: true }).click();
  await expectStaticBackdrop(page, page.getByTestId("sakura-backdrop"));
  await page.reload();
  await expectStaticBackdrop(page, page.getByTestId("sakura-backdrop"));
});

test("the mobile palette stays inside a 320px viewport and uses the mobile city artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await loginAs(page, "member");
  const cookieConsent = page.getByRole("dialog", { name: "Cookie consent" });
  await cookieConsent
    .getByRole("button", { name: "Reject Non-Essential", exact: true })
    .click();
  await expect(cookieConsent).toHaveCount(0);
  const panel = await openAppearance(page, true);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "mobile");
  await expectStaticBackdrop(page, backdrop);
  await expect(panel.getByRole("switch")).toHaveCount(0);
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(box.y + box.height).toBeLessThanOrEqual(700);
  await panel.getByRole("button", { name: "Close appearance" }).click();
  await expect(panel).toHaveCount(0);
});

test("the static city artwork switches cleanly across the 767px responsive breakpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await loginAs(page, "member");
  const cookieConsent = page.getByRole("dialog", { name: "Cookie consent" });
  await expect(cookieConsent).toBeVisible();
  await cookieConsent
    .getByRole("button", { name: "Reject Non-Essential", exact: true })
    .click();
  await expect(cookieConsent).toHaveCount(0);

  const panel = await openAppearance(page);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "desktop");
  await expectStaticBackdrop(page, backdrop);

  await page.setViewportSize({ width: 767, height: 1024 });
  await expectLoadedCityBackdrop(page, "mobile");
  await expectStaticBackdrop(page, backdrop);

  await page.setViewportSize({ width: 768, height: 1024 });
  await expectLoadedCityBackdrop(page, "desktop");
  await expectStaticBackdrop(page, backdrop);
});

test("non-feed member pages offer both prototype editors without navigating or publishing", async ({
  page,
}) => {
  // Promotions must not expire based on the wall clock during this shell test.
  await page.clock.setFixedTime(new Date("2026-08-20T12:00:00Z"));
  await loginAs(page, "member");
  const appearance = await openAppearance(page);
  await appearance.getByText("Midnight City", { exact: true }).click();
  await appearance.getByRole("button", { name: "Close appearance" }).click();

  for (const path of ["/connect", "/store", "/profile", "/promotions"]) {
    await page.goto(path);
    const rail = page.locator("aside.member-glass-rail-left");
    await rail.getByRole("button", { name: "Create", exact: true }).click();
    await expect(
      rail.getByRole("button", { name: "Create Moment", exact: true })
    ).toBeVisible();
    await rail
      .getByRole("button", { name: "Create Post", exact: true })
      .click();
    const post = page.getByRole("dialog", { name: "Create Post" });
    await expect(post).toBeVisible();
    await expect(
      post.getByRole("button", { name: "Post", exact: true })
    ).toBeDisabled();
    await post.getByRole("button", { name: "Close", exact: true }).click();

    await rail.getByRole("button", { name: "Create", exact: true }).click();
    await rail
      .getByRole("button", { name: "Create Moment", exact: true })
      .click();
    const moment = page.getByRole("dialog", { name: "Create Moment" });
    await expect(moment).toBeVisible();
    await expect(
      moment.getByRole("button", { name: "Share Moment" })
    ).toBeDisabled();
    await moment.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});
