import { randomUUID } from "node:crypto";
import {
  LeaseRejectedError,
  classifyJobFailure,
  type WorkerJobHandler,
} from "./handler.js";
import { PHASE2_CANARY_JOB_KIND } from "./payloads.js";
import type {
  ClaimedJob,
  FailureTransition,
  WorkerFailureCategory,
  WorkerRepository,
} from "./repository.js";
import type { WorkerTelemetry } from "./telemetry.js";

export const WORKER_HEARTBEAT_INTERVAL_MS = 10_000;
export const WORKER_HANDLER_TIMEOUT_MS = 20_000;
export const WORKER_TELEMETRY_INTERVAL_MS = 30_000;
const MAX_DATABASE_RETRY_DELAY_MS = 30_000;

export type WorkerRuntimeState =
  | "idle"
  | "starting"
  | "ready"
  | "degraded"
  | "draining"
  | "stopped";

export interface WorkerRuntimeSnapshot {
  state: WorkerRuntimeState;
  database: "up" | "down";
  activeJobs: number;
  pendingClaims: number;
}

export type WorkerSleep = (
  delayMs: number,
  signal?: AbortSignal
) => Promise<void>;

export interface WorkerRuntimeOptions {
  repository: WorkerRepository;
  handler: WorkerJobHandler;
  telemetry: WorkerTelemetry;
  concurrency: number;
  pollIntervalMs: number;
  heartbeatIntervalMs?: number;
  handlerTimeoutMs?: number;
  telemetryIntervalMs?: number;
  random?: () => number;
  now?: () => number;
  createLeaseToken?: () => string;
  sleep?: WorkerSleep;
}

type HandlerOutcome =
  | { status: "succeeded" }
  | { status: "lease-lost" }
  | { status: "failed"; category: WorkerFailureCategory }
  | { status: "timed-out" };

function defaultSleep(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(finish, delayMs);
    function finish() {
      signal?.removeEventListener("abort", finish);
      clearTimeout(timer);
      resolve();
    }
    signal?.addEventListener("abort", finish, { once: true });
  });
}

function boundedJitter(baseMs: number, random: () => number): number {
  return Math.max(1, Math.round(baseMs * (0.8 + random() * 0.4)));
}

export class WorkerRuntime {
  private state: WorkerRuntimeState = "idle";
  private databaseUp = false;
  private acceptingClaims = false;
  private pollAbort = new AbortController();
  private pollLoop: Promise<void> | undefined;
  private readonly active = new Set<Promise<void>>();
  private readonly pendingClaims = new Set<Promise<boolean>>();
  private backgroundFailureCount = 0;
  private consecutiveClaimFailures = 0;
  private nextTelemetryAt = 0;
  private fatalReason: string | undefined;
  private readonly fatal: Promise<string>;
  private resolveFatal!: (reason: string) => void;

  private readonly repository: WorkerRepository;
  private readonly handler: WorkerJobHandler;
  private readonly telemetry: WorkerTelemetry;
  private readonly concurrency: number;
  private readonly pollIntervalMs: number;
  private readonly heartbeatIntervalMs: number;
  private readonly handlerTimeoutMs: number;
  private readonly telemetryIntervalMs: number;
  private readonly random: () => number;
  private readonly now: () => number;
  private readonly createLeaseToken: () => string;
  private readonly sleep: WorkerSleep;

