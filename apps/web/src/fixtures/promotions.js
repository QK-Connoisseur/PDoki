/**
 * Sample promotional offers.
 *
 * Dev/test only — not production data. Extracted from the page body so it can
 * be swapped for a real `/api/v1` response during backend integration.
 */

const promotionRows = [
  {
    id: 1,
    name: "Luna Bloom",
    username: "lunabloom",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "7 Days Free",
    promoDetail: "Free trial for new subscribers",
    originalPrice: "$9.99/mo",
    subscribers: "12.4k",
    posts: 847,
    category: "lifestyle",
  },
  {
    id: 2,
    name: "Mika Rose",
    username: "mikarose",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "50% Off",
    promoDetail: "First month half price",
    originalPrice: "$14.99/mo",
    discountPrice: "$7.49/mo",
    subscribers: "8.7k",
    posts: 523,
    category: "gaming",
  },
  {
    id: 3,
    name: "Airi Vale",
    username: "airivale",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "14 Days Free",
    promoDetail: "Two weeks free access",
    originalPrice: "$7.99/mo",
    subscribers: "5.2k",
    posts: 312,
    category: "asmr",
  },
  {
    id: 4,
    name: "Sora Nyx",
    username: "soranyx",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "30% Off",
    promoDetail: "Limited time discount",
    originalPrice: "$19.99/mo",
    discountPrice: "$13.99/mo",
    subscribers: "21.1k",
    posts: 1203,
    category: "premium",
  },
  {
    id: 5,
    name: "Naomi Hart",
    username: "naomihart",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "bundle",
    promoLabel: "3 for 2",
    promoDetail: "Subscribe 3 months, pay for 2",
    originalPrice: "$12.99/mo",
    subscribers: "3.8k",
    posts: 198,
    category: "fitness",
  },
  {
    id: 6,
    name: "Reina Noir",
    username: "reinanoir",
    avatar:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "3 Days Free",
    promoDetail: "Quick free preview",
    originalPrice: "$24.99/mo",
    subscribers: "15.9k",
    posts: 976,
    category: "premium",
  },
  {
    id: 7,
    name: "Kira Dawn",
    username: "kiradawn",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "70% Off",
    promoDetail: "Massive first-month deal",
    originalPrice: "$9.99/mo",
    discountPrice: "$2.99/mo",
    subscribers: "2.1k",
    posts: 87,
    category: "lifestyle",
  },
  {
    id: 8,
    name: "Yuki Star",
    username: "yukistar",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "30 Days Free",
    promoDetail: "Full month free trial",
    originalPrice: "$5.99/mo",
    subscribers: "9.4k",
    posts: 634,
    category: "asmr",
  },
  {
    id: 9,
    name: "Hana Mizu",
    username: "hanamizu",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "bundle",
    promoLabel: "6 for 4",
    promoDetail: "Subscribe 6 months, pay for 4",
    originalPrice: "$11.99/mo",
    subscribers: "6.3k",
    posts: 421,
    category: "gaming",
  },
  {
    id: 10,
    name: "Emi Skye",
    username: "emiskye",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "40% Off",
    promoDetail: "Spring sale discount",
    originalPrice: "$16.99/mo",
    discountPrice: "$9.99/mo",
    subscribers: "18.2k",
    posts: 1087,
    category: "premium",
  },
  {
    id: 11,
    name: "Rin Velvet",
    username: "rinvelvet",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "5 Days Free",
    promoDetail: "Try before you subscribe",
    originalPrice: "$8.99/mo",
    subscribers: "4.6k",
    posts: 265,
    category: "fitness",
  },
  {
    id: 12,
    name: "Mei Soleil",
    username: "meisoleil",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    cover:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "60% Off",
    promoDetail: "Limited time mega deal",
    originalPrice: "$22.99/mo",
    discountPrice: "$8.99/mo",
    subscribers: "11.7k",
    posts: 789,
    category: "lifestyle",
  },
];

export const followedPromotionUsernames = [
  "lunabloom",
  "mikarose",
  "airivale",
  "reinanoir",
  "yukistar",
];

export const subscribedPromotionUsernames = ["soranyx"];

export const promotionCategoryPreferences = ["asmr", "gaming", "lifestyle"];

/*
 * Commerce metadata is deliberately structured instead of embedded in promo
 * copy. Expiry labels, savings, renewal terms, eligibility, and sorting are
 * all derived from these fields. In production the API is authoritative for
 * timestamps and eligibility.
 */
