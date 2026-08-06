"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createTask, setTaskStatus, deleteTask } from "@/lib/actions/planner";
import { RECURRENCE_RULES } from "@/lib/validations/planner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X } from "lucide-react";

export type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  recurrence: string;
  listName: string | null;
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  URGENT: "destructive",
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
};

export default function PlannerBoard({
  tasks,
  defaultDueDate,
  defaultListName,
}: {
  tasks: TaskItem[];
  defaultDueDate?: string;
  defaultListName?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [recurrence, setRecurrence] = useState<(typeof RECURRENCE_RULES)[number]>("NONE");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!title.trim()) return;
    setSaving(true);
    await createTask({
      title,
      priority: "MEDIUM",
      dueDate: defaultDueDate,
      recurrence,
      listName: defaultListName,
    });
    setTitle("");
    setSaving(false);
    router.refresh();
  }

  async function toggle(id: string, done: boolean) {
    await setTaskStatus(id, done ? "DONE" : "TODO");
    router.refresh();
  }

  async function remove(id: string) {
    await deleteTask(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="max-w-sm"
        />
        <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECURRENCE_RULES.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "NONE" ? "One-off" : r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={add} disabled={saving}>
          <Plus size={14} />
          Add
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="card-glow relative z-10 py-12 text-center text-sm text-muted-foreground">
          Nothing here.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="card-glow relative z-10 flex items-center justify-between gap-3 !p-3"
            >
              <label className="flex flex-1 items-center gap-3">
                <Checkbox checked={t.status === "DONE"} onCheckedChange={(v) => toggle(t.id, v === true)} />
                <span className={t.status === "DONE" ? "text-muted-foreground line-through" : ""}>{t.title}</span>
                {t.recurrence !== "NONE" && (
                  <span className="text-xs text-muted-foreground">↻ {t.recurrence.toLowerCase()}</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
                {t.dueDate && (
                  <span className="text-xs text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</span>
                )}
                <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
