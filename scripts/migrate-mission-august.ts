import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db";
import type {
  LeadStatus,
  Priority,
  LeadNoteType,
  FindingType,
  EmailDraftStatus,
  FollowupStatus,
  Prisma,
} from "../lib/generated/prisma/client";
import { discoverLeadFolders, locateMissionAugust, readIfExists } from "./lib/locate-source";
import {
  extractDate,
  normalizeStage,
  parseKeyValueTable,
  parseMarkdownTables,
  parseScoreBreakdown,
  splitH2Blocks,
  stripMd,
} from "./lib/markdown-parse";

// Prisma's JSON input type doesn't structurally accept Record<string, unknown> — our
// score-breakdown objects are always plain JSON-serializable data, so this cast is safe.
function asJson<T>(value: T | null | undefined): Prisma.InputJsonValue | undefined {
  return value == null ? undefined : (value as unknown as Prisma.InputJsonValue);
}

// ---------- BUSINESS_PROFILE.md ----------

function parseBusinessProfile(content: string) {
  const kv = parseKeyValueTable(content);
  const niche = kv["Niche"] ?? null;
  return {
    company: kv["Business"] ?? null,
    website: kv["Website"] ?? null,
    location: kv["Location"] ?? null,
    email: kv["Email"] ?? null,
    phone: kv["Phone"] ?? null,
    source: kv["Source"] ?? null,
    industry: niche ? niche.split(" — ")[0].trim() : null,
  };
}

// ---------- CRM_STATUS.md -> PipelineEvent[] ----------

type ParsedEvent = {
  occurredAt: string;
  stage: LeadStatus;
  rawStageText: string | null;
  rawFields: Record<string, string>;
  leadScore: number | null;
  scoreBreakdown: Record<string, unknown> | null;
  priority: Priority | null;
  probability: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  notes: string | null;
};

function parsePriority(text: string | undefined): Priority | null {
  if (!text) return null;
  if (/urgent/i.test(text)) return "URGENT";
  if (/\bA\b|high/i.test(text)) return "HIGH";
  if (/\bB\b|standard|medium/i.test(text)) return "MEDIUM";
  if (/\bC\b|low/i.test(text)) return "LOW";
  return null;
}

function parseCrmStatusToEvents(content: string, fileLastUpdated: string | null, warn: (m: string) => void): ParsedEvent[] {
  const blocks = splitH2Blocks(content);
  const events: ParsedEvent[] = [];
  let previousStage: LeadStatus = "SOURCED";

  for (const block of blocks) {
    const isAppend = block.heading === "" || /^APPEND/i.test(block.heading);
    if (!isAppend) continue;

    const kv = parseKeyValueTable(block.fullText);
    if (Object.keys(kv).length === 0) continue;

    const stageText = kv["Current Stage"] ?? kv["Stage"] ?? kv["Lead Status"] ?? kv["Status"];
    const stage = normalizeStage(stageText, previousStage, warn) as LeadStatus;
    previousStage = stage;

    const scoreEntry = Object.entries(kv).find(([k]) => /lead score/i.test(k));
    let leadScore: number | null = null;
    let scoreBreakdown: Record<string, unknown> | null = null;
    if (scoreEntry) {
      const [, scoreText] = scoreEntry;
      const over15 = scoreText.match(/(\d+(?:\.\d+)?)\s*\/\s*15/);
      const anyScore = scoreText.match(/(\d+(?:\.\d+)?)\s*\/\s*\d+/);
      const numeric = over15 ?? anyScore;
      if (numeric) leadScore = Math.round(parseFloat(numeric[1]));

      const dims = parseScoreBreakdown(scoreText);
      const rawTail = scoreText.match(/—\s*(.+)/)?.[1] ?? scoreText;
      scoreBreakdown = { raw: rawTail, ...dims };
    }

    const dateFromHeading = extractDate(block.heading);
    const dateFromBody = extractDate(block.fullText);
    const occurredAt = dateFromHeading ?? kv["Last Updated"] ?? dateFromBody ?? fileLastUpdated ?? "2026-08-03";

    const followupDateEntry = Object.entries(kv).find(([k]) => /follow-?up date/i.test(k));

    events.push({
      occurredAt,
      stage,
      rawStageText: stageText ?? null,
      rawFields: kv,
      leadScore,
      scoreBreakdown,
      priority: parsePriority(kv["Priority"]),
      probability: kv["Current Probability of Closing"] ?? null,
      nextAction: kv["Next Action"] ?? null,
      nextActionDate: followupDateEntry ? extractDate(followupDateEntry[1]) : null,
      notes: null,
    });
  }

  return events;
}

