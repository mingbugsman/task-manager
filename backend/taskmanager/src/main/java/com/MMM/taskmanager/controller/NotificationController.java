package com.MMM.taskmanager.controller;


import com.MMM.taskmanager.config.SseEmitterManager;
import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.NotificationService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final NotificationService notificationService;
    private final SseEmitterManager sseEmitterManager;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<NotificationResponse> data = notificationService.getNotifications(isRead, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unread_count", count)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long notificationId
    ) {
        NotificationResponse response = notificationService.maskAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.of(response, "Thông báo được đánh dấu đã đọc"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.ok("Tất cả thông báo được đánh dấu đã đọc"));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotifcation(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Thông báo đã được xóa thành công"));
    }

    @PostMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createSystemNotification(
            @RequestBody @Valid SystemNotificationRequest request
    ) {
        notificationService.createSystemNotification(request);
        return ResponseEntity.ok(ApiResponse.ok("Thông báo hệ thống đã được tạo thành công"));
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("User {} subscribed to SSE", userId);
        return sseEmitterManager.createEmitter(userId);
    }



}
