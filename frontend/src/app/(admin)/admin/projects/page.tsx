"use client";

import { useEffect, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { projectApi } from "@/src/features/projects/api/project.api";
import { PROJECT_STATUS_LABELS } from "@/src/lib/constants";
import type { ProjectSummary } from "@/src/types/api.types";

export default function AdminProjectsPage() {
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    projectApi
      .getAdminProjects({ search: search || undefined, size: 100 })
      .then((res) => setProjects(res.data.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, isReady]);

  return (
    <section>
      <AppHeader
        title="Quản lý Dự án"
        subtitle="Toàn bộ dự án trong hệ thống"
        searchPlaceholder="Tìm dự án..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="col-span-2 py-12 text-center text-slate-400">Đang tải...</p>
        ) : (
          projects.map((p) => (
            <article
              key={p.projectId}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <section className="mb-2 flex items-start justify-between">
                <h3 className="font-bold text-slate-900">{p.projectName}</h3>
                <Badge variant="outline">
                  {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                </Badge>
              </section>
              <p className="mb-4 text-sm text-slate-500 line-clamp-2">
                {p.projectDescription || "—"}
              </p>
              <Progress value={p.progressRate} />
              <section className="mt-3 flex justify-between text-xs text-slate-400">
                <span>{p.totalTasks} tasks</span>
                <span>Tạo bởi {p.createdByUsername ?? "—"}</span>
              </section>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
