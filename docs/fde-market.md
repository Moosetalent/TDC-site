# The FDE Market — how it works and how to switch it on

The homepage module **THE FDE MARKET // LIVE** shows numbers that are calculated every day from real job postings. Nobody edits the website to change them.

```
Job boards ──► collect ──► Supabase (jobs) ──► Claude classifies ──► calculate ──► Supabase (market_snapshots) ──► website
               └──────────────── GitHub Actions, once a day ─────────────────┘
```

Until the pipeline has written its first snapshot, the module stays hidden. Pushing the code early is safe.

## What's in the repo

| Path | What it does |
|---|---|
| `pipeline/companies.json` | The companies whose job boards are scanned. Edit this to grow coverage. |
| `pipeline/lib/sources.mjs` | **Step 1, collect.** Reads Greenhouse, Lever and Ashby public job-board APIs. |
| `pipeline/lib/text.mjs` | Pre-filter: keeps FDE-like titles (a deliberately broad net) so the LLM isn't paying to read recruiter jobs. |
| `pipeline/lib/db.mjs` | **Step 2, store.** Writes to Supabase. No npm packages needed. |
| `pipeline/lib/classify.mjs` | **Step 3, classify.** Claude reads each new job against TDC's FDE definition and returns confidence, seniority, category, AI/agents, travel, coding intensity and base salary. |
| `pipeline/lib/stats.mjs` | **Step 4, calculate.** Turns verified jobs into the homepage numbers. |
| `pipeline/run.mjs` | Runs steps 1–4 in order and saves the day's snapshot. |
| `.github/workflows/fde-market.yml` | Runs the pipeline daily at ~6am Central, and on demand. |
| `supabase/schema.sql` | The database tables, review views and security rules. |
| `app/components/FdeMarket.tsx` | The homepage module. It reads `market_snapshots` and renders nothing if there's no data. |

## How each number is calculated

A job **counts** when a human marked it as FDE, or the classifier is at least **70%** confident it's a genuine FDE role and it's still live on the company's board.

| Tile | Calculation |
|---|---|
| **Open roles** | Count of counted jobs. "This week" compares against the snapshot from 7+ days ago. |
| **Median base\*** | For counted jobs with a published USD base range: take the midpoint of each range, then the median. The tile says how many roles that's based on. |
| **AI / Agents** | Counted jobs tagged AI/agents ÷ all counted jobs. |
| **Companies hiring** | Distinct companies with at least one counted job, out of the boards tracked. |
| **Growth** | Shows "since we started" until 90 days of history exist, then **90-day growth**, then **YoY** once a full year of our own snapshots exists. It never claims YoY without the data. |

## Switching it on, step by step

You'll need about 30 minutes. Steps 1–3 are accounts and keys. Paste them only into the Supabase, GitHub and Vercel dashboards, never into chat, email or the code.

### 1. Create the database (Supabase, free tier)
1. Go to supabase.com → sign up → **New project**. Name it `tdc-market`, pick a region near the US, and save the database password somewhere safe.
2. When it's ready, open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and click **Run**. You should see "Success. No rows returned."
3. Open **Project Settings → API** (or **API Keys**) and keep this tab open. You'll copy three values from it:
   - **Project URL**, like `https://abcd1234.supabase.co`
   - **anon / publishable key**: safe to use in the website, because it can only read `market_snapshots`
   - **service_role / secret key**: private, full access, and used only by the pipeline

### 2. Get a Claude API key
1. Go to console.anthropic.com → sign in → **Billing**, and add a small amount of credit.
2. Go to **API Keys → Create key** and name it `tdc-market`.
3. Cost: the first run classifies the backlog, and later runs only classify jobs that are new that day. On the default Haiku model that's typically cents per day. `MAX_CLASSIFY` (default 400 per run) caps it.

### 3. Add the secrets to GitHub
The repo belongs to your co-founder, so **he** needs to do this step, because only repo admins can add secrets.
GitHub → the TDC-site repo → **Settings → Secrets and variables → Actions → New repository secret**. Add three:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Project URL from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key from step 1 |
| `ANTHROPIC_API_KEY` | key from step 2 |

Optional: on the **Variables** tab, `CLASSIFIER_MODEL` switches the Claude model. It defaults to `claude-haiku-4-5`.

### 4. Add the public keys to Vercel
Vercel → the project → **Settings → Environment Variables**. Add both for **Production** and **Preview**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

### 5. Push the code, then run the pipeline once
1. Commit and push from GitHub Desktop as usual.
2. On GitHub, open **Actions → FDE Market → Run workflow**. It takes a few minutes.
3. Open the finished run. The summary shows the numbers it calculated and any **boards that failed**. A failed board usually means the board name in `companies.json` is wrong. Fix the name from the company's careers URL and run it again.
4. In Vercel, **Redeploy** the latest deployment once so it picks up the new environment variables. The module now appears on the homepage.

From here it runs by itself every morning.

## Running it day to day

**Review the borderline calls (5 minutes a week).** In Supabase, open **Table Editor → `review_queue`**. These are jobs the classifier was 50–79% sure about. For any you disagree with, open the `jobs` table, find the row, and set `review_override` to `true` (counts) or `false` (doesn't count). Overrides win over the classifier forever.

**Grow coverage.** Add companies to `pipeline/companies.json`. The board name is the bit after `jobs.ashbyhq.com/`, `boards.greenhouse.io/` or `jobs.lever.co/` in their careers links. Coverage is the biggest lever on how representative the numbers are. When you want market-wide coverage beyond the companies you list, a licensed job-data provider can be added as another source in `sources.mjs`. Avoid scraping LinkedIn or Indeed, because it breaks their terms.

**Test without touching anything.** `node pipeline/run.mjs --dry-run` only collects and prints the matching titles. It uses no database and no Claude calls.

## Honesty rules built in
- No number is ever typed into the site.
- Median pay always shows how many roles it's based on.
- Growth only says "YoY" after a year of TDC's own data.
- The footnote states the source: N company job boards, classified against TDC's definition, updated daily.
