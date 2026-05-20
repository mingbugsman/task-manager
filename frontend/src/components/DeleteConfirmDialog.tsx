"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DeleteDetailItem {
  label: string;
  value: string;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  details?: DeleteDetailItem[];
  confirmLabel?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  title,
  description,
  details,
  confirmLabel = "Xóa",
  loading = false,
  errorMessage,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={onCancel}
    >
      <article
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="flex gap-4 border-b border-slate-100 px-6 py-5">
          <section className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={22} />
          </section>
          <section className="min-w-0 flex-1">
            <h2 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </section>
        </section>

        {details && details.length > 0 ? (
          <section className="space-y-3 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nội dung sẽ bị xóa
            </p>
            <dl className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              {details.map((item) => (
                <section key={item.label} className="grid gap-0.5 sm:grid-cols-[7rem_1fr]">
                  <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
                  <dd className="text-sm text-slate-800 break-words">{item.value}</dd>
                </section>
              ))}
            </dl>
          </section>
        ) : null}

        {errorMessage ? (
          <p className="mx-6 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <section className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={loading}
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl gap-2"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </section>
      </article>
    </section>
  );
}
