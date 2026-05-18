import axiosClient from "@/src/lib/axios";
import type {
  ApiResponse,
  MemberStatistic,
  PageResponse,
  ProjectMember,
} from "@/src/types/api.types";

const membersPath = (projectId: number) => `/api/v1/projects/${projectId}/members`;

export const projectMemberApi = {
  getMembers: (
    projectId: number,
    params?: { role?: string; page?: number; size?: number }
  ) =>
    axiosClient.get<ApiResponse<PageResponse<ProjectMember>>>(membersPath(projectId), {
      params: { page: 0, size: 50, ...params },
    }),

  getStatistic: (projectId: number) =>
    axiosClient.get<ApiResponse<MemberStatistic>>(`${membersPath(projectId)}/statistic`),
};
