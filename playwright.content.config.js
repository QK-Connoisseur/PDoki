import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import base from "./playwright.config.js";

const ffmpegPath =
  process.env.CONTENT_FFMPEG_PATH ??
  ["/opt/homebrew/bin/ffmpeg", "/usr/bin/ffmpeg"].find(existsSync);
if (!ffmpegPath)
  throw new Error(
    "Set CONTENT_FFMPEG_PATH to a local FFmpeg installation before content browser tests"
  );

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: "**/content.spec.js",
  timeout: 60_000,
  use: { ...base.use, baseURL: "http://127.0.0.1:5180" },
  webServer: [
    {
      ...base.webServer[0],
      url: "http://127.0.0.1:3180/api/v1/health",
      reuseExistingServer: false,
      env: {
        ...base.webServer[0].env,
        PORT: "3180",
        WEB_ORIGIN: "http://127.0.0.1:5180",
        CONTENT_MODE: "development",
        CONTENT_STORAGE_DIRECTORY: resolve("tmp/content-e2e-media"),
        CONTENT_FFMPEG_PATH: ffmpegPath,
      },
    },
    {
      ...base.webServer[1],
      command:
        "npm run dev:e2e --workspace @pumdoki/web -- --port 5180 --strictPort",
      url: "http://127.0.0.1:5180",
      reuseExistingServer: false,
      env: {
        ...base.webServer[1].env,
        VITE_API_BASE_URL: "http://127.0.0.1:3180/api/v1",
        VITE_CONTENT_MODE: "development",
      },
    },
  ],
});
