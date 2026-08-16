import express, { type Express } from "express";
import { pino } from "pino";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { PrismaClient, User } from "@pumdoki/database";
import { loadEnv, type Env } from "../env.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { requestId } from "../middleware/requestId.js";
import {
  CREATOR_APPLICATION_REVIEW_PERMISSION,
  OperationsAuthenticationError,
  type OperationsAccessVerifier,
  requireOperationsAccess,
} from "./access.js";

const ADMIN_ID = "42bfa9d5-d99b-4ad4-9e45-a62a7be60ed0";

function admin(overrides: Partial<User> = {}): User {
  const now = new Date("2026-08-12T00:00:00.000Z");
  return {
    id: ADMIN_ID,
    email: "operator@pumdoki.example",
    passwordHash: "not-used-by-this-test",
    displayName: "Test Operator",
    role: "ADMIN",
    status: "ACTIVE",
    emailVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function environment(nodeEnv: "test" | "production"): Env {
  return loadEnv({
    NODE_ENV: nodeEnv,
    DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
    WEB_ORIGIN: "https://private-operations.pumdoki.example",
  } as NodeJS.ProcessEnv);
}

function appWith({
  env,
  verifier,
  findUser = async () => admin(),
}: {
  env: Env;
  verifier: OperationsAccessVerifier;
  findUser?: () => Promise<User | null>;
}): Express {
  const db = {
    user: { findUnique: vi.fn(findUser) },
  } as unknown as PrismaClient;
  const logger = pino({ level: "silent" });
  const app = express();

  app.use(requestId);
  app.get(
    "/operations-check",
    requireOperationsAccess({
      db,
      env,
      verifier,
      permission: CREATOR_APPLICATION_REVIEW_PERMISSION,
    }),
    (req, res) => res.json({ userId: req.operationsAuth!.user.id })
  );
  app.use(errorHandler(logger));
  return app;
}

describe("operations access boundary", () => {
  it("rejects a missing operational identity", async () => {
    const response = await request(
      appWith({ env: environment("test"), verifier: async () => null })
    ).get("/operations-check");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("cannot use the test assurance outside NODE_ENV=test", async () => {
    const response = await request(
      appWith({
        env: environment("production"),
        verifier: async () => ({
          userId: ADMIN_ID,
          subject: `test:${ADMIN_ID}`,
          assurance: "TEST",
          permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
        }),
      })
    ).get("/operations-check");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("rejects malformed principals before consulting the internal account", async () => {
    const malformedPrincipals: unknown[] = [
      {
        userId: ADMIN_ID,
        subject: "cloudflare-access-subject",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      {
        userId: ADMIN_ID,
        subject: "cloudflare-access-subject",
        assurance: "PASSWORD",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      {
        userId: "not-a-uuid",
        subject: "cloudflare-access-subject",
        assurance: "MFA",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      {
        userId: ADMIN_ID,
        subject: "   ",
        assurance: "MFA",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      {
        userId: ADMIN_ID,
        subject: " padded-cloudflare-access-subject ",
        assurance: "MFA",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      {
        userId: ADMIN_ID,
        subject: "cloudflare-access-subject",
        assurance: "MFA",
        permissions: ["creator_applications.approve"],
      },
      {
        userId: ADMIN_ID,
        subject: "cloudflare-access-subject",
        assurance: "MFA",
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
        email: "untrusted@pumdoki.example",
      },
    ];

    for (const candidate of malformedPrincipals) {
      const findUser = vi.fn(async () => admin());
      const response = await request(
        appWith({
          env: environment("production"),
          verifier: async () => candidate,
          findUser,
        })
      ).get("/operations-check");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(findUser).not.toHaveBeenCalled();
    }
  });

  it("normalizes verifier authentication failures but preserves infrastructure failures", async () => {
    const invalidAssertion = await request(
      appWith({
        env: environment("production"),
        verifier: async () => {
          throw new OperationsAuthenticationError("expired assertion");
        },
      })
    ).get("/operations-check");
    expect(invalidAssertion.status).toBe(401);
    expect(invalidAssertion.body.error.code).toBe("UNAUTHORIZED");

    const infrastructureFailure = await request(
      appWith({
        env: environment("production"),
        verifier: async () => {
          throw new Error("identity provider unavailable");
        },
      })
    ).get("/operations-check");
    expect(infrastructureFailure.status).toBe(500);
    expect(infrastructureFailure.body.error.code).toBe("INTERNAL");
  });

  it("accepts a permitted MFA principal mapped to an active internal admin", async () => {
    const response = await request(
      appWith({
        env: environment("production"),
        verifier: async () => ({
          userId: ADMIN_ID,
          subject: "cloudflare-access-subject",
          assurance: "MFA",
          permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
        }),
      })
    ).get("/operations-check");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: ADMIN_ID });
  });

  it("rejects a principal without permission or an eligible internal account", async () => {
    const noPermission = await request(
      appWith({
        env: environment("production"),
        verifier: async () => ({
          userId: ADMIN_ID,
          subject: "cloudflare-access-subject",
          assurance: "MFA",
          permissions: [],
        }),
      })
    ).get("/operations-check");
    expect(noPermission.status).toBe(403);

    const inactive = await request(
      appWith({
        env: environment("production"),
        verifier: async () => ({
          userId: ADMIN_ID,
          subject: "cloudflare-access-subject",
          assurance: "MFA",
          permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
        }),
        findUser: async () => admin({ status: "SUSPENDED" }),
      })
    ).get("/operations-check");
    expect(inactive.status).toBe(403);
    expect(inactive.body.error.code).toBe("FORBIDDEN");
  });
});
