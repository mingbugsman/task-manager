package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.auth.*;
import com.MMM.taskmanager.dto.response.ApiResponse;
import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request.getUserName(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công, vui lòng kểm tra OTP trong email."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyRegisterOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Xác thực tài khoản thành công."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.authenticateUser(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.of(tokenResponse, "Đăng nhập thành công."));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokenResponse = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(tokenResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        authService.logoutOneDevice(jwt);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thiết bị này thành công."));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@RequestParam Long userId) {
        authService.logoutAllDevice(userId);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất khỏi tất cả thiết bị thành công."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.ok("Yêu cầu đổi mật khẩu đã đợc gửi đến email của bạn"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Mật khẩu đã được thay ổi thành công."));
    }

}
