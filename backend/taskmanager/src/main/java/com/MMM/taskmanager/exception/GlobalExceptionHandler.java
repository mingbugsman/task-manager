package com.MMM.taskmanager.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;


/**
 * Global exception handler theo chuẩn RFC 7807 Problem Details.
 * ProblemDetail fields:
 *  - type:     URI định danh loại lỗi
 *  - title:    Error code shorty (ERR_XXX)
 *  - status:   HTTP status code
 *  - detail:   Message describes error
 *  - instance: Request URI cause error
 *  + expand properties: timestamp, errors (validation)
 */

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final String TYPE_BASE = "http://taskmanager.io/errors/";


    // ----------- BUSINESS EXCEPTION --------------------
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ProblemDetail> handleAppException(
            AppException ex, HttpServletRequest request
    ) {

        ErrorCode errorCode = ex.getErrorCode();
        ProblemDetail problem = buildProblemDetail(
                errorCode.getHttpStatus(),
                errorCode.getCode(),
                errorCode.getMessage(),
                request
        );

        return ResponseEntity.status(errorCode.getHttpStatus()).body(problem);
    }

    // ----------- VALIDATION EXCEPTION --------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
        MethodArgumentNotValidException ex, HttpServletRequest request
    ) {

        Map<String, String> errors = new LinkedHashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ProblemDetail problem = buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_FAILED.getCode(),
                ErrorCode.VALIDATION_FAILED.getMessage(),
                request
        );

        problem.setProperty("errors", errors);
        log.warn("[Validation] fields={}", errors);
        return ResponseEntity.badRequest().body(problem);
    }

    // still more...

    // -----------  GENERIC - 500 - EXCEPTION --------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneric(
            Exception ex, HttpServletRequest request) {

        ProblemDetail problem = buildProblemDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                ErrorCode.INTERNAL_SERVER_ERROR.getMessage(),
                request
        );
        log.error("[UnhandledException] type={} message={}", ex.getClass().getName(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }


    private ProblemDetail buildProblemDetail(
            HttpStatus status, String code, String detail, HttpServletRequest request
    ) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(URI.create(TYPE_BASE + code.toLowerCase().replace("_", "-")));
        problem.setTitle(code);
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        return problem;
    }
}
