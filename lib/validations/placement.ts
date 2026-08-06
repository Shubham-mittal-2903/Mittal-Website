import { z } from "zod";

export const PREP_TOPIC_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "SKIPPED", "BLOCKED"] as const;

export const PREP_STATUS_LABELS: Record<(typeof PREP_TOPIC_STATUSES)[number], string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  BLOCKED: "Blocked",
};

export const topicNotesSchema = z.object({
  notes: z.string().optional(),
});
export type TopicNotesInput = z.infer<typeof topicNotesSchema>;
