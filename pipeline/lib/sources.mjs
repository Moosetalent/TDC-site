// Step 1 — Collect the jobs.
//
// Reads the public job-board APIs that Greenhouse, Lever and Ashby provide for
// exactly this purpose (they power companies' own careers pages). No scraping,
// no logins, no LinkedIn. Each collector returns jobs in one common shape.

import { htmlToText } from "./text.mjs";

const UA = "TDC-FDE-Market/1.0 (+https://www.thedeployment.club)";

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

const yearly = (interval = "") => /year|annual|yr/i.test(interval);

/** @returns {Promise<object[]>} normalized jobs */
async function greenhouse({ name, board }) {
  const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`);
  return (data.jobs ?? []).map((j) => ({
    id: `greenhouse:${board}:${j.id}`,
    title: j.title,
    location: j.location?.name ?? null,
    description: htmlToText(j.content ?? ""),
    source_url: j.absolute_url,
    posted_date: j.first_published ?? j.updated_at ?? null,
    remote: /remote/i.test(j.location?.name ?? "") || null,
  }));
}

async function lever({ name, board }, host = "api.lever.co") {
  const data = await getJson(`https://${host}/v0/postings/${board}?mode=json`);
  return (Array.isArray(data) ? data : []).map((j) => {
    const lists = (j.lists ?? []).map((l) => `${l.text}\n${htmlToText(l.content ?? "")}`).join("\n\n");
    const sr = j.salaryRange;
    const hasPay = sr && yearly(sr.interval) && sr.min > 0;
    return {
      id: `lever:${board}:${j.id}`,
      title: j.text,
      location: j.categories?.location ?? null,
      description: [j.descriptionPlain, lists, j.additionalPlain].filter(Boolean).join("\n\n"),
      source_url: j.hostedUrl,
      posted_date: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      remote: j.workplaceType ? j.workplaceType === "remote" : null,
      ...(hasPay && {
        salary_min: sr.min,
        salary_max: sr.max || sr.min,
        salary_currency: sr.currency || "USD",
        salary_source: "board",
      }),
    };
  });
}

async function ashby({ name, board }) {
  const data = await getJson(
    `https://api.ashbyhq.com/posting-api/job-board/${board}?includeCompensation=true`,
  );
  return (data.jobs ?? [])
    .filter((j) => j.isListed !== false)
    .map((j) => {
      const salary = (j.compensation?.summaryComponents ?? []).find(
        (c) => c.compensationType === "Salary" && yearly(c.interval) && c.minValue > 0,
      );
      return {
        id: `ashby:${board}:${j.id}`,
        title: j.title,
        location: j.location ?? null,
        description: j.descriptionPlain || htmlToText(j.descriptionHtml ?? ""),
        source_url: j.jobUrl,
        posted_date: j.publishedAt ?? null,
        remote: typeof j.isRemote === "boolean" ? j.isRemote : j.workplaceType === "Remote" || null,
        ...(salary && {
          salary_min: salary.minValue,
          salary_max: salary.maxValue || salary.minValue,
          salary_currency: salary.currencyCode || "USD",
          salary_source: "board",
        }),
      };
    });
}

const COLLECTORS = {
  greenhouse,
  lever: (c) => lever(c),
  "lever-eu": (c) => lever(c, "api.eu.lever.co"),
  ashby,
};

/**
 * Fetch every company's board. A failing board is reported, not fatal.
 * @returns {Promise<{ jobs: object[], ok: string[], failed: {company:string, error:string}[] }>}
 */
export async function collectAll(companies, { concurrency = 6 } = {}) {
  const jobs = [];
  const ok = [];
  const failed = [];
  const queue = [...companies];

  async function worker() {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const collector = COLLECTORS[c.ats];
      const key = `${c.ats.replace("-eu", "")}:${c.board}`;
      if (!collector) {
        failed.push({ company: c.name, error: `unknown ats "${c.ats}"` });
        continue;
      }
      try {
        const found = await collector(c);
        for (const j of found) jobs.push({ ...j, company: c.name, company_key: key, source: c.ats.replace("-eu", "") });
        ok.push(key);
      } catch (err) {
        failed.push({ company: c.name, error: err.message });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return { jobs, ok, failed };
}
