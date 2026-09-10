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
      /WEB_ORIGIN/
    );
  });

  it("normalizes a trailing slash on an HTTP(S) web origin", () => {
    expect(
      loadEnv({ ...validEnv, WEB_ORIGIN: "https://app.example.com/" })
        .WEB_ORIGIN
    ).toBe("https://app.example.com");
  });

  it.each([
    "javascript:alert(1)",
    "ftp://app.example.com",
    "https://user:password@app.example.com",
    "https://app.example.com/path",
    "https://app.example.com?preview=1",
    "https://app.example.com#fragment",
  ])("rejects a non-origin WEB_ORIGIN value: %s", (webOrigin) => {
    expect(() => loadEnv({ ...validEnv, WEB_ORIGIN: webOrigin })).toThrow(
      /WEB_ORIGIN/
    );
  });

  it("defaults mail configuration to local SMTP delivery", () => {
    const env = loadEnv({
      DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
    } as NodeJS.ProcessEnv);
    expect(env.MAIL_TRANSPORT).toBe("smtp");
    expect(env.SMTP_PORT).toBe(1025);
    expect(env.MAIL_FROM).toBe("no-reply@pumdoki.example");
  });

  it("rejects an unknown mail transport", () => {
    expect(() =>
      loadEnv({
        DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
        MAIL_TRANSPORT: "carrier-pigeon",
      } as NodeJS.ProcessEnv)
    ).toThrow(/MAIL_TRANSPORT/);
  });

  it("requires complete R2 credentials only when cloud uploads are selected", () => {
    const base = {
      ...validEnv,
      CONTENT_MODE: "development",
      CONTENT_STORAGE_DIRECTORY: "/private/tmp/content-env-test",
      CONTENT_STORAGE_BACKEND: "R2",
    };
    expect(() => loadEnv(base)).toThrow(/R2_ACCOUNT_ID/);
    expect(
      loadEnv({
        ...base,
        R2_ACCOUNT_ID: "a".repeat(32),
        R2_BUCKET: "pumdoki-review-media",
        R2_ACCESS_KEY_ID: "test-access-key",
        R2_SECRET_ACCESS_KEY: "test-secret-key",
      }).CONTENT_STORAGE_BACKEND
    ).toBe("R2");
    expect(
      loadEnv({ ...validEnv, R2_ACCESS_KEY_ID: "", R2_SECRET_ACCESS_KEY: "" })
        .CONTENT_STORAGE_BACKEND
    ).toBe("LOCAL");
    expect(() =>
      loadEnv({ ...validEnv, R2_ACCOUNT_ID: "https://untrusted.example" })
    ).toThrow(/R2_ACCOUNT_ID/);
  });
});
