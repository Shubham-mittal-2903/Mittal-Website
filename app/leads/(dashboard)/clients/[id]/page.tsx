import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import ClientOverviewForm from "@/components/leads/ClientOverviewForm";
import ClientDetailSections from "@/components/leads/ClientDetailSections";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      proposals: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <Badge variant={client.status === "ACTIVE" ? "default" : "secondary"}>{client.status}</Badge>
        </div>
        {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClientOverviewForm
          id={client.id}
          client={{
            name: client.name,
            company: client.company ?? "",
            email: client.email ?? "",
            phone: client.phone ?? "",
            status: client.status,
            notes: client.notes ?? "",
          }}
        />
        <ClientDetailSections
          clientId={client.id}
          clientName={client.name}
          leadId={client.leadId}
          proposals={client.proposals.map((p) => ({
            id: p.id,
            package: p.package,
            priceMin: p.priceMin?.toString() ?? null,
            priceMax: p.priceMax?.toString() ?? null,
            status: p.status,
          }))}
          contracts={client.contracts.map((c) => ({ id: c.id, value: c.value?.toString() ?? null, status: c.status }))}
          invoices={client.invoices.map((i) => ({
            id: i.id,
            invoiceNumber: i.invoiceNumber,
            amount: i.amount.toString(),
            status: i.status,
            dueAt: i.dueAt,
          }))}
        />
      </div>
    </div>
  );
}
