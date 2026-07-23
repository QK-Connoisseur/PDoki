/**
 * Helpers for creator service offers priced in Veso.
 *
 * An offer is `{ service, vesos, unit }` where `service` is a Connect category
 * id ("chat", "voice", "video", "game", "shoutout"), `vesos` is a numeric Veso
 * price (1 Veso = 1 USD), and `unit` is the human-readable billing unit
 * ("30 min", "hour", "game", "shoutout", ...). A creator may list several
 * offers in one category; display code derives the lowest instead of storing it.
 */

/**
 * Lowest-priced offer for a service category, or across all categories when
 * `serviceType` is null/undefined/"all". Returns null when there is no match.
 */
export function getLowestOffer(creator, serviceType) {
  const offers = creator?.offers ?? [];
  const inScope =
    serviceType && serviceType !== "all"
      ? offers.filter((o) => o.service === serviceType)
      : offers;
  if (inScope.length === 0) return null;
  return inScope.reduce((lowest, o) => (o.vesos < lowest.vesos ? o : lowest));
}

/**
 * Formats an offer as "<vesos>/<unit>", e.g. "10/30 min" or "8/game".
 * Pass `{ from: true }` to prefix "From " (used where no category is selected).
 */
export function formatServicePrice(offer, { from = false } = {}) {
  if (!offer) return "";
  const price = `${offer.vesos}/${offer.unit}`;
  return from ? `From ${price}` : price;
}

/** Unique service categories a creator offers, in offer order. */
export function getCreatorServices(creator) {
  return [...new Set((creator?.offers ?? []).map((o) => o.service))];
}
