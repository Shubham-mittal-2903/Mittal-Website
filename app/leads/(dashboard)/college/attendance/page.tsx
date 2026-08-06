import Link from "next/link";
import { db } from "@/lib/db";
import { AttendanceStat, MarkAttendanceButtons } from "@/components/leads/AttendancePanel";

export default async function AttendanceDashboardPage() {
  const subjects = await db.subject.findMany({ orderBy: { name: "asc" } });

  const overallAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const overallTotal = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallPct = overallTotal > 0 ? (overallAttended / overallTotal) * 100 : 0;
  const atRisk = subjects.filter((s) => s.totalClasses > 0 && (s.attendedClasses / s.totalClasses) * 100 < s.minAttendancePct);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          {overallPct.toFixed(1)}% overall · {atRisk.length} subject{atRisk.length === 1 ? "" : "s"} below target
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          No subjects yet —{" "}
          <Link href="/leads/college/new" className="underline">
            add one
          </Link>{" "}
          to start tracking attendance.
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="card-glow relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/leads/college/${s.id}`} className="font-medium">
                  {s.name}
                </Link>
                <div className="mt-1">
                  <AttendanceStat subject={s} />
                </div>
              </div>
              <MarkAttendanceButtons subjectId={s.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
