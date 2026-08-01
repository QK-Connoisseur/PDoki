import { test, expect } from "@playwright/test";
import { submitLogin } from "./auth-helpers";

test("a member can deliberately opt in, persist, and opt out of explicit content", async ({
  page,
  request,
}, testInfo) => {
  const email = `preferences-${testInfo.workerIndex}-${Date.now()}@pumdoki.example`;
  const password = "preferences-e2e-password";

  const registration = await request.post(
    "http://127.0.0.1:3000/api/v1/auth/register",
    {
      data: {
        displayName: "Preferences Member",
        email,
        password,
        ageAttested: true,
        acceptedTermsVersion: "prototype-2026-07-28",
        acceptedPrivacyVersion: "prototype-2026-07-28",
      },
    }
  );
  expect(registration.status()).toBe(201);

  await page.goto("/login");
  await submitLogin(page, { email, password });
  await expect(page).toHaveURL(/\/home$/);

  await page.getByRole("button", { name: "Profile menu" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);

  const toggle = page.getByRole("switch", { name: "Show explicit content" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await toggle.click();
  await expect(
    page.getByRole("dialog", { name: "Show explicit content?" })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Yes, show explicit content" })
    .click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
