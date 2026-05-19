import axiosClient from "@/src/lib/axios";
import type { ApiResponse, PersonalReport, ReportPeriodKey } from "@/src/types/api.types";

const BASE = "/api/v1/reports";

export const reportApi = {
  getPersonalReport: (period: ReportPeriodKey = "WEEK") =>
    axiosClient.get<ApiResponse<PersonalReport>>(`${BASE}/me`, { params: { period } }),
};
