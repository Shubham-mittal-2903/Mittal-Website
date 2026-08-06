import { z } from "zod";

export const LEARNING_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;

export const DEFAULT_LEARNING_TOPICS: Array<{ name: string; category: string }> = [
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Node", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "MongoDB", category: "Backend" },
  { name: "Postgres", category: "Backend" },
  { name: "Firebase", category: "Backend" },
  { name: "Supabase", category: "Backend" },
  { name: "Python", category: "Languages" },
  { name: "Java", category: "Languages" },
  { name: "DSA", category: "CS Fundamentals" },
  { name: "System Design", category: "CS Fundamentals" },
  { name: "GenAI", category: "AI" },
  { name: "Prompt Engineering", category: "AI" },
  { name: "NLP", category: "AI" },
];

export const topicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  status: z.enum(LEARNING_STATUSES),
  completionPct: z.string().optional(),
  notes: z.string().optional(),
});
export type TopicFormInput = z.infer<typeof topicFormSchema>;
export const topicSchema = topicFormSchema.extend({
  completionPct: z.coerce.number().min(0).max(100).optional(),
});

export const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().optional(),
  type: z.string().optional(),
});
export type ResourceFormInput = z.infer<typeof resourceFormSchema>;

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().optional(),
  notes: z.string().optional(),
});
export type LearningProjectFormInput = z.infer<typeof projectFormSchema>;
