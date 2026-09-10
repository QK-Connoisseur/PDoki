import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import type { Express } from "express";
import sharp from "sharp";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  ContentFeedResponseSchema,
  ContentPostResponseSchema,
} from "@pumdoki/contracts";
import type { PrismaClient, UserRole } from "@pumdoki/database";
import { hashSessionToken, SESSION_COOKIE_NAME } from "./auth/session.js";
import { loadTestDatabase } from "./test/database.js";
import { testApp } from "./test/testApp.js";

const BASE = "/api/v1/content";
const ORIGIN = "http://localhost:5173";
let db: PrismaClient;
let directory: string;
let app: Express;
let image: Buffer;
const userIds: string[] = [];

function freshApp(): Express {
  return testApp({
    db,
    env: {
      CONTENT_MODE: "development",
      CONTENT_STORAGE_DIRECTORY: directory,
      WEB_ORIGIN: ORIGIN,
    },
  });
}

async function account(
  role: UserRole = "CREATOR",
  options: { verified?: boolean; domain?: string } = {}
) {
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  await db.user.create({
    data: {
      id,
      email: `${id}@${options.domain ?? "content.pumdoki.example"}`,
      displayName: `Content test ${role}`,
      passwordHash: "unused-content-test-password-hash",
      role,
      emailVerifiedAt: options.verified === false ? null : new Date(),
      sessions: {
        create: {
          tokenHash: hashSessionToken(token),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      },
    },
  });
  userIds.push(id);
  return { id, cookie: `${SESSION_COOKIE_NAME}=${token}` };
}

function upload(cookie: string, key = randomUUID(), bytes = image) {
  return request(app)
    .post(`${BASE}/media`)
    .set("Cookie", cookie)
    .set("Origin", ORIGIN)
    .set("Idempotency-Key", key)
    .set("Content-Type", "image/png")
    .send(bytes);
}

function createPost(
  cookie: string,
  mediaIds: string[],
  key = randomUUID(),
  body = "A safe sample post"
) {
  return request(app)
    .post(`${BASE}/posts`)
    .set("Cookie", cookie)
    .set("Origin", ORIGIN)
    .set("Idempotency-Key", key)
    .send({ body, mediaIds, safeSampleConfirmed: true });
}

async function draft(cookie: string) {
  const uploaded = await upload(cookie);
  expect(uploaded.status).toBe(201);
  const created = await createPost(cookie, [uploaded.body.media.id]);
  expect(created.status).toBe(201);
  return ContentPostResponseSchema.parse(created.body).post;
}

function publish(cookie: string, id: string) {
  return request(app)
    .post(`${BASE}/posts/${id}/publish`)
    .set("Cookie", cookie)
    .set("Origin", ORIGIN)
    .send({});
}

function remove(cookie: string, id: string) {
  return request(app)
    .delete(`${BASE}/posts/${id}`)
    .set("Cookie", cookie)
    .set("Origin", ORIGIN);
}

async function feed(cookie: string) {
  const response = await request(app).get(`${BASE}/feed`).set("Cookie", cookie);
  expect(response.status).toBe(200);
  return ContentFeedResponseSchema.parse(response.body);
}

beforeAll(async () => {
  db = await loadTestDatabase();
  image = await sharp({
    create: { width: 16, height: 16, channels: 3, background: "#b25f87" },
  })
    .png()
    .toBuffer();
});

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "pumdoki-content-integration-"));
  app = freshApp();
});

