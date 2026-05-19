"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { RecentTasksTable } from "@/src/components/dashboard/RecentTasksTable";
import { projectApi } from "@/src/features/projects/api/project.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import type { TaskSummary } from "@/src/types/api.types";

export default function AdminTasksPage() {
  const { isReady } = useAuthReady();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => t.taskName.toLowerCase().includes(q));
  }, [tasks, search]);

  useEffect(() => {
    if (!isReady) return;

    async function load() {
      try {
        const projectsRes = await projectApi.getAdminProjects({ size: 20 });
        const projectList = projectsRes.data.data.items;
        const results = await Promise.all(
          projectList.map((p) =>
            taskApi.getTasksByProject(p.projectId, { size: 30 }).catch(() => null)
          )
        );
        const merged: TaskSummary[] = [];
        results.forEach((r) => {
          if (r?.data.data.items) merged.push(...r.data.data.items);
        });
        setTasks(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isReady]);

  return (
    <section>
      <AppHeader
        title="Quản lý Task"
        subtitle={`${filteredTasks.length} / ${tasks.length} tác vụ`}
        showSearch
        searchPlaceholder="Tìm task hệ thống..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      {loading ? (
        <section className="flex h-48 items-center justify-center">
          <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      ) : (
        <RecentTasksTable tasks={filteredTasks} linkToDetail />
      )}
    </section>
  );
}
