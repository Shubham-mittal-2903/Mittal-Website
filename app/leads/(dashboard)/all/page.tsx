import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { LEAD_STATUSES, STAGE_LABELS } from "@/lib/validations/leads";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "WON") return "default";
  if (status === "LOST") return "destructive";
  if (status === "SOURCED" || status === "CONTACTED") return "outline";
  return "secondary";
}

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const leads = await db.lead.findMany({
    where: {
      ...(status ? { status: status as LeadStatus } : {}),
      ...(q
        ? {
            OR: [
              { company: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { industry: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} total</p>
        </div>
        <Link href="/leads/all/new">
          <Button>
            <Plus size={16} />
            New Lead
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/leads/all">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search company, email, industry…"
          className="h-9 w-64 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
        />
        <a
          href="/leads/all"
          className={cn(
            "flex items-center rounded-lg border border-input px-3 text-sm",
            !status ? "bg-secondary" : "text-muted-foreground"
          )}
        >
          All
        </a>
        {LEAD_STATUSES.map((s) => (
          <a
            key={s}
            href={`/leads/all?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "flex items-center rounded-lg border border-input px-3 text-sm",
              status === s ? "bg-secondary" : "text-muted-foreground"
            )}
          >
            {STAGE_LABELS[s]}
          </a>
        ))}
      </form>

      {leads.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          {q || status ? "No leads match this filter." : "No leads yet — add your first one to get started."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/leads/all/${lead.id}`} className="block">
                      {lead.leadNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/leads/all/${lead.id}`} className="block">
                      {lead.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.industry ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(lead.status)}>{STAGE_LABELS[lead.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.priority}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.leadScore ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.email ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
