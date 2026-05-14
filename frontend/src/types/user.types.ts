/** Khớp `UserDetailResponse` từ backend (Jackson camelCase). */
export interface UserDetailResponse {
  userId: string;
  userName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  enabled: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}
