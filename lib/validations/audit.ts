import { z } from "zod";

export const FINDING_TYPES = ["POSITIVE", "GAP", "NOT_VERIFIED", "ISSUE"] as const;

export const FINDING_LABELS: Record<(typeof FINDING_TYPES)[number], string> = {
  POSITIVE: "Positive",
  GAP: "Gap",
  NOT_VERIFIED: "Not Verified",
  ISSUE: "Issue",
};

export const auditFormSchema = z.object({
  performanceScore: z.string().optional(),
  accessibilityScore: z.string().optional(),
  bestPracticesScore: z.string().optional(),
  seoScore: z.string().optional(),
  performanceObservations: z.string().optional(),
  positiveObservations: z.string().optional(),
  improvementOpportunities: z.string().optional(),
  accessibilityIssues: z.string().optional(),
  browserIssues: z.string().optional(),
  rawNotes: z.string().optional(),
});
export type AuditFormInput = z.infer<typeof auditFormSchema>;

export const auditSchema = auditFormSchema.extend({
  performanceScore: z.coerce.number().int().min(0).max(100).optional(),
  accessibilityScore: z.coerce.number().int().min(0).max(100).optional(),
  bestPracticesScore: z.coerce.number().int().min(0).max(100).optional(),
  seoScore: z.coerce.number().int().min(0).max(100).optional(),
});

export const findingSchema = z.object({
  type: z.enum(FINDING_TYPES),
  category: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});
export type FindingInput = z.infer<typeof findingSchema>;
