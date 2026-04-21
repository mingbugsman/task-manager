package com.MMM.taskmanager.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh Token không được để trống")
    private String refreshToken;
}