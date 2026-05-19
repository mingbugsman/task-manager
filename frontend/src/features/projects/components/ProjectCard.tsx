"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BarChart3,
  FolderKanban,
  LayoutGrid,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ActionMenuDropdown } from "@/src/components/ActionMenuDropdown";
import { DeleteConfirmDialog } from "@/src/components/DeleteConfirmDialog";
import { projectApi } from "@/src/features/projects/api/project.api";
import {
  canDeleteProject,
  canEditProject,
  resolveActorRole,
} from "@/src/features/projects/lib/project-permissions";
import { EditProjectModal } from "./EditProjectModal";
import { useDeleteConfirm } from "@/src/hooks/useDeleteConfirm";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { getApiErrorMessage } from "@/src/lib/api-error";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/src/types/api.types";

export interface ProjectCardTheme {
  icon: string;
  bar: string;
  btn: string;
  btnHover: string;
  light: string;
  lightBorder: string;
  statTodo: string;
  statProgress: string;
  statDone: string;
}

export const PROJECT_THEMES: ProjectCardTheme[] = [
  {
    icon: "bg-blue-600",
    bar: "bg-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700",
    btnHover: "hover:border-blue-200",
    light: "bg-blue-50 text-blue-700",
    lightBorder: "border-blue-100",
    statTodo: "bg-blue-50 text-blue-800",
    statProgress: "bg-sky-50 text-sky-800",
    statDone: "bg-emerald-50 text-emerald-800",
  },
  {
    icon: "bg-teal-500",
    bar: "bg-teal-500",
    btn: "bg-teal-600 hover:bg-teal-700",
    btnHover: "hover:border-teal-200",
    light: "bg-teal-50 text-teal-700",
    lightBorder: "border-teal-100",
    statTodo: "bg-teal-50 text-teal-800",
    statProgress: "bg-cyan-50 text-cyan-800",
    statDone: "bg-emerald-50 text-emerald-800",
  },
  {
    icon: "bg-violet-600",
    bar: "bg-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700",
    btnHover: "hover:border-violet-200",
    light: "bg-violet-50 text-violet-700",
    lightBorder: "border-violet-100",
    statTodo: "bg-violet-50 text-violet-800",
    statProgress: "bg-purple-50 text-purple-800",
    statDone: "bg-emerald-50 text-emerald-800",
  },
  {
    icon: "bg-emerald-600",
    bar: "bg-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    btnHover: "hover:border-emerald-200",
    light: "bg-emerald-50 text-emerald-700",
    lightBorder: "border-emerald-100",
    statTodo: "bg-emerald-50/80 text-emerald-800",
    statProgress: "bg-lime-50 text-lime-800",
    statDone: "bg-green-100 text-green-800",
  },
  {
    icon: "bg-red-500",
    bar: "bg-red-500",
    btn: "bg-red-600 hover:bg-red-700",
    btnHover: "hover:border-red-200",
    light: "bg-red-50 text-red-700",
    lightBorder: "border-red-100",
    statTodo: "bg-red-50 text-red-800",
    statProgress: "bg-orange-50 text-orange-800",
    statDone: "bg-emerald-50 text-emerald-800",
  },
  {
    icon: "bg-orange-500",
    bar: "bg-orange-500",
    btn: "bg-orange-600 hover:bg-orange-700",
    btnHover: "hover:border-orange-200",
    light: "bg-orange-50 text-orange-700",
    lightBorder: "border-orange-100",
    statTodo: "bg-orange-50 text-orange-800",
    statProgress: "bg-amber-50 text-amber-800",
    statDone: "bg-emerald-50 text-emerald-800",
  },
];

