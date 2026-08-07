import Link from "next/link";
import { getDashboardStats, getMosOverview } from "@/lib/actions/dashboard";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

const STAGE_LABELS: Record<string, string> = {
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

export default async function DashboardPage() {
  const [stats, mos] = await Promise.all([getDashboardStats(), getMosOverview()]);

  const mosCards = [
    { label: "Tasks due today", value: mos.tasksToday, href: "/leads/planner?view=today", warn: false },
    { label: "Overdue tasks", value: mos.tasksOverdue, href: "/leads/planner?view=today", warn: mos.tasksOverdue > 0 },
    { label: "Attendance at risk", value: mos.atRiskSubjects, href: "/leads/college/attendance", warn: mos.atRiskSubjects > 0 },
    { label: "Active projects", value: mos.activeProjects, href: "/leads/projects", warn: false },
    { label: "Active applications", value: mos.activeJobApplications, href: "/leads/job-tracker", warn: false },
    { label: "Prep completion", value: `${mos.prepCompletionPct}%`, href: "/leads/placement-prep", warn: false },
    { label: "Weak prep topics", value: mos.weakPrepTopics, href: "/leads/placement-prep", warn: mos.weakPrepTopics > 0 },
    { label: "Learning avg.", value: `${mos.learningAvgPct}%`, href: "/leads/learning", warn: false },
    {
      label: "Finance this month",
      value: formatCurrency(mos.financeNet),
      href: "/leads/finance",
      warn: mos.financeNet < 0,
    },
  ];

  const kpis = [
    { label: "Today's Leads", value: stats.todaysLeads },
    { label: "Qualified Leads", value: stats.qualifiedLeads },
    { label: "Rejected Leads", value: stats.rejectedLeads },
    { label: "Emails Ready", value: stats.emailsReady },
    { label: "Emails Sent", value: stats.emailsSent },
    { label: "Replies", value: stats.replies },
    { label: "Meetings", value: stats.meetings },
    { label: "Proposals", value: stats.proposals },
    { label: "Clients", value: stats.clients },
    { label: "Revenue", value: formatCurrency(stats.revenue) },
    { label: "Conversion Rate", value: `${stats.conversionRate}%` },
    { label: "Reply Rate", value: `${stats.replyRate}%` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">MITTAL OS, at a glance — business, career, life.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Today across MITTAL OS</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mosCards.map((c) => (
            <Link key={c.label} href={c.href} className="card-glow block">
              <div className={`relative z-10 text-2xl font-semibold ${c.warn ? "text-destructive" : ""}`}>{c.value}</div>
              <div className="relative z-10 mt-1 text-xs text-muted-foreground">{c.label}</div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Business</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="card-glow">
              <div className="relative z-10 text-2xl font-semibold">{kpi.value}</div>
              <div className="relative z-10 mt-1 text-xs text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-glow">
          <h2 className="relative z-10 mb-4 text-sm font-semibold">Recent Activity</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="relative z-10 text-sm text-muted-foreground">
              No pipeline activity yet — it'll show up here as leads move through stages.
            </p>
          ) : (
            <ul className="relative z-10 space-y-3">
              {stats.recentActivity.map((event) => (
                <li key={event.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium">{event.lead.company}</span>{" "}
                    <span className="text-muted-foreground">→ {STAGE_LABELS[event.stage] ?? event.stage}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-glow">
          <h2 className="relative z-10 mb-4 text-sm font-semibold">Upcoming Follow-ups</h2>
          {stats.upcomingFollowups.length === 0 ? (
            <p className="relative z-10 text-sm text-muted-foreground">
              Nothing scheduled — follow-ups you set on a lead will show up here.
            </p>
          ) : (
            <ul className="relative z-10 space-y-3">
              {stats.upcomingFollowups.map((f) => (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{f.lead.company}</span>
                  <span className="text-xs text-muted-foreground">
                    {f.scheduledDate ? formatDate(f.scheduledDate) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
