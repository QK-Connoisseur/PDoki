-- CreateEnum
CREATE TYPE "DurableJobKind" AS ENUM ('PHASE2_CANARY_V1');

-- CreateEnum
CREATE TYPE "DurableJobStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'SUCCEEDED',
    'DEAD',
    'CANCELED',
    'DISCARDED'
);

-- CreateEnum
CREATE TYPE "DurableJobFailureCategory" AS ENUM (
    'TRANSIENT',
    'TIMEOUT',
    'DATABASE',
    'PAYLOAD_INVALID',
    'HANDLER_PERMANENT',
    'LEASE_EXPIRED_ATTEMPT_LIMIT'
);

-- CreateTable
CREATE TABLE "DurableJob" (
    "id" UUID NOT NULL,
    "kind" "DurableJobKind" NOT NULL,
    "payloadVersion" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "deduplicationKeyHash" CHAR(64) NOT NULL,
    "status" "DurableJobStatus" NOT NULL DEFAULT 'PENDING',
    "availableAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL,
    "leaseToken" UUID,
    "leaseExpiresAt" TIMESTAMPTZ(3),
    "requestId" VARCHAR(64) NOT NULL,
    "correlationId" VARCHAR(64),
    "originalJobId" UUID,
    "replaySequence" INTEGER NOT NULL DEFAULT 0,
    "lastFailureCategory" "DurableJobFailureCategory",
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "terminalAt" TIMESTAMPTZ(3),

    CONSTRAINT "DurableJob_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DurableJob_payload_check" CHECK (
      pg_catalog.jsonb_typeof("payload") = 'object'
      AND pg_catalog.octet_length("payload"::text) BETWEEN 1 AND 2048
    ),
    CONSTRAINT "DurableJob_canary_payload_check" CHECK (
      "kind" <> 'PHASE2_CANARY_V1'
      OR (
        "payloadVersion" = 1
        AND pg_catalog.jsonb_typeof(
          "payload" -> 'canaryIntentId'
        ) = 'string'
        AND "payload" = pg_catalog.jsonb_build_object(
          'canaryIntentId',
          "payload" ->> 'canaryIntentId'
        )
        AND ("payload" ->> 'canaryIntentId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      )
    ),
    CONSTRAINT "DurableJob_deduplication_key_hash_check" CHECK (
      "deduplicationKeyHash" ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT "DurableJob_request_id_check" CHECK (
      pg_catalog.char_length("requestId") BETWEEN 1 AND 64
    ),
    CONSTRAINT "DurableJob_correlation_id_check" CHECK (
      "correlationId" IS NULL
      OR pg_catalog.char_length("correlationId") BETWEEN 1 AND 64
    ),
    CONSTRAINT "DurableJob_attempts_check" CHECK (
      "maxAttempts" BETWEEN 1 AND 10
      AND "attemptCount" BETWEEN 0 AND "maxAttempts"
    ),
    CONSTRAINT "DurableJob_replay_check" CHECK (
      (
        "originalJobId" IS NULL
        AND "replaySequence" = 0
      )
      OR (
        "originalJobId" IS NOT NULL
        AND "originalJobId" <> "id"
        AND "replaySequence" BETWEEN 1 AND 1000000
      )
    ),
    CONSTRAINT "DurableJob_state_check" CHECK (
      (
        "status" = 'PENDING'
        AND "leaseToken" IS NULL
        AND "leaseExpiresAt" IS NULL
        AND "completedAt" IS NULL
        AND "terminalAt" IS NULL
      )
      OR (
        "status" = 'RUNNING'
        AND "leaseToken" IS NOT NULL
        AND "leaseExpiresAt" IS NOT NULL
        AND "completedAt" IS NULL
        AND "terminalAt" IS NULL
      )
      OR (
        "status" = 'SUCCEEDED'
        AND "leaseToken" IS NULL
        AND "leaseExpiresAt" IS NULL
        AND "completedAt" IS NOT NULL
        AND "terminalAt" IS NULL
      )
      OR (
        "status" IN ('DEAD', 'CANCELED', 'DISCARDED')
        AND "leaseToken" IS NULL
        AND "leaseExpiresAt" IS NULL
        AND "completedAt" IS NULL
        AND "terminalAt" IS NOT NULL
      )
    ),
    CONSTRAINT "DurableJob_dead_failure_check" CHECK (
      "status" <> 'DEAD' OR "lastFailureCategory" IS NOT NULL
    )
);

-- CreateTable
CREATE TABLE "WorkerCanaryIntent" (
    "id" UUID NOT NULL,
    "idempotencyKeyHash" CHAR(64) NOT NULL,
    "requestDigest" CHAR(64) NOT NULL,
    "requestId" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerCanaryIntent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WorkerCanaryIntent_idempotency_key_hash_check" CHECK (
      "idempotencyKeyHash" ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT "WorkerCanaryIntent_request_digest_check" CHECK (
      "requestDigest" ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT "WorkerCanaryIntent_request_id_check" CHECK (
      pg_catalog.char_length("requestId") BETWEEN 1 AND 64
    )
);

-- CreateTable
CREATE TABLE "WorkerCanaryJob" (
    "jobId" UUID NOT NULL,
    "canaryIntentId" UUID NOT NULL,

    CONSTRAINT "WorkerCanaryJob_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "WorkerCanaryEffect" (
    "canaryIntentId" UUID NOT NULL,
    "sourceJobId" UUID NOT NULL,
    "appliedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerCanaryEffect_pkey" PRIMARY KEY ("canaryIntentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DurableJob_leaseToken_key" ON "DurableJob"("leaseToken");

-- CreateIndex
CREATE UNIQUE INDEX "DurableJob_kind_deduplicationKeyHash_key" ON "DurableJob"("kind", "deduplicationKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "DurableJob_originalJobId_replaySequence_key" ON "DurableJob"("originalJobId", "replaySequence");

-- CreateIndex
CREATE INDEX "DurableJob_kind_status_idx" ON "DurableJob"("kind", "status");

-- The partial indexes support bounded claims and expired-lease cleanup. They
-- are intentionally expressed in SQL because Prisma does not model predicates.
CREATE INDEX "DurableJob_claim_order_idx"
  ON "DurableJob"("availableAt", "createdAt", "id")
  WHERE "status" IN ('PENDING', 'RUNNING');

CREATE INDEX "DurableJob_expired_lease_idx"
  ON "DurableJob"("leaseExpiresAt", "id")
  WHERE "status" = 'RUNNING';

-- CreateIndex
CREATE UNIQUE INDEX "WorkerCanaryIntent_idempotencyKeyHash_key" ON "WorkerCanaryIntent"("idempotencyKeyHash");

-- CreateIndex
CREATE INDEX "WorkerCanaryJob_canaryIntentId_idx" ON "WorkerCanaryJob"("canaryIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerCanaryEffect_sourceJobId_key" ON "WorkerCanaryEffect"("sourceJobId");

-- AddForeignKey
ALTER TABLE "DurableJob" ADD CONSTRAINT "DurableJob_originalJobId_fkey" FOREIGN KEY ("originalJobId") REFERENCES "DurableJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerCanaryJob" ADD CONSTRAINT "WorkerCanaryJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "DurableJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerCanaryJob" ADD CONSTRAINT "WorkerCanaryJob_canaryIntentId_fkey" FOREIGN KEY ("canaryIntentId") REFERENCES "WorkerCanaryIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerCanaryEffect" ADD CONSTRAINT "WorkerCanaryEffect_canaryIntentId_fkey" FOREIGN KEY ("canaryIntentId") REFERENCES "WorkerCanaryIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerCanaryEffect" ADD CONSTRAINT "WorkerCanaryEffect_sourceJobId_fkey" FOREIGN KEY ("sourceJobId") REFERENCES "DurableJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Queue routines are isolated from the ordinary table namespace. Runtime
-- roles receive only explicitly provisioned EXECUTE rights in a later,
-- environment-specific operation; this migration guesses no live role names.
CREATE SCHEMA job_queue;
REVOKE ALL ON SCHEMA job_queue FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA job_queue REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

REVOKE ALL ON TABLE "DurableJob", "WorkerCanaryIntent", "WorkerCanaryJob", "WorkerCanaryEffect" FROM PUBLIC;
REVOKE ALL ON TYPE "DurableJobKind", "DurableJobStatus", "DurableJobFailureCategory" FROM PUBLIC;

CREATE FUNCTION job_queue.enqueue_phase2_canary(
  p_job_id uuid,
  p_canary_intent_id uuid,
  p_deduplication_key_hash text,
  p_request_id text,
  p_correlation_id text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $enqueue$
DECLARE
  v_now timestamptz;
  v_active_global bigint;
  v_active_kind bigint;
BEGIN
  IF p_job_id IS NULL
     OR p_canary_intent_id IS NULL
     OR p_deduplication_key_hash IS NULL
     OR p_deduplication_key_hash !~ '^[0-9a-f]{64}$'
     OR p_request_id IS NULL
     OR pg_catalog.char_length(p_request_id) NOT BETWEEN 1 AND 64
     OR (
       p_correlation_id IS NOT NULL
       AND pg_catalog.char_length(p_correlation_id) NOT BETWEEN 1 AND 64
     ) THEN
    RAISE EXCEPTION 'invalid durable canary enqueue input'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public."WorkerCanaryIntent" AS intent
  WHERE intent."id" = p_canary_intent_id
    AND intent."requestId" = p_request_id
    AND intent."idempotencyKeyHash" = p_deduplication_key_hash
  FOR KEY SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'durable canary intent is unavailable'
      USING ERRCODE = '23503';
  END IF;

  -- Every runtime enqueue uses this routine, so a transaction-scoped lock
  -- makes the fixed active-backlog checks and insertion one bounded decision.
  PERFORM pg_catalog.pg_advisory_xact_lock(2052, 1);

  SELECT pg_catalog.count(*)
  INTO v_active_global
  FROM public."DurableJob" AS queued
  WHERE queued."status" IN ('PENDING', 'RUNNING');

  IF v_active_global >= 1000 THEN
    RAISE EXCEPTION 'durable job backlog is at its global capacity'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT pg_catalog.count(*)
  INTO v_active_kind
  FROM public."DurableJob" AS queued
  WHERE queued."kind" = 'PHASE2_CANARY_V1'
    AND queued."status" IN ('PENDING', 'RUNNING');

  IF v_active_kind >= 100 THEN
    RAISE EXCEPTION 'durable canary backlog is at capacity'
      USING ERRCODE = 'P0001';
  END IF;

  -- The column stores millisecond precision. Truncate rather than round so an
  -- immediately following claim cannot observe availableAt microscopically in
  -- the future.
  v_now := pg_catalog.date_trunc(
    'milliseconds',
    pg_catalog.clock_timestamp()
  );

  INSERT INTO public."DurableJob" (
    "id",
    "kind",
    "payloadVersion",
    "payload",
    "deduplicationKeyHash",
    "status",
    "availableAt",
    "attemptCount",
    "maxAttempts",
    "requestId",
    "correlationId",
    "replaySequence",
    "createdAt",
    "updatedAt"
  ) VALUES (
    p_job_id,
    'PHASE2_CANARY_V1',
    1,
    pg_catalog.jsonb_build_object('canaryIntentId', p_canary_intent_id),
    p_deduplication_key_hash,
    'PENDING',
    v_now,
    0,
    3,
    p_request_id,
    p_correlation_id,
    0,
    v_now,
    v_now
  );

  INSERT INTO public."WorkerCanaryJob" ("jobId", "canaryIntentId")
  VALUES (p_job_id, p_canary_intent_id);

  RETURN p_job_id;
END;
$enqueue$;

CREATE FUNCTION job_queue.claim_one(
  p_lease_token uuid
) RETURNS TABLE (
  job_id uuid,
  job_kind text,
  payload_version integer,
  payload jsonb,
  attempt_count integer,
  lease_expires_at timestamptz,
  request_id text,
  correlation_id text
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $claim$
DECLARE
  v_now timestamptz;
  v_final_candidate_ids uuid[];
BEGIN
  IF p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid durable job claim input'
      USING ERRCODE = '22023';
  END IF;

  v_now := pg_catalog.date_trunc(
    'milliseconds',
    pg_catalog.clock_timestamp()
  );

  -- Lock one bounded final-expiry batch before classifying it. Row locks remain
  -- held through the function transaction, so another worker skips these rows.
  -- The separate UPDATE below runs with a fresh READ COMMITTED snapshot and
  -- therefore observes an effect that committed while this lock statement was
  -- waiting, instead of terminalizing the job from a stale statement snapshot.
  SELECT COALESCE(
    pg_catalog.array_agg(candidate."id"),
    ARRAY[]::uuid[]
  )
  INTO v_final_candidate_ids
  FROM (
    SELECT queued."id"
    FROM public."DurableJob" AS queued
    WHERE queued."status" = 'RUNNING'
      AND queued."leaseExpiresAt" <= v_now
      AND queued."attemptCount" >= queued."maxAttempts"
    ORDER BY queued."leaseExpiresAt", queued."id"
    FOR UPDATE OF queued SKIP LOCKED
    LIMIT 16
  ) AS candidate;

  -- Keeping success and DEAD decisions in the same locked candidate set
  -- prevents an effect-bearing row outside the reconciliation limit (or
  -- skipped by a lock) from falling through into a later terminalization pass.
  WITH final_candidate AS MATERIALIZED (
    SELECT
      candidate."id",
      EXISTS (
        SELECT 1
        FROM public."WorkerCanaryJob" AS link
        JOIN public."WorkerCanaryEffect" AS effect
          ON effect."canaryIntentId" = link."canaryIntentId"
        WHERE link."jobId" = candidate."id"
      ) AS has_effect
    FROM pg_catalog.unnest(v_final_candidate_ids) AS candidate("id")
  )
  UPDATE public."DurableJob" AS queued
  SET "status" = CASE
        WHEN final_candidate.has_effect
          THEN 'SUCCEEDED'::public."DurableJobStatus"
        ELSE 'DEAD'::public."DurableJobStatus"
      END,
      "leaseToken" = NULL,
      "leaseExpiresAt" = NULL,
      "lastFailureCategory" = CASE
        WHEN final_candidate.has_effect
          THEN queued."lastFailureCategory"
        ELSE 'LEASE_EXPIRED_ATTEMPT_LIMIT'::public."DurableJobFailureCategory"
      END,
      "completedAt" = CASE
        WHEN final_candidate.has_effect THEN v_now
        ELSE NULL
      END,
      "terminalAt" = CASE
        WHEN final_candidate.has_effect THEN NULL
        ELSE v_now
      END,
      "updatedAt" = v_now
  FROM final_candidate
  WHERE queued."id" = final_candidate."id";

  RETURN QUERY
  WITH candidate AS (
    SELECT queued."id"
    FROM public."DurableJob" AS queued
    WHERE (
      queued."status" = 'PENDING'
      OR (
        queued."status" = 'RUNNING'
        AND queued."leaseExpiresAt" <= v_now
      )
    )
      AND queued."availableAt" <= v_now
      AND queued."attemptCount" < queued."maxAttempts"
    ORDER BY queued."availableAt", queued."createdAt", queued."id"
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public."DurableJob" AS queued
  SET "status" = 'RUNNING',
      "attemptCount" = queued."attemptCount" + 1,
      "leaseToken" = p_lease_token,
      "leaseExpiresAt" = v_now + pg_catalog.make_interval(secs => 30),
      "updatedAt" = v_now
  FROM candidate
  WHERE queued."id" = candidate."id"
  RETURNING
    queued."id",
    queued."kind"::text,
    queued."payloadVersion",
    queued."payload",
    queued."attemptCount",
    queued."leaseExpiresAt",
    queued."requestId"::text,
    queued."correlationId"::text;
END;
$claim$;

CREATE FUNCTION job_queue.renew_job(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $renew$
DECLARE
  v_now timestamptz;
  v_affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid durable job renewal input'
      USING ERRCODE = '22023';
  END IF;

  -- Acquire ownership before reading database time. A caller that waits for
  -- this row lock must not act on a lease that expired during the wait.
  PERFORM 1
  FROM public."DurableJob" AS queued
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_now := pg_catalog.clock_timestamp();
  UPDATE public."DurableJob" AS queued
  SET "leaseExpiresAt" = v_now + pg_catalog.make_interval(secs => 30),
      "updatedAt" = v_now
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
    AND queued."leaseExpiresAt" > v_now;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$renew$;

-- Reserved for a claim intercepted before its handler begins.
CREATE FUNCTION job_queue.release_unstarted_job(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $release$
DECLARE
  v_now timestamptz;
  v_affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid durable job release input'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public."DurableJob" AS queued
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_now := pg_catalog.date_trunc(
    'milliseconds',
    pg_catalog.clock_timestamp()
  );
  UPDATE public."DurableJob" AS queued
  SET "status" = 'PENDING',
      "attemptCount" = queued."attemptCount" - 1,
      "availableAt" = v_now,
      "leaseToken" = NULL,
      "leaseExpiresAt" = NULL,
      "completedAt" = NULL,
      "terminalAt" = NULL,
      "updatedAt" = v_now
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."attemptCount" > 0
    AND queued."leaseToken" = p_lease_token
    AND queued."leaseExpiresAt" > v_now;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$release$;

CREATE FUNCTION job_queue.complete_job(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $complete$
DECLARE
  v_now timestamptz;
  v_affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid durable job completion input'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public."DurableJob" AS queued
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_now := pg_catalog.clock_timestamp();
  UPDATE public."DurableJob" AS queued
  SET "status" = 'SUCCEEDED',
      "leaseToken" = NULL,
      "leaseExpiresAt" = NULL,
      "completedAt" = v_now,
      "terminalAt" = NULL,
      "updatedAt" = v_now
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
    AND queued."leaseExpiresAt" > v_now
    AND EXISTS (
      SELECT 1
      FROM public."WorkerCanaryJob" AS link
      JOIN public."WorkerCanaryEffect" AS effect
        ON effect."canaryIntentId" = link."canaryIntentId"
      WHERE link."jobId" = queued."id"
    );

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$complete$;

CREATE FUNCTION job_queue.fail_job(
  p_job_id uuid,
  p_lease_token uuid,
  p_failure_category text
) RETURNS TABLE (
  accepted boolean,
  job_status text,
  retry_at timestamptz
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $fail$
DECLARE
  v_now timestamptz;
  v_attempt integer;
  v_max_attempts integer;
  v_lease_expires_at timestamptz;
  v_nominal_backoff_ms integer;
  v_bounded_backoff_ms integer;
  v_failure_category public."DurableJobFailureCategory";
BEGIN
  IF p_job_id IS NULL
     OR p_lease_token IS NULL
     OR p_failure_category IS NULL
     OR p_failure_category NOT IN (
       'TRANSIENT',
       'TIMEOUT',
       'DATABASE',
       'PAYLOAD_INVALID',
       'HANDLER_PERMANENT'
     ) THEN
    RAISE EXCEPTION 'invalid durable job failure input'
      USING ERRCODE = '22023';
  END IF;

  v_failure_category := p_failure_category::public."DurableJobFailureCategory";

  SELECT
    queued."attemptCount",
    queued."maxAttempts",
    queued."leaseExpiresAt"
  INTO v_attempt, v_max_attempts, v_lease_expires_at
  FROM public."DurableJob" AS queued
  WHERE queued."id" = p_job_id
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::timestamptz;
    RETURN;
  END IF;

  v_now := pg_catalog.clock_timestamp();
  IF v_lease_expires_at <= v_now THEN
    RETURN QUERY SELECT false, NULL::text, NULL::timestamptz;
    RETURN;
  END IF;

  -- An idempotent domain effect is authoritative. If the handler applied it
  -- and then reported an error or lost acknowledgement, reconcile success
  -- instead of scheduling a false retry or DEAD outcome.
  IF EXISTS (
    SELECT 1
    FROM public."WorkerCanaryJob" AS link
    JOIN public."WorkerCanaryEffect" AS effect
      ON effect."canaryIntentId" = link."canaryIntentId"
    WHERE link."jobId" = p_job_id
  ) THEN
    UPDATE public."DurableJob" AS queued
    SET "status" = 'SUCCEEDED',
        "leaseToken" = NULL,
        "leaseExpiresAt" = NULL,
        "completedAt" = v_now,
        "terminalAt" = NULL,
        "updatedAt" = v_now
    WHERE queued."id" = p_job_id;

    RETURN QUERY SELECT true, 'SUCCEEDED'::text, NULL::timestamptz;
    RETURN;
  END IF;

  IF p_failure_category IN ('PAYLOAD_INVALID', 'HANDLER_PERMANENT')
     OR v_attempt >= v_max_attempts THEN
    UPDATE public."DurableJob" AS queued
    SET "status" = 'DEAD',
        "leaseToken" = NULL,
        "leaseExpiresAt" = NULL,
        "lastFailureCategory" = v_failure_category,
        "completedAt" = NULL,
        "terminalAt" = v_now,
        "updatedAt" = v_now
    WHERE queued."id" = p_job_id;

    RETURN QUERY SELECT true, 'DEAD'::text, NULL::timestamptz;
    RETURN;
  END IF;

  v_nominal_backoff_ms := LEAST(
    100 * pg_catalog.power(2::numeric, v_attempt - 1)::integer,
    4000
  );
  v_bounded_backoff_ms := LEAST(
    5000,
    GREATEST(
      1,
      pg_catalog.floor(
        v_nominal_backoff_ms * (0.75 + pg_catalog.random() * 0.5)
      )::integer
    )
  );

  UPDATE public."DurableJob" AS queued
  SET "status" = 'PENDING',
      "availableAt" = v_now + pg_catalog.make_interval(
        secs => v_bounded_backoff_ms::double precision / 1000
      ),
      "leaseToken" = NULL,
      "leaseExpiresAt" = NULL,
      "lastFailureCategory" = v_failure_category,
      "completedAt" = NULL,
      "terminalAt" = NULL,
      "updatedAt" = v_now
  WHERE queued."id" = p_job_id;

  RETURN QUERY
  SELECT true, queued."status"::text, queued."availableAt"
  FROM public."DurableJob" AS queued
  WHERE queued."id" = p_job_id;
END;
$fail$;

CREATE FUNCTION job_queue.record_phase2_canary_effect(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS TABLE (
  accepted boolean,
  effect_created boolean
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $effect$
DECLARE
  v_now timestamptz;
  v_canary_intent_id uuid;
  v_lease_expires_at timestamptz;
  v_affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid durable canary effect input'
      USING ERRCODE = '22023';
  END IF;

  SELECT link."canaryIntentId", queued."leaseExpiresAt"
  INTO v_canary_intent_id, v_lease_expires_at
  FROM public."DurableJob" AS queued
  JOIN public."WorkerCanaryJob" AS link
    ON link."jobId" = queued."id"
  WHERE queued."id" = p_job_id
    AND queued."kind" = 'PHASE2_CANARY_V1'
    AND queued."payloadVersion" = 1
    AND queued."payload" = pg_catalog.jsonb_build_object(
      'canaryIntentId',
      link."canaryIntentId"
    )
    AND queued."status" = 'RUNNING'
    AND queued."leaseToken" = p_lease_token
  FOR UPDATE OF queued;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  v_now := pg_catalog.clock_timestamp();
  IF v_lease_expires_at <= v_now THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  INSERT INTO public."WorkerCanaryEffect" (
    "canaryIntentId",
    "sourceJobId",
    "appliedAt"
  ) VALUES (
    v_canary_intent_id,
    p_job_id,
    v_now
  )
  ON CONFLICT ("canaryIntentId") DO NOTHING;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN QUERY SELECT true, v_affected = 1;
END;
$effect$;

-- Aggregate-only operational telemetry. No payload, key hash, lease token,
-- recipient, or other job-specific data crosses this boundary.
CREATE FUNCTION job_queue.queue_stats()
RETURNS TABLE (
  available_jobs bigint,
  scheduled_jobs bigint,
  running_jobs bigint,
  succeeded_jobs bigint,
  dead_jobs bigint,
  canceled_jobs bigint,
  discarded_jobs bigint,
  retrying_jobs bigint,
  oldest_available_age_seconds double precision
)
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $stats$
  WITH observed AS MATERIALIZED (
    SELECT pg_catalog.clock_timestamp() AS observed_at
  )
  SELECT
    pg_catalog.count(*) FILTER (
      WHERE (
        queued."status" = 'PENDING'
        AND queued."availableAt" <= observed.observed_at
      ) OR (
        queued."status" = 'RUNNING'
        AND queued."leaseExpiresAt" <= observed.observed_at
        AND queued."attemptCount" < queued."maxAttempts"
      )
    ) AS available_jobs,
    pg_catalog.count(*) FILTER (
      WHERE queued."status" = 'PENDING'
        AND queued."availableAt" > observed.observed_at
    ) AS scheduled_jobs,
    pg_catalog.count(*) FILTER (WHERE queued."status" = 'RUNNING') AS running_jobs,
    pg_catalog.count(*) FILTER (WHERE queued."status" = 'SUCCEEDED') AS succeeded_jobs,
    pg_catalog.count(*) FILTER (WHERE queued."status" = 'DEAD') AS dead_jobs,
    pg_catalog.count(*) FILTER (WHERE queued."status" = 'CANCELED') AS canceled_jobs,
    pg_catalog.count(*) FILTER (WHERE queued."status" = 'DISCARDED') AS discarded_jobs,
    pg_catalog.count(*) FILTER (
      WHERE queued."status" IN ('PENDING', 'RUNNING')
        AND queued."lastFailureCategory" IS NOT NULL
    ) AS retrying_jobs,
    COALESCE(
      GREATEST(
        0,
        EXTRACT(
          epoch FROM (
            pg_catalog.max(observed.observed_at)
            - pg_catalog.min(
                CASE
                  WHEN queued."status" = 'PENDING'
                    AND queued."availableAt" <= observed.observed_at
                    THEN queued."availableAt"
                  WHEN queued."status" = 'RUNNING'
                    AND queued."leaseExpiresAt" <= observed.observed_at
                    AND queued."attemptCount" < queued."maxAttempts"
                    THEN queued."leaseExpiresAt"
                  ELSE NULL
                END
              )
          )
        )
      ),
      0
    )::double precision AS oldest_available_age_seconds
  FROM observed
  LEFT JOIN public."DurableJob" AS queued ON true;
$stats$;

REVOKE ALL ON FUNCTION job_queue.enqueue_phase2_canary(uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.claim_one(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.renew_job(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.release_unstarted_job(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.complete_job(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.fail_job(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.record_phase2_canary_effect(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION job_queue.queue_stats() FROM PUBLIC;
