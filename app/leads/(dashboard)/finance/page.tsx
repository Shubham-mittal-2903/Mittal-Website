import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import FinanceQuickAdd from "@/components/leads/FinanceQuickAdd";
import FinanceTransactionList from "@/components/leads/FinanceTransactionList";
import FinanceBudgets from "@/components/leads/FinanceBudgets";
import { TRANSACTION_TYPES } from "@/lib/validations/finance";

const money = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(v);

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string }>;
}) {
  const { type, month: monthParam } = await searchParams;

  const now = new Date();
  const month = monthParam ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, monthNum] = month.split("-").map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 1);

  const [categories, transactions, allThisMonth, budgetsRaw] = await Promise.all([
    db.financeCategory.findMany({ orderBy: { name: "asc" } }),
    db.transaction.findMany({
      where: {
        date: { gte: monthStart, lt: monthEnd },
        ...(type ? { type: type as "INCOME" | "EXPENSE" } : {}),
      },
      include: { category: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
    db.transaction.findMany({ where: { date: { gte: monthStart, lt: monthEnd } } }),
    db.budget.findMany({ where: { month: monthStart }, include: { category: { select: { name: true } } } }),
  ]);

  const income = allThisMonth.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const expense = allThisMonth.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  const spentByCategory = new Map<string, number>();
  for (const t of allThisMonth) {
    if (t.type !== "EXPENSE" || !t.categoryId) continue;
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + Number(t.amount));
  }
  const budgets = budgetsRaw.map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    limitAmount: b.limitAmount.toString(),
    spent: spentByCategory.get(b.categoryId) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Finance</h1>
        <p className="text-sm text-muted-foreground">{month}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glow relative z-10">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-xl font-semibold">{money(income)}</p>
        </div>
        <div className="card-glow relative z-10">
          <p className="text-xs text-muted-foreground">Expense</p>
          <p className="text-xl font-semibold">{money(expense)}</p>
        </div>
        <div className="card-glow relative z-10">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={cn("text-xl font-semibold", income - expense < 0 && "text-destructive")}>{money(income - expense)}</p>
        </div>
      </div>

      <FinanceQuickAdd categories={categories} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex gap-2">
            <a
              href={`/leads/finance?month=${month}`}
              className={cn("rounded-lg border border-input px-3 py-1.5 text-sm", !type ? "bg-secondary" : "text-muted-foreground")}
            >
              All
            </a>
            {TRANSACTION_TYPES.map((t) => (
              <a
                key={t}
                href={`/leads/finance?month=${month}&type=${t}`}
                className={cn(
                  "rounded-lg border border-input px-3 py-1.5 text-sm",
                  type === t ? "bg-secondary" : "text-muted-foreground"
                )}
              >
                {t === "INCOME" ? "Income" : "Expense"}
              </a>
            ))}
          </div>
          <FinanceTransactionList
            transactions={transactions.map((t) => ({
              id: t.id,
              type: t.type,
              amount: t.amount.toString(),
              description: t.description,
              date: t.date.toISOString(),
              category: t.category,
            }))}
          />
        </div>
        <FinanceBudgets categories={categories} budgets={budgets} month={month} />
      </div>
    </div>
  );
}
