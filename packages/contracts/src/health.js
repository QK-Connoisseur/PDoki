import { z } from "zod";
export const HealthResponseSchema = z.object({
    status: z.literal("ok"),
    uptimeSeconds: z.number(),
    version: z.string(),
});
export const ReadyResponseSchema = z.object({
    status: z.enum(["ready", "degraded"]),
    checks: z.object({
        database: z.enum(["up", "down"]),
    }),
});
//# sourceMappingURL=health.js.map