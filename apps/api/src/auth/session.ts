import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import type { Env } from "../env.js";

export const SESSION_COOKIE_NAME = "pumdoki_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_RENEWAL_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function createSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function baseCookieOptions(env: Env): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV !== "development",
    path: "/",
  };
}

export function setSessionCookie(res: Response, env: Env, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(env),
    maxAge: SESSION_DURATION_MS,
  });
}

export function clearSessionCookie(res: Response, env: Env): void {
  res.clearCookie(SESSION_COOKIE_NAME, baseCookieOptions(env));
}

export function readSessionToken(req: Request): string | undefined {
  const header = req.header("cookie");
  if (!header) return undefined;
  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    if (pair.slice(0, separator).trim() !== SESSION_COOKIE_NAME) continue;
    const value = pair.slice(separator + 1).trim();
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}