  constructor(options: WorkerRuntimeOptions) {
    if (
      !Number.isInteger(options.concurrency) ||
      options.concurrency < 1 ||
      options.concurrency > 16
    ) {
      throw new Error(
        "Worker concurrency must be an integer from 1 through 16"
      );
    }
    if (
      !Number.isInteger(options.pollIntervalMs) ||
      options.pollIntervalMs < 1 ||
      options.pollIntervalMs > 30_000
    ) {
      throw new Error("Worker poll interval must be a positive integer");
    }
    this.repository = options.repository;
    this.handler = options.handler;
    this.telemetry = options.telemetry;
    this.concurrency = options.concurrency;
    this.pollIntervalMs = options.pollIntervalMs;
    this.heartbeatIntervalMs =
      options.heartbeatIntervalMs ?? WORKER_HEARTBEAT_INTERVAL_MS;
    this.handlerTimeoutMs =
      options.handlerTimeoutMs ?? WORKER_HANDLER_TIMEOUT_MS;
    this.telemetryIntervalMs =
      options.telemetryIntervalMs ?? WORKER_TELEMETRY_INTERVAL_MS;
    if (
      this.heartbeatIntervalMs < 1 ||
      this.handlerTimeoutMs <= this.heartbeatIntervalMs
    ) {
      throw new Error(
        "Worker handler timeout must exceed its positive heartbeat interval"
      );
    }
    if (this.telemetryIntervalMs < 1) {
      throw new Error("Worker telemetry interval must be positive");
    }
    this.random = options.random ?? Math.random;
    this.now = options.now ?? Date.now;
    this.createLeaseToken = options.createLeaseToken ?? randomUUID;
    this.sleep = options.sleep ?? defaultSleep;
    this.fatal = new Promise<string>((resolve) => {
      this.resolveFatal = resolve;
    });
  }

  snapshot(): WorkerRuntimeSnapshot {
    return {
      state: this.state,
      database: this.databaseUp ? "up" : "down",
      activeJobs: this.active.size,
      pendingClaims: this.pendingClaims.size,
    };
  }

  reportDatabaseDegraded(reason: string): void {
    this.markDatabaseDegraded(reason);
  }

  hasFatalFailure(): boolean {
    return this.fatalReason !== undefined;
  }

  waitForFatal(): Promise<string> {
    return this.fatal;
  }

  async start(): Promise<void> {
    if (this.state !== "idle")
      throw new Error("Worker runtime already started");
    this.state = "starting";
    this.telemetry.info("worker.starting");
    let ready = false;
    try {
      ready = await this.repository.probe();
    } catch {
      this.state = "degraded";
      this.telemetry.error("worker.degraded", {
        reason: "database-unavailable",
      });
      throw new Error("Worker database is unavailable");
    }
    if (!ready) {
      this.state = "degraded";
      this.telemetry.error("worker.degraded", {
        reason: "database-contract-unavailable",
      });
      throw new Error("Worker database contract is unavailable");
    }

    this.databaseUp = true;
    this.state = "ready";
    this.acceptingClaims = true;
    this.pollAbort = new AbortController();
    this.telemetry.info("worker.ready");
    this.pollLoop = this.runPollLoop();
  }

  stopAcceptingClaims(signal?: string): void {
    if (this.state === "stopped" || this.state === "draining") return;
    this.acceptingClaims = false;
    this.state = "draining";
    this.pollAbort.abort();
    this.telemetry.info("worker.draining", {
      activeJobs: this.active.size,
      signal,
    });
  }

  async drain(): Promise<void> {
    this.stopAcceptingClaims();
    const failures: unknown[] = [];

    const loopResult = await Promise.allSettled(
      this.pollLoop ? [this.pollLoop] : []
    );
    failures.push(...rejectionReasons(loopResult));

    const claimResults = await Promise.allSettled([...this.pendingClaims]);
    failures.push(...rejectionReasons(claimResults));

    const activeResults = await Promise.allSettled([...this.active]);
    failures.push(...rejectionReasons(activeResults));
    if (this.backgroundFailureCount > 0) {
      failures.push(
        new Error(
          `${this.backgroundFailureCount} worker background operation(s) failed`
        )
      );
      this.backgroundFailureCount = 0;
    }

    this.state = "stopped";
    if (failures.length) {
      throw new AggregateError(
        failures,
        "Worker encountered errors while draining"
      );
    }
  }

  private async runPollLoop(): Promise<void> {
    while (this.acceptingClaims) {
      await this.emitQueueHeartbeatIfDue();
      while (
        this.acceptingClaims &&
        this.active.size + this.pendingClaims.size < this.concurrency
      ) {
        const started = await this.tryStartOne();
        if (!started) break;
      }
      if (!this.acceptingClaims) break;

      if (this.active.size >= this.concurrency) {
        await Promise.race(this.active);
        continue;
      }

      const baseDelay = this.consecutiveClaimFailures
        ? Math.min(
            MAX_DATABASE_RETRY_DELAY_MS,
            this.pollIntervalMs *
              2 ** Math.min(this.consecutiveClaimFailures, 4)
          )
        : this.pollIntervalMs;
      await this.sleep(
        boundedJitter(baseDelay, this.random),
        this.pollAbort.signal
      );
    }
  }

