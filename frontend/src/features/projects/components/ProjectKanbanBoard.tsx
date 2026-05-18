"use client";

import Link from "next/link";
import { Calendar, GripVertical } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate, formatPriority } from "@/src/lib/format";
import type { BoardColumn } from "@/src/types/api.types";

const COLUMN_THEME: Record<string, { header: string; count: string; ring: string }> = {
  Todo: {
    header: "bg-slate-100 text-slate-700",
    count: "bg-slate-200 text-slate-600",
    ring: "ring-slate-200",
  },
  "In Progress": {
    header: "bg-blue-50 text-blue-800",
    count: "bg-blue-100 text-blue-700",
    ring: "ring-blue-100",
  },
  Review: {
    header: "bg-amber-50 text-amber-800",
    count: "bg-amber-100 text-amber-700",
    ring: "ring-amber-100",
  },
  Done: {
    header: "bg-emerald-50 text-emerald-800",
    count: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-100",
  },
};

function priorityVariant(priority: number) {
  if (priority >= 3) return "high";
  if (priority === 2) return "medium";
  return "low";
}

interface ProjectKanbanBoardProps {
  columns: BoardColumn[];
}

export function ProjectKanbanBoard({ columns }: ProjectKanbanBoardProps) {
  return (
    <section className="overflow-x-auto pb-2">
      <section className="flex min-w-max gap-4">
        {columns.map((column) => {
          const theme = COLUMN_THEME[column.status] ?? COLUMN_THEME.Todo;

          return (
            <section
              key={column.status}
              className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/50"
            >
              <header
                className={cn(
                  "flex items-center justify-between rounded-t-2xl px-4 py-3",
                  theme.header
                )}
              >
                <span className="text-sm font-bold">{column.displayName}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    theme.count
                  )}
                >
                  {column.taskCount}
                </span>
              </header>

              <ul className="flex max-h-[calc(100vh-320px)] min-h-[120px] flex-col gap-2 overflow-y-auto p-3">
                {column.tasks.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-8 text-center text-xs text-slate-400">
                    Không có tác vụ
                  </li>
                ) : (
                  column.tasks.map((task) => (
                    <li key={task.taskId}>
                      <Link
                        href={`/tasks/${task.taskId}`}
                        className={cn(
                          "group block rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md",
                          theme.ring
                        )}
                      >
                        <section className="mb-2 flex items-start gap-2">
                          <GripVertical
                            size={14}
                            className="mt-0.5 shrink-0 text-slate-300 opacity-0 group-hover:opacity-100"
                          />
                          <p className="flex-1 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600">
                            {task.taskName}
                          </p>
                        </section>

                        {task.labels && task.labels.length > 0 ? (
                          <section className="mb-2 flex flex-wrap gap-1">
                            {task.labels.slice(0, 3).map((label) => (
                              <span
                                key={label}
                                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {label}
                              </span>
                            ))}
                          </section>
                        ) : null}

                        <footer className="flex items-center justify-between gap-2">
                          <Badge variant={priorityVariant(task.priority)} className="text-[10px]">
                            {formatPriority(task.priority)}
                          </Badge>
                          <section className="flex items-center gap-2">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Calendar size={11} />
                                {formatDate(task.dueDate)}
                              </span>
                            ) : null}
                            {task.assigneeUsername ? (
                              <Avatar
                                name={task.assigneeUsername}
                                src={task.assigneeAvatarUrl}
                                size="sm"
                              />
                            ) : null}
                          </section>
                        </footer>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </section>
    </section>
  );
}
