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
import {
  createMemoryMailer,
  type Mailer,
  type MemoryMailer,
} from "./mail/index.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const TEST_DOMAIN = "@creator-application.pumdoki.test";
const password = "creator-application-password";
let db: PrismaClient;
let app: ReturnType<typeof testApp>;
let mailer: MemoryMailer;

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

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function receiptMessages() {
  return mailer.sent.filter(
    ({ template }) => template === "creator-application-received"
  );
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

async function waitForRecipientLock(): Promise<void> {
  const deadline = Date.now() + 5_000;
  const queryPattern = "%creator_application_verified_email_lock%";
  while (Date.now() < deadline) {
    const [result] = await db.$queryRaw<Array<{ waiting: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
          AND datname = current_database()
          AND state = 'active'
          AND wait_event_type = 'Lock'
          AND query LIKE ${queryPattern}
      ) AS "waiting"
    `;
    if (result?.waiting) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("creator application did not wait for the email row lock");
}

async function submitWhileEmailUpdateCommits(
  member: { userId: string; cookie: string },
  update: { email: string; emailVerifiedAt: Date | null }
) {
  const updateStarted = deferred();
  const releaseUpdate = deferred();
  const emailUpdate = db.$transaction(
    async (tx) => {
      try {
        await tx.user.update({
          where: { id: member.userId },
          data: update,
        });
        updateStarted.resolve();
        await releaseUpdate.promise;
      } catch (error) {
        updateStarted.reject(error);
        throw error;
      }
    },
    { timeout: 10_000 }
  );

  await updateStarted.promise;
  const submission = request(app)
    .post("/api/v1/creator-applications")
    .set("Cookie", member.cookie)
    .send(validApplication())
    .then((response) => response);

  try {
    await waitForRecipientLock();
  } finally {
    releaseUpdate.resolve();
    await emailUpdate;
  }
  return submission;
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
    expect(receiptMessages()).toHaveLength(0);
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
    expect(receiptMessages()).toHaveLength(0);
  });

  it("atomically creates a pending application and versioned evidence", async () => {
    const member = await register("submit");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    mailer.clear();

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

    expect(receiptMessages()).toHaveLength(1);
    const receipt = receiptMessages()[0]!;
    expect(receipt).toMatchObject({
      template: "creator-application-received",
      to: member.address,
      subject: "We received your application",
    });
    expect(receipt.text.toLowerCase()).toContain("status is pending");
    expect(receipt.text).toContain("/creator/onboarding");
    const receiptContents = `${receipt.subject}\n${receipt.text}\n${receipt.html}`;
    for (const prohibited of [
      application.id,
      member.userId,
      application.creatorName,
      application.countryCode,
      "203.0.113.42",
      CREATOR_AGREEMENT_VERSION,
      CREATOR_CONTENT_POLICY_VERSION,
      IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
    ]) {
      expect(receiptContents).not.toContain(prohibited);
    }
  });

  it("loads the persisted outcome and rejects duplicate submissions", async () => {
    const member = await register("persist");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    mailer.clear();
    const created = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());
    expect(created.status).toBe(201);
    expect(receiptMessages()).toHaveLength(1);

    const loaded = await request(app)
      .get("/api/v1/me/creator-application")
      .set("Cookie", member.cookie);
    expect(loaded.status).toBe(200);
    expect(loaded.body).toEqual(created.body);

    mailer.clear();
    const duplicate = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("CONFLICT");
    expect(receiptMessages()).toHaveLength(0);
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

  it("attempts the receipt only after the application transaction commits", async () => {
    const member = await register("receipt-ordering");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const observations: Array<{ applications: number; evidence: number }> = [];
    const observingMailer: Mailer = {
      async send(message) {
        if (message.template !== "creator-application-received") return;
        observations.push({
          applications: await db.creatorApplication.count({
            where: { userId: member.userId },
          }),
          evidence: await db.acceptanceRecord.count({
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
          }),
        });
      },
    };
    app = testApp({ db, mailer: observingMailer });

    const response = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());

    expect(response.status).toBe(201);
    expect(observations).toEqual([{ applications: 1, evidence: 3 }]);
  });

  it("captures the current verified recipient behind a concurrent email update", async () => {
    const member = await register("receipt-current-email");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const changedAddress = email("receipt-current-email-changed");
    mailer.clear();

    const response = await submitWhileEmailUpdateCommits(member, {
      email: changedAddress,
      emailVerifiedAt: new Date(),
    });

    expect(response.status).toBe(201);
    expect(receiptMessages()).toHaveLength(1);
    expect(receiptMessages()[0]?.to).toBe(changedAddress);
    expect(receiptMessages()[0]?.to).not.toBe(member.address);
  });

  it("rejects submission when a concurrent email change revokes verification", async () => {
    const member = await register("receipt-revoked-email");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const changedAddress = email("receipt-revoked-email-changed");
    mailer.clear();

    const response = await submitWhileEmailUpdateCommits(member, {
      email: changedAddress,
      emailVerifiedAt: null,
    });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("EMAIL_UNVERIFIED");
    expect(receiptMessages()).toHaveLength(0);
    expect(
      await db.creatorApplication.count({ where: { userId: member.userId } })
    ).toBe(0);
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
    ).toBe(0);
  });

  it("keeps a successful submission when receipt delivery fails", async () => {
    const member = await register("receipt-failure");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    const failingMailer: Mailer = {
      async send() {
        throw new Error("mail unavailable");
      },
    };
    app = testApp({ db, mailer: failingMailer });

    const response = await request(app)
      .post("/api/v1/creator-applications")
      .set("Cookie", member.cookie)
      .send(validApplication());

    expect(response.status).toBe(201);
    expect(
      await db.creatorApplication.count({ where: { userId: member.userId } })
    ).toBe(1);
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
    const user = await db.user.findUniqueOrThrow({
      where: { id: member.userId },
    });
    expect(user.role).toBe("MEMBER");
  });

  it("rejects false acceptance and malformed country codes", async () => {
    const member = await register("invalid");
    await db.user.update({
      where: { id: member.userId },
      data: { emailVerifiedAt: new Date() },
    });
    mailer.clear();
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
    expect(receiptMessages()).toHaveLength(0);
  });
});
