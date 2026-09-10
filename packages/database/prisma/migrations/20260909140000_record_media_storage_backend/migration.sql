CREATE TYPE "MediaStorageBackend" AS ENUM ('LOCAL', 'R2');

-- Existing rows keep pointing to the same private local files.
ALTER TABLE "MediaAsset" ADD COLUMN "storageBackend" "MediaStorageBackend" NOT NULL DEFAULT 'LOCAL';

CREATE FUNCTION protect_media_storage_backend() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."storageBackend" IS DISTINCT FROM OLD."storageBackend" THEN
    RAISE EXCEPTION 'A sealed media storage backend cannot be rewritten';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_media_storage_backend BEFORE UPDATE ON "MediaAsset"
FOR EACH ROW EXECUTE FUNCTION protect_media_storage_backend();
