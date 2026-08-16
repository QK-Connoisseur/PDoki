import { describe, expect, it } from "vitest";
import {
  AccountSessionsResponseSchema,
  ApiErrorSchema,
  AuthResponseSchema,
  ChangeEmailRequestSchema,
  ChangePasswordRequestSchema,
  CreateCreatorApplicationRequestSchema,
  CreatorApplicationReviewParamsSchema,
  CreatorApplicationResponseSchema,
  HealthResponseSchema,
  LoginRequestSchema,
  ReadyResponseSchema,
  RegisterRequestSchema,
  ReviewCreatorApplicationRequestSchema,
  ReviewCreatorApplicationResponseSchema,
  UpdateProfileRequestSchema,
  UpdateUserPreferencesRequestSchema,
  UserPreferencesResponseSchema,
  UserSchema,
} from "./index.js";

describe("account settings schemas", () => {
  it("normalizes profile and email changes and rejects extra fields", () => {
    expect(
      UpdateProfileRequestSchema.parse({ displayName: "  New Name  " })
        .displayName
    ).toBe("New Name");
    expect(
      ChangeEmailRequestSchema.parse({
        email: "  New@Example.COM ",
        currentPassword: "old-password",
      }).email
    ).toBe("new@example.com");
    expect(
      ChangeEmailRequestSchema.safeParse({
        email: "new@example.com",
        currentPassword: "old-password",
        role: "ADMIN",
      }).success
    ).toBe(false);
  });

  it("enforces the shared password policy", () => {
    expect(
      ChangePasswordRequestSchema.safeParse({
        currentPassword: "old",
        newPassword: "short",
      }).success
    ).toBe(false);
  });

  it("accepts session metadata and requires the current marker", () => {
    expect(
      AccountSessionsResponseSchema.safeParse({
        sessions: [
          {
            id: "5ac3d89f-b6d3-4e72-a928-8cb19c607607",
            createdAt: "2026-08-01T12:00:00.000Z",
            expiresAt: "2026-08-31T12:00:00.000Z",
            ipAddress: null,
            userAgent: "Chrome/140",
            current: true,
          },
        ],
      }).success
    ).toBe(true);
  });
});

describe("creator application schemas", () => {
  const validApplicationRequest = {
    creatorName: "  Sakura Studio  ",
    countryCode: " us ",
    acceptedCreatorAgreement: true,
    acceptedCreatorAgreementVersion: "prototype-2026-08-01",
    acceptedContentPolicy: true,
    acceptedContentPolicyVersion: "prototype-2026-08-01",
    acceptedIdentityVerificationDisclosure: true,
    acceptedIdentityVerificationDisclosureVersion: "prototype-2026-08-01",
  } as const;

  it("normalizes creator names and country codes", () => {
    const parsed = CreateCreatorApplicationRequestSchema.parse(
      validApplicationRequest
    );
    expect(parsed.creatorName).toBe("Sakura Studio");
    expect(parsed.countryCode).toBe("US");
  });

  it("requires every explicit acceptance and exact prototype version", () => {
    expect(
      CreateCreatorApplicationRequestSchema.safeParse({
        ...validApplicationRequest,
        acceptedContentPolicy: false,
      }).success
    ).toBe(false);
    expect(
      CreateCreatorApplicationRequestSchema.safeParse({
        ...validApplicationRequest,
        acceptedCreatorAgreementVersion: "unknown",
      }).success
    ).toBe(false);
  });

  it("accepts the pending application response", () => {
    expect(
      CreatorApplicationResponseSchema.safeParse({
        application: {
          id: "e03581af-ded8-42e3-8298-f4d93844fd1e",
          userId: "7024fc48-182a-4544-b341-046837db9d2f",
          creatorName: "Sakura Studio",
          countryCode: "US",
          status: "PENDING",
          identityVerificationStatus: "NOT_STARTED",
          submittedAt: "2026-08-01T22:10:00.000Z",
          updatedAt: "2026-08-01T22:10:00.000Z",
        },
      }).success
    ).toBe(true);
  });

  it("accepts only the three non-approval review transitions", () => {
    const allowed = [
      {
        action: "NEEDS_INFORMATION",
        expectedStatus: "PENDING",
        reason: "  Please clarify the submitted country.  ",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "The application is outside this review scope.",
      },
      {
        action: "REJECT",
        expectedStatus: "NEEDS_INFORMATION",
        reason: "The requested clarification was not sufficient.",
      },
    ];

    for (const request of allowed) {
      expect(
        ReviewCreatorApplicationRequestSchema.safeParse(request).success
      ).toBe(true);
    }
    expect(ReviewCreatorApplicationRequestSchema.parse(allowed[0]).reason).toBe(
      "Please clarify the submitted country."
    );
  });

  it("rejects approval, impossible transitions, and injected evidence", () => {
    const invalid = [
      {
        action: "APPROVE",
        expectedStatus: "PENDING",
        reason: "This action must remain unavailable.",
      },
      {
        action: "NEEDS_INFORMATION",
        expectedStatus: "NEEDS_INFORMATION",
        reason: "A same-state transition is not allowed.",
      },
      {
        action: "REJECT",
        expectedStatus: "REJECTED",
        reason: "A terminal state cannot transition again.",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "Too short",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "x".repeat(501),
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "The actor must come from operational authentication.",
        reviewerUserId: "7024fc48-182a-4544-b341-046837db9d2f",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "The timestamp must be generated by the database.",
        reviewedAt: "2026-08-12T18:00:00.000Z",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "The request identifier must come from middleware.",
        requestId: "injected-request-id",
      },
      {
        action: "REJECT",
        expectedStatus: "PENDING",
        reason: "The peer address must come from the request socket.",
        requestIp: "203.0.113.8",
      },
    ];

    for (const request of invalid) {
      expect(
        ReviewCreatorApplicationRequestSchema.safeParse(request).success
      ).toBe(false);
    }
  });

  it("validates review parameters and evidence responses", () => {
    const applicationId = "e03581af-ded8-42e3-8298-f4d93844fd1e";
    expect(
      CreatorApplicationReviewParamsSchema.safeParse({ applicationId }).success
    ).toBe(true);
    expect(
      CreatorApplicationReviewParamsSchema.safeParse({ applicationId: "nope" })
        .success
    ).toBe(false);

    expect(
      ReviewCreatorApplicationResponseSchema.safeParse({
        application: {
          id: applicationId,
          userId: "7024fc48-182a-4544-b341-046837db9d2f",
          creatorName: "Sakura Studio",
          countryCode: "US",
          status: "REJECTED",
          identityVerificationStatus: "NOT_STARTED",
          submittedAt: "2026-08-01T22:10:00.000Z",
          updatedAt: "2026-08-12T18:00:00.000Z",
        },
        reviewEvent: {
          id: "f8e31b77-168a-467f-b7b7-3bc0dd62f824",
          creatorApplicationId: applicationId,
          reviewerUserId: "40f14c2d-bc5e-4f02-9736-0991d304d84e",
          fromStatus: "PENDING",
          toStatus: "REJECTED",
          reason: "The application is outside this review scope.",
          reviewedAt: "2026-08-12T18:00:00.000Z",
          requestId: "review-request-1",
          requestIp: null,
        },
      }).success
    ).toBe(true);
  });
});

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

