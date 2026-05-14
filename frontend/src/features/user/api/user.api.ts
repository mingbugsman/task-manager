import axiosClient from "@/src/lib/axios";
import type { ApiEnvelope, UserDetailResponse } from "@/src/types/user.types";

const USERS_URL = "/api/v1/users";

export const userApi = {
  getMe: () =>
    axiosClient.get<ApiEnvelope<UserDetailResponse>>(`${USERS_URL}/me`),
};
