import type { Request } from "express";
import {
  generateKeyPair,
  SignJWT,
  UnsecuredJWT,
  type CryptoKey,
  type JWTPayload,
  type JWTVerifyGetKey,
} from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createOperationsJwtVerifier,
  type OperationsJwtVerifierOptions,
} from "./jwtAssertion.js";
import {
  OperationsAuthenticationError,
  OperationsIdentityInfrastructureError,
} from "./types.js";

const ISSUER = "https://identity.pumdoki.example";
const AUDIENCE = "pumdoki-private-operations";
const SUBJECT = "operator-subject-01";
const NOW = new Date("2026-08-23T16:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1_000);

let signingKey: CryptoKey;
let verificationKey: CryptoKey;
let otherSigningKey: CryptoKey;
let rsaSigningKey: CryptoKey;

beforeAll(async () => {
  const primary = await generateKeyPair("ES256");
  const other = await generateKeyPair("ES256");
  const rsa = await generateKeyPair("RS256");
  signingKey = primary.privateKey;
  verificationKey = primary.publicKey;
  otherSigningKey = other.privateKey;
  rsaSigningKey = rsa.privateKey;
});

function validPayload(overrides: JWTPayload = {}): JWTPayload {
  return {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: SUBJECT,
    iat: NOW_SECONDS - 30,
    exp: NOW_SECONDS + 300,
    amr: ["hwk"],
    ...overrides,
  };
}

async function sign(
  payload: JWTPayload = validPayload(),
  options: { algorithm?: "ES256" | "RS256"; key?: CryptoKey } = {}
): Promise<string> {
  const algorithm = options.algorithm ?? "ES256";
  const key = options.key ?? signingKey;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm, kid: "ephemeral-test-key" })
    .sign(key);
}

function requestWithRawHeaders(rawHeaders: string[]): Request {
  return { rawHeaders } as unknown as Request;
}

function requestWithToken(token: string): Request {
  return requestWithRawHeaders(["Authorization", `Bearer ${token}`]);
}

function buildVerifier(
  overrides: Partial<OperationsJwtVerifierOptions> = {}
): ReturnType<typeof createOperationsJwtVerifier> {
  return createOperationsJwtVerifier({
    issuer: ISSUER,
    audience: AUDIENCE,
    key: verificationKey,
    hardwareAuthenticationMethods: ["hwk", "webauthn"],
    maxAssertionAgeSeconds: 300,
    clockToleranceSeconds: 0,
    now: () => NOW,
    ...overrides,
  });
}

