export type TableRow = Record<string, string>;

export function stripMd(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
}

function isTableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}
function isSeparatorRow(line: string): boolean {
  return /^\s*\|?[\s:-]+\|[\s:|-]*\s*$/.test(line) && /-{2,}/.test(line);
}
function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

// Finds every pipe-table in the document and returns each as an array of row objects
// keyed by that table's own header cells (works for 2-col Field/Value tables and
// wider history tables alike, since it never assumes a specific header name).
export function parseMarkdownTables(md: string): TableRow[][] {
  const lines = md.split(/\r?\n/);
  const tables: TableRow[][] = [];
  let i = 0;
  while (i < lines.length) {
    if (isTableRow(lines[i]) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headers = splitRow(lines[i]);
      i += 2;
      const rows: TableRow[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        const cells = splitRow(lines[i]);
        const row: TableRow = {};
        headers.forEach((h, idx) => {
          row[h] = stripMd(cells[idx] ?? "");
        });
        rows.push(row);
        i++;
      }
      tables.push(rows);
    } else {
      i++;
    }
  }
  return tables;
}

// Flattens every 2-column table in the doc into one key->value map, using each row's own
// two cell values as the pair (so it works regardless of whether headers say "Field/Value"
// or something else) — this is how CRM_STATUS.md / BUSINESS_PROFILE.md tables get read.
export function parseKeyValueTable(md: string): TableRow {
  const kv: TableRow = {};
  for (const table of parseMarkdownTables(md)) {
    for (const row of table) {
      const keys = Object.keys(row);
      if (keys.length === 2) {
        const keyName = row[keys[0]];
        const value = row[keys[1]];
        if (keyName && value !== undefined) kv[keyName] = value;
      }
    }
  }
  return kv;
}

export function extractDate(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

export function splitH2Blocks(md: string): Array<{ heading: string; body: string; fullText: string }> {
  const lines = md.split(/\r?\n/);
  const idxs: number[] = [];
  lines.forEach((l, i) => {
    if (/^##\s+/.test(l)) idxs.push(i);
  });

  const blocks: Array<{ heading: string; body: string; fullText: string }> = [];
  const firstIdx = idxs.length ? idxs[0] : lines.length;
  const preface = lines.slice(0, firstIdx).join("\n");
  blocks.push({ heading: "", body: preface, fullText: preface });

  for (let n = 0; n < idxs.length; n++) {
    const start = idxs[n];
    const end = n + 1 < idxs.length ? idxs[n + 1] : lines.length;
    const chunk = lines.slice(start, end);
    blocks.push({
      heading: chunk[0].replace(/^##\s+/, "").trim(),
      body: chunk.slice(1).join("\n"),
      fullText: chunk.join("\n"),
    });
  }
  return blocks;
}

const STAGE_RULES: Array<[RegExp, string]> = [
  [/\blost\b|\brejected\b|\bdeclined\b/i, "LOST"],
  [/\bwon\b|\bsigned\b|closed.?won/i, "WON"],
  [/negotiat/i, "NEGOTIATION"],
  [/proposal.*sent/i, "PROPOSAL_SENT"],
  [/discovery.*(done|completed|held)/i, "DISCOVERY_DONE"],
  [/discovery.*(booked|scheduled)/i, "DISCOVERY_BOOKED"],
  [/\breplied\b|3\.\s*replied/i, "REPLIED"],
  [/waiting for response|email sent|2\.\s*contacted|\bcontacted\b/i, "CONTACTED"],
  [
    /audit completed|lead qualified|\bqualified\b|\bsourced\b|1\.\s*sourced|draft ready|ready to send|ready for.*outreach|outreach preparation/i,
    "SOURCED",
  ],
];

// Best-effort mapping from MISSION-AUGUST's free-text stage values to the app's fixed
// LeadStatus enum. Anything unrecognized carries the previous known stage forward and logs
// a warning instead of guessing — the original text is always preserved separately in
// PipelineEvent.rawStageText/rawFields regardless of whether this matched.
export function normalizeStage(rawText: string | undefined, previous: string, warn: (msg: string) => void): string {
  if (!rawText) return previous;
  for (const [re, status] of STAGE_RULES) {
    if (re.test(rawText)) return status;
  }
  warn(`Unrecognized stage text "${rawText}" — carrying forward previous stage ${previous}`);
  return previous;
}

export function parseScoreBreakdown(text: string): Record<string, number> {
  const result: Record<string, number> = {};
  const re = /(gap severity|business health|reachability|budget\/size|urgency)\s*(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const key = m[1].toLowerCase().replace(/[^a-z]+/g, "_");
    result[key] = parseInt(m[2], 10);
  }
  return result;
}
