package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.AdminNotificationResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/notifications")
@Tag(name = "Admin Notification", description = "Quản lý thông báo hệ thống (Admin)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Danh sách thông báo (Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminNotificationResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.ok(notificationService.getAllNotificationsForAdmin(search, type, page, size)));
    }

    @Operation(summary = "Gửi thông báo hệ thống")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> send(@Valid @RequestBody SystemNotificationRequest request) {
        notificationService.createSystemNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thông báo hệ thống đã được gửi"));
    }

    @Operation(summary = "Xóa thông báo (Admin)")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long notificationId) {
        notificationService.deleteNotificationAsAdmin(notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa thông báo"));
    }
}
