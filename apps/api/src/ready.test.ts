import { describe, expect, it } from "vitest";
import request from "supertest";
import { ReadyResponseSchema } from "@pumdoki/contracts";
import { testApp } from "./test/testApp.js";

describe("GET /api/v1/ready", () => {
  it("returns 200 ready when the database check passes", async () => {
    const res = await request(testApp()).get("/api/v1/ready");
    expect(res.status).toBe(200);
    const parsed = ReadyResponseSchema.parse(res.body);
    expect(parsed.status).toBe("ready");
    expect(parsed.checks.database).toBe("up");
  });

  it("returns 503 degraded when the database check fails", async () => {
    const app = testApp({ checkDatabase: async () => false });
    const res = await request(app).get("/api/v1/ready");
    expect(res.status).toBe(503);
    const parsed = ReadyResponseSchema.parse(res.body);
    expect(parsed.status).toBe("degraded");
    expect(parsed.checks.database).toBe("down");
  });

  it("treats a throwing database check as down", async () => {
    const app = testApp({
      checkDatabase: async () => {
        throw new Error("connection refused");
      },
    });
    const res = await request(app).get("/api/v1/ready");
    expect(res.status).toBe(503);
    expect(res.body.checks.database).toBe("down");
  });
});
