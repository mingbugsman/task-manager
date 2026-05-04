package com.MMM.taskmanager.dto.response.activity_log;

import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityLogResponse {
    private Long activityLogId;
    private Long userId;
    private String userName;
    private String avatarUrl;
    private String action;
    private ActivityLogEntityType entityType;
    private Long entityId;
    private String metadata;
    private Long projectId;
    private String ipAddress;
    private LocalDateTime createdAt;
}
