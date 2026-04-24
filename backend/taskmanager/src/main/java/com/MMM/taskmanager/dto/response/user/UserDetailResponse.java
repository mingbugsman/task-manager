package com.MMM.taskmanager.dto.response.user;


public record UserDetailResponse(
        String userId,
        String username,
        String email,
        String avatarUrl,
        String status,
        boolean enabled
) { }
