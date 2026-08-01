-- CreateTable
CREATE TABLE "UserPreference" (
    "userId" UUID NOT NULL,
    "showExplicitContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId")
);

-- Backfill existing users with the safe default.
INSERT INTO "UserPreference" ("userId", "showExplicitContent", "createdAt", "updatedAt")
SELECT "id", false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User";

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
