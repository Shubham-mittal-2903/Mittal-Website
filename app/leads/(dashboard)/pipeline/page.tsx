import { db } from "@/lib/db";
import KanbanBoard from "@/components/leads/KanbanBoard";
import FollowupsPanel from "@/components/leads/FollowupsPanel";
import { getFollowupSummary } from "@/lib/actions/followups";

export default async function PipelinePage() {
  const [leads, followups] = await Promise.all([
    db.lead.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        leadNumber: true,
        company: true,
        industry: true,
        status: true,
        priority: true,
        leadScore: true,
      },
    }),
    getFollowupSummary(),
  ]);

  return (
    <div className="flex h-[calc(100vh-6rem)] min-w-0 flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Drag a card to move it between stages.</p>
        </div>
        <FollowupsPanel overdue={followups.overdue} upcoming={followups.upcoming} />
      </div>
      <KanbanBoard leads={leads} />
    </div>
  );
}
