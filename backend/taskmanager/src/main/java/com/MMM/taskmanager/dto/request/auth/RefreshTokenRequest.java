package com.MMM.taskmanager.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh Token không được để trống")
    @Schema(description = "Refresh Token của người dùng")
    private String refreshToken;
}