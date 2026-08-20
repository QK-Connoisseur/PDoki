import { z } from "zod";

export const PHASE2_CANARY_JOB_KIND = "PHASE2_CANARY_V1" as const;
export const PHASE2_CANARY_PAYLOAD_VERSION = 1 as const;

export const Phase2CanaryPayloadV1Schema = z.strictObject({
  canaryIntentId: z.uuid(),
});

export type Phase2CanaryPayloadV1 = z.infer<typeof Phase2CanaryPayloadV1Schema>;

export function parsePhase2CanaryPayload(
  kind: string,
  payloadVersion: number,
  payload: unknown
): Phase2CanaryPayloadV1 {
  if (
    kind !== PHASE2_CANARY_JOB_KIND ||
    payloadVersion !== PHASE2_CANARY_PAYLOAD_VERSION
  ) {
    throw new Error("Unsupported worker job kind or payload version");
  }
  return Phase2CanaryPayloadV1Schema.parse(payload);
}
