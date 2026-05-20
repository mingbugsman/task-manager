import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarTask } from "@/src/features/calendar/hooks/useCalendarTasks";
import {
  getPillClassName,
  getTaskPillVariant,
} from "@/src/features/calendar/lib/task-calendar-style";

interface CalendarTaskPillProps {
  task: CalendarTask;
  compact?: boolean;
}

export function CalendarTaskPill({ task, compact }: CalendarTaskPillProps) {
  const variant = getTaskPillVariant(task);

  return (
    <Link
      href={`/tasks/${task.taskId}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "block w-full rounded-md border px-1.5 py-1 transition-opacity hover:opacity-90",
        getPillClassName(variant),
        compact ? "text-[10px]" : "text-[11px]"
      )}
    >
      <p className="truncate font-semibold leading-tight">{task.taskName}</p>
      <p className="truncate opacity-75">{task.projectName}</p>
    </Link>
  );
}
