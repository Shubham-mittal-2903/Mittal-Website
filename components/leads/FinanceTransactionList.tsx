"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { deleteTransaction } from "@/lib/actions/finance";
import { Badge } from "@/components/ui/badge";

type TxItem = {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  date: string;
  category: { name: string } | null;
};

const money = (v: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(Number(v));

export default function FinanceTransactionList({ transactions }: { transactions: TxItem[] }) {
  const router = useRouter();

  async function remove(id: string) {
    await deleteTransaction(id);
    router.refresh();
  }

  if (transactions.length === 0) {
    return <div className="card-glow relative z-10 py-12 text-center text-sm text-muted-foreground">No transactions yet.</div>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div key={t.id} className="card-glow relative z-10 flex items-center justify-between gap-3 !p-3">
          <div className="flex items-center gap-3">
            <Badge variant={t.type === "INCOME" ? "default" : "secondary"}>{t.type === "INCOME" ? "+" : "-"}</Badge>
            <div>
              <div className="text-sm font-medium">{t.description || t.category?.name || "Transaction"}</div>
              <div className="text-xs text-muted-foreground">
                {t.category?.name ?? "Uncategorized"} · {new Date(t.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={t.type === "INCOME" ? "text-sm font-medium" : "text-sm font-medium text-muted-foreground"}>
              {money(t.amount)}
            </span>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