describe("user preferences schemas", () => {
  it("accepts the safe default and explicit opt-in responses", () => {
    expect(
      UserPreferencesResponseSchema.parse({
        preferences: { showExplicitContent: false },
      }).preferences.showExplicitContent
    ).toBe(false);
    expect(
      UserPreferencesResponseSchema.parse({
        preferences: { showExplicitContent: true },
      }).preferences.showExplicitContent
    ).toBe(true);
  });

  it("requires an exact boolean update body", () => {
    expect(
      UpdateUserPreferencesRequestSchema.safeParse({
        showExplicitContent: true,
      }).success
    ).toBe(true);
    expect(
      UpdateUserPreferencesRequestSchema.safeParse({
        showExplicitContent: "true",
      }).success
    ).toBe(false);
    expect(
      UpdateUserPreferencesRequestSchema.safeParse({
        showExplicitContent: true,
        role: "ADMIN",
      }).success
    ).toBe(false);
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

import {
  apiErrorCodes,
  PasswordResetConfirmSchema,
  PasswordResetRequestSchema,
  VerifyEmailConfirmSchema,
} from "./index.js";

describe("slice 2 auth contracts", () => {
  it("includes the new error codes", () => {
    expect(apiErrorCodes).toContain("INVALID_TOKEN");
    expect(apiErrorCodes).toContain("TOKEN_EXPIRED");
    expect(apiErrorCodes).toContain("EMAIL_UNVERIFIED");
  });

  it("requires a non-empty verification token", () => {
    expect(VerifyEmailConfirmSchema.safeParse({ token: "abc" }).success).toBe(
      true
    );
    expect(VerifyEmailConfirmSchema.safeParse({ token: "" }).success).toBe(
      false
    );
  });

  it("normalizes the reset request email", () => {
    const parsed = PasswordResetRequestSchema.parse({
      email: "  Alice@Example.COM ",
    });
    expect(parsed.email).toBe("alice@example.com");
  });

  it("enforces the registration password rules on reset", () => {
    expect(
      PasswordResetConfirmSchema.safeParse({ token: "t", password: "short" })
        .success
    ).toBe(false);
    expect(
      PasswordResetConfirmSchema.safeParse({
        token: "t",
        password: "a-long-enough-password",
      }).success
    ).toBe(true);
  });
});
