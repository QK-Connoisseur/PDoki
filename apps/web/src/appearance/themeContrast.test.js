import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The web workspace's test command runs from apps/web. Read source CSS because
// JSDOM's Vite transform intentionally stubs CSS imports (including ?raw).
const styles = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function noticeTokens(selector) {
  const block = styles.slice(styles.indexOf(`${selector} {`)).split("}")[0];
  return Object.fromEntries(
    [...block.matchAll(/--verification-([\w-]+):\s*(#[\da-f]{6});/g)].map(
      ([, name, value]) => [name, value]
    )
  );
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

describe("email verification contrast", () => {
  it.each([
    ["Sakura Kiss", "\n.email-verification-bubble"],
    [
      "Midnight City",
      '[data-member-theme="dark-knight"] .email-verification-bubble',
    ],
  ])(
    "keeps all %s notice states above 4.5:1 on their opaque surface",
    (_, selector) => {
      const tokens = noticeTokens(selector);
      expect(tokens.surface).toMatch(/^#[\da-f]{6}$/);
      for (const name of [
        "text",
        "body",
        "action",
        "hover",
        "feedback",
        "error",
      ]) {
        expect(tokens[name]).toMatch(/^#[\da-f]{6}$/);
        const values = [
          luminance(tokens[name]),
          luminance(tokens.surface),
        ].sort((a, b) => b - a);
        expect(
          (values[0] + 0.05) / (values[1] + 0.05),
          name
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  );
});
