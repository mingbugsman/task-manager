"use client";

import { useEffect, useState } from "react";
import { ListTodo, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRIORITY_LABELS } from "@/src/lib/constants";
import { taskApi } from "@/src/features/tasks/api/task.api";
import type { ProjectMember } from "@/src/types/api.types";

interface CreateTaskModalProps {
  open: boolean;
  projectId: number;
  projectName?: string;
  members: ProjectMember[];
  onClose: () => void;
  onCreated: () => void;
}

const PRIORITIES = [1, 2, 3] as const;

export function CreateTaskModal({
  open,
  projectId,
  projectName,
  members,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState<number>(2);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTaskName("");
    setTaskDescription("");
    setPriority(2);
    setAssigneeId("");
    setDueAt("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = taskName.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên tác vụ");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await taskApi.createTask(projectId, {
        taskName: trimmed,
        taskDescription: taskDescription.trim() || undefined,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      onCreated();
      onClose();
    } catch {
      setError("Không tạo được tác vụ. Kiểm tra người được giao phải là thành viên dự án.");
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
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <section className="flex items-start justify-between gap-3">
            <section className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <ListTodo size={22} />
              </span>
              <section>
                <h2 className="text-lg font-bold">Tạo tác vụ mới</h2>
                {projectName ? (
                  <p className="mt-0.5 text-sm text-blue-100">Dự án: {projectName}</p>
                ) : null}
              </section>
            </section>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </section>
        </header>

        <form id="create-task-form" onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <section className="space-y-1.5">
            <label htmlFor="task-name" className="text-sm font-semibold text-slate-700">
              Tên tác vụ <span className="text-red-500">*</span>
            </label>
            <Input
              id="task-name"
              className="rounded-xl"
              placeholder="VD: Thiết kế giao diện trang đăng nhập"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              maxLength={255}
              autoFocus
            />
          </section>

          <section className="space-y-1.5">
            <label htmlFor="task-desc" className="text-sm font-semibold text-slate-700">
              Mô tả chi tiết
            </label>
            <textarea
              id="task-desc"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Yêu cầu, tiêu chí hoàn thành, link tài liệu..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <section className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Độ ưu tiên</label>
              <section className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                      priority === p
                        ? p === 3
                          ? "border-red-300 bg-red-50 text-red-700"
                          : p === 1
                            ? "border-slate-300 bg-slate-100 text-slate-700"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </section>
            </section>

            <section className="space-y-1.5">
              <label htmlFor="task-due" className="text-sm font-semibold text-slate-700">
                Hạn hoàn thành
              </label>
              <Input
                id="task-due"
                type="datetime-local"
                className="rounded-xl"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </section>
          </section>

          <section className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-sm font-semibold text-slate-700">
              Giao cho
            </label>
            <select
              id="task-assignee"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">— Chưa giao —</option>
              {members.map((m) => {
                const id = m.user?.userId ?? m.userId;
                const label = m.user?.userName ?? m.userName ?? `User #${id}`;
                if (id == null) return null;
                return (
                  <option key={String(id)} value={String(id)}>
                    {label}
                  </option>
                );
              })}
            </select>
          </section>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-task-form"
            className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Tạo tác vụ
          </Button>
        </footer>
      </article>
    </section>
  );
}
