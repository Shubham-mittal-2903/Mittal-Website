import { db } from "@/lib/db";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

const MEETING_STAGES: LeadStatus[] = [
  "DISCOVERY_BOOKED",
  "DISCOVERY_DONE",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats() {
  const today = startOfToday();

  const [
    todaysLeads,
    totalLeads,
    rejectedLeads,
    emailsReady,
    emailsSent,
    replies,
    meetings,
    proposals,
    clients,
    wonLeads,
    revenue,
    recentActivity,
    upcomingFollowups,
  ] = await Promise.all([
    db.lead.count({ where: { createdAt: { gte: today } } }),
    db.lead.count(),
    db.lead.count({ where: { rejectedReason: { not: null } } }),
    db.emailDraft.count({ where: { status: "ACTIVE" } }),
    db.emailHistoryEntry.count(),
    db.emailHistoryEntry.count({ where: { replied: true } }),
    db.lead.count({ where: { status: { in: MEETING_STAGES } } }),
    db.proposal.count(),
    db.client.count(),
    db.lead.count({ where: { status: "WON" } }),
    db.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.pipelineEvent.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { lead: { select: { company: true, leadNumber: true } } },
    }),
    db.followupEntry.findMany({
      where: { status: "SCHEDULED", scheduledDate: { gte: today } },
      take: 8,
      orderBy: { scheduledDate: "asc" },
      include: { lead: { select: { company: true, leadNumber: true } } },
    }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;
  const replyRate = emailsSent > 0 ? Math.round((replies / emailsSent) * 1000) / 10 : 0;

  return {
    todaysLeads,
    qualifiedLeads: totalLeads,
    rejectedLeads,
    emailsReady,
    emailsSent,
    replies,
    meetings,
    proposals,
    clients,
    revenue: Number(revenue._sum.amount ?? 0),
    conversionRate,
    replyRate,
    recentActivity,
    upcomingFollowups,
  };
}

// Cross-module snapshot for the rest of MITTAL OS — everything outside the Lead CRM.
export async function getMosOverview() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const [
    tasksToday,
    tasksOverdue,
    subjects,
    activeProjects,
    activeJobApplications,
    prepTopics,
    weakPrepTopics,
    learningTopics,
    monthTransactions,
  ] = await Promise.all([
    db.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { gte: today, lt: tomorrow } } }),
    db.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { lt: today } } }),
    db.subject.findMany({ select: { attendedClasses: true, totalClasses: true, minAttendancePct: true } }),
    db.project.count({ where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } } }),
    db.jobApplication.count({ where: { status: { in: ["APPLIED", "OA", "INTERVIEW"] } } }),
    db.prepTopic.count(),
    db.prepTopic.count({ where: { isWeak: true } }),
    db.learningTopic.findMany({ select: { completionPct: true } }),
    db.transaction.findMany({ where: { date: { gte: monthStart, lt: monthEnd } }, select: { type: true, amount: true } }),
  ]);

  const prepCompleted = await db.prepTopic.count({ where: { status: "COMPLETED" } });
  const atRiskSubjects = subjects.filter(
    (s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.minAttendancePct
  ).length;
  const learningAvgPct =
    learningTopics.length > 0 ? Math.round(learningTopics.reduce((s, t) => s + t.completionPct, 0) / learningTopics.length) : 0;
  const income = monthTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  return {
    tasksToday,
    tasksOverdue,
    atRiskSubjects,
    activeProjects,
    activeJobApplications,
    prepCompletionPct: prepTopics > 0 ? Math.round((prepCompleted / prepTopics) * 100) : 0,
    weakPrepTopics,
    learningAvgPct,
    financeNet: income - expense,
  };
}
