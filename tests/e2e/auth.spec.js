import { test, expect } from "@playwright/test";
import { loginAs, seedAccounts, submitLogin } from "./auth-helpers";

function uniqueEmail(testInfo, label) {
  return `${label}-${testInfo.workerIndex}-${Date.now()}@pumdoki.example`;
}

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

test("registration persists, dismisses its reminder, and verifies through the emailed link", async ({
  page,
  request,
}, testInfo) => {
  const email = uniqueEmail(testInfo, "verify");

  await page.goto("/signup");
  await page.getByLabel("Display name").fill("E2E Member");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("initial-password");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("initial-password");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create Account" }).click();

  const verificationReminder = page.getByRole("complementary", {
    name: "Email verification",
  });
  await expect(page).toHaveURL(/\/home$/);
  await expect(verificationReminder).toContainText(email);

  const firstMoment = page.locator(".moment-item-create").first();
  const chatSidebar = page.getByRole("complementary", {
    name: "Chat sidebar",
  });
  await expect(firstMoment).toBeVisible();
  await expect(chatSidebar).toBeVisible();
  const [desktopReminderBox, desktopMomentBox, desktopChatBox] =
    await Promise.all([
      verificationReminder.boundingBox(),
      firstMoment.boundingBox(),
      chatSidebar.boundingBox(),
    ]);
  expect(desktopReminderBox).not.toBeNull();
  expect(desktopMomentBox).not.toBeNull();
  expect(desktopChatBox).not.toBeNull();
  const desktopReminderBottom =
    desktopReminderBox.y + desktopReminderBox.height;
  expect(desktopReminderBottom).toBeLessThanOrEqual(desktopMomentBox.y + 1);
  expect(desktopReminderBottom).toBeLessThanOrEqual(desktopChatBox.y + 1);

  await page.getByRole("button", { name: "Chat with Luna Bloom" }).click();
  const messagesDialog = page.getByRole("dialog", { name: "Messages" });
  const chatBubble = page.getByText(
    "Hey! Just wanted to say your content is amazing 💕",
    { exact: true }
  );
  await expect(messagesDialog).toBeVisible();
  await expect(chatBubble).toBeVisible();
  await expect
    .poll(() =>
      chatBubble.evaluate((bubble) => {
        const box = bubble.getBoundingClientRect();
        const topmost = document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2
        );
        return topmost === bubble || bubble.contains(topmost);
      })
    )
    .toBe(true);
  await page.getByRole("button", { name: "Close messages" }).click();
  await expect(messagesDialog).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(firstMoment).toBeVisible();
  const [mobileReminderBox, mobileMomentBox] = await Promise.all([
    verificationReminder.boundingBox(),
    firstMoment.boundingBox(),
  ]);
  expect(mobileReminderBox).not.toBeNull();
  expect(mobileMomentBox).not.toBeNull();
  expect(mobileReminderBox.x).toBeGreaterThanOrEqual(0);
  expect(mobileReminderBox.x + mobileReminderBox.width).toBeLessThanOrEqual(
    390
  );
  expect(mobileReminderBox.y + mobileReminderBox.height).toBeLessThanOrEqual(
    mobileMomentBox.y + 1
  );
  await page.setViewportSize({ width: 1280, height: 720 });

  await page
    .getByRole("button", { name: "Dismiss email verification reminder" })
    .click();
  await expect(verificationReminder).toHaveCount(0);
  await page.goto("/store");
  await expect(verificationReminder).toHaveCount(0);

  const verificationLink = await waitForMailLink(
    request,
    email,
    "/verify-email"
  );
  await page.goto(verificationLink);
  await expect(page.getByText("Email verified")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(verificationReminder).toHaveCount(0);

  await page.reload();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText("For You")).toBeVisible();
});

test("password reset revokes sessions and replaces the old password", async ({
  page,
  request,
}, testInfo) => {
  const email = uniqueEmail(testInfo, "reset");
  const oldPassword = "initial-password";
  const newPassword = "replacement-password";

  const registration = await request.post(
    "http://127.0.0.1:3000/api/v1/auth/register",
    {
      data: {
        displayName: "Reset Member",
        email,
        password: oldPassword,
        ageAttested: true,
        acceptedTermsVersion: "prototype-2026-07-28",
        acceptedPrivacyVersion: "prototype-2026-07-28",
      },
    }
  );
  expect(registration.status()).toBe(201);

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Request reset link" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  const resetLink = await waitForMailLink(request, email, "/reset-password");
  await page.goto(resetLink);
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill(newPassword);
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page.getByText("Password reset complete")).toBeVisible();
  await page.getByRole("button", { name: "Continue to login" }).click();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(oldPassword);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(
    page.getByText("The email or password is incorrect.")
  ).toBeVisible();

  await page.getByLabel("Password").fill(newPassword);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test("logout revokes the cookie and protects member routes after refresh", async ({
  page,
}) => {
  await loginAs(page);
  await page.getByRole("button", { name: "Profile menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/home");
  await expect(page).toHaveURL(/\/login$/);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});

test("creator dashboard navigation and route access are creator-only", async ({
  page,
}) => {
  await page.goto("/login");
  await submitLogin(page, seedAccounts.member);
  await expect(page).toHaveURL(/\/home$/);

  await page.getByRole("button", { name: "Profile menu" }).click();
  await expect(
    page.getByRole("button", { name: "Creator Dashboard" })
  ).toHaveCount(0);

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", {
      name: "Oops! You need verified creator access to open this studio.",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start or view creator application" })
  ).toBeVisible();
});

test("creators can open the dashboard from the profile menu", async ({
  page,
}) => {
  await page.goto("/login");
  await submitLogin(page, seedAccounts.creator);
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("complementary", { name: "Email verification" })
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Profile menu" }).click();
  await page.getByRole("button", { name: "Creator Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("the public web app has no admin route", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "This page wandered off." })
  ).toBeVisible();
  await expect(page.getByText("Admin area")).toHaveCount(0);
  await expect(page.getByText(/admin/i)).toHaveCount(0);
});
