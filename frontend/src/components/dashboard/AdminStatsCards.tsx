import { Users, FolderKanban, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardsProps {
  totalUsers: number;
  activeProjects: number;
  completedTasks: number;
  completionRate: number;
}

const cards = [
  {
    key: "users",
    label: "Tổng số người dùng",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    trend: "+12%",
    trendColor: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "projects",
    label: "Dự án đang hoạt động",
    icon: FolderKanban,
    color: "text-teal-600",
    bg: "bg-teal-50",
    trend: "+8%",
    trendColor: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "tasks",
    label: "Task hoàn thành",
    icon: CheckCircle2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    badge: true,
  },
  {
    key: "rate",
    label: "Tỷ lệ hoàn thành",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    status: "Excellent",
    trendColor: "text-emerald-600 bg-emerald-50",
  },
] as const;

export function AdminStatsCards({
  totalUsers,
  activeProjects,
  completedTasks,
  completionRate,
}: AdminStatsCardsProps) {
  const values: Record<string, string | number> = {
    users: totalUsers,
    projects: activeProjects,
    tasks: completedTasks,
    rate: `${completionRate}%`,
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <section className="flex items-start justify-between">
            <section className={cn("flex h-11 w-11 items-center justify-center rounded-xl", card.bg)}>
              <card.icon size={22} className={card.color} />
            </section>
            {"trend" in card && card.trend && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  card.trendColor
                )}
              >
                {card.trend}
              </span>
            )}
            {"status" in card && card.status && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  card.trendColor
                )}
              >
                {card.status}
              </span>
            )}
            {"badge" in card && card.badge && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                {activeProjects}
              </span>
            )}
          </section>
          <p className="mt-4 text-3xl font-bold text-slate-900">{values[card.key]}</p>
          <p className="mt-1 text-sm text-slate-500">{card.label}</p>
        </article>
      ))}
    </section>
  );
}
