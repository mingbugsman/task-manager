import axiosClient from "@/src/lib/axios";
import type { ActivityLog, ApiResponse, PageResponse } from "@/src/types/api.types";

const BASE = "/api/v1";

function normalizeActivityLog(raw: ActivityLog): ActivityLog {
  const entityType =
    typeof raw.entityType === "string"
      ? raw.entityType
      : String((raw.entityType as { name?: string })?.name ?? raw.entityType ?? "");

  return {
    ...raw,
    activityLogId: Number(raw.activityLogId),
    userId: Number(raw.userId),
    entityId: Number(raw.entityId),
    entityType,
    userName: raw.userName ?? "Người dùng",
  };
}

export const activityApi = {
  getMyActivities: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(`${BASE}/users/me/activities`, {
      params: { page: 0, size: 10, ...params },
    }),

  getByProject: async (projectId: number, params?: { page?: number; size?: number }) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(
      `${BASE}/projects/${projectId}/activities`,
      { params: { page: 0, size: 20, ...params } }
    );
    const items = (res.data.data?.items ?? []).map(normalizeActivityLog);
    return {
      ...res,
      data: {
        ...res.data,
        data: {
          ...res.data.data,
          items,
        },
      },
    };
  },

  getByEntity: (
    entityType: string,
    entityId: number,
    params?: { page?: number; size?: number }
  ) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(`${BASE}/activities`, {
      params: { entityType, entityId, page: 0, size: 20, ...params },
    }),

  getAdminActivities: (params?: { page?: number; size?: number; search?: string }) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(`${BASE}/admin/activities`, {
      params: { page: 0, size: 20, ...params },
    }),

  purgeBefore: (before: string) =>
    axiosClient.delete<ApiResponse<{ deleted_count: number }>>(`${BASE}/admin/activities`, {
      data: { before },
    }),
};
