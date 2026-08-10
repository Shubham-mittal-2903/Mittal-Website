import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import PlannerBoard from "@/components/leads/PlannerBoard";
import PlannerCalendar from "@/components/leads/PlannerCalendar";
import { todayDateOnly, addDaysToDateOnly, dateOnlyKey, dateOnly } from "@/lib/date-utils";

const VIEWS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "mission-august", label: "Mission August" },
  { key: "recurring", label: "Recurring" },
  { key: "calendar", label: "Calendar" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function serialize(t: { id: string; title: string; status: string; priority: string; dueDate: Date | null; recurrence: string; listName: string | null }) {
  return { ...t, dueDate: t.dueDate ? t.dueDate.toISOString() : null };
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; y?: string; m?: string }>;
}) {
  const { view: viewRaw, y, m } = await searchParams;
  const view: ViewKey = (VIEWS.find((v) => v.key === viewRaw)?.key ?? "today") as ViewKey;

  const now = todayDateOnly();
  let tasks: Awaited<ReturnType<typeof db.task.findMany>> = [];
  let calendarTasks: Awaited<ReturnType<typeof db.task.findMany>> = [];
  let defaultDueDate: string | undefined;
  let defaultListName: string | undefined;

  if (view === "today") {
    defaultDueDate = dateOnlyKey(now);
    tasks = await db.task.findMany({
      where: { dueDate: { gte: now, lt: addDaysToDateOnly(now, 1) } },
      orderBy: { priority: "desc" },
    });
  } else if (view === "tomorrow") {
    const tmr = addDaysToDateOnly(now, 1);
    defaultDueDate = dateOnlyKey(tmr);
    tasks = await db.task.findMany({
      where: { dueDate: { gte: tmr, lt: addDaysToDateOnly(tmr, 1) } },
      orderBy: { priority: "desc" },
    });
  } else if (view === "weekly") {
    tasks = await db.task.findMany({
      where: { dueDate: { gte: now, lt: addDaysToDateOnly(now, 7) } },
      orderBy: { dueDate: "asc" },
    });
  } else if (view === "monthly") {
    tasks = await db.task.findMany({
      where: { dueDate: { gte: now, lt: addDaysToDateOnly(now, 31) } },
      orderBy: { dueDate: "asc" },
    });
  } else if (view === "mission-august") {
    defaultListName = "Mission August";
    tasks = await db.task.findMany({
      where: { listName: "Mission August" },
      orderBy: { createdAt: "desc" },
    });
  } else if (view === "recurring") {
    tasks = await db.task.findMany({
      where: { recurrence: { not: "NONE" } },
      orderBy: { dueDate: "asc" },
    });
  } else if (view === "calendar") {
    const year = y ? parseInt(y, 10) : now.getUTCFullYear();
    const month = m ? parseInt(m, 10) : now.getUTCMonth();
    calendarTasks = await db.task.findMany({
      where: {
        dueDate: { gte: dateOnly(year, month, 1), lt: dateOnly(year, month + 1, 1) },
      },
    });
  }

  const year = y ? parseInt(y, 10) : now.getUTCFullYear();
  const month = m ? parseInt(m, 10) : now.getUTCMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Planner</h1>
        <p className="text-sm text-muted-foreground">Today, tomorrow, this week, this month — and everything recurring.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <a
            key={v.key}
            href={`/leads/planner?view=${v.key}`}
            className={cn(
              "flex items-center rounded-lg border border-input px-3 py-1.5 text-sm",
              view === v.key ? "bg-secondary" : "text-muted-foreground"
            )}
          >
            {v.label}
          </a>
        ))}
      </div>

      {view === "calendar" ? (
        <PlannerCalendar year={year} month={month} tasks={calendarTasks.map(serialize)} />
      ) : (
        <PlannerBoard tasks={tasks.map(serialize)} defaultDueDate={defaultDueDate} defaultListName={defaultListName} />
      )}
    </div>
  );
}
