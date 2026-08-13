-- CreateTable
CREATE TABLE "CreatorApplicationReviewEvent" (
    "id" UUID NOT NULL,
    "creatorApplicationId" UUID NOT NULL,
    "reviewerUserId" UUID NOT NULL,
    "fromStatus" "CreatorApplicationStatus" NOT NULL,
    "toStatus" "CreatorApplicationStatus" NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" VARCHAR(64) NOT NULL,
    "requestIp" VARCHAR(45),

    CONSTRAINT "CreatorApplicationReviewEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CreatorApplicationReviewEvent_transition_check" CHECK (
      ("fromStatus" = 'PENDING' AND "toStatus" IN ('NEEDS_INFORMATION', 'REJECTED'))
      OR
      ("fromStatus" = 'NEEDS_INFORMATION' AND "toStatus" = 'REJECTED')
    ),
    -- Match the ECMAScript WhiteSpace + LineTerminator set used by String.prototype.trim.
    CONSTRAINT "CreatorApplicationReviewEvent_reason_check" CHECK (
      "reason" !~ U&'^[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]'
      AND "reason" !~ U&'[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]$'
      AND char_length("reason") BETWEEN 10 AND 500
    )
);

-- CreateIndex
CREATE INDEX "CreatorApplicationReviewEvent_creatorApplicationId_reviewe_idx" ON "CreatorApplicationReviewEvent"("creatorApplicationId", "reviewedAt");

-- CreateIndex
CREATE INDEX "CreatorApplicationReviewEvent_reviewerUserId_reviewedAt_idx" ON "CreatorApplicationReviewEvent"("reviewerUserId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "CreatorApplicationReviewEvent" ADD CONSTRAINT "CreatorApplicationReviewEvent_creatorApplicationId_fkey" FOREIGN KEY ("creatorApplicationId") REFERENCES "CreatorApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorApplicationReviewEvent" ADD CONSTRAINT "CreatorApplicationReviewEvent_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
