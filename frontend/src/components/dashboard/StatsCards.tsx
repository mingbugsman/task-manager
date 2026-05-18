import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  todo: number;
  inProgress: number;
  done: number;
}

const cards = [
  {
    key: "todo",
    label: "Chờ Làm",
    sub: "To Do",
    icon: ClipboardList,
    bg: "bg-violet-50",
    iconBg: "bg-violet-100 text-violet-600",
    border: "border-violet-100",
  },
  {
    key: "progress",
    label: "Đang Thực Hiện",
    sub: "In Progress",
    icon: Clock,
    bg: "bg-sky-50",
    iconBg: "bg-sky-100 text-sky-600",
    border: "border-sky-100",
  },
  {
    key: "done",
    label: "Hoàn Thành",
    sub: "Completed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-100",
  },
] as const;

export function StatsCards({ todo, inProgress, done }: StatsCardsProps) {
  const values = { todo, progress: inProgress, done };
  const total = todo + inProgress + done || 1;
  const donePct = Math.round((done / total) * 100);

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const value = values[card.key];
        const pct =
          card.key === "done"
            ? `${donePct}% tổng`
            : card.key === "todo"
              ? `${value} task`
              : `${value} task`;

        return (
          <article
            key={card.key}
            className={cn(
              "rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
              card.bg,
              card.border
            )}
          >
            <section className="flex items-start justify-between">
              <section
                className={cn("flex h-11 w-11 items-center justify-center rounded-xl", card.iconBg)}
              >
                <card.icon size={22} />
              </section>
              <span className="text-xs font-medium text-slate-500">{card.sub}</span>
            </section>
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{card.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{pct}</p>
          </article>
        );
      })}
    </section>
  );
}
