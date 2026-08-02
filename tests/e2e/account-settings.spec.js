import { expect, test } from "@playwright/test";
import { submitLogin } from "./auth-helpers";

async function waitForMailLink(request, email, route) {
  let text = "";
  await expect
    .poll(
      async () => {
        const query = encodeURIComponent(`to:${email}`);
        const response = await request.get(
          `http://127.0.0.1:8025/view/latest.txt?query=${query}`
        );
        text = response.ok() ? await response.text() : "";
        return text;
      },
      { timeout: 15_000 }
    )
    .toContain(route);

  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(
    new RegExp(`http://127\\.0\\.0\\.1:5173${escapedRoute}\\?token=[^\\s]+`)
  );
  expect(match, `Expected ${route} link in captured email`).toBeTruthy();
  return match[0];
}

test("a member manages profile, email, password, and active sessions", async ({
  page,
  request,
}, testInfo) => {
  const originalEmail = `account-${testInfo.workerIndex}-${Date.now()}@pumdoki.example`;
  const changedEmail = `account-changed-${testInfo.workerIndex}-${Date.now()}@pumdoki.example`;
  const originalPassword = "account-e2e-password";
  const changedPassword = "account-e2e-new-password";

  await page.goto("/signup");
  await page.getByLabel("Display name").fill("Account Member");
  await page.getByLabel("Email address").fill(originalEmail);
  await page.getByLabel("Password", { exact: true }).fill(originalPassword);
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill(originalPassword);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/home$/);

  const secondLogin = await request.post(
    "http://127.0.0.1:3000/api/v1/auth/login",
    { data: { email: originalEmail, password: originalPassword } }
  );
  expect(secondLogin.status()).toBe(200);

  await page.goto("/settings");
  const account = page
    .getByRole("heading", { name: "Account details" })
    .locator("xpath=ancestor::section");
  await account.getByLabel("Display name").fill("Updated Account Member");
  await account.getByRole("button", { name: "Save display name" }).click();
  await expect(account.getByText("Display name updated.")).toBeVisible();

  await expect(page.getByText("Current session")).toBeVisible();
  const revokeButton = page.getByRole("button", {
    name: /Revoke .* session/,
  });
  await expect(revokeButton).toHaveCount(1);
  await revokeButton.click();
  await expect(revokeButton).toHaveCount(0);

  await account.getByLabel("New email").fill(changedEmail);
  await account.getByLabel("Current password").fill(originalPassword);
  await account.getByRole("button", { name: "Change email" }).click();
  await expect(
    account.getByText(/Open the new verification message in Mailpit/)
  ).toBeVisible();
  await expect(account.getByText("Email not verified")).toBeVisible();

  const verificationLink = await waitForMailLink(
    request,
    changedEmail,
    "/verify-email"
  );
  await page.goto(verificationLink);
  await expect(page.getByText("Email verified")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.goto("/settings");

  const password = page
    .getByRole("heading", { name: "Password" })
    .locator("xpath=ancestor::section");
  await password.getByLabel("Current password").fill(originalPassword);
  await password
    .getByLabel("New password", { exact: true })
    .fill(changedPassword);
  await password
    .getByLabel("Confirm new password", { exact: true })
    .fill(changedPassword);
  await password.getByRole("button", { name: "Change password" }).click();
  await expect(
    password.getByText("Password changed. Your other sessions were signed out.")
  ).toBeVisible();

  await page.getByRole("button", { name: "Profile menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await submitLogin(page, {
    email: changedEmail,
    password: originalPassword,
  });
  await expect(
    page.getByText("The email or password is incorrect.")
  ).toBeVisible();
  await page.getByLabel("Password").fill(changedPassword);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/settings$/);
});