const promotionCommerce = {
  1: {
    regularMonthlyPrice: 9.99,
    introPrice: 0,
    trialDays: 7,
    savingsPercent: 23,
    eligibility: "New subscribers only",
    createdAt: "2026-07-19T14:00:00Z",
    expiresAt: "2026-07-29T23:59:59Z",
  },
  2: {
    regularMonthlyPrice: 14.99,
    introPrice: 7.49,
    promoMonths: 1,
    savingsPercent: 50,
    eligibility: "New and returning subscribers",
    createdAt: "2026-07-18T16:00:00Z",
    expiresAt: "2026-08-12T23:59:59Z",
  },
  3: {
    regularMonthlyPrice: 7.99,
    introPrice: 0,
    trialDays: 14,
    savingsPercent: 47,
    eligibility: "New subscribers only",
    createdAt: "2026-07-16T12:00:00Z",
    expiresAt: "2026-08-02T23:59:59Z",
  },
  4: {
    regularMonthlyPrice: 19.99,
    introPrice: 13.99,
    promoMonths: 1,
    savingsPercent: 30,
    eligibility: "New and returning subscribers",
    createdAt: "2026-07-10T19:00:00Z",
    expiresAt: "2026-07-26T23:59:59Z",
  },
  5: {
    regularMonthlyPrice: 12.99,
    firstTermTotal: 25.98,
    includedMonths: 3,
    paidMonths: 2,
    savingsPercent: 33,
    eligibility: "Available to all members",
    createdAt: "2026-07-15T15:00:00Z",
    expiresAt: "2026-08-20T23:59:59Z",
  },
  6: {
    regularMonthlyPrice: 24.99,
    introPrice: 0,
    trialDays: 3,
    savingsPercent: 10,
    eligibility: "New subscribers only",
    createdAt: "2026-07-21T18:00:00Z",
    expiresAt: "2026-07-24T23:59:59Z",
  },
  7: {
    regularMonthlyPrice: 9.99,
    introPrice: 2.99,
    promoMonths: 1,
    savingsPercent: 70,
    eligibility: "New subscribers only",
    createdAt: "2026-07-22T11:00:00Z",
    expiresAt: "2026-07-27T23:59:59Z",
  },
  8: {
    regularMonthlyPrice: 5.99,
    introPrice: 0,
    trialDays: 30,
    savingsPercent: 100,
    eligibility: "New subscribers only",
    createdAt: "2026-07-20T10:00:00Z",
    expiresAt: "2026-08-08T23:59:59Z",
  },
  9: {
    regularMonthlyPrice: 11.99,
    firstTermTotal: 47.96,
    includedMonths: 6,
    paidMonths: 4,
    savingsPercent: 33,
    eligibility: "Available to all members",
    createdAt: "2026-07-12T13:00:00Z",
    expiresAt: "2026-07-30T23:59:59Z",
  },
  10: {
    regularMonthlyPrice: 16.99,
    introPrice: 9.99,
    promoMonths: 1,
    savingsPercent: 41,
    eligibility: "New and returning subscribers",
    createdAt: "2026-07-17T17:00:00Z",
    expiresAt: "2026-08-09T23:59:59Z",
  },
  11: {
    regularMonthlyPrice: 8.99,
    introPrice: 0,
    trialDays: 5,
    savingsPercent: 17,
    eligibility: "New subscribers only",
    createdAt: "2026-07-21T09:00:00Z",
    expiresAt: "2026-07-25T23:59:59Z",
  },
  12: {
    regularMonthlyPrice: 22.99,
    introPrice: 8.99,
    promoMonths: 1,
    savingsPercent: 61,
    eligibility: "New subscribers only",
    createdAt: "2026-07-23T08:00:00Z",
    expiresAt: "2026-08-01T23:59:59Z",
  },
};

export const promotions = promotionRows.map((promotion) => {
  const commerce = promotionCommerce[promotion.id];
  const preferenceBoost = promotionCategoryPreferences.includes(
    promotion.category
  )
    ? 30
    : 0;
  const relationshipBoost = followedPromotionUsernames.includes(
    promotion.username
  )
    ? 45
    : subscribedPromotionUsernames.includes(promotion.username)
      ? 60
      : 0;

  return {
    ...promotion,
    ...commerce,
    relevanceScore:
      relationshipBoost + preferenceBoost + commerce.savingsPercent,
  };
});
