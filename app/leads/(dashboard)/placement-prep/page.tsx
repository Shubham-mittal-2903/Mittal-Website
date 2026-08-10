import { db } from "@/lib/db";
import { seedBnpRoadmap } from "@/lib/actions/placement";
import { MilestoneTimeline, TopicsGrid, TargetsList } from "@/components/leads/PlacementPrepDashboard";
import { todayKey, dateOnlyKey, startOfIstWeek } from "@/lib/date-utils";

export default async function PlacementPrepPage() {
  const roadmapId = await seedBnpRoadmap();
  const roadmap = await db.prepRoadmap.findUnique({
    where: { id: roadmapId },
    include: {
      milestones: { orderBy: { order: "asc" } },
      topics: { orderBy: { order: "asc" } },
      targets: true,
    },
  });

  if (!roadmap) {
    return <p className="text-sm text-muted-foreground">Roadmap not found.</p>;
  }

  const total = roadmap.topics.length;
  const completed = roadmap.topics.filter((t) => t.status === "COMPLETED").length;
  const weak = roadmap.topics.filter((t) => t.isWeak).length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const today = todayKey();
  const weekStart = dateOnlyKey(startOfIstWeek());

  const dailyTargets = roadmap.targets.filter((t) => t.scope === "DAILY" && dateOnlyKey(t.date) === today);
  const weeklyTargets = roadmap.targets.filter((t) => t.scope === "WEEKLY" && dateOnlyKey(t.date) === weekStart);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Placement Preparation</h1>
        <p className="text-sm text-muted-foreground">
          {roadmap.title} · {completed}/{total} topics completed ({completionPct}%) · {weak} flagged weak
        </p>
        <div className="mt-2 h-1.5 max-w-md rounded-full bg-secondary">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <MilestoneTimeline
          milestones={roadmap.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate ? m.dueDate.toISOString() : null,
            completedAt: m.completedAt ? m.completedAt.toISOString() : null,
          }))}
        />
        <div className="space-y-6">
          <TargetsList
            title="Today's Targets"
            targets={dailyTargets.map((t) => ({ id: t.id, title: t.title, done: t.done }))}
          />
          <TargetsList
            title="This Week's Target"
            targets={weeklyTargets.map((t) => ({ id: t.id, title: t.title, done: t.done }))}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Topics</h2>
        <TopicsGrid
          topics={roadmap.topics.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            status: t.status,
            isWeak: t.isWeak,
            resources: (t.resources as Array<{ label: string; url: string | null }> | null) ?? [],
            notes: t.notes,
          }))}
        />
      </div>
    </div>
  );
}
