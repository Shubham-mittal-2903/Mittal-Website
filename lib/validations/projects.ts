import { z } from "zod";

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD", "CANCELLED"] as const;

export const PROJECT_STATUS_LABELS: Record<(typeof PROJECT_STATUSES)[number], string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES),
  clientId: z.string().optional(),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(), // comma-separated in the form, split server-side
});
export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const projectSchema = projectFormSchema.extend({
  budget: z.coerce.number().min(0).optional(),
});
