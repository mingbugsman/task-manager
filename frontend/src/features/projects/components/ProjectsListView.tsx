"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { projectApi } from "@/src/features/projects/api/project.api";
import { ProjectStatsRow } from "./ProjectStatsRow";
import { ProjectCard, PROJECT_THEMES } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectOverallStats, ProjectSummary } from "@/src/types/api.types";

export function ProjectsListView() {
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [stats, setStats] = useState<ProjectOverallStats | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    Promise.all([projectApi.getProjects({ size: 50 }), projectApi.getStats()])
      .then(([projectsRes, statsRes]) => {
        setProjects(projectsRes.data.data.items);
        setStats(statsRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        (p.projectDescription?.toLowerCase().includes(q) ?? false)
    );
  }, [projects, search]);

  const activeCount = useMemo(
    () => filteredProjects.filter((p) => p.status === "ACTIVE").length,
    [filteredProjects]
  );

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
            Quản lý và theo dõi tiến độ của {activeCount} dự án đang hoạt động
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
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm dự án"
            />
          </section>
          <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/projects">
              <Plus size={16} />
              Tạo Dự Án
            </Link>
          </Button>
        </section>
      </header>

      <ProjectStatsRow stats={stats} />

      {filteredProjects.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">
            {search.trim() ? "Không tìm thấy dự án phù hợp" : "Không có dự án nào"}
          </p>
        </article>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              theme={PROJECT_THEMES[index % PROJECT_THEMES.length]}
            />
          ))}
        </section>
      )}
    </section>
  );
}
