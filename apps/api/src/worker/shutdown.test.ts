import { afterEach, describe, expect, it, vi } from "vitest";
import { createGracefulWorkerShutdown } from "./shutdown.js";
import type { WorkerTelemetry } from "./telemetry.js";

class ForcedExit extends Error {
  constructor(readonly code: number) {
    super(`forced exit ${code}`);
  }
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function telemetry(): WorkerTelemetry {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

function harness(
  options: {
    drain?: () => Promise<void>;
    close?: () => Promise<void>;
    gracePeriodMs?: number;
  } = {}
) {
  const runtime = {
    stopAcceptingClaims: vi.fn(),
    drain: vi.fn(options.drain ?? (async () => undefined)),
  };
  const close = vi.fn(options.close ?? (async () => undefined));
  const events = telemetry();
  const forceExit = vi.fn((code: number): never => {
    throw new ForcedExit(code);
  });
  const shutdown = createGracefulWorkerShutdown({
    runtime,
    close,
    telemetry: events,
    forceExit,
    gracePeriodMs: options.gracePeriodMs ?? 5_000,
  });
  return { runtime, close, events, forceExit, shutdown };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("createGracefulWorkerShutdown", () => {
  it("stops claims before draining and closes the worker database cleanly", async () => {
    const drainGate = deferred();
    const test = harness({ drain: () => drainGate.promise });

    const completion = test.shutdown("SIGTERM");

    expect(test.runtime.stopAcceptingClaims).toHaveBeenCalledWith("SIGTERM");
    expect(test.runtime.drain).toHaveBeenCalledOnce();
    expect(test.close).not.toHaveBeenCalled();

    drainGate.resolve();
    await expect(completion).resolves.toBe(0);
    expect(test.close).toHaveBeenCalledOnce();
    expect(test.forceExit).not.toHaveBeenCalled();
    expect(test.events.info).toHaveBeenCalledWith("worker.stopped", {
      status: "ok",
    });
  });

  it("still closes the database and returns failure when drain fails", async () => {
    const test = harness({
      drain: async () => {
        throw new Error("drain failed");
      },
    });

    await expect(test.shutdown("SIGINT")).resolves.toBe(1);
    expect(test.close).toHaveBeenCalledOnce();
    expect(test.events.info).toHaveBeenCalledWith("worker.stopped", {
      status: "error",
    });
  });

  it("returns failure when the worker database cannot close", async () => {
    const test = harness({
      close: async () => {
        throw new Error("close failed");
      },
    });

    await expect(test.shutdown("SIGTERM")).resolves.toBe(1);
    expect(test.runtime.drain).toHaveBeenCalledOnce();
  });

  it("forces termination when the grace deadline elapses", async () => {
    vi.useFakeTimers();
    const drainGate = deferred();
    const test = harness({
      drain: () => drainGate.promise,
      gracePeriodMs: 1_000,
    });

    const completion = test.shutdown("SIGTERM");
    await expect(vi.advanceTimersByTimeAsync(1_000)).rejects.toBeInstanceOf(
      ForcedExit
    );
    expect(test.forceExit).toHaveBeenCalledWith(1);
    expect(test.events.error).toHaveBeenCalledWith("worker.shutdown-forced", {
      signal: "SIGTERM",
      reason: "grace-period-elapsed",
    });

    drainGate.resolve();
    await expect(completion).resolves.toBe(0);
  });

  it("forces termination on an additional shutdown signal", async () => {
    const drainGate = deferred();
    const test = harness({ drain: () => drainGate.promise });

    const first = test.shutdown("SIGTERM");
    expect(() => test.shutdown("SIGINT")).toThrow(ForcedExit);
    expect(test.forceExit).toHaveBeenCalledWith(1);
    expect(test.events.error).toHaveBeenCalledWith("worker.shutdown-forced", {
      signal: "SIGINT",
      reason: "additional-shutdown-signal",
    });

    drainGate.resolve();
    await expect(first).resolves.toBe(0);
  });

  it("joins an in-progress shutdown when an internal fatal failure is observed", async () => {
    const drainGate = deferred();
    const test = harness({ drain: () => drainGate.promise });

    const first = test.shutdown("SIGTERM");
    const fatal = test.shutdown("FATAL");

    expect(fatal).toBe(first);
    expect(test.forceExit).not.toHaveBeenCalled();
    expect(test.runtime.stopAcceptingClaims).toHaveBeenCalledOnce();

    drainGate.resolve();
    await expect(fatal).resolves.toBe(0);
    expect(test.close).toHaveBeenCalledOnce();
  });

  it("returns the completed shutdown result without running twice", async () => {
    const test = harness();

    const first = test.shutdown("SIGTERM");
    await expect(first).resolves.toBe(0);
    const second = test.shutdown("SIGINT");

    expect(second).toBe(first);
    await expect(second).resolves.toBe(0);
    expect(test.runtime.stopAcceptingClaims).toHaveBeenCalledOnce();
    expect(test.runtime.drain).toHaveBeenCalledOnce();
    expect(test.close).toHaveBeenCalledOnce();
    expect(test.forceExit).not.toHaveBeenCalled();
  });
});
