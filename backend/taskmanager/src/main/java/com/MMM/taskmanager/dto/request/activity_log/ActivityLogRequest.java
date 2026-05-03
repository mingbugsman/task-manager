package com.MMM.taskmanager.dto.request.activity_log;


import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogRequest {
    @NotNull(message = "Action is required")
    private String action;

    @NotNull(message = "Entity type is required")
    private ActivityLogEntityType entityType;

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    // Nullable — không phải action nào cũng thuộc project
    private Long projectId;

    // Nullable — chỉ có khi USER_LOGIN
    private String ipAddress;


    // VD: {"oldValue": "TODO", "newValue": "IN_PROGRESS"}
    private String metadata;
}
