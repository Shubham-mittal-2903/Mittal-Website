"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase/admin";
import { resumeSchema, type ResumeFormInput } from "@/lib/validations/resume";

export async function createResume(
  input: ResumeFormInput,
  file: { storagePath: string; fileName: string } | null
) {
  const data = resumeSchema.parse(input);
  const count = await db.resume.count({ where: { name: data.name } });
  await db.resume.create({
    data: {
      name: data.name,
      version: count + 1,
      targetRole: data.targetRole || undefined,
      notes: data.notes || undefined,
      fileUrl: file?.storagePath,
      fileName: file?.fileName,
    },
  });
  revalidatePath("/leads/resumes");
}

export async function setActiveResume(id: string) {
  await db.$transaction([
    db.resume.updateMany({ data: { isActive: false }, where: { isActive: true } }),
    db.resume.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath("/leads/resumes");
}

export async function deleteResume(id: string) {
  const resume = await db.resume.findUniqueOrThrow({ where: { id } });
  if (resume.fileUrl) {
    const admin = createAdminClient();
    await admin.storage.from(ATTACHMENTS_BUCKET).remove([resume.fileUrl]);
  }
  await db.resume.delete({ where: { id } });
  revalidatePath("/leads/resumes");
}

export async function getResumeUrl(storagePath: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(storagePath, 60 * 5);
  if (error || !data) throw new Error(error?.message ?? "Failed to create signed URL");
  return data.signedUrl;
}
