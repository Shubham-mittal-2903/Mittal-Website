import { getAnalytics, getMosAnalytics } from "@/lib/actions/analytics";
import {
  MonthlyTrendChart,
  RevenueChart,
  NicheChart,
  FinanceTrendChart,
  LearningProgressChart,
  JobFunnelChart,
  AttendanceChart,
  PrepBreakdownChart,
} from "@/components/leads/AnalyticsCharts";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(n);
}

export default async function AnalyticsPage() {
  const [data, mos] = await Promise.all([getAnalytics(), getMosAnalytics()]);

  const hasAnyLeads = data.totalLeads > 0;
  const hasAnyRevenue = data.totalRevenue > 0;
  const hasFinance = mos.financeTrend.some((m) => m.income > 0 || m.expense > 0);
  const hasLearning = mos.learningProgress.length > 0;
  const hasJobs = mos.jobFunnel.length > 0;
  const hasAttendance = mos.attendanceBySubject.length > 0;
  const hasPrep = mos.prepBreakdown.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Business trends plus career, learning, and attendance across MITTAL OS.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Business</h2>
        <div className="space-y-6">
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
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Finance</h2>
        <div className="card-glow relative z-10">
          {hasFinance ? (
            <FinanceTrendChart data={mos.financeTrend} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions logged yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Learning</h2>
          <div className="card-glow relative z-10">
            {hasLearning ? (
              <LearningProgressChart data={mos.learningProgress} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No learning topics yet.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Job Applications</h2>
          <div className="card-glow relative z-10">
            {hasJobs ? (
              <JobFunnelChart data={mos.jobFunnel} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No applications logged yet.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Attendance by Subject</h2>
          <div className="card-glow relative z-10">
            {hasAttendance ? (
              <AttendanceChart data={mos.attendanceBySubject} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No subjects yet.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Placement Prep</h2>
          <div className="card-glow relative z-10">
            {hasPrep ? (
              <PrepBreakdownChart data={mos.prepBreakdown} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No prep topics yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
