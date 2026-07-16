-- CreateEnum
CREATE TYPE "AcceptanceKind" AS ENUM ('TERMS', 'PRIVACY', 'AGE_ATTESTATION');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "lastExtendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userAgent" VARCHAR(512);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AcceptanceRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" "AcceptanceKind" NOT NULL,
    "version" VARCHAR(100),
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45) NOT NULL,

    CONSTRAINT "AcceptanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcceptanceRecord_userId_kind_acceptedAt_idx" ON "AcceptanceRecord"("userId", "kind", "acceptedAt");

-- AddForeignKey
ALTER TABLE "AcceptanceRecord" ADD CONSTRAINT "AcceptanceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
