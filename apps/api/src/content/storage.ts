import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { constants } from "node:fs";
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, parse, sep } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 16_000_000;
const KEY_PATTERN = /^[a-f0-9]{64}$/;
const execFileAsync = promisify(execFile);

export type MediaMimeType = "image/png" | "image/jpeg" | "video/mp4";
export type MediaStorageBackend = "LOCAL" | "R2";

export interface StoredMedia {
  backend?: MediaStorageBackend;
  key: string;
  mimeType: MediaMimeType;
  byteSize: number;
  sha256: string;
}

export interface MediaStorage {
  put(buffer: Buffer, declaredType: string): Promise<StoredMedia>;
  read(key: string, backend?: MediaStorageBackend): Promise<Buffer>;
  remove(key: string, backend?: MediaStorageBackend): Promise<void>;
}

export interface LocalMediaStorageOptions {
  /** Absolute path to a maintained FFmpeg installation with sibling ffprobe. */
  ffmpegPath?: string;
}

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export class MediaNotFoundError extends Error {
  constructor() {
    super("Media not found.");
    this.name = "MediaNotFoundError";
  }
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ELOOP")
  );
}

async function sanitizeImage(
  input: Buffer,
  mimeType: "image/png" | "image/jpeg"
): Promise<Buffer> {
  const format = mimeType === "image/png" ? "png" : "jpeg";
  const signatureMatches =
    format === "png"
      ? input.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))
      : input.length >= 3 &&
        input.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex"));
  if (!signatureMatches) {
    throw new MediaValidationError("The file does not match its image type.");
  }

  try {
    const decoder = sharp(input, {
      failOn: "warning",
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).timeout({ seconds: 10 });
    const metadata = await decoder.metadata();
    if (
      metadata.format !== format ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    ) {
      throw new MediaValidationError("Use a single PNG or JPEG image.");
    }
    // Force a full decode and store only a newly encoded delivery image. Sharp
    // strips source metadata by default; rotate applies any EXIF orientation
    // before that metadata is discarded. Merely inspecting headers is unsafe.
    const sanitized = await decoder.rotate().toFormat(format).toBuffer();
    if (sanitized.length > MAX_MEDIA_BYTES) {
      throw new MediaValidationError(
        "The decoded image exceeds the upload limit."
      );
    }
    return sanitized;
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    throw new MediaValidationError(
      "The image could not be decoded safely. Use a valid PNG or JPEG up to 16 megapixels."
    );
  }
}

const PRIVATE_MOV_INPUT = [
  "-protocol_whitelist",
  "file",
  "-f",
  "mov",
  "-enable_drefs",
  "0",
  "-use_absolute_path",
  "0",
  "-max_alloc",
  "67108864",
] as const;

