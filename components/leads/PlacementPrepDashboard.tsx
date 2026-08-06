"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { setTopicStatus, toggleTopicWeak, toggleTarget, toggleMilestone } from "@/lib/actions/placement";
import { PREP_TOPIC_STATUSES, PREP_STATUS_LABELS } from "@/lib/validations/placement";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Milestone = { id: string; title: string; dueDate: string | null; completedAt: string | null };
type Resource = { label: string; url: string | null };
type Topic = {
  id: string;
  title: string;
  category: string | null;
  status: string;
  isWeak: boolean;
  resources: Resource[] | null;
  notes: string | null;
};
type Target = { id: string; title: string; done: boolean };

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "COMPLETED") return "default";
  if (status === "BLOCKED" || status === "SKIPPED") return "destructive";
  if (status === "IN_PROGRESS") return "secondary";
  return "outline";
}

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  async function toggle(id: string, done: boolean) {
    await toggleMilestone(id, done);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">Roadmap</h3>
      <div className="relative z-10 space-y-2">
        {milestones.map((m) => {
          const isToday = m.dueDate?.slice(0, 10) === today;
          return (
            <label
              key={m.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2.5 text-sm",
                isToday ? "border-primary/50 bg-secondary/40" : "border-border"
              )}
            >
              <Checkbox checked={Boolean(m.completedAt)} onCheckedChange={(v) => toggle(m.id, v === true)} />
              <span className={m.completedAt ? "flex-1 text-muted-foreground line-through" : "flex-1"}>{m.title}</span>
              {m.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(m.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
              {isToday && <Badge variant="outline">Today</Badge>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function TopicsGrid({ topics }: { topics: Topic[] }) {
  const router = useRouter();

  async function setStatus(id: string, status: (typeof PREP_TOPIC_STATUSES)[number]) {
    await setTopicStatus(id, status);
    router.refresh();
  }

  async function toggleWeak(id: string, weak: boolean) {
    await toggleTopicWeak(id, weak);
    router.refresh();
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {topics.map((t) => (
        <div key={t.id} className="card-glow relative z-10 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{t.title}</span>
                {t.isWeak && (
                  <span title="Flagged as weak topic">
                    <AlertTriangle size={14} className="text-destructive" />
                  </span>
                )}
              </div>
              {t.category && <span className="text-xs text-muted-foreground">{t.category}</span>}
            </div>
            <Select value={t.status} onValueChange={(v) => setStatus(t.id, v as (typeof PREP_TOPIC_STATUSES)[number])}>
              <SelectTrigger className="h-7 w-32">
                <SelectValue>
                  <Badge variant={statusVariant(t.status)}>{PREP_STATUS_LABELS[t.status as keyof typeof PREP_STATUS_LABELS]}</Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PREP_TOPIC_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PREP_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}

          {t.resources && t.resources.length > 0 && (
            <div className="space-y-1">
              {t.resources.map((r, i) => (
                <div key={i} className="text-xs">
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                      {r.label}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{r.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => toggleWeak(t.id, !t.isWeak)}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            {t.isWeak ? "Unflag weak topic" : "Flag as weak topic"}
          </button>
        </div>
      ))}
    </div>
  );
}

export function TargetsList({ title, targets }: { title: string; targets: Target[] }) {
  const router = useRouter();

  async function toggle(id: string, done: boolean) {
    await toggleTarget(id, done);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {targets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
      ) : (
        <div className="space-y-2">
          {targets.map((t) => (
            <label key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-2 text-sm">
              <Checkbox checked={t.done} onCheckedChange={(v) => toggle(t.id, v === true)} />
              <span className={t.done ? "text-muted-foreground line-through" : ""}>{t.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
