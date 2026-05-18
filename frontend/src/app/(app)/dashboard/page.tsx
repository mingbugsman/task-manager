"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { StatsCards } from "@/src/components/dashboard/StatsCards";
import { ProjectProgressList } from "@/src/components/dashboard/ProjectProgressList";
import { RecentTasksTable } from "@/src/components/dashboard/RecentTasksTable";
import { ActivityFeed } from "@/src/components/dashboard/ActivityFeed";
import { projectApi } from "@/src/features/projects/api/project.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { fetchRecentActivities } from "@/src/features/activity/lib/fetchRecentActivities";
import type { ActivityLog, ProjectSummary, TaskSummary } from "@/src/types/api.types";

export default function DashboardPage() {
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    Promise.all([projectApi.getProjects({ size: 20 }), taskApi.getMyTasks()])
      .then(async ([projectsRes, tasksRes]) => {
        const projectList = projectsRes.data.data.items;
        setProjects(projectList);
        setTasks(tasksRes.data.data);
        const feed = await fetchRecentActivities(
          projectList.map((p) => p.projectId),
          8
        );
        setActivities(feed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady]);

  const stats = useMemo(() => {
    const todo = projects.reduce((s, p) => s + p.todoCount, 0);
    const inProgress = projects.reduce((s, p) => s + p.inProgressCount, 0);
    const done = projects.reduce((s, p) => s + p.doneCount, 0);
    return { todo, inProgress, done };
  }, [projects]);

  const dueToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tasks.filter((t) => {
      if (!t.dueAt) return false;
      const d = new Date(t.dueAt);
      return d >= today && d < tomorrow;
    }).length;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) => t.taskName.toLowerCase().includes(q));
  }, [tasks, search]);

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section>
      <AppHeader
        title="Dashboard"
        subtitle={`Bạn có ${dueToday} tác vụ cần hoàn thành hôm nay`}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="mb-6">
        <StatsCards todo={stats.todo} inProgress={stats.inProgress} done={stats.done} />
      </section>

      <section className="mb-6">
        <ProjectProgressList projects={projects} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_minmax(300px,380px)]">
        <RecentTasksTable tasks={filteredTasks} />
        <ActivityFeed activities={activities} viewAllHref="/activities" />
      </section>
    </section>
  );
}
