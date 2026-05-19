"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Lock } from "lucide-react";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { KanbanTaskCardContent } from "./kanban/KanbanTaskCard";
import { taskApi } from "@/src/features/tasks/api/task.api";
import {
  normalizeKanbanColumns,
  parseTaskDragId,
  resolveDropStatus,
  type KanbanColumnData,
  type KanbanStatus,
} from "@/src/features/projects/lib/kanban-utils";
import type { BoardColumn, BoardTask } from "@/src/types/api.types";

interface ProjectKanbanBoardProps {
  projectId: number;
  columns: BoardColumn[];
  /** Tăng khi parent tải lại board — reset cột Kanban (sau sửa trạng thái task). */
  syncKey?: number;
  canDragDrop?: boolean;
  canDragTask?: (task: BoardTask) => boolean;
  canEditTask?: boolean | ((task: BoardTask) => boolean);
  onEditTask?: (task: BoardTask) => void;
  canManageLabels?: boolean | ((task: BoardTask) => boolean);
  onManageLabels?: (task: BoardTask) => void;
  canDeleteTask?: boolean;
  onDeleteTask?: (task: BoardTask) => void;
  onAddTask?: () => void;
}

function findTaskInColumns(
  cols: KanbanColumnData[],
  taskId: number
): { status: KanbanStatus; task: BoardTask } | null {
  for (const col of cols) {
    const task = col.tasks.find((t) => t.taskId === taskId);
    if (task) return { status: col.status, task };
  }
  return null;
}

function moveTaskBetweenColumns(
  cols: KanbanColumnData[],
  taskId: number,
  toStatus: KanbanStatus
): KanbanColumnData[] {
  let moved: BoardTask | null = null;

  const stripped = cols.map((col) => {
    const found = col.tasks.find((t) => t.taskId === taskId);
    if (found) moved = found;
    const tasks = col.tasks.filter((t) => t.taskId !== taskId);
    return { ...col, tasks, taskCount: tasks.length };
  });

  if (!moved) return cols;

  return stripped.map((col) => {
    if (col.status !== toStatus) return col;
    const tasks = [...col.tasks, moved!];
    return { ...col, tasks, taskCount: tasks.length };
  });
}

function KanbanColumnsGrid({
  columns,
  canDragDrop,
  canDragTask,
  onAddTask,
  canEditTask,
  onEditTask,
  canManageLabels,
  onManageLabels,
  canDeleteTask,
  onDeleteTask,
}: {
  columns: KanbanColumnData[];
  canDragDrop: boolean;
  canDragTask?: (task: BoardTask) => boolean;
  onAddTask: (status: KanbanStatus) => void;
  canEditTask?: boolean | ((task: BoardTask) => boolean);
  onEditTask?: (task: BoardTask) => void;
  canManageLabels?: boolean | ((task: BoardTask) => boolean);
  onManageLabels?: (task: BoardTask) => void;
  canDeleteTask?: boolean;
  onDeleteTask?: (task: BoardTask) => void;
}) {
  return (
    <section className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          column={column}
          canDragDrop={canDragDrop}
          canDragTask={canDragTask}
          onAddTask={onAddTask}
          canEditTask={canEditTask}
          onEditTask={onEditTask}
          canManageLabels={canManageLabels}
          onManageLabels={onManageLabels}
          canDeleteTask={canDeleteTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </section>
  );
}

export function ProjectKanbanBoard({
  projectId,
  columns: initialColumns,
  syncKey = 0,
  canDragDrop = false,
  canDragTask,
  canEditTask = false,
  onEditTask,
  canManageLabels = false,
  onManageLabels,
  canDeleteTask = false,
  onDeleteTask,
  onAddTask,
}: ProjectKanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(() =>
    normalizeKanbanColumns(initialColumns)
  );
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLocalChanges = useRef(false);

  useEffect(() => {
    hasLocalChanges.current = false;
    setColumns(normalizeKanbanColumns(initialColumns));
  }, [initialColumns, syncKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!canDragDrop) return;
    setError(null);
    const taskId = parseTaskDragId(String(event.active.id));
    if (taskId == null) return;
    const found = findTaskInColumns(columns, taskId);
    if (!found) return;
    if (canDragTask && !canDragTask(found.task)) {
      setError("Bạn chỉ có thể kéo thả tác vụ được giao cho mình.");
      return;
    }
    setActiveTask(found.task);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!canDragDrop) return;

      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = parseTaskDragId(String(active.id));
      const newStatus = resolveDropStatus(over.id, over.data.current, columns);

      if (taskId == null || !newStatus) return;

      const current = findTaskInColumns(columns, taskId);
      if (!current || current.status === newStatus) return;

      if (canDragTask && !canDragTask(current.task)) {
        setError("Bạn chỉ có thể đổi trạng thái tác vụ được giao cho mình.");
        return;
      }

      const previous = columns;
      hasLocalChanges.current = true;
      setColumns((cols) => moveTaskBetweenColumns(cols, taskId, newStatus));
      setUpdating(true);
      setError(null);

      try {
        await taskApi.updateStatus(taskId, newStatus);
      } catch {
        hasLocalChanges.current = false;
        setColumns(previous);
        setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
      } finally {
        setUpdating(false);
      }
    },
    [canDragDrop, canDragTask, columns]
  );

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleAddTask = (_status: KanbanStatus) => {
    void projectId;
    onAddTask?.();
  };

  return (
    <section>
      {!canDragDrop ? (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <Lock size={16} className="shrink-0" />
          Bạn không có quyền kéo thả task trên bảng này.
        </p>
      ) : canDragTask ? (
        <p className="mb-3 text-sm text-slate-500">
          Thành viên chỉ kéo thả được task được giao cho mình.
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className={updating ? "pointer-events-none opacity-80" : undefined}>
        {canDragDrop ? (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <KanbanColumnsGrid
              columns={columns}
              canDragDrop={canDragDrop}
              canDragTask={canDragTask}
              onAddTask={handleAddTask}
              canEditTask={canEditTask}
              onEditTask={onEditTask}
              canManageLabels={canManageLabels}
              onManageLabels={onManageLabels}
              canDeleteTask={canDeleteTask}
              onDeleteTask={onDeleteTask}
            />
            <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
              {activeTask ? (
                <section className="w-[288px] cursor-grabbing shadow-2xl">
                  <KanbanTaskCardContent task={activeTask} className="rotate-1 ring-2 ring-blue-400" />
                </section>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <KanbanColumnsGrid
            columns={columns}
            canDragDrop={false}
            canDragTask={canDragTask}
            onAddTask={handleAddTask}
            canEditTask={canEditTask}
            onEditTask={onEditTask}
            canManageLabels={canManageLabels}
            onManageLabels={onManageLabels}
            canDeleteTask={canDeleteTask}
            onDeleteTask={onDeleteTask}
          />
        )}
      </section>
    </section>
  );
}
