"use client";

import Link from "next/link";
import { CalendarTaskPill } from "./CalendarTaskPill";
import {
  formatFullDate,
  parseDateKey,
  toDateKey,
} from "@/src/features/calendar/lib/calendar-utils";
import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";

interface CalendarTodayListProps {
  today: Date;
  tasksByDate: Map<string, CalendarTask[]>;
  onSelectDate: (date: Date) => void;
}

export function CalendarTodayList({ today, tasksByDate, onSelectDate }: CalendarTodayListProps) {
  const key = toDateKey(today);
  const todayTasks = tasksByDate.get(key) ?? [];

  const upcomingKeys = [...tasksByDate.keys()]
    .filter((k) => k > key)
    .sort()
    .slice(0, 5);

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Hôm nay</h2>
        <p className="mt-1 text-sm capitalize text-slate-500">{formatFullDate(today)}</p>
        <ul className="mt-4 space-y-2">
          {todayTasks.length === 0 ? (
            <li className="py-6 text-center text-sm text-slate-400">Không có tác vụ hôm nay</li>
          ) : (
            todayTasks.map((task) => (
              <li key={task.taskId}>
                <CalendarTaskPill task={task} />
              </li>
            ))
          )}
        </ul>
      </article>

      {upcomingKeys.length > 0 ? (
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-700">Sắp tới</h2>
          <ul className="space-y-4">
            {upcomingKeys.map((dateKey) => {
              const date = parseDateKey(dateKey);
              const tasks = tasksByDate.get(dateKey) ?? [];
              return (
                <li key={dateKey}>
                  <button
                    type="button"
                    onClick={() => onSelectDate(date)}
                    className="mb-2 text-left text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {formatFullDate(date)}
                  </button>
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map((task) => (
                      <li key={task.taskId}>
                        <CalendarTaskPill task={task} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </article>
      ) : null}

      <p className="text-center">
        <Link href="/tasks" className="text-sm font-medium text-blue-600 hover:underline">
          Xem tất cả tác vụ →
        </Link>
      </p>
    </section>
  );
}
