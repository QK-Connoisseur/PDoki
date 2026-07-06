import { z } from "zod";
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    displayName: z.ZodString;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const SessionSchema: z.ZodObject<{
    id: z.ZodUUID;
    userId: z.ZodUUID;
    expiresAt: z.ZodISODateTime;
}, z.core.$strip>;
export type Session = z.infer<typeof SessionSchema>;
