import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/src/lib/format";
import { presentActivity } from "@/src/lib/activityPresentation";
import type { ActivityLog } from "@/src/types/api.types";

interface ActivityFeedProps {
  activities: ActivityLog[];
  viewAllHref?: string;
  compact?: boolean;
  showFooter?: boolean;
}

function ActivityItem({ activity }: { activity: ActivityLog }) {
  const p = presentActivity(activity);
  const Icon = p.icon;

  return (
    <article className="flex gap-3">
      <Avatar name={activity.userName} src={activity.avatarUrl} size="md" className="shrink-0" />
      <section className="min-w-0 flex-1 pb-1">
        <p className="text-[13px] leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-900">{activity.userName}</span>{" "}
          <span>{p.verb}</span>{" "}
          {p.targetLabel ? (
            p.targetHref ? (
              <Link
                href={p.targetHref}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                {p.targetLabel}
              </Link>
            ) : (
              <span className="font-semibold text-blue-600">{p.targetLabel}</span>
            )
          ) : null}
          {p.trailing ? <span> {p.trailing}</span> : null}
        </p>

        {p.detail ? (
          <p className="mt-2 line-clamp-2 rounded-lg bg-slate-100 px-3 py-2 text-[13px] leading-snug text-slate-600">
            {p.detail}
          </p>
        ) : null}

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Icon size={14} className={p.iconClassName} strokeWidth={2} />
          <span>{formatRelativeTime(activity.createdAt)}</span>
        </p>
      </section>
    </article>
  );
}

export function ActivityFeed({
  activities,
  viewAllHref = "/activities",
  compact = false,
  showFooter = true,
}: ActivityFeedProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
        <h2 className="text-base font-bold tracking-tight text-slate-900">Hoạt Động Gần Đây</h2>
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
          Live
        </span>
      </header>

      <section className={`flex-1 overflow-y-auto px-5 ${compact ? "py-3" : "py-4"}`}>
        {activities.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Chưa có hoạt động gần đây</p>
        ) : (
          <ul className="space-y-5">
            {activities.map((activity) => (
              <li key={activity.activityLogId}>
                <ActivityItem activity={activity} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {showFooter ? (
        <footer className="border-t border-slate-50 p-4">
          <Link
            href={viewAllHref}
            className="flex w-full items-center justify-center rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
          >
            Xem Tất Cả Hoạt Động
          </Link>
        </footer>
      ) : null}
    </article>
  );
}
