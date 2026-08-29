import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoices: { where: { status: "PAID" }, select: { amount: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} total</p>
        </div>
        <Link href="/leads/clients/new">
          <Button>
            <Plus size={16} />
            New Client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          No clients yet — they show up here once a lead is won and converted.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => {
                const revenue = c.invoices.reduce((sum, i) => sum + Number(i.amount), 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/leads/clients/${c.id}`} className="font-medium">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.company ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(revenue)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
