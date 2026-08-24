import express from "express";
import { pino } from "pino";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "../middleware/errorHandler.js";
import { requestId } from "../middleware/requestId.js";
import {
  operationsJsonBody,
  requireOperationsRequestIntegrity,
} from "./requestIntegrity.js";

const OPERATIONS_ORIGIN = "https://private-operations.pumdoki.example";
const CSRF_TOKEN = "local-test-csrf-token";

function testApp({
  verifyCsrf = async (req) => req.get("x-operations-csrf") === CSRF_TOKEN,
}: {
  verifyCsrf?: Parameters<
    typeof requireOperationsRequestIntegrity
  >[0]["verifyCsrf"];
} = {}) {
  const app = express();
  app.use(requestId);
  app.use(
    requireOperationsRequestIntegrity({
      allowedOrigin: OPERATIONS_ORIGIN,
      verifyCsrf,
    })
  );
  app.use(operationsJsonBody());
  app.patch("/operations-check", (_req, res) => res.status(204).end());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(errorHandler(pino({ level: "silent" })));
  return app;
}

function validMutation(app = testApp()) {
  return request(app)
    .patch("/operations-check")
    .set("Origin", OPERATIONS_ORIGIN)
    .set("Content-Type", "application/json")
    .set("X-Operations-CSRF", CSRF_TOKEN)
    .send({ action: "test" });
}

describe("private operations request integrity", () => {
  it("accepts an exact origin, JSON body, and verified CSRF proof", async () => {
    expect((await validMutation()).status).toBe(204);
  });

  it.each([
    ["missing", undefined],
    ["opaque", "null"],
    ["public product", "https://pumdoki.example"],
    [
      "suffix attack",
      "https://private-operations.pumdoki.example.attacker.example",
    ],
    ["wrong environment", "https://private-operations-staging.pumdoki.example"],
    ["comma joined", `${OPERATIONS_ORIGIN},${OPERATIONS_ORIGIN}`],
  ])("rejects a %s mutation origin", async (_label, origin) => {
    let pending = request(testApp())
      .patch("/operations-check")
      .set("Content-Type", "application/json")
      .set("X-Operations-CSRF", CSRF_TOKEN);
    if (origin !== undefined) pending = pending.set("Origin", origin);

    const response = await pending.send({ action: "test" });
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it.each([
    "application/x-www-form-urlencoded",
    "multipart/form-data; boundary=test",
    "text/plain",
    "application/problem+json",
  ])("rejects mutation content type %s", async (contentType) => {
    const response = await request(testApp())
      .patch("/operations-check")
      .set("Origin", OPERATIONS_ORIGIN)
      .set("Content-Type", contentType)
      .set("X-Operations-CSRF", CSRF_TOKEN)
      .send("action=test");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });

  it("fails closed when CSRF verification rejects or is unavailable", async () => {
    const denied = await validMutation(
      testApp({ verifyCsrf: async () => false })
    );
    expect(denied.status).toBe(403);

    const unavailable = await validMutation(
      testApp({
        verifyCsrf: async () => {
          throw new Error("csrf store unavailable");
        },
      })
    );
    expect(unavailable.status).toBe(500);
    expect(unavailable.body.error.code).toBe("INTERNAL");
  });

  it("supports a one-use CSRF verifier that rejects replay", async () => {
    const used = new Set<string>();
    const verifyCsrf = vi.fn(async (req) => {
      const token = req.get("x-operations-csrf") ?? "";
      if (token === "" || used.has(token)) return false;
      used.add(token);
      return true;
    });
    const app = testApp({ verifyCsrf });

    expect((await validMutation(app)).status).toBe(204);
    expect((await validMutation(app)).status).toBe(403);
  });

  it("bounds the parsed JSON body", async () => {
    const response = await request(testApp())
      .patch("/operations-check")
      .set("Origin", OPERATIONS_ORIGIN)
      .set("Content-Type", "application/json")
      .set("X-Operations-CSRF", CSRF_TOKEN)
      .send({ value: "x".repeat(17 * 1024) });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });

  it("does not require mutation controls for a read-only health route", async () => {
    const response = await request(testApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it.each([
    "https://private-operations.pumdoki.example/",
    "http://private-operations.pumdoki.example",
    "https://user@private-operations.pumdoki.example",
    "https://private-operations.pumdoki.example/path",
  ])("rejects unsafe configured origin %s", (origin) => {
    expect(() =>
      requireOperationsRequestIntegrity({
        allowedOrigin: origin,
        verifyCsrf: async () => true,
      })
    ).toThrow(/exact HTTPS origin/);
  });
});
