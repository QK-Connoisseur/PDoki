import express from "express";
import { z } from "zod";
import {
  ContentFeedQuerySchema,
  ContentIdParamsSchema,
  CreateContentPostRequestSchema,
  type CreateContentPostRequest,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import {
  requireAuth,
  requireRole,
  requireVerifiedEmail,
} from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createContentService } from "../content/service.js";
import { MediaStorageUnavailableError } from "../content/r2.js";
import {
  MediaValidationError,
  MediaNotFoundError,
  type MediaStorage,
} from "../content/storage.js";

function idempotencyKey(req: express.Request): string {
  const parsed = z.uuid().safeParse(req.get("Idempotency-Key"));
  if (!parsed.success)
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "A UUID Idempotency-Key header is required"
    );
  return parsed.data;
}

export function contentRouter({
  db,
  env,
  storage,
}: {
  db: PrismaClient;
  env: Env;
  storage: MediaStorage;
}) {
  const router = express.Router();
  const service = createContentService(db, storage);
  router.use((_req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    res.set("Cross-Origin-Resource-Policy", "same-site");
    next();
  });
  router.use(
    requireAuth(db, env),
    requireRole("MEMBER", "CREATOR"),
    requireVerifiedEmail()
  );
  router.use((req, _res, next) => {
    if (!req.auth!.user.email.endsWith(".example"))
      throw new HttpError(
        403,
        "FORBIDDEN",
        "This local content flow accepts test accounts only"
      );
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.get("Origin") !== env.WEB_ORIGIN
    ) {
      throw new HttpError(403, "FORBIDDEN", "Request origin is not allowed");
    }
    next();
  });

  router.post(
    "/media",
    requireRole("CREATOR"),
    express.raw({
      type: ["image/png", "image/jpeg", "video/mp4"],
      limit: 20 * 1024 ** 2,
      inflate: false,
    }),
    async (req, res) => {
      if (!Buffer.isBuffer(req.body))
        throw new HttpError(
          400,
          "BAD_REQUEST",
          "Upload a PNG, JPEG or MP4 file"
        );
      const media = await service.upload(
        req.auth!.user.id,
        req.body,
        req.get("Content-Type")?.split(";", 1)[0] ?? "",
        idempotencyKey(req)
      );
      res.status(201).json({ media });
    }
  );
  router.post(
    "/posts",
    requireRole("CREATOR"),
    validate({ body: CreateContentPostRequestSchema }),
    async (req, res) => {
      const post = await service.create(
        req.auth!.user.id,
        req.validated!.body as CreateContentPostRequest,
        idempotencyKey(req)
      );
      res.status(201).json({ post });
    }
  );
  router.get("/posts/mine", requireRole("CREATOR"), async (req, res) => {
    res.json({ posts: await service.mine(req.auth!.user.id) });
  });
  router.post(
    "/posts/:id/publish",
    requireRole("CREATOR"),
    validate({
      params: ContentIdParamsSchema,
      body: z.object({}).strict().optional(),
    }),
    async (req, res) => {
      res.json({
        post: await service.transition(
          req.auth!.user.id,
          (req.validated!.params as { id: string }).id,
          "publish"
        ),
      });
    }
  );
  router.delete(
    "/posts/:id",
    requireRole("CREATOR"),
    validate({ params: ContentIdParamsSchema }),
    async (req, res) => {
      res.json({
        post: await service.transition(
          req.auth!.user.id,
          (req.validated!.params as { id: string }).id,
          "remove"
        ),
      });
    }
  );
  router.get(
    "/feed",
    validate({ query: ContentFeedQuerySchema }),
    async (req, res) => {
      res.json(
        await service.feed((req.validated!.query as { cursor?: string }).cursor)
      );
    }
  );
  router.get(
    "/media/:id",
    validate({ params: ContentIdParamsSchema }),
    async (req, res) => {
      const { asset, bytes } = await service.readMedia(
        req.auth!.user.id,
        (req.validated!.params as { id: string }).id
      );
      // Byte requests always authenticate first, even when a browser supplies a
      // conditional header. No shared cache or reusable storage URL is involved.
      const range = req.get("Range");
      let start = 0;
      let end = bytes.length - 1;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match || (!match[1] && !match[2]))
          throw new HttpError(416, "BAD_REQUEST", "Invalid byte range");
        if (match[1]) {
          start = Number(match[1]);
          end = match[2] ? Math.min(Number(match[2]), end) : end;
        } else {
          const suffix = Number(match[2]);
          if (!Number.isSafeInteger(suffix) || suffix <= 0)
            throw new HttpError(416, "BAD_REQUEST", "Invalid byte range");
          start = Math.max(0, bytes.length - suffix);
        }
        if (
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) ||
          start > end ||
          start >= bytes.length
        ) {
          res.set("Content-Range", `bytes */${bytes.length}`);
          throw new HttpError(416, "BAD_REQUEST", "Invalid byte range");
        }
        res
          .status(206)
          .set("Content-Range", `bytes ${start}-${end}/${bytes.length}`);
      }
      res.set({
        "Content-Type": asset.mimeType,
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
        "Content-Length": String(end - start + 1),
      });
      // end() deliberately bypasses Express's automatic ETag/304 handling.
      res.end(bytes.subarray(start, end + 1));
    }
  );
  router.use(
    (
      err: unknown,
      _req: express.Request,
      _res: express.Response,
      next: express.NextFunction
    ) => {
      if (err instanceof MediaValidationError)
        return next(new HttpError(400, "BAD_REQUEST", err.message));
      if (err instanceof MediaNotFoundError)
        return next(new HttpError(404, "NOT_FOUND", "Content not found"));
      if (err instanceof MediaStorageUnavailableError)
        return next(
          new HttpError(
            503,
            "INTERNAL",
            "Private media storage is temporarily unavailable. Please try again."
          )
        );
      if (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        err.type === "entity.too.large"
      )
        return next(
          new HttpError(413, "BAD_REQUEST", "Uploads must be 20 MiB or smaller")
        );
      if (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        err.type === "encoding.unsupported"
      )
        return next(
          new HttpError(
            415,
            "BAD_REQUEST",
            "Compressed uploads are not supported"
          )
        );
      next(err);
    }
  );
  return router;
}
