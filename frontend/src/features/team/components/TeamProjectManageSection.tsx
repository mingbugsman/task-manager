"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { ListPagination } from "@/src/components/ListPagination";
import { projectApi } from "@/src/features/projects/api/project.api";
import { projectMemberApi } from "@/src/features/projects/api/project-member.api";
import { ProjectMembersManagePanel } from "@/src/features/projects/components/ProjectMembersManagePanel";
import { cn } from "@/lib/utils";
import type { MemberStatistic, ProjectMember, ProjectSummary } from "@/src/types/api.types";

const PROJECT_PAGE_SIZE = 6;

export function TeamProjectManageSection() {
  const { isReady } = useAuthReady();
  const { data: session } = useSession();
  const { user } = useCurrentUser();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectPage, setProjectPage] = useState(0);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [projectTotalElements, setProjectTotalElements] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStatistic | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [myIsManager, setMyIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(() => {
    if (!isReady) return;
    setLoading(true);
    projectApi
      .getProjects({ page: projectPage, size: PROJECT_PAGE_SIZE })
      .then((res) => {
        const data = res.data.data;
        const items = data.items;
        setProjects(items);
        setProjectTotalPages(Math.max(1, data.totalPages));
        setProjectTotalElements(data.totalElements);
        if (items.length > 0) {
          setSelectedId((prev) =>
            prev != null && items.some((p) => p.projectId === prev) ? prev : items[0].projectId
          );
        } else {
          setSelectedId(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, projectPage]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadMembers = useCallback(async () => {
    if (selectedId == null) return;
    const [membersRes, statRes] = await Promise.all([
      projectMemberApi.getMembers(selectedId),
      projectMemberApi.getStatistic(selectedId).catch(() => null),
    ]);
    const list = membersRes.data.data.items;
    setMembers(list);
    setMemberStats(statRes?.data.data ?? null);
    const me = list.find((m) => String(m.user?.userId ?? m.userId) === String(user?.userId));
    setMyRole(me?.role ?? null);
    setMyIsManager(me?.isManager ?? false);
  }, [selectedId, user?.userId]);

  useEffect(() => {
    if (!isReady || selectedId == null) return;
    loadMembers().catch(console.error);
  }, [isReady, selectedId, loadMembers]);

  const selectedProject = projects.find((p) => p.projectId === selectedId);

  if (loading) {
    return (
      <section className="flex h-48 items-center justify-center">
        <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  if (projectTotalElements === 0) {
    return (
      <article className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
        <FolderKanban size={36} className="mx-auto mb-3 text-slate-300" />
        <p className="text-sm text-slate-500">Bạn chưa tham gia dự án nào để quản lý thành viên.</p>
      </article>
    );
  }

  return (
    <section className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chọn dự án</p>
        <section className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.projectId}
              type="button"
              onClick={() => setSelectedId(p.projectId)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                selectedId === p.projectId
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {p.projectName}
            </button>
          ))}
        </section>
        <article className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <ListPagination
            page={projectPage}
            totalPages={projectTotalPages}
            totalElements={projectTotalElements}
            pageSize={PROJECT_PAGE_SIZE}
            hasPrevious={projectPage > 0}
            hasNext={projectPage < projectTotalPages - 1}
            onPageChange={setProjectPage}
          />
        </article>
      </section>

      {selectedId != null ? (
        <ProjectMembersManagePanel
          projectId={selectedId}
          projectName={selectedProject?.projectName}
          members={members}
          statistic={memberStats}
          currentUserId={user?.userId}
          myRole={myRole}
          isProjectManager={myIsManager}
          isSystemAdmin={session?.isAdmin}
          onRefresh={() => loadMembers()}
        />
      ) : null}
    </section>
  );
}
