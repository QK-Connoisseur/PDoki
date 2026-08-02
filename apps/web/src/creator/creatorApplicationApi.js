import { ApiError, apiClient } from "../lib/apiClient";

export const CREATOR_AGREEMENT_VERSION = "prototype-2026-08-01";
export const CREATOR_CONTENT_POLICY_VERSION = "prototype-2026-08-01";
export const IDENTITY_VERIFICATION_DISCLOSURE_VERSION = "prototype-2026-08-01";

const APPLICATION_STATUSES = new Set([
  "PENDING",
  "NEEDS_INFORMATION",
  "APPROVED",
  "REJECTED",
]);
const IDENTITY_STATUSES = new Set([
  "NOT_STARTED",
  "PENDING",
  "VERIFIED",
  "FAILED",
]);

function invalidResponse() {
  return new ApiError(
    "Creator application service returned an invalid response",
    {
      status: 500,
      code: "INVALID_RESPONSE",
    }
  );
}

export function parseCreatorApplication(payload, { nullable = false } = {}) {
  const application = payload?.application;
  if (nullable && application === null) return null;
  if (
    !application ||
    typeof application.id !== "string" ||
    typeof application.userId !== "string" ||
    typeof application.creatorName !== "string" ||
    !/^[A-Z]{2}$/.test(application.countryCode) ||
    !APPLICATION_STATUSES.has(application.status) ||
    !IDENTITY_STATUSES.has(application.identityVerificationStatus) ||
    !Number.isFinite(Date.parse(application.submittedAt)) ||
    !Number.isFinite(Date.parse(application.updatedAt))
  ) {
    throw invalidResponse();
  }
  return application;
}

export function createCreatorApplicationApi(client = apiClient) {
  return {
    async getCurrent() {
      return parseCreatorApplication(
        await client.get("/me/creator-application"),
        { nullable: true }
      );
    },
    async submit(input) {
      return parseCreatorApplication(
        await client.post("/creator-applications", input)
      );
    },
  };
}

export const creatorApplicationApi = createCreatorApplicationApi();
