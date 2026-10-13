// Hand-entered FDE Market figures, shown until the data pipeline
// (pipeline/, docs/fde-market.md) is switched on. Once Supabase has a
// snapshot, the homepage uses that instead and ignores this file.
//
// To update: change the numbers and the asOf date, then push.

export const FDE_MARKET_SNAPSHOT = {
  asOf: "2026-10-13",
  openRoles: { value: 1247, change: "+43 this week" },
  medianBase: { value: 205_000, sampleSize: 684 },
  aiAgentsPct: { value: 63, change: "+7 pts vs last quarter" },
  companiesHiring: { value: 942, change: "+160 this week" },
  growth90Days: { value: 26 }, // percent, open roles vs 90 days ago
};
