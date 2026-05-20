import axiosClient from "@/src/lib/axios";
import type { ApiResponse } from "@/src/types/api.types";

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const BASE = "/api/v1/contact";

export const contactApi = {
  sendMessage: (payload: ContactMessagePayload) =>
    axiosClient.post<ApiResponse<{ sent: boolean }>>(`${BASE}/messages`, payload),
};
