import { createHash, randomUUID } from "node:crypto";
import { PHASE2_CANARY_JOB_KIND } from "./payloads.js";

export interface CanaryCliInput {
  idempotencyKey: string;
  requestId: string;
  correlationId: string | null;
  requestDigest: string;
}

const safeIdentifier = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const allowedArguments = new Set([
  "--idempotency-key",
  "--request-id",
  "--correlation-id",
]);

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function assertSafeIdentifier(
  name: string,
  value: string,
  maximumLength: number
): void {
  if (value.length > maximumLength || !safeIdentifier.test(value)) {
    throw new Error(
      `${name} must use 1-${maximumLength} safe identifier characters`
    );
  }
}

export function parseCanaryCliInput(
  args: string[],
  nodeEnv: string | undefined = process.env.NODE_ENV
): CanaryCliInput {
  if (nodeEnv !== "development" && nodeEnv !== "test") {
    throw new Error("The Phase 2 canary CLI is local-only");
  }
  if (args.length % 2 !== 0) throw new Error("Incomplete local canary option");
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index]!;
    if (!allowedArguments.has(option) || seen.has(option)) {
      throw new Error("Unknown or repeated local canary option");
    }
    seen.add(option);
  }

  const idempotencyKey = readOption(args, "--idempotency-key");
  if (!idempotencyKey) {
    throw new Error("A non-secret --idempotency-key is required");
  }
  assertSafeIdentifier("--idempotency-key", idempotencyKey, 200);

  const requestId =
    readOption(args, "--request-id") ?? `local-canary-${randomUUID()}`;
  assertSafeIdentifier("--request-id", requestId, 64);
  const correlationId = readOption(args, "--correlation-id") ?? null;
  if (correlationId !== null) {
    assertSafeIdentifier("--correlation-id", correlationId, 64);
  }

  return {
    idempotencyKey,
    requestId,
    correlationId,
    requestDigest: createHash("sha256")
      .update(PHASE2_CANARY_JOB_KIND)
      .digest("hex"),
  };
}
