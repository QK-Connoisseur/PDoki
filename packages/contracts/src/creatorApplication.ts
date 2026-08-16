import { z } from "zod";

export const CREATOR_AGREEMENT_VERSION = "prototype-2026-08-01";
export const CREATOR_CONTENT_POLICY_VERSION = "prototype-2026-08-01";
export const IDENTITY_VERIFICATION_DISCLOSURE_VERSION = "prototype-2026-08-01";

export const CreatorApplicationStatusSchema = z.enum([
  "PENDING",
  "NEEDS_INFORMATION",
  "APPROVED",
  "REJECTED",
]);

export const IdentityVerificationStatusSchema = z.enum([
  "NOT_STARTED",
  "PENDING",
  "VERIFIED",
  "FAILED",
]);

export const CreateCreatorApplicationRequestSchema = z
  .object({
    creatorName: z.string().trim().min(2).max(80),
    countryCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/),
    acceptedCreatorAgreement: z.literal(true),
    acceptedCreatorAgreementVersion: z.literal(CREATOR_AGREEMENT_VERSION),
    acceptedContentPolicy: z.literal(true),
    acceptedContentPolicyVersion: z.literal(CREATOR_CONTENT_POLICY_VERSION),
    acceptedIdentityVerificationDisclosure: z.literal(true),
    acceptedIdentityVerificationDisclosureVersion: z.literal(
      IDENTITY_VERIFICATION_DISCLOSURE_VERSION
    ),
  })
  .strict();

export type CreateCreatorApplicationRequest = z.infer<
  typeof CreateCreatorApplicationRequestSchema
>;

export const CreatorApplicationSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  creatorName: z.string(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  status: CreatorApplicationStatusSchema,
  identityVerificationStatus: IdentityVerificationStatusSchema,
  submittedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreatorApplication = z.infer<typeof CreatorApplicationSchema>;

export const CreatorApplicationResponseSchema = z.object({
  application: CreatorApplicationSchema,
});

export const CurrentCreatorApplicationResponseSchema = z.object({
  application: CreatorApplicationSchema.nullable(),
});

const CreatorApplicationReviewReasonSchema = z.string().trim().min(10).max(500);

export const CreatorApplicationReviewParamsSchema = z
  .object({
    applicationId: z.uuid(),
  })
  .strict();

export type CreatorApplicationReviewParams = z.infer<
  typeof CreatorApplicationReviewParamsSchema
>;

export const ReviewCreatorApplicationRequestSchema = z.discriminatedUnion(
  "action",
  [
    z
      .object({
        action: z.literal("NEEDS_INFORMATION"),
        expectedStatus: z.literal("PENDING"),
        reason: CreatorApplicationReviewReasonSchema,
      })
      .strict(),
    z
      .object({
        action: z.literal("REJECT"),
        expectedStatus: z.enum(["PENDING", "NEEDS_INFORMATION"]),
        reason: CreatorApplicationReviewReasonSchema,
      })
      .strict(),
  ]
);

export type ReviewCreatorApplicationRequest = z.infer<
  typeof ReviewCreatorApplicationRequestSchema
>;

export const CreatorApplicationReviewEventSchema = z.object({
  id: z.uuid(),
  creatorApplicationId: z.uuid(),
  reviewerUserId: z.uuid(),
  fromStatus: CreatorApplicationStatusSchema,
  toStatus: CreatorApplicationStatusSchema,
  reason: z.string(),
  reviewedAt: z.iso.datetime(),
  requestId: z.string(),
  requestIp: z.string().nullable(),
});

export type CreatorApplicationReviewEvent = z.infer<
  typeof CreatorApplicationReviewEventSchema
>;

export const ReviewCreatorApplicationResponseSchema = z.object({
  application: CreatorApplicationSchema,
  reviewEvent: CreatorApplicationReviewEventSchema,
});
