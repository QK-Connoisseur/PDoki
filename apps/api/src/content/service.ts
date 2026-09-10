import { createHash } from "node:crypto";
import type { CreateContentPostRequest } from "@pumdoki/contracts";
import type { MediaAsset, Prisma, PrismaClient } from "@pumdoki/database";
import { HttpError } from "../errors.js";
import type { MediaStorage } from "./storage.js";

const includePost = {
  creator: { select: { id: true, displayName: true } },
  media: { orderBy: { position: "asc" as const } },
};
type PostWithMedia = Prisma.ContentPostGetPayload<{
  include: typeof includePost;
}>;
const missing = () => new HttpError(404, "NOT_FOUND", "Content not found");
const digest = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");

export function mediaContract(media: MediaAsset) {
  return {
    id: media.id,
    mimeType: media.mimeType,
    byteSize: media.byteSize,
    url: `/api/v1/content/media/${media.id}`,
  };
}
function postContract(post: PostWithMedia) {
  return {
    id: post.id,
    body: post.body,
    state: post.state,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    creator: post.creator,
    media: post.state === "REMOVED" ? [] : post.media.map(mediaContract),
  };
}
function assertDigest(actual: string, expected: string) {
  if (actual !== expected)
    throw new HttpError(
      409,
      "CONFLICT",
      "This request key was already used for different content"
    );
}

