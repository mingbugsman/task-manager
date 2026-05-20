import axiosClient from "@/src/lib/axios";
import { normalizeProjectMember } from "@/src/lib/normalize-user";
import type {
  ApiResponse,
  MemberStatistic,
  PageResponse,
  ProjectMember,
} from "@/src/types/api.types";

const membersPath = (projectId: number) => `/api/v1/projects/${projectId}/members`;

export const projectMemberApi = {
  getMembers: async (
    projectId: number,
    params?: { role?: string; page?: number; size?: number }
  ) => {
    const res = await axiosClient.get<ApiResponse<PageResponse<ProjectMember>>>(
      membersPath(projectId),
      { params: { page: 0, size: 50, ...params } }
    );
    const items = (res.data.data?.items ?? []).map((m) => normalizeProjectMember(m));
    return {
      ...res,
      data: {
        ...res.data,
        data: {
          ...res.data.data,
          items,
        },
      },
    };
  },

  getStatistic: (projectId: number) =>
    axiosClient.get<ApiResponse<MemberStatistic>>(`${membersPath(projectId)}/statistic`),

  invite: (projectId: number, data: { userId: number; role: string }) =>
    axiosClient.post<ApiResponse<ProjectMember>>(membersPath(projectId), data),

  updateRole: (projectId: number, userId: number, role: string) =>
    axiosClient.patch<ApiResponse<ProjectMember>>(
      `${membersPath(projectId)}/${userId}/role`,
      { role }
    ),

  kick: (projectId: number, userId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${membersPath(projectId)}/${userId}`),

  leave: (projectId: number) =>
    axiosClient.delete<ApiResponse<void>>(`${membersPath(projectId)}/leave`),
};
