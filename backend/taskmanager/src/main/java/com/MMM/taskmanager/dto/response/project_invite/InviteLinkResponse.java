package com.MMM.taskmanager.dto.response.project_invite;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InviteLinkResponse {

    String token;
    String role;
    Long projectId;
    String projectName;
    LocalDateTime expiresAt;
    LocalDateTime createdAt;
    String inviteUrl;
}
