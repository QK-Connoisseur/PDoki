import { describe, expect, it } from "vitest";
import {
  ApiErrorSchema,
  AuthResponseSchema,
  HealthResponseSchema,
  LoginRequestSchema,
  ReadyResponseSchema,
  RegisterRequestSchema,
  UserSchema,
} from "./index.js";

describe("ApiErrorSchema", () => {
  it("accepts a valid error envelope", () => {
    const parsed = ApiErrorSchema.parse({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
        requestId: "abc-123",
      },
    });
    expect(parsed.error.code).toBe("NOT_FOUND");
  });

  it("rejects unknown error codes", () => {
    const result = ApiErrorSchema.safeParse({
      error: { code: "TEAPOT", message: "x", requestId: "y" },
    });
    expect(result.success).toBe(false);
  });
});

describe("health schemas", () => {
  it("accepts a health response", () => {
    expect(() =>
      HealthResponseSchema.parse({
        status: "ok",
        uptimeSeconds: 12,
        version: "0.1.0",
      })
    ).not.toThrow();
  });

  it("accepts a degraded ready response", () => {
    const parsed = ReadyResponseSchema.parse({
      status: "degraded",
      checks: { database: "down" },
    });
    expect(parsed.checks.database).toBe("down");
  });
});

describe("user and auth schemas", () => {
  it("accepts a valid user", () => {
    expect(() =>
      UserSchema.parse({
        id: "7f9c24e8-3b1a-4b9e-9c1d-2a6f8e5d4c3b",
        email: "member@pumdoki.example",
        displayName: "Sample Member",
        role: "MEMBER",
        createdAt: "2026-07-06T00:00:00.000Z",
      })
    ).not.toThrow();
  });

  it("rejects registration with a short password", () => {
    const result = RegisterRequestSchema.safeParse({
      email: "member@pumdoki.example",
      password: "short",
      displayName: "Sample Member",
      ageAttested: true,
      acceptedTermsVersion: "2026-07-16",
      acceptedPrivacyVersion: "2026-07-16",
    });
    expect(result.success).toBe(false);
  });

  it("requires literal age attestation and policy versions", () => {
    const result = RegisterRequestSchema.safeParse({
      email: "member@pumdoki.example",
      password: "long-enough-password",
      displayName: "Sample Member",
      ageAttested: false,
      acceptedTermsVersion: "2026-07-16",
      acceptedPrivacyVersion: "2026-07-16",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes auth emails and accepts the public auth response", () => {
    const registration = RegisterRequestSchema.parse({
      email: " Member@Pumdoki.Example ",
      password: "long-enough-password",
      displayName: " Sample Member ",
      ageAttested: true,
      acceptedTermsVersion: "2026-07-16",
      acceptedPrivacyVersion: "2026-07-16",
    });
    expect(registration.email).toBe("member@pumdoki.example");
    expect(registration.displayName).toBe("Sample Member");
    expect(() =>
      AuthResponseSchema.parse({
        user: {
          id: "7f9c24e8-3b1a-4b9e-9c1d-2a6f8e5d4c3b",
          email: "member@pumdoki.example",
          displayName: "Sample Member",
          role: "MEMBER",
          createdAt: "2026-07-16T00:00:00.000Z",
          emailVerified: false,
        },
      })
    ).not.toThrow();
  });

  it("rejects login without an email", () => {
    const result = LoginRequestSchema.safeParse({ password: "whatever" });
    expect(result.success).toBe(false);
  });
});
