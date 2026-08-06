import { db } from "@/lib/db";
import ResumeManager from "@/components/leads/ResumeManager";

export default async function ResumesPage() {
  const resumes = await db.resume.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resume Manager</h1>
        <p className="text-sm text-muted-foreground">{resumes.length} version{resumes.length === 1 ? "" : "s"}</p>
      </div>
      <ResumeManager
        resumes={resumes.map((r) => ({
          id: r.id,
          name: r.name,
          version: r.version,
          targetRole: r.targetRole,
          isActive: r.isActive,
          fileUrl: r.fileUrl,
          fileName: r.fileName,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
