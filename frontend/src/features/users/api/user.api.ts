import axiosClient from "@/src/lib/axios";
import type { ApiResponse, PageResponse, UserDetail, UserListItem } from "@/src/types/api.types";

const BASE = "/api/v1/users";

export const userApi = {
  getMe: () => axiosClient.get<ApiResponse<UserDetail>>(`${BASE}/me`),

  updateMe: (data: { userName?: string; avatar?: File }) => {
    const form = new FormData();
    if (data.userName != null && data.userName.trim() !== "") {
      form.append("userName", data.userName.trim());
    }
    if (data.avatar) {
      form.append("avatar", data.avatar);
    }
    return axiosClient.patch<ApiResponse<void>>(`${BASE}/me`, form, {
      headers: { "Content-Type": false as unknown as string },
    });
  },

  getUsers: (params?: { page?: number; size?: number; sortBy?: string }) =>
    axiosClient.get<ApiResponse<PageResponse<UserListItem>>>(BASE, {
      params: { page: 1, size: 20, sortBy: "userId", ...params },
    }),

  getUser: (userId: number) =>
    axiosClient.get<ApiResponse<UserDetail>>(`${BASE}/${userId}`),
};
