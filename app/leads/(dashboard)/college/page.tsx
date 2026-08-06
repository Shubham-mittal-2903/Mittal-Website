import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AttendanceStat } from "@/components/leads/AttendancePanel";

export default async function CollegePage() {
  const subjects = await db.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">College</h1>
          <p className="text-sm text-muted-foreground">{subjects.length} subject{subjects.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/leads/college/attendance">
            <Button variant="outline">Attendance dashboard</Button>
          </Link>
          <Link href="/leads/college/new">
            <Button>
              <Plus size={16} />
              New Subject
            </Button>
          </Link>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          No subjects yet — add your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Internal Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/leads/college/${s.id}`} className="font-medium">
                      {s.name}
                    </Link>
                    {s.code && <span className="ml-2 text-xs text-muted-foreground">{s.code}</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.facultyName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.credits ?? "—"}</TableCell>
                  <TableCell>
                    <AttendanceStat subject={s} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.examDate ? new Date(s.examDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.internalMarks?.toString() ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
