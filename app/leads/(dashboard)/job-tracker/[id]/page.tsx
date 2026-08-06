import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import JobApplicationForm from "@/components/leads/JobApplicationForm";
import { ChecklistPanel, InterviewRoundsPanel } from "@/components/leads/JobDetailPanels";
import { JOB_STATUS_LABELS } from "@/lib/validations/jobs";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await db.jobApplication.findUnique({
    where: { id },
    include: {
      checklist: { orderBy: { createdAt: "asc" } },
      rounds: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!job) notFound();

  const resumes = await db.resume.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{job.company}</h1>
        <span className="text-muted-foreground">{job.role}</span>
        <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JobApplicationForm
          id={job.id}
          resumes={resumes}
          job={{
            company: job.company,
            role: job.role,
            packageOffered: job.packageOffered ?? "",
            location: job.location ?? "",
            jdUrl: job.jdUrl ?? "",
            status: job.status,
            resumeId: job.resumeId ?? "",
            appliedAt: job.appliedAt ? job.appliedAt.toISOString().slice(0, 10) : "",
            notes: job.notes ?? "",
          }}
        />
        <div className="space-y-6">
          <ChecklistPanel jobApplicationId={job.id} items={job.checklist} />
          <InterviewRoundsPanel
            jobApplicationId={job.id}
            rounds={job.rounds.map((r) => ({
              id: r.id,
              type: r.type,
              status: r.status,
              scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
              notes: r.notes,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
