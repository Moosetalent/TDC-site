#!/usr/bin/env node
// The FDE Market pipeline:
//   job boards → collect → database → classify → calculate → market_snapshots
// The website reads market_snapshots. Nothing on the site is hardcoded.
//
// Run:   node pipeline/run.mjs            (needs the env vars in docs/fde-market.md)
// Test:  node pipeline/run.mjs --dry-run  (collects only; no database, no LLM)

import { readFile, appendFile } from "node:fs/promises";
import { collectAll } from "./lib/sources.mjs";
import { looksRelevant } from "./lib/text.mjs";
import { upsert, patch, selectAll, inList } from "./lib/db.mjs";
import { classifyJobs } from "./lib/classify.mjs";
import { computeSnapshot } from "./lib/stats.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const MAX_CLASSIFY = Number(process.env.MAX_CLASSIFY || 400);

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/** PostgREST bulk writes need every row in a request to have the same columns. */
async function upsertByShape(table, rows) {
  const groups = new Map();
  for (const row of rows) {
    const shape = Object.keys(row).sort().join(",");
    if (!groups.has(shape)) groups.set(shape, []);
    groups.get(shape).push(row);
  }
  for (const group of groups.values()) await upsert(table, group);
}

async function main() {
  const runStart = new Date().toISOString();
  const { companies } = JSON.parse(await readFile(new URL("./companies.json", import.meta.url), "utf8"));

  // 1. Collect --------------------------------------------------------------
  log(`Scanning ${companies.length} job boards…`);
  const { jobs: all, ok, failed } = await collectAll(companies);
  const relevant = all.filter((j) => looksRelevant(j.title));
  log(`${all.length} postings scanned, ${relevant.length} with FDE-like titles, ${failed.length} boards failed`);
  for (const f of failed) log(`  ✗ ${f.company}: ${f.error}`);

  if (DRY_RUN) {
    for (const j of relevant) log(`  ${j.company} — ${j.title}${j.salary_min ? `  ($${j.salary_min}–${j.salary_max})` : ""}`);
    return;
  }

  // 2. Store ----------------------------------------------------------------
  // Only columns we actually have are sent, so classifier output and earlier
  // salary extraction are never wiped by a later collection run.
  const rows = relevant.map((j) => {
    const row = {
      id: j.id,
      source: j.source,
      company: j.company,
      company_key: j.company_key,
      title: j.title,
      location: j.location,
      description: j.description,
      source_url: j.source_url,
      posted_date: j.posted_date,
      last_seen: runStart,
      is_active: true,
    };
    if (j.remote != null) row.remote = j.remote;
    if (j.salary_source === "board") {
      Object.assign(row, {
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        salary_currency: j.salary_currency,
        salary_source: "board",
      });
    }
    return row;
  });
  await upsertByShape("jobs", rows);

  // Jobs that disappeared from a board we read successfully are closed.
  // Boards that failed this run are left alone, so an outage never wipes data.
  if (ok.length) {
    await patch(
      "jobs",
      `is_active=eq.true&last_seen=lt.${encodeURIComponent(runStart)}&company_key=in.${encodeURIComponent(inList(ok))}`,
      { is_active: false },
    );
  }
  log(`Stored ${rows.length} jobs`);

  // 3. Classify -------------------------------------------------------------
  const pending = await selectAll(
    "jobs",
    `select=id,company,title,location,description,remote,salary_source&is_active=eq.true&classified_at=is.null&order=first_seen.asc&limit=${MAX_CLASSIFY}`,
  );
  log(`Classifying ${pending.length} new jobs…`);
  let errors = 0;
  const updates = await classifyJobs(pending, {
    onError: (job, err) => {
      errors++;
      log(`  ✗ ${job.company} — ${job.title}: ${err.message}`);
    },
  });
  await upsertByShape("jobs", updates);
  log(`Classified ${updates.length} jobs (${errors} errors)`);

  // 4. Calculate ------------------------------------------------------------
  const active = await selectAll(
    "jobs",
    "select=company_key,is_active,is_fde,fde_confidence,review_override,ai_or_agents,salary_min,salary_max,salary_currency&is_active=eq.true",
  );
  const snapshot = computeSnapshot(active, {
    trackedCompanies: ok.length,
    rolesScanned: all.length,
    date: runStart.slice(0, 10),
  });
  await upsert("market_snapshots", [snapshot], { onConflict: "snapshot_date" });
  log("Snapshot saved:", snapshot);

  // Summary on the GitHub Actions run page
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## FDE Market run",
      `| Open roles | Companies hiring | Median base | Comp sample | AI / agents |`,
      `|---|---|---|---|---|`,
      `| ${snapshot.open_roles} | ${snapshot.companies_hiring} | ${snapshot.median_base ?? "—"} | ${snapshot.comp_sample} | ${snapshot.ai_agents_pct ?? "—"}% |`,
      "",
      `Scanned ${all.length} postings on ${ok.length} boards. ${relevant.length} had FDE-like titles. Classified ${updates.length} new jobs.`,
      ...(failed.length
        ? ["", "### Boards that failed (check the board name in pipeline/companies.json)", ...failed.map((f) => `- **${f.company}**: ${f.error}`)]
        : []),
    ];
    await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