interface ProjectCardProps {
  project: ProjectSummary;
  theme: ProjectCardTheme;
  myRole?: string | null;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function ProjectCard({ project, theme, myRole, onDeleted, onUpdated }: ProjectCardProps) {
  const { data: session } = useSession();
  const { user } = useCurrentUser();
  const deleteConfirm = useDeleteConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const progress = Math.round(project.progressRate);
  const avatars = project.memberAvatarUrls ?? [];

  const effectiveRole = resolveActorRole(myRole, { isSystemAdmin: session?.isAdmin });
  const isCreator =
    user?.userId != null &&
    project.createdBy != null &&
    String(project.createdBy) === String(user.userId);
  const canDelete =
    canDeleteProject(effectiveRole ?? myRole, session?.isAdmin) || isCreator;
  const canEdit =
    canEditProject(effectiveRole ?? myRole, session?.isAdmin) || isCreator;

  const projectForEdit = {
    projectId: project.projectId,
    projectName: project.projectName,
    projectDescription: project.projectDescription,
    status: project.status,
  };

  const handleDelete = () => {
    deleteConfirm.ask({
      title: "Xóa dự án",
      description: "Dự án sẽ bị xóa mềm và không còn hiển thị trong danh sách.",
      details: [
        { label: "Tên dự án", value: project.projectName },
        { label: "Mô tả", value: project.projectDescription || "—" },
        { label: "Trạng thái", value: PROJECT_STATUS_LABELS[project.status] ?? project.status },
        { label: "Số tác vụ", value: String(project.totalTasks) },
      ],
      onConfirm: async () => {
        await projectApi.deleteProject(project.projectId);
        onDeleted?.();
      },
    });
  };

  const menuItems = [
    ...(canEdit
      ? [{ id: "edit", label: "Sửa dự án", onClick: () => setEditOpen(true) }]
      : []),
    ...(canDelete
      ? [{ id: "delete", label: "Xóa dự án", destructive: true, onClick: handleDelete }]
      : []),
  ];

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md",
        theme.btnHover
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white", theme.icon)}>
          <FolderKanban size={22} />
        </span>
        <section className="min-w-0 flex-1">
          <section className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
              {project.projectName}
            </h3>
            <ActionMenuDropdown items={menuItems} />
          </section>
          <p className="mt-0.5 text-xs text-slate-500">{project.totalTasks} tác vụ</p>
        </section>
      </header>

      <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">
        {project.projectDescription || "Không có mô tả dự án"}
      </p>

      <section className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">Tiến Độ</span>
        <span className="font-bold text-slate-900">{progress}%</span>
      </section>
      <Progress value={progress} barClassName={theme.bar} className="mb-4" />

      <section className="mb-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <span className={cn("rounded-lg py-2", theme.statTodo)}>
          <span className="block text-lg font-bold">{project.todoCount}</span>
          Chờ
        </span>
        <span className={cn("rounded-lg py-2", theme.statProgress)}>
          <span className="block text-lg font-bold">{project.inProgressCount}</span>
          Đang làm
        </span>
        <span className={cn("rounded-lg py-2", theme.statDone)}>
          <span className="block text-lg font-bold">{project.doneCount}</span>
          Xong
        </span>
      </section>

      <section className="mb-4 flex items-center justify-between">
        <section className="flex -space-x-2">
          {avatars.length > 0 ? (
            avatars.slice(0, 4).map((url, i) => (
              <Avatar
                key={`${project.projectId}-${i}`}
                name={`M${i}`}
                src={url}
                size="sm"
                className="ring-2 ring-white"
              />
            ))
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-400 ring-2 ring-white">
              ?
            </span>
          )}
        </section>
        <span className="text-xs text-slate-500">{project.memberCount} thành viên</span>
      </section>

      <section className="mb-3 grid grid-cols-2 gap-2">
        <Link
          href={`/projects/${project.projectId}?tab=board`}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors",
            theme.light,
            theme.lightBorder
          )}
        >
          <LayoutGrid size={16} />
          Kanban
        </Link>
        <Link
          href={`/projects/${project.projectId}?tab=analytics`}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors",
            theme.light,
            theme.lightBorder
          )}
        >
          <BarChart3 size={16} />
          Analytics
        </Link>
      </section>

      <Link
        href={`/projects/${project.projectId}`}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors",
          theme.btn
        )}
      >
        Chi tiết dự án
        <ArrowRight size={16} />
      </Link>

      <EditProjectModal
        open={editOpen}
        project={editOpen ? projectForEdit : null}
        onClose={() => setEditOpen(false)}
        onUpdated={() => onUpdated?.()}
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
    </article>
  );
}
