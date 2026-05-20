"use client";

import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatFullDate } from "@/src/features/calendar/lib/calendar-utils";
import {
  formatPriority,
  formatRelativeTime,
  formatStatus,
} from "@/src/lib/format";
import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";
import {
  getPillClassName,
  getTaskPillVariant,
} from "@/src/features/calendar/lib/task-calendar-style";

interface CalendarDayPanelProps {
  selectedDate: Date | null;
  tasks: CalendarTask[];
}

export function CalendarDayPanel({ selectedDate, tasks }: CalendarDayPanelProps) {
  if (!selectedDate) {
    return (
      <aside className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <CalendarDays size={32} className="text-blue-600" />
        </span>
        <h3 className="text-base font-bold text-slate-900">Chọn một ngày</h3>
        <p className="mt-2 max-w-[200px] text-sm text-slate-500">
          Để xem các tác vụ trong ngày đó
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {tasks.length} tác vụ
        </p>
        <h3 className="mt-1 text-base font-bold capitalize text-slate-900">
          {formatFullDate(selectedDate)}
        </h3>
      </header>

      <ul className="flex-1 space-y-3 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <li className="py-8 text-center text-sm text-slate-400">Không có tác vụ trong ngày này</li>
        ) : (
          tasks.map((task) => {
            const variant = getTaskPillVariant(task, selectedDate);
            return (
              <li key={task.taskId}>
                <Link
                  href={`/tasks/${task.taskId}`}
                  className={`block rounded-xl border p-3 transition-shadow hover:shadow-md ${getPillClassName(variant)}`}
                >
                  <p className="font-semibold text-slate-900">{task.taskName}</p>
                  <p className="mt-0.5 text-xs opacity-80">{task.projectName}</p>
                  <section className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-current/20 bg-white/50 text-[10px]">
                      {formatStatus(task.status)}
                    </Badge>
                    <Badge variant="outline" className="border-current/20 bg-white/50 text-[10px]">
                      {formatPriority(task.priority)}
                    </Badge>
                  </section>
                  {task.dueAt ? (
                    <p className="mt-2 flex items-center gap-1 text-[11px] opacity-75">
                      <Clock size={12} />
                      Hạn: {formatRelativeTime(task.dueAt)}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
