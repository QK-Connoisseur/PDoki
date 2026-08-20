import { describe, expect, it } from "vitest";
import { loadWorkerEnv } from "./env.js";

const validEnv = {
  WORKER_DATABASE_URL:
    "postgresql://pumdoki_worker:local-only@localhost:5432/pumdoki_dev",
} as NodeJS.ProcessEnv;

describe("loadWorkerEnv", () => {
  it("requires an explicit worker database URL instead of falling back to the API URL", () => {
    expect(() =>
      loadWorkerEnv({
        DATABASE_URL: "postgresql://pumdoki:pumdoki@localhost:5432/pumdoki_dev",
      } as NodeJS.ProcessEnv)
    ).toThrow(/WORKER_DATABASE_URL/);
  });

  it("applies bounded worker defaults", () => {
    const env = loadWorkerEnv(validEnv);

    expect(env).toMatchObject({
      NODE_ENV: "development",
      LOG_LEVEL: "info",
      WORKER_CONCURRENCY: 2,
      WORKER_POLL_INTERVAL_MS: 1_000,
      WORKER_SHUTDOWN_GRACE_MS: 30_000,
    });
  });

  it("coerces bounded numeric settings", () => {
    const env = loadWorkerEnv({
      ...validEnv,
      WORKER_CONCURRENCY: "16",
      WORKER_POLL_INTERVAL_MS: "100",
      WORKER_SHUTDOWN_GRACE_MS: "120000",
    });

    expect(env.WORKER_CONCURRENCY).toBe(16);
    expect(env.WORKER_POLL_INTERVAL_MS).toBe(100);
    expect(env.WORKER_SHUTDOWN_GRACE_MS).toBe(120_000);
  });

  it.each([
    "not-a-url",
    "https://localhost:5432/pumdoki_dev",
    "file:///tmp/pumdoki.db",
  ])("rejects a non-PostgreSQL worker URL: %s", (workerDatabaseUrl) => {
    expect(() =>
      loadWorkerEnv({
        ...validEnv,
        WORKER_DATABASE_URL: workerDatabaseUrl,
      })
    ).toThrow(/WORKER_DATABASE_URL/);
  });

  it.each([
    "?statement_timeout=0",
    "?query_timeout=0",
    "?application_name=untrusted",
    "#query_timeout=0",
  ])(
    "rejects worker URL metadata that could override pool guarantees: %s",
    (suffix) => {
      expect(() =>
        loadWorkerEnv({
          ...validEnv,
          WORKER_DATABASE_URL: `${validEnv.WORKER_DATABASE_URL}${suffix}`,
        })
      ).toThrow(/query parameters or fragments/);
    }
  );

  it.each([
    ["WORKER_CONCURRENCY", "0"],
    ["WORKER_CONCURRENCY", "17"],
    ["WORKER_POLL_INTERVAL_MS", "99"],
    ["WORKER_POLL_INTERVAL_MS", "30001"],
    ["WORKER_SHUTDOWN_GRACE_MS", "999"],
    ["WORKER_SHUTDOWN_GRACE_MS", "120001"],
  ])("rejects an out-of-range %s value", (name, value) => {
    expect(() => loadWorkerEnv({ ...validEnv, [name]: value })).toThrow(name);
  });
});
