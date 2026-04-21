package com.MMM.taskmanager.dto.response.auth;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {
}
