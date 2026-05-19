import axiosClient from "@/src/lib/axios";
import type { ApiResponse, ProjectMember } from "@/src/types/api.types";

export interface InvitePreview {
  valid: boolean;
  message?: string;
  projectId?: number;
  projectName?: string;
  role?: string;
  inviterName?: string;
}

export interface InviteLinkCreated {
  token: string;
  role: string;
  projectId: number;
  projectName: string;
  expiresAt?: string | null;
  createdAt?: string;
  inviteUrl: string;
}

export const projectInviteApi = {
  createLink: (projectId: number, data: { role: string; expiresInDays?: number }) =>
    axiosClient.post<ApiResponse<InviteLinkCreated>>(
      `/api/v1/projects/${projectId}/invite-links`,
      data
    ),

  getPreview: async (token: string): Promise<InvitePreview> => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const res = await fetch(`${base}/api/v1/invites/${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return { valid: false, message: "Không thể tải thông tin lời mời." };
    }
    const body = (await res.json()) as ApiResponse<InvitePreview>;
    return body.data ?? { valid: false, message: "Liên kết không hợp lệ." };
  },

  accept: (token: string) =>
    axiosClient.post<ApiResponse<ProjectMember>>(
      `/api/v1/invites/${encodeURIComponent(token)}/accept`
    ),
};
