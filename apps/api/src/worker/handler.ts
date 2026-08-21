import { ZodError } from "zod";
import { parsePhase2CanaryPayload } from "./payloads.js";
import type {
  ClaimedJob,
  WorkerFailureCategory,
  WorkerRepository,
} from "./repository.js";

export class JobExecutionError extends Error {
  constructor(
    readonly category: WorkerFailureCategory,
    message: string
  ) {
    super(message);
  }
}

export class LeaseRejectedError extends Error {
  constructor() {
    super("The current worker lease no longer owns this job");
  }
}

export interface JobHandlerContext {
  leaseToken: string;
  signal: AbortSignal;
}

export type WorkerJobHandler = (
  job: ClaimedJob,
  context: JobHandlerContext
) => Promise<void>;

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new JobExecutionError("TIMEOUT", "Worker handler was aborted");
  }
}

export function createPhase2CanaryHandler(
  repository: WorkerRepository
): WorkerJobHandler {
  return async (job, { leaseToken, signal }) => {
    try {
      parsePhase2CanaryPayload(job.kind, job.payloadVersion, job.payload);
    } catch (error) {
      if (error instanceof ZodError || error instanceof Error) {
        throw new JobExecutionError(
          "PAYLOAD_INVALID",
          "Worker rejected an invalid canary payload"
        );
      }
      throw error;
    }

    assertNotAborted(signal);
    let transition;
    try {
      transition = await repository.recordCanaryEffect(job.id, leaseToken);
    } catch {
      throw new JobExecutionError(
        "DATABASE",
        "Worker could not record the canary effect"
      );
    }
    if (!transition.accepted) throw new LeaseRejectedError();
  };
}

export function classifyJobFailure(error: unknown): WorkerFailureCategory {
  if (error instanceof JobExecutionError) return error.category;
  return "TRANSIENT";
}
