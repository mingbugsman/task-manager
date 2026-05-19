"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectApi } from "@/src/features/projects/api/project.api";
import { getApiErrorMessage } from "@/src/lib/api-error";
interface EditProjectModalProps {
  open: boolean;
  project: {
    projectId: number;
    projectName: string;
    projectDescription?: string;
  } | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditProjectModal({ open, project, onClose, onUpdated }: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !project) return;
    setName(project.projectName);
    setDescription(project.projectDescription ?? "");
    setError(null);
  }, [open, project]);

  if (!open || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên dự án");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await projectApi.updateProject(project.projectId, {
        projectName: trimmed,
        projectDescription: description.trim() || undefined,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không cập nhật được dự án."));
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
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4">
          <section className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FolderKanban size={20} />
            </span>
            <section>
              <h2 className="text-lg font-bold text-slate-900">Sửa dự án</h2>
              <p className="text-xs text-slate-500">Cập nhật tên và mô tả</p>
            </section>
          </section>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-600"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <section className="space-y-1.5">
            <label htmlFor="edit-project-name" className="text-sm font-semibold text-slate-700">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-project-name"
              className="rounded-xl border-slate-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              autoFocus
            />
          </section>

          <section className="space-y-1.5">
            <label htmlFor="edit-project-desc" className="text-sm font-semibold text-slate-700">
              Mô tả
            </label>
            <textarea
              id="edit-project-desc"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <section className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </section>
        </form>
      </article>
    </section>
  );
}
