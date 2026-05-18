"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { RecentTasksTable } from "@/src/components/dashboard/RecentTasksTable";
import { taskApi } from "@/src/features/tasks/api/task.api";
import type { TaskSummary } from "@/src/types/api.types";

export default function TasksPage() {
  const { isReady } = useAuthReady();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    taskApi
      .getMyTasks()
      .then((res) => setTasks(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) => t.taskName.toLowerCase().includes(q));
  }, [tasks, search]);

  return (
    <section>
      <AppHeader
        title="Tất Cả Tác Vụ"
        subtitle={`${tasks.length} tác vụ được giao cho bạn`}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <section className="flex h-48 items-center justify-center">
          <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </section>
      ) : (
        <RecentTasksTable tasks={filtered} linkToDetail />
      )}
    </section>
  );
}
