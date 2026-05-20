"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "@/src/hooks/useAuthReady";
import { AppHeader } from "@/src/components/layout/AppHeader";
import { ActivityFeed } from "@/src/components/dashboard/ActivityFeed";
import { projectApi } from "@/src/features/projects/api/project.api";
import { fetchRecentActivities } from "@/src/features/activity/lib/fetchRecentActivities";
import type { ActivityLog } from "@/src/types/api.types";

export function ActivitiesPageView() {
  const { isReady } = useAuthReady();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) =>
        a.userName.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        (a.metadata?.toLowerCase().includes(q) ?? false)
    );
  }, [activities, search]);

  useEffect(() => {
    if (!isReady) return;

    setLoading(true);
    projectApi
      .getProjects({ size: 50 })
      .then((res) => {
        const ids = res.data.data.items.map((p) => p.projectId);
        return fetchRecentActivities(ids, 30);
      })
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [isReady]);

  if (!isReady || loading) {
    return (
      <section className="flex h-64 items-center justify-center">
        <section className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <AppHeader
        title="Hoạt Động"
        subtitle={`${filteredActivities.length} hoạt động`}
        showSearch
        searchPlaceholder="Tìm theo người dùng, hành động..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      <section className="mt-6 min-h-[480px]">
        <ActivityFeed activities={filteredActivities} showFooter={false} />
      </section>
      <p className="mt-4 text-center">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          ← Về Dashboard
        </Link>
      </p>
    </section>
  );
}
