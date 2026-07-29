import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@pumdoki/database";
import { createMemoryMailer, type MemoryMailer } from "./mail/index.js";
import { hashVerificationToken } from "./auth/tokens.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

let db: PrismaClient;
let mailer: MemoryMailer;
let app: ReturnType<typeof testApp>;

const password = "correct-horse-battery";
const TEST_DOMAIN = "@mail.pumdoki.test";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${TEST_DOMAIN}`;
}

async function registerUser(email: string) {
  const response = await request(app).post("/api/v1/auth/register").send({
    email,
    password,
    displayName: "Test User",
    ageAttested: true,
    acceptedTermsVersion: "2026-01-01",
    acceptedPrivacyVersion: "2026-01-01",
  });
  expect(response.status).toBe(201);
  const cookie = response.headers["set-cookie"] as unknown as string[];
  return { cookie, body: response.body };
}

function tokenFromLastMail(email: string): string {
  const message = mailer.lastTo(email);
  expect(message).toBeDefined();
  const match = message!.text.match(/token=([A-Za-z0-9_-]+)/);
  expect(match).not.toBeNull();
  return match![1];
}

beforeAll(async () => {
  db = await loadTestDatabase();
});

beforeEach(() => {
  mailer = createMemoryMailer();
  app = testApp({ db, mailer });
});

afterAll(async () => {
  // AcceptanceRecord uses onDelete: Restrict, so it MUST be removed before the
  // user rows or the cleanup throws a foreign-key error. VerificationToken and
  // Session cascade and need no explicit delete. Never widen this filter beyond
  // the test domain — the seed users live on @pumdoki.example.
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({ where: { email: { endsWith: TEST_DOMAIN } } });
});

describe("email verification", () => {
  it("sends exactly one verification mail on registration", async () => {
    const email = uniqueEmail("verify-register");
    await registerUser(email);
    expect(mailer.sent.filter((m) => m.to === email)).toHaveLength(1);
    expect(mailer.lastTo(email)!.subject).toBe(
      "Verify your Pumdoki email address"
    );
  });

  it("still registers when the mailer fails", async () => {
    const failing = {
      ...createMemoryMailer(),
      async send() {
        throw new Error("smtp down");
      },
    };
    app = testApp({ db, mailer: failing });
    const email = uniqueEmail("verify-mailfail");
    const response = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      displayName: "Test User",
      ageAttested: true,
      acceptedTermsVersion: "2026-01-01",
      acceptedPrivacyVersion: "2026-01-01",
    });
    expect(response.status).toBe(201);
  });

  it("still registers when the verification token insert fails", async () => {
    // Tightly scoped stub: wrap the real Prisma client so that, inside any
    // transaction, `verificationToken.create` throws. This simulates a
    // transient DB failure during token issuance (distinct from a mailer
    // transport failure) without touching the unrelated user/session
    // creation transaction.
    const failingTokenDb = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop === "$transaction") {
          return async (fn: (tx: unknown) => unknown) =>
            (
              target as unknown as {
                $transaction: (fn: (tx: unknown) => unknown) => unknown;
              }
            ).$transaction((tx: Record<string, unknown>) => {
              const verificationToken = tx.verificationToken as Record<
                string,
                unknown
              >;
              const tokenProxy = new Proxy(verificationToken, {
                get(t, p, r) {
                  if (p === "create") {
                    return async () => {
                      throw new Error("simulated token insert failure");
                    };
                  }
                  return Reflect.get(t, p, r);
                },
              });
              const txProxy = new Proxy(tx, {
                get(t, p, r) {
                  if (p === "verificationToken") return tokenProxy;
                  return Reflect.get(t, p, r);
                },
              });
              return fn(txProxy);
            });
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as unknown as PrismaClient;

    app = testApp({ db: failingTokenDb, mailer });
    const email = uniqueEmail("verify-tokenfail");
    const response = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      displayName: "Test User",
      ageAttested: true,
      acceptedTermsVersion: "2026-01-01",
      acceptedPrivacyVersion: "2026-01-01",
    });
    expect(response.status).toBe(201);
    expect(mailer.sent.filter((m) => m.to === email)).toHaveLength(0);
  });

  it("verifies the address and reflects it on /me", async () => {
    const email = uniqueEmail("verify-confirm");
    const { cookie } = await registerUser(email);

    const before = await request(app).get("/api/v1/me").set("Cookie", cookie);
    expect(before.body.user.emailVerified).toBe(false);

    const token = tokenFromLastMail(email);
    const confirmed = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token });
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.user.emailVerified).toBe(true);

    const after = await request(app).get("/api/v1/me").set("Cookie", cookie);
    expect(after.body.user.emailVerified).toBe(true);
  });

  it("rejects a reused token", async () => {
    const email = uniqueEmail("verify-reuse");
    await registerUser(email);
    const token = tokenFromLastMail(email);

    await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token });
    const second = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token });
    expect(second.status).toBe(400);
    expect(second.body.error.code).toBe("INVALID_TOKEN");
  });

  it("rejects an unknown token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token: "not-a-real-token" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("reports an expired token distinctly", async () => {
    const email = uniqueEmail("verify-expired");
    await registerUser(email);
    const token = tokenFromLastMail(email);
    await db.verificationToken.update({
      where: { tokenHash: hashVerificationToken(token) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const response = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("invalidates the previous token when a new one is requested", async () => {
    const email = uniqueEmail("verify-reissue");
    const { cookie } = await registerUser(email);
    const first = tokenFromLastMail(email);

    const resend = await request(app)
      .post("/api/v1/auth/verify-email/request")
      .set("Cookie", cookie);
    expect(resend.status).toBe(202);
    const second = tokenFromLastMail(email);
    expect(second).not.toBe(first);

    const oldToken = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token: first });
    expect(oldToken.status).toBe(400);

    const newToken = await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token: second });
    expect(newToken.status).toBe(200);
  });

  it("sends nothing when the address is already verified", async () => {
    const email = uniqueEmail("verify-already");
    const { cookie } = await registerUser(email);
    const token = tokenFromLastMail(email);
    await request(app)
      .post("/api/v1/auth/verify-email/confirm")
      .send({ token });

    mailer.clear();
    const response = await request(app)
      .post("/api/v1/auth/verify-email/request")
      .set("Cookie", cookie);
    expect(response.status).toBe(202);
    expect(mailer.sent).toHaveLength(0);
  });

  it("requires authentication to request a new link", async () => {
    const response = await request(app).post(
      "/api/v1/auth/verify-email/request"
    );
    expect(response.status).toBe(401);
  });
});

describe("password reset", () => {
  async function requestReset(email: string) {
    const response = await request(app)
      .post("/api/v1/auth/password-reset/request")
      .send({ email });
    expect(response.status).toBe(202);
    return response;
  }

  it("returns an identical 202 for known and unknown addresses", async () => {
    const email = uniqueEmail("reset-known");
    await registerUser(email);
    mailer.clear();

    const known = await requestReset(email);
    const unknown = await requestReset(uniqueEmail("reset-nobody"));

    expect(known.body).toEqual(unknown.body);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe(email);
  });

  it("sets a new password, revokes every session, and verifies the address", async () => {
    const email = uniqueEmail("reset-success");
    const { cookie } = await registerUser(email);
    mailer.clear();
    await requestReset(email);
    const token = tokenFromLastMail(email);

    const confirmed = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token, password: "a-brand-new-password" });
    expect(confirmed.status).toBe(200);
    expect(confirmed.headers["set-cookie"]).toBeUndefined();

    const oldSession = await request(app)
      .get("/api/v1/me")
      .set("Cookie", cookie);
    expect(oldSession.status).toBe(401);

    const oldPassword = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password });
    expect(oldPassword.status).toBe(401);

    const newPassword = await request(app)
      .post("/api/v1/auth/login")
      .send({ email, password: "a-brand-new-password" });
    expect(newPassword.status).toBe(200);
    expect(newPassword.body.user.emailVerified).toBe(true);
  });

  it("rejects a reused reset token", async () => {
    const email = uniqueEmail("reset-reuse");
    await registerUser(email);
    mailer.clear();
    await requestReset(email);
    const token = tokenFromLastMail(email);

    await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token, password: "first-new-password" });
    const second = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token, password: "second-new-password" });
    expect(second.status).toBe(400);
    expect(second.body.error.code).toBe("INVALID_TOKEN");
  });

  it("rejects an expired reset token", async () => {
    const email = uniqueEmail("reset-expired");
    await registerUser(email);
    mailer.clear();
    await requestReset(email);
    const token = tokenFromLastMail(email);
    await db.verificationToken.update({
      where: { tokenHash: hashVerificationToken(token) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const response = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token, password: "another-new-password" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("will not redeem a verification token at the reset endpoint", async () => {
    const email = uniqueEmail("reset-wrongkind");
    await registerUser(email);
    const verificationToken = tokenFromLastMail(email);

    const response = await request(app)
      .post("/api/v1/auth/password-reset/confirm")
      .send({ token: verificationToken, password: "yet-another-password" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });

  it("stays 202 and stops sending once throttled", async () => {
    const email = uniqueEmail("reset-throttled");
    await registerUser(email);
    mailer.clear();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await requestReset(email);
    }
    expect(mailer.sent).toHaveLength(5);

    const sixth = await requestReset(email);
    expect(sixth.status).toBe(202);
    expect(mailer.sent).toHaveLength(5);
  });
});
