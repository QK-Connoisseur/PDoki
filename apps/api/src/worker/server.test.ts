import { Client } from "pg";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORKER_HANDLER_TIMEOUT_MS } from "./runtime.js";
import {
  createWorkerPoolConfig,
  exitWorkerAfterFatal,
  WORKER_DATABASE_QUERY_TIMEOUT_MS,
  WORKER_DATABASE_STARTUP_OPTIONS,
  WORKER_DATABASE_STATEMENT_TIMEOUT_MS,
} from "./server.js";
import type { GracefulWorkerShutdown } from "./shutdown.js";

class WorkerExit extends Error {
  constructor(readonly code: number) {
    super(`worker exit ${code}`);
  }
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function exitWithError(code: number): never {
  throw new WorkerExit(code);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("worker server lifecycle", () => {
  it("bounds PostgreSQL statements and client queries below the handler deadline", () => {
    const config = createWorkerPoolConfig({
      WORKER_DATABASE_URL: "postgresql://worker:secret@localhost:5432/pumdoki",
      WORKER_CONCURRENCY: 3,
    });

    expect(config).toMatchObject({
      max: 5,
      options: WORKER_DATABASE_STARTUP_OPTIONS,
      statement_timeout: WORKER_DATABASE_STATEMENT_TIMEOUT_MS,
      query_timeout: WORKER_DATABASE_QUERY_TIMEOUT_MS,
    });
    expect(WORKER_DATABASE_STATEMENT_TIMEOUT_MS).toBeLessThan(
      WORKER_DATABASE_QUERY_TIMEOUT_MS
    );
    expect(WORKER_DATABASE_QUERY_TIMEOUT_MS).toBeLessThan(
      WORKER_HANDLER_TIMEOUT_MS
    );
  });

  it("overrides ambient PGOPTIONS with fixed isolation and bounded settings", () => {
    vi.stubEnv(
      "PGOPTIONS",
      "-c default_transaction_isolation=serializable -c statement_timeout=0"
    );
    const client = new Client(
      createWorkerPoolConfig({
        WORKER_DATABASE_URL:
          "postgresql://worker:secret@localhost:5432/pumdoki",
        WORKER_CONCURRENCY: 1,
      })
    );
    const settings = (
      client as unknown as {
        connectionParameters: {
          application_name?: string;
          options?: string;
          statement_timeout?: false | number;
          query_timeout?: number;
        };
      }
    ).connectionParameters;

    expect(settings).toMatchObject({
      application_name: "pumdoki-phase2-worker",
      options: WORKER_DATABASE_STARTUP_OPTIONS,
      statement_timeout: WORKER_DATABASE_STATEMENT_TIMEOUT_MS,
      query_timeout: WORKER_DATABASE_QUERY_TIMEOUT_MS,
    });
    expect(settings.options).not.toContain("serializable");
  });

  it("waits for a fatal transition, drains, then exits deterministically with code 1", async () => {
    const fatal = deferred<string>();
    const shutdown = vi.fn<GracefulWorkerShutdown>(async () => 0);
    const exit = vi.fn(exitWithError);

    const completion = exitWorkerAfterFatal(fatal.promise, shutdown, exit);
    expect(shutdown).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();

    fatal.resolve("completion-transition-failed");
    await expect(completion).rejects.toMatchObject({ code: 1 });
    expect(shutdown).toHaveBeenCalledOnce();
    expect(shutdown).toHaveBeenCalledWith("FATAL");
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("still exits with code 1 when fatal shutdown reports an exception", async () => {
    const shutdown = vi.fn<GracefulWorkerShutdown>(async () => {
      throw new Error("shutdown failed");
    });
    const exit = vi.fn(exitWithError);

    await expect(
      exitWorkerAfterFatal(
        Promise.resolve("lease-renewal-failed"),
        shutdown,
        exit
      )
    ).rejects.toMatchObject({ code: 1 });
    expect(exit).toHaveBeenCalledWith(1);
  });
});
