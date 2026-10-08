// Step 4 — The homepage numbers calculate themselves.
// Pure functions, so they are easy to test and reason about.

/** Does this job count toward the index? Mirrors the verified_fde_jobs view. */
export function isVerifiedFde(job) {
  if (!job.is_active) return false;
  if (job.review_override === true) return true;
  if (job.review_override === false) return false;
  return job.is_fde === true && (job.fde_confidence ?? 0) >= 70;
}

export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * @param {object[]} jobs active jobs with classification columns
 * @param {{ trackedCompanies:number, rolesScanned:number, date:string }} meta
 */
export function computeSnapshot(jobs, { trackedCompanies, rolesScanned, date }) {
  const fde = jobs.filter(isVerifiedFde);

  // Median base: midpoint of each USD annual range, skipping implausible values
  // (typos, hourly figures that slipped through, OTE-only postings).
  const midpoints = fde
    .filter((j) => (j.salary_currency ?? "USD") === "USD" && j.salary_min > 0)
    .map((j) => (Number(j.salary_min) + Number(j.salary_max || j.salary_min)) / 2)
    .filter((m) => m >= 40_000 && m <= 1_000_000);

  const med = median(midpoints);
  const ai = fde.filter((j) => j.ai_or_agents).length;

  return {
    snapshot_date: date,
    taken_at: new Date().toISOString(),
    open_roles: fde.length,
    companies_hiring: new Set(fde.map((j) => j.company_key)).size,
    median_base: med == null ? null : Math.round(med / 1000) * 1000,
    comp_sample: midpoints.length,
    ai_agents_pct: fde.length ? Math.round((ai / fde.length) * 1000) / 10 : null,
    tracked_companies: trackedCompanies,
    roles_scanned: rolesScanned,
  };
}
