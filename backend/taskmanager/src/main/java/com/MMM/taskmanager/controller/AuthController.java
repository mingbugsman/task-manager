package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.auth.*;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.auth.TokenResponse;
import com.MMM.taskmanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Quản lý xác thực: Đăng ký, Đăng nhập, OTP và Mật khẩu")
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Đăng ký tài khoản mới", description = "Tạo tài khoản người dùng và gửi mã OTP xác thực qua email.")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.registerUser(request.getUserName(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công, vui lòng kiểm tra OTP trong email."));
    }

    @Operation(summary = "Xác thực OTP", description = "Sử dụng mã OTP được gửi về email để kích hoạt tài khoản.")
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyRegisterOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Xác thực tài khoản thành công."));
    }

    @Operation(summary = "Đăng nhập", description = "Xác thực người dùng bằng email/mật khẩu và trả về bộ Token (Access & Refresh).")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokenResponse = authService.authenticateUser(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.of(tokenResponse, "Đăng nhập thành công."));
    }

    @Operation(summary = "Làm mới Access Token", description = "Sử dụng Refresh Token để lấy Access Token mới khi cái cũ hết hạn.")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse tokenResponse = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(tokenResponse));
    }

    @Operation(summary = "Đăng xuất thiết bị hiện tại", description = "Vô hiệu hóa JWT token đang sử dụng.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Parameter(description = "Bearer token cần đăng xuất")
            @RequestHeader("Authorization") String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        authService.logoutOneDevice(jwt);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thiết bị này thành công."));
    }

    @Operation(summary = "Đăng xuất tất cả thiết bị", description = "Xóa toàn bộ phiên đăng nhập của người dùng.")
    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @Parameter(description = "ID của người dùng cần đăng xuất sạch")
            @RequestParam Long userId) {
        authService.logoutAllDevice(userId);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất khỏi tất cả thiết bị thành công."));
    }

    @Operation(summary = "Yêu cầu quên mật khẩu", description = "Gửi mã OTP đặt lại mật khẩu tới email người dùng.")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Parameter(description = "Email đã đăng ký tài khoản")
            @RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.ok("Yêu cầu đổi mật khẩu đã được gửi đến email của bạn"));
    }

    @Operation(summary = "Đặt lại mật khẩu mới", description = "Sử dụng OTP và email để thiết lập mật khẩu mới cho tài khoản.")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Mật khẩu đã được thay đổi thành công."));
    }
}