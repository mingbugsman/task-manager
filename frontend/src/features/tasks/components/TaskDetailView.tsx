"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderKanban,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { canEditTaskItem } from "@/src/features/projects/lib/project-permissions";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { commentApi } from "@/src/features/comments/api/comment.api";
import { attachmentApi } from "@/src/features/attachments/api/attachment.api";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { TaskLabelChips } from "@/src/features/projects/components/kanban/TaskLabelChips";
import { TaskAttachmentsPanel } from "./TaskAttachmentsPanel";
import { TaskCommentsSection } from "./TaskCommentsSection";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { presentActivity } from "@/src/lib/activityPresentation";
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
  const { data: session } = useSession();
  const { user: currentUser } = useCurrentUser();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [myProjectRole, setMyProjectRole] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadComments = useCallback(async () => {
    const res = await commentApi.getByTask(taskId, { size: 100 });
    setComments(res.data.data.items);
  }, [taskId]);

  const loadAttachments = useCallback(async () => {
    try {
      const res = await attachmentApi.getByEntity("tasks", taskId);
      setAttachments(res.data.data ?? []);
    } catch {
      setAttachments([]);
    }
  }, [taskId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, commentsRes, attachmentsRes, activitiesRes] = await Promise.all([
        taskApi.getTaskDetail(taskId),
        commentApi.getByTask(taskId, { size: 100 }),
        attachmentApi.getByEntity("tasks", taskId).catch(() => ({ data: { data: [] as Attachment[] } })),
        activityApi.getByEntity("TASK", taskId).catch(() => ({
          data: { data: { items: [] as ActivityLog[] } },
        })),
      ]);
      const taskData = taskRes.data.data;
      setTask(taskData);
      setComments(commentsRes.data.data.items);

      if (taskData?.projectId && currentUser?.userId != null) {
        try {
          const membersRes = await projectMemberApi.getMembers(taskData.projectId);
          const me = membersRes.data.data.items.find(
            (m) => String(m.user?.userId ?? m.userId) === String(currentUser.userId)
          );
          setMyProjectRole(me?.role ?? null);
        } catch {
          setMyProjectRole(null);
        }
      }
      setAttachments(attachmentsRes.data.data ?? []);
      setActivities(activitiesRes.data.data.items ?? []);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId, currentUser?.userId]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const canModifyTask =
    task != null &&
    canEditTaskItem(myProjectRole, {
      isSystemAdmin: session?.isAdmin,
      taskAssigneeId: task.assignee?.userId,
      currentUserId: currentUser?.userId,
    });

  const handleStatusChange = async (status: string) => {
    if (!canModifyTask) return;
    if (!task || status === task.status) return;
    setUpdatingStatus(true);
    try {
      const res = await taskApi.updateStatus(taskId, status);
      setTask(res.data.data);
      const actRes = await activityApi.getByEntity("TASK", taskId).catch(() => null);
      if (actRes) setActivities(actRes.data.data.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
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
          href={`/projects/${task.projectId}`}
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

            {task.labels && task.labels.length > 0 ? (
              <section className="mb-6">
                <TaskLabelChips labels={task.labels} size="md" />
              </section>
            ) : null}

            {canModifyTask ? (
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
            ) : (
              <p className="text-sm text-slate-500">
                Bạn chỉ có thể xem tác vụ này. Chỉ người được giao hoặc Lead/Chủ dự án mới được chỉnh sửa.
              </p>
            )}
          </article>

          <TaskCommentsSection
            taskId={taskId}
            comments={comments}
            onCommentsChange={loadComments}
          />
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
                        name={task.assignee.userName ?? "?"}
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

          <TaskAttachmentsPanel
            taskId={taskId}
            attachments={attachments}
            onChange={loadAttachments}
          />

          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Hoạt động gần đây</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có hoạt động</p>
            ) : (
              <ul className="space-y-3">
                {activities.slice(0, 10).map((a) => {
                  const p = presentActivity(a);
                  return (
                    <li key={a.activityLogId} className="flex gap-2 text-sm">
                      <Avatar name={a.userName} src={a.avatarUrl} size="sm" />
                      <section>
                        <p className="text-slate-700">
                          <span className="font-medium text-slate-900">{a.userName}</span>{" "}
                          {p.verb} {p.targetLabel}
                        </p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(a.createdAt)}</p>
                      </section>
                    </li>
                  );
                })}
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
