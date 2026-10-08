"use client";

// THE FDE MARKET // LIVE
// Reads the daily snapshots the pipeline writes to Supabase. Nothing here is
// hardcoded: until the pipeline has produced its first snapshot (or if the
// Supabase env vars are missing) the module renders nothing at all.

import { useEffect, useState, type ReactNode } from "react";

type Snapshot = {
  snapshot_date: string; // YYYY-MM-DD
  taken_at: string;
  open_roles: number;
  companies_hiring: number;
  median_base: number | null;
  comp_sample: number;
  ai_agents_pct: number | null;
  tracked_companies: number;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DAY = 86_400_000;
const toTime = (d: string) => new Date(`${d}T00:00:00Z`).getTime();
const fmtInt = (n: number) => n.toLocaleString("en-US");
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

/** Newest snapshot at least `days` older than `latest` (history is newest-first). */
function atLeastDaysBefore(history: Snapshot[], latest: Snapshot, days: number) {
  const cutoff = toTime(latest.snapshot_date) - days * DAY;
  return history.find((s) => toTime(s.snapshot_date) <= cutoff);
}

function pct(now: number, then: number) {
  if (!then) return null;
  return ((now - then) / then) * 100;
}

function signed(n: number, digits = 0) {
  const v = n.toFixed(digits);
  return n > 0 ? `+${v}` : v;
}

type Delta = { text: string; dir: "up" | "down" | "flat" };

function delta(diff: number | null | undefined, suffix: string, digits = 0): Delta | undefined {
  if (diff == null || !Number.isFinite(diff)) return undefined;
  const rounded = Number(diff.toFixed(digits));
  const dir = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  return { text: `${Math.abs(rounded).toFixed(digits)} ${suffix}`, dir };
}

/* ------------------------------------------------------------------------ */

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 72;
  const h = 26;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 4) + 2;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg className="market__spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.5" fill="currentColor" />
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  roles: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18" />
    </>
  ),
  pay: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  ai: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  companies: (
    <>
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20" />
      <path d="M8 8h2M8 12h2M8 16h2M17 13h0M17 17h0" />
    </>
  ),
  growth: <path d="M5 20v-4M10 20v-8M15 20v-6M20 20V6" />,
};

function Tile({
  icon,
  value,
  label,
  sub,
  change,
  series,
}: {
  icon: keyof typeof ICONS;
  value: string;
  label: string;
  sub?: string;
  change?: Delta;
  series?: number[];
}) {
  return (
    <div className="market__tile">
      <svg className="market__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        {ICONS[icon]}
      </svg>
      <div className="market__body">
        <div className="market__top">
          <div className="market__value">{value}</div>
          {series && <Sparkline values={series} />}
        </div>
        <div className="market__label">{label}</div>
        {change ? (
          <div className={`market__change market__change--${change.dir}`}>
            <span aria-hidden="true">{change.dir === "up" ? "↑" : change.dir === "down" ? "↓" : "→"}</span>{" "}
            {change.text}
          </div>
        ) : (
          sub && <div className="market__sub">{sub}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export default function FdeMarket() {
  const [history, setHistory] = useState<Snapshot[] | null>(null);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    const ctrl = new AbortController();
    fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/market_snapshots?select=*&order=snapshot_date.desc&limit=400`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        signal: ctrl.signal,
      },
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Snapshot[]) => setHistory(Array.isArray(rows) ? rows : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (!history?.length) return null;

  const latest = history[0];
  const weekAgo = atLeastDaysBefore(history, latest, 7);
  const ninety = atLeastDaysBefore(history, latest, 90);
  const yearAgo = atLeastDaysBefore(history, latest, 365);
  const oldest = history[history.length - 1];

  // Sparklines: the last 30 snapshots, oldest → newest.
  const recent = history.slice(0, 30).reverse();
  const line = (pick: (s: Snapshot) => number | null) =>
    recent.map(pick).filter((v): v is number => v != null);

  // Growth: only claim YoY once a year of our own data exists; until then a
  // 90-day window; until then "since we started tracking".
  const base = yearAgo ?? ninety ?? (oldest !== latest && toTime(latest.snapshot_date) - toTime(oldest.snapshot_date) >= 7 * DAY ? oldest : undefined);
  const growth = base ? pct(latest.open_roles, base.open_roles) : null;
  const growthLabel = yearAgo ? "YoY growth" : ninety ? "90-day growth" : base ? `Growth since ${fmtDate(base.snapshot_date)}` : "Tracking since";

  const aiBase = ninety ?? weekAgo;

  return (
    <section className="market" aria-labelledby="fde-market-title">
      <div className="market__panel">
        <div className="market__head">
          <div>
            <h2 className="market__title" id="fde-market-title">
              <span className="market__live" aria-hidden="true" />
              The FDE Market <span className="market__slashes">//</span> <span className="accent">Live</span>
            </h2>
            <p className="market__tagline">Tracking the Forward Deployed Engineering market in real time.</p>
          </div>
          <div className="market__updated">Updated {timeAgo(latest.taken_at)}</div>
        </div>

        <div className="market__grid">
          <Tile
            icon="roles"
            value={fmtInt(latest.open_roles)}
            label="Open roles"
            change={weekAgo ? delta(latest.open_roles - weekAgo.open_roles, "this week") : undefined}
            sub="Verified FDE roles"
            series={line((s) => s.open_roles)}
          />
          <Tile
            icon="pay"
            value={latest.median_base ? `$${Math.round(latest.median_base / 1000)}K` : "—"}
            label="Median base*"
            sub={`Based on ${fmtInt(latest.comp_sample)} roles with published pay`}
            series={line((s) => s.median_base)}
          />
          <Tile
            icon="ai"
            value={latest.ai_agents_pct == null ? "—" : `${Math.round(latest.ai_agents_pct)}%`}
            label="AI / Agents"
            change={
              aiBase && latest.ai_agents_pct != null && aiBase.ai_agents_pct != null
                ? delta(Number(latest.ai_agents_pct) - Number(aiBase.ai_agents_pct), aiBase === ninety ? "pts vs 90 days" : "pts this week")
                : undefined
            }
            sub="Of open FDE roles"
            series={line((s) => (s.ai_agents_pct == null ? null : Number(s.ai_agents_pct)))}
          />
          <Tile
            icon="companies"
            value={fmtInt(latest.companies_hiring)}
            label="Companies hiring"
            change={weekAgo ? delta(latest.companies_hiring - weekAgo.companies_hiring, "this week") : undefined}
            sub={`Of ${fmtInt(latest.tracked_companies)} tracked`}
            series={line((s) => s.companies_hiring)}
          />
          <Tile
            icon="growth"
            value={growth == null ? fmtDate(oldest.snapshot_date) : `${signed(growth)}%`}
            label={growthLabel}
            sub={growth == null ? "Growth shows after 7 days" : "Open roles"}
            series={line((s) => s.open_roles)}
          />
        </div>

        <p className="market__note">
          *Median of the midpoint of published base salary ranges (USD). Live roles from{" "}
          {fmtInt(latest.tracked_companies)} company job boards, classified against TDC&apos;s definition of a
          forward deployed engineer. Updated daily.
        </p>
      </div>
    </section>
  );
}