// ---------- EMAIL_HISTORY.md / FOLLOWUP_HISTORY.md ----------

function parseEmailHistory(content: string) {
  const table = parseMarkdownTables(content)[0] ?? [];
  return table
    .filter((row) => extractDate(row["Date"]) !== null)
    .map((row) => ({
      date: extractDate(row["Date"])!,
      subject: row["Subject"] ?? "",
      emailVersion: row["Email Version"] || null,
      status: row["Status"] || "",
      opened: /yes|true|opened/i.test(row["Opened"] ?? ""),
      replied: /yes|true|replied/i.test(row["Replied"] ?? ""),
      notes: row["Notes"] || null,
      gmailDraftId: (row["Notes"] ?? "").match(/Gmail draft(?: ID)?\s*`?([a-zA-Z0-9]+)`?/)?.[1] ?? null,
    }));
}

function parseFollowupHistory(content: string) {
  const table = parseMarkdownTables(content)[0] ?? [];
  return table
    .filter((row) => extractDate(row["Date"]) !== null)
    .map((row) => {
      const statusText = row["Status"] ?? "";
      const status: FollowupStatus = /sent/i.test(statusText)
        ? "SENT"
        : /skip/i.test(statusText)
        ? "SKIPPED"
        : /cancel/i.test(statusText)
        ? "CANCELLED"
        : "SCHEDULED";
      return {
        followupNumber: row["Follow-up #"] ? parseInt(row["Follow-up #"], 10) || null : null,
        channel: row["Channel"] || null,
        template: row["Template used"] || null,
        sentDate: extractDate(row["Date"]),
        status,
        notes: row["Notes"] || null,
      };
    });
}

// ---------- WEBSITE_AUDIT.md + LIGHTHOUSE_REPORT.md + POWERMAPPER_REPORT.md -> one Audit ----------

const MIGRATION_MARKER = "[MISSION-AUGUST MIGRATION]";

