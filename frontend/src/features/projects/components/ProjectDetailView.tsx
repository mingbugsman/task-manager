"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  FolderKanban,
  LayoutGrid,
  ListTodo,
  Plus,
  SlidersHorizontal,
  Users,
  Tag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { canUseKanbanDragDrop } from "@/src/features/projects/lib/kanban-permissions";
import { projectApi } from "@/src/features/projects/api/project.api";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { activityApi } from "@/src/features/activity/api/activity.api";
import { ProjectAnalyticsPanel } from "./analytics/ProjectAnalyticsPanel";
import { ProjectKanbanBoard } from "./ProjectKanbanBoard";
import { ProjectMembersManagePanel } from "./ProjectMembersManagePanel";
import { CreateTaskModal } from "./CreateTaskModal";
import { EditProjectModal } from "./EditProjectModal";
import { EditTaskModal } from "./EditTaskModal";
import { TaskLabelsModal } from "./TaskLabelsModal";
import { ProjectLabelsPanel } from "./ProjectLabelsPanel";
import { ActionMenuDropdown } from "@/src/components/ActionMenuDropdown";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import {
  canCreateTask,
  canDeleteProject,
  canDeleteTask,
  canEditProject,
  canEditTask,
  canEditTaskItem,
  canManageTaskLabels,
  normalizeProjectRole,
  resolveActorRole,
} from "@/src/features/projects/lib/project-permissions";
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
  BoardTask,
} from "@/src/types/api.types";

type TabId = "board" | "labels" | "members" | "activity" | "analytics";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "board", label: "Bảng Kanban", icon: LayoutGrid },
  { id: "labels", label: "Nhãn", icon: Tag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "members", label: "Thành viên", icon: Users },
  { id: "activity", label: "Hoạt động", icon: Zap },
];

