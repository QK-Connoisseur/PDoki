import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  PHASE2_CANARY_JOB_KIND,
  PHASE2_CANARY_PAYLOAD_VERSION,
  parsePhase2CanaryPayload,
} from "./payloads.js";

describe("parsePhase2CanaryPayload", () => {
  it("accepts only the fixed non-secret versioned canary payload", () => {
    const canaryIntentId = randomUUID();

    expect(
      parsePhase2CanaryPayload(
        PHASE2_CANARY_JOB_KIND,
        PHASE2_CANARY_PAYLOAD_VERSION,
        { canaryIntentId }
      )
    ).toEqual({ canaryIntentId });
  });

  it.each([
    ["UNKNOWN_KIND", PHASE2_CANARY_PAYLOAD_VERSION],
    [PHASE2_CANARY_JOB_KIND, 0],
    [PHASE2_CANARY_JOB_KIND, 2],
  ])("rejects unsupported kind/version pair %s/%s", (kind, version) => {
    expect(() =>
      parsePhase2CanaryPayload(kind, version, {
        canaryIntentId: randomUUID(),
      })
    ).toThrow(/Unsupported worker job kind or payload version/);
  });

  it.each([
    ["missing identifier", {}],
    ["malformed identifier", { canaryIntentId: "not-a-uuid" }],
    [
      "unknown field",
      { canaryIntentId: randomUUID(), description: "not allowlisted" },
    ],
    [
      "raw token field",
      { canaryIntentId: randomUUID(), verificationToken: "secret-token" },
    ],
  ])("rejects a %s payload", (_label, payload) => {
    expect(() =>
      parsePhase2CanaryPayload(
        PHASE2_CANARY_JOB_KIND,
        PHASE2_CANARY_PAYLOAD_VERSION,
        payload
      )
    ).toThrow();
  });
});
