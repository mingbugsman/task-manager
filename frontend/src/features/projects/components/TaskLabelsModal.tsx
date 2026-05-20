"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labelApi, type ProjectLabel } from "@/src/features/labels/api/label.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { getApiErrorMessage } from "@/src/lib/api-error";
import { cn } from "@/lib/utils";
import type { TaskDetail } from "@/src/types/api.types";

const QUICK_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#64748b"];

interface TaskLabelsModalProps {
  open: boolean;
  taskId: number | null;
  projectId: number;
  taskName?: string;
  canCreateLabel?: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function TaskLabelsModal({
  open,
  taskId,
  projectId,
  taskName,
  canCreateLabel = false,
  onClose,
  onUpdated,
}: TaskLabelsModalProps) {
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(QUICK_COLORS[1]);
  const [creatingLabel, setCreatingLabel] = useState(false);

  const loadData = useCallback(async () => {
    if (taskId == null) return;
    setLoading(true);
    setError(null);
    try {
      const [labelsRes, taskRes] = await Promise.all([
        labelApi.getByProject(projectId),
        taskApi.getTaskDetail(taskId),
      ]);
      const projectLabels = labelsRes.data.data ?? [];
      const task = taskRes.data.data as TaskDetail;
      setLabels(projectLabels);
      setTaskDetail(task);
      setSelected(new Set((task.labels ?? []).map((l) => l.labelId)));
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được nhãn."));
    } finally {
      setLoading(false);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    if (!open || taskId == null) return;
    loadData();
  }, [open, taskId, loadData]);

  if (!open || taskId == null) return null;

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLabelName.trim();
    if (!trimmed) return;
    setCreatingLabel(true);
    setError(null);
    try {
      const res = await labelApi.create(projectId, {
        labelName: trimmed,
        colorCode: newLabelColor,
      });
      const created = res.data.data;
      setNewLabelName("");
      await loadData();
      if (created?.labelId) {
        setSelected((prev) => new Set(prev).add(created.labelId));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tạo được nhãn."));
    } finally {
      setCreatingLabel(false);
    }
  };

  const toggle = (labelId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDetail) return;

    setSubmitting(true);
    setError(null);
    try {
      await taskApi.updateTask(taskId, {
        taskName: taskDetail.taskName,
        taskDescription: taskDetail.taskDescription,
        priority: taskDetail.priority,
        status: taskDetail.status,
        assigneeId: taskDetail.assignee?.userId ?? undefined,
        dueAt: taskDetail.dueAt ?? null,
        labelIds: Array.from(selected),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không cập nhật nhãn."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <article
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-4">
          <section className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Tag size={20} />
            </span>
            <section>
              <h2 className="text-lg font-bold text-slate-900">Gán nhãn</h2>
              {taskName ? (
                <p className="line-clamp-1 text-xs text-slate-500">{taskName}</p>
              ) : null}
            </section>
          </section>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {canCreateLabel ? (
            <section className="mb-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/30 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-600">Tạo nhãn nhanh</p>
              <section className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  className="min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  placeholder="Tên nhãn mới"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  maxLength={50}
                />
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "h-6 w-6 rounded-md border-2",
                      newLabelColor === c ? "border-slate-800" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewLabelColor(c)}
                  />
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 rounded-lg"
                  disabled={creatingLabel || !newLabelName.trim()}
                  onClick={handleCreateLabel}
                >
                  {creatingLabel ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Thêm
                </Button>
              </section>
              <p className="mt-2 text-[11px] text-slate-500">
                Hoặc quản lý đầy đủ tại tab <strong>Nhãn</strong> trong chi tiết dự án.
              </p>
            </section>
          ) : null}

          {loading ? (
            <section className="flex justify-center py-10">
              <Loader2 className="animate-spin text-violet-600" size={28} />
            </section>
          ) : labels.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Dự án chưa có nhãn.
              {canCreateLabel
                ? " Dùng form phía trên hoặc tab Nhãn trong dự án để tạo."
                : " Vào tab Nhãn (chủ dự án / thành viên) để tạo nhãn."}
            </p>
          ) : (
            <section className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const active = selected.has(label.labelId);
                return (
                  <button
                    key={label.labelId}
                    type="button"
                    onClick={() => toggle(label.labelId)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-violet-400 bg-violet-100 text-violet-900 ring-2 ring-violet-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    )}
                    style={
                      active && label.colorCode
                        ? {
                            borderColor: label.colorCode,
                            backgroundColor: `${label.colorCode}22`,
                            color: label.colorCode,
                          }
                        : undefined
                    }
                  >
                    {label.labelName}
                  </button>
                );
              })}
            </section>
          )}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <section className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="gap-2 rounded-xl bg-violet-600 hover:bg-violet-700"
              disabled={submitting || loading || !taskDetail}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Lưu nhãn
            </Button>
          </section>
        </form>
      </article>
    </section>
  );
}
