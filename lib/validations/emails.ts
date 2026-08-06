import { z } from "zod";

export const EMAIL_DRAFT_STATUSES = ["DRAFT", "ACTIVE", "SUPERSEDED", "SENT"] as const;
export const FOLLOWUP_STATUSES = ["SCHEDULED", "SENT", "SKIPPED", "CANCELLED"] as const;

export const emailDraftSchema = z.object({
  version: z.string().min(1, "Version is required"),
  status: z.enum(EMAIL_DRAFT_STATUSES),
  subjectFinal: z.string().optional(),
  previewText: z.string().optional(),
  body: z.string().min(1, "Body is required"),
});
export type EmailDraftInput = z.infer<typeof emailDraftSchema>;

export const emailHistorySchema = z.object({
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(1, "Subject is required"),
  emailVersion: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});
export type EmailHistoryInputForm = z.infer<typeof emailHistorySchema>;

export const followupEntrySchema = z.object({
  channel: z.string().optional(),
  template: z.string().optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(FOLLOWUP_STATUSES),
  notes: z.string().optional(),
});
export type FollowupEntryInput = z.infer<typeof followupEntrySchema>;
