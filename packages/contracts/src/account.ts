import { z } from "zod";
import { PasswordSchema } from "./auth.js";

export const DisplayNameSchema = z.string().trim().min(1).max(50);

export const UpdateProfileRequestSchema = z
  .object({ displayName: DisplayNameSchema })
  .strict();

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const ChangeEmailRequestSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    currentPassword: z.string().min(1).max(128),
  })
  .strict();

export type ChangeEmailRequest = z.infer<typeof ChangeEmailRequestSchema>;

export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: PasswordSchema,
  })
  .strict();

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const PasswordChangedResponseSchema = z.object({
  status: z.literal("changed"),
});

export const AccountSessionSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  current: z.boolean(),
});

export type AccountSession = z.infer<typeof AccountSessionSchema>;

export const AccountSessionsResponseSchema = z.object({
  sessions: z.array(AccountSessionSchema),
});

export type AccountSessionsResponse = z.infer<
  typeof AccountSessionsResponseSchema
>;

export const SessionIdParamsSchema = z.object({ sessionId: z.uuid() }).strict();

export type SessionIdParams = z.infer<typeof SessionIdParamsSchema>;
