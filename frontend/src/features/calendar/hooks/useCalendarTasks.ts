"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { projectApi } from "@/src/features/projects/api/project.api";
import { taskApi } from "@/src/features/tasks/api/task.api";
import { toDateKey } from "@/src/features/calendar/lib/calendar-utils";
import type { TaskSummary } from "@/src/types/api.types";

export interface CalendarTask extends TaskSummary {
  projectId: number;
  projectName: string;
}

export function useCalendarTasks() {
  const { isReady } = useAuthReady();
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const projectsRes = await projectApi.getProjects({ size: 50 });
        const projects = projectsRes.data.data.items;

        const results = await Promise.all(
          projects.map((p) =>
            taskApi
              .getTasksByProject(p.projectId, { size: 200 })
              .then((res) =>
                res.data.data.items
                  .filter((t) => t.dueAt)
                  .map(
                    (t): CalendarTask => ({
                      ...t,
                      projectId: p.projectId,
                      projectName: p.projectName,
                    })
                  )
              )
              .catch(() => [] as CalendarTask[])
          )
        );

        const myRes = await taskApi.getMyTasks().catch(() => null);
        const myWithDue = (myRes?.data.data ?? [])
          .filter((t) => t.dueAt)
          .map((t): CalendarTask => ({
            ...t,
            projectId: 0,
            projectName: "Tác vụ của tôi",
          }));

        const merged = [...results.flat(), ...myWithDue];
        const byId = new Map<number, CalendarTask>();
        for (const t of merged) {
          if (!byId.has(t.taskId)) byId.set(t.taskId, t);
        }

        if (!cancelled) setTasks([...byId.values()]);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of tasks) {
      if (!task.dueAt) continue;
      const key = toDateKey(new Date(task.dueAt));
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.priority - b.priority);
    }
    return map;
  }, [tasks]);

  return { tasks, tasksByDate, loading, isReady };
}
