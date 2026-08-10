import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SubjectForm from "@/components/leads/SubjectForm";
import AssignmentsPanel from "@/components/leads/AssignmentsPanel";
import { AttendanceStat, MarkAttendanceButtons } from "@/components/leads/AttendancePanel";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const subject = await db.subject.findUnique({
    where: { id },
    include: { assignments: { orderBy: { createdAt: "desc" } } },
  });
  if (!subject) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{subject.name}</h1>
        {subject.facultyName && <p className="text-sm text-muted-foreground">{subject.facultyName}</p>}
      </div>

      <div className="card-glow relative z-10 flex flex-wrap items-center justify-between gap-4">
        <AttendanceStat subject={subject} />
        <MarkAttendanceButtons subjectId={subject.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SubjectForm
          id={subject.id}
          subject={{
            name: subject.name,
            code: subject.code ?? "",
            credits: subject.credits?.toString() ?? "",
            facultyName: subject.facultyName ?? "",
            minAttendancePct: subject.minAttendancePct.toString(),
            semesterTotalClasses: subject.semesterTotalClasses?.toString() ?? "",
            examDate: subject.examDate ? subject.examDate.toISOString().slice(0, 10) : "",
            internalMarks: subject.internalMarks?.toString() ?? "",
          }}
        />
        <AssignmentsPanel
          subjectId={subject.id}
          assignments={subject.assignments.map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            dueDate: a.dueDate ? a.dueDate.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
