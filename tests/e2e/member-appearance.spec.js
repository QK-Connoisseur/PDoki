import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

async function openAppearance(page, mobile = false) {
  const rail = page.locator(
    mobile ? "nav.member-glass-mobile-nav" : "aside.member-glass-rail-left"
  );
  await rail.getByRole("button", { name: "Appearance", exact: true }).click();
  const panel = rail.getByRole("dialog", { name: "Themes and motion" });
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

test("the desktop palette changes themes and persists an independent motion choice", async ({
  page,
}) => {
  await loginAs(page, "member");
  await expect(page.getByTestId("sakura-backdrop")).toBeVisible();

  let panel = await openAppearance(page);
  await expect(panel.getByRole("radio", { name: "Sakura Kiss" })).toBeChecked();
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "desktop");
  await expect(page.getByTestId("sakura-backdrop")).toHaveCount(0);
  await expect(backdrop).toHaveAttribute("data-background-motion", "on");
  await expect(backdrop.locator("[data-motion-element]")).toHaveCount(5);

  await panel.getByRole("switch", { name: "Background motion" }).click();
  await expect(backdrop).toHaveAttribute("data-background-motion", "off");
  await expect(page.getByTestId("dark-knight-motion-overlay")).toHaveCount(0);
  await expectLoadedCityBackdrop(page, "desktop");

  await page.reload();
  await expectLoadedCityBackdrop(page, "desktop");
  await expect(backdrop).toHaveAttribute("data-background-motion", "off");
  panel = await openAppearance(page);
  await expect(
    panel.getByRole("radio", { name: "Midnight City" })
  ).toBeChecked();
  await expect(
    panel.getByRole("switch", { name: "Background motion" })
  ).toHaveAttribute("aria-checked", "false");

  await panel.getByText("Sakura Kiss", { exact: true }).click();
  await expect(page.getByTestId("dark-knight-backdrop")).toHaveCount(0);
  await expect(page.getByTestId("sakura-backdrop")).toHaveAttribute(
    "data-background-motion",
    "off"
  );
  await panel.getByRole("switch", { name: "Background motion" }).click();
  await expect(page.getByTestId("sakura-motion-overlay")).toBeVisible();
});

test("Midnight City obeys live device reduced-motion changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loginAs(page, "member");
  const panel = await openAppearance(page);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "desktop");
  const motion = panel.getByRole("switch", { name: "Background motion" });

  await expect(motion).toBeDisabled();
  await expect(motion).toHaveAttribute("aria-checked", "false");
  await expect(motion).toHaveAccessibleDescription(
    "Off to respect your device’s reduced-motion setting."
  );
  await expect(backdrop).toHaveAttribute("data-background-motion", "off");
  await expect(page.getByTestId("dark-knight-motion-overlay")).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(motion).toBeEnabled();
  await expect(motion).toHaveAttribute("aria-checked", "true");
  await expect(backdrop).toHaveAttribute("data-background-motion", "on");
  await expect(page.getByTestId("dark-knight-motion-overlay")).toBeVisible();
});

test("the mobile palette stays inside a 320px viewport and uses the mobile city artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await loginAs(page, "member");
  const panel = await openAppearance(page, true);
  await panel.getByText("Midnight City", { exact: true }).click();
  const backdrop = await expectLoadedCityBackdrop(page, "mobile");
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(box.y + box.height).toBeLessThanOrEqual(700);
  await panel.getByRole("switch", { name: "Background motion" }).click();
  await expect(backdrop).toHaveAttribute("data-background-motion", "off");
  await panel.getByRole("button", { name: "Close appearance" }).click();
  await expect(panel).toHaveCount(0);
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
