import { createHash, randomBytes } from "node:crypto";
import type { VerificationTokenKind } from "@pumdoki/database";

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createVerificationToken(): {
  token: string;
  tokenHash: string;
} {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashVerificationToken(token) };
}

export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenTtlMs(kind: VerificationTokenKind): number {
  return kind === "PASSWORD_RESET"
    ? PASSWORD_RESET_TOKEN_TTL_MS
    : VERIFICATION_TOKEN_TTL_MS;
}

export function buildTokenUrl(
  webOrigin: string,
  kind: VerificationTokenKind,
  token: string
): string {
  const path = kind === "PASSWORD_RESET" ? "/reset-password" : "/verify-email";
  const encodedToken = encodeURIComponent(token);
  const url = new URL(`${path}?token=${encodedToken}`, webOrigin);
  return url.toString();
}
