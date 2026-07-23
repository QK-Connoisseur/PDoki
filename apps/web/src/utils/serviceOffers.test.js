import { describe, it, expect } from "vitest";
import {
  getLowestOffer,
  formatServicePrice,
  getCreatorServices,
} from "./serviceOffers";

const creator = {
  name: "Test Creator",
  offers: [
    { service: "chat", vesos: 12, unit: "30 min" },
    { service: "chat", vesos: 10, unit: "30 min" },
    { service: "video", vesos: 30, unit: "30 min" },
    { service: "game", vesos: 8, unit: "game" },
    { service: "shoutout", vesos: 15, unit: "shoutout" },
  ],
};

describe("getLowestOffer", () => {
  it("selects the lowest-priced offer within the requested category", () => {
    expect(getLowestOffer(creator, "chat")).toEqual({
      service: "chat",
      vesos: 10,
      unit: "30 min",
    });
  });

  it("returns null when the creator has no offers in the category", () => {
    expect(getLowestOffer(creator, "voice")).toBeNull();
  });

  it("selects the lowest offer overall when no category is given", () => {
    expect(getLowestOffer(creator, null)).toEqual({
      service: "game",
      vesos: 8,
      unit: "game",
    });
  });

  it('treats "all" like no category', () => {
    expect(getLowestOffer(creator, "all")).toEqual({
      service: "game",
      vesos: 8,
      unit: "game",
    });
  });

  it("returns null for a creator without offers", () => {
    expect(getLowestOffer({ name: "None" }, "chat")).toBeNull();
  });
});

describe("formatServicePrice", () => {
  it("formats an E-Chat offer as vesos/duration", () => {
    expect(
      formatServicePrice({ service: "chat", vesos: 10, unit: "30 min" })
    ).toBe("10/30 min");
  });

  it("formats per-game and per-shoutout offers", () => {
    expect(
      formatServicePrice({ service: "game", vesos: 8, unit: "game" })
    ).toBe("8/game");
    expect(
      formatServicePrice({ service: "shoutout", vesos: 15, unit: "shoutout" })
    ).toBe("15/shoutout");
  });

  it('prefixes "From" when asked', () => {
    expect(
      formatServicePrice(
        { service: "game", vesos: 8, unit: "game" },
        { from: true }
      )
    ).toBe("From 8/game");
  });

  it("returns an empty string for a missing offer", () => {
    expect(formatServicePrice(null)).toBe("");
  });
});

describe("getCreatorServices", () => {
  it("derives the unique service types from the creator's offers", () => {
    expect(getCreatorServices(creator)).toEqual([
      "chat",
      "video",
      "game",
      "shoutout",
    ]);
  });

  it("returns an empty list for a creator without offers", () => {
    expect(getCreatorServices({ name: "None" })).toEqual([]);
  });
});
