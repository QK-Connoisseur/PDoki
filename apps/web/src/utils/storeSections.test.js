import { describe, it, expect } from "vitest";
import { buildAllTabGroups } from "./storeSections";

const item = (id, username) => ({ id, username, title: `Item ${id}` });

const items = [
  item(1, "lunabloom"), // subscribed
  item(2, "mikarose"), // followed
  item(3, "yukistar"), // neither
  item(4, "lunabloom"), // subscribed
  item(5, "airivale"), // followed
  item(6, "kiradawn"), // neither
];

const subscribed = new Set(["lunabloom"]);
const followed = new Set(["mikarose", "airivale"]);

describe("buildAllTabGroups", () => {
  it("splits items into subscriptions, followed, and recommended groups", () => {
    const groups = buildAllTabGroups(items, subscribed, followed);
    expect(groups.subscriptions.map((i) => i.id)).toEqual([1, 4]);
    expect(groups.followed.map((i) => i.id)).toEqual([2, 5]);
    expect(groups.recommended.map((i) => i.id)).toEqual([3, 6]);
  });

  it("never places the same item in more than one group", () => {
    // A creator can be both subscribed-to and followed; subscription wins.
    const overlapFollowed = new Set(["lunabloom", "mikarose", "airivale"]);
    const groups = buildAllTabGroups(items, subscribed, overlapFollowed);
    const ids = [
      ...groups.subscriptions,
      ...groups.followed,
      ...groups.recommended,
    ].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(groups.subscriptions.map((i) => i.id)).toEqual([1, 4]);
    expect(groups.followed.map((i) => i.id)).toEqual([2, 5]);
  });

  it("returns empty groups for empty input", () => {
    const groups = buildAllTabGroups([], subscribed, followed);
    expect(groups.subscriptions).toEqual([]);
    expect(groups.followed).toEqual([]);
    expect(groups.recommended).toEqual([]);
  });

  it("puts everything in recommended when nothing is subscribed or followed", () => {
    const groups = buildAllTabGroups(items, new Set(), new Set());
    expect(groups.subscriptions).toEqual([]);
    expect(groups.followed).toEqual([]);
    expect(groups.recommended.map((i) => i.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
