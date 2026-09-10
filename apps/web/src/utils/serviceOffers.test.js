import { describe, it, expect } from "vitest";
import {
  getLowestOffer,
  formatServicePrice,
  getCreatorServices,
} from "./serviceOffers";

const creator = {
  name: "Test Creator",
  offers: [
    { service: "chat", priceUsd: 12, unit: "30 min" },
    { service: "chat", priceUsd: 10, unit: "30 min" },
    { service: "video", priceUsd: 30, unit: "30 min" },
    { service: "game", priceUsd: 8, unit: "game" },
    { service: "shoutout", priceUsd: 15, unit: "shoutout" },
  ],
};

describe("getLowestOffer", () => {
  it("selects the lowest-priced offer within the requested category", () => {
    expect(getLowestOffer(creator, "chat")).toEqual({
      service: "chat",
      priceUsd: 10,
      unit: "30 min",
    });
  });

  it("returns null when the creator has no offers in the category", () => {
    expect(getLowestOffer(creator, "voice")).toBeNull();
  });

  it("selects the lowest offer overall when no category is given", () => {
    expect(getLowestOffer(creator, null)).toEqual({
      service: "game",
      priceUsd: 8,
      unit: "game",
    });
  });

  it('treats "all" like no category', () => {
    expect(getLowestOffer(creator, "all")).toEqual({
      service: "game",
      priceUsd: 8,
      unit: "game",
    });
  });

  it("returns null for a creator without offers", () => {
    expect(getLowestOffer({ name: "None" }, "chat")).toBeNull();
  });
});

describe("formatServicePrice", () => {
  it("formats an E-Chat offer as a USD price per duration", () => {
    expect(
      formatServicePrice({ service: "chat", priceUsd: 10, unit: "30 min" })
    ).toBe("$10.00/30 min");
  });

  it("formats per-game and per-shoutout offers", () => {
    expect(
      formatServicePrice({ service: "game", priceUsd: 8, unit: "game" })
    ).toBe("$8.00/game");
    expect(
      formatServicePrice({
        service: "shoutout",
        priceUsd: 15,
        unit: "shoutout",
      })
    ).toBe("$15.00/shoutout");
  });

  it('prefixes "From" when asked', () => {
    expect(
      formatServicePrice(
        { service: "game", priceUsd: 8, unit: "game" },
        { from: true }
      )
    ).toBe("From $8.00/game");
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
