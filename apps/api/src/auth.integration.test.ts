import { randomBytes, scryptSync } from "node:crypto";
import express from "express";
import { pino } from "pino";
import request, { type Response as SupertestResponse } from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AuthResponseSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { hashPassword } from "./auth/passwords.js";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from "./auth/session.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  requireAuth,
  requireRole,
  requireVerifiedEmail,
} from "./middleware/auth.js";
import { requestId } from "./middleware/requestId.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const TEST_DOMAIN = "@auth.pumdoki.test";
const PASSWORD = "correct-horse-battery-staple";

let db: PrismaClient;

function email(label: string): string {
  return `${label}${TEST_DOMAIN}`;
}

function registration(label: string) {
  return {
    email: email(label),
    password: PASSWORD,
    displayName: `Auth ${label}`,
    ageAttested: true,
    acceptedTermsVersion: "terms-2026-07-16",
    acceptedPrivacyVersion: "privacy-2026-07-16",
  };
}

function setCookies(response: SupertestResponse): string[] {
  const value = response.headers["set-cookie"];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function sessionCookie(response: SupertestResponse): string {
  const cookie = setCookies(response)[0];
  if (!cookie) throw new Error("Expected a Set-Cookie header");
  return cookie.split(";", 1)[0]!;
}

function tokenFromCookie(cookie: string): string {
  const prefix = `${SESSION_COOKIE_NAME}=`;
  if (!cookie.startsWith(prefix)) throw new Error("Unexpected session cookie");
  return cookie.slice(prefix.length);
}

async function cleanup(): Promise<void> {
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({
    where: { email: { endsWith: TEST_DOMAIN } },
  });
}

async function createUser(
  label: string,
  options: {
    role?: "MEMBER" | "CREATOR" | "MODERATOR" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "BANNED";
    passwordHash?: string;
  } = {}
) {
  return db.user.create({
    data: {
      email: email(label),
      displayName: `Auth ${label}`,
      passwordHash: options.passwordHash ?? (await hashPassword(PASSWORD)),
      role: options.role,
      status: options.status,
    },
  });
}

async function login(label: string) {
  const response = await request(testApp({ db }))
    .post("/api/v1/auth/login")
    .send({ email: email(label), password: PASSWORD });
  return { response, cookie: sessionCookie(response) };
}

async function sessionForCookie(cookie: string) {
  return db.session.findUniqueOrThrow({
    where: { tokenHash: hashSessionToken(tokenFromCookie(cookie)) },
  });
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

describe("core auth backend", () => {
  it("registers atomically with a session and three acceptance records", async () => {
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/register")
      .set("User-Agent", "Pumdoki auth integration test")
      .send({
        ...registration("register"),
        email: " REGISTER@AUTH.PUMDOKI.TEST ",
      });

    expect(response.status).toBe(201);
    const parsed = AuthResponseSchema.parse(response.body);
    expect(parsed.user.email).toBe(email("register"));
    expect(parsed.user.emailVerified).toBe(false);

    const cookieHeader = setCookies(response)[0]!;
    expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookieHeader).toMatch(/HttpOnly/i);
    expect(cookieHeader).toMatch(/SameSite=Lax/i);
    expect(cookieHeader).toMatch(/Secure/i);
    expect(cookieHeader).toMatch(/Path=\//i);

    const user = await db.user.findUniqueOrThrow({
      where: { email: email("register") },
      include: { acceptanceRecords: true, sessions: true },
    });
    expect(user.acceptanceRecords).toHaveLength(3);
    expect(user.acceptanceRecords.map(({ kind }) => kind).sort()).toEqual([
      "AGE_ATTESTATION",
      "PRIVACY",
      "TERMS",
    ]);
    expect(
      user.acceptanceRecords.every(({ ipAddress }) => ipAddress.length > 0)
    ).toBe(true);
    expect(user.sessions).toHaveLength(1);
    expect(user.sessions[0]!.userAgent).toBe("Pumdoki auth integration test");
    expect(user.sessions[0]!.tokenHash).not.toBe(
      tokenFromCookie(sessionCookie(response))
    );
  });

  it("rejects validation failures and requires literal true age attestation", async () => {
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/register")
      .send({ ...registration("underage"), ageAttested: false });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(await db.user.count({ where: { email: email("underage") } })).toBe(
      0
    );
  });

  it("returns CONFLICT for a duplicate email", async () => {
    const app = testApp({ db });
    expect(
      (
        await request(app)
          .post("/api/v1/auth/register")
          .send(registration("duplicate"))
      ).status
    ).toBe(201);
    const duplicate = await request(app)
      .post("/api/v1/auth/register")
      .send(registration("duplicate"));
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("CONFLICT");
  });

  it("restricts hard deletion while acceptance evidence exists", async () => {
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/register")
      .send(registration("retention"));
    const userId = AuthResponseSchema.parse(response.body).user.id;
    await expect(
      db.user.delete({ where: { id: userId } })
    ).rejects.toMatchObject({
      code: "P2003",
    });
  });

  it("logs in with valid credentials and returns a public user", async () => {
    await createUser("login");
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/login")
      .send({ email: " LOGIN@AUTH.PUMDOKI.TEST ", password: PASSWORD });
    expect(response.status).toBe(200);
    expect(AuthResponseSchema.parse(response.body).user.email).toBe(
      email("login")
    );
    expect(setCookies(response)[0]).toContain(`${SESSION_COOKIE_NAME}=`);
  });

  it("uses the same unauthorized envelope for wrong and unknown credentials", async () => {
    await createUser("credential");
    const app = testApp({ db });
    const wrong = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: email("credential"), password: "wrong-password" });
    const unknown = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: email("unknown"), password: "wrong-password" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.code).toBe("UNAUTHORIZED");
    expect(unknown.body.error.code).toBe("UNAUTHORIZED");
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it.each(["SUSPENDED", "BANNED"] as const)(
    "rejects a %s user with valid credentials",
    async (status) => {
      await createUser(status.toLowerCase(), { status });
      const response = await request(testApp({ db }))
        .post("/api/v1/auth/login")
        .send({ email: email(status.toLowerCase()), password: PASSWORD });
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
  );

  it("accepts a dev scrypt hash and transparently upgrades it to argon2id", async () => {
    const salt = randomBytes(16).toString("hex");
    const encoded = `scrypt:${salt}:${scryptSync(PASSWORD, salt, 32).toString("hex")}`;
    await createUser("scrypt", { passwordHash: encoded });
    const { response } = await login("scrypt");
    expect(response.status).toBe(200);
    const updated = await db.user.findUniqueOrThrow({
      where: { email: email("scrypt") },
    });
    expect(updated.passwordHash).toMatch(/^\$argon2id\$/);
  });

  it("rate limits after ten failed login attempts per email and IP", async () => {
    await createUser("throttle");
    const app = testApp({ db });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: email("throttle"), password: "wrong-password" });
      expect(response.status).toBe(401);
    }
    const blocked = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: email("throttle"), password: "wrong-password" });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
  });

  it("persists authentication through GET /me", async () => {
    await createUser("me");
    const { cookie } = await login("me");
    const response = await request(testApp({ db }))
      .get("/api/v1/me")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(AuthResponseSchema.parse(response.body).user.email).toBe(
      email("me")
    );
  });

  it("extends a session after the 24-hour renewal throttle", async () => {
    await createUser("extend");
    const { cookie } = await login("extend");
    const session = await sessionForCookie(cookie);
    const originalExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await db.session.update({
      where: { id: session.id },
      data: {
        expiresAt: originalExpiry,
        lastExtendedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      },
    });
    const response = await request(testApp({ db }))
      .get("/api/v1/me")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(setCookies(response)[0]).toContain(`${SESSION_COOKIE_NAME}=`);
    const extended = await db.session.findUniqueOrThrow({
      where: { id: session.id },
    });
    expect(extended.expiresAt.getTime()).toBeGreaterThan(
      Date.now() + SESSION_DURATION_MS - 60_000
    );
  });

  it("does not extend a session twice within 24 hours", async () => {
    await createUser("no-extend");
    const { cookie } = await login("no-extend");
    const session = await sessionForCookie(cookie);
    const originalExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt: originalExpiry, lastExtendedAt: new Date() },
    });
    const response = await request(testApp({ db }))
      .get("/api/v1/me")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(setCookies(response)).toHaveLength(0);
    const unchanged = await db.session.findUniqueOrThrow({
      where: { id: session.id },
    });
    expect(unchanged.expiresAt.getTime()).toBe(originalExpiry.getTime());
  });

  it("logs out, revokes the current session, and clears the cookie", async () => {
    await createUser("logout");
    const { cookie } = await login("logout");
    const session = await sessionForCookie(cookie);
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(204);
    expect(setCookies(response)[0]).toMatch(/Expires=Thu, 01 Jan 1970/i);
    expect(
      (await db.session.findUniqueOrThrow({ where: { id: session.id } }))
        .revokedAt
    ).not.toBeNull();
    expect(
      (await request(testApp({ db })).get("/api/v1/me").set("Cookie", cookie))
        .status
    ).toBe(401);
  });

  it("logout-all revokes every active session for the user", async () => {
    await createUser("logout-all");
    const first = await login("logout-all");
    const second = await login("logout-all");
    const response = await request(testApp({ db }))
      .post("/api/v1/auth/logout-all")
      .set("Cookie", first.cookie);
    expect(response.status).toBe(204);
    const user = await db.user.findUniqueOrThrow({
      where: { email: email("logout-all") },
    });
    expect(
      await db.session.count({ where: { userId: user.id, revokedAt: null } })
    ).toBe(0);
    expect(
      (
        await request(testApp({ db }))
          .get("/api/v1/me")
          .set("Cookie", second.cookie)
      ).status
    ).toBe(401);
  });

  it("rejects missing, garbage, expired, and revoked sessions", async () => {
    const app = testApp({ db });
    expect((await request(app).get("/api/v1/me")).status).toBe(401);
    expect(
      (
        await request(app)
          .get("/api/v1/me")
          .set("Cookie", `${SESSION_COOKIE_NAME}=garbage`)
      ).status
    ).toBe(401);

    await createUser("invalid-session");
    const first = await login("invalid-session");
    const firstSession = await sessionForCookie(first.cookie);
    await db.session.update({
      where: { id: firstSession.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", first.cookie)).status
    ).toBe(401);

    const second = await login("invalid-session");
    const secondSession = await sessionForCookie(second.cookie);
    await db.session.update({
      where: { id: secondSession.id },
      data: { revokedAt: new Date() },
    });
    expect(
      (await request(app).get("/api/v1/me").set("Cookie", second.cookie)).status
    ).toBe(401);
  });

  it("rejects a user suspended after the session was issued", async () => {
    const user = await createUser("mid-session");
    const { cookie } = await login("mid-session");
    await db.user.update({
      where: { id: user.id },
      data: { status: "SUSPENDED" },
    });
    const response = await request(testApp({ db }))
      .get("/api/v1/me")
      .set("Cookie", cookie);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("enforces role authorization after authenticating the session", async () => {
    await createUser("member-role", { role: "MEMBER" });
    await createUser("moderator-role", { role: "MODERATOR" });
    const member = await login("member-role");
    const moderator = await login("moderator-role");

    const app = express();
    app.use(requestId);
    app.get(
      "/moderator",
      requireAuth(db),
      requireRole("MODERATOR"),
      (_req, res) => res.json({ ok: true })
    );
    app.use(errorHandler(pino({ level: "silent" })));

    const denied = await request(app)
      .get("/moderator")
      .set("Cookie", member.cookie);
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("FORBIDDEN");
    expect(
      (await request(app).get("/moderator").set("Cookie", moderator.cookie))
        .status
    ).toBe(200);
  });
});

describe("requireVerifiedEmail", () => {
  it("rejects an unverified user and admits a verified one", async () => {
    await createUser("gate");
    const login = await request(testApp({ db }))
      .post("/api/v1/auth/login")
      .send({ email: email("gate"), password: PASSWORD });
    const cookie = sessionCookie(login);

    const app = express();
    app.use(requestId);
    app.get("/gated", requireAuth(db), requireVerifiedEmail(), (_req, res) =>
      res.json({ ok: true })
    );
    app.use(errorHandler(pino({ level: "silent" })));

    const blocked = await request(app).get("/gated").set("Cookie", cookie);
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("EMAIL_UNVERIFIED");

    await db.user.update({
      where: { email: email("gate") },
      data: { emailVerifiedAt: new Date() },
    });

    const allowed = await request(app).get("/gated").set("Cookie", cookie);
    expect(allowed.status).toBe(200);
  });
});
