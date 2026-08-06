"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase/admin";
import { vaultItemFormSchema, type VaultItemFormInput } from "@/lib/validations/vault";

function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createVaultItem(
  input: VaultItemFormInput,
  file: { storagePath: string; fileName: string; fileSize: number } | null
) {
  const data = vaultItemFormSchema.parse(input);
  await db.vaultItem.create({
    data: {
      title: data.title,
      type: data.type,
      content: data.content || undefined,
      tags: parseTags(data.tags),
      fileUrl: file?.storagePath,
      fileName: file?.fileName,
      fileSize: file?.fileSize,
    },
  });
  revalidatePath("/leads/vault");
  revalidatePath("/leads/documents");
}

export async function deleteVaultItem(id: string) {
  const item = await db.vaultItem.findUniqueOrThrow({ where: { id } });
  if (item.fileUrl) {
    const admin = createAdminClient();
    await admin.storage.from(ATTACHMENTS_BUCKET).remove([item.fileUrl]);
  }
  await db.vaultItem.delete({ where: { id } });
  revalidatePath("/leads/vault");
  revalidatePath("/leads/documents");
}

export async function getVaultItemUrl(storagePath: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(storagePath, 60 * 5);
  if (error || !data) throw new Error(error?.message ?? "Failed to create signed URL");
  return data.signedUrl;
}
