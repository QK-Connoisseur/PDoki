import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createR2MediaStorage,
  MediaStorageUnavailableError,
  type R2StorageClient,
} from "./r2.js";
import {
  createLocalMediaStorage,
  MAX_MEDIA_BYTES,
  MediaNotFoundError,
  MediaValidationError,
  type MediaStorage,
} from "./storage.js";

type Command = PutObjectCommand | GetObjectCommand | DeleteObjectCommand;
const accountId = "a".repeat(32);
const bucket = "pumdoki-unit-test-media";
const key = "b".repeat(64);
let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "pumdoki-r2-test-"));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function sampleImage() {
  return sharp({
    create: { width: 20, height: 12, channels: 3, background: "pink" },
  })
    .withMetadata({ exif: { IFD0: { Copyright: "private-source-metadata" } } })
    .png()
    .toBuffer();
}

function response(
  bytes: Buffer,
  overrides: Partial<GetObjectCommandOutput> = {}
): GetObjectCommandOutput {
  return {
    $metadata: {},
    Body: Readable.from([bytes]) as GetObjectCommandOutput["Body"],
    ContentLength: bytes.length,
    ContentType: "image/png",
    ...overrides,
  };
}

function setup(
  handler: (
    command: Command,
    options: { abortSignal: AbortSignal }
  ) => Promise<GetObjectCommandOutput> = async () => ({ $metadata: {} }),
  localStorage: MediaStorage = createLocalMediaStorage(directory)
) {
  const send = vi.fn(handler);
  const client: R2StorageClient = { send: send as R2StorageClient["send"] };
  const storage = createR2MediaStorage({
    accountId,
    bucket,
    accessKeyId: "test-access-key-only",
    secretAccessKey: "test-secret-key-only",
    localStorage,
    client,
  });
  return { storage, send, localStorage, client };
}

