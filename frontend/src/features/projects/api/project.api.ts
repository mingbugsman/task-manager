import axiosClient from "@/src/lib/axios";
import type {
  ApiResponse,
  BoardData,
  PageResponse,
  ProjectDetail,
  ProjectOverallStats,
  ProjectSummary,
} from "@/src/types/api.types";

const BASE = "/api/v1";

export const projectApi = {
  getStats: () =>
    axiosClient.get<ApiResponse<ProjectOverallStats>>(`${BASE}/projects/stats`),

  getProjects: (params?: { search?: string; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<ProjectSummary>>>(`${BASE}/projects`, {
      params: { page: 0, size: 20, ...params },
    }),

  getAdminProjects: (params?: {
    search?: string;
    includeDeleted?: boolean;
    page?: number;
    size?: number;
  }) =>
    axiosClient.get<ApiResponse<PageResponse<ProjectSummary>>>(`${BASE}/admin/projects`, {
      params: { page: 0, size: 50, includeDeleted: false, ...params },
    }),

  getProject: (projectId: number) =>
    axiosClient.get<ApiResponse<ProjectDetail>>(`${BASE}/projects/${projectId}`),

  getBoard: (
    projectId: number,
    params?: { assigneeId?: number; labelId?: number }
  ) =>
    axiosClient.get<ApiResponse<BoardData>>(`${BASE}/projects/${projectId}/board`, {
      params,
    }),

  updateProject: (
    projectId: number,
    data: { projectName: string; projectDescription?: string }
  ) =>
    axiosClient.patch<ApiResponse<ProjectDetail>>(`${BASE}/projects/${projectId}`, data),

  updateStatus: (projectId: number, status: string) =>
    axiosClient.patch<ApiResponse<ProjectDetail>>(`${BASE}/projects/${projectId}/status`, {
      status,
    }),
};
