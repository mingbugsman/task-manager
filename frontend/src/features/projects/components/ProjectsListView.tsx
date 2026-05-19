"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { projectApi } from "@/src/features/projects/api/project.api";
import { ProjectStatsRow } from "./ProjectStatsRow";
import { ProjectCard, PROJECT_THEMES } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { ListPagination } from "@/src/components/ListPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectOverallStats, ProjectSummary } from "@/src/types/api.types";

const PAGE_SIZE = 6;

export function ProjectsListView() {
  const router = useRouter();
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [stats, setStats] = useState<ProjectOverallStats | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadProjects = useCallback(() => {
    if (!isReady) return;
    setLoading(true);
    const q = search.trim() || undefined;
    Promise.all([
      projectApi.getProjects({ page, size: PAGE_SIZE, search: q }),
      projectApi.getStats(),
    ])
      .then(([projectsRes, statsRes]) => {
        const data = projectsRes.data.data;
        setProjects(data.items);
        setTotalPages(Math.max(1, data.totalPages));
        setTotalElements(data.totalElements);
        setHasNext(data.hasNext);
        setHasPrevious(data.hasPrevious);
        setStats(statsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, page, search]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadProjects();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadProjects]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Tất Cả Dự Án</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalElements} dự án · {activeCount} đang hoạt động trên trang này
          </p>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <section className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="w-full min-w-[200px] rounded-xl border-slate-200 bg-white pl-9 sm:w-64"
              placeholder="Tìm dự án..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Tìm dự án"
            />
          </section>
          <Button
            type="button"
            className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={16} />
            Tạo Dự Án
          </Button>
        </section>
      </header>

      <ProjectStatsRow stats={stats} />

      {projects.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">
            {search.trim() ? "Không tìm thấy dự án phù hợp" : "Không có dự án nào"}
          </p>
        </article>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                theme={PROJECT_THEMES[index % PROJECT_THEMES.length]}
                onDeleted={loadProjects}
                onUpdated={loadProjects}
              />
            ))}
          </section>
          <article className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          </article>
        </>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(projectId) => router.push(`/projects/${projectId}`)}
      />
    </section>
  );
}
