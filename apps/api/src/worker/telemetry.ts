import type { Logger } from "pino";

export type WorkerTelemetryEvent =
  | "worker.starting"
  | "worker.ready"
  | "worker.heartbeat"
  | "worker.degraded"
  | "worker.draining"
  | "worker.stopped"
  | "worker.shutdown-forced"
  | "job.claimed"
  | "job.succeeded"
  | "job.retry-scheduled"
  | "job.dead"
  | "job.lease-lost"
  | "job.pre-handler-released";

export interface WorkerTelemetryFields {
  activeJobs?: number;
  availableJobs?: number;
  attemptCount?: number;
  canceledJobs?: number;
  correlationId?: string;
  deadJobs?: number;
  delayMs?: number;
  discardedJobs?: number;
  durationMs?: number;
  failureCategory?: string;
  jobId?: string;
  jobKind?: string;
  oldestAvailableAgeSeconds?: number;
  reason?: string;
  requestId?: string;
  retryingJobs?: number;
  runningJobs?: number;
  scheduledJobs?: number;
  signal?: string;
  status?: string;
  succeededJobs?: number;
}

export interface WorkerTelemetry {
  info(event: WorkerTelemetryEvent, fields?: WorkerTelemetryFields): void;
  warn(event: WorkerTelemetryEvent, fields?: WorkerTelemetryFields): void;
  error(event: WorkerTelemetryEvent, fields?: WorkerTelemetryFields): void;
}

export function createWorkerTelemetry(logger: Logger): WorkerTelemetry {
  const bindings = (
    event: WorkerTelemetryEvent,
    fields: WorkerTelemetryFields
  ) => ({ event, ...fields });

  return {
    info(event, fields = {}) {
      logger.info(bindings(event, fields), event);
    },
    warn(event, fields = {}) {
      logger.warn(bindings(event, fields), event);
    },
    error(event, fields = {}) {
      logger.error(bindings(event, fields), event);
    },
  };
}
