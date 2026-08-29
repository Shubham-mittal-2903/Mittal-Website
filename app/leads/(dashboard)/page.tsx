import { getDashboardStats, getMosOverview } from "@/lib/actions/dashboard";
import JaydenChat from "@/components/leads/JaydenChat";
import AnimatedCard from "@/components/leads/AnimatedCard";
import {
  type LucideIcon,
  ListTodo,
  AlertTriangle,
  CheckSquare,
  FolderKanban,
  Briefcase,
  Target,
  BookOpen,
  Wallet,
  Users,
  UserCheck,
  UserX,
  Mail,
  Send,
  MessageSquareReply,
  CalendarCheck2,
  FileText,
  Building2,
  TrendingUp,
  Percent,
} from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
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

  const mosCards: { label: string; value: string | number; href: string; warn: boolean; icon: LucideIcon }[] = [
    { label: "Tasks due today", value: mos.tasksToday, href: "/leads/planner?view=today", warn: false, icon: ListTodo },
    { label: "Overdue tasks", value: mos.tasksOverdue, href: "/leads/planner?view=today", warn: mos.tasksOverdue > 0, icon: AlertTriangle },
    { label: "Attendance at risk", value: mos.atRiskSubjects, href: "/leads/college/attendance", warn: mos.atRiskSubjects > 0, icon: CheckSquare },
    { label: "Active projects", value: mos.activeProjects, href: "/leads/projects", warn: false, icon: FolderKanban },
    { label: "Active applications", value: mos.activeJobApplications, href: "/leads/job-tracker", warn: false, icon: Briefcase },
    { label: "Prep completion", value: `${mos.prepCompletionPct}%`, href: "/leads/placement-prep", warn: false, icon: Target },
    { label: "Weak prep topics", value: mos.weakPrepTopics, href: "/leads/placement-prep", warn: mos.weakPrepTopics > 0, icon: Target },
    { label: "Learning avg.", value: `${mos.learningAvgPct}%`, href: "/leads/learning", warn: false, icon: BookOpen },
    {
      label: "Finance this month",
      value: formatCurrency(mos.financeNet),
      href: "/leads/finance",
      warn: mos.financeNet < 0,
      icon: Wallet,
    },
  ];

  const kpis: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: "Today's Leads", value: stats.todaysLeads, icon: Users },
    { label: "Qualified Leads", value: stats.qualifiedLeads, icon: UserCheck },
    { label: "Rejected Leads", value: stats.rejectedLeads, icon: UserX },
    { label: "Emails Ready", value: stats.emailsReady, icon: Mail },
    { label: "Emails Sent", value: stats.emailsSent, icon: Send },
    { label: "Replies", value: stats.replies, icon: MessageSquareReply },
    { label: "Meetings", value: stats.meetings, icon: CalendarCheck2 },
    { label: "Proposals", value: stats.proposals, icon: FileText },
    { label: "Clients", value: stats.clients, icon: Building2 },
    { label: "Revenue", value: formatCurrency(stats.revenue), icon: TrendingUp },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: Percent },
    { label: "Reply Rate", value: `${stats.replyRate}%`, icon: Percent },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">MITTAL OS, at a glance — business, career, life.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Jayden</h2>
        <JaydenChat height="h-[420px]" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Today across MITTAL OS</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mosCards.map((c, i) => (
            <AnimatedCard key={c.label} href={c.href} index={i}>
              <c.icon
                size={16}
                className={`relative z-10 mb-3 ${c.warn ? "text-destructive" : "text-muted-foreground/70"}`}
              />
              <div className={`relative z-10 text-2xl font-semibold ${c.warn ? "text-destructive" : ""}`}>{c.value}</div>
              <div className="relative z-10 mt-1 text-xs text-muted-foreground">{c.label}</div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Business</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <AnimatedCard key={kpi.label} index={mosCards.length + i}>
              <kpi.icon size={16} className="relative z-10 mb-3 text-muted-foreground/70" />
              <div className="relative z-10 text-2xl font-semibold">{kpi.value}</div>
              <div className="relative z-10 mt-1 text-xs text-muted-foreground">{kpi.label}</div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard index={mosCards.length + kpis.length}>
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
        </AnimatedCard>

        <AnimatedCard index={mosCards.length + kpis.length + 1}>
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
        </AnimatedCard>
      </div>
    </div>
  );
}
