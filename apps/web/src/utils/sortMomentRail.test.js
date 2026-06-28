import { describe, it, expect } from "vitest";
import { sortMomentRail } from "./sortMomentRail";
import { sampleMoments } from "../fixtures/moments";

const ids = (moments) => moments.map((m) => m.id);

describe("sortMomentRail", () => {
  it("pins own moments first, then unseen private, then unseen regular, by recency", () => {
    const result = sortMomentRail(sampleMoments, new Set());
    expect(ids(result)).toEqual([
      "m-own-1", // own, pinned
      "m-priv-new", // unseen private, newest
      "m-priv-old", // unseen private, older
      "m-reg-new", // unseen regular, newest
      "m-reg-old", // unseen regular, older
    ]);
  });

  it("demotes seen moments to the end of the rail", () => {
    const result = sortMomentRail(sampleMoments, new Set(["m-priv-new"]));
    expect(ids(result)).toEqual([
      "m-own-1",
      "m-priv-old",
      "m-reg-new",
      "m-reg-old",
      "m-priv-new", // seen -> last
    ]);
  });

  it("does not mutate the input array", () => {
    const before = ids(sampleMoments);
    sortMomentRail(sampleMoments, new Set(["m-reg-new"]));
    expect(ids(sampleMoments)).toEqual(before);
  });
});
