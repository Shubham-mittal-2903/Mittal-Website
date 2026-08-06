import Link from "next/link";
import { db } from "@/lib/db";
import { seedDefaultTopics } from "@/lib/actions/learning";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "COMPLETED") return "default";
  if (status === "IN_PROGRESS") return "secondary";
  return "outline";
}

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await seedDefaultTopics();
  const { category } = await searchParams;

  const topics = await db.learningTopic.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  const categories = Array.from(new Set((await db.learningTopic.findMany({ select: { category: true } })).map((t) => t.category).filter(Boolean))) as string[];

  const overallPct = topics.length > 0 ? Math.round(topics.reduce((s, t) => s + t.completionPct, 0) / topics.length) : 0;
  const completed = topics.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Learning</h1>
        <p className="text-sm text-muted-foreground">
          {overallPct}% average completion · {completed}/{topics.length} completed
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/leads/learning"
          className={cn("rounded-lg border border-input px-3 py-1.5 text-sm", !category ? "bg-secondary" : "text-muted-foreground")}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c}
            href={`/leads/learning?category=${encodeURIComponent(c)}`}
            className={cn(
              "rounded-lg border border-input px-3 py-1.5 text-sm",
              category === c ? "bg-secondary" : "text-muted-foreground"
            )}
          >
            {c}
          </a>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Link key={t.id} href={`/leads/learning/${t.id}`} className="card-glow relative z-10 block space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t.name}</span>
              <Badge variant={statusVariant(t.status)}>{t.status.replace("_", " ")}</Badge>
            </div>
            <div className="h-1.5 rounded-full bg-secondary">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${t.completionPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{t.completionPct}% · {t.category ?? "General"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
