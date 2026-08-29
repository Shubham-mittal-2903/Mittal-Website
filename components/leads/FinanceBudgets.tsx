"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBudget } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CategoryOption = { id: string; name: string; type: string };
type BudgetItem = { id: string; categoryId: string; categoryName: string; limitAmount: string; spent: number };

const money = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v);

export default function FinanceBudgets({
  categories,
  budgets,
  month,
}: {
  categories: CategoryOption[];
  budgets: BudgetItem[];
  month: string;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  async function add() {
    if (!categoryId || !limitAmount) return;
    await createBudget({ categoryId, month, limitAmount });
    setLimitAmount("");
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10 space-y-3">
      <h3 className="text-sm font-semibold">Budgets — {month}</h3>
      <div className="flex flex-wrap gap-2">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Limit" value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} className="w-28" />
        <Button size="sm" onClick={add}>
          Set budget
        </Button>
      </div>
      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No budgets set for this month.</p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const limit = Number(b.limitAmount);
            const pct = limit > 0 ? Math.min(100, (b.spent / limit) * 100) : 0;
            const over = b.spent > limit;
            return (
              <div key={b.id}>
                <div className="flex justify-between text-xs">
                  <span>{b.categoryName}</span>
                  <span className={over ? "text-destructive" : "text-muted-foreground"}>
                    {money(b.spent)} / {money(limit)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary">
                  <div
                    className={cn("h-1.5 rounded-full", over ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
