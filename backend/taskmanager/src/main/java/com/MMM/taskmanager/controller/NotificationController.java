package com.MMM.taskmanager.controller;


import com.MMM.taskmanager.config.SseEmitterManager;
import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.NotificationService;
import com.MMM.taskmanager.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Notification API", description = "Các API quản lý thông báo và kết nối Realtime (SSE)")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {
    private final NotificationService notificationService;
    private final SseEmitterManager sseEmitterManager;

    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy danh sách thông báo của user đang đăng nhập. Có hỗ trợ phân trang và lọc theo trạng thái.")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @Parameter(description = "Lọc theo trạng thái đọc (true = đã đọc, false = chưa đọc, để trống = lấy tất cả)")
            @RequestParam(required = false) Boolean isRead,

            @Parameter(description = "Số thứ tự trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Số lượng phần tử trên mỗi trang")
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<NotificationResponse> data = notificationService.getNotifications(isRead, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(summary = "Lấy số lượng thông báo chưa đọc", description = "Trả về tổng số thông báo mà user hiện tại chưa đọc để hiển thị lên badge icon.")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unread_count", count)));
    }

    @Operation(summary = "Đánh dấu 1 thông báo là đã đọc", description = "Chuyển trạng thái của một thông báo cụ thể sang đã đọc.")
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @Parameter(description = "ID của thông báo cần đánh dấu")
            @PathVariable Long notificationId
    ) {
        NotificationResponse response = notificationService.maskAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.of(response, "Thông báo được đánh dấu đã đọc"));
    }

    @Operation(summary = "Đánh dấu tất cả thông báo là đã đọc", description = "Chuyển trạng thái toàn bộ thông báo của user hiện tại sang đã đọc.")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.ok("Tất cả thông báo được đánh dấu đã đọc"));
    }

    @Operation(summary = "Xóa một thông báo", description = "Xóa vĩnh viễn một thông báo khỏi hệ thống.")
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotifcation(
            @Parameter(description = "ID của thông báo cần xóa")
            @PathVariable Long notificationId
    ) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Thông báo đã được xóa thành công"));
    }

    @Operation(summary = "Tạo thông báo hệ thống (Chỉ ADMIN)", description = "Gửi thông báo hệ thống đến tất cả người dùng hoặc một nhóm người dùng cụ thể. Yêu cầu quyền ADMIN.")
    @PostMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createSystemNotification(
            @Valid @RequestBody SystemNotificationRequest request
    ) {
        notificationService.createSystemNotification(request);
        return ResponseEntity.ok(ApiResponse.ok("Thông báo hệ thống đã được tạo thành công"));
    }

    @Operation(
            summary = "Đăng ký nhận thông báo Realtime (SSE)",
            description = "Endpoint để Client kết nối Server-Sent Events. Lưu ý: Client (Trình duyệt) cần truyền Bearer Token để xác thực."
    )
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("User {} subscribed to SSE", userId);
        return sseEmitterManager.createEmitter(userId);
    }
}