import { z } from "zod";

export const ASSIGNMENT_STATUSES = ["PENDING", "SUBMITTED", "GRADED", "OVERDUE"] as const;
export const ATTENDANCE_MARKS = ["PRESENT", "ABSENT", "CANCELLED"] as const;

export const subjectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  credits: z.string().optional(),
  facultyName: z.string().optional(),
  minAttendancePct: z.string().optional(),
  examDate: z.string().optional(),
  internalMarks: z.string().optional(),
});
export type SubjectFormInput = z.infer<typeof subjectFormSchema>;
export const subjectSchema = subjectFormSchema.extend({
  credits: z.coerce.number().int().min(0).optional(),
  minAttendancePct: z.coerce.number().min(0).max(100).optional(),
  internalMarks: z.coerce.number().min(0).optional(),
});

export const assignmentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional(),
  status: z.enum(ASSIGNMENT_STATUSES),
  grade: z.string().optional(),
  notes: z.string().optional(),
});
export type AssignmentFormInput = z.infer<typeof assignmentFormSchema>;
export const assignmentSchema = assignmentFormSchema;
