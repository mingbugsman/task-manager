import axiosClient from "@/src/lib/axios";
import type { ApiResponse, NotificationItem, PageResponse } from "@/src/types/api.types";

const BASE = "/api/v1/notifications";

export const notificationApi = {
  getUnreadCount: () =>
    axiosClient.get<ApiResponse<{ unread_count: number }>>(`${BASE}/unread-count`),

  getNotifications: (params?: { isRead?: boolean; page?: number; size?: number }) =>
    axiosClient.get<ApiResponse<PageResponse<NotificationItem>>>(BASE, {
      params: { page: 0, size: 20, ...params },
    }),

  /** Lấy chi tiết từ danh sách (backend chưa có GET /:id riêng) */
  getById: async (notificationId: number): Promise<NotificationItem | null> => {
    const res = await axiosClient.get<ApiResponse<PageResponse<NotificationItem>>>(BASE, {
      params: { page: 0, size: 100 },
    });
    return res.data.data.items.find((n) => n.notificationId === notificationId) ?? null;
  },

  markAsRead: (notificationId: number) =>
    axiosClient.patch<ApiResponse<NotificationItem>>(`${BASE}/${notificationId}/read`),

  markAllAsRead: () => axiosClient.patch<ApiResponse<void>>(`${BASE}/read-all`),

  delete: (notificationId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${BASE}/${notificationId}`),
};
