import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import type { PrismaClient } from "@pumdoki/database";
import {
  Phase2CanaryIdempotencyConflictError,
  enqueuePhase2Canary,
  hashPhase2CanaryIdempotencyKey,
  submitPhase2Canary,
} from "./enqueue.js";
import {
  createPgWorkerRepository,
  type ClaimedJob,
  type WorkerRepository,
} from "../worker/repository.js";
import { loadTestDatabase } from "../test/database.js";

const suitePrefix = `phase2-worker-${randomUUID().slice(0, 12)}`;
const requestId = `${suitePrefix}-request`;
const digestA = "a".repeat(64);
const digestB = "b".repeat(64);

let db: PrismaClient;
let pool: Pool;
let worker: WorkerRepository;
let keySequence = 0;

function key(label: string): string {
  keySequence += 1;
  return `${suitePrefix}-${label}-${keySequence}`;
}

async function cleanupOwnRows(): Promise<void> {
  if (!db) return;
  const jobs = await db.durableJob.findMany({
    where: { requestId },
    select: { id: true },
  });
  const intents = await db.workerCanaryIntent.findMany({
    where: { requestId },
    select: { id: true },
  });
  const jobIds = jobs.map(({ id }) => id);
  const intentIds = intents.map(({ id }) => id);

  if (jobIds.length || intentIds.length) {
    await db.workerCanaryEffect.deleteMany({
      where: {
        OR: [
          { sourceJobId: { in: jobIds } },
          { canaryIntentId: { in: intentIds } },
        ],
      },
    });
    await db.workerCanaryJob.deleteMany({
      where: {
        OR: [{ jobId: { in: jobIds } }, { canaryIntentId: { in: intentIds } }],
      },
    });
    await db.durableJob.deleteMany({ where: { id: { in: jobIds } } });
    await db.workerCanaryIntent.deleteMany({
      where: { id: { in: intentIds } },
    });
  }
}

async function submit(label: string) {
  return submitPhase2Canary(db, {
    idempotencyKey: key(label),
    requestDigest: digestA,
    requestId,
    correlationId: `${suitePrefix}-correlation`.slice(0, 64),
  });
}

async function claimExpected(
  jobId: string,
  leaseToken: string
): Promise<ClaimedJob> {
  const claimed = await worker.claimOne(leaseToken);
  expect(claimed?.id).toBe(jobId);
  return claimed!;
}

async function makeAvailable(jobId: string): Promise<void> {
  await db.durableJob.update({
    where: { id: jobId },
    data: { availableAt: new Date(Date.now() - 1_000) },
  });
}

async function expireLease(jobId: string): Promise<void> {
  await db.durableJob.update({
    where: { id: jobId },
    data: { leaseExpiresAt: new Date(Date.now() - 1_000) },
  });
}

async function waitForBlockedRenew(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await pool.query<{ blocked: boolean }>(`
      SELECT pg_catalog.bool_or(
        activity.wait_event_type = 'Lock'
        AND activity.query LIKE '/* phase2_worker_renew_job */%'
      ) AS blocked
      FROM pg_catalog.pg_stat_activity AS activity
      WHERE activity.application_name = 'phase2-worker-foundation-test'
    `);
    if (result.rows[0]?.blocked === true) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("The renewal call did not block on the held job row");
}

async function waitForBlockedFinalClaim(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await pool.query<{ blocked: boolean }>(`
      SELECT pg_catalog.bool_or(
        activity.wait_event_type = 'Lock'
        AND activity.query LIKE '/* phase2_worker_final_claim */%'
      ) AS blocked
      FROM pg_catalog.pg_stat_activity AS activity
      WHERE activity.application_name = 'phase2-worker-final-claim-test'
    `);
    if (result.rows[0]?.blocked === true) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(
    "The final-attempt claim did not block on the held effect-table lock"
  );
}

beforeAll(async () => {
  db = await loadTestDatabase();
  await cleanupOwnRows();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL was not loaded for durable worker tests");
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    application_name: "phase2-worker-foundation-test",
    max: 4,
  });
  worker = createPgWorkerRepository(pool);
  await expect(worker.probe()).resolves.toBe(true);
});

