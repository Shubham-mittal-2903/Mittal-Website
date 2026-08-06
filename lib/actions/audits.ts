"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auditSchema, findingSchema, type AuditFormInput, type FindingInput } from "@/lib/validations/audit";

export async function saveAudit(leadId: string, auditId: string | null, input: AuditFormInput) {
  const data = auditSchema.parse(input);

  if (auditId) {
    await db.audit.update({ where: { id: auditId }, data });
  } else {
    await db.audit.create({ data: { ...data, leadId, performedAt: new Date(), source: "manual" } });
  }

  revalidatePath(`/leads/all/${leadId}`);
}

export async function addFinding(auditId: string, leadId: string, input: FindingInput) {
  const data = findingSchema.parse(input);
  await db.auditFinding.create({ data: { ...data, auditId } });
  revalidatePath(`/leads/all/${leadId}`);
}

export async function deleteFinding(findingId: string, leadId: string) {
  await db.auditFinding.delete({ where: { id: findingId } });
  revalidatePath(`/leads/all/${leadId}`);
}
