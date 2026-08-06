import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  FolderKanban,
  Briefcase,
  FileText,
  CalendarCheck2,
  GraduationCap,
  CheckSquare,
  Wallet,
  BarChart3,
  CalendarClock,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string | null; // null = ungrouped, rendered with no heading
  items: NavItem[];
};

// Grows as each MITTAL OS module ships — see the Restructure sidebar task in the build plan.
// Never add an item here before its page is fully functional (no dead links).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/leads", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Business",
    items: [
      { href: "/leads/all", label: "Leads CRM", icon: Users },
      { href: "/leads/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/leads/clients", label: "Clients", icon: Building2 },
      { href: "/leads/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "Career",
    items: [
      { href: "/leads/job-tracker", label: "Job Tracker", icon: Briefcase },
      { href: "/leads/resumes", label: "Resume Manager", icon: FileText },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/leads/college", label: "College", icon: GraduationCap },
      { href: "/leads/college/attendance", label: "Attendance", icon: CheckSquare },
    ],
  },
  {
    label: "Life",
    items: [
      { href: "/leads/planner", label: "Planner", icon: CalendarCheck2 },
      { href: "/leads/finance", label: "Finance", icon: Wallet },
    ],
  },
  {
    label: null,
    items: [
      { href: "/leads/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/leads/daily-reports", label: "Daily Reports", icon: CalendarClock },
      { href: "/leads/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Flat list — kept for callers that just need "every real nav destination" (bottom nav, etc).
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
