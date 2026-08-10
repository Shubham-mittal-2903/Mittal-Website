import { db } from "@/lib/db";
import { classesCanMiss, classesNeedToAttend } from "@/lib/attendance";
import { parseDateOnly, todayDateOnly, dateOnlyKey } from "@/lib/date-utils";
import type { LeadStatus, TaskPriority, PrepTopicStatus, TransactionType } from "@/lib/generated/prisma/client";

// Data-write tools for Jayden — separate from github-tools.ts (code changes). These are the
// "actually operate the app for me" tools: mark attendance, log a task, move a lead, log
// money, approve a prep topic. Each resolves entities by name/code the way a person would
// refer to them in conversation, not by internal DB id, and returns a plain-text confirmation
// (or a clear "didn't find X, did you mean..." ) so Jayden can report back accurately instead
// of silently guessing. Date fields always go through lib/date-utils — see that file for why.

async function findSubject(nameOrCode: string) {
  const needle = nameOrCode.trim().toLowerCase();
  const subjects = await db.subject.findMany();
  let match = subjects.find((s) => s.code?.toLowerCase() === needle || s.name.toLowerCase() === needle);
  if (!match) match = subjects.find((s) => s.name.toLowerCase().includes(needle) || s.code?.toLowerCase().includes(needle));
  if (!match) {
    const available = subjects.map((s) => `${s.name}${s.code ? ` (${s.code})` : ""}`).join(", ") || "none yet";
    throw new Error(`No subject matching "${nameOrCode}". Subjects on record: ${available}`);
  }
  return match;
}

// Attendance is the one entity worth auto-creating on the fly — a mistyped/duplicate subject
// name is trivially fixable later in College, but silently dropping a real attendance record
// because the subject was never manually added first is the exact bug this tool exists to fix.
async function findOrCreateSubject(nameOrCode: string) {
  try {
    return await findSubject(nameOrCode);
  } catch {
    // Treat short, all-caps-with-digits inputs (e.g. "FREN146") as a code; otherwise a name.
    const looksLikeCode = /^[A-Z]{2,}\d{2,}$/i.test(nameOrCode.trim());
    return db.subject.create({
      data: looksLikeCode ? { name: nameOrCode.trim(), code: nameOrCode.trim() } : { name: nameOrCode.trim() },
    });
  }
}