describe("private R2 safe-test media adapter", () => {
  it("uploads only sanitized bytes under an opaque immutable key, without ACL or user metadata", async () => {
    const { storage, send } = setup();
    const original = await sampleImage();
    const media = await storage.put(original, "image/png");
    expect(media.backend).toBe("R2");
    expect(media.key).toMatch(/^[a-f0-9]{64}$/);
    expect(send).toHaveBeenCalledTimes(1);
    const [command, options] = send.mock.calls[0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    if (!(command instanceof PutObjectCommand))
      throw new Error("Wrong command");
    const uploaded = command.input.Body as Buffer;
    expect(Buffer.isBuffer(uploaded)).toBe(true);
    expect(uploaded).not.toEqual(original);
    expect((await sharp(uploaded).metadata()).exif).toBeUndefined();
    expect(uploaded.toString()).not.toContain("private-source-metadata");
    expect(command.input).toEqual({
      Bucket: bucket,
      Key: `safe-test/${media.key}`,
      Body: uploaded,
      ContentType: "image/png",
      ContentLength: uploaded.length,
      ContentMD5: createHash("md5").update(uploaded).digest("base64"),
      CacheControl: "private, no-store",
      StorageClass: "STANDARD",
      IfNoneMatch: "*",
    });
    expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    expect(media.sha256).toBe(
      createHash("sha256").update(uploaded).digest("hex")
    );
    expect(media.byteSize).toBe(uploaded.length);
    expect(JSON.stringify(media)).not.toContain(bucket);
    expect(JSON.stringify(media)).not.toContain("https:");
    expect(await readdir(directory)).toEqual([]);
  });

  it("reads private R2 bytes after creating a fresh adapter, then deletes only that object", async () => {
    const objects = new Map<string, Buffer>();
    const handler = async (
      command: Command
    ): Promise<GetObjectCommandOutput> => {
      const object = command.input.Key!;
      if (command instanceof PutObjectCommand) {
        if (objects.has(object))
          throw Object.assign(new Error("collision"), {
            name: "PreconditionFailed",
          });
        objects.set(object, Buffer.from(command.input.Body as Buffer));
        return { $metadata: {} };
      }
      if (command instanceof GetObjectCommand) {
        const bytes = objects.get(object);
        if (!bytes)
          throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
        return response(bytes);
      }
      objects.delete(object);
      return { $metadata: {} };
    };
    const first = setup(handler);
    const media = await first.storage.put(await sampleImage(), "image/png");
    const second = setup(handler);
    const bytes = await second.storage.read(media.key, "R2");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(media.sha256);
    await second.storage.remove(media.key, "R2");
    await second.storage.remove(media.key, "R2");
    await expect(second.storage.read(media.key, "R2")).rejects.toBeInstanceOf(
      MediaNotFoundError
    );
    expect(objects.size).toBe(0);
  });

  it("keeps old local files readable and removable without making any R2 request", async () => {
    const { storage, send, localStorage } = setup();
    const media = await localStorage.put(await sampleImage(), "image/png");
    expect(await storage.read(media.key)).toEqual(
      await localStorage.read(media.key)
    );
    expect(await storage.read(media.key, "LOCAL")).toEqual(
      await localStorage.read(media.key)
    );
    await storage.remove(media.key);
    expect(send).not.toHaveBeenCalled();
    await expect(localStorage.read(media.key)).rejects.toBeInstanceOf(
      MediaNotFoundError
    );
  });

  it("does not fall back to a same-key local file when the recorded R2 object is missing", async () => {
    const { storage, localStorage } = setup(async () => {
      throw Object.assign(new Error("missing"), { name: "NoSuchKey" });
    });
    const media = await localStorage.put(await sampleImage(), "image/png");
    await expect(storage.read(media.key, "R2")).rejects.toBeInstanceOf(
      MediaNotFoundError
    );
    expect((await localStorage.read(media.key)).length).toBe(media.byteSize);
  });

  it("does not send invalid source media to R2", async () => {
    const { storage, send } = setup();
    await expect(
      storage.put(Buffer.from("<svg />"), "image/png")
    ).rejects.toBeInstanceOf(MediaValidationError);
    expect(send).not.toHaveBeenCalled();
    expect(await readdir(directory)).toEqual([]);
  });

  it.each(["PreconditionFailed", "TimeoutError", "AccessDenied"])(
    "cleans staged bytes on %s and never sends a cleanup delete for an uncertain write",
    async (name) => {
      const { storage, send } = setup(async () => {
        throw Object.assign(
          new Error(
            `secret-endpoint/${accountId}/${bucket}/${key}/test-secret-key-only`
          ),
          { name }
        );
      });
      const error = await storage
        .put(await sampleImage(), "image/png")
        .catch((failure: unknown) => failure);
      expect(error).toBeInstanceOf(MediaStorageUnavailableError);
      expect(String(error)).toBe(
        "MediaStorageUnavailableError: Private media storage is temporarily unavailable."
      );
      expect(error).not.toHaveProperty("cause");
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
      expect(
        (send.mock.calls[0][0] as PutObjectCommand).input.IfNoneMatch
      ).toBe("*");
      expect(await readdir(directory)).toEqual([]);
    }
  );

  it("cleans staging and refuses to upload bytes changed after validation", async () => {
    const local = createLocalMediaStorage(directory);
    const remove = vi.fn(local.remove);
    const { storage, send } = setup(undefined, {
      put: local.put,
      read: async () => Buffer.from("changed-after-validation"),
      remove,
    });
    await expect(
      storage.put(await sampleImage(), "image/png")
    ).rejects.toBeInstanceOf(MediaStorageUnavailableError);
    expect(send).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(await readdir(directory)).toEqual([]);
  });

  it("reports cleanup failure without exposing its details or deleting the uploaded object", async () => {
    const local = createLocalMediaStorage(directory);
    const { storage, send } = setup(undefined, {
      ...local,
      remove: async () => {
        throw new Error("private-stage-path");
      },
    });
    await expect(storage.put(await sampleImage(), "image/png")).rejects.toThrow(
      "Private media storage is temporarily unavailable."
    );
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
  });

  it.each([
    { ContentLength: undefined },
    { ContentLength: 0 },
    { ContentLength: -1 },
    { ContentLength: 1.5 },
    { ContentLength: MAX_MEDIA_BYTES + 1 },
    { ContentType: "text/html" },
    { ContentType: undefined },
    { ContentEncoding: "gzip" },
  ])(
    "rejects invalid response metadata %j and closes the stream",
    async (overrides) => {
      const output = response(Buffer.from("sample"), overrides);
      const { storage } = setup(async () => output);
      await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
        MediaStorageUnavailableError
      );
      expect((output.Body as Readable).destroyed).toBe(true);
    }
  );

  it.each([1, 10])(
    "rejects a body whose actual size disagrees with declared length %s",
    async (length) => {
      const output = response(Buffer.from("sample"), { ContentLength: length });
      const { storage } = setup(async () => output);
      await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
        MediaStorageUnavailableError
      );
      expect((output.Body as Readable).destroyed).toBe(true);
    }
  );

  it("stops a streaming body at the 20 MiB limit instead of collecting it unbounded", async () => {
    const body = Readable.from([
      Buffer.alloc(MAX_MEDIA_BYTES),
      Buffer.from("overflow"),
    ]);
    const { storage } = setup(async () =>
      response(Buffer.alloc(0), {
        Body: body as GetObjectCommandOutput["Body"],
        ContentLength: MAX_MEDIA_BYTES,
      })
    );
    await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
      MediaStorageUnavailableError
    );
    expect(body.destroyed).toBe(true);
  });

  it("rejects non-Node response bodies", async () => {
    const { storage } = setup(async () =>
      response(Buffer.from("sample"), { Body: undefined })
    );
    await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
      MediaStorageUnavailableError
    );
  });

  it.each([
    "../outside",
    "https://example.com/file",
    "a".repeat(63),
    "A".repeat(64),
  ])(
    "rejects non-opaque key %s before local or R2 access",
    async (invalidKey) => {
      const { storage, send } = setup();
      await expect(storage.read(invalidKey, "R2")).rejects.toBeInstanceOf(
        MediaNotFoundError
      );
      await expect(storage.remove(invalidKey, "R2")).rejects.toBeInstanceOf(
        MediaNotFoundError
      );
      expect(send).not.toHaveBeenCalled();
    }
  );

  it.each(["NoSuchKey", "AccessDenied"])(
    "normalizes %s from reads and deletion",
    async (name) => {
      const { storage } = setup(async () => {
        throw Object.assign(
          new Error(`${bucket}/${key}/test-secret-key-only`),
          { name }
        );
      });
      if (name === "NoSuchKey") {
        await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
          MediaNotFoundError
        );
        await expect(storage.remove(key, "R2")).resolves.toBeUndefined();
      } else {
        await expect(storage.read(key, "R2")).rejects.toBeInstanceOf(
          MediaStorageUnavailableError
        );
        await expect(storage.remove(key, "R2")).rejects.toBeInstanceOf(
          MediaStorageUnavailableError
        );
      }
    }
  );

  it.each([
    { accountId: "https://attacker.example" },
    { accountId: "a".repeat(31) },
    { bucket: "../other" },
    { bucket: "with.dot" },
    { accessKeyId: " " },
    { secretAccessKey: " " },
  ])(
    "rejects invalid configuration without echoing its values",
    (overrides) => {
      expect(() =>
        createR2MediaStorage({
          accountId,
          bucket,
          accessKeyId: "test-access",
          secretAccessKey: "test-secret",
          localStorage: createLocalMediaStorage(directory),
          ...overrides,
        })
      ).toThrow("Private R2 storage configuration is invalid.");
    }
  );
});
