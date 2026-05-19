"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { labelApi, type ProjectLabel } from "@/src/features/labels/api/label.api";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { getApiErrorMessage } from "@/src/lib/api-error";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

interface ProjectLabelsPanelProps {
  projectId: number;
  canManage?: boolean;
}

export function ProjectLabelsPanel({ projectId, canManage = false }: ProjectLabelsPanelProps) {
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [colorCode, setColorCode] = useState(PRESET_COLORS[4]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteConfirm = useDeleteConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await labelApi.getByProject(projectId);
      setLabels(res.data.data ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh sách nhãn."));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên nhãn");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await labelApi.create(projectId, {
        labelName: trimmed,
        colorCode,
      });
      setName("");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tạo được nhãn."));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (label: ProjectLabel) => {
    deleteConfirm.ask({
      title: "Xóa nhãn",
      description: "Nhãn sẽ bị gỡ khỏi mọi tác vụ đang dùng.",
      details: [{ label: "Tên nhãn", value: label.labelName }],
      onConfirm: async () => {
        await labelApi.delete(label.labelId);
        await load();
      },
    });
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <section className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Tag size={22} />
          </span>
          <section>
            <h2 className="text-lg font-bold text-slate-900">Nhãn dự án</h2>
            <p className="text-sm text-slate-500">
              Tạo nhãn tại đây, sau đó gán cho tác vụ qua menu ⋯ trên thẻ Kanban → Gán nhãn.
            </p>
          </section>
        </section>
      </header>

      {canManage ? (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-violet-100 bg-violet-50/40 p-4"
        >
          <p className="mb-3 text-sm font-semibold text-slate-700">Tạo nhãn mới</p>
          <section className="flex flex-wrap items-end gap-3">
            <section className="min-w-[12rem] flex-1 space-y-1">
              <label htmlFor="label-name" className="text-xs font-medium text-slate-500">
                Tên nhãn
              </label>
              <Input
                id="label-name"
                className="rounded-xl bg-white"
                placeholder="VD: Bug, Feature, Urgent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </section>
            <section className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Màu</span>
              <section className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-lg border-2 transition-transform",
                      colorCode === c ? "scale-110 border-slate-800" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Màu ${c}`}
                    onClick={() => setColorCode(c)}
                  />
                ))}
              </section>
            </section>
            <Button
              type="submit"
              className="gap-2 rounded-xl bg-violet-600 hover:bg-violet-700"
              disabled={creating}
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Thêm nhãn
            </Button>
          </section>
        </form>
      ) : (
        <p className="mb-4 text-sm text-slate-500">
          Chỉ chủ dự án / trưởng nhóm / thành viên mới tạo được nhãn mới.
        </p>
      )}

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <section className="flex justify-center py-12">
          <Loader2 className="animate-spin text-violet-600" size={28} />
        </section>
      ) : labels.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Chưa có nhãn nào. {canManage ? "Dùng form phía trên để tạo nhãn đầu tiên." : ""}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {labels.map((label) => (
            <li
              key={label.labelId}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold"
                style={{
                  borderColor: label.colorCode ?? "#808080",
                  backgroundColor: `${label.colorCode ?? "#808080"}22`,
                  color: label.colorCode ?? "#334155",
                }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: label.colorCode ?? "#808080" }}
                />
                {label.labelName}
              </span>
              {canManage ? (
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Xóa ${label.labelName}`}
                  onClick={() => handleDelete(label)}
                >
                  <Trash2 size={16} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <DeleteConfirmDialog
        open={deleteConfirm.open}
        title={deleteConfirm.request?.title ?? ""}
        description={deleteConfirm.request?.description}
        details={deleteConfirm.request?.details}
        loading={deleteConfirm.loading}
        errorMessage={deleteConfirm.errorMessage}
        onConfirm={deleteConfirm.confirm}
        onCancel={deleteConfirm.close}
      />
    </article>
  );
}
