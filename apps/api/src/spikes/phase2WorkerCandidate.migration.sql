CREATE SCHEMA __APP_SCHEMA__ AUTHORIZATION __MIGRATION_ROLE__;
CREATE SCHEMA __JOB_SCHEMA__ AUTHORIZATION __MIGRATION_ROLE__;

REVOKE ALL ON DATABASE __DATABASE__ FROM PUBLIC;
REVOKE ALL ON SCHEMA public, __APP_SCHEMA__, __JOB_SCHEMA__ FROM PUBLIC;

CREATE TABLE __APP_SCHEMA__.domain_intent (
  id uuid PRIMARY KEY,
  description text NOT NULL CHECK (
    char_length(description) BETWEEN 1 AND 200
  ),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE TABLE __JOB_SCHEMA__.job (
  id uuid PRIMARY KEY,
  domain_id uuid NOT NULL
    REFERENCES __APP_SCHEMA__.domain_intent(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind = 'phase2.candidate-canary'),
  payload_version integer NOT NULL CHECK (payload_version = 1),
  payload jsonb NOT NULL,
  dedupe_key text NOT NULL UNIQUE CHECK (
    char_length(dedupe_key) BETWEEN 1 AND 200
  ),
  status text NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'RUNNING', 'SUCCEEDED', 'DEAD')
  ),
  available_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts integer NOT NULL CHECK (max_attempts BETWEEN 1 AND 5),
  lease_token uuid,
  lease_expires_at timestamptz,
  last_failure_category text CHECK (
    last_failure_category IS NULL
    OR char_length(last_failure_category) BETWEEN 1 AND 40
  ),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (
    (
      status = 'RUNNING'
      AND lease_token IS NOT NULL
      AND lease_expires_at IS NOT NULL
      AND completed_at IS NULL
    )
    OR (
      status = 'PENDING'
      AND lease_token IS NULL
      AND lease_expires_at IS NULL
      AND completed_at IS NULL
    )
    OR (
      status IN ('SUCCEEDED', 'DEAD')
      AND lease_token IS NULL
      AND lease_expires_at IS NULL
      AND completed_at IS NOT NULL
    )
  )
);

CREATE INDEX job_claim_order_idx
  ON __JOB_SCHEMA__.job (available_at, created_at, id)
  WHERE status IN ('PENDING', 'RUNNING');

CREATE INDEX job_expired_lease_idx
  ON __JOB_SCHEMA__.job (lease_expires_at, id)
  WHERE status = 'RUNNING';

REVOKE ALL ON ALL TABLES IN SCHEMA __APP_SCHEMA__, __JOB_SCHEMA__ FROM PUBLIC;

CREATE FUNCTION __JOB_SCHEMA__.enqueue_canary(
  p_job_id uuid,
  p_domain_id uuid,
  p_dedupe_key text
) RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $enqueue$
BEGIN
  IF p_job_id IS NULL
     OR p_domain_id IS NULL
     OR p_dedupe_key IS NULL
     OR char_length(p_dedupe_key) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'invalid candidate enqueue input' USING ERRCODE = '22023';
  END IF;

  INSERT INTO __JOB_SCHEMA__.job (
    id,
    domain_id,
    kind,
    payload_version,
    payload,
    dedupe_key,
    max_attempts
  ) VALUES (
    p_job_id,
    p_domain_id,
    'phase2.candidate-canary',
    1,
    pg_catalog.jsonb_build_object('domainId', p_domain_id),
    p_dedupe_key,
    3
  );

  RETURN p_job_id;
END;
$enqueue$;

