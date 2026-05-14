function getTimestamp(moment) {
  const val = moment.createdAt ?? moment.momentAt ?? moment.timestamp;
  if (val == null) return 0;
  if (typeof val === "number") return val;
  const ms = Date.parse(val);
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Sort a moment rail by priority bucket, then recency, then stable index.
 *
 * Buckets (ascending = higher priority):
 *   0 — unseen + subscriber/gold  (type === "private")
 *   1 — unseen + regular/pink     (type === "regular")
 *   2 — seen                      (any type)
 *
 * "own" tiles are always pinned at the front in their original relative order.
 * Input array is never mutated.
 */
export function sortMomentRail(moments, viewedSet) {
  const own = [];
  const rest = [];

  moments.forEach((m, i) => {
    if (m.type === "own") {
      own.push(m);
    } else {
      rest.push({ m, i });
    }
  });

  rest.sort((a, b) => {
    const aViewed = viewedSet.has(a.m.id);
    const bViewed = viewedSet.has(b.m.id);

    const bucketA = aViewed ? 2 : a.m.type === "private" ? 0 : 1;
    const bucketB = bViewed ? 2 : b.m.type === "private" ? 0 : 1;

    if (bucketA !== bucketB) return bucketA - bucketB;

    const tsA = getTimestamp(a.m);
    const tsB = getTimestamp(b.m);
    if (tsB !== tsA) return tsB - tsA;

    return a.i - b.i;
  });

  return [...own, ...rest.map(({ m }) => m)];
}
