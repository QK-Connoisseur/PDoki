import { z } from "zod";
import { UserSchema } from "./user.js";

const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());
const PolicyVersionSchema = z.string().trim().min(1).max(100);

export const PasswordSchema = z.string().min(10).max(128);

export const RegisterRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().trim().min(1).max(50),
  ageAttested: z.literal(true),
  acceptedTermsVersion: PolicyVersionSchema,
  acceptedPrivacyVersion: PolicyVersionSchema,
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthUserSchema = UserSchema.extend({
  emailVerified: z.boolean(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const SessionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  expiresAt: z.iso.datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

const VerificationTokenSchema = z.string().trim().min(1).max(256);

export const VerifyEmailConfirmSchema = z.object({
  token: VerificationTokenSchema,
});

export type VerifyEmailConfirmRequest = z.infer<
  typeof VerifyEmailConfirmSchema
>;

export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetConfirmSchema = z.object({
  token: VerificationTokenSchema,
  password: PasswordSchema,
});

export type PasswordResetConfirmRequest = z.infer<
  typeof PasswordResetConfirmSchema
>;
