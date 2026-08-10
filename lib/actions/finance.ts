"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  categoryFormSchema,
  transactionSchema,
  budgetSchema,
  type CategoryFormInput,
  type TransactionFormInput,
  type BudgetFormInput,
} from "@/lib/validations/finance";
import { parseDateOnly, dateOnly } from "@/lib/date-utils";

export async function createCategory(input: CategoryFormInput) {
  const data = categoryFormSchema.parse(input);
  await db.financeCategory.create({ data: { name: data.name, type: data.type } });
  revalidatePath("/leads/finance");
}

export async function createTransaction(input: TransactionFormInput) {
  const data = transactionSchema.parse(input);
  await db.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
      date: parseDateOnly(data.date),
    },
  });
  revalidatePath("/leads/finance");
}

export async function deleteTransaction(id: string) {
  await db.transaction.delete({ where: { id } });
  revalidatePath("/leads/finance");
}

export async function createBudget(input: BudgetFormInput) {
  const data = budgetSchema.parse(input);
  const [year, month] = data.month.split("-").map(Number);
  const monthStart = dateOnly(year, month - 1, 1);
  await db.budget.upsert({
    where: { categoryId_month: { categoryId: data.categoryId, month: monthStart } },
    create: { categoryId: data.categoryId, month: monthStart, limitAmount: data.limitAmount },
    update: { limitAmount: data.limitAmount },
  });
  revalidatePath("/leads/finance");
}
