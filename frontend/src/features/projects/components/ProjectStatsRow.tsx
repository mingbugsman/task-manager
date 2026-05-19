import { BarChart3, ClipboardList, FolderKanban, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectOverallStats } from "@/src/types/api.types";

const cards = [
  {
    key: "projects",
    label: "Tổng Dự Án",
    icon: FolderKanban,
    bg: "bg-blue-50",
    iconBg: "bg-blue-100 text-blue-600",
    border: "border-blue-100",
    getValue: (s: ProjectOverallStats) => s.totalProjects,
  },
  {
    key: "tasks",
    label: "Tổng Tác Vụ",
    icon: ClipboardList,
    bg: "bg-violet-50",
    iconBg: "bg-violet-100 text-violet-600",
    border: "border-violet-100",
    getValue: (s: ProjectOverallStats) => s.totalTasks,
  },
  {
    key: "progress",
    label: "Đang Thực Hiện",
    icon: TrendingUp,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100 text-amber-600",
    border: "border-amber-100",
    getValue: (s: ProjectOverallStats) => s.totalInProgress,
  },
  {
    key: "avg",
    label: "TB Tiến Độ",
    icon: BarChart3,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-100",
    getValue: (s: ProjectOverallStats) => `${Math.round(s.avgProgressRate)}%`,
  },
] as const;

interface ProjectStatsRowProps {
  stats: ProjectOverallStats | null;
}

export function ProjectStatsRow({ stats }: ProjectStatsRowProps) {
  if (!stats) return null;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className={cn(
            "rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
            card.bg,
            card.border
          )}
        >
          <section className="flex items-start justify-between">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", card.iconBg)}>
              <card.icon size={22} />
            </span>
          </section>
          <p className="mt-4 text-3xl font-bold text-slate-900">{card.getValue(stats)}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">{card.label}</p>
        </article>
      ))}
    </section>
  );
}