async function expectAuthenticationFailure(
  promise: Promise<unknown>,
  credential?: string
): Promise<void> {
  try {
    await promise;
    throw new Error("Expected operational authentication to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(OperationsAuthenticationError);
    expect((error as Error).message).toBe("Invalid operational authentication");
    if (credential) {
      expect(String(error)).not.toContain(credential);
      expect((error as Error).stack ?? "").not.toContain(credential);
    }
  }
}

describe("signed operations JWT assertion verifier", () => {
  it("returns only the verified issuer, subject, and MFA assurance", async () => {
    const token = await sign(
      validPayload({
        userId: "42bfa9d5-d99b-4ad4-9e45-a62a7be60ed0",
        email: "untrusted-claim@pumdoki.example",
        role: "ADMIN",
        permissions: ["creator_applications.review"],
      })
    );

    await expect(buildVerifier()(requestWithToken(token))).resolves.toEqual({
      issuer: ISSUER,
      subject: SUBJECT,
      assurance: "MFA",
    });
  });

  it("accepts an exact configured hardware authentication method", async () => {
    const token = await sign(validPayload({ amr: ["webauthn", "mfa"] }));

    await expect(buildVerifier()(requestWithToken(token))).resolves.toEqual({
      issuer: ISSUER,
      subject: SUBJECT,
      assurance: "MFA",
    });
  });

  it.each([
    { name: "missing", rawHeaders: [] },
    {
      name: "duplicate",
      rawHeaders: [
        "Authorization",
        "Bearer first.token.value",
        "authorization",
        "Bearer second.token.value",
      ],
    },
    {
      name: "coalesced duplicate",
      rawHeaders: [
        "Authorization",
        "Bearer first.token.value, Bearer second.token.value",
      ],
    },
    {
      name: "lowercase scheme",
      rawHeaders: ["Authorization", "bearer first.token.value"],
    },
    {
      name: "extra whitespace",
      rawHeaders: ["Authorization", "Bearer  first.token.value"],
    },
  ])("rejects a $name Authorization boundary", async ({ rawHeaders }) => {
    await expectAuthenticationFailure(
      buildVerifier()(requestWithRawHeaders(rawHeaders))
    );
  });

  it("rejects malformed and unsigned assertions", async () => {
    const unsigned = new UnsecuredJWT(validPayload()).encode();

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken("malformed.jwt.value")),
      "malformed.jwt.value"
    );
    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(unsigned)),
      unsigned
    );
  });

  it("rejects a tampered assertion without exposing it in the error", async () => {
    const token = await sign();
    const [header, payload, signature] = token.split(".") as [
      string,
      string,
      string,
    ];
    const tamperedSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
    const tampered = `${header}.${payload}.${tamperedSignature}`;

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(tampered)),
      tampered
    );
  });

  it("enforces the ES256 algorithm allowlist", async () => {
    const token = await sign(validPayload(), {
      algorithm: "RS256",
      key: rsaSigningKey,
    });

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("rejects an otherwise valid assertion signed by another key", async () => {
    const token = await sign(validPayload(), { key: otherSigningKey });

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it.each([
    ["wrong issuer", { iss: "https://attacker.example" }],
    ["missing issuer", { iss: undefined }],
    ["wrong audience", { aud: "another-service" }],
    ["missing audience", { aud: undefined }],
    ["array audience", { aud: [AUDIENCE] }],
    ["additional audience", { aud: [AUDIENCE, "another-service"] }],
  ])("rejects a %s", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it.each([
    ["expired assertion", { exp: NOW_SECONDS - 1 }],
    ["future not-before", { nbf: NOW_SECONDS + 1 }],
    ["stale issued-at", { iat: NOW_SECONDS - 301 }],
    ["future issued-at", { iat: NOW_SECONDS + 1 }],
    ["missing issued-at", { iat: undefined }],
    ["missing expiration", { exp: undefined }],
    ["non-numeric issued-at", { iat: "not-a-number" }],
  ])("rejects an assertion with %s", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("uses the injected clock deterministically", async () => {
    const token = await sign(
      validPayload({
        iat: NOW_SECONDS + 55,
        exp: NOW_SECONDS + 120,
      })
    );
    const laterVerifier = buildVerifier({
      now: () => new Date(NOW.getTime() + 60_000),
    });

    await expect(laterVerifier(requestWithToken(token))).resolves.toMatchObject(
      {
        subject: SUBJECT,
      }
    );
    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it.each([
    ["missing subject", { sub: undefined }],
    ["blank subject", { sub: "" }],
    ["whitespace subject", { sub: "   " }],
    ["padded subject", { sub: ` ${SUBJECT} ` }],
    ["oversized subject", { sub: "s".repeat(513) }],
    ["non-string subject", { sub: 42 }],
  ])("rejects a %s", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it.each([
    ["missing amr", { amr: undefined }],
    ["non-array amr", { amr: "hwk" }],
    ["generic mfa", { amr: ["mfa"] }],
    ["one-time password", { amr: ["otp"] }],
    ["SMS", { amr: ["sms"] }],
    ["case variant", { amr: ["HWK"] }],
    ["mixed non-string values", { amr: ["hwk", 7] }],
  ])("rejects %s authentication evidence", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("preserves a visible but credential-safe infrastructure failure", async () => {
    const token = await sign();
    const outage = new Error(`resolver failed while processing ${token}`);
    const unavailableResolver: JWTVerifyGetKey = async () => {
      throw outage;
    };

    try {
      await buildVerifier({ key: unavailableResolver })(
        requestWithToken(token)
      );
      throw new Error("Expected key resolution to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(OperationsIdentityInfrastructureError);
      expect(String(error)).toBe(
        "OperationsIdentityInfrastructureError: Operational identity verification unavailable"
      );
      expect(String(error)).not.toContain(token);
      expect((error as Error).stack ?? "").not.toContain(token);
      expect(error).not.toHaveProperty("cause");
    }
  });

  it("rejects unsafe verifier configuration before accepting requests", () => {
    expect(() => buildVerifier({ hardwareAuthenticationMethods: [] })).toThrow(
      TypeError
    );
    expect(() => buildVerifier({ maxAssertionAgeSeconds: 0 })).toThrow(
      TypeError
    );
    expect(() => buildVerifier({ issuer: ` ${ISSUER}` })).toThrow(TypeError);
    for (const weakMethod of [
      "mfa",
      "otp",
      "sms",
      "pwd",
      "password",
      "email",
      "recovery",
    ]) {
      expect(() =>
        buildVerifier({ hardwareAuthenticationMethods: [weakMethod] })
      ).toThrow(/known weak method/);
    }
  });
});
