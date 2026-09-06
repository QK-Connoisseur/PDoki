import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// JSDOM stubs CSS imports; check the actual paired theme tokens directly.
const styles = readFileSync(
  resolve(process.cwd(), "src/components/NotificationBell.css"),
  "utf8"
);
const themeStyles = readFileSync(
  resolve(process.cwd(), "src/index.css"),
  "utf8"
);

function tokensFor(source, selector, prefix) {
  const start = source.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const block = source.slice(start).split("}")[0];
  return Object.fromEntries(
    [
      ...block.matchAll(
        new RegExp(`--${prefix}-([\\w-]+):\\s*(#[\\da-f]{6});`, "g")
      ),
    ].map(([, name, value]) => [name, value])
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

function contrast(foreground, background) {
  expect(foreground).toMatch(/^#[\da-f]{6}$/);
  expect(background).toMatch(/^#[\da-f]{6}$/);
  const values = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("notification theme contrast", () => {
  it.each([
    ["Sakura Kiss", "sakura", ".member-notifications"],
    [
      "Midnight City",
      "dark-knight",
      '[data-member-theme="dark-knight"] .member-notifications',
    ],
  ])("keeps %s text and unread indicators legible", (_, theme, selector) => {
    const tokens = tokensFor(styles, selector, "notification");
    const shell = tokensFor(
      themeStyles,
      `[data-member-theme="${theme}"]`,
      "member"
    );
    for (const background of [
      shell["popover-fill"],
      tokens["unread-fill"],
      tokens["hover-fill"],
    ]) {
      for (const text of ["text", "secondary", "muted", "accent"]) {
        expect(
          contrast(tokens[text], background),
          `${text} on ${background}`
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(tokens.dot, background)).toBeGreaterThanOrEqual(3);
    }
    expect(
      contrast(tokens.accent, tokens["accent-soft"])
    ).toBeGreaterThanOrEqual(4.5);
  });
});
