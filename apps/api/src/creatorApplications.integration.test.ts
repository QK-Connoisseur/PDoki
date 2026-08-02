import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  CREATOR_AGREEMENT_VERSION,
  CREATOR_CONTENT_POLICY_VERSION,
  CreatorApplicationResponseSchema,
  CurrentCreatorApplicationResponseSchema,
  IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const TEST_DOMAIN = "@creator-application.pumdoki.test";
const password = "creator-application-password";
let db: PrismaClient;
let app: ReturnType<typeof testApp>;

function email(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}${TEST_DOMAIN}`;
}

function cookieFrom(response: request.Response): string {
  const setCookie = response.headers["set-cookie"];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  expect(cookie).toBeTruthy();
  return cookie!.split(";", 1)[0]!;
}

function validApplication(overrides = {}) {
  return {
    creatorName: "Sakura Studio",
    countryCode: "us",
    acceptedCreatorAgreement: true,
    acceptedCreatorAgreementVersion: CREATOR_AGREEMENT_VERSION,
    acceptedContentPolicy: true,
    acceptedContentPolicyVersion: CREATOR_CONTENT_POLICY_VERSION,
    acceptedIdentityVerificationDisclosure: true,
    acceptedIdentityVerificationDisclosureVersion:
      IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
    ...overrides,
  };
}

async function cleanup(): Promise<void> {
  await db.creatorApplication.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({
    where: { email: { endsWith: TEST_DOMAIN } },
  });
}

async function register(label: string) {
  const address = email(label);
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({
      email: address,
      password,
      displayName: `Member ${label}`,
      ageAttested: true,
      acceptedTermsVersion: "terms-2026-08-01",
      acceptedPrivacyVersion: "privacy-2026-08-01",
    });
  expect(response.status).toBe(201);
  return {
    address,
    cookie: cookieFrom(response),
    userId: response.body.user.id as string,
  };
}

beforeAll(async () => {
  db = await loadTestDatabase();
  await cleanup();
});

beforeEach(async () => {
  await cleanup();
  app = testApp({ db });
});

afterAll(cleanup);

describe("creator applications", () => {
  it("requires authentication and a verified member account", async () => {
    expect(
      (await request(app).get("/api/v1/me/creator-application")).status
    ).toBe(401);
    expect(
      (
        await request(app)
          .post("/api/v1/creator-applications")
          .send(validApplication())
      ).status
    ).toBe(401);

    const unverified = await register("unverified");
    const response = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", unverified.cookie)
      .send(validApplication());
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("EMAIL_UNVERIFIED");

    const creator = await register("creator-role");
    await db.user.update({
      where: { id: creator.userId },
      data: { role: "CREATOR", emailVerifiedAt: new Date() },
    });
    const creatorResponse = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", creator.cookie)
      .send(validApplication());
    expect(creatorResponse.status).toBe(403);
    expect(creatorResponse.body.error.code).toBe("FORBIDDEN");
  });

  it("returns null before a member submits", async () => {
    const member = await register("empty");
    const response = await request(app)
      .get("/api/v1/me/creator-application")
      .set("Cookie", member.cookie);
    expect(response.status).toBe(200);
    expect(
      CurrentCreatorApplicationResponseSchema.parse(response.body)
    ).toEqual({ application: null });
  });

  it("atomically creates a pending application and versioned evidence", async () => {
    const member = await register("submit");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });

    const response = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .set("X-Forwarded-For", "203.0.113.42")
      .send(validApplication({ creatorName: "  Sakura Studio  " }));
    expect(response.status).toBe(201);
    const application = CreatorApplicationResponseSchema.parse(
      response.body
    ).application;
    expect(application).toMatchObject({
      userId: member.userId,
      creatorName: "Sakura Studio",
      countryCode: "US",
      status: "PENDING",
      identityVerificationStatus: "NOT_STARTED",
    });

    const evidence = await db.acceptanceRecord.findMany({
      where: {
        userId: member.userId,
        kind: {
          in: [
            "CREATOR_AGREEMENT",
            "CREATOR_CONTENT_POLICY",
            "IDENTITY_VERIFICATION_DISCLOSURE",
          ],
        },
      },
      orderBy: { kind: "asc" },
    });
    expect(evidence).toHaveLength(3);
    expect(evidence.map(({ version }) => version)).toEqual([
      CREATOR_AGREEMENT_VERSION,
      CREATOR_CONTENT_POLICY_VERSION,
      IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
    ]);
    expect(evidence.every(({ ipAddress }) => ipAddress.length > 0)).toBe(true);

    const user = await db.user.findUniqueOrThrow({
      where: { id: member.userId },
    });
    expect(user.role).toBe("MEMBER");
  });

  it("loads the persisted outcome and rejects duplicate submissions", async () => {
    const member = await register("persist");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const created = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());
    expect(created.status).toBe(201);

    const loaded = await request(app)
      .get("/api/v1/me/creator-application")
      .set("Cookie", member.cookie);
    expect(loaded.status).toBe(200);
    expect(loaded.body).toEqual(created.body);

    const duplicate = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("CONFLICT");
    expect(
      await db.acceptanceRecord.count({
        where: {
          userId: member.userId,
          kind: {
            in: [
              "CREATOR_AGREEMENT",
              "CREATOR_CONTENT_POLICY",
              "IDENTITY_VERIFICATION_DISCLOSURE",
            ],
          },
        },
      })
    ).toBe(3);
  });

  it("rejects false acceptance and malformed country codes", async () => {
    const member = await register("invalid");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const response = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(
        validApplication({
          countryCode: "United States",
          acceptedContentPolicy: false,
        })
      );
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });
});
