import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  CREATOR_AGREEMENT_VERSION,
  CREATOR_CONTENT_POLICY_VERSION,
  IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
  ReviewCreatorApplicationResponseSchema,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { createCreatorApplicationService } from "./creatorApplications/service.js";
import {
  CREATOR_APPLICATION_REVIEW_PERMISSION,
  type OperationsAccessVerifier,
  type OperationsPermission,
} from "./operations/access.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";
import { testOperationsApp } from "./test/testOperationsApp.js";

const TEST_DOMAIN = "@creator-review.pumdoki.test";
const OPERATOR_HEADER = "x-pumdoki-test-operator";
const PASSWORD = "creator-review-password";
const REVIEW_PATH = "/api/v1/admin/creator-applications";

let db: PrismaClient;

function email(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}${TEST_DOMAIN}`;
}

function cookieFrom(response: request.Response): string {
  const setCookie = response.headers["set-cookie"];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  expect(cookie).toBeTruthy();
  return cookie!.split(";", 1)[0]!;
}

function validApplication() {
  return {
    creatorName: "Sakura Studio",
    countryCode: "us",
    acceptedCreatorAgreement: true,
    acceptedCreatorAgreementVersion: CREATOR_AGREEMENT_VERSION,
    acceptedContentPolicy: true,
    acceptedContentPolicyVersion: CREATOR_CONTENT_POLICY_VERSION,
    acceptedIdentityVerificationDisclosure: true,
    acceptedIdentityVerificationDisclosureVersion:
      IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
  };
}

function pendingRejection(
  reason = "The application cannot proceed in this slice."
) {
  return {
    action: "REJECT" as const,
    expectedStatus: "PENDING" as const,
    reason,
  };
}

async function cleanup(): Promise<void> {
  await db.creatorApplicationReviewEvent.deleteMany({
    where: {
      OR: [
        {
          creatorApplication: {
            user: { email: { endsWith: TEST_DOMAIN } },
          },
        },
        { reviewerUser: { email: { endsWith: TEST_DOMAIN } } },
      ],
    },
  });
  await db.creatorApplication.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.acceptanceRecord.deleteMany({
    where: { user: { email: { endsWith: TEST_DOMAIN } } },
  });
  await db.user.deleteMany({
    where: { email: { endsWith: TEST_DOMAIN } },
  });
}

async function register(
  label: string,
  options: {
    role?: "MEMBER" | "CREATOR" | "MODERATOR" | "ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "BANNED";
  } = {}
) {
  const address = email(label);
  const response = await request(testApp({ db }))
    .post("/api/v1/auth/register")
    .send({
      email: address,
      password: PASSWORD,
      displayName: `Reviewer ${label}`,
      ageAttested: true,
      acceptedTermsVersion: "terms-2026-08-01",
      acceptedPrivacyVersion: "privacy-2026-08-01",
    });
  expect(response.status).toBe(201);

  await db.user.update({
    where: { id: response.body.user.id as string },
    data: {
      role: options.role ?? "MEMBER",
      status: options.status ?? "ACTIVE",
      emailVerifiedAt: new Date(),
    },
  });

  return {
    address,
    cookie: cookieFrom(response),
    userId: response.body.user.id as string,
  };
}

async function submitApplication(member: { cookie: string; userId: string }) {
  const response = await request(testApp({ db }))
    .post("/api/v1/creator-applications")
    .set("Cookie", member.cookie)
    .send(validApplication());
  expect(response.status).toBe(201);
  return db.creatorApplication.findUniqueOrThrow({
    where: { userId: member.userId },
  });
}

function testVerifier(
  permissions: readonly OperationsPermission[] = [
    CREATOR_APPLICATION_REVIEW_PERMISSION,
  ]
): OperationsAccessVerifier {
  return async (req) => {
    const userId = req.header(OPERATOR_HEADER);
    if (!userId) return null;
    return {
      userId,
      subject: `test:${userId}`,
      assurance: "TEST",
      permissions,
    };
  };
}

function operationsApp(
  permissions?: readonly OperationsPermission[]
): ReturnType<typeof testOperationsApp> {
  return testOperationsApp({
    db,
    operationsAccessVerifier: testVerifier(permissions),
  });
}

beforeAll(async () => {
  db = await loadTestDatabase();
  await cleanup();
});

beforeEach(cleanup);

afterAll(cleanup);

describe("private creator application reviews", () => {
  it("keeps the review route out of the public API even for a public admin session", async () => {
    const member = await register("public-route-member");
    const admin = await register("public-route-admin", { role: "ADMIN" });
    const application = await submitApplication(member);

    const response = await request(testApp({ db }))
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set("Cookie", admin.cookie)
      .send(pendingRejection());

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(
      await db.creatorApplicationReviewEvent.count({
        where: { creatorApplicationId: application.id },
      })
    ).toBe(0);
  });

  it("requires the operational identity, permission, active status, and admin role", async () => {
    const member = await register("authorization-member");
    const application = await submitApplication(member);
    const admin = await register("authorization-admin", { role: "ADMIN" });

    const anonymous = await request(operationsApp())
      .patch(`${REVIEW_PATH}/${application.id}`)
      .send(pendingRejection());
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe("UNAUTHORIZED");

    const noPermission = await request(operationsApp([]))
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());
    expect(noPermission.status).toBe(403);
    expect(noPermission.body.error.code).toBe("FORBIDDEN");

    for (const role of ["MEMBER", "CREATOR", "MODERATOR"] as const) {
      const operator = await register(`authorization-${role.toLowerCase()}`, {
        role,
      });
      const response = await request(operationsApp())
        .patch(`${REVIEW_PATH}/${application.id}`)
        .set(OPERATOR_HEADER, operator.userId)
        .send(pendingRejection());
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }

    for (const status of ["SUSPENDED", "BANNED"] as const) {
      const operator = await register(`authorization-${status.toLowerCase()}`, {
        role: "ADMIN",
        status,
      });
      const response = await request(operationsApp())
        .patch(`${REVIEW_PATH}/${application.id}`)
        .set(OPERATOR_HEADER, operator.userId)
        .send(pendingRejection());
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }

    expect(
      await db.creatorApplicationReviewEvent.count({
        where: { creatorApplicationId: application.id },
      })
    ).toBe(0);
  });

  it("records the permitted pending-to-needs-information-to-rejected chain", async () => {
    const member = await register("chain-member");
    const admin = await register("chain-admin", { role: "ADMIN" });
    const application = await submitApplication(member);
    const app = operationsApp();
    const firstReviewStartedAt = Date.now();

    const needsInformation = await request(app)
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .set("x-request-id", "creator-review-needs-information")
      .send({
        action: "NEEDS_INFORMATION",
        expectedStatus: "PENDING",
        reason: "  Please clarify the submitted country record.  ",
      });
    const firstReviewFinishedAt = Date.now();
    expect(needsInformation.status).toBe(200);
    const first = ReviewCreatorApplicationResponseSchema.parse(
      needsInformation.body
    );
    expect(first.application.status).toBe("NEEDS_INFORMATION");
    expect(first.reviewEvent).toMatchObject({
      creatorApplicationId: application.id,
      reviewerUserId: admin.userId,
      fromStatus: "PENDING",
      toStatus: "NEEDS_INFORMATION",
      reason: "Please clarify the submitted country record.",
      requestId: "creator-review-needs-information",
    });
    expect(first.reviewEvent.requestIp).not.toBeNull();
    const firstReviewedAt = new Date(first.reviewEvent.reviewedAt).getTime();
    expect(firstReviewedAt).toBeGreaterThanOrEqual(firstReviewStartedAt - 1000);
    expect(firstReviewedAt).toBeLessThanOrEqual(firstReviewFinishedAt + 1000);

    const rejected = await request(app)
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .set("x-request-id", "creator-review-rejected")
      .send({
        action: "REJECT",
        expectedStatus: "NEEDS_INFORMATION",
        reason: "The requested clarification did not resolve the issue.",
      });
    expect(rejected.status).toBe(200);
    const second = ReviewCreatorApplicationResponseSchema.parse(rejected.body);
    expect(second.application.status).toBe("REJECTED");
    expect(second.reviewEvent).toMatchObject({
      reviewerUserId: admin.userId,
      fromStatus: "NEEDS_INFORMATION",
      toStatus: "REJECTED",
      requestId: "creator-review-rejected",
    });

    const persisted = await db.creatorApplication.findUniqueOrThrow({
      where: { id: application.id },
      include: { user: true, reviewEvents: true },
    });
    expect(persisted.status).toBe("REJECTED");
    expect(persisted.identityVerificationStatus).toBe("NOT_STARTED");
    expect(persisted.user.role).toBe("MEMBER");
    expect(persisted.reviewEvents).toHaveLength(2);
    expect(persisted.reviewEvents.map(({ id }) => id)).toEqual(
      expect.arrayContaining([first.reviewEvent.id, second.reviewEvent.id])
    );
    const persistedFirst = persisted.reviewEvents.find(
      ({ id }) => id === first.reviewEvent.id
    );
    expect(persistedFirst).toMatchObject({
      reviewerUserId: admin.userId,
      reason: "Please clarify the submitted country record.",
      requestId: "creator-review-needs-information",
      requestIp: first.reviewEvent.requestIp,
    });
    expect(persistedFirst?.reviewedAt.toISOString()).toBe(
      first.reviewEvent.reviewedAt
    );
  });

  it("allows a direct pending-to-rejected transition", async () => {
    const member = await register("direct-reject-member");
    const admin = await register("direct-reject-admin", { role: "ADMIN" });
    const application = await submitApplication(member);

    const response = await request(operationsApp())
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());

    expect(response.status).toBe(200);
    const parsed = ReviewCreatorApplicationResponseSchema.parse(response.body);
    expect(parsed.application.status).toBe("REJECTED");
    expect(parsed.reviewEvent).toMatchObject({
      fromStatus: "PENDING",
      toStatus: "REJECTED",
    });

    const duplicate = await request(operationsApp())
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("CONFLICT");
    expect(
      await db.creatorApplicationReviewEvent.count({
        where: { creatorApplicationId: application.id },
      })
    ).toBe(1);
  });

  it("rejects malformed parameters, approval, impossible bodies, and missing applications", async () => {
    const admin = await register("validation-admin", { role: "ADMIN" });
    const app = operationsApp();

    const malformedId = await request(app)
      .patch(`${REVIEW_PATH}/not-a-uuid`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());
    expect(malformedId.status).toBe(400);

    const invalidBodies = [
      {
        action: "APPROVE",
        expectedStatus: "PENDING",
        reason: "Approval is outside this slice.",
      },
      {
        action: "NEEDS_INFORMATION",
        expectedStatus: "NEEDS_INFORMATION",
        reason: "A same-state transition is unavailable.",
      },
      {
        ...pendingRejection(),
        reviewerUserId: admin.userId,
      },
      {
        ...pendingRejection(),
        reviewedAt: "2026-08-12T18:00:00.000Z",
      },
      {
        ...pendingRejection(),
        requestId: "injected-request-id",
      },
      {
        ...pendingRejection(),
        requestIp: "203.0.113.8",
      },
      pendingRejection("x".repeat(501)),
    ];
    for (const body of invalidBodies) {
      const response = await request(app)
        .patch(`${REVIEW_PATH}/${randomUUID()}`)
        .set(OPERATOR_HEADER, admin.userId)
        .send(body);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("BAD_REQUEST");
    }

    const missing = await request(app)
      .patch(`${REVIEW_PATH}/${randomUUID()}`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
  });

  it("returns conflict for every unavailable state/action/precondition cell", async () => {
    const pendingMember = await register("matrix-pending-member");
    const needsInformationMember = await register("matrix-needs-info-member");
    const rejectedMember = await register("matrix-rejected-member");
    const approvedMember = await register("matrix-approved-member");
    const admin = await register("conflict-admin", { role: "ADMIN" });
    const pendingApplication = await submitApplication(pendingMember);
    const needsInformationApplication = await submitApplication(
      needsInformationMember
    );
    const rejectedApplication = await submitApplication(rejectedMember);
    const approvedApplication = await submitApplication(approvedMember);
    const app = operationsApp();

    await db.creatorApplication.update({
      where: { id: needsInformationApplication.id },
      data: { status: "NEEDS_INFORMATION" },
    });
    await db.creatorApplication.update({
      where: { id: rejectedApplication.id },
      data: { status: "REJECTED" },
    });
    await db.creatorApplication.update({
      where: { id: approvedApplication.id },
      data: { status: "APPROVED" },
    });

    const unavailable = [
      {
        applicationId: pendingApplication.id,
        body: {
          action: "REJECT",
          expectedStatus: "NEEDS_INFORMATION",
          reason: "The expected status is stale for this pending application.",
        },
      },
      {
        applicationId: needsInformationApplication.id,
        body: {
          action: "NEEDS_INFORMATION",
          expectedStatus: "PENDING",
          reason: "A second information request is unavailable in this slice.",
        },
      },
      {
        applicationId: needsInformationApplication.id,
        body: pendingRejection(
          "The pending precondition is stale for this application."
        ),
      },
      {
        applicationId: rejectedApplication.id,
        body: {
          action: "NEEDS_INFORMATION",
          expectedStatus: "PENDING",
          reason: "A rejected application cannot request more information.",
        },
      },
      {
        applicationId: rejectedApplication.id,
        body: pendingRejection("A rejected application is terminal."),
      },
      {
        applicationId: rejectedApplication.id,
        body: {
          action: "REJECT",
          expectedStatus: "NEEDS_INFORMATION",
          reason: "A rejected application cannot be rejected again.",
        },
      },
      {
        applicationId: approvedApplication.id,
        body: {
          action: "NEEDS_INFORMATION",
          expectedStatus: "PENDING",
          reason: "An approved application is outside this review slice.",
        },
      },
      {
        applicationId: approvedApplication.id,
        body: pendingRejection(
          "An approved application cannot be rejected in this slice."
        ),
      },
      {
        applicationId: approvedApplication.id,
        body: {
          action: "REJECT",
          expectedStatus: "NEEDS_INFORMATION",
          reason: "An approved application remains outside this review slice.",
        },
      },
    ] as const;

    for (const { applicationId, body } of unavailable) {
      const response = await request(app)
        .patch(`${REVIEW_PATH}/${applicationId}`)
        .set(OPERATOR_HEADER, admin.userId)
        .send(body);
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("CONFLICT");
    }

    expect(
      await db.creatorApplicationReviewEvent.count({
        where: {
          creatorApplicationId: {
            in: [
              pendingApplication.id,
              needsInformationApplication.id,
              rejectedApplication.id,
              approvedApplication.id,
            ],
          },
        },
      })
    ).toBe(0);
  });

  it("allows exactly one winner when two reviewers use the same expected status", async () => {
    const member = await register("concurrency-member");
    const firstAdmin = await register("concurrency-admin-one", {
      role: "ADMIN",
    });
    const secondAdmin = await register("concurrency-admin-two", {
      role: "ADMIN",
    });
    const application = await submitApplication(member);
    const app = operationsApp();

    const [first, second] = await Promise.all([
      request(app)
        .patch(`${REVIEW_PATH}/${application.id}`)
        .set(OPERATOR_HEADER, firstAdmin.userId)
        .send({
          action: "NEEDS_INFORMATION",
          expectedStatus: "PENDING",
          reason: "Please provide one additional application detail.",
        }),
      request(app)
        .patch(`${REVIEW_PATH}/${application.id}`)
        .set(OPERATOR_HEADER, secondAdmin.userId)
        .send(pendingRejection("The application cannot proceed after review.")),
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 409]);
    const persisted = await db.creatorApplication.findUniqueOrThrow({
      where: { id: application.id },
      include: { reviewEvents: true },
    });
    expect(persisted.reviewEvents).toHaveLength(1);
    expect(persisted.status).toBe(persisted.reviewEvents[0]!.toStatus);
    expect(persisted.reviewEvents[0]!.fromStatus).toBe("PENDING");
  });

  it("rolls the status update back when evidence insertion fails", async () => {
    const member = await register("rollback-member");
    const application = await submitApplication(member);
    const service = createCreatorApplicationService(db);

    await expect(
      service.review(
        application.id,
        randomUUID(),
        pendingRejection("This transition must roll back with its evidence."),
        "creator-review-rollback",
        null
      )
    ).rejects.toThrow();

    const persisted = await db.creatorApplication.findUniqueOrThrow({
      where: { id: application.id },
    });
    expect(persisted.status).toBe("PENDING");
    expect(
      await db.creatorApplicationReviewEvent.count({
        where: { creatorApplicationId: application.id },
      })
    ).toBe(0);
  });

  it("enforces transition evidence constraints and restrictive parent deletion", async () => {
    const member = await register("constraints-member");
    const admin = await register("constraints-admin", { role: "ADMIN" });
    const application = await submitApplication(member);

    const reviewed = await request(operationsApp())
      .patch(`${REVIEW_PATH}/${application.id}`)
      .set(OPERATOR_HEADER, admin.userId)
      .send(pendingRejection());
    expect(reviewed.status).toBe(200);

    await expect(
      db.creatorApplicationReviewEvent.create({
        data: {
          creatorApplicationId: application.id,
          reviewerUserId: admin.userId,
          fromStatus: "REJECTED",
          toStatus: "NEEDS_INFORMATION",
          reason: "This invalid transition must fail the database check.",
          requestId: "invalid-review-transition",
          requestIp: null,
        },
      })
    ).rejects.toThrow();
    for (const [index, reason] of [
      "\t".repeat(10),
      "\n".repeat(10),
      "\tThis reason starts with whitespace.",
      "This reason ends with whitespace.\n",
      "\u00a0This reason starts with a no-break space.",
      "This reason ends with a narrow no-break space.\u202f",
      "\ufeffThis reason starts with a byte-order mark.",
    ].entries()) {
      await expect(
        db.creatorApplicationReviewEvent.create({
          data: {
            creatorApplicationId: application.id,
            reviewerUserId: admin.userId,
            fromStatus: "PENDING",
            toStatus: "REJECTED",
            reason,
            requestId: `invalid-review-reason-${index}`,
            requestIp: null,
          },
        })
      ).rejects.toThrow();
    }
    await expect(
      db.creatorApplication.delete({ where: { id: application.id } })
    ).rejects.toThrow();
    await expect(
      db.user.delete({ where: { id: admin.userId } })
    ).rejects.toThrow();

    expect(
      await db.creatorApplicationReviewEvent.count({
        where: { creatorApplicationId: application.id },
      })
    ).toBe(1);
  });
});
