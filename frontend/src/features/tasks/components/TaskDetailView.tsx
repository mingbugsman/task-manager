"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderKanban,
  MessageSquare,
  Paperclip,
  Send,
  User,
} from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { commentApi } from "@/src/features/comments/api/comment.api";
import { attachmentApi } from "@/src/features/attachments/api/attachment.api";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUS_OPTIONS } from "@/src/lib/constants";
import {
  formatDate,
  formatDateTime,
  formatPriority,
  formatRelativeTime,
  formatStatus,
} from "@/src/lib/format";
import type { ActivityLog, Attachment, Comment, TaskDetail } from "@/src/types/api.types";

function statusVariant(status: string) {
  if (status === "Done") return "done";
  if (status === "In Progress" || status === "Review") return "progress";
  return "todo";
}

function priorityVariant(priority: number) {
  if (priority >= 3) return "high";
  if (priority === 2) return "medium";
  return "low";
}

interface TaskDetailViewProps {
  taskId: number;
}

export function TaskDetailView({ taskId }: TaskDetailViewProps) {
  const router = useRouter();
  const { isReady } = useAuthReady();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, commentsRes, attachmentsRes, activitiesRes] = await Promise.all([
        taskApi.getTaskDetail(taskId),
        commentApi.getByTask(taskId),
        attachmentApi.getByEntity("tasks", taskId).catch(() => ({ data: { data: [] as Attachment[] } })),
        activityApi.getByEntity("TASK", taskId).catch(() => ({
          data: { data: { items: [] as ActivityLog[] } },
        })),
      ]);
      setTask(taskRes.data.data);
      setComments(commentsRes.data.data.items);
      setAttachments(attachmentsRes.data.data ?? []);
      setActivities(activitiesRes.data.data.items ?? []);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const handleStatusChange = async (status: string) => {
    if (!task || status === task.status) return;
    setUpdatingStatus(true);
    try {
      const res = await taskApi.updateStatus(taskId, status);
      setTask(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    setSubmittingComment(true);
    try {
      await commentApi.create(taskId, text);
      setCommentText("");
      const res = await commentApi.getByTask(taskId);
      setComments(res.data.data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (!task) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Không tìm thấy tác vụ</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => router.push("/tasks")}>
          Quay lại danh sách
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="flex flex-wrap items-center gap-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <Link
          href={`/projects`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <FolderKanban size={14} />
          {task.projectName}
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <section className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <section>
                <h1 className="text-2xl font-bold text-slate-900">{task.taskName}</h1>
                <p className="mt-1 text-sm text-slate-500">#{task.taskId}</p>
              </section>
              <section className="flex flex-wrap gap-2">
                <Badge variant={priorityVariant(task.priority)}>
                  {formatPriority(task.priority)}
                </Badge>
                <Badge variant={statusVariant(task.status)}>{formatStatus(task.status)}</Badge>
              </section>
            </section>

            <section className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Mô tả
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {task.taskDescription?.trim() || "Chưa có mô tả cho tác vụ này."}
              </p>
            </section>

            {task.labels && task.labels.length > 0 && (
              <section className="mb-6 flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span
                    key={label.labelId}
                    className="rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: label.colorCode ?? "#64748b" }}
                  >
                    {label.labelName}
                  </span>
                ))}
              </section>
            )}

            <section>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cập nhật trạng thái
              </label>
              <select
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={task.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </section>
          </article>

          <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <section className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
              <MessageSquare size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Bình luận ({comments.length})</h2>
            </section>

            <section className="space-y-4 p-6">
              {comments.length === 0 ? (
                <p className="text-center text-sm text-slate-400">Chưa có bình luận</p>
              ) : (
                comments.map((c) => (
                  <section key={c.commentId} className="flex gap-3">
                    <Avatar name={c.author?.userName ?? "?"} src={c.author?.avatarUrl} size="md" />
                    <section className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3">
                      <section className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {c.author?.userName ?? "Người dùng"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(c.createdAt)}
                        </span>
                        {c.isEdited && (
                          <span className="text-xs text-slate-400">(đã sửa)</span>
                        )}
                      </section>
                      <p className="text-sm text-slate-700">{c.content}</p>
                      {c.replyCount > 0 && (
                        <p className="mt-2 text-xs text-blue-600">{c.replyCount} phản hồi</p>
                      )}
                    </section>
                  </section>
                ))
              )}

              <section className="flex gap-3 border-t border-slate-100 pt-4">
                <textarea
                  className="min-h-[80px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Viết bình luận..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                />
                <Button
                  className="h-auto self-end rounded-xl bg-blue-600 px-4 hover:bg-blue-700"
                  disabled={submittingComment || !commentText.trim()}
                  onClick={handleSubmitComment}
                >
                  <Send size={16} />
                </Button>
              </section>
            </section>
          </article>
        </section>

        <section className="space-y-6">
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
              Thông tin
            </h2>
            <dl className="space-y-4 text-sm">
              <InfoRow
                icon={<User size={16} />}
                label="Người được giao"
                value={
                  task.assignee ? (
                    <section className="flex items-center gap-2">
                      <Avatar
                        name={task.assignee.userName}
                        src={task.assignee.avatarUrl}
                        size="sm"
                      />
                      {task.assignee.userName}
                    </section>
                  ) : (
                    "Chưa giao"
                  )
                }
              />
              <InfoRow
                icon={<User size={16} />}
                label="Người tạo"
                value={task.reporter?.userName ?? "—"}
              />
              <InfoRow
                icon={<Calendar size={16} />}
                label="Deadline"
                value={formatDate(task.dueAt)}
              />
              <InfoRow
                icon={<Clock size={16} />}
                label="Tạo lúc"
                value={formatDateTime(task.createdAt)}
              />
              <InfoRow
                icon={<Clock size={16} />}
                label="Cập nhật"
                value={formatDateTime(task.updatedAt)}
              />
            </dl>
          </article>

          {attachments.length > 0 && (
            <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <section className="mb-3 flex items-center gap-2">
                <Paperclip size={16} className="text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">Tệp đính kèm</h2>
              </section>
              <ul className="space-y-2">
                {attachments.map((a) => (
                  <li key={a.attachmentId}>
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {a.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          )}

          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Hoạt động gần đây</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có hoạt động</p>
            ) : (
              <ul className="space-y-3">
                {activities.slice(0, 8).map((a) => (
                  <li key={a.activityLogId} className="flex gap-2 text-sm">
                    <Avatar name={a.userName} src={a.avatarUrl} size="sm" />
                    <section>
                      <p className="text-slate-700">
                        <span className="font-medium text-slate-900">{a.userName}</span>{" "}
                        {a.action}
                      </p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                    </section>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </section>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <section>
      <dt className="mb-1 flex items-center gap-2 text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </section>
  );
}
