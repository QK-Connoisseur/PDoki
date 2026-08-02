ALTER TYPE "AcceptanceKind" ADD VALUE 'CREATOR_AGREEMENT';
ALTER TYPE "AcceptanceKind" ADD VALUE 'CREATOR_CONTENT_POLICY';
ALTER TYPE "AcceptanceKind" ADD VALUE 'IDENTITY_VERIFICATION_DISCLOSURE';

CREATE TYPE "CreatorApplicationStatus" AS ENUM (
  'PENDING',
  'NEEDS_INFORMATION',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE "IdentityVerificationStatus" AS ENUM (
  'NOT_STARTED',
  'PENDING',
  'VERIFIED',
  'FAILED'
);

CREATE TABLE "CreatorApplication" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "creatorName" VARCHAR(80) NOT NULL,
  "countryCode" CHAR(2) NOT NULL,
  "status" "CreatorApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "identityVerificationStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreatorApplication_userId_key"
  ON "CreatorApplication"("userId");

CREATE INDEX "CreatorApplication_status_submittedAt_idx"
  ON "CreatorApplication"("status", "submittedAt");

ALTER TABLE "CreatorApplication"
  ADD CONSTRAINT "CreatorApplication_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
