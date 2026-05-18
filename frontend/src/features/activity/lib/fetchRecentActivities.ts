import { activityApi } from "@/src/features/activity/api/activity.api";
import { shouldShowInFeed } from "@/src/lib/activityPresentation";
import type { ActivityLog } from "@/src/types/api.types";

function mergeActivities(batches: ActivityLog[][]): ActivityLog[] {
  const seen = new Set<number>();
  const merged: ActivityLog[] = [];

  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.activityLogId)) continue;
      seen.add(item.activityLogId);
      merged.push(item);
    }
  }

  return merged
    .filter(shouldShowInFeed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Lấy hoạt động gần đây từ các dự án (feed nhóm), fallback về hoạt động của bản thân. */
export async function fetchRecentActivities(
  projectIds: number[],
  limit = 8
): Promise<ActivityLog[]> {
  if (projectIds.length === 0) {
    const res = await activityApi.getMyActivities({ size: limit });
    return mergeActivities([res.data.data.items]).slice(0, limit);
  }

  const perProject = Math.max(4, Math.ceil(limit / Math.min(projectIds.length, 4)));
  const results = await Promise.all(
    projectIds.slice(0, 6).map((projectId) =>
      activityApi.getByProject(projectId, { size: perProject }).catch(() => null)
    )
  );

  const batches = results.map((r) => r?.data.data.items ?? []);
  const myRes = await activityApi.getMyActivities({ size: limit }).catch(() => null);
  if (myRes?.data.data.items.length) {
    batches.push(myRes.data.data.items);
  }

  return mergeActivities(batches).slice(0, limit);
}
