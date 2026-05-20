import axiosClient from "@/src/lib/axios";
import type { ApiResponse, TeamDirectory } from "@/src/types/api.types";

const BASE = "/api/v1/team";

export const teamApi = {
  getDirectory: () =>
    axiosClient.get<ApiResponse<TeamDirectory>>(`${BASE}/directory`),
};