CREATE FUNCTION __JOB_SCHEMA__.claim_canary(
  p_lease_token uuid
) RETURNS TABLE (
  job_id uuid,
  domain_id uuid,
  payload jsonb,
  attempt_count integer,
  lease_expires_at timestamptz
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $claim$
BEGIN
  IF p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid candidate claim input' USING ERRCODE = '22023';
  END IF;

  WITH terminal_candidate AS (
    SELECT queued.id
    FROM __JOB_SCHEMA__.job AS queued
    WHERE queued.status = 'RUNNING'
      AND queued.lease_expires_at <= pg_catalog.clock_timestamp()
      AND queued.attempt_count >= queued.max_attempts
    ORDER BY queued.lease_expires_at, queued.id
    FOR UPDATE SKIP LOCKED
    LIMIT 16
  )
  UPDATE __JOB_SCHEMA__.job AS queued
  SET status = 'DEAD',
      lease_token = NULL,
      lease_expires_at = NULL,
      last_failure_category = 'lease-expired-attempt-limit',
      completed_at = pg_catalog.clock_timestamp(),
      updated_at = pg_catalog.clock_timestamp()
  FROM terminal_candidate
  WHERE queued.id = terminal_candidate.id;

  RETURN QUERY
  WITH candidate AS (
    SELECT queued.id
    FROM __JOB_SCHEMA__.job AS queued
    WHERE (
      queued.status = 'PENDING'
      OR (
        queued.status = 'RUNNING'
        AND queued.lease_expires_at <= pg_catalog.clock_timestamp()
      )
    )
      AND queued.available_at <= pg_catalog.clock_timestamp()
      AND queued.attempt_count < queued.max_attempts
    ORDER BY queued.available_at, queued.created_at, queued.id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE __JOB_SCHEMA__.job AS queued
  SET status = 'RUNNING',
      attempt_count = queued.attempt_count + 1,
      lease_token = p_lease_token,
      lease_expires_at = pg_catalog.clock_timestamp()
        + pg_catalog.make_interval(secs => 30),
      updated_at = pg_catalog.clock_timestamp()
  FROM candidate
  WHERE queued.id = candidate.id
  RETURNING
    queued.id,
    queued.domain_id,
    queued.payload,
    queued.attempt_count,
    queued.lease_expires_at;
END;
$claim$;

CREATE FUNCTION __JOB_SCHEMA__.renew_canary(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $renew$
DECLARE
  affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid candidate renew input' USING ERRCODE = '22023';
  END IF;

  UPDATE __JOB_SCHEMA__.job AS queued
  SET lease_expires_at = pg_catalog.clock_timestamp()
        + pg_catalog.make_interval(secs => 30),
      updated_at = pg_catalog.clock_timestamp()
  WHERE queued.id = p_job_id
    AND queued.status = 'RUNNING'
    AND queued.lease_token = p_lease_token
    AND queued.lease_expires_at > pg_catalog.clock_timestamp();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$renew$;

-- Reserved for a claim that drain intercepts before handler execution begins.
CREATE FUNCTION __JOB_SCHEMA__.release_canary(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $release$
DECLARE
  affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid candidate release input' USING ERRCODE = '22023';
  END IF;

  UPDATE __JOB_SCHEMA__.job AS queued
  SET status = 'PENDING',
      attempt_count = GREATEST(queued.attempt_count - 1, 0),
      available_at = pg_catalog.clock_timestamp(),
      lease_token = NULL,
      lease_expires_at = NULL,
      completed_at = NULL,
      updated_at = pg_catalog.clock_timestamp()
  WHERE queued.id = p_job_id
    AND queued.status = 'RUNNING'
    AND queued.lease_token = p_lease_token
    AND queued.lease_expires_at > pg_catalog.clock_timestamp();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$release$;

CREATE FUNCTION __JOB_SCHEMA__.complete_canary(
  p_job_id uuid,
  p_lease_token uuid
) RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $complete$
DECLARE
  affected integer;
BEGIN
  IF p_job_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'invalid candidate completion input' USING ERRCODE = '22023';
  END IF;

  UPDATE __JOB_SCHEMA__.job AS queued
  SET status = 'SUCCEEDED',
      lease_token = NULL,
      lease_expires_at = NULL,
      completed_at = pg_catalog.clock_timestamp(),
      updated_at = pg_catalog.clock_timestamp()
  WHERE queued.id = p_job_id
    AND queued.status = 'RUNNING'
    AND queued.lease_token = p_lease_token
    AND queued.lease_expires_at > pg_catalog.clock_timestamp();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$complete$;

CREATE FUNCTION __JOB_SCHEMA__.fail_canary(
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
  current_attempt integer;
  configured_max_attempts integer;
  nominal_backoff_milliseconds integer;
  bounded_backoff_milliseconds integer;
  failure_time timestamptz;
BEGIN
  IF p_job_id IS NULL
     OR p_lease_token IS NULL
     OR p_failure_category IS NULL
     OR p_failure_category NOT IN ('transient', 'timeout', 'database', 'permanent') THEN
    RAISE EXCEPTION 'invalid candidate failure input' USING ERRCODE = '22023';
  END IF;

  SELECT queued.attempt_count, queued.max_attempts
  INTO current_attempt, configured_max_attempts
  FROM __JOB_SCHEMA__.job AS queued
  WHERE queued.id = p_job_id
    AND queued.status = 'RUNNING'
    AND queued.lease_token = p_lease_token
    AND queued.lease_expires_at > pg_catalog.clock_timestamp()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::timestamptz;
    RETURN;
  END IF;

  failure_time := pg_catalog.clock_timestamp();

  IF p_failure_category = 'permanent'
     OR current_attempt >= configured_max_attempts THEN
    UPDATE __JOB_SCHEMA__.job AS queued
    SET status = 'DEAD',
        lease_token = NULL,
        lease_expires_at = NULL,
        last_failure_category = p_failure_category,
        completed_at = failure_time,
        updated_at = failure_time
    WHERE queued.id = p_job_id;

    RETURN QUERY SELECT true, 'DEAD'::text, NULL::timestamptz;
    RETURN;
  END IF;

  nominal_backoff_milliseconds := LEAST(
    100 * pg_catalog.power(2::numeric, current_attempt - 1)::integer,
    4000
  );
  bounded_backoff_milliseconds := LEAST(
    5000,
    GREATEST(
      1,
      pg_catalog.floor(
        nominal_backoff_milliseconds * (0.75 + pg_catalog.random() * 0.5)
      )::integer
    )
  );

  UPDATE __JOB_SCHEMA__.job AS queued
  SET status = 'PENDING',
      available_at = failure_time
        + pg_catalog.make_interval(
          secs => bounded_backoff_milliseconds::double precision / 1000
        ),
      lease_token = NULL,
      lease_expires_at = NULL,
      last_failure_category = p_failure_category,
      updated_at = failure_time
  WHERE queued.id = p_job_id;

  RETURN QUERY
  SELECT true, queued.status, queued.available_at
  FROM __JOB_SCHEMA__.job AS queued
  WHERE queued.id = p_job_id;
END;
$fail$;

REVOKE ALL ON FUNCTION __JOB_SCHEMA__.enqueue_canary(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION __JOB_SCHEMA__.claim_canary(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION __JOB_SCHEMA__.renew_canary(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION __JOB_SCHEMA__.release_canary(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION __JOB_SCHEMA__.complete_canary(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION __JOB_SCHEMA__.fail_canary(uuid, uuid, text) FROM PUBLIC;

GRANT CONNECT ON DATABASE __DATABASE__ TO __API_ROLE__, __WORKER_ROLE__;

GRANT USAGE ON SCHEMA __APP_SCHEMA__, __JOB_SCHEMA__ TO __API_ROLE__;
GRANT INSERT ON __APP_SCHEMA__.domain_intent TO __API_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.enqueue_canary(uuid, uuid, text) TO __API_ROLE__;

GRANT USAGE ON SCHEMA __APP_SCHEMA__, __JOB_SCHEMA__ TO __WORKER_ROLE__;
GRANT SELECT ON __APP_SCHEMA__.domain_intent TO __WORKER_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.claim_canary(uuid) TO __WORKER_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.renew_canary(uuid, uuid) TO __WORKER_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.release_canary(uuid, uuid) TO __WORKER_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.complete_canary(uuid, uuid) TO __WORKER_ROLE__;
GRANT EXECUTE ON FUNCTION __JOB_SCHEMA__.fail_canary(uuid, uuid, text) TO __WORKER_ROLE__;