  private async tryStartOne(): Promise<boolean> {
    if (!this.acceptingClaims) return false;
    const operation = this.claimAndStart();
    this.pendingClaims.add(operation);
    try {
      return await operation;
    } finally {
      this.pendingClaims.delete(operation);
    }
  }

  private async claimAndStart(): Promise<boolean> {
    const leaseToken = this.createLeaseToken();
    let claimed: ClaimedJob | null;
    try {
      claimed = await this.repository.claimOne(leaseToken);
      this.markDatabaseReady();
    } catch {
      this.consecutiveClaimFailures += 1;
      this.markDatabaseDegraded("claim-failed");
      return false;
    }

    if (!claimed) return false;
    if (!this.acceptingClaims) {
      let released = false;
      try {
        released = await this.repository.releaseUnstarted(
          claimed.id,
          leaseToken
        );
      } catch {
        // The claim remains leased for expiry; it must not be handled after
        // drain has begun or released without a confirmed ownership fence.
      }
      if (!released) {
        this.backgroundFailureCount += 1;
        this.telemetry.warn("job.lease-lost", safeJobFields(claimed));
        return false;
      }
      this.telemetry.info("job.pre-handler-released", safeJobFields(claimed));
      return false;
    }

    this.telemetry.info("job.claimed", safeJobFields(claimed));
    const activeWork = this.process(claimed, leaseToken).catch(() => {
      this.backgroundFailureCount += 1;
    });
    this.active.add(activeWork);
    void activeWork.finally(() => this.active.delete(activeWork));
    return true;
  }

  private async process(job: ClaimedJob, leaseToken: string): Promise<void> {
    const startedAt = Date.now();
    const handlerAbort = new AbortController();
    const heartbeatAbort = new AbortController();
    let leaseLost = false;
    let resolveTimeout!: (outcome: HandlerOutcome) => void;
    const timeoutOutcome = new Promise<HandlerOutcome>((resolve) => {
      resolveTimeout = resolve;
    });
    const handlerTimeout = setTimeout(() => {
      handlerAbort.abort();
      heartbeatAbort.abort();
      resolveTimeout({ status: "timed-out" });
    }, this.handlerTimeoutMs);

    const heartbeat = this.runHeartbeat(
      job,
      leaseToken,
      heartbeatAbort.signal,
      () => {
        leaseLost = true;
        handlerAbort.abort();
      }
    );

    let handlerOutcome: Promise<HandlerOutcome>;
    try {
      handlerOutcome = this.handler(job, {
        leaseToken,
        signal: handlerAbort.signal,
      }).then<HandlerOutcome, HandlerOutcome>(
        () => ({ status: "succeeded" }),
        (error) => classifyHandlerOutcome(error)
      );
    } catch (error) {
      handlerOutcome = Promise.resolve(classifyHandlerOutcome(error));
    }

    let outcome: HandlerOutcome;
    try {
      // Losing the race leaves a rejection handler attached to the domain
      // promise. A late result cannot enter the worker transition path, and
      // any late error is reduced to a bounded category rather than retained.
      outcome = await Promise.race([handlerOutcome, timeoutOutcome]);
    } finally {
      clearTimeout(handlerTimeout);
      heartbeatAbort.abort();
      await heartbeat;
    }

    const durationMs = Date.now() - startedAt;
    if (leaseLost || outcome.status === "lease-lost") {
      this.telemetry.warn("job.lease-lost", {
        ...safeJobFields(job),
        durationMs,
      });
      return;
    }

    if (outcome.status === "timed-out" || outcome.status === "failed") {
      const category: WorkerFailureCategory =
        outcome.status === "timed-out" ? "TIMEOUT" : outcome.category;
      let transition: FailureTransition;
      try {
        transition = await this.repository.fail(job.id, leaseToken, category);
      } catch (error) {
        this.haltClaimsForTransitionFailure("failure-transition-failed");
        throw error;
      }
      if (!transition.accepted) {
        this.telemetry.warn("job.lease-lost", {
          ...safeJobFields(job),
          durationMs,
          failureCategory: category,
        });
        return;
      }
      if (transition.status === "DEAD") {
        this.telemetry.error("job.dead", {
          ...safeJobFields(job),
          durationMs,
          failureCategory: category,
          status: transition.status,
        });
      } else if (transition.status === "SUCCEEDED") {
        this.telemetry.info("job.succeeded", {
          ...safeJobFields(job),
          durationMs,
          status: transition.status,
        });
      } else {
        this.telemetry.warn("job.retry-scheduled", {
          ...safeJobFields(job),
          delayMs: transition.retryAt
            ? Math.max(0, transition.retryAt.getTime() - Date.now())
            : undefined,
          durationMs,
          failureCategory: category,
          status: transition.status ?? undefined,
        });
      }
      return;
    }

    let completed: boolean;
    try {
      completed = await this.repository.complete(job.id, leaseToken);
    } catch (error) {
      this.haltClaimsForTransitionFailure("completion-transition-failed");
      throw error;
    }
    if (!completed) {
      this.telemetry.warn("job.lease-lost", {
        ...safeJobFields(job),
        durationMs,
      });
      return;
    }
    this.telemetry.info("job.succeeded", {
      ...safeJobFields(job),
      durationMs,
      status: "SUCCEEDED",
    });
  }

