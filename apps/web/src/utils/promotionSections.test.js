import { describe, expect, it } from "vitest";
import {
  buildPromotionSections,
  formatPromotionTerms,
  getDaysRemaining,
  getSavingsPercent,
  isPromotionActive,
  sortPromotions,
} from "./promotionSections";

const now = new Date("2026-07-23T12:00:00Z");

const promotion = (overrides) => ({
  id: 1,
  username: "creator",
  promoType: "discount",
  regularMonthlyPrice: 20,
  introPrice: 10,
  promoMonths: 1,
  savingsPercent: 50,
  relevanceScore: 50,
  createdAt: "2026-07-20T12:00:00Z",
  expiresAt: "2026-08-01T12:00:00Z",
  ...overrides,
});

describe("promotion helpers", () => {
  it("derives active state and whole days remaining from real timestamps", () => {
    const active = promotion({ expiresAt: "2026-07-26T12:00:00Z" });
    expect(isPromotionActive(active, now)).toBe(true);
    expect(getDaysRemaining(active, now)).toBe(3);
    expect(
      isPromotionActive(promotion({ expiresAt: "2026-07-20T12:00:00Z" }), now)
    ).toBe(false);
  });

  it("formats transparent trial, discount, and bundle terms", () => {
    expect(
      formatPromotionTerms(
        promotion({
          promoType: "free-trial",
          trialDays: 7,
          regularMonthlyPrice: 9.99,
        })
      )
    ).toBe("Free for 7 days, then $9.99/month.");
    expect(formatPromotionTerms(promotion({}))).toBe(
      "$10.00 for the first month, then $20.00/month."
    );
    expect(
      formatPromotionTerms(
        promotion({
          promoType: "bundle",
          firstTermTotal: 30,
          includedMonths: 3,
          regularMonthlyPrice: 15,
        })
      )
    ).toBe("$30.00 total for 3 months, then $15.00/month.");
  });

  it("supports savings, price, newest, and expiry sorting", () => {
    const items = [
      promotion({
        id: 1,
        introPrice: 8,
        savingsPercent: 60,
        createdAt: "2026-07-10T12:00:00Z",
        expiresAt: "2026-07-30T12:00:00Z",
      }),
      promotion({
        id: 2,
        introPrice: 4,
        savingsPercent: 20,
        createdAt: "2026-07-22T12:00:00Z",
        expiresAt: "2026-07-25T12:00:00Z",
      }),
    ];
    expect(sortPromotions(items, "savings", now)[0].id).toBe(1);
    expect(sortPromotions(items, "price-low", now)[0].id).toBe(2);
    expect(sortPromotions(items, "newest", now)[0].id).toBe(2);
    expect(sortPromotions(items, "ending-soon", now)[0].id).toBe(2);
    expect(getSavingsPercent(items[0])).toBe(60);
  });

  it("builds non-overlapping followed, ending-soon, and recommended shelves", () => {
    const items = [
      promotion({ id: 1, username: "followed" }),
      promotion({
        id: 2,
        username: "other",
        expiresAt: "2026-07-25T12:00:00Z",
      }),
      promotion({ id: 3, username: "recommended" }),
      promotion({
        id: 4,
        username: "expired",
        expiresAt: "2026-07-20T12:00:00Z",
      }),
    ];
    const sections = buildPromotionSections(
      items,
      new Set(["followed"]),
      new Set(),
      "recommended",
      now
    );
    expect(sections.followed.map((item) => item.id)).toEqual([1]);
    expect(sections.endingSoon.map((item) => item.id)).toEqual([2]);
    expect(sections.recommended.map((item) => item.id)).toEqual([3]);
    const ids = Object.values(sections)
      .flat()
      .map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
