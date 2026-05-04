package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

public enum ActivityLogEntityType {
    TASK,
    PROJECT,
    COMMENT,
    USER,
    ATTACHMENT;

    public static ActivityLogEntityType fromString(String value) {
        try {
            return ActivityLogEntityType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ENTITY_TYPE);
        }
    }
}
