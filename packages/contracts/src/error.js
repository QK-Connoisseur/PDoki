import { z } from "zod";
export const apiErrorCodes = [
    "BAD_REQUEST",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "RATE_LIMITED",
    "INTERNAL",
];
export const ApiErrorSchema = z.object({
    error: z.object({
        code: z.enum(apiErrorCodes),
        message: z.string(),
        requestId: z.string(),
        details: z.unknown().optional(),
    }),
});
//# sourceMappingURL=error.js.map