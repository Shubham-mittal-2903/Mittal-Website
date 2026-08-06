"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  topicSchema,
  resourceFormSchema,
  projectFormSchema,
  DEFAULT_LEARNING_TOPICS,
  type TopicFormInput,
  type ResourceFormInput,
  type LearningProjectFormInput,
} from "@/lib/validations/learning";

export async function seedDefaultTopics() {
  const count = await db.learningTopic.count();
  if (count > 0) return;
  await db.learningTopic.createMany({
    data: DEFAULT_LEARNING_TOPICS.map((t) => ({ name: t.name, category: t.category })),
    skipDuplicates: true,
  });
  revalidatePath("/leads/learning");
}

export async function createTopic(input: TopicFormInput) {
  const data = topicSchema.parse(input);
  await db.learningTopic.create({
    data: {
      name: data.name,
      category: data.category || undefined,
      status: data.status,
      completionPct: data.completionPct ?? 0,
      notes: data.notes || undefined,
    },
  });
  revalidatePath("/leads/learning");
}

export async function updateTopic(id: string, input: TopicFormInput) {
  const data = topicSchema.parse(input);
  await db.learningTopic.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category || null,
      status: data.status,
      completionPct: data.completionPct ?? 0,
      notes: data.notes || null,
      lastRevisedAt: data.status === "COMPLETED" ? new Date() : undefined,
    },
  });
  revalidatePath(`/leads/learning/${id}`);
  revalidatePath("/leads/learning");
}

export async function markRevised(id: string) {
  await db.learningTopic.update({ where: { id }, data: { lastRevisedAt: new Date() } });
  revalidatePath(`/leads/learning/${id}`);
}

export async function addResource(topicId: string, input: ResourceFormInput) {
  const data = resourceFormSchema.parse(input);
  await db.learningResource.create({
    data: { topicId, title: data.title, url: data.url || undefined, type: data.type || undefined },
  });
  revalidatePath(`/leads/learning/${topicId}`);
}

export async function toggleResource(id: string, topicId: string, completed: boolean) {
  await db.learningResource.update({ where: { id }, data: { completed } });
  revalidatePath(`/leads/learning/${topicId}`);
}

export async function addLearningProject(topicId: string, input: LearningProjectFormInput) {
  const data = projectFormSchema.parse(input);
  await db.learningProject.create({
    data: { topicId, name: data.name, url: data.url || undefined, notes: data.notes || undefined },
  });
  revalidatePath(`/leads/learning/${topicId}`);
}
