import { expect, test } from "@playwright/test";

function uniqueEmail(testInfo) {
  return `creator-application-${testInfo.workerIndex}-${Date.now()}@pumdoki.example`;
}

async function waitForVerificationLink(request, email) {
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
    .toContain("/verify-email");

  const match = text.match(
    /http:\/\/127\.0\.0\.1:5173\/verify-email\?token=[^\s]+/
  );
  expect(match, "Expected verification link in captured email").toBeTruthy();
  return match[0];
}

test("a verified member submits a persisted pending creator application", async ({
  page,
  request,
}, testInfo) => {
  const email = uniqueEmail(testInfo);

  await page.goto("/signup");
  await page.getByLabel("Display name").fill("E2E Creator Applicant");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("initial-password");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("initial-password");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/home$/);

  await page.goto(await waitForVerificationLink(request, email));
  await expect(page.getByText("Email verified")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/home$/);

  await page.getByRole("button", { name: "Profile menu" }).click();
  await expect(
    page.getByRole("button", { name: "Creator Dashboard" })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Apply to become a creator" }).click();
  await expect(page).toHaveURL(/\/creator\/onboarding$/);

  await expect(
    page.getByText("Tell us about your creator profile")
  ).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await page.getByLabel("Country code").fill("us");
  await page.getByRole("button", { name: "Continue" }).click();

  const policyChecks = page.getByRole("checkbox");
  await expect(policyChecks).toHaveCount(2);
  await policyChecks.nth(0).check();
  await policyChecks.nth(1).check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Application received")).toBeVisible();
  await expect(page.getByText("NOT STARTED")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Application received")).toBeVisible();
  await expect(page.getByText("E2E Creator Applicant")).toBeVisible();

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", {
      name: "Oops! You need verified creator access to open this studio.",
    })
  ).toBeVisible();
});
