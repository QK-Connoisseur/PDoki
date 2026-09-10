import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type DeleteObjectCommandOutput,
  type GetObjectCommandOutput,
  type PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import {
  MAX_MEDIA_BYTES,
  MediaNotFoundError,
  type MediaStorage,
  type StoredMedia,
} from "./storage.js";

const KEY_PATTERN = /^[a-f0-9]{64}$/;
const ACCOUNT_PATTERN = /^[a-f0-9]{32}$/;
const BUCKET_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const REQUEST_TIMEOUT_MS = 30_000;
const MEDIA_TYPES = new Set(["image/png", "image/jpeg", "video/mp4"]);

export interface R2StorageClient {
  send(
    command: PutObjectCommand,
    options: { abortSignal: AbortSignal }
  ): Promise<PutObjectCommandOutput>;
  send(
    command: GetObjectCommand,
    options: { abortSignal: AbortSignal }
  ): Promise<GetObjectCommandOutput>;
  send(
    command: DeleteObjectCommand,
    options: { abortSignal: AbortSignal }
  ): Promise<DeleteObjectCommandOutput>;
}

interface R2MediaStorageOptions {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  localStorage: MediaStorage;
  /** Injected only for offline tests; production uses the fixed R2 endpoint. */
  client?: R2StorageClient;
}

/** No SDK cause, endpoint, bucket, object key or credentials may enter logs. */
export class MediaStorageUnavailableError extends Error {
  constructor() {
    super("Private media storage is temporarily unavailable.");
    this.name = "MediaStorageUnavailableError";
  }
}

function objectKey(key: string): string {
  if (!KEY_PATTERN.test(key)) throw new MediaNotFoundError();
  return `safe-test/${key}`;
}

function isMissingObject(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("name" in error && error.name === "NoSuchKey") return true;
  if (!("$metadata" in error)) return false;
  const metadata = error.$metadata;
  return (
    !!metadata &&
    typeof metadata === "object" &&
    "httpStatusCode" in metadata &&
    metadata.httpStatusCode === 404
  );
}

async function readBounded(
  response: GetObjectCommandOutput,
  signal: AbortSignal
): Promise<Buffer> {
  const body = response.Body;
  // The API runs in Node. Reject alternate/unbounded body implementations.
  if (!(body instanceof Readable)) throw new MediaStorageUnavailableError();
  const abort = () => body.destroy(new MediaStorageUnavailableError());
  signal.addEventListener("abort", abort, { once: true });
  try {
    const length = response.ContentLength;
    if (
      signal.aborted ||
      !Number.isSafeInteger(length) ||
      !length ||
      length < 0 ||
      length > MAX_MEDIA_BYTES ||
      !MEDIA_TYPES.has(response.ContentType ?? "") ||
      (response.ContentEncoding && response.ContentEncoding !== "identity")
    ) {
      throw new MediaStorageUnavailableError();
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of body) {
      if (signal.aborted || !(chunk instanceof Uint8Array)) {
        throw new MediaStorageUnavailableError();
      }
      size += chunk.byteLength;
      if (size > MAX_MEDIA_BYTES || size > length) {
        throw new MediaStorageUnavailableError();
      }
      chunks.push(Buffer.from(chunk));
    }
    if (size !== length) throw new MediaStorageUnavailableError();
    return Buffer.concat(chunks, size);
  } finally {
    signal.removeEventListener("abort", abort);
    body.destroy();
  }
}

/**
 * Safe test uploads only. Reuses the local decoder/re-encoder, then moves the
 * sealed delivery bytes into a private R2 object. Every read still requires
 * current application authorization; no public or signed URL is returned.
 * Existing LOCAL records remain on disk. An omitted backend means LOCAL.
 */
export function createR2MediaStorage(
  options: R2MediaStorageOptions
): MediaStorage {
  if (
    !ACCOUNT_PATTERN.test(options.accountId) ||
    !BUCKET_PATTERN.test(options.bucket) ||
    !options.accessKeyId.trim() ||
    !options.secretAccessKey.trim()
  ) {
    throw new Error("Private R2 storage configuration is invalid.");
  }
  const client: R2StorageClient =
    options.client ??
    new S3Client({
      region: "auto",
      endpoint: `https://${options.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      maxAttempts: 2,
      requestHandler: { connectionTimeout: 5_000, socketTimeout: 30_000 },
      // R2 has partial S3 checksum support. Content-MD5 protects each put;
      // the content service checks the sealed SHA-256 on every delivery.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });

  return {
    async put(buffer, declaredType) {
      const staged = await options.localStorage.put(buffer, declaredType);
      let result: StoredMedia | undefined;
      let failure: Error | undefined;
      try {
        const key = objectKey(staged.key);
        const bytes = await options.localStorage.read(staged.key, "LOCAL");
        if (
          bytes.length === 0 ||
          bytes.length > MAX_MEDIA_BYTES ||
          bytes.length !== staged.byteSize ||
          createHash("sha256").update(bytes).digest("hex") !== staged.sha256
        ) {
          throw new MediaStorageUnavailableError();
        }
        await client.send(
          new PutObjectCommand({
            Bucket: options.bucket,
            Key: key,
            Body: bytes,
            ContentType: staged.mimeType,
            ContentLength: bytes.length,
            ContentMD5: createHash("md5").update(bytes).digest("base64"),
            CacheControl: "private, no-store",
            StorageClass: "STANDARD",
            // A retry/collision may never replace an existing sealed object.
            IfNoneMatch: "*",
          }),
          { abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
        );
        result = { ...staged, backend: "R2" };
      } catch {
        failure = new MediaStorageUnavailableError();
      }
      try {
        await options.localStorage.remove(staged.key, "LOCAL");
      } catch {
        // Report cleanup failure without replacing the original failure or
        // deleting a remote object whose write outcome could be uncertain.
        failure ??= new MediaStorageUnavailableError();
      }
      if (failure) throw failure;
      return result!;
    },
    async read(key, backend = "LOCAL") {
      const remoteKey = objectKey(key);
      if (backend === "LOCAL") return options.localStorage.read(key, "LOCAL");
      if (backend !== "R2") throw new MediaNotFoundError();
      try {
        const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
        const response = await client.send(
          new GetObjectCommand({ Bucket: options.bucket, Key: remoteKey }),
          { abortSignal: signal }
        );
        return await readBounded(response, signal);
      } catch (error) {
        if (isMissingObject(error)) throw new MediaNotFoundError();
        throw new MediaStorageUnavailableError();
      }
    },
    async remove(key, backend = "LOCAL") {
      const remoteKey = objectKey(key);
      if (backend === "LOCAL") return options.localStorage.remove(key, "LOCAL");
      if (backend !== "R2") throw new MediaNotFoundError();
      try {
        await client.send(
          new DeleteObjectCommand({ Bucket: options.bucket, Key: remoteKey }),
          { abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
        );
      } catch (error) {
        if (!isMissingObject(error)) throw new MediaStorageUnavailableError();
      }
    },
  };
}
