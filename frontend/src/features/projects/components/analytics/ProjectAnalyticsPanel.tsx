"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  LineChart as LineChartIcon,
  ListTodo,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { projectApi } from "@/src/features/projects/api/project.api";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import type { ProjectAnalytics, ProjectDetail } from "@/src/types/api.types";

type StatusSlice = ProjectAnalytics["statusDistribution"][number];

/** Nhãn donut — dùng percent từ API (0–100), tránh nhầm với percent ratio 0–1 của Recharts. */
function renderStatusSliceLabel(props: {
  payload?: StatusSlice;
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  const slice = props.payload;
  if (!slice || slice.count <= 0) return null;

  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 55, outerRadius = 95 } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#334155"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${slice.label}: ${slice.percent}%`}
    </text>
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  Admin: "Admin",
  LEAD: "Lead",
  Lead: "Lead",
  MEMBER: "Member",
  Member: "Member",
  VIEWER: "Viewer",
  Viewer: "Viewer",
};

interface ProjectAnalyticsPanelProps {
  projectId: number;
  project: ProjectDetail;
}

export function ProjectAnalyticsPanel({ projectId, project }: ProjectAnalyticsPanelProps) {
  const { isReady } = useAuthReady();
  const [data, setData] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    projectApi
      .getAnalytics(projectId)
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isReady, projectId]);

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Không tải được dữ liệu analytics</p>
      </section>
    );
  }

  const donePct =
    data.totalTasks > 0 ? Math.round((data.doneCount / data.totalTasks) ) : 0;
  const maxPriority = Math.max(
    1,
    ...data.priorityDistribution.map((p) => p.count)
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section className="min-w-0">
          <Link
            href="/projects"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            ← Quay lại danh sách dự án
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {project.projectName}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            {project.projectDescription || "Chưa có mô tả dự án"}
          </p>
        </section>
        <section className="shrink-0 text-right">
          <p className="text-sm font-medium text-slate-500">Tiến độ tổng thể</p>
          <p className="text-4xl font-bold text-blue-600">{data.progressPercent}%</p>
        </section>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          iconClass="bg-blue-50 text-blue-600"
          badge={`${donePct}%`}
          badgeClass="bg-red-50 text-red-600"
          value={`${data.doneCount}/${data.totalTasks}`}
          label="Task hoàn thành"
        />
        <StatCard
          icon={Users}
          iconClass="bg-violet-50 text-violet-600"
          value={String(data.memberCount)}
          label="Thành viên"
          sub={`~${data.avgTasksPerMember} task/người`}
        />
        <StatCard
          icon={Activity}
          iconClass="bg-amber-50 text-amber-600"
          value={String(data.inProgressCount + data.reviewCount)}
          label="Đang thực hiện"
        />
        <StatCard
          icon={AlertCircle}
          iconClass="bg-red-50 text-red-600"
          value={String(data.overdueCount)}
          label="Task quá hạn"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tiến độ theo thời gian" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.progressOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 13,
                }}
                formatter={(v: number) => [`${v} task`, "Hoàn thành"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#progressFill)"
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Phân bổ trạng thái task" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 24, right: 48, bottom: 8, left: 48 }}>
              <Pie
                data={data.statusDistribution.filter((s) => s.count > 0)}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="48%"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
                label={renderStatusSliceLabel}
                labelLine={{ stroke: "#94A3B8", strokeWidth: 1 }}
              >
                {data.statusDistribution
                  .filter((s) => s.count > 0)
                  .map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, item) => {
                  const slice = item.payload as StatusSlice;
                  return [`${value} task (${slice.percent}%)`, slice.label];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                payload={data.statusDistribution.map((s) => ({
                  value: s.label,
                  type: "square" as const,
                  id: s.status,
                  color: s.color,
                }))}
                formatter={(value) => {
                  const slice = data.statusDistribution.find((s) => s.label === value);
                  const pct = slice?.percent ?? 0;
                  const count = slice?.count ?? 0;
                  return (
                    <span className="text-xs text-slate-600">
                      {value}
                      {count > 0 ? ` (${pct}%)` : " (0%)"}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Hiệu suất thành viên" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.memberPerformance}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="userName"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
              <Legend />
              <Bar dataKey="assignedCount" name="Được giao" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="completedCount" name="Hoàn thành" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task tạo vs Hoàn thành" icon={LineChartIcon}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.monthlyTaskFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="createdCount"
                name="Tạo mới"
                stroke="#EAB308"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#EAB308" }}
              />
              <Line
                type="monotone"
                dataKey="completedCount"
                name="Hoàn thành"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#22C55E" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Phân bổ độ ưu tiên" icon={ListTodo}>
          <ul className="space-y-5 py-2">
            {data.priorityDistribution.map((item) => (
              <li key={item.key}>
                <section className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    {item.count} task
                  </span>
                </section>
                <section className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <section
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(8, (item.count / maxPriority) * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </section>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Thành viên dự án" icon={Users}>
          <ul className="divide-y divide-slate-50">
            {data.memberCompletions.map((m) => (
              <li
                key={m.userId}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <Avatar
                  name={m.userName}
                  src={m.avatarUrl}
                  size="md"
                  className="h-11 w-11 shrink-0"
                />
                <section className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{m.userName}</p>
                  <p className="text-sm text-slate-500">
                    {ROLE_LABELS[m.role] ?? m.role}
                  </p>
                </section>
                <section className="shrink-0 text-right">
                  <p className="text-lg font-bold text-slate-900">{m.completionPercent}%</p>
                  <p className="text-xs text-slate-500">
                    {m.completedCount}/{m.assignedCount} task
                  </p>
                </section>
              </li>
            ))}
            {data.memberCompletions.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-400">Chưa có thành viên</li>
            ) : null}
          </ul>
        </ChartCard>
      </section>
    </section>
  );
}

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
  sub,
  badge,
  badgeClass,
}: {
  icon: ComponentType<{ size?: number }>;
  iconClass: string;
  value: string;
  label: string;
  sub?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <section className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconClass)}>
          <Icon size={22} />
        </span>
        {badge ? (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", badgeClass)}>
            {badge}
          </span>
        ) : null}
      </section>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
    </article>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </header>
      {children}
    </article>
  );
}
