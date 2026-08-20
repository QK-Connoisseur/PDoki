import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPhase2CanaryHandler, type WorkerJobHandler } from "./handler.js";
import { PHASE2_CANARY_JOB_KIND } from "./payloads.js";
import type { ClaimedJob, WorkerRepository } from "./repository.js";
import { WorkerRuntime, type WorkerSleep } from "./runtime.js";
import type { WorkerTelemetry } from "./telemetry.js";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function claimedJob(overrides: Partial<ClaimedJob> = {}): ClaimedJob {
  return {
    id: randomUUID(),
    kind: PHASE2_CANARY_JOB_KIND,
    payloadVersion: 1,
    payload: { canaryIntentId: randomUUID() },
    attemptCount: 1,
    leaseExpiresAt: new Date(Date.now() + 30_000),
    requestId: "worker-runtime-test",
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
      retryAt: new Date(Date.now() + 100),
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

function telemetry(): WorkerTelemetry {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

const abortOnlySleep: WorkerSleep = (_delayMs, signal) =>
  new Promise<void>((resolve) => {
    if (!signal || signal.aborted) {
      resolve();
      return;
    }
    signal.addEventListener("abort", () => resolve(), { once: true });
  });

const timerSleep: WorkerSleep = (delayMs, signal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(finish, delayMs);
    function finish() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", finish);
      resolve();
    }
    signal?.addEventListener("abort", finish, { once: true });
  });

function runtime(options: {
  repository: WorkerRepository;
  handler?: WorkerJobHandler;
  telemetry?: WorkerTelemetry;
  concurrency?: number;
  pollIntervalMs?: number;
  heartbeatIntervalMs?: number;
  handlerTimeoutMs?: number;
  sleep?: WorkerSleep;
}) {
  return new WorkerRuntime({
    repository: options.repository,
    handler: options.handler ?? vi.fn(async () => undefined),
    telemetry: options.telemetry ?? telemetry(),
    concurrency: options.concurrency ?? 1,
    pollIntervalMs: options.pollIntervalMs ?? 100,
    heartbeatIntervalMs: options.heartbeatIntervalMs ?? 10,
    handlerTimeoutMs: options.handlerTimeoutMs ?? 1_000,
    createLeaseToken: () => "00000000-0000-4000-8000-000000000001",
    random: () => 0.5,
    sleep: options.sleep ?? abortOnlySleep,
  });
}

async function settleMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe("WorkerRuntime", () => {
  it("rejects unbounded or internally inconsistent scheduling options", () => {
    const repo = repository();
    const handler = vi.fn(async () => undefined);
    const events = telemetry();

    expect(
      () =>
        new WorkerRuntime({
          repository: repo,
          handler,
          telemetry: events,
          concurrency: 0,
          pollIntervalMs: 100,
        })
    ).toThrow(/concurrency/);
    expect(
      () =>
        new WorkerRuntime({
          repository: repo,
          handler,
          telemetry: events,
          concurrency: 1,
          pollIntervalMs: 0,
        })
    ).toThrow(/poll interval/);
    expect(
      () =>
        new WorkerRuntime({
          repository: repo,
          handler,
          telemetry: events,
          concurrency: 1,
          pollIntervalMs: 100,
          heartbeatIntervalMs: 20,
          handlerTimeoutMs: 20,
        })
    ).toThrow(/handler timeout/);
  });

  it("fails startup closed when the database routine contract is unavailable", async () => {
    const repo = repository({ probe: vi.fn(async () => false) });
    const events = telemetry();
    const worker = runtime({ repository: repo, telemetry: events });

    await expect(worker.start()).rejects.toThrow(/contract is unavailable/);
    expect(worker.snapshot()).toEqual({
      state: "degraded",
      database: "down",
      activeJobs: 0,
      pendingClaims: 0,
    });
    expect(repo.claimOne).not.toHaveBeenCalled();
    expect(events.error).toHaveBeenCalledWith("worker.degraded", {
      reason: "database-contract-unavailable",
    });
  });

  it("never shortens the configured poll delay after a database failure", async () => {
    const repo = repository({
      claimOne: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    });
    const sleep = vi.fn(abortOnlySleep);
    const worker = runtime({
      repository: repo,
      pollIntervalMs: 30_000,
      sleep,
    });

    await worker.start();
    await vi.waitFor(() => {
      expect(sleep).toHaveBeenCalledWith(30_000, expect.any(AbortSignal));
    });

    await worker.drain();
  });

  it("releases a claim intercepted by drain before handler execution", async () => {
    const claim = deferred<ClaimedJob | null>();
    const job = claimedJob();
    const repo = repository({
      claimOne: vi.fn(() => claim.promise),
    });
    const handler = vi.fn(async () => undefined);
    const worker = runtime({ repository: repo, handler });

    await worker.start();
    await settleMicrotasks();
    expect(repo.claimOne).toHaveBeenCalledOnce();

    const drained = worker.drain();
    claim.resolve(job);

    await expect(drained).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
    expect(repo.releaseUnstarted).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001"
    );
    expect(repo.complete).not.toHaveBeenCalled();
    expect(repo.fail).not.toHaveBeenCalled();
    expect(worker.snapshot()).toMatchObject({
      state: "stopped",
      activeJobs: 0,
      pendingClaims: 0,
    });
  });

  it("waits for bounded active work while refusing new claims", async () => {
    const job = claimedJob();
    const finishHandler = deferred<void>();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const handler = vi.fn(() => finishHandler.promise);
    const worker = runtime({ repository: repo, handler });

    await worker.start();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledOnce());

    let drainSettled = false;
    const drained = worker.drain().then(() => {
      drainSettled = true;
    });
    await settleMicrotasks();
    expect(drainSettled).toBe(false);

    finishHandler.resolve();
    await drained;

    expect(repo.complete).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001"
    );
    expect(repo.releaseUnstarted).not.toHaveBeenCalled();
    expect(repo.claimOne).toHaveBeenCalledOnce();
    expect(worker.snapshot().state).toBe("stopped");
  });

  it("classifies a handler deadline as TIMEOUT and never acknowledges success", async () => {
    vi.useFakeTimers();
    const job = claimedJob();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const handler: WorkerJobHandler = vi.fn(
      (_job, { signal }) =>
        new Promise<void>((_resolve, reject) => {
          if (signal.aborted) {
            reject(new Error("aborted"));
            return;
          }
          signal.addEventListener("abort", () => reject(new Error("aborted")), {
            once: true,
          });
        })
    );
    const worker = runtime({
      repository: repo,
      handler,
      heartbeatIntervalMs: 10,
      handlerTimeoutMs: 20,
    });

    await worker.start();
    await settleMicrotasks();
    expect(handler).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(20);
    await settleMicrotasks();
    expect(repo.fail).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001",
      "TIMEOUT"
    );
    expect(repo.complete).not.toHaveBeenCalled();

    await worker.drain();
  });

  it("reconciles an accepted effect through the timeout transition", async () => {
    vi.useFakeTimers();
    const job = claimedJob();
    const effect = deferred<{
      accepted: boolean;
      effectCreated: boolean;
    }>();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
      recordCanaryEffect: vi.fn(() => effect.promise),
      fail: vi.fn(async () => ({
        accepted: true,
        status: "SUCCEEDED" as const,
        retryAt: null,
      })),
    });
    const worker = runtime({
      repository: repo,
      handler: createPhase2CanaryHandler(repo),
      heartbeatIntervalMs: 10,
      handlerTimeoutMs: 20,
    });

    await worker.start();
    await settleMicrotasks();
    expect(repo.recordCanaryEffect).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(20);
    effect.resolve({ accepted: true, effectCreated: true });
    await settleMicrotasks();

    expect(repo.fail).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001",
      "TIMEOUT"
    );
    expect(repo.complete).not.toHaveBeenCalled();

    await worker.drain();
  });

  it("does not acknowledge a handler that resolves after ignoring its deadline", async () => {
    vi.useFakeTimers();
    const job = claimedJob();
    const finishHandler = deferred<void>();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const handler = vi.fn(() => finishHandler.promise);
    const worker = runtime({
      repository: repo,
      handler,
      heartbeatIntervalMs: 10,
      handlerTimeoutMs: 20,
    });

    await worker.start();
    await settleMicrotasks();
    expect(handler).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(20);
    await settleMicrotasks();

    expect(repo.fail).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001",
      "TIMEOUT"
    );
    expect(repo.complete).not.toHaveBeenCalled();
    await expect(worker.drain()).resolves.toBeUndefined();

    finishHandler.resolve();
    await settleMicrotasks();
    expect(repo.fail).toHaveBeenCalledOnce();
    expect(repo.complete).not.toHaveBeenCalled();
  });

  it("times out a never-settling handler and still completes drain", async () => {
    vi.useFakeTimers();
    const job = claimedJob();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const handler = vi.fn(() => new Promise<void>(() => undefined));
    const worker = runtime({
      repository: repo,
      handler,
      heartbeatIntervalMs: 10,
      handlerTimeoutMs: 20,
    });

    await worker.start();
    await settleMicrotasks();
    expect(handler).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(20);
    await settleMicrotasks();

    expect(repo.fail).toHaveBeenCalledWith(
      job.id,
      "00000000-0000-4000-8000-000000000001",
      "TIMEOUT"
    );
    expect(repo.complete).not.toHaveBeenCalled();
    await expect(worker.drain()).resolves.toBeUndefined();
    expect(worker.snapshot()).toMatchObject({
      state: "stopped",
      activeJobs: 0,
    });
  });

  it("contains a handler rejection that arrives after its timeout", async () => {
    vi.useFakeTimers();
    const job = claimedJob();
    const finishHandler = deferred<void>();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const events = telemetry();
    const worker = runtime({
      repository: repo,
      handler: vi.fn(() => finishHandler.promise),
      telemetry: events,
      heartbeatIntervalMs: 10,
      handlerTimeoutMs: 20,
    });

    await worker.start();
    await settleMicrotasks();
    await vi.advanceTimersByTimeAsync(20);
    await settleMicrotasks();
    await expect(worker.drain()).resolves.toBeUndefined();

    finishHandler.reject(new Error("late-sensitive-handler-error"));
    await settleMicrotasks();

    expect(repo.fail).toHaveBeenCalledOnce();
    expect(repo.complete).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(events.warn).mock.calls)).not.toContain(
      "late-sensitive-handler-error"
    );
  });

  it("halts new claims and reports degraded when completion cannot be recorded", async () => {
    const job = claimedJob();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
      complete: vi.fn(async () => {
        throw new Error("database transition unavailable");
      }),
    });
    const events = telemetry();
    const worker = runtime({ repository: repo, telemetry: events });
    const fatal = worker.waitForFatal();

    await worker.start();
    await vi.waitFor(() => {
      expect(worker.snapshot()).toMatchObject({
        state: "degraded",
        database: "down",
      });
    });

    expect(repo.claimOne).toHaveBeenCalledOnce();
    expect(events.warn).toHaveBeenCalledWith("worker.degraded", {
      reason: "completion-transition-failed",
    });
    await expect(fatal).resolves.toBe("completion-transition-failed");
    expect(worker.hasFatalFailure()).toBe(true);
    await expect(worker.drain()).rejects.toThrow(/errors while draining/);
  });

  it("publishes a fatal signal when a failure transition cannot be recorded", async () => {
    const job = claimedJob();
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
      fail: vi.fn(async () => {
        throw new Error("database transition unavailable");
      }),
    });
    const handler = vi.fn(async () => {
      throw new Error("retryable handler failure");
    });
    const worker = runtime({ repository: repo, handler });
    const fatal = worker.waitForFatal();

    await worker.start();

    await expect(fatal).resolves.toBe("failure-transition-failed");
    expect(worker.hasFatalFailure()).toBe(true);
    expect(repo.complete).not.toHaveBeenCalled();
    await expect(worker.drain()).rejects.toThrow(/errors while draining/);
  });

  it.each([
    ["rejected", false],
    ["unavailable", new Error("renewal unavailable")],
  ] as const)(
    "stops domain work when lease renewal is %s",
    async (_label, renewalResult) => {
      vi.useFakeTimers();
      const job = claimedJob();
      const repo = repository({
        claimOne: vi
          .fn<WorkerRepository["claimOne"]>()
          .mockResolvedValueOnce(job)
          .mockResolvedValue(null),
        renew: vi.fn(async () => {
          if (renewalResult instanceof Error) throw renewalResult;
          return renewalResult;
        }),
      });
      const events = telemetry();
      const handler: WorkerJobHandler = vi.fn(
        (_job, { signal }) =>
          new Promise<void>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new Error("lease lost")),
              { once: true }
            );
          })
      );
      const worker = runtime({
        repository: repo,
        handler,
        telemetry: events,
        heartbeatIntervalMs: 10,
        handlerTimeoutMs: 1_000,
        sleep: timerSleep,
      });
      const fatal =
        renewalResult instanceof Error ? worker.waitForFatal() : null;

      await worker.start();
      await settleMicrotasks();
      await vi.advanceTimersByTimeAsync(10);
      await settleMicrotasks();

      expect(repo.renew).toHaveBeenCalledWith(
        job.id,
        "00000000-0000-4000-8000-000000000001"
      );
      expect(repo.complete).not.toHaveBeenCalled();
      expect(repo.fail).not.toHaveBeenCalled();
      expect(events.warn).toHaveBeenCalledWith(
        "job.lease-lost",
        expect.objectContaining({ jobId: job.id })
      );
      if (renewalResult instanceof Error) {
        expect(worker.snapshot()).toMatchObject({ database: "down" });
        await expect(fatal).resolves.toBe("lease-renewal-failed");
        expect(worker.hasFatalFailure()).toBe(true);
      } else {
        expect(worker.hasFatalFailure()).toBe(false);
      }

      await worker.drain();
    }
  );

  it("never exceeds its configured concurrency", async () => {
    const jobs = [claimedJob(), claimedJob(), claimedJob()];
    const releases = jobs.map(() => deferred<void>());
    let running = 0;
    let maximumRunning = 0;
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(jobs[0]!)
        .mockResolvedValueOnce(jobs[1]!)
        .mockResolvedValueOnce(jobs[2]!)
        .mockResolvedValue(null),
    });
    const handler: WorkerJobHandler = vi.fn(async (job) => {
      const index = jobs.findIndex(({ id }) => id === job.id);
      running += 1;
      maximumRunning = Math.max(maximumRunning, running);
      await releases[index]!.promise;
      running -= 1;
    });
    const worker = runtime({ repository: repo, handler, concurrency: 2 });

    await worker.start();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
    expect(repo.claimOne).toHaveBeenCalledTimes(2);
    expect(maximumRunning).toBe(2);

    releases[0]!.resolve();
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(3));
    expect(maximumRunning).toBe(2);

    releases[1]!.resolve();
    releases[2]!.resolve();
    await worker.drain();
    expect(maximumRunning).toBe(2);
  });

  it("emits a redacted aggregate heartbeat while idle", async () => {
    const stats = {
      availableJobs: 2,
      scheduledJobs: 1,
      runningJobs: 0,
      succeededJobs: 4,
      deadJobs: 1,
      canceledJobs: 0,
      discardedJobs: 0,
      retryingJobs: 1,
      oldestAvailableAgeSeconds: 12.5,
    };
    const repo = repository({ getQueueStats: vi.fn(async () => stats) });
    const events = telemetry();
    const worker = runtime({ repository: repo, telemetry: events });

    await worker.start();
    await vi.waitFor(() => {
      expect(events.info).toHaveBeenCalledWith("worker.heartbeat", {
        ...stats,
        activeJobs: 0,
      });
    });
    await worker.drain();
  });

  it("keeps in-process state aligned with an idle pool failure", async () => {
    const repo = repository();
    const events = telemetry();
    const worker = runtime({ repository: repo, telemetry: events });

    await worker.start();
    worker.reportDatabaseDegraded("idle-database-client-error");

    expect(worker.snapshot()).toMatchObject({
      state: "degraded",
      database: "down",
    });
    expect(events.warn).toHaveBeenCalledWith("worker.degraded", {
      reason: "idle-database-client-error",
    });
    await worker.drain();
  });

  it("keeps payloads and deduplication data out of telemetry", async () => {
    const job = claimedJob({
      payload: {
        canaryIntentId: randomUUID(),
        mustNeverAppear: "sensitive-payload-value",
      },
    });
    const repo = repository({
      claimOne: vi
        .fn<WorkerRepository["claimOne"]>()
        .mockResolvedValueOnce(job)
        .mockResolvedValue(null),
    });
    const events = telemetry();
    const worker = runtime({ repository: repo, telemetry: events });

    await worker.start();
    await vi.waitFor(() => expect(repo.complete).toHaveBeenCalledOnce());
    await worker.drain();

    expect(JSON.stringify(events)).not.toContain("sensitive-payload-value");
    for (const mock of [events.info, events.warn, events.error]) {
      for (const call of vi.mocked(mock).mock.calls) {
        expect(JSON.stringify(call)).not.toContain("sensitive-payload-value");
        expect(JSON.stringify(call)).not.toContain("payload");
        expect(JSON.stringify(call)).not.toContain("deduplication");
      }
    }
  });
});
