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

  getUsers: (params?: { page?: number; size?: number; sortBy?: string; search?: string }) =>
    axiosClient.get<ApiResponse<PageResponse<UserListItem>>>(BASE, {
      params: { page: 1, size: 20, sortBy: "userId", ...params },
    }),

  getUser: (userId: number) =>
    axiosClient.get<ApiResponse<UserDetail>>(`${BASE}/${userId}`),

  createForAdmin: (data: {
    userName: string;
    email: string;
    password?: string;
    roleGlobal?: string;
    status?: string;
    enabled?: boolean;
    avatar?: File;
  }) => {
    const form = new FormData();
    form.append("userName", data.userName);
    form.append("email", data.email);
    if (data.password) form.append("password", data.password);
    form.append("roleGlobal", data.roleGlobal ?? "USER");
    form.append("status", data.status ?? "ACTIVE");
    form.append("enabled", String(data.enabled ?? true));
    if (data.avatar) form.append("avatar", data.avatar);
    return axiosClient.post<ApiResponse<void>>(BASE, form, {
      headers: { "Content-Type": false as unknown as string },
    });
  },

  updateForAdmin: (
    userId: number,
    data: {
      userName?: string;
      email?: string;
      password?: string;
      roleGlobal?: string;
      status?: string;
      enabled?: boolean;
      avatar?: File;
    }
  ) => {
    const form = new FormData();
    if (data.userName) form.append("userName", data.userName);
    if (data.email) form.append("email", data.email);
    if (data.password) form.append("password", data.password);
    if (data.roleGlobal) form.append("roleGlobal", data.roleGlobal);
    if (data.status) form.append("status", data.status);
    if (data.enabled != null) form.append("enabled", String(data.enabled));
    if (data.avatar) form.append("avatar", data.avatar);
    return axiosClient.put<ApiResponse<void>>(`${BASE}/${userId}`, form, {
      headers: { "Content-Type": false as unknown as string },
    });
  },

  setStatus: (userId: number, status: string) =>
    axiosClient.patch<ApiResponse<void>>(`${BASE}/status`, null, {
      params: { userId, status },
    }),

  deleteForever: (userId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/${userId}`),
};
