import axiosClient from "@/src/lib/axios";
import type { 
  ApiResponse, 
  TokenResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyOTPRequest, 
  RefreshTokenRequest, 
  ResetPasswordRequest 
} from "@/src/types/auth.types";

const AUTH_URL = "/api/v1/auth";

export const authApi = {
  // Đăng nhập
  login: (data: LoginRequest) => 
    axiosClient.post<ApiResponse<TokenResponse>>(`${AUTH_URL}/login`, data),

  // Đăng ký
  register: (data: RegisterRequest) => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/register`, data),

  // Xác thực OTP
  verifyOtp: (data: VerifyOTPRequest) => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/verify-otp`, data),

  // Refresh Token
  refreshToken: (data: RefreshTokenRequest) => 
    axiosClient.post<ApiResponse<TokenResponse>>(`${AUTH_URL}/refresh-token`, data),

  // Đăng xuất (Token Bearer sẽ được tự động gắn bởi Axios Interceptors)
  logout: () => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/logout`),

  // Đăng xuất tất cả thiết bị (sử dụng @RequestParam)
  logoutAll: (userId: number) => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/logout-all`, null, { 
      params: { userId } 
    }),

  // Quên mật khẩu
  forgotPassword: (email: string) => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/forgot-password`, null, { 
      params: { email } 
    }),

  // Đặt lại mật khẩu
  resetPassword: (data: ResetPasswordRequest) => 
    axiosClient.post<ApiResponse<void>>(`${AUTH_URL}/reset-password`, data),
};