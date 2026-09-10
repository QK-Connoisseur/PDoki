import { afterEach, describe, expect, it, vi } from "vitest";
import { contentApi, contentMediaUrl } from "./contentApi";
import { apiClient, createApiClient } from "../lib/apiClient";

const mediaId = "b38d0e64-f70d-4c99-a54f-225fdb87c74c";
const media = {
  id: mediaId,
  mimeType: "image/png",
  byteSize: 20,
  url: `/api/v1/content/media/${mediaId}`,
};
const draft = {
  id: "f239064d-89b0-4564-8dc0-6b4e1633f6ea",
  body: "A safe sample",
  state: "DRAFT",
  createdAt: "2026-09-09T12:00:00Z",
  publishedAt: null,
  creator: {
    id: "fd5f4331-4c23-4009-89e9-43d8c0a4cfa3",
    displayName: "Sample Creator",
  },
  media: [media],
};

afterEach(() => vi.restoreAllMocks());

describe("content API", () => {
  it("sends the file bytes unchanged, with credentials and request and retry identifiers", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => "application/json" },
      json: async () => ({ media }),
    });
    const client = createApiClient({
      baseUrl: "http://127.0.0.1:3000/api/v1",
      fetchImpl,
    });
    vi.spyOn(apiClient, "request").mockImplementation(client.request);
    const file = new File(["safe sample bytes"], "sample.png", {
      type: "image/png",
    });

    await contentApi.upload(file, "upload-retry-id");

    const [url, request] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:3000/api/v1/content/media");
    expect(request.body).toBe(file);
    expect(request.credentials).toBe("include");
    expect(request.headers["Content-Type"]).toBe("image/png");
    expect(request.headers["Idempotency-Key"]).toBe("upload-retry-id");
    expect(request.headers["X-Request-Id"]).toBeTruthy();
  });

  it("sends only the supported draft fields and an idempotency key", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ post: draft });
    await contentApi.createDraft("A safe sample", [mediaId], "draft-retry-id");
    expect(post).toHaveBeenCalledWith(
      "/content/posts",
      {
        body: "A safe sample",
        mediaIds: [mediaId],
        safeSampleConfirmed: true,
      },
      { headers: { "Idempotency-Key": "draft-retry-id" } }
    );
  });

  it("rejects malformed successful responses instead of treating a write as saved", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValue({ post: { id: draft.id } });
    await expect(
      contentApi.createDraft("A safe sample", [mediaId], "draft-retry-id")
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE", status: 502 });
  });

  it("rejects feed media that points outside the protected API route", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      posts: [
        {
          ...draft,
          media: [{ ...media, url: "https://public.example/original.jpg" }],
        },
      ],
      nextCursor: null,
    });
    await expect(contentApi.feed()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("resolves server media paths without duplicating the API prefix", () => {
    expect(
      contentMediaUrl(
        `/api/v1/content/media/${mediaId}`,
        "http://127.0.0.1:3000/api/v1"
      )
    ).toBe(`http://127.0.0.1:3000/api/v1/content/media/${mediaId}`);
  });

  it.each([
    `https://untrusted.example/api/v1/content/media/${mediaId}`,
    `/api/v1/content/media/${mediaId}?token=public`,
    "/api/v1/content/media/../../auth/logout",
    "https://user:password@127.0.0.1:3000/api/v1/content/media/" + mediaId,
  ])("rejects unexpected media destinations: %s", (url) => {
    expect(() => contentMediaUrl(url, "http://127.0.0.1:3000/api/v1")).toThrow(
      "Invalid content media URL"
    );
  });
});