async function lockCreator(tx: Prisma.TransactionClient, ownerId: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${ownerId}::uuid FOR UPDATE`;
  const creator = await tx.user.findUnique({ where: { id: ownerId } });
  if (
    !creator ||
    creator.status !== "ACTIVE" ||
    creator.role !== "CREATOR" ||
    !creator.emailVerifiedAt ||
    !creator.email.endsWith(".example")
  ) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "A verified test creator is required"
    );
  }
}

// No published post accepts edits or media replacement. Paid audiences,
// production eligibility and offers must be added through versioned revisions.
export function createContentService(db: PrismaClient, storage: MediaStorage) {
  const visible = {
    state: "PUBLISHED" as const,
    testOnly: true,
    creator: {
      status: "ACTIVE" as const,
      role: "CREATOR" as const,
      emailVerifiedAt: { not: null },
      email: { endsWith: ".example" },
    },
  };
  return {
    async upload(
      ownerId: string,
      bytes: Buffer,
      mimeType: string,
      key: string
    ) {
      const requestDigest = digest(
        Buffer.concat([Buffer.from(`${mimeType}\0`), bytes])
      );
      const existing = await db.mediaAsset.findUnique({
        where: { ownerId_idempotencyKey: { ownerId, idempotencyKey: key } },
      });
      if (existing) {
        assertDigest(existing.requestDigest, requestDigest);
        return mediaContract(existing);
      }
      const stored = await storage.put(bytes, mimeType);
      let retained = false;
      try {
        const asset = await db.$transaction(async (tx) => {
          await lockCreator(tx, ownerId);
          // Serialize quota reservations across API instances. Stored bytes are
          // committed only if this transaction records their immutable identity.
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(5050901)::text`;
          const duplicate = await tx.mediaAsset.findUnique({
            where: { ownerId_idempotencyKey: { ownerId, idempotencyKey: key } },
          });
          if (duplicate) {
            assertDigest(duplicate.requestDigest, requestDigest);
            return duplicate;
          }
          const totals = await tx.mediaAsset.aggregate({
            _sum: { byteSize: true },
            _count: true,
          });
          const owned = await tx.mediaAsset.count({ where: { ownerId } });
          if (
            (totals._sum.byteSize ?? 0) + stored.byteSize > 5 * 1024 ** 3 ||
            totals._count >= 250 ||
            owned >= 100
          ) {
            throw new HttpError(
              409,
              "CONFLICT",
              "Local sample storage limit reached"
            );
          }
          return tx.mediaAsset.create({
            data: {
              ownerId,
              storageKey: stored.key,
              storageBackend: stored.backend ?? "LOCAL",
              mimeType: stored.mimeType,
              byteSize: stored.byteSize,
              sha256: stored.sha256,
              idempotencyKey: key,
              requestDigest,
            },
          });
        });
        retained = asset.storageKey === stored.key;
        return mediaContract(asset);
      } finally {
        if (!retained) {
          // A rejected transaction promise can mean the COMMIT response was
          // lost. Never delete bytes just because the caller did not observe
          // success. An unavailable reference check must leave a private
          // orphan, rather than risk breaking a committed media record.
          let confirmedUnreferenced = false;
          try {
            confirmedUnreferenced = await db.$transaction(async (tx) => {
              // Wait for any in-flight COMMIT/rollback of the original upload
              // before interpreting an absent reference as safe to remove.
              await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${ownerId}::uuid FOR UPDATE`;
              return (
                (await tx.mediaAsset.findUnique({
                  where: { storageKey: stored.key },
                  select: { id: true },
                })) === null
              );
            });
          } catch {
            // Private objects are not deliverable without database access.
          }
          if (confirmedUnreferenced)
            await storage.remove(stored.key, stored.backend ?? "LOCAL");
        }
      }
    },

    async create(
      ownerId: string,
      input: CreateContentPostRequest,
      key: string
    ) {
      const requestDigest = digest(JSON.stringify(input));
      return db.$transaction(async (tx) => {
        await lockCreator(tx, ownerId);
        const existing = await tx.contentPost.findUnique({
          where: {
            creatorId_idempotencyKey: {
              creatorId: ownerId,
              idempotencyKey: key,
            },
          },
          include: includePost,
        });
        if (existing) {
          assertDigest(existing.requestDigest, requestDigest);
          return postContract(existing);
        }
        const assets = await tx.mediaAsset.findMany({
          where: {
            id: { in: input.mediaIds },
            ownerId,
            postId: null,
            testOnly: true,
          },
        });
        if (assets.length !== input.mediaIds.length) throw missing();
        const post = await tx.contentPost.create({
          data: {
            creatorId: ownerId,
            body: input.body,
            idempotencyKey: key,
            requestDigest,
          },
        });
        for (const [position, id] of input.mediaIds.entries()) {
          const attached = await tx.mediaAsset.updateMany({
            where: { id, ownerId, postId: null },
            data: { postId: post.id, position },
          });
          if (attached.count !== 1)
            throw new HttpError(
              409,
              "CONFLICT",
              "Media is already attached to another post"
            );
        }
        return postContract(
          await tx.contentPost.findUniqueOrThrow({
            where: { id: post.id },
            include: includePost,
          })
        );
      });
    },

    async transition(
      ownerId: string,
      id: string,
      action: "publish" | "remove"
    ) {
      return db.$transaction(async (tx) => {
        await lockCreator(tx, ownerId);
        const post = await tx.contentPost.findFirst({
          where: { id, creatorId: ownerId, testOnly: true },
          include: includePost,
        });
        if (!post || (action === "publish" && post.state === "REMOVED"))
          throw missing();
        if (action === "publish" && post.state === "DRAFT") {
          if (!post.media.length)
            throw new HttpError(409, "CONFLICT", "A post needs valid media");
          await tx.contentPost.update({
            where: { id },
            data: { state: "PUBLISHED", publishedAt: new Date() },
          });
        } else if (action === "remove" && post.state !== "REMOVED") {
          await tx.contentPost.update({
            where: { id },
            data: { state: "REMOVED", removedAt: new Date() },
          });
        }
        return postContract(
          await tx.contentPost.findUniqueOrThrow({
            where: { id },
            include: includePost,
          })
        );
      });
    },

    async mine(ownerId: string) {
      const posts = await db.contentPost.findMany({
        where: {
          creatorId: ownerId,
          testOnly: true,
          state: { not: "REMOVED" },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
        include: includePost,
      });
      return posts.map(postContract);
    },

    async feed(cursor?: string) {
      const boundary = cursor
        ? await db.contentPost.findFirst({ where: { ...visible, id: cursor } })
        : null;
      if (cursor && !boundary) throw missing();
      const posts = await db.contentPost.findMany({
        where: {
          ...visible,
          ...(boundary
            ? {
                OR: [
                  { publishedAt: { lt: boundary.publishedAt! } },
                  {
                    publishedAt: boundary.publishedAt,
                    id: { lt: boundary.id },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: 21,
        include: includePost,
      });
      return {
        posts: posts.slice(0, 20).map(postContract),
        nextCursor: posts.length > 20 ? posts[19]!.id : null,
      };
    },

    async readMedia(userId: string, id: string) {
      const asset = await db.mediaAsset.findFirst({
        where: {
          id,
          testOnly: true,
          owner: {
            status: "ACTIVE",
            role: "CREATOR",
            emailVerifiedAt: { not: null },
            email: { endsWith: ".example" },
          },
          OR: [
            {
              ownerId: userId,
              OR: [
                { postId: null },
                { post: { state: { not: "REMOVED" }, testOnly: true } },
              ],
            },
            { post: visible },
          ],
        },
      });
      if (!asset) throw missing();
      const bytes = await storage.read(asset.storageKey, asset.storageBackend);
      // Disk corruption/replacement must not silently change a sealed manifest.
      if (bytes.length !== asset.byteSize || digest(bytes) !== asset.sha256)
        throw missing();
      return { asset, bytes };
    },
  };
}
