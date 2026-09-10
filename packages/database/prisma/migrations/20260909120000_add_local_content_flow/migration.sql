-- CreateEnum
CREATE TYPE "ContentPostState" AS ENUM ('DRAFT', 'PUBLISHED', 'REMOVED');

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "state" "ContentPostState" NOT NULL DEFAULT 'DRAFT',
    "testOnly" BOOLEAN NOT NULL DEFAULT true,
    "idempotencyKey" UUID NOT NULL,
    "requestDigest" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMPTZ(3),
    "removedAt" TIMESTAMPTZ(3),

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "postId" UUID,
    "position" INTEGER,
    "storageKey" CHAR(64) NOT NULL,
    "mimeType" VARCHAR(40) NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "testOnly" BOOLEAN NOT NULL DEFAULT true,
    "idempotencyKey" UUID NOT NULL,
    "requestDigest" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentPost_state_publishedAt_id_idx" ON "ContentPost"("state", "publishedAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPost_id_creatorId_key" ON "ContentPost"("id", "creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPost_creatorId_idempotencyKey_key" ON "ContentPost"("creatorId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_ownerId_idempotencyKey_key" ON "MediaAsset"("ownerId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_postId_position_key" ON "MediaAsset"("postId", "position");

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_postId_ownerId_fkey" FOREIGN KEY ("postId", "ownerId") REFERENCES "ContentPost"("id", "creatorId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Database ownership enforcement also applies if a future service forgets an
-- application-level check. A sealed file/post cannot change its meaning.
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_test_only" CHECK ("testOnly");
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_state_timestamps" CHECK (
  (state = 'DRAFT' AND "publishedAt" IS NULL AND "removedAt" IS NULL)
  OR (state = 'PUBLISHED' AND "publishedAt" IS NOT NULL AND "removedAt" IS NULL)
  OR (state = 'REMOVED' AND "removedAt" IS NOT NULL)
);
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_valid_sample" CHECK (
  "testOnly" AND "byteSize" > 0 AND "byteSize" <= 20971520
  AND "mimeType" IN ('image/png', 'image/jpeg', 'video/mp4')
  AND (("postId" IS NULL AND position IS NULL) OR ("postId" IS NOT NULL AND position IS NOT NULL AND position BETWEEN 0 AND 3))
);

CREATE FUNCTION protect_content_post() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.id, NEW."creatorId", NEW.body, NEW."testOnly", NEW."idempotencyKey", NEW."requestDigest", NEW."createdAt")
    IS DISTINCT FROM ROW(OLD.id, OLD."creatorId", OLD.body, OLD."testOnly", OLD."idempotencyKey", OLD."requestDigest", OLD."createdAt")
    OR (OLD.state = 'REMOVED' AND NEW IS DISTINCT FROM OLD)
    OR (OLD.state = 'PUBLISHED' AND NEW.state NOT IN ('PUBLISHED', 'REMOVED'))
    OR (OLD."publishedAt" IS NOT NULL AND NEW."publishedAt" IS DISTINCT FROM OLD."publishedAt") THEN
    RAISE EXCEPTION 'A sealed content post cannot be rewritten';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_content_post BEFORE UPDATE ON "ContentPost" FOR EACH ROW EXECUTE FUNCTION protect_content_post();

CREATE FUNCTION protect_media_asset() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (ROW(NEW.id, NEW."ownerId", NEW."storageKey", NEW."mimeType", NEW."byteSize", NEW.sha256, NEW."testOnly", NEW."idempotencyKey", NEW."requestDigest", NEW."createdAt")
    IS DISTINCT FROM ROW(OLD.id, OLD."ownerId", OLD."storageKey", OLD."mimeType", OLD."byteSize", OLD.sha256, OLD."testOnly", OLD."idempotencyKey", OLD."requestDigest", OLD."createdAt")
    OR (OLD."postId" IS NOT NULL AND ROW(NEW."postId", NEW.position) IS DISTINCT FROM ROW(OLD."postId", OLD.position))) THEN
    RAISE EXCEPTION 'A sealed media asset cannot be rewritten';
  END IF;
  IF NEW."postId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "ContentPost" WHERE id = NEW."postId" AND state = 'DRAFT') THEN
    RAISE EXCEPTION 'Media can only be attached to a draft';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_media_asset BEFORE INSERT OR UPDATE ON "MediaAsset" FOR EACH ROW EXECUTE FUNCTION protect_media_asset();
