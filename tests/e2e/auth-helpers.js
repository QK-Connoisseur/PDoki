import { expect } from "@playwright/test";

export const seedAccounts = {
  member: {
    email: "member@pumdoki.example",
    password: "pumdoki-dev-password",
  },
  creator: {
    email: "creator@pumdoki.example",
    password: "pumdoki-dev-password",
  },
  admin: {
    email: "admin@pumdoki.example",
    password: "pumdoki-dev-password",
  },
};

export async function submitLogin(page, account = seedAccounts.member) {
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

export async function loginAs(page, role = "member") {
  await page.goto("/login");
  await submitLogin(page, seedAccounts[role]);
  await expect(page).toHaveURL(/\/home$/);
}
