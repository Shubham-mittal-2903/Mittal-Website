"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  emailDraftSchema,
  emailHistorySchema,
  followupEntrySchema,
  type EmailDraftInput,
  type EmailHistoryInputForm,
  type FollowupEntryInput,
} from "@/lib/validations/emails";

export async function createEmailDraft(leadId: string, input: EmailDraftInput) {
  const data = emailDraftSchema.parse(input);
  await db.emailDraft.create({ data: { ...data, leadId } });
  revalidatePath(`/leads/all/${leadId}`);
}

export async function createEmailHistoryEntry(leadId: string, input: EmailHistoryInputForm) {
  const data = emailHistorySchema.parse(input);
  await db.emailHistoryEntry.create({ data: { ...data, date: new Date(data.date), leadId } });
  revalidatePath(`/leads/all/${leadId}`);
  revalidatePath("/leads");
}

export async function toggleEmailHistoryFlag(id: string, leadId: string, field: "opened" | "replied", value: boolean) {
  await db.emailHistoryEntry.update({ where: { id }, data: { [field]: value } });
  revalidatePath(`/leads/all/${leadId}`);
  revalidatePath("/leads");
}

export async function createFollowupEntry(leadId: string, input: FollowupEntryInput) {
  const data = followupEntrySchema.parse(input);
  await db.followupEntry.create({
    data: {
      ...data,
      leadId,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
    },
  });
  revalidatePath(`/leads/all/${leadId}`);
  revalidatePath("/leads/pipeline");
  revalidatePath("/leads");
}
