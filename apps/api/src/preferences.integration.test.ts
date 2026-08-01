import request from "supertest";
import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { UserPreferencesResponseSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const TEST_DOMAIN = "@preferences.pumdoki.test";
let db: PrismaClient;

async function cleanup(): Promise<void> {
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({
    where: { email: { endsWith: TEST_DOMAIN } },
  });
}

async function register(label: string): Promise<string> {
  const response = await request(testApp({ db }))
    .post("/api/v1/auth/register")
    .send({
      email: `${label}${TEST_DOMAIN}`,
      password: "preferences-test-password",
      displayName: `Preferences ${label}`,
      ageAttested: true,
      acceptedTermsVersion: "terms-2026-08-01",
      acceptedPrivacyVersion: "privacy-2026-08-01",
    });
  expect(response.status).toBe(201);
  const setCookie = response.headers["set-cookie"];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  expect(cookie).toBeTruthy();
  return cookie!.split(";", 1)[0]!;
}

beforeAll(async () => {
  db = await loadTestDatabase();
  await cleanup();
});

beforeEach(cleanup);

afterAll(async () => {
  await cleanup();
  await db.$disconnect();
});

describe("user preferences", () => {
  it("rejects anonymous reads and updates", async () => {
    const app = testApp({ db });
    expect((await request(app).get("/api/v1/me/preferences")).status).toBe(401);
    expect(
      (
        await request(app)
          .patch("/api/v1/me/preferences")
          .send({ showExplicitContent: true })
      ).status
    ).toBe(401);
  });

  it("creates and returns the default-hidden preference at registration", async () => {
    const cookie = await register("default");
    const response = await request(testApp({ db }))
      .get("/api/v1/me/preferences")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(
      UserPreferencesResponseSchema.parse(response.body).preferences
        .showExplicitContent
    ).toBe(false);
  });

  it("persists explicit opt-in and opt-out", async () => {
    const cookie = await register("persist");
    const app = testApp({ db });

    const enabled = await request(app)
      .patch("/api/v1/me/preferences")
      .set("Cookie", cookie)
      .send({ showExplicitContent: true });
    expect(enabled.status).toBe(200);
    expect(
      UserPreferencesResponseSchema.parse(enabled.body).preferences
        .showExplicitContent
    ).toBe(true);

    const reloaded = await request(app)
      .get("/api/v1/me/preferences")
      .set("Cookie", cookie);
    expect(
      UserPreferencesResponseSchema.parse(reloaded.body).preferences
        .showExplicitContent
    ).toBe(true);

    const disabled = await request(app)
      .patch("/api/v1/me/preferences")
      .set("Cookie", cookie)
      .send({ showExplicitContent: false });
    expect(disabled.status).toBe(200);
    expect(disabled.body.preferences.showExplicitContent).toBe(false);
  });

  it("rejects malformed update bodies", async () => {
    const cookie = await register("invalid");
    const response = await request(testApp({ db }))
      .patch("/api/v1/me/preferences")
      .set("Cookie", cookie)
      .send({ showExplicitContent: "yes" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });
});
