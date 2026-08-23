import type { Request } from "express";
import { errors, jwtVerify, type CryptoKey, type JWTVerifyGetKey } from "jose";
import {
  OperationsAuthenticationError,
  OperationsIdentityInfrastructureError,
  type VerifiedOperationsIdentity,
} from "./types.js";

const ES256 = "ES256" as const;
const MAX_BEARER_TOKEN_LENGTH = 32_768;
const KNOWN_WEAK_AUTHENTICATION_METHODS = new Set([
  "email",
  "mfa",
  "otp",
  "password",
  "pwd",
  "recovery",
  "sms",
]);
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

export interface OperationsJwtVerifierOptions {
  issuer: string;
  audience: string;
  key: CryptoKey | JWTVerifyGetKey;
  hardwareAuthenticationMethods: readonly string[];
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

function validateOptions(options: OperationsJwtVerifierOptions): void {
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

  if (options.hardwareAuthenticationMethods.length === 0) {
    throw new TypeError(
      "hardwareAuthenticationMethods must contain at least one method"
    );
  }
  for (const method of options.hardwareAuthenticationMethods) {
    requireExactConfigurationValue(method, "hardwareAuthenticationMethods");
    if (KNOWN_WEAK_AUTHENTICATION_METHODS.has(method.toLowerCase())) {
      throw new TypeError(
        "hardwareAuthenticationMethods cannot contain a known weak method"
      );
    }
  }
}

function invalidAuthentication(): OperationsAuthenticationError {
  return new OperationsAuthenticationError();
}

function readStrictBearerToken(req: Request): string {
  const authorizationValues: string[] = [];

  for (let index = 0; index < req.rawHeaders.length; index += 2) {
    const name = req.rawHeaders[index];
    const value = req.rawHeaders[index + 1];
    if (name?.toLowerCase() === "authorization" && value !== undefined) {
      authorizationValues.push(value);
    }
  }

  if (authorizationValues.length !== 1) {
    throw invalidAuthentication();
  }

  const value = authorizationValues[0];
  const match =
    /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(value);
  const token = match?.[1];
  if (!token || token.length > MAX_BEARER_TOKEN_LENGTH) {
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

/**
 * Builds the signed assertion verifier for the private operations boundary.
 * Key discovery is injected so this module neither selects nor configures an
 * identity provider. Resolver and other infrastructure failures become a
 * sanitized typed error; callers must fail closed while distinguishing an
 * outage from a bad credential.
 */
export function createOperationsJwtVerifier({
  issuer,
  audience,
  key,
  hardwareAuthenticationMethods,
  maxAssertionAgeSeconds,
  clockToleranceSeconds = 0,
  now = () => new Date(),
}: OperationsJwtVerifierOptions): (
  req: Request
) => Promise<VerifiedOperationsIdentity> {
  const options = {
    issuer,
    audience,
    key,
    hardwareAuthenticationMethods,
    maxAssertionAgeSeconds,
    clockToleranceSeconds,
    now,
  };
  validateOptions(options);
  const acceptedHardwareMethods = new Set(hardwareAuthenticationMethods);

  return async (req: Request): Promise<VerifiedOperationsIdentity> => {
    const token = readStrictBearerToken(req);
    const currentDate = now();
    if (!Number.isFinite(currentDate.getTime())) {
      throw new TypeError("now must return a valid Date");
    }

    try {
      const { payload } = await jwtVerify(token, key, {
        algorithms: [ES256],
        issuer,
        audience,
        requiredClaims: ["iss", "aud", "sub", "iat", "exp"],
        maxTokenAge: maxAssertionAgeSeconds,
        clockTolerance: clockToleranceSeconds,
        currentDate,
      });

      if (typeof payload.aud !== "string" || payload.aud !== audience) {
        throw invalidAuthentication();
      }

      const subject = payload.sub;
      if (
        typeof subject !== "string" ||
        subject.length === 0 ||
        subject.length > 512 ||
        subject !== subject.trim()
      ) {
        throw invalidAuthentication();
      }

      const authenticationMethods = payload.amr;
      if (
        !Array.isArray(authenticationMethods) ||
        !authenticationMethods.every((method) => typeof method === "string") ||
        !authenticationMethods.some((method) =>
          acceptedHardwareMethods.has(method)
        )
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
