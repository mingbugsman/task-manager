"use client";

import { useCallback, useState } from "react";
import { MessageSquare, Pencil, Reply, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentAttachments } from "@/src/features/comments/components/CommentAttachments";
import { CommentComposer } from "@/src/features/comments/components/CommentComposer";
import { CommentReactions } from "@/src/features/comments/components/CommentReactions";
import { commentApi } from "@/src/features/comments/api/comment.api";
import { attachmentApi } from "@/src/features/attachments/api/attachment.api";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { revokePendingFiles, type PendingFile } from "@/src/features/comments/lib/pending-files";
import { formatDate } from "@/src/lib/format";
import { normalizeUserSummary } from "@/src/lib/normalize-user";
import type { Comment } from "@/src/types/api.types";

interface TaskCommentsSectionProps {
  taskId: number;
  comments: Comment[];
  onCommentsChange: () => void;
}

export function TaskCommentsSection({
  taskId,
  comments,
  onCommentsChange,
}: TaskCommentsSectionProps) {
  const { user } = useCurrentUser();
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentRefresh, setAttachmentRefresh] = useState(0);

  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Record<number, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyPendingFiles, setReplyPendingFiles] = useState<PendingFile[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const isOwner = (c: Comment) =>
    user?.userId != null &&
    c.author?.userId != null &&
    String(c.author.userId) === String(user.userId);

  const canModify = (c: Comment) => isOwner(c) || session?.isAdmin;

  const uploadFilesToComment = async (commentId: number, files: PendingFile[]) => {
    for (const pf of files) {
      await attachmentApi.upload("comments", commentId, pf.file);
    }
  };

  const loadReplies = useCallback(async (parentId: number) => {
    setLoadingReplies((prev) => new Set(prev).add(parentId));
    try {
      const res = await commentApi.getReplies(parentId);
      setRepliesMap((m) => ({ ...m, [parentId]: res.data.data }));
    } catch {
      setError("Không tải được phản hồi");
    } finally {
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
    }
  }, []);

  const toggleReplies = async (parentId: number) => {
    if (expandedReplies.has(parentId)) {
      setExpandedReplies((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
      return;
    }
    setExpandedReplies((prev) => new Set(prev).add(parentId));
    if (!repliesMap[parentId]) {
      await loadReplies(parentId);
    }
  };

  const clearComposer = (files: PendingFile[], setFiles: (f: PendingFile[]) => void) => {
    revokePendingFiles(files);
    setFiles([]);
  };

  const submitComment = async (
    content: string,
    files: PendingFile[],
    parentId?: number,
    onSuccess?: () => void
  ) => {
    const text = content.trim();
    if (!text && files.length === 0) return;

    const body = text || (files.length > 0 ? "📎 Đính kèm" : "");

    setSubmitting(true);
    setError(null);
    try {
      const res = await commentApi.create(taskId, body, parentId);
      const commentId = res.data.data.commentId;

      if (files.length > 0) {
        await uploadFilesToComment(commentId, files);
        setAttachmentRefresh((k) => k + 1);
      }

      onSuccess?.();

      if (parentId) {
        await loadReplies(parentId);
        setExpandedReplies((prev) => new Set(prev).add(parentId));
      }
      onCommentsChange();
    } catch {
      setError("Không gửi được bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainSubmit = async () => {
    const files = [...pendingFiles];
    await submitComment(newComment, files, undefined, () => {
      setNewComment("");
      clearComposer(files, setPendingFiles);
    });
  };

  const handleReplySubmit = async (parentId: number) => {
    const files = [...replyPendingFiles];
    await submitComment(replyText, files, parentId, () => {
      setReplyText("");
      setReplyingTo(null);
      clearComposer(files, setReplyPendingFiles);
    });
  };

  const saveEdit = async (commentId: number) => {
    const text = editText.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      await commentApi.update(commentId, text);
      setEditingId(null);
      setEditText("");
      onCommentsChange();
      const parentKey = Object.keys(repliesMap).find((k) =>
        repliesMap[Number(k)]?.some((r) => r.commentId === commentId)
      );
      if (parentKey) await loadReplies(Number(parentKey));
    } catch {
      setError("Không cập nhật được bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const removeComment = async (commentId: number, parentId?: number) => {
    if (!confirm("Xóa bình luận này?")) return;
    setError(null);
    try {
      await commentApi.delete(commentId);
      if (parentId) await loadReplies(parentId);
      onCommentsChange();
      setAttachmentRefresh((k) => k + 1);
    } catch {
      setError("Không xóa được bình luận");
    }
  };

  const renderComment = (c: Comment, isReply = false, parentId?: number) => {
    const author = normalizeUserSummary(c.author ?? {});
    const name = author.userName ?? "Người dùng";
    const isEditing = editingId === c.commentId;

    return (
      <section key={c.commentId} className={isReply ? "ml-10 border-l-2 border-slate-100 pl-4" : ""}>
        <section className="flex gap-3">
          <Avatar name={name} src={author.avatarUrl ?? undefined} size="md" className="shrink-0" />
          <section className="min-w-0 flex-1">
            <section className="rounded-xl bg-slate-50 px-4 py-3">
              <section className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{name}</span>
                <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                {c.isEdited ? <span className="text-xs text-slate-400">(đã sửa)</span> : null}
              </section>

              {isEditing ? (
                <section className="space-y-2">
                  <textarea
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                  <section className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg bg-blue-600 hover:bg-blue-700"
                      disabled={submitting || !editText.trim()}
                      onClick={() => saveEdit(c.commentId)}
                    >
                      Lưu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                    >
                      Hủy
                    </Button>
                  </section>
                </section>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {c.content}
                </p>
              )}

              {!isEditing ? (
                <CommentAttachments commentId={c.commentId} refreshKey={attachmentRefresh} />
              ) : null}
            </section>

            {!isEditing ? <CommentReactions commentId={c.commentId} /> : null}

            {!isEditing && (
              <section className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                {!isReply ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-blue-600"
                    onClick={() => {
                      if (replyingTo === c.commentId) {
                        setReplyingTo(null);
                        clearComposer(replyPendingFiles, setReplyPendingFiles);
                        setReplyText("");
                      } else {
                        setReplyingTo(c.commentId);
                        setReplyText("");
                        clearComposer(replyPendingFiles, setReplyPendingFiles);
                      }
                    }}
                  >
                    <Reply size={12} />
                    Trả lời
                  </button>
                ) : null}
                {canModify(c) ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-blue-600"
                      onClick={() => {
                        setEditingId(c.commentId);
                        setEditText(c.content);
                      }}
                    >
                      <Pencil size={12} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-red-600"
                      onClick={() => removeComment(c.commentId, parentId)}
                    >
                      <Trash2 size={12} />
                      Xóa
                    </button>
                  </>
                ) : null}
                {!isReply && c.replyCount > 0 ? (
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:underline"
                    onClick={() => toggleReplies(c.commentId)}
                  >
                    {expandedReplies.has(c.commentId)
                      ? "Ẩn phản hồi"
                      : `${c.replyCount} phản hồi`}
                  </button>
                ) : null}
              </section>
            )}

            {replyingTo === c.commentId && !isReply ? (
              <section className="mt-3">
                <CommentComposer
                  value={replyText}
                  onChange={setReplyText}
                  pendingFiles={replyPendingFiles}
                  onPendingFilesChange={setReplyPendingFiles}
                  onSubmit={() => handleReplySubmit(c.commentId)}
                  submitting={submitting}
                  placeholder="Viết phản hồi..."
                  submitLabel="Gửi"
                  compact
                />
              </section>
            ) : null}
          </section>
        </section>

        {!isReply && expandedReplies.has(c.commentId) ? (
          <section className="mt-3 space-y-3">
            {loadingReplies.has(c.commentId) ? (
              <p className="ml-12 text-xs text-slate-400">Đang tải phản hồi...</p>
            ) : (
              (repliesMap[c.commentId] ?? []).map((reply) =>
                renderComment(reply, true, c.commentId)
              )
            )}
          </section>
        ) : null}
      </section>
    );
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <section className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
        <MessageSquare size={18} className="text-blue-600" />
        <h2 className="font-bold text-slate-900">Bình luận ({comments.length})</h2>
      </section>

      <section className="space-y-5 p-6">
        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

        {comments.length === 0 ? (
          <p className="text-center text-sm text-slate-400">Chưa có bình luận — hãy là người đầu tiên</p>
        ) : (
          comments.map((c) => renderComment(c))
        )}

        <section className="flex gap-3 border-t border-slate-100 pt-5">
          <Avatar
            name={user?.userName ?? "?"}
            src={user?.avatarUrl}
            size="md"
            className="hidden shrink-0 sm:flex"
          />
          <section className="min-w-0 flex-1">
            <CommentComposer
              value={newComment}
              onChange={setNewComment}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
              onSubmit={handleMainSubmit}
              submitting={submitting}
            />
            <p className="mt-2 text-right text-xs text-slate-400">Ctrl + Enter để gửi nhanh</p>
          </section>
        </section>
      </section>
    </article>
  );
}
