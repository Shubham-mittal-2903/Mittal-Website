"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type MonthlyTrend = { month: string; leads: number; emailsSent: number; replies: number; revenue: number };
type NichePerformance = { niche: string; total: number; won: number; winRate: number };

const AXIS_COLOR = "rgba(255,255,255,0.4)";
const GRID_COLOR = "rgba(255,255,255,0.08)";
const TOOLTIP_STYLE = {
  background: "hsl(240 7% 9%)",
  border: "1px solid hsl(240 6% 18%)",
  borderRadius: 8,
  fontSize: 12,
};

export function MonthlyTrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="leads" name="Leads" stroke="#C9CDD6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="emailsSent" name="Emails Sent" stroke="#9AA0AE" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="replies" name="Replies" stroke="#6E7480" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `$${v}`} />
        <Bar dataKey="revenue" name="Revenue" fill="#C9CDD6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NicheChart({ data }: { data: NichePerformance[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" stroke={AXIS_COLOR} fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="niche" stroke={AXIS_COLOR} fontSize={12} width={110} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="total" name="Leads" fill="#5A5F6B" radius={[0, 4, 4, 0]} />
        <Bar dataKey="won" name="Won" fill="#C9CDD6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

type FinanceTrend = { month: string; income: number; expense: number };
type LearningProgress = { category: string; avgPct: number };
type JobFunnel = { status: string; count: number };
type AttendanceBySubject = { subject: string; pct: number };
type PrepBreakdown = { status: string; count: number };

export function FinanceTrendChart({ data }: { data: FinanceTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `$${v}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="#C9CDD6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#6E7480" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LearningProgressChart({ data }: { data: LearningProgress[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} stroke={AXIS_COLOR} fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="category" stroke={AXIS_COLOR} fontSize={12} width={100} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
        <Bar dataKey="avgPct" name="Avg. completion" fill="#C9CDD6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function JobFunnelChart({ data }: { data: JobFunnel[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="status" stroke={AXIS_COLOR} fontSize={12} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Applications" fill="#C9CDD6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceChart({ data }: { data: AttendanceBySubject[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} stroke={AXIS_COLOR} fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="subject" stroke={AXIS_COLOR} fontSize={12} width={100} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
        <Bar dataKey="pct" name="Attendance" fill="#C9CDD6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PrepBreakdownChart({ data }: { data: PrepBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="status" stroke={AXIS_COLOR} fontSize={12} />
        <YAxis stroke={AXIS_COLOR} fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" name="Topics" fill="#C9CDD6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
