"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarDayPanel } from "./CalendarDayPanel";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarWeekGrid } from "./CalendarWeekGrid";
import { CalendarTodayList } from "./CalendarTodayList";
import { useCalendarTasks } from "@/src/features/calendar/hooks/useCalendarTasks";
import {
  addMonths,
  addWeeks,
  formatMonthYear,
  startOfDay,
  toDateKey,
  type CalendarViewMode,
} from "@/src/features/calendar/lib/calendar-utils";

const VIEW_OPTIONS: { id: CalendarViewMode; label: string }[] = [
  { id: "today", label: "Hôm Nay" },
  { id: "month", label: "Tháng" },
  { id: "week", label: "Tuần" },
];

export function CalendarView() {
  const { tasksByDate, loading, isReady } = useCalendarTasks();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState<CalendarViewMode>("month");
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksByDate.get(toDateKey(selectedDate)) ?? [];
  }, [selectedDate, tasksByDate]);

  const headerLabel = useMemo(() => {
    if (view === "month") return formatMonthYear(cursor);
    if (view === "week") {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() - cursor.getDay() + i);
        return d;
      });
      const start = days[0];
      const end = days[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} – ${end.getDate()} ${formatMonthYear(start)}`;
      }
      return `${start.toLocaleDateString("vi-VN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return formatMonthYear(today);
  }, [view, cursor, today]);

  const goPrev = () => {
    if (view === "month") setCursor((c) => addMonths(c, -1));
    else if (view === "week") setCursor((c) => addWeeks(c, -1));
  };

  const goNext = () => {
    if (view === "month") setCursor((c) => addMonths(c, 1));
    else if (view === "week") setCursor((c) => addWeeks(c, 1));
  };

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <section className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Calendar size={22} />
          </span>
          <section>
            <h1 className="text-2xl font-bold text-slate-900">Lịch</h1>
            <p className="mt-1 text-sm text-slate-500">Xem tác vụ theo thời gian</p>
          </section>
        </section>

        <section className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setView(opt.id);
                if (opt.id === "today") {
                  setSelectedDate(today);
                  setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                }
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                view === opt.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </section>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,300px)]">
        <section className="min-w-0 space-y-4">
          {view !== "today" ? (
            <section className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Trước"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold capitalize text-slate-900">{headerLabel}</h2>
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Sau"
              >
                <ChevronRight size={20} />
              </button>
            </section>
          ) : null}

          {view === "month" ? (
            <CalendarMonthGrid
              cursor={cursor}
              selectedDate={selectedDate}
              today={today}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
            />
          ) : null}

          {view === "week" ? (
            <CalendarWeekGrid
              cursor={cursor}
              selectedDate={selectedDate}
              today={today}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
            />
          ) : null}

          {view === "today" ? (
            <CalendarTodayList
              today={today}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
            />
          ) : null}
        </section>

        <CalendarDayPanel
          selectedDate={view === "today" ? today : selectedDate}
          tasks={
            view === "today"
              ? tasksByDate.get(toDateKey(today)) ?? []
              : selectedTasks
          }
        />
      </section>
    </section>
  );
}
