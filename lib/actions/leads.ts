"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { leadSchema, type LeadInput } from "@/lib/validations/leads";
import type { LeadStatus, Priority } from "@/lib/generated/prisma/enums";

export async function createLead(input: LeadInput) {
  const data = leadSchema.parse(input);

  const lead = await db.$transaction(async (tx) => {
    const last = await tx.lead.findFirst({ orderBy: { leadNumber: "desc" }, select: { leadNumber: true } });
    const leadNumber = (last?.leadNumber ?? 0) + 1;

    const created = await tx.lead.create({
      data: { ...data, leadNumber },
    });

    await tx.pipelineEvent.create({
      data: {
        leadId: created.id,
        occurredAt: created.createdAt,
        stage: created.status as LeadStatus,
        leadScore: created.leadScore,
        priority: created.priority as Priority,
        notes: "Lead created.",
      },
    });

    return created;
  });

  revalidatePath("/leads/all");
  revalidatePath("/leads");
  redirect(`/leads/all/${lead.id}`);
}

export async function updateLead(id: string, input: LeadInput) {
  const data = leadSchema.parse(input);

  const existing = await db.lead.findUniqueOrThrow({ where: { id }, select: { status: true } });

  await db.$transaction(async (tx) => {
    await tx.lead.update({ where: { id }, data });

    if (existing.status !== data.status) {
      await tx.pipelineEvent.create({
        data: {
          leadId: id,
          occurredAt: new Date(),
          stage: data.status,
          leadScore: data.leadScore,
          priority: data.priority,
        },
      });
    }
  });

  revalidatePath(`/leads/all/${id}`);
  revalidatePath("/leads/all");
  revalidatePath("/leads");
}

export async function updateLeadStage(id: string, stage: LeadStatus, note?: string) {
  await db.$transaction(async (tx) => {
    await tx.lead.update({ where: { id }, data: { status: stage } });
    await tx.pipelineEvent.create({
      data: { leadId: id, occurredAt: new Date(), stage, notes: note },
    });
  });

  revalidatePath(`/leads/all/${id}`);
  revalidatePath("/leads/pipeline");
  revalidatePath("/leads");
}

export async function updateLeadNote(
  id: string,
  field: "notes" | "auditNotes" | "aiNotes",
  value: string
) {
  await db.lead.update({ where: { id }, data: { [field]: value } });
  revalidatePath(`/leads/all/${id}`);
}
