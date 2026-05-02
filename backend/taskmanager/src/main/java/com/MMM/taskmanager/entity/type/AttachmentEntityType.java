package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public enum AttachmentEntityType {
    TASK,
    COMMENT,
    NOTIFICATION,
    PROJECTS;

    public static AttachmentEntityType fromPathVariable(String value) {
        log.info("Attachment entity type: {}", value);
        return switch (value.toLowerCase()) {
            case "tasks" -> TASK;
            case "comments" -> COMMENT;
            case "notifications" -> NOTIFICATION;
            case "projects" -> PROJECTS;
            default -> throw new AppException(ErrorCode.INVALID_ENTITY_TYPE);
        };
    }
}
