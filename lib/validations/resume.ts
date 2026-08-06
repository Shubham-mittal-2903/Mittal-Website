import { z } from "zod";

export const resumeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetRole: z.string().optional(),
  notes: z.string().optional(),
});
export type ResumeFormInput = z.infer<typeof resumeFormSchema>;
export const resumeSchema = resumeFormSchema;
