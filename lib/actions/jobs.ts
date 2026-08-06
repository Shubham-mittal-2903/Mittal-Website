"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { jobApplicationSchema, type JobApplicationFormInput } from "@/lib/validations/jobs";
import type { InterviewRoundType } from "@/lib/generated/prisma/enums";

export async function createJobApplication(input: JobApplicationFormInput) {
  const data = jobApplicationSchema.parse(input);
  const job = await db.jobApplication.create({
    data: {
      company: data.company,
      role: data.role,
      packageOffered: data.packageOffered || undefined,
      location: data.location || undefined,
      jdUrl: data.jdUrl || undefined,
      status: data.status,
      resumeId: data.resumeId || undefined,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
      notes: data.notes || undefined,
    },
  });
  revalidatePath("/leads/job-tracker");
  redirect(`/leads/job-tracker/${job.id}`);
}

export async function updateJobApplication(id: string, input: JobApplicationFormInput) {
  const data = jobApplicationSchema.parse(input);
  await db.jobApplication.update({
    where: { id },
    data: {
      company: data.company,
      role: data.role,
      packageOffered: data.packageOffered || null,
      location: data.location || null,
      jdUrl: data.jdUrl || null,
      status: data.status,
      resumeId: data.resumeId || null,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      notes: data.notes || null,
    },
  });
  revalidatePath(`/leads/job-tracker/${id}`);
  revalidatePath("/leads/job-tracker");
}

export async function deleteJobApplication(id: string) {
  await db.jobApplication.delete({ where: { id } });
  revalidatePath("/leads/job-tracker");
  redirect("/leads/job-tracker");
}

export async function addChecklistItem(jobApplicationId: string, label: string) {
  if (!label.trim()) return;
  await db.jobChecklistItem.create({ data: { jobApplicationId, label: label.trim() } });
  revalidatePath(`/leads/job-tracker/${jobApplicationId}`);
}

export async function toggleChecklistItem(id: string, jobApplicationId: string, done: boolean) {
  await db.jobChecklistItem.update({ where: { id }, data: { done } });
  revalidatePath(`/leads/job-tracker/${jobApplicationId}`);
}

export async function addInterviewRound(
  jobApplicationId: string,
  input: { type: InterviewRoundType; scheduledAt?: string; notes?: string }
) {
  await db.interviewRound.create({
    data: {
      jobApplicationId,
      type: input.type,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      notes: input.notes || undefined,
    },
  });
  revalidatePath(`/leads/job-tracker/${jobApplicationId}`);
}

export async function updateRoundStatus(id: string, jobApplicationId: string, status: "SCHEDULED" | "COMPLETED" | "PASSED" | "FAILED") {
  await db.interviewRound.update({ where: { id }, data: { status } });
  revalidatePath(`/leads/job-tracker/${jobApplicationId}`);
}
