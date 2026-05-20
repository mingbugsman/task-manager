import axiosClient from "@/src/lib/axios";
import type { ApiResponse, LabelSummary } from "@/src/types/api.types";

const BASE = "/api/v1";

export interface ProjectLabel extends LabelSummary {
  projectId?: number;
  labelDescription?: string;
}

export const labelApi = {
  getByProject: (projectId: number) =>
    axiosClient.get<ApiResponse<ProjectLabel[]>>(`${BASE}/projects/${projectId}/labels`),

  create: (
    projectId: number,
    data: { labelName: string; labelDescription?: string; colorCode?: string }
  ) =>
    axiosClient.post<ApiResponse<ProjectLabel>>(`${BASE}/projects/${projectId}/labels`, {
      colorCode: "#808080",
      ...data,
    }),

  delete: (labelId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/labels/${labelId}`),

  attachToTask: (taskId: number, labelId: number) =>
    axiosClient.post<ApiResponse<unknown>>(`${BASE}/tasks/${taskId}/labels`, { labelId }),

  detachFromTask: (taskId: number, labelId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/tasks/${taskId}/labels/${labelId}`),
};
