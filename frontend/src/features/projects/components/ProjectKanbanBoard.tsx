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
  canDragDrop?: boolean;
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
  onAddTask,
}: {
  columns: KanbanColumnData[];
  canDragDrop: boolean;
  onAddTask: (status: KanbanStatus) => void;
}) {
  return (
    <section className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          column={column}
          canDragDrop={canDragDrop}
          onAddTask={onAddTask}
        />
      ))}
    </section>
  );
}

export function ProjectKanbanBoard({
  projectId,
  columns: initialColumns,
  canDragDrop = false,
}: ProjectKanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(() =>
    normalizeKanbanColumns(initialColumns)
  );
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLocalChanges = useRef(false);

  useEffect(() => {
    if (hasLocalChanges.current) return;
    setColumns(normalizeKanbanColumns(initialColumns));
  }, [initialColumns]);

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
    if (found) setActiveTask(found.task);
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
    [canDragDrop, columns]
  );

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleAddTask = (status: KanbanStatus) => {
    void status;
    void projectId;
  };

  return (
    <section>
      {!canDragDrop ? (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <Lock size={16} className="shrink-0" />
          Chỉ Admin dự án hoặc Lead mới có thể kéo thả để đổi trạng thái task.
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
              onAddTask={handleAddTask}
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
            onAddTask={handleAddTask}
          />
        )}
      </section>
    </section>
  );
}
