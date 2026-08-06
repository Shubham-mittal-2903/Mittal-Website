import Link from "next/link";
import { cn } from "@/lib/utils";

type TaskItem = { id: string; title: string; status: string; dueDate: string | null };

export default function PlannerCalendar({ year, month, tasks }: { year: number; month: number; tasks: TaskItem[] }) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const byDay = new Map<number, TaskItem[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      byDay.set(day, [...(byDay.get(day) ?? []), t]);
    }
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/leads/planner?view=calendar&y=${prevMonth.y}&m=${prevMonth.m}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Prev
        </Link>
        <h3 className="text-sm font-semibold">
          {firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <Link href={`/leads/planner?view=calendar&y=${nextMonth.y}&m=${nextMonth.m}`} className="text-sm text-muted-foreground hover:text-foreground">
          Next →
        </Link>
      </div>
      <div className="relative z-10 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="relative z-10 grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "min-h-[64px] rounded-lg border border-border p-1 text-xs",
              day && isCurrentMonth && day === today.getDate() && "border-primary/50 bg-secondary/40"
            )}
          >
            {day && (
              <>
                <div className="text-muted-foreground">{day}</div>
                <div className="mt-1 space-y-0.5">
                  {(byDay.get(day) ?? []).slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        "truncate rounded bg-accent px-1 py-0.5",
                        t.status === "DONE" && "text-muted-foreground line-through"
                      )}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
