"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  LayoutGrid,
  ListTodo,
  Users,
  Zap,
} from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { projectApi } from "@/src/features/projects/api/project.api";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { ProjectKanbanBoard } from "./ProjectKanbanBoard";
import { ProjectMembersPanel } from "./ProjectMembersPanel";
import { ActivityFeed } from "@/src/components/dashboard/ActivityFeed";
import { StatsCards } from "@/src/components/dashboard/StatsCards";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import { formatDate, formatDateTime } from "@/src/lib/format";
import type {
  ActivityLog,
  BoardData,
  MemberStatistic,
  ProjectDetail,
  ProjectMember,
  TaskStatistic,
} from "@/src/types/api.types";

type TabId = "board" | "members" | "activity";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "board", label: "Bảng Kanban", icon: LayoutGrid },
  { id: "members", label: "Thành viên", icon: Users },
  { id: "activity", label: "Hoạt động", icon: Zap },
];

interface ProjectDetailViewProps {
  projectId: number;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const { isReady } = useAuthReady();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [stats, setStats] = useState<TaskStatistic | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStatistic | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [tab, setTab] = useState<TabId>("board");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [projectRes, boardRes, statsRes, membersRes, memberStatRes, activitiesRes] =
        await Promise.all([
          projectApi.getProject(projectId),
          projectApi.getBoard(projectId),
          taskApi.getStatistic(projectId).catch(() => null),
          projectMemberApi.getMembers(projectId).catch(() => null),
          projectMemberApi.getStatistic(projectId).catch(() => null),
          activityApi.getByProject(projectId, { size: 12 }).catch(() => null),
        ]);

      setProject(projectRes.data.data);
      setBoard(boardRes.data.data);
      setStats(statsRes?.data.data ?? null);
      setMembers(membersRes?.data.data.items ?? []);
      setMemberStats(memberStatRes?.data.data ?? null);
      setActivities(activitiesRes?.data.data.items ?? []);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const progressRate = useMemo(() => {
    if (stats && stats.totalTasks > 0) {
      return Math.round((stats.doneCount / stats.totalTasks) * 100);
    }
    if (!board) return 0;
    const total = board.columns.reduce((s, c) => s + c.taskCount, 0);
    const done = board.columns.find((c) => c.status === "Done")?.taskCount ?? 0;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [stats, board]);

  const taskCounts = useMemo(() => {
    if (stats) {
      return {
        todo: stats.todoCount,
        inProgress: stats.inProgressCount,
        done: stats.doneCount,
        total: stats.totalTasks,
        overdue: stats.overdueCount,
      };
    }
    if (!board) {
      return { todo: 0, inProgress: 0, done: 0, total: 0, overdue: 0 };
    }
    const get = (status: string) =>
      board.columns.find((c) => c.status === status)?.taskCount ?? 0;
    const todo = get("Todo");
    const inProgress = get("In Progress") + get("Review");
    const done = get("Done");
    return {
      todo,
      inProgress,
      done,
      total: todo + inProgress + done,
      overdue: 0,
    };
  }, [stats, board]);

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (!project) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Không tìm thấy dự án hoặc bạn không có quyền truy cập</p>
        <Link href="/projects" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          ← Quay lại danh sách dự án
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Tất cả dự án
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <section
          className="px-6 py-8 text-white"
          style={{
            background: "linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)",
          }}
        >
          <section className="flex flex-wrap items-start justify-between gap-4">
            <section className="flex min-w-0 items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <FolderKanban size={28} />
              </span>
              <section className="min-w-0">
                <section className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{project.projectName}</h1>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                  </Badge>
                </section>
                <p className="max-w-2xl text-sm leading-relaxed text-blue-100/90">
                  {project.projectDescription || "Chưa có mô tả dự án"}
                </p>
              </section>
            </section>
            <section className="text-right text-sm text-blue-100/80">
              {project.createdByUsername ? (
                <p>Tạo bởi {project.createdByUsername}</p>
              ) : null}
              {project.createdAt ? (
                <p className="mt-1 flex items-center justify-end gap-1">
                  <Calendar size={14} />
                  {formatDate(project.createdAt)}
                </p>
              ) : null}
            </section>
          </section>
        </section>

        <section className="border-t border-slate-100 px-6 py-5">
          <section className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Tiến độ dự án</span>
            <span className="font-bold text-slate-900">{progressRate}%</span>
          </section>
          <Progress value={progressRate} barClassName="bg-blue-600" />
          <section className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ListTodo size={14} />
              {taskCounts.total} tác vụ
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {memberStats?.totalMembers ?? members.length} thành viên
            </span>
            {taskCounts.overdue > 0 ? (
              <span className="font-medium text-red-500">{taskCounts.overdue} quá hạn</span>
            ) : null}
            {project.updatedAt ? (
              <span>Cập nhật {formatDateTime(project.updatedAt)}</span>
            ) : null}
          </section>
        </section>
      </article>

      <StatsCards
        todo={taskCounts.todo}
        inProgress={taskCounts.inProgress}
        done={taskCounts.done}
      />

      <nav className="flex flex-wrap gap-2 border-b border-slate-100 pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              tab === id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {tab === "board" && board ? (
        <section>
          <section className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Bảng công việc</h2>
            <p className="text-sm text-slate-500">Nhấn thẻ để xem chi tiết tác vụ</p>
          </section>
          <ProjectKanbanBoard columns={board.columns} />
        </section>
      ) : null}

      {tab === "members" ? (
        <ProjectMembersPanel members={members} statistic={memberStats} />
      ) : null}

      {tab === "activity" ? (
        <section className="max-w-2xl">
          <ActivityFeed
            activities={activities}
            viewAllHref={`/activities`}
            showFooter={activities.length >= 8}
          />
        </section>
      ) : null}
    </section>
  );
}
