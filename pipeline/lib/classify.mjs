// Step 3 — Classify every job with an LLM.
//
// Each new job's title + description goes to Claude with TDC's own definition
// of a forward deployed engineer. Claude answers through a forced tool call, so
// the reply is always structured JSON that matches the database columns.

const MODEL = process.env.CLASSIFIER_MODEL || "claude-haiku-4-5";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You classify job postings for The Deployment Club's FDE Market index.

TDC's definition of a forward deployed engineer (FDE):
An engineer who works directly with customers, embedded in or alongside their teams, and writes real production code (integrations, pipelines, agents, custom features, data work) to get a product deployed and delivering value in the customer's environment. Customer-facing AND hands-on-keyboard are both required.

Counts as FDE even if titled differently, e.g. "Deployment Engineer", "Deployed Engineer", "Applied AI Engineer" (customer-embedded), "Deployment Strategist" with real engineering, "Agent Engineer" building for customers, some "Solutions/Customer/Implementation Engineer" roles when the job is mostly building and shipping code for customers.

Does NOT count:
- Pre-sales sales/solutions engineers whose job is demos, RFPs and proofs of concept without production delivery
- Support, customer success, account management, technical account managers
- Hardware, telecom or facilities field service technicians, IT field engineers
- Internal platform/product engineers with no customer contact
- Pure consulting/strategy with no coding

fde_confidence: 0–100, how sure you are this is a genuine FDE role by the definition above (set it high for a clear FDE, low for a clear non-FDE; is_fde must agree with it being >= 50).

Salary: only BASE salary stated in the posting, converted to an annual figure (hourly × 2080). Ignore OTE, bonus, equity, and anything not stated. If no base salary is given, leave salary fields null.

Be literal. Do not guess facts the posting does not support; use "unknown" where allowed.`;

const TOOL = {
  name: "record_classification",
  description: "Record the classification of one job posting.",
  input_schema: {
    type: "object",
    properties: {
      is_fde: { type: "boolean" },
      fde_confidence: { type: "integer", minimum: 0, maximum: 100 },
      rationale: { type: "string", description: "One short sentence explaining the decision." },
      seniority: { type: "string", enum: ["junior", "mid", "senior", "staff_plus", "manager", "unknown"] },
      category: {
        type: "string",
        enum: ["ai_agents", "data_ml", "defense", "fintech", "security", "devtools", "healthcare", "enterprise_saas", "other"],
        description: "What the employer sells / the domain of the work.",
      },
      ai_or_agents: { type: "boolean", description: "The role deploys AI, LLM or agent products." },
      customer_facing: { type: "boolean" },
      coding_intensity: { type: "string", enum: ["high", "medium", "low", "unknown"] },
      travel: { type: "string", enum: ["none", "under_25", "25_50", "over_50", "unknown"] },
      remote: { type: ["boolean", "null"] },
      salary_min: { type: ["number", "null"], description: "Annual base, lower bound" },
      salary_max: { type: ["number", "null"], description: "Annual base, upper bound" },
      salary_currency: { type: ["string", "null"], description: "ISO code, e.g. USD" },
    },
    required: [
      "is_fde", "fde_confidence", "rationale", "seniority", "category", "ai_or_agents",
      "customer_facing", "coding_intensity", "travel", "remote", "salary_min", "salary_max", "salary_currency",
    ],
  },
};

async function classifyOne(job) {
  const posting = [
    `Company: ${job.company}`,
    `Title: ${job.title}`,
    `Location: ${job.location ?? "unknown"}`,
    "",
    (job.description ?? "").slice(0, 12000),
  ].join("\n");

  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM,
        tools: [TOOL],
        tool_choice: { type: "tool", name: TOOL.name },
        messages: [{ role: "user", content: posting }],
      }),
    });

    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);

    const data = await res.json();
    const out = data.content?.find((b) => b.type === "tool_use")?.input;
    if (!out) throw new Error("No classification returned");
    return out;
  }
}

/**
 * Classify jobs and return the database updates for them.
 * Salary from the job board wins; the description-extracted salary is a fallback.
 */
export async function classifyJobs(jobs, { concurrency = 4, onError = () => {} } = {}) {
  if (!API_KEY) throw new Error("ANTHROPIC_API_KEY must be set");
  const updates = [];
  const queue = [...jobs];

  async function worker() {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        const c = await classifyOne(job);
        const confidence = Math.max(0, Math.min(100, Math.round(c.fde_confidence)));
        const update = {
          id: job.id,
          classified_at: new Date().toISOString(),
          classifier_model: MODEL,
          is_fde: Boolean(c.is_fde),
          fde_confidence: confidence,
          rationale: c.rationale?.slice(0, 500) ?? null,
          seniority: c.seniority,
          category: c.category,
          ai_or_agents: Boolean(c.ai_or_agents),
          customer_facing: Boolean(c.customer_facing),
          coding_intensity: c.coding_intensity,
          travel: c.travel,
          needs_review: confidence >= 50 && confidence < 80,
        };
        if (job.remote == null && typeof c.remote === "boolean") update.remote = c.remote;
        const hasBoardSalary = job.salary_source === "board";
        if (!hasBoardSalary && c.salary_min > 0) {
          update.salary_min = c.salary_min;
          update.salary_max = c.salary_max > 0 ? c.salary_max : c.salary_min;
          update.salary_currency = (c.salary_currency || "USD").toUpperCase();
          update.salary_source = "description";
        }
        updates.push(update);
      } catch (err) {
        onError(job, err);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return updates;
}
