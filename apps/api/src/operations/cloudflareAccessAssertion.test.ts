import type { Request } from "express";
import {
  errors,
  generateKeyPair,
  SignJWT,
  UnsecuredJWT,
  type CryptoKey,
  type JWTHeaderParameters,
  type JWTPayload,
  type JWTVerifyGetKey,
} from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  createCloudflareAccessAssertionVerifier,
  type CloudflareAccessAssertionVerifierOptions,
} from "./cloudflareAccessAssertion.js";
import {
  OperationsAuthenticationError,
  OperationsIdentityInfrastructureError,
} from "./types.js";

const ISSUER = "https://access.pumdoki.example";
const AUDIENCE = "pumdoki-private-operations-audience";
const SUBJECT = "cloudflare-operator-subject-01";
const NOW = new Date("2026-08-24T16:00:00.000Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1_000);

let signingKey: CryptoKey;
let verificationKey: CryptoKey;
let otherSigningKey: CryptoKey;
let ellipticSigningKey: CryptoKey;

beforeAll(async () => {
  const primary = await generateKeyPair("RS256");
  const other = await generateKeyPair("RS256");
  const elliptic = await generateKeyPair("ES256");
  signingKey = primary.privateKey;
  verificationKey = primary.publicKey;
  otherSigningKey = other.privateKey;
  ellipticSigningKey = elliptic.privateKey;
});

function validPayload(overrides: Record<string, unknown> = {}): JWTPayload {
  return {
    iss: ISSUER,
    aud: [AUDIENCE],
    sub: SUBJECT,
    iat: NOW_SECONDS - 30,
    exp: NOW_SECONDS + 300,
    type: "app",
    amr: ["hwk"],
    ...overrides,
  } as JWTPayload;
}

async function sign(
  payload: JWTPayload = validPayload(),
  options: {
    algorithm?: "RS256" | "ES256";
    key?: CryptoKey;
    protectedHeader?: Partial<JWTHeaderParameters>;
  } = {}
): Promise<string> {
  const algorithm = options.algorithm ?? "RS256";
  const key = options.key ?? signingKey;
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: algorithm,
      typ: "JWT",
      kid: "candidate-test-key",
      ...options.protectedHeader,
    })
    .sign(key);
}

function requestWithRawHeaders(rawHeaders: string[]): Request {
  return { rawHeaders } as unknown as Request;
}

function requestWithToken(token: string): Request {
  return requestWithRawHeaders(["Cf-Access-Jwt-Assertion", token]);
}

function keyResolver(key: CryptoKey = verificationKey): JWTVerifyGetKey {
  return async () => key;
}

