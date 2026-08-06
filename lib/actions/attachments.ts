"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase/admin";

export async function getAttachmentUrl(storagePath: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 5); // 5 minutes
  if (error || !data) throw new Error(error?.message ?? "Failed to create signed URL");
  return data.signedUrl;
}

export async function deleteAttachment(id: string, leadId: string) {
  const attachment = await db.attachment.findUniqueOrThrow({ where: { id } });
  const admin = createAdminClient();
  await admin.storage.from(ATTACHMENTS_BUCKET).remove([attachment.storagePath]);
  await db.attachment.delete({ where: { id } });
  revalidatePath(`/leads/all/${leadId}`);
}
