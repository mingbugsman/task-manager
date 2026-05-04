package com.MMM.taskmanager.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ----------- GENERIC ERROR --------------------
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_500", "An unexpected error occurred."),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "ERR_VALIDATION", "Validation failed"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "ERR_BAD_REQUEST", "Invalid request"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "ERR_METHOD_NOT_ALLOWED", "HTTP method not allowed"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_NOT_FOUND", "Resource not found"),
    MISSING_PARAMETER(HttpStatus.BAD_REQUEST, "ERR_MISSING_PARAMETER", "Không tìm thấy tham số cần thiết"),
    INVALID_ENTITY_TYPE(HttpStatus.BAD_REQUEST, "ERR_INVALID_ENTITY_TYPE", "Lỗi không hợp hệ loại đối tượng"),

    // ----------- AUTH ERROR --------------------
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "ERR_UNAUTHORIZED", "Authentication is required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "ERR_FORBIDDEN", "You do not have permission to perform this action."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "ERR_INVALID_CREDENTIALS", "Email or password is incorrect"),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "ERR_ACCOUNT_LOCKED", "Your account has been locked."),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "ERR_ACCOUNT_INACTIVE", "Your account is not active."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "ERR_TOKEN_EXPIRED", "Token has expired."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "ERR_TOKEN_INVALID", "Token is invalid."),
    TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "ERR_TOKEN_MISSING", "Authorization token is missing."),
    REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "ERR_REFRESH_TOKEN_INVALID", "Refresh token is invalid or expired."),
    OTP_INVALID(HttpStatus.UNAUTHORIZED, "ERR_OTP_INVALID", "OTP is incorrect."),
    OTP_EXPIRED(HttpStatus.UNAUTHORIZED, "ERR_OTP_EXPIRED", "OTP has expired. Please request a new one."),
    OTP_TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "ERR_OTP_TOO_MANY_REQUESTS", "Vui lòng chờ 60 giây trước khi tiếp gửi OTP."),
    OTP_DAILY_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "ERR_OTP_DAILY_LIMIT_EXCEEDED", "Bạn đã gửi OTP vượt quá giới hạn trong ngày."),

    // ----------- USER ERROR --------------------
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_USER_NOT_FOUND", "User not found."),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_USER_ALREADY_EXISTS", "User with this email already exists."),
    USER_EMAIL_ALREADY_VERIFIED(HttpStatus.BAD_REQUEST, "ERR_USER_EMAIL_ALREADY_VERIFIED", "Email is already verified."),
    USER_CANNOT_DELETE_SELF(HttpStatus.BAD_REQUEST, "ERR_USER_CANNOT_DELETE_SELF", "You cannot delete your own account."),
    USER_DISABLED(HttpStatus.UNAUTHORIZED, "ERR_USER_DISABLED", "Tài khoản của bạn chưa được kích hoạt do chưa xác thực email."),
    BAD_CREDENTIALS( HttpStatus.UNAUTHORIZED, "ERR_BAD_CREDENTIALS", "Email or password is not correct"),

    // ----------- PROJECT ERROR --------------------
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_PROJECT_NOT_FOUND", "Project not found."),
    PROJECT_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_PROJECT_ALREADY_EXISTS", "Project with this name already exists."),
    PROJECT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_PROJECT_ACCESS_DENIED", "You do not have access to this project."),
    PROJECT_OWNER_CANNOT_LEAVE(HttpStatus.BAD_REQUEST, "ERR_PROJECT_OWNER_CANNOT_LEAVE", "Project owner cannot leave the project."),

    // ----------- PROJECT MEMBER ERROR --------------------
    PROJECT_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_PROJECT_MEMBER_NOT_FOUND", "Project member not found."),
    PROJECT_MEMBER_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_PROJECT_MEMBER_ALREADY_EXISTS", "User is already a member of this project."),
    PROJECT_MEMBER_INVALID_ROLE(HttpStatus.BAD_REQUEST, "ERR_PROJECT_MEMBER_INVALID_ROLE", "Invalid project member role."),
    PROJECT_MEMBER_CANNOT_REMOVE_OWNER(HttpStatus.BAD_REQUEST, "ERR_PROJECT_MEMBER_CANNOT_REMOVE_OWNER", "Cannot remove the project owner."),

    // ----------- TASK ERROR --------------------
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_TASK_NOT_FOUND", "Task not found."),
    TASK_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_TASK_ALREADY_EXISTS", "Task already exists."),
    TASK_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_TASK_ACCESS_DENIED", "You do not have access to this task."),
    TASK_INVALID_STATUS(HttpStatus.BAD_REQUEST, "ERR_TASK_INVALID_STATUS", "Invalid task status."),
    TASK_INVALID_PRIORITY(HttpStatus.BAD_REQUEST, "ERR_TASK_INVALID_PRIORITY", "Invalid task priority."),
    TASK_DUE_DATE_INVALID(HttpStatus.BAD_REQUEST, "ERR_TASK_DUE_DATE_INVALID", "Task due date must be in the future."),
    TASK_ASSIGNEE_NOT_MEMBER(HttpStatus.BAD_REQUEST, "ERR_TASK_ASSIGNEE_NOT_MEMBER", "Assignee is not a member of this project."),

    // ----------- LABEL ERROR --------------------
    LABEL_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_LABEL_NOT_FOUND", "Label not found."),
    LABEL_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_LABEL_ALREADY_EXISTS", "Label with this name already exists in the project."),
    LABEL_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_LABEL_ACCESS_DENIED", "You do not have access to this label."),

    // ----------- TASK LABEL ERROR --------------------
    TASK_LABEL_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_TASK_LABEL_NOT_FOUND", "Task label not found."),
    TASK_LABEL_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_TASK_LABEL_ALREADY_EXISTS", "Label is already assigned to this task."),
    // ----------- COMMENT ERROR --------------------
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_COMMENT_NOT_FOUND", "Comment not found."),
    COMMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_COMMENT_ACCESS_DENIED", "You do not have permission to modify this comment."),
    COMMENT_EMPTY(HttpStatus.BAD_REQUEST, "ERR_COMMENT_EMPTY", "Comment content cannot be empty."),

    // ----------- REACTION ERROR --------------------
    REACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_REACTION_NOT_FOUND", "Reaction not found."),
    REACTION_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_REACTION_ALREADY_EXISTS", "You have already reacted with this emoji."),
    REACTION_INVALID_TARGET(HttpStatus.BAD_REQUEST, "ERR_REACTION_INVALID_TARGET", "Invalid reaction target."),

    // ----------- ATTACHMENT ERROR --------------------
    FILE_IS_EMPTY(HttpStatus.BAD_REQUEST, "ERR_FILE_IS_EMPTY", "Không tìm thấy file tải lên"),
    ATTACHMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_ATTACHMENT_NOT_FOUND", "Attachment not found."),
    ATTACHMENT_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_ATTACHMENT_UPLOAD_FAILED", "File upload failed."),
    ATTACHMENT_DELETE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_ATTACHMENT_DELETE_FAILED", "File deletion failed."),
    ATTACHMENT_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "ERR_ATTACHMENT_SIZE_EXCEEDED", "File tải lên vượt qua giới hạn dung lượng yêu cầu."),
    ATTACHMENT_TYPE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "ERR_ATTACHMENT_TYPE_NOT_ALLOWED", "Vui lòng tải lên đúng dạng tệp tin."),
    ATTACHMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_ATTACHMENT_ACCESS_DENIED", "You do not have permission to access this attachment."),

    // ----------- NOTIFICATION ERROR --------------------
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_NOTIFICATION_NOT_FOUND", "Notification not found."),
    NOTIFICATION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_NOTIFICATION_ACCESS_DENIED", "You do not have access to this notification."),

    // ----------- ACTIVITY LOG ERROR --------------------
    ACTIVITY_LOG_NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_ACTIVITY_LOG_NOT_FOUND", "Activity log not found."),
    ACTIVITY_LOG_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ERR_ACTIVITY_LOG_ACCESS_DENIED", "You do not have access to this activity log.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}