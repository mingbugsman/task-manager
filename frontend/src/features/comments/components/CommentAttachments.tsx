"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { attachmentApi } from "@/src/features/attachments/api/attachment.api";
import { formatFileSize } from "@/src/lib/format";
import type { Attachment } from "@/src/types/api.types";

function isImageAttachment(a: Attachment): boolean {
  if (a.fileType?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp)$/i.test(a.fileName);
}

interface CommentAttachmentsProps {
  commentId: number;
  refreshKey?: number;
}

export function CommentAttachments({ commentId, refreshKey }: CommentAttachmentsProps) {
  const [items, setItems] = useState<Attachment[]>([]);

  useEffect(() => {
    let cancelled = false;
    attachmentApi
      .getByEntity("comments", commentId)
      .then((res) => {
        if (!cancelled) setItems(res.data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [commentId, refreshKey]);

  if (items.length === 0) return null;

  const images = items.filter(isImageAttachment);
  const files = items.filter((a) => !isImageAttachment(a));

  return (
    <section className="mt-3 space-y-2">
      {images.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {images.map((a) => (
            <a
              key={a.attachmentId}
              href={a.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.fileUrl}
                alt={a.fileName}
                className="max-h-48 max-w-full object-cover sm:max-w-[240px]"
              />
            </a>
          ))}
        </section>
      ) : null}
      {files.length > 0 ? (
        <ul className="space-y-1">
          {files.map((a) => (
            <li key={a.attachmentId}>
              <a
                href={a.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <FileText size={14} className="shrink-0" />
                {a.fileName}
                {a.fileSize ? (
                  <span className="text-xs text-slate-400">({formatFileSize(a.fileSize)})</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
