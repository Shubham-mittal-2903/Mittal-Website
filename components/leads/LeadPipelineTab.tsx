"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadStage } from "@/lib/actions/leads";
import { LEAD_STATUSES, STAGE_LABELS } from "@/lib/validations/leads";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

type PipelineEvent = {
  id: string;
  stage: string;
  occurredAt: Date;
  leadScore: number | null;
  priority: string | null;
  nextAction: string | null;
  notes: string | null;
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default function LeadPipelineTab({
  leadId,
  currentStage,
  events,
}: {
  leadId: string;
  currentStage: LeadStatus;
  events: PipelineEvent[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<LeadStatus>(currentStage);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleMove() {
    setSubmitting(true);
    try {
      await updateLeadStage(leadId, stage, note || undefined);
      setNote("");
      toast.success(`Moved to ${STAGE_LABELS[stage]}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update stage");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-glow relative z-10 space-y-3">
        <h3 className="text-sm font-semibold">Move stage</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Select value={stage} onValueChange={(v) => setStage(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleMove} disabled={submitting || stage === currentStage}>
            {submitting ? "Moving…" : "Move"}
          </Button>
        </div>
        <Textarea
          placeholder="Optional note about this stage change…"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="card-glow relative z-10">
        <h3 className="mb-4 text-sm font-semibold">History</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pipeline events yet.</p>
        ) : (
          <ol className="space-y-4 border-l border-border pl-4">
            {events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{STAGE_LABELS[event.stage as LeadStatus] ?? event.stage}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(event.occurredAt)}</span>
                </div>
                {event.notes && <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>}
                {event.nextAction && (
                  <p className="mt-1 text-xs text-muted-foreground">Next: {event.nextAction}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
