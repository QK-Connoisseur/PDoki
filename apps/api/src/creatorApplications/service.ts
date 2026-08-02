import type {
  CreateCreatorApplicationRequest,
  CreatorApplication as ContractCreatorApplication,
} from "@pumdoki/contracts";
import type { CreatorApplication, PrismaClient } from "@pumdoki/database";
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
  };
}
