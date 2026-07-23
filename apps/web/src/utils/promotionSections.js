const DAY_MS = 24 * 60 * 60 * 1000;

export function isPromotionActive(promotion, now = new Date()) {
  const expiry = Date.parse(promotion.expiresAt);
  return Number.isFinite(expiry) && expiry > now.getTime();
}

export function getDaysRemaining(promotion, now = new Date()) {
  const expiry = Date.parse(promotion.expiresAt);
  if (!Number.isFinite(expiry)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.ceil((expiry - now.getTime()) / DAY_MS));
}

export function getSavingsPercent(promotion) {
  if (Number.isFinite(promotion.savingsPercent)) {
    return promotion.savingsPercent;
  }

  if (promotion.promoType === "discount" && promotion.regularMonthlyPrice > 0) {
    return Math.round(
      ((promotion.regularMonthlyPrice - promotion.introPrice) /
        promotion.regularMonthlyPrice) *
        100
    );
  }

  if (promotion.promoType === "bundle" && promotion.includedMonths > 0) {
    return Math.round(
      ((promotion.includedMonths - promotion.paidMonths) /
        promotion.includedMonths) *
        100
    );
  }

  return 0;
}

export function getIntroCost(promotion) {
  if (promotion.promoType === "free-trial") return 0;
  if (promotion.promoType === "bundle") return promotion.firstTermTotal;
  return promotion.introPrice;
}

export function formatPromotionTerms(promotion) {
  const renewal = `$${promotion.regularMonthlyPrice.toFixed(2)}/month`;

  if (promotion.promoType === "free-trial") {
    return `Free for ${promotion.trialDays} days, then ${renewal}.`;
  }

  if (promotion.promoType === "discount") {
    const duration =
      promotion.promoMonths === 1
        ? "the first month"
        : `the first ${promotion.promoMonths} months`;
    return `$${promotion.introPrice.toFixed(2)} for ${duration}, then ${renewal}.`;
  }

  return `$${promotion.firstTermTotal.toFixed(2)} total for ${promotion.includedMonths} months, then ${renewal}.`;
}

export function sortPromotions(promotions, sortBy, now = new Date()) {
  const sorted = [...promotions];

  if (sortBy === "savings") {
    return sorted.sort((a, b) => getSavingsPercent(b) - getSavingsPercent(a));
  }

  if (sortBy === "price-low") {
    return sorted.sort((a, b) => getIntroCost(a) - getIntroCost(b));
  }

  if (sortBy === "newest") {
    return sorted.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  }

  if (sortBy === "ending-soon") {
    return sorted.sort(
      (a, b) => getDaysRemaining(a, now) - getDaysRemaining(b, now)
    );
  }

  return sorted.sort(
    (a, b) =>
      (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0) ||
      getSavingsPercent(b) - getSavingsPercent(a)
  );
}

/**
 * Produces non-overlapping personalized shelves for the default Promotions
 * view. A followed/subscribed creator wins first, then genuinely time-limited
 * offers ending within seven days, then the remaining recommendations.
 */
export function buildPromotionSections(
  promotions,
  followedUsernames,
  subscribedUsernames,
  sortBy = "recommended",
  now = new Date()
) {
  const active = promotions.filter((promotion) =>
    isPromotionActive(promotion, now)
  );
  const seen = new Set();
  const take = (predicate) =>
    sortPromotions(
      active.filter((promotion) => {
        if (seen.has(promotion.id) || !predicate(promotion)) return false;
        seen.add(promotion.id);
        return true;
      }),
      sortBy,
      now
    );

  return {
    followed: take(
      (promotion) =>
        followedUsernames.has(promotion.username) ||
        subscribedUsernames.has(promotion.username)
    ),
    endingSoon: take((promotion) => getDaysRemaining(promotion, now) <= 7),
    recommended: take(() => true),
  };
}
