"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projectSchema, type ProjectFormInput } from "@/lib/validations/projects";

function parseTags(tags: string | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createProject(input: ProjectFormInput) {
  const data = projectSchema.parse(input);
  const project = await db.project.create({
    data: {
      name: data.name,
      description: data.description || undefined,
      status: data.status,
      clientId: data.clientId || undefined,
      budget: data.budget,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: parseTags(data.tags),
    },
  });
  revalidatePath("/leads/projects");
  redirect(`/leads/projects/${project.id}`);
}

export async function updateProject(id: string, input: ProjectFormInput) {
  const data = projectSchema.parse(input);
  await db.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      status: data.status,
      clientId: data.clientId || null,
      budget: data.budget,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completedAt: data.status === "COMPLETED" ? new Date() : null,
      tags: parseTags(data.tags),
    },
  });
  revalidatePath(`/leads/projects/${id}`);
  revalidatePath("/leads/projects");
}

export async function deleteProject(id: string) {
  await db.project.delete({ where: { id } });
  revalidatePath("/leads/projects");
  redirect("/leads/projects");
}

export async function createProjectTask(projectId: string, title: string) {
  if (!title.trim()) return;
  await db.task.create({ data: { title: title.trim(), projectId } });
  revalidatePath(`/leads/projects/${projectId}`);
}

export async function toggleProjectTask(id: string, projectId: string, done: boolean) {
  await db.task.update({
    where: { id },
    data: { status: done ? "DONE" : "TODO", completedAt: done ? new Date() : null },
  });
  revalidatePath(`/leads/projects/${projectId}`);
}