  private async runHeartbeat(
    job: ClaimedJob,
    leaseToken: string,
    signal: AbortSignal,
    loseLease: () => void
  ): Promise<void> {
    while (!signal.aborted) {
      await this.sleep(this.heartbeatIntervalMs, signal);
      if (signal.aborted) return;
      try {
        if (await this.repository.renew(job.id, leaseToken)) continue;
      } catch {
        this.haltClaimsForTransitionFailure("lease-renewal-failed");
      }
      loseLease();
      return;
    }
  }

  private markDatabaseReady(): void {
    this.consecutiveClaimFailures = 0;
    if (this.databaseUp) return;
    this.databaseUp = true;
    if (this.state !== "draining" && this.state !== "stopped") {
      this.state = "ready";
      this.telemetry.info("worker.ready");
    }
  }

  private async emitQueueHeartbeatIfDue(): Promise<void> {
    const now = this.now();
    if (now < this.nextTelemetryAt) return;
    this.nextTelemetryAt = now + this.telemetryIntervalMs;
    try {
      const stats = await this.repository.getQueueStats();
      this.markDatabaseReady();
      this.telemetry.info("worker.heartbeat", {
        ...stats,
        activeJobs: this.active.size,
      });
    } catch {
      this.markDatabaseDegraded("queue-telemetry-failed");
    }
  }

  private markDatabaseDegraded(reason: string): void {
    if (!this.databaseUp && this.state === "degraded") return;
    this.databaseUp = false;
    if (this.state !== "draining" && this.state !== "stopped") {
      this.state = "degraded";
    }
    this.telemetry.warn("worker.degraded", { reason });
  }

  private haltClaimsForTransitionFailure(reason: string): void {
    if (this.fatalReason !== undefined) return;
    this.fatalReason = reason;
    this.acceptingClaims = false;
    this.pollAbort.abort();
    this.markDatabaseDegraded(reason);
    this.resolveFatal(reason);
  }
}

function safeJobFields(job: ClaimedJob) {
  return {
    jobId: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(job.id)
      ? job.id
      : "invalid-job-id",
    jobKind:
      job.kind === PHASE2_CANARY_JOB_KIND ? job.kind : "UNKNOWN_JOB_KIND",
    attemptCount: job.attemptCount,
    requestId: safeCorrelationId(job.requestId),
    correlationId: safeCorrelationId(job.correlationId),
  };
}

function classifyHandlerOutcome(error: unknown): HandlerOutcome {
  if (error instanceof LeaseRejectedError) return { status: "lease-lost" };
  return { status: "failed", category: classifyJobFailure(error) };
}

function safeCorrelationId(value: string | null): string | undefined {
  return value && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(value)
    ? value
    : undefined;
}

function rejectionReasons(results: PromiseSettledResult<unknown>[]): unknown[] {
  return results
    .filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    )
    .map(({ reason }) => reason);
}
