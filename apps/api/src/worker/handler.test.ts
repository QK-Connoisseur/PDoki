import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  JobExecutionError,
  LeaseRejectedError,
  classifyJobFailure,
  createPhase2CanaryHandler,
} from "./handler.js";
import { PHASE2_CANARY_JOB_KIND } from "./payloads.js";
import type {
  ClaimedJob,
  WorkerFailureCategory,
  WorkerRepository,
} from "./repository.js";

function claimedJob(overrides: Partial<ClaimedJob> = {}): ClaimedJob {
  const canaryIntentId = randomUUID();
  return {
    id: randomUUID(),
    kind: PHASE2_CANARY_JOB_KIND,
    payloadVersion: 1,
    payload: { canaryIntentId },
    attemptCount: 1,
    leaseExpiresAt: new Date(Date.now() + 30_000),
    requestId: "worker-handler-test",
    correlationId: null,
    ...overrides,
  };
}

function repository(
  overrides: Partial<WorkerRepository> = {}
): WorkerRepository {
  return {
    probe: vi.fn(async () => true),
    claimOne: vi.fn(async () => null),
    renew: vi.fn(async () => true),
    releaseUnstarted: vi.fn(async () => true),
    complete: vi.fn(async () => true),
    fail: vi.fn(async () => ({
      accepted: true,
      status: "PENDING" as const,
      retryAt: new Date(),
    })),
    recordCanaryEffect: vi.fn(async () => ({
      accepted: true,
      effectCreated: true,
    })),
    getQueueStats: vi.fn(async () => ({
      availableJobs: 0,
      scheduledJobs: 0,
      runningJobs: 0,
      succeededJobs: 0,
      deadJobs: 0,
      canceledJobs: 0,
      discardedJobs: 0,
      retryingJobs: 0,
      oldestAvailableAgeSeconds: 0,
    })),
    close: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("createPhase2CanaryHandler", () => {
  it("records the allowlisted canary effect with the current lease token", async () => {
    const repo = repository();
    const job = claimedJob();
    const leaseToken = randomUUID();

    await expect(
      createPhase2CanaryHandler(repo)(job, {
        leaseToken,
        signal: new AbortController().signal,
      })
    ).resolves.toBeUndefined();

    expect(repo.recordCanaryEffect).toHaveBeenCalledOnce();
    expect(repo.recordCanaryEffect).toHaveBeenCalledWith(job.id, leaseToken);
  });

  it("treats an existing idempotent effect as successful", async () => {
    const repo = repository({
      recordCanaryEffect: vi.fn(async () => ({
        accepted: true,
        effectCreated: false,
      })),
    });

    await expect(
      createPhase2CanaryHandler(repo)(claimedJob(), {
        leaseToken: randomUUID(),
        signal: new AbortController().signal,
      })
    ).resolves.toBeUndefined();
  });

  it.each([
    ["unknown kind", { kind: "UNKNOWN" }],
    ["unknown version", { payloadVersion: 2 }],
    ["malformed payload", { payload: { canaryIntentId: "not-a-uuid" } }],
    [
      "secret-bearing payload",
      {
        payload: {
          canaryIntentId: randomUUID(),
          verificationToken: "must-not-be-accepted",
        },
      },
    ],
  ])("rejects a %s before recording an effect", async (_label, overrides) => {
    const repo = repository();

    await expect(
      createPhase2CanaryHandler(repo)(claimedJob(overrides), {
        leaseToken: randomUUID(),
        signal: new AbortController().signal,
      })
    ).rejects.toMatchObject({ category: "PAYLOAD_INVALID" });
    expect(repo.recordCanaryEffect).not.toHaveBeenCalled();
  });

  it("does not begin the durable effect after its handler deadline aborts", async () => {
    const repo = repository();
    const controller = new AbortController();
    controller.abort();

    await expect(
      createPhase2CanaryHandler(repo)(claimedJob(), {
        leaseToken: randomUUID(),
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ category: "TIMEOUT" });
    expect(repo.recordCanaryEffect).not.toHaveBeenCalled();
  });

  it("reports a lost lease instead of claiming the canary effect", async () => {
    const repo = repository({
      recordCanaryEffect: vi.fn(async () => ({
        accepted: false,
        effectCreated: false,
      })),
    });

    await expect(
      createPhase2CanaryHandler(repo)(claimedJob(), {
        leaseToken: randomUUID(),
        signal: new AbortController().signal,
      })
    ).rejects.toBeInstanceOf(LeaseRejectedError);
  });

  it("maps a database exception to a redacted failure category", async () => {
    const repo = repository({
      recordCanaryEffect: vi.fn(async () => {
        throw new Error("provider-shaped secret details");
      }),
    });

    await expect(
      createPhase2CanaryHandler(repo)(claimedJob(), {
        leaseToken: randomUUID(),
        signal: new AbortController().signal,
      })
    ).rejects.toMatchObject({
      category: "DATABASE",
      message: "Worker could not record the canary effect",
    });
  });
});

describe("classifyJobFailure", () => {
  it.each<WorkerFailureCategory>([
    "TRANSIENT",
    "TIMEOUT",
    "DATABASE",
    "PAYLOAD_INVALID",
    "HANDLER_PERMANENT",
  ])("preserves the allowlisted %s category", (category) => {
    expect(classifyJobFailure(new JobExecutionError(category, "safe"))).toBe(
      category
    );
  });

  it("maps arbitrary exceptions to TRANSIENT without persisting their text", () => {
    expect(classifyJobFailure(new Error("raw provider exception"))).toBe(
      "TRANSIENT"
    );
  });
});
