import axiosClient from "@/src/lib/axios";
import type { ApiResponse, Comment, PageResponse } from "@/src/types/api.types";

const BASE = "/api/v1";

export const commentApi = {
  getByTask: (taskId: number, params?: { page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<Comment>>>(`${BASE}/tasks/${taskId}/comments`, {
      params: { page: 0, size: 50, ...params },
    }),

  create: (taskId: number, content: string, parentId?: number) =>
    axiosClient.post<ApiResponse<Comment>>(`${BASE}/tasks/${taskId}/comments`, {
      content,
      parentId: parentId ?? null,
    }),

  update: (commentId: number, content: string) =>
    axiosClient.put<ApiResponse<Comment>>(`${BASE}/comments/${commentId}`, { content }),

  delete: (commentId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/comments/${commentId}`),
};
