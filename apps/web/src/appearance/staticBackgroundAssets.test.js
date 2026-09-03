import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("static background asset policy", () => {
  const backgroundDirectory = path.resolve(
    process.cwd(),
    "src/assets/backgrounds"
  );

  it("keeps both responsive static themes available", () => {
    const assets = readdirSync(backgroundDirectory);
    expect(assets).toEqual(
      expect.arrayContaining([
        "sakura-feed-desktop.jpg",
        "sakura-feed-mobile.jpg",
        "midnight-city-feed-desktop.jpg",
        "midnight-city-feed-mobile.jpg",
      ])
    );
  });

  it("does not ship video assets in the background directory", () => {
    const assets = readdirSync(backgroundDirectory, { recursive: true });
    expect(
      assets.filter((asset) => /\.(mp4|webm|mov|m4v|avi|mkv|ogv)$/i.test(asset))
    ).toEqual([]);
  });
});
