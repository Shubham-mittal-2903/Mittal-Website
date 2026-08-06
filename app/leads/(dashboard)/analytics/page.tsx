import { getAnalytics } from "@/lib/actions/analytics";
import { MonthlyTrendChart, RevenueChart, NicheChart } from "@/components/leads/AnalyticsCharts";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(n);
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const hasAnyLeads = data.totalLeads > 0;
  const hasAnyRevenue = data.totalRevenue > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Trends, win rate and niche performance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-glow relative z-10">
          <div className="text-2xl font-semibold">{data.totalLeads}</div>
          <div className="mt-1 text-xs text-muted-foreground">Total Leads</div>
        </div>
        <div className="card-glow relative z-10">
          <div className="text-2xl font-semibold">{data.wonCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">Won</div>
        </div>
        <div className="card-glow relative z-10">
          <div className="text-2xl font-semibold">{data.winRate}%</div>
          <div className="mt-1 text-xs text-muted-foreground">Win Rate</div>
        </div>
        <div className="card-glow relative z-10">
          <div className="text-2xl font-semibold">{formatCurrency(data.totalRevenue)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Total Revenue</div>
        </div>
      </div>

      <div className="card-glow relative z-10">
        <h3 className="mb-4 text-sm font-semibold">Monthly Trend</h3>
        {hasAnyLeads ? (
          <MonthlyTrendChart data={data.monthlyTrend} />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No activity yet — trends will appear as leads come in.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-glow relative z-10">
          <h3 className="mb-4 text-sm font-semibold">Revenue by Month</h3>
          {hasAnyRevenue ? (
            <RevenueChart data={data.monthlyTrend} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No paid invoices yet.</p>
          )}
        </div>

        <div className="card-glow relative z-10">
          <h3 className="mb-4 text-sm font-semibold">Niche Performance</h3>
          {data.nichePerformance.length > 0 ? (
            <NicheChart data={data.nichePerformance} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No leads with an industry set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
