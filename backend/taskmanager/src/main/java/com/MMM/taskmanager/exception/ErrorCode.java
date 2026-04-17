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
    OTP_EXPIRED(HttpStatus.UNAUTHORIZED, "ERR_OTP_EXPIRED", "OTP has expired. Please request a new one.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
