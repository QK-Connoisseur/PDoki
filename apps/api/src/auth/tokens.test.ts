import { describe, expect, it } from "vitest";
import {
  buildTokenUrl,
  createVerificationToken,
  hashVerificationToken,
  PASSWORD_RESET_TOKEN_TTL_MS,
  tokenTtlMs,
  VERIFICATION_TOKEN_TTL_MS,
} from "./tokens.js";

describe("verification tokens", () => {
  it("generates a unique url-safe token with a matching hash", () => {
    const a = createVerificationToken();
    const b = createVerificationToken();
    expect(a.token).not.toBe(b.token);
    expect(a.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a.tokenHash).toBe(hashVerificationToken(a.token));
    expect(a.tokenHash).toHaveLength(64);
    expect(a.tokenHash).not.toBe(a.token);
  });

  it("uses 24 hours for verification and 1 hour for reset", () => {
    expect(VERIFICATION_TOKEN_TTL_MS).toBe(24 * 60 * 60 * 1000);
    expect(PASSWORD_RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000);
    expect(tokenTtlMs("EMAIL_VERIFICATION")).toBe(VERIFICATION_TOKEN_TTL_MS);
    expect(tokenTtlMs("PASSWORD_RESET")).toBe(PASSWORD_RESET_TOKEN_TTL_MS);
  });

  it("builds the frontend link for each kind", () => {
    expect(
      buildTokenUrl("http://localhost:5173", "EMAIL_VERIFICATION", "abc")
    ).toBe("http://localhost:5173/verify-email?token=abc");
    expect(
      buildTokenUrl("http://localhost:5173/", "PASSWORD_RESET", "a b")
    ).toBe("http://localhost:5173/reset-password?token=a%20b");
  });
});
