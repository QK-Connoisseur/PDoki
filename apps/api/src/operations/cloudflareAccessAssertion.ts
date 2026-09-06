import type { Request } from "express";
import {
  decodeProtectedHeader,
  errors,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import {
  OperationsAuthenticationError,
  OperationsIdentityInfrastructureError,
  type VerifiedOperationsIdentity,
} from "./types.js";

const RS256 = "RS256" as const;
const ACCESS_ASSERTION_HEADER = "cf-access-jwt-assertion";
const MAX_ASSERTION_LENGTH = 32_768;
const MAX_SUBJECT_LENGTH = 512;
const MAX_KEY_ID_LENGTH = 512;
const AUTHENTICATION_ERROR_CODES = new Set([
  "ERR_JOSE_ALG_NOT_ALLOWED",
  "ERR_JOSE_NOT_SUPPORTED",
  "ERR_JWS_INVALID",
  "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
  "ERR_JWT_CLAIM_VALIDATION_FAILED",
  "ERR_JWT_EXPIRED",
  "ERR_JWT_INVALID",
  "ERR_JWKS_MULTIPLE_MATCHING_KEYS",
  "ERR_JWKS_NO_MATCHING_KEY",
]);

export interface CloudflareAccessAssertionVerifierOptions {
  issuer: string;
  audience: string;
  keyResolver: JWTVerifyGetKey;
  maxAssertionAgeSeconds: number;
  clockToleranceSeconds?: number;
  now?: () => Date;
}

function requireExactConfigurationValue(value: string, name: string): void {
  if (value.length === 0 || value !== value.trim()) {
    throw new TypeError(`${name} must be a non-empty, trimmed string`);
  }
}

function requireFiniteSeconds(
  value: number,
  name: string,
  allowZero: boolean
): void {
  const minimum = allowZero ? 0 : 1;
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(
      `${name} must be a safe integer of at least ${minimum}`
    );
  }
}

function validateOptions(
  options: CloudflareAccessAssertionVerifierOptions
): void {
  requireExactConfigurationValue(options.issuer, "issuer");
  requireExactConfigurationValue(options.audience, "audience");
  requireFiniteSeconds(
    options.maxAssertionAgeSeconds,
    "maxAssertionAgeSeconds",
    false
  );
  requireFiniteSeconds(
    options.clockToleranceSeconds ?? 0,
    "clockToleranceSeconds",
    true
  );
  if (typeof options.keyResolver !== "function") {
    throw new TypeError("keyResolver must be a function");
  }
}

function invalidAuthentication(): OperationsAuthenticationError {
  return new OperationsAuthenticationError();
}

function readAccessAssertion(req: Request): string {
  const values: string[] = [];

  for (let index = 0; index < req.rawHeaders.length; index += 2) {
    const name = req.rawHeaders[index];
    const value = req.rawHeaders[index + 1];
    if (
      name?.toLowerCase() === ACCESS_ASSERTION_HEADER &&
      value !== undefined
    ) {
      values.push(value);
    }
  }

  if (values.length !== 1) {
    throw invalidAuthentication();
  }

  const token = values[0];
  if (
    token.length > MAX_ASSERTION_LENGTH ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
  ) {
    throw invalidAuthentication();
  }

  return token;
}

function isAuthenticationFailure(error: unknown): boolean {
  return (
    error instanceof errors.JOSEError &&
    AUTHENTICATION_ERROR_CODES.has(error.code)
  );
}

function isStrictTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value);
}

function hasOwn(value: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, property);
}

/**
 * Candidate Cloudflare Access assertion adapter for non-production claim-schema
 * evaluation. It is intentionally unmounted, is not a proven provider
 * integration until an empirical redacted token matches this schema, and
 * receives all trust material through dependency injection. A valid Access
 * assertion authenticates only an external identity; database-owned operator
 * authorization remains separate.
 */
export function createCloudflareAccessAssertionVerifier({
  issuer,
  audience,
  keyResolver,
  maxAssertionAgeSeconds,
  clockToleranceSeconds = 0,
  now = () => new Date(),
}: CloudflareAccessAssertionVerifierOptions): (
  req: Request
) => Promise<VerifiedOperationsIdentity> {
  const options = {
    issuer,
    audience,
    keyResolver,
    maxAssertionAgeSeconds,
    clockToleranceSeconds,
    now,
  };
  validateOptions(options);

  return async (req: Request): Promise<VerifiedOperationsIdentity> => {
    const token = readAccessAssertion(req);
    const currentDate = now();
    if (!Number.isFinite(currentDate.getTime())) {
      throw new TypeError("now must return a valid Date");
    }

    try {
      let candidateHeader: ReturnType<typeof decodeProtectedHeader>;
      try {
        candidateHeader = decodeProtectedHeader(token);
      } catch {
        throw invalidAuthentication();
      }
      const keyId = candidateHeader.kid;
      if (
        candidateHeader.alg !== RS256 ||
        candidateHeader.typ !== "JWT" ||
        typeof keyId !== "string" ||
        keyId.length === 0 ||
        keyId.length > MAX_KEY_ID_LENGTH ||
        keyId !== keyId.trim() ||
        hasOwn(candidateHeader, "jku") ||
        hasOwn(candidateHeader, "x5u") ||
        hasOwn(candidateHeader, "jwk") ||
        hasOwn(candidateHeader, "x5c") ||
        hasOwn(candidateHeader, "crit")
      ) {
        throw invalidAuthentication();
      }

      const { payload } = await jwtVerify(token, keyResolver, {
        algorithms: [RS256],
        issuer,
        audience,
        requiredClaims: ["iss", "aud", "sub", "iat", "exp"],
        maxTokenAge: maxAssertionAgeSeconds,
        clockTolerance: clockToleranceSeconds,
        currentDate,
      });

      if (payload.iss !== issuer) {
        throw invalidAuthentication();
      }

      if (
        !Array.isArray(payload.aud) ||
        payload.aud.length !== 1 ||
        payload.aud[0] !== audience
      ) {
        throw invalidAuthentication();
      }

      if (payload.type !== "app") {
        throw invalidAuthentication();
      }

      if (
        !isStrictTimestamp(payload.iat) ||
        !isStrictTimestamp(payload.exp) ||
        (payload.nbf !== undefined && !isStrictTimestamp(payload.nbf)) ||
        payload.exp <= payload.iat
      ) {
        throw invalidAuthentication();
      }

      const subject = payload.sub;
      if (
        typeof subject !== "string" ||
        subject.length === 0 ||
        subject.length > MAX_SUBJECT_LENGTH ||
        subject !== subject.trim()
      ) {
        throw invalidAuthentication();
      }

      const authenticationMethods = payload.amr;
      if (
        !Array.isArray(authenticationMethods) ||
        authenticationMethods.length === 0 ||
        !authenticationMethods.every((method) => typeof method === "string") ||
        !authenticationMethods.includes("hwk")
      ) {
        throw invalidAuthentication();
      }

      return {
        issuer,
        subject,
        assurance: "MFA",
      };
    } catch (error) {
      if (
        error instanceof OperationsAuthenticationError ||
        isAuthenticationFailure(error)
      ) {
        throw invalidAuthentication();
      }
      throw new OperationsIdentityInfrastructureError();
    }
  };
}
