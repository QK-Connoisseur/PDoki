import { z } from "zod";
export declare const apiErrorCodes: readonly ["BAD_REQUEST", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT", "RATE_LIMITED", "INTERNAL"];
export type ApiErrorCode = (typeof apiErrorCodes)[number];
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodEnum<{
            BAD_REQUEST: "BAD_REQUEST";
            UNAUTHORIZED: "UNAUTHORIZED";
            FORBIDDEN: "FORBIDDEN";
            NOT_FOUND: "NOT_FOUND";
            CONFLICT: "CONFLICT";
            RATE_LIMITED: "RATE_LIMITED";
            INTERNAL: "INTERNAL";
        }>;
        message: z.ZodString;
        requestId: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
