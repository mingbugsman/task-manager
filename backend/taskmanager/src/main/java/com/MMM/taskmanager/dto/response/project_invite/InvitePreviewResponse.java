package com.MMM.taskmanager.dto.response.project_invite;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvitePreviewResponse {

    boolean valid;
    String message;
    Long projectId;
    String projectName;
    String role;
    String inviterName;
}
