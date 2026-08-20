import type { Pool, QueryResultRow } from "pg";

export type WorkerFailureCategory =
  | "TRANSIENT"
  | "TIMEOUT"
  | "DATABASE"
  | "PAYLOAD_INVALID"
  | "HANDLER_PERMANENT";

export type WorkerJobStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "DEAD"
  | "CANCELED"
  | "DISCARDED";

export interface ClaimedJob {
  id: string;
  kind: string;
  payloadVersion: number;
  payload: unknown;
  attemptCount: number;
  leaseExpiresAt: Date;
  requestId: string | null;
  correlationId: string | null;
}

export interface FailureTransition {
  accepted: boolean;
  status: WorkerJobStatus | null;
  retryAt: Date | null;
}

export interface CanaryEffectTransition {
  accepted: boolean;
  effectCreated: boolean;
}

export interface WorkerQueueStats {
  availableJobs: number;
  scheduledJobs: number;
  runningJobs: number;
  succeededJobs: number;
  deadJobs: number;
  canceledJobs: number;
  discardedJobs: number;
  retryingJobs: number;
  oldestAvailableAgeSeconds: number;
}

export interface WorkerRepository {
  probe(): Promise<boolean>;
  claimOne(leaseToken: string): Promise<ClaimedJob | null>;
  renew(jobId: string, leaseToken: string): Promise<boolean>;
  releaseUnstarted(jobId: string, leaseToken: string): Promise<boolean>;
  complete(jobId: string, leaseToken: string): Promise<boolean>;
  fail(
    jobId: string,
    leaseToken: string,
    category: WorkerFailureCategory
  ): Promise<FailureTransition>;
  recordCanaryEffect(
    jobId: string,
    leaseToken: string
  ): Promise<CanaryEffectTransition>;
  getQueueStats(): Promise<WorkerQueueStats>;
  close(): Promise<void>;
}

interface ClaimRow extends QueryResultRow {
  job_id: string;
  job_kind: string;
  payload_version: number;
  payload: unknown;
  attempt_count: number;
  lease_expires_at: Date;
  request_id: string | null;
  correlation_id: string | null;
}

interface BooleanRow extends QueryResultRow {
  accepted: boolean;
}

interface FailureRow extends QueryResultRow {
  accepted: boolean;
  job_status: string | null;
  retry_at: Date | null;
}

interface CanaryEffectRow extends QueryResultRow {
  accepted: boolean;
  effect_created: boolean;
}

interface QueueStatsRow extends QueryResultRow {
  available_jobs: string;
  scheduled_jobs: string;
  running_jobs: string;
  succeeded_jobs: string;
  dead_jobs: string;
  canceled_jobs: string;
  discarded_jobs: string;
  retrying_jobs: string;
  oldest_available_age_seconds: number;
}

interface ProbeRow extends QueryResultRow {
  ready: boolean;
  transaction_isolation: string;
}

const workerJobStatuses = new Set<WorkerJobStatus>([
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "DEAD",
  "CANCELED",
  "DISCARDED",
]);

function parseJobStatus(value: string | null): WorkerJobStatus | null {
  if (value === null) return null;
  if (!workerJobStatuses.has(value as WorkerJobStatus)) {
    throw new Error("Worker transition returned an unknown job status");
  }
  return value as WorkerJobStatus;
}

