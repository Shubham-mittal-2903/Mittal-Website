import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import LearningTopicForm from "@/components/leads/LearningTopicForm";
import { ResourcesPanel, ProjectsPanel } from "@/components/leads/LearningResourcesPanel";

export default async function LearningTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const topic = await db.learningTopic.findUnique({
    where: { id },
    include: {
      resources: { orderBy: { createdAt: "asc" } },
      projects: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!topic) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{topic.name}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <LearningTopicForm
          id={topic.id}
          lastRevisedAt={topic.lastRevisedAt ? topic.lastRevisedAt.toISOString() : null}
          topic={{
            name: topic.name,
            category: topic.category ?? "",
            status: topic.status,
            completionPct: topic.completionPct.toString(),
            notes: topic.notes ?? "",
          }}
        />
        <div className="space-y-6">
          <ResourcesPanel topicId={topic.id} resources={topic.resources} />
          <ProjectsPanel topicId={topic.id} projects={topic.projects} />
        </div>
      </div>
    </div>
  );
}
