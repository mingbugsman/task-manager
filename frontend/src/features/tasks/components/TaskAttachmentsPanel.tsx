"use client";

import { useRef, useState } from "react";
import { Download, FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { attachmentApi } from "@/src/features/attachments/api/attachment.api";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { formatDate, formatFileSize } from "@/src/lib/format";
import type { Attachment } from "@/src/types/api.types";

const ACCEPT =
  ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,image/*,application/pdf";

const MAX_SIZE_MB = 10;

interface TaskAttachmentsPanelProps {
  taskId: number;
  attachments: Attachment[];
  onChange: () => void;
}

export function TaskAttachmentsPanel({
  taskId,
  attachments,
  onChange,
}: TaskAttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useCurrentUser();
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deleteConfirm = useDeleteConfirm();

  const canDelete = (a: Attachment) =>
    session?.isAdmin ||
    (user?.userId != null && a.uploadedBy != null && String(a.uploadedBy) === String(user.userId));

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File tối đa ${MAX_SIZE_MB}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await attachmentApi.upload("tasks", taskId, file);
      onChange();
    } catch {
      setError("Không tải lên được file. Kiểm tra định dạng (ảnh, PDF, Word, TXT).");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = (attachment: Attachment) => {
    deleteConfirm.ask({
      title: "Xóa tệp đính kèm",
      description: "Tệp sẽ bị xóa vĩnh viễn khỏi tác vụ.",
      details: [
        { label: "Tên tệp", value: attachment.fileName },
        {
          label: "Kích thước",
          value: attachment.fileSize != null ? formatFileSize(attachment.fileSize) : "—",
        },
        {
          label: "Ngày tải lên",
          value: attachment.createdAt ? formatDate(attachment.createdAt) : "—",
        },
        { label: "Tác vụ", value: `#${taskId}` },
      ],
      onConfirm: async () => {
        setDeletingId(attachment.attachmentId);
        setError(null);
        try {
          await attachmentApi.delete(attachment.attachmentId);
          onChange();
        } catch {
          setError("Không xóa được file");
          throw new Error("delete failed");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <section className="mb-4 flex items-center justify-between gap-2">
        <section className="flex items-center gap-2">
          <Paperclip size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Tệp đính kèm</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {attachments.length}
          </span>
        </section>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg border-slate-200 text-xs"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Tải lên
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT}
          onChange={(e) => handleUpload(e.target.files)}
        />
      </section>

      {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}

      {attachments.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400 transition-colors hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-600"
        >
          <Upload size={24} className="mb-2 opacity-50" />
          Chưa có file — bấm để tải lên
          <span className="mt-1 text-xs">Ảnh, PDF, Word, TXT · tối đa {MAX_SIZE_MB}MB</span>
        </button>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li
              key={a.attachmentId}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
            >
              <FileText size={18} className="shrink-0 text-blue-600" />
              <section className="min-w-0 flex-1">
                <a
                  href={a.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-blue-600 hover:underline"
                >
                  {a.fileName}
                </a>
                <p className="text-xs text-slate-400">
                  {formatFileSize(a.fileSize)}
                  {a.createdAt ? ` · ${formatDate(a.createdAt)}` : ""}
                </p>
              </section>
              <section className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <a
                  href={attachmentApi.downloadUrl(a.attachmentId)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-blue-600"
                  title="Tải xuống"
                >
                  <Download size={15} />
                </a>
                {canDelete(a) ? (
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-red-600"
                    title="Xóa"
                    disabled={deletingId === a.attachmentId}
                    onClick={() => handleDelete(a)}
                  >
                    {deletingId === a.attachmentId ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                ) : null}
              </section>
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
        onConfirm={deleteConfirm.confirm}
        onCancel={deleteConfirm.close}
      />
    </article>
  );
}
