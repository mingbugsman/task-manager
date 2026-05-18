import axiosClient from "@/src/lib/axios";
import type {
  ApiResponse,
  PageResponse,
  TaskDetail,
  TaskStatistic,
  TaskSummary,
} from "@/src/types/api.types";

const BASE = "/api/v1";

export const taskApi = {
  getMyTasks: () =>
    axiosClient.get<ApiResponse<TaskSummary[]>>(`${BASE}/tasks/my-tasks`),

  getTaskDetail: (taskId: number) =>
    axiosClient.get<ApiResponse<TaskDetail>>(`${BASE}/tasks/${taskId}`),

  getTasksByProject: (
    projectId: number,
    params?: { status?: string; search?: string; page?: number; size?: number }
  ) =>
    axiosClient.get<ApiResponse<PageResponse<TaskSummary>>>(
      `${BASE}/projects/${projectId}/tasks`,
      { params: { page: 0, size: 50, ...params } }
    ),

  getStatistic: (projectId: number) =>
    axiosClient.get<ApiResponse<TaskStatistic>>(`${BASE}/tasks/${projectId}/statistic`),

  updateStatus: (taskId: number, status: string) =>
    axiosClient.patch<ApiResponse<TaskDetail>>(`${BASE}/tasks/${taskId}/status`, { status }),
};
