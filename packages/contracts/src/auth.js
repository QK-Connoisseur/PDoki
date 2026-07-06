import { z } from "zod";
export const RegisterRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(10).max(128),
    displayName: z.string().min(1).max(50),
});
export const LoginRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});
export const SessionSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    expiresAt: z.iso.datetime(),
});
//# sourceMappingURL=auth.js.map