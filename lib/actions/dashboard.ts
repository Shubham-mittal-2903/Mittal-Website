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
