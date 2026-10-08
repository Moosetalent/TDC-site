// Small text helpers shared by the collectors and the classifier.

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…",
};

export function decodeEntities(s = "") {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** HTML (possibly entity-escaped, as Greenhouse sends it) → readable plain text. */
export function htmlToText(html = "") {
  let s = decodeEntities(html); // Greenhouse double-encodes: &lt;p&gt;
  s = s
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\s*(br|\/p|\/div|\/li|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return s.replace(/[ \t\f\v]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim();
}

// Broad net on purpose: "not every FDE role is called FDE". The classifier
// decides what actually counts; this only keeps obviously unrelated jobs
// (recruiters, accountants, ...) away from the LLM to save cost.
const TITLE_PATTERNS = [
  /forward[\s-]*deploy/i,
  /\bdeploy(ed|ment)\s+(software\s+|ai\s+|ml\s+)?engineer/i,
  /\bdeployment\s+strategist/i,
  /\bfield\s+(software\s+|ai\s+|ml\s+)?engineer/i,
  /\bapplied\s+(ai|ml)\s+engineer/i,
  /\bsolutions?\s+engineer/i,
  /\bcustomer\s+engineer/i,
  /\bimplementation\s+engineer/i,
  /\bagent\s+(deployment\s+)?engineer/i,
  /\bai\s+deployment/i,
];

export function looksRelevant(title = "") {
  return TITLE_PATTERNS.some((re) => re.test(title));
}
