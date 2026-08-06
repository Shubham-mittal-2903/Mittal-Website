import { db } from "@/lib/db";
import NewClientForm from "@/components/leads/NewClientForm";

export default async function NewClientPage() {
  const wonLeads = await db.lead.findMany({
    where: { status: "WON", client: null },
    select: { id: true, company: true, leadNumber: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Client</h1>
        <p className="text-sm text-muted-foreground">Add a client, optionally linked to a won lead.</p>
      </div>
      <div className="card-glow relative z-10">
        <NewClientForm wonLeads={wonLeads} />
      </div>
    </div>
  );
}
