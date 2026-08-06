import { z } from "zod";

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(TRANSACTION_TYPES),
});
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export const transactionFormSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});
export type TransactionFormInput = z.infer<typeof transactionFormSchema>;
export const transactionSchema = transactionFormSchema.extend({
  amount: z.coerce.number().min(0.01),
});

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  month: z.string().min(1, "Month is required"), // "YYYY-MM"
  limitAmount: z.string().min(1, "Limit is required"),
});
export type BudgetFormInput = z.infer<typeof budgetFormSchema>;
export const budgetSchema = budgetFormSchema.extend({
  limitAmount: z.coerce.number().min(0),
});
