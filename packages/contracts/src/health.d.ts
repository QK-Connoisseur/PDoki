import { z } from "zod";
export declare const HealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    uptimeSeconds: z.ZodNumber;
    version: z.ZodString;
}, z.core.$strip>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export declare const ReadyResponseSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ready: "ready";
        degraded: "degraded";
    }>;
    checks: z.ZodObject<{
        database: z.ZodEnum<{
            up: "up";
            down: "down";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;
