export const CREATOR_APPLICATION_REVIEW_PERMISSION =
  "creator_applications.review" as const;

export type OperationsPermission = typeof CREATOR_APPLICATION_REVIEW_PERMISSION;

export interface VerifiedOperationsIdentity {
  issuer: string;
  subject: string;
  assurance: "MFA" | "TEST";
}

export interface OperationsReviewActor {
  operatorId: string;
  userId: string;
  issuer: string;
  subject: string;
}

export class OperationsAuthenticationError extends Error {
  constructor(message = "Invalid operational authentication") {
    super(message);
    this.name = "OperationsAuthenticationError";
  }
}

export class OperationsIdentityInfrastructureError extends Error {
  constructor() {
    super("Operational identity verification unavailable");
    this.name = "OperationsIdentityInfrastructureError";
  }
}
