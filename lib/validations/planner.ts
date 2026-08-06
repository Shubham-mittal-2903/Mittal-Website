import { z } from "zod";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "SKIPPED", "BLOCKED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const RECURRENCE_RULES = ["NONE", "DAILY", "WEEKLY", "MONTHLY"] as const;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().optional(),
  recurrence: z.enum(RECURRENCE_RULES),
  listName: z.string().optional(),
});
export type TaskFormInput = z.infer<typeof taskFormSchema>;
export const taskSchema = taskFormSchema;
