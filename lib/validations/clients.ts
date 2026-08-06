import { z } from "zod";

export const CLIENT_STATUSES = ["ACTIVE", "PAST", "PAUSED"] as const;
export const PROPOSAL_PACKAGES = ["LAUNCH", "PRESENCE", "GROWTH", "SIGNATURE"] as const;
export const PROPOSAL_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
export const CONTRACT_STATUSES = ["DRAFT", "SENT", "SIGNED", "VOID"] as const;
export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"] as const;

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  phone: z.string().optional(),
  status: z.enum(CLIENT_STATUSES),
  leadId: z.string().optional(),
  notes: z.string().optional(),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const proposalFormSchema = z.object({
  package: z.enum(PROPOSAL_PACKAGES),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  status: z.enum(PROPOSAL_STATUSES),
  content: z.string().optional(),
});
export type ProposalFormInput = z.infer<typeof proposalFormSchema>;
export const proposalSchema = proposalFormSchema.extend({
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
});

export const contractFormSchema = z.object({
  value: z.string().optional(),
  status: z.enum(CONTRACT_STATUSES),
});
export type ContractFormInput = z.infer<typeof contractFormSchema>;
export const contractSchema = contractFormSchema.extend({
  value: z.coerce.number().min(0).optional(),
});

export const invoiceFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  status: z.enum(INVOICE_STATUSES),
  dueAt: z.string().optional(),
  notes: z.string().optional(),
});
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export const invoiceSchema = invoiceFormSchema.extend({
  amount: z.coerce.number().min(0),
});
