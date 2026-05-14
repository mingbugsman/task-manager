export interface ApiResponse<T = void> {
    data?: T;
    message?: string;
    status?: number;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}


export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}