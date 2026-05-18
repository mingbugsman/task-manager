"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { AdminStatsCards } from "@/src/components/dashboard/AdminStatsCards";
import { TaskStatusPieChart } from "@/src/components/dashboard/TaskStatusPieChart";
import { PriorityBarChart } from "@/src/components/dashboard/PriorityBarChart";
import { ProjectProgressList } from "@/src/components/dashboard/ProjectProgressList";
import { ActivityFeed } from "@/src/components/dashboard/ActivityFeed";
import { projectApi } from "@/src/features/projects/api/project.api";
import { userApi } from "@/src/features/users/api/user.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { fetchRecentActivities } from "@/src/features/activity/lib/fetchRecentActivities";
import type { ActivityLog, ProjectSummary, TaskSummary } from "@/src/types/api.types";

export default function AdminDashboardPage() {
  const { isReady } = useAuthReady();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allTasks, setAllTasks] = useState<TaskSummary[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    async function load() {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          userApi.getUsers({ page: 1, size: 1 }),
          projectApi.getAdminProjects({ size: 100 }),
        ]);

        setTotalUsers(usersRes.data.data.totalElements);
        const projectList = projectsRes.data.data.items;
        setProjects(projectList);
        const feed = await fetchRecentActivities(
          projectList.map((p) => p.projectId),
          6
        );
        setActivities(feed);

        const taskResults = await Promise.all(
          projectList.slice(0, 5).map((p) =>
            taskApi.getTasksByProject(p.projectId, { size: 100 }).catch(() => null)
          )
        );

        const merged: TaskSummary[] = [];
        taskResults.forEach((res) => {
          if (res?.data.data.items) merged.push(...res.data.data.items);
        });
        setAllTasks(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isReady]);

  const taskStats = useMemo(() => {
    const todo = projects.reduce((s, p) => s + p.todoCount, 0);
    const inProgress = projects.reduce((s, p) => s + p.inProgressCount, 0);
    const done = projects.reduce((s, p) => s + p.doneCount, 0);
    const total = todo + inProgress + done || 1;
    const completionRate = Math.round((done / total) * 100);
    return { todo, inProgress, done, completionRate };
  }, [projects]);

  const priorityStats = useMemo(() => {
    let low = 0;
    let medium = 0;
    let high = 0;
    allTasks.forEach((t) => {
      if (t.priority >= 3) high++;
      else if (t.priority === 2) medium++;
      else low++;
    });
    return { low, medium, high };
  }, [allTasks]);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;

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
        title="Dashboard Quản Trị"
        subtitle="Tổng quan hệ thống MIJTAP - Project Management"
        showFilter={false}
      />

      <section className="mb-6">
        <AdminStatsCards
          totalUsers={totalUsers}
          activeProjects={activeProjects}
          completedTasks={taskStats.done}
          completionRate={taskStats.completionRate}
        />
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <TaskStatusPieChart
          todo={taskStats.todo}
          inProgress={taskStats.inProgress}
          done={taskStats.done}
        />
        <PriorityBarChart
          low={priorityStats.low}
          medium={priorityStats.medium}
          high={priorityStats.high}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_minmax(300px,380px)]">
        <ProjectProgressList projects={projects} />
        <ActivityFeed activities={activities} viewAllHref="/activities" />
      </section>
    </section>
  );
}