function parseAudit(websiteAudit: string | null, lighthouse: string | null, powerMapper: string | null) {
  if (!websiteAudit && !lighthouse && !powerMapper) return null;

  const combinedRaw = [
    websiteAudit ? `=== WEBSITE_AUDIT.md ===\n${websiteAudit}` : "",
    lighthouse ? `=== LIGHTHOUSE_REPORT.md ===\n${lighthouse}` : "",
    powerMapper ? `=== POWERMAPPER_REPORT.md ===\n${powerMapper}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const performedAt = extractDate(websiteAudit) ?? extractDate(lighthouse) ?? extractDate(powerMapper) ?? "2026-08-03";

  let performanceScore: number | null = null;
  let performanceScoreRaw: string | null = null;
  let accessibilityScore: number | null = null;
  let bestPracticesScore: number | null = null;
  let seoScore: number | null = null;

  if (lighthouse) {
    for (const table of parseMarkdownTables(lighthouse)) {
      for (const row of table) {
        const metric = (row["Metric"] ?? "").toLowerCase();
        const score = row["Score"] ?? "";
        if (!metric || !score) continue;
        const range = score.match(/(\d+)\s*[-–]\s*(\d+)/);
        const single = score.match(/(\d+)/);
        const numeric = range
          ? Math.round((parseInt(range[1], 10) + parseInt(range[2], 10)) / 2)
          : single
          ? parseInt(single[1], 10)
          : null;
        if (metric.includes("performance")) {
          performanceScore = numeric;
          performanceScoreRaw = score;
        } else if (metric.includes("accessibility")) accessibilityScore = numeric;
        else if (metric.includes("best practices")) bestPracticesScore = numeric;
        else if (metric.includes("seo")) seoScore = numeric;
      }
    }
  }

  let powerMapperPagesFlagged: number | null = null;
  let browserIssues: string | null = null;
  let accessibilityIssues: string | null = null;
  if (powerMapper) {
    const pagesMatch = powerMapper.match(/(\d+)\s*pages?\s*flagged/i);
    if (pagesMatch) powerMapperPagesFlagged = parseInt(pagesMatch[1], 10);
    browserIssues = powerMapper.match(/browser-compatibility issues[^\n]*/i)?.[0] ?? null;
    accessibilityIssues = powerMapper.match(/accessibility issues[^\n]*/i)?.[0] ?? null;
  }

  let positiveObservations: string | null = null;
  let improvementOpportunities: string | null = null;
  let performanceObservations: string | null = null;
  const findings: Array<{ type: FindingType; category: string | null; description: string }> = [];

  if (websiteAudit) {
    const topFindings = websiteAudit.match(/## Top findings[\s\S]*?(?=\n##|\n---|$)/i)?.[0] ?? null;
    improvementOpportunities = topFindings;
    positiveObservations = websiteAudit.match(/## Honest headline[\s\S]*?(?=\n##)/i)?.[0] ?? null;
    performanceObservations = websiteAudit.match(/## \d\.\s*Speed[\s\S]*?(?=\n##)/i)?.[0] ?? null;

    if (topFindings) {
      for (const line of topFindings.split("\n")) {
        const m = line.match(/^\d+\.\s+(.+)/);
        if (m) findings.push({ type: "GAP", category: "website-audit", description: stripMd(m[1]) });
      }
    }
    const notVerified = websiteAudit.match(/## Not verified this session[\s\S]*?(?=\n##|\n---|$)/i)?.[0];
    if (notVerified) {
      for (const line of notVerified.split("\n")) {
        const m = line.match(/^-\s+(.+)/);
        if (m) findings.push({ type: "NOT_VERIFIED", category: "website-audit", description: stripMd(m[1]) });
      }
    }
  }

  const source = /founder-provided|founder.?run/i.test(combinedRaw) ? "founder-provided" : "live inspection";
  const verified = /now VERIFIED|VERIFIED \(founder-provided/i.test(combinedRaw);

  return {
    performedAt,
    performanceScore,
    performanceScoreRaw,
    accessibilityScore,
    bestPracticesScore,
    seoScore,
    powerMapperPagesFlagged,
    browserIssues,
    accessibilityIssues,
    performanceObservations,
    positiveObservations,
    improvementOpportunities,
    rawNotes: `${MIGRATION_MARKER}\n\n${combinedRaw}`,
    source,
    verified,
    findings,
  };
}

// ---------- Email drafts (Ready_To_Send/*.md, Draft_v1.md, EMAIL_DRAFT_V2.md) ----------

function splitEmailVersionChunks(raw: string) {
  const lines = raw.split(/\r?\n/);
  const markerIdxs: number[] = [];
  lines.forEach((line, i) => {
    if (/^##\s*(REVISION\s+)?v\d+/i.test(line.trim())) markerIdxs.push(i);
  });
  if (markerIdxs.length === 0) return [{ versionLabel: null as string | null, text: raw }];

  const chunks: Array<{ versionLabel: string | null; text: string }> = [];
  for (let i = 0; i < markerIdxs.length; i++) {
    const start = markerIdxs[i];
    const end = i + 1 < markerIdxs.length ? markerIdxs[i + 1] : lines.length;
    const chunkLines = lines.slice(start, end);
    const vMatch = chunkLines[0].match(/v(\d+)/i);
    chunks.push({ versionLabel: vMatch ? `v${vMatch[1]}` : null, text: chunkLines.join("\n") });
  }
  return chunks;
}

function extractEmailBody(text: string): string | null {
  const lines = text.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => /^Hi\b/.test(l.trim()));
  if (startIdx === -1) return null;
  const bodyLines: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6}\s/.test(l) || /^\*\*(Word count|What changed)/i.test(l) || /^---\s*$/.test(l)) break;
    bodyLines.push(l);
  }
  const joined = bodyLines.join("\n").trim();
  return joined || null;
}

function parseEmailDraftChunk(chunk: { versionLabel: string | null; text: string }, sourceTag: string, fallbackVersion: string) {
  const text = chunk.text;
  const version = chunk.versionLabel ?? fallbackVersion;

  const subjectMatch =
    text.match(/\*\*Subject:\*\*\s*(.+)/i) ??
    text.match(/^Subject:\s*\n+\s*(.+)/im) ??
    text.match(/##\s*Subject\s*\n+\s*(.+)/im);
  const subjectFinal = subjectMatch ? stripMd(subjectMatch[1]) : null;

  const subjectOptionsBlock = text.match(/##\s*Subject (?:line )?options\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
  const subjectOptions: string[] = [];
  if (subjectOptionsBlock) {
    for (const line of subjectOptionsBlock[1].split("\n")) {
      const m = line.match(/^\d+\.\s+(.+)/);
      if (m) subjectOptions.push(stripMd(m[1]));
    }
  }

  const previewText = text.match(/##\s*Preview text\s*\n+([^\n]+)/i)?.[1]?.trim() ?? null;
  const body = extractEmailBody(text) ?? text.trim();
  const wordCountMatch = text.match(/Word count:?\**\s*(\d+)/i);
  const confidenceMatch = text.match(/Confidence score:?\**\s*(\d+)\s*\/\s*10/i);
  const spamMatch = text.match(/Spam risk:?\**\s*(\w+)/i);
  const localTimeMatch = text.match(/Local(?:\s*\([^)]*\))?:?\**\s*(.+)/i);
  const istMatch = text.match(/IST equivalent:?\**\s*(.+)/i);
  const gmailMatch = text.match(/Gmail draft(?: ID)?:?\**\s*`([^`]+)`/i);
  const followupBlock =
    text.match(/##\s*(?:Recommended follow-up schedule|Follow-up schedule|Follow-up reminder)\s*\n([\s\S]*?)(?=\n##|\n---|$)/i)?.[1] ??
    null;

  const portfolioTable = parseMarkdownTables(text).find((t) => t.length && "Project" in (t[0] ?? {}));
  const portfolioLinksUsed = portfolioTable
    ? portfolioTable.map((r) => ({ project: r["Project"], why: r["Why it was selected"] ?? null }))
    : null;

  const head = text.slice(0, 400);
  const isSuperseded = /superseded/i.test(head);
  const isActive = /\bACTIVE\b|ready to send|awaiting founder send|awaiting founder review/i.test(head);

  return {
    sourceTag,
    version,
    subjectFinal,
    subjectOptions,
    previewText,
    body,
    wordCount: wordCountMatch ? parseInt(wordCountMatch[1], 10) : null,
    confidenceScore: confidenceMatch ? parseInt(confidenceMatch[1], 10) : null,
    spamRisk: spamMatch ? spamMatch[1] : null,
    bestSendTimeProspectLocal: localTimeMatch ? stripMd(localTimeMatch[1]) : null,
    bestSendTimeIst: istMatch ? stripMd(istMatch[1]) : null,
    followupScheduleNotes: followupBlock ? followupBlock.trim() : null,
    gmailDraftId: gmailMatch ? gmailMatch[1] : null,
    portfolioLinksUsed,
    isSuperseded,
    isActive,
    status: "DRAFT" as EmailDraftStatus,
  };
}

// ---------- DailyReport ----------

function parseDailyReport(content: string) {
  const titleMatch = content.match(/^#\s*(Day \d+.*?)\s*[—-]\s*(\d{4}-\d{2}-\d{2})/m);
  const date = titleMatch ? titleMatch[2] : extractDate(content) ?? "2026-08-03";
  const isPlanOnly = /Action Plan/i.test(content.slice(0, 100)) && !/^#\s*Day \d+ Report/im.test(content);

  const section = (heading: string) => {
    const re = new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, "i");
    const m = content.match(re);
    return m ? m[1].trim() : null;
  };

  const numbersBlock = section("Expected numbers.*") ?? section("Targets recap");
  let expectedNumbers: Record<string, string> | null = null;
  if (numbersBlock) {
    const table = parseMarkdownTables(numbersBlock)[0];
    if (table && table.length) {
      expectedNumbers = {};
      for (const row of table) {
        const keys = Object.keys(row);
        if (keys.length === 2) expectedNumbers[row[keys[0]]] = row[keys[1]];
      }
    } else {
      const obj: Record<string, string> = {};
      for (const line of numbersBlock.split("\n")) {
        const m = line.match(/\*\*(.+?):\*\*\s*(.+)/);
        if (m) obj[m[1].trim()] = m[2].trim();
      }
      if (Object.keys(obj).length) expectedNumbers = obj;
    }
  }

  return {
    date,
    isPlanOnly,
    whatGotDone: section("What got done today"),
    wins: section("Wins"),
    mistakes: section("Mistakes"),
    lessonsLearned: section("Lessons learned"),
    tomorrowsObjectives: section("Tomorrow's objectives"),
    // Action-plan-only files (e.g. DAY_02_ACTION_PLAN.md) don't have the report's usual
    // section headings, so nothing above will match — fall back to the full raw file so
    // that content isn't silently dropped.
    priorityTasks: isPlanOnly ? content.trim() : section("Priority tasks"),
    expectedNumbers,
  };
}

type DailyReportParsed = ReturnType<typeof parseDailyReport>;

// A single calendar date can have more than one MISSION-AUGUST file (e.g. a morning
// DAY_02_ACTION_PLAN.md and an evening DAY_02_REPORT.md both dated 2026-08-04), but
// DailyReport.date is unique — merge same-date docs instead of the second upsert silently
// overwriting the first.
function mergeDailyReports(fileTag: string, parsed: DailyReportParsed, into: (DailyReportParsed & { files: string[] }) | undefined) {
  if (!into) return { ...parsed, files: [fileTag] };

  const mergeText = (a: string | null, b: string | null) => {
    if (a && b && a !== b) return `${a}\n\n---\n\n[From ${fileTag}]\n${b}`;
    return a ?? b;
  };

  return {
    date: into.date,
    isPlanOnly: into.isPlanOnly && parsed.isPlanOnly,
    whatGotDone: mergeText(into.whatGotDone, parsed.whatGotDone),
    wins: mergeText(into.wins, parsed.wins),
    mistakes: mergeText(into.mistakes, parsed.mistakes),
    lessonsLearned: mergeText(into.lessonsLearned, parsed.lessonsLearned),
    tomorrowsObjectives: mergeText(into.tomorrowsObjectives, parsed.tomorrowsObjectives),
    priorityTasks: mergeText(into.priorityTasks, parsed.priorityTasks),
    expectedNumbers:
      into.expectedNumbers || parsed.expectedNumbers ? { ...(into.expectedNumbers ?? {}), ...(parsed.expectedNumbers ?? {}) } : null,
    files: [...into.files, fileTag],
  };
}

// ---------- Per-lead migration ----------

type LeadMeta = { dir: string; id: string; legacyId: string; statusFolder: string };

async function migrateLead(root: string, meta: LeadMeta, opts: { dryRun: boolean }) {
  const dir = meta.dir;
  const folderName = path.basename(dir);
  const read = (name: string) => readIfExists(path.join(dir, name));

  const businessProfileRaw = read("BUSINESS_PROFILE.md");
  const crmStatusRaw = read("CRM_STATUS.md");
  const emailHistoryRaw = read("EMAIL_HISTORY.md");
  const followupHistoryRaw = read("FOLLOWUP_HISTORY.md");
  const websiteAuditRaw = read("WEBSITE_AUDIT.md");
  const lighthouseRaw = read("LIGHTHOUSE_REPORT.md");
  const powerMapperRaw = read("POWERMAPPER_REPORT.md");
  const nextActionsRaw = read("NEXT_ACTIONS.md");
  const discoveryNotesRaw = read("DISCOVERY_NOTES.md");
  const clientPsychologyRaw = read("CLIENT_PSYCHOLOGY.md");
  const projectStatusRaw = read("PROJECT_STATUS.md");
  const proposalRaw = read("PROPOSAL.md");
  const emailPerformanceRaw = read("EMAIL_PERFORMANCE.md");
  const draftV1Raw = read("Draft_v1.md");
  const draftV2Raw = read("EMAIL_DRAFT_V2.md");
  const readyToSendRaw = readIfExists(path.join(root, "05_Email_Templates", "Ready_To_Send", `${folderName}.md`));

  const warnings: string[] = [];
  const warn = (msg: string) => warnings.push(`[WARN] ${meta.legacyId}: ${msg}`);

  if (!businessProfileRaw) {
    warn("missing BUSINESS_PROFILE.md — skipping lead entirely");
    return { legacyId: meta.legacyId, company: null, status: null, skipped: true, warnings, events: 0, emailHistory: 0, followups: 0, audit: 0, emailDrafts: 0, notes: 0 };
  }

  const profile = parseBusinessProfile(businessProfileRaw);
  const fileLastUpdated = extractDate(businessProfileRaw);

  const events = crmStatusRaw ? parseCrmStatusToEvents(crmStatusRaw, fileLastUpdated, warn) : [];
  const lastEvent = events[events.length - 1] ?? null;
  const leadStatus: LeadStatus = lastEvent?.stage ?? "SOURCED";
  const leadScore = [...events].reverse().find((e) => e.leadScore != null)?.leadScore ?? null;
  const priority: Priority = [...events].reverse().find((e) => e.priority != null)?.priority ?? "MEDIUM";
  const scoreBreakdown = [...events].reverse().find((e) => e.scoreBreakdown != null)?.scoreBreakdown ?? null;

  const emailHistoryRows = emailHistoryRaw ? parseEmailHistory(emailHistoryRaw) : [];
  const followupRows = followupHistoryRaw ? parseFollowupHistory(followupHistoryRaw) : [];
  const audit = parseAudit(websiteAuditRaw, lighthouseRaw, powerMapperRaw);

  const emailDraftRecords: ReturnType<typeof parseEmailDraftChunk>[] = [];
  if (readyToSendRaw) {
    for (const chunk of splitEmailVersionChunks(readyToSendRaw)) {
      emailDraftRecords.push(parseEmailDraftChunk(chunk, "ReadyToSend", "v1"));
    }
  }
  if (draftV1Raw) {
    for (const chunk of splitEmailVersionChunks(draftV1Raw)) {
      emailDraftRecords.push(parseEmailDraftChunk(chunk, "DraftV1", "v1"));
    }
  }
  if (draftV2Raw) {
    for (const chunk of splitEmailVersionChunks(draftV2Raw)) {
      emailDraftRecords.push(parseEmailDraftChunk(chunk, "DraftV2", "v2"));
    }
  }

  for (const rec of emailDraftRecords) {
    const historyMatch = emailHistoryRows.find(
      (r) => r.emailVersion && rec.version && r.emailVersion.toLowerCase().includes(rec.version.toLowerCase())
    );
    if (historyMatch && /sent/i.test(historyMatch.status)) rec.status = "SENT";
    else if (rec.isSuperseded) rec.status = "SUPERSEDED";
    else if (rec.isActive) rec.status = "ACTIVE";
    else rec.status = "DRAFT";
  }
  // EMAIL_DRAFT_V2.md always supersedes Draft_v1.md for sending purposes once it exists,
  // even though v1's own header doesn't say "superseded" (only v2's header does).
  if (draftV1Raw && draftV2Raw) {
    for (const rec of emailDraftRecords) {
      if (rec.sourceTag === "DraftV1" && rec.status !== "SENT") rec.status = "SUPERSEDED";
    }
  }

  const noteRecords: Array<{ noteType: LeadNoteType; body: string }> = [];
  if (discoveryNotesRaw) noteRecords.push({ noteType: "DISCOVERY", body: discoveryNotesRaw });
  if (clientPsychologyRaw) noteRecords.push({ noteType: "PSYCHOLOGY", body: clientPsychologyRaw });
  if (nextActionsRaw) noteRecords.push({ noteType: "NEXT_ACTIONS", body: nextActionsRaw });
  if (projectStatusRaw) noteRecords.push({ noteType: "PROJECT_STATUS", body: projectStatusRaw });
  if (proposalRaw) noteRecords.push({ noteType: "PROPOSAL_NARRATIVE", body: proposalRaw });
  if (emailPerformanceRaw) noteRecords.push({ noteType: "GENERAL", body: emailPerformanceRaw });

  const summary = {
    legacyId: meta.legacyId,
    company: profile.company ?? folderName,
    status: leadStatus,
    skipped: false,
    warnings,
    events: events.length,
    emailHistory: emailHistoryRows.length,
    followups: followupRows.length,
    audit: audit ? 1 : 0,
    emailDrafts: emailDraftRecords.length,
    notes: noteRecords.length,
  };

  if (opts.dryRun) return summary;

  const existingLead = await db.lead.findUnique({ where: { legacyId: meta.legacyId } });
  let leadNumber = existingLead?.leadNumber;
  if (!leadNumber) {
    const max = await db.lead.aggregate({ _max: { leadNumber: true } });
    leadNumber = (max._max.leadNumber ?? 0) + 1;
  }

  await db.$transaction(async (tx) => {
    const lead = await tx.lead.upsert({
      where: { legacyId: meta.legacyId },
      create: {
        legacyId: meta.legacyId,
        leadNumber: leadNumber!,
        company: profile.company ?? folderName,
        industry: profile.industry,
        website: profile.website,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        source: profile.source,
        priority,
        status: leadStatus,
        leadScore,
        scoreBreakdown: asJson(scoreBreakdown),
        tags: ["migrated", `legacy-${meta.statusFolder.toLowerCase()}`],
        notes: businessProfileRaw,
      },
      update: {
        company: profile.company ?? folderName,
        industry: profile.industry,
        website: profile.website,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        source: profile.source,
        priority,
        status: leadStatus,
        leadScore,
        scoreBreakdown: asJson(scoreBreakdown),
        notes: businessProfileRaw,
      },
    });

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const legacyRef = `${meta.legacyId}:CRM_STATUS:${i}`;
      const data = {
        leadId: lead.id,
        occurredAt: new Date(e.occurredAt),
        stage: e.stage,
        rawStageText: e.rawStageText,
        rawFields: e.rawFields,
        leadScore: e.leadScore,
        scoreBreakdown: asJson(e.scoreBreakdown),
        priority: e.priority,
        probability: e.probability,
        nextAction: e.nextAction,
        nextActionDate: e.nextActionDate ? new Date(e.nextActionDate) : null,
        notes: e.notes,
      };
      await tx.pipelineEvent.upsert({ where: { legacyRef }, create: { legacyRef, ...data }, update: data });
    }

    for (let i = 0; i < emailHistoryRows.length; i++) {
      const r = emailHistoryRows[i];
      const legacyRef = `${meta.legacyId}:EMAIL_HISTORY:${i}`;
      const data = {
        leadId: lead.id,
        date: new Date(r.date),
        subject: r.subject,
        emailVersion: r.emailVersion,
        status: r.status,
        opened: r.opened,
        replied: r.replied,
        notes: r.notes,
        gmailDraftId: r.gmailDraftId,
      };
      await tx.emailHistoryEntry.upsert({ where: { legacyRef }, create: { legacyRef, ...data }, update: data });
    }

    for (let i = 0; i < followupRows.length; i++) {
      const r = followupRows[i];
      const legacyRef = `${meta.legacyId}:FOLLOWUP_HISTORY:${i}`;
      const data = {
        leadId: lead.id,
        followupNumber: r.followupNumber,
        channel: r.channel,
        template: r.template,
        sentDate: r.sentDate ? new Date(r.sentDate) : null,
        status: r.status,
        notes: r.notes,
      };
      await tx.followupEntry.upsert({ where: { legacyRef }, create: { legacyRef, ...data }, update: data });
    }

    if (audit) {
      // Audit has no natural unique key of its own — migrated rows are tagged with the
      // MIGRATION_MARKER prefix in rawNotes so re-running this script replaces them instead
      // of duplicating, without touching any Audit a user later adds by hand in the app.
      await tx.audit.deleteMany({ where: { leadId: lead.id, rawNotes: { startsWith: MIGRATION_MARKER } } });
      await tx.audit.create({
        data: {
          leadId: lead.id,
          performedAt: new Date(audit.performedAt),
          performanceScore: audit.performanceScore,
          performanceScoreRaw: audit.performanceScoreRaw,
          accessibilityScore: audit.accessibilityScore,
          bestPracticesScore: audit.bestPracticesScore,
          seoScore: audit.seoScore,
          powerMapperPagesFlagged: audit.powerMapperPagesFlagged,
          browserIssues: audit.browserIssues,
          accessibilityIssues: audit.accessibilityIssues,
          performanceObservations: audit.performanceObservations,
          positiveObservations: audit.positiveObservations,
          improvementOpportunities: audit.improvementOpportunities,
          rawNotes: audit.rawNotes,
          source: audit.source,
          verified: audit.verified,
          findings: { create: audit.findings.map((f) => ({ type: f.type, category: f.category, description: f.description })) },
        },
      });
    }

    for (const rec of emailDraftRecords) {
      const legacyRef = `${meta.legacyId}:EMAIL_DRAFT:${rec.sourceTag}:${rec.version}`;
      const data = {
        leadId: lead.id,
        version: rec.version,
        status: rec.status,
        subjectOptions: rec.subjectOptions,
        subjectFinal: rec.subjectFinal,
        previewText: rec.previewText,
        body: rec.body,
        wordCount: rec.wordCount,
        confidenceScore: rec.confidenceScore,
        spamRisk: rec.spamRisk,
        bestSendTimeProspectLocal: rec.bestSendTimeProspectLocal,
        bestSendTimeIst: rec.bestSendTimeIst,
        followupScheduleNotes: rec.followupScheduleNotes,
        portfolioLinksUsed: asJson(rec.portfolioLinksUsed),
        gmailDraftId: rec.gmailDraftId,
      };
      await tx.emailDraft.upsert({ where: { legacyRef }, create: { legacyRef, ...data }, update: data });
    }

    for (const note of noteRecords) {
      await tx.leadNote.upsert({
        where: { leadId_noteType: { leadId: lead.id, noteType: note.noteType } },
        create: { leadId: lead.id, noteType: note.noteType, body: note.body },
        update: { body: note.body },
      });
    }
  });

  return summary;
}

// ---------- Driver ----------

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const pathArg = args.find((a) => a.startsWith("--path="))?.split("=")[1];

  console.log(`MISSION-AUGUST migration — ${isDryRun ? "DRY RUN (no writes will be committed)" : "LIVE"}`);

  const root = locateMissionAugust(pathArg);
  console.log(`Source folder: ${root}`);

  const leadFolders = discoverLeadFolders(root);
  console.log(`Discovered ${leadFolders.length} lead folder(s).\n`);

  const results = [];
  for (const meta of leadFolders) {
    const result = await migrateLead(root, meta, { dryRun: isDryRun });
    results.push(result);
    const tag = result.skipped ? "[SKIP]" : "[OK]  ";
    console.log(
      `${tag} ${result.legacyId} — ${result.company ?? "?"} (status=${result.status}, events=${result.events}, emails=${result.emailHistory}, followups=${result.followups}, audit=${result.audit}, drafts=${result.emailDrafts}, notes=${result.notes})`
    );
    for (const w of result.warnings) console.log(`         ${w}`);
  }

  let dailyReportCount = 0;
  const dailyReportsDir = path.join(root, "20_Daily_Reports");
  if (fs.existsSync(dailyReportsDir)) {
    console.log("");
    const byDate = new Map<string, DailyReportParsed & { files: string[] }>();
    for (const file of fs.readdirSync(dailyReportsDir).filter((f) => f.endsWith(".md"))) {
      const content = fs.readFileSync(path.join(dailyReportsDir, file), "utf-8");
      const parsed = parseDailyReport(content);
      byDate.set(parsed.date, mergeDailyReports(file, parsed, byDate.get(parsed.date)));
    }

    for (const merged of byDate.values()) {
      dailyReportCount++;
      console.log(`[OK]   Daily report ${merged.date} (${merged.files.join(" + ")}) isPlanOnly=${merged.isPlanOnly}`);
      if (!isDryRun) {
        const data = {
          isPlanOnly: merged.isPlanOnly,
          whatGotDone: merged.whatGotDone,
          wins: merged.wins,
          mistakes: merged.mistakes,
          lessonsLearned: merged.lessonsLearned,
          tomorrowsObjectives: merged.tomorrowsObjectives,
          priorityTasks: merged.priorityTasks,
          expectedNumbers: asJson(merged.expectedNumbers),
        };
        await db.dailyReport.upsert({
          where: { date: new Date(merged.date) },
          create: { date: new Date(merged.date), ...data },
          update: data,
        });
      }
    }
  }

  const processed = results.filter((r) => !r.skipped).length;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  console.log("\n=== Summary ===");
  console.log(`Leads processed: ${processed} / ${leadFolders.length}`);
  console.log(`Daily reports processed: ${dailyReportCount}`);
  console.log(`Warnings: ${totalWarnings}`);
  if (isDryRun) console.log("\nDry run complete — nothing was written. Re-run without --dry-run to commit.");

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
