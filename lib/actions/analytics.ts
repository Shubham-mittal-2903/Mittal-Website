import { db } from "@/lib/db";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(new Date(y, m - 1, 1));
}

function lastNMonthKeys(n: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export async function getAnalytics() {
  const [leads, emailHistory, invoicesPaid] = await Promise.all([
    db.lead.findMany({ select: { createdAt: true, status: true, industry: true } }),
    db.emailHistoryEntry.findMany({ select: { date: true, replied: true } }),
    db.invoice.findMany({ where: { status: "PAID" }, select: { amount: true, paidAt: true } }),
  ]);

  const months = lastNMonthKeys(6);

  const leadsByMonth = new Map(months.map((m) => [m, 0]));
  for (const lead of leads) {
    const k = monthKey(lead.createdAt);
    if (leadsByMonth.has(k)) leadsByMonth.set(k, (leadsByMonth.get(k) ?? 0) + 1);
  }

  const emailsByMonth = new Map(months.map((m) => [m, { sent: 0, replied: 0 }]));
  for (const e of emailHistory) {
    const k = monthKey(e.date);
    const bucket = emailsByMonth.get(k);
    if (bucket) {
      bucket.sent += 1;
      if (e.replied) bucket.replied += 1;
    }
  }

  const revenueByMonth = new Map(months.map((m) => [m, 0]));
  for (const inv of invoicesPaid) {
    if (!inv.paidAt) continue;
    const k = monthKey(inv.paidAt);
    if (revenueByMonth.has(k)) revenueByMonth.set(k, (revenueByMonth.get(k) ?? 0) + Number(inv.amount));
  }

  const monthlyTrend = months.map((k) => ({
    month: monthLabel(k),
    leads: leadsByMonth.get(k) ?? 0,
    emailsSent: emailsByMonth.get(k)?.sent ?? 0,
    replies: emailsByMonth.get(k)?.replied ?? 0,
    revenue: revenueByMonth.get(k) ?? 0,
  }));

  const nicheMap = new Map<string, { total: number; won: number }>();
  for (const lead of leads) {
    const niche = lead.industry || "Unspecified";
    const entry = nicheMap.get(niche) ?? { total: 0, won: 0 };
    entry.total += 1;
    if (lead.status === "WON") entry.won += 1;
    nicheMap.set(niche, entry);
  }
  const nichePerformance = [...nicheMap.entries()]
    .map(([niche, { total, won }]) => ({ niche, total, won, winRate: total > 0 ? Math.round((won / total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const totalLeads = leads.length;
  const wonCount = leads.filter((l) => l.status === "WON").length;
  const lostCount = leads.filter((l) => l.status === "LOST").length;
  const winRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 1000) / 10 : 0;
  const totalRevenue = invoicesPaid.reduce((sum, i) => sum + Number(i.amount), 0);

  return { monthlyTrend, nichePerformance, totalLeads, wonCount, lostCount, winRate, totalRevenue };
}

export async function getMosAnalytics() {
  const months = lastNMonthKeys(6);
  const monthStarts = months.map((k) => {
    const [y, m] = k.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const rangeStart = monthStarts[0];

  const [transactions, learningTopics, jobApplications, subjects, prepTopics] = await Promise.all([
    db.transaction.findMany({ where: { date: { gte: rangeStart } }, select: { type: true, amount: true, date: true } }),
    db.learningTopic.findMany({ select: { category: true, completionPct: true } }),
    db.jobApplication.findMany({ select: { status: true } }),
    db.subject.findMany({ select: { name: true, attendedClasses: true, totalClasses: true } }),
    db.prepTopic.findMany({ select: { status: true } }),
  ]);

  const financeByMonth = new Map(months.map((m) => [m, { income: 0, expense: 0 }]));
  for (const t of transactions) {
    const k = monthKey(t.date);
    const bucket = financeByMonth.get(k);
    if (bucket) {
      if (t.type === "INCOME") bucket.income += Number(t.amount);
      else bucket.expense += Number(t.amount);
    }
  }
  const financeTrend = months.map((k) => ({
    month: monthLabel(k),
    income: financeByMonth.get(k)?.income ?? 0,
    expense: financeByMonth.get(k)?.expense ?? 0,
  }));

  const learningByCategory = new Map<string, { total: number; sum: number }>();
  for (const t of learningTopics) {
    const cat = t.category || "General";
    const entry = learningByCategory.get(cat) ?? { total: 0, sum: 0 };
    entry.total += 1;
    entry.sum += t.completionPct;
    learningByCategory.set(cat, entry);
  }
  const learningProgress = [...learningByCategory.entries()].map(([category, { total, sum }]) => ({
    category,
    avgPct: total > 0 ? Math.round(sum / total) : 0,
  }));

  const jobStatusCounts = new Map<string, number>();
  for (const j of jobApplications) jobStatusCounts.set(j.status, (jobStatusCounts.get(j.status) ?? 0) + 1);
  const jobFunnel = [...jobStatusCounts.entries()].map(([status, count]) => ({ status, count }));

  const attendanceBySubject = subjects.map((s) => ({
    subject: s.name,
    pct: s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 0,
  }));

  const prepStatusCounts = new Map<string, number>();
  for (const t of prepTopics) prepStatusCounts.set(t.status, (prepStatusCounts.get(t.status) ?? 0) + 1);
  const prepBreakdown = [...prepStatusCounts.entries()].map(([status, count]) => ({ status, count }));

  return { financeTrend, learningProgress, jobFunnel, attendanceBySubject, prepBreakdown };
}
