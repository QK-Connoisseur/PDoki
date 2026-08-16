import type {
  CreateCreatorApplicationRequest,
  CreatorApplication as ContractCreatorApplication,
  CreatorApplicationReviewEvent as ContractReviewEvent,
  ReviewCreatorApplicationRequest,
} from "@pumdoki/contracts";
import type {
  CreatorApplication,
  CreatorApplicationReviewEvent,
  PrismaClient,
} from "@pumdoki/database";
import { HttpError } from "../errors.js";

function toContract(
  application: CreatorApplication
): ContractCreatorApplication {
  return {
    id: application.id,
    userId: application.userId,
    creatorName: application.creatorName,
    countryCode: application.countryCode,
    status: application.status,
    identityVerificationStatus: application.identityVerificationStatus,
    submittedAt: application.submittedAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toReviewEvent(
  event: CreatorApplicationReviewEvent
): ContractReviewEvent {
  return {
    id: event.id,
    creatorApplicationId: event.creatorApplicationId,
    reviewerUserId: event.reviewerUserId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    reason: event.reason,
    reviewedAt: event.reviewedAt.toISOString(),
    requestId: event.requestId,
    requestIp: event.requestIp,
  };
}

export function createCreatorApplicationService(db: PrismaClient) {
  return {
    async getForUser(
      userId: string
    ): Promise<ContractCreatorApplication | null> {
      const application = await db.creatorApplication.findUnique({
        where: { userId },
      });
      return application ? toContract(application) : null;
    },

    async submit(
      userId: string,
      input: CreateCreatorApplicationRequest,
      ipAddress: string
    ): Promise<ContractCreatorApplication> {
      const now = new Date();
      try {
        const application = await db.$transaction(async (tx) => {
          const created = await tx.creatorApplication.create({
            data: {
              userId,
              creatorName: input.creatorName,
              countryCode: input.countryCode,
              submittedAt: now,
            },
          });
          await tx.acceptanceRecord.createMany({
            data: [
              {
                userId,
                kind: "CREATOR_AGREEMENT",
                version: input.acceptedCreatorAgreementVersion,
                acceptedAt: now,
                ipAddress,
              },
              {
                userId,
                kind: "CREATOR_CONTENT_POLICY",
                version: input.acceptedContentPolicyVersion,
                acceptedAt: now,
                ipAddress,
              },
              {
                userId,
                kind: "IDENTITY_VERIFICATION_DISCLOSURE",
                version: input.acceptedIdentityVerificationDisclosureVersion,
                acceptedAt: now,
                ipAddress,
              },
            ],
          });
          return created;
        });
        return toContract(application);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new HttpError(
            409,
            "CONFLICT",
            "A creator application already exists"
          );
        }
        throw error;
      }
    },

    async review(
      applicationId: string,
      reviewerUserId: string,
      input: ReviewCreatorApplicationRequest,
      requestId: string,
      requestIp: string | null
    ): Promise<{
      application: ContractCreatorApplication;
      reviewEvent: ContractReviewEvent;
    }> {
      const nextStatus =
        input.action === "NEEDS_INFORMATION" ? "NEEDS_INFORMATION" : "REJECTED";
      const updated = await db.$transaction(async (tx) => {
        const [application] = await tx.creatorApplication.updateManyAndReturn({
          where: {
            id: applicationId,
            status: input.expectedStatus,
          },
          data: { status: nextStatus },
        });
        if (!application) {
          const existing = await tx.creatorApplication.findUnique({
            where: { id: applicationId },
            select: { id: true },
          });
          if (!existing) {
            throw new HttpError(
              404,
              "NOT_FOUND",
              "Creator application not found"
            );
          }
          throw new HttpError(
            409,
            "CONFLICT",
            "Creator application changed or transition is unavailable"
          );
        }

        const reviewEvent = await tx.creatorApplicationReviewEvent.create({
          data: {
            creatorApplicationId: application.id,
            reviewerUserId,
            fromStatus: input.expectedStatus,
            toStatus: nextStatus,
            reason: input.reason,
            requestId,
            requestIp,
          },
        });
        return { application, reviewEvent };
      });

      return {
        application: toContract(updated.application),
        reviewEvent: toReviewEvent(updated.reviewEvent),
      };
    },
  };
}
