import { db } from "@/lib/db";
import { classesCanMiss } from "@/lib/attendance";

// Pulls a compact live snapshot of MITTAL OS's own data so the AI Assistant can answer
// questions like "what should I study today" or "which lead needs follow-up" grounded in
// what's actually in the database, not a guess. Deliberately summarized, not a full dump —
// keeps the prompt small and the model focused on what's actually due/at-risk/pending.
export async function buildMosContext(): Promise<string> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekOut = new Date(today);
  weekOut.setDate(weekOut.getDate() + 7);

  const [
    leadsNeedingFollowup,
    overdueTasks,
    todayTasks,
    subjects,
    activeJobs,
    weakTopics,
    todayPrepTargets,
    upcomingProjects,
  ] = await Promise.all([
    db.lead.findMany({
      where: {
        status: { in: ["CONTACTED", "REPLIED", "DISCOVERY_BOOKED", "NEGOTIATION"] },
        pipelineEvents: { some: { nextActionDate: { lte: today } } },
      },
      select: { company: true, status: true, leadNumber: true },
      take: 10,
    }),
    db.task.findMany({
      where: { status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { lt: today } },
      select: { title: true, dueDate: true },
      take: 10,
    }),
    db.task.findMany({
      where: { status: { in: ["TODO", "IN_PROGRESS"] }, dueDate: { gte: today, lt: weekOut } },
      select: { title: true, dueDate: true, priority: true },
      take: 15,
    }),
    db.subject.findMany({ select: { name: true, attendedClasses: true, totalClasses: true, minAttendancePct: true } }),
    db.jobApplication.findMany({
      where: { status: { in: ["APPLIED", "OA", "INTERVIEW"] } },
      select: { company: true, role: true, status: true },
      take: 10,
    }),
    db.prepTopic.findMany({ where: { isWeak: true }, select: { title: true, status: true } }),
    db.prepTarget.findMany({
      where: { scope: "DAILY", date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
      select: { title: true, done: true },
    }),
    db.project.findMany({
      where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] }, dueDate: { gte: today, lt: weekOut } },
      select: { name: true, dueDate: true },
      take: 10,
    }),
  ]);

  const atRiskSubjects = subjects
    .filter((s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.minAttendancePct)
    .map((s) => `${s.name} (can miss ${classesCanMiss(s.attendedClasses, s.totalClasses, s.minAttendancePct)} more before it gets worse)`);

  const lines: string[] = [];
  lines.push(`Today's date: ${today.toISOString().slice(0, 10)}`);

  lines.push(
    leadsNeedingFollowup.length
      ? `Leads needing follow-up: ${leadsNeedingFollowup.map((l) => `#${l.leadNumber} ${l.company} (${l.status})`).join("; ")}`
      : "Leads needing follow-up: none"
  );

  lines.push(
    overdueTasks.length
      ? `Overdue planner tasks: ${overdueTasks.map((t) => t.title).join("; ")}`
      : "Overdue planner tasks: none"
  );

  lines.push(
    todayTasks.length
      ? `Tasks due this week: ${todayTasks.map((t) => `${t.title} (${t.priority}, due ${t.dueDate?.toISOString().slice(0, 10)})`).join("; ")}`
      : "Tasks due this week: none"
  );

  lines.push(atRiskSubjects.length ? `Attendance at risk: ${atRiskSubjects.join("; ")}` : "Attendance at risk: none — all subjects above minimum");

  lines.push(
    activeJobs.length
      ? `Active job applications: ${activeJobs.map((j) => `${j.company} — ${j.role} (${j.status})`).join("; ")}`
      : "Active job applications: none"
  );

  lines.push(
    weakTopics.length
      ? `Weak-flagged placement-prep topics: ${weakTopics.map((t) => `${t.title} (${t.status})`).join("; ")}`
      : "Weak-flagged placement-prep topics: none"
  );

  lines.push(
    todayPrepTargets.length
      ? `Today's placement-prep targets: ${todayPrepTargets.map((t) => `${t.title}${t.done ? " [done]" : ""}`).join("; ")}`
      : "Today's placement-prep targets: none scheduled"
  );

  lines.push(
    upcomingProjects.length
      ? `Projects due this week: ${upcomingProjects.map((p) => `${p.name} (due ${p.dueDate?.toISOString().slice(0, 10)})`).join("; ")}`
      : "Projects due this week: none"
  );

  return lines.join("\n");
}
