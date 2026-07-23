/**
 * Groups Store items for the "All" discovery tab.
 *
 * Precedence: paid subscriptions, then free follows, then everything else as
 * recommendations. Each item appears in exactly one group even when a creator
 * is both subscribed-to and followed.
 */
export function buildAllTabGroups(
  items,
  subscribedUsernames,
  followedUsernames
) {
  const seen = new Set();
  const take = (predicate) =>
    items.filter((i) => {
      if (seen.has(i.id) || !predicate(i)) return false;
      seen.add(i.id);
      return true;
    });
  return {
    subscriptions: take((i) => subscribedUsernames.has(i.username)),
    followed: take((i) => followedUsernames.has(i.username)),
    recommended: take(() => true),
  };
}
