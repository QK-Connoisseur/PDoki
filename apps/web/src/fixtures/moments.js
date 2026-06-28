/**
 * Sample moment-rail data. Shape matches what `sortMomentRail` expects:
 *   { id, type: "own" | "private" | "regular", createdAt }
 *
 * Dev/test only — not production data.
 */
export const sampleMoments = [
  { id: "m-own-1", type: "own", createdAt: "2026-06-20T10:00:00Z" },
  { id: "m-reg-old", type: "regular", createdAt: "2026-06-19T08:00:00Z" },
  { id: "m-priv-new", type: "private", createdAt: "2026-06-21T09:00:00Z" },
  { id: "m-reg-new", type: "regular", createdAt: "2026-06-21T11:00:00Z" },
  { id: "m-priv-old", type: "private", createdAt: "2026-06-18T07:00:00Z" },
];
