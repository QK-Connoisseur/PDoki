import { z } from "zod";

export const UserPreferencesSchema = z.object({
  showExplicitContent: z.boolean(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const UserPreferencesResponseSchema = z.object({
  preferences: UserPreferencesSchema,
});

export type UserPreferencesResponse = z.infer<
  typeof UserPreferencesResponseSchema
>;

export const UpdateUserPreferencesRequestSchema =
  UserPreferencesSchema.strict();

export type UpdateUserPreferencesRequest = z.infer<
  typeof UpdateUserPreferencesRequestSchema
>;
