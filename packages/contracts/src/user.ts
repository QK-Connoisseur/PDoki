import { z } from "zod";

export const userRoles = ["MEMBER", "CREATOR", "MODERATOR", "ADMIN"] as const;

export type UserRole = (typeof userRoles)[number];

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string().min(1).max(50),
  role: z.enum(userRoles),
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof UserSchema>;
