-- CreateEnum
CREATE TYPE "OperationsPermissionKind" AS ENUM ('creator_applications.review');

-- CreateTable
CREATE TABLE "OperationsOperator" (
    "id" UUID NOT NULL,
    "issuer" VARCHAR(512) NOT NULL,
    "subject" VARCHAR(512) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(3),

    CONSTRAINT "OperationsOperator_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OperationsOperator_identity_check" CHECK (
      char_length("issuer") BETWEEN 1 AND 512
      AND char_length("subject") BETWEEN 1 AND 512
      AND "issuer" !~ U&'^[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]'
      AND "issuer" !~ U&'[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]$'
      AND "subject" !~ U&'^[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]'
      AND "subject" !~ U&'[\0009-\000D\0020\00A0\1680\2000-\200A\2028-\2029\202F\205F\3000\FEFF]$'
    ),
    CONSTRAINT "OperationsOperator_disabled_at_check" CHECK (
      "disabledAt" IS NULL OR "disabledAt" >= "createdAt"
    )
);

-- CreateTable
CREATE TABLE "OperationsPermissionGrant" (
    "id" UUID NOT NULL,
    "operatorId" UUID NOT NULL,
    "permission" "OperationsPermissionKind" NOT NULL,
    "grantedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "OperationsPermissionGrant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OperationsPermissionGrant_revoked_at_check" CHECK (
      "revokedAt" IS NULL OR "revokedAt" >= "grantedAt"
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationsOperator_issuer_subject_key" ON "OperationsOperator"("issuer", "subject");

-- CreateIndex
CREATE INDEX "OperationsOperator_userId_idx" ON "OperationsOperator"("userId");

-- CreateIndex
CREATE INDEX "OperationsPermissionGrant_operatorId_permission_idx" ON "OperationsPermissionGrant"("operatorId", "permission");

-- Only one unrevoked grant for an operator and permission may exist. A new
-- historical row may be appended after the prior grant is revoked.
CREATE UNIQUE INDEX "OperationsPermissionGrant_active_key"
  ON "OperationsPermissionGrant"("operatorId", "permission")
  WHERE "revokedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "OperationsOperator" ADD CONSTRAINT "OperationsOperator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationsPermissionGrant" ADD CONSTRAINT "OperationsPermissionGrant_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperationsOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- An upstream subject is never reassigned to another issuer, subject, or user.
-- Disablement is monotonic; a disabled identity cannot be silently re-enabled.
CREATE FUNCTION "enforce_operations_operator_history"()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'TRUNCATE' THEN
    RAISE EXCEPTION 'operations operator history cannot be deleted or truncated'
      USING ERRCODE = '23514';
  END IF;

  IF NEW."id" IS DISTINCT FROM OLD."id"
     OR NEW."issuer" IS DISTINCT FROM OLD."issuer"
     OR NEW."subject" IS DISTINCT FROM OLD."subject"
     OR NEW."userId" IS DISTINCT FROM OLD."userId"
     OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt" THEN
    RAISE EXCEPTION 'operations operator identity history is immutable'
      USING ERRCODE = '23514';
  END IF;

  IF OLD."disabledAt" IS NOT NULL
     AND NEW."disabledAt" IS DISTINCT FROM OLD."disabledAt" THEN
    RAISE EXCEPTION 'operations operator disablement is immutable'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION "enforce_operations_operator_history"() FROM PUBLIC;

CREATE TRIGGER "OperationsOperator_history_trigger"
BEFORE UPDATE OR DELETE ON "OperationsOperator"
FOR EACH ROW
EXECUTE FUNCTION "enforce_operations_operator_history"();

CREATE TRIGGER "OperationsOperator_truncate_trigger"
BEFORE TRUNCATE ON "OperationsOperator"
FOR EACH STATEMENT
EXECUTE FUNCTION "enforce_operations_operator_history"();

-- Grant rows retain their original identity and grant time. Revocation is a
-- one-way transition; re-granting appends a new row after revocation.
CREATE FUNCTION "enforce_operations_permission_grant_history"()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'TRUNCATE' THEN
    RAISE EXCEPTION 'operations permission grant history cannot be deleted or truncated'
      USING ERRCODE = '23514';
  END IF;

  IF NEW."id" IS DISTINCT FROM OLD."id"
     OR NEW."operatorId" IS DISTINCT FROM OLD."operatorId"
     OR NEW."permission" IS DISTINCT FROM OLD."permission"
     OR NEW."grantedAt" IS DISTINCT FROM OLD."grantedAt" THEN
    RAISE EXCEPTION 'operations permission grant history is immutable'
      USING ERRCODE = '23514';
  END IF;

  IF OLD."revokedAt" IS NOT NULL
     AND NEW."revokedAt" IS DISTINCT FROM OLD."revokedAt" THEN
    RAISE EXCEPTION 'operations permission revocation is immutable'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION "enforce_operations_permission_grant_history"() FROM PUBLIC;

CREATE TRIGGER "OperationsPermissionGrant_history_trigger"
BEFORE UPDATE OR DELETE ON "OperationsPermissionGrant"
FOR EACH ROW
EXECUTE FUNCTION "enforce_operations_permission_grant_history"();

CREATE TRIGGER "OperationsPermissionGrant_truncate_trigger"
BEFORE TRUNCATE ON "OperationsPermissionGrant"
FOR EACH STATEMENT
EXECUTE FUNCTION "enforce_operations_permission_grant_history"();
