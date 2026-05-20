"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./EmojiPicker";
import {
  COMMENT_FILE_ACCEPT,
  createPendingFile,
  MAX_COMMENT_FILES,
  MAX_COMMENT_FILE_SIZE,
  revokePendingFiles,
  type PendingFile,
} from "../lib/pending-files";

interface CommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  pendingFiles: PendingFile[];
  onPendingFilesChange: (files: PendingFile[]) => void;
  onSubmit: () => void;
  submitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}

export function CommentComposer({
  value,
  onChange,
  pendingFiles,
  onPendingFilesChange,
  onSubmit,
  submitting = false,
  placeholder = "Viết bình luận... (Hỗ trợ Markdown)",
  submitLabel = "Gửi Bình Luận",
  compact = false,
}: CommentComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const pendingRef = useRef(pendingFiles);
  pendingRef.current = pendingFiles;
  useEffect(() => {
    return () => revokePendingFiles(pendingRef.current);
  }, []);

  const canSubmit = (value.trim().length > 0 || pendingFiles.length > 0) && !submitting;

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + emoji + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      onChange(value + emoji);
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setFileError(null);

    const next = [...pendingFiles];
    for (let i = 0; i < list.length; i++) {
      if (next.length >= MAX_COMMENT_FILES) {
        setFileError(`Tối đa ${MAX_COMMENT_FILES} tệp mỗi bình luận`);
        break;
      }
      const file = list[i];
      if (file.size > MAX_COMMENT_FILE_SIZE) {
        setFileError(`"${file.name}" vượt quá 10MB`);
        continue;
      }
      next.push(createPendingFile(file));
    }
    onPendingFilesChange(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    const removed = pendingFiles.find((f) => f.id === id);
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onPendingFilesChange(pendingFiles.filter((f) => f.id !== id));
  };

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80",
        compact && "text-sm"
      )}
    >
      <textarea
        ref={textareaRef}
        className={cn(
          "w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0",
          compact ? "min-h-[64px]" : "min-h-[88px]"
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />

      {pendingFiles.length > 0 ? (
        <section className="flex flex-wrap gap-2 border-t border-slate-200/80 px-3 py-2">
          {pendingFiles.map((pf) => (
            <section
              key={pf.id}
              className="group relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              {pf.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pf.previewUrl}
                  alt={pf.file.name}
                  className="h-20 w-20 object-cover"
                />
              ) : (
                <section className="flex h-20 w-28 flex-col items-center justify-center gap-1 px-2">
                  <FileText size={20} className="text-blue-600" />
                  <span className="line-clamp-2 text-center text-[10px] text-slate-600">
                    {pf.file.name}
                  </span>
                </section>
              )}
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-0.5 text-white opacity-90 hover:bg-slate-900"
                onClick={() => removeFile(pf.id)}
                aria-label="Xóa tệp"
              >
                <X size={12} />
              </button>
            </section>
          ))}
        </section>
      ) : null}

      {fileError ? <p className="px-4 pb-1 text-xs text-red-600">{fileError}</p> : null}

      <section className="relative flex items-center justify-between gap-2 border-t border-slate-200 bg-white/60 px-3 py-2">
        <section className="relative flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="Biểu tượng cảm xúc"
            onClick={() => setEmojiOpen((o) => !o)}
          >
            <Smile size={20} />
          </button>
          <EmojiPicker
            open={emojiOpen}
            onClose={() => setEmojiOpen(false)}
            onSelect={insertEmoji}
          />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            title="Đính kèm tệp"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept={COMMENT_FILE_ACCEPT}
            onChange={(e) => addFiles(e.target.files)}
          />
        </section>

        <Button
          type="button"
          size="sm"
          className={cn(
            "gap-2 rounded-lg px-4 font-medium",
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-500 hover:bg-slate-200"
          )}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {submitLabel}
        </Button>
      </section>
    </article>
  );
}
