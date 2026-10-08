-- The FDE Market — database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- jobs: one row per job posting we have ever seen.
-- Written only by the pipeline (service role key). Never readable by the site.
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id               text primary key,            -- "<ats>:<board>:<job id>"
  source           text not null,               -- greenhouse | lever | ashby
  company          text not null,
  company_key      text not null,               -- "<ats>:<board>"
  title            text not null,
  location         text,
  remote           boolean,
  description      text,
  source_url       text,
  posted_date      timestamptz,

  first_seen       timestamptz not null default now(),
  last_seen        timestamptz not null default now(),
  is_active        boolean not null default true,

  -- Base salary (annual). From the job board when it publishes one,
  -- otherwise extracted from the job description by the classifier.
  salary_min       numeric,
  salary_max       numeric,
  salary_currency  text,
  salary_source    text,                        -- board | description

  -- Classification (filled in by the LLM step)
  classified_at    timestamptz,
  classifier_model text,
  is_fde           boolean,
  fde_confidence   integer,                     -- 0–100
  seniority        text,                        -- junior | mid | senior | staff_plus | manager
  category         text,                        -- ai_agents | defense | fintech | ...
  ai_or_agents     boolean,
  customer_facing  boolean,
  coding_intensity text,                        -- high | medium | low
  travel           text,                        -- none | under_25 | 25_50 | over_50 | unknown
  rationale        text,                        -- one-line reason from the classifier

  -- Human review. Leave NULL to trust the classifier.
  -- Set TRUE / FALSE in the Table Editor to force a job in or out.
  needs_review     boolean not null default false,
  review_override  boolean
);

create index if not exists jobs_active_idx      on public.jobs (is_active);
create index if not exists jobs_company_key_idx on public.jobs (company_key);
create index if not exists jobs_unclassified_idx on public.jobs (classified_at) where classified_at is null;

-- A job counts toward the homepage numbers when a human said so, or when
-- the classifier is at least 70% confident it is a genuine FDE role.
create or replace view public.verified_fde_jobs as
  select *
  from public.jobs
  where is_active
    and coalesce(review_override, (is_fde and fde_confidence >= 70), false);

-- Jobs worth a human look: the classifier was unsure (50–79% confidence).
create or replace view public.review_queue as
  select id, company, title, fde_confidence, is_fde, rationale, source_url, review_override
  from public.jobs
  where is_active and needs_review and review_override is null
  order by fde_confidence desc;

-- ---------------------------------------------------------------------------
-- market_snapshots: one row per day with the computed homepage numbers.
-- This is the ONLY table the website reads, and it is read-only for the site.
-- ---------------------------------------------------------------------------
create table if not exists public.market_snapshots (
  snapshot_date     date primary key,
  taken_at          timestamptz not null default now(),
  open_roles        integer not null,
  companies_hiring  integer not null,
  median_base       integer,                    -- USD, annual; NULL when no comp data
  comp_sample       integer not null default 0, -- roles with published USD base pay
  ai_agents_pct     numeric(5,2),               -- 0–100
  tracked_companies integer not null default 0,
  roles_scanned     integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The website uses the public "anon" key, so lock everything down and allow
-- exactly one thing: reading market_snapshots.
-- The pipeline uses the service_role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.jobs enable row level security;
alter table public.market_snapshots enable row level security;

drop policy if exists "Public can read snapshots" on public.market_snapshots;
create policy "Public can read snapshots"
  on public.market_snapshots for select
  to anon
  using (true);

-- Views run with the owner's rights by default; make them respect RLS so the
-- anon key cannot read job rows through them.
alter view public.verified_fde_jobs set (security_invoker = true);
alter view public.review_queue set (security_invoker = true);
