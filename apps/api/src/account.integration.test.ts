import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  AccountSessionsResponseSchema,
  AuthResponseSchema,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { createMemoryMailer, type MemoryMailer } from "./mail/index.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const TEST_DOMAIN = "@account.pumdoki.test";
const password = "account-test-password";
const newPassword = "account-test-new-password";

let db: PrismaClient;
let mailer: MemoryMailer;
let app: ReturnType<typeof testApp>;

function email(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}${TEST_DOMAIN}`;
}

function sessionCookie(response: request.Response): string {
  const setCookie = response.headers["set-cookie"];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  expect(cookie).toBeTruthy();
  return cookie!.split(";", 1)[0]!;
}

function tokenFromLastMail(address: string): string {
  const message = mailer.lastTo(address);
  expect(message).toBeDefined();
  const match = message!.text.match(/token=([A-Za-z0-9_-]+)/);
  expect(match).not.toBeNull();
  return match![1]!;
}

async function cleanup(): Promise<void> {
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({
    where: { email: { endsWith: TEST_DOMAIN } },
  });
}

async function register(address: string, displayName = "Account User") {
  const response = await request(app).post("/api/v1/auth/register").send({
    email: address,
    password,
    displayName,
    ageAttested: true,
    acceptedTermsVersion: "terms-2026-08-01",
    acceptedPrivacyVersion: "privacy-2026-08-01",
  });
  expect(response.status).toBe(201);
  return { cookie: sessionCookie(response), body: response.body };
}

async function login(address: string, loginPassword = password) {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: address,
    password: loginPassword,
  });
  return {
    response,
    cookie: response.status === 200 ? sessionCookie(response) : undefined,
  };
}

beforeAll(async () => {
  db = await loadTestDatabase();
  await cleanup();
});

beforeEach(async () => {
  await cleanup();
  mailer = createMemoryMailer();
  app = testApp({ db, mailer });
});

afterAll(cleanup);

describe("account settings", () => {
  it("requires authentication for every account route", async () => {
    expect(
      (
        await request(app)
          .patch("/api/v1/me/profile")
          .send({ displayName: "Name" })
      ).status
    ).toBe(401);
    expect(
      (
        await request(app)
          .patch("/api/v1/me/email")
          .send({ email: email("anonymous"), currentPassword: password })
      ).status
    ).toBe(401);
    expect(
      (
        await request(app)
          .patch("/api/v1/me/password")
          .send({ currentPassword: password, newPassword })
      ).status
    ).toBe(401);
    expect((await request(app).get("/api/v1/me/sessions")).status).toBe(401);
  });

  it("updates and trims the display name", async () => {
    const address = email("profile");
    const { cookie } = await register(address);
    const response = await request(app)
      .patch("/api/v1/me/profile")
      .set("Cookie", cookie)
      .send({ displayName: "  Updated Account  " });

    expect(response.status).toBe(200);
    expect(AuthResponseSchema.parse(response.body).user.displayName).toBe(
      "Updated Account"
    );
    expect(
      (await db.user.findUniqueOrThrow({ where: { email: address } }))
        .displayName
    ).toBe("Updated Account");
  });

  it("changes email, requires reverification, and invalidates other credentials", async () => {
    const oldEmail = email("old-email");
    const changedEmail = email("new-email");
    const duplicateEmail = email("duplicate-email");
    const { cookie: currentCookie } = await register(oldEmail);
    const originalVerificationToken = tokenFromLastMail(oldEmail);
    await request(app)
      .post("/api/v1/auth/password-reset/request")
      .send({ email: oldEmail });
    const originalResetToken = tokenFromLastMail(oldEmail);
    const { cookie: otherCookie } = await login(oldEmail);
    await register(duplicateEmail);

    const wrongPassword = await request(app)
      .patch("/api/v1/me/email")
      .set("Cookie", currentCookie)
      .send({ email: changedEmail, currentPassword: "not-the-password" });
    expect(wrongPassword.status).toBe(400);
    expect(wrongPassword.body.error.details).toEqual({
      field: "currentPassword",
    });

    const duplicate = await request(app)
      .patch("/api/v1/me/email")
      .set("Cookie", currentCookie)
      .send({ email: duplicateEmail, currentPassword: password });
    expect(duplicate.status).toBe(409);

    const changed = await request(app)
      .patch("/api/v1/me/email")
      .set("Cookie", currentCookie)
      .send({ email: changedEmail, currentPassword: password });
    expect(changed.status).toBe(200);
    const changedUser = AuthResponseSchema.parse(changed.body).user;
    expect(changedUser.email).toBe(changedEmail);
    expect(changedUser.emailVerified).toBe(false);
    expect(mailer.lastTo(changedEmail)).toBeDefined();

    expect(
      (
        await request(app)
          .post("/api/v1/auth/verify-email/confirm")
          .send({ token: originalVerificationToken })
      ).status
    ).toBe(400);
    const staleReset = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token: originalResetToken, password: newPassword });
    expect(staleReset.status).toBe(400);
    expect(staleReset.body.error.code).toBe("INVALID_TOKEN");
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", otherCookie!)).status
    ).toBe(401);
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", currentCookie)).status
    ).toBe(200);
    expect((await login(oldEmail)).response.status).toBe(401);
    expect((await login(changedEmail)).response.status).toBe(200);
  });

  it("changes password, invalidates reset links, and signs out other sessions", async () => {
    const address = email("password");
    const { cookie: currentCookie } = await register(address);
    const { cookie: otherCookie } = await login(address);
    await request(app)
      .post("/api/v1/auth/password-reset/request")
      .send({ email: address });
    const resetToken = tokenFromLastMail(address);

    const wrongPassword = await request(app)
      .patch("/api/v1/me/password")
      .set("Cookie", currentCookie)
      .send({ currentPassword: "wrong-password", newPassword });
    expect(wrongPassword.status).toBe(400);

    const reusedPassword = await request(app)
      .patch("/api/v1/me/password")
      .set("Cookie", currentCookie)
      .send({ currentPassword: password, newPassword: password });
    expect(reusedPassword.status).toBe(400);

    const changed = await request(app)
      .patch("/api/v1/me/password")
      .set("Cookie", currentCookie)
      .send({ currentPassword: password, newPassword });
    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ status: "changed" });

    expect(
      (await request(app).get("/api/v1/me").set("Cookie", currentCookie)).status
    ).toBe(200);
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", otherCookie!)).status
    ).toBe(401);
    expect((await login(address, password)).response.status).toBe(401);
    expect((await login(address, newPassword)).response.status).toBe(200);
    const staleReset = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token: resetToken, password: "another-new-password" });
    expect(staleReset.status).toBe(400);
    expect(staleReset.body.error.code).toBe("INVALID_TOKEN");
  });

  it("lists active sessions, marks the current one, and scopes revocation", async () => {
    const ownerEmail = email("sessions-owner");
    const foreignEmail = email("sessions-foreign");
    const { cookie: ownerCookie } = await register(ownerEmail);
    const { cookie: otherOwnerCookie } = await login(ownerEmail);
    const { cookie: foreignCookie } = await register(foreignEmail);

    const ownerList = await request(app)
      .get("/api/v1/me/sessions")
      .set("Cookie", ownerCookie);
    expect(ownerList.status).toBe(200);
    const ownerSessions = AccountSessionsResponseSchema.parse(
      ownerList.body
    ).sessions;
    expect(ownerSessions).toHaveLength(2);
    expect(ownerSessions.filter((session) => session.current)).toHaveLength(1);
    const otherOwnerSession = ownerSessions.find(
      (session) => !session.current
    )!;

    const foreignList = await request(app)
      .get("/api/v1/me/sessions")
      .set("Cookie", foreignCookie);
    const foreignSession = AccountSessionsResponseSchema.parse(foreignList.body)
      .sessions[0]!;
    const foreignAttempt = await request(app)
      .delete(`/api/v1/me/sessions/${foreignSession.id}`)
      .set("Cookie", ownerCookie);
    expect(foreignAttempt.status).toBe(404);

    const revoked = await request(app)
      .delete(`/api/v1/me/sessions/${otherOwnerSession.id}`)
      .set("Cookie", ownerCookie);
    expect(revoked.status).toBe(204);
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", otherOwnerCookie!))
        .status
    ).toBe(401);
  });
});
