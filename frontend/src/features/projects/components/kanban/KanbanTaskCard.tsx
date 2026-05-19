"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPriority } from "@/src/lib/format";
import {
  formatKanbanDueDate,
  getLabelClass,
  isTaskOverdue,
  taskDragId,
  type KanbanStatus,
  type TaskDragData,
} from "@/src/features/projects/lib/kanban-utils";
import type { BoardTask } from "@/src/types/api.types";

function priorityVariant(priority: number) {
  if (priority >= 3) return "high";
  if (priority === 2) return "medium";
  return "low";
}

interface KanbanTaskCardContentProps {
  task: BoardTask;
  className?: string;
  onTitleClick?: () => void;
}

export function KanbanTaskCardContent({ task, className, onTitleClick }: KanbanTaskCardContentProps) {
  const router = useRouter();
  const overdue = isTaskOverdue(task);

  return (
    <article className={cn("rounded-xl border border-slate-100 bg-white p-3 shadow-sm", className)}>
      <header className="mb-2 flex items-start gap-2">
        <button
          type="button"
          className="flex-1 text-left text-sm font-bold leading-snug text-slate-900 hover:text-blue-600"
          onClick={onTitleClick ?? (() => router.push(`/tasks/${task.taskId}`))}
        >
          {task.taskName}
        </button>
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100"
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Tùy chọn"
        >
          <MoreVertical size={16} />
        </button>
      </header>

      {task.labels && task.labels.length > 0 ? (
        <section className="mb-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                getLabelClass(label)
              )}
            >
              {label}
            </span>
          ))}
        </section>
      ) : null}

      <section className="mb-3 flex flex-wrap gap-1.5">
        <Badge variant={priorityVariant(task.priority)} className="text-[10px]">
          {formatPriority(task.priority)}
        </Badge>
        {overdue ? (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
            <Clock size={10} />
            Overdue
          </span>
        ) : null}
      </section>

      <footer className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2">
        <section className="flex min-w-0 items-center gap-1.5">
          {task.assigneeUsername ? (
            <>
              <Avatar name={task.assigneeUsername} src={task.assigneeAvatarUrl} size="sm" />
              <span className="truncate text-[11px] font-medium text-slate-600">
                {task.assigneeUsername}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">Chưa giao</span>
          )}
        </section>
        {task.dueDate ? (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-[11px]",
              overdue ? "font-medium text-red-500" : "text-slate-500"
            )}
          >
            <Calendar size={12} />
            {formatKanbanDueDate(task.dueDate)}
          </span>
        ) : null}
      </footer>
    </article>
  );
}

interface KanbanTaskCardProps {
  task: BoardTask;
  columnStatus: KanbanStatus;
  draggable?: boolean;
}

export function KanbanTaskCard({ task, columnStatus, draggable = false }: KanbanTaskCardProps) {
  if (!draggable) {
    return (
      <KanbanTaskCardContent task={task} className="transition-shadow hover:shadow-md" />
    );
  }

  const dragData: TaskDragData = { type: "task", task, status: columnStatus };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: taskDragId(task.taskId),
    data: dragData,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <section ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <KanbanTaskCardContent
        task={task}
        className={cn(
          "cursor-grab touch-none transition-shadow active:cursor-grabbing",
          isDragging && "opacity-30",
          !isDragging && "hover:shadow-md"
        )}
      />
    </section>
  );
}
