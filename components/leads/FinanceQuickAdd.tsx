"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTransaction, createCategory } from "@/lib/actions/finance";
import { TRANSACTION_TYPES } from "@/lib/validations/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type CategoryOption = { id: string; name: string; type: string };

export default function FinanceQuickAdd({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [type, setType] = useState<(typeof TRANSACTION_TYPES)[number]>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  const relevantCategories = categories.filter((c) => c.type === type);

  async function addTransaction() {
    if (!amount || !date) return;
    setSaving(true);
    try {
      await createTransaction({ type, amount, categoryId: categoryId || undefined, description, date });
      setAmount("");
      setDescription("");
      toast.success("Transaction added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    await createCategory({ name: newCategoryName, type });
    setNewCategoryName("");
    router.refresh();
  }

  return (
    <div className="card-glow relative z-10 space-y-3">
      <h3 className="text-sm font-semibold">Add a transaction</h3>
      <div className="flex flex-wrap gap-2">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "INCOME" ? "Income" : "Expense"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32" />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {relevantCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-48" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        <Button onClick={addTransaction} disabled={saving}>
          {saving ? "Saving…" : "Add"}
        </Button>
      </div>
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          placeholder={`New ${type === "INCOME" ? "income" : "expense"} category…`}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          className="w-56"
        />
        <Button type="button" variant="outline" size="sm" onClick={addCategory}>
          Add category
        </Button>
      </div>
    </div>
  );
}
