import type { Pool } from "pg";
import { describe, expect, it, vi } from "vitest";
import { createPgWorkerRepository } from "./repository.js";

function probeHarness(row: Record<string, unknown> | undefined) {
  const query = vi.fn(async () => ({ rows: row ? [row] : [] }));
  const end = vi.fn(async () => undefined);
  const pool = { query, end } as unknown as Pool;
  return { repository: createPgWorkerRepository(pool), query };
}

describe("createPgWorkerRepository probe", () => {
  it("accepts the worker contract only under read-committed isolation", async () => {
    const test = probeHarness({
      ready: true,
      transaction_isolation: "read committed",
    });

    await expect(test.repository.probe()).resolves.toBe(true);
    expect(test.query).toHaveBeenCalledOnce();
    expect(String(test.query.mock.calls[0]?.[0])).toContain("current_setting");
  });

  it.each(["serializable", "repeatable read", undefined])(
    "fails closed when effective transaction isolation is %s",
    async (transactionIsolation) => {
      const test = probeHarness({
        ready: true,
        transaction_isolation: transactionIsolation,
      });

      await expect(test.repository.probe()).resolves.toBe(false);
    }
  );
});
