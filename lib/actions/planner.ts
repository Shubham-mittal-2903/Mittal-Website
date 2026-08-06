"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskSchema, type TaskFormInput } from "@/lib/validations/planner";

export async function createTask(input: TaskFormInput) {
  const data = taskSchema.parse(input);
  await db.task.create({
    data: {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      recurrence: data.recurrence,
      listName: data.listName || undefined,
    },
  });
  revalidatePath("/leads/planner");
}

export async function updateTask(id: string, input: TaskFormInput) {
  const data = taskSchema.parse(input);
  await db.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      recurrence: data.recurrence,
      listName: data.listName || null,
    },
  });
  revalidatePath("/leads/planner");
}

function nextDueDate(current: Date, rule: "DAILY" | "WEEKLY" | "MONTHLY") {
  const next = new Date(current);
  if (rule === "DAILY") next.setDate(next.getDate() + 1);
  if (rule === "WEEKLY") next.setDate(next.getDate() + 7);
  if (rule === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

export async function setTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "DONE" | "SKIPPED" | "BLOCKED") {
  const task = await db.task.update({
    where: { id },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  });

  // Recurring tasks regenerate their next occurrence the moment they're marked done —
  // never auto-marks anything complete, this only fires off the back of a real user action.
  if (status === "DONE" && task.recurrence !== "NONE") {
    await db.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        recurrence: task.recurrence,
        listName: task.listName,
        dueDate: nextDueDate(task.dueDate ?? new Date(), task.recurrence),
      },
    });
  }

  revalidatePath("/leads/planner");
}

export async function deleteTask(id: string) {
  await db.task.delete({ where: { id } });
  revalidatePath("/leads/planner");
}
