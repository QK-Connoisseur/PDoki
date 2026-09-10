import { z } from "zod";

export const ContentIdParamsSchema = z.object({ id: z.uuid() }).strict();
export const ContentFeedQuerySchema = z
  .object({ cursor: z.uuid().optional() })
  .strict();
export const CreateContentPostRequestSchema = z
  .object({
    body: z.string().trim().max(2000),
    mediaIds: z
      .array(z.uuid())
      .min(1)
      .max(4)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Media must be unique"
      ),
    safeSampleConfirmed: z.literal(true),
  })
  .strict();
export type CreateContentPostRequest = z.infer<
  typeof CreateContentPostRequestSchema
>;
export const ContentMediaSchema = z.object({
  id: z.uuid(),
  mimeType: z.enum(["image/png", "image/jpeg", "video/mp4"]),
  byteSize: z.number().int().positive(),
  url: z.string().regex(/^\/api\/v1\/content\/media\/[0-9a-f-]+$/),
});
export const ContentPostSchema = z.object({
  id: z.uuid(),
  body: z.string(),
  state: z.enum(["DRAFT", "PUBLISHED", "REMOVED"]),
  createdAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
  creator: z.object({ id: z.uuid(), displayName: z.string() }),
  media: z.array(ContentMediaSchema),
});
export const ContentPostResponseSchema = z.object({ post: ContentPostSchema });
export const ContentFeedResponseSchema = z.object({
  posts: z.array(ContentPostSchema),
  nextCursor: z.uuid().nullable(),
});
export type ContentMedia = z.infer<typeof ContentMediaSchema>;
export type ContentPost = z.infer<typeof ContentPostSchema>;
export type ContentFeed = z.infer<typeof ContentFeedResponseSchema>;
