import { describe, expect, it } from "vitest";
import request from "supertest";
import { ApiErrorSchema, HealthResponseSchema } from "@pumdoki/contracts";
import { testApp } from "./test/testApp.js";

describe("GET /api/v1/health", () => {
  it("returns a valid health payload", async () => {
    const res = await request(testApp()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(() => HealthResponseSchema.parse(res.body)).not.toThrow();
    expect(res.body.version).toBe("test");
  });

  it("sets a generated x-request-id response header", async () => {
    const res = await request(testApp()).get("/api/v1/health");
    expect(res.headers["x-request-id"]).toMatch(/^[\w.-]{1,64}$/);
  });

  it("echoes a well-formed incoming x-request-id", async () => {
    const res = await request(testApp())
      .get("/api/v1/health")
      .set("x-request-id", "test-req-42");
    expect(res.headers["x-request-id"]).toBe("test-req-42");
  });
});

describe("unknown routes", () => {
  it("returns the standard NOT_FOUND envelope", async () => {
    const res = await request(testApp()).get("/api/v1/nope");
    expect(res.status).toBe(404);
    const parsed = ApiErrorSchema.parse(res.body);
    expect(parsed.error.code).toBe("NOT_FOUND");
    expect(parsed.error.requestId).toBe(res.headers["x-request-id"]);
  });
});

describe("hardening middleware", () => {
  it("allows the configured web origin via CORS", async () => {
    const res = await request(testApp())
      .get("/api/v1/health")
      .set("Origin", "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("rate limits with the RATE_LIMITED envelope", async () => {
    const app = testApp({ env: { RATE_LIMIT_MAX: "2" } });
    await request(app).get("/api/v1/health");
    await request(app).get("/api/v1/health");
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
  });

  it("returns the standard BAD_REQUEST envelope for malformed JSON", async () => {
    const res = await request(testApp())
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(res.status).toBe(400);
    const parsed = ApiErrorSchema.parse(res.body);
    expect(parsed.error.code).toBe("BAD_REQUEST");
    expect(parsed.error.message).toBe("Malformed JSON request body");
    expect(parsed.error.requestId).toBe(res.headers["x-request-id"]);
  });
});
