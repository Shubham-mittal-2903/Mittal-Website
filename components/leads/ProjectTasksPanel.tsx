"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createProjectTask, toggleProjectTask } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

type TaskItem = { id: string; title: string; status: string };

export default function ProjectTasksPanel({ projectId, tasks }: { projectId: string; tasks: TaskItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function addTask() {
    if (!title.trim()) return;
    setSaving(true);
    await createProjectTask(projectId, title);
    setTitle("");
    setSaving(false);
    router.refresh();
  }

  async function toggle(id: string, done: boolean) {
    await toggleProjectTask(id, projectId, done);
    router.refresh();
  }

  const done = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Tasks {tasks.length > 0 && <span className="text-muted-foreground">({done}/{tasks.length})</span>}
        </h3>
      </div>

      <div className="relative z-10 mb-4 flex gap-2">
        <Input
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <Button type="button" size="sm" onClick={addTask} disabled={saving}>
          <Plus size={14} />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {tasks.map((t) => (
            <label key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
              <Checkbox checked={t.status === "DONE"} onCheckedChange={(v) => toggle(t.id, v === true)} />
              <span className={t.status === "DONE" ? "text-muted-foreground line-through" : ""}>{t.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