export async function markAttendanceBatch(
  entries: Array<{ subjectName: string; mark: "PRESENT" | "ABSENT" | "CANCELLED"; date?: string }>
): Promise<string> {
  const results: string[] = [];
  for (const entry of entries.slice(0, 30)) {
    try {
      const subject = await findOrCreateSubject(entry.subjectName);
      const date = entry.date ? parseDateOnly(entry.date) : todayDateOnly();

      await db.attendanceEntry.upsert({
        where: { subjectId_date: { subjectId: subject.id, date } },
        create: { subjectId: subject.id, date, mark: entry.mark },
        update: { mark: entry.mark },
      });

      const allEntries = await db.attendanceEntry.findMany({ where: { subjectId: subject.id } });
      const total = allEntries.filter((e) => e.mark !== "CANCELLED").length;
      const attended = allEntries.filter((e) => e.mark === "PRESENT").length;
      await db.subject.update({ where: { id: subject.id }, data: { totalClasses: total, attendedClasses: attended } });

      const pct = total > 0 ? ((attended / total) * 100).toFixed(1) : "0";
      const canMiss = classesCanMiss(attended, total, subject.minAttendancePct);
      const needToAttend = classesNeedToAttend(attended, total, subject.minAttendancePct);
      const status =
        attended / Math.max(total, 1) >= subject.minAttendancePct / 100
          ? `can miss ${canMiss} more and stay above ${subject.minAttendancePct}%`
          : `needs ${needToAttend} more to reach ${subject.minAttendancePct}%`;

      results.push(`${subject.name} ${dateOnlyKey(date)}: marked ${entry.mark} — now ${pct}% (${status})`);
    } catch (err) {
      results.push(`${entry.subjectName}: FAILED — ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }
  return results.join("\n");
}

export async function createTaskTool(input: {
  title: string;
  dueDate?: string;
  priority?: TaskPriority;
  listName?: string;
}): Promise<string> {
  if (!input.title?.trim()) throw new Error("Task needs a title.");
  const task = await db.task.create({
    data: {
      title: input.title.trim(),
      dueDate: input.dueDate ? parseDateOnly(input.dueDate) : undefined,
      priority: input.priority ?? "MEDIUM",
      listName: input.listName || undefined,
    },
  });
  return `Task created: "${task.title}"${task.dueDate ? ` due ${dateOnlyKey(task.dueDate)}` : ""}.`;
}

export async function updateLeadStageTool(input: { company: string; newStage: LeadStatus; note?: string }): Promise<string> {
  const needle = input.company.trim().toLowerCase();
  const lead = await db.lead.findFirst({ where: { company: { contains: needle, mode: "insensitive" } } });
  if (!lead) {
    const all = await db.lead.findMany({ select: { company: true }, take: 20 });
    throw new Error(`No lead matching "${input.company}". Leads on record: ${all.map((l) => l.company).join(", ") || "none yet"}`);
  }
  await db.lead.update({ where: { id: lead.id }, data: { status: input.newStage } });
  await db.pipelineEvent.create({
    data: {
      leadId: lead.id,
      occurredAt: new Date(),
      stage: input.newStage,
      notes: input.note || "Updated by Jayden via chat",
    },
  });
  return `${lead.company} moved to ${input.newStage}.`;
}

export async function logTransactionTool(input: {
  type: TransactionType;
  amount: number;
  description?: string;
  date?: string;
  categoryName?: string;
}): Promise<string> {
  if (!input.amount || input.amount <= 0) throw new Error("Amount must be a positive number.");
  let categoryId: string | undefined;
  if (input.categoryName) {
    const category = await db.financeCategory.upsert({
      where: { name: input.categoryName },
      create: { name: input.categoryName, type: input.type },
      update: {},
    });
    categoryId = category.id;
  }
  await db.transaction.create({
    data: {
      type: input.type,
      amount: input.amount,
      description: input.description || undefined,
      date: input.date ? parseDateOnly(input.date) : todayDateOnly(),
      categoryId,
    },
  });
  return `Logged ${input.type.toLowerCase()} of ${input.amount}${input.description ? ` (${input.description})` : ""}.`;
}

export async function setPrepTopicStatusTool(input: { topicTitle: string; status: PrepTopicStatus }): Promise<string> {
  const needle = input.topicTitle.trim().toLowerCase();
  const topic = await db.prepTopic.findFirst({ where: { title: { contains: needle, mode: "insensitive" } } });
  if (!topic) {
    const all = await db.prepTopic.findMany({ select: { title: true } });
    throw new Error(`No prep topic matching "${input.topicTitle}". Topics on record: ${all.map((t) => t.title).join(", ") || "none yet"}`);
  }
  await db.prepTopic.update({
    where: { id: topic.id },
    data: { status: input.status, approvedAt: new Date() },
  });
  return `${topic.title} marked ${input.status}.`;
}

// General-purpose escape hatch for everything the named tools above don't cover — Shubham
// wants Jayden to be able to act on any part of the OS, not just the 5 pre-built flows. Goes
// through Prisma (not raw SQL), so it's schema-validated and injection-safe, but it can still
// reach every model. updateMany/deleteMany are deliberately excluded: a single wrong `where`
// there can mutate or wipe an entire table, which is a different order of blast radius than
// one record. Everything else (single-record create/update/upsert/delete, plus reads) is open.
const MANAGE_DB_MODELS = [
  "lead", "pipelineEvent", "leadNote", "emailDraft", "emailHistoryEntry", "followupEntry",
  "audit", "auditFinding", "attachment", "client", "proposal", "contract", "invoice",
  "dailyReport", "appSettings", "project", "task", "resume", "jobApplication",
  "jobChecklistItem", "interviewRound", "prepRoadmap", "prepMilestone", "prepTopic",
  "prepTarget", "learningTopic", "learningResource", "learningProject", "subject",
  "assignment", "attendanceEntry", "financeCategory", "transaction", "budget", "vaultItem",
] as const;
const MANAGE_DB_OPS = ["findMany", "findFirst", "create", "update", "upsert", "delete", "count"] as const;

export async function manageDatabaseTool(input: { model: string; operation: string; args?: unknown }): Promise<string> {
  const model = input.model as (typeof MANAGE_DB_MODELS)[number];
  if (!MANAGE_DB_MODELS.includes(model)) {
    throw new Error(`Unknown model "${input.model}". Valid models: ${MANAGE_DB_MODELS.join(", ")}`);
  }
  const operation = input.operation as (typeof MANAGE_DB_OPS)[number];
  if (!MANAGE_DB_OPS.includes(operation)) {
    throw new Error(`Unknown operation "${input.operation}". Valid operations: ${MANAGE_DB_OPS.join(", ")} (updateMany/deleteMany are intentionally not available — do single-record operations in a loop instead).`);
  }
  const modelClient = (db as unknown as Record<string, Record<string, (args: unknown) => Promise<unknown>>>)[model];
  const result = await modelClient[operation](input.args ?? {});
  return JSON.stringify(result, (_key, value) => (typeof value === "bigint" ? value.toString() : value), 2);
}
