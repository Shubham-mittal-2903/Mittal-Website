import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/validations/projects";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/generated/prisma/enums";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") return "default";
  if (status === "CANCELLED") return "destructive";
  if (status === "PLANNING") return "outline";
  return "secondary";
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const projects = await db.project.findMany({
    where: {
      ...(status ? { status: status as ProjectStatus } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { client: { select: { name: true } }, tasks: { select: { status: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} total · {stats.active} in progress · {stats.completed} completed
          </p>
        </div>
        <Link href="/leads/projects/new">
          <Button>
            <Plus size={16} />
            New Project
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/leads/projects">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search projects…"
          className="h-9 w-64 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
        />
        <a
          href="/leads/projects"
          className={cn(
            "flex items-center rounded-lg border border-input px-3 text-sm",
            !status ? "bg-secondary" : "text-muted-foreground"
          )}
        >
          All
        </a>
        {PROJECT_STATUSES.map((s) => (
          <a
            key={s}
            href={`/leads/projects?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "flex items-center rounded-lg border border-input px-3 text-sm",
              status === s ? "bg-secondary" : "text-muted-foreground"
            )}
          >
            {PROJECT_STATUS_LABELS[s]}
          </a>
        ))}
      </form>

      {projects.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          {q || status ? "No projects match this filter." : "No projects yet — create your first one."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => {
                const done = p.tasks.filter((t) => t.status === "DONE").length;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/leads/projects/${p.id}`} className="font-medium">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.client?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)}>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.tasks.length > 0 ? `${done}/${p.tasks.length}` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}
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
