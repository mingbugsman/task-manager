"use client";

import { useDroppable } from "@dnd-kit/core";
import { CheckCircle2, ClipboardList, Eye, Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanTaskCard } from "./KanbanTaskCard";
import {
  columnDropId,
  type ColumnDropData,
  type KanbanColumnData,
  type KanbanStatus,
} from "@/src/features/projects/lib/kanban-utils";

const COLUMN_META: Record<
  KanbanStatus,
  {
    icon: typeof ClipboardList;
    countClass: string;
    iconClass: string;
  }
> = {
  Todo: {
    icon: ClipboardList,
    countClass: "bg-red-100 text-red-600",
    iconClass: "text-slate-500",
  },
  "In Progress": {
    icon: Zap,
    countClass: "bg-orange-100 text-orange-600",
    iconClass: "text-orange-500",
  },
  Review: {
    icon: Eye,
    countClass: "bg-violet-100 text-violet-600",
    iconClass: "text-violet-500",
  },
  Done: {
    icon: CheckCircle2,
    countClass: "bg-emerald-100 text-emerald-600",
    iconClass: "text-emerald-500",
  },
};

interface KanbanColumnProps {
  column: KanbanColumnData;
  canDragDrop?: boolean;
  onAddTask?: (status: KanbanStatus) => void;
}

export function KanbanColumn({ column, canDragDrop = false, onAddTask }: KanbanColumnProps) {
  const dropData: ColumnDropData = { type: "column", status: column.status };

  const { setNodeRef, isOver } = useDroppable({
    id: columnDropId(column.status),
    data: dropData,
  });

  const meta = COLUMN_META[column.status];
  const Icon = meta.icon;

  return (
    <section className="flex w-[300px] shrink-0 flex-col">
      <header className="mb-3 flex items-center gap-2 px-1">
        <Icon size={18} className={meta.iconClass} />
        <h3 className="flex-1 text-sm font-bold text-slate-800">{column.displayName}</h3>
        <span
          className={cn(
            "flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold",
            meta.countClass
          )}
        >
          {column.tasks.length}
        </span>
        <button
          type="button"
          onClick={() => onAddTask?.(column.status)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Thêm task"
        >
          <Plus size={18} />
        </button>
      </header>

      <section
        ref={setNodeRef}
        className={cn(
          "flex min-h-[400px] flex-1 flex-col gap-2 rounded-2xl p-2 transition-all",
          isOver
            ? "bg-blue-50 ring-2 ring-blue-400 ring-inset"
            : "bg-slate-100/70"
        )}
      >
        {column.tasks.length === 0 && !isOver ? (
          <p className="py-8 text-center text-xs text-slate-400">
            {canDragDrop ? "Kéo task vào đây" : "Chưa có task"}
          </p>
        ) : null}

        {column.tasks.map((task) => (
          <KanbanTaskCard
            key={task.taskId}
            task={task}
            columnStatus={column.status}
            draggable={canDragDrop}
          />
        ))}

        <button
          type="button"
          onClick={() => onAddTask?.(column.status)}
          className="mt-auto flex w-full items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-white/50 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-blue-300 hover:bg-white hover:text-blue-600"
        >
          <Plus size={16} />
          Thêm task mới
        </button>
      </section>
    </section>
  );
}
