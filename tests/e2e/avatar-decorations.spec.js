import { test, expect } from "@playwright/test";
import { loginAs } from "./auth-helpers";

test("publication and chat avatars use cosmetics while Moments keep their own frames", async ({
  page,
}) => {
  await loginAs(page, "member");

  const firstPublicationAvatar = page
    .getByRole("button", { name: /^View .+'s profile$/ })
    .first();
  await expect(firstPublicationAvatar).toBeVisible();
  await expect(
    firstPublicationAvatar.locator("[data-avatar-decoration]")
  ).toHaveCount(1);

  const momentItems = page.locator(".moment-item");
  await expect(momentItems.first()).toBeVisible();
  await expect(momentItems.locator("[data-avatar-decoration]")).toHaveCount(0);

  const chatContact = page.getByRole("button", {
    name: "Chat with Luna Bloom",
  });
  await expect(chatContact).toBeVisible();
  await expect(chatContact.locator("[data-avatar-decoration]")).toHaveCount(1);

  const chatDecorations = page
    .getByRole("complementary", { name: "Chat sidebar" })
    .locator("[data-avatar-decoration]");
  await expect(chatDecorations).toHaveCount(6);
  const [firstDecoration, secondDecoration] = await Promise.all([
    chatDecorations.nth(0).boundingBox(),
    chatDecorations.nth(1).boundingBox(),
  ]);
  expect(firstDecoration).not.toBeNull();
  expect(secondDecoration).not.toBeNull();
  expect(
    secondDecoration.y - (firstDecoration.y + firstDecoration.height)
  ).toBeGreaterThanOrEqual(1);
});
