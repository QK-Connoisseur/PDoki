import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolConfig } from "pg";
import { createLogger } from "../logger.js";
import { loadWorkerEnv, type WorkerEnv } from "./env.js";
import { createPhase2CanaryHandler } from "./handler.js";
import { createPgWorkerRepository } from "./repository.js";
import { WORKER_HANDLER_TIMEOUT_MS, WorkerRuntime } from "./runtime.js";
import {
  createGracefulWorkerShutdown,
  type GracefulWorkerShutdown,
} from "./shutdown.js";
import { createWorkerTelemetry } from "./telemetry.js";

export const WORKER_DATABASE_STATEMENT_TIMEOUT_MS = 5_000;
export const WORKER_DATABASE_QUERY_TIMEOUT_MS = 15_000;
export const WORKER_DATABASE_STARTUP_OPTIONS =
  "-c default_transaction_isolation=read\\ committed";

if (WORKER_DATABASE_QUERY_TIMEOUT_MS >= WORKER_HANDLER_TIMEOUT_MS) {
  throw new Error("Worker database query timeout must precede handler timeout");
}

export function createWorkerPoolConfig(
  env: Pick<WorkerEnv, "WORKER_DATABASE_URL" | "WORKER_CONCURRENCY">
): PoolConfig {
  return {
    connectionString: env.WORKER_DATABASE_URL,
    application_name: "pumdoki-phase2-worker",
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 30_000,
    max: env.WORKER_CONCURRENCY + 2,
    options: WORKER_DATABASE_STARTUP_OPTIONS,
    statement_timeout: WORKER_DATABASE_STATEMENT_TIMEOUT_MS,
    query_timeout: WORKER_DATABASE_QUERY_TIMEOUT_MS,
  };
}

export async function exitWorkerAfterFatal(
  fatal: Promise<unknown>,
  shutdown: GracefulWorkerShutdown,
  exit: (code: number) => never
): Promise<never> {
  await fatal;
  try {
    await shutdown("FATAL");
  } catch {
    // A fatal transition must still terminate nonzero if shutdown itself fails.
  }
  return exit(1);
}

export async function startWorker(): Promise<void> {
  const env = loadWorkerEnv();
  const logger = createLogger(env.LOG_LEVEL).child({
    service: "phase2-worker",
  });
  const telemetry = createWorkerTelemetry(logger);
  const pool = new Pool(createWorkerPoolConfig(env));
  const repository = createPgWorkerRepository(pool);
  const runtime = new WorkerRuntime({
    repository,
    handler: createPhase2CanaryHandler(repository),
    telemetry,
    concurrency: env.WORKER_CONCURRENCY,
    pollIntervalMs: env.WORKER_POLL_INTERVAL_MS,
  });

  pool.on("error", () => {
    runtime.reportDatabaseDegraded("idle-database-client-error");
  });

  const shutdown = createGracefulWorkerShutdown({
    runtime,
    close: () => repository.close(),
    telemetry,
    gracePeriodMs: env.WORKER_SHUTDOWN_GRACE_MS,
    forceExit: (code) => process.exit(code),
  });
  void exitWorkerAfterFatal(runtime.waitForFatal(), shutdown, (code) =>
    process.exit(code)
  );

  try {
    await runtime.start();
  } catch {
    await repository.close().catch(() => undefined);
    throw new Error("Worker could not start");
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void shutdown(signal).then(
        (code) => process.exit(runtime.hasFatalFailure() ? 1 : code),
        () => process.exit(1)
      );
    });
  }
}

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  void startWorker().catch(() => {
    process.stderr.write("Pumdoki worker failed to start\n");
    process.exit(1);
  });
}
