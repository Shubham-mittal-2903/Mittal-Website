import { db } from "@/lib/db";
import { todayDateOnly } from "@/lib/date-utils";

export async function getFollowupSummary() {
  const today = todayDateOnly();

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
