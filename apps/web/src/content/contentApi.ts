import {
  ContentMediaSchema,
  ContentPostSchema,
  ContentPostResponseSchema,
  ContentFeedResponseSchema,
} from "@pumdoki/contracts";
import type {
  ContentMedia,
  ContentPost,
  ContentFeed,
} from "@pumdoki/contracts";
import { ApiError, apiClient } from "../lib/apiClient";
import { env } from "../lib/env";

export type {
  ContentMedia,
  ContentPost,
  ContentFeed,
} from "@pumdoki/contracts";

type Parser<T> = {
  safeParse: (
    payload: unknown
  ) => { success: true; data: T } | { success: false };
};

function parseResponse<T>(schema: Parser<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError(
      "The content service returned an invalid response. Try again.",
      {
        status: 502,
        code: "INVALID_RESPONSE",
      }
    );
  }
  return result.data;
}

const postsSchema = ContentPostSchema.array();

// API URLs are origin-relative, while apiBaseUrl already contains /api/v1.
// Reject off-origin or unexpected paths instead of attaching session cookies
// to media URLs supplied by another source.
export function contentMediaUrl(path: string, baseUrl = env.apiBaseUrl) {
  const base = new URL(baseUrl, window.location.origin);
  const media = new URL(path, base.origin);
  if (
    media.origin !== base.origin ||
    !/^\/api\/v1\/content\/media\/[a-f\d-]{36}$/i.test(media.pathname) ||
    media.search ||
    media.hash ||
    media.username ||
    media.password
  ) {
    throw new Error("Invalid content media URL");
  }
  return media.href;
}

export const contentApi = {
  upload: async (
    file: File,
    idempotencyKey: string
  ): Promise<{ media: ContentMedia }> => {
    const payload = await apiClient.request("/content/media", {
      method: "POST",
      rawBody: file,
      headers: { "Content-Type": file.type, "Idempotency-Key": idempotencyKey },
    });
    return { media: parseResponse(ContentMediaSchema, payload?.media) };
  },
  createDraft: async (
    body: string,
    mediaIds: string[],
    idempotencyKey: string
  ): Promise<{ post: ContentPost }> =>
    parseResponse(
      ContentPostResponseSchema,
      await apiClient.post(
        "/content/posts",
        {
          body,
          mediaIds,
          safeSampleConfirmed: true,
        },
        { headers: { "Idempotency-Key": idempotencyKey } }
      )
    ),
  mine: async (): Promise<{ posts: ContentPost[] }> => {
    const payload = await apiClient.get("/content/posts/mine");
    return { posts: parseResponse(postsSchema, payload?.posts) };
  },
  feed: async (cursor?: string): Promise<ContentFeed> =>
    parseResponse(
      ContentFeedResponseSchema,
      await apiClient.get(
        `/content/feed${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`
      )
    ),
  publish: async (id: string): Promise<{ post: ContentPost }> =>
    parseResponse(
      ContentPostResponseSchema,
      await apiClient.post(`/content/posts/${encodeURIComponent(id)}/publish`)
    ),
  remove: async (id: string): Promise<{ post: ContentPost }> =>
    parseResponse(
      ContentPostResponseSchema,
      await apiClient.del(`/content/posts/${encodeURIComponent(id)}`)
    ),
};
