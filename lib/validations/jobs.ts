import { z } from "zod";

export const JOB_APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export const JOB_STATUS_LABELS: Record<(typeof JOB_APPLICATION_STATUSES)[number], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  OA: "OA",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const INTERVIEW_ROUND_TYPES = ["OA", "TECHNICAL", "HR", "MANAGERIAL", "SYSTEM_DESIGN", "OTHER"] as const;
export const INTERVIEW_ROUND_STATUSES = ["SCHEDULED", "COMPLETED", "PASSED", "FAILED"] as const;

export const jobApplicationFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  packageOffered: z.string().optional(),
  location: z.string().optional(),
  jdUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  status: z.enum(JOB_APPLICATION_STATUSES),
  resumeId: z.string().optional(),
  appliedAt: z.string().optional(),
  notes: z.string().optional(),
});
export type JobApplicationFormInput = z.infer<typeof jobApplicationFormSchema>;
export const jobApplicationSchema = jobApplicationFormSchema;
