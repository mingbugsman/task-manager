package com.MMM.taskmanager.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email của người dùng", example = "user@example")
    private String email;

    @NotBlank(message = "Mã OTP không được để trống")
    @Schema(description = "OTP đã hệ thống gửi vào email của người dùng", example = "123456")
    private String otp;
}