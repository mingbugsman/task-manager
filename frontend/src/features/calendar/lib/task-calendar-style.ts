import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";

export type TaskPillVariant = "yellow" | "red" | "green";

const PILL_STYLES: Record<TaskPillVariant, string> = {
  yellow: "bg-amber-100 text-amber-900 border-amber-200/80",
  red: "bg-red-100 text-red-900 border-red-200/80",
  green: "bg-emerald-100 text-emerald-900 border-emerald-200/80",
};

export function getTaskPillVariant(task: CalendarTask, referenceDate = new Date()): TaskPillVariant {
  if (task.status === "Done") return "green";

  if (task.dueAt) {
    const due = new Date(task.dueAt);
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "red";
    if (task.priority >= 3) return "red";
  }

  if (task.priority >= 3) return "red";
  if (task.status === "In Progress" || task.status === "Review") return "yellow";
  return "yellow";
}

export function getPillClassName(variant: TaskPillVariant): string {
  return PILL_STYLES[variant];
}

export function dayHasDeadlineAlert(
  dayTasks: CalendarTask[],
  referenceDate = new Date()
): boolean {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return dayTasks.some((t) => {
    if (t.status === "Done" || !t.dueAt) return false;
    const due = new Date(t.dueAt);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  });
}
