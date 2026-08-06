import { z } from "zod";

export const LEAD_STATUSES = [
  "SOURCED",
  "CONTACTED",
  "REPLIED",
  "DISCOVERY_BOOKED",
  "DISCOVERY_DONE",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const STAGE_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  SOURCED: "Sourced",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  DISCOVERY_BOOKED: "Discovery Booked",
  DISCOVERY_DONE: "Discovery Done",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

// Client-facing schema — input type === output type (no .coerce/.default), so it
// matches exactly what react-hook-form holds and keeps zodResolver's generics happy.
export const leadFormSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  website: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  location: z.string().optional(),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  phone: z.string().optional(),
  decisionMaker: z.string().optional(),
  priority: z.enum(PRIORITIES),
  status: z.enum(LEAD_STATUSES),
  leadScore: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadFormSchema>;

// Server-side schema — coerces leadScore to a number for persistence. Server
// actions parse through this, not leadFormSchema.
export const leadSchema = leadFormSchema.extend({
  leadScore: z.coerce.number().int().min(0).max(15).optional(),
});
