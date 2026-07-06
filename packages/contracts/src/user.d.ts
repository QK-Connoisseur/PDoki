import { z } from "zod";
export declare const userRoles: readonly ["MEMBER", "CREATOR", "MODERATOR", "ADMIN"];
export type UserRole = (typeof userRoles)[number];
export declare const UserSchema: z.ZodObject<{
    id: z.ZodUUID;
    email: z.ZodEmail;
    displayName: z.ZodString;
    role: z.ZodEnum<{
        MEMBER: "MEMBER";
        CREATOR: "CREATOR";
        MODERATOR: "MODERATOR";
        ADMIN: "ADMIN";
    }>;
    createdAt: z.ZodISODateTime;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
