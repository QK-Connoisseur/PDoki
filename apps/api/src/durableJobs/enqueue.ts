import { createHash, randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@pumdoki/database";

export interface EnqueuePhase2CanaryInput {
  jobId: string;
  canaryIntentId: string;
  deduplicationKeyHash: string;
  requestId: string;
  correlationId?: string | null;
}

interface EnqueuedJobRow {
  jobId: string;
}

export interface SubmitPhase2CanaryInput {
  idempotencyKey: string;
  requestDigest: string;
  requestId: string;
  correlationId?: string | null;
}

export interface SubmittedPhase2Canary {
  canaryIntentId: string;
  jobId: string;
  replayed: boolean;
}

export class Phase2CanaryIdempotencyConflictError extends Error {
  constructor() {
    super("The Phase 2 canary idempotency key was already used differently");
    this.name = "Phase2CanaryIdempotencyConflictError";
  }
}

const PHASE2_CANARY_IDEMPOTENCY_SCOPE = "pumdoki:phase2-canary:v1\0";

export function hashPhase2CanaryIdempotencyKey(key: string): string {
  return createHash("sha256")
    .update(PHASE2_CANARY_IDEMPOTENCY_SCOPE)
    .update(key)
    .digest("hex");
}

function assertSubmitInput(input: SubmitPhase2CanaryInput): {
  idempotencyKeyHash: string;
  requestDigest: string;
} {
  if (
    input.idempotencyKey.length < 1 ||
    input.idempotencyKey.length > 200 ||
    input.requestId.length < 1 ||
    input.requestId.length > 64 ||
    (input.correlationId !== undefined &&
      input.correlationId !== null &&
      (input.correlationId.length < 1 || input.correlationId.length > 64))
  ) {
    throw new TypeError("Invalid bounded Phase 2 canary submission input");
  }
  const requestDigest = input.requestDigest.toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(requestDigest)) {
    throw new TypeError("Phase 2 canary requestDigest must be SHA-256 hex");
  }
  return {
    idempotencyKeyHash: hashPhase2CanaryIdempotencyKey(input.idempotencyKey),
    requestDigest,
  };
}

/**
 * Enqueues the fixed, non-secret Phase 2 canary inside the caller's existing
 * Prisma transaction. The database routine owns the allowlisted kind, payload,
 * retry policy, and backlog limits; callers cannot provide arbitrary job data.
 */
export async function enqueuePhase2Canary(
  tx: Prisma.TransactionClient,
  input: EnqueuePhase2CanaryInput
): Promise<string> {
  const [enqueued] = await tx.$queryRaw<EnqueuedJobRow[]>`
    SELECT job_queue.enqueue_phase2_canary(
      ${input.jobId}::uuid,
      ${input.canaryIntentId}::uuid,
      ${input.deduplicationKeyHash}::text,
      ${input.requestId}::text,
      ${input.correlationId ?? null}::text
    ) AS "jobId"
  `;

  if (!enqueued) {
    throw new Error("The durable canary enqueue routine returned no job");
  }
  return enqueued.jobId;
}

/**
 * Creates the canary intent and its required durable job atomically. Repeating
 * the same idempotency key and request digest returns the original stable IDs;
 * changing the digest creates no work and reports a conflict.
 */
export async function submitPhase2Canary(
  db: PrismaClient,
  input: SubmitPhase2CanaryInput
): Promise<SubmittedPhase2Canary> {
  const { idempotencyKeyHash, requestDigest } = assertSubmitInput(input);

  return db.$transaction(async (tx) => {
    // A transaction-scoped keyed lock turns a same-key race into one ordered
    // decision. Hash collisions only serialize unrelated submissions.
    await tx.$executeRaw`
      SELECT pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(${idempotencyKeyHash}::text, 2052)
      )
    `;

    const existing = await tx.workerCanaryIntent.findUnique({
      where: { idempotencyKeyHash },
      select: {
        id: true,
        requestDigest: true,
        jobs: {
          where: {
            job: { originalJobId: null, replaySequence: 0 },
          },
          select: { jobId: true },
          take: 2,
        },
      },
    });
    if (existing) {
      if (existing.requestDigest !== requestDigest) {
        throw new Phase2CanaryIdempotencyConflictError();
      }
      if (existing.jobs.length !== 1) {
        throw new Error("Durable canary idempotency record is inconsistent");
      }
      return {
        canaryIntentId: existing.id,
        jobId: existing.jobs[0]!.jobId,
        replayed: true,
      };
    }

    const canaryIntentId = randomUUID();
    const jobId = randomUUID();
    await tx.workerCanaryIntent.create({
      data: {
        id: canaryIntentId,
        idempotencyKeyHash,
        requestDigest,
        requestId: input.requestId,
      },
    });
    await enqueuePhase2Canary(tx, {
      jobId,
      canaryIntentId,
      deduplicationKeyHash: idempotencyKeyHash,
      requestId: input.requestId,
      correlationId: input.correlationId,
    });

    return { canaryIntentId, jobId, replayed: false };
  });
}
