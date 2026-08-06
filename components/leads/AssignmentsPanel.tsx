"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createAssignment, updateAssignmentStatus } from "@/lib/actions/college";
import { ASSIGNMENT_STATUSES } from "@/lib/validations/college";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Assignment = { id: string; title: string; status: string; dueDate: string | null };

function variant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "GRADED") return "default";
  if (status === "OVERDUE") return "destructive";
  if (status === "SUBMITTED") return "secondary";
  return "outline";
}

export default function AssignmentsPanel({ subjectId, assignments }: { subjectId: string; assignments: Assignment[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function add() {
    if (!title.trim()) return;
    await createAssignment(subjectId, { title, dueDate, status: "PENDING" });
    setTitle("");
    setDueDate("");
    router.refresh();
  }

  async function setStatus(id: string, status: (typeof ASSIGNMENT_STATUSES)[number]) {
    await updateAssignmentStatus(id, subjectId, status);
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10">
      <h3 className="mb-4 text-sm font-semibold">Assignments</h3>
      <div className="relative z-10 mb-4 flex flex-wrap gap-2">
        <Input placeholder="Assignment title…" value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xs" />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
        <Button type="button" size="sm" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {assignments.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
              <div>
                <span>{a.title}</span>
                {a.dueDate && <span className="ml-2 text-xs text-muted-foreground">{new Date(a.dueDate).toLocaleDateString()}</span>}
              </div>
              <Select value={a.status} onValueChange={(v) => setStatus(a.id, v as (typeof ASSIGNMENT_STATUSES)[number])}>
                <SelectTrigger className="h-7 w-28">
                  <SelectValue>
                    <Badge variant={variant(a.status)}>{a.status}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_STATUSES.map((s) => (
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
