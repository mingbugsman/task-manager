import type { CSSProperties } from "react";
import { STATUS_LABELS } from "@/src/lib/constants";
import type { BoardColumn, BoardTask, LabelSummary } from "@/src/types/api.types";

export const KANBAN_STATUS_ORDER = ["Todo", "In Progress", "Review", "Done"] as const;

export type KanbanStatus = (typeof KANBAN_STATUS_ORDER)[number];

export interface KanbanColumnData {
  status: KanbanStatus;
  displayName: string;
  taskCount: number;
  tasks: BoardTask[];
}

const STATUS_ID_MAP: Record<KanbanStatus, string> = {
  Todo: "col_todo",
  "In Progress": "col_in_progress",
  Review: "col_review",
  Done: "col_done",
};

const ID_STATUS_MAP: Record<string, KanbanStatus> = Object.fromEntries(
  Object.entries(STATUS_ID_MAP).map(([status, id]) => [id, status as KanbanStatus])
) as Record<string, KanbanStatus>;

export function normalizeKanbanColumns(columns: BoardColumn[]): KanbanColumnData[] {
  const byStatus = new Map(columns.map((c) => [c.status, c]));

  return KANBAN_STATUS_ORDER.map((status) => {
    const col = byStatus.get(status);
    const tasks = col?.tasks ?? [];
    return {
      status,
      displayName: col?.displayName ?? STATUS_LABELS[status] ?? status,
      taskCount: tasks.length,
      tasks,
    };
  });
}

export function isTaskOverdue(task: BoardTask): boolean {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function formatKanbanDueDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

const LABEL_PALETTE = [
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
];

export function getLabelClass(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return LABEL_PALETTE[Math.abs(hash) % LABEL_PALETTE.length];
}

/** Chuẩn hóa nhãn từ API board (object) hoặc bản cũ (chuỗi tên). */
export function normalizeBoardTaskLabels(
  labels?: BoardTask["labels"] | string[]
): LabelSummary[] {
  if (!labels?.length) return [];
  return labels.map((item) => {
    if (typeof item === "string") {
      return { labelId: 0, labelName: item };
    }
    return {
      labelId: item.labelId,
      labelName: item.labelName,
      colorCode: item.colorCode,
    };
  });
}

/** Màu chip nhãn — khớp tab Nhãn / modal Gán nhãn. */
export function getLabelChipStyle(colorCode?: string | null): CSSProperties | undefined {
  if (!colorCode?.trim()) return undefined;
  const color = colorCode.trim();
  return {
    borderColor: color,
    backgroundColor: `${color}22`,
    color,
  };
}

export function taskDragId(taskId: number): string {
  return `task_${taskId}`;
}

export function columnDropId(status: KanbanStatus): string {
  return STATUS_ID_MAP[status];
}

export function parseColumnDropId(id: string): KanbanStatus | null {
  return ID_STATUS_MAP[id] ?? null;
}

export function parseTaskDragId(id: string): number | null {
  if (!id.startsWith("task_")) return null;
  const n = Number(id.slice(5));
  return Number.isNaN(n) ? null : n;
}

export type ColumnDropData = { type: "column"; status: KanbanStatus };
export type TaskDragData = { type: "task"; task: BoardTask; status: KanbanStatus };

export function resolveDropStatus(
  overId: string | number,
  overData: unknown,
  columns: KanbanColumnData[]
): KanbanStatus | null {
  const data = overData as ColumnDropData | TaskDragData | undefined;

  if (data?.type === "column" && data.status) {
    return data.status;
  }

  if (data?.type === "task" && data.status) {
    return data.status;
  }

  const fromColumn = parseColumnDropId(String(overId));
  if (fromColumn) return fromColumn;

  const overTaskId = parseTaskDragId(String(overId));
  if (overTaskId != null) {
    for (const col of columns) {
      if (col.tasks.some((t) => t.taskId === overTaskId)) {
        return col.status;
      }
    }
  }

  return null;
}
