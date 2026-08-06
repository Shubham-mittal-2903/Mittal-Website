"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addChecklistItem, toggleChecklistItem, addInterviewRound, updateRoundStatus } from "@/lib/actions/jobs";
import { INTERVIEW_ROUND_TYPES, INTERVIEW_ROUND_STATUSES } from "@/lib/validations/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ChecklistItem = { id: string; label: string; done: boolean };
type Round = { id: string; type: string; status: string; scheduledAt: string | null; notes: string | null };

function roundVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PASSED") return "default";
  if (status === "FAILED") return "destructive";
  if (status === "COMPLETED") return "secondary";
  return "outline";
}

export function ChecklistPanel({ jobApplicationId, items }: { jobApplicationId: string; items: ChecklistItem[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const done = items.filter((i) => i.done).length;

  async function add() {
    if (!label.trim()) return;
    await addChecklistItem(jobApplicationId, label);
    setLabel("");
    router.refresh();
  }

  async function toggle(id: string, value: boolean) {
    await toggleChecklistItem(id, jobApplicationId, value);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">
        Preparation Checklist {items.length > 0 && <span className="text-muted-foreground">({done}/{items.length})</span>}
      </h3>
      <div className="relative z-10 mb-4 flex gap-2">
        <Input
          placeholder="Add a checklist item…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button type="button" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {items.map((i) => (
            <label key={i.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
              <Checkbox checked={i.done} onCheckedChange={(v) => toggle(i.id, v === true)} />
              <span className={i.done ? "text-muted-foreground line-through" : ""}>{i.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function InterviewRoundsPanel({ jobApplicationId, rounds }: { jobApplicationId: string; rounds: Round[] }) {
  const router = useRouter();
  const [type, setType] = useState<(typeof INTERVIEW_ROUND_TYPES)[number]>("TECHNICAL");
  const [scheduledAt, setScheduledAt] = useState("");

  async function add() {
    await addInterviewRound(jobApplicationId, { type, scheduledAt: scheduledAt || undefined });
    setScheduledAt("");
    router.refresh();
  }

  async function setStatus(id: string, status: (typeof INTERVIEW_ROUND_STATUSES)[number]) {
    await updateRoundStatus(id, jobApplicationId, status);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">Interview Readiness</h3>
      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTERVIEW_ROUND_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-40" />
        <Button type="button" size="sm" onClick={add}>
          <Plus size={14} />
          Add round
        </Button>
      </div>
      {rounds.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No rounds logged yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {rounds.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
              <div>
                <span className="font-medium">{r.type.replace("_", " ")}</span>
                {r.scheduledAt && (
                  <span className="ml-2 text-xs text-muted-foreground">{new Date(r.scheduledAt).toLocaleDateString()}</span>
                )}
              </div>
              <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as (typeof INTERVIEW_ROUND_STATUSES)[number])}>
                <SelectTrigger className="h-7 w-32">
                  <SelectValue>
                    <Badge variant={roundVariant(r.status)}>{r.status}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_ROUND_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
