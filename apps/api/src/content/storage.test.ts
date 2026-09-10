import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createLocalMediaStorage,
  MAX_MEDIA_BYTES,
  MediaNotFoundError,
  MediaValidationError,
} from "./storage.js";

const execFileAsync = promisify(execFile);
let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "pumdoki-private-media-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function sampleImage(format: "png" | "jpeg" = "png") {
  return sharp({
    create: { width: 20, height: 12, channels: 3, background: "pink" },
  })
    .withMetadata({ exif: { IFD0: { Copyright: "private-source-metadata" } } })
    .toFormat(format)
    .toBuffer();
}

describe("private media storage", () => {
  it.each(["png", "jpeg"] as const)(
    "decodes and stores sanitized %s bytes across adapter restarts",
    async (format) => {
      const original = await sampleImage(format);
      const media = await createLocalMediaStorage(directory).put(
        original,
        `image/${format}`
      );
      const stored = await createLocalMediaStorage(directory).read(media.key);
      expect(media.key).toMatch(/^[a-f0-9]{64}$/);
      expect(media.mimeType).toBe(`image/${format}`);
      expect(media.byteSize).toBe(stored.length);
      expect(media.sha256).toBe(
        createHash("sha256").update(stored).digest("hex")
      );
      expect(stored).not.toEqual(original);
      expect((await sharp(stored).metadata()).exif).toBeUndefined();
      expect(stored.toString()).not.toContain("private-source-metadata");
      if (process.platform !== "win32") {
        expect((await stat(join(directory, media.key))).mode & 0o777).toBe(
          0o600
        );
      }
    }
  );

  it("creates immutable unique objects for identical uploads and removes only the requested object", async () => {
    const storage = createLocalMediaStorage(directory);
    const source = await sampleImage();
    const first = await storage.put(source, "image/png");
    const second = await storage.put(source, "image/png");
    expect(first.key).not.toBe(second.key);
    expect(first.sha256).toBe(second.sha256);
    await storage.remove(first.key);
    await storage.remove(first.key);
    await expect(storage.read(first.key)).rejects.toBeInstanceOf(
      MediaNotFoundError
    );
    expect((await storage.read(second.key)).length).toBe(second.byteSize);
  });

  it("rejects empty, oversized, executable and MIME-mismatched uploads without storing anything", async () => {
    const storage = createLocalMediaStorage(directory);
    await expect(
      storage.put(Buffer.alloc(0), "image/png")
    ).rejects.toBeInstanceOf(MediaValidationError);
    await expect(
      storage.put(Buffer.alloc(MAX_MEDIA_BYTES + 1), "image/png")
    ).rejects.toBeInstanceOf(MediaValidationError);
    await expect(
      storage.put(Buffer.from('<svg onload="alert(1)" />'), "image/png")
    ).rejects.toBeInstanceOf(MediaValidationError);
    await expect(
      storage.put(await sampleImage(), "image/jpeg")
    ).rejects.toBeInstanceOf(MediaValidationError);
    await expect(
      storage.put(await sampleImage(), "text/html")
    ).rejects.toBeInstanceOf(MediaValidationError);
    expect(await readdir(directory)).toEqual([]);
  });

  it("rejects a file with a genuine image header but truncated pixel data", async () => {
    const image = await sampleImage();
    await expect(
      createLocalMediaStorage(directory).put(image.subarray(0, 60), "image/png")
    ).rejects.toBeInstanceOf(MediaValidationError);
    expect(await readdir(directory)).toEqual([]);
  });

  it("rejects images above the decoded pixel limit even if compressed bytes are small", async () => {
    const image = await sharp({
      create: { width: 4096, height: 4096, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    expect(image.length).toBeLessThan(MAX_MEDIA_BYTES);
    await expect(
      createLocalMediaStorage(directory).put(image, "image/png")
    ).rejects.toThrow("16 megapixels");
  });

  it.each([
    "../outside",
    "/etc/passwd",
    "a/../b",
    "a".repeat(63),
    "A".repeat(64),
    "a".repeat(64) + ".png",
  ])("rejects storage key %s for reads and deletion", async (key) => {
    const storage = createLocalMediaStorage(directory);
    await expect(storage.read(key)).rejects.toBeInstanceOf(MediaNotFoundError);
    await expect(storage.remove(key)).rejects.toBeInstanceOf(
      MediaNotFoundError
    );
  });

  it("does not follow a symlink when a stored object is read", async () => {
    const outside = join(directory, "unrelated.txt");
    const key = "a".repeat(64);
    await writeFile(outside, "must remain private");
    await symlink(outside, join(directory, key));
    await expect(
      createLocalMediaStorage(directory).read(key)
    ).rejects.toBeInstanceOf(MediaNotFoundError);
    await createLocalMediaStorage(directory).remove(key);
    expect(await readFile(outside, "utf8")).toBe("must remain private");
  });

  it("rejects a symlinked storage directory", async () => {
    const storageLink = join(directory, "linked");
    await symlink(directory, storageLink);
    await expect(
      createLocalMediaStorage(storageLink).put(await sampleImage(), "image/png")
    ).rejects.toThrow("symlink");
  });

  it("rejects public output hidden behind a symlinked parent directory", async () => {
    const publicDirectory = join(directory, "public");
    await mkdir(publicDirectory);
    await symlink(publicDirectory, join(directory, "alias"));
    await expect(
      createLocalMediaStorage(join(directory, "alias", "media")).put(
        await sampleImage(),
        "image/png"
      )
    ).rejects.toThrow("outside public/build");
    expect(await readdir(join(publicDirectory, "media"))).toEqual([]);
  });

  it("requires private absolute storage and processor paths", () => {
    expect(() => createLocalMediaStorage("relative/uploads")).toThrow(
      "absolute directory"
    );
    expect(() =>
      createLocalMediaStorage(join(directory, "public", "uploads"))
    ).toThrow("outside public/build");
    expect(() =>
      createLocalMediaStorage(directory, { ffmpegPath: "ffmpeg" })
    ).toThrow("must be absolute");
  });

  it("fails closed for video when no processor is configured", async () => {
    await expect(
      createLocalMediaStorage(directory).put(Buffer.from("video"), "video/mp4")
    ).rejects.toThrow("configured local video processor");
  });
});

const ffmpegPath =
  process.env.CONTENT_FFMPEG_PATH ??
  ["/opt/homebrew/bin/ffmpeg", "/usr/bin/ffmpeg"].find(existsSync);

describe.skipIf(!ffmpegPath)("private MP4 validation and re-encoding", () => {
  async function sampleVideo(duration = "0.4") {
    const file = join(directory, "source.mp4");
    await execFileAsync(
      ffmpegPath!,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-f",
        "lavfi",
        "-i",
        "color=c=blue:s=64x64:r=10",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=44100:cl=mono",
        "-t",
        duration,
        "-c:v",
        "libx264",
        "-threads",
        "1",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-metadata",
        "title=private-source-metadata",
        "-movflags",
        "+faststart",
        file,
      ],
      { timeout: 10_000 }
    );
    return readFile(file);
  }

  it("fully decodes a safe clip and persists a newly encoded playable video without source metadata", async () => {
    const source = await sampleVideo();
    const storage = createLocalMediaStorage(join(directory, "media"), {
      ffmpegPath,
    });
    const media = await storage.put(source, "video/mp4");
    const stored = await storage.read(media.key);
    expect(media.mimeType).toBe("video/mp4");
    expect(media.byteSize).toBe(stored.length);
    expect(media.sha256).toBe(
      createHash("sha256").update(stored).digest("hex")
    );
    expect(stored).not.toEqual(source);
    expect(stored.toString()).not.toContain("private-source-metadata");
    expect(await readdir(join(directory, "media"))).toEqual([media.key]);
    const probe = await execFileAsync(join(dirname(ffmpegPath!), "ffprobe"), [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name",
      "-of",
      "json",
      join(directory, "media", media.key),
    ]);
    expect(JSON.parse(probe.stdout).streams).toEqual([
      { codec_name: "h264" },
      { codec_name: "aac" },
    ]);
  }, 20_000);

  it("rejects a counterfeit MP4 header and cleans temporary files", async () => {
    const fake = Buffer.concat([
      Buffer.from("000000186674797069736f6d0000020069736f6d6d703431", "hex"),
      Buffer.from("not a video"),
    ]);
    await expect(
      createLocalMediaStorage(directory, { ffmpegPath }).put(fake, "video/mp4")
    ).rejects.toBeInstanceOf(MediaValidationError);
    expect(await readdir(directory)).toEqual([]);
  });

  it("rejects videos exceeding the local duration limit before storing an object", async () => {
    const source = await sampleVideo("121");
    await expect(
      createLocalMediaStorage(join(directory, "media"), { ffmpegPath }).put(
        source,
        "video/mp4"
      )
    ).rejects.toThrow("up to 2 minutes");
    expect(await readdir(join(directory, "media"))).toEqual([]);
  }, 20_000);
});
