import axiosClient from "@/src/lib/axios";
import type { ActivityLog, ApiResponse, PageResponse } from "@/src/types/api.types";

const BASE = "/api/v1";

export const activityApi = {
  getMyActivities: (params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(`${BASE}/users/me/activities`, {
      params: { page: 0, size: 10, ...params },
    }),

  getByProject: (projectId: number, params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(
      `${BASE}/projects/${projectId}/activities`,
      { params: { page: 0, size: 10, ...params } }
    ),

  getByEntity: (
    entityType: string,
    entityId: number,
    params?: { page?: number; size?: number }
  ) =>
    axiosClient.get<ApiResponse<PageResponse<ActivityLog>>>(`${BASE}/activities`, {
      params: { entityType, entityId, page: 0, size: 20, ...params },
    }),
};
