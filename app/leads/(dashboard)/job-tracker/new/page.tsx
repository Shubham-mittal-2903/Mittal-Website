import { db } from "@/lib/db";
import JobApplicationForm from "@/components/leads/JobApplicationForm";

export default async function NewJobApplicationPage() {
  const resumes = await db.resume.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New Application</h1>
      <JobApplicationForm resumes={resumes} />
    </div>
  );
}
