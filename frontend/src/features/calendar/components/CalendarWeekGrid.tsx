"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarTaskPill } from "./CalendarTaskPill";
import {
  getWeekDays,
  isSameDay,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/src/features/calendar/lib/calendar-utils";
import { dayHasDeadlineAlert } from "@/src/features/calendar/lib/task-calendar-style";
import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";

interface CalendarWeekGridProps {
  cursor: Date;
  selectedDate: Date | null;
  today: Date;
  tasksByDate: Map<string, CalendarTask[]>;
  onSelectDate: (date: Date) => void;
}

export function CalendarWeekGrid({
  cursor,
  selectedDate,
  today,
  tasksByDate,
  onSelectDate,
}: CalendarWeekGridProps) {
  const days = getWeekDays(cursor);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <section className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80">
        {days.map((date, i) => (
          <button
            key={toDateKey(date)}
            type="button"
            onClick={() => onSelectDate(date)}
            className={cn(
              "border-r border-slate-100 py-3 text-center last:border-r-0",
              selectedDate && isSameDay(date, selectedDate) && "bg-blue-50"
            )}
          >
            <p className="text-xs font-bold text-slate-500">{WEEKDAY_LABELS[i]}</p>
            <p
              className={cn(
                "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                isSameDay(date, today) ? "bg-blue-600 text-white" : "text-slate-800"
              )}
            >
              {date.getDate()}
            </p>
          </button>
        ))}
      </section>

      <section className="grid min-h-[320px] grid-cols-7">
        {days.map((date) => {
          const key = toDateKey(date);
          const dayTasks = tasksByDate.get(key) ?? [];
          const showAlert = dayHasDeadlineAlert(dayTasks, today);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col border-r border-slate-100 p-2 text-left last:border-r-0 hover:bg-slate-50",
                selectedDate && isSameDay(date, selectedDate) && "bg-blue-50/60"
              )}
            >
              {showAlert ? (
                <Clock size={12} className="mb-1 self-end text-red-500" />
              ) : (
                <span className="mb-1 h-3" />
              )}
              <section className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                {dayTasks.map((task) => (
                  <CalendarTaskPill key={task.taskId} task={task} />
                ))}
              </section>
            </button>
          );
        })}
      </section>
    </section>
  );
}
