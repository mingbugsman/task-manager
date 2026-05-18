import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, formatPriority, formatStatus } from "@/src/lib/format";
import type { TaskSummary } from "@/src/types/api.types";

function statusVariant(status: string) {
  if (status === "Done") return "done";
  if (status === "In Progress" || status === "Review") return "progress";
  return "todo";
}

function priorityVariant(priority: number) {
  if (priority >= 3) return "high";
  if (priority === 2) return "medium";
  return "low";
}

interface RecentTasksTableProps {
  tasks: TaskSummary[];
  projectNames?: Record<number, string>;
  linkToDetail?: boolean;
}

export function RecentTasksTable({
  tasks,
  projectNames,
  linkToDetail = true,
}: RecentTasksTableProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <section className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-bold text-slate-900">Tác Vụ Gần Đây</h2>
        <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:underline">
          Xem tất cả
        </Link>
      </section>

      <section className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">Tên tác vụ</th>
              <th className="px-4 py-3">Người giao</th>
              <th className="px-4 py-3">Ưu tiên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-6 py-3">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  Chưa có tác vụ
                </td>
              </tr>
            ) : (
              tasks.slice(0, 6).map((task) => (
                <tr
                  key={task.taskId}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    {linkToDetail ? (
                      <Link
                        href={`/tasks/${task.taskId}`}
                        className="block font-medium text-slate-900 hover:text-blue-600"
                      >
                        {task.taskName}
                      </Link>
                    ) : (
                      <p className="font-medium text-slate-900">{task.taskName}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {projectNames?.[task.taskId] ?? "Dự án"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {task.assignee ? (
                      <section className="flex items-center gap-2">
                        <Avatar
                          name={task.assignee.userName}
                          src={task.assignee.avatarUrl}
                          size="sm"
                        />
                        <span className="text-slate-700">{task.assignee.userName}</span>
                      </section>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={priorityVariant(task.priority)}>
                      {formatPriority(task.priority)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant(task.status)}>
                      {formatStatus(task.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <section className="flex items-center gap-1.5 text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      {formatDate(task.dueAt)}
                    </section>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </article>
  );
}
