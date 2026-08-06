import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import ProjectOverviewForm from "@/components/leads/ProjectOverviewForm";
import ProjectTasksPanel from "@/components/leads/ProjectTasksPanel";
import { PROJECT_STATUS_LABELS } from "@/lib/validations/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: { client: { select: { name: true } }, tasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <Badge>{PROJECT_STATUS_LABELS[project.status]}</Badge>
        </div>
        {project.client && <p className="text-sm text-muted-foreground">Client: {project.client.name}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectOverviewForm
          id={project.id}
          clients={await db.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })}
          project={{
            name: project.name,
            description: project.description ?? "",
            status: project.status,
            clientId: project.clientId ?? "",
            budget: project.budget?.toString() ?? "",
            startDate: project.startDate ? project.startDate.toISOString().slice(0, 10) : "",
            dueDate: project.dueDate ? project.dueDate.toISOString().slice(0, 10) : "",
            tags: project.tags.join(", "),
          }}
        />
        <ProjectTasksPanel
          projectId={project.id}
          tasks={project.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status }))}
        />
      </div>
    </div>
  );
}
