"use client";

import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  LineChart as LineChartIcon,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import {
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
import { AppHeader } from "@/src/components/layout/AppHeader";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { cn } from "@/lib/utils";
import { reportApi } from "../api/report.api";
import type { PersonalReport, ReportPeriodKey } from "@/src/types/api.types";

type StatusSlice = PersonalReport["statusDistribution"][number];

const PERIOD_OPTIONS: { key: ReportPeriodKey; label: string }[] = [
  { key: "WEEK", label: "Tuần" },
  { key: "MONTH", label: "Tháng" },
  { key: "QUARTER", label: "Quý" },
];

const TREND_TITLES: Record<ReportPeriodKey, string> = {
  WEEK: "Xu hướng tuần này",
  MONTH: "Xu hướng 4 tuần gần đây",
  QUARTER: "Xu hướng 12 tuần gần đây",
};

function renderStatusLabel(props: {
  payload?: StatusSlice;
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  const slice = props.payload;
  if (!slice || slice.count <= 0) return null;

  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 55, outerRadius = 88 } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
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
      {`${slice.count}`}
    </text>
  );
}

function trendBadgeClass(value: string, invert = false): string {
  if (value === "0" || !value) return "bg-slate-100 text-slate-600";
  const positive = value.startsWith("+");
  const good = invert ? !positive : positive;
  return good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600";
}

export function PersonalReportView() {
  const { isReady } = useAuthReady();
  const [period, setPeriod] = useState<ReportPeriodKey>("WEEK");
  const [data, setData] = useState<PersonalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.getPersonalReport(period);
      setData(res.data.data);
    } catch {
      setError("Không tải được báo cáo");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!isReady) return;
    load();
  }, [isReady, load]);

  if (!isReady || loading) {
    return (
      <section>
        <ReportHeader period={period} onPeriodChange={setPeriod} />
        <section className="flex h-64 items-center justify-center">
          <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section>
        <ReportHeader period={period} onPeriodChange={setPeriod} />
        <article className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm text-red-700">
          {error ?? "Không có dữ liệu"}
        </article>
      </section>
    );
  }

  const { summary } = data;
  const statusSlices = data.statusDistribution.filter((s) => s.count > 0);

  return (
    <section className="space-y-6">
      <ReportHeader period={period} onPeriodChange={setPeriod} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          iconClass="bg-blue-50 text-blue-600"
          value={String(summary.totalTasks)}
          label="Tổng tác vụ"
          badge={summary.totalTasksTrend}
          badgeClass={trendBadgeClass(summary.totalTasksTrend)}
        />
        <StatCard
          icon={TrendingUp}
          iconClass="bg-emerald-50 text-emerald-600"
          value={`${summary.completionPercent}%`}
          label="Tỷ lệ hoàn thành"
          badge={summary.completionTrend}
          badgeClass={trendBadgeClass(summary.completionTrend)}
        />
        <StatCard
          icon={AlertCircle}
          iconClass="bg-red-50 text-red-600"
          value={String(summary.overdueCount)}
          label="Quá hạn"
          badge={summary.overdueTrend}
          badgeClass={trendBadgeClass(summary.overdueTrend, true)}
        />
        <StatCard
          icon={Clock}
          iconClass="bg-amber-50 text-amber-600"
          value={`${summary.avgCompletionDays} ngày`}
          label="TB thời gian hoàn thành"
          badge={summary.avgDaysTrend}
          badgeClass={trendBadgeClass(summary.avgDaysTrend, true)}
        />
      </section>

      {summary.totalTasks === 0 ? (
        <EmptyReport />
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <ChartCard title={TREND_TITLES[period]} icon={LineChartIcon}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.activityTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completedCount"
                    name="Hoàn thành"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3B82F6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="createdCount"
                    name="Tạo mới"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#F97316" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Phân bố trạng thái" icon={BarChart3}>
              {statusSlices.length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart margin={{ top: 16, right: 24, bottom: 8, left: 24 }}>
                      <Pie
                        data={statusSlices}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={2}
                        label={renderStatusLabel}
                        labelLine={{ stroke: "#94A3B8", strokeWidth: 1 }}
                      >
                        {statusSlices.map((entry) => (
                          <Cell key={entry.status} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, item) => {
                          const v = (value as number) ?? 0
                          const slice = item.payload as StatusSlice;
                          return [`${v} task (${slice.percent}%)`, slice.label];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="mt-2 flex flex-wrap justify-center gap-4">
                    {statusSlices.map((s) => (
                      <li key={s.status} className="flex items-center gap-2 text-sm text-slate-600">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}: <strong>{s.count}</strong>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </ChartCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Tiến độ dự án" icon={BarChart3}>
              {data.projectProgress.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">Chưa có dự án</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(220, data.projectProgress.length * 44)}>
                  <BarChart
                    data={data.projectProgress}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis
                      type="category"
                      dataKey="projectName"
                      width={120}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                   <Tooltip
                      formatter={(v) => [`${Number(v ?? 0)}%`, "Tiến độ"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
                    />
                    <Bar dataKey="progressPercent" fill="#3B82F6" radius={[0, 6, 6, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Khối lượng theo dự án" icon={ListTodo}>
              {data.projectWorkload.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.projectWorkload} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="projectName"
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-14}
                      textAnchor="end"
                      height={64}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
                    <Legend />
                    <Bar dataKey="completedCount" name="Hoàn thành" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="inProgressCount" name="Đang làm" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </section>

          <ChartCard title="Phân bố độ ưu tiên" icon={ListTodo}>
            <section className="grid gap-4 sm:grid-cols-3">
              {data.priorityDistribution.map((item) => (
                <article
                  key={item.key}
                  className="rounded-2xl border border-slate-100 px-5 py-6 text-center"
                  style={{ backgroundColor: `${item.color}12` }}
                >
                  <p className="text-4xl font-bold" style={{ color: item.color }}>
                    {item.count}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-800">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.percent}% tổng số</p>
                </article>
              ))}
            </section>
          </ChartCard>
        </>
      )}
    </section>
  );
}

function ReportHeader({
  period,
  onPeriodChange,
}: {
  period: ReportPeriodKey;
  onPeriodChange: (p: ReportPeriodKey) => void;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Báo Cáo & Phân Tích</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thống kê hiệu suất và tiến độ công việc được giao cho bạn
        </p>
      </section>
      <section className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onPeriodChange(opt.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              period === opt.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </section>
    </header>
  );
}

function EmptyReport() {
  return (
    <article className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <ListTodo size={40} className="mb-4 text-slate-300" />
      <h3 className="text-lg font-bold text-slate-800">Chưa có tác vụ được giao</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Báo cáo dựa trên các task được assign cho bạn trong dự án bạn tham gia.
      </p>
      <Link
        href="/tasks"
        className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Xem tác vụ của tôi
      </Link>
    </article>
  );
}

function StatCard({
  icon: Icon,
  iconClass,
  value,
  label,
  badge,
  badgeClass,
}: {
  icon: ComponentType<{ size?: number }>;
  iconClass: string;
  value: string;
  label: string;
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
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", badgeClass)}>{badge}</span>
        ) : null}
      </section>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
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
