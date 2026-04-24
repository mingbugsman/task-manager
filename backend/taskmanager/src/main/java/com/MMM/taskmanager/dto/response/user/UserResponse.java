package com.MMM.taskmanager.dto.response.user;


public record UserResponse(
        String userId,
        String username,
        String email,
        String status,
        boolean enabled
) {}