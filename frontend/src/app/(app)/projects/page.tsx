"use client";

import { useEffect, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectApi } from "@/src/features/projects/api/project.api";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import type { ProjectSummary } from "@/src/types/api.types";

export default function ProjectsPage() {
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    projectApi
      .getProjects({ search: search || undefined, size: 50 })
      .then((res) => setProjects(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, isReady]);

  return (
    <section>
      <AppHeader
        title="Dự Án"
        subtitle={`${projects.length} dự án bạn đang tham gia`}
        searchPlaceholder="Tìm dự án..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="mb-6 flex justify-end">
        <Button className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={16} />
          Tạo dự án mới
        </Button>
      </section>

      {loading ? (
        <section className="flex h-48 items-center justify-center">
          <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.projectId}
              href={`/projects/${project.projectId}`}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <section className="mb-3 flex items-start justify-between">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600">
                  {project.projectName}
                </h3>
                <Badge variant="outline">
                  {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                </Badge>
              </section>
              <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                {project.projectDescription || "Không có mô tả"}
              </p>
              <section className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Tiến độ</span>
                <span className="font-semibold text-slate-700">
                  {Math.round(project.progressRate)}%
                </span>
              </section>
              <Progress value={project.progressRate} />
              <section className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{project.totalTasks} tasks</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {project.memberCount} thành viên
                </span>
              </section>
            </Link>
          ))}
        </section>
      )}
    </section>
  );
}
