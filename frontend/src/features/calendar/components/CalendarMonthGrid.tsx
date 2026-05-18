"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarTaskPill } from "./CalendarTaskPill";
import {
  getMonthGrid,
  isSameDay,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/src/features/calendar/lib/calendar-utils";
import { dayHasDeadlineAlert } from "@/src/features/calendar/lib/task-calendar-style";
import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";

const MAX_PILLS = 2;

interface CalendarMonthGridProps {
  cursor: Date;
  selectedDate: Date | null;
  today: Date;
  tasksByDate: Map<string, CalendarTask[]>;
  onSelectDate: (date: Date) => void;
}

export function CalendarMonthGrid({
  cursor,
  selectedDate,
  today,
  tasksByDate,
  onSelectDate,
}: CalendarMonthGridProps) {
  const cells = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const currentMonth = cursor.getMonth();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <section className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            {label}
          </span>
        ))}
      </section>

      <section className="grid grid-cols-7">
        {cells.map((date) => {
          const key = toDateKey(date);
          const dayTasks = tasksByDate.get(key) ?? [];
          const inMonth = date.getMonth() === currentMonth;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const showAlert = dayHasDeadlineAlert(dayTasks, today);
          const visible = dayTasks.slice(0, MAX_PILLS);
          const more = dayTasks.length - visible.length;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative min-h-[100px] border-b border-r border-slate-100 p-1.5 text-left transition-colors last:border-r-0",
                !inMonth && "bg-slate-50/60",
                isSelected && "bg-blue-50/80 ring-2 ring-inset ring-blue-400",
                !isSelected && "hover:bg-slate-50"
              )}
            >
              <section className="mb-1 flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                    isToday && "bg-blue-600 text-white",
                    !isToday && inMonth && "text-slate-800",
                    !isToday && !inMonth && "text-slate-400"
                  )}
                >
                  {date.getDate()}
                </span>
                {showAlert ? (
                  <Clock size={14} className="shrink-0 text-red-500" aria-label="Có deadline" />
                ) : null}
              </section>

              <section className="space-y-1">
                {visible.map((task) => (
                  <CalendarTaskPill key={task.taskId} task={task} compact />
                ))}
                {more > 0 ? (
                  <span className="block px-1 text-[10px] font-medium text-slate-500">
                    +{more} tác vụ
                  </span>
                ) : null}
              </section>
            </button>
          );
        })}
      </section>
    </section>
  );
}
