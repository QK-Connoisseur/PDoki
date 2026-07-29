import { z } from "zod";

export const apiErrorCodes = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "EMAIL_UNVERIFIED",
  "INTERNAL",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum(apiErrorCodes),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