beforeEach(async () => {
  const foreignActiveJobs = await db.durableJob.count({
    where: {
      status: { in: ["PENDING", "RUNNING"] },
      requestId: { not: requestId },
    },
  });
  if (foreignActiveJobs > 0) {
    throw new Error(
      "Durable worker integration tests require a disposable database with no foreign active jobs"
    );
  }
});

afterEach(cleanupOwnRows);

afterAll(async () => {
  await cleanupOwnRows();
  if (worker) await worker.close();
});

describe.sequential("durable Phase 2 worker foundation", () => {
  it("atomically enqueues, replays one key/digest, conflicts on change, and rolls back failures", async () => {
    const idempotencyKey = key("concurrent-idempotency");
    const idempotencyKeyHash = hashPhase2CanaryIdempotencyKey(idempotencyKey);
    const input = {
      idempotencyKey,
      requestDigest: digestA,
      requestId,
      correlationId: null,
    };
    const submissions = await Promise.all(
      Array.from({ length: 4 }, () => submitPhase2Canary(db, input))
    );

    expect(
      new Set(submissions.map(({ canaryIntentId }) => canaryIntentId)).size
    ).toBe(1);
    expect(new Set(submissions.map(({ jobId }) => jobId)).size).toBe(1);
    expect(submissions.filter(({ replayed }) => !replayed)).toHaveLength(1);
    expect(
      await db.workerCanaryIntent.count({ where: { idempotencyKeyHash } })
    ).toBe(1);
    expect(
      await db.durableJob.count({
        where: {
          kind: "PHASE2_CANARY_V1",
          deduplicationKeyHash: idempotencyKeyHash,
        },
      })
    ).toBe(1);

    await expect(
      submitPhase2Canary(db, { ...input, requestDigest: digestB })
    ).rejects.toBeInstanceOf(Phase2CanaryIdempotencyConflictError);
    expect(
      await db.workerCanaryIntent.count({ where: { idempotencyKeyHash } })
    ).toBe(1);

    const rejectedKey = key("enqueue-rejected");
    const rejectedIntentId = randomUUID();
    await expect(
      db.$transaction(async (tx) => {
        await tx.workerCanaryIntent.create({
          data: {
            id: rejectedIntentId,
            idempotencyKeyHash: hashPhase2CanaryIdempotencyKey(rejectedKey),
            requestDigest: digestA,
            requestId,
          },
        });
        await enqueuePhase2Canary(tx, {
          jobId: randomUUID(),
          canaryIntentId: rejectedIntentId,
          deduplicationKeyHash: hashPhase2CanaryIdempotencyKey(rejectedKey),
          requestId,
          correlationId: "x".repeat(65),
        });
      })
    ).rejects.toBeTruthy();
    expect(
      await db.workerCanaryIntent.findUnique({
        where: { id: rejectedIntentId },
      })
    ).toBeNull();

    const rolledBackKey = key("caller-rollback");
    const rolledBackIntentId = randomUUID();
    const rolledBackJobId = randomUUID();
    await expect(
      db.$transaction(async (tx) => {
        await tx.workerCanaryIntent.create({
          data: {
            id: rolledBackIntentId,
            idempotencyKeyHash: hashPhase2CanaryIdempotencyKey(rolledBackKey),
            requestDigest: digestA,
            requestId,
          },
        });
        await enqueuePhase2Canary(tx, {
          jobId: rolledBackJobId,
          canaryIntentId: rolledBackIntentId,
          deduplicationKeyHash: hashPhase2CanaryIdempotencyKey(rolledBackKey),
          requestId,
        });
        throw new Error("force transaction rollback");
      })
    ).rejects.toThrow("force transaction rollback");
    expect(
      await db.workerCanaryIntent.findUnique({
        where: { id: rolledBackIntentId },
      })
    ).toBeNull();
    expect(
      await db.durableJob.findUnique({ where: { id: rolledBackJobId } })
    ).toBeNull();
  });

  it("serializes concurrent submissions at the per-kind active backlog ceiling", async () => {
    for (let index = 0; index < 99; index += 1) {
      await submit(`backlog-baseline-${index}`);
    }

    const candidates = ["backlog-racer-a", "backlog-racer-b"].map((label) => {
      const idempotencyKey = key(label);
      return {
        idempotencyKeyHash: hashPhase2CanaryIdempotencyKey(idempotencyKey),
        input: {
          idempotencyKey,
          requestDigest: digestA,
          requestId,
          correlationId: null,
        },
      };
    });
    const outcomes = await Promise.allSettled(
      candidates.map(({ input }) => submitPhase2Canary(db, input))
    );
    const committedIndexes = outcomes.flatMap((outcome, index) =>
      outcome.status === "fulfilled" ? [index] : []
    );
    const rejectedIndexes = outcomes.flatMap((outcome, index) =>
      outcome.status === "rejected" ? [index] : []
    );

    expect(committedIndexes).toHaveLength(1);
    expect(rejectedIndexes).toHaveLength(1);
    const rejectedIndex = rejectedIndexes[0]!;
    const rejected = outcomes[rejectedIndex]!;
    expect(rejected.status).toBe("rejected");
    if (rejected.status !== "rejected") {
      throw new Error("Expected one backlog submission to be rejected");
    }
    expect(rejected.reason).toBeInstanceOf(Error);
    expect((rejected.reason as Error).message).toContain(
      "durable canary backlog is at capacity"
    );

    expect(
      await db.durableJob.count({
        where: {
          kind: "PHASE2_CANARY_V1",
          status: { in: ["PENDING", "RUNNING"] },
          requestId,
        },
      })
    ).toBe(100);
    expect(await db.workerCanaryIntent.count({ where: { requestId } })).toBe(
      100
    );
    expect(
      await db.workerCanaryJob.count({
        where: { canaryIntent: { requestId } },
      })
    ).toBe(100);

    const rejectedCandidate = candidates[rejectedIndex]!;
    expect(
      await db.workerCanaryIntent.findUnique({
        where: {
          idempotencyKeyHash: rejectedCandidate.idempotencyKeyHash,
        },
      })
    ).toBeNull();
    expect(
      await db.durableJob.findUnique({
        where: {
          kind_deduplicationKeyHash: {
            kind: "PHASE2_CANARY_V1",
            deduplicationKeyHash: rejectedCandidate.idempotencyKeyHash,
          },
        },
      })
    ).toBeNull();
  });

  it("enforces the strict bounded payload and revokes PUBLIC routine execution", async () => {
    const invalidJobId = randomUUID();
    await expect(
      db.durableJob.create({
        data: {
          id: invalidJobId,
          kind: "PHASE2_CANARY_V1",
          payloadVersion: 1,
          payload: {
            canaryIntentId: randomUUID(),
            verificationToken: "must-not-enter-the-job-store",
          },
          deduplicationKeyHash: hashPhase2CanaryIdempotencyKey(
            key("invalid-payload")
          ),
          maxAttempts: 3,
          requestId,
        },
      })
    ).rejects.toBeTruthy();
    expect(
      await db.durableJob.findUnique({ where: { id: invalidJobId } })
    ).toBeNull();

    const routines = await db.$queryRaw<
      Array<{
        routineName: string;
        securityDefiner: boolean;
        safeSearchPath: boolean;
        publicExecute: boolean;
      }>
    >`
      SELECT
        proc.proname AS "routineName",
        proc.prosecdef AS "securityDefiner",
        'search_path=pg_catalog' = ANY(proc.proconfig) AS "safeSearchPath",
        EXISTS (
          SELECT 1
          FROM pg_catalog.aclexplode(
            COALESCE(
              proc.proacl,
              pg_catalog.acldefault('f', proc.proowner)
            )
          ) AS privilege
          WHERE privilege.grantee = 0
            AND privilege.privilege_type = 'EXECUTE'
        ) AS "publicExecute"
      FROM pg_catalog.pg_proc AS proc
      JOIN pg_catalog.pg_namespace AS namespace
        ON namespace.oid = proc.pronamespace
      WHERE namespace.nspname = 'job_queue'
      ORDER BY proc.proname
    `;
    expect(routines.map(({ routineName }) => routineName)).toEqual([
      "claim_one",
      "complete_job",
      "enqueue_phase2_canary",
      "fail_job",
      "queue_stats",
      "record_phase2_canary_effect",
      "release_unstarted_job",
      "renew_job",
    ]);
    expect(routines.every(({ securityDefiner }) => securityDefiner)).toBe(true);
    expect(routines.every(({ safeSearchPath }) => safeSearchPath)).toBe(true);
    expect(routines.some(({ publicExecute }) => publicExecute)).toBe(false);
  });

  it("claims independently, fences every token mutation, and keeps pre-handler release attempt-neutral", async () => {
    const released = await submit("release-neutral");
    const firstToken = randomUUID();
    const firstClaim = await claimExpected(released.jobId, firstToken);
    expect(firstClaim.attemptCount).toBe(1);

    const foreignToken = randomUUID();
    await expect(worker.renew(released.jobId, foreignToken)).resolves.toBe(
      false
    );
    await expect(
      worker.releaseUnstarted(released.jobId, foreignToken)
    ).resolves.toBe(false);
    await expect(worker.complete(released.jobId, foreignToken)).resolves.toBe(
      false
    );
    await expect(
      worker.fail(released.jobId, foreignToken, "TRANSIENT")
    ).resolves.toMatchObject({ accepted: false, status: null });
    await expect(
      worker.recordCanaryEffect(released.jobId, foreignToken)
    ).resolves.toEqual({ accepted: false, effectCreated: false });

    await expect(
      worker.releaseUnstarted(released.jobId, firstToken)
    ).resolves.toBe(true);
    expect(
      await db.durableJob.findUnique({
        where: { id: released.jobId },
        select: { status: true, attemptCount: true },
      })
    ).toEqual({ status: "PENDING", attemptCount: 0 });

    const currentToken = randomUUID();
    const reclaimed = await claimExpected(released.jobId, currentToken);
    expect(reclaimed.attemptCount).toBe(1);
    await expect(worker.complete(released.jobId, firstToken)).resolves.toBe(
      false
    );
    await expect(
      worker.recordCanaryEffect(released.jobId, currentToken)
    ).resolves.toEqual({ accepted: true, effectCreated: true });
    await expect(worker.complete(released.jobId, currentToken)).resolves.toBe(
      true
    );

    const first = await submit("independent-one");
    const second = await submit("independent-two");
    const tokens = [randomUUID(), randomUUID()];
    const claims = await Promise.all(
      tokens.map((token) => worker.claimOne(token))
    );
    expect(new Set(claims.map((claim) => claim?.id))).toEqual(
      new Set([first.jobId, second.jobId])
    );
    for (const [index, claim] of claims.entries()) {
      expect(claim).not.toBeNull();
      await expect(
        worker.recordCanaryEffect(claim!.id, tokens[index]!)
      ).resolves.toMatchObject({ accepted: true });
      await expect(worker.complete(claim!.id, tokens[index]!)).resolves.toBe(
        true
      );
    }
  });

  it("rejects a renewal whose row-lock wait crosses lease expiry", async () => {
    const submitted = await submit("lock-wait-expiry");
    const leaseToken = randomUUID();
    await claimExpected(submitted.jobId, leaseToken);

    const blocker = await pool.connect();
    let renew: Promise<boolean> | undefined;
    try {
      await blocker.query("BEGIN");
      await blocker.query(
        `UPDATE public."DurableJob"
         SET "leaseExpiresAt" = pg_catalog.clock_timestamp()
           + INTERVAL '250 milliseconds'
         WHERE "id" = $1::uuid`,
        [submitted.jobId]
      );

      renew = worker.renew(submitted.jobId, leaseToken);
      await waitForBlockedRenew();
      await blocker.query("SELECT pg_catalog.pg_sleep(0.35)");
      await blocker.query("COMMIT");

      await expect(renew).resolves.toBe(false);
    } finally {
      await blocker.query("ROLLBACK").catch(() => undefined);
      blocker.release();
      await renew?.catch(() => undefined);
    }
  });

  it("uses bounded retry and isolates permanent and exhausted DEAD jobs", async () => {
    const retrying = await submit("retry-exhaustion");
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const token = randomUUID();
      const claim = await claimExpected(retrying.jobId, token);
      expect(claim.attemptCount).toBe(attempt);
      const transition = await worker.fail(retrying.jobId, token, "TRANSIENT");

      if (attempt < 3) {
        expect(transition).toMatchObject({
          accepted: true,
          status: "PENDING",
        });
        const state = await db.durableJob.findUniqueOrThrow({
          where: { id: retrying.jobId },
          select: { availableAt: true, updatedAt: true },
        });
        const retryDelayMs =
          state.availableAt.getTime() - state.updatedAt.getTime();
        const nominalDelayMs = 100 * 2 ** (attempt - 1);
        expect(retryDelayMs).toBeGreaterThanOrEqual(
          Math.floor(nominalDelayMs * 0.75)
        );
        expect(retryDelayMs).toBeLessThanOrEqual(
          Math.floor(nominalDelayMs * 1.25)
        );
        await makeAvailable(retrying.jobId);
      } else {
        expect(transition).toMatchObject({ accepted: true, status: "DEAD" });
      }
    }
    expect(
      await db.durableJob.findUniqueOrThrow({
        where: { id: retrying.jobId },
        select: {
          status: true,
          attemptCount: true,
          lastFailureCategory: true,
          terminalAt: true,
        },
      })
    ).toMatchObject({
      status: "DEAD",
      attemptCount: 3,
      lastFailureCategory: "TRANSIENT",
      terminalAt: expect.any(Date),
    });

    const permanent = await submit("permanent-dead");
    const permanentToken = randomUUID();
    await claimExpected(permanent.jobId, permanentToken);
    await expect(
      worker.fail(permanent.jobId, permanentToken, "PAYLOAD_INVALID")
    ).resolves.toMatchObject({ accepted: true, status: "DEAD" });

    const healthy = await submit("terminal-isolation");
    const healthyToken = randomUUID();
    await claimExpected(healthy.jobId, healthyToken);
    await worker.recordCanaryEffect(healthy.jobId, healthyToken);
    await expect(worker.complete(healthy.jobId, healthyToken)).resolves.toBe(
      true
    );

    const expiredFinal = await submit("expired-final-dead");
    for (let attempt = 1; attempt < 3; attempt += 1) {
      const token = randomUUID();
      await claimExpected(expiredFinal.jobId, token);
      await worker.fail(expiredFinal.jobId, token, "TRANSIENT");
      await makeAvailable(expiredFinal.jobId);
    }
    const finalToken = randomUUID();
    await claimExpected(expiredFinal.jobId, finalToken);
    await expireLease(expiredFinal.jobId);
    await expect(worker.claimOne(randomUUID())).resolves.toBeNull();
    expect(
      await db.durableJob.findUniqueOrThrow({
        where: { id: expiredFinal.jobId },
        select: {
          status: true,
          lastFailureCategory: true,
          terminalAt: true,
        },
      })
    ).toEqual({
      status: "DEAD",
      lastFailureCategory: "LEASE_EXPIRED_ATTEMPT_LIMIT",
      terminalAt: expect.any(Date),
    });
  });

  it("never terminalizes an effect-bearing final expiry outside the bounded reconciliation batch", async () => {
    const effectBearingJobs = await Promise.all(
      Array.from({ length: 17 }, (_value, index) =>
        submit(`effect-batch-${index}`)
      )
    );
    const expiredAt = new Date(Date.now() - 5_000);

    for (const submitted of effectBearingJobs) {
      await db.durableJob.update({
        where: { id: submitted.jobId },
        data: {
          status: "RUNNING",
          attemptCount: 3,
          leaseToken: randomUUID(),
          leaseExpiresAt: expiredAt,
        },
      });
      await db.workerCanaryEffect.create({
        data: {
          canaryIntentId: submitted.canaryIntentId,
          sourceJobId: submitted.jobId,
        },
      });
    }

    await expect(worker.claimOne(randomUUID())).resolves.toBeNull();
    expect(
      await db.durableJob.count({
        where: {
          id: { in: effectBearingJobs.map(({ jobId }) => jobId) },
          status: "DEAD",
        },
      })
    ).toBe(0);
    expect(
      await db.durableJob.count({
        where: {
          id: { in: effectBearingJobs.map(({ jobId }) => jobId) },
          status: "SUCCEEDED",
        },
      })
    ).toBe(16);

    await expect(worker.claimOne(randomUUID())).resolves.toBeNull();
    expect(
      await db.durableJob.count({
        where: {
          id: { in: effectBearingJobs.map(({ jobId }) => jobId) },
          status: "SUCCEEDED",
        },
      })
    ).toBe(17);
    expect(
      await db.workerCanaryEffect.count({
        where: {
          canaryIntentId: {
            in: effectBearingJobs.map(({ canaryIntentId }) => canaryIntentId),
          },
        },
      })
    ).toBe(17);
  });

  it("classifies a final-attempt effect from a fresh snapshot after its candidate-lock wait", async () => {
    const submitted = await submit("final-effect-snapshot-race");
    await db.durableJob.update({
      where: { id: submitted.jobId },
      data: {
        status: "RUNNING",
        attemptCount: 3,
        leaseToken: randomUUID(),
        leaseExpiresAt: new Date(Date.now() - 5_000),
      },
    });

    const effectWriter = await pool.connect();
    const finalizer = new Pool({
      connectionString: process.env.DATABASE_URL,
      application_name: "phase2-worker-final-claim-test",
      max: 1,
    });
    let claim: Promise<unknown> | undefined;
    try {
      await effectWriter.query("BEGIN");
      // The suite bootstrap is the disposable PostgreSQL superuser. Disable
      // trigger execution only for this transaction so the valid effect insert
      // does not take a foreign-key key-share lock on the job row; that lets the
      // finalizer lock the candidate in statement one before statement two
      // waits on the effect-table lock below.
      await effectWriter.query(
        "SET LOCAL session_replication_role = 'replica'"
      );
      await effectWriter.query(
        `INSERT INTO public."WorkerCanaryEffect" (
           "canaryIntentId",
           "sourceJobId"
         ) VALUES ($1::uuid, $2::uuid)`,
        [submitted.canaryIntentId, submitted.jobId]
      );
      await effectWriter.query(
        `LOCK TABLE public."WorkerCanaryEffect" IN ACCESS EXCLUSIVE MODE`
      );

      claim = finalizer.query(
        "/* phase2_worker_final_claim */ SELECT * FROM job_queue.claim_one($1::uuid)",
        [randomUUID()]
      );
      await waitForBlockedFinalClaim();
      const candidateProbe = await pool.query<{ id: string }>(
        `SELECT queued."id"
         FROM public."DurableJob" AS queued
         WHERE queued."id" = $1::uuid
         FOR UPDATE SKIP LOCKED`,
        [submitted.jobId]
      );
      expect(candidateProbe.rows).toEqual([]);
      await effectWriter.query("COMMIT");

      await expect(claim).resolves.toMatchObject({ rows: [] });
      expect(
        await db.durableJob.findUniqueOrThrow({
          where: { id: submitted.jobId },
          select: { status: true, completedAt: true, terminalAt: true },
        })
      ).toEqual({
        status: "SUCCEEDED",
        completedAt: expect.any(Date),
        terminalAt: null,
      });
      expect(
        await db.workerCanaryEffect.count({
          where: { canaryIntentId: submitted.canaryIntentId },
        })
      ).toBe(1);
    } finally {
      await effectWriter.query("ROLLBACK").catch(() => undefined);
      effectWriter.release();
      await claim?.catch(() => undefined);
      await finalizer.end();
    }
  });

  it("reports reclaimable expired leases as available using one queue observation", async () => {
    const ready = await submit("stats-ready");
    const scheduled = await submit("stats-scheduled");
    const expired = await submit("stats-expired-running");
    const active = await submit("stats-active-running");
    const now = Date.now();

    await db.durableJob.update({
      where: { id: ready.jobId },
      data: { availableAt: new Date(now - 1_000) },
    });
    await db.durableJob.update({
      where: { id: scheduled.jobId },
      data: { availableAt: new Date(now + 60_000) },
    });
    await db.durableJob.update({
      where: { id: expired.jobId },
      data: {
        status: "RUNNING",
        attemptCount: 1,
        leaseToken: randomUUID(),
        leaseExpiresAt: new Date(now - 5_000),
      },
    });
    await db.durableJob.update({
      where: { id: active.jobId },
      data: {
        status: "RUNNING",
        attemptCount: 1,
        leaseToken: randomUUID(),
        leaseExpiresAt: new Date(now + 60_000),
      },
    });

    const stats = await worker.getQueueStats();
    expect(stats).toMatchObject({
      availableJobs: 2,
      scheduledJobs: 1,
      runningJobs: 2,
    });
    expect(stats.oldestAvailableAgeSeconds).toBeGreaterThanOrEqual(4);
    expect(stats.oldestAvailableAgeSeconds).toBeLessThan(30);
  });

  it("reconciles an effect across timeout, crash-like reclaim, and final-attempt expiry without duplication", async () => {
    const timeoutRace = await submit("effect-timeout-race");
    const timeoutToken = randomUUID();
    await claimExpected(timeoutRace.jobId, timeoutToken);
    await expect(
      worker.recordCanaryEffect(timeoutRace.jobId, timeoutToken)
    ).resolves.toEqual({ accepted: true, effectCreated: true });
    await expect(
      worker.fail(timeoutRace.jobId, timeoutToken, "TIMEOUT")
    ).resolves.toEqual({ accepted: true, status: "SUCCEEDED", retryAt: null });

    const crash = await submit("effect-crash-reclaim");
    const staleToken = randomUUID();
    await claimExpected(crash.jobId, staleToken);
    await worker.recordCanaryEffect(crash.jobId, staleToken);
    await expireLease(crash.jobId);

    const currentToken = randomUUID();
    const reclaimed = await claimExpected(crash.jobId, currentToken);
    expect(reclaimed.attemptCount).toBe(2);
    await expect(
      worker.recordCanaryEffect(crash.jobId, staleToken)
    ).resolves.toEqual({ accepted: false, effectCreated: false });
    await expect(
      worker.recordCanaryEffect(crash.jobId, currentToken)
    ).resolves.toEqual({ accepted: true, effectCreated: false });
    await expect(worker.complete(crash.jobId, currentToken)).resolves.toBe(
      true
    );
    expect(
      await db.workerCanaryEffect.count({
        where: { canaryIntentId: crash.canaryIntentId },
      })
    ).toBe(1);

    const replayJobId = randomUUID();
    await db.durableJob.create({
      data: {
        id: replayJobId,
        kind: "PHASE2_CANARY_V1",
        payloadVersion: 1,
        payload: { canaryIntentId: crash.canaryIntentId },
        deduplicationKeyHash: hashPhase2CanaryIdempotencyKey(
          key("effect-replay")
        ),
        maxAttempts: 3,
        requestId,
        originalJobId: crash.jobId,
        replaySequence: 1,
      },
    });
    await db.workerCanaryJob.create({
      data: { jobId: replayJobId, canaryIntentId: crash.canaryIntentId },
    });
    await makeAvailable(replayJobId);
    const replayToken = randomUUID();
    await claimExpected(replayJobId, replayToken);
    await expect(
      worker.recordCanaryEffect(replayJobId, replayToken)
    ).resolves.toEqual({ accepted: true, effectCreated: false });
    await expect(worker.complete(replayJobId, replayToken)).resolves.toBe(true);
    expect(
      await db.workerCanaryEffect.count({
        where: { canaryIntentId: crash.canaryIntentId },
      })
    ).toBe(1);

    const finalAttempt = await submit("effect-final-attempt");
    for (let attempt = 1; attempt < 3; attempt += 1) {
      const token = randomUUID();
      await claimExpected(finalAttempt.jobId, token);
      await worker.fail(finalAttempt.jobId, token, "TRANSIENT");
      await makeAvailable(finalAttempt.jobId);
    }
    const finalToken = randomUUID();
    const finalClaim = await claimExpected(finalAttempt.jobId, finalToken);
    expect(finalClaim.attemptCount).toBe(3);
    await worker.recordCanaryEffect(finalAttempt.jobId, finalToken);
    await expireLease(finalAttempt.jobId);

    await expect(worker.claimOne(randomUUID())).resolves.toBeNull();
    expect(
      await db.durableJob.findUniqueOrThrow({
        where: { id: finalAttempt.jobId },
        select: { status: true, completedAt: true, terminalAt: true },
      })
    ).toEqual({
      status: "SUCCEEDED",
      completedAt: expect.any(Date),
      terminalAt: null,
    });
    expect(
      await db.workerCanaryEffect.count({
        where: { canaryIntentId: finalAttempt.canaryIntentId },
      })
    ).toBe(1);
  });
});
