// Step 2 — The database. A thin wrapper over Supabase's REST API, so the
// pipeline needs no npm packages at all.

const URL_ = process.env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers(extra = {}) {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function call(method, path, body, extra) {
  if (!URL_ || !KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: headers(extra),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase ${method} ${path.split("?")[0]} → ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Insert or update rows by primary key. Only the columns sent are touched. */
export async function upsert(table, rows, { batch = 200, onConflict } = {}) {
  const q = onConflict ? `?on_conflict=${onConflict}` : "";
  for (let i = 0; i < rows.length; i += batch) {
    await call("POST", `${table}${q}`, rows.slice(i, i + batch), {
      Prefer: "resolution=merge-duplicates,return=minimal",
    });
  }
}

export async function patch(table, filter, values) {
  return call("PATCH", `${table}?${filter}`, values, { Prefer: "return=minimal" });
}

/** Read every row matching a PostgREST query, paging through results. */
export async function selectAll(table, query, { page = 1000 } = {}) {
  const out = [];
  for (let from = 0; ; from += page) {
    const rows = await call("GET", `${table}?${query}`, undefined, {
      Range: `${from}-${from + page - 1}`,
      "Range-Unit": "items",
    });
    out.push(...rows);
    if (rows.length < page) return out;
  }
}

/** Quote a value for a PostgREST in.() filter. */
export const inList = (values) => `(${values.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")})`;
