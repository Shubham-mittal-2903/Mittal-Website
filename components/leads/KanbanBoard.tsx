"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DndContext,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { updateLeadStage } from "@/lib/actions/leads";
import { LEAD_STATUSES, STAGE_LABELS } from "@/lib/validations/leads";
import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

type KanbanLead = {
  id: string;
  leadNumber: number;
  company: string;
  industry: string | null;
  status: LeadStatus;
  priority: string;
  leadScore: number | null;
};

function LeadCard({ lead }: { lead: KanbanLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card-glow relative cursor-grab touch-none select-none active:cursor-grabbing"
      data-dragging={isDragging}
    >
      <Link
        href={`/leads/all/${lead.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="relative z-10 block"
      >
        <div className="text-sm font-medium">{lead.company}</div>
        {lead.industry && <div className="mt-0.5 text-xs text-muted-foreground">{lead.industry}</div>}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            #{lead.leadNumber}
          </Badge>
          {lead.leadScore != null && (
            <Badge variant="outline" className="text-[10px]">
              {lead.leadScore}/15
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
}

function Column({
  stage,
  leads,
}: {
  stage: LeadStatus;
  leads: KanbanLead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 snap-start flex-col rounded-lg border border-border bg-muted/20 transition-colors ${
        isOver ? "border-primary bg-muted/40" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function StaticCard({ lead }: { lead: KanbanLead }) {
  return (
    <div className="card-glow relative">
      <div className="relative z-10 block">
        <div className="text-sm font-medium">{lead.company}</div>
        {lead.industry && <div className="mt-0.5 text-xs text-muted-foreground">{lead.industry}</div>}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            #{lead.leadNumber}
          </Badge>
          {lead.leadScore != null && (
            <Badge variant="outline" className="text-[10px]">
              {lead.leadScore}/15
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function StaticBoard({ leads }: { leads: KanbanLead[] }) {
  return (
    <div className="flex flex-1 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
      {LEAD_STATUSES.map((stage) => {
        const columnLeads = leads.filter((l) => l.status === stage);
        return (
          <div
            key={stage}
            className="flex w-72 shrink-0 snap-start flex-col rounded-lg border border-border bg-muted/20"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
              <span className="text-xs text-muted-foreground">{columnLeads.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {columnLeads.map((lead) => (
                <StaticCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function KanbanBoard({ leads }: { leads: KanbanLead[] }) {
  // @dnd-kit generates aria-describedby ids via a module-level counter that isn't
  // SSR-safe (mismatches on hydration). Render a static, non-interactive board on
  // the server and first paint, then swap in the DndContext-powered version once
  // mounted client-side — avoids the mismatch entirely instead of suppressing it.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isPending, startTransition] = useTransition();
  const [optimisticLeads, setOptimisticLeads] = useOptimistic(
    leads,
    (state, update: { id: string; status: LeadStatus }) =>
      state.map((l) => (l.id === update.id ? { ...l, status: update.status } : l))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStage) return;

    startTransition(async () => {
      setOptimisticLeads({ id: leadId, status: newStage });
      try {
        await updateLeadStage(leadId, newStage);
        toast.success(`${lead.company} → ${STAGE_LABELS[newStage]}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to move lead");
      }
    });
  }

  if (!mounted) return <StaticBoard leads={optimisticLeads} />;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className={`flex flex-1 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory transition-opacity ${
          isPending ? "opacity-75" : ""
        }`}
      >
        {LEAD_STATUSES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            leads={optimisticLeads.filter((l) => l.status === stage)}
          />
        ))}
      </div>
    </DndContext>
  );
}