export function createPgWorkerRepository(pool: Pool): WorkerRepository {
  return {
    async probe() {
      const result = await pool.query<ProbeRow>(`
        SELECT
          pg_catalog.current_setting(
            'transaction_isolation'
          ) AS transaction_isolation,
          pg_catalog.has_schema_privilege(
            current_user,
            'job_queue',
            'USAGE'
          )
          AND pg_catalog.bool_and(
            routine.oid IS NOT NULL
            AND pg_catalog.has_function_privilege(
              current_user,
              routine.oid,
              'EXECUTE'
            )
          ) AS ready
        FROM (
          VALUES
            (pg_catalog.to_regprocedure('job_queue.claim_one(uuid)')),
            (pg_catalog.to_regprocedure('job_queue.renew_job(uuid,uuid)')),
            (pg_catalog.to_regprocedure('job_queue.release_unstarted_job(uuid,uuid)')),
            (pg_catalog.to_regprocedure('job_queue.complete_job(uuid,uuid)')),
            (pg_catalog.to_regprocedure('job_queue.fail_job(uuid,uuid,text)')),
            (pg_catalog.to_regprocedure('job_queue.record_phase2_canary_effect(uuid,uuid)')),
            (pg_catalog.to_regprocedure('job_queue.queue_stats()'))
        ) AS routine(oid)
      `);
      const row = result.rows[0];
      return (
        row?.ready === true && row.transaction_isolation === "read committed"
      );
    },

    async claimOne(leaseToken) {
      const result = await pool.query<ClaimRow>(
        "SELECT * FROM job_queue.claim_one($1::uuid)",
        [leaseToken]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        id: row.job_id,
        kind: row.job_kind,
        payloadVersion: row.payload_version,
        payload: row.payload,
        attemptCount: row.attempt_count,
        leaseExpiresAt: row.lease_expires_at,
        requestId: row.request_id,
        correlationId: row.correlation_id,
      };
    },

    async renew(jobId, leaseToken) {
      const result = await pool.query<BooleanRow>(
        "/* phase2_worker_renew_job */ SELECT job_queue.renew_job($1::uuid, $2::uuid) AS accepted",
        [jobId, leaseToken]
      );
      return result.rows[0]?.accepted === true;
    },

    async releaseUnstarted(jobId, leaseToken) {
      const result = await pool.query<BooleanRow>(
        "SELECT job_queue.release_unstarted_job($1::uuid, $2::uuid) AS accepted",
        [jobId, leaseToken]
      );
      return result.rows[0]?.accepted === true;
    },

    async complete(jobId, leaseToken) {
      const result = await pool.query<BooleanRow>(
        "SELECT job_queue.complete_job($1::uuid, $2::uuid) AS accepted",
        [jobId, leaseToken]
      );
      return result.rows[0]?.accepted === true;
    },

    async fail(jobId, leaseToken, category) {
      const result = await pool.query<FailureRow>(
        "SELECT * FROM job_queue.fail_job($1::uuid, $2::uuid, $3::text)",
        [jobId, leaseToken, category]
      );
      const row = result.rows[0];
      if (!row) throw new Error("Worker failure transition returned no result");
      return {
        accepted: row.accepted,
        status: parseJobStatus(row.job_status),
        retryAt: row.retry_at,
      };
    },

    async recordCanaryEffect(jobId, leaseToken) {
      const result = await pool.query<CanaryEffectRow>(
        "SELECT * FROM job_queue.record_phase2_canary_effect($1::uuid, $2::uuid)",
        [jobId, leaseToken]
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error("Canary effect transition returned no result");
      }
      return {
        accepted: row.accepted,
        effectCreated: row.effect_created,
      };
    },

    async getQueueStats() {
      const result = await pool.query<QueueStatsRow>(
        "SELECT * FROM job_queue.queue_stats()"
      );
      const row = result.rows[0];
      if (!row) throw new Error("Worker queue telemetry returned no result");
      return {
        availableJobs: parseSafeCount(row.available_jobs),
        scheduledJobs: parseSafeCount(row.scheduled_jobs),
        runningJobs: parseSafeCount(row.running_jobs),
        succeededJobs: parseSafeCount(row.succeeded_jobs),
        deadJobs: parseSafeCount(row.dead_jobs),
        canceledJobs: parseSafeCount(row.canceled_jobs),
        discardedJobs: parseSafeCount(row.discarded_jobs),
        retryingJobs: parseSafeCount(row.retrying_jobs),
        oldestAvailableAgeSeconds: parseSafeDuration(
          row.oldest_available_age_seconds
        ),
      };
    },

    close() {
      return pool.end();
    },
  };
}

function parseSafeCount(value: string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error("Worker queue telemetry returned an invalid count");
  }
  return parsed;
}

function parseSafeDuration(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Worker queue telemetry returned an invalid duration");
  }
  return value;
}
