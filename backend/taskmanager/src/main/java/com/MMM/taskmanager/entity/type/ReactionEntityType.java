package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;

public enum ReactionEntityType {
    COMMENT,
    NOTIFCATION;

    public static ReactionEntityType fromPathVariable(String value) {
        return switch (value.toLowerCase()) {
            case "comments" -> COMMENT;
            case "notifcations" -> NOTIFCATION;
            default -> throw new AppException(ErrorCode.INVALID_ENTITY_TYPE);
        };
    }
}
