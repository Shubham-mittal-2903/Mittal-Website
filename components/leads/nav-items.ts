import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
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

export const NAV_ITEMS: NavItem[] = [
  { href: "/leads", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads/all", label: "Leads", icon: Users },
  { href: "/leads/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/leads/clients", label: "Clients", icon: Building2 },
  { href: "/leads/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/leads/daily-reports", label: "Daily Reports", icon: CalendarClock },
  { href: "/leads/settings", label: "Settings", icon: Settings },
];