function buildVerifier(
  overrides: Partial<CloudflareAccessAssertionVerifierOptions> = {}
): ReturnType<typeof createCloudflareAccessAssertionVerifier> {
  return createCloudflareAccessAssertionVerifier({
    issuer: ISSUER,
    audience: AUDIENCE,
    keyResolver: keyResolver(),
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
    throw new Error("Expected Cloudflare Access authentication to fail");
  } catch (error) {
    expect(error).toBeInstanceOf(OperationsAuthenticationError);
    expect((error as Error).message).toBe("Invalid operational authentication");
    if (credential) {
      expect(String(error)).not.toContain(credential);
      expect((error as Error).stack ?? "").not.toContain(credential);
    }
  }
}

describe("Cloudflare Access assertion candidate adapter", () => {
  it("returns only issuer, subject, and MFA after resolving an RS256 key", async () => {
    const resolver = vi.fn(keyResolver());
    const token = await sign(
      validPayload({
        email: "untrusted-claim@pumdoki.example",
        role: "ADMIN",
        permissions: ["creator_applications.review"],
      })
    );

    await expect(
      buildVerifier({ keyResolver: resolver })(requestWithToken(token))
    ).resolves.toEqual({
      issuer: ISSUER,
      subject: SUBJECT,
      assurance: "MFA",
    });
    expect(resolver).toHaveBeenCalledOnce();
  });

  it("accepts only exact top-level hwk evidence", async () => {
    const token = await sign(validPayload({ amr: ["mfa", "hwk"] }));

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
        "Cf-Access-Jwt-Assertion",
        "first.token.value",
        "cf-access-jwt-assertion",
        "second.token.value",
      ],
    },
    {
      name: "coalesced duplicate",
      rawHeaders: [
        "Cf-Access-Jwt-Assertion",
        "first.token.value, second.token.value",
      ],
    },
    {
      name: "padded",
      rawHeaders: ["Cf-Access-Jwt-Assertion", " first.token.value"],
    },
    {
      name: "trailing whitespace",
      rawHeaders: ["Cf-Access-Jwt-Assertion", "first.token.value "],
    },
    {
      name: "oversized",
      rawHeaders: ["Cf-Access-Jwt-Assertion", `${"a".repeat(32_767)}.b.c`],
    },
    {
      name: "Authorization substitute",
      rawHeaders: ["Authorization", "Bearer first.token.value"],
    },
    {
      name: "cookie substitute",
      rawHeaders: ["Cookie", "CF_Authorization=first.token.value"],
    },
  ])("rejects a $name Access assertion boundary", async ({ rawHeaders }) => {
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

  it("enforces RS256 and denies altered or wrong-key assertions", async () => {
    const wrongAlgorithm = await sign(validPayload(), {
      algorithm: "ES256",
      key: ellipticSigningKey,
    });
    const wrongKey = await sign(validPayload(), { key: otherSigningKey });
    const valid = await sign();
    const [header, payload, signature] = valid.split(".") as [
      string,
      string,
      string,
    ];
    const tampered = `${header}.${payload}.${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;

    for (const token of [wrongAlgorithm, wrongKey, tampered]) {
      await expectAuthenticationFailure(
        buildVerifier()(requestWithToken(token)),
        token
      );
    }
  });

  it.each([
    ["missing typ", { typ: undefined }],
    ["wrong typ", { typ: "JOSE" }],
    ["missing kid", { kid: undefined }],
    ["blank kid", { kid: "" }],
    ["padded kid", { kid: " candidate-test-key" }],
    ["oversized kid", { kid: "k".repeat(513) }],
    ["jku", { jku: "https://attacker.example/jwks.json" }],
    ["x5u", { x5u: "https://attacker.example/certificate.pem" }],
    ["embedded jwk", { jwk: { kty: "RSA", n: "attacker", e: "AQAB" } }],
    ["x5c", { x5c: ["attacker-certificate"] }],
    ["crit", { crit: ["b64"], b64: true }],
  ])("rejects a protected header with %s", async (_name, protectedHeader) => {
    const token = await sign(validPayload(), { protectedHeader });
    const resolver = vi.fn(keyResolver());

    await expectAuthenticationFailure(
      buildVerifier({ keyResolver: resolver })(requestWithToken(token)),
      token
    );
    expect(resolver).not.toHaveBeenCalled();
  });

  it("normalizes an unknown key identifier as invalid authentication", async () => {
    const token = await sign(validPayload(), {
      protectedHeader: { kid: "unknown-candidate-key" },
    });
    const resolver: JWTVerifyGetKey = async () => {
      throw new errors.JWKSNoMatchingKey();
    };

    await expectAuthenticationFailure(
      buildVerifier({ keyResolver: resolver })(requestWithToken(token)),
      token
    );
  });

  it.each([
    ["wrong issuer", { iss: "https://attacker.example" }],
    ["missing issuer", { iss: undefined }],
    ["wrong audience", { aud: ["another-audience"] }],
    ["missing audience", { aud: undefined }],
    ["string audience", { aud: AUDIENCE }],
    ["additional audience", { aud: [AUDIENCE, "another-audience"] }],
    ["duplicate audience", { aud: [AUDIENCE, AUDIENCE] }],
    ["missing application type", { type: undefined }],
    ["wrong application type", { type: "org" }],
    ["unsupported token type", { type: "unsupported" }],
  ])("rejects a %s claim", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("rejects a service-token-shaped app assertion without a human subject", async () => {
    const token = await sign(
      validPayload({
        type: "app",
        sub: "",
        amr: undefined,
        common_name: "candidate-service-token",
      })
    );

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
    ["fractional issued-at", { iat: NOW_SECONDS - 30.5 }],
    ["fractional expiration", { exp: NOW_SECONDS + 300.5 }],
    [
      "expiration not after issued-at",
      { iat: NOW_SECONDS - 30, exp: NOW_SECONDS - 30 },
    ],
  ])("rejects an assertion with %s", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("applies only the configured clock tolerance", async () => {
    const withinTolerance = await sign(
      validPayload({
        iat: NOW_SECONDS + 4,
        nbf: NOW_SECONDS + 4,
        exp: NOW_SECONDS + 60,
      })
    );

    await expect(
      buildVerifier({ clockToleranceSeconds: 5 })(
        requestWithToken(withinTolerance)
      )
    ).resolves.toMatchObject({ subject: SUBJECT });
    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(withinTolerance)),
      withinTolerance
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
    ["empty amr", { amr: [] }],
    ["generic mfa", { amr: ["mfa"] }],
    ["password", { amr: ["pwd"] }],
    ["one-time password", { amr: ["otp"] }],
    ["SMS", { amr: ["sms"] }],
    ["case variant", { amr: ["HWK"] }],
    ["WebAuthn alias", { amr: ["webauthn"] }],
    ["mixed non-string values", { amr: ["hwk", 7] }],
    ["nested evidence only", { amr: undefined, identity: { amr: ["hwk"] } }],
  ])("rejects %s authentication evidence", async (_name, claims) => {
    const token = await sign(validPayload(claims));

    await expectAuthenticationFailure(
      buildVerifier()(requestWithToken(token)),
      token
    );
  });

  it("fails closed with a sanitized identity-infrastructure error", async () => {
    const token = await sign();
    const unavailableResolver: JWTVerifyGetKey = async () => {
      throw new Error(`resolver failed while processing ${token}`);
    };

    try {
      await buildVerifier({ keyResolver: unavailableResolver })(
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

  it("rejects unsafe candidate configuration before accepting requests", () => {
    expect(() => buildVerifier({ issuer: ` ${ISSUER}` })).toThrow(TypeError);
    expect(() => buildVerifier({ audience: "" })).toThrow(TypeError);
    expect(() => buildVerifier({ maxAssertionAgeSeconds: 0 })).toThrow(
      TypeError
    );
    expect(() => buildVerifier({ clockToleranceSeconds: -1 })).toThrow(
      TypeError
    );
    expect(() =>
      buildVerifier({ keyResolver: null as unknown as JWTVerifyGetKey })
    ).toThrow(TypeError);
  });
});
