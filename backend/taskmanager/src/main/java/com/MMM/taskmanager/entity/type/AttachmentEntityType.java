package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

public enum AttachmentEntityType {
    TASK,
    COMMENT,
    NOTIFICATION,
    PROJECTS;

    public static AttachmentEntityType fromPathVariable(String value) {
        return switch (value.toLowerCase()) {
            case "tasks" -> TASK;
            case "comments" -> COMMENT;
            case "notifcations" -> NOTIFICATION;
            case "projects" -> PROJECTS;
            default -> throw new AppException(ErrorCode.INVALID_ENTITY_TYPE);
        };
    }
}
