import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { JOB_APPLICATION_STATUSES, JOB_STATUS_LABELS } from "@/lib/validations/jobs";
import { cn } from "@/lib/utils";
import type { JobApplicationStatus } from "@/lib/generated/prisma/enums";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "OFFER") return "default";
  if (status === "REJECTED" || status === "WITHDRAWN") return "destructive";
  if (status === "SAVED") return "outline";
  return "secondary";
}

export default async function JobTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const jobs = await db.jobApplication.findMany({
    where: {
      ...(status ? { status: status as JobApplicationStatus } : {}),
      ...(q
        ? {
            OR: [
              { company: { contains: q, mode: "insensitive" } },
              { role: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { resume: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => !["REJECTED", "WITHDRAWN"].includes(j.status)).length,
    offers: jobs.filter((j) => j.status === "OFFER").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job Tracker</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} total · {stats.active} active · {stats.offers} offer{stats.offers === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/leads/job-tracker/new">
          <Button>
            <Plus size={16} />
            New Application
          </Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" action="/leads/job-tracker">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search company, role…"
          className="h-9 w-64 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
        />
        <a
          href="/leads/job-tracker"
          className={cn(
            "flex items-center rounded-lg border border-input px-3 text-sm",
            !status ? "bg-secondary" : "text-muted-foreground"
          )}
        >
          All
        </a>
        {JOB_APPLICATION_STATUSES.map((s) => (
          <a
            key={s}
            href={`/leads/job-tracker?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "flex items-center rounded-lg border border-input px-3 text-sm",
              status === s ? "bg-secondary" : "text-muted-foreground"
            )}
          >
            {JOB_STATUS_LABELS[s]}
          </a>
        ))}
      </form>

      {jobs.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          {q || status ? "No applications match this filter." : "No applications yet — add your first one."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell>
                    <Link href={`/leads/job-tracker/${j.id}`} className="font-medium">
                      {j.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{j.role}</TableCell>
                  <TableCell className="text-muted-foreground">{j.packageOffered ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(j.status)}>{JOB_STATUS_LABELS[j.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{j.resume?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {j.appliedAt ? new Date(j.appliedAt).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