interface ProjectDetailViewProps {
  projectId: number;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady } = useAuthReady();
  const { data: session } = useSession();
  const { user: currentUser } = useCurrentUser();
  const deleteConfirm = useDeleteConfirm();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [stats, setStats] = useState<TaskStatistic | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStatistic | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [tab, setTab] = useState<TabId>("board");
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [labelsTask, setLabelsTask] = useState<BoardTask | null>(null);
  const [boardSyncKey, setBoardSyncKey] = useState(0);

  const loadActivities = useCallback(async () => {
    try {
      const res = await activityApi.getByProject(projectId, { size: 30 });
      setActivities(res.data.data?.items ?? []);
    } catch {
      setActivities([]);
    }
  }, [projectId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [projectRes, boardRes, statsRes, membersRes, memberStatRes] =
        await Promise.all([
          projectApi.getProject(projectId),
          projectApi.getBoard(projectId),
          taskApi.getStatistic(projectId).catch(() => null),
          projectMemberApi.getMembers(projectId).catch(() => null),
          projectMemberApi.getStatistic(projectId).catch(() => null),
        ]);

      setProject(projectRes.data.data);
      setBoard(boardRes.data.data);
      setStats(statsRes?.data.data ?? null);
      setMembers(membersRes?.data.data.items ?? []);
      setMemberStats(memberStatRes?.data.data ?? null);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refreshBoard = useCallback(async () => {
    try {
      const [boardRes, statsRes] = await Promise.all([
        projectApi.getBoard(projectId),
        taskApi.getStatistic(projectId).catch(() => null),
      ]);
      setBoard(boardRes.data.data);
      setStats(statsRes?.data.data ?? null);
      setBoardSyncKey((k) => k + 1);
      if (tab === "activity") {
        loadActivities();
      }
    } catch {
      console.error("Không tải lại bảng Kanban");
    }
  }, [projectId, tab, loadActivities]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  useEffect(() => {
    if (isReady && tab === "activity") {
      loadActivities();
    }
  }, [isReady, tab, loadActivities]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (
      t === "board" ||
      t === "labels" ||
      t === "members" ||
      t === "activity" ||
      t === "analytics"
    ) {
      setTab(t);
    }
  }, [searchParams]);

  const myMember = useMemo(
    () =>
      members.find(
        (m) => String(m.user?.userId ?? m.userId) === String(currentUser?.userId)
      ),
    [members, currentUser?.userId]
  );

  const canDragKanban = useMemo(
    () =>
      canUseKanbanDragDrop({
        isSystemAdmin: session?.isAdmin,
        projectRole: myMember?.role,
        isProjectManager: myMember?.isManager,
      }),
    [myMember, session?.isAdmin]
  );

  const effectiveRole = useMemo(
    () =>
      resolveActorRole(myMember?.role, {
        isSystemAdmin: session?.isAdmin,
        isProjectManager: myMember?.isManager,
      }),
    [myMember?.role, myMember?.isManager, session?.isAdmin]
  );

  const canAddTask = useMemo(
    () => canCreateTask(effectiveRole ?? myMember?.role, session?.isAdmin),
    [effectiveRole, myMember?.role, session?.isAdmin]
  );

  const isProjectCreator = useMemo(
    () =>
      currentUser?.userId != null &&
      project?.createdBy != null &&
      String(project.createdBy) === String(currentUser.userId),
    [currentUser?.userId, project?.createdBy]
  );

  const canModifyProject = useMemo(
    () =>
      canEditProject(effectiveRole ?? myMember?.role, session?.isAdmin) || isProjectCreator,
    [effectiveRole, myMember?.role, session?.isAdmin, isProjectCreator]
  );

  const canRemoveProject = canModifyProject;

  const projectRole = effectiveRole ?? myMember?.role;

  const taskPermissionOptions = useMemo(
    () => ({
      isSystemAdmin: session?.isAdmin,
      currentUserId: currentUser?.userId,
    }),
    [session?.isAdmin, currentUser?.userId]
  );

  const canEditTaskFor = useCallback(
    (task: BoardTask) =>
      canEditTaskItem(projectRole, {
        ...taskPermissionOptions,
        taskAssigneeId: task.assigneeId,
      }),
    [projectRole, taskPermissionOptions]
  );

  const canManageLabelsFor = useCallback(
    (task: BoardTask) =>
      canManageTaskLabels(projectRole, {
        ...taskPermissionOptions,
        taskAssigneeId: task.assigneeId,
      }),
    [projectRole, taskPermissionOptions]
  );

  const canRemoveTask = useMemo(
    () => canDeleteTask(effectiveRole ?? myMember?.role, session?.isAdmin),
    [effectiveRole, myMember?.role, session?.isAdmin]
  );

  const canReassignTasks = useMemo(() => {
    if (session?.isAdmin) return true;
    const r = normalizeProjectRole(projectRole);
    return r === "OWNER" || r === "LEAD";
  }, [session?.isAdmin, projectRole]);

  const handleDeleteProject = () => {
    if (!project) return;
    deleteConfirm.ask({
      title: "Xóa dự án",
      description: "Dự án sẽ bị xóa mềm và không còn hiển thị trong danh sách.",
      details: [
        { label: "Tên dự án", value: project.projectName },
        { label: "Mô tả", value: project.projectDescription || "—" },
        {
          label: "Trạng thái",
          value: PROJECT_STATUS_LABELS[project.status] ?? project.status,
        },
      ],
      onConfirm: async () => {
        await projectApi.deleteProject(projectId);
        router.push("/projects");
      },
    });
  };

  const handleDeleteTask = (task: BoardTask) => {
    deleteConfirm.ask({
      title: "Xóa tác vụ",
      description: "Tác vụ sẽ bị xóa vĩnh viễn khỏi dự án.",
      details: [
        { label: "Tên tác vụ", value: task.taskName },
        { label: "Dự án", value: project?.projectName ?? `#${projectId}` },
        { label: "Ưu tiên", value: String(task.priority) },
      ],
      onConfirm: async () => {
        await taskApi.deleteTask(task.taskId);
        await refreshBoard();
      },
    });
  };

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

  const isAnalytics = tab === "analytics";

  return (
    <section className="space-y-6">
      {!isAnalytics ? (
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Tất cả dự án
        </Link>
      ) : null}

      {!isAnalytics ? (
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
                  {canModifyProject || canRemoveProject ? (
                    <ActionMenuDropdown
                      items={[
                        ...(canModifyProject
                          ? [
                              {
                                id: "edit-project",
                                label: "Sửa dự án",
                                onClick: () => setEditProjectOpen(true),
                              },
                            ]
                          : []),
                        ...(canRemoveProject
                          ? [
                              {
                                id: "delete-project",
                                label: "Xóa dự án",
                                destructive: true,
                                onClick: handleDeleteProject,
                              },
                            ]
                          : []),
                      ]}
                      buttonClassName="!text-white hover:!bg-white/10"
                    />
                  ) : null}
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
      ) : null}

      {!isAnalytics ? (
        <StatsCards
          todo={taskCounts.todo}
          inProgress={taskCounts.inProgress}
          done={taskCounts.done}
        />
      ) : null}

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
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <section>
              <h2 className="text-xl font-bold text-slate-900">Kanban Board</h2>
              <p className="mt-1 text-sm text-slate-500">
                {canDragKanban
                  ? "Kéo thả task để thay đổi trạng thái (thành viên chỉ kéo task của mình)"
                  : "Xem bảng công việc"}
              </p>
            </section>
            <section className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 rounded-xl border-slate-200">
                <SlidersHorizontal size={16} />
                Lọc
              </Button>
              {canAddTask ? (
                <Button
                  type="button"
                  className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCreateTaskOpen(true)}
                >
                  <Plus size={16} />
                  Tạo Task
                </Button>
              ) : null}
            </section>
          </header>
          <ProjectKanbanBoard
            projectId={projectId}
            columns={board.columns}
            syncKey={boardSyncKey}
            canDragDrop={canDragKanban}
            canDragTask={canEditTaskFor}
            canEditTask={canEditTaskFor}
            onEditTask={(task) => setEditTaskId(task.taskId)}
            canManageLabels={canManageLabelsFor}
            onManageLabels={(task) => setLabelsTask(task)}
            canDeleteTask={canRemoveTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={() => setCreateTaskOpen(true)}
          />
        </section>
      ) : null}

      {tab === "labels" ? (
        <ProjectLabelsPanel
          projectId={projectId}
          canManage={canEditTask(projectRole, session?.isAdmin)}
        />
      ) : null}

      {tab === "members" ? (
        <ProjectMembersManagePanel
          projectId={projectId}
          projectName={project.projectName}
          members={members}
          statistic={memberStats}
          currentUserId={currentUser?.userId}
          myRole={myMember?.role}
          isProjectManager={myMember?.isManager}
          isSystemAdmin={session?.isAdmin}
          onRefresh={() => {
            load();
            if (tab === "activity") loadActivities();
          }}
        />
      ) : null}

      {tab === "activity" ? (
        <section className="max-w-2xl">
          <ActivityFeed
            activities={activities}
            viewAllHref={`/projects/${projectId}?tab=activity`}
            showFooter={false}
          />
        </section>
      ) : null}

      {tab === "analytics" ? (
        <ProjectAnalyticsPanel projectId={projectId} project={project} />
      ) : null}

      <CreateTaskModal
        open={createTaskOpen}
        projectId={projectId}
        projectName={project.projectName}
        members={members}
        onClose={() => setCreateTaskOpen(false)}
        onCreated={refreshBoard}
      />

      <EditProjectModal
        open={editProjectOpen}
        project={project}
        onClose={() => setEditProjectOpen(false)}
        onUpdated={load}
      />

      <EditTaskModal
        open={editTaskId != null}
        taskId={editTaskId}
        projectName={project.projectName}
        members={members}
        allowAssigneeChange={canReassignTasks}
        onClose={() => setEditTaskId(null)}
        onUpdated={refreshBoard}
      />

      <TaskLabelsModal
        open={labelsTask != null}
        taskId={labelsTask?.taskId ?? null}
        projectId={projectId}
        taskName={labelsTask?.taskName}
        canCreateLabel={canReassignTasks}
        onClose={() => setLabelsTask(null)}
        onUpdated={refreshBoard}
      />

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
    </section>
  );
}
