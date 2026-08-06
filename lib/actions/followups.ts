import { db } from "@/lib/db";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getFollowupSummary() {
  const today = startOfToday();

  const [overdue, upcoming] = await Promise.all([
    db.followupEntry.findMany({
      where: { status: "SCHEDULED", scheduledDate: { lt: today } },
      orderBy: { scheduledDate: "asc" },
      include: { lead: { select: { id: true, company: true, leadNumber: true } } },
    }),
    db.followupEntry.findMany({
      where: { status: "SCHEDULED", scheduledDate: { gte: today } },
      orderBy: { scheduledDate: "asc" },
      include: { lead: { select: { id: true, company: true, leadNumber: true } } },
    }),
  ]);

  return { overdue, upcoming };
}
