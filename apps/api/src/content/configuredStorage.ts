import type { Env } from "../env.js";
import {
  createLocalMediaStorage,
  MediaNotFoundError,
  type MediaStorage,
} from "./storage.js";
import { createR2MediaStorage } from "./r2.js";

/** Backend identity is persisted per asset, so selecting R2 cannot redirect
 * existing local records to different bytes or make cloud records public. */
export function createConfiguredMediaStorage(env: Env): MediaStorage {
  if (env.CONTENT_MODE !== "development" || !env.CONTENT_STORAGE_DIRECTORY)
    throw new Error("Private sample storage is not enabled");
  const local = createLocalMediaStorage(env.CONTENT_STORAGE_DIRECTORY, {
    ffmpegPath: env.CONTENT_FFMPEG_PATH,
  });
  const configured = !!(
    env.R2_ACCOUNT_ID &&
    env.R2_BUCKET &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY
  );
  const cloud = configured
    ? createR2MediaStorage({
        accountId: env.R2_ACCOUNT_ID!,
        bucket: env.R2_BUCKET!,
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        localStorage: local,
      })
    : null;
  if (env.CONTENT_STORAGE_BACKEND === "R2" && !cloud)
    throw new Error("R2 credentials are required");
  return {
    put: (bytes, type) =>
      (env.CONTENT_STORAGE_BACKEND === "R2" ? cloud! : local).put(bytes, type),
    read: (key, backend = "LOCAL") => {
      if (backend === "R2" && !cloud) throw new MediaNotFoundError();
      return cloud ? cloud.read(key, backend) : local.read(key);
    },
    remove: (key, backend = "LOCAL") => {
      if (backend === "R2" && !cloud)
        throw new Error("R2 storage is not configured for cleanup");
      return cloud ? cloud.remove(key, backend) : local.remove(key);
    },
  };
}
