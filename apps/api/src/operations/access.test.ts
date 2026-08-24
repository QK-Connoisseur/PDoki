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
const OPERATOR_ID = "8b0d7a3f-5864-4e85-aedd-7773b80579a1";
const ISSUER = "https://access.pumdoki.example";
const SUBJECT = "upstream-operator-123";

function admin(overrides: Partial<User> = {}): User {
  const now = new Date("2026-08-23T00:00:00.000Z");
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

function provisionedOperator({
  user = admin(),
  disabledAt = null,
  permitted = true,
}: {
  user?: User;
  disabledAt?: Date | null;
  permitted?: boolean;
} = {}) {
  const now = new Date("2026-08-23T00:00:00.000Z");
  return {
    id: OPERATOR_ID,
    issuer: ISSUER,
    subject: SUBJECT,
    userId: user.id,
    createdAt: now,
    disabledAt,
    user,
    permissionGrants: permitted
      ? [{ permission: "CREATOR_APPLICATION_REVIEW" }]
      : [],
  };
}

function identity(assurance: "MFA" | "TEST" = "MFA") {
  return { issuer: ISSUER, subject: SUBJECT, assurance } as const;
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
  findOperator = async () => provisionedOperator(),
}: {
  env: Env;
  verifier: OperationsAccessVerifier;
  findOperator?: () => Promise<ReturnType<typeof provisionedOperator> | null>;
}): { app: Express; findOperator: ReturnType<typeof vi.fn> } {
  const findUnique = vi.fn(findOperator);
  const db = {
    operationsOperator: { findUnique },
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
    (req, res) =>
      res.json({
        userId: req.operationsAuth!.user.id,
        operatorId: req.operationsAuth!.operator.id,
        issuer: req.operationsAuth!.identity.issuer,
        permissions: req.operationsAuth!.operator.permissions,
      })
  );
  app.use(errorHandler(logger));
  return { app, findOperator: findUnique };
}

describe("operations access boundary", () => {
  it("rejects a missing operational identity without a database lookup", async () => {
    const { app, findOperator } = appWith({
      env: environment("test"),
      verifier: async () => null,
    });
    const response = await request(app).get("/operations-check");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(findOperator).not.toHaveBeenCalled();
  });

  it("cannot use the test assurance outside NODE_ENV=test", async () => {
    const { app, findOperator } = appWith({
      env: environment("production"),
      verifier: async () => identity("TEST"),
    });
    const response = await request(app).get("/operations-check");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
    expect(findOperator).not.toHaveBeenCalled();
  });

  it("strictly rejects malformed or authority-injecting identities", async () => {
    const malformedIdentities: unknown[] = [
      { issuer: ISSUER, subject: SUBJECT },
      { issuer: ISSUER, subject: SUBJECT, assurance: "PASSWORD" },
      { issuer: "", subject: SUBJECT, assurance: "MFA" },
      { issuer: ` ${ISSUER}`, subject: SUBJECT, assurance: "MFA" },
      { issuer: ISSUER, subject: "   ", assurance: "MFA" },
      { issuer: ISSUER, subject: ` ${SUBJECT} `, assurance: "MFA" },
      { ...identity(), userId: ADMIN_ID },
      {
        ...identity(),
        permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
      },
      { ...identity(), email: "untrusted@pumdoki.example" },
    ];

    for (const candidate of malformedIdentities) {
      const { app, findOperator } = appWith({
        env: environment("production"),
        verifier: async () => candidate,
      });
      const response = await request(app).get("/operations-check");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(findOperator).not.toHaveBeenCalled();
    }
  });

  it("normalizes assertion failures but preserves infrastructure failures", async () => {
    const invalid = appWith({
      env: environment("production"),
      verifier: async () => {
        throw new OperationsAuthenticationError("expired assertion");
      },
    });
    const invalidAssertion = await request(invalid.app).get(
      "/operations-check"
    );
    expect(invalidAssertion.status).toBe(401);
    expect(invalidAssertion.body.error.code).toBe("UNAUTHORIZED");

    const unavailable = appWith({
      env: environment("production"),
      verifier: async () => {
        throw new Error("identity infrastructure unavailable");
      },
    });
    const infrastructureFailure = await request(unavailable.app).get(
      "/operations-check"
    );
    expect(infrastructureFailure.status).toBe(500);
    expect(infrastructureFailure.body.error.code).toBe("INTERNAL");
  });

  it("accepts a verified identity only after exact database provisioning", async () => {
    const { app, findOperator } = appWith({
      env: environment("production"),
      verifier: async () => identity(),
    });
    const response = await request(app).get("/operations-check");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: ADMIN_ID,
      operatorId: OPERATOR_ID,
      issuer: ISSUER,
      permissions: [CREATOR_APPLICATION_REVIEW_PERMISSION],
    });
    expect(findOperator).toHaveBeenCalledWith({
      where: { issuer_subject: { issuer: ISSUER, subject: SUBJECT } },
      include: {
        user: true,
        permissionGrants: {
          where: {
            permission: "CREATOR_APPLICATION_REVIEW",
            revokedAt: null,
          },
          select: { permission: true },
        },
      },
    });
  });

  it.each([
    ["unknown identity", null],
    [
      "disabled operator",
      provisionedOperator({ disabledAt: new Date("2026-08-23T01:00:00Z") }),
    ],
    ["missing grant", provisionedOperator({ permitted: false })],
    [
      "suspended user",
      provisionedOperator({ user: admin({ status: "SUSPENDED" }) }),
    ],
    ["banned user", provisionedOperator({ user: admin({ status: "BANNED" }) })],
    [
      "non-admin user",
      provisionedOperator({ user: admin({ role: "MEMBER" }) }),
    ],
  ])("rejects a %s", async (_label, operator) => {
    const { app } = appWith({
      env: environment("production"),
      verifier: async () => identity(),
      findOperator: async () => operator,
    });
    const response = await request(app).get("/operations-check");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("accepts TEST assurance only in the injected test boundary", async () => {
    const { app } = appWith({
      env: environment("test"),
      verifier: async () => identity("TEST"),
    });
    const response = await request(app).get("/operations-check");

    expect(response.status).toBe(200);
  });
});
