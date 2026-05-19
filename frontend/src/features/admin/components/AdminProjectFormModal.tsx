"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectApi } from "@/src/features/projects/api/project.api";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import { getApiErrorMessage } from "@/src/lib/api-error";
import type { ProjectSummary } from "@/src/types/api.types";

const STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"] as const;

interface AdminProjectFormModalProps {
  open: boolean;
  project: ProjectSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AdminProjectFormModal({
  open,
  project,
  onClose,
  onSaved,
}: AdminProjectFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !project) return;
    setName(project.projectName);
    setDescription(project.projectDescription ?? "");
    setStatus(project.status);
    setError(null);
  }, [open, project]);

  if (!open || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await projectApi.updateProject(project.projectId, {
        projectName: name.trim(),
        projectDescription: description.trim() || undefined,
      });
      if (status !== project.status) {
        await projectApi.updateStatus(project.projectId, status);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không cập nhật được dự án"));
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
        className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">Sửa dự án</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400">
            <X size={18} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <section className="space-y-1.5">
            <label className="text-sm font-semibold">Tên dự án</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </section>
          <section className="space-y-1.5">
            <label className="text-sm font-semibold">Mô tả</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>
          <section className="space-y-1.5">
            <label className="text-sm font-semibold">Trạng thái</label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </section>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <section className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Lưu
            </Button>
          </section>
        </form>
      </article>
    </section>
  );
}
