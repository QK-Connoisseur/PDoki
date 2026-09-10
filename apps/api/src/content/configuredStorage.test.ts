import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadEnv } from "../env.js";
import { createConfiguredMediaStorage } from "./configuredStorage.js";

const { local, cloud } = vi.hoisted(() => ({
  local: { put: vi.fn(), read: vi.fn(), remove: vi.fn() },
  cloud: { put: vi.fn(), read: vi.fn(), remove: vi.fn() },
}));
vi.mock("./storage.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./storage.js")>()),
  createLocalMediaStorage: () => local,
}));
vi.mock("./r2.js", () => ({ createR2MediaStorage: () => cloud }));

const base = {
  DATABASE_URL: "postgresql://unused.example/test",
  CONTENT_MODE: "development",
  CONTENT_STORAGE_DIRECTORY: "/private/tmp/content-config-test",
};
const credentials = {
  R2_ACCOUNT_ID: "a".repeat(32),
  R2_BUCKET: "pumdoki-review-media",
  R2_ACCESS_KEY_ID: "test-key",
  R2_SECRET_ACCESS_KEY: "test-secret",
};
beforeEach(() => vi.clearAllMocks());

describe("configured media storage", () => {
  it("keeps old local records local after switching uploads to R2", async () => {
    const storage = createConfiguredMediaStorage(
      loadEnv({ ...base, ...credentials, CONTENT_STORAGE_BACKEND: "R2" })
    );
    await storage.put(Buffer.from("sample"), "image/png");
    await storage.read("local-key", "LOCAL");
    await storage.read("r2-key", "R2");
    await storage.remove("unused-r2-key", "R2");
    expect(cloud.put).toHaveBeenCalledOnce();
    expect(cloud.read).toHaveBeenNthCalledWith(1, "local-key", "LOCAL");
    expect(cloud.read).toHaveBeenNthCalledWith(2, "r2-key", "R2");
    expect(cloud.remove).toHaveBeenCalledWith("unused-r2-key", "R2");
    expect(local.put).not.toHaveBeenCalled();
  });

  it("never silently substitutes local files for a cloud asset without credentials", async () => {
    const storage = createConfiguredMediaStorage(loadEnv(base));
    await storage.put(Buffer.from("sample"), "image/png");
    await storage.read("local-key", "LOCAL");
    expect(() => storage.read("cloud-key", "R2")).toThrow("Media not found");
    expect(() => storage.remove("cloud-key", "R2")).toThrow(
      "R2 storage is not configured"
    );
    expect(local.read).toHaveBeenCalledExactlyOnceWith("local-key");
    expect(local.remove).not.toHaveBeenCalled();
    expect(cloud.read).not.toHaveBeenCalled();
  });
});