afterEach(async () => {
  // Only this test's UUIDs are eligible for cleanup. Existing developer content
  // and other integration suites are never reset or deleted.
  if (userIds.length) {
    await db.mediaAsset.deleteMany({ where: { ownerId: { in: userIds } } });
    await db.contentPost.deleteMany({ where: { creatorId: { in: userIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    userIds.length = 0;
  }
  await rm(directory, { recursive: true, force: true });
});

afterAll(async () => {
  await db?.$disconnect();
});

describe("local content publishing and authorized delivery", () => {
  it("keeps routes disabled by default and rejects production activation", async () => {
    expect((await request(testApp({ db })).get(`${BASE}/feed`)).status).toBe(
      404
    );
    expect(() =>
      testApp({
        db,
        env: {
          NODE_ENV: "production",
          CONTENT_MODE: "development",
          CONTENT_STORAGE_DIRECTORY: directory,
        },
      })
    ).toThrow(/production/);
    expect(() =>
      testApp({
        db,
        env: {
          CONTENT_MODE: "development",
          CONTENT_STORAGE_DIRECTORY: directory,
          WEB_ORIGIN: "https://review.pumdoki.example",
        },
      })
    ).toThrow(/loopback/);
  });

  it("requires a verified test session, creator role for writes, and the exact write origin", async () => {
    const creator = await account();
    const member = await account("MEMBER");
    const unverified = await account("CREATOR", { verified: false });
    const outsideTestDomain = await account("CREATOR", {
      domain: "content.pumdoki.test",
    });

    expect((await request(app).get(`${BASE}/feed`)).status).toBe(401);
    expect(
      (
        await request(app)
          .post(`${BASE}/media`)
          .set("Origin", ORIGIN)
          .set("Content-Type", "image/png")
          .send(image)
      ).status
    ).toBe(401);
    expect((await upload(member.cookie)).status).toBe(403);
    expect((await upload(unverified.cookie)).body.error.code).toBe(
      "EMAIL_UNVERIFIED"
    );
    expect((await upload(outsideTestDomain.cookie)).status).toBe(403);
    for (const origin of [undefined, "https://wrong.pumdoki.example"]) {
      const attempt = request(app)
        .post(`${BASE}/media`)
        .set("Cookie", creator.cookie)
        .set("Idempotency-Key", randomUUID())
        .set("Content-Type", "image/png");
      if (origin) attempt.set("Origin", origin);
      expect((await attempt.send(image)).status).toBe(403);
    }
    expect(
      await db.mediaAsset.count({ where: { ownerId: { in: userIds } } })
    ).toBe(0);
  });

  it("persists a private draft and media across fresh application instances", async () => {
    const creator = await account();
    const stranger = await account();
    const member = await account("MEMBER");
    const post = await draft(creator.cookie);
    expect(post.state).toBe("DRAFT");
    const mediaUrl = post.media[0]!.url;
    const firstRead = await request(app)
      .get(mediaUrl)
      .set("Cookie", creator.cookie);
    expect(firstRead.status).toBe(200);
    expect(firstRead.body).toBeInstanceOf(Buffer);

    app = freshApp();
    const restored = await request(app)
      .get(`${BASE}/posts/mine`)
      .set("Cookie", creator.cookie);
    expect(restored.status).toBe(200);
    expect(restored.body.posts).toContainEqual(post);
    const secondRead = await request(app)
      .get(mediaUrl)
      .set("Cookie", creator.cookie);
    expect(secondRead.status).toBe(200);
    expect(secondRead.body).toEqual(firstRead.body);
    expect(
      (await feed(member.cookie)).posts.some((item) => item.id === post.id)
    ).toBe(false);
    expect((await request(app).get(mediaUrl)).status).toBe(401);
    expect(
      (await request(app).get(mediaUrl).set("Cookie", member.cookie)).status
    ).toBe(404);
    expect(
      (await request(app).get(mediaUrl).set("Cookie", stranger.cookie)).status
    ).toBe(404);
    expect((await publish(stranger.cookie, post.id)).status).toBe(404);
    expect((await remove(stranger.cookie, post.id)).status).toBe(404);
  });

  it("publishes persisted feed content and serves authenticated byte ranges without leaking storage identity", async () => {
    const creator = await account();
    const member = await account("MEMBER");
    const post = await draft(creator.cookie);
    expect((await publish(creator.cookie, post.id)).status).toBe(200);
    app = freshApp();
    const published = (await feed(member.cookie)).posts.find(
      (item) => item.id === post.id
    );
    expect(published?.state).toBe("PUBLISHED");
    const stored = await db.mediaAsset.findUniqueOrThrow({
      where: { id: post.media[0]!.id },
    });
    const payload = JSON.stringify(published);
    for (const privateValue of [
      stored.storageKey,
      stored.sha256,
      stored.requestDigest,
      stored.idempotencyKey,
      directory,
    ]) {
      expect(payload).not.toContain(privateValue);
    }
    const url = post.media[0]!.url;
    const full = await request(app).get(url).set("Cookie", member.cookie);
    expect(full.status).toBe(200);
    expect(full.headers["cache-control"]).toBe("private, no-store");
    expect(full.headers["content-type"]).toBe("image/png");
    expect(full.headers["etag"]).toBeUndefined();
    const part = await request(app)
      .get(url)
      .set("Cookie", member.cookie)
      .set("Range", "bytes=0-7");
    expect(part.status).toBe(206);
    expect(part.headers["content-range"]).toBe(`bytes 0-7/${full.body.length}`);
    expect(part.body).toEqual(full.body.subarray(0, 8));
    const suffix = await request(app)
      .get(url)
      .set("Cookie", member.cookie)
      .set("Range", "bytes=-8");
    expect(suffix.status).toBe(206);
    expect(suffix.body).toEqual(full.body.subarray(-8));
    const invalidRange = await request(app)
      .get(url)
      .set("Cookie", member.cookie)
      .set("Range", `bytes=${full.body.length}-`);
    expect(invalidRange.status).toBe(416);
    expect(invalidRange.headers["content-type"]).toMatch(/^application\/json/);
    expect(invalidRange.body.error).toMatchObject({
      code: "BAD_REQUEST",
      requestId: expect.any(String),
    });
    expect(
      (
        await request(app)
          .get(url)
          .set("Cookie", member.cookie)
          .set("Range", "bytes=0-1,4-5")
      ).status
    ).toBe(416);
  });

  it("immediately hides a suspended creator's published content and denies existing media URLs", async () => {
    const creator = await account();
    const member = await account("MEMBER");
    const post = await draft(creator.cookie);
    expect((await publish(creator.cookie, post.id)).status).toBe(200);
    expect(
      (await request(app).get(post.media[0]!.url).set("Cookie", member.cookie))
        .status
    ).toBe(200);
    await db.user.update({
      where: { id: creator.id },
      data: { status: "SUSPENDED" },
    });
    expect(
      (await feed(member.cookie)).posts.some((item) => item.id === post.id)
    ).toBe(false);
    expect(
      (
        await request(app)
          .get(post.media[0]!.url)
          .set("Cookie", member.cookie)
          .set("Range", "bytes=0-7")
      ).status
    ).toBe(404);
    expect(
      (await request(app).get(post.media[0]!.url).set("Cookie", creator.cookie))
        .status
    ).toBe(403);
  });

  it("revokes removed media for everyone, including conditional reads, and cannot republish it", async () => {
    const creator = await account();
    const member = await account("MEMBER");
    const post = await draft(creator.cookie);
    expect((await publish(creator.cookie, post.id)).status).toBe(200);
    const removed = await remove(creator.cookie, post.id);
    expect(removed.status).toBe(200);
    expect(removed.body.post).toMatchObject({ state: "REMOVED", media: [] });
    expect((await remove(creator.cookie, post.id)).status).toBe(200);
    expect((await publish(creator.cookie, post.id)).status).toBe(404);
    expect(
      (await feed(member.cookie)).posts.some((item) => item.id === post.id)
    ).toBe(false);
    for (const cookie of [creator.cookie, member.cookie]) {
      const read = await request(app)
        .get(post.media[0]!.url)
        .set("Cookie", cookie)
        .set("If-None-Match", "*")
        .set(
          "If-Modified-Since",
          new Date(Date.now() + 86400000).toUTCString()
        );
      expect(read.status).toBe(404);
      expect(read.headers["cache-control"]).toBe("private, no-store");
    }
  });

  it("makes concurrent upload and post retries idempotent while rejecting changed payloads", async () => {
    const creator = await account();
    const uploadKey = randomUUID();
    const [first, retry] = await Promise.all([
      upload(creator.cookie, uploadKey),
      upload(creator.cookie, uploadKey),
    ]);
    expect(first.status).toBe(201);
    expect(retry.status).toBe(201);
    expect(retry.body).toEqual(first.body);
    expect(await db.mediaAsset.count({ where: { ownerId: creator.id } })).toBe(
      1
    );
    expect(await readdir(directory)).toHaveLength(1);
    const different = await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#111111" },
    })
      .png()
      .toBuffer();
    expect((await upload(creator.cookie, uploadKey, different)).status).toBe(
      409
    );

    const mediaIds = [first.body.media.id];
    const postKey = randomUUID();
    const [created, repeated] = await Promise.all([
      createPost(creator.cookie, mediaIds, postKey),
      createPost(creator.cookie, mediaIds, postKey),
    ]);
    expect(created.status).toBe(201);
    expect(repeated.status).toBe(201);
    expect(repeated.body).toEqual(created.body);
    expect(
      await db.contentPost.count({ where: { creatorId: creator.id } })
    ).toBe(1);
    expect(
      (
        await createPost(
          creator.cookie,
          mediaIds,
          postKey,
          "Changed after retry"
        )
      ).status
    ).toBe(409);
    expect((await createPost(creator.cookie, mediaIds)).status).toBe(404);
  });

  it("rejects another creator's media and unsupported paid, explicit or unsafe post fields", async () => {
    const owner = await account();
    const stranger = await account();
    const uploaded = await upload(owner.cookie);
    expect(uploaded.status).toBe(201);
    const mediaId = uploaded.body.media.id;
    expect((await createPost(stranger.cookie, [mediaId])).status).toBe(404);
    const valid = {
      body: "Safe sample",
      mediaIds: [mediaId],
      safeSampleConfirmed: true,
    };
    const invalid = [
      { ...valid, price: 10 },
      { ...valid, audience: "SUBSCRIBERS" },
      { ...valid, explicit: true },
      { ...valid, safeSampleConfirmed: false },
      { ...valid, mediaIds: [mediaId, mediaId] },
      { ...valid, mediaIds: [] },
    ];
    for (const body of invalid) {
      const result = await request(app)
        .post(`${BASE}/posts`)
        .set("Cookie", owner.cookie)
        .set("Origin", ORIGIN)
        .set("Idempotency-Key", randomUUID())
        .send(body);
      expect(result.status).toBe(400);
    }
    const malformedUpload = await upload(
      owner.cookie,
      randomUUID(),
      Buffer.from("not a decoded PNG")
    );
    expect(malformedUpload.status).toBe(400);
    const compressed = await request(app)
      .post(`${BASE}/media`)
      .set("Cookie", owner.cookie)
      .set("Origin", ORIGIN)
      .set("Idempotency-Key", randomUUID())
      .set("Content-Type", "image/png")
      .set("Content-Encoding", "gzip")
      .send(gzipSync(image));
    expect(compressed.status).toBe(415);
    expect(compressed.headers["content-type"]).toMatch(/^application\/json/);
    expect(compressed.body.error).toMatchObject({ code: "BAD_REQUEST" });
    expect(
      await db.contentPost.count({ where: { creatorId: { in: userIds } } })
    ).toBe(0);
  });

  it("enforces manifest ownership, positions and sealed identities inside PostgreSQL", async () => {
    const creator = await account();
    const stranger = await account();
    const post = await draft(creator.cookie);
    const foreignPost = await draft(stranger.cookie);
    const uploaded = await upload(creator.cookie);
    expect(uploaded.status).toBe(201);
    const asset = await db.mediaAsset.findUniqueOrThrow({
      where: { id: uploaded.body.media.id },
    });

    await expect(
      db.mediaAsset.update({
        where: { id: asset.id },
        data: { postId: post.id, position: null },
      })
    ).rejects.toThrow();
    await expect(
      db.mediaAsset.update({
        where: { id: asset.id },
        data: { postId: foreignPost.id, position: 1 },
      })
    ).rejects.toMatchObject({ code: "P2003" });
    await expect(
      db.mediaAsset.update({
        where: { id: asset.id },
        data: { storageKey: randomBytes(32).toString("hex") },
      })
    ).rejects.toThrow();
    await expect(
      db.contentPost.update({
        where: { id: post.id },
        data: { body: "A replacement meaning after sealing" },
      })
    ).rejects.toThrow();

    expect((await publish(creator.cookie, post.id)).status).toBe(200);
    await expect(
      db.mediaAsset.create({
        data: {
          ownerId: creator.id,
          postId: post.id,
          position: 1,
          storageKey: randomBytes(32).toString("hex"),
          mimeType: asset.mimeType,
          byteSize: asset.byteSize,
          sha256: asset.sha256,
          idempotencyKey: randomUUID(),
          requestDigest: asset.requestDigest,
        },
      })
    ).rejects.toThrow();
    const unchanged = await db.mediaAsset.findUniqueOrThrow({
      where: { id: asset.id },
    });
    expect(unchanged.storageBackend).toBe("LOCAL");
    await expect(
      db.mediaAsset.update({
        where: { id: asset.id },
        data: { storageBackend: "R2" },
      })
    ).rejects.toThrow();
    expect(unchanged).toMatchObject({
      postId: null,
      position: null,
      storageKey: asset.storageKey,
      ownerId: creator.id,
    });
    expect(
      (await db.contentPost.findUniqueOrThrow({ where: { id: post.id } })).body
    ).toBe(post.body);
  });

  it("fails closed if stored bytes are replaced after the media identity was sealed", async () => {
    const creator = await account();
    const member = await account("MEMBER");
    const post = await draft(creator.cookie);
    expect((await publish(creator.cookie, post.id)).status).toBe(200);
    const asset = await db.mediaAsset.findUniqueOrThrow({
      where: { id: post.media[0]!.id },
    });
    await writeFile(
      join(directory, asset.storageKey),
      Buffer.alloc(asset.byteSize, 0)
    );
    expect(
      (await request(app).get(post.media[0]!.url).set("Cookie", member.cookie))
        .status
    ).toBe(404);
    expect(
      (await request(app).get(post.media[0]!.url).set("Cookie", creator.cookie))
        .status
    ).toBe(404);
  });
});