async function sanitizeVideo(
  input: Buffer,
  directory: string,
  ffmpegPath?: string
): Promise<Buffer> {
  if (!ffmpegPath) {
    throw new MediaValidationError(
      "Video uploads require the configured local video processor."
    );
  }
  if (
    input.length < 16 ||
    input.toString("ascii", 4, 8) !== "ftyp" ||
    input.readUInt32BE(0) < 16 ||
    input.readUInt32BE(0) > input.length ||
    !["isom", "iso2", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V "].includes(
      input.toString("ascii", 8, 12)
    )
  ) {
    throw new MediaValidationError("Use an MP4 video file.");
  }
  const temporaryDirectory = await mkdtemp(join(directory, ".video-"));
  try {
    const inputPath = join(temporaryDirectory, "input.mp4");
    const outputPath = join(temporaryDirectory, "output.mp4");
    await writeFile(inputPath, input, { mode: 0o600, flag: "wx" });
    const probePath = join(
      dirname(ffmpegPath),
      process.platform === "win32" ? "ffprobe.exe" : "ffprobe"
    );
    const probe = await execFileAsync(
      probePath,
      [
        "-v",
        "error",
        ...PRIVATE_MOV_INPUT,
        "-show_entries",
        "stream=codec_type,codec_name,width,height:format=duration",
        "-of",
        "json",
        inputPath,
      ],
      {
        timeout: 10_000,
        killSignal: "SIGKILL",
        maxBuffer: 128 * 1024,
        windowsHide: true,
      }
    );
    const metadata: {
      streams?: {
        codec_type?: string;
        codec_name?: string;
        width?: number;
        height?: number;
      }[];
      format?: { duration?: string };
    } = JSON.parse(probe.stdout);
    const videos =
      metadata.streams?.filter((stream) => stream.codec_type === "video") ?? [];
    const video = videos[0];
    const duration = Number(metadata.format?.duration);
    if (
      probe.stderr.trim() ||
      videos.length !== 1 ||
      video?.codec_name !== "h264" ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > 120 ||
      !video.width ||
      !video.height ||
      video.width < 2 ||
      video.height < 2 ||
      video.width > 1920 ||
      video.height > 1920 ||
      video.width * video.height > 1920 * 1080 ||
      metadata.streams?.some(
        (stream) => stream.codec_type === "audio" && stream.codec_name !== "aac"
      )
    ) {
      throw new MediaValidationError(
        "Use an H.264 MP4 with optional AAC audio, up to 2 minutes and 1080p."
      );
    }
    const transcode = await execFileAsync(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-xerror",
        ...PRIVATE_MOV_INPUT,
        "-threads",
        "2",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-map_metadata",
        "-1",
        "-map_chapters",
        "-1",
        "-sn",
        "-dn",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-r",
        "30",
        "-threads",
        "2",
        "-filter_threads",
        "1",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        "-t",
        "120",
        "-fs",
        String(MAX_MEDIA_BYTES + 1),
        "-f",
        "mp4",
        outputPath,
      ],
      {
        timeout: 45_000,
        killSignal: "SIGKILL",
        maxBuffer: 128 * 1024,
        windowsHide: true,
      }
    );
    const outputInfo = await stat(outputPath);
    if (
      transcode.stderr.trim() ||
      outputInfo.size === 0 ||
      outputInfo.size > MAX_MEDIA_BYTES
    ) {
      throw new MediaValidationError(
        "The processed video exceeds the upload limit or could not be decoded safely."
      );
    }
    return await readFile(outputPath);
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    throw new MediaValidationError(
      "The MP4 could not be processed safely. Check the video and local FFmpeg setup."
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

/**
 * Private, single-machine storage for the controlled local content slice.
 * Callers must authorize every read; this directory must never be served as
 * static files. This adapter does not provide malware or content moderation.
 */
export function createLocalMediaStorage(
  directory: string,
  options: LocalMediaStorageOptions = {}
): MediaStorage {
  const root = normalize(directory);
  if (
    !isAbsolute(directory) ||
    root === parse(root).root ||
    root.split(sep).some((part) => ["public", "dist", "build"].includes(part))
  ) {
    throw new Error(
      "Private media requires an absolute directory outside public/build output."
    );
  }
  if (options.ffmpegPath && !isAbsolute(options.ffmpegPath)) {
    throw new Error("The video processor path must be absolute.");
  }

  async function ensureDirectory(): Promise<void> {
    await mkdir(root, { recursive: true, mode: 0o700 });
    const info = await lstat(root);
    if (!info.isDirectory() || info.isSymbolicLink()) {
      throw new Error(
        "Private media storage must be a directory, not a symlink."
      );
    }
    // Also reject public/build output reached through a symlinked parent.
    if (
      (await realpath(root))
        .split(sep)
        .some((part) => ["public", "dist", "build"].includes(part))
    ) {
      throw new Error(
        "Private media storage must remain outside public/build output."
      );
    }
  }

  function pathFor(key: string): string {
    if (!KEY_PATTERN.test(key)) throw new MediaNotFoundError();
    return join(root, key);
  }

  return {
    async put(buffer, declaredType) {
      if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new MediaValidationError("Select a non-empty media file.");
      }
      if (buffer.length > MAX_MEDIA_BYTES) {
        throw new MediaValidationError("Media must be no larger than 20 MiB.");
      }
      if (
        declaredType !== "image/png" &&
        declaredType !== "image/jpeg" &&
        declaredType !== "video/mp4"
      ) {
        throw new MediaValidationError(
          "Use a PNG image, JPEG image or MP4 video."
        );
      }
      await ensureDirectory();
      const source = Buffer.from(buffer);
      const stored =
        declaredType === "video/mp4"
          ? await sanitizeVideo(source, root, options.ffmpegPath)
          : await sanitizeImage(source, declaredType);
      const key = randomBytes(32).toString("hex");
      const file = await open(pathFor(key), "wx", 0o600);
      try {
        await file.writeFile(stored);
        await file.sync();
      } catch (error) {
        await unlink(pathFor(key)).catch(() => undefined);
        throw error;
      } finally {
        await file.close();
      }
      return {
        key,
        mimeType: declaredType,
        byteSize: stored.length,
        sha256: createHash("sha256").update(stored).digest("hex"),
      };
    },
    async read(key) {
      const path = pathFor(key);
      await ensureDirectory();
      let file;
      try {
        file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
        const info = await file.stat();
        if (!info.isFile() || info.size <= 0 || info.size > MAX_MEDIA_BYTES) {
          throw new MediaNotFoundError();
        }
        return await file.readFile();
      } catch (error) {
        if (isMissingFile(error)) throw new MediaNotFoundError();
        throw error;
      } finally {
        await file?.close();
      }
    },
    async remove(key) {
      const path = pathFor(key);
      await ensureDirectory();
      try {
        await unlink(path);
      } catch (error) {
        if (!isMissingFile(error)) throw error;
      }
    },
  };
}
