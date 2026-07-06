import { describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

const validEnv = {
  DATABASE_URL: "postgresql://pumdoki:pumdoki@localhost:5432/pumdoki_dev",
} as NodeJS.ProcessEnv;

describe("loadEnv", () => {
  it("applies defaults when only required vars are present", () => {
    const env = loadEnv(validEnv);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.WEB_ORIGIN).toBe("http://localhost:5173");
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(env.RATE_LIMIT_MAX).toBe(300);
  });

  it("coerces numeric strings", () => {
    const env = loadEnv({ ...validEnv, PORT: "4100", RATE_LIMIT_MAX: "5" });
    expect(env.PORT).toBe(4100);
    expect(env.RATE_LIMIT_MAX).toBe(5);
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => loadEnv({} as NodeJS.ProcessEnv)).toThrow(/DATABASE_URL/);
  });

  it("rejects an invalid WEB_ORIGIN", () => {
    expect(() => loadEnv({ ...validEnv, WEB_ORIGIN: "not-a-url" })).toThrow(
      /WEB_ORIGIN/,
    );
  });
});
