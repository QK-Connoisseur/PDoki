import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { parseCanaryCliInput } from "./canaryCli.js";
import { PHASE2_CANARY_JOB_KIND } from "./payloads.js";

describe("parseCanaryCliInput", () => {
  it.each(["", "production", "staging"])(
    "refuses non-local execution mode %s before accepting input",
    (nodeEnv) => {
      expect(() =>
        parseCanaryCliInput(["--idempotency-key", "local-safe-canary"], nodeEnv)
      ).toThrow(/local-only/);
    }
  );

  it("refuses execution when NODE_ENV is unset", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    try {
      expect(() =>
        parseCanaryCliInput(["--idempotency-key", "local-safe-canary"])
      ).toThrow(/local-only/);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("requires a caller-chosen non-secret idempotency key", () => {
    expect(() => parseCanaryCliInput([], "development")).toThrow(
      /--idempotency-key/
    );
  });

  it("generates bounded safe correlation data and a stable non-secret digest", () => {
    const parsed = parseCanaryCliInput(
      ["--idempotency-key", "local-safe-canary"],
      "development"
    );

    expect(parsed.idempotencyKey).toBe("local-safe-canary");
    expect(parsed.requestId).toMatch(
      /^local-canary-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(parsed.requestId.length).toBeLessThanOrEqual(64);
    expect(parsed.correlationId).toBeNull();
    expect(parsed.requestDigest).toBe(
      createHash("sha256").update(PHASE2_CANARY_JOB_KIND).digest("hex")
    );
    expect(parsed.requestDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("accepts explicit bounded safe request and correlation identifiers", () => {
    expect(
      parseCanaryCliInput(
        [
          "--idempotency-key",
          "canary:2026-08-20.1",
          "--request-id",
          "request_local-1",
          "--correlation-id",
          "correlation.local-1",
        ],
        "test"
      )
    ).toMatchObject({
      idempotencyKey: "canary:2026-08-20.1",
      requestId: "request_local-1",
      correlationId: "correlation.local-1",
    });
  });

  it.each([
    ["oversized key", ["--idempotency-key", "x".repeat(201)]],
    ["unsafe key", ["--idempotency-key", "contains a space"]],
    [
      "oversized request ID",
      ["--idempotency-key", "safe-key", "--request-id", "x".repeat(65)],
    ],
    [
      "unsafe correlation ID",
      ["--idempotency-key", "safe-key", "--correlation-id", "../../secret"],
    ],
    ["unknown option", ["--idempotency-key", "safe-key", "--secret", "x"]],
    [
      "repeated option",
      ["--idempotency-key", "safe-key", "--idempotency-key", "another-key"],
    ],
    ["incomplete option", ["--idempotency-key"]],
  ])("rejects %s", (_label, args) => {
    expect(() => parseCanaryCliInput(args, "development")).toThrow();
  });

  it("does not write the idempotency key or other input while parsing", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      parseCanaryCliInput(
        ["--idempotency-key", "must-not-be-logged"],
        "development"
      );
      expect(log).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
      error.mockRestore();
    }
  });
});
